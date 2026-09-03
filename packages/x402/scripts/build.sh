#!/usr/bin/env bash
# Build script for x402 payment circuit
# Compiles circuit → trusted setup → export verifier contract
set -euo pipefail

CIRCUIT="circuits/payment.circom"
BUILD_DIR="build"
# Powers of Tau。ネットから落とさず、リポジトリにコミット済みのものを使う。
# 2026-09: 配布元 (storage.googleapis.com/zkevm/ptau) が 403 を返すようになり、
# curl が 403 の本文をそのまま .ptau に書いて snarkjs が
# "Invalid File format" で落ちていた。pot15 は 2^15 で、この回路
# (非線形制約 357) には十分。
PTAU_SRC="../data-commitment/circuits/build/ptau/pot15_final.ptau"
PTAU="build/pot15_final.ptau"
LIBS_DIR="$BUILD_DIR/libs"

mkdir -p "$BUILD_DIR"

# circom2 (WASM) cannot follow symlinks, which breaks with pnpm's symlinked
# node_modules. Copy circomlib into the build directory as real files.
rm -rf "$LIBS_DIR"
mkdir -p "$LIBS_DIR"
cp -rL node_modules/circomlib "$LIBS_DIR/circomlib"

echo "1/5  Compiling x402 payment circuit..."
npx circom2 "$CIRCUIT" --r1cs --wasm --sym -o "$BUILD_DIR" -l "$LIBS_DIR"

echo "2/5  Preparing Powers of Tau (repo-local, 15)..."
if [ ! -f "$PTAU" ]; then
  if [ ! -f "$PTAU_SRC" ]; then
    echo "ERROR: Powers of Tau not found at $PTAU_SRC" >&2
    echo "       This file is committed to the repository — check your checkout." >&2
    exit 1
  fi
  cp "$PTAU_SRC" "$PTAU"
fi

echo "3/5  Groth16 setup..."
npx snarkjs groth16 setup \
  "$BUILD_DIR/payment.r1cs" \
  "$PTAU" \
  "$BUILD_DIR/payment_0000.zkey"

echo "4/5  Contributing to phase 2 (demo only — not secure for production)..."
echo "demo_entropy_x402_lemma_2026" | npx snarkjs zkey contribute \
  "$BUILD_DIR/payment_0000.zkey" \
  "$BUILD_DIR/payment_final.zkey" \
  --name="Demo contribution x402 payment" -v

echo "5/5  Exporting verification key and Solidity verifier..."
# Export verification key (for off-chain verification)
npx snarkjs zkey export verificationkey \
  "$BUILD_DIR/payment_final.zkey" \
  "$BUILD_DIR/verification_key.json"

# Export Solidity verifier contract
npx snarkjs zkey export solidityverifier \
  "$BUILD_DIR/payment_final.zkey" \
  "$BUILD_DIR/PaymentVerifier.sol"

echo ""
echo "✅ Build complete"
echo "   WASM : $BUILD_DIR/payment_js/payment.wasm"
echo "   zkey : $BUILD_DIR/payment_final.zkey"
echo "   Verification key: $BUILD_DIR/verification_key.json"
echo "   Verifier contract: $BUILD_DIR/PaymentVerifier.sol"
echo ""
echo "Next steps:"
echo "  1. Upload wasm + zkey to IPFS"
echo "  2. Register with Lemma: circuits.register(client, { circuitId: 'x402-payment-v1', ... })"
echo ""
