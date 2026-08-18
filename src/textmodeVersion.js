import { spinner, log } from '@clack/prompts';
import { compareSemverDesc, getTextmodeVersions, filterAtLeast } from './versions.js';
import { MIN_TEXTMODE_VERSION } from './constants.js';

export async function resolveTextmodeVersion(requestedTextmodeVersion, promptTextmodeVersion) {
	let textmodeVersion = 'latest';
	let stableVersions;

	const versionSpinner = spinner();
	versionSpinner.start('Fetching textmode.js versions...');
	try {
		stableVersions = await getTextmodeVersions();
		if (stableVersions.length === 0) throw new Error('No versions found');
		versionSpinner.stop('Fetched textmode.js versions.');
	} catch {
		versionSpinner.stop('Could not fetch versions.');
		log.warn('Using latest version as fallback.');
		stableVersions = [];
		textmodeVersion = 'latest';
	}

	// Only offer versions at or above the global minimum (e.g. >= 0.17.1).
	// Every official add-on peer-depends on a lower floor, so this also covers
	// add-on compatibility.
	const eligibleVersions = filterAtLeast(stableVersions, MIN_TEXTMODE_VERSION);

	const latestVersion = eligibleVersions[0] || stableVersions[0];
	const availableOptions = [
		{
			value: 'latest',
			label: latestVersion ? `latest (${latestVersion})` : 'latest (recommended)',
		},
		...eligibleVersions.slice(1).map((v) => ({ value: v, label: v })),
	];

	if (requestedTextmodeVersion) {
		const found = availableOptions.find((opt) => opt.value === requestedTextmodeVersion);
		if (found) {
			textmodeVersion = requestedTextmodeVersion;
		} else if (stableVersions.includes(requestedTextmodeVersion)) {
			textmodeVersion = requestedTextmodeVersion;
			if (compareSemverDesc(requestedTextmodeVersion, MIN_TEXTMODE_VERSION) > 0) {
				log.warn(
					`textmode.js must be >= ${MIN_TEXTMODE_VERSION}, but ${requestedTextmodeVersion} is older. Upgrading to latest.`
				);
				textmodeVersion = 'latest';
			}
		} else {
			log.warn(`Requested textmode.js@${requestedTextmodeVersion} not found; using latest instead.`);
			textmodeVersion = 'latest';
		}
	} else if (eligibleVersions.length > 0) {
		textmodeVersion = await promptTextmodeVersion(availableOptions);
	}

	return { textmodeVersion, stableVersions, availableOptions };
}
