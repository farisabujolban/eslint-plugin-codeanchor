import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noPlaceholderValues } from '../src/rules/no-placeholder-values.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-placeholder-values', noPlaceholderValues, {
    valid: [
        { code: `const apiKey = process.env.API_KEY` },
        { code: `const apiKey = ""` },
        { code: `const name = "John Doe"` },
        { code: `const url = "https://api.example.internal/v1"` },
        // test file skipped by default
        { code: `const x = "your-api-key"`, filename: 'src/api.test.ts' },
    ],
    invalid: [
        {
            code: `const x = "your-api-key"`,
            errors: [{ messageId: 'placeholderValue' }],
        },
        {
            code: `const x = "changeme"`,
            errors: [{ messageId: 'placeholderValue' }],
        },
        {
            code: `const x = "replace-me"`,
            errors: [{ messageId: 'placeholderValue' }],
        },
        {
            code: `const x = "REPLACE_WITH_ACTUAL_VALUE"`,
            errors: [{ messageId: 'placeholderValue' }],
        },
        {
            code: `const x = "example.com"`,
            errors: [{ messageId: 'placeholderValue' }],
        },
        {
            code: `const x = "insert-here"`,
            errors: [{ messageId: 'placeholderValue' }],
        },
    ],
});
