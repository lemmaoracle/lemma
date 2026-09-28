import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, http, erc20Abi, formatUnits } from "viem";
import { base, baseSepolia } from "viem/chains";

const pk = process.env.TRUST402_PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(pk);
console.log("address:", account.address);

const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const probe = async (chain, usdc, label) => {
  try {
    const client = createPublicClient({ chain, transport: http() });
    const bal = await client.readContract({ address: usdc, abi: erc20Abi, functionName: "balanceOf", args: [account.address] });
    const eth = await client.getBalance({ address: account.address });
    console.log(label + ": USDC=" + formatUnits(bal, 6) + "  ETH=" + formatUnits(eth, 18));
  } catch (e) {
    console.log(label + ": ERROR " + (e instanceof Error ? e.message : String(e)));
  }
};

await probe(base, USDC_BASE, "base-mainnet");
await probe(baseSepolia, USDC_SEPOLIA, "base-sepolia");
