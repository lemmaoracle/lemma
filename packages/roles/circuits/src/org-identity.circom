pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";

/**
 * OrgIdentity — proves an institution's secret key holder committed a memberRoot
 * for a verified domain at a specific timestamp.
 *
 * Circuit ID: org-identity-v1
 *
 * Uses a Poseidon-based signature (field-native, no elliptic curve):
 *   - Secret key: x ∈ F_p (private, never revealed)
 *   - Public key: pk = Poseidon1(x) (public, = orgDid as field element)
 *   - Message: m = Poseidon3(memberRoot, domain, timestamp) (public)
 *   - Signature: (r, s) where r is random,
 *       s = Poseidon3(x, m, r) (public)
 *
 * Verification (in-circuit):
 *   (1) Poseidon1(x) === pk           — proves x corresponds to the public key (orgDid)
 *   (2) Poseidon3(x, m, r) === s      — proves the secret key holder signed the message
 *   (3) m === Poseidon3(memberRoot, domain, timestamp) — binds the message to org data
 *
 * Public inputs:
 *   commitmentHash  — Poseidon5(orgDid, memberRoot, domain, timestamp, orgSalt) — registered via documents.register
 *   orgDid (pk)     — institution's public key (field element)
 *   memberRoot      — Poseidon Merkle root of members
 *   domain          — domain string hash (field element)
 *   timestamp       — when the membership tree was committed (unix seconds)
 *   signatureR      — signature randomness component (public)
 *   signatureS      — signature value component (public)
 *
 * Private inputs:
 *   orgSecret (x)   — institution's secret key (field element)
 *   orgSalt         — blinding factor for commitmentHash
 *
 * Security: ~128 bit (BN254 field). Replay prevented by timestamp in message.
 * Constraint count: ~600 (Poseidon1 + Poseidon3 + Poseidon3 + Poseidon5).
 */

template OrgIdentity() {
    // ── Private inputs ──────────────────────────────────────────────
    signal input orgSecret;
    signal input orgSalt;

    // ── Public inputs ───────────────────────────────────────────────
    signal input commitmentHash;
    signal input orgDid;       // = Poseidon1(orgSecret)
    signal input memberRoot;
    signal input domain;
    signal input timestamp;
    signal input signatureR;
    signal input signatureS;

    // ── (1) Public key verification: Poseidon1(orgSecret) === orgDid ──
    component pkHasher = Poseidon(1);
    pkHasher.inputs[0] <== orgSecret;
    pkHasher.out === orgDid;

    // ── (2) Message: m = Poseidon3(memberRoot, domain, timestamp) ──
    component msgHasher = Poseidon(3);
    msgHasher.inputs[0] <== memberRoot;
    msgHasher.inputs[1] <== domain;
    msgHasher.inputs[2] <== timestamp;

    // ── (3) Signature: s = Poseidon3(orgSecret, m, signatureR) === signatureS ──
    component sigHasher = Poseidon(3);
    sigHasher.inputs[0] <== orgSecret;
    sigHasher.inputs[1] <== msgHasher.out;
    sigHasher.inputs[2] <== signatureR;
    sigHasher.out === signatureS;

    // ── (4) Commitment hash for documents.register ──
    component commitHasher = Poseidon(5);
    commitHasher.inputs[0] <== orgDid;
    commitHasher.inputs[1] <== memberRoot;
    commitHasher.inputs[2] <== domain;
    commitHasher.inputs[3] <== timestamp;
    commitHasher.inputs[4] <== orgSalt;
    commitHasher.out === commitmentHash;
}

component main {
    public [commitmentHash, orgDid, memberRoot, domain, timestamp, signatureR, signatureS]
} = OrgIdentity();
