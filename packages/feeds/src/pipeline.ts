/**
 * Generic proof pipeline — fetch → register → prove → submit.
 *
 * Given a FeedSource and pipeline config, this module:
 *   1. Calls the feed's `fetch()` (which hits the fetcher Workers)
 *   2. Registers a document on the Lemma API
 *   3. Loads ZK circuit artifacts (wasm + zkey)
 *   4. Generates a Groth16 proof per leaf and submits to Lemma API
 *
 * The feed-specific parts (document ID extraction, attributes) come from
 * the FeedSource itself.  Everything else is generic.
 */

import type { FeedSource } from "./types.js";
import type { FetchResult } from "@lemmaoracle/fetcher";
import type { CommitResult, Json } from "@lemmaoracle/sdk";
import { create, proofs, documents } from "@lemmaoracle/sdk";
import { groth16 } from "snarkjs";
import fs from "node:fs";
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
  /** Path to the circuit wasm file. */
  wasmPath: string;
  /** Path to the circuit zkey file. */
  zkeyPath: string;
  /** If true, skip document registration and proof submission. */
  dryRun?: boolean;
}>;

export type PipelineResult = Readonly<{
  root: string;
  docHash: string;
  leafCount: number;
  proofsOk: number;
  proofsFail: number;
  durationMs: number;
}>;

// ── helpers ───────────────────────────────────────────────────────────────

const padToDepth = <T>(arr: readonly T[], depth: number, pad: T): T[] => {
  const out = [...arr];
  while (out.length < depth) out.push(pad);
  return out;
};

const sha256hex = (s: string): string =>
  "0x" + createHash("sha256").update(s).digest("hex");

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

  // 3. Load artifacts
  if (!fs.existsSync(config.wasmPath)) throw new Error(`WASM not found: ${config.wasmPath}`);
  if (!fs.existsSync(config.zkeyPath)) throw new Error(`ZKEY not found: ${config.zkeyPath}`);
  const wasmBuf = fs.readFileSync(config.wasmPath);
  const zkeyBuf = fs.readFileSync(config.zkeyPath);

  // 4. Generate + submit proofs
  const leafCount = c.leafPreimages.length;
  console.log(`[3/4] Generating ${leafCount} proofs...`);
  let ok = 0;
  let fail = 0;
  const totalStart = Date.now();

  for (let i = 0; i < leafCount; i++) {
    const pre = c.leafPreimages[i]!;
    const inc = c.inclusionProofs[i]!;

    const t0 = Date.now();
    try {
      const witness = {
        root: BigInt(c.root),
        randomness: BigInt(c.randomness),
        pathHash: BigInt(pre.nameHash),
        valueHash: BigInt(pre.valueHash),
        siblings: padToDepth(inc.siblings, config.maxDepth, "0x0").map((s) => BigInt(s)),
        indices: padToDepth(inc.indices, config.maxDepth, 0),
      };

      const { proof, publicSignals } = await groth16.fullProve(witness, wasmBuf, zkeyBuf);
      const proofB64 = Buffer.from(JSON.stringify(proof)).toString("base64");

      if (!dryRun) {
        const client = create({ apiBase: config.apiBase, apiKey: config.apiKey });
        const sr = await proofs.submit(client, {
          docHash,
          circuitId: config.circuitId,
          proof: proofB64,
          inputs: publicSignals as readonly string[],
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

  return { root: c.root, docHash, leafCount, proofsOk: ok, proofsFail: fail, durationMs };
};
