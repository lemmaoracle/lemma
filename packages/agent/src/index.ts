/**
 * @lemmaoracle/agent — Public API surface.
 *
 * Agent Identity & Authority Credential types, validation, and commitment.
 */

// Types
export type {
  AgentIdentity,
  AgentAuthority,
  AgentFinancial,
  AgentLifecycle,
  AgentProvenance,
  ChainContext,
  Role,
  Scope,
  Permission,
  AgentCredential,
  AgentCredentialInput,
  NormalizedIdentity,
  NormalizedAuthority,
  NormalizedFinancial,
  NormalizedLifecycle,
  NormalizedProvenance,
  NormalizedAgentCredential,
  ValidationError,
  ValidationErrorKind,
  ValidationResult,
  CredentialOptions,
  SectionedCommitResult,
  CommitOutput,
} from "./types.js";

// Functions
export { credential } from "./credential.js";
export { validate, validateRequiredFields, validateSpendLimit, validateCurrency, validateTimestamps, validateProvenance } from "./validate.js";
export { computeCredentialCommitment, commit } from "./commit.js";
