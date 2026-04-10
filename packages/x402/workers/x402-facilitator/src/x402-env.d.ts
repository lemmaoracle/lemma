declare const X402Env: {
  /** Address to receive payments. */
  PAY_TO_ADDRESS: string;
  /** Lemma API base URL. */
  LEMMA_API_BASE: string;
  /** Lemma API key (secret). */
  LEMMA_API_KEY?: string;
  /** Circuit ID override. Defaults to "x402-payment-v1". */
  CIRCUIT_ID?: string;
  /**
   * JSON map of network identifier → RPC URL.
   * Example: '{"eip155:84532":"https://sepolia.base.org","eip155:10143":"https://rpc.monad.xyz"}'
   *
   * Extends (and overrides) the built-in default RPC map.
   */
  RPC_URLS?: string;
};

export default X402Env;
