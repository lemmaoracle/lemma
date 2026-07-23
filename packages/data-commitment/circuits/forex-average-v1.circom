// forex-average-v1 circuit
//
// Proves that a given averageRate is the correct arithmetic mean of
// two source rates, each committed in their respective data-commitment-v1
// Merkle trees.
//
// This circuit does NOT re-distribute source values — the verifier
// obtains source rates as private witness inputs (from the original
// API or their own cache), and the circuit proves the average was
// computed correctly without revealing the source values in public
// outputs.
//
// Public inputs:
//   sourceRootA    — Poseidon Merkle root of source A (e.g. Frankfurter)
//   sourceRootB    — Poseidon Merkle root of source B (e.g. ExchangeRate-API)
//   randomnessA    — blinding value for source A's tree
//   randomnessB    — blinding value for source B's tree
//   pathHash       — toScalar(path) for the currency rate (e.g. toScalar('$["rates"]["JPY"]'))
//                    Same path in both trees (both sources normalise to {rates:{CCY:val}})
//   averageRate    — the averaged rate (scaled integer, ×10^8)
//
// Private inputs (witness):
//   rateA           — source A's rate for this currency (scaled integer)
//   rateB           — source B's rate for this currency (scaled integer)
//   siblingsA[nLevels]  — Merkle proof siblings for source A
//   indicesA[nLevels]   — Merkle proof direction bits for source A
//   siblingsB[nLevels]  — Merkle proof siblings for source B
//   indicesB[nLevels]   — Merkle proof direction bits for source B
//
// Verification:
//   1. leafA = Poseidon3([pathHash, rateA, randomnessA])
//   2. Verify leafA in source tree A (MerkleProofChecker)
//   3. leafB = Poseidon3([pathHash, rateB, randomnessB])
//   4. Verify leafB in source tree B (MerkleProofChecker)
//   5. Assert 2 * averageRate === rateA + rateB
//
// Scaling: rates are scaled by 10^8 to integers (e.g. 162.74 → 16274000000).
// Since 10^8 is even, (rateA + rateB) is always even, so division by 2
// is exact in the field (no remainder, no rounding).
//
// Currency-independent: pathHash is a runtime public input, so the same
// circuit handles JPY, EUR, BTC, or any future currency without recompilation.
// Source count is fixed at 2; adding a 3rd source requires a new circuit version.

pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux1.circom";

// ── MerkleProofChecker (Mux1-based, circom 2.2.x compatible) ────────────

template MerkleProofChecker(nLevels) {
    signal input leaf;
    signal input root;
    signal input pathElements[nLevels];
    signal input pathIndices[nLevels];

    component hashers[nLevels];
    component muxLeft[nLevels];
    component muxRight[nLevels];
    signal levelHashes[nLevels + 1];

    levelHashes[0] <== leaf;

    var i;
    for (i = 0; i < nLevels; i++) {
        // Use Mux1 to avoid non-quadratic constraints from ternary with ==
        muxLeft[i] = Mux1();
        muxLeft[i].c[0] <== levelHashes[i];      // index=0: current is left child
        muxLeft[i].c[1] <== pathElements[i];     // index=1: sibling is left child
        muxLeft[i].s <== pathIndices[i];

        muxRight[i] = Mux1();
        muxRight[i].c[0] <== pathElements[i];     // index=0: sibling is right child
        muxRight[i].c[1] <== levelHashes[i];     // index=1: current is right child
        muxRight[i].s <== pathIndices[i];

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== muxLeft[i].out;
        hashers[i].inputs[1] <== muxRight[i].out;

        levelHashes[i + 1] <== hashers[i].out;
    }

    levelHashes[nLevels] === root;
}

// ── ForexAverageV1 ──────────────────────────────────────────────────────

template ForexAverageV1(nLevels) {
    // Public inputs
    signal input sourceRootA;
    signal input sourceRootB;
    signal input randomnessA;
    signal input randomnessB;
    signal input pathHash;
    signal input averageRate;

    // Private inputs: source rates
    signal input rateA;
    signal input rateB;

    // Private inputs: Merkle proofs
    signal input siblingsA[nLevels];
    signal input indicesA[nLevels];
    signal input siblingsB[nLevels];
    signal input indicesB[nLevels];

    // 1. Compute leaf A: Poseidon3([pathHash, rateA, randomnessA])
    component leafHashA = Poseidon(3);
    leafHashA.inputs[0] <== pathHash;
    leafHashA.inputs[1] <== rateA;
    leafHashA.inputs[2] <== randomnessA;

    // 2. Verify leaf A in source tree A
    component merkleA = MerkleProofChecker(nLevels);
    merkleA.leaf <== leafHashA.out;
    merkleA.root <== sourceRootA;
    var i;
    for (i = 0; i < nLevels; i++) {
        merkleA.pathElements[i] <== siblingsA[i];
        merkleA.pathIndices[i] <== indicesA[i];
    }

    // 3. Compute leaf B: Poseidon3([pathHash, rateB, randomnessB])
    component leafHashB = Poseidon(3);
    leafHashB.inputs[0] <== pathHash;
    leafHashB.inputs[1] <== rateB;
    leafHashB.inputs[2] <== randomnessB;

    // 4. Verify leaf B in source tree B
    component merkleB = MerkleProofChecker(nLevels);
    merkleB.leaf <== leafHashB.out;
    merkleB.root <== sourceRootB;
    for (i = 0; i < nLevels; i++) {
        merkleB.pathElements[i] <== siblingsB[i];
        merkleB.pathIndices[i] <== indicesB[i];
    }

    // 5. Assert average is correct: 2 * averageRate === rateA + rateB
    //    Using multiplication (not division) to avoid non-quadratic constraints.
    //    Since rates are scaled by 10^8 (even), rateA + rateB is always even,
    //    so averageRate = (rateA + rateB) / 2 is exact.
    2 * averageRate === rateA + rateB;
}

// Default: 16 levels = 2^16 = 65,536 max leaves (matches data-commitment-v1).
component main {
    public [sourceRootA, sourceRootB, randomnessA, randomnessB, pathHash, averageRate]
} = ForexAverageV1(16);
