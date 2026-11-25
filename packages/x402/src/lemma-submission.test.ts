import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LemmaClient } from "@lemmaoracle/sdk";

vi.mock("@lemmaoracle/sdk/documents", () => ({ register: vi.fn() }));
vi.mock("@lemmaoracle/sdk/proofs", () => ({ submit: vi.fn() }));
vi.mock("@lemmaoracle/sdk/client", () => ({ create: vi.fn() }));

import { register } from "@lemmaoracle/sdk/documents";
import { submit } from "@lemmaoracle/sdk/proofs";
import { create as createLemmaClient } from "@lemmaoracle/sdk/client";
import { createLemmaSubmissionHandler } from "./lemma-submission.js";
import type { ResolvedLemmaConfig } from "./lemma-config.js";

const registerMock = vi.mocked(register);
const submitMock = vi.mocked(submit);
const createMock = vi.mocked(createLemmaClient);
const fetchMock = vi.fn();

const CONFIG: ResolvedLemmaConfig = {
  apiBase: "https://api.test",
  apiKey: "test-key",
  circuitId: "cid-1",
  relayUrl: "https://relay.test/",
};

const fakeClient = { apiBase: "https://api.test" } as unknown as LemmaClient;

const okRelay = () =>
  ({
    ok: true,
    json: async () => ({ proof: "proof-abc", inputs: ["in1", "in2"] }),
  }) as unknown as Response;

const errRelay = {
  ok: false,
  status: 500,
  text: async () => "boom",
} as unknown as Response;

beforeEach(() => {
  registerMock.mockReset().mockResolvedValue({} as never);
  submitMock.mockReset().mockResolvedValue({} as never);
  createMock.mockReset().mockReturnValue(fakeClient);
  fetchMock.mockReset().mockResolvedValue(okRelay());
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createLemmaSubmissionHandler", () => {
  it("runs register -> relay -> submit in order on the happy path", async () => {
    const handler = createLemmaSubmissionHandler(CONFIG);
    const out = await handler({
      docHash: "dh1",
      schema: "s1",
      issuerId: "iss1",
      cid: "cid1",
      attributes: { a: 1 },
      witness: { w: 1 },
      metadata: { payer: "0xp" },
    });

    expect(out).toEqual({ proof: "proof-abc", inputs: ["in1", "in2"] });

    expect(registerMock).toHaveBeenCalledTimes(1);
    expect(registerMock).toHaveBeenCalledWith(fakeClient, {
      schema: "s1",
      docHash: "dh1",
      cid: "cid1",
      issuerId: "iss1",
      subjectId: "0xp",
      attributes: { a: 1 },
      commitments: { scheme: "poseidon", root: "dh1", leaves: [], randomness: "dh1" },
      revocation: { root: "dh1" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("https://relay.test/prover/prove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiBase: "https://api.test",
        apiKey: "test-key",
        input: { circuitId: "cid-1", witness: { w: 1 } },
      }),
    });

    expect(submitMock).toHaveBeenCalledTimes(1);
    expect(submitMock).toHaveBeenCalledWith(fakeClient, {
      docHash: "dh1",
      circuitId: "cid-1",
      proof: "proof-abc",
      inputs: ["in1", "in2"],
    });

    const registerOrder = registerMock.mock.invocationCallOrder[0]!;
    const fetchOrder = fetchMock.mock.invocationCallOrder[0]!;
    const submitOrder = submitMock.mock.invocationCallOrder[0]!;
    expect(registerOrder).toBeLessThan(fetchOrder);
    expect(fetchOrder).toBeLessThan(submitOrder);
  });

  it("creates a default client from apiBase and apiKey", async () => {
    const handler = createLemmaSubmissionHandler(CONFIG);
    await handler({ docHash: "dh", schema: "s", issuerId: "i" });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({ apiBase: "https://api.test", apiKey: "test-key" });
  });

  it("uses the override client and skips create when one is passed", async () => {
    const override = { apiBase: "https://override" } as unknown as LemmaClient;
    const handler = createLemmaSubmissionHandler(CONFIG, override);
    await handler({ docHash: "dh", schema: "s", issuerId: "i" });

    expect(createMock).not.toHaveBeenCalled();
    expect(registerMock.mock.calls[0]![0]).toBe(override);
    expect(submitMock.mock.calls[0]![0]).toBe(override);
  });

  it("applies defaults for cid, subjectId, attributes, and witness", async () => {
    const handler = createLemmaSubmissionHandler(CONFIG);
    await handler({ docHash: "dh", schema: "s", issuerId: "i" });

    expect(registerMock).toHaveBeenCalledWith(fakeClient, {
      schema: "s",
      docHash: "dh",
      cid: "dh",
      issuerId: "i",
      subjectId: "anonymous",
      attributes: {},
      commitments: { scheme: "poseidon", root: "dh", leaves: [], randomness: "dh" },
      revocation: { root: "dh" },
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0]![1].body));
    expect(body.input.witness).toEqual({ docHash: "dh" });

    await handler({ docHash: "dh", schema: "s", issuerId: "i", metadata: { payer: 42 } });
    expect(registerMock.mock.calls[1]![1].subjectId).toBe("anonymous");
  });

  it.each([
    ["trailing slash", "https://relay.test/", "https://relay.test/prover/prove"],
    ["no trailing slash", "https://relay.test", "https://relay.test/prover/prove"],
    [undefined, undefined, "https://p01--lemma-relay-api--svxwx5jzx.code.run/prover/prove"],
  ] as Array<[string | undefined, string | undefined, string]>)(
    "posts to the prover endpoint for relayUrl form %s",
    async (_label, relayUrl, expected) => {
      const cfg: ResolvedLemmaConfig =
        relayUrl === undefined
          ? { apiBase: "https://api.test", apiKey: "test-key", circuitId: "cid-1" }
          : { apiBase: "https://api.test", apiKey: "test-key", circuitId: "cid-1", relayUrl };
      const handler = createLemmaSubmissionHandler(cfg);
      await handler({ docHash: "dh", schema: "s", issuerId: "i" });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0]![0]).toBe(expected);
    }
  );

  it("throws and skips submit when the relay responds non-ok", async () => {
    fetchMock.mockResolvedValue(errRelay);
    const handler = createLemmaSubmissionHandler(CONFIG);

    await expect(handler({ docHash: "dh", schema: "s", issuerId: "i" })).rejects.toThrow(
      "Relay /prover/prove failed: 500 boom"
    );
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("aborts before relay and submit when register rejects", async () => {
    const err = new Error("register-fail");
    registerMock.mockRejectedValueOnce(err);
    const handler = createLemmaSubmissionHandler(CONFIG);

    await expect(handler({ docHash: "dh", schema: "s", issuerId: "i" })).rejects.toBe(err);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("propagates submit rejections", async () => {
    const err = new Error("submit-fail");
    submitMock.mockRejectedValueOnce(err);
    const handler = createLemmaSubmissionHandler(CONFIG);

    await expect(handler({ docHash: "dh", schema: "s", issuerId: "i" })).rejects.toBe(err);
  });
});
