import { generators } from "@lemmaoracle/sdk";
import type { LemmaClient, GeneratorMeta } from "@lemmaoracle/sdk";

export type GetGeneratorInput = Readonly<{ id: string }>;

export const getGenerator = (client: LemmaClient, input: GetGeneratorInput): Promise<GeneratorMeta> =>
  generators.getById(client, input.id);
