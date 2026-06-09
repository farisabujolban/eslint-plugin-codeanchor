import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadEnvKeys, clearEnvCache } from '../src/util/env-file.js';

let tmpDir: string;
beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ca-env-file-'));
    clearEnvCache();
});
afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('loadEnvKeys', () => {
    it('returns empty set when no env file exists', () => {
        const fakeFile = path.join(tmpDir, 'src', 'index.ts');
        fs.mkdirSync(path.dirname(fakeFile), { recursive: true });
        fs.writeFileSync(fakeFile, '');
        const keys = loadEnvKeys(fakeFile);
        expect(keys.size).toBe(0);
    });

    it('loads keys from .env.example when present', () => {
        fs.writeFileSync(path.join(tmpDir, '.env.example'), 'DB_URL=\nSECRET_KEY=\n# comment\n');
        const fakeFile = path.join(tmpDir, 'src', 'index.ts');
        fs.mkdirSync(path.dirname(fakeFile), { recursive: true });
        fs.writeFileSync(fakeFile, '');
        const keys = loadEnvKeys(fakeFile);
        expect(keys.has('DB_URL')).toBe(true);
        expect(keys.has('SECRET_KEY')).toBe(true);
        expect(keys.has('comment')).toBe(false);
    });

    it('ignores comment lines and blank lines', () => {
        fs.writeFileSync(path.join(tmpDir, '.env.example'), '# header\n\nKEY=value\n');
        const fakeFile = path.join(tmpDir, 'app.ts');
        fs.writeFileSync(fakeFile, '');
        const keys = loadEnvKeys(fakeFile);
        expect(keys.has('KEY')).toBe(true);
        expect(keys.size).toBe(1);
    });
});
