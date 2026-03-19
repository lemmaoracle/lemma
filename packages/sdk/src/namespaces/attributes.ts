/**
 * Whitepaper §4.10 — attributes.query (read-only, for AI/RAG)
 *
 * Accepts structured queries only. Natural language parsing is available
 * as a separate package: @lemmaoracle/parser.
 */
import type {
  LemmaClient,
  VerifiedAttributesQueryRequest,
  VerifiedAttributesQueryResponse,
} from "@lemmaoracle/spec";
import { post } from "../http.js";

export const query = async (
  client: LemmaClient,
  payload: VerifiedAttributesQueryRequest,
): Promise<VerifiedAttributesQueryResponse> => {
  return post<VerifiedAttributesQueryResponse>(client)("/v1/verified-attributes/query")(payload);
};
