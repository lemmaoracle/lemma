import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FacilitatorClient, SettleResultContext } from "@x402/core/server";

type EnrichFn = (d: unknown, c: unknown) => Promise<unknown>;
type StubInstance = {
  facilitatorArg: unknown;
  extensions: Array<{ key: string; enrichSettlementResponse: EnrichFn }>;
};

vi.mock("@x402/core/server", () => {
  class StubBase {
    static instances: StubInstance[] = [];
    facilitatorArg: unknown = undefined;
    extensions: StubInstance["extensions"] = [];
    constructor(facilitator?: unknown) {
      this.facilitatorArg = facilitator;
      StubBase.instances.push(this as unknown as StubInstance);
    }
    registerExtension(ext: StubInstance["extensions"][number]) {
      this.extensions.push(ext);
      return this;
    }
  }
  return { x402ResourceServer: StubBase };
});

vi.mock("./lemma-submission.js", () => ({ createLemmaSubmissionHandler: vi.fn() }));

import { x402ResourceServer as BaseMock } from "@x402/core/server";
import { createLemmaSubmissionHandler } from "./lemma-submission.js";
import { x402ResourceServer as LemmaServer } from "./lemma-server.js";

const stubBase = BaseMock as unknown as { instances: StubInstance[] };
const createHandlerMock = vi.mocked(createLemmaSubmissionHandler);
const submissionMock = vi.fn();
let consoleError!: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  stubBase.instances.length = 0;
  createHandlerMock.mockReset();
  submissionMock.mockReset().mockResolvedValue({ proof: "proof-abc", inputs: ["in1"] });
  createHandlerMock.mockReturnValue(submissionMock as never);
  for (const k of ["LEMMA_CONFIG", "LEMMA_API_BASE", "LEMMA_API_KEY", "LEMMA_CIRCUIT_ID", "LEMMA_RELAY_URL"] as const) {
    delete process.env[k];
  }
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-24T00:00:00Z"));
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const extOf = (i = 0) => stubBase.instances[i]!.extensions[0]!;
const capturedConfig = () => createHandlerMock.mock.calls[0]![0]!;

const TX_GOLD = "0x1111111111111111111111111111111122222222222222222222222222222222";
const TX_STRIPPED = "1111111111111111111111111111111122222222222222222222222222222222";
const PAYTO_GOLD = "0x0123456789abcdef0123456789ABCDEF01234567";

const GOLDEN_WITNESS = {
  txHashPacked: ["45370982256125128461783280990902428194", "22685491128062564230891640495451214097"],
  recipientLow: "9920249030613615975",
  recipientHigh: "352125166730063718056674663",
  amount: "1000",
  timestamp: "1795478400",
  minAmount: "1000",
  commitment: "17787713821014788195260575159081001236096681441731879706115200539956340760739",
  minAmountPublic: "1000",
  timestampMax: "1795482000",
};

const SHORT_WITNESS = {
  txHashPacked: ["0", "2748"],
  recipientLow: "0",
  recipientHigh: "0",
  amount: "1000",
  timestamp: "1795478400",
  minAmount: "1000",
  commitment: "19580436472953386160894942147169509724587204474015456118123687636252569007087",
  minAmountPublic: "1000",
  timestampMax: "1795482000",
};

