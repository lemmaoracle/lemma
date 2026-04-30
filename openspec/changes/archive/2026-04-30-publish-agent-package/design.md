## Context

`@lemmaoracle/agent` is a private package containing only Rust WASM source (`normalize/src/lib.rs`), Circom circuit source (`circuits/src/agent-identity.circom`), and registration scripts. It exports zero TypeScript — no types, no functions. Downstream consumers like `@trust402/roles` must re-define the `AgentCredential` type locally, often incompletely (missing `provenance.sourceSystem`, `provenance.generatorId`, `provenance.chainContext`).

The SDK's `prepare` function computes commitments exclusively via a flat Poseidon Merkle tree (`commitNormalized`). The `agent-identity.circom` circuit uses a different commitment scheme — `Poseidon6(identityHash, authorityHash, financialHash, lifecycleHash, provenanceHash, salt)` — where each section hash is `toScalar(JSON.stringify(sectionObj))`. These two schemes produce incompatible commitment values.

Three approaches were considered for reconciling the two commitment schemes: (A) extend SDK `prepare` to support multiple commitment strategies, (B) implement the agent-specific commitment in `@lemmaoracle/agent`, (C) extend `PrepareOutput` with optional fields. Option B was chosen because `DocumentCommitments` is an API-contract type in `@lemmaoracle/spec` embedded in `RegisterDocumentRequest` — changing it has cascading impact on the Workers API, x402, and Relay. The commitment scheme is a circuit-level concern, not a generic SDK concern.

Stakeholders: SDK consumers (direct and via Relay), `@trust402/roles`, future agent credential issuers.

## Goals / Non-Goals

**Goals:**
- Publish `@lemmaoracle/agent` as a public npm package with TypeScript types and three functions: `credential`, `validate`, `commit`
- Add `normalize` to SDK as a lightweight alternative to `prepare` that returns only normalized data (no commitment computation), enabling consumers to apply their own commitment schemes without wasted Merkle computation
- Keep SDK's `prepare`, `PrepareOutput`, `DocumentCommitments`, and `CommitResult` unchanged — no impact on existing API contracts
- Maintain backward compatibility across the entire stack

