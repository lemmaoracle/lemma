import * as R from "ramda";
import { attributes } from "@lemmaoracle/sdk";
import type {
  LemmaClient,
  VerifiedAttributesQueryRequest,
} from "@lemmaoracle/sdk";
import { isVerified } from "../isVerified.js";

const enrichItem = (item: Readonly<{
  docHash: string;
  schema: string;
  issuerId: string;
  subjectId: string;
  chainId?: number;
  attributes: Readonly<Record<string, unknown>>;
  proof?: Readonly<{ status?: string; circuitId?: string; chainId?: number } & Record<string, unknown>>;
  disclosure?: unknown;
}>): Readonly<{
  docHash: string;
  schema: string;
  issuerId: string;
  subjectId: string;
  chainId?: number;
  attributes: Readonly<Record<string, unknown>>;
  isVerified: boolean;
  proof: Readonly<{ status?: string; circuitId?: string; chainId?: number } & Record<string, unknown>> | undefined;
  disclosure: unknown;
}> =>
  ({
    ...item,
    isVerified: isVerified(item.proof?.status),
    proof: item.proof,
    disclosure: item.disclosure,
  });

export type QueryVerifiedAttributesInput = Readonly<{
  attributes?: ReadonlyArray<Readonly<{ name: string; operator?: "eq" | "neq" | "gt" | "lt"; value: unknown }>>;
  schemas?: ReadonlyArray<string>;
  chainIds?: ReadonlyArray<number>;
  limit?: number;
  offset?: number;
}>;

const buildRequest = (input: QueryVerifiedAttributesInput): VerifiedAttributesQueryRequest =>
  ({
    attributes: input.attributes ?? [],
    ...(R.isEmpty(input.schemas ?? []) ? {} : { targets: { schemas: input.schemas, chainIds: input.chainIds } }),
    ...(input.limit !== undefined ? { limit: Math.min(Math.max(input.limit, 1), 200) } : {}),
    ...(input.offset !== undefined ? { offset: Math.max(input.offset, 0) } : {}),
  });

export const queryVerifiedAttributes = async (
  client: LemmaClient,
  input: QueryVerifiedAttributesInput,
): Promise<Readonly<{
  results: ReadonlyArray<{
    docHash: string;
    schema: string;
    issuerId: string;
    subjectId: string;
    chainId?: number;
    attributes: Readonly<Record<string, unknown>>;
    isVerified: boolean;
    proof: Readonly<{ status?: string; circuitId?: string; chainId?: number } & Record<string, unknown>> | undefined;
    disclosure: unknown;
  }>;
  hasMore: boolean;
}>> => {
  const request = buildRequest(input);
  const response = await attributes.query(client, request);

  return {
    results: response.results.map(enrichItem),
    hasMore: response.hasMore,
  };
};
