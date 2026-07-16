/**
 * Whitepaper §2.4 / §4.8 — Local ZK proof generation.
 *
 * Production uses snarkjs with wasm/zkey resolved from circuit metadata
 * artifact.location. Falls back to SHA-256 hashing when artifacts are unavailable.
 *
 * All Node-only APIs (node:crypto, Buffer, static snarkjs import) are avoided
 * so the module works in both Node.js and browser runtimes.
 */
import type { LemmaClient } from "@lemmaoracle/spec";
import { reject, resolveFetch } from "./internal.js";
import type {
  CircuitArtifactLocation,
  CircuitMeta,
  ProofAlgId,
  WhirCircuitArtifactLocation,
} from "@lemmaoracle/spec";
import type { WhirModule } from "./whir-runtime.js";
import { sha256Base64, toBase64 } from "./platform.js";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * IPFS gateways tried in order. Pinata is first because Lemma's circuit
 * artifacts are uploaded via Pinata, so its gateway is the origin and
 * avoids any cross-gateway propagation delay. ipfs.io / dweb.link are
 * the IPFS Foundation's public gateways; trustless-gateway.link is the
 * newer verifiable-response gateway. w3s.link is kept as a last resort
 * — it 301-redirects cross-origin to dweb.link, which some browsers
 * reject under CORS re-validation.
 */
const IPFS_GATEWAYS: ReadonlyArray<string> = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
  "https://trustless-gateway.link/ipfs/",
  "https://w3s.link/ipfs/",
];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ProveInput = Readonly<{
  circuitId: string;
  witness: Readonly<Record<string, unknown>>;
}>;

export type ProveOutput = Readonly<{
  proof: string;
  inputs: ReadonlyArray<string>;
}>;

type SnarkjsGroth16 = {
  readonly fullProve: (
    witness: Readonly<Record<string, unknown>>,
    wasm: Uint8Array,
    zkey: Uint8Array,
  ) => Promise<{
    readonly proof: unknown;
    readonly publicSignals: readonly string[];
  }>;
};

type SnarkjsModule = {
  readonly groth16: SnarkjsGroth16;
};

/* ------------------------------------------------------------------ */
/*  Artifact handling                                                  */
/* ------------------------------------------------------------------ */

/** IPFS gateway fetch with sequential fallback (functional: reduce + .catch chain). */
const fetchArtifactIpfs = (
  fetchFn: (url: string) => Promise<Response>,
  gateways: ReadonlyArray<string>,
  cid: string,
  url: string,
): Promise<Uint8Array> =>
  gateways
    .reduce(
      (chain: Promise<Uint8Array>, gateway: string) =>
        chain.catch((_err: unknown) =>
          fetchFn(`${gateway}${cid}`).then((res) =>
            res.ok
              ? res.arrayBuffer().then((buf) => new Uint8Array(buf))
              : Promise.reject(new Error("gateway-fail")),
          ),
        ),
      Promise.reject(new Error("start")),
    )
    .catch((_err: unknown) =>
      reject(
        `Failed to fetch circuit artifact from all IPFS gateways: ${url}`,
      ),
    );

/**
 * Fetch an artifact (wasm or zkey) from an IPFS or HTTPS URL.
 *
 * For IPFS URLs, tries multiple gateways in order until one succeeds.
 * Returns a Uint8Array because snarkjs delegates to fastfile which
 * only recognises Uint8Array | string (file path).  A raw ArrayBuffer
 * would cause "Invalid FastFile type: undefined".
 */
const fetchArtifact = async (
  client: LemmaClient,
  url: string,
): Promise<Uint8Array> => {
  const fetchFn = resolveFetch(client);
  const cid = url.startsWith("ipfs://") ? url.slice("ipfs://".length) : null;
  return cid !== null
    ? fetchArtifactIpfs(fetchFn, IPFS_GATEWAYS, cid, url)
    : fetchFn(url).then((res) =>
        res.ok
          ? res.arrayBuffer().then((buf) => new Uint8Array(buf))
          : reject(`Failed to fetch circuit artifact: ${url}`),
      );
};

/**
 * Fetch circuit metadata by circuitId.
 *
 * The GET /v1/circuits/{circuitId} endpoint is public (no API key required),
 * so callers may use a client created with `create({})` to pre-fetch metadata
 * before the user has entered their API key.
 */
const fetchCircuitMeta = (
  client: LemmaClient,
  circuitId: string,
): Promise<CircuitMeta> =>
  import("./namespaces/circuits.js").then(({ getById }) =>
    getById(client, circuitId),
  );

/* ------------------------------------------------------------------ */
/*  Proof generation                                                   */
/* ------------------------------------------------------------------ */

/**
 * SHA-256 hash as base64 string (fallback when artifacts unavailable).
 * Delegates to platform.ts which uses @noble/hashes (browser + Node).
 */

/**
 * Generate a proof using snarkjs groth16.fullProve.
 * Returns { proof, publicSignals } from snarkjs.
 *
 * snarkjs is imported dynamically so it is only loaded when actually needed
 * and the module remains importable in browsers that lack its Node deps.
 */
const generateSnarkjsProof = (
  witness: Readonly<Record<string, unknown>>,
  wasmBuf: Uint8Array,
  zkeyBuf: Uint8Array,
): Promise<{
  readonly proof: unknown;
  readonly publicSignals: readonly string[];
}> =>
  import("snarkjs").then((mod) =>
    (mod as unknown as SnarkjsModule).groth16.fullProve(
      witness,
      wasmBuf,
      zkeyBuf,
    ),
  );

