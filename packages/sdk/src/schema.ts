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
    : btoa(unescape(encodeURIComponent(source)));

/* eslint-disable functional/immutable-data, functional/no-expression-statements --
Schema registry is an intentional mutable boundary for schemaId → normalize lookup. */
const registry: Record<string, SchemaDef<unknown, unknown>> = {};

export const define = async <Raw, Norm>(schemaMeta: SchemaMeta): Promise<SchemaDef<Raw, Norm>> => {
  const artifact = schemaMeta.normalize;

  // 1. Download WASM binary (supports both ipfs:// and https://)
  const resolvedWasmUrl = resolveArtifactUrl(artifact.artifact.wasm);
  const response = await fetch(resolvedWasmUrl);
  if (!response.ok) {
    throw new Error(`Failed to download WASM from ${artifact.artifact.wasm}: ${response.status}`);
  }

  const wasmBuffer = await response.arrayBuffer();
  const wasmBytes = new Uint8Array(wasmBuffer);

  // 2. Compute SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", wasmBytes);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const computedHash = `0x${hashHex}`;

  // 3. Verify hash matches
  if (computedHash.toLowerCase() !== artifact.hash.toLowerCase()) {
    throw new Error(`WASM hash mismatch: expected ${artifact.hash}, got ${computedHash}`);
  }

  // 4. Fetch JS shim source, then dynamic-import via data: URI.
  //    Node.js ESM loader only supports file: and data: schemes,
  //    so we cannot import("https://...") directly.
  //    The data: URI approach works in both Node.js and browsers.
  //    Since init() receives the WASM ArrayBuffer explicitly,
  //    the shim's import.meta.url-based default path resolution is never triggered.
  const resolvedJsUrl = resolveArtifactUrl(artifact.artifact.js);
  const jsResponse = await fetch(resolvedJsUrl);
  if (!jsResponse.ok) {
    throw new Error(
      `Failed to download JS shim from ${artifact.artifact.js}: ${jsResponse.status}`,
    );
  }
  const jsSource = await jsResponse.text();
  const dataUri = `data:text/javascript;base64,${toBase64(jsSource)}`;
  const shim = await import(/* @vite-ignore */ dataUri);
  await shim.default(wasmBuffer);

  if (typeof shim.normalize !== "function") {
    throw new Error("WASM JS shim does not export a 'normalize' function");
  }

  // 5. Wrap the shim's normalize (string → string) function
  const normalize = (raw: Raw): Norm => {
    const rawJson = JSON.stringify(raw);
    const normJson = shim.normalize(rawJson) as string;
    return JSON.parse(normJson) as Norm;
  };

  // 6. Register in local registry
  const schemaDef: SchemaDef<Raw, Norm> = {
    id: schemaMeta.id,
    normalize,
  };

  registry[schemaMeta.id] = schemaDef as SchemaDef<unknown, unknown>;
  return schemaDef;
};
/* eslint-enable functional/immutable-data, functional/no-expression-statements */

export const getSchemaById = <Raw, Norm>(schemaId: string): SchemaDef<Raw, Norm> | undefined =>
  R.prop(schemaId, registry) as SchemaDef<Raw, Norm> | undefined;
