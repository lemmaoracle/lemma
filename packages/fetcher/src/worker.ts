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
import { fetchAndCommit, type FetchResult } from "./fetch.js";

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
  if (!key) return true; // no key configured = open (dev mode)
  return request.headers.get("X-API-Key") === key;
};

// ── routes ───────────────────────────────────────────────────────────────

const handleHealth = (): Response =>
  json({ ok: true, service: "fetcher" });

const handleFetch = async (request: Request, env: Env): Promise<Response> => {
  let url: string;
  let maxDepth: number | undefined;

  if (request.method === "GET") {
    const u = new URL(request.url);
    url = u.searchParams.get("url") ?? "";
    const d = u.searchParams.get("maxDepth");
    maxDepth = d !== null ? Number(d) : 16;
  } else {
    const body = (await request.json()) as { url?: string; maxDepth?: number };
    url = body.url ?? "";
    maxDepth = body.maxDepth ?? 16;
  }

  if (!url) {
    return json({ error: "Missing 'url' parameter" }, 400);
  }

  const result = await fetchAndCommit(url, { maxDepth });
  return json(result);
};

// ── worker ───────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    const url = new URL(request.url);

    // Health is always open
    if (url.pathname === "/health") {
      return handleHealth();
    }

    // Auth check for all other routes
    if (!checkAuth(request, env)) {
      return json({ error: "Unauthorized" }, 401);
    }

    if (url.pathname === "/fetch") {
      return handleFetch(request, env);
    }

    return json({ error: "Not found", path: url.pathname }, 404);
  },
};

// ── env types ────────────────────────────────────────────────────────────

interface Env {
  FETCHER_API_KEY?: string;
}
