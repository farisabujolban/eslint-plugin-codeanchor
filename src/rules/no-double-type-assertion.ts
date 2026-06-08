import type { Rule } from 'eslint'
import type { CodeAnchorRule } from '../types.js'

export const noDoubleTypeAssertion: CodeAnchorRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Flag "as unknown as T" double type assertions that bypass TypeScript\'s type checker',
      recommended: true,
      languages: ['typescript'],
    },
    schema: [],
    messages: {
      doubleAssertion: 'Avoid "as unknown as {{type}}" — this bypasses TypeScript\'s type checker. Fix the underlying types instead.',
    },
  },

  create(context) {
    return {
      // TSAsExpression is a TypeScript-specific AST node; only fires with @typescript-eslint/parser
      TSAsExpression(node: Rule.Node) {
        const n = node as unknown as {
          expression: { type: string; typeAnnotation?: { type: string } }
          typeAnnotation: unknown
        }
        if (
          n.expression.type === 'TSAsExpression' &&
          n.expression.typeAnnotation?.type === 'TSUnknownKeyword'
        ) {
          const outerType = context.sourceCode.getText(n.typeAnnotation as Rule.Node)
          context.report({ node, messageId: 'doubleAssertion', data: { type: outerType } })
        }
      },
    }
  },
}