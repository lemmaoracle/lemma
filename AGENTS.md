# Lemma Monorepo — Agent Guidelines

pnpm workspace. TypeScript strict mode everywhere.

## Packages

- `packages/spec` — **Authoritative** shared types + OpenAPI spec.
- `packages/sdk` — TypeScript SDK (`@lemmaoracle/sdk`).
- `packages/parser` — Query parser (`@lemmaoracle/parser`).
- `packages/contracts` — Solidity contracts (Hardhat + toolbox).

## Rules

- All types use `Readonly<>` / `ReadonlyArray<>`.
- Follow functional programming style: see `docs/architecture/fp.md`.
- `packages/contracts` and `*.test.ts` are exempt from `eslint-plugin-functional`.
- Tests: Vitest co-located (`foo.ts` → `foo.test.ts`); contracts use Hardhat + Chai.

## Interface sync

When SDK payloads or Workers endpoints change:

1. Edit `packages/spec/src/index.ts` and `packages/spec/openapi.lemma.v2.json`.
2. Run `pnpm sync:workers:spec`.
3. Update SDK fetch helpers and Workers routes together, with tests in both repos.
