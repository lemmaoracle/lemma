# @lemmaoracle/demo

Provenance verification mini demo. Static SPA hosted at `demo.lemma.frame00.com`.

## What this is

A 30-second client-side demo that verifies AI-output provenance using the same
cryptographic primitives Lemma Oracle uses in production: Poseidon over BN254,
BBS+ over BLS12-381, and Groth16. The user picks one of six samples (three
industries × valid / invalid pair) or uploads a custom proof bundle, hits
`Verify`, and sees a breakdown of which checks passed and which failed.

The demo is fully client-side — uploaded files never leave the browser.

## Status: v0.1 (Phase 1)

This release ships the full UI, six sample fixtures, and a **mock verifier**
that returns deterministic pass/fail results plus the breakdown shape that the
real verifier will produce. It does not yet run real cryptographic verification.

Phase 2 (separate PR) will swap the mock verifier for real Poseidon /
BBS+ / Groth16 verification using `circomlibjs`, `@mattrglobal/bbs-signatures`,
and `snarkjs`. The fixture shape is designed so that phase requires only
swapping `src/lib/verify.ts`; UI and fixtures stay the same.

See `docs/spec.md` for the full source spec.

## Develop

```bash
pnpm --filter @lemmaoracle/demo dev          # Astro dev server on :4321
pnpm --filter @lemmaoracle/demo build        # static build → dist/
pnpm --filter @lemmaoracle/demo preview      # serve dist/ locally
pnpm --filter @lemmaoracle/demo type-check   # tsc --noEmit
pnpm --filter @lemmaoracle/demo test         # vitest
```

## Deploy

Cloudflare Pages via **Git integration** (no GitHub Actions, no secrets).

**One-time setup (CF dashboard):**
1. Workers & Pages → Create → Pages → Connect to Git
2. Select `lemmaoracle/lemma` repository
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `pnpm --filter @lemmaoracle/demo build`
   - Output directory: `packages/demo/dist`
4. Custom domain: `demo.lemma.frame00.com`

After setup, every push to `main` triggers an automatic deploy.
