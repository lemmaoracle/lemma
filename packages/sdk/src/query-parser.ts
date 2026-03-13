/**
 * Natural Language Query Parser for Lemma SDK
 *
 * Uses @mlc-ai/web-llm with grammar-constrained JSON output to parse
 * natural language queries like "users over 18 in Japan" into structured
 * query format for the attributes.query API.
 *
 * Whitepaper reference: §4.10 — Verified Attributes Query
 */

import * as webllm from "@mlc-ai/web-llm";
import * as R from "ramda";
import type { VerifiedAttributesQueryRequest } from "@lemma/spec";

// JSON Schema for structured query output
// Matches what the server expects: Array<{ name: string; value: unknown }>
const querySchema = {
  type: "object",
  properties: {
    attributes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          operator: {
            type: "string",
            enum: ["eq", "neq", "gt", "gte", "lt", "lte", "in", "contains"],
          },
          value: { type: ["string", "number", "boolean", "array"] },
        },
        required: ["name", "operator", "value"],
      },
    },
    targets: {
      type: "object",
      properties: {
        schemas: { type: "array", items: { type: "string" } },
      },
    },
    proof: {
      type: "object",
      properties: {
        required: { type: "boolean" },
        type: { type: "string", enum: ["zk-snark", "opaque"] },
      },
    },
  },
  required: ["attributes"],
} as const;

// Immutable state
type ParserState = Readonly<{
  engine: webllm.MLCEngine | null;
}>;

const createInitialState = (): ParserState => ({
  engine: null,
});

// State is managed within a closure for encapsulation
const createParserInstance = () => {
  let state: ParserState = createInitialState();

  const updateState = (newState: ParserState): ParserState => {
    state = newState;
    return state;
  };

  const createEngine = async (
    modelId?: string,
    progressCallback?: webllm.InitProgressCallback,
  ): Promise<webllm.MLCEngine> => {
    const engine = await webllm.CreateMLCEngine(
      R.defaultTo("Phi-3.5-mini-instruct-q4f16_1-MLC", modelId),
      { initProgressCallback: progressCallback },
    );
    return engine;
  };

  const getOrCreateEngine = async (
    modelId?: string,
    progressCallback?: webllm.InitProgressCallback,
  ): Promise<webllm.MLCEngine> => {
    return R.ifElse(
      () => R.isNil(state.engine),
      async () => {
        const engine = await createEngine(modelId, progressCallback);
        updateState({ ...state, engine });
        return engine;
      },
      async () => state.engine as webllm.MLCEngine,
    )();
  };

  const initParser = async (
    modelId?: string,
    progressCallback?: webllm.InitProgressCallback,
  ): Promise<void> => {
    await getOrCreateEngine(modelId, progressCallback);
  };

  const parseNaturalQuery = async (
    naturalQuery: string,
  ): Promise<
    Omit<VerifiedAttributesQueryRequest, "query" | "mode"> & {
      attributes: Array<{ name: string; value: unknown }>;
    }
  > => {
    const engine = await getOrCreateEngine();

    const schema = JSON.stringify(querySchema);
    const prompt = `
You are a query parser. Convert the natural language query into a structured query format.
Return ONLY valid JSON matching the schema below. Do not include any explanation.

Natural query: "${naturalQuery}"

Examples:
- "users over 18 in Japan" → { attributes: [{ name: "age", operator: "gt", value: 18 }, { name: "country", operator: "eq", value: "Japan" }] }
- "verified documents from Alice" → { attributes: [{ name: "issuerId", operator: "eq", value: "Alice" }], proof: { required: true } }
- "people in USA or Canada with age 21 or older" → { attributes: [{ name: "country", operator: "in", value: ["USA", "Canada"] }, { name: "age", operator: "gte", value: 21 }] }
- "employees with salary greater than 50000" → { attributes: [{ name: "salary", operator: "gt", value: 50000 }] }
`;

    const response = await engine.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a query parser that outputs valid JSON matching the provided schema.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 512,
      temperature: 0,
      response_format: {
        type: "json_object",
        schema,
      } as webllm.ResponseFormat,
    });

    const content = R.pathOr("", ["choices", 0, "message", "content"], response);

    return R.when(
      R.isEmpty,
      () => {
        throw new Error("LLM response content is empty");
      },
      () => JSON.parse(content),
    )();
  };

  const cleanup = async (): Promise<void> => {
    return R.ifElse(
      () => R.isNil(state.engine),
      async () => {},
      async () => {
        await (state.engine as webllm.MLCEngine).unload();
        updateState(createInitialState());
      },
    )();
  };

  return {
    initParser,
    parseNaturalQuery,
    cleanup,
  };
};

const parser = createParserInstance();

export const initParser = parser.initParser;
export const parseNaturalQuery = parser.parseNaturalQuery;
export const cleanup = parser.cleanup;
