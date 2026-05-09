/**
 * Pure validation functions for Agent Credentials.
 *
 * Mirrors the normalize WASM's validation rules as a client-side pre-flight
 * check. The WASM remains the authoritative validator.
 *
 * Uses Ramda for branching (R.cond, R.when) — no if/switch statements.
 */
import * as R from "ramda";
import type {
  AgentCredential,
  CredentialOptions,
  ValidationError,
  ValidationResult,
} from "./types.js";

const DEFAULT_SCHEMA_ID = "agent-identity-authority-v1";
const MAX_SPEND_LIMIT = 1_000_000_000_000;
const MAX_EXPIRES_AT = 4102444800;

const err =
  (kind: ValidationError["kind"], message: string): ValidationError =>
    ({ kind, message });

const push = (
  errors: ReadonlyArray<ValidationError>,
  condition: boolean,
  error: ValidationError,
): ReadonlyArray<ValidationError> =>
  condition ? [...errors, error] : errors;

// ── Individual validators ───────────────────────────────────────────────

/** Validate required identity fields are non-empty. */
export const validateRequiredFields = (
  input: Record<string, unknown>,
): ReadonlyArray<ValidationError> => {
  const identity = R.pathOr<Record<string, unknown>>({}, ["identity"], input);
  const authority = R.pathOr<Record<string, unknown>>({}, ["authority"], input);
  const provenance = R.pathOr<Record<string, unknown>>({}, ["provenance"], input);

  const agentId = R.pathOr("", ["agentId"], identity) as string;
  const subjectId = R.pathOr("", ["subjectId"], identity) as string;
  const roles = R.pathOr([], ["roles"], authority) as unknown[];
  const issuerId = R.pathOr("", ["issuerId"], provenance) as string;

  return [
    ...R.isEmpty(agentId) ? [err("EmptyAgentId", "identity.agentId must not be empty")] : [],
    ...R.isEmpty(subjectId) ? [err("EmptySubjectId", "identity.subjectId must not be empty")] : [],
    ...R.isEmpty(roles) ? [err("EmptyRoles", "authority.roles must not be empty")] : [],
    ...R.isEmpty(issuerId) ? [err("EmptyIssuerId", "provenance.issuerId must not be empty")] : [],
  ];
};

/** Validate financial.spendLimit is within bounds and is an integer. */
export const validateSpendLimit = (
  input: Record<string, unknown>,
): ReadonlyArray<ValidationError> => {
  const spendLimit = R.path(["financial", "spendLimit"], input);

  const isEmpty: ReadonlyArray<ValidationError> =
    spendLimit === undefined || spendLimit === null
      ? []
      : [];

  const isInvalid: ReadonlyArray<ValidationError> =
    spendLimit !== undefined && spendLimit !== null &&
    (typeof spendLimit !== "number" || !Number.isInteger(spendLimit) || spendLimit < 0)
      ? [err("SpendLimitExceeded", "financial.spendLimit must be a non-negative integer")]
      : [];

  const isTooLarge: ReadonlyArray<ValidationError> =
    typeof spendLimit === "number" && Number.isInteger(spendLimit) && spendLimit >= 0 && spendLimit > MAX_SPEND_LIMIT
      ? [err("SpendLimitExceeded", `financial.spendLimit must not exceed ${MAX_SPEND_LIMIT}`)]
      : [];

  return [...isEmpty, ...isInvalid, ...isTooLarge];
};

/** Validate financial.currency is 3-letter uppercase when present. */
export const validateCurrency = (
  input: Record<string, unknown>,
): ReadonlyArray<ValidationError> => {
  const currency = R.path(["financial", "currency"], input);

  return currency !== undefined && currency !== null &&
    (typeof currency !== "string" || currency.length !== 3 || !/^[A-Z]{3}$/.test(currency))
    ? [err("InvalidCurrency", "financial.currency must be a 3-letter uppercase ISO 4217 code")]
    : [];
};

/** Validate lifecycle timestamps (issuedAt and expiresAt). */
export const validateTimestamps = (
  input: Record<string, unknown>,
): ReadonlyArray<ValidationError> => {
  const issuedAt = R.path(["lifecycle", "issuedAt"], input);
  const expiresAt = R.path(["lifecycle", "expiresAt"], input);
  const chainId = R.path(["provenance", "chainContext", "chainId"], input);

  const isInvalidU64 = (val: unknown): boolean =>
    val === null ||
    val === undefined ||
    typeof val !== "number" ||
    !Number.isInteger(val) ||
    val < 0;

  let errors: ReadonlyArray<ValidationError> = [];

  // issuedAt must be a non-negative integer
  errors = push(errors, isInvalidU64(issuedAt),
    err("InvalidTimestamp", "lifecycle.issuedAt must be a non-negative integer"));

  // expiresAt: when present, must be a non-negative integer
  errors = push(errors, expiresAt !== undefined && expiresAt !== null && isInvalidU64(expiresAt),
    err("InvalidTimestamp", "lifecycle.expiresAt must be a non-negative integer when present"));

  // expiresAt must be > issuedAt when both are valid numbers
  errors = push(errors,
    typeof expiresAt === "number" && Number.isInteger(expiresAt) &&
    typeof issuedAt === "number" && Number.isInteger(issuedAt) &&
    expiresAt <= issuedAt,
    err("InvalidTimestamp", "lifecycle.expiresAt must be greater than lifecycle.issuedAt"));

  // expiresAt must be ≤ 4102444800
  errors = push(errors,
    typeof expiresAt === "number" && Number.isInteger(expiresAt) && expiresAt > MAX_EXPIRES_AT,
    err("InvalidTimestamp", `lifecycle.expiresAt must not exceed ${MAX_EXPIRES_AT}`));

  // chainId must be a non-negative integer when present
  errors = push(errors,
    chainId !== undefined && chainId !== null && isInvalidU64(chainId),
    err("InvalidTimestamp", "provenance.chainContext.chainId must be a non-negative integer when present"));

  return errors;
};

/** Validate provenance fields. */
export const validateProvenance = (
  _input: Record<string, unknown>,
): ReadonlyArray<ValidationError> =>
  // provenance.issuerId is validated in validateRequiredFields
  [];

// ── Schema validation ───────────────────────────────────────────────────

/** Validate the schema field matches the expected value. */
const validateSchema = (
  input: Record<string, unknown>,
  options?: CredentialOptions,
): ReadonlyArray<ValidationError> => {
  const expectedSchema = options?.schemaId ?? DEFAULT_SCHEMA_ID;
  const actualSchema = R.prop("schema", input) as unknown;

  return actualSchema === expectedSchema
    ? []
    : [err("InvalidSchema", `schema must be "${expectedSchema}"`)];
};

// ── Composed validate ───────────────────────────────────────────────────

/**
 * Validate an Agent Credential against schema rules.
 *
 * Pure, synchronous, does not throw.
 * Returns a `ValidationResult` discriminated union.
 */
export const validate = (
  input: unknown,
  options?: CredentialOptions,
): ValidationResult => {
  const record = input as Record<string, unknown>;

  const allErrors: ReadonlyArray<ValidationError> = [
    ...validateSchema(record, options),
    ...validateRequiredFields(record),
    ...validateSpendLimit(record),
    ...validateCurrency(record),
    ...validateTimestamps(record),
    ...validateProvenance(record),
  ];

  return R.isEmpty(allErrors)
    ? { valid: true, credential: record as unknown as AgentCredential }
    : { valid: false, errors: allErrors };
};
