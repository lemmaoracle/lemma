#!/usr/bin/env bash
# Build agent-gate-v1: circom compile -> Groth16 setup -> vkey export.
#
# DEVELOPMENT ONLY. The phase-2 step below is a single machine-local
# contribution, NOT a trusted-setup ceremony. Artifacts under build/ are
# gitignored test fixtures and MUST NEVER be registered, uploaded, or
# represented as production keys.
#
# Prerequisite: circom binary + `pnpm install` at the repo root (provides
# node_modules/circomlib and node_modules/snarkjs for this package).
#
# Env overrides:
#   PTAU_SRC  repo- or machine-local powers-of-tau file to reuse (default: the
#             data-commitment pot15 in the sibling lemma checkout, copied in,
#             never modified). If absent, a local pot15 is generated instead
#             (measurement use only, not a ceremony).
set -euo pipefail

CIRCUIT_NAME="agent-gate-v1"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$SCRIPT_DIR/src"
BUILD_DIR="$SCRIPT_DIR/build"
PTAU_DIR="$BUILD_DIR/ptau"
LIBS_DIR="$BUILD_DIR/libs"
NODE_MODULES="$SCRIPT_DIR/../node_modules"
SNARKJS="node $SCRIPT_DIR/../node_modules/snarkjs/build/cli.cjs"

PTAU_POWER=15
PTAU="$PTAU_DIR/pot${PTAU_POWER}_final.ptau"
PTAU_SRC="${PTAU_SRC:-/root/lemmaoracle/lemma/packages/data-commitment/circuits/build/ptau/pot15_final.ptau}"

mkdir -p "$BUILD_DIR" "$PTAU_DIR"

command -v circom >/dev/null 2>&1 || { echo "ERROR: circom not found" >&2; exit 1; }
[ -d "$NODE_MODULES/circomlib" ] || { echo "ERROR: run pnpm install first ($NODE_MODULES/circomlib missing)" >&2; exit 1; }

now() { date +%s.%N; }
elapsed() { awk "BEGIN {print $2 - $1}"; }

# Copy (never symlink) circomlib: circom include resolution must see real files.
rm -rf "$LIBS_DIR"
mkdir -p "$LIBS_DIR"
cp -rL "$NODE_MODULES/circomlib" "$LIBS_DIR/circomlib"

echo "== 1/5 compile ($CIRCUIT_NAME) =="
T0=$(now)
circom "$SRC_DIR/$CIRCUIT_NAME.circom" --r1cs --wasm --sym -o "$BUILD_DIR" -l "$SRC_DIR" -l "$LIBS_DIR"
T1=$(now); echo "   compile: $(elapsed "$T0" "$T1")s"

echo "== 2/5 constraint info =="
$SNARKJS r1cs info "$BUILD_DIR/$CIRCUIT_NAME.r1cs"

echo "== 3/5 powers of tau (2^$PTAU_POWER, development-only) =="
T0=$(now)
if [ ! -f "$PTAU" ]; then
  if [ -f "$PTAU_SRC" ]; then
    echo "   reusing local ptau (copied, source untouched): $PTAU_SRC"
    cp "$PTAU_SRC" "$PTAU"
  else
    echo "   no local ptau found; generating pot${PTAU_POWER} locally (NOT a ceremony)"
    $SNARKJS powersoftau new bn128 "$PTAU_POWER" "$PTAU_DIR/pot${PTAU_POWER}_0000.ptau"
    echo "dev-only entropy, never production" | $SNARKJS powersoftau contribute "$PTAU_DIR/pot${PTAU_POWER}_0000.ptau" "$PTAU_DIR/pot${PTAU_POWER}_0001.ptau" --name="dev-only" -v
    $SNARKJS powersoftau prepare phase2 "$PTAU_DIR/pot${PTAU_POWER}_0001.ptau" "$PTAU" -v
  fi
fi
T1=$(now); echo "   ptau: $(elapsed "$T0" "$T1")s"

echo "== 4/5 groth16 setup + single local contribution (NOT a ceremony) =="
T0=$(now)
$SNARKJS groth16 setup "$BUILD_DIR/$CIRCUIT_NAME.r1cs" "$PTAU" "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey"
echo "dev-only entropy, never production" | $SNARKJS zkey contribute "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey" "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" --name="dev-only contribution" -v
T1=$(now); echo "   setup+contribute: $(elapsed "$T0" "$T1")s"

echo "== 5/5 export verification key =="
T0=$(now)
$SNARKJS zkey export verificationkey "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" "$BUILD_DIR/${CIRCUIT_NAME}_vkey.json"
T1=$(now); echo "   vkey export: $(elapsed "$T0" "$T1")s"

echo ""
echo "build complete (DEVELOPMENT ONLY)"
echo "   r1cs : $BUILD_DIR/$CIRCUIT_NAME.r1cs"
echo "   wasm : $BUILD_DIR/${CIRCUIT_NAME}_js/$CIRCUIT_NAME.wasm"
echo "   zkey : $BUILD_DIR/${CIRCUIT_NAME}_final.zkey"
echo "   vkey : $BUILD_DIR/${CIRCUIT_NAME}_vkey.json"
sha256sum "$BUILD_DIR/$CIRCUIT_NAME.r1cs" "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" "$BUILD_DIR/${CIRCUIT_NAME}_vkey.json"
