import type { Rule } from 'eslint'
import { normalizeCommentText, extractKeyword, hasIssueReference } from '../util/comment-text.js'

interface Options {
  keywords?: string[]
  requireIssue?: boolean
}

const DEFAULT_KEYWORDS = ['TEMP', 'TEMPORARY', 'WORKAROUND', 'WIP', 'REMOVE']

// Phrases that count as a removal condition when requireIssue is false
const CONDITION_RE = /remove\s+when|remove\s+after|delete\s+after|once\s+\w|after\s+v\d|20\d{2}-\d{2}/i

export const tempCommentRequiresCondition: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require temporary/workaround comments to include an issue reference or removal condition',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          keywords: {
            type: 'array',
            items: { type: 'string' },
            description: 'Keywords that mark a comment as temporary (default: TEMP, TEMPORARY, WORKAROUND, WIP, REMOVE)',
          },
          requireIssue: {
            type: 'boolean',
            description: 'When true, a URL or issue ref is required (stricter than a condition phrase)',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingCondition:
        '{{keyword}} comment must specify when it should be removed (issue reference or removal condition).',
      missingIssue:
        '{{keyword}} comment must include an issue reference (#123, GH-123, PROJ-123, or a URL).',
    },
  },

  create(context) {
    const options: Options = context.options[0] ?? {}
    const keywords = options.keywords ?? DEFAULT_KEYWORDS
    const requireIssue = options.requireIssue ?? false

    function hasRemovalCondition(text: string): boolean {
      if (hasIssueReference(text)) return true
      if (!requireIssue && CONDITION_RE.test(text)) return true
      return false
    }

    return {
      Program() {
        const comments = context.sourceCode.getAllComments()
        for (const comment of comments) {
          const text = normalizeCommentText(comment.value)
          const keyword = extractKeyword(text, keywords)
          if (!keyword) continue
          if (hasRemovalCondition(text)) continue
          context.report({
            loc: comment.loc!,
            messageId: requireIssue ? 'missingIssue' : 'missingCondition',
            data: { keyword },
          })
        }
      },
    }
  },
}
