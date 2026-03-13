# @lemmaoracle/sdk

[![npm version](https://img.shields.io/npm/v/@lemmaoracle/sdk)](https://www.npmjs.com/package/@lemmaoracle/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)

The TypeScript SDK for Lemma - a zero-knowledge based general-purpose document oracle. Built with functional programming principles and designed for privacy-preserving document verification.

## 📦 Installation

```bash
# Using npm
npm install @lemmaoracle/sdk @lemmaoracle/spec

# Using pnpm
pnpm add @lemmaoracle/sdk @lemmaoracle/spec

# Using yarn
yarn add @lemmaoracle/sdk @lemmaoracle/spec
```

> **Note**: `@lemmaoracle/spec` is a required peer dependency containing shared TypeScript interfaces.


## 🎯 Overview

The Lemma SDK provides a functional, immutable API for:

- **Document encryption & registration** - Securely encrypt and register documents
- **Zero-knowledge proof generation** - Create and verify ZK proofs without revealing underlying data
- **Selective disclosure** - Prove or reveal only specific attributes using BBS+ signatures
- **Schema management** - Define and work with custom document schemas
- **Circuit integration** - Register and use custom ZK circuits for predicate verification

## 🚀 Quick Start

### Basic Usage

```typescript
import {
  create,
  define,
  encrypt,
  prepare,
  schemas,
  documents,
  prover,
  proofs,
} from "@lemmaoracle/sdk";

// Create a client instance
const client = create({
  apiBase: "https://api.lemma.xyz",
  apiKey: "your-api-key-here",
});

// 1. Define schema (after fetching metadata)
const schemaMeta = await schemas.getById(client, "dev:weather:v1");
const weatherSchema = await define<WeatherRaw, WeatherNorm>(schemaMeta.normalize!);

// 2. Encrypt document
const rawDoc = {
  weather: "rain",
  temperature: 12,
  city: "Tokyo",
};
const enc = await encrypt(client, {
  payload: rawDoc,
  holderKey: "0x1234...", // Holder's public key
  algorithm: "aes-256-gcm",
});

// 3. Prepare (normalize + compute commitments)
const prep = await prepare<WeatherRaw, WeatherNorm>(client, {
  schema: weatherSchema.id,
  payload: rawDoc,
});

// 4. Register document
await documents.register(client, {
  schema: weatherSchema.id,
  docHash: enc.docHash,
  cid: enc.cid,
  issuerId: "weather-issuer",
  subjectId: "tokyo-weather",
  commitments: {
    attrCommitmentRoot: prep.commitments.attrCommitmentRoot,
    perAttributeCommitments: prep.commitments.perAttributeCommitments,
    scheme: "poseidon",
  },
  revocation: {
    revocationRoot: "0x0",
    scheme: "bitmask-merkle-v1",
  },
});

// 5. Generate ZK proof
const zkResult = await prover.prove(client, {
  circuitId: "temperature-threshold",
  witness: {
    temperature_bucket: prep.normalized.temperature_bucket,
    randomness: prep.commitments.randomness,
    attr_commitment_root: prep.commitments.attrCommitmentRoot,
    // ... other witness inputs
  },
});

// 6. Submit proof
const proofResult = await proofs.submit(client, {
  docHash: enc.docHash,
  circuitId: "temperature-threshold",
  proofBytes: zkResult.proofBytes,
  publicInputs: zkResult.publicInputs,
  verifyOnchain: true,
});

console.log("Document registered:", enc.docHash);
console.log("Proof status:", proofResult.status);
```

### Working with Schemas

```typescript
import { define, schemas } from "@lemmaoracle/sdk";

// 1. Register schema metadata (with WASM normalize artifact)
await schemas.register(client, {
  id: "dev:weather:v1",
  description: "Weather data normalization schema",
  normalize: {
    artifact: {
      type: "ipfs",
      wasm: "ipfs://Qm...-normalize.wasm",
    },
    hash: "0xabc123...", // SHA-256 of the WASM binary
    abi: {
      raw: { weather: "string", temperature: "u32", city: "string" },
      norm: { weather_bucket: "string", temperature_bucket: "string" },
    },
  },
});

// 2. Fetch schema metadata
const schemaMeta = await schemas.getById(client, "dev:weather:v1");

// 3. Define schema (downloads WASM, verifies hash, instantiates)
type WeatherRaw = { weather: string; temperature: number; city: string };
type WeatherNorm = { weather_bucket: string; temperature_bucket: string };

const weatherSchema = await define<WeatherRaw, WeatherNorm>(schemaMeta.normalize!);
// weatherSchema.id → "dev:weather:v1"
// weatherSchema.normalize → WASM-backed normalization function
```

## 📖 API Reference

### Core Functions

#### `create(config: LemmaClientConfig): LemmaClient`

Creates a Lemma client instance.

```typescript
const client = create({
  apiBase: "https://api.lemma.xyz",
  apiKey: "your-api-key",
  fetchFn: fetch, // Optional custom fetch implementation
});
```

#### `define<Raw, Norm>(artifact: NormalizeArtifact): Promise<SchemaDef<Raw, Norm>>`

Defines a schema by downloading and verifying WASM normalize artifact.

```typescript
// 1. Fetch schema metadata (includes NormalizeArtifact)
const schemaMeta = await schemas.getById(client, "user-kyc-v1");

// 2. Download WASM, verify SHA-256, instantiate, register
const userKycSchema = await define<UserKycRaw, UserKycNorm>(schemaMeta.normalize!);
// userKycSchema.id        → "user-kyc-v1"
// userKycSchema.normalize → function backed by the WASM module
```

`define` downloads the WASM binary from `artifact.wasm`, verifies `SHA-256(binary) === hash`, instantiates the WASM module, wraps its exported `normalize` function, and registers the resulting `SchemaDef<Raw, Norm>` into the internal mutable schema registry keyed by `id`. Rejects if SHA-256 verification fails or the WASM module does not export a `normalize` function.

#### `encrypt(client: LemmaClient, input: EncryptInput): Promise<EncryptOutput>`

Encrypts a document for a specific holder and returns docHash, CID, and encrypted document.

```typescript
type EncryptionAlgorithm = "aes-256-gcm"; // default; additional algorithms reserved for future use

const enc = await encrypt(client, {
  payload: rawDoc,
  holderKey: holderPubKey,
  algorithm: "aes-256-gcm", // optional — defaults to "aes-256-gcm"
});
// enc.docHash            → Hash of the document (on-chain primary key)
// enc.cid                → CID of the encrypted document on IPFS/Ceramic
// enc.encryptedDocBase64 → Base64-encoded encrypted document
// enc.algorithm          → Encryption algorithm used (e.g., "aes-256-gcm")
```

The optional `algorithm` field selects the AEAD cipher used to encrypt `rawDoc`. When omitted, `"aes-256-gcm"` is applied.

#### `decrypt(input: DecryptInput): Promise<DecryptOutput>`

Decrypts a document (holder only).

```typescript
const decrypted = await decrypt({
  encryptedDocBase64: "base64-encoded-encrypted-document",
  holderPrivateKey: "holder-private-key",
  algorithm: "aes-256-gcm", // optional — needed for future algorithm support
});
// decrypted.payload → original document object
```

#### `prepare<Raw, Norm>(client: LemmaClient, input: PrepareInput<Raw>): Promise<PrepareOutput<Norm>>`

Normalizes a document and computes Poseidon Merkle commitments.

```typescript
const prep = await prepare<UserKycRaw, UserKycNorm>(client, {
  schema: userKycSchema.id, // "user-kyc-v1"
  payload: rawDoc,
});
// prep.normalized   → Normalized attributes (e.g., { age_bucket: "adult", country: "JP" })
// prep.commitments  → { scheme, attrCommitmentRoot, perAttributeCommitments, randomness }
```

`prepare` internally resolves the schema via `getSchemaById`, runs `normalize`, and computes Poseidon-based commitments:

1. Generates 32 bytes of cryptographic randomness.
2. For each normalized field `(key_i, value_i)`, computes `leaf_i = Poseidon(key_i, value_i, randomness)`.
3. Constructs a binary Merkle tree over all leaves using Poseidon as the internal hash.
4. Returns `attrCommitmentRoot` (the Merkle root), `perAttributeCommitments` (the leaf array), and `randomness`.

The `commitments` output includes `scheme: "poseidon"` by default. If the schema is not found, the promise is rejected with `"Unknown schemaId: "…". Call define() first."`.

### Namespace APIs

#### `documents`

- **`register(client, request): Promise<RegisterDocumentResponse>`**
  Register a document.

```typescript
await documents.register(client, {
  schema: userKycSchema.id,
  docHash: enc.docHash,
  cid: enc.cid,
  issuerId: "issuer-1",
  subjectId: "subject-1",
  commitments: {
    attrCommitmentRoot: prep.commitments.attrCommitmentRoot,
    perAttributeCommitments: prep.commitments.perAttributeCommitments,
    scheme: "poseidon",
  },
  revocation: {
    revocationRoot: "0x0",
    scheme: "bitmask-merkle-v1",
  },
  signature: {
    format: "bbs+",
    payload: "...", // hex-encoded BBS+ signature
    issuerId: "issuer-1",
  },
  onchainHooks: [
    {
      chainId: 1,
      contractAddress: "0xYourHookContract...",
      method: "onLemmaDocumentRegistered",
      mode: "after-registry",
      payload: "registry-public-inputs",
    },
  ],
});
```

The response type is `RegisterDocumentResponse` with `status: "registered"` and `docHash`.

> **Note:** Only `attrCommitmentRoot` is written on-chain (bytes32). `perAttributeCommitments` is stored off-chain for use as ZK circuit witnesses. This keeps on-chain storage cost constant regardless of attribute count.

#### `proofs`

- **`submit(client, request): Promise<SubmitProofResponse>`**
  Submit a ZK proof and/or selective disclosure proof for verification.

```typescript
const proofResult = await proofs.submit(client, {
  docHash: enc.docHash,
  circuitId: "age-over-18",
  proofBytes: zkResult.proofBytes,
  publicInputs: zkResult.publicInputs,
  selectiveDisclosure: {
    format: "bbs+",
    disclosedAttributes: revealed.disclosed,
    proof: sd.proof,
  },
  verifyOnchain: true,
});
// proofResult.status         → "received" | "verified" | "onchain-verified" | "rejected"
// proofResult.verificationId → unique verification identifier
```

The `SubmitProofResponse` includes a `status` field with four possible values and a `verificationId`.

#### `schemas`

- **`register(client, request): Promise<void>`**
  Register schema metadata (with required normalize artifact).

```typescript
await schemas.register(client, {
  id: "user-kyc-v1",
  description: "KYC schema with age bucketing",
  normalize: {
    artifact: {
      type: "ipfs",
      wasm: "ipfs://Qm...-normalize.wasm",
    },
    hash: "0xabc123...", // SHA-256 of the WASM binary
    abi: {
      // optional
      raw: { age: "u32", country: "string" },
      norm: { age_bucket: "u8", country: "string" },
    },
  },
});
```

- **`getById(client, schemaId): Promise<SchemaMeta>`**
  Retrieve schema metadata (includes normalize artifact).

```typescript
const schemaMeta = await schemas.getById(client, "user-kyc-v1");
// schemaMeta.id          → "user-kyc-v1"
// schemaMeta.description → "KYC schema with age bucketing"
// schemaMeta.normalize   → NormalizeArtifact
```

The `normalize` field in `schemas.register` is **required**. Every schema must publish a WASM normalize artifact so that `define` can resolve and verify it.

#### `circuits`

- **`register(client, request): Promise<void>`**
  Register ZK circuit metadata.

```typescript
await circuits.register(client, {
  circuitId: "age-over-18",
  schema: "user-kyc-v1",
  description: "age >= 18",
  publicInputs: ["attr_commitment_root"],
  verifier: { type: "onchain", contractAddress: "0xVerifier...", chainId: 1 },
  artifact: {
    location: {
      type: "ipfs",
      wasm: "ipfs://Qm...-age18.wasm",
      zkey: "ipfs://Qm...-age18.zkey",
    },
  },
});
```

- **`getById(client, circuitId): Promise<CircuitMeta>`**
  Retrieve circuit metadata.

#### `generators`

- **`register(client, request): Promise<void>`**
  Register document generator metadata.

```typescript
await generators.register(client, {
  generatorId: "dev:yourApp:kyc-fetch-v1",
  schema: "user-kyc-v1",
  description: "...",
  language: "typescript",
  source: { type: "url", uri: "https://..." },
  inputsSpec: { subjectId: "string" },
  outputsSpec: { raw_document: "UserKycRaw", schema: "user-kyc-v1" },
});
```

- **`getById(client, generatorId): Promise<GeneratorMeta>`**
  Retrieve generator metadata.

#### `attributes`

- **`query(client, request): Promise<VerifiedAttributesQueryResponse>`**
  Query verified attributes (for AI/RAG systems).

```typescript
const results = await attributes.query(client, {
  query: "users over 18 in Japan",
  mode: "natural", // "natural" | "structured"
  proof: { required: true, type: "zk-snark" }, // type: "zk-snark" | "opaque"
  targets: {
    schemas: ["user-kyc-v1"],
  },
});
```

The response type `VerifiedAttributesQueryResponse` contains a `results` array where each item includes:

```typescript
type VerifiedAttributesQueryResponseItem = Readonly<{
  docHash: string;
  schema: string;
  issuerId: string;
  subjectId: string;
  attributes: Record<string, unknown>;
  proof?: { status?: string; circuitId?: string };
  selectiveDisclosure?: SelectiveDisclosure;
}>;
```

`attributes.query` allows AI/RAG systems and applications to retrieve verified attributes. Results include verified attributes, proof status, and selective disclosure information for each subject.

#### `disclose`

BBS+ selective disclosure utilities (IETF draft-irtf-cfrg-bbs-signatures).

- **`generateKeyPair(options?): Promise<KeyPair>`**
  Create a BBS+ key pair using a random 32-byte seed.

```typescript
const kp = await disclose.generateKeyPair();
// kp.secretKey → Uint8Array (32 bytes)
// kp.publicKey → Uint8Array (96 bytes)
```

- **`payloadToMessages(payload): ReadonlyArray<string>`**
  Convert an attribute object to a deterministically-sorted array of `"key:value"` strings.

```typescript
const messages = disclose.payloadToMessages({ age: 25, name: "Alice", country: "JP" });
// → ["age:25", "country:JP", "name:Alice"]  (sorted by key)
```

- **`sign(client, input): Promise<SignOutput>`**
  BBS+ signing (messages, secretKey, header, issuerId).

```typescript
const signed = await disclose.sign(client, {
  messages, // ReadonlyArray<string> from payloadToMessages
  secretKey: kp.secretKey, // Issuer's BBS+ secret key
  header: new TextEncoder().encode("my-app-header"),
  issuerId: "issuer-1",
});
// signed.signature  → Uint8Array (BBS+ signature)
// signed.messages   → original messages array
// signed.publicKey  → Uint8Array (derived from secretKey)
// signed.header     → Uint8Array
// signed.issuerId   → string
```

- **`verify(client, signOutput): Promise<boolean>`**
  Verify a BBS+ signature.

```typescript
const valid = await disclose.verify(client, signed);
// valid → boolean
```

- **`reveal(client, input): Promise<RevealOutput>`**
  Selective disclosure proof (by disclosedIndexes, not attribute names).

```typescript
const revealed = await disclose.reveal(client, {
  signature: signed.signature, // from sign output
  messages, // original messages
  publicKey: signed.publicKey, // issuer's public key
  disclosedIndexes: [0, 2], // indexes to reveal (not attribute names)
  header: signed.header,
});
// revealed.disclosed          → { age: "25", name: "Alice" }
// revealed.proof              → Uint8Array (BBS+ derived proof)
// revealed.disclosedIndexes   → [0, 2]
// revealed.disclosedMessages  → ["age:25", "name:Alice"]
```

- **`verifyProof(client, input): Promise<boolean>`**
  Verify a selective disclosure proof.

- **`toSelectiveDisclosure(output): SelectiveDisclosure`**
  Wrap RevealOutput into spec SelectiveDisclosure type.

```typescript
const sd = disclose.toSelectiveDisclosure(revealed);
// sd.format              → "bbs+"
// sd.disclosedAttributes → { age: "25", name: "Alice" }
// sd.proof               → hex-encoded string
```

- **`messagesToDisclosedMap(msgs, idxs): Record<string, string>`**
  Reconstruct disclosed attribute map from messages array and indexes.

#### `prover`

ZK proof generation utilities.

- **`prove(client, request): Promise<ProveOutput>`**
  Generate a ZK proof locally using circuit metadata (`wasm`/`zkey` resolved from `circuitId`).

```typescript
const zkResult = await prover.prove(client, {
  circuitId: "age-over-18",
  witness: {
    age_bucket: prep.normalized.age_bucket,
    randomness: prep.commitments.randomness,
    attr_commitment_root: prep.commitments.attrCommitmentRoot,
    // Merkle path for the attribute(s) referenced by this circuit
    leaf: prep.commitments.perAttributeCommitments[0],
    path_elements: "...",
    path_indices: "...",
  },
});
// zkResult.proofBytes    → ZK proof (base64 string in dev, binary in production)
// zkResult.publicInputs  → Array of public inputs (extracted from witness.attr_commitment_root)
```

The SDK's local-dev prover generates a SHA-256 hash as a placeholder proof. Production would use snarkjs with `wasm`/`zkey` resolved from circuit metadata `artifact.location`.

## 🛠️ Advanced Usage

### Custom ZK Circuits

```typescript
import { circuits, prover } from "@lemmaoracle/sdk";

// Register a custom circuit
await circuits.register(client, {
  circuitId: "custom-threshold",
  artifact: {
    type: "ipfs",
    wasm: "Qm...", // IPFS CID of circuit WASM
    provingKey: "Qm...", // Proving key CID
    verificationKey: "Qm...", // Verification key CID
  },
  description: "Custom threshold circuit",
});

// Generate proof using custom circuit
const proof = await prover.generateProof({
  circuitId: "custom-threshold",
  privateInputs: { value: 42, threshold: 40 },
  publicInputs: { thresholdMet: true },
});
```

### Selective Disclosure with BBS+

```typescript
import { disclose } from "@lemmaoracle/sdk";

// Create a selective disclosure proof
const sdProof = await disclose.createProof({
  document: {
    /* signed document */
  },
  disclosedAttributes: ["temperature", "city"], // Only reveal these
  signerPubKey: "issuer-public-key",
  holderPrivKey: "holder-private-key",
});

// Verify the disclosure proof
const isValid = await disclose.verifyProof(sdProof);
```

### Smart Contract Hooks

```typescript
// Register document with on-chain hook
await documents.register(client, {
  rawDoc: {
    /* ... */
  },
  holderPubKey: "0x...",
  schemaId: "dev:weather:v1",
  onchainHooks: [
    {
      contractAddress: "0xabc...",
      method: "processWeatherData",
      abi: ["function processWeatherData(bytes32, uint256)"],
      calldata: "0x...",
    },
  ],
});
```

## 📋 API Summary

| Function                                      | Description                                                                                                     |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `create(config)`                              | Generate client configuration                                                                                   |
| `define<Raw, Norm>(artifact)`                 | Download WASM, verify SHA-256, instantiate, register schema                                                     |
| `encrypt(client, input)`                      | Encryption + docHash/cid/encryptedDocBase64/algorithm retrieval (`algorithm` optional, default `"aes-256-gcm"`) |
| `prepare(client, input)`                      | Normalization + Poseidon Merkle commitment (auto `scheme: "poseidon"`)                                          |
| `disclose.generateKeyPair(options?)`          | BBS+ key pair generation (32B secret, 96B public)                                                               |
| `disclose.payloadToMessages(payload)`         | Attribute object → sorted `"key:value"` messages                                                                |
| `disclose.sign(client, input)`                | BBS+ signing (messages, secretKey, header, issuerId)                                                            |
| `disclose.verify(client, signOutput)`         | Verify BBS+ signature                                                                                           |
| `disclose.reveal(client, input)`              | Selective disclosure proof (by disclosedIndexes)                                                                |
| `disclose.verifyProof(client, input)`         | Verify selective disclosure proof                                                                               |
| `disclose.toSelectiveDisclosure(output)`      | Wrap RevealOutput into spec SelectiveDisclosure                                                                 |
| `disclose.messagesToDisclosedMap(msgs, idxs)` | Reconstruct disclosed attribute map                                                                             |
| `documents.register(client, payload)`         | Document registration                                                                                           |
| `prover.prove(client, payload)`               | Local ZK proof generation                                                                                       |
| `proofs.submit(client, payload)`              | ZK proof + SD proof submission                                                                                  |
| `schemas.register(client, payload)`           | Schema metadata registration (+ required normalize artifact)                                                    |
| `schemas.getById(client, id)`                 | Schema retrieval (includes normalize artifact)                                                                  |
| `circuits.register(client, payload)`          | Circuit registration                                                                                            |
| `circuits.getById(client, id)`                | Circuit retrieval                                                                                               |
| `generators.register(client, payload)`        | Generator registration                                                                                          |
| `generators.getById(client, id)`              | Generator retrieval                                                                                             |
| `attributes.query(client, payload)`           | Verified attributes query                                                                                       |

## 🔧 Development

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd lemma

# Install dependencies
pnpm install

# Build the SDK
cd packages/sdk
pnpm build

# Run tests
pnpm test
```

### Coding Standards

The SDK follows strict functional programming principles:

- **No `if`/`switch` statements** - Use `R.cond`, `R.ifElse`, or ternary expressions
- **No `let`/`var`** - Only `const` declarations
- **No classes** - Use plain objects and functions
- **No `for`/`while` loops** - Use `R.map`, `R.reduce`, `R.filter`
- **No `throw` in sync code** - Return `Promise.reject()` for async errors
- **Immutable data** - All types use `Readonly<>` and `ReadonlyArray<>`

Example functional pattern:

```typescript
// ✅ Correct (functional style)
const processValue = R.cond([
  [R.lt(R.__, 0), R.always("negative")],
  [R.equals(0), R.always("zero")],
  [R.T, R.always("positive")],
]);

// ❌ Incorrect (imperative style)
if (value < 0) return "negative";
else if (value === 0) return "zero";
else return "positive";
```

### TypeScript Configuration

The SDK uses strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true
  }
}
```

## 📦 Publishing to npm

### Prerequisites
1. npm account with access to `@lemmaoracle` organization
2. Authentication configured (`npm login`)

### Publishing Process

The SDK depends on `@lemmaoracle/spec`, which must be published first:

```bash
# Build both packages
pnpm build

# Publish spec package first
cd packages/spec
npm publish --access public

# Publish SDK package
cd ../sdk
npm publish --access public
```

### Version Management

Both packages use semantic versioning (`0.1.0`). When making changes:

1. Update version in both `package.json` files
2. Update SDK's dependency version to match spec version
3. Run `pnpm install` to update lockfile
4. Publish spec first, then SDK

### Development vs Production

For local development, the packages use workspace dependencies (`workspace:*`). Before publishing:

1. Update SDK's `package.json` dependency from `workspace:*` to the actual version (e.g., `^0.1.0`)
2. Ensure spec package's `private` flag is removed
3. Build and test both packages

An automated publish script is recommended to handle these steps.
