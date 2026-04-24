import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as R from "ramda";
import * as attributes from "@lemmaoracle/sdk/attributes";
import type {
  LemmaClient,
  VerifiedAttributesQueryRequest,
} from "@lemmaoracle/spec";
import { isVerified } from "../isVerified.js";
import { runTool } from "../errors.js";

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
  attributes?: ReadonlyArray<Readonly<{ name: string; operator?: "eq" | "neq" | "gt" | "lt"; value?: unknown }>>;
  schemas?: ReadonlyArray<string>;
  chainIds?: ReadonlyArray<number>;
  limit?: number;
  offset?: number;
}>;

const buildRequest = (input: QueryVerifiedAttributesInput): VerifiedAttributesQueryRequest =>
  ({
    attributes: (input.attributes ?? []).map((attr) => ({
      name: attr.name,
      operator: attr.operator,
      value: attr.value ?? null,
    })),
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

export const queryVerifiedAttributesTool = (server: McpServer, client: LemmaClient): RegisteredTool =>
  server.registerTool(
    "lemma_query_verified_attributes",
    {
      description: "Query cryptographically verified attributes from Lemma Oracle. Returns verified attributes with proof status and selective disclosure info.",
      inputSchema: {
        attributes: z.array(z.object({
          name: z.string(),
          operator: z.enum(["eq", "neq", "gt", "lt"]).optional(),
          value: z.unknown(),
        })).optional(),
        schemas: z.array(z.string()).optional(),
        chainIds: z.array(z.number()).optional(),
        limit: z.number().min(1).max(200).optional(),
        offset: z.number().min(0).optional(),
      },
    },
    (input) => runTool(queryVerifiedAttributes(client, input)),
  );
