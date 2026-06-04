/**
 * Critical Brief dynamic OG image generator (1200×630) — v2.
 *
 * Brief OGP v2 aligns the artboard with the Blog v2 generator: the
 * shared `ogBase.ts` owns padding (56/64), wordmark (36 px top-left),
 * title typography (Sora 700, auto-shrink 80/68/56), and the
 * brown-light 90×4 accent rule bottom-left. Brief identity is kept
 * via a brief-specific top-right label —
 * `CRITICAL BRIEF · №XXX · YYYY.MM.DD` — rendered as three Space Mono
 * segments with descending weights (700 / 500 / 400) so the series
 * tag carries the most visual weight.
 *
 * Cover handling matches the blog: when `cover` is set in the brief
 * frontmatter we fetch it at build time and inline as base64, then
 * paint the slightly darker Brief overlay ramp on top. When `cover`
 * is missing (the default for every existing brief), the artboard
 * falls back to cream-deep + dark-on-light text — same layout, no
 * overlay.
 *
 * Headline source priority unchanged: `og_lead_*` first, otherwise
 * the descriptive half of `title` / `title_en`.
 */
import type { CollectionEntry } from "astro:content";
import type { Locale } from "../i18n/translations";
import {
  BROWN,
  BROWN_LIGHT,
  buildOgArtboard,
  fetchCoverAsDataUri,
  formatDate,
  renderOgPng,
} from "./ogBase";

type BriefEntry =
  | CollectionEntry<"critical-briefs">
  | CollectionEntry<"critical-briefs-en">;

const SERIES_LABEL = "CRITICAL BRIEF";

/* Brief overlay sits slightly darker than the Blog one — analytical
   trumps editorial here. Values match the v2 dev spec table. */
const BRIEF_OVERLAY = {
  top: "rgba(35,22,12,0.55)",
  mid: "rgba(35,22,12,0.82)",
  bottom: "rgba(20,14,8,0.94)",
};

/**
 * Extract the descriptive lead from a brief title. Same logic as the
 * v1 generator — brief titles split on " — " into a codename half and
 * a descriptive half; we want the descriptive half on the artboard.
 */
function extractHeadline(brief: BriefEntry, locale: Locale): string {
  const lead = locale === "ja" ? brief.data.og_lead_ja : brief.data.og_lead_en;
  if (lead) {
    const parts = lead.split(" — ");
    return parts.length > 1 ? parts.slice(0, -1).join(" — ") : lead;
  }
  const raw = locale === "ja" ? brief.data.title : brief.data.title_en;
  const parts = raw.split(" — ");
  if (parts.length === 1) return raw;
  return parts.reduce((a, b) => (b.length > a.length ? b : a));
}

function buildTopRight(brief: BriefEntry, isFallback: boolean) {
  const briefNo = String(brief.data.brief_no).padStart(3, "0");
  const date = formatDate(brief.data.published);
  const baseColor = isFallback ? BROWN : BROWN_LIGHT;
  const sep = {
    type: "div",
    props: {
      style: { color: baseColor, opacity: 0.55, padding: "0 2px" },
      children: "·",
    },
  };
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "Mono",
        fontSize: 17,
        letterSpacing: 3.8,
        textTransform: "uppercase",
        color: baseColor,
      },
      children: [
        {
          type: "div",
          props: { style: { fontWeight: 700 }, children: SERIES_LABEL },
        },
        sep,
        {
          type: "div",
          props: { style: { fontWeight: 500 }, children: `№${briefNo}` },
        },
        sep,
        {
          type: "div",
          props: { style: { fontWeight: 400 }, children: date },
        },
      ],
    },
  };
}

export async function renderCriticalBriefOg(
  brief: BriefEntry,
  locale: Locale,
): Promise<Buffer> {
  const coverDataUri = await fetchCoverAsDataUri(brief.data.cover);
  const node = buildOgArtboard({
    title: extractHeadline(brief, locale),
    topRight: buildTopRight(brief, coverDataUri === null),
    coverDataUri,
    overlay: BRIEF_OVERLAY,
  });
  return renderOgPng(node);
}
