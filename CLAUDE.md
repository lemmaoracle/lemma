# Lemma Monorepo — Agent Guidelines

## Repository structure

- `packages/spec` — **Authoritative** shared interface types + OpenAPI spec.
- `packages/sdk` — TypeScript SDK (functional style, `@lemmaoracle/sdk`).
- `packages/parser` — Natural language query parser (`@lemmaoracle/parser`). Standalone package.
- `packages/contracts` — Solidity smart contracts (`LemmaRegistry`).

## Non-negotiable rules

### TypeScript

- `strict: true` in every tsconfig.
- All types must use `Readonly<>` / `ReadonlyArray<>`.

### Functional programming (all packages except contracts)

- Follow the functional programming style guide in `@docs/architecture/fp.md` for detailed rules and patterns.

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
