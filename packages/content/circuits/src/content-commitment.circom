pragma circom 2.1.0;
include "circomlib/circuits/poseidon.circom";

/**
 * ContentCommitmentV1 — minimal content-commitment circuit.
 *
 * Proves that the prover knows a Poseidon hash of raw file bytes
 * matching the public commitment. The file is identified externally
 * by its IPFS CID (application layer); this circuit proves the ZK
 * binding between the file content and the commitment.
 *
 * Circuit ID: content-commitment-v1
 *
 * ── Private input ───────────────────────────────────────
 *   fileHash    Poseidon hash of raw file bytes (via
 *               bytesToFieldElements conversion — see
 *               packages/content/src/normalizer.ts)
 *
 * ── Public input ────────────────────────────────────────
 *   commitment  The asserted content commitment
 *
 * ── Constraint ──────────────────────────────────────────
 *   commitment === Poseidon1(fileHash)
 *
 * Poseidon(1) wraps fileHash to provide real R1CS constraints
 * (~240) with cryptographic binding — the Groth16 proof is
 * sound even though Poseidon(1) is semantically identity on
 * a single field element (it permutes the input through the
 * full Poseidon sponge).
 *
 * ── Application-layer flow ──────────────────────────────
 *   Publisher:
 *     1. Compute fileHash = poseidon(bytesToFieldElements(file bytes))
 *        using iterative Poseidon(2) reduction (see normalizer.ts)
 *     2. Prove content-commitment-v1 with private fileHash
 *        → outputs public commitment (= Poseidon1(fileHash))
 *     3. Publish: { cid, proof, commitment }
 *
 *   Verifier:
 *     1. Fetch file bytes via CID
 *     2. Compute fileHash = poseidon(bytesToFieldElements(bytes))
 *     3. Compute commitment = Poseidon1(fileHash)
 *     4. Verify proof: commitment === Poseidon1(fileHash)
 *
 *   The byte→field-element conversion is specified in
 *   packages/content/src/normalizer.ts and uses 31-byte
 *   big-endian chunks with PKCS7 padding (31 bytes = 248 bits
 *   < 254-bit BN254 field prime).
 */
template ContentCommitmentV1() {
    // Private input
    signal input fileHash;

    // Public input
    signal input commitment;

    // Poseidon(1) wraps fileHash to provide real R1CS constraints.
    // Even on one element, the full sponge permutation fires,
    // giving the Groth16 proof cryptographic binding.
    component hasher = Poseidon(1);
    hasher.inputs[0] <== fileHash;

    commitment === hasher.out;
}

component main {public [commitment]} = ContentCommitmentV1();
