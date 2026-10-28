import type { Grant, Request, Snapshot } from "./scheme.js";
import {
  emptySlot,
  grantLeaf,
  identityCommitment,
  limbBits,
  memberLeaf,
  tsBits,
  validBits,
  validField,
} from "./scheme.js";
import type { Path } from "./tree.js";
import { grantHolds, memberHolds } from "./tree.js";

/**
 * Pure witness / public-signal converters for agent-gate-v1 (INTERNAL).
 *
 * `witness` runs on the submitter (agent) side: it turns issuer credentials +
 * the request into a circuit witness record. `signals` runs on the verifier
 * side: it turns the trusted snapshot + verifier-owned expectations + the two
 * submitted proof outputs into the 16-entry array for cryptographic
 * verification. Neither function fetches, infers digests/clocks/identity, or
 * decides authorization: freshness, challenge single-use, nullifier replay,
 * and scope correspondence stay in the calling application.
 */

type Result<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; reason: string }>;

const isRecord = (value: unknown): boolean =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export type WitnessInput = Readonly<{
  snapshot: Snapshot;
  agentSecret: bigint;
  roleId: bigint;
  grant: Grant;
  memberPath: Path;
  grantPath: Path;
  request: Request;
}>;

export type Witness = Readonly<Record<string, string | ReadonlyArray<string>>>;

export type Expected = Readonly<
  Request & Readonly<{ idCommitment: bigint }>
>;

export type SignalsInput = Readonly<{
  snapshot: Snapshot;
  expected: Expected;
  outputs: Readonly<{ bindTag: bigint; nullifier: bigint }>;
}>;

const requestWidthsOk = (value: Request): boolean =>
  validField(value.toolId) &&
  validField(value.resourceId) &&
  validField(value.actionId) &&
  validBits(value.paramsHashLo, limbBits) &&
  validBits(value.paramsHashHi, limbBits) &&
  validBits(value.amount, tsBits) &&
  validField(value.challenge) &&
  validField(value.audience) &&
  validField(value.sessionHash) &&
  validBits(value.asOf, tsBits) &&
  validField(value.epoch);

const grantWidthsOk = (value: Grant): boolean =>
  validField(value.roleId) &&
  validField(value.toolId) &&
  validField(value.resourceId) &&
  validField(value.actionId) &&
  validBits(value.maxPerAction, tsBits) &&
  validBits(value.startTs, tsBits) &&
  validBits(value.endTs, tsBits);

/**
 * Build the circuit witness record. Fails closed with a stable reason on any
 * mismatch; every check here is ALSO enforced in-circuit, so this function is
 * a fast local pre-check, never the gate itself. Secrets are never logged.
 */
const witnessValid = (input: WitnessInput): Result<Witness> => {
  const commitment = identityCommitment(input.agentSecret);
  const leafM =
    commitment === null
      ? null
      : memberLeaf({ idCommitment: commitment, roleId: input.roleId });
  const leafG = grantLeaf(input.grant);
  return commitment === null
    ? { ok: false, reason: "Invalid agent secret" }
    : !validField(input.roleId) || input.roleId !== input.grant.roleId
      ? { ok: false, reason: "Role mismatch between member and grant" }
      : !grantWidthsOk(input.grant)
        ? { ok: false, reason: "Invalid grant fields" }
        : leafM === null || leafG === null || leafM === emptySlot || leafG === emptySlot
          ? { ok: false, reason: "Revoked or empty slot" }
          : !requestWidthsOk(input.request)
            ? { ok: false, reason: "Invalid request fields" }
            : input.request.toolId !== input.grant.toolId ||
                input.request.resourceId !== input.grant.resourceId ||
                input.request.actionId !== input.grant.actionId
              ? { ok: false, reason: "Request does not match grant scope" }
              : input.request.epoch !== input.snapshot.epoch
                ? { ok: false, reason: "Epoch mismatch between request and snapshot" }
                : input.grant.startTs > input.request.asOf || input.request.asOf > input.grant.endTs
                  ? { ok: false, reason: "Grant window does not cover asOf" }
                  : input.request.amount > input.grant.maxPerAction
                    ? { ok: false, reason: "Amount exceeds per-action limit" }
                    : !memberHolds(leafM, input.memberPath, input.snapshot.memberRoot)
                      ? { ok: false, reason: "Member path does not hold" }
                      : !grantHolds(leafG, input.grantPath, input.snapshot.grantRoot)
                        ? { ok: false, reason: "Grant path does not hold" }
                        : {
                            ok: true,
                            value: {
                              agentSecret: input.agentSecret.toString(),
                              roleId: input.roleId.toString(),
                              maxPerAction: input.grant.maxPerAction.toString(),
                              startTs: input.grant.startTs.toString(),
                              endTs: input.grant.endTs.toString(),
                              memberPathElements: input.memberPath.siblings.map((v) => v.toString()),
                              memberPathIndices: input.memberPath.directions.map((v) => v.toString()),
                              grantPathElements: input.grantPath.siblings.map((v) => v.toString()),
                              grantPathIndices: input.grantPath.directions.map((v) => v.toString()),
                            },
                          };
};

