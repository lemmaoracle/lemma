import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { circuits } from "@lemmaoracle/sdk";
import type { LemmaClient, CircuitMeta } from "@lemmaoracle/sdk";
import { runTool } from "../errors.js";

export type GetCircuitInput = Readonly<{ id: string }>;

export const getCircuit = (client: LemmaClient, input: GetCircuitInput): Promise<CircuitMeta> =>
  circuits.getById(client, input.id);

export const getCircuitTool = (server: McpServer, client: LemmaClient): RegisteredTool =>
  server.registerTool(
    "lemma_get_circuit",
    {
      description: "Retrieve ZK circuit metadata by ID.",
      inputSchema: { id: z.string() },
    },
    (input) => runTool(getCircuit(client, input)),
  );
