import { describe, it, expect } from 'vitest';
import { isStable, compareSemverDesc } from '../src/versions.js';

describe('versions helpers', () => {
  it('identifies stable versions', () => {
    expect(isStable('1.0.0')).toBe(true);
    expect(isStable('1.0.0-beta')).toBe(false);
    expect(isStable('2.1.0-rc.1')).toBe(false);
  });

  it('sorts semver strings in descending order', () => {
    const list = ['1.0.0', '2.0.0', '1.2.0', '2.0.1'];
    const sorted = [...list].sort(compareSemverDesc);
    expect(sorted).toEqual(['2.0.1', '2.0.0', '1.2.0', '1.0.0']);
  });
});
