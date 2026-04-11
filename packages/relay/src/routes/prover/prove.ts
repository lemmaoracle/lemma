/**
 * POST /prover/prove
 *
 * Relay for `@lemmaoracle/sdk` → `prover.prove()`.
 *
 * This function requires `snarkjs` / `ffjavascript` which use
 * `URL.createObjectURL()` internally.  That API is unavailable on
 * Cloudflare Workers (and other edge runtimes), so this endpoint
 * runs on a Node.js server instead.
 *
 * Stateless — no env vars, no DB, no logger.
 * All parameters are supplied in the request body.
 */

import * as R from "ramda";
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

/** 400 response for malformed request bodies. */
const invalidRequestResponse: HttpResponse = {
  status: 400,
  body: {
    error: "Bad request",
    expected: {
      apiBase: "string",
      apiKey: "string (optional)",
      input: { circuitId: "string", witness: "Record<string, unknown>" },
    },
  },
} as const;

/** 405 response for non-POST requests. */
const methodNotAllowedResponse: HttpResponse = {
  status: 405,
  headers: { Allow: "POST" },
  body: { error: "Method not allowed" },
} as const;

/** Build a 502 response for proof generation failures. */
const proofGenerationErrorResponse = (message: string): HttpResponse => ({
  status: 502,
  body: {
    error: "Proof generation failed",
    message,
  },
});

/** Generate a proof and return the appropriate HTTP response. */
const generateProof = (body: RequestBody): Promise<HttpResponse> =>
  prover
    .prove(create({ apiBase: body.apiBase, apiKey: body.apiKey }), body.input)
    .then((result: ProveOutput): HttpResponse => ({ status: 200, body: result }))
    .catch(
      (err: unknown): HttpResponse =>
        proofGenerationErrorResponse(
          err instanceof Error ? err.message : String(err),
        ),
    );

/** Main request handler. */
export const proveHandler: RequestHandler = (request) =>
  R.ifElse(
    (req: typeof request) => req.method !== "POST",
    R.always(methodNotAllowedResponse),
    (req: typeof request) =>
      R.ifElse(
        (body: unknown) => !isValidRequestBody(body),
        R.always(invalidRequestResponse),
        (body: unknown) => generateProof(body as RequestBody),
      )(req.body),
  )(request);
