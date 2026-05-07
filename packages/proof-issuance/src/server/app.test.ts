/**
 * Tests for app.ts — Hono server endpoints
 *
 * Test files are exempt from functional programming rules.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createApp } from "../server/app.js";
import type { Hono } from "hono";

const FINANCIAL_SCHEMA =
  "https://schemas.lemma.frame00.com/v0/financial/transaction-decision";

const validRequest = {
  schema_ref: FINANCIAL_SCHEMA,
  model_attestation: {
    model_id: "test-model",
    model_version: "1.0.0",
    model_hash: "0xabc",
  },
  input_attestation: { input_hash: "0xdef" },
  output_attestation: { output_hash: "0x123" },
};

describe("Proof Issuance API Server", () => {
  let app: Hono;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /v1/health", () => {
    it("returns ok status with stage info", async () => {
      const res = await app.request("/v1/health");
      expect(res.status).toBe(200);

      const body: Record<string, unknown> = (await res.json()) as Record<string, unknown>;
      expect(body.status).toBe("ok");
      expect(body.stage).toBe("sepolia-trial");
      expect(body.timestamp).toBeDefined();
    });
  });

  describe("GET /v1/discover", () => {
    it("returns discovery extension metadata", async () => {
      const res = await app.request("/v1/discover");
      expect(res.status).toBe(200);

      const body: Record<string, unknown> = (await res.json()) as Record<string, unknown>;
      const metadata = body.metadata as Record<string, unknown>;
      expect(metadata.title).toBe("Lemma Proof Issuance");
      expect(body.output).toBeDefined();
    });
  });

  describe("POST /v1/proofs/issue", () => {
    it("issues a proof for valid request", async () => {
      const res = await app.request("/v1/proofs/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest),
      });

      expect(res.status).toBe(201);

      const body: Record<string, unknown> = (await res.json()) as Record<string, unknown>;
      expect(body.proof_id).toBeDefined();
      expect(body.lemma_version).toBe("v0.1.0");
      expect(body.schema_ref).toBe(FINANCIAL_SCHEMA);
      expect(body.cryptographic_envelope).toBeDefined();
    });

    it("returns 400 for request with missing fields", async () => {
      const res = await app.request("/v1/proofs/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema_ref: FINANCIAL_SCHEMA }),
      });

      expect(res.status).toBe(400);

      const body: Record<string, unknown> = (await res.json()) as Record<string, unknown>;
      expect(body.error).toBe("invalid_request");
    });

    it("returns 400 for unsupported schema", async () => {
      const res = await app.request("/v1/proofs/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validRequest,
          schema_ref: "https://unknown.example.com/v0/bogus",
        }),
      });

      expect(res.status).toBe(400);

      const body: Record<string, unknown> = (await res.json()) as Record<string, unknown>;
      expect(body.error).toBe("unsupported_schema");
    });

    it("supports manufacturing schema", async () => {
      const res = await app.request("/v1/proofs/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validRequest,
          schema_ref:
            "https://schemas.lemma.frame00.com/v0/manufacturing/quality-decision",
        }),
      });

      expect(res.status).toBe(201);
    });

    it("supports agent schema", async () => {
      const res = await app.request("/v1/proofs/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validRequest,
          schema_ref:
            "https://schemas.lemma.frame00.com/v0/agent/action-decision",
        }),
      });

      expect(res.status).toBe(201);
    });

    it("includes decision_context when provided", async () => {
      const res = await app.request("/v1/proofs/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validRequest,
          decision_context: {
            policy_ref: "https://policies.example.com/kyc-aml",
            decision_path: "0xdecision",
          },
        }),
      });

      const body: Record<string, unknown> = (await res.json()) as Record<string, unknown>;
      const dc = body.decision_context as Record<string, unknown>;
      expect(dc).toBeDefined();
      expect(dc.policy_ref).toBe("https://policies.example.com/kyc-aml");
    });
  });

  describe("GET /v1/proofs/:id", () => {
    it("returns 404 for non-existent proof", async () => {
      const res = await app.request("/v1/proofs/non-existent-id");
      expect(res.status).toBe(404);
    });

    it("returns a previously issued proof", async () => {
      // Issue a proof first
      const issueRes = await app.request("/v1/proofs/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest),
      });
      const issued: Record<string, unknown> = (await issueRes.json()) as Record<string, unknown>;
      const proofId = issued.proof_id as string;

      // Retrieve it
      const getRes = await app.request(`/v1/proofs/${proofId}`);
      expect(getRes.status).toBe(200);

      const retrieved: Record<string, unknown> = (await getRes.json()) as Record<string, unknown>;
      expect(retrieved.proof_id).toBe(proofId);
      expect(retrieved.schema_ref).toBe(FINANCIAL_SCHEMA);
    });
  });
});
