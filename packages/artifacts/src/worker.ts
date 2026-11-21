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
 * (Promise.any) so a single cold/429 gateway cannot stall the client. When
 * every gateway fails, the request still returns 502 immediately and a bounded
 * retry is queued: the consumer keeps trying with exponential backoff and
 * writes recovered bytes to R2, so later reads are fast. No arbitrary-URL
 * proxy: {CID} must be a plausible IPFS CID.
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

/**
 * Per-gateway deadline. Promise.any already ignores slower gateways when one
 * succeeds; the deadline only bounds the all-gateways-down case so the caller
 * gets a 502 in seconds rather than waiting on a stalled relay forever.
 */
const GATEWAY_TIMEOUT_MS = 20_000;

/** One queue attempt is one parallel gateway round. */
export type ArtifactRetryMessage = Readonly<{ cid: string; attempt: number }>;

/**
 * Bounded background recovery. The initial request still does three relay
 * rounds; after that the queue takes over with progressively longer gaps.
 * The total recovery window is ~3.4h, long enough for a gateway incident but
 * still finite.
 */
const MAX_RETRY_ATTEMPTS = 6;

const RETRY_DELAY_SECONDS: Readonly<Record<number, number>> = {
  1: 30,
  2: 120,
  3: 600,
  4: 1800,
  5: 3600,
  6: 7200,
};

const RETRY_DELAY_FALLBACK_SECONDS = 7200;

const retryDelaySeconds = (attempt: number): number =>
  RETRY_DELAY_SECONDS[attempt] ?? RETRY_DELAY_FALLBACK_SECONDS;

type Env = Readonly<{
  ARTIFACTS?: R2Bucket;
  ARTIFACT_RETRY_QUEUE?: Queue<ArtifactRetryMessage>;
}>;

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

const fetchGateway = (gateway: string, cid: string): Promise<ArrayBuffer> =>
  fetch(`${gateway}${cid}`, { signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS) }).then((res) =>
    res.ok ? res.arrayBuffer() : Promise.reject(new Error(`gateway-fail ${gateway}`)),
  );

const fetchGatewayRound = (cid: string): Promise<ArrayBuffer> =>
  Promise.any(IPFS_GATEWAYS.map((gateway) => fetchGateway(gateway, cid)));

const fetchFromGateways = (cid: string): Promise<ArrayBuffer> =>
  retryTimes(3, (_?: undefined) => fetchGatewayRound(cid));

const readR2 = (env: Env, cid: string): Promise<R2ObjectBody | null> =>
  env.ARTIFACTS === undefined ? Promise.resolve(null) : env.ARTIFACTS.get(cid);

const writeR2 = (env: Env, cid: string, body: ArrayBuffer): Promise<unknown> =>
  env.ARTIFACTS === undefined
    ? Promise.resolve(undefined)
    : env.ARTIFACTS.put(cid, body, {
        httpMetadata: { contentType: "application/octet-stream" },
      });

/**
 * Structured log line so retries can be followed in `wrangler tail` /
 * Workers Logs (`event: artifact_retry_*`).
 */
const logRetry = (event: string, fields: Readonly<Record<string, unknown>>): void => {
  console.log(JSON.stringify({ event, ...fields }));
};

const enqueueRetry = (env: Env, cid: string, attempt: number): Promise<unknown> =>
  env.ARTIFACT_RETRY_QUEUE === undefined
    ? Promise.resolve(undefined)
    : env.ARTIFACT_RETRY_QUEUE.send({ cid, attempt }, { delaySeconds: retryDelaySeconds(attempt) });

const scheduleRetry = (env: Env, cid: string, attempt: number, ctx: ExecutionContext): void => {
  ctx.waitUntil(
    enqueueRetry(env, cid, attempt)
      .then((_: unknown) => {
        logRetry("artifact_retry_scheduled", {
          cid,
          attempt,
          delay_seconds: retryDelaySeconds(attempt),
        });
      })
      .catch((err: unknown) => {
        logRetry("artifact_retry_enqueue_failed", {
          cid,
          attempt,
          error: String(err),
        });
      }),
  );
};

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
    .catch((_err: unknown) => {
      // Failure is returned as-is; recovery continues in the background.
      scheduleRetry(env, cid, 1, ctx);
      return jsonError("artifact unavailable", 502);
    });

