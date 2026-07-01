import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noOpenRedirect } from '../src/rules/no-open-redirect.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-open-redirect', noOpenRedirect, {
    valid: [
        { code: `res.redirect('/dashboard')` },
        { code: `res.redirect('https://example.com')` },
        { code: `res.redirect(302, '/home')` },
        { code: `res.redirect(config.loginUrl)` },
        { code: `res.redirect(getRedirectUrl())` },
        { code: `router.navigate(['/home'])` }, // not a redirect call
        { code: `res.send(req.query.data)` }, // not redirect
    ],
    invalid: [
        {
            code: `res.redirect(req.query.returnUrl)`,
            errors: [{ messageId: 'openRedirect' }],
        },
        {
            code: `res.redirect(req.body.redirectTo)`,
            errors: [{ messageId: 'openRedirect' }],
        },
        {
            code: `res.redirect(req.params.url)`,
            errors: [{ messageId: 'openRedirect' }],
        },
        {
            code: `res.redirect(\`/app\${req.query.path}\`)`,
            errors: [{ messageId: 'openRedirect' }],
        },
        {
            code: `response.redirect(req.query.next)`,
            errors: [{ messageId: 'openRedirect' }],
        },
        {
            code: `reply.redirect(request.query.url)`,
            errors: [{ messageId: 'openRedirect' }],
        },
    ],
});
