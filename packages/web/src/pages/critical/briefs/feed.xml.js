import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import {
  pillarLabel,
  categoryLabel,
} from "../../../data/criticalBriefs.ts";
import { extractTldr } from "../../../data/extractTldr.ts";
import { getEnBriefMap } from "../../../data/getEnBriefMap.ts";

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
  const enById = await getEnBriefMap();
  const items = [...all]
    .sort((a, b) => b.data.published.getTime() - a.data.published.getTime())
    .map((jaBrief) => {
      // Prefer EN body for item description when an EN translation exists.
      const brief = enById.get(jaBrief.id) ?? jaBrief;
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

  // `/rss/styles.xsl` は channel の <lastBuildDate> を「Updated:」として出す。
  // 無いとラベルだけが空で残るので入れる。値はビルド時刻ではなく最新記事の
  // 日付にする——ビルドのたびに変わる値だと、中身が同じでも更新に見える。
  const lastBuildDate = items[0] ? items[0].pubDate.toUTCString() : undefined;

  return rss({
    title: "Lemma Critical Brief",
    description:
      "Structured incident-analysis reference collection from Lemma. Each Brief examines a failure primitive and the gap that strengthening detection alone cannot close.",
    site: context.site,
    trailingSlash: false,
    items,
    // customData の <atom:link rel="self"> は atom 接頭辞を使うので、ここで
    // 名前空間を宣言する。無いと <rss> に xmlns:atom が出ず、厳格な XML
    // パーサ（W3C Feed Validator 等）がフィード全体を弾く。
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `
      <language>en-us</language>
      ${lastBuildDate ? `<lastBuildDate>${lastBuildDate}</lastBuildDate>` : ""}
      <copyright>${new Date().getFullYear()} Lemma / FRAME00, Inc.</copyright>
      <atom:link href="${new URL("critical/briefs/feed.xml", context.site)}" rel="self" type="application/rss+xml" />
    `,
    stylesheet: "/rss/styles.xsl",
  });
}
