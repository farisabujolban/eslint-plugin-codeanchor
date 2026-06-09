import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { tempCommentRequiresCondition } from '../src/rules/temp-comment-requires-condition.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: {
        parser: await import('@typescript-eslint/parser'),
    },
});

tester.run('temp-comment-requires-condition', tempCommentRequiresCondition, {
    valid: [
        { code: '// TEMP: remove after #45 is merged' },
        { code: '// WORKAROUND: https://github.com/org/repo/issues/99' },
        { code: '// WIP: remove once auth refactor is done' },
        { code: '// TEMPORARY: delete after v2.0 ships' },
        { code: '// REMOVE: remove when PROJ-10 is closed' },
        // requireIssue: true with an actual issue ref
        {
            code: '// TEMP: see #88',
            options: [{ requireIssue: true }],
        },
        // eslint-disable-next-line codeanchor/temp-comment-requires-condition
        // Custom keywords — TEMP not in the list so no error
        {
            code: '// TEMP: no condition here',
            options: [{ keywords: ['HACK'] }],
        },
        // Regular comment — not a trigger keyword
        { code: '// This is a regular comment' },
    ],
    invalid: [
        {
            code: '// TEMP: skip validation',
            errors: [{ messageId: 'missingCondition' }],
        },
        {
            code: '// WORKAROUND: not sure why needed',
            errors: [{ messageId: 'missingCondition' }],
        },
        {
            code: '// WIP: still working on it',
            errors: [{ messageId: 'missingCondition' }],
        },
        // requireIssue: true but only has a phrase condition (no issue ref)
        {
            code: '// TEMP: remove once done',
            options: [{ requireIssue: true }],
            errors: [{ messageId: 'missingIssue' }],
        },
        {
            code: '/* WORKAROUND: no condition here */',
            errors: [{ messageId: 'missingCondition' }],
        },
    ],
});
