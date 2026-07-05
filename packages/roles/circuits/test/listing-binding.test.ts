import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { poseidon5 } from "poseidon-lite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.resolve(__dirname, "../build");
const WASM = path.join(BUILD_DIR, "listing-binding_js", "listing-binding.wasm");

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
  const wtnsPath = path.join(BUILD_DIR, "test-witness.wtns");

  const bigIntInput = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k, BigInt(v)]),
  );

  await wtns.calculate(bigIntInput, WASM, wtnsPath);

  const wtnsJson = await wtns.exportJson(wtnsPath);
  fs.unlinkSync(wtnsPath);
  return wtnsJson.map((v: bigint) => v.toString());
};

// ── Witness builder using real Poseidon5 hash ───────────────────────

const buildValidInput = (): CircuitSignals => {
  // Schema identifier: hash of schema name "blog-article-v1"
  const schemaId = toScalar("blog-article-v1");

  // Per-schema commitment: a representative Poseidon commitment from blog-article-v1
  const perSchemaCommitment = toScalar(
    "0x1a2b3c4d5e6f7890abcdef012345678901234567890abcdef01234567890123456",
  );

  // Price in USDC smallest unit (6 decimals): $42.00 = 42000000
  const priceUsdc = toScalar(42000000);

  // Seller identifier (private) — a DID (Decentralized Identifier)
  const did = toScalar("did:example:alice-402");

  // Binding randomness (private)
  const salt = toScalar("listing-binding-test-salt");

  // listingRoot = Poseidon5(schemaId, perSchemaCommitment, priceUsdc, did, salt)
  const listingRoot = poseidon5([
    schemaId,
    perSchemaCommitment,
    priceUsdc,
    did,
    salt,
  ]);

  return {
    did: did.toString(),
    salt: salt.toString(),
    listingRoot: listingRoot.toString(),
    perSchemaCommitment: perSchemaCommitment.toString(),
    schemaId: schemaId.toString(),
    priceUsdc: priceUsdc.toString(),
  };
};

// ── Proof generation helper ─────────────────────────────────────────

const generateProof = async (input: CircuitSignals) => {
  const witness = await calculateWitness(input);
  const { groth16 } = await import("snarkjs");

  const zkeyPath = path.join(BUILD_DIR, "listing-binding_final.zkey");
  const wasmPath = path.join(
    BUILD_DIR,
    "listing-binding_js",
    "listing-binding.wasm",
  );

  const { proof, publicSignals } = await groth16.fullProve(
    Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, BigInt(v)]),
    ),
    wasmPath,
    zkeyPath,
  );

  const vkeyPath = path.join(BUILD_DIR, "listing-binding_vkey.json");
  const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));

  const isValid = await groth16.verify(vkey, publicSignals, proof);

  return { witness, proof, publicSignals, isValid };
};

// ── Tests ───────────────────────────────────────────────────────────

describe("circuit build artifacts", () => {
  it("R1CS file exists", () => {
    expect(fs.existsSync(path.join(BUILD_DIR, "listing-binding.r1cs"))).toBe(
      true,
    );
  });

  it("WASM file exists", () => {
    expect(
      fs.existsSync(
        path.join(BUILD_DIR, "listing-binding_js", "listing-binding.wasm"),
      ),
    ).toBe(true);
  });

  it("zkey file exists", () => {
    expect(
      fs.existsSync(path.join(BUILD_DIR, "listing-binding_final.zkey")),
    ).toBe(true);
  });

  it("verification key has correct structure", () => {
    const vkeyPath = path.join(BUILD_DIR, "listing-binding_vkey.json");
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));
    expect(vkey.protocol).toBe("groth16");
    expect(vkey.curve).toBe("bn128");
    // IC: 1 constant + 4 public inputs = 5
    expect(vkey.IC.length).toBe(5);
  });
});

