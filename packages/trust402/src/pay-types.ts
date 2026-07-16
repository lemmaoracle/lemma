/**
 * x402 payment types — inlined to avoid a dependency on @lemmaoracle/workers-shared.
 * Server-side x402 gate logic (facilitator, settle/verify) lives in workers-shared;
 * the SDK only needs the client-side types for signing payments.
 */

export type X402Network = "base-sepolia" | "base";

export type Eip712Domain = Readonly<{
  name: string;
  version: string;
}>;

export type ExactEvmAuthorization = Readonly<{
  from: string;
  to: string;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: string;
}>;

export type PaymentPayload = Readonly<{
  x402Version: number;
  scheme: string;
  network: string;
  payload: Readonly<Record<string, unknown>>;
}>;

/** x402 v1 requirements (used by x402.org facilitator). */
export type PaymentRequirements = Readonly<{
  scheme: string;
  network: X402Network;
  maxAmountRequired: string;
  payTo: string;
  asset: string;
  resource: string;
  description: string;
  mimeType: string;
  maxTimeoutSeconds: number;
  extra?: Eip712Domain;
}>;
