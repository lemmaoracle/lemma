/**
 * POST /prover/prove           — synchronous proof generation (default).
 *                               Returns 200 + { proof, inputs } when done.
 *                               Pass `body.mode === "async"` to enqueue and
 *                               receive 202 + { jobId } immediately.
 * GET  /prover/prove/:jobId    — poll an async job's status.
 *
 * Background: `prover.prove()` for circuits like mizudako-contribution-v1
 * takes ~30-40s, which exceeds Cloudflare Workers' fetch wall-time budget
 * (~30s). The async path enqueues the work and answers with 202 so the
 * caller can poll in short fetch slices; the synchronous path remains the
 * default for backwards compatibility with existing callers (x402, etc).
 *
 * Job store is in-process memory. The Relay is deployed as a single
 * Northflank service; if horizontal scaling is introduced later, swap this
 * for an external store (Redis/KV) without changing the HTTP surface.
 */

import * as R from "ramda";
import { randomUUID } from "node:crypto";
import { create, prover } from "@lemmaoracle/sdk";
import type { RequestHandler, HttpResponse } from "../../types/http.js";
import type { ProveOutput } from "@lemmaoracle/sdk";

/** Request body mirrors the arguments of `prover.prove`. */
type RequestBody = Readonly<{
  /** Lemma API base URL (used to construct the SDK client). */
  apiBase: string;
  /** Lemma API key (optional). */
  apiKey?: string;
  /** `prover.prove` input. */
  input: Readonly<{
    circuitId: string;
    witness: Readonly<Record<string, unknown>>;
  }>;
  /** Execution mode: "sync" (default) blocks until done, "async" enqueues. */
  mode?: "sync" | "async";
}>;

/** Type guard: validate that the request body conforms to RequestBody. */
const isValidRequestBody = (body: unknown): body is RequestBody =>
  R.allPass([
    (b: Record<string, unknown>) => typeof b["apiBase"] === "string",
    (b: Record<string, unknown>) =>
      typeof b["input"] === "object" && b["input"] !== null,
    (b: Record<string, unknown>) =>
      typeof (b["input"] as Record<string, unknown>)["circuitId"] === "string",
    (b: Record<string, unknown>) =>
      typeof (b["input"] as Record<string, unknown>)["witness"] === "object" &&
      (b["input"] as Record<string, unknown>)["witness"] !== null,
  ])(body as Record<string, unknown>);

/* ------------------------------------------------------------------ */
/*  Job store                                                          */
/* ------------------------------------------------------------------ */

type JobStatus = "pending" | "done" | "error";

type Job = Readonly<{
  id: string;
  status: JobStatus;
  result?: ProveOutput;
  error?: string;
  createdAt: number;
}>;

/** Job TTL in milliseconds (1 hour). */
const JOB_TTL_MS = 60 * 60 * 1000;

/**
 * In-memory job store. Mutation is confined to this module and is
 * intentional: jobs are append-only records whose lifecycle is driven by
 * background promises. The eslint functional immutability rule is disabled
 * for the minimal mutations that drive the store.
 */
const jobs: Map<string, Job> = new Map();

/** Insert a fresh job. */
const insertJob = (id: string): void => {
  // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
  jobs.set(id, { id, status: "pending", createdAt: Date.now() });
};

/** Replace a job by id with an evolved record. */
const updateJob = (id: string, evolve: (j: Job) => Job): void => {
  const current = jobs.get(id);
  // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data, functional/no-conditional-statements
  if (current) jobs.set(id, evolve(current));
};

/** Garbage-collect jobs older than the TTL. Called on each GET/POST. */
const gcJobs = (now: number): void => {
  const cutoff = now - JOB_TTL_MS;
  
  jobs.forEach((job, id) => {
    // imperative: in-memory Map cache mutation — no functional alternative
    // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data, functional/no-conditional-statements
    if (job.createdAt < cutoff) jobs.delete(id);
  });
};

