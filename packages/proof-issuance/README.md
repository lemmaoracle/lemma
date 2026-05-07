# @lemmaoracle/proof-issuance

Proof Issuance API — x402/Bazaar product concept demo.

**Models change. Proofs remain.** Built for decisions that matter.

## Overview

This package implements the Proof Issuance API concept demo (Asset #4) as a monorepo package within the Lemma ecosystem. It provides:

- An x402 payment-enabled proof issuance endpoint (`POST /v1/proofs/issue`)
- Bazaar discovery extension for automatic catalog listing
- Mock BBS+/Poseidon proof generation (architecture reads through)
- Industry-specific schema support (financial, manufacturing, agent)
- Health check and proof retrieval endpoints

## Stage

**Stage A (Sepolia trial)** — testnet Bazaar automatic listing.

- Stage B (mainnet $0.001/proof): planned 7/10
- Stage C (price discovery 90 days): planned 7/24

## Quick Start

```bash
# Install dependencies
pnpm install

# Run the server
pnpm dev

# Run tests
pnpm test
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/health` | Health check |
| `GET` | `/v1/discover` | x402 discovery extension |
| `POST` | `/v1/proofs/issue` | Issue a proof (x402 payment) |
| `GET` | `/v1/proofs/:id` | Retrieve a proof |

### Issue a Proof

```bash
curl -X POST http://localhost:8787/v1/proofs/issue \
  -H "Content-Type: application/json" \
  -d '{
    "schema_ref": "https://schemas.lemma.frame00.com/v0/financial/transaction-decision",
    "model_attestation": {
      "model_id": "fin-decision-v3",
      "model_version": "3.2.1",
      "model_hash": "0xabcdef..."
    },
    "input_attestation": { "input_hash": "0x123..." },
    "output_attestation": { "output_hash": "0x456..." }
  }'
```

## Supported Schemas

- `financial/transaction-decision` — Financial transaction decision attestation
- `manufacturing/quality-decision` — Manufacturing quality decision attestation
- `agent/action-decision` — Agent action decision attestation

## Architecture

```
Client                    API Server               x402 Facilitator
  │                          │                          │
  │  POST /v1/proofs/issue   │                          │
  │ ─────────────────────────>                          │
  │                          │                          │
  │  402 Payment Required    │                          │
  │ <─────────────────────────                          │
  │                          │                          │
  │  Pay via x402 ──────────────────────────────────────>
  │                          │                          │
  │                          │  Payment confirmed       │
  │                          │ <─────────────────────────
  │                          │                          │
  │                          │  Issue proof (mock BBS+) │
  │                          │ ───                      │
  │  Proof response          │                          │
  │ <─────────────────────────                          │
```

## Functional Programming

This package follows Lemma's functional programming rules:
- Pure functions, no classes, no mutation
- `Readonly<>` and `ReadonlyArray<>` throughout
- Ramda for branching and data transformation
- Tests exempt from FP rules per AGENTS.md

## Related

- Asset #1: [Sample Attribute Schemas](https://github.com/lemmaoracle/example-schema)
- Asset #2: [Provenance Verification Demo](https://github.com/lemmaoracle/example-provenance-demo)
- x402 Bazaar: [x402.org](https://x402.org)
