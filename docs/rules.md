# eslint-plugin-codeanchor — Rule Reference

Full reference for all 20 rules with option tables and examples.

← [Back to README](../README.md)

---

## Comment hygiene

---

### `codeanchor/todo-requires-issue`

**TODO/FIXME/HACK must include an issue reference.**

Flags `TODO`, `FIXME`, and `HACK` comments that don't include a trackable reference. The rule only flags top-level keyword comments, not prose mentions mid-sentence.

**Valid references:** `#123`, `GH-123`, `PROJ-123` (any `[A-Z]+-\d+` pattern), or any `https://` URL.

```js
// ✓ OK
// TODO: fix after #123 is merged
// FIXME: https://github.com/org/repo/issues/45
// HACK: JIRA-99 workaround for upstream bug

// ✗ Flagged
// TODO: fix the auth flow
// FIXME: handle edge case
```

**Options:**

```json
{
    "codeanchor/todo-requires-issue": [
        "warn",
        {
            "tags": ["TODO", "FIXME", "HACK"],
            "pattern": "#\\d+|https://"
        }
    ]
}
```

| Option    | Type       | Default                     | Description                                          |
| --------- | ---------- | --------------------------- | ---------------------------------------------------- |
| `tags`    | `string[]` | `["TODO", "FIXME", "HACK"]` | Keywords to enforce.                                 |
| `pattern` | `string`   | built-in                    | Custom regex that counts as a valid issue reference. |

---

### `codeanchor/temp-comment-requires-condition`

**Temporary/workaround comments must specify a removal condition.**

Flags `TEMP`, `WORKAROUND`, `WIP`, and similar comments that don't say when they should be removed.

**Valid conditions:** an issue reference (`#123`, URL), a date pattern (`2024-01`, `after v2`), or a phrase like `remove when`, `delete after`, `once X is merged`.

```js
// ✓ OK
// TEMP: remove after #45 is merged
// WORKAROUND: https://github.com/org/repo/issues/99
// WIP: remove once auth refactor is done

// ✗ Flagged
// TEMP: skip validation
// WORKAROUND: not sure why needed
```

**Options:**

```json
{
    "codeanchor/temp-comment-requires-condition": [
        "warn",
        {
            "keywords": ["TEMP", "TEMPORARY", "WORKAROUND", "WIP", "REMOVE"],
            "requireIssue": false
        }
    ]
}
```

| Option         | Type       | Default                                                | Description                                                                           |
| -------------- | ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `keywords`     | `string[]` | `["TEMP", "TEMPORARY", "WORKAROUND", "WIP", "REMOVE"]` | Trigger keywords.                                                                     |
| `requireIssue` | `boolean`  | `false`                                                | When `true`, a URL or issue ref is required — condition phrases alone are not enough. |

---

### `codeanchor/comment-expiry-date`

**TODO/TEMP/WORKAROUND comments with a past expiry date.**

Flags comments that include a date that has already passed. Also flags dates more than one year in the future as likely AI-generated placeholders.

```js
// ✓ OK
// TODO: clean up after 2025-12 release

// ✗ Flagged (date is past)
// TODO: remove after 2023-06
// TEMP: delete by 2022-01-15

// ✗ Flagged (date too far out — likely AI placeholder)
// TODO: fix by 2035-01-01
```

**Options:**

```json
{
    "codeanchor/comment-expiry-date": [
        "warn",
        {
            "keywords": ["TODO", "FIXME", "HACK", "TEMP", "TEMPORARY", "WORKAROUND", "WIP", "REMOVE"]
        }
    ]
}
```

| Option     | Type       | Default                                                                         | Description                         |
| ---------- | ---------- | ------------------------------------------------------------------------------- | ----------------------------------- |
| `keywords` | `string[]` | `["TODO", "FIXME", "HACK", "TEMP", "TEMPORARY", "WORKAROUND", "WIP", "REMOVE"]` | Keywords to scan for date patterns. |

---

## Environment & config

---

### `codeanchor/env-var-declared`

**`process.env.X` / `import.meta.env.X` must be declared in `.env.example`.**

Every environment variable accessed in code must have a corresponding key in `.env.example` or `.env.sample`. This makes the implicit contract explicit and prevents "works on my machine" bugs.

```js
// .env.example contains: DATABASE_URL, PORT

// ✓ OK
const url = process.env.DATABASE_URL;
const port = process.env.PORT;

// ✗ Flagged
const secret = process.env.JWT_SECRET; // not in .env.example
const key = import.meta.env.API_KEY; // not in .env.example
```

The plugin walks up the directory tree from each linted file to find the project root (stops at a directory containing one of `envFiles`, `package.json`, or `.git`).

**Options:**

