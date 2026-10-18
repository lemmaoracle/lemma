import { field } from "./leaves.js";

type Result<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; reason: string }>;
type Axis = Readonly<{ root: bigint; leafCount: number; revokedCount: number }>;
/**
 * Readonly decoded snapshot owned by `verify/policy`; epoch and roots become bigint.
 * Wire objects have exactly seven keys: version, scheme, scope, epoch, publishedAt,
 * member, grant. Extra or missing keys are rejected. version is the number 1;
 * scheme is "member-grant-v1"; scope is a string with nonempty trimmed content.
 * Epoch and roots are decimal strings matching ^(0|[1-9][0-9]*)$, at most 77
 * digits and below the BN254 scalar field modulus
 * 21888242871839275222246405745257275088548364400416034343698204186575808495617.
 * Epoch is at least 1. publishedAt is UTC millisecond RFC3339
 * (YYYY-MM-DDTHH:MM:SS.sssZ), identical after a Date ISO round trip.
 * Each axis has exactly root, leafCount, revokedCount; leafCount is an integer
 * in 0..2^20 and revokedCount is an integer in 0..leafCount.
 * Invalid JSON values return decode's {ok:false, reason}, without throwing.
 */
export type Policy = Readonly<{
  version: 1;
  scheme: "member-grant-v1";
  scope: string;
  epoch: bigint;
  publishedAt: string;
  member: Axis;
  grant: Axis;
}>;

const record = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const keys = (value: Readonly<Record<string, unknown>>, names: ReadonlyArray<string>): boolean =>
  Object.keys(value).length === names.length && names.every((name) => Object.hasOwn(value, name));
const decimal = (value: unknown): bigint | null =>
  typeof value === "string" &&
  /^(0|[1-9][0-9]*)$/.test(value) &&
  value.trim() === value &&
  value.length <= 77 &&
  BigInt(value) < field
    ? BigInt(value)
    : null;
const axis = (value: unknown): Axis | null => {
  const root = record(value) ? decimal(value.root) : null;
  return record(value) &&
    keys(value, ["root", "leafCount", "revokedCount"]) &&
    root !== null &&
    typeof value.leafCount === "number" &&
    Number.isInteger(value.leafCount) &&
    value.leafCount >= 0 &&
    value.leafCount <= 2 ** 20 &&
    typeof value.revokedCount === "number" &&
    Number.isInteger(value.revokedCount) &&
    value.revokedCount >= 0 &&
    value.revokedCount <= value.leafCount
    ? { root, leafCount: value.leafCount, revokedCount: value.revokedCount }
    : null;
};
const timestamp = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString() === value;

/**
 * Decode a parsed JSON value using the exact wire rules documented on {@link Policy}:
 * exactly version/scheme/scope/epoch/publishedAt/member/grant; numeric version 1,
 * scheme "member-grant-v1", nonempty trimmed scope; decimal epoch/roots matching
 * ^(0|[1-9][0-9]*)$, <=77 digits, below the BN254 scalar field, epoch >=1;
 * UTC millisecond RFC3339 publishedAt (YYYY-MM-DDTHH:MM:SS.sssZ) with an exact
 * Date ISO round trip; axes with exactly root/leafCount/revokedCount, integer
 * leafCount in 0..2^20 and integer revokedCount in 0..leafCount.
 * Invalid JSON values do not throw: they return {ok:false, reason}.
 * Stable reasons, checked in this priority order for multiple invalid fields:
 * - "Invalid policy shape": non-object or extra/missing top-level keys.
 * - "Invalid policy version": version is not numeric 1.
 * - "Invalid policy scheme": unsupported scheme.
 * - "Invalid policy scope": scope is not a string with nonempty trimmed content.
 * - "Invalid policy epoch": invalid decimal, field range, or zero epoch.
 * - "Invalid policy publishedAt": invalid or noncanonical timestamp.
 * - "Invalid policy axis": either axis has invalid keys, root, or counts.
 * This validates serialization only, not issuer trust, freshness, or authorization.
 */
export const decode = (value: unknown): Result<Policy> => {
  const epoch = record(value) ? decimal(value.epoch) : null;
  const member = record(value) ? axis(value.member) : null;
  const grant = record(value) ? axis(value.grant) : null;
  return !record(value) ||
    !keys(value, ["version", "scheme", "scope", "epoch", "publishedAt", "member", "grant"])
    ? { ok: false, reason: "Invalid policy shape" }
    : value.version !== 1
      ? { ok: false, reason: "Invalid policy version" }
      : value.scheme !== "member-grant-v1"
        ? { ok: false, reason: "Invalid policy scheme" }
        : typeof value.scope !== "string" || value.scope.trim().length === 0
          ? { ok: false, reason: "Invalid policy scope" }
          : epoch === null || epoch < 1n
            ? { ok: false, reason: "Invalid policy epoch" }
            : !timestamp(value.publishedAt)
              ? { ok: false, reason: "Invalid policy publishedAt" }
              : member === null || grant === null
                ? { ok: false, reason: "Invalid policy axis" }
                : {
                    ok: true,
                    value: {
                      version: 1,
                      scheme: "member-grant-v1",
                      scope: value.scope,
                      epoch,
                      publishedAt: value.publishedAt,
                      member,
                      grant,
                    },
                  };
};
