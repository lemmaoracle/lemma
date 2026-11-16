pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";

/**
 * AccountChangeV1 — proof for a bank-account change request
 * (ProofGate / GENIAC design v1.1).
 *
 * Circuit ID: account-change-v1
 *
 * Statement proven (one sentence):
 *   A representative who (a) is registered in the verifier's vendor
 *   registry *before* the change request was received, and (b) holds the
 *   account-change role, approves *this* old -> new account change,
 *   for *this* verifier (audience) and *this* gate-issued challenge.
 *   The new account is held in the vendor's own registered legal name and
 *   is bound to bank-side account-control evidence.
 *
 * Five bindings (design v1.1):
 *   1. Subject  — credential leaf inclusion in registryRoot (Merkle) +
 *                 knowledge of the representative secret key.
 *   2. Content  — newAccountHash / oldAccountHash are gate-fixed public
 *                 inputs; the prover opens newAccountHash from the actual
 *                 account fields, so a proof cannot be re-pointed at a
 *                 different account.
 *   3. Holder   — the new account's holder-name hash must equal the legal
 *                 name hash inside the registered credential. Even a
 *                 leaked representative key cannot divert funds to an
 *                 account held under a third party's name.
 *   4. Context  — contextHash is *derived in-circuit* from its public
 *                 components (audience, request digest, challenge window,
 *                 registry root, policy hash); it is never prover-supplied.
 *                 nullifier = Poseidon2(credentialCommitment, challengeId)
 *                 is a stable deduplication key for (credential, challenge):
 *                 Groth16 proofs are re-randomizable, so the proof bytes
 *                 themselves cannot serve that role. Replay prevention is
 *                 completed by the gate consuming the challenge atomically.
 *   5. Execution — off-circuit gate policy (see package README): the gate
 *                 fixes every GateInput below, checks the bank evidence
 *                 itself, re-checks root freshness / expiry at commit time,
 *                 consumes the challenge, and registers exactly the account
 *                 whose hash was proven.
 *
 * GateInput (gate-fixed public inputs):
 *   registryRoot, requiredRoleHash, vendorId, oldAccountHash,
 *   newAccountHash, audienceHash, requestDigest, requestReceivedAt,
 *   challengeId, challengeIssuedAt, challengeExpiresAt, policyHash
 *
 * Prover-selected public input:
 *   credentialCommitment — chosen by the prover, but bound by the
 *   Merkle inclusion check against the gate-fixed registryRoot.
 *
 * Gate-derived public input:
 *   isFirst — the gate derives it from its own records, and the circuit
 *   forces it to equal IsZero(oldAccountHash), so neither side can
 *   present an inconsistent value.
 *
 * ProvenInput (prover-supplied public input):
 *   bankEvidenceHash — hash of bank-side account-control evidence (e.g. a
 *   challenge code observed in the new account's transaction history).
 *   The circuit only binds it into the attestation; the gate verifies the
 *   evidence itself before accepting. Its truth is NOT proven here.
 *
 * Public outputs:
 *   contextHash            Poseidon derivation over the context components
 *   attestationCommitment  Poseidon5(credentialCommitment, oldAccountHash,
 *                          newAccountHash, bankEvidenceHash, contextHash)
 *   nullifier              Poseidon2(credentialCommitment, challengeId)
 *
 * Credential leaf (leaf == credentialCommitment), following the
 * agent-identity sub-hash layout:
 *   identityHash  = Poseidon2(vendorId, repPubKey)
 *   authorityHash = Poseidon2(roleHash, legalNameHash)
 *   lifecycleHash = Poseidon4(status, validFrom, validUntil, registeredAt)
 *   credentialCommitment = Poseidon4(identityHash, authorityHash,
 *                                    lifecycleHash, credentialSalt)
 *   repPubKey = Poseidon1(repSecret), status: 1 = active.
 *
 * Account hash (canonical encoding; numeric fields are parsed as
 * fixed-width decimals off-circuit so leading zeros are preserved, and
 * the holder name is normalized off-circuit — both sides MUST use the
 * same normalizer):
 *   newAccountHash = Poseidon6(ACCOUNT_DOMAIN, bankCode, branchCode,
 *                              accountType, accountNumber, holderNameHash)
 *
 * What this circuit does NOT prove (design v1.1, stated up front):
 *   - that the account exists on the bank's ledger (the evidence source
 *     carries that truth; the circuit only binds its hash),
 *   - that the representative was not deceived into approving,
 *   - that the initial registry enrollment was correct.
 *   Public signals are for off-chain gate verification only: an unsalted
 *   account hash is brute-forceable and MUST NOT be published on-chain.
 *
 * The Merkle checker is the boolean-constrained quadratic-mux version
 * from listing-binding.circom (the ternary-expression variants in
 * data-commitment / agent-identity-valid do not constrain path indices
 * to be boolean and are deliberately not reused).
 *
 * Constraint count: 8,628 (circom 2.1.9; depth-20 Poseidon Merkle dominates) -> 2^15 ptau.
 */

// ── MerkleProofChecker (Poseidon2 nodes; quadratic Mux) ─────────────
// Copied from packages/roles/circuits/src/listing-binding.circom.

