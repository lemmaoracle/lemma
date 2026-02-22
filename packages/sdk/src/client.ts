/**
 * Whitepaper §4.2 — Client Initialization.
 */
import type { LemmaClient, LemmaClientConfig } from "@lemma/spec";

export const create = (config: LemmaClientConfig): LemmaClient => ({
  apiBase: config.apiBase,
  apiKey: config.apiKey,
});
