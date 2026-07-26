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

import type { FeedSource, CompositeFetchResult, SourceCommitment } from "./types.js";
import type { CommitResult, Json, LeafPreimage, InclusionProof } from "@lemmaoracle/sdk";
import { create, proofs, documents, prover, canonicalSort, commitDeep } from "@lemmaoracle/sdk";
import { createHash } from "node:crypto";
import { fetchComposite } from "./feeds/forex-composite.js";

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

type LeafOutcome = Readonly<{ ok: true }> | Readonly<{ ok: false }>;
type LemmaClient = ReturnType<typeof create>;

// ── helpers ───────────────────────────────────────────────────────────────

/**
 * Logging IO boundary helper. Returns the message so callers can bind
 * `const _ = await log(...)` without triggering expression-statement rules.
 */
const log = (message: string): Promise<string> => {
  console.log(message);
  return Promise.resolve(message);
};

const logError = (message: string): Promise<string> => {
  console.error(message);
  return Promise.resolve(message);
};

const padToDepth = <T>(
  arr: readonly T[],
  depth: number,
  pad: T,
): ReadonlyArray<T> =>
  arr.length >= depth
    ? arr
    : [...arr, ...Array.from({ length: depth - arr.length }, (_i: number) => pad)];

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

const countOutcomes = (
  outcomes: ReadonlyArray<LeafOutcome>,
): Readonly<{ ok: number; fail: number }> => ({
  ok: outcomes.filter((o) => o.ok).length,
  fail: outcomes.filter((o) => !o.ok).length,
});

/**
 * Fold async work sequentially (order-preserving), collecting results.
 */
const reduceSequential = <T, A>(
  items: ReadonlyArray<T>,
  initial: A,
  step: (acc: A, item: T, index: number) => Promise<A>,
): Promise<A> =>
  items.reduce<Promise<A>>(
    (chain, item, index) => chain.then((acc) => step(acc, item, index)),
    Promise.resolve(initial),
  );

const registerDocument = (
  client: LemmaClient,
  feed: FeedSource,
  config: PipelineConfig,
  data: Json,
  docId: string,
  docHash: string,
  commitment: CommitResult,
): Promise<void> =>
  documents
    .register(client, {
      schema: config.schema,
      docHash,
      cid: docHash,
      issuerId: `${feed.id}-pipeline`,
      subjectId: `${feed.id}-${docId}`,
      attributes: feed.getAttributes?.(data) ?? {},
      commitments: {
        scheme: "poseidon",
        root: commitment.root,
        leaves: commitment.leaves,
        randomness: commitment.randomness,
      },
      revocation: {
        scheme: "none",
        root: "0x" + "0".repeat(64),
      },
    })
    .then((_value: unknown) => undefined);

const maybeRegister = (
  dryRun: boolean,
  client: LemmaClient,
  feed: FeedSource,
  config: PipelineConfig,
  data: Json,
  docId: string,
  docHash: string,
  commitment: CommitResult,
): Promise<string> =>
  dryRun
    ? log(`[2/4] [dry] Would register doc: ${docHash.slice(0, 24)}...`)
    : log("[2/4] Registering document...")
        .then((_value: unknown) =>
          registerDocument(
            client,
            feed,
            config,
            data,
            docId,
            docHash,
            commitment,
          ),
        )
        .then((_value: unknown) => log(`  Doc registered: ${docHash.slice(0, 24)}...`));

// ── pipeline ──────────────────────────────────────────────────────────────

