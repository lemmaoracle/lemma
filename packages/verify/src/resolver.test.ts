import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getByIdMock, createMock } = vi.hoisted(() => ({
  getByIdMock: vi.fn(),
  createMock: vi.fn(() => ({})),
}));

vi.mock("@lemmaoracle/sdk", () => ({
  create: createMock,
  circuits: { getById: getByIdMock },
}));

import type { CircuitMeta } from "@lemmaoracle/spec";
import { createCircuitResolver } from "./resolver.js";

const fetchMock = vi.fn();

const okVkey = (vkey: unknown): Response =>
  ({ ok: true, json: async () => vkey }) as unknown as Response;

const notOk = (): Response => ({ ok: false }) as unknown as Response;

const metaWithVkey = (vkey: string, extra: Record<string, unknown> = {}): CircuitMeta =>
  ({ artifact: { location: { vkey } }, ...extra }) as unknown as CircuitMeta;

describe("createCircuitResolver", () => {
  beforeEach(() => {
    getByIdMock.mockReset();
    createMock.mockReset();
    createMock.mockReturnValue({});
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls through to the second gateway when the first returns non-ok", async () => {
    getByIdMock.mockResolvedValue(metaWithVkey("ipfs://Qm-test-1"));
    fetchMock.mockResolvedValueOnce(notOk()).mockResolvedValueOnce(okVkey({ second: "gateway-vkey" }));

    const out = await createCircuitResolver({} as never)("c1");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://artifacts.lemma.workers.dev/ipfs/Qm-test-1",
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, "https://gateway.pinata.cloud/ipfs/Qm-test-1");
    expect(out.vkey).toEqual({ second: "gateway-vkey" });
  });

  it("rejects after exhausting all six gateways", async () => {
    getByIdMock.mockResolvedValue(metaWithVkey("ipfs://Qm-test-2"));
    fetchMock.mockResolvedValue(notOk());

    await expect(createCircuitResolver({} as never)("c2")).rejects.toThrow(
      "vkey fetch failed: no gateways remaining",
    );
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      "https://artifacts.lemma.workers.dev/ipfs/Qm-test-2",
      "https://gateway.pinata.cloud/ipfs/Qm-test-2",
      "https://ipfs.io/ipfs/Qm-test-2",
      "https://dweb.link/ipfs/Qm-test-2",
      "https://trustless-gateway.link/ipfs/Qm-test-2",
      "https://w3s.link/ipfs/Qm-test-2",
    ]);
  });

  it("fetches a non-ipfs URL exactly once", async () => {
    getByIdMock.mockResolvedValue(metaWithVkey("https://example.com/vkey.json"));
    fetchMock.mockResolvedValue(okVkey({ fake: "vkey" }));

    const out = await createCircuitResolver({} as never)("c3");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/vkey.json");
    expect(out.vkey).toEqual({ fake: "vkey" });
  });

  it("rejects without fetching when the circuit has no vkey artifact", async () => {
    getByIdMock.mockResolvedValue({ artifact: { location: {} } } as unknown as CircuitMeta);

    await expect(createCircuitResolver({} as never)("missing-vkey")).rejects.toThrow(
      'circuit "missing-vkey" has no vkey artifact for offchain verification',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("selects the first verifier alg and defaults to groth16-bn254-snarkjs", async () => {
    getByIdMock
      .mockResolvedValueOnce(
        metaWithVkey("ipfs://Qm-test-5a", { verifiers: [{ alg: "whir-koalabear-solwhir" }] }),
      )
      .mockResolvedValueOnce(metaWithVkey("ipfs://Qm-test-5b", { verifiers: [] }));
    fetchMock.mockResolvedValue(okVkey({ fake: "vkey" }));

    const resolve = createCircuitResolver({} as never);
    const whir = await resolve("c5a");
    const fallback = await resolve("c5b");

    expect(whir.alg).toBe("whir-koalabear-solwhir");
    expect(fallback.alg).toBe("groth16-bn254-snarkjs");
  });

  it("plumbs the supplied client through and creates a default client otherwise", async () => {
    getByIdMock.mockResolvedValue(metaWithVkey("ipfs://Qm-test-6a"));
    fetchMock.mockResolvedValue(okVkey({ fake: "vkey" }));

    const client = {} as never;
    await createCircuitResolver(client)("c1");

    expect(getByIdMock).toHaveBeenCalledWith(client, "c1");
    expect(createMock).not.toHaveBeenCalled();

    getByIdMock.mockResolvedValue(metaWithVkey("ipfs://Qm-test-6b"));
    await createCircuitResolver()("c1");

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({});
  });

  it("memoizes the vkey fetch by URL across resolver instances", async () => {
    getByIdMock.mockResolvedValue(metaWithVkey("ipfs://Qm-test-7"));
    fetchMock.mockResolvedValue(okVkey({ fake: "vkey" }));

    const first = await createCircuitResolver()("c7");
    const callsAfterFirst = fetchMock.mock.calls.length;
    const second = await createCircuitResolver()("c7");

    expect(second).toEqual(first);
    expect(fetchMock.mock.calls.length).toBe(callsAfterFirst);
    expect(getByIdMock).toHaveBeenCalledTimes(2);
  });
});
