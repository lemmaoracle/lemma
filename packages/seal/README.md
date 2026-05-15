# @lemmaoracle/seal

ZK auth circuit for **Proof-based sign-in** to the Lemma developer dashboard.

`seal` lets a developer prove they hold a valid Lemma API key **without
revealing the key**. It is a [zero-knowledge proof](https://lemma.frame00.com)
of the pre-image of the key's SHA-256 hash.

## How it works

The dashboard's sign-in flow:

1. The dashboard BFF issues a challenge `nonce`.
2. The developer generates a `seal` proof: it proves knowledge of the
   API key whose SHA-256 hash equals the `key_hash` stored in the
   workers `api_keys` table, bound to that `nonce`.
3. The BFF verifies the proof, reads the attested `key_hash`, looks it
   up in `api_keys`, and resolves the caller's `scope_id`.
4. The BFF issues a session token tied to the scope.

The proof reveals only the `key_hash` (already public, since it is what
the API stores) and the `nonce` — never the API key itself.

> Proof-based sign-in requires an existing API key. First-time users
> onboard via GitHub OAuth, which issues their first key.

## Package layout

```
seal/
├── circuits/
│   ├── src/seal-identity.circom   Circuit: SHA-256 pre-image proof
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

There is no `normalize/` step: the circuit's witness input is the raw
API key string (already canonical), so seal uses the existing
[`passthrough-v1`](../passthrough) schema rather than a bespoke
normalizer.

`seal` is a **reference definition**. It is published to npm so
developers can generate proofs; it is *not* imported by `workers` or the
dashboard at runtime — the circuit reaches them through the normal
Lemma circuit-registration path.

## The circuit

`seal-identity.circom` proves `SHA-256(apiKey) == keyHash`:

- **Private input** — `keyBits[512]`: the 64-byte ASCII API key as bits.
  Lemma keys are 32 random bytes rendered as 64 hex characters (see the
  workers `generate_api_key.js`).
- **Public input** — `nonce`: the dashboard challenge, bound into the
  constraint system for replay protection.
- **Public output** — `keyHash[256]`: the SHA-256 digest bits.

The hashing matches the workers `middleware/auth.ts`
(`SHA-256(utf8_bytes(apiKey))`), so a proof's `keyHash` is directly
comparable to `api_keys.key_hash`.

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
first run — SHA-256 over a 512-bit pre-image is ~60k constraints.

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
import { generateSealProof } from "@lemmaoracle/seal";

const { proof, publicSignals, keyHash } = await generateSealProof(
  { apiKey: process.env.LEMMA_API_KEY!, nonce: challengeNonce },
  { wasm: "seal-identity.wasm", zkey: "seal-identity_final.zkey" },
);
// POST { proof, publicSignals } to the dashboard sign-in endpoint.
```

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
