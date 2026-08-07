import { afterEach, describe, it, expect, vi } from "vitest";
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

  describe("runFeed with stubbed fetcher", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    // かつてこのテストは fetcher Workers（実ネットワーク）をライブで叩いて
    // いた。実測では Worker 往復が 7〜12 秒（コールドスタートで変動）、
    // ローカルの commitDeep({maxDepth:16}) が約 6 秒で、合計が 15 秒制限を
    // 確率的に超えて CI を恒常的に落としていた。ここでは変動要素である
    // ネットワークだけをスタブし、feeds 層の本来の仕事（レートのスケーリング
    // → 正規化 → maxDepth:16 でのコミットメント計算）は実物のまま検証する。
    // ライブ疎通は下の LIVE_FEEDS ゲート付きテストが担う。
    it(
      "runFeed returns result for valid feed",
      async () => {
        const envelope = {
          request: {
            url: "https://api.frankfurter.app/latest?from=USD",
            fetchedAt: 1754500000000,
            date: "2026-08-07",
          },
          response: {
            data: {
              amount: 1,
              base: "USD",
              date: "2026-08-06",
              rates: { EUR: 0.8664, GBP: 0.74255, JPY: 157.83 },
            },
          },
          commitment: { root: "0xdeadbeef" },
        };
        vi.stubGlobal(
          "fetch",
          vi.fn().mockResolvedValue(
            new Response(JSON.stringify(envelope), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          ),
        );

        const result = await runFeed("forex/frankfurter");
        expect(result.error).toBeNull();
        expect(result.result).not.toBeNull();
        expect(result.result!.commitment.root).toMatch(/^0x[0-9a-f]+$/);
        // feeds 層の責務: fetcher の float レートを ×10^8 で整数化して
        // 正規化 JSON に載せる。
        const data = result.result!.response.data as Readonly<
          Record<string, unknown>
        >;
        const rates = data["rates"] as Readonly<Record<string, unknown>>;
        expect(rates["JPY"]).toBe(15783000000);
      },
      // commitDeep({maxDepth:16}) は決定的な CPU 処理だが、ローカル実測
      // 約 6 秒・共有ランナーでは 2〜3 倍になりうるため余裕を持たせる。
      60000,
    );

    it("runFeed surfaces fetcher HTTP errors", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("upstream down", { status: 502 })),
      );
      const result = await runFeed("forex/frankfurter");
      expect(result.result).toBeNull();
      expect(result.error).toMatch(/HTTP 502/);
    });
  });

  // ライブ疎通（fetcher Workers → Frankfurter）。ネットワークと Worker の
  // コールドスタートに依存するため CI の既定では走らせない。
  //   LIVE_FEEDS=1 pnpm --filter @lemmaoracle/feeds test
  it.runIf(process.env["LIVE_FEEDS"] === "1")(
    "runFeed returns result for valid feed (live)",
    async () => {
      const result = await runFeed("forex/frankfurter");
      expect(result.error).toBeNull();
      expect(result.result).not.toBeNull();
      expect(result.result!.commitment.root).toMatch(/^0x[0-9a-f]+$/);
    },
    60000,
  );
});
