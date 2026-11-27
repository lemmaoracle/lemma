import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { createHash } from "node:crypto";
import type { CommitResult, InclusionProof, LeafPreimage } from "@lemmaoracle/sdk";
import type { FetchResult } from "@lemmaoracle/fetcher";
import type { CompositeFetchResult, FeedSource, SourceCommitment } from "./types.js";
import type { PipelineConfig } from "./pipeline.js";

const {
  createMock,
  documentsRegisterMock,
  proofsSubmitMock,
  proverProveMock,
  canonicalSortMock,
  commitDeepMock,
  fetchCompositeMock,
} = vi.hoisted(() => ({
  createMock: vi.fn(),
  documentsRegisterMock: vi.fn(),
  proofsSubmitMock: vi.fn(),
  proverProveMock: vi.fn(),
  canonicalSortMock: vi.fn(),
  commitDeepMock: vi.fn(),
  fetchCompositeMock: vi.fn(),
}));

vi.mock("@lemmaoracle/sdk", () => ({
  create: createMock,
  documents: { register: documentsRegisterMock },
  proofs: { submit: proofsSubmitMock },
  prover: { prove: proverProveMock },
  canonicalSort: canonicalSortMock,
  commitDeep: commitDeepMock,
}));

vi.mock("./feeds/forex-composite.js", () => ({
  fetchComposite: fetchCompositeMock,
}));

import {
  runAverageProofPipeline,
  runMultiPipeline,
  runProofPipeline,
} from "./pipeline.js";

// ── fixtures ────────────────────────────────────────────────────────────────

const DOC_ID = "2026-11-27";

const CONFIG: PipelineConfig = {
  apiBase: "https://lemma.test",
  apiKey: "test-key",
  circuitId: "content-commitment-v1.2",
  schema: "test-schema-v1",
  maxDepth: 4,
};

const FAKE_CLIENT = { apiBase: "https://lemma.test", apiKey: "test-key" };

const docHashFor = (root: string, docId: string): string =>
  "0x" + createHash("sha256").update(`${root}|${docId}`).digest("hex");

const DOC_HASH = docHashFor("0x0a0b", DOC_ID);
const COMPOSITE_DOC_HASH = docHashFor("0xcccc", DOC_ID);

const INC_0: InclusionProof = { siblings: ["0xaa"], indices: [0] };
const INC_1: InclusionProof = { siblings: ["0xbb"], indices: [1] };

const COMMIT: CommitResult = {
  root: "0x0a0b",
  leaves: ["0x11", "0x22"],
  randomness: "0x0c0d",
  depth: 1,
  inclusionProofs: [INC_0, INC_1],
  leafPreimages: [
    { name: '$["a"]', value: 1, nameHash: "0x01", valueHash: "0x10", blindingHash: "0xbeef" },
    { name: '$["b"]', value: "x", nameHash: "0x02", valueHash: "0x20", blindingHash: "0xbeef" },
  ],
};

const makeFetchResult = (commitment: CommitResult): FetchResult =>
  ({
    request: { url: "https://upstream.test/x", fetchedAt: 0, date: DOC_ID },
    response: { data: { a: 1, b: "x" }, canonical: "{}" },
    commitment,
  }) as unknown as FetchResult;

const FETCH_RESULT = makeFetchResult(COMMIT);

const makeFeed = (
  id = "test/feed",
  result: FetchResult = FETCH_RESULT,
): { feed: FeedSource; fetchMock: Mock<() => Promise<FetchResult>> } => {
  const fetchMock = vi.fn(async (): Promise<FetchResult> => result);
  const feed: FeedSource = {
    id,
    label: `${id} label`,
    category: "test",
    fetch: fetchMock,
    getDocumentId: () => DOC_ID,
    getAttributes: () => ({ source: "test" }),
  };
  return { feed, fetchMock };
};

// ── average-pipeline fixtures ───────────────────────────────────────────────

const SRC_A_ROOT = "0xaaaa";
const SRC_A_RAND = "0x0a01";
const SRC_B_ROOT = "0xbbbb";
const SRC_B_RAND = "0x0b02";

