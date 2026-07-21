/**
 * Generic proof pipeline — fetch → register → prove → submit.
 *
 * Given a FeedSource and pipeline config, this module:
 *   1. Calls the feed's `fetch()` (which hits the fetcher Workers)
 *   2. Registers a document on the Lemma API
 *   3. Generates a Groth16 proof per leaf via SDK prover.prove()
 *   4. Submits each proof to the Lemma API
 *
 * The feed-specific parts (document ID extraction, attributes) come from
 * the FeedSource itself.  Everything else is generic.
 */

import type { FeedSource } from "./types.js";
import type { FetchResult } from "@lemmaoracle/fetcher";
import type { CommitResult, Json } from "@lemmaoracle/sdk";
import { create, proofs, documents, prover } from "@lemmaoracle/sdk";
import { createHash } from "node:crypto";

// ── types ─────────────────────────────────────────────────────────────────

export type PipelineConfig = Readonly<{
  /** Lemma API base URL. */
  apiBase: string;
  /** Lemma API key (required for live submission). */
  apiKey: string;
  /** Circuit ID for proof submission. */
  circuitId: string;
  /** Schema name for document registration. */
  schema: string;
  /** Max depth for the Merkle tree (must match circuit). */
  maxDepth: number;
  /** If true, skip document registration and proof submission. */
  dryRun?: boolean;
}>;

export type PipelineResult = Readonly<{
  feedId: string;
  root: string;
  docHash: string;
  leafCount: number;
  proofsOk: number;
  proofsFail: number;
  durationMs: number;
}>;

export type MultiPipelineResult = Readonly<{
  feeds: ReadonlyArray<PipelineResult>;
  totalProofsOk: number;
  totalProofsFail: number;
  totalDurationMs: number;
}>;

// ── helpers ───────────────────────────────────────────────────────────────

const padToDepth = <T>(arr: readonly T[], depth: number, pad: T): T[] => {
  const out = [...arr];
  while (out.length < depth) out.push(pad);
  return out;
};

const sha256hex = (s: string): string =>
  "0x" + createHash("sha256").update(s).digest("hex");

/**
 * Normalise a hex string to exactly 64 hex digits (32 bytes).
 * Poseidon hashes are 32 bytes but BigInt conversion strips leading
 * zero nibbles (e.g. `0x01abcd...` → `0x1abcd...`), producing a
 * different field element.  This pads to the canonical 64-hex form
 * so the circuit sees the correct value.
 */
const toHex64 = (hex: string): string => {
  const stripped = hex.startsWith("0x") ? hex.slice(2) : hex;
  return "0x" + stripped.padStart(64, "0");
};

// ── pipeline ──────────────────────────────────────────────────────────────

