import { describe, it, expect } from "vitest";
import { findFeed, listFeeds, runFeed } from "./registry.js";

describe("feed registry", () => {
  it("lists forex/frankfurter", () => {
    const feeds = listFeeds();
    expect(feeds.length).toBeGreaterThanOrEqual(1);
    expect(feeds.some((f) => f.id === "forex/frankfurter")).toBe(true);
  });

  it("finds forex/frankfurter by ID", () => {
    const feed = findFeed("forex/frankfurter");
    expect(feed).toBeDefined();
    expect(feed!.id).toBe("forex/frankfurter");
    expect(feed!.category).toBe("forex");
  });

  it("returns undefined for unknown feed", () => {
    expect(findFeed("nonexistent/feed")).toBeUndefined();
  });

  it("runFeed returns error for unknown feed", async () => {
    const result = await runFeed("nonexistent/feed");
    expect(result.error).not.toBeNull();
    expect(result.result).toBeNull();
  });

  it("runFeed returns result for valid feed", async () => {
    const result = await runFeed("forex/frankfurter");
    expect(result.error).toBeNull();
    expect(result.result).not.toBeNull();
    expect(result.result!.commitment.root).toMatch(/^0x[0-9a-f]+$/);
  }, 15000);
});
