import path from 'path';
import { cp, mkdir, readdir, readFile, rename, stat, writeFile } from 'fs/promises';
import { IGNORED_DIR_ENTRIES, TEXT_FILE_REGEX } from './constants.js';

export async function pathExists(p) {
  try {
    await stat(p);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

export async function isEmptyDir(dir) {
  try {
    const entries = await readdir(dir);
    const filtered = entries.filter((name) => !IGNORED_DIR_ENTRIES.includes(name));
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

    if (entry.name === '_gitignore') {
      await rename(fullPath, path.join(root, '.gitignore'));
      continue;
    }

    if (!TEXT_FILE_REGEX.test(entry.name)) continue;

    const data = await readFile(fullPath, 'utf8');
    if (!data.includes('{{name}}')) continue;

    const next = data.replace(/{{name}}/g, projectName);
    await writeFile(fullPath, next, 'utf8');
  }
}

export async function setPackageName(targetDir, projectName) {
  const pkgPath = path.join(targetDir, 'package.json');
  try {
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    pkg.name = projectName;
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  } catch (err) {
    // If no package.json exists, ignore; templates without package.json are allowed.
  }
}

export async function setTextmodeVersion(targetDir, textmodeVersion) {
  if (!textmodeVersion) return;
  const pkgPath = path.join(targetDir, 'package.json');
  try {
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    if (!pkg.dependencies) pkg.dependencies = {};
    if (pkg.dependencies['textmode.js'] !== undefined) {
      pkg.dependencies['textmode.js'] = textmodeVersion;
      await writeFile(pkgPath, JSON.stringify(pkg, null, 2));
    }
  } catch (err) {
    // Ignore templates without package.json or invalid JSON.
  }
}

export async function scaffoldTemplate({ templateDir, targetDir, projectName, textmodeVersion }) {
  await mkdir(targetDir, { recursive: true });
  await cp(templateDir, targetDir, { recursive: true, force: true });

  await replacePlaceholders(targetDir, projectName);
  await setPackageName(targetDir, projectName);
  await setTextmodeVersion(targetDir, textmodeVersion);
}
