import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noMixedAsyncStyles } from '../src/rules/no-mixed-async-styles.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-mixed-async-styles', noMixedAsyncStyles, {
    valid: [
        { code: `async function f() { const x = await foo(); }` },
        { code: `async function f() { await foo(); await bar(); }` },
        { code: `function f() { foo().then(x => x).catch(e => e); }` },
        // Non-async function with then is fine
        { code: `function f() { return foo().then(cb); }` },
        // then inside a non-async nested callback inside async function
        { code: `async function f() { arr.forEach(x => { x.then(cb); }); await g(); }` },
        // Async arrow with only await
        { code: `const f = async () => { return await foo(); }` },
    ],
    invalid: [
        {
            code: `async function f() { await foo(); bar().then(cb); }`,
            errors: [{ messageId: 'mixedAsyncStyles' }],
        },
        {
            code: `async function f() { const x = await foo(); return baz().catch(e => e); }`,
            errors: [{ messageId: 'mixedAsyncStyles' }],
        },
        {
            code: `const f = async () => { await a(); b().then(x => x); };`,
            errors: [{ messageId: 'mixedAsyncStyles' }],
        },
        {
            code: `const obj = { async method() { await x(); y().then(cb); } }`,
            errors: [{ messageId: 'mixedAsyncStyles' }],
        },
    ],
});
