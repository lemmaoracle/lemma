import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import {
  pillarLabel,
  categoryLabel,
} from "../../../data/criticalBriefs.ts";
import { extractTldr } from "../../../data/extractTldr.ts";

/**
 * Lemma Critical Brief RSS feed (English).
 * Mirror: /ja/critical/briefs/feed.xml for the Japanese channel.
 *
 * Items are sorted by `published` descending. The item description is
 * the TL;DR snippet (cap ~500 chars for RSS readers), falling back to
 * the Brief subtitle if the body has no TL;DR section.
 */
export async function GET(context) {
  const all = await getCollection("critical-briefs");
  const items = [...all]
    .sort((a, b) => b.data.published.getTime() - a.data.published.getTime())
    .map((brief) => {
      const titleParts = brief.data.title_en.split(" — ");
      const subtitle =
        titleParts.length > 1 ? titleParts.slice(1).join(" — ") : "";
      const description = extractTldr(brief.body, 500) || subtitle || "";
      return {
        title: brief.data.title_en,
        pubDate: brief.data.published,
        description,
        link: `/critical/briefs/${brief.id}/`,
        categories: [
          pillarLabel(brief.data.pillar, "en"),
          categoryLabel(brief.data.primary_category, "en"),
        ],
      };
    });

  return rss({
    title: "Lemma Critical Brief",
    description:
      "Structured incident-analysis reference collection from Lemma Oracle. Each Brief examines a failure primitive and the gap that strengthening detection alone cannot close.",
    site: context.site,
    trailingSlash: false,
    items,
    customData: `
      <language>en-us</language>
      <copyright>${new Date().getFullYear()} Lemma Oracle / FRAME00, Inc.</copyright>
      <atom:link href="${new URL("critical/briefs/feed.xml", context.site)}" rel="self" type="application/rss+xml" />
    `,
    stylesheet: "/rss/styles.xsl",
  });
}
