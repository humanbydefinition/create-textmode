export function detectPackageManager() {
  const ua = process.env.npm_config_user_agent || '';
  if (ua.includes('pnpm')) return 'pnpm';
  if (ua.includes('yarn')) return 'yarn';
  if (ua.includes('bun')) return 'bun';
  return 'npm';
}

export function pmCommands(pm) {
  switch (pm) {
    case 'pnpm':
    case 'yarn':
    case 'bun':
      return { install: ['install'], runDev: ['run', 'dev'] };
    default:
      return { install: ['install'], runDev: ['run', 'dev'] };
  }
}
