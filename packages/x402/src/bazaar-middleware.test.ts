/**
 * Unit tests for bazaarPaymentMiddleware v0.2.
 *
 * Mocks @x402/hono's paymentMiddlewareFromConfig so we never call the real
 * upstream during unit tests. The mock echoes the (potentially enriched)
 * config into a response header so tests can inspect what was injected.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";

vi.mock("@x402/hono", () => ({
  paymentMiddlewareFromConfig: vi.fn((config: unknown) => {
    return async (
      c: {
        res: Response;
        header: (k: string, v: string) => void;
      },
      next: () => Promise<void>
    ) => {
      c.header(
        "X-Test-Injected-Bazaar",
        JSON.stringify(
          (config as { accepts?: Array<{ extra?: { bazaar?: unknown } }> })
            .accepts?.[0]?.extra?.bazaar ?? null
        )
      );
      await next();
    };
  }),
}));

import { bazaarPaymentMiddleware } from "./bazaar-middleware.js";
import {
  setBazaarStatusEmitterForTesting,
  type BazaarStatusEvent,
} from "./bazaar-status-emitter.js";

const baseConfig = {
  recipient: "0x000000000000000000000000000000000000dEaD",
  amount: "70000",
  network: "base" as const,
};

describe("bazaarPaymentMiddleware (v0.2)", () => {
  const emitted: BazaarStatusEvent[] = [];

  beforeEach(() => {
    emitted.length = 0;
    setBazaarStatusEmitterForTesting({
      emit: (e) => emitted.push(e),
    });
  });

  afterEach(() => {
    setBazaarStatusEmitterForTesting(undefined);
  });

  it("does not inject bazaar extension when discoverable is false", async () => {
    const app = new Hono();
    app.use(
      "/foo",
      bazaarPaymentMiddleware({
        ...baseConfig,
        discoverable: false,
      } as never)
    );
    app.get("/foo", (c) => c.text("ok"));

    const res = await app.request("/foo");
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Test-Injected-Bazaar")).toBe("null");
  });

  it("throws at construction time when discoverable: true is missing required fields", () => {
    expect(() =>
      bazaarPaymentMiddleware({
        ...baseConfig,
        discoverable: true,
        // missing: schema, bazaarCategory, bazaarDescription
      } as never)
    ).toThrow(/discoverable: true requires/);
  });

  it("throws when bazaarDescription exceeds 256 chars", () => {
    expect(() =>
      bazaarPaymentMiddleware({
        ...baseConfig,
        discoverable: true,
        schema: "test-v1",
        bazaarCategory: "Inference",
        bazaarDescription: "x".repeat(257),
      } as never)
    ).toThrow(/exceeds 256 chars/);
  });

  it("injects bazaar extension input into accepts[0].extra when discoverable", async () => {
    const app = new Hono();
    app.use(
      "/attest",
      bazaarPaymentMiddleware({
        ...baseConfig,
        discoverable: true,
        schema: "inference-attestation-v1",
        bazaarCategory: "Inference",
        bazaarDescription: "For AI agents that need per-call attestations.",
        bazaarSubTags: ["verifiable-ai", "claim-check"],
        bazaarInputSchemaRef:
          "https://schemas.lemma.frame00.com/bazaar/product-b-input.json",
        bazaarOutputSchemaRef:
          "https://schemas.lemma.frame00.com/bazaar/product-b-output.json",
      } as never)
    );
    app.post("/attest", (c) => c.json({ ok: true }));

    const res = await app.request("/attest", { method: "POST" });
    expect(res.status).toBe(200);

    const injected = JSON.parse(res.headers.get("X-Test-Injected-Bazaar") ?? "null");
    expect(injected).toEqual({
      name: "inference-attestation-v1",
      description: "For AI agents that need per-call attestations.",
      category: "Inference",
      tags: ["verifiable-ai", "claim-check"],
      inputSchema:
        "https://schemas.lemma.frame00.com/bazaar/product-b-input.json",
      outputSchema:
        "https://schemas.lemma.frame00.com/bazaar/product-b-output.json",
    });
  });

  it("emits accepted status when EXTENSION-RESPONSES header is present", async () => {
    const app = new Hono();
    app.use(
      "/attest",
      bazaarPaymentMiddleware({
        ...baseConfig,
        discoverable: true,
        schema: "inference-attestation-v1",
        bazaarCategory: "Inference",
        bazaarDescription: "x",
      } as never)
    );
    app.post("/attest", (c) => {
      c.header("EXTENSION-RESPONSES", "status=accepted");
      return c.json({ ok: true });
    });

    await app.request("/attest", { method: "POST" });

    expect(emitted).toHaveLength(1);
    expect(emitted[0]?.status).toBe("accepted");
    expect(emitted[0]?.routePath).toBe("/attest");
    expect(emitted[0]?.schema).toBe("inference-attestation-v1");
  });

  it("emits rejected status without affecting the 200 response (payment-independent)", async () => {
    const app = new Hono();
    app.use(
      "/attest",
      bazaarPaymentMiddleware({
        ...baseConfig,
        discoverable: true,
        schema: "inference-attestation-v1",
        bazaarCategory: "Inference",
        bazaarDescription: "x",
      } as never)
    );
    app.post("/attest", (c) => {
      c.header("EXTENSION-RESPONSES", "status=rejected");
      return c.json({ ok: true });
    });

    const res = await app.request("/attest", { method: "POST" });
    expect(res.status).toBe(200);
    expect(emitted[0]?.status).toBe("rejected");
  });

  it("does not emit when EXTENSION-RESPONSES header is absent", async () => {
    const app = new Hono();
    app.use(
      "/attest",
      bazaarPaymentMiddleware({
        ...baseConfig,
        discoverable: true,
        schema: "inference-attestation-v1",
        bazaarCategory: "Inference",
        bazaarDescription: "x",
      } as never)
    );
    app.post("/attest", (c) => c.json({ ok: true }));

    await app.request("/attest", { method: "POST" });
    expect(emitted).toHaveLength(0);
  });

  it("returns 'unknown' status for forward-compat header values", async () => {
    const app = new Hono();
    app.use(
      "/attest",
      bazaarPaymentMiddleware({
        ...baseConfig,
        discoverable: true,
        schema: "x-v1",
        bazaarCategory: "Inference",
        bazaarDescription: "x",
      } as never)
    );
    app.post("/attest", (c) => {
      c.header("EXTENSION-RESPONSES", "status=quantum-superposition");
      return c.json({ ok: true });
    });

    await app.request("/attest", { method: "POST" });
    expect(emitted[0]?.status).toBe("unknown");
    expect(emitted[0]?.rawHeader).toBe("status=quantum-superposition");
  });
});
