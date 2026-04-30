## 1. Agent Package — Types [agent-credential-api]

- [x] 1.1 Create `packages/agent/src/types.ts` with `AgentCredential` type aligned to `agent-identity-authority-v1` schema ABI — all fields from `abi.raw` and `abi.norm` with JSDoc referencing schema ID and `https://github.com/lemmaoracle/lemma`
- [x] 1.2 Add `AgentCredentialInput` type (partial version of `AgentCredential` where only `agentId`, `subjectId`, `roles`, `issuerId` are required; all other fields optional)
- [x] 1.3 Add `NormalizedAgentCredential` type matching the WASM's `NormalizedAgentCredential` output structure
- [x] 1.4 Add `ValidationError` tagged union (`kind`: `EmptyAgentId` | `EmptySubjectId` | `EmptyRoles` | `SpendLimitExceeded` | `InvalidCurrency` | `InvalidTimestamp` | `EmptyIssuerId` | `InvalidSchema`; `message: string`)
- [x] 1.5 Add `ValidationResult` discriminated union (`{ valid: true; credential: AgentCredential }` | `{ valid: false; errors: ReadonlyArray<ValidationError> }`)
- [x] 1.6 Add `CredentialOptions` type with optional `schemaId: string` field
- [x] 1.7 Add `SectionedCommitResult` type: `{ root: string; sectionHashes: Readonly<Record<string, string>>; salt: string }`
- [x] 1.8 Add `CommitOutput<Norm>` type: `{ normalized: Norm; root: string; sectionHashes: Readonly<Record<string, string>>; salt: string }`

## 2. Agent Package — Validate Function [agent-credential-api] [strict-integer-parsing]

- [x] 2.1 Create `packages/agent/src/validate.ts` with pure validation functions: `validateRequiredFields`, `validateSpendLimit`, `validateCurrency`, `validateTimestamps`, `validateProvenance` — each returns `ReadonlyArray<ValidationError>`, uses Ramda for branching (`R.cond`, `R.when`)
- [x] 2.2 Implement `validate(input: unknown, options?: CredentialOptions): ValidationResult` that composes all validators via `R.pipe` and aggregates errors. Schema field check: `input.schema` must match `options.schemaId ?? "agent-identity-authority-v1"`
- [x] 2.3 Create `packages/agent/src/validate.test.ts` covering each validator and composed `validate()` — including edge cases from spec (fractional spend limit, negative timestamp, null issuedAt, invalid currency, expiration before issuance) [P]

## 3. Agent Package — Credential Factory [agent-credential-api] [deterministic-normalization]

- [x] 3.1 Create `packages/agent/src/credential.ts` with `credential(input: AgentCredentialInput, options?: CredentialOptions): ValidationResult` — fills defaults (`schema` from `options.schemaId ?? "agent-identity-authority-v1"`, `issuedAt` from `Math.floor(Date.now() / 1000)`, `currency` from `"USD"`, empty arrays for scopes/permissions, empty strings for optional provenance fields), then delegates to `validate()`
- [x] 3.2 Create `packages/agent/src/credential.test.ts` — test factory with required-only input, with all optional fields, with custom schemaId, and verify defaults match WASM normalization behavior [P]

## 4. Agent Package — Commit Function [agent-credential-api]

- [x] 4.1 Create `packages/agent/src/commit.ts` with `computeCredentialCommitment(normalized: NormalizedAgentCredential, salt?: string): SectionedCommitResult` — pure function that groups normalized fields into 5 sections (identity, authority, financial, lifecycle, provenance), computes each section hash as `toScalar(JSON.stringify(sectionObj))`, computes root as `poseidon([identityHash, authorityHash, financialHash, lifecycleHash, provenanceHash, saltScalar])`
- [x] 4.2 Implement `commit(client: LemmaClient, credential: AgentCredential): Promise<CommitOutput<NormalizedAgentCredential>>` — calls SDK `normalize` then `computeCredentialCommitment`
- [x] 4.3 Create `packages/agent/src/commit.test.ts` — test `computeCredentialCommitment` with known inputs matching `agent-identity.test.ts`'s `buildValidInput`; verify `root` matches `credentialCommitment` from the circuit test; test `commit` with mocked SDK `normalize` [P]

## 5. Agent Package — Index and Package Config [agent-credential-api]

- [x] 5.1 Create `packages/agent/src/index.ts` exporting types and functions from `types.ts`, `credential.ts`, `validate.ts`, `commit.ts`
- [x] 5.2 Update `packages/agent/package.json`: remove `"private": true`, add `"main": "dist/index.js"`, `"types": "dist/index.d.ts"`, `"exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } }`, add `vitest` devDependency, add `poseidon-lite` dependency, add `"test:ts": "vitest run"` script
- [x] 5.3 Create `packages/agent/tsconfig.json` for the new `src/` TypeScript sources (ES2022, ESNext modules, strict)
- [x] 5.4 Verify `pnpm type-check` and `pnpm test:ts` pass in `packages/agent`

## 6. SDK — Normalize Function [sdk-normalize]

- [x] 6.1 Add `normalize` function to `packages/sdk/src/prepare.ts` — same logic as `prepare` but returns only `Promise<Norm>` without calling `commitNormalized`
- [x] 6.2 Export `normalize` from `packages/sdk/src/index.ts`
- [x] 6.3 Add `normalize` test to `packages/sdk/src/prepare.test.ts` — verify it returns normalized data without commitment fields; verify `prepare`'s `normalized` field equals `normalize`'s return value for the same input [P]
- [x] 6.4 Verify existing SDK tests pass — no behavioral change to `prepare`

## 7. Integration Verification

- [x] 7.1 Run `pnpm type-check` across full lemma monorepo — zero errors
- [x] 7.2 Run `pnpm test` across `packages/agent`, `packages/sdk` — zero failures
- [x] 7.3 Verify `@trust402/roles` can `import { AgentCredential, validate, commit } from "@lemmaoracle/agent"` (workspace resolution) [P]
