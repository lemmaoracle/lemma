/**
 * Whitepaper §4.8 — proofs.submit (terminal operation)
 */
import type { LemmaClient, SubmitProofRequest, SubmitProofResponse } from "@lemmaoracle/spec";
import { post } from "../http";

export const submit = (
  client: LemmaClient,
  payload: SubmitProofRequest,
): Promise<SubmitProofResponse> => post<SubmitProofResponse>(client)("/v1/proofs")(payload);