const SRC_A: SourceCommitment = {
  root: SRC_A_ROOT,
  randomness: SRC_A_RAND,
  leafPreimages: [
    { name: '$["rates"]["JPY"]', value: 0, nameHash: "0x31", valueHash: "0x0a", blindingHash: "0xbeef" },
    { name: '$["rates"]["EUR"]', value: 0, nameHash: "0x33", valueHash: "0x1e", blindingHash: "0xbeef" },
  ],
  inclusionProofs: [
    { siblings: ["0xc1"], indices: [1] },
    { siblings: ["0xc3"], indices: [0] },
  ],
};

const ER_JPY: LeafPreimage = {
  name: '$["rates"]["JPY"]',
  value: 0,
  nameHash: "0x32",
  valueHash: "0x14",
  blindingHash: "0xbeef",
};
const ER_EUR: LeafPreimage = {
  name: '$["rates"]["EUR"]',
  value: 0,
  nameHash: "0x34",
  valueHash: "0x28",
  blindingHash: "0xbeef",
};

const SRC_B: SourceCommitment = {
  root: SRC_B_ROOT,
  randomness: SRC_B_RAND,
  leafPreimages: [ER_JPY, ER_EUR],
  inclusionProofs: [
    { siblings: ["0xc2"], indices: [0] },
    { siblings: ["0xc4"], indices: [1] },
  ],
};

const COMPOSITE_COMMIT: CommitResult = {
  root: "0xcccc",
  leaves: ["0xcc1"],
  randomness: "0xccdd",
  depth: 0,
  inclusionProofs: [],
  leafPreimages: [],
};

const MERGED = {
  type: "forex-composite-v1",
  date: DOC_ID,
  base: "USD",
  sourceRoots: { frankfurter: SRC_A_ROOT, erApi: SRC_B_ROOT },
  rates: { JPY: 15, EUR: 35 },
};

const COMPOSITE_RESULT: CompositeFetchResult = {
  feedId: "forex/composite",
  date: DOC_ID,
  base: "USD",
  averagedRates: { JPY: 15, EUR: 35 },
  sources: { frankfurter: SRC_A, erApi: SRC_B },
  sourceRoots: { frankfurter: SRC_A_ROOT, erApi: SRC_B_ROOT },
};

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  createMock.mockReset();
  documentsRegisterMock.mockReset();
  proofsSubmitMock.mockReset();
  proverProveMock.mockReset();
  canonicalSortMock.mockReset();
  commitDeepMock.mockReset();
  fetchCompositeMock.mockReset();
  createMock.mockReturnValue(FAKE_CLIENT);
  documentsRegisterMock.mockResolvedValue({ status: "registered", docHash: "0xdoc" });
  proverProveMock.mockResolvedValue({ proof: "0xproof", inputs: ["0x01"] });
  proofsSubmitMock.mockResolvedValue({ verificationId: "vrf_1", status: "received" });
  commitDeepMock.mockReturnValue(COMPOSITE_COMMIT);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── runProofPipeline ────────────────────────────────────────────────────────

