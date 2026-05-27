import { RuleTester } from '@typescript-eslint/rule-tester'
import { afterAll, describe, it } from 'vitest'
import { commentExpiryDate } from '../src/rules/comment-expiry-date.js'

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: {
    parser: await import('@typescript-eslint/parser'),
  },
})

tester.run('comment-expiry-date', commentExpiryDate, {
  valid: [
    { code: '// TODO: revisit this when the API stabilizes' },
    { code: '// NOTE: historical date 2000-01-01 is okay without a configured keyword' },
    {
      code: '// TODO: past date is ignored when TODO is not configured 2000-01-01',
      options: [{ keywords: ['FIXME'] }],
    },
  ],
  invalid: [
    {
      code: '// TODO: revisit this by 2999-01-01',
      errors: [{ messageId: 'farFutureDate' }],
    },
    {
      code: '/* WORKAROUND: remove after 2999-01-01 */',
      errors: [{ messageId: 'farFutureDate' }],
    },
    {
      code: '// CLEANUP: remove after 2999-01-01',
      options: [{ keywords: ['CLEANUP'] }],
      errors: [{ messageId: 'farFutureDate' }],
    },
    {
      code: '// TODO: remove after 2000-01-01',
      errors: [{ messageId: 'expiredDate' }],
    },
    {
      code: '// TEMP: keep until 2000-01-01',
      errors: [{ messageId: 'expiredDate' }],
    },
    {
      code: '/* WORKAROUND: legacy path expires 2000-01-01 */',
      errors: [{ messageId: 'expiredDate' }],
    },
    {
      code: '// CLEANUP: remove after 2000-01-01',
      options: [{ keywords: ['CLEANUP'] }],
      errors: [{ messageId: 'expiredDate' }],
    },
    {
      code: `
        // TODO: first deadline 2000-01-01
        const x = 1
        // FIXME: second deadline 2001-01-01
      `,
      errors: [{ messageId: 'expiredDate' }, { messageId: 'expiredDate' }],
    },
    {
      code: '// HACK: temp shim, remove after 2000-01-01',
      errors: [{ messageId: 'expiredDate' }],
    },
    {
      code: '// REMOVE: dead code expires 2000-01-01',
      errors: [{ messageId: 'expiredDate' }],
    },
  ],
})
