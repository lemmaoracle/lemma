pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";

/**
 * TransformExec — Verifiable file transformation execution proof.
 *
 * Proves that the prover knows file hashes (private) corresponding to
 * publicly claimed input/output commitments, and that this transform's
 * input is bound to the previous stage's output (infinite-depth chain).
 *
 * ── Chain binding ────────────────────────────────────────
 *
 * Each stage carries prevOutputCommitment as a public input.
 * The circuit enforces:
 *
 *   inputCommitment === prevOutputCommitment
 *
 * For the first stage (genesis), set prevOutputCommitment = inputCommitment.
 * The constraint is trivially satisfied — the stage proves its own
 * input/output binding.
 *
 * For subsequent stages, prevOutputCommitment = previous stage's
 * outputCommitment. A verifier checks the chain by confirming:
 *
 *   stage[n].prevOutputCommitment === stage[n-1].outputCommitment
 *
 * across all public signals. This binds a→b→...→z with no depth limit.
 *
 * ── Public inputs ────────────────────────────────────────
 *
 *   transformerId          SHA-256 hash of transform code (as field element)
 *   runtime                Runtime identifier (as field element)
 *   inputCommitment        Poseidon1(fileHash(inputBytes))
 *   outputCommitment       Poseidon1(fileHash(outputBytes))
 *   inputByteCount         Input file size in bytes
 *   outputByteCount        Output file size in bytes
 *   argsHash               Poseidon1(toScalar(args JSON))
 *   prevOutputCommitment   Previous stage's outputCommitment (= inputCommitment for genesis)
 *
 * ── Private inputs ──────────────────────────────────────
 *
 *   inputFileHash          Poseidon hash of input file bytes
 *   outputFileHash         Poseidon hash of output file bytes
 *
 * ── Constraints ─────────────────────────────────────────
 *
 *   1. inputCommitment  === Poseidon1(inputFileHash)
 *   2. outputCommitment === Poseidon1(outputFileHash)
 *   3. inputCommitment  === prevOutputCommitment   (chain binding)
 *
 * Constraint 3 is the chain binding. It costs zero extra constraints
 * (a single === assertion) but cryptographically binds this stage's
 * input to the previous stage's output.
 */
template TransformExec() {
    // Private inputs
    signal input inputFileHash;
    signal input outputFileHash;

    // Public inputs
    signal input transformerId;
    signal input runtime;
    signal input inputCommitment;
    signal input outputCommitment;
    signal input inputByteCount;
    signal input outputByteCount;
    signal input argsHash;
    signal input prevOutputCommitment;

    // Constraint 1: input commitment
    component inHasher = Poseidon(1);
    inHasher.inputs[0] <== inputFileHash;
    inputCommitment === inHasher.out;

    // Constraint 2: output commitment
    component outHasher = Poseidon(1);
    outHasher.inputs[0] <== outputFileHash;
    outputCommitment === outHasher.out;

    // Constraint 3: chain binding — this stage's input must equal
    // the previous stage's output (or itself for genesis).
    inputCommitment === prevOutputCommitment;
}

component main {public [transformerId, runtime, inputCommitment, outputCommitment, inputByteCount, outputByteCount, argsHash, prevOutputCommitment]} = TransformExec();
