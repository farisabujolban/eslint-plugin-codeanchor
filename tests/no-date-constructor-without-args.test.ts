import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noDateConstructorWithoutArgs } from '../src/rules/no-date-constructor-without-args.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-date-constructor-without-args', noDateConstructorWithoutArgs, {
    valid: [
        { code: `new Date('2024-01-01')` },
        { code: `new Date(1700000000000)` },
        { code: `new Date(Date.now())` },
        { code: `new Date(ts)` },
        { code: `new Date(year, month, day)` },
        { code: `Date.now()` },
        { code: `new Map()` },
        { code: `new Error('oops')` },
    ],
    invalid: [
        {
            code: `new Date()`,
            errors: [{ messageId: 'noArgDate' }],
        },
        {
            code: `const now = new Date()`,
            errors: [{ messageId: 'noArgDate' }],
        },
        {
            code: `return new Date()`,
            errors: [{ messageId: 'noArgDate' }],
        },
        {
            code: `const stamp = new Date().toISOString()`,
            errors: [{ messageId: 'noArgDate' }],
        },
        {
            code: `function getTime() { return new Date() }`,
            errors: [{ messageId: 'noArgDate' }],
        },
    ],
});
