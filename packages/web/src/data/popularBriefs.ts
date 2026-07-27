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
 * Last updated from GA4 on 2026-07-27 — JA + EN Views combined per Brief, the two
 * index pages (/critical/briefs/) excluded. Window: trailing 90 days, which is
 * also everything GA4 still retains for this property (a 90-day and a
 * since-2026-01-01 query return identical totals). A 28-day window was
 * checked too but ranks on 11–17 views per Brief, which reorders week to week;
 * the 90-day window is used so the list stays stable between refreshes.
 */
export const POPULAR_BRIEF_SLUGS: ReadonlyArray<string> = [
  "047-openclaw-agent-phishing", // 37 views (JA 36 + EN 1)
  "011-synthid-watermark-reverse-engineering", // 36 (JA 4 + EN 32)
  "060-withers-aberdeen-ai-hallucinated-precedent", // 33 (JA 7 + EN 26)
  "005-noroboto-lying-fonts", // 22 (JA)
  "009-gtg1002-ai-orchestrated-espionage", // 19 (JA 9 + EN 10)
];
