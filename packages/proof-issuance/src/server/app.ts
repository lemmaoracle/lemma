/**
 * Proof Issuance API Server
 *
 * Hono-based server that implements the proof issuance endpoints with
 * x402 payment integration.
 *
 *   POST /v1/proofs/issue   — Issue a proof
 *   GET  /v1/proofs/:id      — Retrieve a proof
 *   GET  /v1/health          — Health check
 *   GET  /v1/discover         — x402 discovery extension endpoint
 *
 * This is Stage A (Sepolia trial) — testnet Bazaar listing.
 */

/* eslint-disable functional/no-let, functional/no-expression-statements */

import { Hono } from "hono";
import type { Context } from "hono";
import { cors } from "hono/cors";
import type { ProofIssueRequest, ProofResponse } from "../lib/types.js";
import { issueProof, isSupportedSchema } from "../lib/proof-engine.js";
import { buildDiscoveryExtension } from "../lib/discovery.js";

/** In-memory proof store */
type ProofStore = Readonly<Record<string, ProofResponse | undefined>>;

/** Mutable box for proof store (FP-compatible wrapper for mutable state) */
interface StoreBox {
  readonly value: ProofStore;
  readonly setValue: (s: ProofStore) => void;
}

/** Create a new store box backed by captured mutable reference */
const createStore = (_dummy?: undefined): StoreBox => {
  let store: ProofStore = {};
  return {
    value: store,
    setValue: (s: ProofStore): void => {
      store = s;
    },
  };
};

/** Coerce request body into ProofIssueRequest with defaults */
const coerceBody = (raw: unknown): ProofIssueRequest => {
  const r = raw as Record<string, unknown>;
  const ma = (r.model_attestation ?? {}) as Record<string, unknown>;
  const ia = (r.input_attestation ?? {}) as Record<string, unknown>;
  const oa = (r.output_attestation ?? {}) as Record<string, unknown>;
  return {
    schema_ref: typeof r.schema_ref === "string" ? r.schema_ref : "",
    model_attestation: {
      model_id: typeof ma.model_id === "string" ? ma.model_id : "",
      model_version: typeof ma.model_version === "string" ? ma.model_version : "",
      model_hash: typeof ma.model_hash === "string" ? ma.model_hash : "",
    },
    input_attestation: {
      input_hash: typeof ia.input_hash === "string" ? ia.input_hash : "",
    },
    output_attestation: {
      output_hash: typeof oa.output_hash === "string" ? oa.output_hash : "",
    },
    decision_context: r.decision_context as ProofIssueRequest["decision_context"] | undefined,
  };
};

/**
 * Validate required fields in the request body.
 */
const hasRequiredFields = (
  body: ProofIssueRequest,
): boolean =>
  body.schema_ref.length > 0 &&
  body.model_attestation.model_id.length > 0 &&
  body.input_attestation.input_hash.length > 0 &&
  body.output_attestation.output_hash.length > 0;

/** Handle POST /v1/proofs/issue */
const handleIssue = (
  c: Context,
  box: StoreBox,
  body: ProofIssueRequest,
): Response => {
  const fieldsOk = hasRequiredFields(body);
  const schemaOk = fieldsOk ? isSupportedSchema(body) : false;

  return !fieldsOk
    ? c.json(
        {
          error: "invalid_request",
          message:
            "Missing required fields: schema_ref, model_attestation, input_attestation, output_attestation",
        },
        400,
      )
    : !schemaOk
      ? c.json(
          {
            error: "unsupported_schema",
            message: `Schema "${body.schema_ref}" is not supported. Supported schemas: financial/transaction-decision, manufacturing/quality-decision, agent/action-decision`,
          },
          400,
        )
      : ((): Response => {
          const proof = issueProof(body);
          const newStore = { ...box.value, [proof.proof_id]: proof };
          box.setValue(newStore);
          return c.json(proof, 201);
        })();
};

/** Handle GET /v1/proofs/:id */
const handleGetProof = (
  c: Context,
  store: ProofStore,
  id: string,
): Response => {
  const proof: ProofResponse | undefined = store[id];
  return proof != null
    ? c.json(proof)
    : c.json(
        { error: "not_found", message: `Proof "${id}" not found` },
        404,
      );
};

/* eslint-disable functional/functional-parameters */
const createApp = (): Hono => {
/* eslint-enable functional/functional-parameters */
  const app = new Hono();
  const box = createStore();

  app.use("*", cors());

  app.get("/v1/health", (c: Context): Response =>
    c.json({
      status: "ok",
      stage: "sepolia-trial",
      timestamp: new Date().toISOString(),
    }),
  );

  app.get("/v1/discover", (c: Context): Response =>
    c.json(buildDiscoveryExtension()),
  );

  app.post("/v1/proofs/issue", async (c: Context): Promise<Response> =>
    handleIssue(c, box, coerceBody(await c.req.json())),
  );

  app.get("/v1/proofs/:id", (c: Context): Response => {
    const id = c.req.param("id") ?? "";
    return handleGetProof(c, box.value, id);
  });

  return app;
};

/** Singleton app instance */
const app = createApp();

export { createApp, app };
export default app;
