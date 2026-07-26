## Context

`@lemmaoracle/fetcher` fetches an upstream URL, canonicalises the JSON body with `canonical-sort-v1`, and commits with `commitDeep` (`data-commitment-v1`). Today the commitment covers only the body; `source` and `fetchedAt` are return metadata outside the Merkle tree.

`packages/feeds` is the only in-repo consumer. Most feeds construct `FetchResult` themselves after local transforms; `forex` / `forex-er-api` call the fetcher Workers `/fetch` API and read `fetched.data` before re-committing scaled rates.

## Goals / Non-Goals

**Goals:**
- Bind upstream URL + fetch instant (UTC ms) + UTC calendar date into the commitment
- Keep using `data-commitment-v1` / `commitDeep` (no new circuit)
- Expose a clear `request` / `response` result envelope from `fetchAndCommit`
- Keep feeds compiling and forex worker consumers reading the new wire shape

**Non-Goals:**
- Changing feed-local commitment payloads (scaled forex, compact snapshots, composite averages)
- New ZK circuits or circuit re-registration
- HTTP status / headers in the commitment
- Preserving the old `FetchResult` field names as aliases

## Decisions

1. **Commitment envelope**
   - Commit `commitDeep({ request: { url, fetchedAt, date }, response: { data } }, { maxDepth })`
   - `url` = the `source` argument to `fetchAndCommit`
   - `fetchedAt` = `Date.now()` captured once before commit
   - `date` = `new Date(fetchedAt).toISOString().slice(0, 10)` (UTC `YYYY-MM-DD`)
   - `data` = parsed JSON response (the committed payload)
   - Rationale: groups provenance under `request` and payload under `response`; date leaf enables day-scoped proofs without parsing ms in-circuit; `data` (not `body`) names the committed content rather than the HTTP transport

2. **Return shape**
   ```ts
   {
     request: { url, fetchedAt, date },
     response: { data, canonical },
     commitment,
   }
   ```
   - `canonical` is still `canonicalSort(data)` only — not of the full envelope
   - Rationale: matches caller mental model; canonical remains a pure function of data

3. **Feeds adaptation (minimal)**
   - Update `FetchResult` field access: `data` → `response.data`, `source` → `request.url`, `fetchedAt` → `request.fetchedAt`
   - Feed sources that build results manually return the new envelope; their `commitDeep(...)` targets stay unchanged
   - Rationale: shared type forces a boundary update; commitment semantics of feeds stay independent

4. **No dual-field compat layer**
   - Prefer one clear shape over deprecated aliases
   - Rationale: single consumer in-repo; dual fields would freeze ambiguity

## Risks / Trade-offs

- [Breaking `FetchResult`] → Update feeds in the same change; Workers `/fetch` clients outside the monorepo must migrate
- [More leaves per commit] → Path prefix `$["response"]["data"]...` plus three request leaves; `maxDepth` must still cover leaf count (existing callers already pass 16)
- [Clock skew on `date`] → Document that `date` is fetcher-local UTC wall clock at fetch time, not upstream `Date` headers

## Migration Plan

1. Land fetcher + feeds updates together
2. Redeploy fetcher Workers
3. External `/fetch` clients (if any) switch to `response.data` / `request.*`
