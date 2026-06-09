import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noSyncInAsync } from '../src/rules/no-sync-in-async.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-sync-in-async', noSyncInAsync, {
    valid: [
        { code: `function notAsync() { fs.readFileSync('f') }` },
        { code: `async function foo() { await fs.promises.readFile('f') }` },
        // nested non-async inside async: only the inner scope matters
        { code: `async function outer() { function inner() { fs.readFileSync('f') } }` },
    ],
    invalid: [
        {
            code: `async function foo() { fs.readFileSync('config.json') }`,
            errors: [{ messageId: 'syncInAsync' }],
        },
        {
            code: `const bar = async () => { fs.writeFileSync('out.txt', 'x') }`,
            errors: [{ messageId: 'syncInAsync' }],
        },
        {
            code: `const obj = { async load() { return fs.readFileSync('f') } }`,
            errors: [{ messageId: 'syncInAsync' }],
        },
    ],
});
