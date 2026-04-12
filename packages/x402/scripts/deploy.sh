#!/bin/bash
# Deploy PaymentVerifier contract to Monad Testnet

set -e

echo "🚀 Deploying PaymentVerifier to Monad Testnet..."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check required environment variables
if [ -z "$PRIVATE_KEY" ]; then
  echo "❌ PRIVATE_KEY is not set"
  exit 1
fi

if [ -z "$RPC_URL" ]; then
  RPC_URL="https://testnet-rpc.monad.xyz"
  echo "⚠️  RPC_URL not set, using default: $RPC_URL"
fi

# Check if contract exists
if [ ! -f "build/PaymentVerifier.sol" ]; then
  echo "❌ PaymentVerifier.sol not found. Run build.sh first."
  exit 1
fi

# Deploy contract
echo "📄 Deploying PaymentVerifier..."
DEPLOY_OUTPUT=$(forge create \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --legacy \
  "build/PaymentVerifier.sol:PaymentVerifier")

echo "$DEPLOY_OUTPUT"

# Extract contract address
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -o "Deployed to: 0x[0-9a-fA-F]\{40\}" | cut -d' ' -f3)

if [ -n "$CONTRACT_ADDRESS" ]; then
  echo "✅ Contract deployed successfully!"
  echo "📝 Contract address: $CONTRACT_ADDRESS"
  
  # Save to environment file
  echo "VERIFIER_CONTRACT=$CONTRACT_ADDRESS" > .verifier.env
  echo "✅ Saved to .verifier.env"
  
  # Verify on Etherscan if API key is available
  if [ -n "$ETHERSCAN_API_KEY" ]; then
    echo "🔍 Verifying on Etherscan..."
    forge verify-contract \
      --chain-id 10143 \
      --etherscan-api-key "$ETHERSCAN_API_KEY" \
      --compiler-version v0.8.28+commit.5fe4bb1d \
      --num-of-optimizations 200 \
      "$CONTRACT_ADDRESS" \
      "build/PaymentVerifier.sol:PaymentVerifier" || echo "⚠️ Verification failed or skipped"
  fi
else
  echo "❌ Failed to extract contract address"
  exit 1
fi