# Lemma Monorepo — Agent Guidelines

pnpm workspace. TypeScript strict mode everywhere.

## How to work

- Read `docs/architecture/design-principles.md` before touching code.
- Before any non-trivial change, check `openspec list` or create a change.
- Do not expand scope beyond what was requested.
- When confused or blocked, surface it — do not silently pick an interpretation.

## Packages

- `packages/spec` — **Authoritative** shared types + OpenAPI spec. spec は docs を兼ねる: README と `openapi.lemma.v2.json` は人間と OpenAPI の両方を読む
- `packages/sdk` — TypeScript SDK (`@lemmaoracle/sdk`).
- `packages/parser` — Query parser (`@lemmaoracle/parser`).
- `packages/contracts` — Solidity contracts (Hardhat + toolbox).

## Rules

- Follow functional programming style: see `docs/architecture/fp.md`.
- Follow design principles: see `docs/architecture/design-principles.md`.
- `packages/contracts` and `*.test.ts` are exempt from `eslint-plugin-functional`.
- Tests: Vitest co-located (`foo.ts` → `foo.test.ts`); contracts use Hardhat + Chai.
- Spec & interface sync: see `docs/architecture/spec-sync.md`.
