/* tslint:disable */
/* eslint-disable */

/**
 * Bind input file + transform logic + output file into the canonical
 * ExecutionRecord. All commitments and the transformer id are computed
 * here, inside WASM — the JS runner only executes the transform and
 * canonicalizes args.
 *
 * `prev_output_commitment`: pass the previous stage's outputCommitment,
 * or `None` for a genesis record (prev = inputCommitment, trivially
 * satisfying the circuit's chain-binding constraint).
 *
 * Returns `{"record": ExecutionRecord, "witness": {inputFileHash, outputFileHash}}`
 * as a JSON string; all field elements are decimal strings.
 */
export function bind(input_bytes: Uint8Array, output_bytes: Uint8Array, transform_code: Uint8Array, canonical_args: string, runtime: string, prev_output_commitment?: string | null): string;

/**
 * Entry point called by Lemma SDK's `define()`.
 * Must be exported as `normalize` and accept/return JSON strings.
 *
 * Input: raw ExecutionRecord JSON (fields may be numbers or strings)
 * Output: canonical ExecutionRecord JSON (all fields as decimal strings)
 *
 * The canonical form ensures deterministic field-element representation
 * regardless of how the runner serialized the record (JS number vs string).
 */
export function normalize(raw_json: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly bind: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => [number, number];
    readonly normalize: (a: number, b: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
