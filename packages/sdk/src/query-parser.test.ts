import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Hoist mock variables so they're available in vi.mock factory
const { mockGenerator, mockDispose, mockPipeline } = vi.hoisted(() => {
  const mockDispose = vi.fn();
  const mockGenerator = Object.assign(vi.fn(), { dispose: mockDispose });
  const mockPipeline = vi.fn().mockResolvedValue(mockGenerator);
  return { mockGenerator, mockDispose, mockPipeline };
});

// Mock the @huggingface/transformers module at the top level
vi.mock("@huggingface/transformers", () => ({
  pipeline: mockPipeline,
}));

import { initParser, parseNaturalQuery, cleanup } from "./query-parser.js";
import * as transformers from "@huggingface/transformers";

// Type assertion for the mocked module
const mockedTransformers = transformers as any;

describe("Query Parser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up any pending state
    await cleanup();
  });

  describe("initParser", () => {
    it("should initialize parser with default model when no modelId provided", async () => {
      const progressCallback = vi.fn();

      await initParser(undefined, progressCallback);

      expect(mockedTransformers.pipeline).toHaveBeenCalledWith(
        "text-generation",
        "onnx-community/Qwen3-0.6B-ONNX",
        expect.objectContaining({
          dtype: "q4",
          progress_callback: progressCallback,
        }),
      );
    });

    it("should initialize parser with custom model when modelId provided", async () => {
      const progressCallback = vi.fn();

      await initParser("custom-model-id", progressCallback);

      expect(mockedTransformers.pipeline).toHaveBeenCalledWith(
        "text-generation",
        "custom-model-id",
        expect.objectContaining({
          dtype: "q4",
          progress_callback: progressCallback,
        }),
      );
    });

    it("should reuse existing generator on subsequent calls", async () => {
      // First call
      await initParser();
      expect(mockedTransformers.pipeline).toHaveBeenCalledTimes(1);

      // Reset the mock to track new calls
      mockedTransformers.pipeline.mockClear();

      // Second call should not create new generator
      await initParser();
      expect(mockedTransformers.pipeline).not.toHaveBeenCalled();
    });
  });

  describe("parseNaturalQuery", () => {
    it("should parse simple natural language query", async () => {
      await initParser();

      const mockResponse = [
        {
          generated_text: JSON.stringify({
            attributes: [
              { name: "age", operator: "gt", value: 18 },
              { name: "country", operator: "eq", value: "Japan" },
            ],
          }),
        },
      ];

      mockGenerator.mockResolvedValue(mockResponse);

      const result = await parseNaturalQuery("users over 18 in Japan");

      expect(mockGenerator).toHaveBeenCalledWith(
        expect.stringContaining('Natural query: "users over 18 in Japan"'),
        expect.objectContaining({
          max_new_tokens: 512,
          temperature: 0,
          return_full_text: false,
        }),
      );

      expect(result).toEqual({
        attributes: [
          { name: "age", operator: "gt", value: 18 },
          { name: "country", operator: "eq", value: "Japan" },
        ],
      });
    });

    it("should parse query with proof requirements", async () => {
      await initParser();

      const mockResponse = [
        {
          generated_text: JSON.stringify({
            attributes: [
              { name: "issuerId", operator: "eq", value: "Alice" },
            ],
            proof: { required: true, type: "zk-snark" },
          }),
        },
      ];

      mockGenerator.mockResolvedValue(mockResponse);

      const result = await parseNaturalQuery("verified documents from Alice");

      expect(result).toEqual({
        attributes: [{ name: "issuerId", operator: "eq", value: "Alice" }],
        proof: { required: true, type: "zk-snark" },
      });
    });

    it("should parse query with multiple conditions", async () => {
      await initParser();

      const mockResponse = [
        {
          generated_text: JSON.stringify({
            attributes: [
              { name: "country", operator: "in", value: ["USA", "Canada"] },
              { name: "age", operator: "gte", value: 21 },
            ],
          }),
        },
      ];

      mockGenerator.mockResolvedValue(mockResponse);

      const result = await parseNaturalQuery(
        "people in USA or Canada with age 21 or older",
      );

      expect(result).toEqual({
        attributes: [
          { name: "country", operator: "in", value: ["USA", "Canada"] },
          { name: "age", operator: "gte", value: 21 },
        ],
      });
    });

    it("should throw error when LLM response is empty after retries", async () => {
      await initParser();

      mockGenerator.mockResolvedValue([{ generated_text: "" }]);

      await expect(parseNaturalQuery("test query")).rejects.toThrow(
        "Failed to parse LLM response as valid query JSON after 2 attempts",
      );
    });

    it("should throw error when LLM response is invalid JSON after retries", async () => {
      await initParser();

      mockGenerator.mockResolvedValue([{ generated_text: "invalid json" }]);

      await expect(parseNaturalQuery("test query")).rejects.toThrow(
        "Failed to parse LLM response as valid query JSON after 2 attempts",
      );
    });

    it("should initialize generator automatically if not initialized", async () => {
      // Don't call initParser first
      const mockResponse = [
        {
          generated_text: JSON.stringify({
            attributes: [{ name: "test", operator: "eq", value: "value" }],
          }),
        },
      ];

      mockGenerator.mockResolvedValue(mockResponse);

      const result = await parseNaturalQuery("test query");

      expect(mockedTransformers.pipeline).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should extract JSON from markdown code blocks", async () => {
      await initParser();

      const jsonContent = JSON.stringify({
        attributes: [{ name: "age", operator: "gt", value: 25 }],
      });

      mockGenerator.mockResolvedValue([
        {
          generated_text: `\`\`\`json\n${jsonContent}\n\`\`\``,
        },
      ]);

      const result = await parseNaturalQuery("users over 25");

      expect(result).toEqual({
        attributes: [{ name: "age", operator: "gt", value: 25 }],
      });
    });

    it("should retry on first failure and succeed on second attempt", async () => {
      await initParser();

      const validResponse = [
        {
          generated_text: JSON.stringify({
            attributes: [{ name: "age", operator: "gt", value: 18 }],
          }),
        },
      ];

      // First call returns invalid, second returns valid
      mockGenerator
        .mockResolvedValueOnce([{ generated_text: "not json" }])
        .mockResolvedValueOnce(validResponse);

      const result = await parseNaturalQuery("users over 18");

      expect(mockGenerator).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        attributes: [{ name: "age", operator: "gt", value: 18 }],
      });
    });
  });

  describe("cleanup", () => {
    it("should dispose generator when cleanup is called", async () => {
      await initParser();

      await cleanup();
      expect(mockDispose).toHaveBeenCalled();
    });

    it("should not throw when cleanup is called without initialization", async () => {
      await expect(cleanup()).resolves.not.toThrow();
    });
  });
});
