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
 * Last updated from GA4 on 2026-06-20 — JA + EN Views combined per Brief, the two
 * index pages (/critical/briefs/) excluded. (#5 was a 9-view tie with
 * 008-discord-scraping; the higher single-page entry won.)
 */
export const POPULAR_BRIEF_SLUGS: ReadonlyArray<string> = [
  "060-withers-aberdeen-ai-hallucinated-precedent", // 30 views (JA 6 + EN 24)
  "047-openclaw-agent-phishing", // 29 (JA)
  "005-noroboto-lying-fonts", // 16 (JA)
  "009-gtg1002-ai-orchestrated-espionage", // 13 (JA 7 + EN 6)
  "067-syscoin-bridge-spv-proof-parsing", // 9 (JA)
];
