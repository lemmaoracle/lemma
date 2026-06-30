/**

* Whitepaper §4.5 — Normalization + Commitment Preparation.
*/
import type { LemmaClient } from "@lemmaoracle/spec";
import type { Json } from "./internal.js";
import { reject } from "./internal.js";
import { commit, type PrepareOutput } from "./commitments.js";
import { getSchemaById } from "./schema.js";

export type PrepareInput<Raw> = Readonly<{
  schema: string;
  payload: Raw;
}>;

export const prepare = async <Raw, Norm extends Json>(
  _client: LemmaClient,
  input: PrepareInput<Raw>,
): Promise<PrepareOutput<Norm>> => {
  const schema = getSchemaById<Raw, Norm>(input.schema);

  return schema
    ? Promise.resolve(schema.normalize(input.payload)).then((normalized) =>
        commit(normalized).then((result) => ({
          normalized,
          commitments: { scheme: "poseidon" as const, ...result },
          depth: result.depth,
          inclusionProofs: result.inclusionProofs,
          leafPreimages: result.leafPreimages,
        })),
      )
    : reject(`Unknown schemaId: ${input.schema}. Call define() first.`);
};

/**
 * Normalize a credential without computing a Merkle-tree commitment.
 *
 * Lightweight alternative to `prepare` that returns only the normalized data.
 * Use this when you need to apply a custom commitment scheme (e.g. the
 * sectioned Poseidon commitment in `@lemmaoracle/agent`).
 *
 * `prepare` is equivalent to `normalize` + `commit`.
 */
export const normalize = async <Raw, Norm extends Json>(
  _client: LemmaClient,
  input: PrepareInput<Raw>,
): Promise<Norm> => {
  const schema = getSchemaById<Raw, Norm>(input.schema);

  return schema
    ? Promise.resolve(schema.normalize(input.payload))
    : reject(`Unknown schemaId: ${input.schema}. Call define() first.`);
};
