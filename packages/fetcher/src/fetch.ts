/**
 * Fetcher — fetch external source, canonicalise, and commit.
 *
 * The fetcher is the Level 2 trust anchor: it fetches data from an
 * external source, canonicalises it with canonical-sort-v1, and commits
 * to it with data-commitment-v1.  The commitment binds the published data
 * so that post-hoc tampering is detectable.
 *
 * The fetcher is OSS (this package) so its implementation is auditable.
 * The trust model is "Lemma fetched this data" — not self-attestation by
 * the data provider.
 *
 * canonical-sort-v1 is registered as a schema with the Lemma API.
 * data-commitment-v1.1 is registered as a circuit with the Lemma API.
 * Both are resolved at runtime via the SDK, so this package has no
 * dependency on @lemmaoracle/canonical-sort or @lemmaoracle/data-commitment.
 */

import { canonicalSort, commitDeep } from "@lemmaoracle/sdk";
import type { Json, CommitResult } from "@lemmaoracle/sdk";

// ── types ────────────────────────────────────────────────────────────────

/**
 * Provenance of a single fetch — bound into the commitment under `request`.
 */
export type FetchRequest = Readonly<{
  /** Upstream URL that was fetched. */
  url: string;
  /** Unix timestamp (ms, UTC instant) of the fetch. */
  fetchedAt: number;
  /** UTC calendar date (`YYYY-MM-DD`) derived from `fetchedAt`. */
  date: string;
}>;

/**
 * Parsed upstream payload — `data` is bound into the commitment under
 * `response`; `canonical` is the canonical-sort-v1 string of `data` only.
 */
export type FetchResponse = Readonly<{
  /** Parsed JSON from the source (the committed payload). */
  data: Json;
  /** Canonical JSON string (canonical-sort-v1) of `data`. */
  canonical: string;
}>;

/**
 * Result of a fetch + canonicalise + commit cycle.
 *
 * The commitment covers `{ request, response: { data } }` so the upstream
 * URL and fetch time are Merkle-bound alongside the payload.
 */
export type FetchResult = Readonly<{
  request: FetchRequest;
  response: FetchResponse;
  /** data-commitment-v1 output over `{ request, response: { data } }`. */
  commitment: CommitResult;
}>;

/**
 * Configuration for the fetcher.
 */
export type FetcherConfig = Readonly<{
  /** Optional fetch implementation (defaults to globalThis.fetch). */
  fetch?: typeof fetch;
  /** Optional headers to include in the request. */
  headers?: Readonly<Record<string, string>>;
  /** Optional maxDepth for the Merkle tree (e.g. 16 for data-commitment-v1.1 circuit). */
  maxDepth?: number;
}>;

// ── implementation ──────────────────────────────────────────────────────

/**
 * Parse a fetch Response into a Json value.
 *
 * Rejects if the body is not valid JSON. JSON.parse throws are turned into
 * promise rejections by the `.then` callback (no try/catch needed).
 */
const parseResponse = (response: Response): Promise<Json> =>
  response.text().then((text) =>
    Promise.resolve(text)
      .then((t) => JSON.parse(t) as Json)
      .catch((_: unknown) =>
        Promise.reject(
          new Error(`fetcher: invalid JSON response from source`),
        ),
      ),
  );

/** UTC calendar date (`YYYY-MM-DD`) for a Unix-ms instant. */
const utcDate = (fetchedAt: number): string =>
  new Date(fetchedAt).toISOString().slice(0, 10);

/**
 * Fetch a single source, canonicalise, and commit.
 *
 * @param source  URL to fetch.
 * @param config  Optional configuration (custom fetch, headers, maxDepth).
 * @returns       FetchResult with request provenance, response data/canonical,
 *                and data-commitment-v1 over `{ request, response: { data } }`.
 */
export const fetchAndCommit = async (
  source: string,
  config?: FetcherConfig,
): Promise<FetchResult> => {
  const fetchFn = config?.fetch ?? globalThis.fetch;
  const headers = config?.headers ?? {};

  const response = await fetchFn(source, { headers });

  return !response.ok
    ? Promise.reject(
        new Error(`fetcher: HTTP ${String(response.status)} from ${source}`),
      )
    : parseResponse(response).then((data) => {
        const { canonical } = canonicalSort(data);
        const fetchedAt = Date.now();
        const request: FetchRequest = {
          url: source,
          fetchedAt,
          date: utcDate(fetchedAt),
        };
        const commitment = commitDeep(
          { request, response: { data } },
          { maxDepth: config?.maxDepth },
        );
        return {
          request,
          response: { data, canonical },
          commitment,
        };
      });
};

/**
 * Fetch multiple sources in parallel and return results for each.
 *
 * Failures are returned as errors in the result array (does not reject).
 */
export type FetchBatchResult = ReadonlyArray<
  Readonly<{ ok: true; value: FetchResult }> | Readonly<{ ok: false; error: Error }>
>;

export const fetchBatch = (
  sources: ReadonlyArray<string>,
  config?: FetcherConfig,
): Promise<FetchBatchResult> =>
  Promise.all(
    sources.map((source) =>
      fetchAndCommit(source, config).then(
        (value) => ({ ok: true as const, value }),
        (e: unknown) => ({
          ok: false as const,
          error: e instanceof Error ? e : new Error(String(e)),
        }),
      ),
    ),
  );
