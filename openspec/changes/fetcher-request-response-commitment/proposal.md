## Why

Fetcher commitments currently bind only the response body. Callers cannot prove which upstream URL was fetched or when, so post-hoc substitution of source or timestamp is undetectable. Binding request metadata into the existing `data-commitment-v1` tree closes that gap without a new circuit.

## What Changes

- **BREAKING**: `fetchAndCommit` return type (`FetchResult`) changes from `{ source, fetchedAt, data, canonical, commitment }` to `{ request, response, commitment }`
- Commitment input becomes `{ request: { url, fetchedAt, date }, response: { data } }` where `date` is the UTC `YYYY-MM-DD` derived from `fetchedAt`
- `canonical` remains a sort of the response data only (not the full commitment envelope)
- No new circuit — continue using `data-commitment-v1` / `commitDeep`
- `packages/feeds` updated at the `FetchResult` boundary so typecheck and forex worker consumers keep working

## Capabilities

### New Capabilities
- `fetcher-request-binding`: Fetcher commits to upstream URL and fetch time (UTC ms + UTC date) together with the response body under `data-commitment-v1`

### Modified Capabilities

## Impact

- **packages/fetcher**: `fetch.ts`, tests, README; Workers `/fetch` JSON response shape follows `FetchResult`
- **packages/feeds**: all `FeedSource` implementations and pipeline/cli that read `result.data` / `result.source` / `result.fetchedAt` must follow the new shape; feed-local `commitDeep` payloads (scaled forex, compact holiday snapshots, etc.) stay as-is — only the shared `FetchResult` envelope changes
- **Circuits / SDK**: none — still `commitDeep` + `data-commitment-v1`
