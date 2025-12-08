# create-textmode

A zero-friction scaffolder for `textmode.js` apps using the `npm create` convention.

## Usage

```bash
npm create textmode@latest
# or
pnpm create textmode@latest
# or
yarn create textmode
```

Non-interactive example:

```bash
npm create textmode@latest my-textmode-app -- --template react
```

## Templates

- `vanilla-js` – Vite + plain JavaScript starter
- `vanilla-ts` – Vite + TypeScript starter
- `react` – React + Vite starter
- `vue` – Vue 3 + Vite starter

## Options

- `--template <name>`: choose one of the templates above (will prompt if omitted)
- `--name <projectName>` or first positional arg: directory / package name (default: `textmode-app`)
- `--force`: allow using an existing non-empty directory
- `--help`: show usage

## Local development

```bash
npm install
npm run dev -- --help # runs the CLI directly via node
```

To test the published shape without publishing:

```bash
npm pack
npm install -g ./create-textmode-0.1.0.tgz
npm create textmode -- --help
```

## Next steps after scaffolding

```bash
cd <project-name>
npm install
npm run dev
```

## License

MIT
