# Lemma Monorepo — Agent Guidelines

## Repository structure

- `packages/spec` — **Authoritative** shared interface types + OpenAPI spec.
- `packages/sdk` — TypeScript SDK (functional style, `@lemma/sdk`).
- `packages/contracts` — Solidity smart contracts (`LemmaRegistry`).

## Non-negotiable rules

### TypeScript

- `strict: true` in every tsconfig.
- All types must use `Readonly<>` / `ReadonlyArray<>`.

### Functional programming (SDK only)

- **eslint-plugin-functional `strict` preset is active.**
- **No `if` / `switch` statements.** Use `R.cond`, `R.ifElse`, `R.when`, `R.unless`, or ternary expressions.
- **No `let` / `var`.** Only `const`.
- **No `class`.** Use plain objects and functions.
- **No `for` / `while` / `do..while`.** Use `R.map`, `R.reduce`, `R.filter`, `Array.prototype.map`, etc.
- **No `throw` in sync code.** Return `Promise.reject(new Error(...))` for async errors. The `allowToRejectPromises` option is enabled for `no-throw-statements`.
- **No mutation.** Use `R.assoc`, `R.dissoc`, spread operators, `structuredClone`, etc.

### Patterns cheat-sheet

```typescript
// ✅ Branching
const result = R.cond([
  [R.equals("a"), R.always("alpha")],
  [R.equals("b"), R.always("beta")],
  [R.T, R.always("unknown")],
])(input);

// ✅ Conditional return
const value = predicate ? "yes" : "no";

// ✅ Error in async
const safeDivide = (a: number, b: number): Promise<number> =>
  b === 0 ? Promise.reject(new Error("Division by zero")) : Promise.resolve(a / b);

// ❌ FORBIDDEN
if (x) { ... }
let y = 0;
class Foo { }
for (const item of items) { ... }
throw new Error("boom");
```

### Testing

- Vitest with co-located pattern: `foo.ts` → `foo.test.ts`.
- **Test files are exempt** from eslint-plugin-functional rules.
- Contract tests use Hardhat + Chai (not Vitest).

### Smart contracts

- eslint-plugin-functional does **NOT** apply to `packages/contracts`.
- Use Hardhat + `@nomicfoundation/hardhat-toolbox`.

### Interface sync

When changing SDK API payloads or Workers endpoints:

1. Edit `packages/spec/src/index.ts` and `packages/spec/openapi.lemma.v2.json`.
2. Run `pnpm sync:workers:spec`.
3. Update SDK fetch helpers and Workers routes **together**.
4. Add/update tests in both repos.

## Commands

| Command                  | Description                        |
| :----------------------- | :--------------------------------- |
| `pnpm install`           | Install all workspace dependencies |
| `pnpm build`             | Build all packages                 |
| `pnpm lint`              | Lint all packages                  |
| `pnpm test`              | Run all tests                      |
| `pnpm format`            | Format with Prettier               |
| `pnpm sync:workers:spec` | Copy spec to Workers repo          |
