# @lemmaoracle/parser

Natural language query parser for the Lemma protocol. Converts natural language into structured attribute queries using on-device LLM inference via [Transformers.js](https://huggingface.co/docs/transformers.js).

> **Privacy-preserving**: All parsing happens client-side. No query text is sent to any server.

## Install

```bash
pnpm add @lemmaoracle/parser
```

## Usage

```typescript
import { initParser, parseNaturalQuery, cleanup } from "@lemmaoracle/parser";

// 1. Initialize (downloads model on first run)
await initParser();

// 2. Parse natural language → structured query
const query = await parseNaturalQuery("users over 18 in Japan");
// → { attributes: [{ name: "age", operator: "gt", value: 18 }, { name: "country", operator: "eq", value: "Japan" }] }

// 3. Use with @lemmaoracle/sdk
import { create, attributes } from "@lemmaoracle/sdk";
const client = create({ apiBase: "https://api.lemmaoracle.com" });
const results = await attributes.query(client, query);

// 4. Cleanup when done
await cleanup();
```

## API

### `initParser(modelId?, progressCallback?)`

Initialize the parser with an optional custom model and progress callback.

- `modelId` — ONNX model ID (default: `onnx-community/Qwen3-0.6B-ONNX`)
- `progressCallback` — Callback for model download progress

### `parseNaturalQuery(query)`

Parse a natural language string into a `ParsedQuery` object.

### `cleanup()`

Release model resources.

## Types

```typescript
type ParsedQuery = {
  attributes: AttributeCondition[];
  targets?: { schemas?: string[] };
  proof?: { required: boolean; type?: "zk-snark" | "opaque" };
};

type AttributeCondition = {
  name: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value: string | number | boolean | (string | number)[];
};
```

## Whitepaper

See §4.10 — Verified Attributes Query.
