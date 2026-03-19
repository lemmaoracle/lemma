import { describe, it, expect, vi, beforeEach } from "vitest";
import { define, getSchemaById, IPFS_GATEWAY } from "./schema.js";

// Mock fetch and WebAssembly
global.fetch = vi.fn();
Object.defineProperty(global, "crypto", {
  value: {
    subtle: {
      digest: vi.fn(),
    },
  },
  writable: true,
});
global.WebAssembly = {
  instantiate: vi.fn(),
} as any;

describe("define / getSchemaById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers and retrieves a schema with WASM normalize", async () => {
    // Mock WASM binary and hash
    const mockWasmBuffer = new ArrayBuffer(10);
    const mockHashHex = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const mockHash = `0x${mockHashHex}`;

    // Mock fetch
    (fetch as any).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(mockWasmBuffer),
    });

    // Mock crypto.subtle.digest
    (crypto.subtle.digest as any).mockResolvedValue(
      new Uint8Array(mockHashHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))).buffer,
    );

    // Mock WebAssembly.instantiate
    const mockNormalize = vi.fn((rawJson: string) =>
      JSON.stringify({ weather_bucket: "wet", temperature_bucket: "cold" }),
    );
    (WebAssembly.instantiate as any).mockResolvedValue({
      instance: {
        exports: {
          normalize: mockNormalize,
        },
      },
    });

    const schemaMeta = {
      id: "test:weather-v1",
      description: "Weather schema",
      normalize: {
        artifact: {
          type: "ipfs" as const,
          wasm: "ipfs://QmTestWasm",
        },
        hash: mockHash,
        abi: {
          raw: { weather: "string", temperature: "number", city: "string" },
          norm: { weather_bucket: "string", temperature_bucket: "string" },
        },
      },
    };

    const schema = await define(schemaMeta);

    expect(schema.id).toBe("test:weather-v1");
    expect(fetch).toHaveBeenCalledWith(`${IPFS_GATEWAY}QmTestWasm`);
    expect(crypto.subtle.digest).toHaveBeenCalledWith("SHA-256", expect.any(Uint8Array));
    expect(WebAssembly.instantiate).toHaveBeenCalledWith(mockWasmBuffer);

    // Test the normalize function
    const raw = { weather: "rain", temperature: 5, city: "Tokyo" };
    const result = schema.normalize(raw);

    expect(mockNormalize).toHaveBeenCalledWith(JSON.stringify(raw));
    expect(result).toEqual({ weather_bucket: "wet", temperature_bucket: "cold" });

    // Verify retrieval
    const retrieved = getSchemaById("test:weather-v1");
    expect(retrieved).toBeDefined();
    expect(retrieved!.normalize(raw)).toEqual({
      weather_bucket: "wet",
      temperature_bucket: "cold",
    });
  });

  it("rejects on hash mismatch", async () => {
    const mockWasmBuffer = new ArrayBuffer(10);

    (fetch as any).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(mockWasmBuffer),
    });

    // Return different hash
    (crypto.subtle.digest as any).mockResolvedValue(new Uint8Array([0xaa]).buffer);

    (WebAssembly.instantiate as any).mockResolvedValue({
      instance: {
        exports: {
          normalize: vi.fn(),
        },
      },
    });

    const schemaMeta = {
      id: "test:schema",
      normalize: {
        artifact: {
          type: "https" as const,
          wasm: "https://example.com/normalize.wasm",
        },
        hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
    };

    await expect(define(schemaMeta)).rejects.toThrow("WASM hash mismatch");
  });

  it("rejects on missing normalize export", async () => {
    const mockWasmBuffer = new ArrayBuffer(10);

    (fetch as any).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(mockWasmBuffer),
    });

    (crypto.subtle.digest as any).mockResolvedValue(new Uint8Array([0x12, 0x34]).buffer);

    (WebAssembly.instantiate as any).mockResolvedValue({
      instance: {
        exports: {}, // No normalize function
      },
    });

    const schemaMeta = {
      id: "test:schema",
      normalize: {
        artifact: {
          type: "https" as const,
          wasm: "https://example.com/normalize.wasm",
        },
        hash: "0x1234",
      },
    };

    await expect(define(schemaMeta)).rejects.toThrow(
      "WASM module does not export a 'normalize' function",
    );
  });

  it("passes HTTPS URLs through unchanged", async () => {
    const mockWasmBuffer = new ArrayBuffer(10);
    const mockHashHex = "aabbccdd00112233aabbccdd00112233aabbccdd00112233aabbccdd00112233";
    const mockHash = `0x${mockHashHex}`;

    (fetch as any).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(mockWasmBuffer),
    });

    (crypto.subtle.digest as any).mockResolvedValue(
      new Uint8Array(mockHashHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))).buffer,
    );

    (WebAssembly.instantiate as any).mockResolvedValue({
      instance: { exports: { normalize: vi.fn(() => "{}") } },
    });

    const schemaMeta = {
      id: "test:https-schema",
      normalize: {
        artifact: {
          type: "https" as const,
          wasm: "https://cdn.example.com/normalize.wasm",
        },
        hash: mockHash,
      },
    };

    await define(schemaMeta);

    // HTTPS URL must be passed through as-is
    expect(fetch).toHaveBeenCalledWith("https://cdn.example.com/normalize.wasm");
  });

  it("returns undefined for unknown schemaId", () => {
    expect(getSchemaById("nonexistent")).toBeUndefined();
  });
});
