#!/usr/bin/env tsx
/**
 * CLI for @lemmaoracle/feeds — run a feed source from the command line.
 *
 * Usage:
 *   npx tsx src/cli.ts <feed-id> [--output <path>]
 *   npx tsx src/cli.ts forex/frankfurter
 *   npx tsx src/cli.ts forex/frankfurter --output /tmp/forex.json
 *
 * Environment variables are passed through to the feed (e.g. FOREX_BASE).
 *
 * Exit codes: 0 on success, 1 on failure (feed not found or fetch error).
 */

import { runFeed } from "./registry.js";
import type { FeedRunResult } from "./types.js";

// ── args ──────────────────────────────────────────────────────────────────

const parseArgs = (): Readonly<{ feedId: string; output: string | null }> => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: feeds <feed-id> [--output <path>]");
    console.error("Example: feeds forex/frankfurter");
    process.exit(2);
  }

  const feedId = args[0] ?? "";
  const outputIdx = args.indexOf("--output");

  return {
    feedId,
    output: outputIdx !== -1 && outputIdx + 1 < args.length
      ? (args[outputIdx + 1] ?? null)
      : null,
  };
};

// ── output ────────────────────────────────────────────────────────────────

const writeOutput = (result: FeedRunResult, path: string): void => {
  const { writeFileSync } = require("node:fs") as typeof import("node:fs");
  writeFileSync(path, JSON.stringify(result, null, 2));
};

const formatSummary = (result: FeedRunResult): string =>
  result.error !== null
    ? JSON.stringify({
        feed: result.feedId,
        status: "error",
        error: result.error,
        elapsedMs: result.completedAt - result.startedAt,
      })
    : JSON.stringify({
        feed: result.feedId,
        status: "ok",
        root: result.result!.commitment.root,
        leafCount: result.result!.commitment.leaves.length,
        depth: result.result!.commitment.depth,
        source: result.result!.source,
        fetchedAt: new Date(result.result!.fetchedAt).toISOString(),
        elapsedMs: result.completedAt - result.startedAt,
      });

// ── main ──────────────────────────────────────────────────────────────────

const main = async (): Promise<void> => {
  const { feedId, output } = parseArgs();
  const result = await runFeed(feedId);

  // Write full output if requested
  if (output !== null && result.result !== null) {
    writeOutput(result, output);
  }

  // Always print summary to stdout
  console.log(formatSummary(result));

  if (result.error !== null) {
    process.exit(1);
  }
};

main().catch((err: unknown) => {
  console.error(
    "feeds CLI failed:",
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
