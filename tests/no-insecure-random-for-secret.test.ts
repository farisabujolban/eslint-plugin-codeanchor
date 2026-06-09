import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noInsecureRandomForSecret } from '../src/rules/no-insecure-random-for-secret.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-insecure-random-for-secret', noInsecureRandomForSecret, {
    valid: [
        { code: `const token = crypto.randomUUID()` },
        { code: `const id = Math.random()` },
        { code: `const score = Math.random() * 100` },
    ],
    invalid: [
        {
            code: `const token = Math.random().toString(36)`,
            errors: [{ messageId: 'insecureRandom' }],
        },
        {
            code: `const secret = Math.random()`,
            errors: [{ messageId: 'insecureRandom' }],
        },
        {
            code: `const apiKey = Math.random().toString()`,
            errors: [{ messageId: 'insecureRandom' }],
        },
        {
            code: `const obj = { password: Math.random() }`,
            errors: [{ messageId: 'insecureRandom' }],
        },
    ],
});
