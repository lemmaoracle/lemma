/**
 *
 * Whitepaper §4.3 — Schema Definition.
 */
import * as R from "ramda";
import type { SchemaMeta } from "@lemmaoracle/spec";

export type SchemaDef<Raw, Norm> = Readonly<{
  id: string;
  normalize: (raw: Raw) => Norm;
}>;

/**
 * Default IPFS gateway for resolving ipfs:// URLs.
 * Callers can override by providing a custom fetcher that handles IPFS natively.
 */
export const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

/**
 * IPFS gateways tried in order for ipfs:// artifact resolution.
 * Pinata is first because Lemma's normalize artifacts are uploaded via Pinata,
 * so its gateway is the origin and avoids cross-gateway propagation delay.
 * ipfs.io / dweb.link follow as fallbacks (mirrors the prover's gateway list).
 */
const IPFS_GATEWAYS: ReadonlyArray<string> = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
  "https://trustless-gateway.link/ipfs/",
];

/**
 * Fetch an artifact URL (ipfs:// or https://), with gateway fallback for
 * ipfs:// URLs. https:// URLs are passed through to a single fetch.
 */
const fetchArtifact = (url: string): Promise<Response> => {
  if (!url.startsWith("ipfs://")) {
    return fetch(url);
  }
  const cid = url.slice("ipfs://".length);
  const gateways = [...IPFS_GATEWAYS];
  const attempt = (index: number): Promise<Response> => {
    const gateway = gateways[index];
    return gateway === undefined
      ? Promise.reject(
          new Error(`Failed to fetch artifact from all IPFS gateways: ${url}`),
        )
      : fetch(`${gateway}${cid}`).then((res) => (res.ok ? res : attempt(index + 1)));
  };
  return attempt(0);
};

/**
 * Base64-encode a string in both Node.js and browser environments.
 */
const toBase64 = (source: string): string =>
  typeof Buffer !== "undefined"
    ? Buffer.from(source).toString("base64")
    : btoa(encodeURIComponent(source).replace(/%([0-9A-F]{2})/g, (_match, p1: string) => String.fromCharCode(parseInt(p1, 16))));

// Dynamic import result shape for the WASM JS shim
type WasmShim = Readonly<{
  default?: (wasm: ArrayBuffer) => Promise<void>;
  init?: (wasm: ArrayBuffer) => Promise<void>;
  normalize: (rawJson: string) => string;
}>;

/* Registry mutation is an intentional mutable boundary for schemaId → normalize lookup. */
const registry: Record<string, SchemaDef<unknown, unknown>> = {};

export const define = async <Raw, Norm>(schemaMeta: SchemaMeta): Promise<SchemaDef<Raw, Norm>> => {
  const artifact = schemaMeta.normalize;

  // 1. Download WASM binary (supports both ipfs:// and https://)
  const response = await fetchArtifact(artifact.artifact.wasm);
  return !response.ok
    ? Promise.reject(new Error(`Failed to download WASM from ${artifact.artifact.wasm}: ${String(response.status)}`))
    : response.arrayBuffer().then((wasmBuffer) => {
        const wasmBytes = new Uint8Array(wasmBuffer);

        // 2. Compute SHA-256 hash
        return crypto.subtle.digest("SHA-256", wasmBytes).then((hashBuffer) => {
          const hashHex = Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          const computedHash = `0x${hashHex}`;

          // 3. Verify hash matches
          return computedHash.toLowerCase() !== artifact.hash.toLowerCase()
            ? Promise.reject(new Error(`WASM hash mismatch: expected ${artifact.hash}, got ${computedHash}`))
            : (async () => {
                // 4. Fetch JS shim source, then dynamic-import via data: URI.
                const jsResponse = await fetchArtifact(artifact.artifact.js);
                return !jsResponse.ok
                  ? Promise.reject(new Error(
                      `Failed to download JS shim from ${artifact.artifact.js}: ${String(jsResponse.status)}`,
                    ))
                  : jsResponse.text().then((jsSource) => {
                      const dataUri = `data:text/javascript;base64,${toBase64(jsSource)}`;
                      return import(/* @vite-ignore */ dataUri).then((shim: WasmShim) =>
                        typeof shim.default === "function"
                          ? shim.default(wasmBuffer).then((_) => shim)
                          : typeof shim.init === "function"
                            ? shim.init(wasmBuffer).then((_) => shim)
                            : (console.warn("WASM JS shim does not export an initialization function (default or init)"),
                               Promise.resolve(shim))
                      );
                    });
              })().then((shim) =>
                typeof shim.normalize !== "function"
                  ? (console.error("Shim object:", Object.keys(shim)),
                     Promise.reject(new Error("WASM JS shim does not export a 'normalize' function")))
                  : (() => {
                      // 5. Wrap the shim's normalize (string → string) function
                      const normalize = (raw: Raw): Norm => {
                        const rawJson = JSON.stringify(raw);
                        const normJson = shim.normalize(rawJson);
                        return JSON.parse(normJson) as Norm;
                      };

                      // 6. Register in local registry
                      const schemaDef: SchemaDef<Raw, Norm> = {
                        id: schemaMeta.id,
                        normalize,
                      };
                      // imperative: schema registry mutation — no functional alternative
                      // eslint-disable-next-line functional/immutable-data, functional/no-expression-statements
                      registry[schemaMeta.id] = schemaDef as SchemaDef<unknown, unknown>;
                      return schemaDef;
                    })()
              );
          });
      });
};

export const getSchemaById = <Raw, Norm>(schemaId: string): SchemaDef<Raw, Norm> | undefined =>
  R.prop(schemaId, registry) as SchemaDef<Raw, Norm> | undefined;
