# Lemma Oracle

> Give AI proven facts.

Lemma is a cryptographically verified truth layer for agent AI. It lets AI
reason over confidential data via zero-knowledge proofs, selective
disclosure, and on-chain provenance — while raw content stays encrypted.

Every attribute an AI reads through Lemma carries permanent provenance:
who issued it, which schema defined it, how it was proven, and where the
proof lives on-chain.

## Learn more

- 🌐 **Website**: https://lemma.frame00.com
- 📄 **Services**: https://lemma.frame00.com/services
- ✍️ **Blog & essays**: https://lemma.frame00.com/blog
- ❓ **FAQ**: https://lemma.frame00.com/blog/faq

## MCP server

`@lemmaoracle/mcp` is the **Model Context Protocol (MCP) server** for Lemma,
published on npm and built with the official **MCP SDK**
(`@modelcontextprotocol/sdk`). Point Claude Desktop or any MCP-compatible
agent at it:

```json
{
  "mcpServers": {
    "lemma": {
      "command": "npx",
      "args": ["-y", "@lemmaoracle/mcp"],
      "env": { "LEMMA_API_KEY": "YOUR_API_KEY" }
    }
  }
}
```

Tool list, env vars, and contributor build: [packages/mcp/README.md](./packages/mcp/README.md) · [npm](https://www.npmjs.com/package/@lemmaoracle/mcp)

## Packages

Public packages in this monorepo:

- **[`packages/mcp/`](./packages/mcp)** — `@lemmaoracle/mcp`, the **Model Context Protocol (MCP) server** for AI agents (this is the package above).
- **[`packages/sdk/`](./packages/sdk)** — `@lemmaoracle/sdk`, TypeScript SDK for the Lemma API.
- **[`packages/spec/`](./packages/spec)** — `@lemmaoracle/spec`, OpenAPI spec + shared TypeScript types.
- **[`packages/x402/`](./packages/x402)** — `@lemmaoracle/x402`, x402 payment middleware drop-in.

## Contact

For partnership and implementation inquiries, please use the contact form:
https://lemma.frame00.com/services

## License

This repository uses different licenses for different packages:

| Package | License |
|---|---|
| `packages/contracts`, `packages/relay`, `packages/passthrough` | **BUSL-1.1** (changes to Apache-2.0 on 2030-05-01) |
| `packages/sdk`, `packages/spec`, `packages/mcp`, `packages/parser`, `packages/x402` | **Apache-2.0** |
| `packages/web` | Private (not distributed) |

The root `LICENSE` file applies as the default. Each package may contain its own `LICENSE` file that takes precedence.

---

© 2026 FRAME00 Inc.

🇯🇵 [日本語版はこちら / Japanese README](./README.ja.md)
