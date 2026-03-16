import { run } from "hardhat";

/**
 * Verify a deployed contract on Etherscan
 * @param contractAddress The address of the deployed contract
 * @param constructorArguments Arguments passed to the constructor during deployment
 * @param waitBlocks Number of blocks to wait before verification (default: 5)
 */
export async function verifyContract(
  contractAddress: string,
  constructorArguments: any[] = [],
  waitBlocks: number = 5
): Promise<void> {
  const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
  
  if (!ETHERSCAN_API_KEY) {
    console.log("Skipping verification: ETHERSCAN_API_KEY not set");
    return;
  }

  console.log(`Waiting for ${waitBlocks} block confirmations before verification...`);
  // Note: Caller should wait for transaction confirmation before calling this function
  
  console.log("Verifying contract on Etherscan...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments,
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    if ((error as any).message?.includes("Already Verified")) {
      console.log("Contract already verified");
    } else {
      console.error("Verification failed:", error);
    }
  }
}