# Lemma Monorepo — Agent Guidelines

pnpm workspace. TypeScript strict mode everywhere.

## How to work

- Read `docs/architecture/design-principles.md` before touching code.
- Before any non-trivial change, check `openspec list` or create a change.
- Do not expand scope beyond what was requested.
- When confused or blocked, surface it — do not silently pick an interpretation.

## Rules

- Follow functional programming style: see `docs/architecture/fp.md`.
- Follow design principles: see `docs/architecture/design-principles.md`.
- `packages/contracts` and `*.test.ts` are exempt from `eslint-plugin-functional`.
- Tests: Vitest co-located (`foo.ts` → `foo.test.ts`); contracts use Hardhat + Chai.
- Spec & interface sync: see `docs/architecture/spec-sync.md`.

## Cursor Cloud specific instructions

The startup update script runs `pnpm install` and `git submodule update --init --recursive`
(the submodule pulls `forge-std`, needed by `packages/{contracts,x402,agent}`). Node 22 and
pnpm 9.15.0 are already provisioned. The canonical build/test flow is `.github/workflows/ci.yml`.

- **Foundry (forge/anvil, nightly)** is installed at `~/.foundry/bin` (not always on non-login
  shells' PATH). Export it before building/testing contracts: `export PATH="$HOME/.foundry/bin:$PATH"`.
  If `forge` is ever missing, reinstall with `curl -L https://foundry.paradigm.xyz | bash && ~/.foundry/bin/foundryup --install nightly`.
- **`content` build gotcha:** the full workspace build (`pnpm -r build`, i.e. the CI
  `pnpm -r --filter='!@lemmaoracle/passthrough' build`) fails on a clean install because
  `packages/content` runs `tsc` but does not declare a local `typescript` devDependency, so
  `tsc` only exists in the hoisted pnpm bin dir. Put that dir on PATH before building:
  `export PATH="$PWD/node_modules/.pnpm/node_modules/.bin:$PATH"`. (CI happens to pass via
  warm-cache bin symlinks; a pristine install needs this.)
- **Build before test:** Vitest resolves cross-package imports from each package's built `dist/`
  (e.g. `data-commitment` → `sdk`), so run the workspace build before `pnpm test`.
- **Lint is not gated by CI** (no lint step in `ci.yml`). `pnpm lint` runs but `packages/web`
  currently has pre-existing errors; core packages (e.g. `sdk`, `demo`) lint clean.
- **Running apps in dev mode:** `relay` — `pnpm --filter @lemmaoracle/relay dev` (Node HTTP on
  `:3000`, `GET /health`); `demo` provenance SPA — `pnpm --filter @lemmaoracle/demo dev`
  (Astro on `:4321`, fully client-side); `web` marketing site — `pnpm --filter @lemmaoracle/web dev`
  (Astro); `mcp`/`fetcher` are Cloudflare Workers — `wrangler dev`.
- **External backend:** true end-to-end SDK/MCP/x402 flows call the remote Lemma API
  (`workers.lemma.workers.dev`, needs `LEMMA_API_KEY`) which is NOT in this repo; the unit/circuit
  test suite is self-contained and needs no network or `LEMMA_API_KEY`.
