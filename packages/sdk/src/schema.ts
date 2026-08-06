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
 * Convert an IPFS URI to an HTTP gateway URL; pass HTTPS URLs through unchanged.
 */
const resolveArtifactUrl = (url: string): string =>
  url.startsWith("ipfs://") ? `${IPFS_GATEWAY}${url.slice("ipfs://".length)}` : url;

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
  const resolvedWasmUrl = resolveArtifactUrl(artifact.artifact.wasm);
  const response = await fetch(resolvedWasmUrl);
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
                const resolvedJsUrl = resolveArtifactUrl(artifact.artifact.js);
                const jsResponse = await fetch(resolvedJsUrl);
                return !jsResponse.ok
                  ? Promise.reject(new Error(
                      `Failed to download JS shim from ${artifact.artifact.js}: ${String(jsResponse.status)}`,
                    ))
                  : jsResponse.text().then((jsSource) => {
                      const dataUri = `data:text/javascript;base64,${toBase64(jsSource)}`;
                      return import(/* @vite-ignore */ dataUri).then((shim: WasmShim) => {
                        // eslint-disable-next-line functional/no-conditional-statements
                        if (typeof shim.default === "function") {
                          return shim.default(wasmBuffer).then((_) => shim);
                        // eslint-disable-next-line functional/no-conditional-statements
                        } else if (typeof shim.init === "function") {
                          return shim.init(wasmBuffer).then((_) => shim);
                        } else {
                          console.warn("WASM JS shim does not export an initialization function (default or init)");
                          return Promise.resolve(shim);
                        }
                      });
                    });
              })().then((shim) => {
                // eslint-disable-next-line functional/no-conditional-statements
                if (typeof shim.normalize !== "function") {
                  console.error("Shim object:", Object.keys(shim));
                  return Promise.reject(new Error("WASM JS shim does not export a 'normalize' function"));
                }

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
              });
          });
      });
};

export const getSchemaById = <Raw, Norm>(schemaId: string): SchemaDef<Raw, Norm> | undefined =>
  R.prop(schemaId, registry) as SchemaDef<Raw, Norm> | undefined;
