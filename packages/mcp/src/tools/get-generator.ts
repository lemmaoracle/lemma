import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as generators from "@lemmaoracle/sdk/generators";
import type { LemmaClient, GeneratorMeta } from "@lemmaoracle/spec";
import { runTool } from "../errors.js";

export type GetGeneratorInput = Readonly<{ id: string }>;

export const getGenerator = (client: LemmaClient, input: GetGeneratorInput): Promise<GeneratorMeta> =>
  generators.getById(client, input.id);

export const getGeneratorTool = (server: McpServer, client: LemmaClient): RegisteredTool =>
  server.registerTool(
    "lemma_get_generator",
    {
      description: "Retrieve document generator metadata by ID.",
      inputSchema: { id: z.string() },
    },
    (input) => runTool(getGenerator(client, input)),
  );
