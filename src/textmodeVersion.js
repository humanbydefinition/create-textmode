import { spinner, log } from '@clack/prompts';
import { compareSemverDesc, getTextmodeVersions } from './versions.js';

export async function resolveTextmodeVersion(
  requestedTextmodeVersion,
  promptTextmodeVersion,
  options = {}
) {
  const { minTextmode } = options;
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

  // When add-ons are selected, only offer versions that satisfy the peer
  // dependency (e.g. >= 0.16.0).
  let eligibleVersions = stableVersions;
  if (minTextmode) {
    eligibleVersions = stableVersions.filter(
      (v) => compareSemverDesc(v, minTextmode) <= 0
    );
  }

  const latestVersion = eligibleVersions[0] || stableVersions[0];
  const availableOptions = [
    {
      value: 'latest',
      label: latestVersion ? `latest (${latestVersion})` : 'latest (recommended)'
    },
    ...eligibleVersions.slice(1).map((v) => ({ value: v, label: v }))
  ];

  if (requestedTextmodeVersion) {
    const found = availableOptions.find((opt) => opt.value === requestedTextmodeVersion);
    if (found) {
      textmodeVersion = requestedTextmodeVersion;
    } else if (stableVersions.includes(requestedTextmodeVersion)) {
      textmodeVersion = requestedTextmodeVersion;
      if (minTextmode && compareSemverDesc(requestedTextmodeVersion, minTextmode) > 0) {
        log.warn(
          `Add-ons require textmode.js >= ${minTextmode}, but ${requestedTextmodeVersion} is older. Upgrading to latest.`
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
