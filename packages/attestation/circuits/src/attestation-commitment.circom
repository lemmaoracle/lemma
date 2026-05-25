pragma circom 2.1.0;
include "circomlib/circuits/poseidon.circom";

/**
 * AttestationCommitment — proves that an inference attestation's
 * commitment is well-formed, binding the model digest, attestation
 * token, claim hash, output hash, and nonce.
 *
 * Product B (Inference Attestation) circuit.
 * Circuit ID: attestation-commitment-v1
 *
 * Private inputs:
 *   modelDigest        Hash of the model used for inference
 *   attestationToken   Attestation token from the model host
 *   claimHash          Hash of the input claim
 *   outputHash         Hash of the inference output
 *   nonce              Freshness nonce
 *
 * Public inputs:
 *   claimedRoot        The asserted Poseidon5 commitment root
 *   timestampMin       Minimum acceptable timestamp
 *   timestampMax       Maximum acceptable timestamp
 *
 * Public output:
 *   root               Computed Poseidon5 commitment
 */
template AttestationCommitment() {
    signal input modelDigest;
    signal input attestationToken;
    signal input claimHash;
    signal input outputHash;
    signal input nonce;

    signal input claimedRoot;
    signal input timestampMin;
    signal input timestampMax;

    signal output root;

    component hasher = Poseidon(5);
    hasher.inputs[0] <== modelDigest;
    hasher.inputs[1] <== attestationToken;
    hasher.inputs[2] <== claimHash;
    hasher.inputs[3] <== outputHash;
    hasher.inputs[4] <== nonce;

    root <== hasher.out;
    root === claimedRoot;
}

component main {public [claimedRoot, timestampMin, timestampMax]} = AttestationCommitment();
