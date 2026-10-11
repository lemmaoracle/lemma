import { getCollection } from "astro:content";
import type { BriefEntry } from "./criticalBriefs";

/**
 * Build a Brief-ID → EN-entry lookup for fallback resolution on EN routes.
 *
 * EN routes enumerate slugs from the JA `critical-briefs` collection (the
 * source of truth for which Brief numbers exist) and prefer the matching
 * entry from `critical-briefs-en` when one has been written. Routes that
 * have not yet been translated fall through to the JA body so the EN site
 * never 404s mid-rollout.
 *
 * Used by:
 *   - /critical/briefs/[slug].astro
 *   - /critical/briefs/pillar/[pillar].astro
 *   - /critical/briefs/category/[category].astro
 *   - /critical/briefs/feed.xml.js
 */
export async function getEnBriefMap(): Promise<Map<string, BriefEntry>> {
  // `astro:content` types resolve to `any` outside the generated
  // `.astro/types.d.ts` (not in this package's tsconfig include) — assert
  // the real entry shape mirrored in `BriefEntry` (content.config.ts schema).
  const enBriefs = (await getCollection("critical-briefs-en")) as BriefEntry[];
  return new Map(enBriefs.map((b) => [b.id, b]));
}
