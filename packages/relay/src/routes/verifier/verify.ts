/**
 * POST /verifier/verify
 *
 * Relay for `@lemmaoracle/sdk` → `verifier.verify()`.
 *
 * This function requires `snarkjs` / `ffjavascript` which use
 * `URL.createObjectURL()` internally.  That API is unavailable on
 * Cloudflare Workers (and other edge runtimes), so this endpoint
 * runs on a Node.js server instead.
 *
 * Unlike `prover/prove` and `prepare`, verification is purely
 * algorithmic — it does not need a Lemma API client, so the request
 * body is just a `VerifyInput` with no `apiBase` / `apiKey`.
 *
 * Stateless — no env vars, no DB, no logger.
 */

import * as R from "ramda";
import { verifier } from "@lemmaoracle/sdk";
import type { RequestHandler, HttpResponse } from "../../types/http.js";
import type { VerifyOutput, VerifyInput } from "@lemmaoracle/sdk";

/** Request body mirrors the arguments of `verifier.verify`. */
type RequestBody = Readonly<{
  /** `verifier.verify` input. */
  input: VerifyInput;
}>;

/** Type guard: validate that the request body is a VerifyInput. */
const isValidVerifyInput = (body: unknown): body is VerifyInput =>
  typeof body === "object" &&
  body !== null &&
  R.allPass([
    (b: Record<string, unknown>) => typeof b["alg"] === "string",
    (b: Record<string, unknown>) =>
      typeof b["inputs"] === "object" && b["inputs"] !== null,
  ])(body as Record<string, unknown>);

/** Type guard: validate that the request body conforms to RequestBody. */
const isValidRequestBody = (body: unknown): body is RequestBody =>
  typeof body === "object" &&
  body !== null &&
  R.allPass([
    (b: Record<string, unknown>) =>
      typeof b["input"] === "object" && b["input"] !== null,
    (b: Record<string, unknown>) =>
      isValidVerifyInput(b["input"]),
  ])(body as Record<string, unknown>);

/** 400 response for malformed request bodies. */
const invalidRequestResponse: HttpResponse = {
  status: 400,
  body: {
    error: "Bad request",
    expected: {
      input: {
        alg: "ProofAlgId",
        inputs: "Record<string, unknown>",
      },
    },
  },
} as const;

/** 405 response for non-POST requests. */
const methodNotAllowedResponse: HttpResponse = {
  status: 405,
  headers: { Allow: "POST" },
  body: { error: "Method not allowed" },
} as const;

/** Build a 502 response for verification failures. */
const verificationErrorResponse = (message: string): HttpResponse => ({
  status: 502,
  body: {
    error: "Verification failed",
    message,
  },
});

/** Verify a proof and return the appropriate HTTP response. */
const verifyProof = (body: VerifyInput): Promise<HttpResponse> =>
  verifier
    .verify(body)
    .then((result: VerifyOutput): HttpResponse => ({ status: 200, body: result }))
    .catch(
      (err: unknown): HttpResponse =>
        verificationErrorResponse(
          err instanceof Error ? err.message : String(err),
        ),
    );

/** Main request handler. */
export const verifyHandler: RequestHandler = (request) =>
  R.ifElse(
    (req: typeof request) => req.method !== "POST",
    R.always(methodNotAllowedResponse),
    (req: typeof request) =>
      R.ifElse(
        (body: unknown) => !isValidRequestBody(body),
        R.always(invalidRequestResponse),
        (body: unknown) => verifyProof((body as RequestBody).input),
      )(req.body),
  )(request);
