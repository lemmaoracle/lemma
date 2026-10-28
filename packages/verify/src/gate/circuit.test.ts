import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { groth16 } from "snarkjs";
import { describe, expect, it } from "vitest";
import { signals, witness } from "./adapter.js";
import type { Grant, Request, Snapshot } from "./scheme.js";
import {
  bindTag,
  field,
  grantLeaf,
  identityCommitment,
  memberLeaf,
  nullifier,
  requestDigest,
  signalNames,
} from "./scheme.js";
import { grantHolds, grantTree, memberHolds, memberTree } from "./tree.js";

/**
 * Real Groth16 execution tests for agent-gate-v1. These drive the COMPILED
 * artifact (circuits/build/, development-only keys) through snarkjs fullProve
 * + verify: no mocks, no SHA fallback. Every negative case either breaks
 * witness generation (constraint unsatisfiable) or breaks verification
 * (tampered statement), and each is labeled with which layer rejects it.
 *
 * Prerequisite: packages/verify/circuits/scripts/build.sh (fails loudly below
 * when artifacts are missing so a skip can never masquerade as a pass).
 */

const BUILD = fileURLToPath(new URL("../../circuits/build/", import.meta.url));
const WASM = `${BUILD}/agent-gate-v1_js/agent-gate-v1.wasm`;
const ZKEY = `${BUILD}/agent-gate-v1_final.zkey`;
const VKEY = `${BUILD}/agent-gate-v1_vkey.json`;
const built = existsSync(WASM) && existsSync(ZKEY) && existsSync(VKEY);

const sha = (label: string): { lo: bigint; hi: bigint } => {
  const digest = BigInt(`0x${createHash("sha256").update(label).digest("hex")}`);
  return { lo: digest % 2n ** 128n, hi: digest >> 128n };
};

const secret = 424242n;
const roleId = 7n;
const epoch = 7n;
const grant: Grant = {
  roleId,
  toolId: 11n,
  resourceId: 22n,
  actionId: 33n,
  maxPerAction: 1000n,
  startTs: 1700000000n,
  endTs: 1800000000n,
};
const params = sha("agent-gate-v1:test-request:v1");
const request: Request = {
  toolId: 11n,
  resourceId: 22n,
  actionId: 33n,
  paramsHashLo: params.lo,
  paramsHashHi: params.hi,
  amount: 250n,
  challenge: 999n,
  audience: 555n,
  sessionHash: 777n,
  asOf: 1750000000n,
  epoch,
};

const unwrap = <T>(result: Readonly<{ ok: true; value: T } | { ok: false; reason: string }>): T => {
  if (!result.ok) throw new Error(result.reason);
  return result.value;
};

const fixture = () => {
  const commitment = identityCommitment(secret);
  if (commitment === null) throw new Error("fixture");
  const m1 = memberLeaf({ idCommitment: identityCommitment(111n) as bigint, roleId: 7n }) as bigint;
  const m2 = memberLeaf({ idCommitment: identityCommitment(222n) as bigint, roleId: 9n }) as bigint;
  const oursM = memberLeaf({ idCommitment: commitment, roleId }) as bigint;
  const members = unwrap(memberTree([m1, m2, oursM, 0n]));
  const g1 = grantLeaf({ ...grant, roleId: 9n, toolId: 44n }) as bigint;
  const oursG = grantLeaf(grant) as bigint;
  const grants = unwrap(grantTree([g1, oursG]));
  const memberPath = unwrap(members.path(2));
  const grantPath = unwrap(grants.path(1));
  const snapshot: Snapshot = { memberRoot: members.root, grantRoot: grants.root, epoch };
  if (!memberHolds(oursM, memberPath, snapshot.memberRoot)) throw new Error("fixture");
  if (!grantHolds(oursG, grantPath, snapshot.grantRoot)) throw new Error("fixture");
  const witnessRecord = unwrap(
    witness({ snapshot, agentSecret: secret, roleId, grant, memberPath, grantPath, request }),
  );
  const digest = requestDigest(request) as bigint;
  const outputs = {
    bindTag: bindTag(secret, digest) as bigint,
    nullifier: nullifier(secret, epoch, request.challenge) as bigint,
  };
  const expectedSignals = unwrap(signals({ snapshot, expected: { ...request, idCommitment: commitment }, outputs }));
  // fullProve needs the FULL assignment: 14 publics + 85 witness signals.
  const publicInput: Record<string, string> = {
    memberRoot: snapshot.memberRoot.toString(),
    grantRoot: snapshot.grantRoot.toString(),
    epoch: snapshot.epoch.toString(),
    asOf: request.asOf.toString(),
    toolId: request.toolId.toString(),
    resourceId: request.resourceId.toString(),
    actionId: request.actionId.toString(),
    paramsHashLo: request.paramsHashLo.toString(),
    paramsHashHi: request.paramsHashHi.toString(),
    amount: request.amount.toString(),
    challenge: request.challenge.toString(),
    audience: request.audience.toString(),
    sessionHash: request.sessionHash.toString(),
    idCommitment: commitment.toString(),
  };
  // JSON round-trip: proves the handoff shape is serializable AND yields the
  // mutable arrays @types/snarkjs demands (runtime values are identical).
  const proveInput = JSON.parse(JSON.stringify({ ...publicInput, ...witnessRecord }));
  return { snapshot, commitment, memberPath, grantPath, witnessRecord, proveInput, expectedSignals, outputs };
};

