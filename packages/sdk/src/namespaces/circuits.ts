/**
 * Whitepaper §4.9 — circuits.register / circuits.getById
 */
import type { LemmaClient, CircuitMeta } from "@lemmaoracle/spec";
import { get, post } from "../http";

export const register = (client: LemmaClient, payload: CircuitMeta): Promise<CircuitMeta> =>
  post<CircuitMeta>(client)("/v1/circuits")(payload);

export const getById = (client: LemmaClient, circuitId: string): Promise<CircuitMeta> =>
  get<CircuitMeta>(client)(`/v1/circuits/${encodeURIComponent(circuitId)}`)();
