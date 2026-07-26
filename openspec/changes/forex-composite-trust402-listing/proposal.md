## Why

Daily `forex/composite` snapshots are produced by the feeds pipeline and served at `/v1/suites/feeds/forex/composite/latest`, but they are not listed on Trust402. Buyers need a date-keyed listing whose content is the fetcher envelope for that day's fetch, with commitment equal to the fetcher `data-commitment-v1` root so pre-purchase proofs of `$["request"]["url"]` / `$["request"]["date"]` work.

Fetcher request binding (#704) already puts those leaves in the tree. What remains is the feeds-side list path: fetch → archive → Trust402 listing (idempotent, one representative per UTC day).

## What Changes

- Add a feeds script (pipeline-independent) that fetches `…/forex/composite/latest` **via fetcher Workers**, archives the envelope by `request.date`, and creates a Trust402 listing
- Listing content = fetcher envelope; listing commitment = envelope `commitment.root`
- Per-schema proof uses `data-commitment-v1.1` inclusion of `$["request"]["date"]` (url leaf submitted alongside when live)
- Idempotent: same UTC date re-run reuses archive and skips if a listing receipt already exists
- Minor Trust402 SDK fix: submit `proof.inputs` (not hardcoded `[commitment]`) and export `list`; widen publish witness typing for data-commitment

## Capabilities

### New Capabilities
- `forex-composite-trust402-listing`: Date-keyed, idempotent Trust402 listing of fetcher envelopes for `forex/composite/latest`

### Modified Capabilities

## Impact

- **packages/feeds**: new module + script + tests; optional `@trust402/sdk` dependency
- **packages/trust402**: export `list`; publish uses prover public signals; witness type widened
- **Out of scope**: workers `?date=` historical routing (separate repo); cron wiring; changing forex proof pipeline itself
