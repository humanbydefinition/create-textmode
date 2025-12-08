#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { cp, mkdir, readdir, readFile, rename, stat, writeFile } from 'fs/promises';
import { spawn } from 'child_process';
import minimist from 'minimist';
import { intro, outro, select, confirm, isCancel, text } from '@clack/prompts';
import kleur from 'kleur';
import ora from 'ora';
import boxen from 'boxen';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HEADER = `
  __                   __                     .___               __        
_/  |_  ____ ___  ____/  |_  _____   ____   __| _/____          |__| ______
\\   __\\/ __ \\\\  \\/  /\\   __\\/     \\ /  _ \\ / __ |/ __ \\         |  |/  ___/
 |  | \\  ___/ >    <  |  | |  Y Y  (  <_> ) /_/ \\  ___/         |  |\\___ \\ 
 |__|  \\___  >__/\\_ \\ |__| |__|_|  /\\____/\\____ |\\___  > /\\ /\\__|  /____  >
           \\/      \\/            \\/            \\/    \\/  \\/ \\______|    \\/ 
`;

const templates = [
  { name: 'vanilla-js', label: 'Vanilla JS (Vite)', dir: 'vanilla-js' },
  { name: 'vanilla-ts', label: 'Vanilla TS (Vite)', dir: 'vanilla-ts' },
  { name: 'react', label: 'React (Vite)', dir: 'react' },
  { name: 'vue', label: 'Vue 3 (Vite)', dir: 'vue' }
];

function detectPackageManager() {
  const ua = process.env.npm_config_user_agent || '';
  if (ua.includes('pnpm')) return 'pnpm';
  if (ua.includes('yarn')) return 'yarn';
  if (ua.includes('bun')) return 'bun';
  return 'npm';
}

function pmCommands(pm) {
  switch (pm) {
    case 'pnpm':
      return { install: ['install'], runDev: ['run', 'dev'] };
    case 'yarn':
      return { install: ['install'], runDev: ['run', 'dev'] };
    case 'bun':
      return { install: ['install'], runDev: ['run', 'dev'] };
    default:
      return { install: ['install'], runDev: ['run', 'dev'] };
  }
}

function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function printHeader() {
  console.log(kleur.cyan(HEADER));
}

async function pathExists(p) {
  try {
    await stat(p);
    return true;
  } catch (err) {
    return err.code !== 'ENOENT';
  }
}

async function isEmptyDir(dir) {
  try {
    const entries = await readdir(dir);
    const filtered = entries.filter((name) => !['.git', '.gitkeep'].includes(name));
    return filtered.length === 0;
  } catch (err) {
    if (err.code === 'ENOENT') return true;
    throw err;
  }
}

async function replacePlaceholders(root, projectName) {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      await replacePlaceholders(fullPath, projectName);
      continue;
    }
    // Rename _gitignore -> .gitignore to survive npm publishing rules.
    if (entry.name === '_gitignore') {
      await rename(fullPath, path.join(root, '.gitignore'));
      continue;
    }
    const isText = /\.(json|js|jsx|ts|tsx|vue|md|html|txt|cjs|mjs)$/i.test(entry.name);
    if (!isText) continue;
    const data = await readFile(fullPath, 'utf8');
    if (!data.includes('{{name}}')) continue;
    const next = data.replace(/{{name}}/g, projectName);
    await writeFile(fullPath, next, 'utf8');
  }
}

async function setPackageName(targetDir, projectName) {
  const pkgPath = path.join(targetDir, 'package.json');
  try {
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    pkg.name = projectName;
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  } catch (err) {
    // If no package.json exists, ignore.
  }
}

function printUsage() {
  const list = templates.map((t) => `  - ${t.name}`).join('\n');
  console.log(`Usage: npm create textmode@latest [project-name] -- [options]\n`);
  console.log('Options:');
  console.log('  --template <name>   Choose a template');
  console.log('  --name <name>       Project directory name (alias: positional arg)');
  console.log('  --pm <npm|pnpm|yarn|bun>  Force package manager (auto-detected if omitted)');
  console.log('  --install / --no-install  Install dependencies after scaffold');
  console.log('  --run / --no-run          Run dev server after install');
  console.log('  --force             Allow using a non-empty directory');
  console.log('  --help              Show this help');
  console.log('\nTemplates:\n' + list);
}

async function promptTemplate() {
  const choice = await select({
    message: `${kleur.cyan('Select a template')} ${kleur.gray('(↑↓ move, ↵ confirm)')}`,
    options: templates.map((t) => ({ value: t.name, label: t.label })),
    initialValue: templates[0].name
  });
  if (isCancel(choice)) return null;
  return choice;
}

