import { describe, it, expect } from 'vitest';
import { isStable, compareSemverDesc, filterAtLeast } from '../src/versions.js';

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

	it('filters versions at or above a minimum, preserving order', () => {
		const versions = ['0.17.0', '0.17.1', '0.17.2', '0.18.0', '0.16.0'];
		const filtered = filterAtLeast(versions, '0.17.2');
		expect(filtered).toEqual(['0.17.2', '0.18.0']);
	});

	it('keeps versions equal to the minimum', () => {
		expect(filterAtLeast(['0.17.2'], '0.17.2')).toEqual(['0.17.2']);
		expect(filterAtLeast([], '0.17.2')).toEqual([]);
	});
});
