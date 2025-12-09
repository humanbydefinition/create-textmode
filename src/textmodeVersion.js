import { spinner, log } from '@clack/prompts';
import { getTextmodeVersions } from './versions.js';

export async function resolveTextmodeVersion(requestedTextmodeVersion, promptTextmodeVersion) {
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

  return { textmodeVersion, stableVersions, availableOptions };
}
