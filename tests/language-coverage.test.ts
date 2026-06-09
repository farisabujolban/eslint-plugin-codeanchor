/**
 * Language coverage tests — verifies that Tier A (comment-based) and Tier B (Literal-based)
 * rules fire correctly under three parser configurations:
 *
 *   1. Plain JS  — default espree parser, no TypeScript
 *   2. TypeScript — @typescript-eslint/parser
 *   3. JSX        — default espree parser with ecmaFeatures.jsx enabled
 *
 * Also verifies the TypeScript-only rule (no-double-type-assertion) is silent
 * with the plain JS parser (TSAsExpression nodes are never emitted).
 */

import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { todoRequiresIssue } from '../src/rules/todo-requires-issue.js';
import { tempCommentRequiresCondition } from '../src/rules/temp-comment-requires-condition.js';
import { commentExpiryDate } from '../src/rules/comment-expiry-date.js';
import { noPlaceholderValues } from '../src/rules/no-placeholder-values.js';
import { noHardcodedConnectionString } from '../src/rules/no-hardcoded-connection-string.js';
import { noDoubleTypeAssertion } from '../src/rules/no-double-type-assertion.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

// ──────────────────────────────────────────────────────────────
// Tester configurations
// ──────────────────────────────────────────────────────────────

const plainJsTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
});

const tsTester = new RuleTester({
    languageOptions: {
        parser: await import('@typescript-eslint/parser'),
    },
});

const jsxTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: { jsx: true },
        },
    },
});

// ──────────────────────────────────────────────────────────────
// Tier A: todo-requires-issue
// ──────────────────────────────────────────────────────────────

plainJsTester.run('todo-requires-issue [plain JS]', todoRequiresIssue, {
    valid: [
        { code: '// TODO: fix after #123 is merged' },
        { code: '// FIXME: https://github.com/org/repo/issues/45' },
        { code: '// NOTE: no tag here, ignored' },
    ],
    invalid: [
        { code: '// TODO: fix the auth flow', errors: [{ messageId: 'missingIssue' }] },
        { code: '/* FIXME: handle this */', errors: [{ messageId: 'missingIssue' }] },
        { code: '// HACK: workaround for now', errors: [{ messageId: 'missingIssue' }] },
    ],
});

tsTester.run('todo-requires-issue [TypeScript]', todoRequiresIssue, {
    valid: [{ code: 'const x: string = "hello" // TODO: GH-10 update later' }],
    invalid: [{ code: '// TODO: refactor types', errors: [{ messageId: 'missingIssue' }] }],
});

jsxTester.run('todo-requires-issue [JSX]', todoRequiresIssue, {
    valid: [{ code: 'const el = <div /> // TODO: #99 fix layout' }],
    invalid: [{ code: 'const el = <div /> // TODO: no ref', errors: [{ messageId: 'missingIssue' }] }],
});

// ──────────────────────────────────────────────────────────────
// Tier A: temp-comment-requires-condition
// ──────────────────────────────────────────────────────────────

plainJsTester.run('temp-comment-requires-condition [plain JS]', tempCommentRequiresCondition, {
    valid: [
        { code: '// TEMP: remove when #45 is merged' },
        { code: '// WIP: remove after v2.0 ships' },
        { code: '// WORKAROUND: see https://github.com/org/repo/issues/100' },
    ],
    invalid: [
        { code: '// TEMP: no condition here', errors: [{ messageId: 'missingCondition' }] },
        { code: '// WORKAROUND: patching upstream', errors: [{ messageId: 'missingCondition' }] },
    ],
});

tsTester.run('temp-comment-requires-condition [TypeScript]', tempCommentRequiresCondition, {
    valid: [{ code: 'type Foo = string // TEMP: remove when #88 lands' }],
    invalid: [{ code: '// WIP: halfway done', errors: [{ messageId: 'missingCondition' }] }],
});

jsxTester.run('temp-comment-requires-condition [JSX]', tempCommentRequiresCondition, {
    valid: [{ code: 'const el = <span /> // TEMP: remove when #12 merged' }],
    invalid: [{ code: '// REMOVE: leftover code', errors: [{ messageId: 'missingCondition' }] }],
});

// ──────────────────────────────────────────────────────────────
// Tier A: comment-expiry-date
// ──────────────────────────────────────────────────────────────

plainJsTester.run('comment-expiry-date [plain JS]', commentExpiryDate, {
    valid: [{ code: '// TODO: no date here, fine' }, { code: '// FIXME: revisit this later' }],
    invalid: [
        {
            code: '// TODO: 2020-01-01 clean up this code',
            errors: [{ messageId: 'expiredDate' }],
        },
        {
            code: '// TEMP: 2021-06-15 remove after migration',
            errors: [{ messageId: 'expiredDate' }],
        },
    ],
});

