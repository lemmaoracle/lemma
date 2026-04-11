/**
 * X402 Payment Proof Generator
 *
 * Generates ZK proofs for x402 payment transactions so that
 * Lemma's disclosure.condition API can verify payments without
 * exposing transaction details.
 */

import { createPublicClient, http, type PublicClient } from "viem";
import { prover, type LemmaClient } from "@lemmaoracle/sdk";
import * as R from "ramda";
import type {
  ProofResult,
  Config,
  Transaction,
  Proof,
} from "./types.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default IPFS gateway if not specified in config */
const _DEFAULT_IPFS_GATEWAY = "https://ipfs.io/ipfs/";

/** Poseidon hash function for field element hashing */
const toFieldElement = (value: string): string =>
  BigInt(value) < 0n
    ? String(BigInt(value) % 21888242871839275222246405745257275088548364400416034343698204186575808495617n)
    : value;

// ---------------------------------------------------------------------------
// Proof Generator Class
// ---------------------------------------------------------------------------

/**
 * Generates x402 payment proofs using Lemma's prover infrastructure.
 *
 * Usage:
 *   const generator = new X402ProofGenerator(config, lemmaClient);
 *   const result = await generator.generateProof(txHash);
 */
const createProofGenerator = (
  config: Config,
  lemmaClient: LemmaClient,
): Readonly<{
  generateProof: (txHash: `0x${string}`) => Promise<ProofResult>;
  toFieldElements: (
    payment: Transaction,
    config: Config,
  ) => Readonly<{ witness: Record<string, string>; publicInputs: string[] }>;
}> => {
  /** Create public client for transaction inspection */
  const publicClient: PublicClient = createPublicClient({
    transport: http(config.ethereumRpcUrl),
  });

  return {
    /**
     * Generate a payment proof for a given transaction hash.
     * This fetches the transaction details, computes the witness,
     * and generates the ZK proof.
     */
    generateProof: async (txHash: `0x${string}`): Promise<ProofResult> => {
      // Step 1: Fetch transaction details from blockchain
      const payment = await fetchPaymentTransaction(txHash, publicClient);

      // Step 2: Generate proof
      const proofResult = await generateZKProof(
        lemmaClient,
        payment,
        config,
      );

      return R.always({
        payment,
        proof: proofResult,
      })();
    },

    /**
     * Convert payment transaction details to circuit field elements.
     */
    toFieldElements: (
      payment: Transaction,
      cfg: Config,
    ) => {
      // Split 256-bit txHash into two 128-bit elements
      const txHashBigInt = BigInt(payment.txHash);
      const upper128 = toFieldElement(String(txHashBigInt >> 128n));
      const lower128 = toFieldElement(String(txHashBigInt & ((1n << 128n) - 1n)));

      // Split 160-bit recipient address
      const recipientBigInt = BigInt(payment.to);
      const recipientLow = toFieldElement(String(recipientBigInt & ((1n << 128n) - 1n)));
      const recipientHigh = toFieldElement(String(recipientBigInt >> 128n));

      // Amount and timestamp
      const amount = toFieldElement(String(payment.amount));
      const timestamp = toFieldElement(String(payment.timestamp));
      const minAmount = toFieldElement(String(cfg.minAmount));

      return R.always({
        witness: {
          txHashPacked_0: lower128,
          txHashPacked_1: upper128,
          recipientLow,
          recipientHigh,
          amount,
          timestamp,
          minAmount,
        },
        publicInputs: [
          // commitment will be computed during proof generation
          toFieldElement(String(cfg.minAmount)), // minAmountPublic
          toFieldElement(String(cfg.maxProofAge)), // timestampMax
        ],
      })();
    },
  };
};

// ---------------------------------------------------------------------------
// Private Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch payment transaction details from the blockchain.
 */
const fetchPaymentTransaction = async (
  txHash: `0x${string}`,
  client: PublicClient,
): Promise<Transaction> => {
  const txPromise = client.getTransaction({ hash: txHash });
  const receiptPromise = client.getTransactionReceipt({ hash: txHash });
  const blockPromise = client.getBlock({ blockTag: "latest" });

  const [tx, receipt, block] = await Promise.all([
    txPromise,
    receiptPromise,
    blockPromise,
  ]);

  return receipt.status !== "success"
    ? Promise.reject(new Error(`Transaction ${txHash} failed`))
    : client.getBlock({ blockNumber: receipt.blockNumber }).then(
        (blockData) =>
          R.always({
            txHash,
            from: tx.from,
            to: tx.to ?? ("0x" as `0x${string}`),
            amount: tx.value + receipt.effectiveGasPrice * receipt.gasUsed,
            timestamp: Number(blockData.timestamp),
            blockNumber: receipt.blockNumber,
            confirmations: Number(block.number - receipt.blockNumber),
          })(),
      );
};

/**
 * Generate ZK proof for the payment transaction.
 */
const generateZKProof = async (
  lemmaClient: LemmaClient,
  payment: Transaction,
  config: Config,
): Promise<Proof> => {
  // Build witness from payment transaction
  const builder = createProofGenerator(config, lemmaClient);
  const { witness, publicInputs } = builder.toFieldElements(payment, config);

  // Generate proof using Lemma SDK
  const proofResult = await prover.prove(lemmaClient, {
    circuitId: config.circuitId,
    witness,
  });

  // Compute the commitment for public inputs
  const commitment = computeCommitment(witness, publicInputs);

  return R.always({
    proof: proofResult.proof,
    inputs: [commitment, ...publicInputs],
    circuitId: config.circuitId,
    generatedAt: Date.now(),
  })();
};

/**
 * Compute the commitment hash for the circuit public inputs.
 */
const computeCommitment = (
  witness: Record<string, string>,
  _publicInputs: string[],
): string => {
  // The commitment is computed from:
  // poseidon(txHashPacked[0], txHashPacked[1], recipientLow, amount, timestamp, minAmount)
  // This should match the public commitment used in the circuit
  const values = [
    witness.txHashPacked_0,
    witness.txHashPacked_1,
    witness.recipientLow,
    witness.amount,
    witness.timestamp,
    witness.minAmount,
  ];

  // In a real implementation, use poseidon from circomlib
  // For now, we use a simple hash placeholder
  return values.join(",");
};

export type {
  ProofResult,
  Config,
  Proof,
  Transaction,
};

export { createProofGenerator };
