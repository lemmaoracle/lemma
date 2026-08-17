/**
 * Transform runner — executes a transform and builds the ExecutionRecord.
 *
 * The runner is a pure JS function: given a transform function, input bytes,
 * and args, it:
 *   1. Executes the transform (pluggable: JS function, WASM module, etc.)
 *   2. Computes file hashes using the content-commitment normalizer
 *   3. Computes transformerId (SHA-256 of transform code)
 *   4. Computes argsHash (Poseidon1(toScalar(canonicalize(args))))
 *   5. Returns the ExecutionRecord + private witness
 *
 * Chain binding: pass prevOutputCommitment from the previous stage.
 * For genesis (first stage), pass the inputCommitment itself.
 */
import { sha256 } from "@noble/hashes/sha256";
import { poseidon1, poseidon2 } from "poseidon-lite";
import {
  bytesToFieldElements,
  reduceElements,
} from "@lemmaoracle/content";
import { canonicalize } from "@lemmaoracle/sdk";
import type {
  ExecutionRecord,
  TransformWitness,
  TransformProofInput,
} from "./schema.js";

/** Default runtime identifier (numeric field element) */
const RUNTIME_JS = "1"; // 1 = js-native, 2 = wasm-standalone, 3 = wasm-browser

/**
 * Compute Poseidon file hash (same as content-commitment-v1).
 * bytes → fieldElements → iterative Poseidon2 reduction → single field element.
 */
export const fileHash = (bytes: Uint8Array): bigint => {
  const elements = bytesToFieldElements(bytes);
  return reduceElements(elements, poseidon2);
};

/**
 * Compute Poseidon1(fileHash(bytes)) — the public commitment.
 */
export const fileCommitment = (bytes: Uint8Array): bigint => {
  return poseidon1([fileHash(bytes)]);
};

/**
 * Compute SHA-256 of a byte array, returned as a decimal string (field element).
 */
export const sha256Field = (bytes: Uint8Array): string => {
  const hash = sha256(bytes);
  // Convert 32-byte hash to BigInt, then to decimal string
  let val = 0n;
  for (const byte of hash) {
    val = (val << 8n) | BigInt(byte);
  }
  return val.toString();
};

/**
 * Compute argsHash: Poseidon1(toScalar(canonicalize(args))).
 *
 * toScalar maps strings via SHA-256 mod prime (SDK behavior).
 * canonicalize ensures deterministic JSON serialization.
 */
export const computeArgsHash = (args: unknown): bigint => {
  const canonical = canonicalize(args as import("@lemmaoracle/sdk").Json);
  const hashHex = Buffer.from(sha256(Buffer.from(canonical, "utf-8"))).toString(
    "hex",
  );
  const scalar = BigInt("0x" + hashHex);
  return poseidon1([scalar]);
};

/**
 * Transform function type — receives input bytes + args, returns output bytes.
 *
 * This is the pluggable transform interface. In production, this could be:
 * - A JS function (for simple transforms like CSV→JSON)
 * - A WASM module invocation (for complex formats like PDF generation)
 * - A sandboxed execution of user-provided code
 */
export type TransformFn = (
  input: Uint8Array,
  args: unknown,
) => Promise<Uint8Array> | Uint8Array;

/**
 * Build a genesis ExecutionRecord (first stage in a chain).
 *
 * For the first stage, prevOutputCommitment = inputCommitment
 * (the circuit's chain-binding constraint is trivially satisfied).
 */
export const buildGenesisRecord = async (
  transformFn: TransformFn,
  transformCode: Uint8Array,
  inputBytes: Uint8Array,
  args: unknown,
): Promise<TransformProofInput> => {
  const outputBytes = await transformFn(inputBytes, args);

  const inHash = fileHash(inputBytes);
  const outHash = fileHash(outputBytes);
  const inCommitment = poseidon1([inHash]);
  const outCommitment = poseidon1([outHash]);

  const record: ExecutionRecord = {
    transformerId: sha256Field(transformCode),
    runtime: RUNTIME_JS,
    inputCommitment: inCommitment.toString(),
    outputCommitment: outCommitment.toString(),
    inputByteCount: inputBytes.length,
    outputByteCount: outputBytes.length,
    argsHash: computeArgsHash(args).toString(),
    // Genesis: prevOutputCommitment = inputCommitment (trivially satisfies chain binding)
    prevOutputCommitment: inCommitment.toString(),
  };

  const witness: TransformWitness = {
    inputFileHash: inHash,
    outputFileHash: outHash,
  };

  return { record, witness };
};

/**
 * Build a chained ExecutionRecord (non-genesis stage).
 *
 * prevOutputCommitment is set to the previous stage's outputCommitment,
 * creating the chain binding: this stage's input MUST equal the previous
 * stage's output.
 */
export const buildChainedRecord = async (
  transformFn: TransformFn,
  transformCode: Uint8Array,
  inputBytes: Uint8Array,
  args: unknown,
  prevOutputCommitment: string,
): Promise<TransformProofInput> => {
  const outputBytes = await transformFn(inputBytes, args);

  const inHash = fileHash(inputBytes);
  const outHash = fileHash(outputBytes);
  const inCommitment = poseidon1([inHash]);
  const outCommitment = poseidon1([outHash]);

  const record: ExecutionRecord = {
    transformerId: sha256Field(transformCode),
    runtime: RUNTIME_JS,
    inputCommitment: inCommitment.toString(),
    outputCommitment: outCommitment.toString(),
    inputByteCount: inputBytes.length,
    outputByteCount: outputBytes.length,
    argsHash: computeArgsHash(args).toString(),
    // Chain binding: previous stage's output becomes this stage's prev
    prevOutputCommitment,
  };

  const witness: TransformWitness = {
    inputFileHash: inHash,
    outputFileHash: outHash,
  };

  return { record, witness };
};

/**
 * Verify a chain of ExecutionRecords is well-formed (off-circuit check).
 *
 * For a valid chain:
 *   records[0].prevOutputCommitment === records[0].inputCommitment  (genesis)
 *   records[n].prevOutputCommitment === records[n-1].outputCommitment  (chain)
 */
export const verifyChain = (records: readonly ExecutionRecord[]): boolean => {
  if (records.length === 0) return false;

  // Genesis: prevOutputCommitment must equal inputCommitment
  const genesis = records[0];
  if (!genesis || genesis.prevOutputCommitment !== genesis.inputCommitment) {
    return false;
  }

  // Chain: each stage's prev must equal previous stage's output
  for (let i = 1; i < records.length; i++) {
    const prev = records[i - 1];
    const curr = records[i];
    if (!prev || !curr || curr.prevOutputCommitment !== prev.outputCommitment) {
      return false;
    }
  }

  return true;
};
