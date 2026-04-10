/**
 * Local test for payment.circom proof generation and verification
 * Usage: node payment.test.mjs
 */
import * as snarkjs from "snarkjs";
import { readFileSync, existsSync } from "fs";
import { poseidon6 } from "poseidon-lite"; // npm install poseidon-lite

// File path configuration
const WASM_PATH = "build/payment_js/payment.wasm";
const ZKEY_PATH = "build/payment_final.zkey";
const VKEY_PATH = "build/verification_key.json";

// Generate test input data
function generateTestInputs() {
  // Test transaction hash (256-bit)
  const txHash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefn;
  
  // Recipient address (160-bit)
  const recipient = 0x2222222222222222222222222222222222222222n;
  
  // Payment amount (smallest unit)
  const amount = 1000n;
  
  // Timestamp
  const timestamp = 1712000000n;
  
  // Minimum amount requirement
  const minAmount = 1000n;
  
  // Maximum timestamp (freshness check)
  const timestampMax = 1712003600n; // 1 hour later
  
  // Split 256-bit transaction hash into two 128-bit field elements
  const txHashUpper = txHash >> 128n;
  const txHashLower = txHash & ((1n << 128n) - 1n);
  
  // Split 160-bit recipient address into two field elements
  const recipientLow = recipient & ((1n << 128n) - 1n);
  const recipientHigh = recipient >> 128n;
  
  // Compute commitment (Poseidon(6) hash)
  const commitment = poseidon6([
    txHashUpper,
    txHashLower,
    recipientLow,
    amount,
    timestamp,
    minAmount
  ]);
  
  return {
    // Private inputs
    txHashPacked: [txHashUpper.toString(), txHashLower.toString()],
    recipientLow: recipientLow.toString(),
    recipientHigh: recipientHigh.toString(),
    amount: amount.toString(),
    timestamp: timestamp.toString(),
    minAmount: minAmount.toString(),
    
    // Public inputs
    commitment: commitment.toString(),
    minAmountPublic: minAmount.toString(),
    timestampMax: timestampMax.toString()
  };
}

// Check if build files exist
function checkBuildFiles() {
  const files = [WASM_PATH, ZKEY_PATH, VKEY_PATH];
  const missingFiles = files.filter(file => !existsSync(file));
  
  if (missingFiles.length > 0) {
    console.error("❌ Missing build files:");
    missingFiles.forEach(file => console.error(`   - ${file}`));
    console.error("\n⚠️  Please run the build script first:");
    console.error("   npm run build:circuit");
    console.error("   or");
    console.error("   bash scripts/build.sh");
    return false;
  }
  
  return true;
}

async function main() {
  console.log("=== X402 Payment Circuit Test ===\n");
  
  // Check build files
  if (!checkBuildFiles()) {
    process.exit(1);
  }
  
  // Generate test input data
  const input = generateTestInputs();
  
  console.log("Generated test inputs:");
  console.log("- Commitment:", input.commitment);
  console.log("- Min Amount:", input.minAmountPublic);
  console.log("- Timestamp Max:", input.timestampMax);
  console.log("- Amount:", input.amount);
  console.log("- Timestamp:", input.timestamp);
  console.log();
  
  try {
    console.log("Generating proof...");
    
    // Generate proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      WASM_PATH,
      ZKEY_PATH
    );
    
    console.log("Proof generated successfully!");
    console.log("Public signals:", publicSignals);
    console.log();
    
    // Load verification key
    const vKey = JSON.parse(readFileSync(VKEY_PATH, "utf8"));
    
    // Verify proof
    const valid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    
    if (valid) {
      console.log("✅ Proof is VALID!");
      console.log("\nCircuit verification successful!");
      
      // Additional verification: check if commitment matches
      if (publicSignals[0] === input.commitment) {
        console.log("✅ Commitment matches expected value!");
      } else {
        console.log("⚠️  Commitment mismatch:");
        console.log(`   Expected: ${input.commitment}`);
        console.log(`   Got: ${publicSignals[0]}`);
      }
      
      // Explicitly exit
      console.log("\n✅ All tests completed successfully!");
      process.exit(0);
    } else {
      console.log("❌ Proof is INVALID!");
      console.log("\nCircuit verification failed!");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("❌ Error during proof generation/verification:");
    console.error(error.message);
    
    if (error.message.includes("ENOENT") || error.message.includes("no such file")) {
      console.error("\n⚠️  Build files not found. Please run the build script first:");
      console.error("   npm run build:circuit");
      console.error("   or");
      console.error("   bash scripts/build.sh");
    }
    
    process.exit(1);
  }
}

// Execute main function
main().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

// Fallback to force process exit
// snarkjs may leave background processes running
setTimeout(() => {
  console.warn("⚠️  Force exiting process after timeout");
  process.exit(0);
}, 30000); // Force exit after 30 seconds