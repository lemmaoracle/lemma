/**

* Whitepaper §4.3 — Local Schema Definition.
*/
import * as R from "ramda";

export type SchemaDef<Raw, Norm> = Readonly<{
  id: string;
  normalize: (raw: Raw) => Norm;
}>;

/* eslint-disable functional/no-let, functional/immutable-data --
Schema registry is an intentional mutable boundary for schemaId → normalize lookup. */
const registry: Record<string, SchemaDef<unknown, unknown>> = {};

export const define = <Raw, Norm>(input: SchemaDef<Raw, Norm>): SchemaDef<Raw, Norm> => {
  registry[input.id] = input as SchemaDef<unknown, unknown>;
  return input;
};
/* eslint-enable functional/no-let, functional/immutable-data */

export const getSchemaById = <Raw, Norm>(schemaId: string): SchemaDef<Raw, Norm> | undefined =>
  R.prop(schemaId, registry) as SchemaDef<Raw, Norm> | undefined;
