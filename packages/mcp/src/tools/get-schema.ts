import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as schemas from "@lemmaoracle/sdk/schemas";
import type { LemmaClient, SchemaMeta } from "@lemmaoracle/spec";
import { runTool } from "../errors.js";

export type GetSchemaInput = Readonly<{ id: string }>;

export const getSchema = (client: LemmaClient, input: GetSchemaInput): Promise<SchemaMeta> =>
  schemas.getById(client, input.id);

export const getSchemaTool = (server: McpServer, client: LemmaClient): RegisteredTool =>
  server.registerTool(
    "lemma_get_schema",
    {
      description:
        "Retrieve a Lemma schema by its ID via GET /v1/schemas/{id}. " +
        "A schema declares how documents of a given type are interpreted and normalized. " +
        "Returns SchemaMeta { id, description? } with additionalProperties open — implementations commonly include a `normalize` artifact (WASM that maps raw documents to canonical form) and its content hash. " +
        "Use this when you need to interpret attribute keys returned by lemma_query_verified_attributes.",
      inputSchema: {
        id: z
          .string()
          .describe(
            "Schema ID. Returned in the `schema` field of VerifiedAttributesQueryResponseItem from lemma_query_verified_attributes, or registered via POST /v1/schemas.",
          ),
      },
      outputSchema: {
        id: z.string().describe("Schema ID, echoing the request."),
        description: z
          .string()
          .optional()
          .describe("Human-readable description of the schema."),
        normalize: z
          .object({
            artifact: z.object({
              type: z.enum(["ipfs", "https"]).describe("URI scheme for fetching the WASM artifact."),
              wasm: z.string().describe("URL or CID of the WASM module."),
              js: z.string().describe("URL or CID of the wasm-bindgen JS shim required for instantiation."),
            }),
            hash: z.string().describe("Content hash of the WASM module (verifies integrity)."),
            abi: z
              .object({
                raw: z.record(z.string()),
                norm: z.record(z.string()),
              })
              .optional()
              .describe("Optional ABI mapping between raw input keys and normalized attribute names."),
          })
          .describe("Normalize artifact — WASM that maps raw documents to canonical form."),
      },
      annotations: {
        title: "Lemma — get schema",
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
        destructiveHint: false,
      },
    },
    (input) => runTool(getSchema(client, input)),
  );
