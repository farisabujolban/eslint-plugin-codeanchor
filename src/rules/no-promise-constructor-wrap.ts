import type { Rule } from 'eslint'
import type {
  NewExpression, ArrowFunctionExpression, FunctionExpression,
  BlockStatement, ExpressionStatement, CallExpression, Identifier,
} from 'estree'

export const noPromiseConstructorWrap: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow wrapping a Promise-returning function call in new Promise() — the outer wrapper is redundant and may swallow rejections.',
      recommended: true,
    },
    schema: [],
    messages: {
      unnecessaryWrapper: 'new Promise(resolve => resolve(fn())) is redundant — fn() already returns a Promise. Return fn() directly.',
    },
  },

  create(context) {
    return {
      NewExpression(node: NewExpression) {
        if (node.callee.type !== 'Identifier') return
        if ((node.callee as Identifier).name !== 'Promise') return
        if (node.arguments.length < 1) return

        const executor = node.arguments[0]
        if (executor.type !== 'ArrowFunctionExpression' && executor.type !== 'FunctionExpression') return

        const cb = executor as ArrowFunctionExpression | FunctionExpression
        if (cb.params.length < 1) return
        const resolveParam = cb.params[0]
        if (resolveParam.type !== 'Identifier') return
        const resolveName = (resolveParam as Identifier).name

        // Find the single call expression in the executor
        let singleCall: CallExpression | null = null

        if (cb.body.type === 'BlockStatement') {
          const block = cb.body as BlockStatement
          if (block.body.length !== 1) return // Multiple statements = doing real work
          const stmt = block.body[0]
          if (stmt.type !== 'ExpressionStatement') return
          const expr = (stmt as ExpressionStatement).expression
          if (expr.type !== 'CallExpression') return
          singleCall = expr as CallExpression
        } else if (cb.body.type === 'CallExpression') {
          // Arrow expression body: resolve => resolve(fn())
          singleCall = cb.body as CallExpression
        }

        if (!singleCall) return

        // The single call must be to the resolve parameter
        if (singleCall.callee.type !== 'Identifier') return
        if ((singleCall.callee as Identifier).name !== resolveName) return

        // The argument to resolve() must itself be a CallExpression (another function call)
        if (singleCall.arguments.length < 1) return
        if (singleCall.arguments[0].type !== 'CallExpression') return

        context.report({ node, messageId: 'unnecessaryWrapper' })
      },
    }
  },
}
