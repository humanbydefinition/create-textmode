import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import kleur from 'kleur';
import { intro, outro, spinner, log } from '@clack/prompts';
import { detectPackageManager, pmCommands } from './packageManager.js';
import { isEmptyDir, pathExists, scaffoldTemplate } from './fs-utils.js';
import { runCommand, runCommandLogged } from './runCommand.js';
import { printUsage } from './usage.js';
import { templates } from './constants.js';
import {
  promptInstall,
  promptProjectName,
  promptRun,
  promptTemplate,
  promptOverwrite,
  suggestProjectName,
  promptTextmodeVersion
} from './prompts.js';
import { printHeader } from './banner.js';
import { parseArgv, ensureKnownTemplate } from './args.js';
import { resolveTextmodeVersion } from './textmodeVersion.js';
import { printSummary } from './summary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function run() {
  await printHeader();
  intro(
    kleur.cyan('Welcome to textmode.js - let’s scaffold a new project! ✿  ') +
      kleur.gray('(Press Ctrl+C at any time to cancel.)')
  );

  const argv = parseArgv(process.argv.slice(2));

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
  const { textmodeVersion } = await resolveTextmodeVersion(
    requestedTextmodeVersion,
    promptTextmodeVersion
  );

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
  log.message('');
  printSummary({ projectName, pm, pmCmds, installDone, runDone });
  outro(kleur.green('Enjoy textmode.js! ツ'));
}

export default run;
