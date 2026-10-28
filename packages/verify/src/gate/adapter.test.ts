import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { poseidon2, poseidon3, poseidon4, poseidon8, poseidon12 } from "poseidon-lite";
import { signals, witness } from "./adapter.js";
import type { Grant, Request, Snapshot } from "./scheme.js";
import {
  bindTag,
  circuitId,
  domains,
  emptySlot,
  field,
  grantDepth,
  grantLeaf,
  identityCommitment,
  limbBits,
  memberDepth,
  memberLeaf,
  nullifier,
  requestDigest,
  signalNames,
  tsBits,
  validBits,
  validField,
} from "./scheme.js";
import { grantHolds, grantTree, memberHolds, memberTree } from "./tree.js";

const sha = BigInt(`0x${createHash("sha256").update("agent-gate-v1:test-request:v1").digest("hex")}`);
const paramsHashLo = sha % 2n ** 128n;
const paramsHashHi = sha >> 128n;

const secret = 424242n;
const roleId = 7n;
const grant: Grant = {
  roleId,
  toolId: 11n,
  resourceId: 22n,
  actionId: 33n,
  maxPerAction: 1000n,
  startTs: 1700000000n,
  endTs: 1800000000n,
};
const request: Request = {
  toolId: 11n,
  resourceId: 22n,
  actionId: 33n,
  paramsHashLo,
  paramsHashHi,
  amount: 250n,
  challenge: 999n,
  audience: 555n,
  sessionHash: 777n,
  asOf: 1750000000n,
  epoch: 7n,
};

const unwrap = <T>(result: Readonly<{ ok: true; value: T } | { ok: false; reason: string }>): T => {
  if (!result.ok) throw new Error(result.reason);
  return result.value;
};

const commitment = identityCommitment(secret);
if (commitment === null) throw new Error("fixture secret invalid");

const buildTrees = () => {
  const other1 = memberLeaf({ idCommitment: identityCommitment(111n) as bigint, roleId: 7n }) as bigint;
  const other2 = memberLeaf({ idCommitment: identityCommitment(222n) as bigint, roleId: 9n }) as bigint;
  const oursM = memberLeaf({ idCommitment: commitment, roleId }) as bigint;
  const members = unwrap(memberTree([other1, other2, oursM, emptySlot]));
  const otherG = grantLeaf({
    roleId: 9n,
    toolId: 44n,
    resourceId: 55n,
    actionId: 66n,
    maxPerAction: 500n,
    startTs: 1700000000n,
    endTs: 1800000000n,
  }) as bigint;
  const oursG = grantLeaf(grant) as bigint;
  const grants = unwrap(grantTree([otherG, oursG]));
  return { members, grants, oursM, oursG };
};

describe("scheme constants", () => {
  it("pins circuit id, field, depths, widths, domains, and signal order", () => {
    expect(circuitId).toBe("agent-gate-v1");
    expect(field.toString()).toBe(
      "21888242871839275222246405745257275088548364400416034343698204186575808495617",
    );
    expect(memberDepth).toBe(20);
    expect(grantDepth).toBe(20);
    expect(tsBits).toBe(64);
    expect(limbBits).toBe(128);
    expect(emptySlot).toBe(0n);
    expect(domains).toEqual({ member: 101n, grant: 102n, node: 103n, pk: 104n, req: 105n, bind: 106n, null: 107n });
    expect(new Set(Object.values(domains)).size).toBe(7);
    expect(signalNames).toEqual([
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
    ]);
  });
});

