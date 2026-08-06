import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import os from 'os';
import {
  addAddonDependencies,
  wireAddonsIntoSketch,
  scaffoldTemplate,
  setPackageName,
  setTextmodeVersion
} from '../src/fs-utils.js';

async function createTempDir() {
  return mkdtemp(path.join(os.tmpdir(), 'textmode-test-'));
}

const addons = [
  { name: 'synth', label: 'textmode.synth.js', package: 'textmode.synth.js', plugin: 'SynthPlugin', minTextmode: '0.16.0' },
  { name: 'export', label: 'textmode.export.js', package: 'textmode.export.js', plugin: 'ExportPlugin', minTextmode: '0.16.0' }
];

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

  it('adds add-on dependencies and preserves existing ones', async () => {
    const dir = await createTempDir();
    const pkgPath = path.join(dir, 'package.json');
    await writeFile(
      pkgPath,
      JSON.stringify({ name: 'demo', dependencies: { 'textmode.js': 'latest', tweakpane: '^4.0.5' } }, null, 2)
    );

    await addAddonDependencies(dir, addons);

    const updated = JSON.parse(await readFile(pkgPath, 'utf8'));
    expect(updated.dependencies['textmode.synth.js']).toBe('latest');
    expect(updated.dependencies['textmode.export.js']).toBe('latest');
    expect(updated.dependencies['textmode.js']).toBe('latest');
    expect(updated.dependencies.tweakpane).toBe('^4.0.5');
  });

  it('does nothing when no add-ons are given', async () => {
    const dir = await createTempDir();
    const pkgPath = path.join(dir, 'package.json');
    await writeFile(pkgPath, JSON.stringify({ name: 'demo', dependencies: { 'textmode.js': 'latest' } }, null, 2));

    await addAddonDependencies(dir, []);

    const updated = JSON.parse(await readFile(pkgPath, 'utf8'));
    expect(Object.keys(updated.dependencies)).toEqual(['textmode.js']);
  });

  it('wires add-on imports and plugins into a JS sketch', async () => {
    const dir = await createTempDir();
    const sketchPath = path.join(dir, 'src', 'sketch.js');
    await mkdir(path.dirname(sketchPath), { recursive: true });
    await writeFile(
      sketchPath,
      `import { textmode } from 'textmode.js';\n\nconst tm = textmode.create({ width: 100, height: 100 });\n`
    );

    await wireAddonsIntoSketch(dir, addons);

    const updated = await readFile(sketchPath, 'utf8');
    expect(updated).toContain("import { SynthPlugin } from 'textmode.synth.js';");
    expect(updated).toContain("import { ExportPlugin } from 'textmode.export.js';");
    expect(updated).toContain('plugins: [SynthPlugin, ExportPlugin]');
    expect(updated).toContain('textmode.create({ width: 100, height: 100, plugins: [SynthPlugin, ExportPlugin] })');
  });

  it('wires add-on imports and plugins into a TS sketch', async () => {
    const dir = await createTempDir();
    const sketchPath = path.join(dir, 'src', 'sketch.ts');
    await mkdir(path.dirname(sketchPath), { recursive: true });
    await writeFile(
      sketchPath,
      `import { textmode } from 'textmode.js';\n\nconst tm = textmode.create({ width: 100, height: 100 });\n`
    );

    await wireAddonsIntoSketch(dir, addons);

    const updated = await readFile(sketchPath, 'utf8');
    expect(updated).toContain("import { SynthPlugin } from 'textmode.synth.js';");
    expect(updated).toContain("import { ExportPlugin } from 'textmode.export.js';");
    expect(updated).toContain('plugins: [SynthPlugin, ExportPlugin]');
  });

  it('appends to an existing plugins array in the create call', async () => {
    const dir = await createTempDir();
    const sketchPath = path.join(dir, 'src', 'sketch.js');
    await mkdir(path.dirname(sketchPath), { recursive: true });
    await writeFile(
      sketchPath,
      `import { textmode } from 'textmode.js';\n\nconst tm = textmode.create({ width: 100, plugins: [MyPlugin] });\n`
    );

    await wireAddonsIntoSketch(dir, addons);

    const updated = await readFile(sketchPath, 'utf8');
    expect(updated).toContain('plugins: [MyPlugin, SynthPlugin, ExportPlugin]');
  });

  it('scaffolds a template with add-ons end to end', async () => {
    const templateDir = await createTempDir();
    const srcDir = path.join(templateDir, 'src');
    await mkdir(srcDir, { recursive: true });
    await writeFile(
      path.join(templateDir, 'package.json'),
      JSON.stringify({ name: '{{name}}', dependencies: { 'textmode.js': 'latest' } }, null, 2)
    );
    await writeFile(
      path.join(srcDir, 'sketch.js'),
      `import { textmode } from 'textmode.js';\n\nconst tm = textmode.create({ width: window.innerWidth, height: window.innerHeight });\n`
    );

    const targetDir = await createTempDir();
    await scaffoldTemplate({ templateDir, targetDir, projectName: 'demo', textmodeVersion: 'latest', addons });

    const pkg = JSON.parse(await readFile(path.join(targetDir, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('demo');
    expect(pkg.dependencies['textmode.synth.js']).toBe('latest');
    expect(pkg.dependencies['textmode.export.js']).toBe('latest');

    const sketch = await readFile(path.join(targetDir, 'src', 'sketch.js'), 'utf8');
    expect(sketch).toContain("import { SynthPlugin } from 'textmode.synth.js';");
    expect(sketch).toContain('plugins: [SynthPlugin, ExportPlugin]');
  });
});
