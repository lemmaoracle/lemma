import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import {
  pillarLabel,
  categoryLabel,
} from "../../../../data/criticalBriefs.ts";
import { extractTldr } from "../../../../data/extractTldr.ts";

/**
 * Lemma Critical Brief RSS feed (Japanese).
 * Mirror: /critical/briefs/feed.xml for the English channel.
 */
export async function GET(context) {
  const all = await getCollection("critical-briefs");
  const items = [...all]
    .sort((a, b) => b.data.published.getTime() - a.data.published.getTime())
    .map((brief) => {
      const titleParts = brief.data.title.split(" — ");
      const subtitle =
        titleParts.length > 1 ? titleParts.slice(1).join(" — ") : "";
      const description = extractTldr(brief.body, 500) || subtitle || "";
      return {
        title: brief.data.title,
        pubDate: brief.data.published,
        description,
        link: `/ja/critical/briefs/${brief.id}/`,
        categories: [
          pillarLabel(brief.data.pillar, "ja"),
          categoryLabel(brief.data.primary_category, "ja"),
        ],
      };
    });

  return rss({
    title: "Lemma Critical Brief",
    description:
      "Lemma が発行する構造的事案分析の reference 集。各 Brief は failure primitive と、検出側強化では埋まらない gap を構造化して論じる。",
    site: context.site,
    trailingSlash: false,
    items,
    customData: `
      <language>ja-jp</language>
      <copyright>${new Date().getFullYear()} Lemma / FRAME00, Inc.</copyright>
      <atom:link href="${new URL("ja/critical/briefs/feed.xml", context.site)}" rel="self" type="application/rss+xml" />
    `,
    stylesheet: "/rss/styles.xsl",
  });
}
