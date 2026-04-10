/**
 * Tests for x402 transaction watcher.
 *
 * Test files are exempt from FP rules.
 */

import { describe, it, expect, vi } from "vitest";
import {
  createTransactionWatcher,
  isValidPayment,
  extractPaymentDetails,
} from "./transaction-watcher.js";
import type { Config } from "./types.js";

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

const mockTx = {
  hash: "0xabc123",
  from: "0x1111111111111111111111111111111111111111",
  to: "0x2222222222222222222222222222222222222222",
  value: 2000n,
  blockNumber: 1000n,
  blockTimestamp: 1712000000n,
  gasUsed: 21000n,
  effectiveGasPrice: 1000000000n,
};

const mockReceipt = {
  status: "success" as const,
  blockNumber: 1000n,
  confirmations: 6,
  gasUsed: 21000n,
  effectiveGasPrice: 1000000000n,
};

describe("Transaction Watcher", () => {
  it("should create a watcher", () => {
    const watcher = createTransactionWatcher(mockConfig, {});

    expect(watcher).toBeDefined();
    expect(typeof watcher.start).toBe("function");
    expect(typeof watcher.stop).toBe("function");
    expect(typeof watcher.onPaymentDetected).toBe("function");
    expect(typeof watcher.getState).toBe("function");
  });

  it("should register payment detected callbacks", async () => {
    const watcher = createTransactionWatcher(mockConfig, {});
    const callback = vi.fn();

    // Callbacks return Promises
    const promise = watcher.onPaymentDetected(callback);

    expect(promise).toBeInstanceOf(Promise);
    await promise;
  });

  it("should return watcher state", () => {
    const watcher = createTransactionWatcher(mockConfig, {});
    const state = watcher.getState();

    expect(state.isRunning).toBe(false);
    expect(Array.isArray(state.detectedPayments)).toBe(true);
  });
});

describe("isValidPayment", () => {
  it("should validate a correct payment", () => {
    const currentBlockNumber = 1010n; // Sufficient confirmations (10 confirmations)
    const result = isValidPayment(mockTx as any, mockReceipt as any, mockConfig, currentBlockNumber);

    expect(result).toBe(true);
  });

  it("should reject payment to wrong recipient", () => {
    const badTx = { ...mockTx, to: "0x3333333333333333333333333333333333333333" };
    const currentBlockNumber = 1010n;

    const result = isValidPayment(badTx as any, mockReceipt as any, mockConfig, currentBlockNumber);

    expect(result).toBe(false);
  });

  it("should reject payment below minimum amount", () => {
    const lowTx = { ...mockTx, value: 500n };
    const currentBlockNumber = 1010n;

    const result = isValidPayment(lowTx as any, mockReceipt as any, mockConfig, currentBlockNumber);

    expect(result).toBe(false);
  });

  it("should reject failed transaction", () => {
    const failedReceipt = { ...mockReceipt, status: "reverted" as const };
    const currentBlockNumber = 1010n;

    const result = isValidPayment(mockTx as any, failedReceipt as any, mockConfig, currentBlockNumber);

    expect(result).toBe(false);
  });

  it("should reject payment with insufficient confirmations", () => {
    const currentBlockNumber = 1002n; // Only 2 confirmations (1002 - 1000 = 2)
    const result = isValidPayment(mockTx as any, mockReceipt as any, mockConfig, currentBlockNumber);

    expect(result).toBe(false);
  });
});

describe("extractPaymentDetails", () => {
  it("should extract payment details from transaction and receipt", () => {
    const currentBlockNumber = 1010n;

    const details = extractPaymentDetails(
      mockTx as any,
      mockReceipt as any,
      currentBlockNumber,
    );

    expect(details.txHash).toBe("0xabc123");
    expect(details.from).toBe("0x1111111111111111111111111111111111111111");
    expect(details.to).toBe("0x2222222222222222222222222222222222222222");
    expect(details.amount).toBe(2000n);
    expect(details.timestamp).toBe(1712000000); // Retrieved from blockTimestamp
    expect(details.blockNumber).toBe(1000n);
    expect(details.confirmations).toBe(10);
  });

  it("should handle missing blockTimestamp", () => {
    const txNoTimestamp = { ...mockTx, blockTimestamp: undefined };
    const currentBlockNumber = 1010n;

    const details = extractPaymentDetails(
      txNoTimestamp as any,
      mockReceipt as any,
      currentBlockNumber,
    );

    expect(details.timestamp).toBe(0);
  });
});
