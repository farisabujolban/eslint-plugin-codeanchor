import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noFloatingPointEquality } from '../src/rules/no-floating-point-equality.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-floating-point-equality', noFloatingPointEquality, {
    valid: [
        { code: `x === 1` },
        { code: `x === 1.0` },
        { code: `x === 0` },
        { code: `x === y` },
        { code: `Math.abs(x - 0.5) < Number.EPSILON` },
        { code: `x > 0.5` },
        { code: `x < 1.5` },
        { code: `x >= 0.1` },
        { code: `x !== 2` },
        { code: `"0.5" === "0.5"` },
    ],
    invalid: [
        {
            code: `x === 0.5`,
            errors: [{ messageId: 'floatEquality' }],
        },
        {
            code: `x !== 1.5`,
            errors: [{ messageId: 'floatEquality' }],
        },
        {
            code: `0.1 == y`,
            errors: [{ messageId: 'floatEquality' }],
        },
        {
            code: `-0.5 === x`,
            errors: [{ messageId: 'floatEquality' }],
        },
        {
            code: `x === 1.1`,
            errors: [{ messageId: 'floatEquality' }],
        },
        {
            code: `if (ratio != 0.33) {}`,
            errors: [{ messageId: 'floatEquality' }],
        },
        {
            code: `const ok = (price === 9.99)`,
            errors: [{ messageId: 'floatEquality' }],
        },
    ],
});
