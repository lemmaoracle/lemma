/**
 * Whitepaper §4.10 — attributes.query (read-only, for AI/RAG)
 */
import * as R from "ramda";
import type {
  LemmaClient,
  VerifiedAttributesQueryRequest,
  VerifiedAttributesQueryResponse,
} from "@lemma/spec";
import { post } from "../http";
import { parseNaturalQuery } from "../query-parser";

const processNaturalQuery = async (
  client: LemmaClient,
  p: VerifiedAttributesQueryRequest,
): Promise<VerifiedAttributesQueryResponse> => {
  const structured = await parseNaturalQuery(p.query);

  const enhancedPayload: VerifiedAttributesQueryRequest = {
    query: p.query,
    mode: "structured" as const,
    attributes: structured.attributes,
    proof: R.defaultTo(structured.proof, p.proof),
    targets: R.defaultTo(structured.targets, p.targets),
  };

  return post<VerifiedAttributesQueryResponse>(client)(
    "/v1/verified-attributes/query",
  )(enhancedPayload);
};

const processStructuredQuery = (
  client: LemmaClient,
  p: VerifiedAttributesQueryRequest,
): Promise<VerifiedAttributesQueryResponse> => {
  return post<VerifiedAttributesQueryResponse>(client)(
    "/v1/verified-attributes/query",
  )(p);
};

const createQueryHandler = (client: LemmaClient) => {
  return R.cond<[VerifiedAttributesQueryRequest], Promise<VerifiedAttributesQueryResponse>>([
    [
      (p: VerifiedAttributesQueryRequest) => p.mode === "natural",
      (p) => processNaturalQuery(client, p),
    ],
    [
      (_p: VerifiedAttributesQueryRequest) => true,
      (p) => processStructuredQuery(client, p),
    ],
  ]);
};

export const query = async (
  client: LemmaClient,
  payload: VerifiedAttributesQueryRequest,
): Promise<VerifiedAttributesQueryResponse> => {
  const handler = createQueryHandler(client);
  const result = await handler(payload);
  return result;
};
