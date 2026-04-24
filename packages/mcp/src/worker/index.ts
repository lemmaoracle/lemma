import { createMcpHandler } from "agents/mcp";
import { createLemmaMcpServer } from "../server.js";

export interface Env {
  readonly LEMMA_API_BASE?: string;
  readonly LEMMA_API_KEY?: string;
  readonly LEMMA_DEFAULT_CHAIN_ID?: string;
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    const server = createLemmaMcpServer({
      apiBase: env.LEMMA_API_BASE,
      apiKey: env.LEMMA_API_KEY,
      defaultChainId: env.LEMMA_DEFAULT_CHAIN_ID
        ? Number(env.LEMMA_DEFAULT_CHAIN_ID)
        : undefined,
    });
    return createMcpHandler(server)(req, env, ctx);
  },
} satisfies ExportedHandler<Env>;
