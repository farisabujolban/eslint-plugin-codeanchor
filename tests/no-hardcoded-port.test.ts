import { RuleTester } from '@typescript-eslint/rule-tester'
import { afterAll, describe, it } from 'vitest'
import { noHardcodedPort } from '../src/rules/no-hardcoded-port.js'

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parser: await import('@typescript-eslint/parser') },
})

tester.run('no-hardcoded-port', noHardcodedPort, {
  valid: [
    { code: `app.listen(process.env.PORT)` },
    { code: `app.listen(PORT)` },
    { code: `doSomething(3000)` },
    { code: `app.listen(3000)`, options: [{ allow: [3000] }] },
  ],
  invalid: [
    {
      code: `app.listen(3000)`,
      errors: [{ messageId: 'hardcodedPort' }],
    },
    {
      code: `server.listen(8080)`,
      errors: [{ messageId: 'hardcodedPort' }],
    },
    {
      code: `app.listen({ port: 4000 })`,
      errors: [{ messageId: 'hardcodedPort' }],
    },
  ],
})