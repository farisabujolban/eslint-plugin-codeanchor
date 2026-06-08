import type { Rule } from 'eslint'
import type { Node, VariableDeclarator, CallExpression, NewExpression, Identifier, MemberExpression } from 'estree'

// resource-creating call patterns: object.method or new Constructor
const RESOURCE_CREATORS: Record<string, string> = {
  'fs.createReadStream': 'fs.createReadStream',
  'fs.createWriteStream': 'fs.createWriteStream',
  'fs.open': 'fs.open',
  'net.createServer': 'net.createServer',
  'net.createConnection': 'net.createConnection',
  'http.createServer': 'http.createServer',
  'https.createServer': 'https.createServer',
}
const RESOURCE_CONSTRUCTORS = new Set(['Worker', 'WebSocket'])

// methods that release a resource
const CLEANUP_METHODS = new Set(['close', 'destroy', 'end', 'terminate', 'disconnect', 'unref'])
// event names that indicate a resource is being managed
const LIFECYCLE_EVENTS = new Set(['close', 'finish', 'end', 'error'])

interface ScopeFrame {
  resourceVars: Map<string, Node>   // varName → declarator node
  resourceTypes: Map<string, string> // varName → creator label
  cleanedVars: Set<string>
}

function isResourceCreatorCall(node: CallExpression | NewExpression): string | null {
  if (node.type === 'NewExpression' && node.callee.type === 'Identifier') {
    const name = (node.callee as Identifier).name
    if (RESOURCE_CONSTRUCTORS.has(name)) return `new ${name}`
  }
  if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
    const mem = node.callee as MemberExpression
    if (mem.computed || mem.property.type !== 'Identifier') return null
    const obj = mem.object.type === 'Identifier' ? (mem.object as Identifier).name : null
    const method = (mem.property as Identifier).name
    if (obj) {
      const key = `${obj}.${method}`
      return RESOURCE_CREATORS[key] ?? null
    }
  }
  return null
}

export const noResourceLeak: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require resources (streams, servers, workers, sockets) to be explicitly closed or destroyed ' +
        'in the same function they are created (ISO 5055 Reliability, CWE-772).',
      recommended: true,
    },
    schema: [],
    messages: {
      resourceLeak:
        '"{{name}}" ({{creator}}) is created but never closed in this function. ' +
        'Call .close(), .destroy(), or .end() to prevent a resource leak (CWE-772).',
    },
  },

  create(context) {
    const scopeStack: ScopeFrame[] = []

    function enterScope(): void {
      scopeStack.push({
        resourceVars: new Map(),
        resourceTypes: new Map(),
        cleanedVars: new Set(),
      })
    }

    function exitScope(): void {
      const frame = scopeStack.pop()
      if (!frame) return
      for (const [name, declNode] of frame.resourceVars) {
        if (!frame.cleanedVars.has(name)) {
          context.report({
            node: declNode,
            messageId: 'resourceLeak',
            data: { name, creator: frame.resourceTypes.get(name) ?? 'resource' },
          })
        }
      }
    }

    // Mark a variable name as cleaned, searching up the scope stack to handle closures
    function markCleaned(name: string): void {
      for (let k = scopeStack.length - 1; k >= 0; k--) {
        if (scopeStack[k].resourceVars.has(name)) {
          scopeStack[k].cleanedVars.add(name)
          break
        }
      }
    }

    return {
      FunctionDeclaration: enterScope,
      'FunctionDeclaration:exit': exitScope,
      FunctionExpression: enterScope,
      'FunctionExpression:exit': exitScope,
      ArrowFunctionExpression: enterScope,
      'ArrowFunctionExpression:exit': exitScope,

      VariableDeclarator(node: VariableDeclarator) {
        if (!node.init) return
        if (node.id.type !== 'Identifier') return

        const frame = scopeStack[scopeStack.length - 1]
        if (!frame) return

        // Skip `using x = ...` (ES2022 explicit resource management)
        const parent = (node as Node & { parent?: { kind?: string } }).parent
        if (parent?.kind === 'using') return

        const init = node.init as CallExpression | NewExpression
        if (init.type !== 'CallExpression' && init.type !== 'NewExpression') return

        const creator = isResourceCreatorCall(init)
        if (!creator) return

        const name = (node.id as Identifier).name
        frame.resourceVars.set(name, node)
        frame.resourceTypes.set(name, creator)
      },

      CallExpression(node: CallExpression) {
        // Cleanup method: stream.close(), srv.destroy(), ws.end(), etc.
        if (node.callee.type === 'MemberExpression') {
          const mem = node.callee as MemberExpression
          if (!mem.computed && mem.property.type === 'Identifier') {
            const method = (mem.property as Identifier).name
            if (mem.object.type === 'Identifier') {
              const objName = (mem.object as Identifier).name
              if (CLEANUP_METHODS.has(method)) {
                markCleaned(objName)
              }
              // stream.on('close', ...) or stream.on('finish', ...) — lifecycle managed via event
              if (method === 'on' || method === 'once') {
                const firstArg = node.arguments[0]
                if (
                  firstArg &&
                  firstArg.type === 'Literal' &&
                  typeof (firstArg as { value?: unknown }).value === 'string' &&
                  LIFECYCLE_EVENTS.has((firstArg as { value: string }).value)
                ) {
                  markCleaned(objName)
                }
              }
            }
          }
        }

        // Resource var passed as argument: lifecycle delegated to callee
        for (const arg of node.arguments) {
          if (arg.type === 'Identifier') {
            markCleaned((arg as Identifier).name)
          }
        }
      },

      ReturnStatement(node) {
        if (node.argument?.type === 'Identifier') {
          markCleaned((node.argument as Identifier).name)
        }
      },
    }
  },
}