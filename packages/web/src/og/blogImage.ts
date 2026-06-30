/**
 * Blog post dynamic OG image generator (1200×630) — v2 unified.
 *
 * Common artboard primitives (padding / wordmark / title / accent
 * rule) live in `ogBase.ts` and are shared with the other 7 OG
 * generators.
 *
 * Cover treatment: the per-category cover is now a fixed, brand-designed
 * banner (a light cream field up top, a coloured wave along the bottom).
 * The old heavy brown gradient buried that banner, so we keep it visible
 * and lay only a faint scrim over the bottom strip — just enough for the
 * accent rule + tagline to read over the wave. Text is dark-on-light, and
 * the bottom-right brand tagline matches the other surfaces.
 */
import type { BlogPost } from "../data/blog";
import {
  BLACK,
  BROWN,
  BROWN_LIGHT,
  CREAM,
  CREAM_DEEP,
  buildOgArtboard,
  fetchCoverAsDataUri,
  formatDate,
  makeBottomTagline,
  makeTopRightLabel,
  renderOgPng,
} from "./ogBase";

/** Categories whose top-right label gets the filled-pill emphasis. */
const PILL_CATEGORIES = new Set(["Announcements"]);

/** Brand sign-off rendered bottom-right on every card. */
const TAGLINE = "Built for decisions that matter";

/**
 * Faint scrim laid only over the bottom strip of the banner (transparent
 * for the top ~60%, easing to a soft dark at the very bottom). Keeps the
 * banner art visible while giving the footer (accent rule + tagline) just
 * enough contrast over the coloured wave.
 */
const BOTTOM_SCRIM = {
  top: "rgba(26,22,18,0)",
  mid: "rgba(26,22,18,0)",
  bottom: "rgba(26,22,18,0.42)",
};

function buildTopRight(categoryKey: string, date: string, isFallback: boolean) {
  const text = `${categoryKey.toUpperCase()} · ${formatDate(date)}`;
  if (PILL_CATEGORIES.has(categoryKey) && !isFallback) {
    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          alignItems: "center",
          fontFamily: "Mono",
          fontSize: 16,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: CREAM,
          background: BROWN,
          padding: "6px 16px",
          borderRadius: 999,
        },
        children: text,
      },
    };
  }
  return makeTopRightLabel(text, BROWN);
}

export async function renderBlogOg(post: BlogPost): Promise<Buffer> {
  const coverDataUri = await fetchCoverAsDataUri(post.cover);
  const isFallback = coverDataUri === null;
  const node = buildOgArtboard({
    title: post.title,
    // Dark-on-light: the banner's title zone is a light cream field.
    titleColorOverride: BLACK,
    topRight: buildTopRight(post.category, post.date, isFallback),
    // On a cover the footer sits on the dark bottom scrim → light tagline;
    // on the cream fallback there is no scrim → dark tagline.
    bottomTagline: makeBottomTagline(TAGLINE, isFallback ? BROWN : BROWN_LIGHT),
    background: {
      kind: "cover",
      coverDataUri,
      overlay: BOTTOM_SCRIM,
      fallback: { kind: "solid", color: CREAM_DEEP },
    },
  });
  return renderOgPng(node);
}
