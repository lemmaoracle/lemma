/**
 * Whitepaper §4.9 — schemas.register / schemas.getById
 */
import type { LemmaClient, SchemaMeta } from "@lemmaoracle/spec";
import { get, post } from "../http";

export const register = (client: LemmaClient, payload: SchemaMeta): Promise<SchemaMeta> =>
  post<SchemaMeta>(client)("/v1/schemas")(payload);

export const getById = (client: LemmaClient, id: string): Promise<SchemaMeta> =>
  get<SchemaMeta>(client)(`/v1/schemas/${encodeURIComponent(id)}`)();
