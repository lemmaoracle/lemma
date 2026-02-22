/**
 * Whitepaper §4.9 — generators.register / generators.getById
 */
import type { LemmaClient, GeneratorMeta } from "@lemma/spec";
import { get, post } from "../http";

export const register = (client: LemmaClient, payload: GeneratorMeta): Promise<GeneratorMeta> =>
  post<GeneratorMeta>(client)("/v1/doc-generators")(payload);

export const getById = (client: LemmaClient, generatorId: string): Promise<GeneratorMeta> =>
  get<GeneratorMeta>(client)(`/v1/doc-generators/${encodeURIComponent(generatorId)}`)();
