#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createLemmaMcpServer } from "./server.js";

const server = createLemmaMcpServer({
  apiBase: process.env.LEMMA_API_BASE,
  apiKey: process.env.LEMMA_API_KEY,
  defaultChainId: process.env.LEMMA_DEFAULT_CHAIN_ID
    ? Number(process.env.LEMMA_DEFAULT_CHAIN_ID)
    : undefined,
});

const transport = new StdioServerTransport();
server.connect(transport).catch((_error: unknown) => process.exit(1));
