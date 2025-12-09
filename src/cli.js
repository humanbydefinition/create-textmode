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
import { runCommand, runCommandLogged } from './runCommand.js';
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

const SPLIT_FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&/\\<>[]=+*';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function randomFlapChar() {
  const idx = Math.floor(Math.random() * SPLIT_FLAP_CHARS.length);
  return SPLIT_FLAP_CHARS[idx];
}

async function animateSplitFlap(lines, { flips = 16, frameDelay = 32, columnStagger = 6 } = {}) {
  const canAnimate = process.stdout.isTTY && process.env.CI !== 'true';
  if (!canAnimate) {
    console.log(kleur.cyan(lines.join('\n')));
    return;
  }

  const lineCount = lines.length;
  const blankFrame = lines.map((line) => line.replace(/[^\s]/g, ' '));
  let firstRender = true;

  const render = (frame) => {
    if (!firstRender) {
      process.stdout.write(`\x1b[${lineCount}F`);
    } else {
      firstRender = false;
    }
    process.stdout.write(frame.join('\n'));
    process.stdout.write('\n');
  };

  render(blankFrame);

  for (let flip = 0; flip < flips; flip++) {
    const frameLines = lines.map((line) => {
      const chars = line.split('').map((ch, idx) => {
        if (ch === ' ') return ' ';
        const shouldSettle = flip >= flips - 2 || flip > Math.floor(idx / columnStagger);
        return shouldSettle ? ch : randomFlapChar();
      });
      return kleur.cyan(chars.join(''));
    });
    render(frameLines);
    await sleep(frameDelay + flip * 6);
  }

  render(lines.map((line) => kleur.cyan(line)));
}

async function printHeader() {
  const headerLines = HEADER.trim().split('\n');
  console.log('');
  await animateSplitFlap(headerLines);
  console.log('');
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
  await printHeader();
  intro(kleur.cyan('Welcome to textmode.js - let’s scaffold a new project!'));

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

  // --- Gather project info ---
  let projectName = argv._[0] || argv.name;
  if (!projectName) {
    const suggested = suggestProjectName();
    projectName = await promptProjectName(suggested);
  }
  const targetDir = path.resolve(process.cwd(), projectName);

  ensureKnownTemplate(argv.template);
  let templateName = argv.template;
  if (!templateName) {
    templateName = await promptTemplate();
  }

  const template = templates.find((t) => t.name === templateName);
  const templateDir = path.join(__dirname, '..', 'templates', template.dir);

  // --- Resolve textmode.js version ---
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
    versionSpinner.stop('Could not fetch versions.');
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
    textmodeVersion = await promptTextmodeVersion(availableOptions);
  }

  // --- Pre-scaffold checks ---
  const pm = argv.pm || detectPackageManager();
  const pmCmds = pmCommands(pm);

  const targetExists = await pathExists(targetDir);
  if (targetExists && !(await isEmptyDir(targetDir)) && !argv.force) {
    const overwrite = await promptOverwrite(targetDir);
    if (!overwrite) {
      outro('Aborted.');
      return;
    }
  }

  // --- Scaffold project ---
  const scaffoldSpin = spinner();
  scaffoldSpin.start('Scaffolding project...');
  await scaffoldTemplate({ templateDir, targetDir, projectName, textmodeVersion });
  scaffoldSpin.stop('Scaffold complete.');

  // --- Install dependencies ---
  let installDone = false;

  const userInstall = argv.install;
  const userNoInstall = argv['no-install'];
  const hasInstallFlag = userInstall !== null || userNoInstall === true;
  let doInstall = userInstall === true;

  if (!hasInstallFlag) {
    doInstall = await promptInstall(pm);
  }

  if (doInstall) {
    const installSpin = spinner();
    installSpin.start(`Installing dependencies with ${pm}...`);
    let seenOutput = false;
    try {
      await runCommandLogged(pm, pmCmds.install, targetDir, (line) => {
        if (!seenOutput) {
          installSpin.stop(`Installing dependencies with ${pm}...`);
          seenOutput = true;
        }
        console.log(`│  ${line}`);
      });
      installDone = true;
      if (!seenOutput) installSpin.stop('Dependencies installed.');
      log.success('Dependencies installed.');
    } catch (err) {
      installSpin.stop('Dependency installation failed.');
      log.error(`Dependency installation failed: ${err.message || err}`);
    }
  }

  // --- Run dev server ---
  let runDone = false;

  if (installDone) {
    const userRun = argv.run;
    const userNoRun = argv['no-run'];
    const hasRunFlag = userRun !== null || userNoRun === true;
    let doRun = userRun === true;

    if (!hasRunFlag) {
      doRun = await promptRun(pm);
    }

    if (doRun) {
      log.step('Starting dev server...');
      try {
        await runCommand(pm, pmCmds.runDev, targetDir);
        runDone = true;
      } catch (err) {
        log.error(err.message || String(err));
      }
    }
  }

  // --- Summary ---
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
    margin: { top: 0, bottom: 0 },
    borderStyle: 'round',
    borderColor: 'cyan'
  });

  console.log(boxed);
  outro(kleur.green('Enjoy textmode.js!'));
}

export default run;
