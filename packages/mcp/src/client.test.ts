import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildClient } from "./client.js";

const DEFAULT_API_BASE = "https://workers.lemma.workers.dev";

describe("buildClient", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.LEMMA_API_BASE;
    delete process.env.LEMMA_API_KEY;
    delete process.env.LEMMA_DEFAULT_CHAIN_ID;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns default apiBase with undefined apiKey and defaultChainId when no env vars are set", () => {
    const client = buildClient();
    expect(client.apiBase).toBe(DEFAULT_API_BASE);
    expect(client.apiKey).toBeUndefined();
    expect(client.defaultChainId).toBeUndefined();
  });

  it("uses LEMMA_API_BASE when provided", () => {
    vi.stubEnv("LEMMA_API_BASE", "https://api.example.test");
    const client = buildClient();
    expect(client.apiBase).toBe("https://api.example.test");
    expect(client.apiKey).toBeUndefined();
    expect(client.defaultChainId).toBeUndefined();
  });

  it("falls back to default apiBase when LEMMA_API_BASE is empty string", () => {
    vi.stubEnv("LEMMA_API_BASE", "");
    const client = buildClient();
    expect(client.apiBase).toBe(DEFAULT_API_BASE);
  });

  it("uses LEMMA_API_KEY when provided", () => {
    vi.stubEnv("LEMMA_API_KEY", "test-key-123");
    const client = buildClient();
    expect(client.apiKey).toBe("test-key-123");
    expect(client.apiBase).toBe(DEFAULT_API_BASE);
  });

  it("leaves apiKey undefined when LEMMA_API_KEY is empty string", () => {
    vi.stubEnv("LEMMA_API_KEY", "");
    const client = buildClient();
    expect(client.apiKey).toBeUndefined();
  });

  it("parses LEMMA_DEFAULT_CHAIN_ID as a number", () => {
    vi.stubEnv("LEMMA_DEFAULT_CHAIN_ID", "8453");
    const client = buildClient();
    expect(client.defaultChainId).toBe(8453);
    expect(typeof client.defaultChainId).toBe("number");
  });

  it("leaves defaultChainId undefined when LEMMA_DEFAULT_CHAIN_ID is empty string", () => {
    vi.stubEnv("LEMMA_DEFAULT_CHAIN_ID", "");
    const client = buildClient();
    expect(client.defaultChainId).toBeUndefined();
  });
});
