#!/bin/bash
# Setup script for Lemma x x402 integration demo

set -e

echo "🚀 Setting up Lemma x x402 Integration Demo"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "\n${YELLOW}1. Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check npm/pnpm
if command -v pnpm &> /dev/null; then
  echo -e "${GREEN}✅ pnpm found${NC}"
elif command -v npm &> /dev/null; then
  echo -e "${GREEN}✅ npm found${NC}"
else
  echo -e "${RED}❌ Neither npm nor pnpm found${NC}"
  exit 1
fi

# Check Foundry
if ! command -v forge &> /dev/null; then
  echo -e "${YELLOW}⚠️  Foundry not found. Installing...${NC}"
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
fi
echo -e "${GREEN}✅ Foundry $(forge --version)${NC}"

# Check environment variables
echo -e "\n${YELLOW}2. Checking environment variables...${NC}"

ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}⚠️  .env file not found. Creating template...${NC}"
  cat > "$ENV_FILE" << 'EOF'
# Lemma x x402 Integration Environment Variables

# Lemma API
LEMMA_API_KEY=your_lemma_api_key_here

# Pinata (IPFS)
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here

# Ethereum/Monad
PRIVATE_KEY=your_private_key_here
RPC_URL=https://testnet-rpc.monad.xyz
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Circuit IDs
X402_CIRCUIT_ID=x402-payment-v1.1
EXAMPLE_CIRCUIT_ID=example-circuit-v1.1

# Verifier Addresses (already deployed)
X402_VERIFIER=0x02eC0F2b3C42E5696C0F8DAaE78b76ed28A4eE62
EXAMPLE_VERIFIER=0x354cc716ffc02F57Ff7B0bDd465E9C7f12b785E9
EOF
  echo -e "${GREEN}✅ Created .env template${NC}"
  echo -e "${YELLOW}⚠️  Please edit .env file with your actual credentials${NC}"
  exit 1
else
  echo -e "${GREEN}✅ .env file found${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}3. Installing dependencies...${NC}"

if command -v pnpm &> /dev/null; then
  pnpm install
else
  npm install
fi

# Build passthrough package
echo -e "\n${YELLOW}4. Building passthrough schema...${NC}"
cd packages/passthrough
if command -v pnpm &> /dev/null; then
  pnpm run build
else
  npm run build
fi
cd ../..

# Setup complete
echo -e "\n${GREEN}🎉 Setup complete!${NC}"
echo -e "\n${YELLOW}📋 Next steps:${NC}"
echo "   1. Edit .env file with your actual credentials"
echo "   2. Build x402 circuit:"
echo "      cd packages/x402 && ./scripts/build.sh"
echo "   3. Deploy verifier:"
echo "      cd packages/x402 && ./scripts/deploy.sh"
echo "   4. Register with Lemma:"
echo "      node scripts/register-schema-passthrough.mjs"
echo "      node scripts/register-circuit-v1.1.mjs"
echo "   5. Verify setup:"
echo "      node scripts/check-circuit-status.mjs"
echo -e "\n${YELLOW}📚 Documentation:${NC}"
echo "   - See README-integration.md for detailed instructions"
echo "   - Check PR_DESCRIPTION.md for integration overview"