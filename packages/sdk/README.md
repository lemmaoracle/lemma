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
- **Verified attributes query** - Query verified attributes with structured queries

> **Note**: Natural language query parsing is available as a separate package: [`@lemmaoracle/parser`](../parser/README.md)

## 🚀 Quick Start

Here's a summary of the most common workflow for using Lemma SDK:

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

// 1. Initialize client
const client = create({ apiBase: "https://api.lemma.xyz", apiKey: "your-api-key" });

// 2. Get and define schema
const schemaMeta = await schemas.getById(client, "dev:weather:v1");
const weatherSchema = await define<WeatherRaw, WeatherNorm>(schemaMeta);

// 3. Encrypt document for a holder
const enc = await encrypt(client, {
  payload: { weather: "rain", temperature: 12, city: "Tokyo" },
  holderKey: "0x1234...", // Holder's secp256k1 compressed public key (hex)
});

// 4. Prepare document (normalize + compute Poseidon Merkle commitments)
const prep = await prepare<WeatherRaw, WeatherNorm>(client, {
  schema: weatherSchema.id,
  payload: rawDoc,
});

// 5. Register document
await documents.register(client, {
  schema: weatherSchema.id,
  docHash: enc.docHash,
  cid: enc.cid,
  issuerId: "weather-issuer",
  subjectId: "tokyo-weather",
  commitments: prep.commitments,
  revocation: { scheme: "none", root: "0x" + "0".repeat(64) },
});

// 6. Generate and submit ZK proof
const zkResult = await prover.prove(client, {
  circuitId: "temperature-threshold",
  witness: {
    /* witness inputs */
  },
});

const proofResult = await proofs.submit(client, {
  docHash: enc.docHash,
  circuitId: "temperature-threshold",
  proof: zkResult.proof,
  inputs: zkResult.inputs,
});

console.log("Document registered:", enc.docHash);
console.log("Proof status:", proofResult.status);
```

## 🛠️ Advanced Usage

### Custom ZK Circuits

```typescript
import { circuits, prover } from "@lemmaoracle/sdk";

await circuits.register(client, {
  circuitId: "custom-threshold",
  schema: "dev:weather:v1",
  description: "Custom threshold circuit",
  artifact: {
    location: { type: "ipfs", wasm: "ipfs://Qm...", zkey: "ipfs://Qm..." },
  },
});

const result = await prover.prove(client, {
  circuitId: "custom-threshold",
  witness: { value: 42, threshold: 40 },
});
```

### Selective Disclosure with BBS+

```typescript
import { disclose } from "@lemmaoracle/sdk";

const { secretKey } = await disclose.generateKeyPair();
const header = new TextEncoder().encode("lemma");

// Issuer signs the attribute document
const document = { city: "Tokyo", temperature: "12", weather: "rain" };
const signed = await disclose.sign(client, {
  messages: disclose.payloadToMessages(document), secretKey, header, issuerId: "weather-issuer",
});

// Holder creates a selective-disclosure proof for `city` and `temperature`
const sd = await disclose.createProof({
  attributes: ["city", "temperature"],
  signed,
});

// Verifier checks the proof envelope
const isValid = await disclose.verifyProof(client, disclose.fromSelectiveDisclosure(sd));
```

### Smart Contract Hooks

```typescript
await documents.register(client, {
  schema: "dev:weather:v1", docHash: enc.docHash, cid: enc.cid,
  issuerId: "weather-issuer", subjectId: "tokyo-weather",
  commitments: prep.commitments,
  revocation: { scheme: "none", root: "0x..." },
  hooks: [{ chainId: 1, address: "0xabc...", method: "processWeatherData", mode: "after-registry" }],
});
```

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

## 📦 Publishing to npm

### Prerequisites

1. npm account with access to `@lemmaoracle` organization
2. Authentication configured (`npm login`)

### Publishing Process

The SDK depends on `@lemmaoracle/spec`, which must be published first:

```bash
# Use the publish script from the repo root
./scripts/publish-npm.sh
```
