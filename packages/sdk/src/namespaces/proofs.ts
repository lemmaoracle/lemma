/**
 * Whitepaper §4.8 — proofs.submit / proofs.getByDocument
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

export const getByDocument = (
  client: LemmaClient,
  docHash: string,
): Promise<ProofRecord> =>
  get<ProofRecord>(client)(`/v1/proofs?docHash=${encodeURIComponent(docHash)}`)();
