# `@lemmaoracle/mcp`

[![smithery badge](https://smithery.ai/badge/@lemmaoracle/lemma)](https://smithery.ai/servers/lemmaoracle/lemma)
[![npm version](https://img.shields.io/npm/v/@lemmaoracle/mcp.svg)](https://www.npmjs.com/package/@lemmaoracle/mcp)

`@lemmaoracle/mcp` is the **Model Context Protocol (MCP) server** that gives
AI agents access to Lemma's verifiable provenance layer — query
cryptographically verified attributes (zero-knowledge proofs, selective
disclosure, tamper-evident provenance) from confidential documents without
ever exposing the plaintext.

> **Models change. Proofs remain.**

## What is this?

This is an **MCP server**. MCP (Model Context Protocol) is the open protocol
for connecting AI agents to external tools and data sources, originally
released by Anthropic and now maintained as a community standard. This
package implements an MCP server using the official **MCP SDK**
(`@modelcontextprotocol/sdk`) and exposes a set of read-only **tools** for
querying Lemma's verifiable attribute API.

The current MVP exposes **5 read tools**. **Resources** and **prompts** are
not exposed in v0.0.x; write tools (`register_document`, `submit_proof`)
are planned for Phase 2.

## Quick start

Two ways to connect — pick whichever matches your agent setup.

### Option 1 — Smithery (hosted gateway, zero install)

```bash
npx -y smithery mcp add lemmaoracle/lemma
```

Smithery proxies to the Lemma MCP endpoint at `https://lemma--lemmaoracle.run.tools`
and prompts for your Lemma API key. Best for trying the server quickly or for
agents that already speak Smithery. Server page:
[smithery.ai/servers/lemmaoracle/lemma](https://smithery.ai/servers/lemmaoracle/lemma).

### Option 2 — Claude Desktop with npx (stdio)

Add this to your Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "lemma": {
      "command": "npx",
      "args": ["-y", "@lemmaoracle/mcp"],
      "env": {
        "LEMMA_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

Get an API key at https://lemma.frame00.com/services. `LEMMA_API_BASE` can
be omitted (defaults to production endpoint).

## Try it in Glama Inspector

When trying this server in Glama's in-browser inspector (or any MCP
inspector), you can use the demo key below. It is **read-only and scoped
to demo data** (the same key is used by
[example-x402](https://github.com/lemmaoracle/example-x402)):

```
LEMMA_API_KEY=b6363aa6265322ed0d786a11d5b6d3264947052ca72deba4cbe1685d099af892
LEMMA_API_BASE=https://workers.lemma.workers.dev
```

For production access, request a key at https://lemma.frame00.com/services.

## Tools (MCP tool list)

This server exposes the following **MCP tools** (no resources or prompts in
the current MVP):

| Tool | Phase | Description |
|---|---|---|
| `lemma_query_verified_attributes` | MVP | Query cryptographically verified attributes from Lemma. Use this as the primary entry point for finding documents whose attributes match given conditions. |
| `lemma_get_schema` | MVP | Retrieve a Lemma schema (attribute structure) by ID. |
| `lemma_get_circuit` | MVP | Retrieve a ZK proof circuit (constraints + verifier) by ID. |
| `lemma_get_generator` | MVP | Retrieve a document generator (input/output spec) by ID. |
| `lemma_get_proof_status` | MVP | Get the verification status of a proof by its `verificationId`. |
| `lemma_register_document` | Phase 2 | Register a new document on Lemma. |
| `lemma_submit_proof` | Phase 2 | Submit a ZK proof for verification. |

## Architecture

- **MCP Server**: this package — connects AI agents to the Lemma API via the Model Context Protocol.
- **Lemma API**: REST surface deployed on Cloudflare Workers, defined by [OpenAPI v2](https://github.com/lemmaoracle/lemma/blob/main/packages/spec/openapi.lemma.v2.json).
- **MCP SDK**: this server is built on the official [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) (≥ 1.29).
- **License**: Apache-2.0.

## Privacy & data handling

Lemma is designed so that we never receive plaintext documents. The MCP
server only transmits commitments, hashes, and ZK proofs to the Lemma API.
See https://lemma.frame00.com/privacy for the full privacy policy.

## Local development (contributors)

For contributors hacking on the MCP server itself, run it from a local
build of this monorepo. End users should use the `npx` config above.

```bash
git clone https://github.com/lemmaoracle/lemma.git
cd lemma
pnpm install
pnpm -F @lemmaoracle/mcp build
```

The `bin` entry produces `packages/mcp/dist/index.js`. Point Claude Desktop
at the absolute path:

```json
{
  "mcpServers": {
    "lemma": {
      "command": "node",
      "args": ["/absolute/path/to/lemma/packages/mcp/dist/index.js"],
      "env": {
        "LEMMA_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

Rebuild after changes with `pnpm -F @lemmaoracle/mcp build` and restart
Claude Desktop to reconnect. To point at a non-production API, add
`"LEMMA_API_BASE": "https://..."` to `env`.

## Resources

- Documentation: this README + [OpenAPI spec](https://github.com/lemmaoracle/lemma/blob/main/packages/spec/openapi.lemma.v2.json)
- Homepage: https://lemma.frame00.com
- Issues: https://github.com/lemmaoracle/lemma/issues

---

🇯🇵 [日本語版はこちら / Japanese README](./README.ja.md)
