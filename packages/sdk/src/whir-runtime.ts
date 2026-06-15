/**
 * WHIR-31bit runtime over the KoalaBear field
 * (ProofAlgId `"whir-31bit-koalabear"`).
 *
 * Mirrors the snarkjs role: a generic runtime consumed by the SDK that takes
 * per-circuit artifacts fetched from circuit metadata and returns / checks a
 * proof. The proof is raw bytes (WHIR transcript); `publicInputs` are decimal
 * field-element strings, matching the groth16 `publicSignals` convention so
 * both algorithms share the same `ProveOutput` / `SubmitProofRequest` wire shape.
 *
 * Unlike groth16 (where `snarkjs` is a real npm package imported directly),
 * there is no `@lemmaoracle/whir` package: the runtime lives here, inside the
 * SDK. Each circuit ships a `wasm-bindgen` WASM module (built from its
 * `circuits-whir/` crate) exposing `prove(witnessJson, params)` and
 * `verify(params, publicInputsJson, proof)`. All four circuits share the same
 * export signatures, so this one loader drives any of them: it instantiates
 * the supplied module bytes directly via `WebAssembly` and marshals
 * strings/bytes across the boundary — no per-circuit JS glue required.
 *
 * `wasm` and `params` are two SEPARATE artifacts (see
 * `WhirCircuitArtifactLocation`): `wasm` is the compiled wasm-bindgen module
 * that is instantiated, and `params` is opaque verifier data (serialized WHIR
 * verification key / PCS parameters) forwarded byte-for-byte to the module's
 * `prove`/`verify` entry points. BOTH `prove` and `verify` take the wasm
 * module AND the params buffer, so the module bytes are never confused with
 * the params bytes.
 *
 * This is a low-level WASM boundary module (cf. `platform.ts`); the few
 * `eslint-disable` lines below mark the unavoidable linear-memory writes and
 * the post-instantiation export binding.
 */

export type WhirProof = Readonly<{
  proof: Uint8Array;
  publicInputs: ReadonlyArray<string>;
}>;

export type Whir = Readonly<{
  prove: (
    witness: Readonly<Record<string, unknown>>,
    wasm: Uint8Array,
    params: Uint8Array,
  ) => Promise<WhirProof>;
  verify: (
    wasm: Uint8Array,
    params: Uint8Array,
    publicInputs: ReadonlyArray<string>,
    proof: Uint8Array,
  ) => Promise<boolean>;
}>;

export type WhirModule = Readonly<{
  whir: Whir;
}>;

/* ------------------------------------------------------------------ */
/*  WASM ABI                                                           */
/* ------------------------------------------------------------------ */

/** The subset of wasm-bindgen exports this runtime relies on. */
type WasmExports = Readonly<{
  memory: WebAssembly.Memory;
  prove: (
    a: number,
    b: number,
    c: number,
    d: number,
  ) => readonly [number, number, number, number];
  verify: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ) => readonly [number, number, number];
  __wbindgen_externrefs: WebAssembly.Table;
  __wbindgen_malloc: (a: number, b: number) => number;
  __wbindgen_start: () => void;
}>;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/** A one-slot mutable holder so import callbacks can reach the instance's
 *  exports, which only exist after instantiation. */
type ExportsCell = { current: WasmExports | null };

/** Initialise the externref table (undefined/null/true/false sentinels). */
const initExternrefTable = (ex: WasmExports): void => {
  const table = ex.__wbindgen_externrefs;
  const base = table.grow(4);
  const slots: ReadonlyArray<readonly [number, unknown]> = [
    [0, undefined],
    [base, undefined],
    [base + 1, null],
    [base + 2, true],
    [base + 3, false],
  ];
  slots.forEach(([i, v]) => {
    table.set(i, v);
  });
};

/** Read a JS string from linear memory (the `__wbindgen_cast_*` intrinsic). */
const stringFromMemory = (ex: WasmExports, ptr: number, len: number): string =>
  textDecoder.decode(new Uint8Array(ex.memory.buffer, ptr >>> 0, len).slice());

/**
 * Build the wasm-bindgen import object. The module name and intrinsic field
 * names (one carries a build-specific hash) are read from the compiled module,
 * so a `Proxy` resolves handlers by name pattern rather than hard-coding them.
 */
