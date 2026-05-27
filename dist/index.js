import { todoRequiresIssue } from './rules/todo-requires-issue.js';
import { tempCommentRequiresCondition } from './rules/temp-comment-requires-condition.js';
import { noCommentedOutCode } from './rules/no-commented-out-code.js';
import { envVarDeclared } from './rules/env-var-declared.js';
const plugin = {
    meta: {
        name: 'codeanchor',
        version: '0.1.0',
    },
    rules: {
        'todo-requires-issue': todoRequiresIssue,
        'temp-comment-requires-condition': tempCommentRequiresCondition,
        'no-commented-out-code': noCommentedOutCode,
        'env-var-declared': envVarDeclared,
    },
    configs: {},
};
// Flat config (ESLint v9)
plugin.configs['recommended'] = {
    plugins: { 'codeanchor': plugin },
    rules: {
        'codeanchor/todo-requires-issue': 'warn',
        'codeanchor/temp-comment-requires-condition': 'warn',
        'codeanchor/no-commented-out-code': 'warn',
        'codeanchor/env-var-declared': 'error',
    },
};
// Legacy config (ESLint v8)
plugin.configs['legacy'] = {
    plugins: ['codeanchor'],
    rules: {
        'codeanchor/todo-requires-issue': 'warn',
        'codeanchor/temp-comment-requires-condition': 'warn',
        'codeanchor/no-commented-out-code': 'warn',
        'codeanchor/env-var-declared': 'error',
    },
};
export default plugin;
