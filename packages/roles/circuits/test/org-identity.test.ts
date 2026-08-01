import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { poseidon5 } from "poseidon-lite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.resolve(__dirname, "../build");
const WASM = path.join(BUILD_DIR, "org-identity_js", "org-identity.wasm");

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
    orgDid: bigint;
    memberRoot: bigint;
    domain: bigint;
    commitmentHash: bigint;
  }> = {},
): CircuitSignals => {
  const orgDid = overrides.orgDid ?? toScalar("did:web:frame00.com");
  const memberRoot =
    overrides.memberRoot ??
    toScalar("0x1a2b3c4d5e6f7890abcdef012345678901234567890abcdef012345678901234");
  const domain = overrides.domain ?? toScalar("frame00.com");
  const timestamp = BigInt(1714069800);
  const orgSalt = toScalar("org-identity-test-salt");

  const commitmentHash =
    overrides.commitmentHash ??
    poseidon5([orgDid, memberRoot, domain, timestamp, orgSalt]);

  return {
    orgSalt: orgSalt.toString(),
    commitmentHash: commitmentHash.toString(),
    orgDid: orgDid.toString(),
    memberRoot: memberRoot.toString(),
    domain: domain.toString(),
    timestamp: timestamp.toString(),
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
    expect(fs.existsSync(path.join(BUILD_DIR, "org-identity.r1cs"))).toBe(
      true,
    );
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
    // IC: 1 constant + 5 public inputs = 6
    expect(vkey.IC.length).toBe(6);
  });
});

describe.runIf(circuitBuilt)("org-identity circuit constraints", () => {
  it("accepts a valid org-identity commitment", async () => {
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
  }, 60000);

  it("rejects an invalid orgDid", async () => {
    // Keep commitmentHash from the valid binding; swap orgDid → constraint fails.
    const valid = buildValidInput();
    const tampered = {
      ...valid,
      orgDid: toScalar("did:web:attacker.example").toString(),
    };
    await expect(calculateWitness(tampered)).rejects.toThrow();
  }, 60000);

  it("rejects an invalid memberRoot", async () => {
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
      domain: toScalar("evil.example").toString(),
    };
    await expect(calculateWitness(tampered)).rejects.toThrow();
  }, 60000);

  it("generates and verifies a valid Groth16 proof", async () => {
    const input = buildValidInput();
    const result = await generateProof(input);
    expect(result.isValid).toBe(true);
    expect(result.proof).toBeDefined();
    expect(result.publicSignals.length).toBe(5);
    expect(result.publicSignals[0]).toBe(input.commitmentHash.toString());
    expect(result.publicSignals[1]).toBe(input.orgDid.toString());
    expect(result.publicSignals[2]).toBe(input.memberRoot.toString());
    expect(result.publicSignals[3]).toBe(input.domain.toString());
    expect(result.publicSignals[4]).toBe(input.timestamp.toString());
  }, 120000);
});

describe.runIf(!circuitBuilt)("org-identity circuit (not built)", () => {
  it("is skipped until the circuit is compiled", () => {
    expect(circuitBuilt).toBe(false);
  });
});
