/**
 * Prover input + real-proof tests for the script path
 * (`scripts/prove-account-change.ts`).
 *
 * The pure cases pin the gate/bundle cross-checks and the 18-signal
 * layout; the proving case runs only when the circuit is built (same
 * skip guard as the circuit suite) and checks that a proof made from
 * the committed demo bundle verifies against the built vkey.
 */
import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { groth16 } from "snarkjs";
import { poseidon1 } from "poseidon-lite";
import {
  SIGNAL,
  SIGNALS_LENGTH,
  buildProverInput,
  displayedRefOf,
  gateViewOf,
  scalarOf,
  type DemoVendorBundle,
  type GateCardView,
} from "../src/prover.js";

const PKG_ROOT = path.resolve(import.meta.dirname, "..", "..");
const BUILD_DIR = path.resolve(import.meta.dirname, "..", "build");
const WASM_PATH = path.join(BUILD_DIR, "account-change_js", "account-change.wasm");
const ZKEY_PATH = path.join(BUILD_DIR, "account-change_final.zkey");
const VKEY_PATH = path.join(BUILD_DIR, "account-change_vkey.json");
const circuitBuilt =
  fs.existsSync(VKEY_PATH) && fs.existsSync(WASM_PATH) && fs.existsSync(ZKEY_PATH);

const bundle = JSON.parse(
  fs.readFileSync(path.join(PKG_ROOT, "demo-vendor.example.json"), "utf8"),
) as DemoVendorBundle;

const RECEIVED_AT = 1795000000;
const ISSUED_AT = 1795000100;
const EXPIRES_AT = 1795100000;

const gate = (over: Partial<GateCardView> = {}): GateCardView => ({
  circuitId: "account-change-v1",
  registryRoot: bundle.registryRoot,
  vendorId: bundle.vendorId,
  requiredRoleHash: bundle.requiredRoleHash,
  audience: "clubs-gate",
  policy: "proof-gate-v1",
  requestCanonical: [
    "account-change-v1",
    "audience:clubs-gate",
    "case:月末振込手続き",
    "run:11月分",
    `receivedAt:${RECEIVED_AT}`,
  ].join("\n"),
  requestReceivedAt: RECEIVED_AT,
  challengeId: "12345678901234567890",
  challengeIssuedAt: ISSUED_AT,
  challengeExpiresAt: EXPIRES_AT,
  isFirst: 0,
  oldAccountHash: bundle.oldAccountHash,
  ...over,
});

const account = {
  bankCode: "0001",
  branchCode: "002",
  accountType: "1",
  accountNumber: "7654321",
};

const build = (over: Partial<GateCardView> = {}, evidence = "DEMO123") =>
  buildProverInput({
    bundle,
    gate: gate(over),
    account,
    bankEvidenceText: evidence,
  });

describe("gateViewOf", () => {
  it("GET /api/gate-card の形（card.gate）を読む", () => {
    const view = gateViewOf({
      ok: true,
      card: {
        payeeName: "Demo Vendor K.K.",
        gate: {
          circuitId: "account-change-v1",
          registryRoot: bundle.registryRoot,
          vendorId: bundle.vendorId,
          requiredRoleHash: bundle.requiredRoleHash,
          audience: "clubs-gate",
          policy: "proof-gate-v1",
          requestCanonical: "x",
          requestReceivedAt: RECEIVED_AT,
          challengeId: "99",
          challengeIssuedAt: ISSUED_AT,
          challengeExpiresAt: EXPIRES_AT,
          isFirst: 0,
        },
      },
    });
    expect(view).toMatchObject({
      circuitId: "account-change-v1",
      registryRoot: bundle.registryRoot,
      challengeId: "99",
      isFirst: 0,
    });
  });

  it("素の gate と raw の記録（oldAccountHash・requestDigest つき）を読む", () => {
    const view = gateViewOf({
      ...gate(),
      ref: "abc123",
      requestDigest: "42",
    });
    expect(view.ref).toBe("abc123");
    expect(view.requestDigest).toBe("42");
    expect(view.oldAccountHash).toBe(bundle.oldAccountHash);
    expect(view.isFirst).toBe(0);
    expect(() => gateViewOf({ ...gate(), isFirst: "yes" })).toThrow(/isFirst/);
  });
});

describe("displayedRefOf（提出ページの照合番号と同じ）", () => {
  it("英数字だけ・10文字・大文字", () => {
    expect(displayedRefOf("Zm9vYmFyYmF6-_")).toBe("ZM9VYMFYYM");
    expect(displayedRefOf("a-b_c.d")).toBe("ABCD");
  });
});

