/**
 * Credential factory — builds a validated AgentCredential from partial input.
 *
 * Fills defaults to produce output that, when normalized, yields deterministic
 * results matching WASM normalization behavior.
 */
import * as R from "ramda";
import type {
  AgentCredential,
  AgentCredentialInput,
  CredentialOptions,
  ValidationResult,
} from "./types.js";
import { validate } from "./validate.js";

const DEFAULT_SCHEMA_ID = "agent-identity-authority-v1";

/**
 * Build a validated AgentCredential from partial input.
 *
 * Defaults:
 * - `schema` from `options.schemaId ?? "agent-identity-authority-v1"`
 * - `issuedAt` from `Math.floor(Date.now() / 1000)`
 * - `currency` from `"USD"`
 * - Empty arrays for scopes/permissions
 * - Empty strings for optional provenance fields
 */
export const credential = (
  input: AgentCredentialInput,
  options?: CredentialOptions,
): ValidationResult => {
  const schemaId = options?.schemaId ?? DEFAULT_SCHEMA_ID;
  const issuedAt = input.issuedAt ?? Math.floor(Date.now() / 1000);

  const credentialObj: AgentCredential = {
    schema: schemaId,
    identity: {
      agentId: input.agentId,
      subjectId: input.subjectId,
      controllerId: input.controllerId ?? "",
      orgId: input.orgId ?? "",
    },
    authority: {
      roles: R.map((name: string) => ({ name }), input.roles),
      scopes: R.map((name: string) => ({ name }), input.scopes ?? []),
      permissions: input.permissions ?? [],
    },
    financial: {
      spendLimit: input.spendLimit,
      currency: input.currency ?? "USD",
      paymentPolicy: input.paymentPolicy ?? "",
    },
    lifecycle: {
      issuedAt,
      expiresAt: input.expiresAt,
      revoked: input.revoked,
      revocationRef: input.revocationRef ?? "",
    },
    provenance: {
      issuerId: input.issuerId,
      sourceSystem: input.sourceSystem ?? "",
      generatorId: input.generatorId ?? "",
      chainContext: {
        chainId: input.chainId,
        network: input.network ?? "",
      },
    },
  };

  return validate(credentialObj, options);
};
