/**
 * ExecutionRecord — the structured output of a transform execution.
 *
 * Every field here maps 1:1 to a circuit public signal. The WASM runner
 * produces this record after executing a transform; the proof circuit
 * verifies its cryptographic consistency.
 *
 * Chain semantics:
 *   prevOutputCommitment === inputCommitment  (genesis: both are the same value)
 *   For subsequent stages, prevOutputCommitment = previous stage's outputCommitment.
 */
export type ExecutionRecord = Readonly<{
  /** SHA-256 hash of transform code, as decimal string (field element) */
  readonly transformerId: string;
  /** Runtime identifier, as decimal string (field element) */
  readonly runtime: string;
  /** Poseidon1(fileHash(inputBytes)), as decimal string */
  readonly inputCommitment: string;
  /** Poseidon1(fileHash(outputBytes)), as decimal string */
  readonly outputCommitment: string;
  /** Input file size in bytes */
  readonly inputByteCount: number;
  /** Output file size in bytes */
  readonly outputByteCount: number;
  /** Poseidon1(toScalar(args JSON)), as decimal string */
  readonly argsHash: string;
  /** Previous stage's outputCommitment (= inputCommitment for genesis) */
  readonly prevOutputCommitment: string;
}>;

/**
 * Private witness inputs for the transform-exec circuit.
 * These are NOT part of the public record.
 */
export type TransformWitness = Readonly<{
  /** Poseidon hash of input file bytes (via bytesToFieldElements + reduceElements) */
  readonly inputFileHash: bigint;
  /** Poseidon hash of output file bytes */
  readonly outputFileHash: bigint;
}>;

/**
 * Full proof payload — public signals + private witness.
 */
export type TransformProofInput = Readonly<{
  readonly record: ExecutionRecord;
  readonly witness: TransformWitness;
}>;

/**
 * Ordered public signals for the circuit (matches circom declaration order).
 *
 * Circuit public inputs order:
 *   transformerId, runtime, inputCommitment, outputCommitment,
 *   inputByteCount, outputByteCount, argsHash, prevOutputCommitment
 */
export const toPublicSignals = (record: ExecutionRecord): string[] => [
  record.transformerId,
  record.runtime,
  record.inputCommitment,
  record.outputCommitment,
  String(record.inputByteCount),
  String(record.outputByteCount),
  record.argsHash,
  record.prevOutputCommitment,
];

/**
 * Ordered private inputs for the circuit (matches circom declaration order).
 *
 * Circuit private inputs order:
 *   inputFileHash, outputFileHash
 */
export const toPrivateInputs = (witness: TransformWitness): Record<string, string> => ({
  inputFileHash: witness.inputFileHash.toString(),
  outputFileHash: witness.outputFileHash.toString(),
});

/**
 * Full witness input for snarkjs groth16.fullProve.
 */
export const toWitnessInput = (input: TransformProofInput): Record<string, string> => ({
  ...toPrivateInputs(input.witness),
  transformerId: input.record.transformerId,
  runtime: input.record.runtime,
  inputCommitment: input.record.inputCommitment,
  outputCommitment: input.record.outputCommitment,
  inputByteCount: String(input.record.inputByteCount),
  outputByteCount: String(input.record.outputByteCount),
  argsHash: input.record.argsHash,
  prevOutputCommitment: input.record.prevOutputCommitment,
});
