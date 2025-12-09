import https from 'https';

let cachedVersions = null;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

function isStable(version) {
  // Exclude prerelease tags like -beta, -rc, etc.
  return !version.includes('-');
}

function compareSemverDesc(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va > vb) return -1;
    if (va < vb) return 1;
  }
  return 0;
}

export async function getTextmodeVersions(limit = 20) {
  if (cachedVersions) return cachedVersions.slice(0, limit);

  const data = await fetchJson('https://registry.npmjs.org/textmode.js');
  const versions = Object.keys(data.versions || {})
    .filter(isStable)
    .sort(compareSemverDesc);

  cachedVersions = versions;
  return versions.slice(0, limit);
}