```json
{
    "codeanchor/env-var-declared": [
        "error",
        {
            "envFiles": [".env.example", ".env.sample"],
            "allowDynamic": false
        }
    ]
}
```

| Option         | Type       | Default                           | Description                                                         |
| -------------- | ---------- | --------------------------------- | ------------------------------------------------------------------- |
| `envFiles`     | `string[]` | `[".env.example", ".env.sample"]` | Env files to load declared keys from.                               |
| `allowDynamic` | `boolean`  | `false`                           | When `true`, dynamic access like `process.env[key]` is not flagged. |

---

### `codeanchor/no-placeholder-values`

**Flag placeholder strings left by AI code generation.**

Detects values like `"your-api-key"`, `"<YOUR_TOKEN>"`, `"TODO: replace"`, `"PLACEHOLDER"`, etc. that are commonly inserted by code generation tools and forgotten.

```js
// ✗ Flagged
const apiKey = 'your-api-key-here';
const token = '<YOUR_TOKEN>';
const url = 'https://example.com/your-endpoint';
```

**Options:**

| Option          | Type       | Default  | Description                                                                           |
| --------------- | ---------- | -------- | ------------------------------------------------------------------------------------- |
| `patterns`      | `string[]` | built-in | Additional regex patterns to flag.                                                    |
| `skipTestFiles` | `boolean`  | `true`   | When `true`, test files are not checked (placeholders in test fixtures are expected). |

---

## Security

---

### `codeanchor/no-hardcoded-credential-assignment`

**Flag hardcoded strings assigned to credential-named variables.**

Detects non-empty string literals assigned to variables with names like `password`, `secret`, `apiKey`, `token`, `credential`, `privateKey`, etc.

```js
// ✗ Flagged
const password = 'hunter2';
const apiKey = 'sk-abc123';
const dbPassword = 'admin';

// ✓ OK — reading from environment
const password = process.env.DB_PASSWORD;
```

No configurable options.

---

### `codeanchor/no-hardcoded-connection-string`

**Disallow connection strings with embedded credentials.**

Detects connection string literals that contain `://user:password@...` patterns.

```js
// ✗ Flagged
const conn = 'postgresql://admin:secret@localhost:5432/mydb';
const redis = 'redis://:password@host:6379';

// ✓ OK
const conn = process.env.DATABASE_URL;
```

No configurable options.

---

### `codeanchor/no-insecure-random-for-secret`

**Disallow `Math.random()` for secrets or tokens.**

`Math.random()` is not cryptographically secure. Use `crypto.randomUUID()` or `crypto.randomBytes()` instead.

```js
// ✗ Flagged
const token = Math.random().toString(36);
const sessionId = Math.random().toString(16);

// ✓ OK
const token = crypto.randomUUID();
const bytes = crypto.randomBytes(32).toString('hex');
```

No configurable options.

---

### `codeanchor/no-hardcoded-port`

**Flag hardcoded port numbers in server listen calls.**

Port numbers should come from environment variables or named constants so they are configurable without code changes.

```js
// ✗ Flagged
app.listen(3000);
server.listen(8080, 'localhost');

// ✓ OK
app.listen(process.env.PORT ?? 3000);
const PORT = process.env.PORT ?? 3000;
app.listen(PORT);
```

**Options:**

| Option  | Type       | Default | Description                             |
| ------- | ---------- | ------- | --------------------------------------- |
| `allow` | `number[]` | `[]`    | Port numbers to allow without flagging. |

```json
{ "codeanchor/no-hardcoded-port": ["warn", { "allow": [80, 443] }] }
```

---

## Reliability

---

### `codeanchor/no-unguarded-json-parse`

**Require `JSON.parse()` to be wrapped in try/catch.**

`JSON.parse()` throws a `SyntaxError` on invalid input. Unguarded calls can crash request handlers and workers.

```js
// ✗ Flagged
const data = JSON.parse(body);

// ✓ OK
let data;
try {
    data = JSON.parse(body);
} catch (err) {
    return res.status(400).json({ error: 'invalid JSON' });
}
```

No configurable options.

---

### `codeanchor/no-unguarded-url-constructor`

**Require `new URL()` to be wrapped in try/catch.**

`new URL()` throws a `TypeError` on invalid URLs. Unguarded calls can crash request handlers when given user-supplied input.

```js
// ✗ Flagged
const url = new URL(userInput);

// ✓ OK
let url;
try {
    url = new URL(userInput);
} catch {
    return res.status(400).send('invalid URL');
}
```

No configurable options.

---

### `codeanchor/require-error-cause`

**Require `{ cause: err }` when re-throwing inside a catch block.**

Without `cause`, the original error is silently dropped and the stack trace is lost. Use `{ cause: err }` to preserve the chain.