function suggestProjectName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    length: 3
  });
}

async function promptProjectName(defaultName) {
  const name = await text({
    message: `${kleur.cyan('Project name')} ${kleur.gray('(enter to accept default)')}`,
    initialValue: defaultName,
    validate: (value) => (value && value.trim().length > 0 ? undefined : 'Name cannot be empty')
  });
  if (isCancel(name)) return null;
  return name.trim();
}

async function promptOverwrite(targetDir) {
  const response = await confirm({
    message: `Directory ${path.basename(targetDir)} is not empty. Continue?`,
    initialValue: false
  });
  if (isCancel(response)) return null;
  return response;
}

async function main() {
  printHeader();
  intro(kleur.cyan('create-textmode'));
  const argv = minimist(process.argv.slice(2), {
    alias: { h: 'help', t: 'template', n: 'name', f: 'force', v: 'version' },
    string: ['template', 'name', 'pm'],
    boolean: ['help', 'force', 'version']
  });

  if (argv.help) {
    printUsage();
    return;
  }

  if (argv.version) {
    const pkgJson = JSON.parse(await readFile(path.join(__dirname, '../package.json'), 'utf8'));
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

  let templateName = argv.template;
  if (templateName && !templates.find((t) => t.name === templateName)) {
    console.error(kleur.red(`Unknown template: ${templateName}`));
    printUsage();
    process.exit(1);
  }

  if (!templateName) {
    templateName = await promptTemplate();
    if (!templateName) {
      outro('No template selected.');
      return;
    }
  }

  const template = templates.find((t) => t.name === templateName);
  const templateDir = path.join(__dirname, '..', 'templates', template.dir);

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

  const scaffoldSpinner = ora('Scaffolding project...').start();
  await mkdir(targetDir, { recursive: true });
  await cp(templateDir, targetDir, { recursive: true, force: true });

  await replacePlaceholders(targetDir, projectName);
  await setPackageName(targetDir, projectName);
  scaffoldSpinner.succeed('Scaffold complete.');

  let installDone = false;
  let runDone = false;

  const hasInstallFlag = Object.prototype.hasOwnProperty.call(argv, 'install') ||
    Object.prototype.hasOwnProperty.call(argv, 'no-install');
  const shouldPromptInstall = !hasInstallFlag;
  let doInstall = false;
  if (argv.install === true) doInstall = true;
  else if (argv['no-install'] === true) doInstall = false;
  else if (shouldPromptInstall) {
    const decision = await confirm({
      message: `Install dependencies with ${pm}?`,
      initialValue: true
    });
    if (isCancel(decision)) {
      outro('Cancelled.');
      return;
    }
    doInstall = decision;
  }

  if (doInstall) {
    const installSpinner = ora(`Installing dependencies with ${pm}...`).start();
    try {
      await runCommand(pm, pmCmds.install, targetDir);
      installDone = true;
      installSpinner.succeed('Dependencies installed.');
    } catch (err) {
      installSpinner.fail('Dependency installation failed.');
      console.error(kleur.red(err.message || err));
    }
  }

  let doRun = false;
  if (installDone) {
    const hasRunFlag = Object.prototype.hasOwnProperty.call(argv, 'run') ||
      Object.prototype.hasOwnProperty.call(argv, 'no-run');
    const shouldPromptRun = !hasRunFlag;
    if (argv.run === true) doRun = true;
    else if (argv['no-run'] === true) doRun = false;
    else if (shouldPromptRun) {
      const decision = await confirm({
        message: `Run dev server now with ${pm}?`,
        initialValue: false
      });
      if (isCancel(decision)) {
        outro('Cancelled.');
        return;
      }
      doRun = decision;
    }
  }

  if (doRun) {
    const runSpinner = ora(`Starting dev server with ${pm}...`).start();
    try {
      runSpinner.stop();
      await runCommand(pm, pmCmds.runDev, targetDir);
      runDone = true;
    } catch (err) {
      console.error(kleur.red(err.message || err));
    }
  }

  const installCmd = `${pm} ${pmCmds.install.join(' ')}`;
  const runCmd = `${pm} ${pmCmds.runDev.join(' ')}`;

  const steps = [
    `cd ${projectName}`,
    installDone ? `✓ already ran ${installCmd}` : installCmd,
    runDone ? `✓ dev server is running (${runCmd})` : runCmd
  ].filter(Boolean).join('\n');

  const boxed = boxen(`Next steps:\n${steps}`, {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: 'cyan'
  });

  console.log(boxed);
  outro(kleur.green('Enjoy textmode.js!'));
}

main().catch((err) => {
  console.error(kleur.red(err.stack || err.message || err));
  process.exit(1);
});
