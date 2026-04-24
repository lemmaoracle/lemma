import { schemas } from "@lemmaoracle/sdk";
import type { LemmaClient, SchemaMeta } from "@lemmaoracle/sdk";

export type GetSchemaInput = Readonly<{ id: string }>;

export const getSchema = (client: LemmaClient, input: GetSchemaInput): Promise<SchemaMeta> =>
  schemas.getById(client, input.id);
