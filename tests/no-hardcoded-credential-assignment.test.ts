import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noHardcodedCredentialAssignment } from '../src/rules/no-hardcoded-credential-assignment.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-hardcoded-credential-assignment', noHardcodedCredentialAssignment, {
    valid: [
        { code: `const password = process.env.PASSWORD` },
        { code: `const password = ""` },
        { code: `const username = "admin"` },
        { code: `const config = { host: "localhost" }` },
        // test file skipped
        { code: `const password = "hunter2"`, filename: 'src/auth.test.ts' },
    ],
    invalid: [
        {
            code: `const password = "hunter2"`,
            errors: [{ messageId: 'hardcodedCredential' }],
        },
        {
            code: `const apiKey = "sk-abc123"`,
            errors: [{ messageId: 'hardcodedCredential' }],
        },
        {
            code: `const secret = "mysecret"`,
            errors: [{ messageId: 'hardcodedCredential' }],
        },
        {
            code: `const config = { password: "letmein" }`,
            errors: [{ messageId: 'hardcodedCredential' }],
        },
        {
            code: `const config = { token: "abc123" }`,
            errors: [{ messageId: 'hardcodedCredential' }],
        },
    ],
});
