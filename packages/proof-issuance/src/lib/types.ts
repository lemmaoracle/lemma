/**
 * Proof Issuance API — Core types
 *
 * All types use Readonly<> to enforce immutability.
 */

/** Model attestation — identifies the AI model that produced the output */
export interface ModelAttestation {
  readonly model_id: string;
  readonly model_version: string;
  readonly model_hash: string;
}

/** Input attestation — hash of the input data fed to the model */
export interface InputAttestation {
  readonly input_hash: string;
}

/** Output attestation — hash of the model's output */
export interface OutputAttestation {
  readonly output_hash: string;
}

/** Decision context — optional policy and decision path */
export interface DecisionContext {
  readonly policy_ref?: string;
  readonly decision_path?: string;
}

/** Proof issuance request payload */
export interface ProofIssueRequest {
  readonly schema_ref: string;
  readonly model_attestation: ModelAttestation;
  readonly input_attestation: InputAttestation;
  readonly output_attestation: OutputAttestation;
  readonly decision_context?: DecisionContext;
}

/** Cryptographic envelope for a proof */
export interface CryptographicEnvelope {
  readonly signature_scheme: string;
  readonly commitment_scheme: string;
  readonly proof_value: string;
  readonly verification_key_ref: string;
  readonly version: string;
}

/** Base attribute layer */
export interface BaseAttributes {
  readonly lemma_version: string;
  readonly proof_id: string;
  readonly issued_at: string;
  readonly issuer_did: string;
  readonly schema_ref: string;
  readonly model_attestation: ModelAttestation;
  readonly input_attestation: InputAttestation;
  readonly output_attestation: OutputAttestation;
  readonly decision_context?: DecisionContext;
}

/** Full proof response — base attributes + cryptographic envelope */
export interface ProofResponse extends BaseAttributes {
  readonly cryptographic_envelope: CryptographicEnvelope;
  readonly x402_payment_ref?: string;
}

/** Supported industry schemas */
export const SUPPORTED_SCHEMAS: ReadonlyArray<string> = [
  "https://schemas.lemma.frame00.com/v0/financial/transaction-decision",
  "https://schemas.lemma.frame00.com/v0/manufacturing/quality-decision",
  "https://schemas.lemma.frame00.com/v0/agent/action-decision",
];

/** Health check response */
export interface HealthResponse {
  readonly status: "ok";
  readonly stage: "sepolia-trial";
  readonly timestamp: string;
}

/** Discovery extension output */
export interface DiscoveryExtension {
  readonly output: {
    readonly example: ProofResponse;
    readonly schema: Record<string, unknown>;
  };
  readonly metadata: {
    readonly title: string;
    readonly description: string;
    readonly tags: ReadonlyArray<string>;
  };
}