describe("pinned hash vectors", () => {
  it("pins the params split, leaves, digest, tag, and nullifier", () => {
    expect(paramsHashLo.toString()).toBe("209800699086029037986548463725964356431");
    expect(paramsHashHi.toString()).toBe("37971065662745122989460770272167693035");
    expect(commitment.toString()).toBe(
      "4172497492455125118752747520903446969766274194756448568678789201204724613168",
    );
    expect(memberLeaf({ idCommitment: commitment, roleId })?.toString()).toBe(
      "13624899162657592263677291287982708740399567014345123584951403499740915247021",
    );
    expect(grantLeaf(grant)?.toString()).toBe(
      "3880925119460343469225375338819345894963851221425056044777604433204895041217",
    );
    const digest = requestDigest(request) as bigint;
    expect(digest.toString()).toBe(
      "9845252353831911363783462475168430057797865510722713737117725270409687200024",
    );
    expect(bindTag(secret, digest)?.toString()).toBe(
      "12792279595247724186014361326072535044332177295254815378331153304830905021644",
    );
    expect(nullifier(secret, 7n, 999n)?.toString()).toBe(
      "7274398373095283110195995891720199914782677890110807357879338211010258086782",
    );
  });

  it("uses the documented preimage order and domains", () => {
    expect(commitment).toBe(poseidon2([104n, secret]));
    expect(memberLeaf({ idCommitment: commitment, roleId })).toBe(
      poseidon3([101n, commitment, roleId]),
    );
    expect(grantLeaf(grant)).toBe(
      poseidon8([102n, 7n, 11n, 22n, 33n, 1000n, 1700000000n, 1800000000n]),
    );
    expect(requestDigest(request)).toBe(
      poseidon12([105n, 11n, 22n, 33n, paramsHashLo, paramsHashHi, 250n, 999n, 555n, 777n, 1750000000n, 7n]),
    );
    // Field swap changes every hash: order is load-bearing, not cosmetic.
    expect(memberLeaf({ idCommitment: roleId, roleId: commitment })).not.toBe(
      memberLeaf({ idCommitment: commitment, roleId }),
    );
    expect(grantLeaf({ ...grant, toolId: grant.actionId, actionId: grant.toolId })).not.toBe(
      grantLeaf(grant),
    );
  });

  it("rejects invalid fields without reduction", () => {
    for (const bad of [-1n, field, field + 1n, "7" as unknown as bigint]) {
      expect(identityCommitment(bad)).toBeNull();
      expect(memberLeaf({ idCommitment: bad, roleId })).toBeNull();
      expect(grantLeaf({ ...grant, roleId: bad })).toBeNull();
      expect(requestDigest({ ...request, amount: bad })).toBeNull();
      expect(bindTag(bad, 1n)).toBeNull();
      expect(nullifier(secret, bad, 999n)).toBeNull();
    }
    expect(validField(0n)).toBe(true);
    expect(validField(field - 1n)).toBe(true);
    expect(validBits(2n ** 64n - 1n, 64)).toBe(true);
    expect(validBits(2n ** 64n, 64)).toBe(false);
    expect(validBits(2n ** 128n - 1n, 128)).toBe(true);
    expect(validBits(2n ** 128n, 128)).toBe(false);
  });
});

describe("trees", () => {
  it("pins fixture roots and proves allocated paths", () => {
    const { members, grants, oursM, oursG } = buildTrees();
    expect(members.root.toString()).toBe(
      "12273098697282735064312310680224093577398930893297221530137973081504482781147",
    );
    expect(grants.root.toString()).toBe(
      "6716707368496487806296259613439856602201261470065020722465861165364373210976",
    );
    const mPath = unwrap(members.path(2));
    const gPath = unwrap(grants.path(1));
    expect(mPath.siblings).toHaveLength(20);
    expect(mPath.directions).toHaveLength(20);
    expect(memberHolds(oursM, mPath, members.root)).toBe(true);
    expect(grantHolds(oursG, gPath, grants.root)).toBe(true);
    // Positions decode from direction bits, leaf to root.
    expect(mPath.directions.reduce<number>((pos, bit, i) => pos + bit * 2 ** i, 0)).toBe(2);
    expect(gPath.directions.reduce<number>((pos, bit, i) => pos + bit * 2 ** i, 0)).toBe(1);
    // Recompute independently with the domain-separated parent.
    const folded = mPath.siblings.reduce(
      (node, sibling, i) =>
        poseidon3([103n, ...(mPath.directions[i] === 0 ? [node, sibling] : [sibling, node])]),
      oursM,
    );
    expect(folded).toBe(members.root);
  });

  it("keeps positions stable and rejects stale or foreign paths", () => {
    const { members, oursM } = buildTrees();
    const grown = unwrap(memberTree([oursM, emptySlot]));
    // Same index, same direction bits: positions are index-derived, tree-independent.
    expect(unwrap(members.path(0)).directions).toEqual(unwrap(grown.path(0)).directions);
    expect(members.root).not.toBe(grown.root);
    expect(memberHolds(oursM, unwrap(grown.path(0)), members.root)).toBe(false);
    const mPath = unwrap(members.path(2));
    expect(memberHolds(oursM + 1n, mPath, members.root)).toBe(false);
    expect(memberHolds(oursM, { ...mPath, directions: [...mPath.directions.slice(0, 19), 1] as (0 | 1)[] }, members.root)).toBe(false);
    expect(members.path(4).ok).toBe(false);
    expect(memberTree([field]).ok).toBe(false);
  });

  it("treats slot 0 as revocable-but-unprovable", () => {
    const { members } = buildTrees();
    const revoked = unwrap(members.path(3));
    // Pure inclusion can hold for 0 (it IS the slot value)...
    expect(memberHolds(emptySlot, revoked, members.root)).toBe(true);
    // ...but the witness adapter must refuse it (and the circuit rejects it too).
    const snapshot: Snapshot = { memberRoot: members.root, grantRoot: 1n, epoch: 7n };
    const out = witness({
      snapshot,
      agentSecret: secret,
      roleId,
      grant: { ...grant, roleId },
      memberPath: revoked,
      grantPath: revoked,
      request,
    });
    expect(out.ok).toBe(false);
  });
});

