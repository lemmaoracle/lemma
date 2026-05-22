#!/usr/bin/env bash
# purge-cf-cache.sh — Purge Cloudflare CDN cache for lemma.frame00.com
# after a deploy so stale assets are never served.
#
# Required env vars (set as GitHub Actions secrets/variables):
#   CLOUDFLARE_API_TOKEN  — API token with Zone.Cache.Purge permission
#   CLOUDFLARE_ZONE_ID    — Zone ID for lemma.frame00.com
#
# Usage:
#   ./purge-cf-cache.sh              # purge everything under the zone
#   ./purge-cf-cache.sh /blog/       # purge only URLs with this prefix

set -euo pipefail

ZONE_ID="${CLOUDFLARE_ZONE_ID:?CLOUDFLARE_ZONE_ID is required}"
API_TOKEN="${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"
PREFIX="${1:-}"

if [[ -n "$PREFIX" ]]; then
  # Prefix-based purge: only invalidate URLs containing the prefix
  # e.g. /blog/ → https://lemma.frame00.com/blog/
  BODY="{\"prefixes\":[\"https://lemma.frame00.com${PREFIX}\"]}"
  echo "Purging CF cache for prefix: ${PREFIX}"
else
  # Full zone purge
  BODY='{"purge_everything":true}'
  echo "Purging entire CF cache for zone ${ZONE_ID}"
fi

RESPONSE=$(curl --silent --show-error --fail \
  "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
  --request POST \
  --header "Authorization: Bearer ${API_TOKEN}" \
  --header "Content-Type: application/json" \
  --data "${BODY}")

SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success',False))" 2>/dev/null || echo "false")

if [[ "$SUCCESS" == "True" ]]; then
  echo "✅ Cloudflare cache purged successfully"
else
  echo "❌ Cloudflare cache purge failed"
  echo "$RESPONSE"
  exit 1
fi
