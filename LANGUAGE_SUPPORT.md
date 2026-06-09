# Language Support

Each rule's `meta.docs.languages` field declares which languages it supports.

| Value          | Meaning                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| `'*'`          | Works with any ESLint-supported language (comment-based or `Literal`-node-based; no JS/TS AST dependency) |
| `'javascript'` | Requires the default espree parser or a JS-compatible parser                                              |
| `'typescript'` | Requires `@typescript-eslint/parser`                                                                      |

---

## Tier A — Truly language-agnostic (`languages: ['*']`)

These rules operate purely on comments via `context.sourceCode.getAllComments()` and regex.
They will work in any language whose ESLint parser attaches comments to the AST.

| Rule                              | Mechanism                        |
| --------------------------------- | -------------------------------- |
| `todo-requires-issue`             | Comment regex                    |
| `temp-comment-requires-condition` | Comment regex                    |
| `comment-expiry-date`             | Comment regex + ISO date parsing |

---

## Tier B — Agnostic-enough (`languages: ['*']`)

These rules visit `Literal` nodes, which are part of the standard estree spec and present in
every JS/TS-compatible parser. They will work in any language whose ESLint parser emits estree
`Literal` nodes.

`isTestFile` detection uses directory-based patterns (`/test/`, `/__tests__/`) and a
language-agnostic extension pattern (`[^./\\]+`) so `.test.py`, `.test.go`, etc. are recognized.

| Rule                             | Mechanism             |
| -------------------------------- | --------------------- |
| `no-placeholder-values`          | `Literal` value regex |
| `no-hardcoded-connection-string` | `Literal` value regex |

---

## Tier C — Concept-portable, JS/TS implementation (`languages: ['javascript', 'typescript']`)

The underlying concern applies broadly (e.g. "don't hardcode credentials"), but the
AST patterns used are JS/TS-specific (variable declarations, object properties, call expressions).

| Rule                                 | JS/TS dependency                                 |
| ------------------------------------ | ------------------------------------------------ |
| `no-hardcoded-credential-assignment` | `VariableDeclarator`, `Property` nodes           |
| `no-hardcoded-port`                  | `.listen()` `CallExpression`                     |
| `no-unguarded-json-parse`            | `JSON.parse()` global, `TryStatement`            |
| `require-error-cause`                | `CatchClause`, `ThrowStatement`, `NewExpression` |
| `no-unguarded-url-constructor`       | `new URL()`, `TryStatement`                      |
| `no-insecure-random-for-secret`      | `Math.random()` global, `VariableDeclarator`     |

---

## Tier D — JS/TS by design (`languages: ['javascript', 'typescript']`)

These rules target JS/TS-specific language features that do not exist in other languages.
They are intentionally scoped.

| Rule                           | Language feature                                   |
| ------------------------------ | -------------------------------------------------- |
| `no-sync-in-async`             | `async`/`await`, `*Sync` naming convention         |
| `no-object-spread-accumulator` | `.reduce()`, spread syntax (`...`)                 |
| `no-promise-constructor-wrap`  | `Promise` constructor                              |
| `env-var-declared`             | `process.env`, `import.meta.env`                   |
| `no-constructor-side-effect`   | Class `constructor`, hardcoded Node.js module list |
| `no-resource-leak`             | Streams/servers (fs, net, http), `using` statement |

---

## Tier E — TypeScript-only (`languages: ['typescript']`)

These rules depend on AST node types emitted exclusively by `@typescript-eslint/parser`.
They are silently inert when run with any other parser.

| Rule                       | TS-only AST node                     |
| -------------------------- | ------------------------------------ |
| `no-double-type-assertion` | `TSAsExpression`, `TSUnknownKeyword` |

---

## Adding support for a new language

For a C-style language (C, C++, Java, etc.) parsed via an ESLint language plugin:

1. **Tier A rules** will work immediately if the parser attaches comments.
2. **Tier B rules** will work if the parser emits estree `Literal` nodes for string literals.
3. **Tier C/D rules** require new visitor hooks targeting the language's AST equivalents.
   The credential regex, placeholder patterns, and connection-string regex in Tier B/C rules
   are already portable — only the AST selector needs updating.