describe("witness adapter", () => {
  const validInput = () => {
    const { members, grants } = buildTrees();
    return {
      snapshot: { memberRoot: members.root, grantRoot: grants.root, epoch: 7n } as Snapshot,
      agentSecret: secret,
      roleId,
      grant,
      memberPath: unwrap(members.path(2)),
      grantPath: unwrap(grants.path(1)),
      request,
    };
  };

  it("builds the exact circuit witness record", () => {
    const out = unwrap(witness(validInput()));
    expect(Object.keys(out).sort()).toEqual(
      ["agentSecret", "grantPathElements", "grantPathIndices", "maxPerAction", "memberPathElements", "memberPathIndices", "roleId", "startTs", "endTs"].sort(),
    );
    expect(out.agentSecret).toBe(secret.toString());
    expect(out.roleId).toBe("7");
    expect(out.maxPerAction).toBe("1000");
    expect(out.memberPathElements).toHaveLength(20);
    expect(out.memberPathIndices).toHaveLength(20);
    expect(out.grantPathElements).toHaveLength(20);
    expect(out.grantPathIndices).toHaveLength(20);
  });

  it.each([
    ["role", { roleId: 9n }, "Role mismatch between member and grant"],
    ["scope-tool", { request: { ...request, toolId: 12n } }, "Request does not match grant scope"],
    ["scope-action", { request: { ...request, actionId: 34n } }, "Request does not match grant scope"],
    ["epoch", { request: { ...request, epoch: 8n } }, "Epoch mismatch between request and snapshot"],
    ["expired", { request: { ...request, asOf: 1900000000n } }, "Grant window does not cover asOf"],
    ["early", { request: { ...request, asOf: 1600000000n } }, "Grant window does not cover asOf"],
    ["over-limit", { request: { ...request, amount: 1001n } }, "Amount exceeds per-action limit"],
    ["limb", { request: { ...request, paramsHashLo: 2n ** 128n } }, "Invalid request fields"],
    ["asof-width", { request: { ...request, asOf: 2n ** 64n } }, "Invalid request fields"],
  ])("rejects %s with a stable reason", (_label, patch, reason) => {
    const out = witness({ ...validInput(), ...patch });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toBe(reason);
  });

  it("rejects foreign paths", () => {
    const input = validInput();
    const { members } = buildTrees();
    const foreign = unwrap(members.path(0));
    expect(witness({ ...input, memberPath: foreign }).ok).toBe(false);
    expect(witness({ ...input, grantPath: { siblings: input.grantPath.siblings, directions: input.memberPath.directions } }).ok).toBe(false);
  });
});

describe("signals adapter", () => {
  const validInput = () => {
    const { members, grants } = buildTrees();
    const digest = requestDigest(request) as bigint;
    return {
      snapshot: { memberRoot: members.root, grantRoot: grants.root, epoch: 7n } as Snapshot,
      expected: { ...request, idCommitment: commitment },
      outputs: { bindTag: bindTag(secret, digest) as bigint, nullifier: nullifier(secret, 7n, 999n) as bigint },
    };
  };

  it("emits 16 entries in frozen order", () => {
    const input = validInput();
    const out = unwrap(signals(input));
    expect(out).toHaveLength(16);
    expect(out).toEqual([
      input.outputs.bindTag.toString(),
      input.outputs.nullifier.toString(),
      input.snapshot.memberRoot.toString(),
      input.snapshot.grantRoot.toString(),
      "7",
      request.asOf.toString(),
      request.toolId.toString(),
      request.resourceId.toString(),
      request.actionId.toString(),
      request.paramsHashLo.toString(),
      request.paramsHashHi.toString(),
      request.amount.toString(),
      request.challenge.toString(),
      request.audience.toString(),
      request.sessionHash.toString(),
      commitment.toString(),
    ]);
  });

  it.each([
    ["snapshot", { snapshot: { memberRoot: field, grantRoot: 1n, epoch: 7n } }, "Invalid snapshot roots"],
    ["expected", { expected: { ...request, idCommitment: commitment, amount: 2n ** 64n } }, "Invalid expected signals"],
    ["epoch", { expected: { ...request, idCommitment: commitment, epoch: 8n } }, "Epoch mismatch between expected and snapshot"],
    ["outputs", { outputs: { bindTag: -1n, nullifier: 1n } }, "Invalid proof outputs"],
  ])("rejects %s with a stable reason", (_label, patch, reason) => {
    const out = signals({ ...validInput(), ...patch } as never);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toBe(reason);
  });
});