describe("LemmaResourceServer config resolution", () => {
  it("prefers explicit config over a conflicting LEMMA_CONFIG", () => {
    vi.stubEnv(
      "LEMMA_CONFIG",
      JSON.stringify({
        apiBase: "https://conflict",
        apiKey: "conflict",
        circuitId: "conflict",
        relayUrl: "https://conflict-relay",
      })
    );
    const fac = {} as unknown as FacilitatorClient;
    new LemmaServer(fac, { apiBase: "https://explicit", apiKey: "explicit-key" });

    expect(createHandlerMock).toHaveBeenCalledTimes(1);
    expect(capturedConfig().apiBase).toBe("https://explicit");
    expect(capturedConfig().apiKey).toBe("explicit-key");
    expect(capturedConfig().circuitId).toBe("x402-payment-v1");
    expect(stubBase.instances[0]!.extensions).toHaveLength(1);
    expect(stubBase.instances[0]!.extensions[0]!.key).toBe("lemma");
  });

  it("applies defaults for an empty explicit config", () => {
    new LemmaServer(undefined, {});

    expect(createHandlerMock).toHaveBeenCalledTimes(1);
    expect(capturedConfig().apiBase).toBe("https://workers.lemma.workers.dev");
    expect(capturedConfig().circuitId).toBe("x402-payment-v1");
  });

  it("reads a full LEMMA_CONFIG JSON object", () => {
    vi.stubEnv(
      "LEMMA_CONFIG",
      JSON.stringify({
        apiBase: "https://json.test",
        apiKey: "json-key",
        circuitId: "json-circuit",
        relayUrl: "https://json-relay",
        discovery: { schemas: ["s"] },
      })
    );
    new LemmaServer(undefined);

    expect(createHandlerMock).toHaveBeenCalledTimes(1);
    expect(capturedConfig().apiBase).toBe("https://json.test");
    expect(capturedConfig().apiKey).toBe("json-key");
    expect(capturedConfig().circuitId).toBe("json-circuit");
    expect(capturedConfig().relayUrl).toBe("https://json-relay");
    expect(capturedConfig().discovery).toEqual({ schemas: ["s"] });
  });

  it("falls back to individual env vars", () => {
    vi.stubEnv("LEMMA_API_BASE", "https://indiv");
    vi.stubEnv("LEMMA_API_KEY", "indiv-key");
    vi.stubEnv("LEMMA_CIRCUIT_ID", "indiv-circuit");
    vi.stubEnv("LEMMA_RELAY_URL", "https://indiv-relay");
    new LemmaServer(undefined);

    expect(createHandlerMock).toHaveBeenCalledTimes(1);
    expect(capturedConfig().apiBase).toBe("https://indiv");
    expect(capturedConfig().apiKey).toBe("indiv-key");
    expect(capturedConfig().circuitId).toBe("indiv-circuit");
    expect(capturedConfig().relayUrl).toBe("https://indiv-relay");
  });

  it("defaults the circuit id when LEMMA_CIRCUIT_ID is unset", () => {
    vi.stubEnv("LEMMA_API_BASE", "https://indiv");
    new LemmaServer(undefined);

    expect(createHandlerMock).toHaveBeenCalledTimes(1);
    expect(capturedConfig().apiBase).toBe("https://indiv");
    expect(capturedConfig().circuitId).toBe("x402-payment-v1");
  });

  it("CURRENT BEHAVIOR: LEMMA_CONFIG without apiBase falls back to individual env vars (JSON circuitId dropped)", () => {
    vi.stubEnv("LEMMA_CONFIG", '{"circuitId":"c1"}');
    vi.stubEnv("LEMMA_API_BASE", "https://indiv");
    new LemmaServer(undefined);

    expect(createHandlerMock).toHaveBeenCalledTimes(1);
    expect(capturedConfig().apiBase).toBe("https://indiv");
    expect(capturedConfig().circuitId).toBe("x402-payment-v1");
  });

  it("CURRENT BEHAVIOR: LEMMA_CONFIG without apiBase and no individual vars wires nothing", () => {
    vi.stubEnv("LEMMA_CONFIG", '{"circuitId":"c1"}');
    new LemmaServer(undefined);

    expect(createHandlerMock).not.toHaveBeenCalled();
    expect(stubBase.instances[0]!.extensions).toEqual([]);
  });

  it("wires nothing when no config is available", () => {
    new LemmaServer(undefined);

    expect(createHandlerMock).not.toHaveBeenCalled();
    expect(stubBase.instances[0]!.extensions).toEqual([]);
  });

  it("forwards the facilitator client to super", () => {
    const fac = {} as unknown as FacilitatorClient;
    new LemmaServer(fac, { apiBase: "https://explicit" });

    expect(stubBase.instances[0]!.facilitatorArg).toBe(fac);
  });
});

describe("LemmaResourceServer enrichSettlementResponse", () => {
  it("submits the golden witness and returns proof metadata", async () => {
    new LemmaServer(undefined, { apiBase: "https://api.test", circuitId: "golden-circuit" });
    const ctx = {
      requirements: { extra: { schema: "test-schema" }, payTo: PAYTO_GOLD, amount: "1000" },
      result: { payer: "0xpayer1", transaction: TX_GOLD, network: "base" },
    } as unknown as SettleResultContext;

    const out = await extOf().enrichSettlementResponse({}, ctx);

    expect(out).toEqual({
      proof: "proof-abc",
      inputs: ["in1"],
      circuitId: "golden-circuit",
      generatedAt: 1795478400000,
    });
    expect(submissionMock).toHaveBeenCalledTimes(1);
    expect(submissionMock).toHaveBeenCalledWith({
      docHash: TX_STRIPPED,
      schema: "test-schema",
      issuerId: "lemma-x402",
      witness: GOLDEN_WITNESS,
      metadata: { payer: "0xpayer1", transaction: TX_GOLD, network: "base" },
    });

    // The `_docHash` local is dead code: extra.docHash is ignored.
    const ctx2 = {
      requirements: {
        extra: { schema: "test-schema", docHash: "SHOULD-BE-IGNORED" },
        payTo: PAYTO_GOLD,
        amount: "1000",
      },
      result: { payer: "0xpayer1", transaction: TX_GOLD, network: "base" },
    } as unknown as SettleResultContext;
    await extOf().enrichSettlementResponse({}, ctx2);
    const submitted = submissionMock.mock.calls[1]![0] as { docHash: string };
    expect(submitted.docHash).toBe(TX_STRIPPED);
  });

  it("handles a short transaction with schema/amount defaults", async () => {
    new LemmaServer(undefined, { apiBase: "https://api.test" });
    const ctx = {
      requirements: {},
      result: { transaction: "0xabc", payer: "p", network: "n" },
    } as unknown as SettleResultContext;

    await extOf().enrichSettlementResponse({}, ctx);

    expect(submissionMock).toHaveBeenCalledTimes(1);
    const submitted = submissionMock.mock.calls[0]![0] as { witness: unknown; schema: string };
    expect(submitted.witness).toEqual(SHORT_WITNESS);
    expect(submitted.schema).toBe("default");
  });

  it("resolves undefined and logs instead of throwing on submission failure", async () => {
    const errZ = new Error("boom-z");
    submissionMock.mockRejectedValueOnce(errZ);
    new LemmaServer(undefined, { apiBase: "https://api.test" });
    const ctx = {
      requirements: {},
      result: { transaction: "0xabc", payer: "p", network: "n" },
    } as unknown as SettleResultContext;

    const out = await extOf().enrichSettlementResponse({}, ctx);

    expect(out).toBeUndefined();
    expect(consoleError.mock.calls[0]![0]).toBe("[Lemma] enrichSettlementResponse error:");
    expect(consoleError.mock.calls[0]![1]).toBe(errZ);
  });
});
