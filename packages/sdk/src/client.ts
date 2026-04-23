/**
 * Whitepaper §4.2 — Client Initialization.
 */
import type { LemmaClient, LemmaClientConfig } from "@lemmaoracle/spec";

const DEFAULT_API_BASE = "https://workers.lemma.workers.dev";

export const create = (config: LemmaClientConfig, fetcher?: typeof fetch): LemmaClient => ({
  apiBase: config.apiBase || DEFAULT_API_BASE,
  apiKey: config.apiKey,
  fetcher,
});
