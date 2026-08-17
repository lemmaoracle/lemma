#!/usr/bin/env bash
#
# Compile the transform-exec circuit and run the groth16 trusted setup.
# Prerequisite: circom + the circuits/ npm dependencies (circomlib).
#
set -euo pipefail

CIRCUIT_NAME="transform-exec"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$SCRIPT_DIR/src"
BUILD_DIR="$SCRIPT_DIR/build"
PTAU_DIR="$BUILD_DIR/ptau"
CIRCOMLIB_DIR="$SCRIPT_DIR/node_modules"
SNARKJS="npx snarkjs"

# Poseidon(1) ×2 + 1 assertion ≈ ~500 R1CS constraints.
# PTAU 2^12 covers this comfortably.
PTAU_POWER=12
PTAU="$PTAU_DIR/pot${PTAU_POWER}_final.ptau"
PTAU_URL="https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_${PTAU_POWER}.ptau"

mkdir -p "$BUILD_DIR" "$PTAU_DIR"

command -v circom >/dev/null 2>&1 || {
  echo "✗ circom not found" >&2
  exit 1
}

echo "→ installing circomlib (if needed)"
if [ ! -d "$CIRCOMLIB_DIR/circomlib" ]; then
  (cd "$SCRIPT_DIR" && npm install circomlib)
fi

echo "→ compiling $CIRCUIT_NAME"
circom "$SRC_DIR/$CIRCUIT_NAME.circom" \
  --r1cs \
  --wasm \
  --sym \
  -l "$CIRCOMLIB_DIR" \
  -o "$BUILD_DIR"

echo "→ constraint info"
$SNARKJS r1cs info "$BUILD_DIR/$CIRCUIT_NAME.r1cs"

# Phase 1 — powers of tau.
if [ ! -f "$PTAU" ]; then
  echo "→ downloading powers of tau (2^${PTAU_POWER})"
  curl -fL "$PTAU_URL" -o "$PTAU" || {
    echo "→ downloading failed, generating locally"
    $SNARKJS powersoftau new bn128 ${PTAU_POWER} "$PTAU_DIR/pot${PTAU_POWER}_0000.ptau" -v
    $SNARKJS powersoftau contribute "$PTAU_DIR/pot${PTAU_POWER}_0000.ptau" "$PTAU_DIR/pot${PTAU_POWER}_0001.ptau" --name="First contribution" -v -e="random entropy"
    $SNARKJS powersoftau prepare phase2 "$PTAU_DIR/pot${PTAU_POWER}_0001.ptau" "$PTAU" -v
  }
fi

echo "→ groth16 setup"
$SNARKJS groth16 setup \
  "$BUILD_DIR/$CIRCUIT_NAME.r1cs" \
  "$PTAU" \
  "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey"

$SNARKJS zkey contribute \
  "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey" \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  --name="lemma transform-exec" -v -e="lemma transform-exec $(date +%s)"

echo "→ exporting verification key"
$SNARKJS zkey export verificationkey \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  "$BUILD_DIR/${CIRCUIT_NAME}_vkey.json"

echo "✓ $CIRCUIT_NAME built → $BUILD_DIR"
