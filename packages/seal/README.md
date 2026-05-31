# @lemmaoracle/seal

ZK auth circuit for **Proof-based sign-in** to the Lemma developer dashboard.

`seal` lets a developer prove they hold a valid Lemma API key **without
revealing the key or even which key it is**. It produces a per-session
Poseidon nullifier that is unique to the (secret, nonce) pair but reveals
nothing about the underlying secret or its SHA-256 hash.

## How it works

The dashboard's sign-in flow:

1. The dashboard BFF issues a challenge `nonce`.
2. The developer generates a `seal` proof: it proves knowledge of *a*
   secret whose SHA-256 hash is registered in the workers `api_keys`
   table, bound to that `nonce`. The public output is a **nullifier** —
   `Poseidon(keyHash_hi, keyHash_lo, nonce)` — not the key hash itself.
3. The BFF verifies the proof, then iterates registered `key_hash`
   values in D1, computing the expected nullifier for each until it
   finds a match (O(N), sub-millisecond per check).
4. The BFF issues a session token tied to the resolved scope.

The proof reveals neither the secret nor its hash — only the nullifier
and the nonce. Because `nonce` changes every session, nullifiers cannot
be correlated across sign-ins, even for the same secret.

> Proof-based sign-in requires an existing API key. First-time users
> onboard via GitHub OAuth, which issues their first key.

## Package layout

```
seal/
├── circuits/
│   ├── src/seal-identity.circom   Circuit: SHA-256 pre-image proof + Poseidon nullifier
│   ├── src/seal-identity.test.ts  Circuit witness tests (needs a build)
│   └── scripts/build.sh           Compile circom → wasm + groth16 setup
├── scripts/
│   ├── register-circuit.ts        Pin artifacts to IPFS, register via SDK
│   └── setup-toolchain.sh         Install Rust + circom
├── src/                           TypeScript proof helpers (published)
│   ├── bits.ts                    Secret ↔ circuit signal conversions
│   ├── proof.ts                   prove / verify (delegates to @lemmaoracle/sdk)
│   ├── vkey.ts                    Bundled verification key + named export
│   └── index.ts                   Public API
└── .env.example                   Credentials for register-circuit.ts
```

`seal` is a **reference definition**. It is published to npm so
developers can generate proofs; it is *not* imported by `workers` or the
dashboard at runtime — the circuit reaches them through the normal
Lemma circuit-registration path.

## The circuit

`seal-identity.circom` (v2) proves knowledge of a registered secret and
outputs a per-session nullifier:

- **Private input** — `keyBits[512]`: the 64-byte ASCII secret as bits.
  Lemma keys are 32 random bytes rendered as 64 hex characters (see the
  workers `generate_api_key.js`).
- **Public input** — `nonce`: the dashboard challenge, bound into the
  constraint system for replay protection.
- **Public output** — `nullifier`: `Poseidon(keyHash_hi, keyHash_lo, nonce)`.
  A single BN254 field element; unique per (secret, nonce) pair. Add ~300
  constraints on top of the SHA-256 (~60k total).

The SHA-256 hashing matches the workers `middleware/auth.ts`
(`SHA-256(utf8_bytes(secret))`), but `keyHash` is now an intermediate
signal — it never appears in public signals.

## Build the circuit

The circom toolchain is **not** required to install or test this package
— only to compile the circuit and run `register-circuit.ts`.

```bash
# One-time: install Rust + circom (≈ a few minutes)
./scripts/setup-toolchain.sh

# Compile → build/seal-identity_js/seal-identity.wasm + _final.zkey
cd circuits && npm install && npm run build
```

`build.sh` downloads the 2^17 Hermez powers-of-tau file (~290 MB) on
first run. The v2 circuit adds Poseidon (~300 constraints) to the SHA-256
base (~60k), staying well within the 2^17 budget.

## Register the circuit

```bash
cp .env.example .env        # then fill in LEMMA_API_KEY + PINATA_* keys
npm run register:circuit
```

This pins the `.wasm` / `.zkey` to IPFS via Pinata and registers a
`CircuitMeta` (`circuitId: seal-identity-v1`, `schema: passthrough-v1`,
off-chain `groth16-bn254-snarkjs` verifier) with the workers API. The
dashboard BFF then fetches verification params at runtime via
`GET /v1/circuits/seal-identity-v1`.

## Generate a proof (developer usage)

```ts
import * as seal from "@lemmaoracle/seal";

const { proof, publicSignals, nullifier } = await seal.prove({
  secret: process.env.LEMMA_API_KEY!,
  nonce: challengeNonce,
});
// POST { proof, publicSignals, token } to the dashboard sign-in endpoint.
```

Circuit artifacts (wasm, zkey) are resolved automatically via the
`@lemmaoracle/sdk` from the registered circuit metadata — no local
artifact paths are required.

## Verify a proof

```ts
import * as seal from "@lemmaoracle/seal";

const result = await seal.verify({ proof, publicSignals, nullifier });
// result: { nullifier, nonce } | null
```

The verification key is bundled internally — no additional arguments are
needed. Verification delegates to `@lemmaoracle/sdk` verifier.

## Access the verification key

```ts
import { sealVkey } from "@lemmaoracle/seal";
// Or via the dedicated sub-export:
import vkey from "@lemmaoracle/seal/vkey";
```

## v2 migration notes

v1 exposed `keyHash[256]` as a public output, making the key hash
readable by any observer of the proof transcript. v2 replaces this with
a Poseidon nullifier that is uncorrelatable across sessions.

Breaking changes:
- `SEAL_CIRCUIT_ID` is now `"seal-identity-v1"` (requires re-registration).
- `SealProof.keyHash` removed; replaced by `SealProof.nullifier`.
- Server-side: `scopeIdForKeyHash()` replaced by `scopeIdForNullifier()`
  (full D1 scan + `poseidon-lite` computation).
- Circuit artifacts (wasm, zkey, vkey) must be regenerated.

v3 migration notes:
- `generateSealProof` renamed to `prove`; `verifySealProof` renamed to `verify`.
- `SealProofInput.apiKey` renamed to `SealProofInput.secret`.
- `apiKeyToBits` renamed to `secretToBits`; `SEAL_KEY_BYTES`/`SEAL_KEY_BITS`
  renamed to `SEAL_SECRET_BYTES`/`SEAL_SECRET_BITS`.
- `SealArtifacts` type removed — circuit artifacts are resolved
  automatically via `@lemmaoracle/sdk`.
- `prove` no longer requires a second `artifacts` argument.
- `verify` no longer requires a `verificationKey` argument — the vkey is
  bundled internally.
- `sealVkey` named export added for direct vkey access.
- `snarkjs` is no longer a direct dependency — it is used via
  `@lemmaoracle/sdk`.

## Scripts

| Command                   | Description                                |
| :------------------------ | :----------------------------------------- |
| `npm run build`           | Compile the TypeScript proof helpers       |
| `npm test`                | Run the pure unit tests (no toolchain)     |
| `npm run build:circuit`   | Compile the circom circuit                 |
| `npm run test:circuit`    | Run circuit witness tests (needs a build)  |
| `npm run register:circuit`| Pin artifacts to IPFS and register via SDK |

## License

MIT
