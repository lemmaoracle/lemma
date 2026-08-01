import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { poseidon1, poseidon3, poseidon5 } from "poseidon-lite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.resolve(__dirname, "../build");
const WASM = path.join(
  BUILD_DIR,
  "org-identity_js",
  "org-identity.wasm",
);

// ── BN254 field prime ───────────────────────────────────────────────

const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

// ── toScalar: same as @lemmaoracle/sdk commitments.toScalar ─────────

const toScalar = (value: string | number): bigint =>
  typeof value === "number"
    ? BigInt(value) % BN254_PRIME
    : /^\d+$/.test(value)
      ? BigInt(value) % BN254_PRIME
      : BigInt(`0x${createHash("sha256").update(value).digest("hex")}`) %
        BN254_PRIME;

// ── Circuit build detection ─────────────────────────────────────────

const circuitBuilt = fs.existsSync(WASM);

// ── Witness computation via snarkjs ─────────────────────────────────

type CircuitSignals = Readonly<Record<string, string | bigint>>;

const calculateWitness = async (
  input: CircuitSignals,
): Promise<string[]> => {
  const { wtns } = await import("snarkjs");
  const wtnsPath = path.join(BUILD_DIR, "test-witness-org-identity.wtns");

  const bigIntInput = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k, BigInt(v as string | bigint)]),
  );

  await wtns.calculate(bigIntInput, WASM, wtnsPath);

  const wtnsJson = await wtns.exportJson(wtnsPath);
  fs.unlinkSync(wtnsPath);
  return wtnsJson.map((v: bigint) => v.toString());
};

// ── Witness builder using real Poseidon hashes ──────────────────────

const buildValidInput = (
  overrides: Partial<{
    orgSecret: bigint;
    orgDid: bigint;
    memberRoot: bigint;
    domain: bigint;
    timestamp: bigint;
    signatureR: bigint;
    signatureS: bigint;
    orgSalt: bigint;
    commitmentHash: bigint;
  }> = {},
): CircuitSignals => {
  const orgSecret = overrides.orgSecret ?? toScalar("org-secret-test-key");
  const orgDid = overrides.orgDid ?? poseidon1([orgSecret]);
  const memberRoot =
    overrides.memberRoot ?? toScalar("member-root-test-value");
  const domain = overrides.domain ?? toScalar("frame00.com");
  const timestamp = overrides.timestamp ?? BigInt(1_700_000_000);
  const signatureR =
    overrides.signatureR ?? toScalar("signature-r-randomness");
  const orgSalt = overrides.orgSalt ?? toScalar("org-salt-blinding");

  const message = poseidon3([memberRoot, domain, timestamp]);
  const signatureS =
    overrides.signatureS ?? poseidon3([orgSecret, message, signatureR]);
  const commitmentHash =
    overrides.commitmentHash ??
    poseidon5([orgDid, memberRoot, domain, timestamp, orgSalt]);

  return {
    orgSecret: orgSecret.toString(),
    orgSalt: orgSalt.toString(),
    commitmentHash: commitmentHash.toString(),
    orgDid: orgDid.toString(),
    memberRoot: memberRoot.toString(),
    domain: domain.toString(),
    timestamp: timestamp.toString(),
    signatureR: signatureR.toString(),
    signatureS: signatureS.toString(),
  };
};

// ── Proof generation helper ─────────────────────────────────────────

const generateProof = async (input: CircuitSignals) => {
  const witness = await calculateWitness(input);
  const { groth16 } = await import("snarkjs");

  const zkeyPath = path.join(BUILD_DIR, "org-identity_final.zkey");
  const wasmPath = path.join(
    BUILD_DIR,
    "org-identity_js",
    "org-identity.wasm",
  );

  const bigIntInput = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k, BigInt(v as string | bigint)]),
  );

  const { proof, publicSignals } = await groth16.fullProve(
    bigIntInput,
    wasmPath,
    zkeyPath,
  );

  const vkeyPath = path.join(BUILD_DIR, "org-identity_vkey.json");
  const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));

  const isValid = await groth16.verify(vkey, publicSignals, proof);

  return { witness, proof, publicSignals, isValid };
};

// ── Tests ───────────────────────────────────────────────────────────

