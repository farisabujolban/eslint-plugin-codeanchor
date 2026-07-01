import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noTemplateLiteralInSql } from '../src/rules/no-template-literal-in-sql.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-template-literal-in-sql', noTemplateLiteralInSql, {
    valid: [
        { code: `db.query('SELECT * FROM users WHERE id = $1', [id])` },
        { code: `db.query(\`SELECT * FROM users\`)` }, // template with no expressions is safe
        { code: `const s = \`SELECT \${col} FROM t\`` }, // not a SQL method call
        { code: `logger.info(\`query: \${sql}\`)` }, // not a SQL method
        { code: `client.connect()` },
        { code: `db.query('SELECT 1')` },
        { code: `pool.end()` },
    ],
    invalid: [
        {
            code: `db.query(\`SELECT * FROM users WHERE id = \${id}\`)`,
            errors: [{ messageId: 'templateInSql' }],
        },
        {
            code: `pool.query(\`SELECT * FROM \${table}\`)`,
            errors: [{ messageId: 'templateInSql' }],
        },
        {
            code: `client.execute(\`INSERT INTO logs VALUES (\${val})\`)`,
            errors: [{ messageId: 'templateInSql' }],
        },
        {
            code: `knex.raw(\`UPDATE \${table} SET x = \${v}\`)`,
            errors: [{ messageId: 'templateInSql' }],
        },
        {
            code: `conn.run(\`DELETE FROM \${tableName} WHERE id = \${id}\`)`,
            errors: [{ messageId: 'templateInSql' }],
        },
        {
            code: `db.prepare(\`SELECT * FROM \${table} LIMIT \${n}\`)`,
            errors: [{ messageId: 'templateInSql' }],
        },
    ],
});
