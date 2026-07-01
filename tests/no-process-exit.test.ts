import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noProcessExit } from '../src/rules/no-process-exit.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-process-exit', noProcessExit, {
    valid: [
        { code: `process.exit(1)`, filename: '/project/src/cli.ts' },
        { code: `process.exit(0)`, filename: '/project/bin/index.ts' },
        { code: `process.exit(1)`, filename: '/project/bin/start.js' },
        { code: `process.exit(0)`, filename: '/project/bin/server.mts' },
        { code: `process.exit(1)`, filename: '/project/src/cli.js' },
        { code: `if (err) { process.exit(1) }`, filename: '/project/bin/run.ts' },
        // Not a process.exit call
        { code: `myProcess.exit(1)`, filename: '/project/src/middleware/auth.ts' },
        { code: `process.stdout.write('hello')`, filename: '/project/src/utils/logger.ts' },
    ],
    invalid: [
        {
            code: `process.exit(1)`,
            filename: '/project/src/middleware/auth.ts',
            errors: [{ messageId: 'noProcessExit' }],
        },
        {
            code: `if (err) process.exit(1)`,
            filename: '/project/src/utils/db.ts',
            errors: [{ messageId: 'noProcessExit' }],
        },
        {
            code: `process.exit(0)`,
            filename: '/project/src/server.ts',
            errors: [{ messageId: 'noProcessExit' }],
        },
        {
            code: `function shutdown() { process.exit(1) }`,
            filename: '/project/src/app.ts',
            errors: [{ messageId: 'noProcessExit' }],
        },
    ],
});
