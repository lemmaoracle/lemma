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
import type { RequestHandler } from "../../types/http.js";
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

/** Validate request body. */
const validateRequestBody = (body: unknown): body is RequestBody => {
  const b = body as RequestBody;
  return R.allPass([
    R.pipe(R.prop("apiBase"), R.is(String)),
    R.pipe(R.prop("input"), R.is(Object)),
    R.pipe(R.path(["input", "circuitId"]), R.is(String)),
    R.pipe(R.path(["input", "witness"]), R.is(Object)),
  ])(b as Record<string, unknown>);
};

/** Generate error response for invalid request. */
const invalidRequestError = {
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

/** Generate error response for proof generation failure. */
const proofGenerationError = (message: string) => ({
  status: 502,
  body: {
    error: "Proof generation failed",
    message,
  },
} as const);

/** Handle proof generation with error handling. */
const handleProofGeneration = (body: RequestBody): Promise<Readonly<{
  status: number;
  body: unknown;
}>> => {
  const client = create({ apiBase: body.apiBase, apiKey: body.apiKey });

  return prover.prove(client, body.input)
    .then((result: ProveOutput) => ({ status: 200, body: result }))
    .catch((err: unknown) =>
      proofGenerationError(err instanceof Error ? err.message : String(err))
    );
};

/** Check HTTP method. */
const checkMethod = (method: string) =>
  R.ifElse(
    R.equals("POST"),
    R.always(null),
    R.always({
      status: 405,
      headers: { Allow: "POST" } as const,
      body: { error: "Method not allowed" },
    })
  )(method);

/** Validate request and generate proof. */
const validateAndGenerateProof = (body: unknown) =>
  R.ifElse(
    validateRequestBody,
    handleProofGeneration,
    R.always(invalidRequestError)
  )(body);

/** Main request handler. */
export const proveHandler: RequestHandler = async (request) => {
  const methodCheck = checkMethod(request.method);

  return methodCheck !== null
    ? methodCheck
    : validateAndGenerateProof(request.body);
};