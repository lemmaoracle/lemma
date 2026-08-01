pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";

/**
 * OrgIdentity — proves an institution committed a memberRoot for a domain.
 *
 * Circuit ID: org-identity-v1
 *
 * Public inputs:
 *   commitmentHash — Poseidon5 binding of org identity + member tree + domain
 *   orgDid         — institution's DID (field element)
 *   memberRoot     — Poseidon Merkle root of members
 *   domain         — domain string hash (field element, from DNS TXT)
 *   timestamp      — when the membership tree was committed (unix seconds)
 *
 * Private inputs:
 *   orgSalt        — institution's blinding factor
 *
 * Constraints:
 *   (1) commitmentHash === Poseidon5(orgDid, memberRoot, domain, timestamp, orgSalt)
 *       — binds org identity to its member tree and domain with a salt
 *   (2) No DNS verification in-circuit — that's off-circuit (Worker side)
 *
 * Purpose: create a verifiable on-chain record that
 * "orgDid owns memberRoot for domain at timestamp". Registered via documents.register.
 */

template OrgIdentity() {
    // ── Private inputs ──────────────────────────────────────────────
    signal input orgSalt;

    // ── Public inputs ───────────────────────────────────────────────
    signal input commitmentHash;
    signal input orgDid;
    signal input memberRoot;
    signal input domain;
    signal input timestamp;

    // ── (1) Org identity commitment ─────────────────────────────────
    component hasher = Poseidon(5);
    hasher.inputs[0] <== orgDid;
    hasher.inputs[1] <== memberRoot;
    hasher.inputs[2] <== domain;
    hasher.inputs[3] <== timestamp;
    hasher.inputs[4] <== orgSalt;

    hasher.out === commitmentHash;
}

component main {
    public [commitmentHash, orgDid, memberRoot, domain, timestamp]
} = OrgIdentity();
