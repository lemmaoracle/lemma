/**
 * @lemmaoracle/agent — Type definitions for Agent Identity & Authority Credentials.
 *
 * Schema ID: agent-identity-authority-v1
 * Source: https://github.com/lemmaoracle/lemma
 */

// ── Identity ────────────────────────────────────────────────────────────

/** @see agent-identity-authority-v1 → identity */
export type AgentIdentity = Readonly<{
  /** @see identity.agentId — unique agent identifier */
  agentId: string;
  /** @see identity.subjectId — subject the agent acts on behalf of */
  subjectId: string;
  /** @see identity.controllerId — optional controller of the agent */
  controllerId?: string;
  /** @see identity.orgId — optional organisation the agent belongs to */
  orgId?: string;
}>;

// ── Authority ───────────────────────────────────────────────────────────

/** @see agent-identity-authority-v1 → authority.roles[] */
export type Role = Readonly<{
  name: string;
}>;

/** @see agent-identity-authority-v1 → authority.scopes[] */
export type Scope = Readonly<{
  name: string;
}>;

/** @see agent-identity-authority-v1 → authority.permissions[] */
export type Permission = Readonly<{
  resource: string;
  action: string;
}>;

/** @see agent-identity-authority-v1 → authority */
export type AgentAuthority = Readonly<{
  /** @see authority.roles — at least one role required */
  roles: ReadonlyArray<Role>;
  /** @see authority.scopes */
  scopes: ReadonlyArray<Scope>;
  /** @see authority.permissions */
  permissions: ReadonlyArray<Permission>;
}>;

// ── Financial ───────────────────────────────────────────────────────────

/** @see agent-identity-authority-v1 → financial */
export type AgentFinancial = Readonly<{
  /** @see financial.spendLimit — u64, max 1 000 000 000 000 */
  spendLimit?: number;
  /** @see financial.currency — 3-letter uppercase ISO 4217 */
  currency?: string;
  /** @see financial.paymentPolicy */
  paymentPolicy?: string;
}>;

// ── Lifecycle ───────────────────────────────────────────────────────────

/** @see agent-identity-authority-v1 → lifecycle */
export type AgentLifecycle = Readonly<{
  /** @see lifecycle.issuedAt — epoch seconds, u64 */
  issuedAt: number;
  /** @see lifecycle.expiresAt — epoch seconds, u64, must be > issuedAt */
  expiresAt?: number;
  /** @see lifecycle.revoked */
  revoked?: boolean;
  /** @see lifecycle.revocationRef */
  revocationRef?: string;
}>;

// ── Provenance ──────────────────────────────────────────────────────────

/** @see agent-identity-authority-v1 → provenance.chainContext */
export type ChainContext = Readonly<{
  /** @see provenance.chainContext.chainId — u64 */
  chainId?: number;
  /** @see provenance.chainContext.network */
  network?: string;
}>;

/** @see agent-identity-authority-v1 → provenance */
export type AgentProvenance = Readonly<{
  /** @see provenance.issuerId — required */
  issuerId: string;
  /** @see provenance.sourceSystem */
  sourceSystem?: string;
  /** @see provenance.generatorId */
  generatorId?: string;
  /** @see provenance.chainContext */
  chainContext?: ChainContext;
}>;

// ── AgentCredential (canonical) ─────────────────────────────────────────

/**
 * Canonical Agent Credential type aligned to `agent-identity-authority-v1` schema ABI.
 *
 * All fields from `abi.raw` and `abi.norm` with JSDoc referencing schema ID
 * and source repository at https://github.com/lemmaoracle/lemma.
 *
 * @see agent-identity-authority-v1
 */
export type AgentCredential = Readonly<{
  /** Schema identifier, e.g. "agent-identity-authority-v1" */
  schema: string;
  /** @see identity */
  identity: AgentIdentity;
  /** @see authority */
  authority: AgentAuthority;
  /** @see financial — optional section */
  financial?: AgentFinancial;
  /** @see lifecycle */
  lifecycle: AgentLifecycle;
  /** @see provenance */
  provenance: AgentProvenance;
}>;

