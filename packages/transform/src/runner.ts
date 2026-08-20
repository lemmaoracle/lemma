/**
 * Transform runner — executes a transform and builds the ExecutionRecord.
 *
 * The runner executes the transform (pluggable: JS function, WASM module,
 * etc.), then delegates the cryptographic binding to the Rust WASM
 * normalizer (`normalize/`), which — given input bytes, transform code,
 * output bytes, and canonical args — computes inside WASM:
 *
 *   1. inputCommitment / outputCommitment (Poseidon over the
 *      content-commitment-v1 byte→field pipeline)
 *   2. transformerId (SHA-256 of the transform code)
 *   3. argsHash (Poseidon1 of SHA-256(canonicalize(args)))
 *
 * This binds input file + transform logic + output file into one canonical
 * record. The JS helpers below (fileHash, fileCommitment, sha256Field,
 * computeArgsHash) remain as the reference implementation for standalone
 * commitment checks; the WASM is bit-identical to them.
 *
 * Chain binding: pass prevOutputCommitment from the previous stage.
 * For genesis (first stage), pass the inputCommitment itself.
 *
 * Environment-agnostic: the caller supplies the WASM binary bytes
 * (Node: fs.readFile, browser: fetch) — this module never touches the
 * filesystem or any other Node-only API.
 */
import { sha256 } from "@noble/hashes/sha2";
import { poseidon1, poseidon2 } from "poseidon-lite";
import {
  bytesToFieldElements,
  reduceElements,
} from "@lemmaoracle/content";
import { canonicalize } from "@lemmaoracle/sdk";
import initNormalizer, { bind as bindNormalizer } from "./wasm/lemma_transform.js";
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
  return hash.reduce((val, byte) => (val << 8n) | BigInt(byte), 0n).toString();
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

// ── WASM normalizer loading ─────────────────────────────────────────────

// imperative: memoized one-time WASM instantiation — module-level cache
// eslint-disable-next-line functional/no-let
let normalizerReady: Promise<typeof bindNormalizer> | undefined;

/**
 * Instantiate the WASM normalizer from caller-supplied binary bytes and
 * resolve to its `bind` entry point. wasm-bindgen init is one-time per
 * module: the first call instantiates, later calls reuse the same
 * instance (the bytes argument is ignored then).
 */
const loadNormalizer = (
  wasmBytes: Uint8Array,
): Promise<typeof bindNormalizer> =>
  (normalizerReady ??= initNormalizer({ module_or_path: wasmBytes }).then(
    (_init) => bindNormalizer,
  ));

/** JSON payload returned by the WASM `bind` entry point. */
type BoundExecution = Readonly<{
  record: ExecutionRecord;
  witness: Readonly<{
    inputFileHash: string;
    outputFileHash: string;
  }>;
}>;

/**
 * Delegate the execution binding to the WASM normalizer: commitments,
 * transformerId, argsHash, and byte counts are all computed inside Rust.
 */
const bindExecution = async (
  wasmBytes: Uint8Array,
  inputBytes: Uint8Array,
  outputBytes: Uint8Array,
  transformCode: Uint8Array,
  args: unknown,
  prevOutputCommitment?: string,
): Promise<TransformProofInput> => {
  const bind = await loadNormalizer(wasmBytes);
  const canonical = canonicalize(args as import("@lemmaoracle/sdk").Json);
  const bound = JSON.parse(
    bind(
      inputBytes,
      outputBytes,
      transformCode,
      canonical,
      RUNTIME_JS,
      prevOutputCommitment ?? null,
    ),
  ) as BoundExecution;
  const witness: TransformWitness = {
    inputFileHash: BigInt(bound.witness.inputFileHash),
    outputFileHash: BigInt(bound.witness.outputFileHash),
  };
  return { record: bound.record, witness };
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
 *
 * `wasmBytes` is the `lemma_transform_bg.wasm` binary, supplied by the
 * caller (Node: fs.readFile, browser: fetch).
 */
export const buildGenesisRecord = async (
  wasmBytes: Uint8Array,
  transformFn: TransformFn,
  transformCode: Uint8Array,
  inputBytes: Uint8Array,
  args: unknown,
): Promise<TransformProofInput> => {
  const outputBytes = await transformFn(inputBytes, args);
  return bindExecution(wasmBytes, inputBytes, outputBytes, transformCode, args);
};

/**
 * Build a chained ExecutionRecord (non-genesis stage).
 *
 * prevOutputCommitment is set to the previous stage's outputCommitment,
 * creating the chain binding: this stage's input MUST equal the previous
 * stage's output.
 *
 * `wasmBytes` is the `lemma_transform_bg.wasm` binary, supplied by the
 * caller (Node: fs.readFile, browser: fetch).
 */
export const buildChainedRecord = async (
  wasmBytes: Uint8Array,
  transformFn: TransformFn,
  transformCode: Uint8Array,
  inputBytes: Uint8Array,
  args: unknown,
  prevOutputCommitment: string,
): Promise<TransformProofInput> => {
  const outputBytes = await transformFn(inputBytes, args);
  return bindExecution(
    wasmBytes,
    inputBytes,
    outputBytes,
    transformCode,
    args,
    prevOutputCommitment,
  );
};

/**
 * Verify a chain of ExecutionRecords is well-formed (off-circuit check).
 *
 * For a valid chain:
 *   records[0].prevOutputCommitment === records[0].inputCommitment  (genesis)
 *   records[n].prevOutputCommitment === records[n-1].outputCommitment  (chain)
 */
export const verifyChain = (records: readonly ExecutionRecord[]): boolean => {
  const first = records.at(0);
  return (
    first !== undefined &&
    first.prevOutputCommitment === first.inputCommitment &&
    records
      .slice(1)
      .every((record, i) => {
        const prev = records.at(i);
        return (
          prev !== undefined &&
          record.prevOutputCommitment === prev.outputCommitment
        );
      })
  );
};
