import type { ExactEvmScheme } from "@x402/evm/exact/server";
import type { createPublicClient, http as viemHttp } from "viem";
import type { HTTPFacilitatorClient } from "@x402/core/server";

/** Configuration for payment facilitator */
type Config = Readonly<{
  /** x402 facilitator URL (for HTTPFacilitatorClient compatibility) */
  facilitatorUrl?: string;

  /** Address to receive payments */
  payToAddress: `0x${string}`;

  /** Network identifier (e.g., "eip155:84532" for Base Sepolia) */
  network: string;

  /** Price for accessing verified attributes (e.g., "$0.001") */
  price: string;

  /** Ethereum RPC URL for transaction monitoring */
  ethereumRpcUrl: string;

  /** Chain ID for the network */
  chainId: number;

  /** Lemma API base URL */
  lemmaApiBase: string;

  /** Lemma API key (if required) */
  lemmaApiKey?: string;

  /** Circuit ID for the payment proof */
  circuitId: string;

  /** Minimum amount in USDC smallest unit (6 decimals) */
  minAmount: bigint;

  /** Number of block confirmations before considering payment valid */
  requiredConfirmations: number;

  /** Maximum age of payment proof in seconds */
  maxProofAge: number;

  /** IPFS gateway URL for fetching circuit artifacts */
  ipfsGateway?: string;
}>;

/** Parsed transaction details */
type Transaction = Readonly<{
  /** Transaction hash */
  txHash: `0x${string}`;

  /** Sender address */
  from: `0x${string}`;

  /** Recipient address */
  to: `0x${string}`;

  /** Amount in smallest token unit */
  amount: bigint;

  /** Block timestamp */
  timestamp: number;

  /** Block number */
  blockNumber: bigint;

  /** Number of confirmations */
  confirmations: number;
}>;

/** Generated proof with inputs for Lemma API */
type Proof = Readonly<{
  /** ZK proof data (base64 encoded) */
  proof: string;

  /** Public inputs for the circuit */
  inputs: ReadonlyArray<string>;

  /** Circuit ID used */
  circuitId: string;

  /** Timestamp when proof was generated */
  generatedAt: number;
}>;

/** Result of proof generation */
type ProofResult = Readonly<{
  /** Transaction */
  payment: Transaction;

  /** Generated proof */
  proof: Proof;
}>;

/** Disclosure condition for Lemma API query */
type DisclosureCondition = Readonly<{
  circuitId: string;
}>;

/** Disclosure object to send with query */
type Disclosure = Readonly<{
  condition?: DisclosureCondition;
  proof: string;
  inputs: ReadonlyArray<string>;
}>;

export type {
  Config,
  Transaction,
  Proof,
  ProofResult,
  Disclosure,
  DisclosureCondition,
};
