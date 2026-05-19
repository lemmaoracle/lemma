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

### Bazaar schemas + OpenAPI sync (spec v0.2+)

When you change a JSON Schema under `packages/spec/schemas/` or add/edit a route in `openapi.lemma.v2.json`:

1. `pnpm --filter @lemmaoracle/spec validate:schemas` (10 / 10 OK required)
2. `pnpm --filter @lemmaoracle/spec validate:openapi` (redocly lint + `$ref` existence + `x-bazaar` schema check)
3. `pnpm --filter @lemmaoracle/spec bundle:openapi` (regenerates `openapi.lemma.v2.bundled.json` with all `$ref`s inlined)
4. **Commit both the source schema/openapi AND `openapi.lemma.v2.bundled.json`** — CI fails on `git diff --exit-code` if the bundle is stale.

**Bazaar discoverability**: `discoverable: true` routes are only indexed in the CDP Discovery Layer when settled through the CDP facilitator (`https://api.cdp.coinbase.com/platform/v2/x402`). The `x402.org` community facilitator and self-hosted facilitator implementations do not index. Pin the CDP facilitator in production route configs; otherwise indexing silently no-ops. See `packages/x402/src/README.md`.
