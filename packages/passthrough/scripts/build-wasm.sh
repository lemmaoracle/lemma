#!/bin/bash
# Build WASM for passthrough schema

set -e

echo "🚀 Building passthrough schema WASM..."

# Check for wasm-pack
if ! command -v wasm-pack &> /dev/null; then
  echo "❌ wasm-pack not found. Installing..."
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Build WASM
echo "1. Building WASM with wasm-pack..."
wasm-pack build \
  --target web \
  --out-dir pkg \
  --release

echo "2. Generating TypeScript bindings..."
# wasm-pack already generates TypeScript bindings

echo "3. Creating package.json for WASM package..."
cat > pkg/package.json << 'EOF'
{
  "name": "@lemma/passthrough-wasm",
  "version": "0.1.0",
  "description": "WASM implementation of passthrough schema",
  "type": "module",
  "main": "lemma_passthrough.js",
  "types": "lemma_passthrough.d.ts",
  "files": [
    "*.js",
    "*.ts",
    "*.wasm"
  ],
  "scripts": {
    "test": "echo \"Run tests from parent package\""
  },
  "keywords": [
    "lemma",
    "wasm",
    "schema",
    "passthrough"
  ],
  "author": "Lemma Oracle",
  "license": "MIT"
}
EOF

echo "✅ WASM build complete!"
echo "📁 Output directory: pkg/"
echo "📦 Files:"
ls -la pkg/ | grep -E "\.(wasm|js|ts|json)$"