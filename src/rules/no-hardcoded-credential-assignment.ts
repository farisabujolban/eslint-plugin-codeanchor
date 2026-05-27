import type { Rule } from 'eslint'

const CREDENTIAL_RE = /^(password|passwd|secret|api[_-]?key|apikey|token|auth[_-]?token|private[_-]?key|access[_-]?key|client[_-]?secret|db[_-]?pass(word)?|database[_-]?pass(word)?)$/i

function isCredentialName(name: string): boolean {
  return CREDENTIAL_RE.test(name)
}

function isNonEmptyStringLiteral(node: unknown): boolean {
  const n = node as { type?: string; value?: unknown } | null | undefined
  return n?.type === 'Literal' && typeof n.value === 'string' && (n.value as string).length > 0
}

function isTestFile(filename: string): boolean {
  return /[./](test|spec)\.[jt]sx?$|[/\\]__tests__[/\\]|[/\\](test|tests|spec|specs)[/\\]/i.test(filename)
}

export const noHardcodedCredentialAssignment: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Flag hardcoded string values assigned to credential-named variables',
      recommended: true,
    },
    schema: [],
    messages: {
      hardcodedCredential: '"{{name}}" has a hardcoded string value. Use an environment variable instead.',
    },
  },

  create(context) {
    const filename: string = ((context as unknown as { filename?: string }).filename) ?? context.getFilename()
    if (isTestFile(filename)) return {}

    return {
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier') return
        const name = node.id.name
        if (!isCredentialName(name)) return
        if (isNonEmptyStringLiteral(node.init)) {
          context.report({ node, messageId: 'hardcodedCredential', data: { name } })
        }
      },
      Property(node) {
        if (node.computed) return
        const key = node.key
        const keyName =
          key.type === 'Identifier' ? key.name
          : key.type === 'Literal' ? String(key.value)
          : null
        if (!keyName || !isCredentialName(keyName)) return
        if (isNonEmptyStringLiteral(node.value)) {
          context.report({ node, messageId: 'hardcodedCredential', data: { name: keyName } })
        }
      },
    }
  },
}