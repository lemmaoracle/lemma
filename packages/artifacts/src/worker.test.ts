import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "./worker.js";

const CID_V0 = "QmbWqxBEKC3P8tqsKc98xmWNzrzztMQ2BXkqL2Ldc8uAtu";
const CID_V1 = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";

const GATEWAYS: ReadonlyArray<string> = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
  "https://trustless-gateway.link/ipfs/",
  "https://w3s.link/ipfs/",
];

const artifactUrl = (cid: string): string =>
  `https://artifacts.lemma.workers.dev/ipfs/${cid}`;

const okBody = (bytes: string): ArrayBuffer =>
  new TextEncoder().encode(bytes).buffer;

const jsonOf = async (res: Response): Promise<{ error: string }> =>
  (await res.json()) as { error: string };

const mockCtx = (): ExecutionContext =>
  ({ waitUntil: vi.fn() }) as unknown as ExecutionContext;

const mockCache = (): {
  match: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
} => ({
  match: vi.fn().mockResolvedValue(undefined),
  put: vi.fn().mockResolvedValue(undefined),
});

describe("artifacts worker", () => {
  const cache = mockCache();
  const ctx = mockCtx();

  beforeEach(() => {
    cache.match.mockReset().mockResolvedValue(undefined);
    cache.put.mockReset().mockResolvedValue(undefined);
    (ctx.waitUntil as ReturnType<typeof vi.fn>).mockReset();
    vi.stubGlobal("caches", { default: cache });
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 400 JSON for a non-CID path segment", async () => {
    const res = await worker.fetch(
      new Request("https://artifacts.lemma.workers.dev/ipfs/not-a-cid"),
      {},
      ctx,
    );
    expect(res.status).toBe(400);
    expect(await jsonOf(res)).toEqual({ error: "not an IPFS CID" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("does not proxy arbitrary URLs as a CID", async () => {
    const res = await worker.fetch(
      new Request("https://artifacts.lemma.workers.dev/ipfs/evil.example"),
      {},
      ctx,
    );
    expect(res.status).toBe(400);
    expect(await jsonOf(res)).toEqual({ error: "not an IPFS CID" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 404 for paths other than /ipfs/{CID}", async () => {
    const res = await worker.fetch(
      new Request("https://artifacts.lemma.workers.dev/health"),
      {},
      ctx,
    );
    expect(res.status).toBe(404);
    expect(await jsonOf(res)).toEqual({ error: "not found" });
  });

  it("returns 204 on CORS preflight", async () => {
    const res = await worker.fetch(
      new Request(artifactUrl(CID_V0), { method: "OPTIONS" }),
      {},
      ctx,
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("serves a cache hit without contacting gateways", async () => {
    const cached = new Response("cached-bytes", {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": "12",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
    cache.match.mockResolvedValue(cached);

    const res = await worker.fetch(new Request(artifactUrl(CID_V0)), {}, ctx);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("cached-bytes");
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(cache.put).not.toHaveBeenCalled();
  });

  it("fetches all gateways in parallel on miss and returns the first success", async () => {
    const fetchMock = vi.fn((url: string) =>
      url.startsWith("https://ipfs.io/")
        ? Promise.resolve(
            new Response(okBody("from-ipfs-io"), { status: 200 }),
          )
        : Promise.reject(new Error("gateway-fail")),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await worker.fetch(new Request(artifactUrl(CID_V0)), {}, ctx);

    // All five start at once: a serial fallback would stop after the first
    // success and never call the remaining gateways.
    expect(fetchMock).toHaveBeenCalledTimes(GATEWAYS.length);
    GATEWAYS.forEach((gateway) => {
      expect(fetchMock).toHaveBeenCalledWith(`${gateway}${CID_V0}`);
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/octet-stream");
    expect(res.headers.get("Cache-Control")).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(res.headers.get("Content-Length")).toBe(
      String(okBody("from-ipfs-io").byteLength),
    );
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(await res.text()).toBe("from-ipfs-io");
    expect(ctx.waitUntil).toHaveBeenCalledTimes(1);
    expect(cache.put).toHaveBeenCalledTimes(1);
    const putReq = cache.put.mock.calls[0]?.[0] as Request | undefined;
    expect(putReq).toBeDefined();
    expect(putReq?.url).toBe(artifactUrl(CID_V0));
    expect(putReq?.method).toBe("GET");
  });

  it("accepts a CIDv1 and relays it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(okBody("v1-bytes"), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await worker.fetch(new Request(artifactUrl(CID_V1)), {}, ctx);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("v1-bytes");
    expect(fetchMock).toHaveBeenCalledWith(`${GATEWAYS[0]}${CID_V1}`);
  });

  it("returns 502 JSON when every gateway fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );

    const res = await worker.fetch(new Request(artifactUrl(CID_V0)), {}, ctx);

    expect(res.status).toBe(502);
    expect(await jsonOf(res)).toEqual({ error: "artifact unavailable" });
    expect(cache.put).not.toHaveBeenCalled();
  });

  it("retries the gateway relay before giving up", async () => {
    let attempts = 0;
    const fetchMock = vi.fn((url: string) => {
      attempts += 1;
      // First two rounds (5 gateways each) fail, simulating a cold Pinata
      // plus rate-limited public gateways; the third round recovers.
      return attempts <= GATEWAYS.length * 2
        ? Promise.resolve(new Response(null, { status: 404 }))
        : url.startsWith("https://gateway.pinata.cloud/")
          ? Promise.resolve(new Response(okBody("recovered"), { status: 200 }))
          : Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await worker.fetch(new Request(artifactUrl(CID_V0)), {}, ctx);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("recovered");
    // 3 retry rounds × 5 gateways, all fired in parallel per round.
    expect(fetchMock).toHaveBeenCalledTimes(GATEWAYS.length * 3);
    expect(ctx.waitUntil).toHaveBeenCalledTimes(1);
    expect(cache.put).toHaveBeenCalledTimes(1);
  });

  it("HEAD returns headers without a body and still caches the GET payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(okBody("head-body"), { status: 200 })),
    );

    const res = await worker.fetch(
      new Request(artifactUrl(CID_V0), { method: "HEAD" }),
      {},
      ctx,
    );

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("");
    expect(res.headers.get("Content-Type")).toBe("application/octet-stream");
    expect(ctx.waitUntil).toHaveBeenCalled();
    expect(cache.put).toHaveBeenCalledTimes(1);
    const stored = cache.put.mock.calls[0]?.[1] as Response | undefined;
    expect(stored).toBeDefined();
    expect(await stored?.text()).toBe("head-body");
  });

  it("HEAD on a cache hit strips the body", async () => {
    cache.match.mockResolvedValue(
      new Response("cached-bytes", {
        status: 200,
        headers: { "Content-Type": "application/octet-stream" },
      }),
    );

    const res = await worker.fetch(
      new Request(artifactUrl(CID_V0), { method: "HEAD" }),
      {},
      ctx,
    );

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
