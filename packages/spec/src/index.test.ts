import { describe, expect, it } from "vitest";
import type { RegisterDocumentRequest, SubmitProofRequest, LemmaClient, SchemaMeta } from "./index";

describe("spec types", () => {
  it("accepts a valid RegisterDocumentRequest shape", () => {
    const req: RegisterDocumentRequest = {
      schema: "user-kyc-v1",
      docHash: "0xabc",
      cid: "bafy...",
      issuerId: "issuer-1",
      subjectId: "subject-1",
      attributes: { age: 25, country: "US" },
      commitments: { 
        root: "0xroot", 
        scheme: "poseidon",
        leaves: ["0xleaf1", "0xleaf2"],
        randomness: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      },
      revocation: { root: "0x0", scheme: "bitmask-merkle-v1" },
      signature: { format: "bbs+", payload: "sig", issuerId: "issuer-1" },
    };
    expect(req.schema).toBe("user-kyc-v1");
    expect(req.attributes?.age).toBe(25);
    expect(req.commitments.randomness).toBeDefined();
  });

  it("accepts RegisterDocumentRequest without optional fields", () => {
    const req: RegisterDocumentRequest = {
      schema: "user-kyc-v1",
      docHash: "0xabc",
      cid: "bafy...",
      issuerId: "issuer-1",
      subjectId: "subject-1",
      commitments: { 
        root: "0xroot", 
        scheme: "poseidon",
        leaves: [],
        randomness: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      },
      revocation: { root: "0x0" },
    };
    expect(req.schema).toBe("user-kyc-v1");
  });

  it("accepts a valid SubmitProofRequest shape", () => {
    const req: SubmitProofRequest = {
      docHash: "0xabc",
      circuitId: "age-over-18",
      proof: "base64...",
      inputs: ["0xroot"],
      onchain: true,
    };
    expect(req.circuitId).toBe("age-over-18");
  });

  it("accepts LemmaClient with fetcher field", () => {
    const client: LemmaClient = {
      apiBase: "http://localhost:8787",
      apiKey: "test-key",
      fetcher: fetch,
    };
    expect(client.apiBase).toBe("http://localhost:8787");
    expect(client.fetcher).toBe(fetch);
  });

  it("accepts SchemaMeta without attribute_metadata", () => {
    const schema: SchemaMeta = {
      id: "test-schema",
      normalize: {
        artifact: {
          type: "ipfs" as const,
          wasm: "ipfs://QmTest",
        },
        hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
    };
    expect(schema.id).toBe("test-schema");
    expect(schema.normalize.artifact.type).toBe("ipfs");
  });

  it("allows additional fields in SchemaMeta", () => {
    const schema: SchemaMeta = {
      id: "test-schema",
      description: "Test schema",
      normalize: {
        artifact: {
          type: "ipfs" as const,
          wasm: "ipfs://QmTest",
        },
        hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
      version: "1.0.0",
      custom_field: "additional data",
    };
    expect(schema.id).toBe("test-schema");
    expect(schema.custom_field).toBe("additional data");
  });
});
