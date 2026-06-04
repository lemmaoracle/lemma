/**
 * Shared OG artboard primitives for the dynamic Lemma OG generators
 * (Blog v2 and Critical Brief v2).
 *
 * Same canvas, same padding, same wordmark / title / accent rule
 * positions across both surfaces — the only per-surface variables are
 * the **top-right label** (category vs. CRITICAL BRIEF · №XXX · date),
 * the **overlay gradient stops** (Blog is editorial-lighter, Brief is
 * analytical-darker), and the fallback / cover treatment of the
 * background.
 *
 * Per the v2 dev spec: title is Sora 700 with auto-shrink 80 / 68 /
 * 56 px, padding 56/64, wordmark 36 px top-left, accent rule 90×4
 * bottom-left, URL omitted from the canvas.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { LEMMA_LOGO_PATHS } from "./lemmaWordmark";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/* ── Brand palette (matches v28 tokens) ─────────────────────────── */
export const CREAM = "#FCFAF5";
export const CREAM_DEEP = "#F2EEDF";
export const BROWN = "#8B4513";
export const BROWN_LIGHT = "#F5EBDC";
export const BLACK = "#000";

/* ── Fonts loaded once on module init (build-time only) ─────────── */
const cwd = process.cwd();
const jaRegular = readFileSync(resolve(cwd, "src/assets/fonts/NotoSansJP-Regular.otf"));
const jaMedium = readFileSync(resolve(cwd, "src/assets/fonts/NotoSansJP-Medium.otf"));
const jaBold = readFileSync(resolve(cwd, "src/assets/fonts/NotoSansJP-Bold.otf"));
const soraBold = readFileSync(
  resolve(cwd, "node_modules/@fontsource/sora/files/sora-latin-700-normal.woff"),
);
const spaceMonoRegular = readFileSync(
  resolve(cwd, "node_modules/@fontsource/space-mono/files/space-mono-latin-400-normal.woff"),
);

/* Font fallback order matters: Satori tries each match per glyph, so
   Latin glyphs come from Sora 700 / Space Mono 400 and JA glyphs fall
   through to Noto Sans JP. Display 700 resolves to Sora for Latin,
   NotoSansJP Bold for JA. Mono 400 / 500 / 700 are all backed by
   Space Mono on Latin and Noto Sans JP weights on JA so the Brief
   top-right label can vary `fontWeight` segment-by-segment. */
export const SATORI_FONTS = [
  { name: "Display", data: soraBold, weight: 700 as const, style: "normal" as const },
  { name: "Display", data: jaBold, weight: 700 as const, style: "normal" as const },
  { name: "Mono", data: spaceMonoRegular, weight: 400 as const, style: "normal" as const },
  { name: "Mono", data: jaRegular, weight: 400 as const, style: "normal" as const },
  { name: "Mono", data: jaMedium, weight: 500 as const, style: "normal" as const },
  { name: "Mono", data: jaBold, weight: 700 as const, style: "normal" as const },
  { name: "Body", data: jaRegular, weight: 400 as const, style: "normal" as const },
];

/** Auto-shrink the title per the v2 dev spec. */
export function pickTitleFont(text: string): {
  size: number;
  lineHeight: number;
  maxWidth: number;
} {
  const lines = text.split(/\n/);
  const maxLine = Math.max(...lines.map((l) => [...l].length));
  if (lines.length <= 2 && maxLine <= 14) return { size: 80, lineHeight: 1.08, maxWidth: 1010 };
  if (lines.length <= 3 && maxLine <= 22) return { size: 68, lineHeight: 1.08, maxWidth: 1010 };
  return { size: 56, lineHeight: 1.12, maxWidth: 1040 };
}

/** "2026-05-28" or Date → "2026.05.28". */
export function formatDate(raw: string | Date): string {
  const s = typeof raw === "string" ? raw : raw.toISOString().slice(0, 10);
  return s.replace(/-/g, ".");
}

/** Download a cover image at build time and inline it as a base64 data
 *  URI so Satori can paint it without making the network call itself. */
export async function fetchCoverAsDataUri(url: string | undefined): Promise<string | null> {
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

export interface OgOverlayGradient {
  /** Top stop, e.g. "rgba(35,22,12,0.55)". */
  readonly top: string;
  /** 60% stop. */
  readonly mid: string;
  /** Bottom stop. */
  readonly bottom: string;
}

export interface OgArtboardInput {
  readonly title: string;
  readonly topRight: unknown;
  readonly coverDataUri: string | null;
  readonly overlay: OgOverlayGradient;
  /** Background colour when the cover is present (sits under the
   *  overlay, only visible if the cover happens to be transparent). */
  readonly fillWithCover?: string;
}

/** Common artboard layout shared by Blog v2 and Brief v2. */
export function buildOgArtboard(input: OgArtboardInput) {
  const fallback = input.coverDataUri === null;
  const t = pickTitleFont(input.title);

  const logoColor = fallback ? BLACK : CREAM;
  const titleColor = fallback ? BLACK : CREAM;
  const ruleColor = fallback ? BROWN : BROWN_LIGHT;

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
          background: `linear-gradient(180deg, ${input.overlay.top} 0%, ${input.overlay.mid} 60%, ${input.overlay.bottom} 100%)`,
        },
      },
    });
  }

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
        input.topRight,
      ],
    },
  };

  const titleBlock = {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", gap: 28 },
      children: [
        {
          type: "div",
          props: {
            style: {
              fontFamily: "Display",
              fontWeight: 700,
              fontSize: t.size,
              lineHeight: t.lineHeight,
              letterSpacing: "-0.03em",
              color: titleColor,
              maxWidth: t.maxWidth,
            },
            children: input.title,
          },
        },
        {
          type: "div",
          props: {
            style: { width: 90, height: 4, background: ruleColor, borderRadius: 2 },
          },
        },
      ],
    },
  };

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
        background: fallback ? CREAM_DEEP : (input.fillWithCover ?? "#1a1612"),
        display: "flex",
        fontFamily: "Body",
      },
      children: layers,
    },
  };
}

/** Render Satori → SVG → PNG. */
export async function renderOgPng(node: unknown): Promise<Buffer> {
  const svg = await satori(node, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: SATORI_FONTS,
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
}
