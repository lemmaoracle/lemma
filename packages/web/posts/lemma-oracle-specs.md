---
slug: "lemma-oracle-specs"
date: "2026.02.24"
category: "Foundations"
title: "Lemma Oracle Specs"
abstract: "A framework for modeling decision systems that operate across extended timeframes where information asymmetry compounds with each step."
---

## Lemma Overview

Lemma is a mathematically guaranteed truth layer that lets AI reason over verified data without exposing the underlying sensitive content. It acts as a high‑trust storage and reference layer for mission‑critical data rather than a universal wrapper for all AI interactions.

AI agents access Lemma via MCP as a reliable data source for use cases like safety‑critical workflows, fair rights management, and accurate responses based on cryptographically verified facts.

### Key Features and Benefits

- Full transparency across the entire data lifecycle, ensuring auditability and trust.
- Tamper resistance so AI systems always read from integrity‑protected data.
- Strong privacy guarantees that keep confidential information encrypted while preserving security and correctness.

### Technical Foundations

- **Zero‑knowledge proofs**: Arbitrary JSON documents (e.g., contracts, logs, applications) remain encrypted while Lemma only proves whether they satisfy specific conditions. Combined with blockchains, this provides confidentiality, condition satisfaction claims, and public, tamper‑evident provenance.
- **Selective disclosure (BBS+)**: Documents are signed so that holders can reveal only selected fields while proving the entire document is authentic. This enables role‑based and party‑specific partial disclosure without leaking unrelated data.
- **Commitments**: Each attribute is stored as a cryptographic commitment, enabling zero‑knowledge queries such as membership in a category or range without decryption. Combined with selective disclosure, content can be revealed and used for training or inference only when appropriate agreements are in place.

## Spec summary

- **Document model**
  - Handles arbitrary JSON documents, including but not limited to W3C VCs (e.g. weather data, KYC results, medical metrics).
  - Documents are encrypted (AES-GCM over a hybrid ECDH+HKDF key) and stored off-chain on IPFS/Ceramic; Lemma only sees `docHash` and `cid`.
- **Schemas and normalization**
  - Per `schemaId`, you define `Raw`, `Norm`, and `normalize: Raw -> Norm` so that comparisons and proofs operate on a normalized attribute space (e.g. bucketing age, temperature).
  - Normalization runs client-side; Lemma only trusts commitments, ZK proofs, and registry metadata, not your normalize code itself.
- **Commitments and ZK**
  - Normalized attributes are committed via Pedersen + Merkle to produce `attrCommitmentRoot` and per-attribute commitments used as ZK witnesses/public inputs.
  - Arbitrary ZK circuits (Circom, Halo2, etc.) are supported via metadata that links a `circuitId` to schema, public inputs, verifier (on/off-chain), and artifacts (`wasm`, `zkey` on IPFS/HTTPS).
- **Selective disclosure (BBS+)**
  - Issuer BBS+ signs the raw document; Holder creates proofs that reveal only selected attributes, abstracted in the API so it can later support SD-JWT, etc.
  - Lemma verifies that disclosed attributes are indeed part of the signed document by combining stored signature metadata and selective-disclosure proof.
- **On-chain provenance and hooks**
  - `LemmaRegistry` contracts store `docHash`, `attrCommitmentRoot`, schema, issuer/subject IDs, revocation data, and link to verifier contracts.
  - Optional smart-contract hooks can be executed at document registration, receiving the same provenance (public inputs) as the registry call.
- **Architecture and trust**
  - 5 layers: on-chain provenance, off-chain encrypted storage, encrypted index/ZK, oracle core/registries/query gateway, and client/AI/dApps.
  - Lemma’s trust boundary excludes client code; it relies on ZK proofs, commitments, issuer signatures, and on-chain registry/verifier correctness.

---

## Use-Cases

### DeFi Private Lending & Under-Collateralized Loans

- **Problem:** DeFi is trapped in over-collateralization — no way to assess off-chain credit on-chain.
- **Solution:** Borrowers store encrypted income/credit data in Khaos; protocols verify "score ≥ 700" via ZK — zero raw financials exposed.
- **Impact:** Under-collateralized DeFi loans become real, bridging TradFi credit into on-chain markets.

### DeFi Compliance — Privacy-Preserving KYC/AML

- **Problem:** Regulators demand KYC/AML; storing user PII on-chain destroys privacy.
- **Solution:** One-time off-chain KYC → Khaos issues a ZK credential: "verified, not sanctioned" — no name or passport revealed.
- **Impact:** AML/CFT + GDPR satisfied simultaneously; permissionless DeFi access preserved.

### RWA — Tokenization of Real-World Assets

- **Problem:** On-chaining real estate, securities, or commodities demands strict KYC and ownership proof — but full disclosure on a public ledger is a non-starter.
- **Solution:** Issuers and custodians store encrypted ownership/compliance data in Khaos; RWA protocols verify "wallet is KYC'd and owns asset X" via ZK — no identity or balance sheet exposed.
- **Impact:** Compliant, privacy-preserving RWA issuance, transfer, and collateralized lending — institutional-grade without the data risk.

### Autonomous AI Agent Settlement & Personal Data

- **Problem:** AI agents trading on users' behalf must settle payments and respect personal constraints (risk limits, budgets, KYC) — without leaking private data to counterparties.
- **Solution:** User constraints and KYC credentials live in Khaos; agents attach ZK proofs ("within risk limits," "counterparty is compliant") to every trade or settlement instruction.
- **Impact:** Fully autonomous, policy-compliant agent-to-agent commerce — every decision verifiable, every identity shielded.

