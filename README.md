# eslint-plugin-codeanchor

[![npm version](https://img.shields.io/npm/v/@farisabujolban/eslint-plugin-codeanchor)](https://www.npmjs.com/package/@farisabujolban/eslint-plugin-codeanchor)
[![CI](https://img.shields.io/github/actions/workflow/status/farisabujolban/eslint-plugin-codeanchor/ci.yml?branch=main&label=CI)](https://github.com/farisabujolban/eslint-plugin-codeanchor/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@farisabujolban/eslint-plugin-codeanchor)](LICENSE)

ESLint plugin for repository policies such as linking TODOs to issues, documenting when workarounds can be removed, and declaring environment variables in an example file.

Use it with the [CodeAnchor CLI](https://github.com/farisabujolban/codeanchor) for Git and cross-file checks. The [companion tools guide](docs/companion-tools.md) shows which rules to get from ESLint and other plugins.

---

## Table of contents

- [Installation](#installation)
- [Setup](#setup)
- [Rules](#rules)
- [Companion tool](#companion-tool)
- [Suggested tools](#suggested-tools)
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
| `codeanchor/no-resource-leak`                 | Require streams/servers/workers/sockets to be closed in the same scope     | warn    | No      |
| `codeanchor/no-floating-point-equality`       | Disallow exact `===` comparisons with floating-point literals (CWE-1339)   | warn    | No      |
| `codeanchor/no-date-constructor-without-args` | Disallow `new Date()` without arguments — couples code to the system clock | warn    | No      |

### Performance

| Rule                                    | Description                                                   | Default | Fixable |
| --------------------------------------- | ------------------------------------------------------------- | ------- | ------- |
| `codeanchor/no-sync-in-async`           | Flag synchronous `*Sync` calls inside `async` functions       | warn    | No      |
| `codeanchor/no-constructor-side-effect` | Disallow I/O, timers, and network calls in class constructors | warn    | No      |

---

## Companion tool

[`@farisabujolban/codeanchor`](https://github.com/farisabujolban/codeanchor) checks for stale comments, broken references across repository files, and gaps in test and owner coverage based on Git history.

```bash
npm install --save-dev @farisabujolban/codeanchor
```

---

## Suggested tools

Use ESLint and typescript-eslint for general JS/TS linting. Oxlint can flag accumulating spreads, Unicorn can check dated TODOs, eslint-plugin-n can flag `process.exit()` in library code, and eslint-plugin-promise can flag direct Promise construction.

See the [companion tools and migration guide](docs/companion-tools.md) for the specific rules and settings, plus optional tools for secret scanning, regex checks, and JSX accessibility.

## Contributing

Before adding a rule, check whether ESLint or an existing plugin already detects the same problem. If it does, document how to enable it in [companion tools](docs/companion-tools.md).

```bash
npm install
npm run build
npm test
```

PRs welcome. No AI in the rule logic.

## License

MIT © Faris Abujolban
