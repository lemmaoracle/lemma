# document-schema-optional Tasks

## 1. Spec (lemma/packages/spec)

- [x] 1.1 `RegisterDocumentRequest.schema` → optional (`schema?:`)
- [x] 1.2 OpenAPI: remove `schema` from `RegisterDocumentRequest.required`, document default `passthrough-v1`
- [x] 1.3 Re-sync workers spec (`pnpm sync:workers:spec`)

## 2. Workers (workers/packages/api)

- [x] 2.1 `routes/documents.ts`: default omitted/empty `schema` to `passthrough-v1` before `schemaExists` check and insert
- [x] 2.2 `queues/hooks-queue.ts`: mirror the same defaulting in pre-registration validation
- [x] 2.3 Tests: omitted schema → stored as `passthrough-v1`; empty string → `passthrough-v1`; explicit schema unchanged; unknown schema still 400

## 3. SDK (lemma/packages/sdk)

- [x] 3.1 `RegisterDocumentRequest` re-export typing picks up optional schema; verify `documents.register` compiles without `schema`

## 4. Validate

- [x] 4.1 workers: `pnpm test` / lint
- [x] 4.2 lemma: `pnpm --filter @lemmaoracle/sdk test` / type-check
