import { poseidon12, poseidon2, poseidon3, poseidon4, poseidon8 } from "poseidon-lite";

/**
 * Agent-gate-v1 scheme constants and pure hashing vocabulary (INTERNAL).
 *
 * This module is intentionally standalone: it does NOT import `../policy/*`.
 * The agent gate proposes a hardened encoding (domain-separated hashes, empty
 * slot 0 with explicit rejection, 64-bit unix-second window, digest-bound
 * public tool/resource/action/amount) that differs from member-grant-v1. See
 * the `proof-gate-circuits` openspec design record for the documented delta.
 * Any change to a constant below is a new scheme id and new artifacts.
 */

/** Local circuit id string. Names local artifacts only; unregistered. */
export const circuitId = "agent-gate-v1";

/** BN254 scalar field. Values outside it are invalid, never reduced. */
export const field =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;

/** Fixed Merkle depths. Both axes always prove full-length paths. */
export const memberDepth = 20;
export const grantDepth = 20;

/** Bit widths enforced in-circuit before every comparison or limb use. */
export const tsBits = 64;
export const limbBits = 128;

/** Domain constants. Distinct across every hash use AND across gates. */
export const domains = {
  member: 101n,
  grant: 102n,
  node: 103n,
  pk: 104n,
  req: 105n,
  bind: 106n,
  null: 107n,
} as const;

/** The empty slot value. Trees may contain it (revoked slot); circuits reject it. */
export const emptySlot = 0n;

export const validField = (value: unknown): value is bigint =>
  typeof value === "bigint" && value >= 0n && value < field;

export const validBits = (value: unknown, bits: number): value is bigint =>
  validField(value) && value < 2n ** BigInt(bits);

export type Member = Readonly<{ idCommitment: bigint; roleId: bigint }>;

export type Grant = Readonly<{
  roleId: bigint;
  toolId: bigint;
  resourceId: bigint;
  actionId: bigint;
  maxPerAction: bigint;
  startTs: bigint;
  endTs: bigint;
}>;

/**
 * Verifier-owned request expectations. The verifier builds every field from
 * its own context (request bytes it hashed, its clock, its challenge): the
 * adapter never fetches or infers any of these.
 */
export type Request = Readonly<{
  toolId: bigint;
  resourceId: bigint;
  actionId: bigint;
  paramsHashLo: bigint;
  paramsHashHi: bigint;
  amount: bigint;
  challenge: bigint;
  audience: bigint;
  sessionHash: bigint;
  asOf: bigint;
  epoch: bigint;
}>;

export type Snapshot = Readonly<{
  memberRoot: bigint;
  grantRoot: bigint;
  epoch: bigint;
}>;

/** Poseidon(DOM_MEMBER, idCommitment, roleId). Invalid fields return null. */
export const memberLeaf = (value: Member): bigint | null =>
  [value.idCommitment, value.roleId].every(validField)
    ? poseidon3([domains.member, value.idCommitment, value.roleId])
    : null;

/** Poseidon(DOM_GRANT, roleId, toolId, resourceId, actionId, maxPerAction, startTs, endTs). */
export const grantLeaf = (value: Grant): bigint | null => {
  const inputs = [
    value.roleId,
    value.toolId,
    value.resourceId,
    value.actionId,
    value.maxPerAction,
    value.startTs,
    value.endTs,
  ];
  return inputs.every(validField) ? poseidon8([domains.grant, ...inputs]) : null;
};

/** Poseidon(DOM_PK, secret). Possession commitment, not a signature. */
export const identityCommitment = (secret: bigint): bigint | null =>
  validField(secret) ? poseidon2([domains.pk, secret]) : null;

/** Poseidon(DOM_NODE, left, right). The only parent hash in both trees. */
export const nodeHash = (left: bigint, right: bigint): bigint | null =>
  validField(left) && validField(right)
    ? poseidon3([domains.node, left, right])
    : null;

/** Poseidon(DOM_REQ, toolId, ..., epoch): the in-circuit request digest. */
export const requestDigest = (value: Request): bigint | null => {
  const inputs = [
    value.toolId,
    value.resourceId,
    value.actionId,
    value.paramsHashLo,
    value.paramsHashHi,
    value.amount,
    value.challenge,
    value.audience,
    value.sessionHash,
    value.asOf,
    value.epoch,
  ];
  return inputs.every(validField) ? poseidon12([domains.req, ...inputs]) : null;
};

/** Poseidon(DOM_BIND, secret, digest): the public binding tag. */
export const bindTag = (secret: bigint, digest: bigint): bigint | null =>
  validField(secret) && validField(digest)
    ? poseidon3([domains.bind, secret, digest])
    : null;

/** Poseidon(DOM_NULL, secret, epoch, challenge): the per-challenge nullifier. */
export const nullifier = (secret: bigint, epoch: bigint, challenge: bigint): bigint | null =>
  validField(secret) && validField(epoch) && validField(challenge)
    ? poseidon4([domains.null, secret, epoch, challenge])
    : null;

/**
 * Frozen public-signal order. Index 0-1 are proof outputs (established
 * cryptographically); 2-15 are verifier-assembled inputs. The adapter tests
 * assert this order against the compiled artifact.
 */
export const signalNames = [
  "bindTag",
  "nullifier",
  "memberRoot",
  "grantRoot",
  "epoch",
  "asOf",
  "toolId",
  "resourceId",
  "actionId",
  "paramsHashLo",
  "paramsHashHi",
  "amount",
  "challenge",
  "audience",
  "sessionHash",
  "idCommitment",
] as const;

export type SignalName = (typeof signalNames)[number];
