import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { buildClient } from "./client.js";
import { normalizeError } from "./errors.js";
import { queryVerifiedAttributes } from "./tools/query-verified-attributes.js";
import { getSchema } from "./tools/get-schema.js";
import { getCircuit } from "./tools/get-circuit.js";
import { getGenerator } from "./tools/get-generator.js";
import { getProofStatus } from "./tools/get-proof-status.js";

// Low-level Server is used for full control over request handlers.
// eslint-disable-next-line @typescript-eslint/no-deprecated
const server = new Server(
  { name: "@lemmaoracle/mcp", version: "0.0.1" },
  { capabilities: { tools: {} } },
);

const TOOLS = [
  {
    name: "lemma_query_verified_attributes",
    description:
      "Query cryptographically verified attributes from Lemma Oracle. " +
      "Returns verified attributes with proof status and selective disclosure info.",
    inputSchema: {
      type: "object" as const,
      properties: {
        attributes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              operator: { type: "string", enum: ["eq", "neq", "gt", "lt"] },
              value: {},
            },
            required: ["name"],
          },
        },
        schemas: { type: "array", items: { type: "string" } },
        chainIds: { type: "array", items: { type: "number" } },
        limit: { type: "number", minimum: 1, maximum: 200 },
        offset: { type: "number", minimum: 0 },
      },
    },
  },
  {
    name: "lemma_get_schema",
    description:
      "Retrieve schema metadata by ID, including normalize WASM artifact location and hash.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "lemma_get_circuit",
    description: "Retrieve ZK circuit metadata by ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "lemma_get_generator",
    description: "Retrieve document generator metadata by ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "lemma_get_proof_status",
    description:
      "Get the verification status of a proof by its verificationId. " +
      "Proof states: received → verifying → verified → onchain-verifying → onchain-verified | rejected",
    inputSchema: {
      type: "object" as const,
      properties: {
        verificationId: { type: "string" },
      },
      required: ["verificationId"],
    },
  },
];

const makeResult = (content: unknown): CallToolResult => ({
  content: [
    {
      type: "text",
      text: JSON.stringify(content, null, 2),
    },
  ],
});

const makeError = (error: unknown): CallToolResult => {
  const normalized = normalizeError(error);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ error: normalized }, null, 2),
      },
    ],
    isError: true,
  };
};

type ToolArgs = Readonly<Record<string, unknown>>;

const executeTool = (
  name: string,
  args: ToolArgs,
): Promise<unknown> => {
  const client = buildClient();

  return name === "lemma_query_verified_attributes"
    ? queryVerifiedAttributes(client, args as Parameters<typeof queryVerifiedAttributes>[1])
    : name === "lemma_get_schema"
      ? getSchema(client, args as Parameters<typeof getSchema>[1])
      : name === "lemma_get_circuit"
        ? getCircuit(client, args as Parameters<typeof getCircuit>[1])
        : name === "lemma_get_generator"
          ? getGenerator(client, args as Parameters<typeof getGenerator>[1])
          : name === "lemma_get_proof_status"
            ? getProofStatus(client, args as Parameters<typeof getProofStatus>[1])
            : Promise.reject(new Error(`Unknown tool: ${name}`));
};

server.setRequestHandler(ListToolsRequestSchema, (_request) =>
  Promise.resolve({ tools: TOOLS }),
);

server.setRequestHandler(CallToolRequestSchema, (request) => {
  const { name, arguments: args } = request.params;
  return executeTool(name, (args ?? {}) as ToolArgs)
    .then(makeResult)
    .catch(makeError);
});

export const startServer = (_void?: undefined): Promise<void> => {
  const transport = new StdioServerTransport();
  return server.connect(transport);
};
