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
 * canonical-sort-v1 and data-commitment-v1 live in separate packages
 * (@lemmaoracle/canonical-sort and @lemmaoracle/data-commitment) so they
 * can be reused independently of the fetcher.
 */
import { canonicalSort } from "@lemmaoracle/canonical-sort";
import { commitToData } from "@lemmaoracle/data-commitment";
import type { Json } from "@lemmaoracle/canonical-sort";
import type { DataCommitment } from "@lemmaoracle/data-commitment";

// ── types ────────────────────────────────────────────────────────────────

/**
 * Result of a fetch + canonicalise + commit cycle.
 */
export type FetchResult = Readonly<{
  /** Source URL or identifier. */
  source: string;
  /** Unix timestamp (ms) of the fetch. */
  fetchedAt: number;
  /** Raw parsed JSON from the source. */
  data: Json;
  /** Canonical JSON string (canonical-sort-v1). */
  canonical: string;
  /** data-commitment-v1 output. */
  commitment: DataCommitment;
}>;

/**
 * Configuration for the fetcher.
 */
export type FetcherConfig = Readonly<{
  /** Optional fetch implementation (defaults to globalThis.fetch). */
  fetch?: typeof fetch;
  /** Optional headers to include in the request. */
  headers?: Readonly<Record<string, string>>;
}>;

// ── implementation ──────────────────────────────────────────────────────

/**
 * Parse a fetch Response into a Json value.
 *
 * Rejects if the body is not valid JSON.
 */
const parseResponse = async (response: Response): Promise<Json> => {
  const text = await response.text();
  // eslint-disable-next-line functional/no-try-statements -- JSON.parse is a boundary
  try {
    return JSON.parse(text) as Json;
  } catch {
    return Promise.reject(new Error(`fetcher: invalid JSON response from source`));
  }
};

/**
 * Fetch a single source, canonicalise, and commit.
 *
 * @param source  URL to fetch.
 * @param config  Optional configuration (custom fetch, headers).
 * @returns       FetchResult containing the raw data, canonical string,
 *                and data-commitment-v1 output.
 */
export const fetchAndCommit = async (
  source: string,
  config?: FetcherConfig,
): Promise<FetchResult> => {
  const fetchFn = config?.fetch ?? globalThis.fetch;
  const headers = config?.headers ?? {};

  const response = await fetchFn(source, { headers });

  // eslint-disable-next-line functional/no-conditional-statements -- HTTP boundary
  if (!response.ok) {
    return Promise.reject(
      new Error(`fetcher: HTTP ${String(response.status)} from ${source}`),
    );
  }

  const data = await parseResponse(response);
  const { canonical } = canonicalSort(data);
  const commitment = commitToData(data);

  return {
    source,
    fetchedAt: Date.now(),
    data,
    canonical,
    commitment,
  };
};

/**
 * Fetch multiple sources in parallel and return results for each.
 *
 * Failures are returned as errors in the result array (does not reject).
 */
export type FetchBatchResult = ReadonlyArray<
  Readonly<{ ok: true; value: FetchResult }> | Readonly<{ ok: false; error: Error }>
>;

export const fetchBatch = async (
  sources: ReadonlyArray<string>,
  config?: FetcherConfig,
): Promise<FetchBatchResult> =>
  Promise.all(
    sources.map(async (source) => {
      // eslint-disable-next-line functional/no-try-statements -- fetch boundary
      try {
        const result = await fetchAndCommit(source, config);
        return { ok: true as const, value: result };
      } catch (e) {
        return {
          ok: false as const,
          error: e instanceof Error ? e : new Error(String(e)),
        };
      }
    }),
  );
