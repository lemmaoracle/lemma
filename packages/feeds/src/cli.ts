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

import { writeFileSync } from "node:fs";
import { runFeed } from "./registry.js";
import type { FeedRunResult } from "./types.js";

// ── IO helpers ────────────────────────────────────────────────────────────

const log = (message: string): string => {
  console.log(message);
  return message;
};

const logErr = (message: string): string => {
  console.error(message);
  return message;
};

const exitWith = (code: number): never =>
  process.exit(code);

// ── args ──────────────────────────────────────────────────────────────────

const parseArgs = (
  argv: ReadonlyArray<string>,
): Readonly<{ feedId: string; output: string | null }> => {
  const args = argv.slice(2);

  return args.length === 0
    ? ((_?: undefined) => {
        const _u1 = logErr("Usage: feeds <feed-id> [--output <path>]");
        const _u2 = logErr("Example: feeds forex/frankfurter");
        return exitWith(2);
      })()
    : {
        feedId: args[0] ?? "",
        output: ((_?: undefined) => {
          const outputIdx = args.indexOf("--output");
          return outputIdx !== -1 && outputIdx + 1 < args.length
            ? (args[outputIdx + 1] ?? null)
            : null;
        })(),
      };
};

// ── output ────────────────────────────────────────────────────────────────

const writeOutput = (result: FeedRunResult, path: string): string => {
  writeFileSync(path, JSON.stringify(result, null, 2));
  return path;
};

const formatSummary = (result: FeedRunResult): string =>
  result.error !== null
    ? JSON.stringify({
        feed: result.feedId,
        status: "error",
        error: result.error,
        elapsedMs: result.completedAt - result.startedAt,
      })
    : result.result === null
      ? JSON.stringify({
          feed: result.feedId,
          status: "error",
          error: "missing result",
          elapsedMs: result.completedAt - result.startedAt,
        })
      : JSON.stringify({
          feed: result.feedId,
          status: "ok",
          root: result.result.commitment.root,
          leafCount: result.result.commitment.leaves.length,
          depth: result.result.commitment.depth,
          source: result.result.request.url,
          fetchedAt: new Date(result.result.request.fetchedAt).toISOString(),
          elapsedMs: result.completedAt - result.startedAt,
        });

// ── main ──────────────────────────────────────────────────────────────────

const main = (_?: undefined): Promise<null> => {
  const { feedId, output } = parseArgs(process.argv);
  return runFeed(feedId).then((result) => {
    const _written =
      output !== null && result.result !== null
        ? writeOutput(result, output)
        : null;
    const _summary = log(formatSummary(result));
    return result.error !== null ? exitWith(1) : null;
  });
};

const _cli = main().catch((err: unknown) => {
  const _e = logErr(
    `feeds CLI failed: ${err instanceof Error ? err.message : String(err)}`,
  );
  return exitWith(1);
});