**Non-Goals:**
- Implementing the normalize WASM in TypeScript (stays in Rust)
- Providing a `buildIdentityWitness` function in `@lemmaoracle/agent` (circuit-specific witness construction is the consumer's responsibility; SDK exports `poseidon` and `toScalar` for this purpose)
- Registering schemas or circuits (handled by existing scripts)
- Changing the `agent-identity.circom` circuit
- Extending SDK `prepare` to support multiple commitment strategies (commitment computation is the circuit consumer's responsibility)

## Decisions

### D1: `credential` and `validate` accept optional `schemaId`

**Decision**: Both functions accept an optional `schemaId` parameter defaulting to `"agent-identity-authority-v1"`. The `credential` factory uses it to populate `credential.schema` and `validate` uses it to verify the schema field matches.

**Rationale**: The schema ID is part of the credential itself. Currently only one schema exists, but the parameter makes the API forward-compatible without breaking changes. When `schemaId` is omitted, it defaults from `credential.schema` (for `validate`) or the constant (for `credential`).

**Alternative**: Hard-code the schema ID. Rejected — would require a new function signature if a v2 schema is introduced.

### D2: Commitment computation lives in `@lemmaoracle/agent`, not in SDK

**Decision**: The sectioned Poseidon commitment (`Poseidon6` with section hashes) is implemented in `@lemmaoracle/agent` as the `commit` function and its internal `computeCredentialCommitment` helper. The SDK is not extended with `CommitStrategy`, `commitSectioned`, or any changes to `prepare`/`PrepareOutput`.

**Rationale**: The commitment scheme is determined by the circuit design. `agent-identity.circom` uses `Poseidon6`; another circuit might use a different structure. This is not a generic SDK concern — it belongs to the package that owns the circuit. Keeping it out of the SDK avoids:
- Changing `DocumentCommitments` (an API-contract type in `@lemmaoracle/spec` used by `RegisterDocumentRequest`, Workers API, x402)
- Changing `PrepareOutput` (used by Relay's HTTP response, tests, and x402 submission)
- Making `CommitResult` a conditional type that varies by strategy
- Requiring Relay to forward `commitStrategy`

**Alternative considered**: Extend `prepare` with `CommitStrategy`/`CommitFn` in `PrepareInput.commit`. Rejected because it changes `PrepareOutput` shape and forces `DocumentCommitments` to accommodate multiple schemes, with cascading impact on the API contract.

### D3: SDK gains `normalize` function (lightweight `prepare` without commitment)

**Decision**: Add a `normalize` function to the SDK that returns only the normalized data — no commitment computation, no Merkle tree, no `CommitResult`.

```typescript
export const normalize = <Raw, Norm extends Json>(
  _client: LemmaClient,
  input: PrepareInput<Raw>,
): Promise<Norm> => {
  const schema = getSchemaById<Raw, Norm>(input.schema);
  return schema
    ? Promise.resolve(schema.normalize(input.payload))
    : reject(`Unknown schemaId: ${input.schema}. Call define() first.`);
};
```

**Rationale**: `@lemmaoracle/agent`'s `commit` function needs the normalized data to compute its sectioned Poseidon commitment. If it uses `prepare`, it pays the cost of an unnecessary Merkle-tree computation. `normalize` is the minimal API — `prepare` becomes `normalize` + `commitMerkle` internally.

**Alternative**: Use `prepare` and discard the commitment fields. Rejected — wasteful computation and misleading API usage.

### D4: `commit` function in `@lemmaoracle/agent` uses SDK's `normalize` + local `computeCredentialCommitment`

**Decision**: The `commit` function calls SDK `normalize` to get `NormalizedAgentCredential`, then applies `computeCredentialCommitment` to produce a `SectionedCommitResult`.

```typescript
export const commit = async (
  client: LemmaClient,
  credential: AgentCredential,
): Promise<CommitOutput> => {
  const normalized = await normalize<AgentCredential, NormalizedAgentCredential>(
    client,
    { schema: credential.schema, payload: credential },
  );
  const commitment = computeCredentialCommitment(normalized);
  return { normalized, ...commitment };
};
```

**Rationale**: Clear separation: SDK normalizes, agent commits. No SDK changes needed for commitment computation. The `computeCredentialCommitment` helper is a pure function that uses `poseidon` and `toScalar` from the SDK.

### D5: `SectionedCommitResult` type in `@lemmaoracle/agent`

**Decision**: Define `SectionedCommitResult` locally in `@lemmaoracle/agent`:

```typescript
type SectionedCommitResult = Readonly<{
  /** Top-level Poseidon commitment (= credentialCommitment in agent-identity.circom) */
  root: string;
  /** Per-section hashes keyed by section name */
  sectionHashes: Readonly<Record<string, string>>;
  /** Binding salt */
  salt: string;
}>;
```

**Rationale**: This type is specific to the agent-identity commitment scheme. It doesn't belong in `@lemmaoracle/spec` alongside the generic `DocumentCommitments`. If future packages need a similar type, it can be extracted then.

### D6: `validate` mirrors normalize WASM rules in TypeScript

**Decision**: Implement validation as pure functions using Ramda branching (`R.cond`, `R.when`). Validation rules are a subset of the WASM's: required field presence, u64 range for timestamps/spend limits, 3-letter uppercase currency, spend limit ≤ 1 trillion, expiration > issuedAt and ≤ 4102444800. Returns `ValidationResult` (tagged union: `{ valid: true, credential }` | `{ valid: false, errors }`).

**Rationale**: FP rules prohibit `throw` in sync code. Typed error results enable functional error handling. The validation is intentionally a subset — the WASM is the authoritative validator, but client-side pre-validation catches the most common mistakes before network round-trips.

## Risks / Trade-offs

- **[Schema drift between TS validate and WASM normalize]** → Mitigation: `validate` is documented as a pre-flight check, not a replacement for WASM normalization. JSDoc references the canonical schema ID. The WASM remains the source of truth.
- **[commitment computation duplicated across circuit consumers]** → Mitigation: `computeCredentialCommitment` is a focused, testable pure function. If a second package needs the same scheme, it can import from `@lemmaoracle/agent` or the function can be extracted to a shared utility later.
- **[SDK `normalize` is a subset of `prepare` — could confuse consumers]** → Mitigation: Clear JSDoc documentation. `prepare` = normalize + merkle commit. `normalize` = normalize only. `prepare` is the primary API; `normalize` is for advanced use cases with custom commitment schemes.
