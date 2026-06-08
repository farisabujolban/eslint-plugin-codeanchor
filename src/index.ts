import { todoRequiresIssue } from './rules/todo-requires-issue.js'
import { tempCommentRequiresCondition } from './rules/temp-comment-requires-condition.js'
import { envVarDeclared } from './rules/env-var-declared.js'
import { commentExpiryDate } from './rules/comment-expiry-date.js'
import { noPlaceholderValues } from './rules/no-placeholder-values.js'
import { noHardcodedCredentialAssignment } from './rules/no-hardcoded-credential-assignment.js'
import { noHardcodedPort } from './rules/no-hardcoded-port.js'
import { noSyncInAsync } from './rules/no-sync-in-async.js'
import { noDoubleTypeAssertion } from './rules/no-double-type-assertion.js'
import { noUnguardedJsonParse } from './rules/no-unguarded-json-parse.js'

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
    'no-placeholder-values': noPlaceholderValues,
    'no-hardcoded-credential-assignment': noHardcodedCredentialAssignment,
    'no-hardcoded-port': noHardcodedPort,
    'no-sync-in-async': noSyncInAsync,
    'no-double-type-assertion': noDoubleTypeAssertion,
    'no-unguarded-json-parse': noUnguardedJsonParse,
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
    'codeanchor/no-placeholder-values': 'error',
    'codeanchor/no-hardcoded-credential-assignment': 'error',
    'codeanchor/no-hardcoded-port': 'warn',
    'codeanchor/no-sync-in-async': 'warn',
    'codeanchor/no-double-type-assertion': 'warn',
    'codeanchor/no-unguarded-json-parse': 'warn',
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
    'codeanchor/no-placeholder-values': 'error',
    'codeanchor/no-hardcoded-credential-assignment': 'error',
    'codeanchor/no-hardcoded-port': 'warn',
    'codeanchor/no-sync-in-async': 'warn',
    'codeanchor/no-double-type-assertion': 'warn',
    'codeanchor/no-unguarded-json-parse': 'warn',
  },
}

export default plugin