pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";

/**
 * OrgIdentity — proves an institution's secret key holder committed a
 * memberRoot for a verified domain at a specific timestamp.
 *
 * Circuit ID: org-identity-v1
 *
 * This is a ZK proof of knowledge (PoK), not a transferable signature.
 * The Groth16 proof itself is the authentication — no standalone signature
 * verification is needed. Delegation (if needed later) requires EdDSA-
 * over-BabyJubjub, which is a follow-up concern.
 *
 * Verification (in-circuit):
 *   (1) Poseidon1(orgSecret) === orgDid — proves knowledge of the org's secret key
 *   (2) Poseidon5(orgDid, memberRoot, domain, timestamp, orgSalt) === commitmentHash
 *       — binds the org's public key to its member tree, domain, and timestamp
 *
 * Public inputs:
 *   commitmentHash — registered via documents.register
 *   orgDid         — Poseidon1(orgSecret), the institution's public key
 *   memberRoot     — Poseidon Merkle root of members
 *   domain         — domain string hash (field element)
 *   timestamp      — when the membership tree was committed (unix seconds)
 *
 * Private inputs:
 *   orgSecret      — institution's secret key (field element)
 *   orgSalt        — blinding factor for commitmentHash
 *
 * Security: ~128 bit (BN254 field). Replay prevention is off-circuit
 * (Worker must reject stale timestamps and duplicate commitmentHashes).
 * Constraint count: ~200 (Poseidon1 + Poseidon5).
 */

template OrgIdentity() {
    signal input orgSecret;
    signal input orgSalt;

    signal input commitmentHash;
    signal input orgDid;
    signal input memberRoot;
    signal input domain;
    signal input timestamp;

    // (1) Public key verification: Poseidon1(orgSecret) === orgDid
    component pkHasher = Poseidon(1);
    pkHasher.inputs[0] <== orgSecret;
    pkHasher.out === orgDid;

    // (2) Commitment hash: Poseidon5(orgDid, memberRoot, domain, timestamp, orgSalt) === commitmentHash
    component commitHasher = Poseidon(5);
    commitHasher.inputs[0] <== orgDid;
    commitHasher.inputs[1] <== memberRoot;
    commitHasher.inputs[2] <== domain;
    commitHasher.inputs[3] <== timestamp;
    commitHasher.inputs[4] <== orgSalt;
    commitHasher.out === commitmentHash;
}

component main {
    public [commitmentHash, orgDid, memberRoot, domain, timestamp]
} = OrgIdentity();
