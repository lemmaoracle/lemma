/**
 *
 * Whitepaper §4.3 — Schema Definition.
 */
import * as R from "ramda";
import type { SchemaMeta } from "@lemma/spec";

export type SchemaDef<Raw, Norm> = Readonly<{
  id: string;
  normalize: (raw: Raw) => Norm;
}>;

/* eslint-disable functional/immutable-data, functional/no-expression-statements --
Schema registry is an intentional mutable boundary for schemaId → normalize lookup. */
const registry: Record<string, SchemaDef<unknown, unknown>> = {};

export const define = async <Raw, Norm>(schemaMeta: SchemaMeta): Promise<SchemaDef<Raw, Norm>> => {
  const artifact = schemaMeta.normalize;

  // 1. Download WASM binary
  const response = await fetch(artifact.artifact.wasm);
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

  // 4. Instantiate WASM module
  const module = await WebAssembly.instantiate(wasmBuffer);
  const exports = module.instance.exports;

  if (typeof exports.normalize !== "function") {
    throw new Error("WASM module does not export a 'normalize' function");
  }

  const wasmNormalize = exports.normalize as (rawJson: string) => string;

  // 5. Wrap the WASM normalize function
  const normalize = (raw: Raw): Norm => {
    const rawJson = JSON.stringify(raw);
    const normJson = wasmNormalize(rawJson);
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
