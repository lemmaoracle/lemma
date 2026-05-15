#!/usr/bin/env bash
#
# Install the toolchain needed to compile the seal circuit.
#
# Required:
#   - Rust + Cargo   — circom is built from source via cargo
#   - circom 2.1.x   — the circuit compiler
#   - Node.js >= 18  — snarkjs runs on Node
#
# snarkjs and circomlib are installed as circuits/ dependencies by
# `npm install` and need no global install.
#
set -euo pipefail

CIRCOM_VERSION="v2.1.9"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "seal toolchain setup"
echo "===================="

# 1. Rust / Cargo
if command -v cargo >/dev/null 2>&1; then
  echo "✓ cargo present: $(cargo --version)"
else
  echo "→ installing Rust via rustup"
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  # shellcheck disable=SC1091
  source "$HOME/.cargo/env"
fi

# 2. circom 2.1.x
if command -v circom >/dev/null 2>&1; then
  echo "✓ circom present: $(circom --version)"
else
  echo "→ building circom $CIRCOM_VERSION from source"
  TMP="$(mktemp -d)"
  git clone --depth 1 --branch "$CIRCOM_VERSION" \
    https://github.com/iden3/circom.git "$TMP/circom"
  cargo install --path "$TMP/circom/circom"
  rm -rf "$TMP"
  echo "✓ circom installed: $(circom --version)"
fi

# 3. Node.js
if command -v node >/dev/null 2>&1; then
  echo "✓ node present: $(node --version)"
else
  echo "✗ Node.js >= 18 is required — install it, then re-run this script" >&2
  exit 1
fi

# 4. circuit JS dependencies (snarkjs, circomlib)
echo "→ installing circuit dependencies"
( cd "$SCRIPT_DIR/../circuits" && npm install )

echo ""
echo "✓ toolchain ready — build the circuit with:"
echo "    cd packages/seal/circuits && npm run build"
