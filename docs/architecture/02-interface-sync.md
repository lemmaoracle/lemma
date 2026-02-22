
# Interface Synchronisation (SDK ↔ Workers)

## Authoritative sources

- `packages/spec/src/index.ts` — TypeScript types
- `packages/spec/openapi.lemma.v2.json` — HTTP routes and payloads


## Sync mechanism

The Workers repo holds a **copy** at `spec/types.ts` and `spec/openapi.lemma.v2.json`.
Run this after any change:

```bash
pnpm sync:workers:spec
```


## SDK ↔ REST endpoint mapping

| SDK function | Method | Workers route |
| :-- | :-- | :-- |
| `schemas.register` | POST | `/v1/schemas` |
| `schemas.getById` | GET | `/v1/schemas/:id` |
| `circuits.register` | POST | `/v1/circuits` |
| `circuits.getById` | GET | `/v1/circuits/:circuitId` |
| `generators.register` | POST | `/v1/doc-generators` |
| `generators.getById` | GET | `/v1/doc-generators/:generatorId` |
| `documents.register` | POST | `/v1/documents` |
| `proofs.submit` | POST | `/v1/proofs` |
| `attributes.query` | POST | `/v1/verified-attributes/query` |

