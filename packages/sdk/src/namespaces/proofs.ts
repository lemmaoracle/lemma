/**
 * Whitepaper §4.8 — proofs.submit / proofs.getById / proofs.getByDocHash
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

/**
 * Fetch a proof record by its primary key `verificationId`.
 *
 * Unauthenticated callers receive the redacted public subset (no `proof`/
 * `inputs`); API-key holders receive the full record.
 */
export const getById = (
  client: LemmaClient,
  verificationId: string,
): Promise<ProofRecord> =>
  get<ProofRecord>(client)(`/v1/proofs/${encodeURIComponent(verificationId)}`)();

/**
 * Legacy compatibility: fetch the latest proof record for a document hash.
 * Prefer `getById` for new code — `verificationId` is the primary lookup key.
 */
export const getByDocHash = (
  client: LemmaClient,
  docHash: string,
): Promise<ProofRecord> =>
  get<ProofRecord>(client)(`/v1/proofs?docHash=${encodeURIComponent(docHash)}`)();
