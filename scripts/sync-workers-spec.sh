#!/usr/bin/env bash
set -euo pipefail

MONO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${WORKERS_DIR:-$MONO_ROOT/../workers}"

mkdir -p "$TARGET/spec"
cp "$MONO_ROOT/packages/spec/openapi.lemma.v2.json" "$TARGET/spec/openapi.lemma.v2.json"
cp "$MONO_ROOT/packages/spec/src/index.ts" "$TARGET/spec/types.ts"

echo "✅ Synced spec → $TARGET/spec"
