import { todoRequiresIssue } from './rules/todo-requires-issue.js';
import { tempCommentRequiresCondition } from './rules/temp-comment-requires-condition.js';
import { envVarDeclared } from './rules/env-var-declared.js';
import { commentExpiryDate } from './rules/comment-expiry-date.js';
import { noPlaceholderValues } from './rules/no-placeholder-values.js';
import { noHardcodedCredentialAssignment } from './rules/no-hardcoded-credential-assignment.js';
import { noHardcodedPort } from './rules/no-hardcoded-port.js';
import { noSyncInAsync } from './rules/no-sync-in-async.js';
import { noDoubleTypeAssertion } from './rules/no-double-type-assertion.js';
import { noUnguardedJsonParse } from './rules/no-unguarded-json-parse.js';
import { requireErrorCause } from './rules/require-error-cause.js';
import { noObjectSpreadAccumulator } from './rules/no-object-spread-accumulator.js';
import { noPromiseConstructorWrap } from './rules/no-promise-constructor-wrap.js';
import { noConstructorSideEffect } from './rules/no-constructor-side-effect.js';
import { noInsecureRandomForSecret } from './rules/no-insecure-random-for-secret.js';
import { noUnguardedUrlConstructor } from './rules/no-unguarded-url-constructor.js';
import { noHardcodedConnectionString } from './rules/no-hardcoded-connection-string.js';
import { noResourceLeak } from './rules/no-resource-leak.js';
import { noFloatingPointEquality } from './rules/no-floating-point-equality.js';
import { noDateConstructorWithoutArgs } from './rules/no-date-constructor-without-args.js';
import { noArraySortWithoutComparator } from './rules/no-array-sort-without-comparator.js';

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
        'require-error-cause': requireErrorCause,
        'no-object-spread-accumulator': noObjectSpreadAccumulator,
        'no-promise-constructor-wrap': noPromiseConstructorWrap,
        'no-constructor-side-effect': noConstructorSideEffect,
        'no-insecure-random-for-secret': noInsecureRandomForSecret,
        'no-unguarded-url-constructor': noUnguardedUrlConstructor,
        'no-hardcoded-connection-string': noHardcodedConnectionString,
        'no-resource-leak': noResourceLeak,
        'no-floating-point-equality': noFloatingPointEquality,
        'no-date-constructor-without-args': noDateConstructorWithoutArgs,
        'no-array-sort-without-comparator': noArraySortWithoutComparator,
    },
    configs: {} as Record<string, unknown>,
};

// Flat config (ESLint v9)
plugin.configs['recommended'] = {
    plugins: { codeanchor: plugin },
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
        'codeanchor/require-error-cause': 'warn',
        'codeanchor/no-object-spread-accumulator': 'warn',
        'codeanchor/no-promise-constructor-wrap': 'error',
        'codeanchor/no-constructor-side-effect': 'warn',
        'codeanchor/no-insecure-random-for-secret': 'error',
        'codeanchor/no-unguarded-url-constructor': 'warn',
        'codeanchor/no-hardcoded-connection-string': 'error',
        'codeanchor/no-resource-leak': 'warn',
        'codeanchor/no-floating-point-equality': 'warn',
        'codeanchor/no-date-constructor-without-args': 'warn',
        'codeanchor/no-array-sort-without-comparator': 'warn',
    },
};

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
        'codeanchor/require-error-cause': 'warn',
        'codeanchor/no-object-spread-accumulator': 'warn',
        'codeanchor/no-promise-constructor-wrap': 'error',
        'codeanchor/no-constructor-side-effect': 'warn',
        'codeanchor/no-insecure-random-for-secret': 'error',
        'codeanchor/no-unguarded-url-constructor': 'warn',
        'codeanchor/no-hardcoded-connection-string': 'error',
        'codeanchor/no-resource-leak': 'warn',
        'codeanchor/no-floating-point-equality': 'warn',
        'codeanchor/no-date-constructor-without-args': 'warn',
        'codeanchor/no-array-sort-without-comparator': 'warn',
    },
};

export default plugin;