const serveCid = (
  request: Request,
  cid: string,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> => {
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: "GET" });
  return cache
    .match(cacheKey)
    .then((cached) =>
      cached !== undefined
        ? adaptMethod(request.method, cached)
        : readR2(env, cid).then((obj) =>
            obj !== null
              ? adaptMethod(request.method, toObjectResponse(obj))
              : onMiss(cache, cacheKey, env, cid, request.method, ctx),
          ),
    );
};

const cidFromPath = (pathname: string): string | undefined => CID_PATH.exec(pathname)?.[1];

const handleIpfs = (
  request: Request,
  cid: string,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> | Response =>
  isIpfsCid(cid) ? serveCid(request, cid, env, ctx) : jsonError("not an IPFS CID", 400);

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

const isValidRetryMessage = (msg: unknown): msg is ArtifactRetryMessage =>
  typeof msg === "object" &&
  msg !== null &&
  typeof (msg as Record<string, unknown>).cid === "string" &&
  typeof (msg as Record<string, unknown>).attempt === "number";

const mirrorArtifact = (env: Env, cid: string): Promise<unknown> =>
  fetchGatewayRound(cid).then((body) => writeR2(env, cid, body));

const reprocessOrStop = (
  message: Message<ArtifactRetryMessage>,
  env: Env,
  nextAttempt: number,
  reason: string,
): Promise<void> =>
  nextAttempt > MAX_RETRY_ATTEMPTS
    ? Promise.resolve().then((_: unknown) => {
        logRetry("artifact_retry_exhausted", {
          cid: message.body.cid,
          attempt: message.body.attempt,
          error: reason,
        });
        message.ack();
      })
    : enqueueRetry(env, message.body.cid, nextAttempt)
        .then((_: unknown) => {
          logRetry("artifact_retry_rescheduled", {
            cid: message.body.cid,
            attempt: nextAttempt,
            delay_seconds: retryDelaySeconds(nextAttempt),
            error: reason,
          });
          message.ack();
        })
        .catch((err: unknown) => {
          logRetry("artifact_retry_enqueue_failed", {
            cid: message.body.cid,
            attempt: nextAttempt,
            error: String(err),
          });
          // Let the queue redeliver this message if the next hop could not be
          // scheduled (Queue retries are the last-resort safety net).
          message.retry();
        });

const processRetryMessage = (message: Message<ArtifactRetryMessage>, env: Env): Promise<void> =>
  !isValidRetryMessage(message.body)
    ? Promise.resolve().then((_: unknown) => {
        logRetry("artifact_retry_invalid_message", {
          body: JSON.stringify(message.body),
        });
        message.ack();
      })
    : readR2(env, message.body.cid)
        .then((existing) =>
          existing !== null
            ? Promise.resolve().then((_: unknown) => {
                logRetry("artifact_retry_already_mirrored", {
                  cid: message.body.cid,
                  attempt: message.body.attempt,
                });
                message.ack();
              })
            : mirrorArtifact(env, message.body.cid)
                .then((_: unknown) => {
                  logRetry("artifact_retry_recovered", {
                    cid: message.body.cid,
                    attempt: message.body.attempt,
                  });
                  message.ack();
                })
                .catch((err: unknown) =>
                  reprocessOrStop(message, env, message.body.attempt + 1, String(err)),
                ),
        )
        .catch((err: unknown) =>
          reprocessOrStop(message, env, message.body.attempt + 1, String(err)),
        );

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> | Response =>
    handleRequest(request, env, ctx),
  queue: async (batch: MessageBatch, env: Env, _ctx: ExecutionContext): Promise<void> => {
    const _processed = await Promise.all(
      batch.messages.map((message) =>
        processRetryMessage(message as Message<ArtifactRetryMessage>, env),
      ),
    );
  },
} satisfies ExportedHandler<Env>;