export const runProofPipeline = async (
  feed: FeedSource,
  config: PipelineConfig,
): Promise<PipelineResult> => {
  const { dryRun = false } = config;

  // 1. Fetch via feed source (hits fetcher Workers)
  console.log(`[1/4] Fetching via feed: ${feed.id}...`);
  const result: FetchResult = await feed.fetch();
  const data = result.data as Json;
  const c = result.commitment as CommitResult;
  const docId = feed.getDocumentId(data);
  console.log(`  Doc ID: ${docId}  Leaves: ${c.leafPreimages.length}`);
  console.log(`  Root: ${c.root}`);

  // 2. Register document
  const docHash = sha256hex(`${c.root}|${docId}`);
  if (!dryRun) {
    console.log("[2/4] Registering document...");
    const client = create({ apiBase: config.apiBase, apiKey: config.apiKey });
    const attrs = feed.getAttributes?.(data) ?? {};
    await documents.register(client, {
      schema: config.schema,
      docHash,
      cid: docHash,
      issuerId: `${feed.id}-pipeline`,
      subjectId: `${feed.id}-${docId}`,
      attributes: attrs,
      commitments: {
        scheme: "poseidon",
        root: c.root,
        leaves: c.leaves as readonly string[],
        randomness: c.randomness,
      },
      revocation: {
        scheme: "none",
        root: "0x" + "0".repeat(64),
      },
    });
    console.log(`  Doc registered: ${docHash.slice(0, 24)}...`);
  } else {
    console.log(`[2/4] [dry] Would register doc: ${docHash.slice(0, 24)}...`);
  }

  // 3. Generate + submit proofs via SDK prover (fetches artifacts from IPFS, cached)
  const leafCount = c.leafPreimages.length;
  console.log(`[3/4] Proving ${leafCount} leaves...`);
  let ok = 0;
  let fail = 0;
  const totalStart = Date.now();

  const client = create({ apiBase: config.apiBase, apiKey: config.apiKey });

  for (let i = 0; i < leafCount; i++) {
    const pre = c.leafPreimages[i]!;
    const inc = c.inclusionProofs[i]!;

    const t0 = Date.now();
    try {
      const witness = {
        root: BigInt(toHex64(c.root)),
        randomness: BigInt(toHex64(c.randomness)),
        pathHash: BigInt(toHex64(pre.nameHash)),
        valueHash: BigInt(toHex64(pre.valueHash)),
        siblings: padToDepth(inc.siblings, config.maxDepth, "0x0").map((s) => BigInt(toHex64(s))),
        indices: padToDepth(inc.indices, config.maxDepth, 0),
      };

      const { proof, inputs } = await prover.prove(client, {
        circuitId: config.circuitId,
        witness,
      });

      if (!dryRun) {
        const sr = await proofs.submit(client, {
          docHash,
          circuitId: config.circuitId,
          proof,
          inputs: inputs as readonly string[],
        });
        const ms = Date.now() - t0;
        console.log(`  ✅ [${i + 1}/${leafCount}] ${pre.name} = ${String(pre.value)} (${ms}ms) → ${sr.verificationId}`);
      } else {
        const ms = Date.now() - t0;
        console.log(`  ✅ [${i + 1}/${leafCount}] ${pre.name} = ${String(pre.value)} (${ms}ms) [dry]`);
      }
      ok++;
    } catch (e) {
      console.log(`  ❌ [${i + 1}/${leafCount}] ${pre.name}: ${e instanceof Error ? e.message : String(e)}`);
      fail++;
    }
  }

  const durationMs = Date.now() - totalStart;
  console.log(`[4/4] Done. ✅ ${ok}  ❌ ${fail}  Total: ${(durationMs / 1000).toFixed(1)}s`);
  console.log(`  Root: ${c.root}`);
  console.log(`  Doc:  ${docHash}`);

  return { feedId: feed.id, root: c.root, docHash, leafCount, proofsOk: ok, proofsFail: fail, durationMs };
};

// ── multi-pipeline ────────────────────────────────────────────────────────

/**
 * Run the proof pipeline against multiple feed sources sequentially.
 *
 * Each feed gets its own document registration and proof set,
 * producing independent verification counters on the dashboard.
 * Source feeds are processed first (so their proofs exist before
 * the composite feed references them).
 */
export const runMultiPipeline = async (
  feeds: ReadonlyArray<FeedSource>,
  config: PipelineConfig,
): Promise<MultiPipelineResult> => {
  const feedResults: PipelineResult[] = [];
  let totalOk = 0;
  let totalFail = 0;
  const totalStart = Date.now();

  console.log(
    `=== Multi-Pipeline: ${feeds.length} feed(s) ===\n`,
  );

  for (const feed of feeds) {
    console.log(`\n── Feed: ${feed.id} ──`);
    try {
      const result = await runProofPipeline(feed, config);
      feedResults.push(result);
      totalOk += result.proofsOk;
      totalFail += result.proofsFail;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`  ❌ Feed ${feed.id} FAILED: ${msg}`);
      totalFail++;
    }
  }

  const totalDurationMs = Date.now() - totalStart;
  console.log(
    `\n=== Multi-Pipeline Done ===\n` +
      `  Feeds: ${feedResults.length}/${feeds.length} ok\n` +
      `  Proofs: ✅ ${totalOk}  ❌ ${totalFail}\n` +
      `  Total: ${(totalDurationMs / 1000).toFixed(1)}s`,
  );

  return {
    feeds: feedResults,
    totalProofsOk: totalOk,
    totalProofsFail: totalFail,
    totalDurationMs,
  };
};
