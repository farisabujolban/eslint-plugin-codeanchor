import { RuleTester } from '@typescript-eslint/rule-tester'
import { afterAll, describe, it } from 'vitest'
import { noPromiseConstructorWrap } from '../src/rules/no-promise-constructor-wrap.js'

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parser: await import('@typescript-eslint/parser') },
})

tester.run('no-promise-constructor-wrap', noPromiseConstructorWrap, {
  valid: [
    // Multiple statements — doing real work (promisifying a callback)
    { code: `new Promise((resolve, reject) => { cb((err, val) => err ? reject(err) : resolve(val)) })` },
    // Resolving a literal
    { code: `new Promise(resolve => resolve(42))` },
    // Two statements
    { code: `new Promise((resolve) => { doSetup(); resolve(42) })` },
    // resolve gets a non-call value
    { code: `new Promise(resolve => resolve(someVariable))` },
  ],
  invalid: [
    {
      code: `new Promise(resolve => resolve(fetchUser(id)))`,
      errors: [{ messageId: 'unnecessaryWrapper' }],
    },
    {
      code: `new Promise((resolve) => { resolve(apiClient.get('/users')) })`,
      errors: [{ messageId: 'unnecessaryWrapper' }],
    },
    {
      code: `return new Promise(resolve => resolve(db.query(sql)))`,
      errors: [{ messageId: 'unnecessaryWrapper' }],
    },
  ],
})