const proveLeaf = (
  client: LemmaClient,
  config: PipelineConfig,
  dryRun: boolean,
  docHash: string,
  commitment: CommitResult,
  index: number,
  leafCount: number,
): Promise<LeafOutcome> => {
  const pre = commitment.leafPreimages[index];
  const inc = commitment.inclusionProofs[index];
  return pre === undefined || inc === undefined
    ? Promise.resolve({ ok: false as const })
    : ((_value?: unknown) => {
        const t0 = Date.now();
        const witness = {
          root: BigInt(toHex64(commitment.root)),
          randomness: BigInt(toHex64(commitment.randomness)),
          pathHash: BigInt(toHex64(pre.nameHash)),
          valueHash: BigInt(toHex64(pre.valueHash)),
          siblings: padToDepth(inc.siblings, config.maxDepth, "0x0").map((s) =>
            BigInt(toHex64(s)),
          ),
          indices: padToDepth(inc.indices, config.maxDepth, 0),
        };

        return prover
          .prove(client, { circuitId: config.circuitId, witness })
          .then(({ proof, inputs }) =>
            dryRun
              ? log(
                  `  ✅ [${String(index + 1)}/${String(leafCount)}] ${pre.name} = ${String(pre.value)} (${String(Date.now() - t0)}ms) [dry]`,
                )
              : proofs
                  .submit(client, {
                    docHash,
                    circuitId: config.circuitId,
                    proof,
                    inputs,
                  })
                  .then((sr) =>
                    log(
                      `  ✅ [${String(index + 1)}/${String(leafCount)}] ${pre.name} = ${String(pre.value)} (${String(Date.now() - t0)}ms) → ${sr.verificationId}`,
                    ),
                  ),
          )
          .then((_msg: string) => ({ ok: true as const }))
          .catch((e: unknown) =>
            log(
              `  ❌ [${String(index + 1)}/${String(leafCount)}] ${pre.name}: ${e instanceof Error ? e.message : String(e)}`,
            ).then((_msg: string) => ({ ok: false as const })),
          );
      })();
};

export const runProofPipeline = async (
  feed: FeedSource,
  config: PipelineConfig,
): Promise<PipelineResult> => {
  const dryRun = config.dryRun ?? false;

  const _log1 = await log(`[1/4] Fetching via feed: ${feed.id}...`);
  const result = await feed.fetch();
  const data = result.response.body;
  const c = result.commitment;
  const docId = feed.getDocumentId(data);
  const _log2 = await log(`  Doc ID: ${docId}  Leaves: ${String(c.leafPreimages.length)}`);
  const _log3 = await log(`  Root: ${c.root}`);
  const docHash = sha256hex(`${c.root}|${docId}`);
  const client = create({ apiBase: config.apiBase, apiKey: config.apiKey });
  const _reg = await maybeRegister(dryRun, client, feed, config, data, docId, docHash, c);
  const leafCount = c.leafPreimages.length;
  const _log4 = await log(`[3/4] Proving ${String(leafCount)} leaves...`);
  const totalStart = Date.now();

  const outcomes = await reduceSequential(
    c.leafPreimages,
    [] as ReadonlyArray<LeafOutcome>,
    (acc, _pre, i) =>
      proveLeaf(client, config, dryRun, docHash, c, i, leafCount).then(
        (outcome) => [...acc, outcome],
      ),
  );

  const { ok, fail } = countOutcomes(outcomes);
  const durationMs = Date.now() - totalStart;
  const _log5 = await log(
    `[4/4] Done. ✅ ${String(ok)}  ❌ ${String(fail)}  Total: ${(durationMs / 1000).toFixed(1)}s`,
  );
  const _log6 = await log(`  Root: ${c.root}`);
  const _log7 = await log(`  Doc:  ${docHash}`);
  return {
    feedId: feed.id,
    root: c.root,
    docHash,
    leafCount,
    proofsOk: ok,
    proofsFail: fail,
    durationMs,
  };
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
  const totalStart = Date.now();

  const _log8 = await log(`=== Multi-Pipeline: ${String(feeds.length)} feed(s) ===\n`);
  const feedResults = await reduceSequential(
    feeds,
    [] as ReadonlyArray<PipelineResult>,
    (acc, feed) =>
      log(`\n── Feed: ${feed.id} ──`).then((_value: unknown) =>
        runProofPipeline(feed, config).then(
          (result) => [...acc, result],
          (e: unknown) =>
            logError(
              `  ❌ Feed ${feed.id} FAILED: ${e instanceof Error ? e.message : String(e)}`,
            ).then((_value: unknown) => acc),
        ),
      ),
  );

  const totalOk = feedResults.reduce((n, r) => n + r.proofsOk, 0);
  const totalFail =
    feedResults.reduce((n, r) => n + r.proofsFail, 0) +
    (feeds.length - feedResults.length);
  const totalDurationMs = Date.now() - totalStart;

  const _log9 = await log(
    `\n=== Multi-Pipeline Done ===\n` +
      `  Feeds: ${String(feedResults.length)}/${String(feeds.length)} ok\n` +
      `  Proofs: ✅ ${String(totalOk)}  ❌ ${String(totalFail)}\n` +
      `  Total: ${(totalDurationMs / 1000).toFixed(1)}s`,
  );
  return {
    feeds: feedResults,
    totalProofsOk: totalOk,
    totalProofsFail: totalFail,
    totalDurationMs,
  };
};

