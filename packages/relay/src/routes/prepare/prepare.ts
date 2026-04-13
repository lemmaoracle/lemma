/**
 * POST /prepare
 *
 * Relay for `@lemmaoracle/sdk` → `prepare()` with automatic schema definition.
 *
 * This endpoint handles the full workflow:
 * 1. Fetch schema metadata via `schemas.getById`
 * 2. Define schema via `define(schemaMeta)`
 * 3. Prepare data via `prepare(...)`
 *
 * This function may require WASM execution and Node.js-specific APIs
 * (crypto.randomBytes, crypto.createHash) which are unavailable or
 * limited on Cloudflare Workers and other edge runtimes.
 *
 * Stateless — no env vars, no DB, no logger.
 * All parameters are supplied in the request body.
 */

import * as R from "ramda";
import { create, schemas, define, prepare } from "@lemmaoracle/sdk";
import type { RequestHandler, HttpResponse } from "../../types/http.js";
import type { PrepareOutput, SchemaDef } from "@lemmaoracle/sdk";

/** Request body for the prepare workflow. */
type RequestBody = Readonly<{
  /** Lemma API base URL (used to construct the SDK client). */
  apiBase: string;
  /** Lemma API key (optional). */
  apiKey?: string;
  /** Actual prepare arguments. */
  input: Readonly<{
    /** Schema ID to fetch and define. */
    schemaId: string;
    /** Payload to normalize and prepare. */
    payload: unknown;
  }>;
}>;

/** Type guard: validate that the request body conforms to RequestBody. */
const isValidRequestBody = (body: unknown): body is RequestBody =>
  R.allPass([
    (b: Record<string, unknown>) => typeof b["apiBase"] === "string",
    (b: Record<string, unknown>) =>
      typeof b["input"] === "object" && b["input"] !== null,
    (b: Record<string, unknown>) =>
      typeof (b["input"] as Record<string, unknown>)["schemaId"] === "string",
    (b: Record<string, unknown>) =>
      (b["input"] as Record<string, unknown>)["payload"] !== undefined,
  ])(body as Record<string, unknown>);

/** 400 response for malformed request bodies. */
const invalidRequestResponse: HttpResponse = {
  status: 400,
  body: {
    error: "Bad request",
    expected: {
      apiBase: "string",
      apiKey: "string (optional)",
      input: { schemaId: "string", payload: "unknown" },
    },
  },
} as const;

/** 405 response for non-POST requests. */
const methodNotAllowedResponse: HttpResponse = {
  status: 405,
  headers: { Allow: "POST" },
  body: { error: "Method not allowed" },
} as const;

/** Build a 502 response for preparation failures. */
const preparationErrorResponse = (message: string): HttpResponse => ({
  status: 502,
  body: {
    error: "Preparation failed",
    message,
  },
});

/**
 * Full prepare workflow:
 * 1. Fetch schema metadata
 * 2. Define schema
 * 3. Prepare data
 */
const prepareWorkflow = (body: RequestBody): Promise<HttpResponse> => {
  const client = create({ apiBase: body.apiBase, apiKey: body.apiKey });

  return schemas
    .getById(client, body.input.schemaId)
    .then(define)
    .then((schema: SchemaDef<unknown, unknown>) =>
      prepare(client, {
        schema: schema.id,
        payload: body.input.payload,
      }),
    )
    .then((result: PrepareOutput<unknown>): HttpResponse => ({
      status: 200,
      body: result,
    }))
    .catch(
      (err: unknown): HttpResponse =>
        preparationErrorResponse(
          err instanceof Error ? err.message : String(err),
        ),
    );
};

/** Main request handler. */
export const prepareHandler: RequestHandler = (request) =>
  R.ifElse(
    (req: typeof request) => req.method !== "POST",
    R.always(methodNotAllowedResponse),
    (req: typeof request) =>
      R.ifElse(
        (body: unknown) => !isValidRequestBody(body),
        R.always(invalidRequestResponse),
        (body: unknown) => prepareWorkflow(body as RequestBody),
      )(req.body),
  )(request);