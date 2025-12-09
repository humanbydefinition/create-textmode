import path from 'path';
import { confirm, isCancel, cancel, select, text } from '@clack/prompts';
import kleur from 'kleur';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { templates } from './constants.js';

/**
 * Handle user cancellation uniformly.
 * @param {unknown} value - The value returned from a prompt.
 * @returns {boolean} True if the user cancelled.
 */
export function handleCancel(value) {
  if (isCancel(value)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  return false;
}

export async function promptTemplate() {
  const choice = await select({
    message: `${kleur.cyan('Select a template')} ${kleur.gray('(↑↓ move, ↵ confirm)')}`,
    options: templates.map((t) => ({ value: t.name, label: t.label })),
    initialValue: templates[0].name
  });

  handleCancel(choice);
  return choice;
}

export function suggestProjectName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    length: 3
  });
}

export async function promptProjectName(defaultName) {
  const name = await text({
    message: `${kleur.cyan('Project name')} ${kleur.gray('(enter to accept default)')}`,
    initialValue: defaultName,
    validate: (value) => (value && value.trim().length > 0 ? undefined : 'Name cannot be empty')
  });

  handleCancel(name);
  return name.trim();
}

export async function promptOverwrite(targetDir) {
  const response = await confirm({
    message: `Directory ${path.basename(targetDir)} is not empty. Continue?`,
    initialValue: false
  });

  handleCancel(response);
  return response;
}

export async function promptInstall(pm) {
  const decision = await confirm({
    message: `Install dependencies with ${pm}?`,
    initialValue: true
  });

  handleCancel(decision);
  return decision;
}

export async function promptRun(pm) {
  const decision = await confirm({
    message: `Run dev server now with ${pm}?`,
    initialValue: false
  });

  handleCancel(decision);
  return decision;
}

export async function promptTextmodeVersion(options) {
  const choice = await select({
    message: `${kleur.cyan('Select textmode.js version')} ${kleur.gray('(latest recommended)')}`,
    options,
    initialValue: options[0]?.value,
    maxItems: 5
  });

  handleCancel(choice);
  return choice;
}
