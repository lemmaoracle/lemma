import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RoutesConfig, x402ResourceServer } from "@x402/core/server";
import type { MiddlewareHandler } from "hono";
import type { PaywallConfig, PaywallProvider } from "@x402/hono";

vi.mock("@x402/hono", () => ({ paymentMiddleware: vi.fn() }));

import { paymentMiddleware as mockedBase } from "@x402/hono";
import { paymentMiddleware, resolveDiscoveryConfig } from "./lemma-discovery.js";
import { safeParseJsonEnv } from "./lemma-config.js";

const baseMock = vi.mocked(mockedBase);
const sentinel = vi.fn() as unknown as MiddlewareHandler;
const fakeServer = {} as unknown as x402ResourceServer;

const makeRoutes = () => ({ "GET /a": { accepts: [{ extra: { foo: "bar" } }] }, "POST /b": { accepts: [{ extra: {} }, {}] } }) as unknown as RoutesConfig;
type AcceptView = { extra?: Record<string, unknown> };
const gotRoutes = () => baseMock.mock.calls[0]![0] as unknown as Record<string, { accepts: AcceptView[] }>;
const lemmaOf = (route: string, i: number) => (gotRoutes()[route]!.accepts[i]!.extra as Record<string, unknown>)["lemma"];

beforeEach(() => { delete process.env.LEMMA_DISCOVERY_CONFIG; delete process.env.LEMMA_CONFIG; baseMock.mockReset(); baseMock.mockReturnValue(sentinel); });
afterEach(() => { vi.unstubAllEnvs(); });

describe("safeParseJsonEnv", () => {
  it("passes valid objects through", () => {
    expect(safeParseJsonEnv('{"a":1,"b":"x"}')).toEqual({ a: 1, b: "x" });
  });

  it("returns undefined for malformed input", () => {
    expect(safeParseJsonEnv("{oops")).toBeUndefined();
    expect(safeParseJsonEnv("")).toBeUndefined();
  });

  it("passes through non-object JSON", () => {
    // Current behavior: no object-shape validation in safeParseJsonEnv.
    expect(safeParseJsonEnv('"justastring"')).toBe("justastring");
    expect(safeParseJsonEnv("123")).toBe(123);
  });
});

describe("resolveDiscoveryConfig", () => {
  it("returns undefined when no env is set", () => {
    expect(resolveDiscoveryConfig()).toBeUndefined();
  });

  it("reads root form from LEMMA_DISCOVERY_CONFIG", () => {
    vi.stubEnv("LEMMA_DISCOVERY_CONFIG", '{"schemas":["cred-v1"],"hints":{"tier":"gold"}}');
    expect(resolveDiscoveryConfig()).toEqual({ schemas: ["cred-v1"], hints: { tier: "gold" } });
  });

  it("reads .discovery sub-object from LEMMA_CONFIG", () => {
    vi.stubEnv("LEMMA_CONFIG", '{"apiBase":"https://api.test","discovery":{"schemas":["d1"],"routes":{"GET /a":{"schemas":["r1"]}}}}');
    const result = resolveDiscoveryConfig();
    expect(result?.schemas).toEqual(["d1"]);
    expect(result?.routes).toEqual({ "GET /a": { schemas: ["r1"] } });
    expect(result).not.toHaveProperty("apiBase");
  });

  it.each([
    ["empty object", "LEMMA_DISCOVERY_CONFIG", "{}"],
    ["irrelevant LEMMA_CONFIG", "LEMMA_CONFIG", '{"apiBase":"https://x"}'],
    ["non-object JSON", "LEMMA_DISCOVERY_CONFIG", '"justastring"'],
    ["malformed JSON", "LEMMA_DISCOVERY_CONFIG", "{oops"],
  ] as Array<[string, string, string]>)("returns undefined for %s", (_label, name, value) => {
    vi.stubEnv(name, value);
    expect(resolveDiscoveryConfig()).toBeUndefined();
  });

  it("prefers LEMMA_DISCOVERY_CONFIG over LEMMA_CONFIG", () => {
    vi.stubEnv("LEMMA_DISCOVERY_CONFIG", '{"schemas":["win"]}');
    vi.stubEnv("LEMMA_CONFIG", '{"discovery":{"schemas":["lose"]}}');
    expect(resolveDiscoveryConfig()?.schemas).toEqual(["win"]);
  });
});