describe("buildProverInput", () => {
  it("18本の信号を契約の並びで作り、bundle の導出と一致する", () => {
    const out = build();
    expect(out.expectedPublicSignals).toHaveLength(SIGNALS_LENGTH);
    expect(out.expectedPublicSignals[SIGNAL.registryRoot]).toBe(bundle.registryRoot);
    expect(out.expectedPublicSignals[SIGNAL.vendorId]).toBe(bundle.vendorId);
    expect(out.expectedPublicSignals[SIGNAL.requiredRoleHash]).toBe(bundle.requiredRoleHash);
    expect(out.expectedPublicSignals[SIGNAL.oldAccountHash]).toBe(bundle.oldAccountHash);
    expect(out.expectedPublicSignals[SIGNAL.isFirst]).toBe("0");
    expect(BigInt(out.expectedPublicSignals[SIGNAL.newAccountHash]!)).not.toBe(0n);
    expect(BigInt(out.expectedPublicSignals[SIGNAL.nullifier]!)).not.toBe(0n);
    expect(out.expectedPublicSignals[SIGNAL.bankEvidenceHash]).toBe(
      out.derivation.bankEvidenceHash,
    );
    /* witness の口座は新しい口座そのもの（gate の newAccountHash に入る）。 */
    expect(out.input.accountNumber).toBe("7654321");
    expect(out.input.newAccountHash).toBe(out.expectedPublicSignals[SIGNAL.newAccountHash]);
    /* holder の束ね（新しい口座も登録された法定名） */
    expect(out.input.holderNameHash).toBe(out.derivation.legalNameHash);
  });

  it("照合番号を既定の証跡にする（ページと同じ対応）", () => {
    const ref = "AbCdEfGhIjKl";
    const out = buildProverInput({
      bundle,
      gate: gate(),
      account,
      bankEvidenceText: displayedRefOf(ref),
    });
    expect(out.derivation.bankEvidenceHash).toBe(scalarOf(displayedRefOf(ref)).toString());
    /* 同じ文字なら同じ・違う文字なら違う（同じ対応関係を保つ）。 */
    const again = buildProverInput({
      bundle,
      gate: gate(),
      account,
      bankEvidenceText: displayedRefOf(ref),
    });
    expect(again.derivation.bankEvidenceHash).toBe(out.derivation.bankEvidenceHash);
    const other = buildProverInput({
      bundle,
      gate: gate(),
      account,
      bankEvidenceText: displayedRefOf("ffffffffffff"),
    });
    expect(other.derivation.bankEvidenceHash).not.toBe(out.derivation.bankEvidenceHash);
  });

  it("再 seed で registryRoot が変わったら、手順つきで止まる", () => {
    expect(() => build({ registryRoot: "1" })).toThrow(/registryRoot mismatch/);
    expect(() => build({ vendorId: "1" })).toThrow(/vendorId mismatch/);
  });

  it("role が account-change でなければ止まる", () => {
    const otherRole = poseidon1([123n]).toString();
    expect(() =>
      buildProverInput({
        bundle: {
          ...bundle,
          requiredRoleHash: otherRole,
        },
        gate: gate({ requiredRoleHash: otherRole }),
        account,
        bankEvidenceText: "x",
      }),
    ).toThrow(/does not match the gate's requiredRoleHash/);
  });

  it("isFirst が口座の有無と食い違えば止まる", () => {
    expect(() => build({ isFirst: 1 })).toThrow(/isFirst/);
  });

  it("第三者名義の口座は作れない（holder binding）", () => {
    expect(() =>
      buildProverInput({
        bundle,
        gate: gate(),
        account: { ...account, holderName: "Third Party Ltd." },
        bankEvidenceText: "x",
      }),
    ).toThrow(/registered legal name/);
  });

  it("bundle の oldAccountHash が手で書き換えられていたら止まる", () => {
    expect(() =>
      buildProverInput({
        bundle: { ...bundle, oldAccountHash: "1" },
        gate: gate({ oldAccountHash: "1" }),
        account,
        bankEvidenceText: "x",
      }),
    ).toThrow(/oldAccountHash does not match/);
  });

  it("証跡もハッシュも無ければ止まる", () => {
    expect(() => buildProverInput({ bundle, gate: gate(), account })).toThrow(/bankEvidence/);
  });
});

describe.runIf(circuitBuilt)("real proof (built circuit)", () => {
  let vkey: object;

  beforeAll(() => {
    vkey = JSON.parse(fs.readFileSync(VKEY_PATH, "utf8")) as object;
  }, 30000);

  it("デモの束から実 Groth16 証明を作り、vkey で通り、信号が導出と一致する", async () => {
    const out = build();
    const { proof, publicSignals } = await groth16.fullProve(out.input, WASM_PATH, ZKEY_PATH);
    expect(publicSignals).toHaveLength(SIGNALS_LENGTH);
    expect(publicSignals).toEqual(out.expectedPublicSignals);
    expect(await groth16.verify(vkey, publicSignals, proof)).toBe(true);

    /* 信号を1本崩すと通らない（照合の前提）。 */
    for (const i of [SIGNAL.audienceHash, SIGNAL.requestDigest, SIGNAL.bankEvidenceHash]) {
      const tampered = [...publicSignals];
      tampered[i] = (BigInt(tampered[i] as string) + 1n).toString();
      expect(await groth16.verify(vkey, tampered, proof)).toBe(false);
    }
  }, 60000);
});

describe.runIf(!circuitBuilt)("real proof (circuit not built)", () => {
  it("ビルドが無ければ飛ばす", () => {
    expect(circuitBuilt).toBe(false);
  });
});
