import { RuleTester } from '@typescript-eslint/rule-tester'
import { afterAll, describe, it } from 'vitest'
import { noDoubleTypeAssertion } from '../src/rules/no-double-type-assertion.js'

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parser: await import('@typescript-eslint/parser') },
})

tester.run('no-double-type-assertion', noDoubleTypeAssertion, {
  valid: [
    { code: `const x = response as MyType` },
    { code: `const x = response as unknown` },
    { code: `const x = response as string` },
  ],
  invalid: [
    {
      code: `const x = response as unknown as MyType`,
      errors: [{ messageId: 'doubleAssertion' }],
    },
    {
      code: `const result = (getData() as unknown as ReturnType<typeof getData>)`,
      errors: [{ messageId: 'doubleAssertion' }],
    },
  ],
})