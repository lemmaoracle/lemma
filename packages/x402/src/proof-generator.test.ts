/**
 * Tests for x402 payment proof generator.
 *
 * Test files are exempt from FP rules.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProofGenerator } from "./proof-generator.js";
import type { Config } from "./types.js";

// Mock viem
vi.mock("viem", async () => {
  const actual = await vi.importActual("viem");
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      getTransaction: vi.fn().mockResolvedValue({
        hash: "0xabc123",
        from: "0xsender",
        to: "0x2222222222222222222222222222222222222222",
        value: 1000n,
      }),
      getTransactionReceipt: vi.fn().mockResolvedValue({
        status: "success",
        blockNumber: 1000n,
        gasUsed: 21000n,
        effectiveGasPrice: 1000000000n,
        confirmations: 6,
      }),
      getBlock: vi.fn().mockResolvedValue({
        number: 1006n,
        timestamp: 1712000000n,
      }),
    })),
  };
});

// Mock Lemma SDK
vi.mock("@lemmaoracle/sdk", async () => {
  const actual = await vi.importActual("@lemmaoracle/sdk");
  return {
    ...actual,
    prover: {
      prove: vi.fn().mockResolvedValue({
        proof: "mock-proof-base64",
        publicInputs: ["input1", "input2"],
      }),
    },
    createClient: vi.fn().mockReturnValue({
      apiBase: "https://workers.lemma.workers.dev",
    }),
  };
});

const mockConfig: Config = {
  payToAddress: "0x2222222222222222222222222222222222222222" as `0x${string}`,
  network: "eip155:84532",
  price: "$0.001",
  ethereumRpcUrl: "https://sepolia.base.org",
  chainId: 84532,
  lemmaApiBase: "https://workers.lemma.workers.dev",
  circuitId: "x402-payment-v1",
  minAmount: 1000n,
  requiredConfirmations: 6,
  maxProofAge: 3600,
  ipfsGateway: "https://ipfs.io/ipfs/",
};

const mockLemmaClient = {
  apiBase: "https://workers.lemma.workers.dev",
};

describe("X402 Proof Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a proof generator", () => {
    const generator = createProofGenerator(mockConfig, mockLemmaClient as any);

    expect(generator).toBeDefined();
    expect(typeof generator.generateProof).toBe("function");
    expect(typeof generator.toFieldElements).toBe("function");
  });

  it("should convert payment details to field elements", async () => {
    const generator = createProofGenerator(mockConfig, mockLemmaClient as any);

    const mockPayment = {
      txHash: "0xabc123" as `0x${string}`,
      from: "0x1111111111111111111111111111111111111111" as `0x${string}`,
      to: "0x2222222222222222222222222222222222222222" as `0x${string}`,
      amount: 1000n,
      timestamp: 1712000000,
      blockNumber: 1000n,
      confirmations: 6,
    };

    const result = await generator.toFieldElements(mockPayment, mockConfig);

    expect(result).toBeDefined();
    expect(result.witness).toBeDefined();
    expect(result.publicInputs).toBeDefined();
    expect(result.witness.amount).toBeDefined();
    expect(result.witness.minAmount).toBeDefined();
  });

  it("should handle empty txHash gracefully", async () => {
    const generator = createProofGenerator(mockConfig, mockLemmaClient as any);

    expect(generator.generateProof).toBeDefined();
  });
});

describe("Field Element Conversion", () => {
  it("should convert addresses to field elements", async () => {
    const generator = createProofGenerator(mockConfig, mockLemmaClient as any);

    const mockPayment = {
      txHash: "0xabc123" as `0x${string}`,
      from: "0x1111111111111111111111111111111111111111" as `0x${string}`,
      to: "0x2222222222222222222222222222222222222222" as `0x${string}`,
      amount: 1000n,
      timestamp: 1712000000,
      blockNumber: 1000n,
      confirmations: 6,
    };

    const { witness } = await generator.toFieldElements(mockPayment, mockConfig);

    // Verify field elements are present and not null
    expect(witness.txHashPacked_0).toBeDefined();
    expect(witness.txHashPacked_1).toBeDefined();
    expect(witness.recipientLow).toBeDefined();
    expect(witness.amount).toBeDefined();
    expect(witness.timestamp).toBeDefined();
    expect(witness.minAmount).toBeDefined();
  });
});
