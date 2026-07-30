/**
 * Node.js signer factory — creates an x402-compatible Signer from a private key.
 *
 * Uses viem's privateKeyToAccount + custom EIP-1193 provider (no browser wallet).
 * Exported so callers (feeds, cron, etc.) don't need a direct viem dependency.
 */
import { privateKeyToAccount } from "viem/accounts";
import { type Signer } from "./pay-fetch.js";

/**
 * Create a Signer for Node.js from a hex private key.
 *
 * Only eth_signTypedData_v4 is implemented — viem's WalletClient does not
 * support the raw JSON-RPC version, so this Signer provides signTypedData
 * directly (the payFetch path that avoids eth_signTypedData_v4).
 */
export const nodeSigner = (privateKey: string): Signer => {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  return {
    address: account.address,
    provider: {
      request: async ({
        method,
        params: _params,
      }: {
        method: string;
        params: unknown;
      }) =>
        method === "eth_signTypedData_v4"
          ? await Promise.reject(
              new Error(
                "eth_signTypedData_v4 not available (use signTypedData)"
              )
            )
          : method === "eth_chainId"
            ? "0x14a34" // base-sepolia (84532)
            : method === "eth_accounts"
              ? [account.address]
              : await Promise.reject(
                  new Error(`Unsupported RPC method: ${method}`)
                ),
    },
    signTypedData: async (params) => {
      const { domain, types, primaryType, message } = params;
      return account.signTypedData({
        domain,
        types,
        primaryType,
        message,
      });
    },
  };
};
