import minimist from 'minimist';
import kleur from 'kleur';
import { addons, templates } from './constants.js';
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
    string: ['template', 'name', 'pm', 'textmode-version', 'addons'],
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

export function ensureKnownAddons(names) {
  if (!names) return;
  const requested = names.split(',').map((s) => s.trim()).filter(Boolean);
  const unknown = requested.filter((name) => !addons.find((a) => a.name === name));
  if (unknown.length === 0) return;

  console.error(kleur.red(`Unknown add-on(s): ${unknown.join(', ')}`));
  console.error(kleur.gray(`Valid add-ons: ${addons.map((a) => a.name).join(', ')}`));
  printUsage();
  process.exit(1);
}

export function parseAddons(names) {
  if (!names) return [];
  return names
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => addons.find((a) => a.name === name))
    .filter(Boolean);
}
