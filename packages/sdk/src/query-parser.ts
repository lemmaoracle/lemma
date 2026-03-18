/**
 * Natural Language Query Parser for Lemma SDK
 *
 * Uses @huggingface/transformers (Transformers.js v3) to parse
 * natural language queries into structured query format.
 * Works in both browser (onnxruntime-web) and Node.js (onnxruntime-node).
 *
 * Whitepaper reference: §4.10 — Verified Attributes Query
 */

import * as R from "ramda";
import type { VerifiedAttributesQueryRequest } from "@lemmaoracle/spec";

// The query schema definition — matches what the server expects
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

// Type for the transformers module
type TransformersModule = typeof import("@huggingface/transformers");

// Type for progress callback (compatible with transformers.js progress events)
type ProgressCallback = (progress: {
  status: string;
  progress?: number;
  file?: string;
}) => void;

// Immutable state
type ParserState = Readonly<{
  generator: any | null; // TextGenerationPipeline
}>;

const createInitialState = (): ParserState => ({
  generator: null,
});

const DEFAULT_MODEL = "onnx-community/Qwen3-0.6B-ONNX";

// State is managed within a closure for encapsulation
const createParserInstance = () => {
  let state: ParserState = createInitialState();
  let _transformers: TransformersModule | null = null;

  const loadTransformers = async (): Promise<TransformersModule> => {
    if (_transformers) return _transformers;
    _transformers = await import("@huggingface/transformers");
    return _transformers;
  };

  const updateState = (newState: ParserState): ParserState => {
    state = newState;
    return state;
  };

  const createGenerator = async (
    modelId?: string,
    progressCallback?: ProgressCallback,
  ) => {
    const transformers = await loadTransformers();
    const generator = await transformers.pipeline(
      "text-generation",
      R.defaultTo(DEFAULT_MODEL, modelId),
      {
        dtype: "q4" as any,
        ...(progressCallback ? { progress_callback: progressCallback } : {}),
      },
    );
    return generator;
  };

  const getOrCreateGenerator = async (
    modelId?: string,
    progressCallback?: ProgressCallback,
  ) => {
    return R.ifElse(
      () => R.isNil(state.generator),
      async () => {
        const generator = await createGenerator(modelId, progressCallback);
        updateState({ ...state, generator });
        return generator;
      },
      async () => state.generator,
    )();
  };

  const initParser = async (
    modelId?: string,
    progressCallback?: ProgressCallback,
  ): Promise<void> => {
    await getOrCreateGenerator(modelId, progressCallback);
  };

  // Extract JSON from model output (handle markdown code blocks, etc.)
  const extractJSON = (text: string): string => {
    // Try to find JSON in code blocks first
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch?.[1]) return codeBlockMatch[1].trim();

    // Try to find raw JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return jsonMatch[0];

    return text.trim();
  };

  const parseNaturalQuery = async (
    naturalQuery: string,
  ): Promise<
    Omit<VerifiedAttributesQueryRequest, "query" | "mode"> & {
      attributes: Array<{ name: string; value: unknown }>;
    }
  > => {
    const generator = await getOrCreateGenerator();
    const schema = JSON.stringify(querySchema);

    const prompt = `You are a query parser. Convert the natural language query into a structured query format.
Return ONLY valid JSON matching the schema below. Do not include any explanation.

Schema: ${schema}

Natural query: "${naturalQuery}"

Examples:
- "users over 18 in Japan" → {"attributes":[{"name":"age","operator":"gt","value":18},{"name":"country","operator":"eq","value":"Japan"}]}
- "verified documents from Alice" → {"attributes":[{"name":"issuerId","operator":"eq","value":"Alice"}],"proof":{"required":true}}
- "people in USA or Canada with age 21 or older" → {"attributes":[{"name":"country","operator":"in","value":["USA","Canada"]},{"name":"age","operator":"gte","value":21}]}

JSON output:`;

    const MAX_ATTEMPTS = 2;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const output = await generator(prompt, {
        max_new_tokens: 512,
        temperature: 0,
        return_full_text: false,
      });

      const content = R.pathOr("", [0, "generated_text"], output);

      try {
        const jsonStr = extractJSON(content);
        const parsed = JSON.parse(jsonStr);

        if (R.isNil(parsed.attributes) || !Array.isArray(parsed.attributes)) {
          throw new Error("Missing or invalid 'attributes' array");
        }

        return parsed;
      } catch (e) {
        if (attempt === MAX_ATTEMPTS - 1) {
          throw new Error(
            `Failed to parse LLM response as valid query JSON after ${MAX_ATTEMPTS} attempts: ${(e as Error).message}`,
          );
        }
      }
    }

    // Unreachable, but TypeScript needs it
    throw new Error("Unexpected: exhausted all parse attempts");
  };

  const cleanup = async (): Promise<void> => {
    return R.ifElse(
      () => R.isNil(state.generator),
      async () => {},
      async () => {
        try {
          if (state.generator?.dispose) {
            await state.generator.dispose();
          }
        } catch {
          // Ignore disposal errors
        }
        updateState(createInitialState());
        _transformers = null;
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