### KYC, Identity & Credential Attestation

- **Problem:** Users re-submit the same PII to every service, multiplying breach risk.
- **Solution:** Register once in Khaos; prove "age ≥ 20" or "holds license X" via ZK — no raw data shared.
- **Impact:** One registration, unlimited privacy-preserving verifications across all services.

### Sensitive Data Screening — Payroll, Health & Loans

- **Problem:** Loan and insurance reviews force disclosure of exact salaries and diagnoses.
- **Solution:** Signed records stored in Khaos; reviewers check only "income ≥ ¥5M" or "no re-exam" via ZK.
- **Impact:** Eligibility proven; actual figures never leave the vault.

### Protecting Originality & Compensating Data Creators

- **Problem:** AI training lacks verifiable provenance and fair creator compensation.
- **Solution:** Creators register signed metadata in Khaos; AI operators verify rights via ZK before access.
- **Impact:** Originality proof + usage audit trail + payment distribution — one platform, clean-data marketplace ready.

### Verified Information for AI / RAG

- **Problem:** AI chatbots cite outdated, unreviewed, or restricted documents.
- **Solution:** Per-document metadata (version, review status, classification) served as ZK-proven attributes.
- **Impact:** RAG uses only verified sources; restricted content invisible to unauthorized queries.

### Attribute-Based Access Control

- **Problem:** Every app gets a copy of HR/org data just to authorize users.
- **Solution:** Attributes (role, department, clearance) live in Khaos; access rights verified via ZK — no PII hits the app.
- **Impact:** True zero-trust: "Service A sees department only; Service B sees role only".

66

---

## Minimal developer workflow (simplified)

### 1. Install and initialize

```shellscript
npm install @lemmaoracle/sdk
```

```typescript
import { create } from "@lemmaoracle/sdk";

const client = create({
  apiBase: "https://api.lemma.example.com",
  apiKey: process.env.LEMMA_API_KEY!,
});
```

### 2. Define schema and normalization

```typescript
import { define } from "@lemmaoracle/sdk";

type UserKycRaw = { age: number; country: string };
type UserKycNorm = { age_bucket: "adult" | "minor"; country: string };

const userKycSchema = define<UserKycRaw, UserKycNorm>({
  id: "user-kyc-v1",
  normalize: (raw) => ({
    age_bucket: raw.age >= 18 ? "adult" : "minor",
    country: raw.country,
  }),
});
```

### 3. Encrypt and prepare

```typescript
import { encrypt, prepare } from "@lemmaoracle/sdk";

const rawDoc: UserKycRaw = { age: 25, country: "JP" };
const holderPubKey = "...";

const enc = await encrypt(client, {
  payload: rawDoc,
  holderKey: holderPubKey,
});
// enc.docHash, enc.cid

const prep = await prepare<UserKycRaw, UserKycNorm>(client, {
  schema: userKycSchema.id,
  payload: rawDoc,
});
// prep.normalized, prep.commitments
```

One line explanation: `encrypt` returns `docHash`/`cid`, and `prepare` returns normalized attributes plus commitments.

### 4. Sign and create selective disclosure

```typescript
import { disclose } from "@lemmaoracle/sdk";

const issuerPrivateKey = "...";

const signed = await disclose.sign(client, {
  payload: rawDoc,
  issuerKey: issuerPrivateKey,
});
// signed.signature

const sd = await disclose.reveal(client, {
  signedPayload: signed.signature,
  attributes: ["age"],
});
// sd.disclosed, sd.proof
```

### 5. Register document (options trimmed)

```typescript
import { documents } from "@lemmaoracle/sdk";

await documents.register(client, {
  schema: userKycSchema.id,
  docHash: enc.docHash,
  cid: enc.cid,
  commitments: {
    attrCommitmentRoot: prep.commitments.attrCommitmentRoot,
  },
  signature: {
    format: "bbs+",
    payload: signed.signature,
    issuerId: "issuer-1",
  },
});
```

Non-essential options such as detailed revocation settings and onchainHooks are omitted here.

### 6. Generate and submit proof (options trimmed)

```typescript
import { prover, proofs } from "@lemmaoracle/sdk";

const zkResult = await prover.prove(client, {
  circuitId: "age-over-18",
  witness: {
    age_bucket: prep.normalized.age_bucket,
    randomness: prep.commitments.randomness,
    attr_commitment_root: prep.commitments.attrCommitmentRoot,
  },
});
// zkResult.proofBytes, zkResult.publicInputs
```

```typescript
await proofs.submit(client, {
  docHash: enc.docHash,
  circuitId: "age-over-18",
  proofBytes: zkResult.proofBytes,
  publicInputs: zkResult.publicInputs,
  selectiveDisclosure: {
    format: "bbs+",
    disclosedAttributes: sd.disclosed,
    proof: sd.proof,
  },
});
```

Here we keep only the core fields needed to attach the proof and link it to the document.

### 7. Query verified attributes

```typescript
import { attributes } from "@lemmaoracle/sdk";

const results = await attributes.query(client, {
  query: "users over 18 in Japan",
  mode: "natural",
  proof: { required: true, type: "zk-snark" },
  targets: { schemas: ["user-kyc-v1"] },
});
```

This returns verified attributes plus proof status that your app or AI agent can consume.
