import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { poseidon1, poseidon2, poseidon5 } from "poseidon-lite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.resolve(__dirname, "../build");
const WASM = path.join(
  BUILD_DIR,
  "listing-binding_js",
  "listing-binding.wasm",
);

const TREE_DEPTH = 20;

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

type CircuitSignals = Readonly<Record<string, string | bigint | readonly string[]>>;

const calculateWitness = async (
  input: CircuitSignals,
): Promise<string[]> => {
  const { wtns } = await import("snarkjs");
  const wtnsPath = path.join(BUILD_DIR, "test-witness-listing-binding.wtns");

  const bigIntInput = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [
      k,
      Array.isArray(v) ? v.map((x) => BigInt(x)) : BigInt(v as string | bigint),
    ]),
  );

  await wtns.calculate(bigIntInput, WASM, wtnsPath);

  const wtnsJson = await wtns.exportJson(wtnsPath);
  fs.unlinkSync(wtnsPath);
  return wtnsJson.map((v: bigint) => v.toString());
};

// ── Sparse Merkle helpers (zero-padded Poseidon2 tree) ──────────────

/** Compute member leaf = Poseidon2(authorDid, memberSalt). */
const memberLeaf = (authorDid: bigint, memberSalt: bigint): bigint =>
  poseidon2([authorDid, memberSalt]);

/**
 * Build a depth-20 inclusion proof for a leaf at the given index.
 * Unused siblings are 0 (sparse / empty tree).
 */
const buildMembershipProof = (
  leaf: bigint,
  leafIndex: number,
): Readonly<{
  merklePath: readonly string[];
  merkleIndices: readonly string[];
  memberRoot: bigint;
}> => {
  const path: string[] = [];
  const indices: string[] = [];
  let current = leaf;
  let idx = leafIndex;

  for (let level = 0; level < TREE_DEPTH; level++) {
    const sibling = 0n;
    const bit = idx & 1;
    path.push(sibling.toString());
    indices.push(bit.toString());
    current =
      bit === 0
        ? poseidon2([current, sibling])
        : poseidon2([sibling, current]);
    idx >>= 1;
  }

  return {
    merklePath: path,
    merkleIndices: indices,
    memberRoot: current,
  };
};

// ── Witness builder using real Poseidon hashes ──────────────────────

const buildValidInput = (
  overrides: Partial<{
    authorDid: bigint;
    listingRoot: bigint;
    memberRoot: bigint;
  }> = {},
): CircuitSignals => {
  const schemaId = toScalar("blog-article-v1.2");
  const commitment = toScalar(
    "0x1a2b3c4d5e6f7890abcdef012345678901234567890abcdef01234567890123456",
  );
  const priceUsdc = toScalar(42000000);
  const orgDid = poseidon1([toScalar("org-secret-test-key")]);
  const authorDid =
    overrides.authorDid ?? toScalar("did:example:alice-402");
  const salt = toScalar("listing-binding-v2-test-salt");
  const memberSalt = toScalar("member-leaf-salt");

  const leaf = memberLeaf(authorDid, memberSalt);
  const membership = buildMembershipProof(leaf, 0);

  const listingRoot =
    overrides.listingRoot ??
    poseidon5([schemaId, commitment, priceUsdc, orgDid, salt]);

  return {
    authorDid: authorDid.toString(),
    salt: salt.toString(),
    merklePath: membership.merklePath,
    merkleIndices: membership.merkleIndices,
    memberSalt: memberSalt.toString(),
    listingRoot: listingRoot.toString(),
    commitment: commitment.toString(),
    orgDid: orgDid.toString(),
    memberRoot: (overrides.memberRoot ?? membership.memberRoot).toString(),
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

  const bigIntInput = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [
      k,
      Array.isArray(v) ? v.map((x) => BigInt(x)) : BigInt(v as string | bigint),
    ]),
  );

  const { proof, publicSignals } = await groth16.fullProve(
    bigIntInput,
    wasmPath,
    zkeyPath,
  );

  const vkeyPath = path.join(BUILD_DIR, "listing-binding_vkey.json");
  const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));

  const isValid = await groth16.verify(vkey, publicSignals, proof);

  return { witness, proof, publicSignals, isValid };
};

// ── Tests ───────────────────────────────────────────────────────────

describe.runIf(circuitBuilt)("listing-binding circuit build artifacts", () => {
  it("R1CS file exists", () => {
    expect(
      fs.existsSync(path.join(BUILD_DIR, "listing-binding.r1cs")),
    ).toBe(true);
  });

  it("WASM file exists", () => {
    expect(fs.existsSync(WASM)).toBe(true);
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
    // IC: 1 constant + 6 public inputs = 7
    expect(vkey.IC.length).toBe(7);
  });
});

describe.runIf(circuitBuilt)(
  "listing-binding circuit constraints (circuit ID: listing-binding-v2)",
  () => {
    it("accepts a valid listing binding with membership", async () => {
      const input = buildValidInput();
      const witness = await calculateWitness(input);
      expect(witness).toBeDefined();
      expect(witness.length).toBeGreaterThan(0);
    }, 60000);

    it("produces correct public signals in witness", async () => {
      const input = buildValidInput();
      const witness = await calculateWitness(input);
      // witness[0]=1, then public inputs in declaration order
      expect(witness[1]).toBe(input.listingRoot.toString());
      expect(witness[2]).toBe(input.commitment.toString());
      expect(witness[3]).toBe(input.orgDid.toString());
      expect(witness[4]).toBe(input.memberRoot.toString());
      expect(witness[5]).toBe(input.schemaId.toString());
      expect(witness[6]).toBe(input.priceUsdc.toString());
    }, 60000);

    it("rejects a mismatched listingRoot", async () => {
      const input = buildValidInput({
        listingRoot: toScalar("tampered-listing-root"),
      });
      await expect(calculateWitness(input)).rejects.toThrow();
    }, 60000);

    it("rejects a mismatched memberRoot", async () => {
      const input = buildValidInput({
        memberRoot: toScalar("tampered-member-root"),
      });
      await expect(calculateWitness(input)).rejects.toThrow();
    }, 60000);

    it("rejects a non-member (wrong authorDid)", async () => {
      // Build membership for Alice, then swap authorDid to Bob
      // without recomputing the Merkle path → membership fails.
      const aliceInput = buildValidInput();
      const bobDid = toScalar("did:example:bob-402");
      const tampered = {
        ...aliceInput,
        authorDid: bobDid.toString(),
      };
      await expect(calculateWitness(tampered)).rejects.toThrow();
    }, 60000);

    it("generates and verifies a valid Groth16 proof", async () => {
      const input = buildValidInput();
      const result = await generateProof(input);
      expect(result.isValid).toBe(true);
      expect(result.proof).toBeDefined();
      expect(result.publicSignals.length).toBe(6);
      expect(result.publicSignals[0]).toBe(input.listingRoot.toString());
      expect(result.publicSignals[1]).toBe(input.commitment.toString());
      expect(result.publicSignals[2]).toBe(input.orgDid.toString());
      expect(result.publicSignals[3]).toBe(input.memberRoot.toString());
      expect(result.publicSignals[4]).toBe(input.schemaId.toString());
      expect(result.publicSignals[5]).toBe(input.priceUsdc.toString());
    }, 120000);
  },
);

describe.runIf(!circuitBuilt)("listing-binding circuit (not built)", () => {
  it("is skipped until the circuit is compiled", () => {
    expect(circuitBuilt).toBe(false);
  });
});
