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

// Pipeline result type
type TextGenerationResult = ReadonlyArray<Readonly<{ generated_text: string }>>;

// Pipeline type from transformers
interface TextGenerationPipeline {
  (prompt: string, options: Readonly<Record<string, unknown>>): Promise<TextGenerationResult>;
  readonly dispose?: () => Promise<void>;
}

// Immutable state
type ParserState = Readonly<{
  generator: TextGenerationPipeline | null;
}>;

const createInitialState = (_placeholder?: undefined): ParserState => ({
  generator: null,
});

const DEFAULT_MODEL = "onnx-community/Qwen3-0.6B-ONNX";

/* ── Parser instance (closure-based encapsulation) ─────────────────── */

const createParserInstance = (_placeholder?: undefined) => {
  // Mutable state intentionally scoped within closure for singleton pattern.
  // This pattern is used because:
  // 1. The parser instance must be shared across calls
  // 2. WASM/transformers initialization should happen only once
  // 3. The closure encapsulates mutation, exposing only pure-ish functions
  // eslint-disable-next-line functional/no-let -- closure-scoped mutable state for singleton
  let state: ParserState = createInitialState();
  // eslint-disable-next-line functional/no-let -- closure-scoped mutable state for singleton
  let _transformers: TransformersModule | null = null;

  const loadTransformers = async (_placeholder?: undefined): Promise<TransformersModule> =>
    _transformers ?? (
      _transformers = await import("@huggingface/transformers"),
      _transformers
    );

  const updateState = (newState: ParserState): ParserState =>
    (state = newState, state);

  const createGenerator = async (
    modelId?: string,
    progressCallback?: ProgressCallback,
  ) => {
    const transformers = await loadTransformers();
    const generator = await transformers.pipeline(
      "text-generation",
      R.defaultTo(DEFAULT_MODEL, modelId),
      {
        dtype: "q4" as const,
        ...(progressCallback ? { progress_callback: progressCallback } : {}),
      },
    );
    return generator as unknown as TextGenerationPipeline;
  };

  const getOrCreateGenerator = async (
    modelId?: string,
    progressCallback?: ProgressCallback,
  ): Promise<TextGenerationPipeline> =>
    R.ifElse(
      (_placeholder: undefined) => R.isNil(state.generator),
      async (_placeholder: undefined) => {
        const generator = await createGenerator(modelId, progressCallback);
        return (updateState({ ...state, generator }), generator);
      },
      (_placeholder: undefined) => Promise.resolve(state.generator as TextGenerationPipeline),
    )(undefined);

  const initParser = (
    modelId?: string,
    progressCallback?: ProgressCallback,
  ): Promise<void> =>
    getOrCreateGenerator(modelId, progressCallback).then((_result: unknown) => {});

  // Extract JSON from model output (handle markdown code blocks, etc.)
  const extractJSON = (text: string): string => {
    // Try to find JSON in code blocks first
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    return R.cond<[string], string>([
      [(_t: string) => codeBlockMatch?.[1] != null, (_t: string) => (codeBlockMatch?.[1] ?? "").trim()],
      [(_t: string) => text.match(/\{[\s\S]*\}/) != null, (_t: string) => (text.match(/\{[\s\S]*\}/)?.[0]) ?? ""],
      [R.T, (_t: string) => text.trim()],
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

    const attemptParse = async (attempt: number): Promise<ParsedQuery> => {
      const output: TextGenerationResult = await generator(prompt, {
        max_new_tokens: 512,
        temperature: 0,
        return_full_text: false,
      });

      const content: string = R.pathOr("", [0, "generated_text"], output);

      // eslint-disable-next-line functional/no-try-statements -- JSON.parse requires try-catch
      try {
        const jsonStr = extractJSON(content);
        const parsed: unknown = JSON.parse(jsonStr);
        const parsedObj = parsed as Readonly<{ attributes?: unknown }>;

        // eslint-disable-next-line functional/no-conditional-statements -- validation guard
        if (R.isNil(parsedObj.attributes) || !Array.isArray(parsedObj.attributes)) {
          // eslint-disable-next-line functional/no-throw-statements -- validation
          throw new Error("Missing or invalid 'attributes' array");
        }

        return parsed as ParsedQuery;
      } catch (e) {
        return attempt >= MAX_ATTEMPTS - 1
          ? Promise.reject(
              new Error(
                `Failed to parse LLM response as valid query JSON after ${String(MAX_ATTEMPTS)} attempts: ${(e as Error).message}`,
              ),
            )
          : attemptParse(attempt + 1);
      }
    };

    return attemptParse(0);
  };

  const cleanup = async (_placeholder?: undefined): Promise<void> =>
    R.ifElse(
      (_p: undefined) => R.isNil(state.generator),
      async (_p: undefined) => {},
      async (_p: undefined) => {
        // eslint-disable-next-line functional/no-try-statements -- disposal may fail
        try {
          // eslint-disable-next-line functional/no-conditional-statements -- disposal guard
          if (state.generator?.dispose) {
            // eslint-disable-next-line functional/no-expression-statements -- disposal side effect
            await state.generator.dispose();
          }
        } catch {
          // Ignore disposal errors
        }
        // imperative: state reset and cleanup — no functional alternative
        return ((_transformers = null), updateState(createInitialState()), undefined);
      },
    )(undefined);

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
