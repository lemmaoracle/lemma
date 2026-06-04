/**
 * Blog post dynamic OG image generator (1200×630).
 *
 * Companion to `criticalBriefImage.ts`. Same Satori + Resvg pipeline,
 * different artboard: cover photo as full-bleed background with a
 * vertical saddle-brown gradient overlay, Lemma wordmark + category /
 * date in the top row, large Sora title bottom-left over a brown-light
 * accent rule. URL is intentionally omitted from the artboard.
 *
 * The category drives the overlay tint + the label treatment (a pill
 * for `Announcements`, plain mono uppercase otherwise). Posts without
 * a `cover` field (or whose cover fetch fails) fall through to a
 * cream-deep solid-colour fallback that swaps every text colour to
 * dark-on-light so the page still reads.
 *
 * Pre-rendered at build time by
 * `src/pages/og/blog/[lang]/[slug].png.ts` — one PNG per (locale × post)
 * pair, shipped as a static asset.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import type { BlogPost } from "../data/blog";
import { LEMMA_LOGO_PATHS } from "./lemmaWordmark";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const CWD = process.cwd();
const jaRegular = readFileSync(resolve(CWD, "src/assets/fonts/NotoSansJP-Regular.otf"));
const jaBold = readFileSync(resolve(CWD, "src/assets/fonts/NotoSansJP-Bold.otf"));
const soraBold = readFileSync(
  resolve(CWD, "node_modules/@fontsource/sora/files/sora-latin-700-normal.woff"),
);
const spaceMonoRegular = readFileSync(
  resolve(CWD, "node_modules/@fontsource/space-mono/files/space-mono-latin-400-normal.woff"),
);

/* Font fallback order matters: Satori tries the first match for each
   glyph, so Latin glyphs come from Sora 700 / Space Mono 400 and JA
   glyphs fall through to Noto Sans JP. Headlines map to family
   "Display" with weight 700 (resolves to Sora for Latin, NotoSansJP
   Bold for JA). Mono labels map to "Mono" weight 400. */
const SATORI_FONTS = [
  { name: "Display", data: soraBold, weight: 700 as const, style: "normal" as const },
  { name: "Display", data: jaBold, weight: 700 as const, style: "normal" as const },
  { name: "Mono", data: spaceMonoRegular, weight: 400 as const, style: "normal" as const },
  { name: "Mono", data: jaRegular, weight: 400 as const, style: "normal" as const },
  { name: "Body", data: jaRegular, weight: 400 as const, style: "normal" as const },
];

/* Category accent palette. Industry / Solutions / Technical /
   Announcements pull from the spec's per-category table; anything
   else falls back to the Industry treatment. */
type CategoryKey = "Industry" | "Solutions" | "Technical" | "Announcements" | "Essays";

interface CategoryStyle {
  readonly overlay: string;
  readonly labelColor: string;
  readonly labelPill: boolean;
  readonly pillBg?: string;
  readonly pillFg?: string;
}

const CATEGORY: Record<string, CategoryStyle> = {
  Industry: {
    overlay:
      "linear-gradient(180deg, rgba(43,30,18,0.45) 0%, rgba(43,30,18,0.78) 60%, rgba(26,22,18,0.92) 100%)",
    labelColor: "#F5EBDC",
    labelPill: false,
  },
  Solutions: {
    overlay:
      "linear-gradient(180deg, rgba(70,40,18,0.45) 0%, rgba(70,40,18,0.80) 60%, rgba(40,24,12,0.92) 100%)",
    labelColor: "#F5DDB8",
    labelPill: false,
  },
  Technical: {
    overlay:
      "linear-gradient(180deg, rgba(20,15,10,0.55) 0%, rgba(20,15,10,0.86) 60%, rgba(10,8,6,0.95) 100%)",
    labelColor: "#F5EBDC",
    labelPill: false,
  },
  Announcements: {
    overlay:
      "linear-gradient(180deg, rgba(43,30,18,0.45) 0%, rgba(43,30,18,0.78) 60%, rgba(26,22,18,0.92) 100%)",
    labelColor: "#F5EBDC",
    labelPill: true,
    pillBg: "#F5EBDC",
    pillFg: "#6B340E",
  },
  Essays: {
    overlay:
      "linear-gradient(180deg, rgba(43,30,18,0.45) 0%, rgba(43,30,18,0.78) 60%, rgba(26,22,18,0.92) 100%)",
    labelColor: "#F5EBDC",
    labelPill: false,
  },
};

const CREAM = "#FCFAF5";
const BROWN = "#8B4513";
const BROWN_LIGHT = "#F5EBDC";
const CREAM_DEEP = "#F2EEDF";
const BLACK = "#000";

