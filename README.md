# create-textmode (✿◠‿◠)

<div align="center">

A zero-friction scaffolder for `textmode.js`.

| [![JavaScript](https://img.shields.io/badge/JavaScript-323330?logo=javascript&logoColor=F7DF1E)](https://developer.mozilla.org/docs/Web/JavaScript) [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) | [![textmode.js](https://img.shields.io/badge/github-textmode.js-111827?logo=github&logoColor=white)](https://github.com/humanbydefinition/textmode.js) [![docs](https://img.shields.io/badge/docs-vitepress-646cff?logo=vitepress&logoColor=white)](https://code.textmode.art/) [![Discord](https://img.shields.io/discord/1357070706181017691?color=5865F2&label=Discord&logo=discord&logoColor=white)](https://discord.gg/sjrw8QXNks) | [![ko-fi](https://shields.io/badge/ko--fi-donate-ff5f5f?logo=ko-fi)](https://ko-fi.com/V7V8JG2FY) [![Github-sponsors](https://img.shields.io/badge/sponsor-30363D?logo=GitHub-Sponsors&logoColor=#EA4AAA)](https://github.com/sponsors/humanbydefinition) |
|:-------------|:-------------|:-------------|

</div>

`create-textmode.js` is a command-line tool to quickly scaffold new projects using `textmode.js` with sensible defaults and minimal friction.

Just run the CLI via `npm create textmode@latest` or your package manager's equivalent command, answer a few prompts, and you're ready to start building!

> [!NOTE]
> The CLI is still fresh out of the oven, so please report any issues or feature requests on the GitHub repo!

## Requirements

- Node.js 18+ *(per `engines`)*
- One of: npm, pnpm, yarn, or bun on your PATH

## Quick start *(interactive)*

```bash
npm create textmode@latest
# or
pnpm create textmode@latest
# or
yarn create textmode
# ...
```

The CLI will prompt for project name, template, textmode.js version, installing dependencies, and starting the dev server.

## Non-interactive examples

```bash
# TypeScript template, pin textmode.js, auto-install, do not run dev server
npm create textmode@latest my-textmode-app -- --template vanilla-ts --textmode-version 0.7.1 --install --no-run

# JavaScript template with pnpm, skip install and run
pnpm create textmode@latest demo -- --template vanilla-js --pm pnpm --no-install --no-run
```

## Options

- `--template <name>`: choose a template *(prompts if omitted)*
- `--name <projectName>` or first positional arg: directory/package name *(default suggestion if omitted)*
- `--textmode-version <ver>`: pin textmode.js *(prompts from fetched stable versions; defaults to `latest`)*
- `--pm <npm|pnpm|yarn|bun>`: force a package manager *(auto-detected otherwise)*
- `--install` / `--no-install`: install dependencies after scaffold *(prompts if neither is provided)*
- `--run` / `--no-run`: start the dev server after install *(prompts if neither is provided)*
- `--force`: allow using a non-empty directory without prompting
- `--help`: show usage
- `--version`: show the CLI version

## Templates

| Template | Stack | Tooling |
|:---------|:------|:--------|
| `vanilla-js` | Vite + JavaScript + `textmode.js` | ESLint *(JS rules)*, Prettier, `.gitignore` |
| `vanilla-ts` | Vite + TypeScript + `textmode.js` | `tsconfig`, ESLint *(@typescript-eslint)*, Prettier, `.gitignore`, `typecheck` |

Adding new templates? Follow the same table format so details stay consistent and easy to scan.

## Local development

```bash
npm install
npm test          # vitest
npm run test:verbose

# Run CLI directly (no npm-create shim); no "--" needed
node bin/index.js demo --template vanilla-js --pm pnpm --no-install --no-run
# or
node bin/index.js
# ...
```