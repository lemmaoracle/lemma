/**
 * Tests for proof-engine.ts — mock proof generation
 *
 * Test files are exempt from functional programming rules.
 */

import { describe, it, expect } from "vitest";
import {
  issueProof,
  issueProofWithPayment,
  isSupportedSchema,
} from "../lib/proof-engine.js";
import type { ProofIssueRequest } from "../lib/types.js";

const makeRequest = (overrides?: Partial<ProofIssueRequest>): ProofIssueRequest => ({
  schema_ref: "https://schemas.lemma.frame00.com/v0/financial/transaction-decision",
  model_attestation: {
    model_id: "test-model-v1",
    model_version: "1.0.0",
    model_hash: "0xdeadbeef",
  },
  input_attestation: { input_hash: "0xcafe" },
  output_attestation: { output_hash: "0xbabe" },
  ...overrides,
});

describe("issueProof", () => {
  it("generates a proof with required fields", () => {
    const request = makeRequest();
    const proof = issueProof(request);

    expect(proof.proof_id).toBeDefined();
    expect(proof.proof_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(proof.lemma_version).toBe("v0.1.0");
    expect(proof.issuer_did).toBe("did:lemma:issuer:sepolia:alpha");
    expect(proof.schema_ref).toBe(request.schema_ref);
  });

  it("includes the model attestation from the request", () => {
    const request = makeRequest();
    const proof = issueProof(request);

    expect(proof.model_attestation).toEqual(request.model_attestation);
    expect(proof.input_attestation).toEqual(request.input_attestation);
    expect(proof.output_attestation).toEqual(request.output_attestation);
  });

  it("includes a cryptographic envelope with correct schemes", () => {
    const request = makeRequest();
    const proof = issueProof(request);

    expect(proof.cryptographic_envelope.signature_scheme).toBe(
      "BBS+ over BLS12-381",
    );
    expect(proof.cryptographic_envelope.commitment_scheme).toBe(
      "Poseidon over BN254",
    );
    expect(proof.cryptographic_envelope.version).toBe("v0.1.0");
    expect(proof.cryptographic_envelope.proof_value).toMatch(/^bbs\+_proof_/);
    expect(proof.cryptographic_envelope.verification_key_ref).toContain(
      "/keys/",
    );
  });

  it("includes issued_at as ISO 8601 timestamp", () => {
    const request = makeRequest();
    const proof = issueProof(request);

    expect(() => new Date(proof.issued_at)).not.toThrow();
  });

  it("preserves decision_context when provided", () => {
    const request = makeRequest({
      decision_context: {
        policy_ref: "https://policies.example.com/v1/kyc",
        decision_path: "0xdec1s10n",
      },
    });
    const proof = issueProof(request);

    expect(proof.decision_context).toEqual(request.decision_context);
  });

  it("generates unique proof_ids for different calls", () => {
    const request = makeRequest();
    const p1 = issueProof(request);
    const p2 = issueProof(request);

    expect(p1.proof_id).not.toBe(p2.proof_id);
  });
});

describe("issueProofWithPayment", () => {
  it("attaches x402_payment_ref to proof", () => {
    const request = makeRequest();
    const paymentRef = "0xpayment123";
    const proof = issueProofWithPayment(request, paymentRef);

    expect(proof.x402_payment_ref).toBe(paymentRef);
  });

  it("still includes all other proof fields", () => {
    const request = makeRequest();
    const proof = issueProofWithPayment(request, "0xabc");

    expect(proof.proof_id).toBeDefined();
    expect(proof.cryptographic_envelope).toBeDefined();
  });
});

describe("isSupportedSchema", () => {
  it("returns true for financial schema", () => {
    expect(
      isSupportedSchema(
        makeRequest({
          schema_ref:
            "https://schemas.lemma.frame00.com/v0/financial/transaction-decision",
        }),
      ),
    ).toBe(true);
  });

  it("returns true for manufacturing schema", () => {
    expect(
      isSupportedSchema(
        makeRequest({
          schema_ref:
            "https://schemas.lemma.frame00.com/v0/manufacturing/quality-decision",
        }),
      ),
    ).toBe(true);
  });

  it("returns true for agent schema", () => {
    expect(
      isSupportedSchema(
        makeRequest({
          schema_ref:
            "https://schemas.lemma.frame00.com/v0/agent/action-decision",
        }),
      ),
    ).toBe(true);
  });

  it("returns false for unknown schema", () => {
    expect(
      isSupportedSchema(
        makeRequest({
          schema_ref: "https://unknown.com/v0/bogus",
        }),
      ),
    ).toBe(false);
  });
});
