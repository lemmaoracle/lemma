/**
 * Proof Issuance Engine — mock proof generation
 *
 * Generates structurally valid proof responses with mock cryptographic
 * commitments. In production, this would use real BBS+/Poseidon proofs.
 * The mock faithfully reproduces the expected response shape so the
 * architecture reads through.
 *
 * The engine is a pure function: given inputs, it produces a proof response.
 * No side effects, no mutation, no classes.
 */

/* eslint-disable functional/functional-parameters */

import type {
  ProofIssueRequest,
  ProofResponse,
  BaseAttributes,
  CryptographicEnvelope,
} from "./types.js";

/** Helper: generate a random hex string of given length */
const randomHex = (len: number): string =>
  Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");

/** Generate a UUID v4-style proof ID */
const generateProofId = (_dummy?: undefined): string => {
  const variant = (Math.floor(Math.random() * 4) + 8).toString(16);

  return `${randomHex(8)}-${randomHex(4)}-4${randomHex(3)}-${variant}${randomHex(3)}-${randomHex(12)}`;
};

/** Mock BBS+ signature proof */
const mockBBSSignature = (proofId: string, issuerDid: string): string =>
  `bbs+_proof_${proofId.slice(0, 8)}_${issuerDid.slice(-8)}_mock`;

/** Build base attributes from request */
const buildBaseAttributes = (
  request: ProofIssueRequest,
  proofId: string,
): BaseAttributes => ({
  lemma_version: "v0.1.0",
  proof_id: proofId,
  issued_at: new Date().toISOString(),
  issuer_did: "did:lemma:issuer:sepolia:alpha",
  schema_ref: request.schema_ref,
  model_attestation: request.model_attestation,
  input_attestation: request.input_attestation,
  output_attestation: request.output_attestation,
  decision_context: request.decision_context,
});

/** Build cryptographic envelope */
const buildEnvelope = (
  proofId: string,
  issuerDid: string,
): CryptographicEnvelope => ({
  signature_scheme: "BBS+ over BLS12-381",
  commitment_scheme: "Poseidon over BN254",
  proof_value: mockBBSSignature(proofId, issuerDid),
  verification_key_ref:
    "https://api.lemma.frame00.com/v1/keys/sepolia-alpha",
  version: "v0.1.0",
});

/** Issue a proof for a valid request. Returns ProofResponse. */
export const issueProof = (
  request: ProofIssueRequest,
): ProofResponse => {
  const proofId = generateProofId();
  const issuerDid = "did:lemma:issuer:sepolia:alpha";
  const base = buildBaseAttributes(request, proofId);
  const envelope = buildEnvelope(proofId, issuerDid);

  return {
    ...base,
    cryptographic_envelope: envelope,
  };
};

/**
 * Issue proof with payment reference attached.
 * Used after x402 payment is confirmed.
 */
export const issueProofWithPayment = (
  request: ProofIssueRequest,
  paymentRef: string,
): ProofResponse => ({
  ...issueProof(request),
  x402_payment_ref: paymentRef,
});

/** Supported schemas */
const SUPPORTED_SCHEMAS: ReadonlyArray<string> = [
  "https://schemas.lemma.frame00.com/v0/financial/transaction-decision",
  "https://schemas.lemma.frame00.com/v0/manufacturing/quality-decision",
  "https://schemas.lemma.frame00.com/v0/agent/action-decision",
];

/** Predicate: is the request schema supported? */
export const isSupportedSchema = (
  request: ProofIssueRequest,
): boolean => SUPPORTED_SCHEMAS.includes(request.schema_ref);