export const witness = (input: WitnessInput): Result<Witness> =>
  // Malformed runtime objects use the nearest existing field or path reason.
  !isRecord(input) || !isRecord(input.snapshot)
    ? { ok: false, reason: "Invalid snapshot roots" }
    : !isRecord(input.grant)
      ? { ok: false, reason: "Invalid grant fields" }
      : !isRecord(input.request)
        ? { ok: false, reason: "Invalid request fields" }
        : !isRecord(input.memberPath)
          ? { ok: false, reason: "Member path does not hold" }
          : !isRecord(input.grantPath)
            ? { ok: false, reason: "Grant path does not hold" }
            : witnessValid(input);

/**
 * Build the 16-entry public-signal array in frozen `signalNames` order. The
 * two leading outputs are strictly decoded but CANNOT be recomputed here (the
 * verifier lacks the secret); their correctness is established by
 * cryptographic verification against this array. All other entries MUST come
 * from verifier-owned values — never echo a submitter-supplied array.
 */
export const signals = (input: SignalsInput): Result<ReadonlyArray<string>> =>
  // Malformed runtime objects use the corresponding existing signal reason.
  !isRecord(input) || !isRecord(input.snapshot) ||
  !validField(input.snapshot.memberRoot) ||
  !validField(input.snapshot.grantRoot) ||
  !validField(input.snapshot.epoch)
    ? { ok: false, reason: "Invalid snapshot roots" }
    : !isRecord(input.expected) || !requestWidthsOk(input.expected) || !validField(input.expected.idCommitment)
      ? { ok: false, reason: "Invalid expected signals" }
      : input.expected.epoch !== input.snapshot.epoch
        ? { ok: false, reason: "Epoch mismatch between expected and snapshot" }
        : !isRecord(input.outputs) || !validField(input.outputs.bindTag) || !validField(input.outputs.nullifier)
          ? { ok: false, reason: "Invalid proof outputs" }
          : {
              ok: true,
              // Frozen order; MUST match `signalNames` (asserted in circuit tests
              // against the compiled artifact's actual public-signal order).
              value: [
                input.outputs.bindTag.toString(),
                input.outputs.nullifier.toString(),
                input.snapshot.memberRoot.toString(),
                input.snapshot.grantRoot.toString(),
                input.snapshot.epoch.toString(),
                input.expected.asOf.toString(),
                input.expected.toolId.toString(),
                input.expected.resourceId.toString(),
                input.expected.actionId.toString(),
                input.expected.paramsHashLo.toString(),
                input.expected.paramsHashHi.toString(),
                input.expected.amount.toString(),
                input.expected.challenge.toString(),
                input.expected.audience.toString(),
                input.expected.sessionHash.toString(),
                input.expected.idCommitment.toString(),
              ],
            };