template MerkleProofChecker(nLevels) {
    signal input leaf;
    signal input root;
    signal input pathElements[nLevels];
    signal input pathIndices[nLevels];

    component hashers[nLevels];
    signal levelHashes[nLevels + 1];
    // Intermediate for quadratic mux: s * (sibling - current)
    signal muxDiff[nLevels];

    levelHashes[0] <== leaf;

    var i;
    for (i = 0; i < nLevels; i++) {
        // pathIndices must be boolean
        pathIndices[i] * (pathIndices[i] - 1) === 0;

        // s=0 → left=current, right=sibling
        // s=1 → left=sibling, right=current
        muxDiff[i] <== pathIndices[i] * (pathElements[i] - levelHashes[i]);

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== levelHashes[i] + muxDiff[i];
        hashers[i].inputs[1] <== pathElements[i] - muxDiff[i];

        levelHashes[i + 1] <== hashers[i].out;
    }

    levelHashes[nLevels] === root;
}

// ── AccountChangeV1 ─────────────────────────────────────────────

// Domain tags (v1 assignments; to be fixed in the circuit registry).
//   1101 = bank account tuple, 1102/1103 = context derivation branches.

template AccountChangeV1(nLevels) {
    // ── Private inputs: credential ──────────────────────────────────
    signal input repSecret;        // representative's secret key
    signal input roleHash;         // role inside the credential
    signal input legalNameHash;    // vendor legal name hash (normalized)
    signal input credentialStatus; // 1 = active
    signal input validFrom;        // credential validity start (unix sec)
    signal input validUntil;       // credential validity end (unix sec)
    signal input registeredAt;     // when the credential was registered
    signal input credentialSalt;   // blinding for credentialCommitment
    signal input merklePath[nLevels];
    signal input merkleIndices[nLevels];

    // ── Private inputs: new account fields ──────────────────────────
    signal input bankCode;
    signal input branchCode;
    signal input accountType;      // e.g. 1 = ordinary (futsu), 2 = current (toza)
    signal input accountNumber;
    signal input holderNameHash;   // normalized holder name hash

    // ── Public inputs (GateInput: fixed by the gate) ────────────────
    signal input registryRoot;
    signal input credentialCommitment;
    signal input requiredRoleHash;
    signal input vendorId;
    signal input oldAccountHash;   // 0 iff first registration
    signal input newAccountHash;
    signal input isFirst;          // must equal IsZero(oldAccountHash)
    signal input audienceHash;     // verifier (recipient of the change)
    signal input requestDigest;    // digest of the change request as received
    signal input requestReceivedAt;
    signal input challengeId;
    signal input challengeIssuedAt;
    signal input challengeExpiresAt;
    signal input policyHash;       // hash of the statement/policy version

    // ── Public input (ProvenInput: prover-supplied, gate-verified) ──
    signal input bankEvidenceHash;

    // ── Public outputs ──────────────────────────────────────────────
    signal output contextHash;
    signal output attestationCommitment;
    signal output nullifier;

    // ── 1. Subject: key possession + credential commitment ──────────
    component pkDeriver = Poseidon(1);
    pkDeriver.inputs[0] <== repSecret;
    // repPubKey is an intermediate; it enters identityHash below.

    component identityHasher = Poseidon(2);
    identityHasher.inputs[0] <== vendorId;
    identityHasher.inputs[1] <== pkDeriver.out;

    component authorityHasher = Poseidon(2);
    authorityHasher.inputs[0] <== roleHash;
    authorityHasher.inputs[1] <== legalNameHash;

    component lifecycleHasher = Poseidon(4);
    lifecycleHasher.inputs[0] <== credentialStatus;
    lifecycleHasher.inputs[1] <== validFrom;
    lifecycleHasher.inputs[2] <== validUntil;
    lifecycleHasher.inputs[3] <== registeredAt;

    component commitmentHasher = Poseidon(4);
    commitmentHasher.inputs[0] <== identityHasher.out;
    commitmentHasher.inputs[1] <== authorityHasher.out;
    commitmentHasher.inputs[2] <== lifecycleHasher.out;
    commitmentHasher.inputs[3] <== credentialSalt;
    commitmentHasher.out === credentialCommitment;

    // ── 2. Subject: registry inclusion (leaf == credentialCommitment) ─
    component merkle = MerkleProofChecker(nLevels);
    merkle.leaf <== credentialCommitment;
    merkle.root <== registryRoot;
    var i;
    for (i = 0; i < nLevels; i++) {
        merkle.pathElements[i] <== merklePath[i];
        merkle.pathIndices[i] <== merkleIndices[i];
    }

    // ── 3. Authority: role + active status ──────────────────────────
    roleHash === requiredRoleHash;
    credentialStatus === 1;

    // ── 4. Holder binding: account holder == registered legal name ──
    holderNameHash === legalNameHash;

    // ── 5. Content binding: open the gate-fixed new account hash ────
    component accountHasher = Poseidon(6);
    accountHasher.inputs[0] <== 1101; // ACCOUNT_DOMAIN
    accountHasher.inputs[1] <== bankCode;
    accountHasher.inputs[2] <== branchCode;
    accountHasher.inputs[3] <== accountType;
    accountHasher.inputs[4] <== accountNumber;
    accountHasher.inputs[5] <== holderNameHash;
    accountHasher.out === newAccountHash;

    // ── 6. First-registration consistency ───────────────────────────
    // isFirst is not a free flag: it must equal IsZero(oldAccountHash).
    isFirst * (isFirst - 1) === 0;
    component oldIsZero = IsZero();
    oldIsZero.in <== oldAccountHash;
    isFirst === oldIsZero.out;

    // ── 7. Time bindings (all 64-bit ranged) ────────────────────────
    // Range-bind every time value to 64 bits first. Without this, a
    // field element of the form r-k (a "negative" timestamp) wraps
    // through LessEqThan's internal (a + 2^n - b) decomposition and
    // reads as a very small timestamp, defeating the ordering checks
    // below (review M-1). Num2Bits(64) makes any value >= 2^64 — and
    // any wrapped r-k value — unsatisfiable.
    component validFromBits = Num2Bits(64);
    validFromBits.in <== validFrom;
    component validUntilBits = Num2Bits(64);
    validUntilBits.in <== validUntil;
    component registeredAtBits = Num2Bits(64);
    registeredAtBits.in <== registeredAt;
    component requestReceivedAtBits = Num2Bits(64);
    requestReceivedAtBits.in <== requestReceivedAt;
    component challengeIssuedAtBits = Num2Bits(64);
    challengeIssuedAtBits.in <== challengeIssuedAt;
    component challengeExpiresAtBits = Num2Bits(64);
    challengeExpiresAtBits.in <== challengeExpiresAt;

    // Credential must cover the whole challenge window:
    //   validFrom <= challengeIssuedAt < challengeExpiresAt <= validUntil
    component validFromCheck = LessEqThan(64);
    validFromCheck.in[0] <== validFrom;
    validFromCheck.in[1] <== challengeIssuedAt;
    validFromCheck.out === 1;

    component windowCheck = LessThan(64);
    windowCheck.in[0] <== challengeIssuedAt;
    windowCheck.in[1] <== challengeExpiresAt;
    windowCheck.out === 1;

    component validUntilCheck = LessEqThan(64);
    validUntilCheck.in[0] <== challengeExpiresAt;
    validUntilCheck.in[1] <== validUntil;
    validUntilCheck.out === 1;

    // Registration must predate the request, and the request must
    // predate the challenge (v1.1: this ordering was stated in v1's
    // prose but not constrained; it is constrained here).
    component registeredCheck = LessEqThan(64);
    registeredCheck.in[0] <== registeredAt;
    registeredCheck.in[1] <== requestReceivedAt;
    registeredCheck.out === 1;

    component receivedCheck = LessEqThan(64);
    receivedCheck.in[0] <== requestReceivedAt;
    receivedCheck.in[1] <== challengeIssuedAt;
    receivedCheck.out === 1;

    // ── 8. Context derivation (in-circuit; never prover-supplied) ───
    component ctxA = Poseidon(4);
    ctxA.inputs[0] <== 1102; // CONTEXT_DOMAIN_A
    ctxA.inputs[1] <== audienceHash;
    ctxA.inputs[2] <== vendorId;
    ctxA.inputs[3] <== requestDigest;

    component ctxB = Poseidon(4);
    ctxB.inputs[0] <== 1103; // CONTEXT_DOMAIN_B
    ctxB.inputs[1] <== challengeId;
    ctxB.inputs[2] <== challengeIssuedAt;
    ctxB.inputs[3] <== challengeExpiresAt;

    component ctxHasher = Poseidon(4);
    ctxHasher.inputs[0] <== ctxA.out;
    ctxHasher.inputs[1] <== ctxB.out;
    ctxHasher.inputs[2] <== registryRoot;
    ctxHasher.inputs[3] <== policyHash;
    contextHash <== ctxHasher.out;

    // ── 9. Attestation + nullifier ──────────────────────────────────
    component attHasher = Poseidon(5);
    attHasher.inputs[0] <== credentialCommitment;
    attHasher.inputs[1] <== oldAccountHash;
    attHasher.inputs[2] <== newAccountHash;
    attHasher.inputs[3] <== bankEvidenceHash;
    attHasher.inputs[4] <== contextHash;
    attestationCommitment <== attHasher.out;

    component nullHasher = Poseidon(2);
    nullHasher.inputs[0] <== credentialCommitment;
    nullHasher.inputs[1] <== challengeId;
    nullifier <== nullHasher.out;
}

// Default: 20 levels = 2^20 ≈ 1M max registered credentials.
component main {
    public [
        registryRoot, credentialCommitment, requiredRoleHash, vendorId,
        oldAccountHash, newAccountHash, isFirst, audienceHash,
        requestDigest, requestReceivedAt, challengeId, challengeIssuedAt,
        challengeExpiresAt, policyHash, bankEvidenceHash
    ]
} = AccountChangeV1(20);
