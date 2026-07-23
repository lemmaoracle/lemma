/**
 * Cloudflare Workers entry point for @lemmaoracle/fetcher.
 *
 * Exposes the fetch-and-commit pipeline as an HTTP API:
 *   GET  /fetch?url=<url>       — fetch single source
 *   POST /fetch                 — body: { "url": "...", "maxDepth": 16 }
 *   GET  /health                — health check
 *
 * Authentication: X-API-Key header (compared to FETCHER_API_KEY secret).
 *
 * Scheduled triggers: configured sources in SCHEDULED_SOURCES (JSON array).
 * Each scheduled run fetches all sources and logs commitments.
 */
import { fetchAndCommit } from "./fetch.js";

// ── env types ────────────────────────────────────────────────────────────

type Env = Readonly<{
  FETCHER_API_KEY?: string;
}>;

// ── helpers ──────────────────────────────────────────────────────────────

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    },
  });

const checkAuth = (request: Request, env: Env): boolean => {
  const key = env.FETCHER_API_KEY;
  return key === undefined || key === ""
    ? true // no key configured = open (dev mode)
    : request.headers.get("X-API-Key") === key;
};

type FetchParams = Readonly<{ url: string; maxDepth: number | undefined }>;

const paramsFromGet = (request: Request): FetchParams => {
  const u = new URL(request.url);
  const d = u.searchParams.get("maxDepth");
  return {
    url: u.searchParams.get("url") ?? "",
    maxDepth: d !== null ? Number(d) : 16,
  };
};

const paramsFromPost = async (request: Request): Promise<FetchParams> => {
  const body = (await request.json()) as { url?: string; maxDepth?: number };
  return {
    url: body.url ?? "",
    maxDepth: body.maxDepth ?? 16,
  };
};

// ── routes ───────────────────────────────────────────────────────────────

const handleHealth = (_?: undefined): Response =>
  json({ ok: true, service: "fetcher" });

const handleFetch = async (request: Request, _env: Env): Promise<Response> => {
  const params =
    request.method === "GET"
      ? paramsFromGet(request)
      : await paramsFromPost(request);

  return params.url === ""
    ? json({ error: "Missing 'url' parameter" }, 400)
    : fetchAndCommit(params.url, { maxDepth: params.maxDepth }).then((result) =>
        json(result),
      );
};

const routeRequest = (request: Request, env: Env): Promise<Response> | Response => {
  const url = new URL(request.url);
  return request.method === "OPTIONS"
    ? new Response(null, { status: 204 })
    : url.pathname === "/health"
      ? handleHealth()
      : !checkAuth(request, env)
        ? json({ error: "Unauthorized" }, 401)
        : url.pathname === "/fetch"
          ? handleFetch(request, env)
          : json({ error: "Not found", path: url.pathname }, 404);
};

// ── worker ───────────────────────────────────────────────────────────────

export default {
  fetch: (request: Request, env: Env): Promise<Response> | Response =>
    routeRequest(request, env),
};
