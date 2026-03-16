import { describe, it, expect, vi, beforeEach } from "vitest";
import { create } from "./client";
import { prove } from "./prover";

describe("prover.prove", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns fallback proof when circuit has no artifacts", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/v1/circuits/age-over-18")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              circuitId: "age-over-18",
              schema: "user-kyc-v1",
              description: "age >= 18",
            }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const client = create({ apiBase: "http://localhost:8787" });
    (client as any).fetcher = mockFetch;

    const result = await prove(client, {
      circuitId: "age-over-18",
      witness: {
        age_bucket: "adult",
        randomness: "0xrand",
        attr_commitment_root: "0xroot123",
      },
    });

    expect(result.proof).toBeTruthy();
    expect(result.inputs).toContain("0xroot123");
  });

  it("returns empty publicInputs when witness has no attr_commitment_root (fallback)", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/v1/circuits/custom-circuit")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              circuitId: "custom-circuit",
              schema: "test-schema",
            }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const client = create({ apiBase: "http://localhost:8787" });
    (client as any).fetcher = mockFetch;

    const result = await prove(client, {
      circuitId: "custom-circuit",
      witness: { some_field: "value" },
    });

    expect(result.inputs).toEqual([]);
  });

  it("generates snarkjs proof when circuit has artifacts", async () => {
    // Mock snarkjs module
    vi.mock("snarkjs", () => ({
      groth16: {
        fullProve: vi.fn().mockResolvedValue({
          proof: {
            pi_a: ["1", "2"],
            pi_b: [
              ["3", "4"],
              ["5", "6"],
            ],
            pi_c: ["7", "8"],
          },
          publicSignals: ["0xroot456"],
        }),
      },
    }));

    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/v1/circuits/test-circuit")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              circuitId: "test-circuit",
              schema: "test-schema",
              inputs: ["attr_commitment_root"],
              artifact: {
                location: {
                  type: "ipfs",
                  wasm: "ipfs://QmWasm",
                  zkey: "ipfs://QmZkey",
                },
              },
            }),
        });
      }
      if (url.includes("/ipfs/QmWasm")) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        });
      }
      if (url.includes("/ipfs/QmZkey")) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const client = create({ apiBase: "http://localhost:8787" });
    (client as any).fetcher = mockFetch;

    const result = await prove(client, {
      circuitId: "test-circuit",
      witness: {
        attr_commitment_root: "0xroot456",
      },
    });

    expect(result.proof).toBeTruthy();
    expect(result.inputs).toEqual(["0xroot456"]);
  });

  it("rejects when circuit not found", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/v1/circuits/missing")) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not Found",
          json: () => Promise.resolve({ error: "Circuit not found" }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const client = create({ apiBase: "http://localhost:8787" });
    (client as any).fetcher = mockFetch;

    await expect(() =>
      prove(client, {
        circuitId: "missing",
        witness: { some_field: "value" },
      }),
    ).rejects.toThrow("HTTP 404");

    expect(mockFetch).toHaveBeenCalled();
  });

  it("rejects when artifact fetch fails", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/v1/circuits/bad-circuit")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              circuitId: "bad-circuit",
              schema: "test-schema",
              artifact: {
                location: {
                  type: "https",
                  wasm: "https://example.com/wasm",
                  zkey: "https://example.com/zkey",
                },
              },
            }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const client = create({ apiBase: "http://localhost:8787" });
    (client as any).fetcher = mockFetch;

    await expect(() =>
      prove(client, {
        circuitId: "bad-circuit",
        witness: { some_field: "value" },
      }),
    ).rejects.toThrow("Failed to fetch circuit artifact");
  });
});
