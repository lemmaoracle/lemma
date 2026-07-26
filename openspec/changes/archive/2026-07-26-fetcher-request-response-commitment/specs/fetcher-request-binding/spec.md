## ADDED Requirements

### Requirement: Commitment binds request provenance and response data
`fetchAndCommit` MUST compute the data-commitment-v1 root over a JSON envelope with exactly these top-level keys:
- `request`: object with `url` (string, the fetched upstream URL), `fetchedAt` (number, Unix epoch milliseconds), and `date` (string, UTC calendar date `YYYY-MM-DD` derived from `fetchedAt` via `toISOString().slice(0, 10)`)
- `response`: object with `data` (the parsed JSON response)

The commitment MUST be produced with `commitDeep` (existing `data-commitment-v1` scheme). No new circuit is required.

#### Scenario: Successful fetch includes provenance leaves
- **WHEN** `fetchAndCommit` successfully fetches JSON from `https://api.example.com/price`
- **THEN** the commitment path-value pairs include `$["request"]["url"]`, `$["request"]["fetchedAt"]`, `$["request"]["date"]`, and leaves under `$["response"]["data"]` for the response fields

#### Scenario: Date is UTC calendar day of fetchedAt
- **WHEN** `fetchedAt` is `1753531200000`
- **THEN** `request.date` is `2025-07-26` (the UTC date of that instant)

### Requirement: FetchResult exposes request and response envelopes
`fetchAndCommit` MUST return a `FetchResult` shaped as:
- `request`: `{ url, fetchedAt, date }` matching the committed request object
- `response`: `{ data, canonical }` where `data` is the parsed JSON and `canonical` is the `canonical-sort-v1` string of `data` only
- `commitment`: the `commitDeep` result for the request/response envelope

#### Scenario: Canonical covers data only
- **WHEN** the upstream data is `{ "b": 2, "a": 1 }`
- **THEN** `response.canonical` is `{"a":1,"b":2}` and the commitment still includes request provenance leaves

#### Scenario: Same fetchedAt used in return and commitment
- **WHEN** a fetch succeeds
- **THEN** `result.request.fetchedAt` equals the `fetchedAt` value inside the committed envelope
