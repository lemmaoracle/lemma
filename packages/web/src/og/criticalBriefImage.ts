/**
 * Critical Brief dynamic OG image generator (1200×630) — v2 unified.
 *
 * Uses the shared `ogBase.ts` primitives. Brief identity is preserved
 * by the top-right strip:
 *
 *   CRITICAL BRIEF · №XXX · YYYY.MM.DD
 *   weight 700      500    400
 *
 * Brief overlay sits darker than Blog per the v2 spec (analytical
 * trumps editorial). When the brief has no `cover`, we fall through to
 * a cream-deep + dark-on-light layout — same composition.
 *
 * Headline source priority unchanged: `og_lead_*` first (with trailing
 * codename stripped), otherwise the descriptive half of `title` /
 * `title_en`.
 */
import type { CollectionEntry } from "astro:content";
import type { Locale } from "../i18n/translations";
import {
  BROWN,
  BROWN_LIGHT,
  CREAM_DEEP,
  buildOgArtboard,
  fetchCoverAsDataUri,
  formatDate,
  makeBottomTagline,
  renderOgPng,
} from "./ogBase";

type BriefEntry =
  | CollectionEntry<"critical-briefs">
  | CollectionEntry<"critical-briefs-en">;

const SERIES_LABEL = "CRITICAL BRIEF";

/** Brand sign-off rendered bottom-right on every Brief card. */
const TAGLINE = "Built for decisions that matter";

/**
 * OG image visual headline. Prefer the dedicated short `og_headline_*`
 * (concrete, incident-specific hook; supports `\n` + `<accent>`), and
 * fall back to the shortened `og_lead_*` / `title` via `extractHeadline`.
 */
function pickHeadline(brief: BriefEntry, locale: Locale): string {
  const head =
    locale === "ja" ? brief.data.og_headline_ja : brief.data.og_headline_en;
  return head ?? extractHeadline(brief, locale);
}

const BRIEF_OVERLAY = {
  top: "rgba(35,22,12,0.55)",
  mid: "rgba(35,22,12,0.82)",
  bottom: "rgba(20,14,8,0.94)",
};

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
          props: { style: { fontWeight: 500 }, children: `No.${briefNo}` },
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
  const isFallback = coverDataUri === null;
  const node = buildOgArtboard({
    title: pickHeadline(brief, locale),
    topRight: buildTopRight(brief, isFallback),
    bottomTagline: makeBottomTagline(TAGLINE, isFallback ? BROWN : BROWN_LIGHT),
    background: {
      kind: "cover",
      coverDataUri,
      overlay: BRIEF_OVERLAY,
      fallback: { kind: "solid", color: CREAM_DEEP },
    },
  });
  return renderOgPng(node);
}
