import { addons, templates } from './constants.js';

export function printUsage() {
  const list = templates.map((t) => `  - ${t.name}`).join('\n');
  const addonList = addons.map((a) => `  - ${a.name} (${a.package})`).join('\n');

  console.log(`Usage: npm create textmode@latest [project-name] -- [options]\n`);
  console.log('Options:');
  console.log('  --template <name>          Choose a template');
  console.log('  --addons <name1,name2,...> Pre-install official textmode.js add-ons');
  console.log('  --name <name>              Project directory name (alias: positional arg)');
  console.log('  --pm <npm|pnpm|yarn|bun>   Force package manager (auto-detected if omitted)');
  console.log('  --textmode-version <ver>   Pin textmode.js version (default: latest, prompts if omitted)');
  console.log('  --install / --no-install   Install dependencies after scaffold');
  console.log('  --run / --no-run           Run dev server after install');
  console.log('  --force                    Allow using a non-empty directory');
  console.log('  --help                     Show this help');
  console.log('  --version                  Show CLI version');
  console.log('\nTemplates:\n' + list);
  console.log('\nAdd-ons:\n' + addonList);
}
