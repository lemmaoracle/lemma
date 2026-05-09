pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";

/**
 * AgentIdentity — proves an agent credential was issued by a trusted
 * authority and is currently valid (not expired, not revoked).
 *
 * This circuit is the identity-proof layer in the Lemma agent stack.
 * Downstream circuits (e.g., trust402 role-spend-limit) reference
 * credentialCommitment as a trust anchor.
 *
 * Commitment scheme:
 *   credentialCommitment = Poseidon6(
 *     identityHash, authorityHash, financialHash,
 *     lifecycleHash, provenanceHash, salt
 *   )
 *
 *   where each sub-hash is a Poseidon of the relevant normalized fields.
 *
 * Issuer signature (Poseidon MAC):
 *   The issuer computes mac = Poseidon2(credentialCommitment, issuerSecretKey)
 *   The circuit verifies: Poseidon2(credentialCommitment, issuerSecretKey) === mac
 *   The issuer's public key is derived as: issuerPublicKey = Poseidon1(issuerSecretKey)
 *
 * Private inputs:
 *   identityHash      Poseidon hash of normalized identity fields
 *   authorityHash     Poseidon hash of normalized authority fields
 *   financialHash     Poseidon hash of normalized financial fields
 *   lifecycleHash     Poseidon hash of normalized lifecycle fields
 *   provenanceHash    Poseidon hash of normalized provenance fields
 *   salt              Binding randomness
 *   issuerSecretKey   Issuer's secret key for MAC verification
 *   mac               Issuer's MAC over the credentialCommitment
 *   issuedAt          Credential issuance timestamp (epoch seconds)
 *   expiresAt         Credential expiration timestamp (0 = none)
 *   revoked           Revocation flag (0 = not revoked)
 *
 * Public inputs:
 *   credentialCommitment  Poseidon commitment binding all credential fields
 *   issuerPublicKey       Issuer's public key (Poseidon1 of secret key)
 *   nowSec                Current unix timestamp
 */

template AgentIdentity() {
    // ── Private inputs ──────────────────────────────────────────────
    signal input identityHash;
    signal input authorityHash;
    signal input financialHash;
    signal input lifecycleHash;
    signal input provenanceHash;
    signal input salt;
    signal input issuerSecretKey;
    signal input mac;
    signal input issuedAt;
    signal input expiresAt;
    signal input revoked;

    // ── Public inputs ───────────────────────────────────────────────
    signal input credentialCommitment;
    signal input issuerPublicKey;
    signal input nowSec;

    // ── 1. Credential commitment ────────────────────────────────────
    // Poseidon6 binds all credential sections + salt into one commitment
    component commitmentHasher = Poseidon(6);
    commitmentHasher.inputs[0] <== identityHash;
    commitmentHasher.inputs[1] <== authorityHash;
    commitmentHasher.inputs[2] <== financialHash;
    commitmentHasher.inputs[3] <== lifecycleHash;
    commitmentHasher.inputs[4] <== provenanceHash;
    commitmentHasher.inputs[5] <== salt;

    commitmentHasher.out === credentialCommitment;

    // ── 2. Issuer signature verification (Poseidon MAC) ─────────────
    // issuerPublicKey = Poseidon1(issuerSecretKey)
    component pkDeriver = Poseidon(1);
    pkDeriver.inputs[0] <== issuerSecretKey;
    pkDeriver.out === issuerPublicKey;

    // mac = Poseidon2(credentialCommitment, issuerSecretKey)
    component macVerifier = Poseidon(2);
    macVerifier.inputs[0] <== credentialCommitment;
    macVerifier.inputs[1] <== issuerSecretKey;
    macVerifier.out === mac;

    // ── 3. Lifecycle validity ───────────────────────────────────────

    // 3a. issuedAt <= nowSec (credential has been issued)
    component issuedCheck = LessEqThan(64);
    issuedCheck.in[0] <== issuedAt;
    issuedCheck.in[1] <== nowSec;
    issuedCheck.out === 1;

    // 3b. Not revoked (revoked must be 0)
    revoked === 0;

    // 3c. expiresAt == 0 (no expiration) OR nowSec < expiresAt
    //     We use a conditional: if expiresAt is 0, skip the check.
    //     In circom, we compute (expiresAt - nowSec) * expiresAt.
    //     If expiresAt == 0: product is 0, constraint passes trivially.
    //     If expiresAt != 0: we need nowSec < expiresAt.
    //     Approach: compute isNotExpired flag, require it to be 1 when expiresAt != 0.
    //
    //     For simplicity and clarity, we enforce:
    //       - A boolean signal hasExpiry = (expiresAt != 0) ? 1 : 0
    //       - If hasExpiry: nowSec < expiresAt
    //       - If !hasExpiry: no constraint
    //
    //     Since circom doesn't have native conditionals, we use:
    //       hasExpiry = IsZero(expiresAt).out XOR 1... but IsZero gives 1 when zero.
    //       So hasExpiry = 1 - IsZero(expiresAt).out

    component isExpiresAtZero = IsZero();
    isExpiresAtZero.in <== expiresAt;

    // hasExpiry = 1 - isExpiresAtZero.out  (1 if expiresAt != 0, 0 if expiresAt == 0)
    signal hasExpiry;
    hasExpiry <== 1 - isExpiresAtZero.out;

    // When hasExpiry == 1, we need nowSec < expiresAt
    // nowSec < expiresAt is equivalent to (expiresAt - nowSec - 1) >= 0
    // Use LessThan: nowSec < expiresAt iff LessThan(64)(nowSec, expiresAt).out == 1
    component expiryCheck = LessThan(64);
    expiryCheck.in[0] <== nowSec;
    expiryCheck.in[1] <== expiresAt;

    // Constraint: hasExpiry => expiryCheck.out == 1
    // Equivalently: hasExpiry * expiryCheck.out === hasExpiry
    // (When hasExpiry=1, requires expiryCheck.out=1; when hasExpiry=0, 0=0)
    signal expiryConstraint;
    expiryConstraint <== hasExpiry * expiryCheck.out;
    expiryConstraint === hasExpiry;
}

component main {public [credentialCommitment, issuerPublicKey, nowSec]} = AgentIdentity();
