import kleur from 'kleur';
import boxen from 'boxen';

export function printSummary({ projectName, pm, pmCmds, installDone, runDone, addons = [] }) {
	const installCmd = `${pm} ${pmCmds.install.join(' ')}`;
	const runCmd = `${pm} ${pmCmds.runDev.join(' ')}`;

	const steps = [
		`cd ${projectName}`,
		installDone ? `✓ already ran ${installCmd}` : installCmd,
		runDone ? `✓ dev server is running (${runCmd})` : runCmd,
	]
		.filter(Boolean)
		.join('\n');

	const addonLines =
		addons.length > 0
			? ['', '', kleur.bold().cyan('Add-ons installed:'), addons.map((a) => `  ${a.label}`).join('\n')].join('\n')
			: '';

	const infoLines = [
		addonLines,
		'',
		kleur.bold().cyan('Helpful links:'),
		`${kleur.cyan('  Documentation:')} https://code.textmode.art`,
		`${kleur.cyan('  CLI issues:')} https://github.com/humanbydefinition/create-textmode/issues`,
	].join('\n');

	const boxed = boxen(`${kleur.bold().cyan('Next steps:')}\n${steps}${infoLines}`, {
		padding: { top: 0, bottom: 0, left: 2, right: 2 },
		margin: { top: 0, bottom: 0 },
		borderStyle: 'round',
		borderColor: 'cyan',
	});

	console.log(boxed);
}
