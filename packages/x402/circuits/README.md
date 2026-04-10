# X402 Payment Circuit

This directory contains the ZK-SNARK circuit for x402 payment verification.

## Files

- `payment.circom` - Main circuit definition
- `payment.test.mjs` - Test script for proof generation and verification

## Building the Circuit

```bash
npm run build:circuit
# or
bash scripts/build.sh
```

The build script will:
1. Compile the circuit to R1CS, WASM, and symbol files
2. Download the Powers of Tau file (14th power)
3. Perform Groth16 trusted setup (demo mode, not secure for production)
4. Generate verification key and Solidity verifier contract

## Testing

To test the circuit with sample inputs:

```bash
npm run test:circuit
# or
node circuits/payment.test.mjs
```

The test script:
- Generates a valid set of test inputs
- Computes the Poseidon commitment hash
- Generates a ZK proof using the compiled circuit
- Verifies the proof using the verification key
- Validates that the commitment matches the expected value

## Circuit Design

The X402Payment circuit verifies:
1. The transaction hash commitment exists
2. Payment was sent to the specified recipient  
3. Payment amount meets or exceeds the required minimum
4. Transaction is recent enough (timestamp check)

### Inputs

**Private inputs:**
- `txHashPacked[2]` - Transaction hash (2x 128-bit fields = 256-bit total)
- `recipientLow` - Recipient address lower 128 bits
- `recipientHigh` - Recipient address higher 32 bits  
- `amount` - Payment amount in USDC smallest unit (6 decimals)
- `timestamp` - Block timestamp of the transaction
- `minAmount` - Minimum required payment amount

**Public inputs:**
- `commitment` - Poseidon commitment to all private inputs
- `minAmountPublic` - Public minimum amount for verification
- `timestampMax` - Maximum allowed timestamp for the transaction

### Constraints

1. `minAmount === minAmountPublic` - Private min amount matches public
2. Commitment computed as `poseidon6(txHashPacked[0], txHashPacked[1], recipientLow, amount, timestamp, minAmount)`

## Integration with Lemma

The circuit is designed to work with Lemma's `disclosure.condition` API. Once a proof is generated, it can be used to gate access to selectively disclosed attributes behind payment verification.

## Next Steps

1. Upload the compiled circuit (WASM + zkey) to IPFS
2. Register the circuit with Lemma using `circuits.register()`
3. Integrate with the x402 proof generator service
4. Update the verification key and contract address in the production deployment