describe("runProofPipeline", () => {
  it("happy path returns the exact result shape", async () => {
    const { feed } = makeFeed();
    const result = await runProofPipeline(feed, CONFIG);
    expect(result.feedId).toBe("test/feed");
    expect(result.root).toBe("0x0a0b");
    expect(result.docHash).toBe(DOC_HASH);
    expect(result.docHash).toBe(
      "0x9fbfe15f63318eef2bb24deb1a312a9dc47451794281ca7d40e9823d97d467f0",
    );
    expect(result.leafCount).toBe(2);
    expect(result.proofsOk).toBe(2);
    expect(result.proofsFail).toBe(0);
    expect(typeof result.durationMs).toBe("number");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("creates the client and registers the exact document payload", async () => {
    const { feed } = makeFeed();
    await runProofPipeline(feed, CONFIG);
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      apiBase: "https://lemma.test",
      apiKey: "test-key",
    });
    expect(documentsRegisterMock).toHaveBeenCalledTimes(1);
    expect(documentsRegisterMock).toHaveBeenCalledWith(FAKE_CLIENT, {
      schema: "test-schema-v1",
      docHash: DOC_HASH,
      cid: DOC_HASH,
      issuerId: "test/feed-pipeline",
      subjectId: "test/feed-2026-11-27",
      attributes: { source: "test" },
      commitments: {
        scheme: "poseidon",
        root: "0x0a0b",
        leaves: ["0x11", "0x22"],
        randomness: "0x0c0d",
      },
      revocation: { scheme: "none", root: "0x" + "0".repeat(64) },
    });
  });

  it("proves leaf 0 with the exact witness", async () => {
    const { feed } = makeFeed();
    await runProofPipeline(feed, CONFIG);
    const firstCall = proverProveMock.mock.calls[0];
    expect(firstCall).toBeDefined();
    expect(firstCall?.[0]).toBe(FAKE_CLIENT);
    expect(firstCall?.[1]).toStrictEqual({
      circuitId: "content-commitment-v1.2",
      witness: {
        root: 0x0a0bn,
        randomness: 0x0c0dn,
        pathHash: 0x01n,
        valueHash: 0x10n,
        siblings: [0xaAn, 0n, 0n, 0n],
        indices: [0, 0, 0, 0],
      },
    });
  });

  it("proves leaf 1 with the exact witness and submits both proofs", async () => {
    const { feed } = makeFeed();
    await runProofPipeline(feed, CONFIG);
    const secondCall = proverProveMock.mock.calls[1];
    expect(secondCall).toBeDefined();
    expect(secondCall?.[1]).toStrictEqual({
      circuitId: "content-commitment-v1.2",
      witness: {
        root: 0x0a0bn,
        randomness: 0x0c0dn,
        pathHash: 0x02n,
        valueHash: 0x20n,
        siblings: [0xbbn, 0n, 0n, 0n],
        indices: [1, 0, 0, 0],
      },
    });
    expect(proofsSubmitMock).toHaveBeenCalledTimes(2);
    expect(proofsSubmitMock).toHaveBeenNthCalledWith(1, FAKE_CLIENT, {
      docHash: DOC_HASH,
      circuitId: "content-commitment-v1.2",
      proof: "0xproof",
      inputs: ["0x01"],
    });
    expect(proofsSubmitMock).toHaveBeenNthCalledWith(2, FAKE_CLIENT, {
      docHash: DOC_HASH,
      circuitId: "content-commitment-v1.2",
      proof: "0xproof",
      inputs: ["0x01"],
    });
  });

  it("registers empty attributes when the feed has no getAttributes", async () => {
    const fetchMock = vi.fn(async (): Promise<FetchResult> => FETCH_RESULT);
    const feed: FeedSource = {
      id: "test/feed",
      label: "Test feed",
      category: "test",
      fetch: fetchMock,
      getDocumentId: () => DOC_ID,
    };
    await runProofPipeline(feed, CONFIG);
    const regCall = documentsRegisterMock.mock.calls[0];
    expect(regCall).toBeDefined();
    const payload = regCall?.[1] as { attributes: unknown };
    expect(payload.attributes).toEqual({});
  });

  it("counts a proving rejection as one failure and skips its submission", async () => {
    const { feed } = makeFeed();
    proverProveMock.mockRejectedValueOnce(new Error("prove boom"));
    const result = await runProofPipeline(feed, CONFIG);
    expect(result.proofsOk).toBe(1);
    expect(result.proofsFail).toBe(1);
    expect(proofsSubmitMock).toHaveBeenCalledTimes(1);
  });

  it("counts a leaf with a missing inclusion proof as a failure without proving", async () => {
    const { feed } = makeFeed(
      "test/feed",
      makeFetchResult({ ...COMMIT, inclusionProofs: [INC_0] }),
    );
    const result = await runProofPipeline(feed, CONFIG);
    expect(result.proofsOk).toBe(1);
    expect(result.proofsFail).toBe(1);
    expect(proverProveMock).toHaveBeenCalledTimes(1);
  });

  it("dryRun skips registration and submission but still proves", async () => {
    const { feed } = makeFeed();
    const result = await runProofPipeline(feed, { ...CONFIG, dryRun: true });
    expect(documentsRegisterMock).not.toHaveBeenCalled();
    expect(proofsSubmitMock).not.toHaveBeenCalled();
    expect(proverProveMock).toHaveBeenCalledTimes(2);
    expect(result.proofsOk).toBe(2);
  });
});

