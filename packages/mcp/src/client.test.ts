import { describe, it } from "vitest";

// Note: Integration tests that require SDK imports are skipped due to ramda resolution issues
// in pnpm workspace with Vite.

describe("buildClient", () => {
  it.todo("returns client with default apiBase when no env vars are set");
  it.todo("uses LEMMA_API_BASE when provided");
  it.todo("uses LEMMA_API_KEY when provided");
  it.todo("parses LEMMA_DEFAULT_CHAIN_ID as number");
});
