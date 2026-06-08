import type { Rule } from 'eslint'
import type { CallExpression, MemberExpression, Identifier } from 'estree'

// Bare global calls that are side effects
const SIDE_EFFECT_GLOBALS = new Set(['fetch', 'setTimeout', 'setInterval', 'setImmediate', 'clearTimeout', 'clearInterval'])

// Object.method side-effect patterns
const SIDE_EFFECT_METHODS: Array<{ object: string; methods: Set<string> }> = [
  { object: 'fs', methods: new Set(['readFile', 'readFileSync', 'writeFile', 'writeFileSync', 'appendFile', 'appendFileSync', 'open', 'openSync', 'unlink', 'unlinkSync']) },
  { object: 'axios', methods: new Set(['get', 'post', 'put', 'patch', 'delete', 'request', 'head']) },
  { object: 'http', methods: new Set(['get', 'request', 'createServer']) },
  { object: 'https', methods: new Set(['get', 'request']) },
]

// .on/.once/.addEventListener on anything other than process
const EVENT_LISTENER_METHODS = new Set(['on', 'once', 'addEventListener', 'addListener'])
const EXEMPT_OBJECTS = new Set(['process'])

function detectSideEffect(node: CallExpression): string | null {
  const { callee } = node

  if (callee.type === 'Identifier') {
    const name = (callee as Identifier).name
    if (SIDE_EFFECT_GLOBALS.has(name)) return name
  }

  if (callee.type === 'MemberExpression') {
    const mem = callee as MemberExpression
    if (mem.computed || mem.property.type !== 'Identifier') return null
    const method = (mem.property as Identifier).name

    // Event listener subscription (except process.on etc.)
    if (EVENT_LISTENER_METHODS.has(method)) {
      const objName = mem.object.type === 'Identifier' ? (mem.object as Identifier).name : null
      if (objName && EXEMPT_OBJECTS.has(objName)) return null
      return `${objName ? objName + '.' : ''}${method}()`
    }

    // fs.readFile, axios.get, etc.
    if (mem.object.type === 'Identifier') {
      const obj = (mem.object as Identifier).name
      for (const { object, methods } of SIDE_EFFECT_METHODS) {
        if (obj === object && methods.has(method)) return `${obj}.${method}()`
      }
    }
  }

  return null
}

export const noConstructorSideEffect: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow side effects (network calls, file I/O, timers, event listeners) directly in class constructors — they make classes untestable and can cause memory leaks.',
      recommended: true,
    },
    schema: [],
    messages: {
      constructorSideEffect: 'Avoid "{{callName}}" directly in a constructor. Move side effects to an async init() method or a factory function.',
    },
  },

  create(context) {
    // 0 = not in constructor; 1 = inside constructor's own function body; 2+ = nested function
    let constructorDepth = 0

    return {
      'MethodDefinition[kind="constructor"]'() {
        constructorDepth = 1
      },
      'MethodDefinition[kind="constructor"]:exit'() {
        constructorDepth = 0
      },

      // Track nested functions so we don't flag deferred side effects
      ':function'() {
        if (constructorDepth > 0) constructorDepth++
      },
      ':function:exit'() {
        if (constructorDepth > 1) constructorDepth--
      },

      CallExpression(node: CallExpression) {
        // Only flag calls directly in the constructor body (depth 2 = constructor's own FunctionExpression)
        if (constructorDepth !== 2) return
        const callName = detectSideEffect(node)
        if (callName) context.report({ node, messageId: 'constructorSideEffect', data: { callName } })
      },
    }
  },
}
