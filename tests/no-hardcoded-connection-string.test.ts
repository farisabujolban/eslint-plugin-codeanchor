import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noHardcodedConnectionString } from '../src/rules/no-hardcoded-connection-string.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-hardcoded-connection-string', noHardcodedConnectionString, {
    valid: [
        { code: `const url = process.env.DATABASE_URL` },
        { code: `const url = 'mongodb://localhost:27017/mydb'` },
        { code: `const url = 'postgresql://localhost/mydb'` },
    ],
    invalid: [
        {
            code: `const url = 'mongodb://user:secret@host/db'`,
            errors: [{ messageId: 'hardcodedConnectionString' }],
        },
        {
            code: `const db = 'postgresql://admin:pass123@db.example.com/mydb'`,
            errors: [{ messageId: 'hardcodedConnectionString' }],
        },
        {
            code: `const r = 'redis://user:pass@localhost:6379'`,
            errors: [{ messageId: 'hardcodedConnectionString' }],
        },
        {
            code: `const q = 'amqp://guest:guest@rabbitmq:5672'`,
            errors: [{ messageId: 'hardcodedConnectionString' }],
        },
    ],
});
