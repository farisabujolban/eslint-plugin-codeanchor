import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noUnguardedUrlConstructor } from '../src/rules/no-unguarded-url-constructor.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-unguarded-url-constructor', noUnguardedUrlConstructor, {
    valid: [
        { code: `try { const u = new URL(input) } catch (e) {}` },
        { code: `const u = new URL('https://example.com')` },
        { code: `try { new URL(path) } catch {}` },
    ],
    invalid: [
        {
            code: `const u = new URL(userInput)`,
            errors: [{ messageId: 'missingTryCatch' }],
        },
        {
            code: `const u = new URL(req.body.url)`,
            errors: [{ messageId: 'missingTryCatch' }],
        },
    ],
});
