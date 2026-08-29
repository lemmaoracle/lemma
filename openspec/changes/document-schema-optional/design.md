# document-schema-optional Design

## Context

`documents.register` currently requires `schema`. The registry checks
`schemas(id)` existence (`schemaExists` in `routes/documents.ts`), so any
caller must first register a schema even when it needs no normalization.
In practice callers reach for the registered identity-normalize schema
`passthrough-v1`, which signals "untyped document".

## Goals / Non-Goals

- Goals: allow omitting `schema`; omitted/empty → `passthrough-v1`;
  no D1 migration; no new registry rows.
- Non-Goals: removing schemas elsewhere (circuits, listing-binding-v2
  public inputs, bundle-verifier, counter buckets all keep schema);
  changing the schemas API; renaming `passthrough-v1`.

## Decisions

### D1: server-side defaulting, not client-side injection

The workers route substitutes `passthrough-v1` when `schema` is absent or
empty before validation/insert. A sentinel value ("untyped") was rejected:
`passthrough-v1` already has exactly the right semantics (normalize is the
identity function) and exists in every environment.

### D2: `documents.schema_id` stays `TEXT NOT NULL`

Defaulting happens in the route handler, so the column keeps its
constraint and every row keeps a real schema id. `schemaExists` still
guards against typos in *explicitly provided* schemas.

### D3: hooks-queue mirrors the default

`hooks-queue.ts` validates registration payloads before enqueueing
(`isNonEmptyString(schemaId)`). It applies the same default so a schema-less
registration with hooks doesn't get rejected at the queue stage.

### D4: OpenAPI/SDK — `schema` optional

`RegisterDocumentRequest.schema?: string` in `packages/spec/src/index.ts`;
OpenAPI drops `schema` from `required` and gains a description noting the
server default. `pnpm sync:workers:spec` propagates both files. The SDK
re-exports the spec type, so `documents.register` accepts omission without
SDK-local changes.

## Risks / Trade-offs

- `[schema: undefined]` documents appear in queries that group by
  `schema_id` (e.g. counter buckets) as `passthrough-v1` — acceptable;
  passthrough volume was already the signal being observed.
- Verify-center issuer display falls back on `meta.type` for
  passthrough documents — already the case for existing passthrough docs.
