# @lemmaoracle/spec

[![npm version](https://img.shields.io/npm/v/@lemmaoracle/spec)](https://www.npmjs.com/package/@lemmaoracle/spec)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)

Authoritative interface types shared by Lemma SDK and Workers. This package contains TypeScript type definitions and OpenAPI specifications for the Lemma oracle system.

## 📦 Installation

```bash
# Using npm
npm install @lemmaoracle/spec

# Using pnpm
pnpm add @lemmaoracle/spec

# Using yarn
yarn add @lemmaoracle/spec
```

> **Note**: This package is a required dependency for `@lemmaoracle/sdk`.

## 🎯 Overview

`@lemmaoracle/spec` provides:

- **TypeScript type definitions** for all Lemma API interfaces
- **OpenAPI specification** (v2) for the Lemma REST API
- **Shared interfaces** between SDK and backend services
- **Immutable data types** with strict functional programming constraints

## 📖 API Reference

### Core Types

#### Lemma Client

```typescript
export type LemmaClientConfig = Readonly<{
  apiBase: string;
  apiKey?: string;
}>;

export type LemmaClient = LemmaClientConfig &
  Readonly<{
    readonly fetcher?: typeof fetch;
  }>;
```

#### Schema Metadata

```typescript
export type SchemaMeta = Readonly<{
  id: string;
  description?: string;
  normalize: NormalizeArtifact;
  [k: string]: unknown;
}>;

export type NormalizeArtifact = Readonly<{
  artifact: {
    readonly type: "ipfs" | "https";
    readonly wasm: string;
  };
  hash: string;
  abi?: {
    readonly raw: Record<string, string>;
    readonly norm: Record<string, string>;
  };
}>;
```

#### Circuit Metadata

```typescript
export type CircuitMeta = Readonly<{
  circuitId: string;
  schema: string;
  description?: string;
  inputs?: ReadonlyArray<string>;
  verifier?: Readonly<{
    type: "onchain" | "offchain";
    address?: string;
    chainId?: number;
    [k: string]: unknown;
  }>;
  artifact?: Readonly<{ location: CircuitArtifactLocation }>;
  [k: string]: unknown;
}>;
```

#### Document Registration

```typescript
export type RegisterDocumentRequest = Readonly<{
  schema: string;
  docHash: string;
  cid: string;
  issuerId: string;
  subjectId: string;
  commitments: DocumentCommitments;
  revocation: Revocation;
  signature?: IssuerSignature;
  hooks?: ReadonlyArray<OnchainHook>;
}>;

export type RegisterDocumentResponse = Readonly<{
  status: "registered";
  docHash: string;
  [k: string]: unknown;
}>;
```

#### Proof Submission

```typescript
export type SubmitProofRequest = Readonly<{
  docHash: string;
  circuitId: string;
  proof: string;
  inputs: ReadonlyArray<string>;
  disclosure?: SelectiveDisclosure;
  onchain?: boolean;
}>;

export type SubmitProofResponse = Readonly<{
  status: "received" | "verified" | "onchain-verified" | "rejected";
  verificationId: string;
  [k: string]: unknown;
}>;
```

#### Verified Attributes Query

```typescript
export type VerifiedAttributesQueryRequest = Readonly<{
  query: string;
  mode: "natural" | "structured";
  attributes?: ReadonlyArray<Readonly<{ name: string; value: unknown }>>;
  proof?: Readonly<{ required: boolean; type?: "zk-snark" | "opaque" }>;
  targets?: Readonly<{ schemas?: ReadonlyArray<string> } & Record<string, unknown>>;
}>;

export type VerifiedAttributesQueryResponse = Readonly<{
  results: ReadonlyArray<VerifiedAttributesQueryResponseItem>;
}>;
```

### Commitment Schemes

```typescript
export type CommitmentScheme = "poseidon" | "poseidon2" | "rescue-prime" | "sha256-placeholder";

export type DocumentCommitments = Readonly<{
  scheme: CommitmentScheme;
  root: string;
  leaves: ReadonlyArray<string>;
  randomness: string; // bytes32 hex - blinding factor for hiding property
}>;
```

### Selective Disclosure

```typescript
export type SelectiveDisclosure = Readonly<{
  format: "bbs+" | "opaque";
  attributes: Readonly<Record<string, unknown>>;
  proof: string;
}>;
```

## 🔧 Development

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd lemma

# Install dependencies
pnpm install

# Build the spec package
cd packages/spec
pnpm build
```

### OpenAPI Specification

The package includes an OpenAPI v2 specification at `openapi.lemma.v2.json`. This file is automatically included in the npm package and can be used for:

- API documentation generation
- Client SDK generation in other languages
- API validation and testing

### TypeScript Strict Mode

All types use `Readonly<>` and `ReadonlyArray<>` to enforce immutability, following Lemma's functional programming guidelines.

## 📦 Publishing

### Prerequisites

1. npm account with access to `@lemmaoracle` organization
2. Authentication configured (`npm login`)

### Publishing Process

```bash
# Build the package
pnpm build

# Publish to npm
npm publish --access public
```

### Version Management

This package uses semantic versioning. When making breaking changes to types, increment the major version. The SDK depends on specific versions of this package, so coordinate updates accordingly.

## 📄 License

MIT
