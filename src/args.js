import minimist from 'minimist';
import kleur from 'kleur';
import { templates } from './constants.js';
import { printUsage } from './usage.js';

export function parseArgv(rawArgs) {
  return minimist(rawArgs, {
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
}

export function ensureKnownTemplate(name) {
  if (!name) return;
  const found = templates.find((t) => t.name === name);
  if (found) return;

  console.error(kleur.red(`Unknown template: ${name}`));
  printUsage();
  process.exit(1);
}