const buildImports = (
  moduleName: string,
  cell: ExportsCell,
): WebAssembly.Imports => ({
  [moduleName]: new Proxy(
    {},
    {
      get: (_target, name) =>
        name === "__wbindgen_init_externref_table"
          ? (_unused: unknown): void => {
              initExternrefTable(cell.current as WasmExports);
            }
          : typeof name === "string" && name.startsWith("__wbindgen_cast_")
            ? (ptr: number, len: number) =>
                stringFromMemory(cell.current as WasmExports, ptr, len)
            : (_unused: unknown) => undefined,
    },
  ),
});

/** Compile + instantiate a circuit module from raw bytes. */
const instantiate = async (bytes: Uint8Array): Promise<WasmExports> => {
  const module = await WebAssembly.compile(bytes as BufferSource);
  const moduleName = WebAssembly.Module.imports(module)[0]?.module ?? "";
  const cell: ExportsCell = { current: null };
  const instance = await WebAssembly.instantiate(
    module,
    buildImports(moduleName, cell),
  );
  const ex = instance.exports as unknown as WasmExports;
  // eslint-disable-next-line functional/immutable-data, functional/no-expression-statements
  cell.current = ex;
  ex.__wbindgen_start();
  return ex;
};

/* ------------------------------------------------------------------ */
/*  Argument marshaling                                               */
/* ------------------------------------------------------------------ */

/** Copy `bytes` into freshly-allocated linear memory; return `[ptr, len]`. */
const writeBytes = (
  ex: WasmExports,
  bytes: Uint8Array,
): readonly [number, number] => {
  const ptr = ex.__wbindgen_malloc(bytes.length, 1) >>> 0;
  new Uint8Array(ex.memory.buffer).set(bytes, ptr);
  return [ptr, bytes.length] as const;
};

const writeString = (ex: WasmExports, s: string): readonly [number, number] =>
  writeBytes(ex, textEncoder.encode(s));

/** Read `len` bytes from linear memory at `ptr` (copied out). */
const readBytes = (ex: WasmExports, ptr: number, len: number): Uint8Array =>
  new Uint8Array(ex.memory.buffer, ptr >>> 0, len).slice();

/** Resolve a wasm-bindgen error externref to a message string. */
const errorMessage = (ex: WasmExports, idx: number): string =>
  String(ex.__wbindgen_externrefs.get(idx));

/* ------------------------------------------------------------------ */
/*  Public runtime                                                    */
/* ------------------------------------------------------------------ */

type ProveJson = Readonly<{
  proof: ReadonlyArray<number>;
  publicInputs: ReadonlyArray<string>;
}>;

const decodeProve = (bytes: Uint8Array): WhirProof => {
  const json = JSON.parse(textDecoder.decode(bytes)) as ProveJson;
  return {
    proof: Uint8Array.from(json.proof),
    publicInputs: json.publicInputs,
  };
};

const prove = async (
  witness: Readonly<Record<string, unknown>>,
  wasm: Uint8Array,
  params: Uint8Array,
): Promise<WhirProof> => {
  const ex = await instantiate(wasm);
  const [wptr, wlen] = writeString(ex, JSON.stringify(witness));
  const [pptr, plen] = writeBytes(ex, params);
  const ret = ex.prove(wptr, wlen, pptr, plen);
  return ret[3]
    ? Promise.reject(new Error(errorMessage(ex, ret[2])))
    : decodeProve(readBytes(ex, ret[0], ret[1]));
};

const verify = async (
  wasm: Uint8Array,
  params: Uint8Array,
  publicInputs: ReadonlyArray<string>,
  proof: Uint8Array,
): Promise<boolean> => {
  // Instantiate the compiled circuit module (`wasm`), then forward the opaque
  // `params` bytes to its `verify(params, publicInputs, proof)` entry point.
  // The module bytes and the params bytes are kept distinct: `params` is WHIR
  // verifier data, never a wasm module, and is never instantiated.
  const ex = await instantiate(wasm);
  const [eptr, elen] = writeBytes(ex, params);
  const [iptr, ilen] = writeString(ex, JSON.stringify([...publicInputs]));
  const [prptr, prlen] = writeBytes(ex, proof);
  const ret = ex.verify(eptr, elen, iptr, ilen, prptr, prlen);
  return ret[2]
    ? Promise.reject(new Error(errorMessage(ex, ret[1])))
    : ret[0] !== 0;
};

export const whir: Whir = { prove, verify };
