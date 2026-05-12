/**
 * Navigation segment URLs.
 *
 * Phase 1: the three enterprise segments (Civic / Critical / Compliance) all
 * point to anchors on the Pricing page, which already carries per-segment
 * detail. Phase 2 will replace these with dedicated `/services/<segment>/`
 * pages — at that point this file is the single edit needed.
 */

import type { Locale } from "../i18n/translations";

export type SegmentSlug = "civic" | "critical" | "compliance";

export const SEGMENT_URLS: Readonly<
  Record<SegmentSlug, Readonly<Record<Locale, string>>>
> = {
  civic: {
    ja: "/ja/pricing/#civic",
    en: "/pricing/#civic",
  },
  critical: {
    ja: "/ja/pricing/#critical",
    en: "/pricing/#critical",
  },
  compliance: {
    ja: "/ja/pricing/#compliance",
    en: "/pricing/#compliance",
  },
} as const;

/** Plan-card order on the Pricing page maps to these segment ids. */
export const PRICING_PLAN_ANCHORS: ReadonlyArray<SegmentSlug> = [
  "civic",
  "critical",
  "compliance",
] as const;