const PROVE_TIMEOUT = 180000;

describe("circuit artifacts", () => {
  it("are built (run circuits/scripts/build.sh first)", () => {
    expect(built, `missing Groth16 artifacts under ${BUILD}; run packages/verify/circuits/scripts/build.sh`).toBe(true);
  });
});

describe.runIf(built)("agent-gate-v1 Groth16 execution", () => {
  it("vkey pins groth16 with 16 publics (IC length 17)", () => {
    const vkey = JSON.parse(readFileSync(VKEY, "utf8"));
    expect(vkey.protocol).toBe("groth16");
    expect(vkey.nPublic).toBe(16);
    expect(vkey.IC).toHaveLength(17);
    expect(signalNames).toHaveLength(16);
  });

  it("proves and verifies a valid request; on-wire order matches the adapter", async () => {
    const { proveInput, expectedSignals } = fixture();
    const t0 = Date.now();
    const { proof, publicSignals } = await groth16.fullProve(proveInput, WASM, ZKEY);
    const proveMs = Date.now() - t0;
    expect(publicSignals.map(String)).toEqual([...expectedSignals]);
    const vkey = JSON.parse(readFileSync(VKEY, "utf8"));
    const v0 = Date.now();
    const ok = await groth16.verify(vkey, publicSignals, proof);
    const verifyMs = Date.now() - v0;
    expect(ok).toBe(true);
    console.log(`agent-gate-v1 valid prove=${proveMs}ms verify=${verifyMs}ms signals=${publicSignals.length}`);
  }, PROVE_TIMEOUT);

  it("rejects every single-signal mutation (all 16 positions load-bearing)", async () => {
    const { proveInput } = fixture();
    const vkey = JSON.parse(readFileSync(VKEY, "utf8"));
    const { proof, publicSignals } = await groth16.fullProve(proveInput, WASM, ZKEY);
    expect(publicSignals).toHaveLength(16);
    for (let i = 0; i < 16; i++) {
      const mutated = publicSignals.map((s: string, j: number) =>
        j === i ? ((BigInt(s) + 1n) % field).toString() : String(s),
      );
      const ok = await groth16.verify(vkey, mutated, proof);
      expect(ok, `signal[${i}] ${signalNames[i]} must be load-bearing`).toBe(false);
    }
  }, PROVE_TIMEOUT);

  it.each([
    ["wrong secret", (w: Record<string, unknown>) => ({ ...w, agentSecret: "424243" })],
    ["role mismatch", (w: Record<string, unknown>) => ({ ...w, roleId: "9" })],
    ["window shift", (w: Record<string, unknown>) => ({ ...w, startTs: "1750000001" })],
    ["limit shift", (w: Record<string, unknown>) => ({ ...w, maxPerAction: "1001" })],
    [
      "non-bit direction",
      (w: Record<string, unknown>) => ({
        ...w,
        memberPathIndices: [...(w.memberPathIndices as string[])].map((v, i) => (i === 0 ? "2" : v)),
      }),
    ],
    [
      "tampered sibling",
      (w: Record<string, unknown>) => ({
        ...w,
        grantPathElements: [...(w.grantPathElements as string[])].map((v, i) =>
          i === 0 ? ((BigInt(v) + 1n) % field).toString() : v,
        ),
      }),
    ],
  ])("SDK-bypassing witness fails to prove: %s", async (_label, tamper) => {
    const { proveInput } = fixture();
    // Pin the failure MODE: a template assertion (unsatisfiable constraint),
    // never an input-shape error (which would mean the test is vacuous).
    await expect(
      groth16.fullProve(tamper(proveInput as Record<string, unknown>), WASM, ZKEY),
    ).rejects.toThrow(/Error in template/);
  }, PROVE_TIMEOUT);

  it("consumer replay: proof for request A fails against verifier-assembled signals for B", async () => {
    const first = fixture();
    const vkey = JSON.parse(readFileSync(VKEY, "utf8"));
    const { proof, publicSignals } = await groth16.fullProve(first.proveInput, WASM, ZKEY);
    // Sanity: the proof DOES verify against its own verifier-assembled array,
    // which is exactly why the verifier must never accept a foreign array.
    expect(await groth16.verify(vkey, publicSignals, proof)).toBe(true);
    // Request B: same grant, different exact bytes + challenge + amount.
    const paramsB = sha("agent-gate-v1:test-request:v2-other-action");
    const requestB: Request = { ...request, paramsHashLo: paramsB.lo, paramsHashHi: paramsB.hi, amount: 300n, challenge: 1000n };
    const digestB = requestDigest(requestB) as bigint;
    const signalsB = unwrap(
      signals({
        snapshot: first.snapshot,
        expected: { ...requestB, idCommitment: first.commitment },
        outputs: first.outputs,
      }),
    );
    expect(await groth16.verify(vkey, [...signalsB], proof)).toBe(false);
    // And a FRESH proof for B verifies: the gate distinguishes, not just rejects.
    const witnessB = unwrap(
      witness({
        snapshot: first.snapshot,
        agentSecret: secret,
        roleId,
        grant,
        memberPath: first.memberPath,
        grantPath: first.grantPath,
        request: requestB,
      }),
    );
    const publicB = {
      memberRoot: first.snapshot.memberRoot.toString(),
      grantRoot: first.snapshot.grantRoot.toString(),
      epoch: first.snapshot.epoch.toString(),
      asOf: requestB.asOf.toString(),
      toolId: requestB.toolId.toString(),
      resourceId: requestB.resourceId.toString(),
      actionId: requestB.actionId.toString(),
      paramsHashLo: requestB.paramsHashLo.toString(),
      paramsHashHi: requestB.paramsHashHi.toString(),
      amount: requestB.amount.toString(),
      challenge: requestB.challenge.toString(),
      audience: requestB.audience.toString(),
      sessionHash: requestB.sessionHash.toString(),
      idCommitment: first.commitment.toString(),
    };
    const fresh = await groth16.fullProve(JSON.parse(JSON.stringify({ ...publicB, ...witnessB })), WASM, ZKEY);
    const outputsB = {
      bindTag: bindTag(secret, digestB) as bigint,
      nullifier: nullifier(secret, epoch, requestB.challenge) as bigint,
    };
    const expectedB = unwrap(
      signals({ snapshot: first.snapshot, expected: { ...requestB, idCommitment: first.commitment }, outputs: outputsB }),
    );
    expect(fresh.publicSignals.map(String)).toEqual([...expectedB]);
    expect(await groth16.verify(vkey, fresh.publicSignals, fresh.proof)).toBe(true);
    expect(outputsB.nullifier).not.toBe(first.outputs.nullifier);
  }, PROVE_TIMEOUT);
});
