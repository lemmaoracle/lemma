/**
 * Cloudflare Worker: Lemma IPFS CDN.
 *
 *   GET|HEAD /ipfs/{CID}  — cache-first relay across public IPFS gateways
 *
 * Address: artifacts.lemma.workers.dev
 *
 * Cache-first because CIDs are immutable. On miss, all gateways are
 * fetched in parallel (Promise.any) so a single cold/429 gateway cannot
 * stall the client. No arbitrary-URL proxy: {CID} must be a plausible
 * IPFS CID.
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

const headOf = (response: Response): Response =>
  new Response(null, { status: response.status, headers: response.headers });

const adaptMethod = (method: string, response: Response): Response =>
  method === "HEAD" ? headOf(response) : response;

const fetchFromGateways = (cid: string): Promise<ArrayBuffer> =>
  Promise.any(
    IPFS_GATEWAYS.map((gateway) =>
      fetch(`${gateway}${cid}`).then((res) =>
        res.ok
          ? res.arrayBuffer()
          : Promise.reject(new Error(`gateway-fail ${gateway}`)),
      ),
    ),
  );

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
  cid: string,
  method: string,
  ctx: ExecutionContext,
): Promise<Response> =>
  fetchFromGateways(cid)
    .then((body) =>
      cacheAndReturn(cache, cacheKey, toArtifactResponse(body), method, ctx),
    )
    .catch((_err: unknown) => jsonError("artifact unavailable", 502));

const serveCid = (
  request: Request,
  cid: string,
  ctx: ExecutionContext,
): Promise<Response> => {
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: "GET" });
  return cache
    .match(cacheKey)
    .then((cached) =>
      cached !== undefined
        ? adaptMethod(request.method, cached)
        : onMiss(cache, cacheKey, cid, request.method, ctx),
    );
};

const cidFromPath = (pathname: string): string | undefined =>
  CID_PATH.exec(pathname)?.[1];

const handleIpfs = (
  request: Request,
  cid: string,
  ctx: ExecutionContext,
): Promise<Response> | Response =>
  isIpfsCid(cid)
    ? serveCid(request, cid, ctx)
    : jsonError("not an IPFS CID", 400);

const handleRequest = (
  request: Request,
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
        : handleIpfs(request, cid, ctx);
};

export default {
  fetch: (
    request: Request,
    _env: unknown,
    ctx: ExecutionContext,
  ): Promise<Response> | Response => handleRequest(request, ctx),
};
