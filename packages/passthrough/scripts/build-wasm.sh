#!/bin/bash
# Build WASM for Lemma passthrough schema

set -e

echo "🚀 Building passthrough schema WASM for Lemma..."

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

# Build optimized WASM
echo "1. Building optimized WASM..."
wasm-pack build \
  --target no-modules \
  --out-dir ../../dist/wasm \
  --release \
  --scope lemma

echo "2. Renaming for Lemma compatibility..."
mv ../../dist/wasm/lemma_passthrough_bg.wasm ../../dist/wasm/passthrough.wasm
mv ../../dist/wasm/lemma_passthrough.js ../../dist/wasm/passthrough.js

echo "✅ WASM build complete!"
echo "📁 Output: dist/wasm/"
echo "📦 Files generated:"
ls -la ../../dist/wasm/ 2>/dev/null || echo "  (dist/wasm/ directory)"