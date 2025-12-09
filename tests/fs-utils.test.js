import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, readFile } from 'fs/promises';
import path from 'path';
import os from 'os';
import { setPackageName, setTextmodeVersion } from '../src/fs-utils.js';

async function createTempDir() {
  return mkdtemp(path.join(os.tmpdir(), 'textmode-test-'));
}

describe('fs-utils', () => {
  it('updates package name when package.json exists', async () => {
    const dir = await createTempDir();
    const pkgPath = path.join(dir, 'package.json');
    await writeFile(pkgPath, JSON.stringify({ name: 'old-name' }, null, 2));

    await setPackageName(dir, 'new-name');

    const updated = JSON.parse(await readFile(pkgPath, 'utf8'));
    expect(updated.name).toBe('new-name');
  });

  it('sets textmode.js version only when dependency exists', async () => {
    const dir = await createTempDir();
    const pkgPath = path.join(dir, 'package.json');
    await writeFile(
      pkgPath,
      JSON.stringify({ name: 'demo', dependencies: { 'textmode.js': '^0.1.0', react: '^18.0.0' } }, null, 2)
    );

    await setTextmodeVersion(dir, '1.2.3');

    const updated = JSON.parse(await readFile(pkgPath, 'utf8'));
    expect(updated.dependencies['textmode.js']).toBe('1.2.3');
    expect(updated.dependencies.react).toBe('^18.0.0');
  });
});
