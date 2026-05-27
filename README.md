# eslint-plugin-codeanchor

ESLint plugin enforcing source-level maintainability conventions that standard linting tools don't cover: issue-linked TODOs, scoped temporary code, commented-out code detection, and declared environment variables.

Companion to [`codeanchor`](https://github.com/your-org/codeanchor) CLI — the CLI handles git-aware cross-file checks; this plugin handles AST-level single-file checks.

---

## Installation

```bash
npm install --save-dev eslint-plugin-codeanchor
```

---

## Setup

### ESLint v9 (flat config)

```js
// eslint.config.js
import codeanchor from 'eslint-plugin-codeanchor'

export default [
  codeanchor.configs.recommended,
]
```

Or enable rules individually:

```js
// eslint.config.js
import codeanchor from 'eslint-plugin-codeanchor'

export default [
  {
    plugins: { 'codeanchor': codeanchor },
    rules: {
      'codeanchor/todo-requires-issue': 'warn',
      'codeanchor/temp-comment-requires-condition': 'warn',
      'codeanchor/no-commented-out-code': 'warn',
      'codeanchor/env-var-declared': 'error',
    },
  },
]
```

### ESLint v8 (legacy `.eslintrc`)

```js
// .eslintrc.js
module.exports = {
  plugins: ['codeanchor'],
  extends: ['plugin:codeanchor/legacy'],
}
```

---

## Rules

| Rule | Description | Default | Fixable |
|---|---|---|---|
| `codeanchor/todo-requires-issue` | TODO/FIXME/HACK must include an issue reference | warn | No |
| `codeanchor/temp-comment-requires-condition` | Temporary/workaround comments must specify a removal condition | warn | No |
| `codeanchor/no-commented-out-code` | Warn on comment blocks that look like commented-out code | warn | No |
| `codeanchor/env-var-declared` | `process.env.X` / `import.meta.env.X` must be declared in `.env.example` | error | No |

---

## Rule docs

### `codeanchor/todo-requires-issue`

Flags `TODO`, `FIXME`, and `HACK` comments that don't include a trackable reference.

**Valid issue references:** `#123`, `GH-123`, `PROJ-123` (any `[A-Z]+-\d+`), or any `https://` URL.

```js
// ✓ OK
// TODO: fix after #123 is merged
// FIXME: https://github.com/org/repo/issues/45
// HACK: JIRA-99 workaround for upstream bug

// ✗ Error
// TODO: fix the auth flow
// FIXME: handle edge case
```

**Options:**

```json
{
  "codeanchor/todo-requires-issue": ["warn", {
    "tags": ["TODO", "FIXME", "HACK"],
    "pattern": "#\\d+|https://"
  }]
}
```

| Option | Type | Default | Description |
|---|---|---|---|
| `tags` | `string[]` | `["TODO", "FIXME", "HACK"]` | Keywords to enforce |
| `pattern` | `string` | built-in | Custom regex that counts as an issue reference |

---

### `codeanchor/temp-comment-requires-condition`

Flags temporary/workaround comments that don't say when they should be removed.

**Removal conditions:** an issue reference (`#123`, URL), a date pattern (`2024-01`, `after v2`), or a phrase like `remove when`, `delete after`, `once X is merged`.

```js
// ✓ OK
// TEMP: remove after #45 is merged
// WORKAROUND: https://github.com/org/repo/issues/99
// WIP: remove once auth refactor is done

// ✗ Error
// TEMP: skip validation
// WORKAROUND: not sure why needed
```

**Options:**

```json
{
  "codeanchor/temp-comment-requires-condition": ["warn", {
    "keywords": ["TEMP", "TEMPORARY", "WORKAROUND", "WIP", "REMOVE"],
    "requireIssue": false
  }]
}
```

| Option | Type | Default | Description |
|---|---|---|---|
| `keywords` | `string[]` | `["TEMP", "TEMPORARY", "WORKAROUND", "WIP", "REMOVE"]` | Trigger keywords |
| `requireIssue` | `boolean` | `false` | When `true`, a URL or issue ref is required (condition phrases are not enough) |

---

### `codeanchor/no-commented-out-code`

Warns when a comment block contains likely commented-out code. Uses heuristics (import statements, `const`/`let`/`return` at line start, arrow functions, method calls, assignments).

```js
// ✓ OK
// This function handles authentication and token refresh.
// See RFC 7519 for JWT specification details.

// ✗ Warn
// const user = await getUser(id)
// if (!user) throw new Error('not found')
// return user
```

To suppress a specific block use ESLint's standard inline disable:

```js
// eslint-disable-next-line codeanchor/no-commented-out-code
// const legacyPath = require('./old-module')
```

**Options:**

```json
{
  "codeanchor/no-commented-out-code": ["warn", {
    "threshold": 0.5
  }]
}
```

| Option | Type | Default | Description |
|---|---|---|---|
| `threshold` | `number` (0–1) | `0.5` | Fraction of lines that must match code heuristics to trigger |

---

### `codeanchor/env-var-declared`

Every `process.env.FOO` or `import.meta.env.FOO` access must have `FOO` declared in `.env.example` or `.env.sample`. This makes the implicit contract explicit and prevents "works on my machine" bugs.

```js
// .env.example contains: DATABASE_URL, PORT

// ✓ OK
const url = process.env.DATABASE_URL
const port = process.env.PORT
const mode = import.meta.env.MODE  // if MODE is declared

// ✗ Error
const secret = process.env.JWT_SECRET  // not in .env.example
const key = import.meta.env.API_KEY    // not in .env.example
```

**Options:**

```json
{
  "codeanchor/env-var-declared": ["error", {
    "envFiles": [".env.example", ".env.sample"],
    "allowDynamic": false
  }]
}
```

| Option | Type | Default | Description |
|---|---|---|---|
| `envFiles` | `string[]` | `[".env.example", ".env.sample"]` | Env file names to load keys from |
| `allowDynamic` | `boolean` | `false` | When `true`, dynamic access like `process.env[key]` is not flagged |

The plugin walks up the directory tree from the linted file to find the project root (stops at a directory containing one of `envFiles`, `package.json`, or `.git`).

---

## Companion tool

[`codeanchor`](https://github.com/your-org/codeanchor) — CLI for git-aware, cross-file drift checks: stale ownership, dead approval requirements, and workflow decay. Complements this plugin — run both for full coverage.

---

## Contributing

```bash
npm install
npm run build
npm test
```

PRs welcome. No AI in the rule logic.
