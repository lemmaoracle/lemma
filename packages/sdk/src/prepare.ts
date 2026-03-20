/**

* Whitepaper §4.5 — Normalization + Commitment Preparation.
*/
import type { LemmaClient } from "@lemmaoracle/spec";
import type { Json } from "./internal.js";
import { reject } from "./internal.js";
import { commitNormalized, type PrepareOutput } from "./commitments.js";
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
        commitNormalized(normalized).then((result) => ({
          normalized,
          commitments: { scheme: "poseidon" as const, ...result },
          depth: result.depth,
          inclusionProofs: result.inclusionProofs,
          leafPreimages: result.leafPreimages,
        })),
      )
    : reject(`Unknown schemaId: ${input.schema}. Call define() first.`);
};
