import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { create } from "@lemmaoracle/sdk/client";
import type { LemmaClient } from "@lemmaoracle/spec";
import { queryVerifiedAttributesTool } from "./tools/query-verified-attributes.js";
import { getSchemaTool } from "./tools/get-schema.js";
import { getCircuitTool } from "./tools/get-circuit.js";
import { getGeneratorTool } from "./tools/get-generator.js";
import { getProofStatusTool } from "./tools/get-proof-status.js";

export type LemmaMcpServerConfig = Readonly<{
  apiBase?: string;
  apiKey?: string;
  defaultChainId?: number;
  /** Override the version reported via MCP serverInfo. Defaults to PACKAGE_VERSION. */
  version?: string;
}>;

// Keep in sync with packages/mcp/package.json#version. Surfaced via MCP
// serverInfo.version on initialize handshake; agents and registries (Glama,
// Smithery) display this. CTO follow-up: replace with build-time injection
// or a sync hook in publish-npm.sh.
const PACKAGE_VERSION = "0.0.21";

/** Tool registration functions */
type ToolRegister = (server: McpServer, client: LemmaClient) => void;

/** Register all tools on the server (side effects encapsulated at boundary). */
const registerTools = (
  server: McpServer,
  client: LemmaClient,
  tools: readonly ToolRegister[],
): McpServer =>
  tools.reduce(
    (srv, register) => (register(srv, client), srv),
    server,
  );

export const createLemmaMcpServer = (config: LemmaMcpServerConfig): McpServer => {
  const client: LemmaClient = create({
    ...(config.apiBase !== undefined ? { apiBase: config.apiBase } : {}),
    ...(config.apiKey !== undefined ? { apiKey: config.apiKey } : {}),
    ...(config.defaultChainId !== undefined ? { defaultChainId: config.defaultChainId } : {}),
  });

  const server = new McpServer({
    name: "@lemmaoracle/mcp",
    version: config.version ?? PACKAGE_VERSION,
  });

  const tools: readonly ToolRegister[] = [
    queryVerifiedAttributesTool,
    getSchemaTool,
    getCircuitTool,
    getGeneratorTool,
    getProofStatusTool,
  ];

  return registerTools(server, client, tools);
};
