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
  attributes?: ReadonlyArray<
    Readonly<{
      name: string;
      operator?: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
      value?: unknown;
    }>
  >;
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
      description:
        "Query cryptographically verified attributes from Lemma. " +
        "Use this as the primary tool for finding documents whose attributes match given conditions (e.g., \"subject's birthYear lt 2008\"). " +
        "Returns { results: Array<{ docHash, schema, issuerId, subjectId, attributes, isVerified, proof?: { status, circuitId, chainId }, disclosure? }>, hasMore }. " +
        "The MCP layer enriches each item with an `isVerified` flag derived from `proof.status` (true when status is 'verified' or 'onchain-verified'). " +
        "Use lemma_get_proof_status to monitor a specific proof; use lemma_get_schema to interpret the keys returned in `attributes`.",
      inputSchema: {
        attributes: z
          .array(
            z.object({
              name: z.string().describe("Attribute key as defined by the schema."),
              operator: z
                .enum(["eq", "neq", "gt", "gte", "lt", "lte", "in", "contains"])
                .optional()
                .describe(
                  "Comparison operator. Defaults to eq when omitted. 'in' takes an array value; 'contains' is substring/array-element match.",
                ),
              value: z
                .unknown()
                .describe(
                  "Comparison target value. Type depends on the schema's attribute definition. For 'in', pass an array.",
                ),
            }),
          )
          .optional()
          .describe("Attribute predicates to AND-combine."),
        schemas: z
          .array(z.string())
          .optional()
          .describe("Restrict results to documents conforming to these schema IDs."),
        chainIds: z
          .array(z.number())
          .optional()
          .describe("Restrict results to attributes verified on these chain IDs (EVM)."),
        limit: z
          .number()
          .min(1)
          .max(200)
          .optional()
          .describe("Max results per page (1–200). Defaults to API server default (50)."),
        offset: z
          .number()
          .min(0)
          .optional()
          .describe("Pagination offset. Pair with `hasMore` in the response to walk pages."),
      },
    },
    (input) => runTool(queryVerifiedAttributes(client, input)),
  );
