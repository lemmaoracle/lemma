/**
 * Blog post dynamic OG image generator (1200×630) — v2 unified.
 *
 * Common artboard primitives (padding / wordmark / title / accent
 * rule) live in `ogBase.ts` and are shared with the other 7 OG
 * generators. Per-surface variables for the blog: top-right is the
 * `{CATEGORY} · {DATE}` strip (Announcements gets a pill treatment),
 * background is the post cover + brown vertical overlay.
 */
import type { BlogPost } from "../data/blog";
import {
  BROWN,
  BROWN_LIGHT,
  CREAM_DEEP,
  buildOgArtboard,
  fetchCoverAsDataUri,
  formatDate,
  makeTopRightLabel,
  renderOgPng,
} from "./ogBase";

type CategoryKey = "Industry" | "Solutions" | "Technical" | "Announcements" | "Essays";

interface CategoryStyle {
  readonly overlay: { top: string; mid: string; bottom: string };
  readonly labelColor: string;
  readonly labelPill: boolean;
  readonly pillBg?: string;
  readonly pillFg?: string;
}

const CATEGORY: Record<string, CategoryStyle> = {
  Industry: {
    overlay: {
      top: "rgba(43,30,18,0.45)",
      mid: "rgba(43,30,18,0.78)",
      bottom: "rgba(26,22,18,0.92)",
    },
    labelColor: BROWN_LIGHT,
    labelPill: false,
  },
  Solutions: {
    overlay: {
      top: "rgba(70,40,18,0.45)",
      mid: "rgba(70,40,18,0.80)",
      bottom: "rgba(40,24,12,0.92)",
    },
    labelColor: "#F5DDB8",
    labelPill: false,
  },
  Technical: {
    overlay: {
      top: "rgba(20,15,10,0.55)",
      mid: "rgba(20,15,10,0.86)",
      bottom: "rgba(10,8,6,0.95)",
    },
    labelColor: BROWN_LIGHT,
    labelPill: false,
  },
  Announcements: {
    overlay: {
      top: "rgba(43,30,18,0.45)",
      mid: "rgba(43,30,18,0.78)",
      bottom: "rgba(26,22,18,0.92)",
    },
    labelColor: BROWN_LIGHT,
    labelPill: true,
    pillBg: BROWN_LIGHT,
    pillFg: "#6B340E",
  },
  Essays: {
    overlay: {
      top: "rgba(43,30,18,0.45)",
      mid: "rgba(43,30,18,0.78)",
      bottom: "rgba(26,22,18,0.92)",
    },
    labelColor: BROWN_LIGHT,
    labelPill: false,
  },
};

function buildTopRight(categoryKey: string, date: string, isFallback: boolean) {
  const c = CATEGORY[categoryKey as CategoryKey] ?? CATEGORY.Industry;
  const text = `${categoryKey.toUpperCase()} · ${formatDate(date)}`;
  if (c.labelPill && !isFallback) {
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
          color: c.pillFg ?? BROWN,
          background: c.pillBg ?? BROWN_LIGHT,
          padding: "6px 16px",
          borderRadius: 999,
        },
        children: text,
      },
    };
  }
  return makeTopRightLabel(text, isFallback ? BROWN : c.labelColor);
}

export async function renderBlogOg(post: BlogPost): Promise<Buffer> {
  const coverDataUri = await fetchCoverAsDataUri(post.cover);
  const c = CATEGORY[post.category as CategoryKey] ?? CATEGORY.Industry;
  const node = buildOgArtboard({
    title: post.title,
    topRight: buildTopRight(post.category, post.date, coverDataUri === null),
    background: {
      kind: "cover",
      coverDataUri,
      overlay: c.overlay,
      fallback: { kind: "solid", color: CREAM_DEEP },
    },
  });
  return renderOgPng(node);
}
