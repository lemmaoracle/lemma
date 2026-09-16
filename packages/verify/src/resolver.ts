import { circuits, create } from "@lemmaoracle/sdk";
import type { CircuitMeta, LemmaClient, ProofAlgId } from "@lemmaoracle/spec";
import * as R from "ramda";
import type { CircuitResolver, ResolvedCircuit } from "./types.js";

/**
 * IPFS gateways tried in order. Mirrors the SDK prover's gateway list:
 * Lemma's artifacts CDN first (Cloudflare cache, avoids public-gateway
 * cold-start / 429), then Pinata and public gateways as fallback.
 * Kept here so the default resolver is self-contained and browser-safe.
 */
const IPFS_GATEWAYS: ReadonlyArray<string> = [
  "https://artifacts.lemma.workers.dev/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
  "https://trustless-gateway.link/ipfs/",
  "https://w3s.link/ipfs/",
];

const resolveAlg = (meta: CircuitMeta): ProofAlgId =>
  meta.verifiers?.find((v) => v.alg !== undefined)?.alg ?? "groth16-bn254-snarkjs";

const candidateUrls = (url: string): ReadonlyArray<string> =>
  url.startsWith("ipfs://")
    ? IPFS_GATEWAYS.map((g) => `${g}${url.slice("ipfs://".length)}`)
    : [url];

const fetchFirst = (urls: ReadonlyArray<string>): Promise<Readonly<Record<string, unknown>>> => {
  const url = urls[0];
  return url === undefined
    ? Promise.reject(new Error("vkey fetch failed: no gateways remaining"))
    : fetch(url)
        .then((res) =>
          res.ok
            ? (res.json() as Promise<Readonly<Record<string, unknown>>>)
            : Promise.reject(new Error(`gateway-fail ${url}`)),
        )
        .catch((_e: unknown) => fetchFirst(urls.slice(1)));
};

const fetchVkey = R.memoizeWith(
  (url: string): string => url,
  (url: string): Promise<Readonly<Record<string, unknown>>> => fetchFirst(candidateUrls(url)),
);

/**
 * Build the default circuit resolver: fetch `CircuitMeta` from the Lemma
 * oracle (public endpoint), resolve the algorithm, and fetch the vkey artifact.
 *
 * Only the groth16 vkey JSON path is implemented; WHIR `params` resolution is
 * deferred. For bundled vkeys or a CDN, inject your own {@link CircuitResolver}.
 */
export const createCircuitResolver =
  (client: LemmaClient = create({})): CircuitResolver =>
  (circuitId: string): Promise<ResolvedCircuit> =>
    circuits.getById(client, circuitId).then((meta) => {
      const loc = meta.artifact?.location;
      const vkeyUrl = loc && "vkey" in loc ? loc.vkey : undefined;
      return vkeyUrl
        ? fetchVkey(vkeyUrl).then((vkey) => ({ alg: resolveAlg(meta), vkey }))
        : Promise.reject(
            new Error(`circuit "${circuitId}" has no vkey artifact for offchain verification`),
          );
    });
