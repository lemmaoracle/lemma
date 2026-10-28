// Agent-operation gate, scheme agent-gate-v1 (INTERNAL, unregistered).
//
// Pre-delegated agent grants: the issuer publishes member and grant trees; the
// agent holds agentSecret; each call proves grant inclusion plus binding to the
// exact request the verifier is about to execute. No human approval per call.
//
// Possession + trusted-root model: issuance means inclusion in an issuer tree,
// authentication means knowledge of agentSecret. There is deliberately NO
// Poseidon "signature" (a MAC, not a signature); see the openspec design record.
//
// Scheme parameters are frozen in this file: depths 20/20, 64-bit window and
// amounts, 128-bit params-hash limbs, domain constants 101..107. Any change is
// a new circuit id and new artifacts, never an edit in place.
//
// Public signals (16): two outputs first, then verifier-assembled inputs:
//   [bindTag, nullifier, memberRoot, grantRoot, epoch, asOf, toolId,
//    resourceId, actionId, paramsHashLo, paramsHashHi, amount, challenge,
//    audience, sessionHash, idCommitment]
// The verifier MUST rebuild the 14 inputs from its own request context and
// establish the 2 outputs purely through cryptographic verification.
pragma circom 2.1.0;

include "common.circom";

template AgentGateV1() {
    // Frozen scheme parameters.
    var DEPTH = 20;
    var TS_BITS = 64;
    var LIMB_BITS = 128;
    var DOM_MEMBER = 101;
    var DOM_GRANT = 102;
    var DOM_NODE = 103;
    var DOM_PK = 104;
    var DOM_REQ = 105;
    var DOM_BIND = 106;
    var DOM_NULL = 107;

    // Public inputs: the verifier assembles every one of these itself.
    signal input memberRoot;
    signal input grantRoot;
    signal input epoch;
    signal input asOf;
    signal input toolId;
    signal input resourceId;
    signal input actionId;
    signal input paramsHashLo;
    signal input paramsHashHi;
    signal input amount;
    signal input challenge;
    signal input audience;
    signal input sessionHash;
    signal input idCommitment;

    // Witness: agent secret, shared role, grant window/limit, both paths.
    signal input agentSecret;
    signal input roleId;
    signal input maxPerAction;
    signal input startTs;
    signal input endTs;
    signal input memberPathElements[DEPTH];
    signal input memberPathIndices[DEPTH];
    signal input grantPathElements[DEPTH];
    signal input grantPathIndices[DEPTH];

    signal output bindTag;
    signal output nullifier;

    // 1) Identity: the public commitment is H(secret). This is possession, not
    // a signature: only the secret holder can satisfy it, and no third party
    // can mint (secret, commitment) pairs for someone else's secret.
    component pk = Poseidon(2);
    pk.inputs[0] <== DOM_PK;
    pk.inputs[1] <== agentSecret;
    idCommitment === pk.out;

    // 2) Member leaf. roleId is the SAME signal reused in the grant leaf, which
    // couples the two axes: a member leaf cannot be paired with a grant leaf
    // issued for a different role.
    component leafM = Poseidon(3);
    leafM.inputs[0] <== DOM_MEMBER;
    leafM.inputs[1] <== idCommitment;
    leafM.inputs[2] <== roleId;

    // 3) Grant leaf. toolId/resourceId/actionId are PUBLIC inputs hashed
    // straight into the leaf: the grant names exactly what the verifier is
    // executing, so witness-only substitution is impossible.
    component leafG = Poseidon(8);
    leafG.inputs[0] <== DOM_GRANT;
    leafG.inputs[1] <== roleId;
    leafG.inputs[2] <== toolId;
    leafG.inputs[3] <== resourceId;
    leafG.inputs[4] <== actionId;
    leafG.inputs[5] <== maxPerAction;
    leafG.inputs[6] <== startTs;
    leafG.inputs[7] <== endTs;

    // 4) Neither leaf may be the empty slot.
    component neM = NonEmpty();
    neM.in <== leafM.out;
    component neG = NonEmpty();
    neG.in <== leafG.out;

    // 5) Both inclusion proofs against the verifier-supplied roots.
    component pm = InclusionPath(DEPTH, DOM_NODE);
    pm.leaf <== leafM.out;
    for (var i = 0; i < DEPTH; i++) {
        pm.pathElements[i] <== memberPathElements[i];
        pm.pathIndices[i] <== memberPathIndices[i];
    }
    pm.root === memberRoot;

    component pg = InclusionPath(DEPTH, DOM_NODE);
    pg.leaf <== leafG.out;
    for (var i = 0; i < DEPTH; i++) {
        pg.pathElements[i] <== grantPathElements[i];
        pg.pathIndices[i] <== grantPathIndices[i];
    }
    pg.root === grantRoot;

    // 6) Validity window: startTs <= asOf <= endTs (all 64-bit ranged).
    component w1 = RangedLeq(TS_BITS);
    w1.a <== startTs;
    w1.b <== asOf;
    component w2 = RangedLeq(TS_BITS);
    w2.a <== asOf;
    w2.b <== endTs;

    // 7) Per-action limit: amount <= maxPerAction (both 64-bit ranged).
    component lim = RangedLeq(TS_BITS);
    lim.a <== amount;
    lim.b <== maxPerAction;

    // 8) The external 256-bit params hash arrives as two 128-bit limbs; both
    // are range-checked so the split is canonical.
    component rlo = RangeCheck(LIMB_BITS);
    rlo.in <== paramsHashLo;
    component rhi = RangeCheck(LIMB_BITS);
    rhi.in <== paramsHashHi;

    // 9) Request digest over the public inputs. The verifier hashed the exact
    // bytes it is about to execute; binding those bytes here ties this proof
    // to this request.
    component req = Poseidon(12);
    req.inputs[0] <== DOM_REQ;
    req.inputs[1] <== toolId;
    req.inputs[2] <== resourceId;
    req.inputs[3] <== actionId;
    req.inputs[4] <== paramsHashLo;
    req.inputs[5] <== paramsHashHi;
    req.inputs[6] <== amount;
    req.inputs[7] <== challenge;
    req.inputs[8] <== audience;
    req.inputs[9] <== sessionHash;
    req.inputs[10] <== asOf;
    req.inputs[11] <== epoch;

    // 10) Binding tag: every public input reaches a secret-involving
    // constraint through the digest and this tag.
    component bind = Poseidon(3);
    bind.inputs[0] <== DOM_BIND;
    bind.inputs[1] <== agentSecret;
    bind.inputs[2] <== req.out;
    bindTag <== bind.out;

    // 11) Nullifier scoped to (epoch, challenge): concurrent distinct
    // requests are not rejected, replays of one challenge are detectable.
    component nf = Poseidon(4);
    nf.inputs[0] <== DOM_NULL;
    nf.inputs[1] <== agentSecret;
    nf.inputs[2] <== epoch;
    nf.inputs[3] <== challenge;
    nullifier <== nf.out;
}

component main {public [memberRoot, grantRoot, epoch, asOf, toolId, resourceId, actionId, paramsHashLo, paramsHashHi, amount, challenge, audience, sessionHash, idCommitment]} = AgentGateV1();