tsTester.run('comment-expiry-date [TypeScript]', commentExpiryDate, {
    valid: [{ code: '// HACK: no date' }],
    invalid: [
        {
            code: '// TODO: deadline was 2019-03-01',
            errors: [{ messageId: 'expiredDate' }],
        },
    ],
});

jsxTester.run('comment-expiry-date [JSX]', commentExpiryDate, {
    valid: [{ code: 'const el = <div /> // NOTE: no date, not flagged' }],
    invalid: [
        {
            code: '// FIXME: 2022-01-01 stale',
            errors: [{ messageId: 'expiredDate' }],
        },
    ],
});

// ──────────────────────────────────────────────────────────────
// Tier B: no-placeholder-values
// ──────────────────────────────────────────────────────────────

plainJsTester.run('no-placeholder-values [plain JS]', noPlaceholderValues, {
    valid: [
        { code: 'const apiKey = "sk-live-abc123"', filename: 'main.js' },
        { code: 'const x = ""', filename: 'main.js' },
    ],
    invalid: [
        {
            code: 'const key = "your-api-key"',
            filename: 'main.js',
            errors: [{ messageId: 'placeholderValue' }],
        },
        {
            code: 'const secret = "REPLACE_WITH_SECRET"',
            filename: 'main.js',
            errors: [{ messageId: 'placeholderValue' }],
        },
        {
            code: 'const host = "example.com"',
            filename: 'main.js',
            errors: [{ messageId: 'placeholderValue' }],
        },
    ],
});

tsTester.run('no-placeholder-values [TypeScript]', noPlaceholderValues, {
    valid: [{ code: 'const real: string = "actual-value"', filename: 'main.ts' }],
    invalid: [
        {
            code: 'const token: string = "your-token"',
            filename: 'main.ts',
            errors: [{ messageId: 'placeholderValue' }],
        },
    ],
});

jsxTester.run('no-placeholder-values [JSX]', noPlaceholderValues, {
    valid: [{ code: 'const el = <Button label="Submit" />', filename: 'main.jsx' }],
    invalid: [
        {
            code: 'const el = <API key="your-api-key" />',
            filename: 'main.jsx',
            errors: [{ messageId: 'placeholderValue' }],
        },
        {
            code: 'const cfg = { host: "example.com" }',
            filename: 'main.jsx',
            errors: [{ messageId: 'placeholderValue' }],
        },
    ],
});

// ──────────────────────────────────────────────────────────────
// Tier B: no-hardcoded-connection-string
// ──────────────────────────────────────────────────────────────

plainJsTester.run('no-hardcoded-connection-string [plain JS]', noHardcodedConnectionString, {
    valid: [
        { code: 'const url = process.env.DATABASE_URL', filename: 'main.js' },
        { code: 'const url = "mongodb://localhost/mydb"', filename: 'main.js' },
    ],
    invalid: [
        {
            code: 'const url = "mongodb://admin:s3cret@localhost/mydb"',
            filename: 'main.js',
            errors: [{ messageId: 'hardcodedConnectionString' }],
        },
        {
            code: 'const url = "postgresql://user:pass@db.example.com/app"',
            filename: 'main.js',
            errors: [{ messageId: 'hardcodedConnectionString' }],
        },
        {
            code: 'const url = "redis://alice:password@cache.host:6379"',
            filename: 'main.js',
            errors: [{ messageId: 'hardcodedConnectionString' }],
        },
    ],
});

tsTester.run('no-hardcoded-connection-string [TypeScript]', noHardcodedConnectionString, {
    valid: [{ code: 'const url: string = process.env.DB_URL!', filename: 'main.ts' }],
    invalid: [
        {
            code: 'const url = "mysql://root:root@localhost/prod"',
            filename: 'main.ts',
            errors: [{ messageId: 'hardcodedConnectionString' }],
        },
    ],
});

jsxTester.run('no-hardcoded-connection-string [JSX]', noHardcodedConnectionString, {
    valid: [{ code: 'const el = <DB url={process.env.DB_URL} />', filename: 'main.jsx' }],
    invalid: [
        {
            code: 'const el = <DB url="mysql://root:root@localhost/prod" />',
            filename: 'main.jsx',
            errors: [{ messageId: 'hardcodedConnectionString' }],
        },
    ],
});

// ──────────────────────────────────────────────────────────────
// Tier E: no-double-type-assertion — must be silent with plain JS
// (TSAsExpression nodes don't exist outside the TS parser)
// ──────────────────────────────────────────────────────────────

plainJsTester.run('no-double-type-assertion [plain JS — silent]', noDoubleTypeAssertion, {
    valid: [{ code: 'const x = 1' }, { code: 'const y = "hello"' }, { code: 'function foo(x) { return x }' }],
    invalid: [],
});
