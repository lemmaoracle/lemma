# Lemma x x402 Integration Demo Setup

## 📋 Overview
This PR sets up the complete infrastructure for the Lemma x x402 integration demo, including schema creation, circuit deployment, and Lemma Register integration.

## 🎯 What's Included

### 1. Passthrough Schema (`lemma/packages/passthrough/`)
- **Schema ID:** `passthrough-v1`
- **Description:** Passthrough schema that returns input data unchanged
- **Purpose:** Provides a simple schema for x402 payment circuit compatibility
- **Status:** ✅ Registered with Lemma

### 2. x402 Payment Circuit (`lemma/packages/x402/`)
- **Circuit ID:** `x402-payment-v1.1`
- **Verifier Address:** `0x02eC0F2b3C42E5696C0F8DAaE78b76ed28A4eE62` (Monad Testnet)
- **Artifacts on IPFS:**
  - WASM: `ipfs://QmUBS1c1MAy7aKihjBcqeHk4H8ciiuN2k7tQvn7bAKq9wn`
  - zkey: `ipfs://QmPQT19nho2hPA7reWUurWtzazvuGMudY2CSo1S1Jgdm79`
- **Status:** ✅ Built, deployed, and registered

### 3. Example-x402 Setup
- **Schema:** `blog-article-v1`
- **Circuit:** `example-circuit-v1.1`
- **Verifier Address:** `0x354cc716ffc02F57Ff7B0bDd465E9C7f12b785E9` (Monad Testnet)
- **Status:** ✅ Configured and ready for integration tests

## 🛠️ Key Technical Features

### 🔧 G2 Point Encoding Fix
- Fixed the G2 point encoding bug in snarkjs-generated Solidity verifiers
- Added `fix-verifier.mjs` scripts for both circuits
- Ensures EIP-197 compatibility for pairing operations

### 🚀 Deployment Automation
- Foundry configuration for Monad Testnet
- Automated deployment scripts
- Environment variable management

### 🔗 Lemma Integration
- Complete Lemma SDK integration
- Schema and circuit registration scripts
- IPFS upload automation with Pinata

## 📁 Files Added/Modified

### New Directories & Files
- `lemma/packages/passthrough/` - Passthrough schema implementation
- `lemma/packages/x402/scripts/` - Deployment and fix scripts
- `lemma/scripts/` - Registration and debug scripts
- `example-x402/packages/normalize-js/` - JavaScript normalize implementation
- `example-x402/scripts/register-example-x402-final.mjs` - Example registration

### Configuration Files
- `lemma/packages/x402/foundry.toml` - Foundry config for Monad Testnet
- `example-x402/.env` - Environment configuration
- `README-integration.md` - Comprehensive documentation

## 🧪 Testing Status

### ✅ Completed
- [x] Schema registration with Lemma
- [x] Circuit compilation and artifact generation
- [x] G2 encoding bug fix verification
- [x] Contract deployment to Monad Testnet
- [x] Lemma Register integration
- [x] IPFS upload of artifacts

### 🔄 To Be Tested
- [ ] Actual proof generation with circuits
- [ ] Lemma disclosure.condition API integration
- [ ] End-to-end integration tests
- [ ] Production deployment readiness

## 🚀 Setup Instructions

### Prerequisites
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
cd lemma && pnpm install
cd example-x402 && pnpm install
```

### Environment Configuration
```bash
# Set environment variables
export LEMMA_API_KEY="your_api_key"
export PINATA_API_KEY="your_pinata_key"
export PINATA_SECRET_API_KEY="your_pinata_secret"
export PRIVATE_KEY="your_private_key"
export RPC_URL="https://testnet-rpc.monad.xyz"
```

### Execution Steps
1. **Build circuits:**
   ```bash
   cd lemma/packages/x402 && pnpm run build:circuit
   cd example-x402/packages/circuit && bash scripts/build.sh
   ```

2. **Fix verifier contracts:**
   ```bash
   cd lemma/packages/x402 && node scripts/fix-verifier.mjs
   cd example-x402/packages/circuit && node scripts/fix-verifier.mjs
   ```

3. **Deploy verifiers:**
   ```bash
   cd lemma/packages/x402 && ./scripts/deploy.sh
   cd example-x402/packages/circuit && forge create --broadcast ...
   ```

4. **Register with Lemma:**
   ```bash
   node lemma/scripts/register-schema-passthrough-correct.mjs
   node lemma/scripts/register-circuit-v1.1.mjs
   ```

## 🔒 Security Notes

- All keys and addresses in this setup are for **TESTNET ONLY**
- Production deployment requires secure key management
- Circuits should use secure trusted setup for production
- Verifier contracts include G2 encoding fix for security

## 📈 Next Steps

1. **Integration Testing**
   - Run actual proof generation with the deployed circuits
   - Test Lemma's disclosure.condition API integration
   - Validate end-to-end workflow

2. **Production Readiness**
   - Implement secure key management
   - Set up monitoring and alerting
   - Create deployment pipeline
   - Add comprehensive testing suite

3. **Documentation**
   - Add API documentation
   - Create user guides
   - Add troubleshooting guide

## 🤝 Review Checklist

- [ ] Code follows project conventions
- [ ] All scripts are executable and documented
- [ ] Environment configuration is secure
- [ ] Deployment process is reproducible
- [ ] Integration with existing systems is compatible
- [ ] Security considerations are addressed

## 📞 Contact
For questions about this integration, contact the infra team or refer to the integration documentation.

---

**⚠️ Important:** This setup uses testnet credentials. Do not use production keys with this configuration.