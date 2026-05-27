import { todoRequiresIssue } from './rules/todo-requires-issue.js'
import { tempCommentRequiresCondition } from './rules/temp-comment-requires-condition.js'
import { envVarDeclared } from './rules/env-var-declared.js'
import { commentExpiryDate } from './rules/comment-expiry-date.js'

const plugin = {
  meta: {
    name: 'codeanchor',
    version: '0.1.0',
  },
  rules: {
    'todo-requires-issue': todoRequiresIssue,
    'temp-comment-requires-condition': tempCommentRequiresCondition,
    'env-var-declared': envVarDeclared,
    'comment-expiry-date': commentExpiryDate,
  },
  configs: {} as Record<string, unknown>,
}

// Flat config (ESLint v9)
plugin.configs['recommended'] = {
  plugins: { 'codeanchor': plugin },
  rules: {
    'codeanchor/todo-requires-issue': 'warn',
    'codeanchor/temp-comment-requires-condition': 'warn',
    'codeanchor/env-var-declared': 'error',
    'codeanchor/comment-expiry-date': 'warn',
  },
}

// Legacy config (ESLint v8)
plugin.configs['legacy'] = {
  plugins: ['codeanchor'],
  rules: {
    'codeanchor/todo-requires-issue': 'warn',
    'codeanchor/temp-comment-requires-condition': 'warn',
    'codeanchor/env-var-declared': 'error',
    'codeanchor/comment-expiry-date': 'warn',
  },
}

export default plugin