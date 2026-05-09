// agent-identity-valid circuit
// Proves that an agent-identity-v1 credential is valid for a specific subject at a specific time
// with optional authorization class and action verification
//
// Public inputs:
// - commitmentRoot: the Poseidon Merkle root of normalized attributes
// - requestedSubjectIdHash: hash of the subject identifier being verified
// - currentTime: Unix timestamp (seconds) for validity check
//
// Private inputs (witness):
// - leaf hashes for each attribute
// - Merkle proof paths for each attribute
// - raw attribute values (for equality checks)

pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template AgentIdentityValid(nLevels) {
    // Public inputs
    signal input commitmentRoot;
    signal input requestedSubjectIdHash;
    signal input currentTime;
    
    // Private inputs: attribute hashes (leaves)
    signal input subjectIdHash;
    signal input authorizationClassHash;
    signal input actionHash;
    signal input notBeforeHash;
    signal input expiresAtHash;
    
    // Private inputs: Merkle proofs
    signal input subjectIdPathElements[nLevels];
    signal input subjectIdPathIndices[nLevels];
    
    signal input authorizationClassPathElements[nLevels];
    signal input authorizationClassPathIndices[nLevels];
    
    signal input actionPathElements[nLevels];
    signal input actionPathIndices[nLevels];
    
    signal input notBeforePathElements[nLevels];
    signal input notBeforePathIndices[nLevels];
    
    signal input expiresAtPathElements[nLevels];
    signal input expiresAtPathIndices[nLevels];
    
    // Private inputs: raw values for equality checks (hashed for comparison)
    signal input subjectIdValue;
    signal input authorizationClassValue; // "act", "delegate", or empty string
    signal input actionValue; // action string or empty
    signal input notBeforeValue; // Unix timestamp (seconds)
    signal input expiresAtValue; // Unix timestamp (seconds)
    
    // === 1. Verify each attribute is in the commitment root ===
    
    // Verify subjectId inclusion
    component subjectIdVerifier = MerkleProofChecker(nLevels);
    subjectIdVerifier.root <== commitmentRoot;
    subjectIdVerifier.leaf <== subjectIdHash;
    for (var i = 0; i < nLevels; i++) {
        subjectIdVerifier.pathElements[i] <== subjectIdPathElements[i];
        subjectIdVerifier.pathIndices[i] <== subjectIdPathIndices[i];
    }
    
    // Verify authorizationClass inclusion
    component authorizationClassVerifier = MerkleProofChecker(nLevels);
    authorizationClassVerifier.root <== commitmentRoot;
    authorizationClassVerifier.leaf <== authorizationClassHash;
    for (var i = 0; i < nLevels; i++) {
        authorizationClassVerifier.pathElements[i] <== authorizationClassPathElements[i];
        authorizationClassVerifier.pathIndices[i] <== authorizationClassPathIndices[i];
    }
    
    // Verify action inclusion
    component actionVerifier = MerkleProofChecker(nLevels);
    actionVerifier.root <== commitmentRoot;
    actionVerifier.leaf <== actionHash;
    for (var i = 0; i < nLevels; i++) {
        actionVerifier.pathElements[i] <== actionPathElements[i];
        actionVerifier.pathIndices[i] <== actionPathIndices[i];
    }
    
    // Verify notBefore inclusion
    component notBeforeVerifier = MerkleProofChecker(nLevels);
    notBeforeVerifier.root <== commitmentRoot;
    notBeforeVerifier.leaf <== notBeforeHash;
    for (var i = 0; i < nLevels; i++) {
        notBeforeVerifier.pathElements[i] <== notBeforePathElements[i];
        notBeforeVerifier.pathIndices[i] <== notBeforePathIndices[i];
    }
    
    // Verify expiresAt inclusion
    component expiresAtVerifier = MerkleProofChecker(nLevels);
    expiresAtVerifier.root <== commitmentRoot;
    expiresAtVerifier.leaf <== expiresAtValue;
    for (var i = 0; i < nLevels; i++) {
        expiresAtVerifier.pathElements[i] <== expiresAtPathElements[i];
        expiresAtVerifier.pathIndices[i] <== expiresAtPathIndices[i];
    }
    
    // === 2. Verify attribute values match provided leaf hashes ===
    
    // Hash raw values and compare with provided leaf hashes
    component hashSubjectId = Poseidon(1);
    hashSubjectId.inputs[0] <== subjectIdValue;
    hashSubjectId.out === subjectIdHash;
    
    component hashAuthorizationClass = Poseidon(1);
    hashAuthorizationClass.inputs[0] <== authorizationClassValue;
    hashAuthorizationClass.out === authorizationClassHash;
    
    component hashAction = Poseidon(1);
    hashAction.inputs[0] <== actionValue;
    hashAction.out === actionHash;
    
    component hashNotBefore = Poseidon(1);
    hashNotBefore.inputs[0] <== notBeforeValue;
    hashNotBefore.out === notBeforeHash;
    
    component hashExpiresAt = Poseidon(1);
    hashExpiresAt.inputs[0] <== expiresAtValue;
    hashExpiresAt.out === expiresAtHash;
    
    // === 3. Verify requested subject ID matches ===
    
    // Subject ID must match
    requestedSubjectIdHash === subjectIdHash;
    
    // === 4. Verify time validity ===
    
    // notBefore <= currentTime
    component notBeforeCheck = LessEqThan(32); // 32-bit timestamps
    notBeforeCheck.in[0] <== notBeforeValue;
    notBeforeCheck.in[1] <== currentTime;
    notBeforeCheck.out === 1;
    
    // currentTime <= expiresAt
    component expiresAtCheck = LessEqThan(32);
    expiresAtCheck.in[0] <== currentTime;
    expiresAtCheck.in[1] <== expiresAtValue;
    expiresAtCheck.out === 1;
    
    // === 5. Optional: Verify authorization class and action constraints ===
    // These checks can be commented out or enabled based on verification needs
    // For example, to require authorizationClass to be "act":
    // authorizationClassValue === 12345 // hash of "act"
    
    // To require a specific action:
    // actionValue === 67890 // hash of specific action string
}

// Merkle proof verification template
template MerkleProofChecker(nLevels) {
    signal input root;
    signal input leaf;
    signal input pathElements[nLevels];
    signal input pathIndices[nLevels];
    
    signal output out;
    
    component hashers[nLevels];
    signal computedRoot[nLevels + 1];
    
    computedRoot[0] <== leaf;
    
    for (var i = 0; i < nLevels; i++) {
        hashers[i] = Poseidon(2);
        
        // Order depends on path index
        // If pathIndices[i] == 0, leaf is left, pathElements[i] is right
        // If pathIndices[i] == 1, leaf is right, pathElements[i] is left
        hashers[i].inputs[0] <== pathIndices[i] == 0 ? computedRoot[i] : pathElements[i];
        hashers[i].inputs[1] <== pathIndices[i] == 0 ? pathElements[i] : computedRoot[i];
        
        computedRoot[i + 1] <== hashers[i].out;
    }
    
    root === computedRoot[nLevels];
    out <== 1;
}

// Main component for export
component main {public [commitmentRoot, requestedSubjectIdHash, currentTime]} = AgentIdentityValid(20); // 20 levels for 2^20 leaves