```js
// ✗ Flagged — original error dropped
try {
    await db.query(sql);
} catch {
    throw new Error('database query failed');
}

// ✓ OK
try {
    await db.query(sql);
} catch (err) {
    throw new Error('database query failed', { cause: err });
}
```

No configurable options.

---

### `codeanchor/no-resource-leak`

**Require streams, servers, workers, and sockets to be closed in the same scope they are created.**

Resources that are opened but never closed cause memory leaks and prevent process exit.

```js
// ✗ Flagged — stream never closed
const stream = fs.createReadStream(path);
stream.on('data', process);

// ✓ OK
const stream = fs.createReadStream(path);
stream.on('data', process);
stream.on('end', () => stream.destroy());
stream.on('error', () => stream.destroy());
```

No configurable options.

---

### `codeanchor/no-floating-point-equality`

**Disallow exact `===` comparisons with floating-point literals (CWE-1339).**

IEEE 754 arithmetic means `0.1 + 0.2 !== 0.3`. Use an epsilon-based comparison for floats.

```js
// ✗ Flagged
if (result === 0.1) { ... }
if (price !== 9.99) { ... }

// ✓ OK
if (Math.abs(result - 0.1) < Number.EPSILON) { ... }
```

No configurable options.

---

### `codeanchor/no-date-constructor-without-args`

**Disallow `new Date()` without arguments.**

`new Date()` returns the current system time, making code non-deterministic and hard to test. Pass an explicit timestamp or inject a clock dependency.

```js
// ✗ Flagged
const now = new Date();
const timestamp = new Date().toISOString();

// ✓ OK — explicit timestamp
const date = new Date('2024-01-15T12:00:00Z');
// ✓ OK — injected clock
const date = new Date(clock.now());
```

No configurable options.

---

## TypeScript correctness

---

### `codeanchor/no-double-type-assertion`

**Flag `as unknown as T` assertions that bypass TypeScript's type checker.**

Double type assertions (`as unknown as T`) suppress every type error on the expression. They indicate a type mismatch that should be fixed properly.

```ts
// ✗ Flagged
const user = response as unknown as User;
const config = data as unknown as Config;

// ✓ OK — proper assertion with a compatible intermediate type
const user = response as ApiResponse as User;
// ✓ OK — use a type guard or validate instead
function isUser(x: unknown): x is User { ... }
```

No configurable options.

---

## Performance

---

### `codeanchor/no-object-spread-accumulator`

**Disallow object spread in `.reduce()` — creates O(n²) allocations.**

Spreading the accumulator inside `.reduce()` creates a new object on every iteration. For large arrays this is a common performance trap.

```js
// ✗ Flagged — O(n²)
const obj = items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});

// ✓ OK — O(n)
const obj = items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
}, {});
```

No configurable options.

---

### `codeanchor/no-promise-constructor-wrap`

**Disallow wrapping a Promise-returning call in `new Promise()`.**

Wrapping `async` functions or Promise-returning calls in `new Promise()` is redundant and may swallow rejections if the inner call throws synchronously before the `resolve`/`reject` is called.

```js
// ✗ Flagged
return new Promise((resolve, reject) => {
    fetch(url).then(resolve).catch(reject);
});

// ✓ OK — just return the Promise directly
return fetch(url);
```

No configurable options.

---

### `codeanchor/no-sync-in-async`

**Flag synchronous `*Sync` calls inside `async` functions.**

Synchronous methods like `fs.readFileSync()`, `execSync()`, and `spawnSync()` block the Node.js event loop. Inside an `async` function they block all concurrent requests.

```js
// ✗ Flagged
async function loadConfig(path) {
    const content = fs.readFileSync(path, 'utf-8'); // blocks event loop
    return JSON.parse(content);
}

// ✓ OK
async function loadConfig(path) {
    const content = await fs.promises.readFile(path, 'utf-8');
    return JSON.parse(content);
}
```

No configurable options.

---

### `codeanchor/no-constructor-side-effect`

**Disallow I/O, timers, and network calls directly in class constructors.**

Side effects in constructors make classes hard to test (construction triggers real I/O), can cause memory leaks (if the object is never fully initialized), and violate the principle of least surprise.

```js
// ✗ Flagged
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.token = await this.fetchToken(); // async in constructor
        setInterval(() => this.refresh(), 60000); // timer in constructor
    }
}

// ✓ OK — separate initialization from construction
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async init() {
        this.token = await this.fetchToken();
    }
}
```

No configurable options.

---

## Ecosystem note

> **TODO:** Research overlap with `typescript-eslint`, `eslint-plugin-security`, `eslint-plugin-unicorn`, and `eslint-plugin-n` to document which rules are complementary vs. overlapping. Findings will be added here.
