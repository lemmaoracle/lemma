/**
 * Bazaar Discovery Extension
 *
 * Implements the declareDiscoveryExtension() contract for x402 Bazaar
 * automatic listing. This module generates the discovery metadata that
 * the x402 facilitator uses to populate the Bazaar catalog.
 *
 * All functions are pure — the discovery output is generated from config.
 */

import type { DiscoveryExtension, ProofIssueRequest } from "./types.js";
import { issueProof } from "./proof-engine.js";

/** Sample proof for Bazaar discovery output.example */
const sampleRequest: ProofIssueRequest = {
  schema_ref:
    "https://schemas.lemma.frame00.com/v0/financial/transaction-decision",
  model_attestation: {
    model_id: "fin-decision-model-v3",
    model_version: "3.2.1",
    model_hash:
      "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
  },
  input_attestation: {
    input_hash:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  output_attestation: {
    output_hash:
      "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
  },
  decision_context: {
    policy_ref: "https://policies.lemma.frame00.com/v0/financial/kyc-aml",
    decision_path:
      "0xdec1s10n_p4th_f1n4nc14l_k1",
  },
};

/** Output JSON Schema for discovery */
const outputJsonSchema: Record<string, unknown> = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: [
    "lemma_version",
    "proof_id",
    "issued_at",
    "issuer_did",
    "schema_ref",
    "model_attestation",
    "input_attestation",
    "output_attestation",
    "cryptographic_envelope",
  ],
  properties: {
    lemma_version: {
      type: "string",
      description: "Lemma protocol version",
    },
    proof_id: {
      type: "string",
      description: "Unique proof identifier (UUID v4)",
    },
    issued_at: {
      type: "string",
      format: "date-time",
      description: "ISO 8601 issuance timestamp",
    },
    issuer_did: {
      type: "string",
      description: "DID of the proof issuer",
    },
    schema_ref: {
      type: "string",
      description: "Reference to the attribute schema used",
    },
    model_attestation: {
      type: "object",
      required: ["model_id", "model_version", "model_hash"],
      properties: {
        model_id: { type: "string" },
        model_version: { type: "string" },
        model_hash: { type: "string" },
      },
    },
    input_attestation: {
      type: "object",
      required: ["input_hash"],
      properties: {
        input_hash: { type: "string" },
      },
    },
    output_attestation: {
      type: "object",
      required: ["output_hash"],
      properties: {
        output_hash: { type: "string" },
      },
    },
    cryptographic_envelope: {
      type: "object",
      required: [
        "signature_scheme",
        "commitment_scheme",
        "proof_value",
        "verification_key_ref",
        "version",
      ],
      properties: {
        signature_scheme: { type: "string" },
        commitment_scheme: { type: "string" },
        proof_value: { type: "string" },
        verification_key_ref: { type: "string" },
        version: { type: "string" },
      },
    },
    x402_payment_ref: {
      type: "string",
      description: "x402 payment transaction reference",
    },
  },
};

/**
 * Build the discovery extension payload.
 *
 * This is what declareDiscoveryExtension() would return.
 * The x402 facilitator uses this to populate the Bazaar listing.
 */
export const buildDiscoveryExtension = (
  _dummy?: undefined,
): DiscoveryExtension => {
  const sampleProof = issueProof(sampleRequest);

  return {
    output: {
      example: sampleProof,
      schema: outputJsonSchema,
    },
    metadata: {
      title: "Lemma Proof Issuance",
      description:
        "Models change. Proofs remain. Issue verifiable AI-output provenance proofs via x402.",
      tags: ["verifiable-ai", "provenance", "attestation"],
    },
  };
};
