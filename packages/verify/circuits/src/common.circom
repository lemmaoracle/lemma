// Shared Proof Gate components. Reused by every gate-specific top-level circuit.
// Domain constants and depths are template parameters: each gate freezes its own.
pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/mux1.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";
// IsZero lives in comparators.circom (no separate iszero.circom in circomlib).

// Enforce a boolean signal. Every Merkle direction bit goes through this so a
// prover that bypasses the TypeScript SDK still cannot smuggle a non-bit.
template Bit() {
    signal input b;
    b * (b - 1) === 0;
}

// One Merkle level: Mux1-routed children under a domain-separated node hash
// H(DOM_NODE, left, right). isRight 0 = current node is left, 1 = right.
template MerkleLevel(DOM_NODE) {
    signal input node;
    signal input sibling;
    signal input isRight;
    signal output parent;

    component bit = Bit();
    bit.b <== isRight;

    component lm = Mux1();
    lm.c[0] <== node;
    lm.c[1] <== sibling;
    lm.s <== isRight;

    component rm = Mux1();
    rm.c[0] <== sibling;
    rm.c[1] <== node;
    rm.s <== isRight;

    component h = Poseidon(3);
    h.inputs[0] <== DOM_NODE;
    h.inputs[1] <== lm.out;
    h.inputs[2] <== rm.out;

    parent <== h.out;
}

// Fixed-depth leaf-to-root path. Depth is a compile-time constant: paths are
// always full length, so an intermediate node can never pose as a leaf at a
// shorter depth.
template InclusionPath(DEPTH, DOM_NODE) {
    signal input leaf;
    signal input pathElements[DEPTH];
    signal input pathIndices[DEPTH];
    signal output root;

    component lv[DEPTH];
    signal nodes[DEPTH + 1];
    nodes[0] <== leaf;
    for (var i = 0; i < DEPTH; i++) {
        lv[i] = MerkleLevel(DOM_NODE);
        lv[i].node <== nodes[i];
        lv[i].sibling <== pathElements[i];
        lv[i].isRight <== pathIndices[i];
        nodes[i + 1] <== lv[i].parent;
    }
    root <== nodes[DEPTH];
}

// Range-check both sides to N bits, then enforce a <= b. The range checks are
// load-bearing: without them a field-wraparound value defeats the comparison.
template RangedLeq(N) {
    signal input a;
    signal input b;

    component ra = Num2Bits(N);
    ra.in <== a;
    component rb = Num2Bits(N);
    rb.in <== b;

    component le = LessEqThan(N);
    le.in[0] <== a;
    le.in[1] <== b;
    le.out === 1;
}

// Range-check one value to N bits (for limb inputs whose comparison happens
// implicitly through digest binding).
template RangeCheck(N) {
    signal input in;

    component r = Num2Bits(N);
    r.in <== in;
}

// Reject the empty slot value 0 as a leaf. Valid leaves are Poseidon outputs
// (nonzero with overwhelming probability); slot 0 must never prove inclusion.
template NonEmpty() {
    signal input in;

    component z = IsZero();
    z.in <== in;
    z.out === 0;
}
