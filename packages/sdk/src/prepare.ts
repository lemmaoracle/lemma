/**

* Whitepaper §4.5 — Normalization + Commitment Preparation.
*/
import type { LemmaClient } from "@lemma/spec";
import type { Json } from "./internal";
import { reject } from "./internal";
import { commitNormalized, type PrepareOutput } from "./commitments";
import { getSchemaById } from "./schema";

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
        })),
      )
    : reject(`Unknown schemaId: ${input.schema}. Call define() first.`);
};
