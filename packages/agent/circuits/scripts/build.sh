#!/usr/bin/env bash
set -euo pipefail

CIRCUIT_NAME="agent-identity"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$SCRIPT_DIR/src"
BUILD_DIR="$SCRIPT_DIR/build"
PTAU_DIR="$BUILD_DIR/ptau"
CIRCOMLIB_DIR="$SCRIPT_DIR/node_modules"
SNARKJS="npx snarkjs"

mkdir -p "$BUILD_DIR" "$PTAU_DIR"

echo "→ compiling $CIRCUIT_NAME"
circom "$SRC_DIR/$CIRCUIT_NAME.circom" \
  --r1cs \
  --wasm \
  --sym \
  -l "$CIRCOMLIB_DIR" \
  -o "$BUILD_DIR"

echo "→ constraint info"
$SNARKJS r1cs info "$BUILD_DIR/$CIRCUIT_NAME.r1cs"

# Powers of Tau (2^12 is sufficient for this circuit size)
PTAU="$PTAU_DIR/pot12_final.ptau"
if [ ! -f "$PTAU" ]; then
  echo "→ generating powers of tau"
  $SNARKJS powersoftau new bn128 12 "$PTAU_DIR/pot12_0000.ptau" -v
  $SNARKJS powersoftau contribute "$PTAU_DIR/pot12_0000.ptau" "$PTAU_DIR/pot12_0001.ptau" \
    --name="First contribution" -v -e="lemma agent-identity"
  echo "→ preparing phase 1"
  $SNARKJS powersoftau prepare phase2 "$PTAU_DIR/pot12_0001.ptau" "$PTAU" -v
fi

echo "→ phase 2 setup"
$SNARKJS groth16 setup \
  "$BUILD_DIR/$CIRCUIT_NAME.r1cs" \
  "$PTAU" \
  "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey"

$SNARKJS zkey contribute \
  "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey" \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  --name="First contribution" -v -e="lemma agent-identity"

echo "→ exporting verification key"
$SNARKJS zkey export verificationkey \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  "$BUILD_DIR/${CIRCUIT_NAME}_vkey.json"

echo "✓ $CIRCUIT_NAME built"
