import { describe, it, expect, afterEach } from 'vitest';
import { detectPackageManager, pmCommands } from '../src/packageManager.js';

const ORIGINAL_UA = process.env.npm_config_user_agent;

afterEach(() => {
  process.env.npm_config_user_agent = ORIGINAL_UA;
});

describe('detectPackageManager', () => {
  it('detects pnpm from user agent', () => {
    process.env.npm_config_user_agent = 'pnpm/8.0.0 npm/? node/?';
    expect(detectPackageManager()).toBe('pnpm');
  });

  it('detects yarn from user agent', () => {
    process.env.npm_config_user_agent = 'yarn/1.22.0 npm/? node/?';
    expect(detectPackageManager()).toBe('yarn');
  });

  it('detects bun from user agent', () => {
    process.env.npm_config_user_agent = 'bun/1.0.0';
    expect(detectPackageManager()).toBe('bun');
  });

  it('falls back to npm when unknown', () => {
    process.env.npm_config_user_agent = 'some-agent';
    expect(detectPackageManager()).toBe('npm');
  });
});

describe('pmCommands', () => {
  it('returns install/run commands for known PMs', () => {
    expect(pmCommands('pnpm')).toEqual({ install: ['install'], runDev: ['run', 'dev'] });
    expect(pmCommands('yarn')).toEqual({ install: ['install'], runDev: ['run', 'dev'] });
    expect(pmCommands('bun')).toEqual({ install: ['install'], runDev: ['run', 'dev'] });
  });

  it('defaults to npm-style commands', () => {
    expect(pmCommands('npm')).toEqual({ install: ['install'], runDev: ['run', 'dev'] });
    expect(pmCommands('unknown')).toEqual({ install: ['install'], runDev: ['run', 'dev'] });
  });
});
