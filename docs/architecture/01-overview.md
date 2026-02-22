# Architecture Overview

Lemma is a ZK-based general-purpose document oracle. The codebase is split into:

## Monorepo (`lemma`)

1. **`packages/spec`** — Shared TypeScript types + OpenAPI 3.0 JSON.
   Single source of truth for the SDK ↔ Workers interface contract.
2. **`packages/sdk`** — Pure-functional TypeScript SDK implementing all
   whitepaper §4 APIs (`create`, `define`, `encrypt`, `prepare`, `disclose.*`,
   `documents.*`, `prover.*`, `proofs.*`, `schemas.*`, `circuits.*`,
   `generators.*`, `attributes.*`).
3. **`packages/contracts`** — Solidity contracts: `LemmaRegistry` for on-chain
   provenance (§2.7, §3.1 Layer 1).

## Separate repo (`workers`)

Cloudflare Workers REST API implementing §3.1 Layer 4 endpoints:
`/v1/schemas`, `/v1/circuits`, `/v1/doc-generators`, `/v1/documents`,
`/v1/proofs`, `/v1/verified-attributes/query`, `/v1/health`.

## Whitepaper 5-layer model mapping

| Layer                     | Component                   | Location                     |
| :------------------------ | :-------------------------- | :--------------------------- |
| L1: On-Chain Provenance   | LemmaRegistry, ZK Verifiers | `packages/contracts`         |
| L2: Off-Chain Storage     | IPFS/Ceramic (external)     | —                            |
| L3: Encrypted Index / ZK  | ZK Prover/Verifier          | `packages/sdk` (local prove) |
| L4: Oracle Core / Gateway | REST API, registries        | `workers`                    |
| L5: Client / AI / dApps   | SDK consumers               | `packages/sdk`               |
