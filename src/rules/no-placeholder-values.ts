import type { Rule } from 'eslint'

const DEFAULT_PATTERNS: RegExp[] = [
  /^your[_\-\s]?api[_\-\s]?key/i,
  /^your[_\-\s]?secret/i,
  /^your[_\-\s]?token/i,
  /^your[_\-\s]?password/i,
  /^replace[_\-]?me$/i,
  /^changeme$/i,
  /^insert[_\-]?here$/i,
  /^INSERT_YOUR_/,
  /^REPLACE_WITH_/,
  /^<your[_\-\s]/i,
  /^<replace/i,
  /^example\.com$/i,
]

function isTestFile(filename: string): boolean {
  return /[./](test|spec)\.[jt]sx?$|[/\\]__tests__[/\\]|[/\\](test|tests|spec|specs)[/\\]/i.test(filename)
}

export const noPlaceholderValues: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Flag placeholder string values left by AI code generation',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          patterns: { type: 'array', items: { type: 'string' } },
          skipTestFiles: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      placeholderValue: 'Value "{{value}}" looks like an AI-inserted placeholder — replace it with a real value.',
    },
  },

  create(context) {
    const options = (context.options[0] ?? {}) as { patterns?: string[]; skipTestFiles?: boolean }
    const skipTests: boolean = options.skipTestFiles ?? true
    const filename: string = ((context as unknown as { filename?: string }).filename) ?? context.getFilename()
    if (skipTests && isTestFile(filename)) return {}

    const extra: RegExp[] = (options.patterns ?? []).map((p) => new RegExp(p, 'i'))
    const allPatterns = [...DEFAULT_PATTERNS, ...extra]

    return {
      Literal(node) {
        if (typeof node.value !== 'string' || node.value.length === 0) return
        if (allPatterns.some((p) => p.test(node.value as string))) {
          context.report({ node, messageId: 'placeholderValue', data: { value: node.value as string } })
        }
      },
    }
  },
}