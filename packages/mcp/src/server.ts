import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { create } from "@lemmaoracle/sdk";
import type { LemmaClient } from "@lemmaoracle/sdk";
import { queryVerifiedAttributesTool } from "./tools/query-verified-attributes.js";
import { getSchemaTool } from "./tools/get-schema.js";
import { getCircuitTool } from "./tools/get-circuit.js";
import { getGeneratorTool } from "./tools/get-generator.js";
import { getProofStatusTool } from "./tools/get-proof-status.js";

export type LemmaMcpServerConfig = Readonly<{
  apiBase?: string;
  apiKey?: string;
  defaultChainId?: number;
}>;

export const createLemmaMcpServer = (config: LemmaMcpServerConfig): McpServer => {
  const client: LemmaClient = create({
    ...(config.apiBase !== undefined ? { apiBase: config.apiBase } : {}),
    ...(config.apiKey !== undefined ? { apiKey: config.apiKey } : {}),
    ...(config.defaultChainId !== undefined ? { defaultChainId: config.defaultChainId } : {}),
  });

  const server = new McpServer({
    name: "@lemmaoracle/mcp",
    version: "0.0.1",
  });

  // Tool registration is inherently side-effecting; disable FP lint for this boundary.
  // eslint-disable-next-line functional/no-expression-statements
  queryVerifiedAttributesTool(server, client);
  // eslint-disable-next-line functional/no-expression-statements
  getSchemaTool(server, client);
  // eslint-disable-next-line functional/no-expression-statements
  getCircuitTool(server, client);
  // eslint-disable-next-line functional/no-expression-statements
  getGeneratorTool(server, client);
  // eslint-disable-next-line functional/no-expression-statements
  getProofStatusTool(server, client);

  return server;
};