// ── runMultiPipeline ────────────────────────────────────────────────────────

describe("runMultiPipeline", () => {
  it("runs two feeds sequentially and sums the counters", async () => {
    const a = makeFeed("test/feed-a");
    const b = makeFeed("test/feed-b");
    const result = await runMultiPipeline([a.feed, b.feed], CONFIG);
    expect(result.feeds.length).toBe(2);
    expect(result.feeds[0]?.feedId).toBe("test/feed-a");
    expect(result.feeds[1]?.feedId).toBe("test/feed-b");
    expect(result.totalProofsOk).toBe(4);
    expect(result.totalProofsFail).toBe(0);
    const orderA = a.fetchMock.mock.invocationCallOrder[0];
    const orderB = b.fetchMock.mock.invocationCallOrder[0];
    expect(orderA).toBeDefined();
    expect(orderB).toBeDefined();
    expect(orderA).toBeLessThan(orderB as number);
  });

  it("swallows a feed fetch rejection and counts the failed feed", async () => {
    const a = makeFeed("test/feed-a");
    const failingFetch = vi.fn().mockRejectedValue(new Error("upstream down"));
    const feedB: FeedSource = {
      id: "test/feed-b",
      label: "test/feed-b label",
      category: "test",
      fetch: failingFetch,
      getDocumentId: () => DOC_ID,
      getAttributes: () => ({ source: "test" }),
    };
    const result = await runMultiPipeline([a.feed, feedB], CONFIG);
    expect(result.feeds.length).toBe(1);
    // Current behavior: totalFail mixes units (failed proofs + failed feeds). Pinned, not fixed.
    expect(result.totalProofsFail).toBe(1);
  });

  it("sums mixed per-feed outcomes", async () => {
    const a = makeFeed("test/feed-a");
    const b = makeFeed("test/feed-b");
    proverProveMock
      .mockResolvedValueOnce({ proof: "0xproof", inputs: ["0x01"] })
      .mockResolvedValueOnce({ proof: "0xproof", inputs: ["0x01"] })
      .mockRejectedValueOnce(new Error("prove boom"));
    const result = await runMultiPipeline([a.feed, b.feed], CONFIG);
    expect(result.feeds.length).toBe(2);
    expect(result.totalProofsOk).toBe(3);
    expect(result.totalProofsFail).toBe(1);
  });
});

// ── runAverageProofPipeline ─────────────────────────────────────────────────

