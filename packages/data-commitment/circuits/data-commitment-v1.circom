// data-commitment-v1 circuit
//
// Verifies that a specific (path, value) pair is committed in a
// data-commitment-v1 Merkle root.  The root is a Poseidon2 Merkle tree
// whose leaves are Poseidon3([pathHash, valueHash, randomness]).
//
// This mirrors the SDK's commitment scheme (see packages/sdk/src/commitments.ts)
// but uses JSONPath-like paths instead of attribute names.
//
// Public inputs:
//   root          — Poseidon Merkle root (published commitment)
//   randomness    — blinding value (published alongside root)
//   pathHash      — toScalar(path)   (e.g. toScalar('$["data"]["price"]'))
//   valueHash     — toScalar(value)  (e.g. toScalar(42000))
//
// Private inputs (witness):
//   siblings[nLevels] — Merkle proof sibling hashes
//   indices[nLevels]  — Merkle proof direction bits (0=left, 1=right)
//
// Verification:
//   1. leaf = Poseidon3([pathHash, valueHash, randomness])
//   2. Recompute root from leaf + siblings + indices
//   3. Assert recomputed root == public root
//
// The circuit does NOT verify canonicalisation itself — that is done
// off-chain by the fetcher (canonical-sort-v1, OSS and auditable).
// The circuit only verifies that a committed value exists in the tree.
//
// Tree depth: nLevels is a compile-time parameter.  The TS implementation
// must pad the tree to exactly 2^nLevels leaves (using zero leaves) and
// supply nLevels siblings/indices per proof.  Unused levels use sibling=0,
// index=0.

pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

// ── MerkleProofChecker (same as agent-identity-valid.circom) ────────────

template MerkleProofChecker(nLevels) {
    signal input leaf;
    signal input root;
    signal input pathElements[nLevels];
    signal input pathIndices[nLevels];

    component hashers[nLevels];
    signal levelHashes[nLevels + 1];

    levelHashes[0] <== leaf;

    var i;
    for (i = 0; i < nLevels; i++) {
        hashers[i] = Poseidon(2);

        // pathIndices[i] == 0: leaf is left child
        // pathIndices[i] == 1: leaf is right child
        hashers[i].inputs[0] <== pathIndices[i] == 0 ? levelHashes[i] : pathElements[i];
        hashers[i].inputs[1] <== pathIndices[i] == 0 ? pathElements[i] : levelHashes[i];

        levelHashes[i + 1] <== hashers[i].out;
    }

    levelHashes[nLevels] === root;
}

// ── DataCommitmentV1 ────────────────────────────────────────────────────

template DataCommitmentV1(nLevels) {
    // Public inputs
    signal input root;
    signal input randomness;
    signal input pathHash;
    signal input valueHash;

    // Private inputs: Merkle proof
    signal input siblings[nLevels];
    signal input indices[nLevels];

    // 1. Compute leaf: Poseidon3([pathHash, valueHash, randomness])
    component leafHash = Poseidon(3);
    leafHash.inputs[0] <== pathHash;
    leafHash.inputs[1] <== valueHash;
    leafHash.inputs[2] <== randomness;

    // 2. Verify Merkle path
    component merkle = MerkleProofChecker(nLevels);
    merkle.leaf <== leafHash.out;
    merkle.root <== root;

    var i;
    for (i = 0; i < nLevels; i++) {
        merkle.pathElements[i] <== siblings[i];
        merkle.pathIndices[i] <== indices[i];
    }
}

// Default: 16 levels = 2^16 = 65,536 max leaves.
// Override at compile time: circom data-commitment-v1.circom -D
// or instantiate with a different nLevels.
component main { public [root, randomness, pathHash, valueHash] } = DataCommitmentV1(16);
