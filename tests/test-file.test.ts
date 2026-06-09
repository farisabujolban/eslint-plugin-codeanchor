import { describe, it, expect } from 'vitest';
import { isTestFile } from '../src/util/test-file.js';

describe('isTestFile', () => {
    it('identifies .test.ts files', () => {
        expect(isTestFile('src/rules/foo.test.ts')).toBe(true);
    });

    it('identifies .spec.ts files', () => {
        expect(isTestFile('src/rules/foo.spec.ts')).toBe(true);
    });

    it('identifies files inside __tests__ directory', () => {
        expect(isTestFile('src/__tests__/foo.ts')).toBe(true);
    });

    it('identifies files inside tests directory', () => {
        expect(isTestFile('tests/foo.ts')).toBe(true);
    });

    it('identifies files inside test directory', () => {
        expect(isTestFile('test/foo.ts')).toBe(true);
    });

    it('does not identify regular source files', () => {
        expect(isTestFile('src/rules/foo.ts')).toBe(false);
    });

    it('works for other extensions (.test.py)', () => {
        expect(isTestFile('test_foo.test.py')).toBe(true);
    });
});
