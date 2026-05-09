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
    },
    (input) => runTool(getSchema(client, input)),
  );
