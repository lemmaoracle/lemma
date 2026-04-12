# Lemma x x402 Integration Demo Setup

This commit sets up the complete infrastructure for the Lemma x x402 integration demo.

## What's Included

### 1. Passthrough Schema
- **Location:** `lemma/packages/passthrough/`
- **Schema ID:** `passthrough-v1`
- **Description:** Passthrough schema that returns input data unchanged
- **Purpose:** Provides a simple schema for x402 payment circuit

### 2. x402 Payment Circuit
- **Location:** `lemma/packages/x402/`
- **Circuit ID:** `x402-payment-v1.1`
- **Verifier Address:** `0x02eC0F2b3C42E5696C0F8DAaE78b76ed28A4eE62` (Monad Testnet)
- **Artifacts:** 
  - WASM: `ipfs://QmUBS1c1MAy7aKihjBcqeHk4H8ciiuN2k7tQvn7bAKq9wn`
  - zkey: `ipfs://QmPQT19nho2hPA7reWUurWtzazvuGMudY2CSo1S1Jgdm79`

### 3. Example-x402 Setup
- **Schema:** `blog-article-v1`
- **Circuit:** `example-circuit-v1.1`
- **Verifier Address:** `0x354cc716ffc02F57Ff7B0bDd465E9C7f12b785E9` (Monad Testnet)

### 4. Key Features
- ✅ G2 point encoding bug fix for snarkjs-generated verifiers
- ✅ Foundry setup for contract deployment
- ✅ Lemma Register integration scripts
- ✅ Environment configuration for Monad Testnet
- ✅ IPFS upload automation with Pinata

## Setup Instructions

1. **Environment Setup:**
   ```bash
   export LEMMA_API_KEY=your_api_key
   export PINATA_API_KEY=your_pinata_key
   export PINATA_SECRET_API_KEY=your_pinata_secret
   export PRIVATE_KEY=your_private_key
   ```

2. **Build Circuits:**
   ```bash
   cd lemma/packages/x402 && pnpm run build:circuit
   cd example-x402/packages/circuit && bash scripts/build.sh
   ```

3. **Fix Verifier Contracts:**
   ```bash
   cd lemma/packages/x402 && node scripts/fix-verifier.mjs
   cd example-x402/packages/circuit && node scripts/fix-verifier.mjs
   ```

4. **Deploy Verifiers:**
   ```bash
   cd lemma/packages/x402 && ./scripts/deploy.sh
   cd example-x402/packages/circuit && forge create --broadcast ...
   ```

5. **Register with Lemma:**
   ```bash
   node lemma/scripts/register-schema-passthrough-correct.mjs
   node lemma/scripts/register-circuit-v1.1.mjs
   ```

## Scripts Created

- `lemma/scripts/register-schema-passthrough-correct.mjs`
- `lemma/scripts/register-circuit-v1.1.mjs`
- `lemma/packages/x402/scripts/fix-verifier.mjs`
- `lemma/packages/x402/scripts/deploy.sh`
- `example-x402/packages/circuit/scripts/fix-verifier.mjs`

## Dependencies
- Foundry (for contract deployment)
- Node.js with pnpm
- circom2 & snarkjs (for circuit compilation)
- Lemma SDK

## Next Steps
1. Run integration tests with actual proof generation
2. Test disclosure.condition API integration
3. Deploy to production networks
4. Set up monitoring and alerting

## Security Notes
- All keys in this setup are for TESTNET only
- Production deployment requires secure key management
- Circuits should use secure trusted setup for production
