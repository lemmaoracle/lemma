#!/usr/bin/env bash
#
# Compile the seal-identity circuit and run the groth16 trusted setup.
# Prerequisite: circom + the circuits/ npm dependencies — install them
# with ../scripts/setup-toolchain.sh.
#
set -euo pipefail

CIRCUIT_NAME="seal-identity"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$SCRIPT_DIR/src"
BUILD_DIR="$SCRIPT_DIR/build"
PTAU_DIR="$BUILD_DIR/ptau"
CIRCOMLIB_DIR="$SCRIPT_DIR/node_modules"
SNARKJS="npx snarkjs"

# SHA-256 over a 512-bit pre-image compiles to ~60k R1CS constraints
# (two 512-bit blocks), so phase-1 powers of tau must cover 2^17.
PTAU_POWER=17
PTAU="$PTAU_DIR/pot${PTAU_POWER}_final.ptau"
PTAU_URL="https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_${PTAU_POWER}.ptau"

mkdir -p "$BUILD_DIR" "$PTAU_DIR"

command -v circom >/dev/null 2>&1 || {
  echo "✗ circom not found — run ../scripts/setup-toolchain.sh first" >&2
  exit 1
}

echo "→ compiling $CIRCUIT_NAME"
circom "$SRC_DIR/$CIRCUIT_NAME.circom" \
  --r1cs \
  --wasm \
  --sym \
  -l "$CIRCOMLIB_DIR" \
  -o "$BUILD_DIR"

echo "→ constraint info"
$SNARKJS r1cs info "$BUILD_DIR/$CIRCUIT_NAME.r1cs"

# Phase 1 — powers of tau. The 2^17 file is ~290 MB; downloading the
# pre-generated Hermez ceremony output is far faster and safer than
# generating one locally.
if [ ! -f "$PTAU" ]; then
  echo "→ downloading powers of tau (2^${PTAU_POWER})"
  curl -fL "$PTAU_URL" -o "$PTAU"
fi

echo "→ groth16 setup"
$SNARKJS groth16 setup \
  "$BUILD_DIR/$CIRCUIT_NAME.r1cs" \
  "$PTAU" \
  "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey"

$SNARKJS zkey contribute \
  "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey" \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  --name="lemma seal-identity" -v -e="lemma seal-identity $(date +%s)"

echo "→ exporting verification key"
$SNARKJS zkey export verificationkey \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  "$BUILD_DIR/${CIRCUIT_NAME}_vkey.json"

echo "✓ $CIRCUIT_NAME built → $BUILD_DIR"
