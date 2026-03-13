import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the @mlc-ai/web-llm module at the top level
vi.mock("@mlc-ai/web-llm", () => {
  const mockCreateMLCEngine = vi.fn();
  const mockChatCompletionsCreate = vi.fn();
  const mockUnload = vi.fn();
  
  return {
    CreateMLCEngine: mockCreateMLCEngine.mockResolvedValue({
      chat: {
        completions: {
          create: mockChatCompletionsCreate,
        },
      },
      unload: mockUnload,
    }),
    // Expose mocks for test assertions
    __mocks: {
      mockCreateMLCEngine,
      mockChatCompletionsCreate,
      mockUnload,
    },
  };
});

import { initParser, parseNaturalQuery, cleanup } from "./query-parser";
import * as webllm from "@mlc-ai/web-llm";

// Type assertion for the mocked module
const mockedWebllm = webllm as any;

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
      
      expect(mockedWebllm.CreateMLCEngine).toHaveBeenCalledWith(
        "Phi-3.5-mini-instruct-q4f16_1-MLC",
        { initProgressCallback: progressCallback }
      );
    });
    
    it("should initialize parser with custom model when modelId provided", async () => {
      const progressCallback = vi.fn();
      
      await initParser("custom-model-id", progressCallback);
      
      expect(mockedWebllm.CreateMLCEngine).toHaveBeenCalledWith(
        "custom-model-id",
        { initProgressCallback: progressCallback }
      );
    });
    
    it("should reuse existing engine on subsequent calls", async () => {
      // First call
      await initParser();
      expect(mockedWebllm.CreateMLCEngine).toHaveBeenCalledTimes(1);
      
      // Reset the mock to track new calls
      mockedWebllm.CreateMLCEngine.mockClear();
      
      // Second call should not create new engine
      await initParser();
      expect(mockedWebllm.CreateMLCEngine).not.toHaveBeenCalled();
    });
  });
  
  describe("parseNaturalQuery", () => {
    it("should parse simple natural language query", async () => {
      // Initialize parser first
      await initParser();
      
      // Get the mock chat completions create function
      const mockEngine = await mockedWebllm.CreateMLCEngine();
      const mockChatCompletionsCreate = mockEngine.chat.completions.create;
      
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              attributes: [
                { name: "age", operator: "gt", value: 18 },
                { name: "country", operator: "eq", value: "Japan" },
              ],
            }),
          },
        }],
      };
      
      mockChatCompletionsCreate.mockResolvedValue(mockResponse);
      
      const result = await parseNaturalQuery("users over 18 in Japan");
      
      expect(mockChatCompletionsCreate).toHaveBeenCalledWith({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "system",
            content: "You are a query parser that outputs valid JSON matching the provided schema.",
          }),
          expect.objectContaining({
            role: "user",
            content: expect.stringContaining('Natural query: "users over 18 in Japan"'),
          }),
        ]),
        max_tokens: 512,
        temperature: 0,
        response_format: expect.objectContaining({
          type: "json_object",
          schema: expect.any(String),
        }),
      });
      
      expect(result).toEqual({
        attributes: [
          { name: "age", operator: "gt", value: 18 },
          { name: "country", operator: "eq", value: "Japan" },
        ],
      });
    });
    
    it("should parse query with proof requirements", async () => {
      await initParser();
      
      const mockEngine = await mockedWebllm.CreateMLCEngine();
      const mockChatCompletionsCreate = mockEngine.chat.completions.create;
      
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              attributes: [
                { name: "issuerId", operator: "eq", value: "Alice" },
              ],
              proof: { required: true, type: "zk-snark" },
            }),
          },
        }],
      };
      
      mockChatCompletionsCreate.mockResolvedValue(mockResponse);
      
      const result = await parseNaturalQuery("verified documents from Alice");
      
      expect(result).toEqual({
        attributes: [
          { name: "issuerId", operator: "eq", value: "Alice" },
        ],
        proof: { required: true, type: "zk-snark" },
      });
    });
    
    it("should parse query with multiple conditions", async () => {
      await initParser();
      
      const mockEngine = await mockedWebllm.CreateMLCEngine();
      const mockChatCompletionsCreate = mockEngine.chat.completions.create;
      
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              attributes: [
                { name: "country", operator: "in", value: ["USA", "Canada"] },
                { name: "age", operator: "gte", value: 21 },
              ],
            }),
          },
        }],
      };
      
      mockChatCompletionsCreate.mockResolvedValue(mockResponse);
      
      const result = await parseNaturalQuery("people in USA or Canada with age 21 or older");
      
      expect(result).toEqual({
        attributes: [
          { name: "country", operator: "in", value: ["USA", "Canada"] },
          { name: "age", operator: "gte", value: 21 },
        ],
      });
    });
    
    it("should throw error when LLM response is empty", async () => {
      await initParser();
      
      const mockEngine = await mockedWebllm.CreateMLCEngine();
      const mockChatCompletionsCreate = mockEngine.chat.completions.create;
      
      const mockResponse = {
        choices: [{
          message: {
            content: "",
          },
        }],
      };
      
      mockChatCompletionsCreate.mockResolvedValue(mockResponse);
      
      // The actual error might be "Unexpected end of JSON input" or "LLM response content is empty"
      await expect(parseNaturalQuery("test query")).rejects.toThrow();
    });
    
    it("should throw error when LLM response is invalid JSON", async () => {
      await initParser();
      
      const mockEngine = await mockedWebllm.CreateMLCEngine();
      const mockChatCompletionsCreate = mockEngine.chat.completions.create;
      
      const mockResponse = {
        choices: [{
          message: {
            content: "invalid json",
          },
        }],
      };
      
      mockChatCompletionsCreate.mockResolvedValue(mockResponse);
      
      await expect(parseNaturalQuery("test query")).rejects.toThrow();
    });
    
    it("should initialize engine automatically if not initialized", async () => {
      // Don't call initParser first
      const mockEngine = await mockedWebllm.CreateMLCEngine();
      const mockChatCompletionsCreate = mockEngine.chat.completions.create;
      
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              attributes: [{ name: "test", operator: "eq", value: "value" }],
            }),
          },
        }],
      };
      
      mockChatCompletionsCreate.mockResolvedValue(mockResponse);
      
      const result = await parseNaturalQuery("test query");
      
      expect(mockedWebllm.CreateMLCEngine).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
  
  describe("cleanup", () => {
    it("should unload engine when cleanup is called", async () => {
      await initParser();
      
      const mockEngine = await mockedWebllm.CreateMLCEngine();
      expect(mockEngine.unload).not.toHaveBeenCalled();
      
      await cleanup();
      expect(mockEngine.unload).toHaveBeenCalled();
    });
    
    it("should not throw when cleanup is called without initialization", async () => {
      await expect(cleanup()).resolves.not.toThrow();
    });
  });
});