#!/usr/bin/env bash
#
# Compile the role-spend-limit circuit and run the groth16 trusted setup.
# Prerequisite: circom + the circuits/ npm dependencies.
#
set -euo pipefail

CIRCUIT_NAME="role-spend-limit"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$SCRIPT_DIR/src"
BUILD_DIR="$SCRIPT_DIR/build"
PTAU_DIR="$BUILD_DIR/ptau"
CIRCOMLIB_DIR="$SCRIPT_DIR/node_modules"
SNARKJS="npx snarkjs"

# Poseidon + LessEqThan compiles to < 1k R1CS constraints,
# so phase-1 powers of tau must cover 2^12.
PTAU_POWER=12
PTAU="$PTAU_DIR/pot${PTAU_POWER}_final.ptau"
PTAU_URL="https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_${PTAU_POWER}.ptau"

mkdir -p "$BUILD_DIR" "$PTAU_DIR"

command -v circom >/dev/null 2>&1 || {
  echo "✗ circom not found" >&2
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
  --name="lemma role-spend-limit" -v -e="lemma role-spend-limit $(date +%s)"

echo "→ exporting verification key"
$SNARKJS zkey export verificationkey \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  "$BUILD_DIR/${CIRCUIT_NAME}_vkey.json"

echo "✓ $CIRCUIT_NAME built → $BUILD_DIR"

# ── listing-binding circuit (circuit ID: listing-binding-v2) ─────
# Depth-20 Poseidon Merkle ≈ 12k R1CS constraints → needs 2^15 ptau
# (snarkjs requires constraints*2 <= 2^power).

CIRCUIT2_NAME="listing-binding"
PTAU2_POWER=15
PTAU2="$PTAU_DIR/pot${PTAU2_POWER}_final.ptau"
PTAU2_URL="https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_${PTAU2_POWER}.ptau"

echo "→ compiling $CIRCUIT2_NAME"
circom "$SRC_DIR/$CIRCUIT2_NAME.circom" \
  --r1cs \
  --wasm \
  --sym \
  -l "$CIRCOMLIB_DIR" \
  -o "$BUILD_DIR"

echo "→ constraint info"
$SNARKJS r1cs info "$BUILD_DIR/$CIRCUIT2_NAME.r1cs"

if [ ! -f "$PTAU2" ]; then
  echo "→ downloading powers of tau (2^${PTAU2_POWER})"
  curl -fL "$PTAU2_URL" -o "$PTAU2" || {
    echo "→ downloading failed, generating locally"
    $SNARKJS powersoftau new bn128 ${PTAU2_POWER} "$PTAU_DIR/pot${PTAU2_POWER}_0000.ptau" -v
    $SNARKJS powersoftau contribute "$PTAU_DIR/pot${PTAU2_POWER}_0000.ptau" "$PTAU_DIR/pot${PTAU2_POWER}_0001.ptau" --name="First contribution" -v -e="random entropy"
    $SNARKJS powersoftau prepare phase2 "$PTAU_DIR/pot${PTAU2_POWER}_0001.ptau" "$PTAU2" -v
  }
fi

echo "→ groth16 setup"
$SNARKJS groth16 setup \
  "$BUILD_DIR/$CIRCUIT2_NAME.r1cs" \
  "$PTAU2" \
  "$BUILD_DIR/${CIRCUIT2_NAME}_0000.zkey"

$SNARKJS zkey contribute \
  "$BUILD_DIR/${CIRCUIT2_NAME}_0000.zkey" \
  "$BUILD_DIR/${CIRCUIT2_NAME}_final.zkey" \
  --name="lemma listing-binding" -v -e="lemma listing-binding $(date +%s)"

echo "→ exporting verification key"
$SNARKJS zkey export verificationkey \
  "$BUILD_DIR/${CIRCUIT2_NAME}_final.zkey" \
  "$BUILD_DIR/${CIRCUIT2_NAME}_vkey.json"

echo "✓ $CIRCUIT2_NAME built → $BUILD_DIR"

# ── org-identity circuit (circuit ID: org-identity-v1) ───────────
# Poseidon1 + Poseidon3×2 + Poseidon5 ≈ 600 R1CS constraints.
# Use 2^15 ptau (same as listing-binding) for headroom.

CIRCUIT3_NAME="org-identity"
PTAU3_POWER=15
PTAU3="$PTAU_DIR/pot${PTAU3_POWER}_final.ptau"
PTAU3_URL="https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_${PTAU3_POWER}.ptau"

echo "→ compiling $CIRCUIT3_NAME"
circom "$SRC_DIR/$CIRCUIT3_NAME.circom" \
  --r1cs \
  --wasm \
  --sym \
  -l "$CIRCOMLIB_DIR" \
  -o "$BUILD_DIR"

echo "→ constraint info"
$SNARKJS r1cs info "$BUILD_DIR/$CIRCUIT3_NAME.r1cs"

if [ ! -f "$PTAU3" ]; then
  echo "→ downloading powers of tau (2^${PTAU3_POWER})"
  curl -fL "$PTAU3_URL" -o "$PTAU3" || {
    echo "→ downloading failed, generating locally"
    $SNARKJS powersoftau new bn128 ${PTAU3_POWER} "$PTAU_DIR/pot${PTAU3_POWER}_0000.ptau" -v
    $SNARKJS powersoftau contribute "$PTAU_DIR/pot${PTAU3_POWER}_0000.ptau" "$PTAU_DIR/pot${PTAU3_POWER}_0001.ptau" --name="First contribution" -v -e="random entropy"
    $SNARKJS powersoftau prepare phase2 "$PTAU_DIR/pot${PTAU3_POWER}_0001.ptau" "$PTAU3" -v
  }
fi

echo "→ groth16 setup"
$SNARKJS groth16 setup \
  "$BUILD_DIR/$CIRCUIT3_NAME.r1cs" \
  "$PTAU3" \
  "$BUILD_DIR/${CIRCUIT3_NAME}_0000.zkey"

$SNARKJS zkey contribute \
  "$BUILD_DIR/${CIRCUIT3_NAME}_0000.zkey" \
  "$BUILD_DIR/${CIRCUIT3_NAME}_final.zkey" \
  --name="lemma org-identity" -v -e="lemma org-identity $(date +%s)"

echo "→ exporting verification key"
$SNARKJS zkey export verificationkey \
  "$BUILD_DIR/${CIRCUIT3_NAME}_final.zkey" \
  "$BUILD_DIR/${CIRCUIT3_NAME}_vkey.json"

echo "✓ $CIRCUIT3_NAME built → $BUILD_DIR"
