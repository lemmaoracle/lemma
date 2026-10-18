# Policy sharing vectors (internal stage)

`v1.json` is the single shared fixture. It contains **test-only secrets**, never
production credentials. Both axes use fixed depth 20 and BN254 scalar elements.
Directions are leaf-to-root bits: 0 = current node left, 1 = right. Allocated slots
include revoked entries; revocation replaces index 1 with empty without shifting
index 2. Roots and all allocated paths cover empty, single, odd (3), and revoked
trees on both axes.

The 13 signals and witness follow the **experimental** ABI in design §5.
Expected period/amount outcomes describe requirements, not implemented adapters or
observed circuit verification. Non-bit rejection by TypeScript does not imply
that the experimental circuit constrains bits.

## Reproduce TypeScript vectors

From the repository root after `pnpm install --frozen-lockfile`:

```sh
node fixtures/policy-sharing/generate.mjs
pnpm --filter @lemmaoracle/verify test
```

The generator uses poseidon-lite 0.3.0 directly and an independent reference tree;
it does not import the implementation under test. Tool versions pinned for future
circuit reproduction are Circom 2.2.3, circomlib 2.0.5, snarkjs 0.7.6 and
poseidon-lite 0.3.0. Only poseidon-lite is used by this generator.

## Circuit regeneration procedure — pending

**Circuit-side fixture consumption is NOT CONNECTED.** Production circuit,
wasm, zkey and vkey are unavailable; their SHA-256 digests are explicitly null.
No circuit/proof interoperability is claimed at this stage.

Once approved production artifacts exist, document their source commit, setup
provenance and exact commands here, then record all four SHA-256 digests in the
fixture generator. The future consumer must:

1. Compile the approved circuit with Circom 2.2.3 and circomlib 2.0.5 using
   `circom <approved.circom> --r1cs --wasm --sym -o <build> -l <dependencies>`.
2. Generate a witness from `v1.json`'s `witness` using the compiled witness
   generator, then `snarkjs wtns check <r1cs> <wtns>` (snarkjs 0.7.6).
3. Use the approved ceremony's zkey with `snarkjs groth16 prove`, then
   `snarkjs groth16 verify <vkey> <public.json> <proof.json>`. Compare signal order,
   field values, both roots and paths with this same fixture; do not compare
   randomized proof bytes.
4. Regenerate witnesses for each negative case (apply `cases[].patch`). Check
   role, period, amount and missing/non-bit position rejection, including direct
   SDK-bypassing non-bit witnesses. Production ABI changes require updating these
   experimental signal vectors and the consumer together.

This does not resolve the experimental request template/amount binding gaps.
Adapters, proof generation, retrieval, freshness and authorization are outside
this internal stage.