describe.runIf(circuitBuilt)("org-identity circuit build artifacts", () => {
  it("R1CS file exists", () => {
    expect(
      fs.existsSync(path.join(BUILD_DIR, "org-identity.r1cs")),
    ).toBe(true);
  });

  it("WASM file exists", () => {
    expect(fs.existsSync(WASM)).toBe(true);
  });

  it("zkey file exists", () => {
    expect(
      fs.existsSync(path.join(BUILD_DIR, "org-identity_final.zkey")),
    ).toBe(true);
  });

  it("verification key has correct structure", () => {
    const vkeyPath = path.join(BUILD_DIR, "org-identity_vkey.json");
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));
    expect(vkey.protocol).toBe("groth16");
    expect(vkey.curve).toBe("bn128");
    // IC: 1 constant + 7 public inputs = 8
    expect(vkey.IC.length).toBe(8);
  });
});

describe.runIf(circuitBuilt)(
  "org-identity circuit constraints (circuit ID: org-identity-v1)",
  () => {
    it("accepts a valid org-identity proof", async () => {
      const input = buildValidInput();
      const witness = await calculateWitness(input);
      expect(witness).toBeDefined();
      expect(witness.length).toBeGreaterThan(0);
    }, 60000);

    it("produces correct public signals in witness", async () => {
      const input = buildValidInput();
      const witness = await calculateWitness(input);
      // witness[0]=1, then public inputs in declaration order
      expect(witness[1]).toBe(input.commitmentHash.toString());
      expect(witness[2]).toBe(input.orgDid.toString());
      expect(witness[3]).toBe(input.memberRoot.toString());
      expect(witness[4]).toBe(input.domain.toString());
      expect(witness[5]).toBe(input.timestamp.toString());
      expect(witness[6]).toBe(input.signatureR.toString());
      expect(witness[7]).toBe(input.signatureS.toString());
    }, 60000);

    it("rejects an invalid orgSecret (wrong pk)", async () => {
      const input = buildValidInput({
        orgSecret: toScalar("wrong-org-secret"),
        // Keep original orgDid / signature from a different secret → pk fails
        orgDid: poseidon1([toScalar("org-secret-test-key")]),
      });
      await expect(calculateWitness(input)).rejects.toThrow();
    }, 60000);

    it("rejects an invalid memberRoot", async () => {
      // Tamper memberRoot while keeping the original signature/commitment —
      // message mismatch → signature (and commitment) invalid.
      const valid = buildValidInput();
      const tampered = {
        ...valid,
        memberRoot: toScalar("tampered-member-root").toString(),
      };
      await expect(calculateWitness(tampered)).rejects.toThrow();
    }, 60000);

    it("rejects an invalid domain", async () => {
      const valid = buildValidInput();
      const tampered = {
        ...valid,
        domain: toScalar("evil.example.com").toString(),
      };
      await expect(calculateWitness(tampered)).rejects.toThrow();
    }, 60000);

    it("rejects an invalid signature", async () => {
      const input = buildValidInput({
        signatureS: toScalar("bogus-signature-s"),
      });
      await expect(calculateWitness(input)).rejects.toThrow();
    }, 60000);

    it("generates and verifies a valid Groth16 proof", async () => {
      const input = buildValidInput();
      const result = await generateProof(input);
      expect(result.isValid).toBe(true);
      expect(result.proof).toBeDefined();
      expect(result.publicSignals.length).toBe(7);
      expect(result.publicSignals[0]).toBe(input.commitmentHash.toString());
      expect(result.publicSignals[1]).toBe(input.orgDid.toString());
      expect(result.publicSignals[2]).toBe(input.memberRoot.toString());
      expect(result.publicSignals[3]).toBe(input.domain.toString());
      expect(result.publicSignals[4]).toBe(input.timestamp.toString());
      expect(result.publicSignals[5]).toBe(input.signatureR.toString());
      expect(result.publicSignals[6]).toBe(input.signatureS.toString());
    }, 120000);
  },
);

describe.runIf(!circuitBuilt)("org-identity circuit (not built)", () => {
  it("is skipped until the circuit is compiled", () => {
    expect(circuitBuilt).toBe(false);
  });
});
