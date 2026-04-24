# `@lemmaoracle/mcp`

`@lemmaoracle/mcp` is the MCP access layer for Lemma verified attributes.

## Claude Desktop config example

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

Note: `LEMMA_API_BASE` can be omitted (defaults to production endpoint).

## Tool list

| Tool | Phase | Description |
|---|---|---|
| `lemma_query_verified_attributes` | MVP | Query cryptographically verified attributes from Lemma Oracle |
| `lemma_get_schema` | MVP | Retrieve schema metadata by ID |
| `lemma_get_circuit` | MVP | Retrieve ZK circuit metadata by ID |
| `lemma_get_generator` | MVP | Retrieve document generator metadata by ID |
| `lemma_get_proof_status` | MVP | Get the verification status of a proof by its verificationId |
| `lemma_register_document` | Phase 2 | Register a new document on Lemma |
| `lemma_submit_proof` | Phase 2 | Submit a ZK proof for verification |

Note that write tools (`register_document`, `submit_proof`) are Phase 2.
