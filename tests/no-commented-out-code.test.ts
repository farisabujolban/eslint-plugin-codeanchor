import { RuleTester } from '@typescript-eslint/rule-tester'
import { afterAll, describe, it } from 'vitest'
import { noCommentedOutCode } from '../src/rules/no-commented-out-code.js'

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: {
    parser: await import('@typescript-eslint/parser'),
  },
})

tester.run('no-commented-out-code', noCommentedOutCode, {
  valid: [
    { code: '// This function handles authentication and token refresh.' },
    { code: '// See RFC 7519 for JWT specification details.' },
    { code: '// Returns the user or null if not found.' },
    { code: '// Note: this value is set by the build process.' },
    // Below threshold: only 1/3 lines match
    {
      code: `
// get the user
// const x = 1
// then check
      `,
      options: [{ threshold: 0.6 }],
    },
    // Multi-line block below threshold: only 1 of 3 lines matches (~0.33 < 0.6)
    {
      code: `
// This is a plain prose comment.
// const x = 1
// No code here at all.
      `,
      options: [{ threshold: 0.6 }],
    },
  ],
  invalid: [
    {
      code: `
// const user = await getUser(id)
// if (!user) throw new Error('not found')
// return user
      `,
      errors: [{ messageId: 'commentedOutCode' }],
    },
    {
      code: `
// import { db } from './database'
// export default db.query
      `,
      errors: [{ messageId: 'commentedOutCode' }],
    },
    // Block comment with code
    {
      code: `
/*
  const x = getValue()
  return x.toString()
*/
      `,
      errors: [{ messageId: 'commentedOutCode' }],
    },
    // Arrow function
    {
      code: '// const fn = (x) => x * 2',
      errors: [{ messageId: 'commentedOutCode' }],
    },
    // Lower threshold catches single lines
    {
      code: '// const x = 1',
      options: [{ threshold: 0.5 }],
      errors: [{ messageId: 'commentedOutCode' }],
    },
  ],
})
