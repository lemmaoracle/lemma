import { create, type LemmaClient } from "@lemmaoracle/sdk";
import * as R from "ramda";
import type { Config, Disclosure, Proof, Transaction, ProofResult } from "./types.js";
import { createProofGenerator } from "./proof-generator.js";

/**
 * Create a Lemma API client from config.
 */
const createLemmaClient = (config: Config): LemmaClient =>
  create({
    apiBase: config.lemmaApiBase,
    apiKey: config.lemmaApiKey,
  });

/**
 * Build a disclosure object from a proof.
 */
const disclosure = (proof: Proof): Disclosure =>
  ({
    condition: { circuitId: proof.circuitId },
    proof: proof.proof,
    inputs: proof.inputs,
  });

/**
 * Build disclosure with empty proof for initial query (will be filled by facilitator).
 */
const emptyDisclosure = (circuitId: string): Disclosure =>
  ({
    condition: { circuitId },
    proof: "",
    inputs: [],
  });

/**
 * Create a configured facilitator client with proof generation capabilities.
 *
 * Usage:
 *   const facilitator = facilitator(config);
 *   
 *   // Generate disclosure with payment proof
 *   const disclosure = await facilitator.generateDisclosure(txHash);
 *   
 *   // Query Lemma API
 *   const results = await lemmaApi.query({ disclosure });
 */
const facilitator = (config: Config) => {
  const lemmaClient = createLemmaClient(config);
  const proofGenerator = createProofGenerator(config, lemmaClient);

  return {
    /**
     * Generate a disclosure with payment proof for a transaction.
     */
    generateDisclosure: async (txHash: `0x${string}`): Promise<Disclosure> => {
      const { proof } = await proofGenerator.generateProof(txHash);

      return disclosure(proof);
    },

    /**
     * Get an empty disclosure template with condition for the configured circuit.
     */
    getEmptyDisclosure: (_?: undefined): Disclosure =>
      emptyDisclosure(config.circuitId),

    /**
     * Get the configuration.
     */
    getConfig: (_?: undefined): Config => config,

    /**
     * Get the Lemma client.
     */
    getLemmaClient: (_?: undefined): LemmaClient => lemmaClient,
  };
};

/**
 * Default x402 facilitator configuration for Base Sepolia.
 */
const defaultConfig = (overrides: Partial<Config> = {}): Config =>
  R.mergeRight(
    {
      payToAddress: "0x" as `0x${string}`,
      network: "eip155:84532",
      price: "$0.001",
      ethereumRpcUrl: "https://sepolia.base.org",
      chainId: 84532,
      lemmaApiBase: "https://workers.lemma.workers.dev",
      circuitId: "x402-payment-v1",
      minAmount: 1000n, // $0.001 USDC in smallest units (6 decimals)
      requiredConfirmations: 6,
      maxProofAge: 3600, // 1 hour
      ipfsGateway: "https://ipfs.io/ipfs/",
    },
    overrides,
  );

export {
  facilitator,
  createProofGenerator,
  disclosure,
  emptyDisclosure,
  defaultConfig,
  // createLemmaClient is not exported
};

export type {
  Config,
  Disclosure,
  Proof,
  Transaction,
  ProofResult,
};
