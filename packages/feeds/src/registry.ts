/**
 * Feed registry — maps feed IDs to FeedSource implementations.
 *
 * The registry is a static map for now.  In the future, third-party
 * feeds can be registered dynamically (e.g. via a plugin directory
 * or npm package discovery).
 */

import type { FeedSource, FeedRunResult } from "./types.js";
import { frankfurterForex } from "./feeds/forex.js";
import { erApiForex } from "./feeds/forex-er-api.js";
import { forexComposite } from "./feeds/forex-composite.js";
import { jpHolidays } from "./feeds/jp-holidays.js";
import { jpPostalCodes } from "./feeds/jp-postal-codes.js";

// ── registry ──────────────────────────────────────────────────────────────

/**
 * Built-in feed sources keyed by ID.
 *
 * To add a new feed: import it, add it to this map, and export it from
 * index.ts.  Third-party feeds will register via a separate mechanism
 * (e.g. `registerFeed(source)`).
 */
const feedMap = new Map<string, FeedSource>([
  [frankfurterForex.id, frankfurterForex],
  [erApiForex.id, erApiForex],
  [forexComposite.id, forexComposite],
  [jpHolidays.id, jpHolidays],
  [jpPostalCodes.id, jpPostalCodes],
]);

// ── public API ────────────────────────────────────────────────────────────

/** Find a feed by ID. Returns undefined if not found. */
export const findFeed = (id: string): FeedSource | undefined =>
  feedMap.get(id);

/** List all registered feed sources. */
export const listFeeds = (_?: undefined): ReadonlyArray<FeedSource> =>
  Array.from(feedMap.values());

/**
 * Run a feed by ID and return the result.
 *
 * @param id  Feed identifier (e.g. `"forex/frankfurter"`).
 * @returns   FeedRunResult with the fetch result or error.
 */
export const runFeed = (id: string): Promise<FeedRunResult> => {
  const feed = findFeed(id);
  const startedAt = Date.now();

  return feed === undefined
    ? Promise.resolve({
        feedId: id,
        startedAt,
        completedAt: Date.now(),
        result: null,
        error: `Unknown feed: ${id}. Available: ${listFeeds()
          .map((f) => f.id)
          .join(", ")}`,
      })
    : feed.fetch().then(
        (result) => ({
          feedId: id,
          startedAt,
          completedAt: Date.now(),
          result,
          error: null,
        }),
        (err: unknown) => ({
          feedId: id,
          startedAt,
          completedAt: Date.now(),
          result: null,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
};
