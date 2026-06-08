import type { Rule } from 'eslint'
import type { CodeAnchorRule } from '../types.js'
import { isTestFile } from '../util/test-file.js'

// Matches protocol://user:pass@host — the user:pass@ segment proves credentials are embedded
const CONNECTION_STRING_RE =
  /^(mongodb(\+srv)?|postgresql|postgres|mysql|mariadb|mssql|redis(\+tls)?|amqps?|nats|rabbitmq):\/\/[^:@\s/]+:[^@\s]+@/i

export const noHardcodedConnectionString: CodeAnchorRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded connection strings with embedded credentials',
      recommended: true,
      languages: ['*'],
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
