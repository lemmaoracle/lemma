## 1. Fetcher core

- [x] 1.1 Update `FetchResult` to `{ request, response, commitment }` in `packages/fetcher/src/fetch.ts`
- [x] 1.2 Change `fetchAndCommit` to capture `fetchedAt` once, derive UTC `date`, commit `{ request, response: { body } }`, return new envelope
- [x] 1.3 Update `fetch.test.ts` for new shape, leaf paths, and leaf counts
- [x] 1.4 Update fetcher README usage snippets

## 2. Feeds boundary

- [x] 2.1 Update feed sources that construct `FetchResult` to the new envelope (forex, forex-er-api, forex-composite, jp-holidays, jp-postal-codes)
- [x] 2.2 Update forex / forex-er-api worker consumers to read `response.body`
- [x] 2.3 Update `pipeline.ts` and `cli.ts` field access (`data` / `source` / `fetchedAt`)

## 3. Validate

- [x] 3.1 Run fetcher tests
- [x] 3.2 Type-check fetcher and feeds packages