describe("paymentMiddleware", () => {
  it("passes routes through unchanged with no env", () => {
    const routes = makeRoutes();
    const out = paymentMiddleware(routes, fakeServer);
    expect(baseMock).toHaveBeenCalledTimes(1);
    const call = baseMock.mock.calls[0]!;
    expect(call[0]).toBe(routes);
    expect(call[1]).toBe(fakeServer);
    expect(call[2]).toBeUndefined();
    expect(call[3]).toBeUndefined();
    expect(call[4]).toBeUndefined();
    expect(out).toBe(sentinel);

    baseMock.mockClear();
    const routes2 = makeRoutes();
    const paywallConfig = {} as unknown as PaywallConfig;
    const paywall = {} as unknown as PaywallProvider;
    const out2 = paymentMiddleware(routes2, fakeServer, paywallConfig, paywall, true);
    expect(baseMock).toHaveBeenCalledTimes(1);
    const call2 = baseMock.mock.calls[0]!;
    expect(call2[0]).toBe(routes2);
    expect(call2[1]).toBe(fakeServer);
    expect(call2[2]).toBe(paywallConfig);
    expect(call2[3]).toBe(paywall);
    expect(call2[4]).toBe(true);
    expect(out2).toBe(sentinel);
  });

  it("injects global schemas and hints for all routes", () => {
    vi.stubEnv("LEMMA_DISCOVERY_CONFIG", '{"schemas":["g1"],"hints":{"tier":"gold","n":7}}');
    paymentMiddleware(makeRoutes(), fakeServer);
    expect(baseMock).toHaveBeenCalledTimes(1);
    expect(lemmaOf("GET /a", 0)).toEqual({ schemas: ["g1"], tier: "gold", n: 7 });
    expect(lemmaOf("POST /b", 0)).toEqual({ schemas: ["g1"], tier: "gold", n: 7 });
    expect(lemmaOf("POST /b", 1)).toEqual({ schemas: ["g1"], tier: "gold", n: 7 });
    expect((gotRoutes()["GET /a"]!.accepts[0]!.extra as Record<string, unknown>)["foo"]).toBe("bar");
  });

  it("merges per-route overrides over global config", () => {
    vi.stubEnv(
      "LEMMA_DISCOVERY_CONFIG",
      '{"schemas":["g1"],"hints":{"tier":"gold","keep":"k"},"routes":{"GET /a":{"schemas":["r1"],"hints":{"tier":"plat","only":"a"}}}}'
    );
    paymentMiddleware(makeRoutes(), fakeServer);
    expect(lemmaOf("GET /a", 0)).toEqual({ schemas: ["r1"], tier: "plat", keep: "k", only: "a" });
    expect(lemmaOf("POST /b", 0)).toEqual({ schemas: ["g1"], tier: "gold", keep: "k" });
    expect(lemmaOf("POST /b", 1)).toEqual({ schemas: ["g1"], tier: "gold", keep: "k" });
  });

  it("merges pre-existing extra.lemma with discovery winning conflicts", () => {
    const routes = {
      "GET /a": { accepts: [{ extra: { other: "x", lemma: { keep: 1, tier: "old" } } }] },
      "POST /b": { accepts: [{}] },
    } as unknown as RoutesConfig;
    vi.stubEnv("LEMMA_DISCOVERY_CONFIG", '{"schemas":["g1"],"hints":{"tier":"gold"}}');
    paymentMiddleware(routes, fakeServer);
    expect(lemmaOf("GET /a", 0)).toEqual({ keep: 1, tier: "gold", schemas: ["g1"] });
    expect((gotRoutes()["GET /a"]!.accepts[0]!.extra as Record<string, unknown>)["other"]).toBe("x");
  });

  it("does not mutate the input routes", () => {
    vi.stubEnv("LEMMA_DISCOVERY_CONFIG", '{"schemas":["g1"],"hints":{"tier":"gold"}}');
    const routes = makeRoutes();
    const snapshot = structuredClone(routes);
    paymentMiddleware(routes, fakeServer);
    expect(routes).toEqual(snapshot);
  });
});
