#!/bin/bash
# Build WASM for Lemma agent schema

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUT_DIR="$PROJECT_DIR/dist/wasm"

echo "🚀 Building agent schema WASM for Lemma..."

# Check for Rust
if ! command -v cargo &> /dev/null; then
  echo "❌ Rust/cargo not found. Install from https://rustup.rs/"
  exit 1
fi

# Check for wasm-pack (optional but recommended)
if ! command -v wasm-pack &> /dev/null; then
  echo "⚠️  wasm-pack not found. Installing..."
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Create output directory if it doesn't exist
mkdir -p "$OUT_DIR"

# Build optimized WASM
echo "1. Building optimized WASM..."
echo "   Building in: $PROJECT_DIR"
echo "   Output to: $OUT_DIR"
wasm-pack build \
  --target web \
  --out-dir "$OUT_DIR" \
  --release \
  --scope lemma

echo "2. Renaming for Lemma compatibility..."
mv "$OUT_DIR/lemma_agent_bg.wasm" "$OUT_DIR/agent.wasm"
mv "$OUT_DIR/lemma_agent.js" "$OUT_DIR/agent.js"

echo "✅ WASM build complete!"
echo "📁 Output: $OUT_DIR"
echo "📦 Files generated:"
ls -la "$OUT_DIR/" 2>/dev/null || echo "  ($OUT_DIR directory)"