// ── average proof pipeline (forex-average-v1 circuit) ─────────────────────

/**
 * Find the leaf preimage and inclusion proof for a given currency path
 * (e.g. `$["rates"]["JPY"]`) within a source's leaf preimages.
 */
const findLeaf = (
  leafPreimages: ReadonlyArray<LeafPreimage>,
  inclusionProofs: ReadonlyArray<InclusionProof>,
  ccy: string,
): Promise<Readonly<{ preimage: LeafPreimage; proof: InclusionProof }>> => {
  const targetPath = `$["rates"]["${ccy}"]`;
  const idx = leafPreimages.findIndex((p) => p.name === targetPath);
  const preimage = idx === -1 ? undefined : leafPreimages[idx];
  const proof = idx === -1 ? undefined : inclusionProofs[idx];
  return preimage === undefined || proof === undefined
    ? Promise.reject(new Error(`Leaf not found for ${targetPath}`))
    : Promise.resolve({ preimage, proof });
};

const proveAverageCurrency = (
  client: LemmaClient,
  config: PipelineConfig,
  dryRun: boolean,
  docHash: string,
  srcA: SourceCommitment,
  srcB: SourceCommitment,
  ccy: string,
  index: number,
  leafCount: number,
): Promise<LeafOutcome> => {
  const t0 = Date.now();

  return Promise.all([
    findLeaf(srcA.leafPreimages, srcA.inclusionProofs, ccy),
    findLeaf(srcB.leafPreimages, srcB.inclusionProofs, ccy),
  ])
    .then(([leafA, leafB]) => {
      const rateA = BigInt(toHex64(leafA.preimage.valueHash));
      const rateB = BigInt(toHex64(leafB.preimage.valueHash));
      const averageRate = (rateA + rateB) / 2n;
      const pathHash = BigInt(toHex64(leafA.preimage.nameHash));

      const witness = {
        sourceRootA: BigInt(toHex64(srcA.root)),
        sourceRootB: BigInt(toHex64(srcB.root)),
        randomnessA: BigInt(toHex64(srcA.randomness)),
        randomnessB: BigInt(toHex64(srcB.randomness)),
        pathHash,
        averageRate,
        rateA,
        rateB,
        siblingsA: padToDepth(leafA.proof.siblings, config.maxDepth, "0x0").map(
          (s) => BigInt(toHex64(s)),
        ),
        indicesA: padToDepth(leafA.proof.indices, config.maxDepth, 0),
        siblingsB: padToDepth(leafB.proof.siblings, config.maxDepth, "0x0").map(
          (s) => BigInt(toHex64(s)),
        ),
        indicesB: padToDepth(leafB.proof.indices, config.maxDepth, 0),
      };

      return prover
        .prove(client, { circuitId: config.circuitId, witness })
        .then(({ proof, inputs }) =>
          dryRun
            ? log(
                `  ✅ [${String(index + 1)}/${String(leafCount)}] ${ccy} avg=${averageRate.toString()} (${String(Date.now() - t0)}ms) [dry]`,
              )
            : proofs
                .submit(client, {
                  docHash,
                  circuitId: config.circuitId,
                  proof,
                  inputs,
                })
                .then((sr) =>
                  log(
                    `  ✅ [${String(index + 1)}/${String(leafCount)}] ${ccy} avg=${averageRate.toString()} (${String(Date.now() - t0)}ms) → ${sr.verificationId}`,
                  ),
                ),
        );
    })
    .then((_msg: string) => ({ ok: true as const }))
    .catch((e: unknown) =>
      log(
        `  ❌ [${String(index + 1)}/${String(leafCount)}] ${ccy}: ${e instanceof Error ? e.message : String(e)}`,
      ).then((_msg: string) => ({ ok: false as const })),
    );
};

