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
 */
import { readFile } from "node:fs/promises";
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

/**
 * Shape of the wasm-bindgen module at normalize/pkg (target: web).
 * `default` is the init function; `bind` computes the execution binding.
 */
type NormalizeModule = Readonly<{
  default: (opts: {
    readonly module_or_path: Uint8Array;
  }) => Promise<unknown>;
  bind: (
    inputBytes: Uint8Array,
    outputBytes: Uint8Array,
    transformCode: Uint8Array,
    canonicalArgs: string,
    runtime: string,
    prevOutputCommitment?: string | null,
  ) => string;
}>;

// eslint-disable-next-line functional/functional-parameters -- module-level lazy initializer
const instantiateNormalizer = async (): Promise<NormalizeModule> => {
  const pkgUrl = new URL("../normalize/pkg/lemma_transform.js", import.meta.url);
  const wasmUrl = new URL(
    "../normalize/pkg/lemma_transform_bg.wasm",
    import.meta.url,
  );
  // Non-literal specifier: the pkg lives outside the TS rootDir and ships
  // its own .d.ts; typed locally via NormalizeModule.
  const mod = (await import(pkgUrl.href)) as NormalizeModule;
  const wasmBytes = await readFile(wasmUrl);
  return mod.default({ module_or_path: wasmBytes }).then((_init) => mod);
};

// imperative: memoized one-time WASM instantiation — module-level cache
// eslint-disable-next-line functional/no-let
let normalizerPromise: Promise<NormalizeModule> | undefined;

// eslint-disable-next-line functional/functional-parameters -- memoized accessor
const loadNormalizer = (): Promise<NormalizeModule> =>
  (normalizerPromise ??= instantiateNormalizer());

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
  inputBytes: Uint8Array,
  outputBytes: Uint8Array,
  transformCode: Uint8Array,
  args: unknown,
  prevOutputCommitment?: string,
): Promise<TransformProofInput> => {
  const normalizer = await loadNormalizer();
  const canonical = canonicalize(args as import("@lemmaoracle/sdk").Json);
  const bound = JSON.parse(
    normalizer.bind(
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
 */
export const buildGenesisRecord = async (
  transformFn: TransformFn,
  transformCode: Uint8Array,
  inputBytes: Uint8Array,
  args: unknown,
): Promise<TransformProofInput> => {
  const outputBytes = await transformFn(inputBytes, args);
  return bindExecution(inputBytes, outputBytes, transformCode, args);
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
  return bindExecution(
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
