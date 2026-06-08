import { RuleTester } from '@typescript-eslint/rule-tester'
import { afterAll, describe, it } from 'vitest'
import { noObjectSpreadAccumulator } from '../src/rules/no-object-spread-accumulator.js'

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parser: await import('@typescript-eslint/parser') },
})

tester.run('no-object-spread-accumulator', noObjectSpreadAccumulator, {
  valid: [
    { code: `items.reduce((acc, x) => Object.assign(acc, { [x.id]: x }), {})` },
    { code: `items.reduce((acc, x) => { acc[x.id] = x; return acc }, {})` },
    // Spreading something OTHER than the accumulator — fine
    { code: `items.reduce((acc, x) => ({ ...x, extra: 1 }), {})` },
    // Not a reduce call
    { code: `items.map(x => ({ ...x, extra: 1 }))` },
    // Spread in non-reduce method
    { code: `[].filter(x => ({ ...x }))` },
  ],
  invalid: [
    {
      code: `items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})`,
      errors: [{ messageId: 'spreadAccumulator' }],
    },
    {
      code: `items.reduce((acc, x) => { return { ...acc, [x.k]: x.v } }, {})`,
      errors: [{ messageId: 'spreadAccumulator' }],
    },
    {
      code: `list.reduce((result, entry) => ({ ...result, [entry.key]: entry.value }), {})`,
      errors: [{ messageId: 'spreadAccumulator' }],
    },
  ],
})
