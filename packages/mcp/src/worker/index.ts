import { createMcpHandler } from "agents/mcp";
import { createLemmaMcpServer } from "../server.js";

export interface Env {
  readonly LEMMA_API_BASE?: string;
  readonly LEMMA_DEFAULT_CHAIN_ID?: string;
}

const extractBearerToken = (header: string | null): string | undefined => {
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  return token === "" ? undefined : token;
};

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    const apiKey = extractBearerToken(req.headers.get("Authorization"));

    const server = createLemmaMcpServer({
      apiBase: env.LEMMA_API_BASE,
      apiKey,
      defaultChainId: env.LEMMA_DEFAULT_CHAIN_ID
        ? Number(env.LEMMA_DEFAULT_CHAIN_ID)
        : undefined,
    });
    return createMcpHandler(server)(req, env, ctx);
  },
} satisfies ExportedHandler<Env>;