/**
 * Generate a proof using the WHIR-KoalaBear (KoalaBear) runtime.
 * Mirrors {@link generateSnarkjsProof}: the runtime is imported dynamically
 * so it (and its wasm dependency) only loads on the WHIR path, and the
 * per-circuit `wasm` / `params` artifacts are passed in by the caller.
 */
const generateWhirProof = (
  witness: Readonly<Record<string, unknown>>,
  wasmBuf: Uint8Array,
  paramsBuf: Uint8Array,
): Promise<{
  readonly proof: Uint8Array;
  readonly publicInputs: readonly string[];
}> =>
  import("./whir-runtime.js").then((mod: WhirModule) =>
    mod.whir.prove(witness, wasmBuf, paramsBuf),
  );

/** Base64-encode raw proof bytes without overflowing the call stack. */
const bytesToBase64 = (bytes: Uint8Array): string =>
  toBase64(
    Array.from(bytes).reduce((acc, b) => acc + String.fromCharCode(b), ""),
  );

/**
 * Resolve the proof algorithm for a circuit from its verifier metadata,
 * defaulting to groth16 so circuits registered without an explicit algorithm
 * keep their existing behaviour.
 */
const resolveAlg = (meta: CircuitMeta): ProofAlgId =>
  meta.verifiers?.find((v) => v.alg !== undefined)?.alg ??
  "groth16-bn254-snarkjs";

/**
 * WHIR proving path. Fetches the compiled prover `wasm` and serialized
 * verifying `params` (the parallel {@link WhirCircuitArtifactLocation}
 * shape), then delegates to the WHIR runtime.
 *
 * Accepts the union location type and narrows it here: a WHIR circuit is
 * discriminated by a string `params` field (groth16 circuits carry `zkey`
 * instead). A circuit tagged `whir-koalabear-solwhir` but whose metadata lacks
 * `params` is a registration error, so we reject with a clear message rather
 * than silently falling through to the snarkjs path with an undefined URL.
 */
const proveWhir = (
  client: LemmaClient,
  location: CircuitArtifactLocation | WhirCircuitArtifactLocation,
  witness: Readonly<Record<string, unknown>>,
): Promise<ProveOutput> => {
  const params = "params" in location ? location.params : undefined;
  return typeof params === "string"
    ? (async () => {
        const [wasmBuf, paramsBuf] = await Promise.all([
          fetchArtifact(client, location.wasm),
          fetchArtifact(client, params),
        ]);

        const { proof, publicInputs } = await generateWhirProof(
          witness,
          wasmBuf,
          paramsBuf,
        );

        return { proof: bytesToBase64(proof), inputs: publicInputs };
      })()
    : reject(
        "WHIR circuit metadata is missing the 'params' artifact location",
      );
};

/* ------------------------------------------------------------------ */
/*  Main prove function                                                */
/* ------------------------------------------------------------------ */

/**
 * Generate a ZK proof using snarkjs with artifacts from circuit metadata,
 * or fall back to SHA-256 hashing when artifacts are unavailable.
 */
export const prove = async (
  client: LemmaClient,
  input: ProveInput,
): Promise<ProveOutput> => {
  const circuitMeta: CircuitMeta = await fetchCircuitMeta(
    client,
    input.circuitId,
  );

  const location = circuitMeta.artifact?.location;

  // Dispatch by proof algorithm (resolved from circuit verifier metadata).
  // WHIR circuits carry the parallel { wasm, params } location shape and are
  // narrowed inside proveWhir; the snarkjs branch reads the { wasm, zkey }
  // shape, so we assert the groth16 member there (a same-family cast, not the
  // unsound `as unknown as`).
  return location && resolveAlg(circuitMeta) === "whir-koalabear-solwhir"
    ? proveWhir(client, location, input.witness)
    : // Branch: has artifacts? → use snarkjs : fallback to SHA-256
      // Using ternary instead of if (FP compliant - expression not statement)
      location
    ? // Production path (with artifacts)
      (async () => {
        const groth16Loc = location as CircuitArtifactLocation;
        const [wasmBuf, zkeyBuf] = await Promise.all([
          fetchArtifact(client, groth16Loc.wasm),
          fetchArtifact(client, groth16Loc.zkey),
        ]);

        const { proof, publicSignals } = await generateSnarkjsProof(
          input.witness,
          wasmBuf,
          zkeyBuf,
        );

        return {
          proof: toBase64(JSON.stringify(proof)),
          inputs: publicSignals,
        };
      })()
    : // Fallback path (no artifacts)
      (() => {
        console.log("[Lemma SDK] Using fallback SHA-256 mode");

        const proof = sha256Base64(
          `${input.circuitId}|${JSON.stringify(input.witness)}`,
        );

        const commitmentValue =
          input.witness.commitmentRoot ||
          input.witness.attr_commitment_root ||
          input.witness.commitment_root;

        console.log("[Lemma SDK] commitment value found:", commitmentValue);
        console.log(
          "[Lemma SDK] Fallback proof hash (first 20 chars):",
          proof.substring(0, 20),
        );

        return {
          proof,
          inputs: typeof commitmentValue === "string" ? [commitmentValue] : [],
        } as const;
      })();
};