/** Run the proof in the background, updating the job on completion. */
const runProofInBackground = (body: RequestBody, jobId: string): void => {
  const _proof = prover
    .prove(create({ apiBase: body.apiBase, apiKey: body.apiKey }), body.input)
    .then((result: ProveOutput) =>
      { updateJob(jobId, (j) => ({ ...j, status: "done", result })); },
    )
    .catch((err: unknown) =>
      { updateJob(jobId, (j) => ({
        ...j,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      })); },
    );
};

/* ------------------------------------------------------------------ */
/*  Responses                                                          */
/* ------------------------------------------------------------------ */

/** 400 response for malformed request bodies. */
const invalidRequestResponse: HttpResponse = {
  status: 400,
  body: {
    error: "Bad request",
    expected: {
      apiBase: "string",
      apiKey: "string (optional)",
      input: { circuitId: "string", witness: "Record<string, unknown>" },
      mode: '"sync" (default) | "async"',
    },
  },
} as const;

/** 405 response for non-allowed methods. */
const methodNotAllowedResponse: HttpResponse = {
  status: 405,
  headers: { Allow: "POST, GET" },
  body: { error: "Method not allowed" },
} as const;

/** 404 response for unknown job ids. */
const jobNotFoundResponse: HttpResponse = {
  status: 404,
  body: { error: "Job not found" },
} as const;

/** Build a 502 response for synchronous proof generation failures. */
const proofGenerationErrorResponse = (message: string): HttpResponse => ({
  status: 502,
  body: { error: "Proof generation failed", message },
});

/** Build a 202 response carrying the job id. */
const acceptedResponse = (jobId: string): HttpResponse => ({
  status: 202,
  body: { jobId, status: "pending" as const },
});

/** Build a status response for a known job. */
const jobStatusResponse = (job: Job): HttpResponse => ({
  status: 200,
  body:
    job.status === "done"
      ? { jobId: job.id, status: job.status, ...job.result }
      : job.status === "error"
        ? { jobId: job.id, status: job.status, error: job.error }
        : { jobId: job.id, status: job.status },
});

/* ------------------------------------------------------------------ */
/*  Handlers                                                           */
/* ------------------------------------------------------------------ */

/** Synchronous proof generation (default). */
const generateSync = (body: RequestBody): Promise<HttpResponse> =>
  prover
    .prove(create({ apiBase: body.apiBase, apiKey: body.apiKey }), body.input)
    .then((result: ProveOutput): HttpResponse => ({ status: 200, body: result }))
    .catch(
      (err: unknown): HttpResponse =>
        proofGenerationErrorResponse(
          err instanceof Error ? err.message : String(err),
        ),
    );

/** Enqueue a proof job and return 202 immediately. */
const enqueueAsync = (body: RequestBody): HttpResponse => {
  const jobId = randomUUID();
  insertJob(jobId);
  runProofInBackground(body, jobId);
  return acceptedResponse(jobId);
};

/** Lookup a job by id and return its status (or 404). */
const lookupJob = (
  params: Readonly<Record<string, string>> | undefined,
): HttpResponse =>
  typeof params?.["jobId"] === "string"
    ? R.pipe(
        (jobId: string) => jobs.get(jobId),
        (job: Job | undefined) =>
          job ? jobStatusResponse(job) : jobNotFoundResponse,
      )(params["jobId"])
    : jobNotFoundResponse;

/** Main request handler. */
export const proveHandler: RequestHandler = (request) => {
   
  gcJobs(Date.now());
  return R.cond([
    [
      (req: typeof request) => req.method === "POST",
      (req: typeof request) =>
        R.ifElse(
          (body: unknown) => !isValidRequestBody(body),
          R.always(invalidRequestResponse),
          (body: unknown) =>
            (body as RequestBody).mode === "async"
              ? enqueueAsync(body as RequestBody)
              : generateSync(body as RequestBody),
        )(req.body),
    ],
    [
      (req: typeof request) => req.method === "GET",
      (req: typeof request) => lookupJob(req.params),
    ],
    [R.T, R.always(methodNotAllowedResponse)],
  ])(request);
};
