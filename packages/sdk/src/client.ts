/**
 * Whitepaper §4.2 — Client Initialization.
 */
import type { LemmaClient, LemmaClientConfig } from "@lemmaoracle/spec";

export const create = (config: LemmaClientConfig, fetcher?: typeof fetch): LemmaClient => ({
  apiBase: config.apiBase,
  apiKey: config.apiKey,
  fetcher,
});
