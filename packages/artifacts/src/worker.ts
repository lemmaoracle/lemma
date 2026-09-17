/**
 * Cloudflare Worker: Lemma IPFS CDN.
 *
 *   GET|HEAD /ipfs/{CID}  — colo cache → R2 → gateway relay
 *
 * Address: artifacts.lemma.workers.dev
 *
 * Resolution order:
 *   1. colo cache (caches.default) — per-data-center read acceleration
 *   2. R2 (ARTIFACTS bucket)       — durable, cross-colo source of truth
 *   3. gateway relay               — lazy fill; writes back to R2 + colo cache
 *
 * CIDs are immutable, so R2 is the source of truth and the colo cache is pure
 * read acceleration. On a durable miss, all gateways are fetched in parallel
 * (Promise.any) with retry so a single cold/429 gateway cannot stall the
 * client. No arbitrary-URL proxy: {CID} must be a plausible IPFS CID.
 */
import { isIpfsCid } from "./cid.js";

const IPFS_GATEWAYS: ReadonlyArray<string> = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
  "https://trustless-gateway.link/ipfs/",
  "https://w3s.link/ipfs/",
];

const CORS: Readonly<Record<string, string>> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CID_PATH = /^\/ipfs\/([^/]+)$/;

type Env = Readonly<{ ARTIFACTS?: R2Bucket }>;

const jsonError = (error: string, status: number): Response =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS,
    },
  });

const corsPreflight = (_?: undefined): Response =>
  new Response(null, {
    status: 204,
    headers: {
      ...CORS,
      "Access-Control-Max-Age": "86400",
    },
  });

const toArtifactResponse = (body: ArrayBuffer): Response =>
  new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(body.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      ...CORS,
    },
  });

const toObjectResponse = (obj: R2ObjectBody): Response =>
  new Response(obj.body, {
    status: 200,
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "Content-Length": String(obj.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      ...CORS,
    },
  });

const headOf = (response: Response): Response =>
  new Response(null, { status: response.status, headers: response.headers });

const adaptMethod = (method: string, response: Response): Response =>
  method === "HEAD" ? headOf(response) : response;

const retryTimes = <T>(times: number, fn: () => Promise<T>): Promise<T> =>
  times <= 1 ? fn() : fn().catch((_err: unknown) => retryTimes(times - 1, fn));

const fetchFromGateways = (cid: string): Promise<ArrayBuffer> =>
  retryTimes(3, (_?: undefined) =>
    Promise.any(
      IPFS_GATEWAYS.map((gateway) =>
        fetch(`${gateway}${cid}`).then((res) =>
          res.ok
            ? res.arrayBuffer()
            : Promise.reject(new Error(`gateway-fail ${gateway}`)),
        ),
      ),
    ),
  );

const readR2 = (env: Env, cid: string): Promise<R2ObjectBody | null> =>
  env.ARTIFACTS === undefined ? Promise.resolve(null) : env.ARTIFACTS.get(cid);

const writeR2 = (env: Env, cid: string, body: ArrayBuffer): Promise<unknown> =>
  env.ARTIFACTS === undefined
    ? Promise.resolve(undefined)
    : env.ARTIFACTS.put(cid, body, {
        httpMetadata: { contentType: "application/octet-stream" },
      });

const cacheAndReturn = (
  cache: Cache,
  cacheKey: Request,
  response: Response,
  method: string,
  ctx: ExecutionContext,
): Response => {
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return adaptMethod(method, response);
};

const onMiss = (
  cache: Cache,
  cacheKey: Request,
  env: Env,
  cid: string,
  method: string,
  ctx: ExecutionContext,
): Promise<Response> =>
  fetchFromGateways(cid)
    .then((body) =>
      writeR2(env, cid, body).then((_res: unknown) =>
        cacheAndReturn(cache, cacheKey, toArtifactResponse(body), method, ctx),
      ),
    )
    .catch((_err: unknown) => jsonError("artifact unavailable", 502));

const serveCid = (
  request: Request,
  cid: string,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> => {
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: "GET" });
  return cache.match(cacheKey).then((cached) =>
    cached !== undefined
      ? adaptMethod(request.method, cached)
      : readR2(env, cid).then((obj) =>
          obj !== null
            ? adaptMethod(request.method, toObjectResponse(obj))
            : onMiss(cache, cacheKey, env, cid, request.method, ctx),
        ),
  );
};

const cidFromPath = (pathname: string): string | undefined =>
  CID_PATH.exec(pathname)?.[1];

const handleIpfs = (
  request: Request,
  cid: string,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> | Response =>
  isIpfsCid(cid)
    ? serveCid(request, cid, env, ctx)
    : jsonError("not an IPFS CID", 400);

const handleRequest = (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> | Response => {
  const url = new URL(request.url);
  const cid = cidFromPath(url.pathname);
  return request.method === "OPTIONS"
    ? corsPreflight()
    : cid === undefined
      ? jsonError("not found", 404)
      : request.method !== "GET" && request.method !== "HEAD"
        ? jsonError("method not allowed", 405)
        : handleIpfs(request, cid, env, ctx);
};

export default {
  fetch: (
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> | Response => handleRequest(request, env, ctx),
};