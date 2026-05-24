# @lemmaoracle/seal

ZK auth circuit for **Proof-based sign-in** to the Lemma developer dashboard.

`seal` lets a developer prove they hold a valid Lemma API key **without
revealing the key or even which key it is**. It produces a per-session
Poseidon nullifier that is unique to the (key, nonce) pair but reveals
nothing about the underlying key or its SHA-256 hash.

## How it works

The dashboard's sign-in flow:

1. The dashboard BFF issues a challenge `nonce`.
2. The developer generates a `seal` proof: it proves knowledge of *an*
   API key whose SHA-256 hash is registered in the workers `api_keys`
   table, bound to that `nonce`. The public output is a **nullifier** —
   `Poseidon(keyHash_hi, keyHash_lo, nonce)` — not the key hash itself.
3. The BFF verifies the proof, then iterates registered `key_hash`
   values in D1, computing the expected nullifier for each until it
   finds a match (O(N), sub-millisecond per check).
4. The BFF issues a session token tied to the resolved scope.

The proof reveals neither the API key nor its hash — only the nullifier
and the nonce. Because `nonce` changes every session, nullifiers cannot
be correlated across sign-ins, even for the same API key.

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
│   ├── bits.ts                    API key ↔ circuit signal conversions
│   ├── proof.ts                   generateSealProof / verifySealProof
│   └── index.ts                   Public API
└── .env.example                   Credentials for register-circuit.ts
```

`seal` is a **reference definition**. It is published to npm so
developers can generate proofs; it is *not* imported by `workers` or the
dashboard at runtime — the circuit reaches them through the normal
Lemma circuit-registration path.

## The circuit

`seal-identity.circom` (v2) proves knowledge of a registered API key and
outputs a per-session nullifier:

- **Private input** — `keyBits[512]`: the 64-byte ASCII API key as bits.
  Lemma keys are 32 random bytes rendered as 64 hex characters (see the
  workers `generate_api_key.js`).
- **Public input** — `nonce`: the dashboard challenge, bound into the
  constraint system for replay protection.
- **Public output** — `nullifier`: `Poseidon(keyHash_hi, keyHash_lo, nonce)`.
  A single BN254 field element; unique per (key, nonce) pair. Add ~300
  constraints on top of the SHA-256 (~60k total).

The SHA-256 hashing matches the workers `middleware/auth.ts`
(`SHA-256(utf8_bytes(apiKey))`), but `keyHash` is now an intermediate
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
`CircuitMeta` (`circuitId: seal-identity-v2`, `schema: passthrough-v1`,
off-chain `groth16-bn254-snarkjs` verifier) with the workers API. The
dashboard BFF then fetches verification params at runtime via
`GET /v1/circuits/seal-identity-v2`.

## Generate a proof (developer usage)

```ts
import { generateSealProof } from "@lemmaoracle/seal";

const { proof, publicSignals, nullifier } = await generateSealProof(
  { apiKey: process.env.LEMMA_API_KEY!, nonce: challengeNonce },
  { wasm: "seal-identity.wasm", zkey: "seal-identity_final.zkey" },
);
// POST { proof, publicSignals, token } to the dashboard sign-in endpoint.
```

## v2 migration notes

v1 exposed `keyHash[256]` as a public output, making the key hash
readable by any observer of the proof transcript. v2 replaces this with
a Poseidon nullifier that is uncorrelatable across sessions.

Breaking changes:
- `SEAL_CIRCUIT_ID` is now `"seal-identity-v2"` (requires re-registration).
- `SealProof.keyHash` removed; replaced by `SealProof.nullifier`.
- Server-side: `scopeIdForKeyHash()` replaced by `scopeIdForNullifier()`
  (full D1 scan + `poseidon-lite` computation).
- Circuit artifacts (wasm, zkey, vkey) must be regenerated.

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
