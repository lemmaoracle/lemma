import { create, prover } from "@lemmaoracle/sdk";
import type { LemmaClient, ProveOutput } from "@lemmaoracle/sdk";
import { createCachingFetcher } from "./cache.js";

export type ProveInput = Readonly<{
  circuitId: string;
  witness: Readonly<Record<string, unknown>>;
}>;

export type ProveConfig = Readonly<{
  client?: LemmaClient;
  fetch?: typeof fetch;
}>;

/** Shared caching fetcher so repeated prove calls reuse the in-memory cache. */
const defaultFetcher = createCachingFetcher();

/**
 * Generate a ZK proof for a circuit — the `guardrail` counterpart.
 *
 * Sugar over `@lemmaoracle/sdk` `prover.prove`: same `circuitId + witness`
 * input, but the default client uses a CID-keyed caching fetcher so the
 * wasm/zkey artifacts are downloaded once and reused (filesystem-cached when
 * a `cacheDir` fetcher is supplied).
 *
 * Pass `{ fetch: createCachingFetcher({ cacheDir }) }` to persist artifacts
 * to disk (Node); in the browser the cache is in-memory only.
 */
export const prove = (
  input: ProveInput,
  config: ProveConfig = {},
): Promise<ProveOutput> => {
  const client = config.client ?? create({}, config.fetch ?? defaultFetcher);
  return prover.prove(client, input);
};
