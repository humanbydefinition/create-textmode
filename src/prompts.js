import path from 'path';
import { confirm, isCancel, cancel, multiselect, select, text } from '@clack/prompts';
import kleur from 'kleur';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { addons, templates, MIN_TEXTMODE_VERSION } from './constants.js';

/**
 * Handle user cancellation uniformly.
 *
 * @param value - The value returned from a prompt.
 * @returns True if the user cancelled.
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
		initialValue: templates[0].name,
	});

	handleCancel(choice);
	return choice;
}

export async function promptAddons() {
	const selection = await multiselect({
		message: `${kleur.cyan('Select add-on libraries to pre-install')} ${kleur.gray('(space to toggle, ↵ confirm, none = skip)')}`,
		options: addons.map((a) => ({ value: a.name, label: a.label, hint: a.description })),
		required: false,
		initialValue: [],
	});

	handleCancel(selection);
	return Array.isArray(selection) ? selection : [];
}

export function suggestProjectName() {
	return uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals],
		separator: '-',
		length: 3,
	});
}

export async function promptProjectName(defaultName) {
	const name = await text({
		message: `${kleur.cyan('Project name')} ${kleur.gray('(enter to accept default)')}`,
		initialValue: defaultName,
		validate: (value) => (value && value.trim().length > 0 ? undefined : 'Name cannot be empty'),
	});

	handleCancel(name);
	return name.trim();
}

export async function promptOverwrite(targetDir) {
	const response = await confirm({
		message: `Directory ${path.basename(targetDir)} is not empty. Continue?`,
		initialValue: false,
	});

	handleCancel(response);
	return response;
}

export async function promptInstall(pm) {
	const decision = await confirm({
		message: `Install dependencies with ${pm}?`,
		initialValue: true,
	});

	handleCancel(decision);
	return decision;
}

export async function promptRun(pm) {
	const decision = await confirm({
		message: `Run dev server now with ${pm}?`,
		initialValue: false,
	});

	handleCancel(decision);
	return decision;
}

export async function promptTextmodeVersion(options) {
	const choice = await select({
		message: `${kleur.cyan('Select textmode.js version')} ${kleur.gray(`(latest recommended, >= ${MIN_TEXTMODE_VERSION})`)}`,
		options,
		initialValue: options[0]?.value,
		maxItems: 5,
	});

	handleCancel(choice);
	return choice;
}