describe("runAverageProofPipeline", () => {
  it("rejects when a source commitment is missing", async () => {
    const { feed } = makeFeed("test/composite");
    fetchCompositeMock.mockResolvedValue({
      ...COMPOSITE_RESULT,
      sources: { erApi: SRC_B },
    });
    const missingA = await runAverageProofPipeline(feed, CONFIG).then(
      () => null,
      (e: unknown) => e,
    );
    expect(missingA).toBeInstanceOf(Error);
    expect((missingA as Error).message).toBe(
      "forex/composite: missing source commitments",
    );

    fetchCompositeMock.mockResolvedValue({
      ...COMPOSITE_RESULT,
      sources: { frankfurter: SRC_A },
    });
    const missingB = await runAverageProofPipeline(feed, CONFIG).then(
      () => null,
      (e: unknown) => e,
    );
    expect(missingB).toBeInstanceOf(Error);
    expect((missingB as Error).message).toBe(
      "forex/composite: missing source commitments",
    );
  });

  it("happy path registers the composite and proves each currency", async () => {
    const { feed, fetchMock } = makeFeed("test/composite");
    const getAttributesMock = vi.fn((): Record<string, string> => ({ source: "test" }));
    const compositeFeed: FeedSource = { ...feed, getAttributes: getAttributesMock };
    fetchCompositeMock.mockResolvedValue(COMPOSITE_RESULT);
    const result = await runAverageProofPipeline(compositeFeed, CONFIG);

    expect(result.feedId).toBe("test/composite");
    expect(result.root).toBe("0xcccc");
    expect(result.docHash).toBe(COMPOSITE_DOC_HASH);
    expect(result.docHash).toBe(
      "0x13630312df0430695484c27330696425f402be4935985a93ca0d22baf82abb04",
    );
    expect(result.leafCount).toBe(2);
    expect(result.proofsOk).toBe(2);

    expect(fetchCompositeMock).toHaveBeenCalledTimes(1);
    expect(fetchCompositeMock).toHaveBeenCalledWith();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(commitDeepMock).toHaveBeenCalledTimes(1);
    expect(commitDeepMock).toHaveBeenCalledWith(MERGED, { maxDepth: 4 });

    const regCall = documentsRegisterMock.mock.calls[0];
    expect(regCall).toBeDefined();
    const payload = regCall?.[1] as { subjectId: string; commitments: { root: string } };
    expect(payload.subjectId).toBe("test/composite-2026-11-27");
    expect(payload.commitments.root).toBe("0xcccc");
    expect(getAttributesMock).toHaveBeenCalledWith(MERGED);
  });

  it("proves each currency with the exact average witness", async () => {
    const { feed } = makeFeed("test/composite");
    fetchCompositeMock.mockResolvedValue(COMPOSITE_RESULT);
    await runAverageProofPipeline(feed, CONFIG);

    expect(proverProveMock).toHaveBeenCalledTimes(2);
    const jpyCall = proverProveMock.mock.calls[0];
    expect(jpyCall).toBeDefined();
    expect(jpyCall?.[0]).toBe(FAKE_CLIENT);
    expect(jpyCall?.[1]).toStrictEqual({
      circuitId: "content-commitment-v1.2",
      witness: {
        sourceRootA: 0xaaaAn,
        sourceRootB: 0xbbbbn,
        randomnessA: 0x0a01n,
        randomnessB: 0x0b02n,
        pathHash: 0x31n,
        averageRate: 15n,
        rateA: 10n,
        rateB: 20n,
        siblingsA: [0xc1n, 0n, 0n, 0n],
        indicesA: [1, 0, 0, 0],
        siblingsB: [0xc2n, 0n, 0n, 0n],
        indicesB: [0, 0, 0, 0],
      },
    });

    const eurCall = proverProveMock.mock.calls[1];
    expect(eurCall).toBeDefined();
    expect(eurCall?.[1]).toStrictEqual({
      circuitId: "content-commitment-v1.2",
      witness: {
        sourceRootA: 0xaaaAn,
        sourceRootB: 0xbbbbn,
        randomnessA: 0x0a01n,
        randomnessB: 0x0b02n,
        pathHash: 0x33n,
        averageRate: 35n,
        rateA: 30n,
        rateB: 40n,
        siblingsA: [0xc3n, 0n, 0n, 0n],
        indicesA: [0, 0, 0, 0],
        siblingsB: [0xc4n, 0n, 0n, 0n],
        indicesB: [1, 0, 0, 0],
      },
    });
  });

  it("counts a currency missing from a source tree as a failure", async () => {
    const { feed } = makeFeed("test/composite");
    fetchCompositeMock.mockResolvedValue({
      ...COMPOSITE_RESULT,
      sources: {
        frankfurter: SRC_A,
        erApi: { ...SRC_B, leafPreimages: [ER_JPY] },
      },
    });
    const result = await runAverageProofPipeline(feed, CONFIG);
    expect(result.proofsOk).toBe(1);
    expect(result.proofsFail).toBe(1);
    expect(proofsSubmitMock).toHaveBeenCalledTimes(1);
  });
});