/** Adaptive title size per dev-spec §"Auto-shrink ロジック". */
function pickTitleFont(text: string): { size: number; lineHeight: number; maxWidth: number } {
  const lines = text.split(/\n/);
  const maxLine = Math.max(...lines.map((l) => [...l].length));
  if (lines.length <= 2 && maxLine <= 14) return { size: 80, lineHeight: 1.08, maxWidth: 1010 };
  if (lines.length <= 3 && maxLine <= 22) return { size: 68, lineHeight: 1.08, maxWidth: 1010 };
  return { size: 56, lineHeight: 1.12, maxWidth: 1040 };
}

/* Date arrives as "2026.05.07" or "2026-05-28" — normalise to the
   former for the OG strip. */
function normaliseDate(raw: string): string {
  return raw.replace(/-/g, ".");
}

async function fetchCoverAsDataUri(url: string | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const ct =
      res.headers.get("content-type") ?? (url.endsWith(".png") ? "image/png" : "image/jpeg");
    return `data:${ct};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

interface BlogOgInput {
  readonly title: string;
  readonly category: string;
  readonly date: string;
  readonly coverDataUri: string | null;
}

function buildOgNode(input: BlogOgInput) {
  const category = CATEGORY[input.category as CategoryKey] ?? CATEGORY.Industry;
  const fallback = input.coverDataUri === null;
  const titleStyle = pickTitleFont(input.title);

  const logoColor = fallback ? BLACK : CREAM;
  const metaColor = fallback ? BROWN : category.labelColor;
  const titleColor = fallback ? BLACK : CREAM;
  const ruleColor = fallback ? BROWN : BROWN_LIGHT;

  const metaText = `${input.category.toUpperCase()} · ${normaliseDate(input.date)}`;

  const headerRow = {
    type: "div",
    props: {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      },
      children: [
        {
          type: "svg",
          props: {
            width: 78,
            height: 36,
            viewBox: "0 0 142 65",
            xmlns: "http://www.w3.org/2000/svg",
            children: LEMMA_LOGO_PATHS.map((d) => ({
              type: "path",
              props: { d, fill: logoColor },
            })),
          },
        },
        category.labelPill
          ? {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "Mono",
                  fontSize: 17,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: category.pillFg ?? BROWN,
                  background: category.pillBg ?? BROWN_LIGHT,
                  padding: "6px 16px",
                  borderRadius: 999,
                },
                children: metaText,
              },
            }
          : {
              type: "div",
              props: {
                style: {
                  fontFamily: "Mono",
                  fontSize: 18,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  fontWeight: 400,
                  color: metaColor,
                },
                children: metaText,
              },
            },
      ],
    },
  };

  const titleBlock = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 28,
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              fontFamily: "Display",
              fontWeight: 700,
              fontSize: titleStyle.size,
              lineHeight: titleStyle.lineHeight,
              letterSpacing: "-0.03em",
              color: titleColor,
              maxWidth: titleStyle.maxWidth,
            },
            children: input.title,
          },
        },
        {
          type: "div",
          props: {
            style: {
              width: 90,
              height: 4,
              background: ruleColor,
              borderRadius: 2,
            },
          },
        },
      ],
    },
  };

  const layers: Array<unknown> = [];

  if (!fallback && input.coverDataUri) {
    layers.push({
      type: "img",
      props: {
        src: input.coverDataUri,
        width: OG_WIDTH,
        height: OG_HEIGHT,
        style: {
          position: "absolute",
          inset: 0,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          objectFit: "cover",
        },
      },
    });
    layers.push({
      type: "div",
      props: {
        style: {
          position: "absolute",
          inset: 0,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          background: category.overlay,
        },
      },
    });
  }

  layers.push({
    type: "div",
    props: {
      style: {
        position: "relative",
        width: OG_WIDTH,
        height: OG_HEIGHT,
        padding: "56px 64px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      },
      children: [headerRow, titleBlock],
    },
  });

  return {
    type: "div",
    props: {
      style: {
        position: "relative",
        width: OG_WIDTH,
        height: OG_HEIGHT,
        background: fallback ? CREAM_DEEP : "#1a1612",
        display: "flex",
        fontFamily: "Body",
      },
      children: layers,
    },
  };
}

export async function renderBlogOg(post: BlogPost): Promise<Buffer> {
  const coverDataUri = await fetchCoverAsDataUri(post.cover);
  const svg = await satori(buildOgNode({
    title: post.title,
    category: post.category,
    date: post.date,
    coverDataUri,
  }), {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: SATORI_FONTS,
  });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } });
  return resvg.render().asPng();
}
