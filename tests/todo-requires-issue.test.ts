import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { todoRequiresIssue } from '../src/rules/todo-requires-issue.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: {
        parser: await import('@typescript-eslint/parser'),
    },
});

tester.run('todo-requires-issue', todoRequiresIssue, {
    valid: [
        { code: '// TODO: fix after #123 is merged' },
        { code: '// FIXME: https://github.com/org/repo/issues/45' },
        { code: '// TODO: GH-99 handle edge case' },
        { code: '// NOTE: this is just informational' },
        { code: '// HACK: PROJ-42 workaround for upstream bug' },
        { code: '// This is a regular comment' },
        { code: '/* TODO: see JIRA-100 */' },
        // Custom pattern option
        {
            code: '// TODO: ticket:42 something',
            options: [{ pattern: 'ticket:\\d+' }],
        },
        // eslint-disable-next-line codeanchor/todo-requires-issue
        // Custom tags — only FIXME is enforced, so TODO without ref is fine
        {
            code: '// TODO: no ref here',
            options: [{ tags: ['FIXME'] }],
        },
    ],
    invalid: [
        {
            code: '// TODO: fix the auth flow',
            errors: [{ messageId: 'missingIssue' }],
        },
        {
            code: '// FIXME: handle edge case',
            errors: [{ messageId: 'missingIssue' }],
        },
        {
            code: '// HACK: temporary workaround',
            errors: [{ messageId: 'missingIssue' }],
        },
        {
            code: '/* TODO: this block is broken */',
            errors: [{ messageId: 'missingIssue' }],
        },
        // Multiple violations in one file
        {
            code: `
        // TODO: fix thing A
        const x = 1
        // FIXME: fix thing B
      `,
            errors: [{ messageId: 'missingIssue' }, { messageId: 'missingIssue' }],
        },
    ],
});
