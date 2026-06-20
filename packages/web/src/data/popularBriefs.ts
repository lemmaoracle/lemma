/**
 * Manually-curated "most-read" Critical Brief ranking.
 *
 * The site is static, so this is a hand-maintained list rather than a live
 * counter. Refresh it periodically from GA4:
 *   GA4 → Reports → Engagement → Pages and screens
 *   → filter "Page path and screen class" contains "/critical/briefs/"
 *   → sort by Views desc
 *   → take the top entries and copy each brief's slug below, in order.
 *
 * Use the brief slug = the content filename without ".md"
 * (e.g. "072-lerobot-pickle-grpc-rce"). Order = rank (top first).
 * Unknown/typo slugs are skipped silently. Set to [] to hide the section.
 *
 * NOTE: the current list is a PROVISIONAL placeholder — replace with real GA4
 * top pages before relying on it.
 */
export const POPULAR_BRIEF_SLUGS: ReadonlyArray<string> = [
  "072-lerobot-pickle-grpc-rce",
  "067-syscoin-bridge-spv-proof-parsing",
  "066-litellm-ai-gateway-privilege-escalation",
  "071-dji-romo-robot-vacuum-no-acl",
  "065-hokkaido-hospital-hdd-disposal",
];
