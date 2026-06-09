import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, beforeEach, describe, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { envVarDeclared } from '../src/rules/env-var-declared.js';
import { clearEnvCache } from '../src/util/env-file.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

// eslint-disable-next-line codeanchor/temp-comment-requires-condition
// Create temp dir synchronously at module load so filename() is valid when tester.run() executes.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-env-test-'));
const ENV_CONTENT = [
    '# Database',
    'DATABASE_URL=postgres://localhost/mydb',
    'PORT=3000',
    'MODE=development',
    '',
    '# Auth',
    'API_KEY=your-api-key-here',
].join('\n');

fs.writeFileSync(path.join(tmpDir, '.env.example'), ENV_CONTENT);

beforeEach(() => {
    clearEnvCache();
});

function filename(name = 'file.ts'): string {
    return path.join(tmpDir, name);
}

const tester = new RuleTester({
    languageOptions: {
        parser: await import('@typescript-eslint/parser'),
        parserOptions: { sourceType: 'module' },
    },
});

tester.run('env-var-declared', envVarDeclared, {
    valid: [
        {
            code: 'const url = process.env.DATABASE_URL',
            filename: filename(),
        },
        {
            code: 'const port = process.env.PORT',
            filename: filename(),
        },
        {
            code: 'const key = process.env.API_KEY',
            filename: filename(),
        },
        // import.meta.env
        {
            code: 'const mode = import.meta.env.MODE',
            filename: filename(),
        },
        // Dynamic access allowed
        {
            code: 'const val = process.env[someKey]',
            filename: filename(),
            options: [{ allowDynamic: true }],
        },
    ],
    invalid: [
        {
            code: 'const secret = process.env.JWT_SECRET',
            filename: filename(),
            errors: [{ messageId: 'undeclaredEnvVar' }],
        },
        {
            code: 'const x = import.meta.env.VITE_SECRET',
            filename: filename(),
            errors: [{ messageId: 'undeclaredEnvVar' }],
        },
        // Dynamic access blocked by default
        {
            code: 'const val = process.env[someKey]',
            filename: filename(),
            errors: [{ messageId: 'dynamicEnvAccess' }],
        },
        // Multiple violations
        {
            code: `
        const a = process.env.MISSING_A
        const b = process.env.MISSING_B
      `,
            filename: filename(),
            errors: [{ messageId: 'undeclaredEnvVar' }, { messageId: 'undeclaredEnvVar' }],
        },
    ],
});