describe("malformed runtime gate inputs", () => {
  const valid = () => {
    const { members, grants, oursM, oursG } = buildTrees();
    const snapshot = { memberRoot: members.root, grantRoot: grants.root, epoch: 7n };
    const memberPath = unwrap(members.path(2));
    const grantPath = unwrap(grants.path(1));
    const witnessInput = { snapshot, agentSecret: secret, roleId, grant, memberPath, grantPath, request };
    const signalsInput = {
      snapshot,
      expected: { ...request, idCommitment: commitment },
      outputs: { bindTag: bindTag(secret, requestDigest(request) as bigint) as bigint, nullifier: nullifier(secret, 7n, 999n) as bigint },
    };
    return { witnessInput, signalsInput, oursM, oursG };
  };

  it.each([
    ["snapshot", { snapshot: null }, "Invalid snapshot roots"],
    ["request", { request: null }, "Invalid request fields"],
    ["grant", { grant: null }, "Invalid grant fields"],
    ["member path", { memberPath: null }, "Member path does not hold"],
    ["grant path", { grantPath: null }, "Grant path does not hold"],
    ["member siblings null", { memberPath: { siblings: null, directions: [] } }, "Member path does not hold"],
    ["member directions null", { memberPath: { siblings: [], directions: null } }, "Member path does not hold"],
    ["grant siblings non-array", { grantPath: { siblings: "bad", directions: [] } }, "Grant path does not hold"],
    ["grant directions array-like", { grantPath: { siblings: [], directions: { length: 20 } } }, "Grant path does not hold"],
  ])("witness rejects malformed %s without throwing", (_label, patch, reason) => {
    const out = witness({ ...valid().witnessInput, ...patch } as never);
    expect(out).toEqual({ ok: false, reason });
  });

  it.each([
    ["snapshot", { snapshot: null }, "Invalid snapshot roots"],
    ["expected", { expected: null }, "Invalid expected signals"],
    ["outputs", { outputs: null }, "Invalid proof outputs"],
    ["expected array", { expected: [] }, "Invalid expected signals"],
  ])("signals rejects malformed %s without throwing", (_label, patch, reason) => {
    const out = signals({ ...valid().signalsInput, ...patch } as never);
    expect(out).toEqual({ ok: false, reason });
  });

  it("inclusion rejects null, non-array, and array-like paths", () => {
    const { witnessInput, oursM, oursG } = valid();
    const badPaths = [
      null,
      { siblings: null, directions: [] },
      { siblings: [], directions: null },
      { siblings: "bad", directions: [] },
      { siblings: [], directions: { length: 20 } },
      { siblings: { length: 20 }, directions: witnessInput.memberPath.directions },
    ];
    for (const path of badPaths) {
      expect(memberHolds(oursM, path as never, witnessInput.snapshot.memberRoot)).toBe(false);
      expect(grantHolds(oursG, path as never, witnessInput.snapshot.grantRoot)).toBe(false);
    }
  });

  it("preserves the exact valid witness keys and public signal order", () => {
    const { witnessInput, signalsInput } = valid();
    const witnessOut = witness(witnessInput);
    const signalsOut = signals(signalsInput);
    expect(witnessOut.ok).toBe(true);
    expect(signalsOut.ok).toBe(true);
    if (witnessOut.ok) {
      expect(Object.keys(witnessOut.value).sort()).toEqual([
        "agentSecret", "roleId", "maxPerAction", "startTs", "endTs",
        "memberPathElements", "memberPathIndices", "grantPathElements", "grantPathIndices",
      ].sort());
    }
    if (signalsOut.ok) {
      expect(signalsOut.value).toEqual([
        signalsInput.outputs.bindTag, signalsInput.outputs.nullifier,
        signalsInput.snapshot.memberRoot, signalsInput.snapshot.grantRoot,
        signalsInput.snapshot.epoch, request.asOf, request.toolId, request.resourceId,
        request.actionId, request.paramsHashLo, request.paramsHashHi, request.amount,
        request.challenge, request.audience, request.sessionHash, commitment,
      ].map(String));
    }
  });
});
