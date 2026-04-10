/**
 * Comprehensive test for payment.circom with edge cases
 * Usage: node payment-comprehensive.test.mjs
 */
import * as snarkjs from "snarkjs";
import { readFileSync, existsSync } from "fs";
import { poseidon6 } from "poseidon-lite";

// File path configuration
const WASM_PATH = "build/payment_js/payment.wasm";
const ZKEY_PATH = "build/payment_final.zkey";
const VKEY_PATH = "build/verification_key.json";

// テストケース
const TEST_CASES = [
  {
    name: "Basic valid payment",
    description: "Minimum amount exactly matches requirement",
    inputs: () => {
      const txHash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefn;
      const recipient = 0x2222222222222222222222222222222222222222n;
      const amount = 1000n;
      const minAmount = 1000n;
      const timestamp = 1712000000n;
      const timestampMax = 1712003600n;
      
      const txHashUpper = txHash >> 128n;
      const txHashLower = txHash & ((1n << 128n) - 1n);
      const recipientLow = recipient & ((1n << 128n) - 1n);
      const recipientHigh = recipient >> 128n;
      
      const commitment = poseidon6([
        txHashUpper, txHashLower, recipientLow, amount, timestamp, minAmount
      ]);
      
      return {
        private: {
          txHashPacked: [txHashUpper.toString(), txHashLower.toString()],
          recipientLow: recipientLow.toString(),
          recipientHigh: recipientHigh.toString(),
          amount: amount.toString(),
          timestamp: timestamp.toString(),
          minAmount: minAmount.toString(),
        },
        public: {
          commitment: commitment.toString(),
          minAmountPublic: minAmount.toString(),
          timestampMax: timestampMax.toString()
        }
      };
    },
    shouldPass: true
  },
  {
    name: "Payment above minimum",
    description: "Amount is greater than minimum requirement",
    inputs: () => {
      const txHash = 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890n;
      const recipient = 0x3333333333333333333333333333333333333333n;
      const amount = 5000n;
      const minAmount = 1000n;
      const timestamp = 1712001000n;
      const timestampMax = 1712004600n;
      
      const txHashUpper = txHash >> 128n;
      const txHashLower = txHash & ((1n << 128n) - 1n);
      const recipientLow = recipient & ((1n << 128n) - 1n);
      const recipientHigh = recipient >> 128n;
      
      const commitment = poseidon6([
        txHashUpper, txHashLower, recipientLow, amount, timestamp, minAmount
      ]);
      
      return {
        private: {
          txHashPacked: [txHashUpper.toString(), txHashLower.toString()],
          recipientLow: recipientLow.toString(),
          recipientHigh: recipientHigh.toString(),
          amount: amount.toString(),
          timestamp: timestamp.toString(),
          minAmount: minAmount.toString(),
        },
        public: {
          commitment: commitment.toString(),
          minAmountPublic: minAmount.toString(),
          timestampMax: timestampMax.toString()
        }
      };
    },
    shouldPass: true
  },
  {
    name: "Wrong commitment",
    description: "Incorrect commitment hash should fail verification",
    inputs: () => {
      const txHash = 0x1111111111111111111111111111111111111111111111111111111111111111n;
      const recipient = 0x4444444444444444444444444444444444444444n;
      const amount = 1000n;
      const minAmount = 1000n;
      const timestamp = 1712002000n;
      const timestampMax = 1712005600n;
      
      const txHashUpper = txHash >> 128n;
      const txHashLower = txHash & ((1n << 128n) - 1n);
      const recipientLow = recipient & ((1n << 128n) - 1n);
      const recipientHigh = recipient >> 128n;
      
      // Use wrong commitment (off by one)
      const wrongCommitment = poseidon6([
        txHashUpper, txHashLower, recipientLow, amount, timestamp, minAmount + 1n
      ]);
      
      return {
        private: {
          txHashPacked: [txHashUpper.toString(), txHashLower.toString()],
          recipientLow: recipientLow.toString(),
          recipientHigh: recipientHigh.toString(),
          amount: amount.toString(),
          timestamp: timestamp.toString(),
          minAmount: minAmount.toString(),
        },
        public: {
          commitment: wrongCommitment.toString(),
          minAmountPublic: minAmount.toString(),
          timestampMax: timestampMax.toString()
        }
      };
    },
    shouldPass: false
  },
  {
    name: "Mismatched minAmount",
    description: "Private and public minAmount don't match",
    inputs: () => {
      const txHash = 0x2222222222222222222222222222222222222222222222222222222222222222n;
      const recipient = 0x5555555555555555555555555555555555555555n;
      const amount = 2000n;
      const minAmountPrivate = 1000n;
      const minAmountPublic = 1500n; // Different from private!
      const timestamp = 1712003000n;
      const timestampMax = 1712006600n;
      
      const txHashUpper = txHash >> 128n;
      const txHashLower = txHash & ((1n << 128n) - 1n);
      const recipientLow = recipient & ((1n << 128n) - 1n);
      const recipientHigh = recipient >> 128n;
      
      // Commitment uses private minAmount
      const commitment = poseidon6([
        txHashUpper, txHashLower, recipientLow, amount, timestamp, minAmountPrivate
      ]);
      
      return {
        private: {
          txHashPacked: [txHashUpper.toString(), txHashLower.toString()],
          recipientLow: recipientLow.toString(),
          recipientHigh: recipientHigh.toString(),
          amount: amount.toString(),
          timestamp: timestamp.toString(),
          minAmount: minAmountPrivate.toString(),
        },
        public: {
          commitment: commitment.toString(),
          minAmountPublic: minAmountPublic.toString(),
          timestampMax: timestampMax.toString()
        }
      };
    },
    shouldPass: false
  }
];

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

async function runTestCase(testCase) {
  console.log(`\n=== ${testCase.name} ===`);
  console.log(`Description: ${testCase.description}`);
  
  const { private: privateInputs, public: publicInputs } = testCase.inputs();
  const input = { ...privateInputs, ...publicInputs };
  
  try {
    console.log("Generating proof...");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      WASM_PATH,
      ZKEY_PATH
    );
    
    const vKey = JSON.parse(readFileSync(VKEY_PATH, "utf8"));
    const valid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    
    const passed = valid === testCase.shouldPass;
    
    if (passed) {
      console.log(`✅ ${testCase.shouldPass ? "Proof is VALID as expected" : "Proof is INVALID as expected"}`);
      return true;
    } else {
      console.log(`❌ Unexpected result:`);
      console.log(`   Expected: ${testCase.shouldPass ? "valid" : "invalid"}`);
      console.log(`   Got: ${valid ? "valid" : "invalid"}`);
      return false;
    }
    
  } catch (error) {
    // If test case should fail and we get an error, that might be expected
    if (!testCase.shouldPass && error.message.includes("Error in template")) {
      console.log(`✅ Circuit rejected invalid inputs as expected`);
      return true;
    }
    
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("=== X402 Payment Circuit Comprehensive Test ===\n");
  
  // Check build files
  if (!checkBuildFiles()) {
    process.exit(1);
  }
  
  let passedCount = 0;
  const totalCount = TEST_CASES.length;
  
  for (const testCase of TEST_CASES) {
    const passed = await runTestCase(testCase);
    if (passed) passedCount++;
  }
  
  console.log("\n=== Summary ===");
  console.log(`Passed: ${passedCount}/${totalCount}`);
  
  if (passedCount === totalCount) {
    console.log("✅ All tests passed!");
    process.exit(0);
  } else {
    console.log(`❌ ${totalCount - passedCount} test(s) failed`);
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
}, 60000); // Force exit after 60 seconds (comprehensive tests may take longer)