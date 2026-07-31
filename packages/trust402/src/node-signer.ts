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
      request: async ({ method }) => {
        if (method === "eth_signTypedData_v4") {
          // payFetch uses signTypedData instead — this path shouldn't be hit
          throw new Error("eth_signTypedData_v4 not available (use signTypedData)");
        }
        if (method === "eth_chainId") return "0x14a34"; // base-sepolia (84532)
        if (method === "eth_accounts") return [account.address];
        throw new Error(`Unsupported RPC method: ${method}`);
      },
    },
    signTypedData: async (params) => {
      const { domain, types, primaryType, message } = params;
      return account.signTypedData({
        domain: domain as Parameters<typeof account.signTypedData>[0]["domain"],
        types: types as Parameters<typeof account.signTypedData>[0]["types"],
        primaryType,
        message: message as Parameters<typeof account.signTypedData>[0]["message"],
      });
    },
  };
};
