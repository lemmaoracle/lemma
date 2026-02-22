import { describe, it, expect } from "vitest";
import { create } from "./client";

describe("create", () => {
  it("returns a LemmaClient with apiBase and apiKey", () => {
    const client = create({
      apiBase: "http://localhost:8787",
      apiKey: "test-key",
    });
    expect(client.apiBase).toBe("http://localhost:8787");
    expect(client.apiKey).toBe("test-key");
  });

  it("allows omitting apiKey", () => {
    const client = create({ apiBase: "http://localhost:8787" });
    expect(client.apiKey).toBeUndefined();
  });
});
