import { field } from "./leaves.js";

type Result<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; reason: string }>;
type Axis = Readonly<{ root: bigint; leafCount: number; revokedCount: number }>;
/** Internal decoded snapshot. No wire/API contract is published here. */
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

/** Decode a parsed JSON snapshot, rejecting extra keys and noncanonical values. */
export const decode = (value: unknown): Result<Policy> => {
  const epoch = record(value) ? decimal(value.epoch) : null;
  const member = record(value) ? axis(value.member) : null;
  const grant = record(value) ? axis(value.grant) : null;
  return record(value) &&
    keys(value, ["version", "scheme", "scope", "epoch", "publishedAt", "member", "grant"]) &&
    value.version === 1 &&
    value.scheme === "member-grant-v1" &&
    typeof value.scope === "string" &&
    value.scope.trim().length > 0 &&
    epoch !== null &&
    epoch >= 1n &&
    timestamp(value.publishedAt) &&
    member !== null &&
    grant !== null
    ? {
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
      }
    : { ok: false, reason: "Invalid policy snapshot" };
};
