import { describe, it, expect } from "vitest";
import { fetcherPayload } from "./fetcher-payload.js";

describe("fetcherPayload", () => {
  it("reads response.data from the current envelope", () => {
    expect(
      fetcherPayload({
        request: { url: "https://example.com", fetchedAt: 1, date: "2026-07-26" },
        response: { data: { price: 42 }, canonical: "{}" },
        commitment: {},
      }),
    ).toEqual({ price: 42 });
  });

  it("reads top-level data from the legacy shape", () => {
    expect(
      fetcherPayload({
        source: "https://example.com",
        fetchedAt: 1,
        data: { price: 42 },
        canonical: "{}",
        commitment: {},
      }),
    ).toEqual({ price: 42 });
  });

  it("returns undefined when neither shape is present", () => {
    expect(fetcherPayload({ error: "missing" })).toBeUndefined();
  });
});
