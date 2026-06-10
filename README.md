# eslint-plugin-codeanchor

[![npm version](https://img.shields.io/npm/v/@farisabujolban/eslint-plugin-codeanchor)](https://www.npmjs.com/package/@farisabujolban/eslint-plugin-codeanchor)
[![CI](https://img.shields.io/github/actions/workflow/status/farisabujolban/eslint-plugin-codeanchor/ci.yml?branch=main&label=CI)](https://github.com/farisabujolban/eslint-plugin-codeanchor/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@farisabujolban/eslint-plugin-codeanchor)](LICENSE)

ESLint plugin for AST-level maintainability and safety checks that standard linting tools don't cover: expired comment deadlines, hardcoded secrets, insecure randomness, unguarded JSON parsing, Promise anti-patterns, resource leaks, and more. 20 rules. No external dependencies.

Companion to [`@farisabujolban/codeanchor`](https://github.com/farisabujolban/codeanchor) CLI — the CLI handles git-aware cross-file drift; this plugin handles single-file AST-level checks.

---

## Table of contents

- [Installation](#installation)
- [Setup](#setup)
- [Rules](#rules)
- [Companion tool](#companion-tool)
- [Contributing](#contributing)

---

## Installation

```bash
npm install --save-dev @farisabujolban/eslint-plugin-codeanchor
```

`--save-dev` is appropriate here: ESLint plugins run at lint time, not at runtime. Keeping them in `devDependencies` prevents them from being installed in production environments and ensures every team member and CI job uses the same version.

---

## Setup

### ESLint v9 (flat config)

```js
// eslint.config.js
import codeanchor from '@farisabujolban/eslint-plugin-codeanchor';

export default [codeanchor.configs.recommended];
```

Or enable rules individually:

```js
// eslint.config.js
import codeanchor from '@farisabujolban/eslint-plugin-codeanchor';

export default [
    {
        plugins: { codeanchor },
        rules: {
            'codeanchor/todo-requires-issue': 'warn',
            'codeanchor/env-var-declared': 'error',
            'codeanchor/no-hardcoded-credential-assignment': 'error',
            'codeanchor/no-insecure-random-for-secret': 'error',
        },
    },
];
```

### ESLint v8 (legacy `.eslintrc`)

```js
// .eslintrc.js
module.exports = {
    plugins: ['@farisabujolban/codeanchor'],
    extends: ['plugin:@farisabujolban/codeanchor/legacy'],
};
```

---

## Rules

Full rule reference with option tables and examples: [docs/rules.md](docs/rules.md).

### Comment hygiene

| Rule                                         | Description                                                               | Default | Fixable |
| -------------------------------------------- | ------------------------------------------------------------------------- | ------- | ------- |
| `codeanchor/todo-requires-issue`             | TODO/FIXME/HACK must include an issue reference (`#123`, URL, `PROJ-123`) | warn    | No      |
| `codeanchor/temp-comment-requires-condition` | Temporary/workaround comments must specify a removal condition            | warn    | No      |
| `codeanchor/comment-expiry-date`             | TODO/TEMP/WORKAROUND comments with a past expiry date                     | warn    | No      |

### Environment & config

| Rule                               | Description                                                              | Default | Fixable |
| ---------------------------------- | ------------------------------------------------------------------------ | ------- | ------- |
| `codeanchor/env-var-declared`      | `process.env.X` / `import.meta.env.X` must be declared in `.env.example` | error   | No      |
| `codeanchor/no-placeholder-values` | Flag placeholder strings left by AI code generation                      | error   | No      |

### Security

| Rule                                            | Description                                                           | Default | Fixable |
| ----------------------------------------------- | --------------------------------------------------------------------- | ------- | ------- |
| `codeanchor/no-hardcoded-credential-assignment` | Flag hardcoded strings assigned to credential-named variables         | error   | No      |
| `codeanchor/no-hardcoded-connection-string`     | Disallow connection strings with embedded credentials                 | error   | No      |
| `codeanchor/no-insecure-random-for-secret`      | Disallow `Math.random()` for secrets or tokens — use `crypto` instead | error   | No      |
| `codeanchor/no-hardcoded-port`                  | Flag hardcoded port numbers in server listen calls                    | warn    | No      |

### Reliability

| Rule                                          | Description                                                                | Default | Fixable |
| --------------------------------------------- | -------------------------------------------------------------------------- | ------- | ------- |
| `codeanchor/no-unguarded-json-parse`          | Require `JSON.parse()` to be wrapped in try/catch                          | warn    | No      |
| `codeanchor/no-unguarded-url-constructor`     | Require `new URL()` to be wrapped in try/catch                             | warn    | No      |
| `codeanchor/require-error-cause`              | Require `{ cause: err }` when re-throwing inside a catch block             | warn    | No      |
| `codeanchor/no-resource-leak`                 | Require streams/servers/workers/sockets to be closed in the same scope     | warn    | No      |
| `codeanchor/no-floating-point-equality`       | Disallow exact `===` comparisons with floating-point literals (CWE-1339)   | warn    | No      |
| `codeanchor/no-date-constructor-without-args` | Disallow `new Date()` without arguments — couples code to the system clock | warn    | No      |

### TypeScript correctness

| Rule                                  | Description                                                             | Default | Fixable |
| ------------------------------------- | ----------------------------------------------------------------------- | ------- | ------- |
| `codeanchor/no-double-type-assertion` | Flag `as unknown as T` assertions that bypass TypeScript's type checker | warn    | No      |

### Performance

| Rule                                      | Description                                                                         | Default | Fixable |
| ----------------------------------------- | ----------------------------------------------------------------------------------- | ------- | ------- |
| `codeanchor/no-object-spread-accumulator` | Disallow object spread in `.reduce()` — creates O(n²) allocations                   | warn    | No      |
| `codeanchor/no-promise-constructor-wrap`  | Disallow wrapping a Promise-returning call in `new Promise()` — swallows rejections | error   | No      |
| `codeanchor/no-sync-in-async`             | Flag synchronous `*Sync` calls inside `async` functions                             | warn    | No      |
| `codeanchor/no-constructor-side-effect`   | Disallow I/O, timers, and network calls in class constructors                       | warn    | No      |

---

## Companion tool

[`@farisabujolban/codeanchor`](https://github.com/farisabujolban/codeanchor) — CLI for git-aware cross-file drift: stale docs, broken CI/Docker references, missing lockfile updates, env secret leaks, and more. Run both for full coverage.

```bash
npm install --save-dev @farisabujolban/codeanchor
```

---

## Contributing

```bash
npm install
npm run build
npm test
```

PRs welcome. No AI in the rule logic.

## License

MIT © Faris Abujolban
