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
const weatherSchema = await define<WeatherRaw, WeatherNorm>(schemaMeta.normalize!);

// 3. Encrypt document for a holder
const enc = await encrypt(client, {
  payload: { weather: "rain", temperature: 12, city: "Tokyo" },
  holderKey: "0x1234...", // Holder's public key
});

// 4. Prepare document (normalize + compute commitments)
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
  inputs: { thresholdMet: true },
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
  attributes: ["temperature", "city"], // Only reveal these
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
  hooks: [
    {
      address: "0xabc...",
      method: "processWeatherData",
      abi: ["function processWeatherData(bytes32, uint256)"],
      calldata: "0x...",
    },
  ],
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
