import type { Rule } from 'eslint'

// Matches protocol://user:pass@host — the user:pass@ segment proves credentials are embedded
const CONNECTION_STRING_RE =
  /^(mongodb(\+srv)?|postgresql|postgres|mysql|mariadb|mssql|redis(\+tls)?|amqps?|nats|rabbitmq):\/\/[^:@\s/]+:[^@\s]+@/i

function isTestFile(filename: string): boolean {
  return /[./](test|spec)\.[jt]sx?$|[/\\]__tests__[/\\]|[/\\](test|tests|spec|specs)[/\\]/i.test(filename)
}

export const noHardcodedConnectionString: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded connection strings with embedded credentials',
      recommended: true,
    },
    schema: [],
    messages: {
      hardcodedConnectionString:
        'Connection string has embedded credentials. Use an environment variable (e.g. process.env.DATABASE_URL) instead.',
    },
  },

  create(context) {
    const filename: string =
      ((context as unknown as { filename?: string }).filename) ?? context.getFilename()
    if (isTestFile(filename)) return {}

    return {
      Literal(node) {
        if (typeof node.value !== 'string') return
        if (CONNECTION_STRING_RE.test(node.value)) {
          context.report({ node, messageId: 'hardcodedConnectionString' })
        }
      },
    }
  },
}
