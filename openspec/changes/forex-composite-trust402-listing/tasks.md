## 1. Trust402 publish compatibility

- [x] 1.1 Submit `proof.inputs` from prover (not hardcoded `[commitment]`) in `publish()`
- [x] 1.2 Widen `PublishInput.witness` to `Readonly<Record<string, unknown>>`
- [x] 1.3 Export `list` (and `ListInput`) from `@trust402/sdk`

## 2. Feeds helpers

- [x] 2.1 Add pure helpers: UTC date, archive paths, envelope parse/validate, leaf lookup, listing title, receipt shape
- [x] 2.2 Add `fetchForexCompositeEnvelope` via fetcher Workers `/fetch`
- [x] 2.3 Add `listForexCompositeTrust402` orchestration (archive → prove date → publish → url proof → receipt)
- [x] 2.4 Co-locate unit tests for helpers / dry-run orchestration with mocks

## 3. CLI script

- [x] 3.1 Add `packages/feeds/scripts/list-forex-composite-trust402.ts` with env docs (`DATE`, `ARCHIVE_DIR`, `FETCHER_URL`, `LATEST_URL`, `LEMMA_API_KEY`, `DRY_RUN`, price/did)
- [x] 3.2 Add `list:forex-composite-trust402` npm script and `@trust402/sdk` dependency

## 4. Validate

- [x] 4.1 `pnpm --filter @lemmaoracle/feeds test` / type-check / lint
- [x] 4.2 `pnpm --filter @trust402/sdk test` / type-check / lint
