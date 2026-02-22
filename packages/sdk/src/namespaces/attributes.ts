/**
 * Whitepaper §4.10 — attributes.query (read-only, for AI/RAG)
 */
import type {
  LemmaClient,
  VerifiedAttributesQueryRequest,
  VerifiedAttributesQueryResponse,
} from "@lemma/spec";
import { post } from "../http";

export const query = (
  client: LemmaClient,
  payload: VerifiedAttributesQueryRequest,
): Promise<VerifiedAttributesQueryResponse> =>
  post<VerifiedAttributesQueryResponse>(client)(
    "/v1/verified-attributes/query",
  )(payload);
