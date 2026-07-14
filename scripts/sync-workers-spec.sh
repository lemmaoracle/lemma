#!/usr/bin/env bash
set -euo pipefail

MONO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${WORKERS_DIR:-$MONO_ROOT/../workers}"

# The api package keeps its spec under packages/api/spec — not $TARGET/spec.
# The old path wrote the files where nothing reads them, so the "canonical spec"
# in workers silently went stale.
SPEC_DIR="$TARGET/packages/api/spec"

mkdir -p "$SPEC_DIR"
cp "$MONO_ROOT/packages/spec/openapi.lemma.v2.json" "$SPEC_DIR/openapi.lemma.v2.json"
cp "$MONO_ROOT/packages/spec/src/index.ts" "$SPEC_DIR/types.ts"

echo "✅ Synced spec → $SPEC_DIR"
