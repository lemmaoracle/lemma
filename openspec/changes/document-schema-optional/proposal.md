## Why

Operating the registry surfaced a pattern: several documents are registered
against `passthrough-v1` not because callers want input normalization, but
because the API requires *some* schema id. `passthrough-v1` (identity
normalization) is already the de-facto "untyped" bucket — the required
`schema` field on document registration adds ceremony without value for
ad-hoc documents (feeds like `dns-domain-verify.v1` would otherwise need a
schema registration step that carries no normalize logic).

The schema concept itself stays: it is load-bearing for
`circuits.schema_id` binding, `listing-binding-v2` public inputs
(schemaId is cryptographically bound via Poseidon5), `bundle-verifier`
keccak256 hashing, and counter bucketing. What changes is only the
*document registration* surface: the schema becomes optional.

## What Changes

- `documents.register` accepts an omitted (or empty) `schema` field; the
  server substitutes `passthrough-v1`
- The substitute schema is the already-registered `passthrough-v1`
  (identity normalize), so no new registry rows and no D1 migration
  (`documents.schema_id` stays `TEXT NOT NULL`)
- `hooks-queue` pre-registration validation mirrors the same defaulting
- Spec: `RegisterDocumentRequest.schema` becomes optional in
  `packages/spec` types + OpenAPI; workers spec re-synced via
  `pnpm sync:workers:spec`
- SDK: `RegisterDocumentRequest.schema` becomes optional; client-side
  omission is the supported path (server-side defaulting is authoritative)

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `deterministic-normalization`: documents registered without a schema are
  served under `passthrough-v1` semantics (input normalized to itself)

## Impact

- **workers `packages/api`**: `routes/documents.ts` (validation + insert),
  `queues/hooks-queue.ts` (mirror check), tests
- **lemma `packages/spec`**: `RegisterDocumentRequest` type + OpenAPI
  `required` list; re-sync workers spec
- **lemma `packages/sdk`**: `documents.register` typing (schema → optional)
- **Out of scope**: schemas API changes, circuits binding, bundle-verifier,
  counter buckets, D1 migrations