/**
 * Run the forex-average-v1 proof pipeline.
 *
 * 1. Calls fetchComposite() to get source commitments + averaged rates
 * 2. Registers a composite document (attributes = source roots + averaged rates)
 * 3. For each currency: builds witness with rateA, rateB, siblings, indices
 *    from both source trees and generates a forex-average-v1 proof
 * 4. Submits each proof to the Lemma API
 *
 * The circuit verifies:
 *   - rateA is in source tree A (Merkle inclusion)
 *   - rateB is in source tree B (Merkle inclusion)
 *   - 2 * averageRate === rateA + rateB
 */
export const runAverageProofPipeline = async (
  feed: FeedSource,
  config: PipelineConfig,
): Promise<PipelineResult> => {
  const dryRun = config.dryRun ?? false;

  const _log10 = await log(`[1/4] Fetching composite via: ${feed.id}...`);
  const composite: CompositeFetchResult = await fetchComposite();
  const { averagedRates, sources, sourceRoots, date } = composite;

  const srcA = sources["frankfurter"];
  const srcB = sources["erApi"];

  return srcA === undefined || srcB === undefined
    ? Promise.reject(new Error("forex/composite: missing source commitments"))
    : (async (_srcA: SourceCommitment, _srcB: SourceCommitment) => {
        const _log11 = await log(
          `  Date: ${date}  Currencies: ${String(Object.keys(averagedRates).length)}`,
        );
        const _log12 = await log(`  Root A (frankfurter): ${_srcA.root}`);
        const _log13 = await log(`  Root B (erApi):       ${_srcB.root}`);
        const merged: Json = {
          type: "forex-composite-v1",
          date,
          base: composite.base,
          sourceRoots,
          rates: averagedRates as unknown as Json,
        };
        const _canonical = canonicalSort(merged);
        const compositeCommit = commitDeep(merged, {
          maxDepth: config.maxDepth,
        });
        const docId = date;
        const docHash = sha256hex(`${compositeCommit.root}|${docId}`);
        const client = create({
          apiBase: config.apiBase,
          apiKey: config.apiKey,
        });

        const _reg = await maybeRegister(
          dryRun,
          client,
          feed,
          config,
          merged,
          docId,
          docHash,
          compositeCommit,
        );
        const currencies = Object.keys(averagedRates);
        const leafCount = currencies.length;
        const _log14 = await log(
          `[3/4] Proving ${String(leafCount)} currencies (forex-average-v1)...`,
        );
        const totalStart = Date.now();

        const outcomes = await reduceSequential(
          currencies,
          [] as ReadonlyArray<LeafOutcome>,
          (acc, ccy, i) =>
            proveAverageCurrency(
              client,
              config,
              dryRun,
              docHash,
              _srcA,
              _srcB,
              ccy,
              i,
              leafCount,
            ).then((outcome) => [...acc, outcome]),
        );

        const { ok, fail } = countOutcomes(outcomes);
        const durationMs = Date.now() - totalStart;
        const _log15 = await log(
          `[4/4] Done. ✅ ${String(ok)}  ❌ ${String(fail)}  Total: ${(durationMs / 1000).toFixed(1)}s`,
        );
        const _log16 = await log(`  Root: ${compositeCommit.root}`);
        const _log17 = await log(`  Doc:  ${docHash}`);
        return {
          feedId: feed.id,
          root: compositeCommit.root,
          docHash,
          leafCount,
          proofsOk: ok,
          proofsFail: fail,
          durationMs,
        };
      })(srcA, srcB);
};
