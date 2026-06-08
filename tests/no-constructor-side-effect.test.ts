import { RuleTester } from '@typescript-eslint/rule-tester'
import { afterAll, describe, it } from 'vitest'
import { noConstructorSideEffect } from '../src/rules/no-constructor-side-effect.js'

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parser: await import('@typescript-eslint/parser') },
})

tester.run('no-constructor-side-effect', noConstructorSideEffect, {
  valid: [
    // Only assignments — no side effects
    { code: `class A { constructor() { this.x = 1 } }` },
    // process.on is exempt
    { code: `class A { constructor() { process.on('exit', () => {}) } }` },
    // Side effect deferred in nested arrow — not immediate
    { code: `class A { constructor() { this.init = () => fetch('/api') } }` },
    // Side effect deferred in method call
    { code: `class A { constructor() { this.start = function() { setTimeout(() => {}, 1000) } } }` },
    // No side effects at all
    { code: `class A { constructor(name) { this.name = name; this.items = [] } }` },
  ],
  invalid: [
    {
      code: `class A { constructor() { fetch('/api') } }`,
      errors: [{ messageId: 'constructorSideEffect' }],
    },
    {
      code: `class A { constructor() { setTimeout(() => {}, 1000) } }`,
      errors: [{ messageId: 'constructorSideEffect' }],
    },
    {
      code: `class A { constructor() { fs.readFileSync('config.json') } }`,
      errors: [{ messageId: 'constructorSideEffect' }],
    },
    {
      code: `class A { constructor() { emitter.on('data', this.handler) } }`,
      errors: [{ messageId: 'constructorSideEffect' }],
    },
    {
      code: `class A { constructor() { setInterval(() => this.poll(), 5000) } }`,
      errors: [{ messageId: 'constructorSideEffect' }],
    },
  ],
})