describe.runIf(circuitBuilt)(
  "listing-binding-v1 circuit constraints",
  () => {
    it("accepts a valid listing binding", async () => {
      const input = buildValidInput();
      const witness = await calculateWitness(input);
      expect(witness).toBeDefined();
      expect(witness.length).toBeGreaterThan(0);
    }, 30000);

    it("produces correct listingRoot in witness output", async () => {
      const input = buildValidInput();
      const witness = await calculateWitness(input);
      // Public outputs in witness order: [1, listingRoot, perSchemaCommitment, schemaId, priceUsdc, ...]
      // witness[0] = 1 (constant), witness[1] = listingRoot (first public)
      expect(witness[1]).toBe(input.listingRoot.toString());
    }, 30000);

    it("produces correct perSchemaCommitment in witness output", async () => {
      const input = buildValidInput();
      const witness = await calculateWitness(input);
      // witness[2] = perSchemaCommitment (second public)
      expect(witness[2]).toBe(input.perSchemaCommitment.toString());
    }, 30000);

    it("produces correct schemaId in witness output", async () => {
      const input = buildValidInput();
      const witness = await calculateWitness(input);
      // witness[3] = schemaId (third public)
      expect(witness[3]).toBe(input.schemaId.toString());
    }, 30000);

    it("produces correct priceUsdc in witness output", async () => {
      const input = buildValidInput();
      const witness = await calculateWitness(input);
      // witness[4] = priceUsdc (fourth public)
      expect(witness[4]).toBe(input.priceUsdc.toString());
    }, 30000);

    it("rejects a mismatched listingRoot (tampered commitment)", async () => {
      const input = buildValidInput();
      const tampered = {
        ...input,
        listingRoot: toScalar("tampered-root").toString(),
      };
      await expect(calculateWitness(tampered)).rejects.toThrow();
    }, 30000);

    it("rejects a mismatched price (tampered public input)", async () => {
      const input = buildValidInput();
      const tampered = {
        ...input,
        priceUsdc: toScalar(99999999).toString(),
      };
      // This should fail because listingRoot won't match the hashed price
      await expect(calculateWitness(tampered)).rejects.toThrow();
    }, 30000);

    it("generates and verifies a valid Groth16 proof", async () => {
      const input = buildValidInput();
      const result = await generateProof(input);
      expect(result.isValid).toBe(true);
      expect(result.proof).toBeDefined();
      expect(result.publicSignals).toBeDefined();
      // Public signals should be [listingRoot, perSchemaCommitment, schemaId, priceUsdc]
      expect(result.publicSignals.length).toBe(4);
      expect(result.publicSignals[0]).toBe(input.listingRoot.toString());
      expect(result.publicSignals[1]).toBe(input.perSchemaCommitment.toString());
      expect(result.publicSignals[2]).toBe(input.schemaId.toString());
      expect(result.publicSignals[3]).toBe(input.priceUsdc.toString());
    }, 60000);

    it("fails verification with tampered public signals", async () => {
      const input = buildValidInput();
      const result = await generateProof(input);
      expect(result.isValid).toBe(true);

      const { groth16 } = await import("snarkjs");
      const vkeyPath = path.join(BUILD_DIR, "listing-binding_vkey.json");
      const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));

      // Tamper with the price public signal
      const tamperedSignals = [...result.publicSignals];
      tamperedSignals[3] = toScalar(1).toString();

      const isValid = await groth16.verify(
        vkey,
        tamperedSignals,
        result.proof,
      );
      expect(isValid).toBe(false);
    }, 30000);

    it("produces deterministic listingRoot for same inputs", async () => {
      const w1 = await calculateWitness(buildValidInput());
      const w2 = await calculateWitness(buildValidInput());
      expect(w1[1]).toBe(w2[1]); // listingRoot
      expect(w1[1]).not.toBe("0");
    }, 30000);

    it("produces different listingRoot for different sellers", async () => {
      const inputA = buildValidInput();
      const inputB = {
        ...buildValidInput(),
        did: toScalar("did:example:bob-402").toString(),
      };
      // Recompute listingRoot for Bob
      const listingRootB = poseidon5([
        inputB.schemaId,
        inputB.perSchemaCommitment,
        inputB.priceUsdc,
        inputB.did,
        inputB.salt,
      ]);
      const wA = await calculateWitness(inputA);
      const wB = await calculateWitness({
        ...inputB,
        listingRoot: listingRootB.toString(),
      });
      expect(wA[1]).not.toBe(wB[1]);
    }, 30000);
  },
);

describe.runIf(!circuitBuilt)("listing-binding circuit (not built)", () => {
  it("is skipped until the circuit is compiled", () => {
    expect(circuitBuilt).toBe(false);
  });
});
