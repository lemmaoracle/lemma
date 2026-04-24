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
      description: "Retrieve schema metadata by ID, including normalize WASM artifact location and hash.",
      inputSchema: { id: z.string() },
    },
    (input) => runTool(getSchema(client, input)),
  );
