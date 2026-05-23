# Lemma Monorepo — Agent Guidelines

pnpm workspace. TypeScript strict mode everywhere.

## Packages

- `packages/spec` — **Authoritative** shared types + OpenAPI spec.
- `packages/sdk` — TypeScript SDK (`@lemmaoracle/sdk`).
- `packages/parser` — Query parser (`@lemmaoracle/parser`).
- `packages/contracts` — Solidity contracts (Hardhat + toolbox).

## Rules

- Follow functional programming style: see `docs/architecture/fp.md`.
- Follow design principles: see `docs/architecture/design-principles.md`.
- `packages/contracts` and `*.test.ts` are exempt from `eslint-plugin-functional`.
- Tests: Vitest co-located (`foo.ts` → `foo.test.ts`); contracts use Hardhat + Chai.
- Spec & interface sync: see `docs/architecture/spec-sync.md`.
