import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { requireErrorCause } from '../src/rules/require-error-cause.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('require-error-cause', requireErrorCause, {
    valid: [
        { code: `try {} catch (e) { throw new Error('msg', { cause: e }) }` },
        { code: `try {} catch (e) { throw new TypeError('oops', { cause: e, extra: 1 }) }` },
        // catch without binding = intentional sanitization — no FP
        { code: `try {} catch { throw new Error('sanitized') }` },
        // throw outside catch
        { code: `throw new Error('standalone')` },
        // re-throw original
        { code: `try {} catch (e) { throw e }` },
        // non-Error throw
        { code: `try {} catch (e) { throw 'string error' }` },
    ],
    invalid: [
        {
            code: `try {} catch (e) { throw new Error('wrapped') }`,
            errors: [{ messageId: 'missingCause' }],
        },
        {
            code: `try {} catch (err) { throw new TypeError('bad type') }`,
            errors: [{ messageId: 'missingCause' }],
        },
        {
            code: `try {} catch (e) { throw new Error('msg', {}) }`,
            errors: [{ messageId: 'missingCause' }],
        },
        {
            code: `try {} catch (e) { throw new RangeError('out of range') }`,
            errors: [{ messageId: 'missingCause' }],
        },
    ],
});
