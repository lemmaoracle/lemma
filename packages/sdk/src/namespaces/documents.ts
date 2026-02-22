/**
 * Whitepaper §4.7 — documents.register (terminal operation)
 */
import type {
  LemmaClient,
  RegisterDocumentRequest,
  RegisterDocumentResponse,
} from "@lemma/spec";
import { post } from "../http";

export const register = (
  client: LemmaClient,
  payload: RegisterDocumentRequest,
): Promise<RegisterDocumentResponse> =>
  post<RegisterDocumentResponse>(client)("/v1/documents")(payload);
