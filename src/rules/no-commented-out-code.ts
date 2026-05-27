import type { Rule } from 'eslint'
import type { SourceLocation } from 'estree'

interface Options {
  threshold?: number
}

// Each heuristic returns true if the line looks like code
const CODE_HEURISTICS: Array<(line: string) => boolean> = [
  // import ... from (anywhere in line is fine — rare in prose)
  (l) => /\bimport\b.+\bfrom\b/.test(l),
  // keyword must be at the start of the trimmed line to avoid matching prose like "This function..."
  (l) => /^(const|let|var|function|class|return|throw|export)\b/.test(l),
  (l) => /[;{}]\s*$/.test(l),
  (l) => /=>/.test(l),
  (l) => /\w+\.\w+\(/.test(l),
  (l) => /\w+\s*=\s*(new\s+\w|[{['"`\d])/.test(l),
]

function looksLikeCode(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  return CODE_HEURISTICS.some((h) => h(trimmed))
}

function codeLineRatio(commentText: string): number {
  const lines = commentText.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return 0
  const codeLines = lines.filter(looksLikeCode).length
  return codeLines / lines.length
}

export const noCommentedOutCode: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn on comment blocks that appear to contain commented-out code',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'Fraction of lines that must match code heuristics to trigger (default 0.5)',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      commentedOutCode:
        'This comment block appears to contain commented-out code. Remove or restore it.',
    },
  },

  create(context) {
    const options: Options = context.options[0] ?? {}
    const threshold = options.threshold ?? 0.5

    return {
      Program() {
        const comments = context.sourceCode.getAllComments()

        // Group consecutive line comments into blocks so multi-line // blocks
        // are evaluated together rather than line-by-line.
        const blocks: Array<{ text: string; loc: SourceLocation }> = []
        let i = 0
        while (i < comments.length) {
          const c = comments[i]
          if (c.type === 'Line') {
            // Collect consecutive line comments (same or adjacent lines)
            let j = i + 1
            let combinedText = c.value
            while (j < comments.length) {
              const next = comments[j]
              if (next.type !== 'Line') break
              const prevLine = comments[j - 1].loc!.end.line
              if (next.loc!.start.line > prevLine + 1) break
              combinedText += '\n' + next.value
              j++
            }
            blocks.push({ text: combinedText, loc: c.loc! })
            i = j
          } else {
            // Block comment — evaluate as-is
            blocks.push({ text: c.value, loc: c.loc! })
            i++
          }
        }

        for (const block of blocks) {
          if (codeLineRatio(block.text) >= threshold) {
            context.report({ loc: block.loc, messageId: 'commentedOutCode' })
          }
        }
      },
    }
  },
}
