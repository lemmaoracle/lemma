/**
 * Whitepaper §4.8 — proofs.submit / proofs.getByDocHash
 */
import type {
  LemmaClient,
  ProofRecord,
  SubmitProofRequest,
  SubmitProofResponse,
} from "@lemmaoracle/spec";
import { get, post } from "../http.js";

export const submit = (
  client: LemmaClient,
  payload: SubmitProofRequest,
): Promise<SubmitProofResponse> => post<SubmitProofResponse>(client)("/v1/proofs")(payload);

export const getByDocHash = (
  client: LemmaClient,
  docHash: string,
): Promise<ProofRecord> =>
  get<ProofRecord>(client)(`/v1/proofs?docHash=${encodeURIComponent(docHash)}`)();
