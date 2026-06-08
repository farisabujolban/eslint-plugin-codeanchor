import { RuleTester } from '@typescript-eslint/rule-tester'
import { afterAll, describe, it } from 'vitest'
import { noResourceLeak } from '../src/rules/no-resource-leak.js'

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parser: await import('@typescript-eslint/parser') },
})

tester.run('no-resource-leak', noResourceLeak, {
  valid: [
    // Explicitly closed
    { code: `function f() { const s = fs.createReadStream('f'); s.close() }` },
    { code: `function f() { const s = fs.createWriteStream('f'); s.destroy() }` },
    { code: `function f() { const srv = http.createServer(fn); srv.close() }` },
    { code: `function f() { const ws = new WebSocket(url); ws.close() }` },
    { code: `function f() { const w = new Worker('./w.js'); w.terminate() }` },
    { code: `function f() { const conn = net.createConnection(opts); conn.end() }` },

    // Returned — caller's responsibility
    { code: `function f() { const s = fs.createReadStream('f'); return s }` },

    // Passed to another function — lifecycle delegated
    { code: `function f() { const s = fs.createReadStream('f'); pipeline(s, dest) }` },
    { code: `function f() { const s = fs.createReadStream('f'); handleStream(s) }` },

    // Lifecycle event registered
    { code: `function f() { const s = fs.createReadStream('f'); s.on('close', cb) }` },
    { code: `function f() { const s = fs.createWriteStream('f'); s.on('finish', cb) }` },

    // Closed inside a nested arrow function (closure cleanup)
    { code: `function f() { const s = fs.createReadStream('f'); setTimeout(() => s.destroy(), 5000) }` },

    // No resource created — unrelated code
    { code: `function f() { const x = doSomething(); x.foo() }` },

    // Top-level (no enclosing function scope) — not tracked
    { code: `const s = fs.createReadStream('f')` },

    // using declaration (explicit resource management)
    { code: `function f() { using s = fs.createReadStream('f') }` },
  ],
  invalid: [
    // No cleanup at all
    {
      code: `function f() { const stream = fs.createReadStream('f') }`,
      errors: [{ messageId: 'resourceLeak' }],
    },
    {
      code: `function f() { const srv = http.createServer(handler) }`,
      errors: [{ messageId: 'resourceLeak' }],
    },
    {
      code: `function f() { const ws = new WebSocket(url) }`,
      errors: [{ messageId: 'resourceLeak' }],
    },
    {
      code: `function f() { const w = new Worker('./worker.js') }`,
      errors: [{ messageId: 'resourceLeak' }],
    },
    {
      code: `function f() { const conn = net.createConnection(opts); doSomethingElse() }`,
      errors: [{ messageId: 'resourceLeak' }],
    },
    // Arrow function
    {
      code: `const f = () => { const s = fs.createWriteStream('out') }`,
      errors: [{ messageId: 'resourceLeak' }],
    },
    // Multiple resources, one leaked
    {
      code: `function f() { const a = fs.createReadStream('a'); const b = fs.createReadStream('b'); a.close() }`,
      errors: [{ messageId: 'resourceLeak' }],
    },
    // Error message includes resource name and creator
    {
      code: `function f() { const myStream = fs.createReadStream('f') }`,
      errors: [{
        messageId: 'resourceLeak',
        data: { name: 'myStream', creator: 'fs.createReadStream' },
      }],
    },
  ],
})