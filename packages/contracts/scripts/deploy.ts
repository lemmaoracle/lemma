#!/usr/bin/env node
import { ethers } from "hardhat";
import { verifyContract } from "./verify.js";

interface DeployOptions {
  network?: string;
  verify?: boolean;
  constructorArgs?: any[];
}

async function deployLemmaRegistry(options: DeployOptions = {}) {
  const { network = "localhost", verify = false, constructorArgs = [] } = options;
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts to ${network} with address:`, deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy LemmaRegistry
  const LemmaRegistry = await ethers.getContractFactory("LemmaRegistry");
  const lemmaRegistry = await LemmaRegistry.deploy(...constructorArgs);

  await lemmaRegistry.waitForDeployment();

  const addr = await lemmaRegistry.getAddress();
  console.log("LemmaRegistry deployed to:", addr);

  // Verify contract if requested and network is not localhost/hardhat
  if (verify && network !== "localhost" && network !== "hardhat") {
    const deploymentTx = lemmaRegistry.deploymentTransaction();
    if (deploymentTx) {
      console.log(`Waiting for 5 block confirmations before verification...`);
      await deploymentTx.wait(5);
      await verifyContract(addr, constructorArgs);
    }
  }

  return {
    lemmaRegistry: addr,
    network,
    txHash: lemmaRegistry.deploymentTransaction()?.hash,
    verifyAttempted: verify,
  };
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: DeployOptions = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--network" && i + 1 < args.length) {
      options.network = args[++i];
    } else if (arg === "--verify") {
      options.verify = true;
    } else if (arg === "--constructor-args" && i + 1 < args.length) {
      try {
        options.constructorArgs = JSON.parse(args[++i]);
      } catch (error) {
        console.error("Error parsing constructor arguments:", error);
        console.log("Constructor arguments should be a JSON array, e.g., '[\"arg1\", 123]'");
        process.exit(1);
      }
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  // If no network specified but verify is true, default to sepolia
  if (options.verify && !options.network) {
    options.network = "sepolia";
    console.log("No network specified with --verify, defaulting to sepolia");
  }

  try {
    const result = await deployLemmaRegistry(options);
    console.log("Deployment completed successfully!");
    console.log("Deployment details:", JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Usage: npx hardhat run scripts/deploy.ts [OPTIONS]

Deploy LemmaRegistry contract with optional verification.

Options:
  --network <name>      Network to deploy to (default: localhost)
                        Available networks: localhost, hardhat, sepolia, mainnet, monadTestnet, monadMainnet
  --verify              Verify contract on Etherscan/explorer after deployment
  --constructor-args <json>  JSON array of constructor arguments (default: [])
  --help, -h            Show this help message

Examples:
  # Deploy to localhost (default)
  npx hardhat run scripts/deploy.ts
  
  # Deploy to Sepolia with verification
  npx hardhat run scripts/deploy.ts --network sepolia --verify
  
  # Deploy to Monad Testnet with verification
  npx hardhat run scripts/deploy.ts --network monadTestnet --verify
  
  # Deploy with constructor arguments
  npx hardhat run scripts/deploy.ts --constructor-args '["initialOwner"]'
  `);
}

// Handle direct execution
if (require.main === module) {
  main();
}

// Export for programmatic use
export { deployLemmaRegistry };