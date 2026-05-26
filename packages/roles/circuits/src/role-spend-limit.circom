pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

/**
 * RoleSpendLimit — proves an agent holds a required role AND their
 * spend limit falls within a payment gate ceiling.
 *
 * Circuit ID: role-spend-limit-v1
 *
 * Private inputs:
 *   credentialCommitment       Poseidon commitment to the agent's normalized credential
 *   roleHash                   Hash of the role the agent claims
 *   spendLimit                 Agent's spend limit from the credential (USD cents)
 *   salt                       Binding randomness
 *
 * Public inputs:
 *   requiredRoleHash           Hash of the role required by the payment gate
 *   maxSpend                   Ceiling imposed by the gate (USD cents)
 *   nowSec                     Current unix timestamp
 *   roleGateCommitment         Poseidon4(credentialCommitment, roleHash, spendLimit, salt)
 *   credentialCommitmentPublic Same as private credentialCommitment (for cross-proof correlation)
 *
 * Constraints:
 *   1. roleHash === requiredRoleHash        (agent has the role)
 *   2. spendLimit <= maxSpend               (within gate ceiling)
 *   3. Poseidon4(commitment, roleHash, spendLimit, salt) === roleGateCommitment
 *                                            (binding integrity)
 *   4. credentialCommitment === credentialCommitmentPublic
 *                                            (cross-proof correlation)
 */

template RoleSpendLimit() {
    // ── Private ─────────────────────────────────────────────────────
    signal input credentialCommitment;
    signal input roleHash;
    signal input spendLimit;
    signal input salt;

    // ── Public ──────────────────────────────────────────────────────
    signal input requiredRoleHash;
    signal input maxSpend;
    signal input nowSec;
    signal input roleGateCommitment;
    signal input credentialCommitmentPublic;

    // 1. Role membership: private roleHash must match the public requirement
    roleHash === requiredRoleHash;

    // 2. Spend ceiling: spendLimit ≤ maxSpend
    component leq = LessEqThan(128);
    leq.in[0] <== spendLimit;
    leq.in[1] <== maxSpend;
    leq.out === 1;

    // 3. Binding: Poseidon4 ties all private fields to a separate commitment
    component binder = Poseidon(4);
    binder.inputs[0] <== credentialCommitment;
    binder.inputs[1] <== roleHash;
    binder.inputs[2] <== spendLimit;
    binder.inputs[3] <== salt;
    binder.out === roleGateCommitment;

    // 4. Cross-proof correlation: private commitment matches public value
    credentialCommitment === credentialCommitmentPublic;
}

component main {public [requiredRoleHash, maxSpend, nowSec, roleGateCommitment, credentialCommitmentPublic]} = RoleSpendLimit();
