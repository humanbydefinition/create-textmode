import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import minimist from 'minimist';
import kleur from 'kleur';
import boxen from 'boxen';
import { intro, outro, spinner, log } from '@clack/prompts';
import { HEADER, templates } from './constants.js';
import { detectPackageManager, pmCommands } from './packageManager.js';
import { isEmptyDir, pathExists, scaffoldTemplate } from './fs-utils.js';
import { runCommand } from './runCommand.js';
import { printUsage } from './usage.js';
import {
  promptInstall,
  promptProjectName,
  promptRun,
  promptTemplate,
  promptOverwrite,
  suggestProjectName,
  promptTextmodeVersion
} from './prompts.js';
import { getTextmodeVersions } from './versions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printHeader() {
  console.log(kleur.cyan(HEADER));
}

function ensureKnownTemplate(name) {
  if (!name) return;
  const found = templates.find((t) => t.name === name);
  if (found) return;

  console.error(kleur.red(`Unknown template: ${name}`));
  printUsage();
  process.exit(1);
}

export async function run() {
  printHeader();
  intro(kleur.cyan('create-textmode'));

  const argv = minimist(process.argv.slice(2), {
    alias: {
      h: 'help',
      t: 'template',
      n: 'name',
      f: 'force',
      v: 'version',
      tv: 'textmode-version'
    },
    string: ['template', 'name', 'pm', 'textmode-version'],
    boolean: ['help', 'force', 'version', 'install', 'run', 'no-install', 'no-run'],
    default: { install: null, run: null }
  });

  if (argv.help) {
    printUsage();
    return;
  }

  if (argv.version) {
    const pkgJson = JSON.parse(await readFile(path.join(__dirname, '..', 'package.json'), 'utf8'));
    console.log(pkgJson.version);
    return;
  }

  let projectName = argv._[0] || argv.name;
  if (!projectName) {
    const suggested = suggestProjectName();
    projectName = await promptProjectName(suggested);
    if (!projectName) {
      outro('No project name provided.');
      return;
    }
  }
  const targetDir = path.resolve(process.cwd(), projectName);

  ensureKnownTemplate(argv.template);
  let templateName = argv.template;

  if (!templateName) {
    templateName = await promptTemplate();
    if (!templateName) {
      outro('No template selected.');
      return;
    }
  }

  const template = templates.find((t) => t.name === templateName);
  const templateDir = path.join(__dirname, '..', 'templates', template.dir);

  // Resolve textmode.js version
  const requestedTextmodeVersion = argv['textmode-version'];
  let textmodeVersion = 'latest';
  let stableVersions = [];

  const versionSpinner = spinner();
  versionSpinner.start('Fetching textmode.js versions...');
  try {
    stableVersions = await getTextmodeVersions();
    if (stableVersions.length === 0) throw new Error('No versions found');
    versionSpinner.stop('Fetched textmode.js versions.');
  } catch (err) {
    versionSpinner.stop('Could not fetch textmode.js versions; defaulting to latest.');
    log.warn('Using latest version as fallback.');
    stableVersions = [];
    textmodeVersion = 'latest';
  }

  const latestVersion = stableVersions[0];
  const availableOptions = [
    {
      value: 'latest',
      label: latestVersion ? `latest (${latestVersion})` : 'latest (recommended)'
    },
    ...stableVersions.slice(1).map((v) => ({ value: v, label: v }))
  ];

  if (requestedTextmodeVersion) {
    const found = availableOptions.find((opt) => opt.value === requestedTextmodeVersion);
    if (found) {
      textmodeVersion = requestedTextmodeVersion;
    } else if (stableVersions.includes(requestedTextmodeVersion)) {
      textmodeVersion = requestedTextmodeVersion;
    } else {
      log.warn(`Requested textmode.js@${requestedTextmodeVersion} not found; using latest instead.`);
      textmodeVersion = 'latest';
    }
  } else if (stableVersions.length > 0) {
    const choice = await promptTextmodeVersion(availableOptions);
    if (choice === null) {
      outro('Cancelled.');
      return;
    }
    textmodeVersion = choice;
  }

  const pm = argv.pm || detectPackageManager();
  const pmCmds = pmCommands(pm);

  const targetExists = await pathExists(targetDir);
  if (targetExists && !(await isEmptyDir(targetDir)) && !argv.force) {
    const ok = await promptOverwrite(targetDir);
    if (ok === null) {
      outro('Cancelled.');
      return;
    }
    if (!ok) {
      outro('Aborted.');
      return;
    }
  }

  const scaffoldSpin = spinner();
  scaffoldSpin.start('Scaffolding project...');
  await scaffoldTemplate({ templateDir, targetDir, projectName, textmodeVersion });
  scaffoldSpin.stop('Scaffold complete.');

  let installDone = false;
  let runDone = false;

  const userInstall = argv.install;
  const userNoInstall = argv['no-install'];
  const hasInstallFlag = userInstall !== null || userNoInstall === true;
  let doInstall = userInstall === true;

  if (!hasInstallFlag) {
    const decision = await promptInstall(pm);
    if (decision === null) {
      outro('Cancelled.');
      return;
    }
    doInstall = decision;
  }

  if (doInstall) {
    const installSpin = spinner();
    installSpin.start(`Installing dependencies with ${pm}...`);
    try {
      await runCommand(pm, pmCmds.install, targetDir);
      installDone = true;
      installSpin.stop('Dependencies installed.');
    } catch (err) {
      installSpin.stop('Dependency installation failed.');
      log.error(err.message || String(err));
    }
  }

  if (installDone) {
    const userRun = argv.run;
    const userNoRun = argv['no-run'];
    const hasRunFlag = userRun !== null || userNoRun === true;
    let doRun = userRun === true;

    if (!hasRunFlag) {
      const decision = await promptRun(pm);
      if (decision === null) {
        outro('Cancelled.');
        return;
      }
      doRun = decision;
    }

    if (doRun) {
      const runSpin = spinner();
      runSpin.start(`Starting dev server with ${pm}...`);
      try {
        runSpin.stop('Dev server starting...');
        await runCommand(pm, pmCmds.runDev, targetDir);
        runDone = true;
      } catch (err) {
        log.error(err.message || String(err));
      }
    }
  }

  const installCmd = `${pm} ${pmCmds.install.join(' ')}`;
  const runCmd = `${pm} ${pmCmds.runDev.join(' ')}`;

  const steps = [
    `cd ${projectName}`,
    installDone ? `✓ already ran ${installCmd}` : installCmd,
    runDone ? `✓ dev server is running (${runCmd})` : runCmd
  ]
    .filter(Boolean)
    .join('\n');

  const boxed = boxen(`Next steps:\n${steps}`, {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: 'cyan'
  });

  console.log(boxed);
  outro(kleur.green('Enjoy textmode.js!'));
}

export default run;
