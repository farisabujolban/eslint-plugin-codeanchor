import type { Rule } from 'eslint'
import type { CallExpression, MemberExpression, Node } from 'estree'

function isJsonParse(node: CallExpression): boolean {
  const { callee } = node
  if (callee.type !== 'MemberExpression') return false
  const mem = callee as MemberExpression
  return (
    !mem.computed &&
    mem.object.type === 'Identifier' && (mem.object as { name: string }).name === 'JSON' &&
    mem.property.type === 'Identifier' && (mem.property as { name: string }).name === 'parse'
  )
}

function isInsideTry(node: Node, ancestors: Node[]): boolean {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (ancestors[i].type === 'TryStatement') return true
  }
  return false
}

export const noUnguardedJsonParse: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Require JSON.parse() to be wrapped in a try/catch block.', recommended: true },
    schema: [],
    messages: {
      missingTryCatch: 'JSON.parse() can throw SyntaxError — wrap it in try/catch.',
    },
  },

  create(context) {
    return {
      CallExpression(node: CallExpression) {
        if (!isJsonParse(node)) return
        // Safe to skip: argument is a string literal (compile-time constant)
        if (
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Literal' &&
          typeof (node.arguments[0] as { value: unknown }).value === 'string'
        ) return

        const ancestors: Node[] =
          (context as unknown as { getAncestors?(): Node[] }).getAncestors?.()
          ?? context.sourceCode?.getAncestors?.(node)
          ?? []

        if (isInsideTry(node, ancestors)) return
        context.report({ node, messageId: 'missingTryCatch' })
      },
    }
  },
}
