/**
 * @lemmaoracle/parser — Natural Language Query Parser
 *
 * Uses @huggingface/transformers (Transformers.js v3) to parse
 * natural language queries into structured query format.
 * Works in both browser (onnxruntime-web) and Node.js (onnxruntime-node).
 *
 * Whitepaper reference: §4.10 — Verified Attributes Query
 */

import * as R from "ramda";

/* ── Public types ──────────────────────────────────────────────────── */

export type AttributeCondition = Readonly<{
  name: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value: string | number | boolean | ReadonlyArray<string | number>;
}>;

export type ParsedQuery = Readonly<{
  attributes: ReadonlyArray<AttributeCondition>;
  targets?: Readonly<{
    schemas?: ReadonlyArray<string>;
  }>;
  proof?: Readonly<{
    required: boolean;
    type?: "zk-snark" | "opaque";
  }>;
}>;

/* ── Query schema (for LLM prompt) ─────────────────────────────────── */

export const querySchema = {
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

/* ── Internal types ─────────────────────────────────────────────────── */

// Type for the transformers module
type TransformersModule = typeof import("@huggingface/transformers");

// Type for progress callback (compatible with transformers.js progress events)
export type ProgressCallback = (progress: {
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

/* ── Parser instance (closure-based encapsulation) ─────────────────── */

const createParserInstance = () => {
  // eslint-disable-next-line functional/no-let -- closure-scoped mutable state for singleton
  let state: ParserState = createInitialState();
  // eslint-disable-next-line functional/no-let -- closure-scoped mutable state for singleton
  let _transformers: TransformersModule | null = null;

  const loadTransformers = async (): Promise<TransformersModule> => {
    // eslint-disable-next-line functional/no-conditional-statements -- guard clause
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
    return R.cond<[string], string>([
      [() => codeBlockMatch?.[1] != null, () => codeBlockMatch![1]!.trim()],
      [() => text.match(/\{[\s\S]*\}/) != null, () => text.match(/\{[\s\S]*\}/)![0]!],
      [R.T, () => text.trim()],
    ])(text);
  };

  const parseNaturalQuery = async (
    naturalQuery: string,
  ): Promise<ParsedQuery> => {
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

    // eslint-disable-next-line functional/no-loop-statements -- retry loop with early return
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

        // eslint-disable-next-line functional/no-conditional-statements -- validation guard
        if (R.isNil(parsed.attributes) || !Array.isArray(parsed.attributes)) {
          // eslint-disable-next-line functional/no-throw-statements -- validation
          throw new Error("Missing or invalid 'attributes' array");
        }

        return parsed as ParsedQuery;
      } catch (e) {
        // eslint-disable-next-line functional/no-conditional-statements -- retry guard
        if (attempt === MAX_ATTEMPTS - 1) {
          return Promise.reject(
            new Error(
              `Failed to parse LLM response as valid query JSON after ${MAX_ATTEMPTS} attempts: ${(e as Error).message}`,
            ),
          );
        }
      }
    }

    // Unreachable, but TypeScript needs it
    return Promise.reject(new Error("Unexpected: exhausted all parse attempts"));
  };

  const cleanup = async (): Promise<void> => {
    return R.ifElse(
      () => R.isNil(state.generator),
      async () => {},
      async () => {
        try {
          // eslint-disable-next-line functional/no-conditional-statements -- disposal guard
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
