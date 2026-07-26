# forex-composite-trust402-listing Specification

## Purpose

List a UTC-day representative of `forex/composite/latest` (fetched via fetcher) as a Trust402 dataset listing whose commitment is the fetcher Merkle root.

## Requirements

### Requirement: Fetch via fetcher produces a request-bound envelope
The listing pipeline MUST obtain content by calling `@lemmaoracle/fetcher` `fetchAndCommit` on the configured suite latest URL (default `https://workers.lemma.workers.dev/v1/suites/feeds/forex/composite/latest`), unless an operator explicitly opts into fetcher Workers `/fetch`. The returned body MUST be treated as a `FetchResult` envelope with `request.url`, `request.date`, `response.data`, and `commitment.root`.

#### Scenario: Envelope binds the suite URL and UTC date
- **WHEN** the pipeline fetches successfully
- **THEN** `$["request"]["url"]` equals the configured latest URL and `$["request"]["date"]` is a UTC `YYYY-MM-DD` string bound in `commitment`

### Requirement: Listing content and commitment
The Trust402 listing content MUST be the fetcher envelope JSON. The listing commitment MUST equal `commitment.root` from that envelope (not a `content-commitment` hash of the bytes).

#### Scenario: Commitment matches fetcher root
- **WHEN** a listing is created from an envelope with root `0xabc…`
- **THEN** the listing's `commitment` field is `0xabc…`

### Requirement: Pre-purchase provenance leaves
The listing's per-schema proof MUST use `data-commitment-v1.1` to prove inclusion of `$["request"]["date"]`. A live run MUST also submit an inclusion proof for `$["request"]["url"]` against the same document.

#### Scenario: Date leaf is proven for the listing
- **WHEN** publish runs for an archived envelope
- **THEN** the listing `perSchemaProof.circuitId` is `data-commitment-v1.1` and the witness targets `$["request"]["date"]`

### Requirement: One idempotent listing per UTC date
For a given UTC date `D`, at most one successful listing receipt MUST be produced. Re-running for `D` when a receipt exists MUST be a no-op. Re-running when only an envelope archive exists MUST list from that archive without re-fetching (preserving `fetchedAt`).

#### Scenario: Second run with receipt is a no-op
- **WHEN** `{ARCHIVE_DIR}/{D}.listing.json` already exists
- **THEN** the pipeline exits successfully without calling fetcher or Trust402 publish

#### Scenario: Past date without archive fails
- **WHEN** `DATE=D` is not today and no envelope archive exists for `D`
- **THEN** the pipeline fails without inventing a historical fetch

### Requirement: Discoverability by date
Listing metadata title MUST be `forex/composite@{YYYY-MM-DD}` using the envelope's `request.date`, so a date string maps to the representative listing.

#### Scenario: Title encodes the fetch date
- **WHEN** `request.date` is `2026-07-26`
- **THEN** metadata title is `forex/composite@2026-07-26`
