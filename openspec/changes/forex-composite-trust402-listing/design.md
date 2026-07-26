## Context

`forex-proof-pipeline.ts` registers Lemma documents and ZK proofs for frankfurter / er-api / composite. The public suite endpoint `GET /v1/suites/feeds/forex/composite/latest` returns that registered snapshot. Fetcher (#704) binds `{ request: { url, fetchedAt, date }, response: { data } }` under `data-commitment-v1`.

Trust402 listings today are built for `blog-article-v1.2` / `content-commitment-v1.2`. Listing `forex/composite` as a paid (or free) dataset needs the **fetcher root** as the listing commitment so buyers can prove request provenance before purchase.

## Goals / Non-Goals

**Goals:**
- Given UTC `YYYY-MM-DD`, resolve one Trust402 listing whose content is that day's fetcher envelope for composite latest
- Commitment on the listing = fetcher `commitment.root`
- Archive the envelope so re-runs are deterministic (fetchedAt must not change on retry)
- Idempotent listing receipt per date
- Independent script runnable after the forex proof pipeline

**Non-Goals:**
- Workers historical `?date=` redirects (other repo)
- Changing composite averaging / forex-average-v1 proofs
- New circuits
- CI cron (operator runs the script; cron can call it later)

## Decisions

### 1. Fetch via `@lemmaoracle/fetcher` (local `fetchAndCommit` by default)

The listing script runs on Node (same host class as `forex-proof-pipeline.ts`). Default path calls in-process `fetchAndCommit(LATEST_URL)` so the commitment is the fetcher package's `data-commitment-v1` root with request binding.

Optional `USE_FETCHER_WORKERS=1` routes through fetcher Workers `/fetch`. That path currently fails on the composite suite payload (~100 leaves / Worker CPU limit), so it is opt-in only.

Default `LATEST_URL` = `https://workers.lemma.workers.dev/v1/suites/feeds/forex/composite/latest`.

### 2. Archive key = `request.date` (fetcher UTC day)

The listing day is the fetcher envelope's `request.date`, not the FX `attributes.date` inside the suite payload (which can lag). Archive files:

- `{ARCHIVE_DIR}/{date}.envelope.json` — full FetchResult
- `{ARCHIVE_DIR}/{date}.listing.json` — receipt (`listingRoot`, `cardId`, `commitment`, …)

### 3. Trust402 path: `data-commitment-v1.1` + storefront upload

- `publish()` with circuit `data-commitment-v1.1`, witness = Merkle inclusion for `$["request"]["date"]`, `commitment` = root
- `file` = envelope JSON, `category` = `dataset`, title = `forex/composite@{date}`
- Also submit inclusion for `$["request"]["url"]` against the same `docHash` when not dry-run (pre-purchase url binding)
- Fix Trust402 to POST `proof.inputs` from the prover (data-commitment has multiple public signals)

**Alternative considered**: `content-commitment-v1.2` over envelope bytes. Rejected — listing commitment would not equal the fetcher root.

### 4. Idempotency

1. If `{date}.listing.json` exists → success, no-op  
2. Else if `{date}.envelope.json` exists → list from archive (do not re-fetch)  
3. Else if `date === utcToday()` → fetch, write envelope, list, write receipt  
4. Else → fail (no archive for past day; historical fill is out of scope here)

### 5. Script location

`packages/feeds/scripts/list-forex-composite-trust402.ts` + testable helpers under `packages/feeds/src/`. Not wired into `forex-proof-pipeline.ts` (caller sequences them).

## Risks / Trade-offs

- **[Risk] Trust402 storefront may reject `data-commitment-v1.1` cards** → Validate with sandbox dry/live; category `dataset` is already allowed
- **[Risk] listingRoot salt makes re-publish create duplicates** → Mitigated by receipt file; do not call publish when receipt exists
- **[Trade-off] Archive on local disk** → Operator must persist `ARCHIVE_DIR` across runs; Trust402 R2 holds the sold content after first success

## Migration Plan

1. Land helpers + script + Trust402 publish inputs fix  
2. Operator runs `DRY_RUN=1` then live with `LEMMA_API_KEY` / optional `PRIVATE_KEY`  
3. Optionally schedule after `forex-proof-pipeline.ts`
