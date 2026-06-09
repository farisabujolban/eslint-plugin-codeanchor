import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noUnguardedJsonParse } from '../src/rules/no-unguarded-json-parse.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-unguarded-json-parse', noUnguardedJsonParse, {
    valid: [
        { code: `try { JSON.parse(str) } catch (e) {}` },
        { code: `try { const x = JSON.parse(raw) } catch {}` },
        { code: `JSON.parse('{"a":1}')` },
        { code: `const x = JSON.parse('{}')` },
        { code: `function f() { try { return JSON.parse(s) } catch (e) { throw e } }` },
        { code: `const fn = () => { try { return JSON.parse(body) } catch { return null } }` },
    ],
    invalid: [
        {
            code: `const x = JSON.parse(raw)`,
            errors: [{ messageId: 'missingTryCatch' }],
        },
        {
            code: `const data = JSON.parse(response.body)`,
            errors: [{ messageId: 'missingTryCatch' }],
        },
        {
            code: `function load(s: string) { return JSON.parse(s) }`,
            errors: [{ messageId: 'missingTryCatch' }],
        },
        {
            code: `const parsed = JSON.parse(fs.readFileSync('config.json', 'utf-8'))`,
            errors: [{ messageId: 'missingTryCatch' }],
        },
    ],
});
