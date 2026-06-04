/**
 * Blog post dynamic OG image generator (1200×630) — v2.
 *
 * Common artboard primitives (padding / wordmark / title / accent
 * rule) live in `ogBase.ts` and are shared with the Critical Brief
 * v2 generator. The only blog-specific pieces are the **category
 * label** rendered top-right (with `Announcements` opting into a
 * pill treatment) and the **overlay gradient stops** — Blog is the
 * lighter editorial ramp, Brief is the darker analytical ramp.
 */
import type { BlogPost } from "../data/blog";
import {
  BROWN,
  BROWN_LIGHT,
  buildOgArtboard,
  fetchCoverAsDataUri,
  formatDate,
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

/* Per-category overlay tints + label treatments. Industry / Solutions
   / Technical follow the v2 dev spec ramps; Essays falls back to
   Industry. Announcements gets a pill label. */
const CATEGORY: Record<string, CategoryStyle> = {
  Industry: {
    overlay: {
      top: "rgba(43,30,18,0.45)",
      mid: "rgba(43,30,18,0.78)",
      bottom: "rgba(26,22,18,0.92)",
    },
    labelColor: "#F5EBDC",
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
    labelColor: "#F5EBDC",
    labelPill: false,
  },
  Announcements: {
    overlay: {
      top: "rgba(43,30,18,0.45)",
      mid: "rgba(43,30,18,0.78)",
      bottom: "rgba(26,22,18,0.92)",
    },
    labelColor: "#F5EBDC",
    labelPill: true,
    pillBg: "#F5EBDC",
    pillFg: "#6B340E",
  },
  Essays: {
    overlay: {
      top: "rgba(43,30,18,0.45)",
      mid: "rgba(43,30,18,0.78)",
      bottom: "rgba(26,22,18,0.92)",
    },
    labelColor: "#F5EBDC",
    labelPill: false,
  },
};

function buildTopRight(
  categoryKey: string,
  date: string,
  isFallback: boolean,
) {
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
          fontSize: 17,
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
  return {
    type: "div",
    props: {
      style: {
        fontFamily: "Mono",
        fontSize: 18,
        letterSpacing: 4,
        textTransform: "uppercase",
        fontWeight: 400,
        color: isFallback ? BROWN : c.labelColor,
      },
      children: text,
    },
  };
}

export async function renderBlogOg(post: BlogPost): Promise<Buffer> {
  const coverDataUri = await fetchCoverAsDataUri(post.cover);
  const c = CATEGORY[post.category as CategoryKey] ?? CATEGORY.Industry;
  const node = buildOgArtboard({
    title: post.title,
    topRight: buildTopRight(post.category, post.date, coverDataUri === null),
    coverDataUri,
    overlay: c.overlay,
  });
  return renderOgPng(node);
}
