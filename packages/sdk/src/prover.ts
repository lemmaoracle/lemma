/**
 * Whitepaper §2.4 / §4.8 — Local ZK proof generation.
 *
 * Production uses snarkjs with wasm/zkey resolved from circuit metadata
 * artifact.location. Falls back to SHA-256 hashing when artifacts are unavailable.
 */
// @ts-ignore - snarkjs is installed but may not be found during build
import * as snarkjsModule from "snarkjs";
import { createHash } from "node:crypto";
import * as R from "ramda";
import type { LemmaClient } from "@lemmaoracle/spec";
import { reject, resolveFetch } from "./internal.js";
import type { CircuitMeta } from "@lemmaoracle/spec";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * Default IPFS gateway for resolving ipfs:// URLs.
 * Callers can override by providing a custom fetcher that handles IPFS.
 */
export const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

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

/* ------------------------------------------------------------------ */
/*  Artifact handling                                                  */
/* ------------------------------------------------------------------ */

/**
 * Convert an IPFS URL to an HTTP gateway URL.
 */
const resolveIpfsUrl = (url: string): string =>
  url.startsWith("ipfs://") ? `${IPFS_GATEWAY}${url.slice("ipfs://".length)}` : url;

/**
 * Fetch an artifact (wasm or zkey) from an IPFS or HTTPS URL.
 *
 * Returns a Uint8Array because snarkjs delegates to fastfile which
 * only recognises Uint8Array | string (file path).  A raw ArrayBuffer
 * would cause "Invalid FastFile type: undefined".
 */
const fetchArtifact = (client: LemmaClient, url: string): Promise<Uint8Array> => {
  const resolvedUrl = resolveIpfsUrl(url);
  const fetchFn = resolveFetch(client);
  return fetchFn(resolvedUrl).then((res) =>
    res.ok
      ? res.arrayBuffer().then((buf) => new Uint8Array(buf))
      : reject(`Failed to fetch circuit artifact: ${url}`),
  );
};

/**
 * Fetch circuit metadata by circuitId.
 */
const fetchCircuitMeta = (client: LemmaClient, circuitId: string): Promise<CircuitMeta> =>
  import("./namespaces/circuits.js").then(({ getById }) => getById(client, circuitId));

/* ------------------------------------------------------------------ */
/*  Proof generation                                                   */
/* ------------------------------------------------------------------ */

/**
 * SHA-256 hash as base64 string (fallback when artifacts unavailable).
 */
const sha256Base64 = (s: string): string => createHash("sha256").update(s).digest("base64");

/**
 * Generate a proof using snarkjs groth16.fullProve.
 * Returns { proof, publicSignals } from snarkjs.
 */
const generateSnarkjsProof = async (
  witness: Readonly<Record<string, unknown>>,
  wasmBuf: Uint8Array,
  zkeyBuf: Uint8Array,
): Promise<{
  proof: unknown;
  publicSignals: string[];
}> => {
  const snarkjs = snarkjsModule;
  return snarkjs.groth16.fullProve(witness, wasmBuf, zkeyBuf);
};

/* ------------------------------------------------------------------ */
/*  Main prove function                                                */
/* ------------------------------------------------------------------ */

/**
 * Generate a ZK proof using snarkjs with artifacts from circuit metadata,
 * or fall back to SHA-256 hashing when artifacts are unavailable.
 */
export const prove = async (client: LemmaClient, input: ProveInput): Promise<ProveOutput> => {
  const circuitMeta: CircuitMeta = await fetchCircuitMeta(client, input.circuitId);

  const { artifact } = circuitMeta;

  // Branch: has artifacts? → use snarkjs : fallback to SHA-256
  // Using ternary instead of if (FP compliant - expression not statement)
  return artifact?.location
    ? // Production path (with artifacts)
      (async () => {
        const [wasmBuf, zkeyBuf] = await Promise.all([
          fetchArtifact(client, artifact.location.wasm),
          fetchArtifact(client, artifact.location.zkey),
        ]);

        const { proof, publicSignals } = await generateSnarkjsProof(
          input.witness,
          wasmBuf,
          zkeyBuf,
        );

        const proofStr = Buffer.from(JSON.stringify(proof)).toString("base64");
        const inputs = publicSignals;

        return { proof: proofStr, inputs };
      })()
    : // Fallback path (no artifacts)
      (()=>{
        console.log("[Lemma SDK] Using fallback SHA-256 mode");
        const proof = sha256Base64(`${input.circuitId}|${JSON.stringify(input.witness)}`);
        const inputs = (() => {
          const commitmentValue = 
            input.witness.commitmentRoot || 
            input.witness.attr_commitment_root || 
            input.witness.commitment_root;
          console.log("[Lemma SDK] commitment value found:", commitmentValue);
          return typeof commitmentValue === "string" ? [commitmentValue] : [];
        })();
        console.log("[Lemma SDK] Fallback proof hash (first 20 chars):", proof.substring(0, 20));
        return { proof, inputs } as const;
      })()
};