// ── AgentCredentialInput (partial for factory) ──────────────────────────

/**
 * Partial input for the `credential()` factory.
 * Only `agentId`, `subjectId`, `roles`, and `issuerId` are required;
 * all other fields default automatically.
 */
export type AgentCredentialInput = Readonly<{
  agentId: string;
  subjectId: string;
  roles: ReadonlyArray<string>;
  issuerId: string;
  controllerId?: string;
  orgId?: string;
  scopes?: ReadonlyArray<string>;
  permissions?: ReadonlyArray<Permission>;
  spendLimit?: number;
  currency?: string;
  paymentPolicy?: string;
  issuedAt?: number;
  expiresAt?: number;
  revoked?: boolean;
  revocationRef?: string;
  sourceSystem?: string;
  generatorId?: string;
  chainId?: number;
  network?: string;
}>;

// ── Normalized output types (matching WASM) ─────────────────────────────

/** @see NormalizedAgentCredential.identity */
export type NormalizedIdentity = Readonly<{
  agentId: string;
  subjectId: string;
  controllerId: string;
  orgId: string;
}>;

/** @see NormalizedAgentCredential.authority */
export type NormalizedAuthority = Readonly<{
  roles: string;
  scopes: string;
  permissions: string;
}>;

/** @see NormalizedAgentCredential.financial */
export type NormalizedFinancial = Readonly<{
  spendLimit: string;
  currency: string;
  paymentPolicy: string;
}>;

/** @see NormalizedAgentCredential.lifecycle */
export type NormalizedLifecycle = Readonly<{
  issuedAt: string;
  expiresAt: string;
  revoked: string;
  revocationRef: string;
}>;

/** @see NormalizedAgentCredential.provenance */
export type NormalizedProvenance = Readonly<{
  issuerId: string;
  sourceSystem: string;
  generatorId: string;
  chainId: string;
  network: string;
}>;

/**
 * Normalized Agent Credential matching the WASM's `NormalizedAgentCredential`
 * output structure.
 *
 * @see agent-identity-authority-v1 → abi.norm
 */
export type NormalizedAgentCredential = Readonly<{
  schema: string;
  identity: NormalizedIdentity;
  authority: NormalizedAuthority;
  financial: NormalizedFinancial;
  lifecycle: NormalizedLifecycle;
  provenance: NormalizedProvenance;
}>;

// ── Validation types ────────────────────────────────────────────────────

/** Error kinds matching the WASM's ValidationError enum. */
export type ValidationErrorKind =
  | "EmptyAgentId"
  | "EmptySubjectId"
  | "EmptyRoles"
  | "SpendLimitExceeded"
  | "InvalidCurrency"
  | "InvalidTimestamp"
  | "EmptyIssuerId"
  | "InvalidSchema";

/** Tagged union for validation errors. */
export type ValidationError = Readonly<{
  kind: ValidationErrorKind;
  message: string;
}>;

/**
 * Discriminated union for validation results.
 * - `{ valid: true, credential }` on success
 * - `{ valid: false, errors }` on failure
 */
export type ValidationResult =
  | Readonly<{ valid: true; credential: AgentCredential }>
  | Readonly<{ valid: false; errors: ReadonlyArray<ValidationError> }>;

// ── Options ─────────────────────────────────────────────────────────────

/** Optional configuration for `credential()` and `validate()`. */
export type CredentialOptions = Readonly<{
  schemaId?: string;
}>;

// ── Commitment types ────────────────────────────────────────────────────

/** Result of computing a sectioned Poseidon commitment. */
export type SectionedCommitResult = Readonly<{
  /** Top-level Poseidon commitment (= credentialCommitment in agent-identity.circom) */
  root: string;
  /** Per-section hashes keyed by section name */
  sectionHashes: Readonly<Record<string, string>>;
  /** Binding salt */
  salt: string;
}>;

/** Full output of `commit()` including normalized data. */
export type CommitOutput<Norm = NormalizedAgentCredential> = Readonly<{
  normalized: Norm;
  root: string;
  sectionHashes: Readonly<Record<string, string>>;
  salt: string;
}>;
