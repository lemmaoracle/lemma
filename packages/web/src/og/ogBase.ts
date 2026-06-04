/**
 * Shared OG artboard primitives for the unified Lemma OG generator
 * (Phase 0 + 1 + 2 per the v2 dev spec).
 *
 * Single base + 8 thin wrapper renderers:
 *   - Homepage / Seal / Trust402 / Industries / Pricing / Pillars
 *   - Blog (per-post) / Critical Brief (per-brief)
 *
 * Every artboard shares: 1200×630 canvas, 60/72 padding, Lemma
 * wordmark top-left at 52 px, Sora 700 auto-shrink H1 (100 / 84 / 68),
 * 96×5 brown accent rule bottom-left. Per-surface variables are the
 * top-right label, the bottom-right tagline, and the background
 * treatment (solid / gradient / cover photo + overlay).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { LEMMA_LOGO_PATHS } from "./lemmaWordmark";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/* ── Brand palette ──────────────────────────────────────────────── */
export const CREAM = "#FCFAF5";
export const CREAM_DEEP = "#F2EEDF";
export const CREAM_LIGHT = "#F8F4EA";
export const BROWN = "#8B4513";
export const BROWN_LIGHT = "#F5EBDC";
export const BLACK = "#000";

/* ── Fonts (build-time only) ────────────────────────────────────── */
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

export const SATORI_FONTS = [
  { name: "Display", data: soraBold, weight: 700 as const, style: "normal" as const },
  { name: "Display", data: jaBold, weight: 700 as const, style: "normal" as const },
  { name: "Mono", data: spaceMonoRegular, weight: 400 as const, style: "normal" as const },
  { name: "Mono", data: jaRegular, weight: 400 as const, style: "normal" as const },
  { name: "Mono", data: jaMedium, weight: 500 as const, style: "normal" as const },
  { name: "Mono", data: jaBold, weight: 700 as const, style: "normal" as const },
  { name: "Body", data: jaRegular, weight: 400 as const, style: "normal" as const },
];

/** Auto-shrink the title per the v2 dev spec — 100 / 84 / 68 px. */
export function pickTitleFont(text: string): {
  size: number;
  lineHeight: number;
  maxWidth: number;
} {
  const lines = text.split(/\n/);
  const maxLine = Math.max(...lines.map((l) => [...l].length));
  if (lines.length <= 2 && maxLine <= 14) return { size: 100, lineHeight: 1.08, maxWidth: 1010 };
  if (lines.length <= 3 && maxLine <= 22) return { size: 84, lineHeight: 1.08, maxWidth: 1040 };
  return { size: 68, lineHeight: 1.12, maxWidth: 1040 };
}

/** "2026-05-28" or Date → "2026.05.28". */
export function formatDate(raw: string | Date): string {
  const s = typeof raw === "string" ? raw : raw.toISOString().slice(0, 10);
  return s.replace(/-/g, ".");
}

/** Inline a remote cover image at build time as a base64 data URI. */
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

/**
 * Render a title string that may contain `<accent>…</accent>` segments
 * as a single line/box where the wrapped portion uses the accent
 * colour. Newlines become explicit line breaks (rendered as flex
 * column).
 */
function renderTitle(text: string, color: string, accent: string) {
  // Parse "before<accent>X</accent>after" → array of {text, accent: bool}
  const lineParser = /<accent>([\s\S]*?)<\/accent>/g;
  const lines = text.split(/\n/);
  return lines.map((line) => {
    const children: Array<unknown> = [];
    let cursor = 0;
    let m: RegExpExecArray | null;
    lineParser.lastIndex = 0;
    while ((m = lineParser.exec(line))) {
      if (m.index > cursor) {
        children.push({
          type: "span",
          props: { style: { color }, children: line.slice(cursor, m.index) },
        });
      }
      children.push({
        type: "span",
        props: { style: { color: accent }, children: m[1] },
      });
      cursor = m.index + m[0].length;
    }
    if (cursor < line.length) {
      children.push({
        type: "span",
        props: { style: { color }, children: line.slice(cursor) },
      });
    }
    if (!children.length) {
      children.push({ type: "span", props: { style: { color }, children: line } });
    }
    return {
      type: "div",
      props: {
        style: { display: "flex", flexDirection: "row", flexWrap: "wrap" },
        children,
      },
    };
  });
}

export type OgBackground =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; from: string; to: string }
  | {
      kind: "cover";
      coverDataUri: string | null;
      overlay: { top: string; mid: string; bottom: string };
      /** Optional explicit fallback when coverDataUri is null. */
      fallback?: { kind: "solid"; color: string };
    };

export interface OgArtboardInput {
  /** Title string; may contain `<accent>…</accent>` segments. Newlines split lines. */
  readonly title: string;
  /** Pre-built top-right element (a Satori vnode) — supplied by each wrapper. */
  readonly topRight?: unknown;
  /** Pre-built bottom-right tagline element — optional. */
  readonly bottomTagline?: unknown;
  readonly background: OgBackground;
  /** Override the H1 font picker (lets wrappers force a size when the spec demands it). */
  readonly titleFont?: { size: number; lineHeight: number; maxWidth: number };
  /** Override the title colour (e.g. force black on a cream gradient). */
  readonly titleColorOverride?: string;
}

interface ResolvedBackground {
  readonly isDark: boolean;
  readonly underlayColor: string;
  readonly hasCover: boolean;
  readonly coverDataUri?: string;
  readonly overlay?: { top: string; mid: string; bottom: string };
  readonly gradient?: { from: string; to: string };
}

function resolveBackground(bg: OgBackground): ResolvedBackground {
  if (bg.kind === "solid") {
    return { isDark: false, underlayColor: bg.color, hasCover: false };
  }
  if (bg.kind === "gradient") {
    return { isDark: false, underlayColor: bg.from, hasCover: false, gradient: { from: bg.from, to: bg.to } };
  }
  if (bg.coverDataUri) {
    return {
      isDark: true,
      underlayColor: "#1a1612",
      hasCover: true,
      coverDataUri: bg.coverDataUri,
      overlay: bg.overlay,
    };
  }
  const fb = bg.fallback ?? { kind: "solid" as const, color: CREAM_DEEP };
  return { isDark: false, underlayColor: fb.color, hasCover: false };
}

/** Common artboard layout shared by every wrapper. */
export function buildOgArtboard(input: OgArtboardInput) {
  const resolved = resolveBackground(input.background);
  const fg = input.titleColorOverride ?? (resolved.isDark ? CREAM : BLACK);
  const accent = resolved.isDark ? BROWN_LIGHT : BROWN;
  const titleAccent = resolved.isDark ? BROWN_LIGHT : BROWN;

  const t = input.titleFont ?? pickTitleFont(input.title);

  const layers: Array<unknown> = [];

  if (resolved.hasCover) {
    layers.push({
      type: "img",
      props: {
        src: resolved.coverDataUri!,
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
          background: `linear-gradient(180deg, ${resolved.overlay!.top} 0%, ${resolved.overlay!.mid} 60%, ${resolved.overlay!.bottom} 100%)`,
        },
      },
    });
  } else if (resolved.gradient) {
    layers.push({
      type: "div",
      props: {
        style: {
          position: "absolute",
          inset: 0,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          background: `linear-gradient(180deg, ${resolved.gradient.from} 0%, ${resolved.gradient.to} 100%)`,
        },
      },
    });
  }

  const headerRow = {
    type: "div",
    props: {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        width: "100%",
      },
      children: [
        {
          type: "svg",
          props: {
            width: 113,
            height: 52,
            viewBox: "0 0 142 65",
            xmlns: "http://www.w3.org/2000/svg",
            children: LEMMA_LOGO_PATHS.map((d) => ({
              type: "path",
              props: { d, fill: fg },
            })),
          },
        },
        input.topRight ?? { type: "div", props: { style: { width: 0 } } },
      ],
    },
  };

  const titleBlock = {
    type: "div",
    props: {
      style: {
        fontFamily: "Display",
        fontWeight: 700,
        fontSize: t.size,
        lineHeight: t.lineHeight,
        letterSpacing: "-0.03em",
        maxWidth: t.maxWidth,
        display: "flex",
        flexDirection: "column",
      },
      children: renderTitle(input.title, fg, titleAccent),
    },
  };

  const footerRow = {
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
          type: "div",
          props: {
            style: { width: 96, height: 5, background: accent, borderRadius: 2.5 },
          },
        },
        input.bottomTagline ?? { type: "div", props: { style: { width: 0 } } },
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
        padding: "60px 72px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      },
      children: [headerRow, titleBlock, footerRow],
    },
  });

  return {
    type: "div",
    props: {
      style: {
        position: "relative",
        width: OG_WIDTH,
        height: OG_HEIGHT,
        background: resolved.underlayColor,
        display: "flex",
        fontFamily: "Body",
      },
      children: layers,
    },
  };
}

/** Helper: top-right label as Space Mono uppercase strip. */
export function makeTopRightLabel(text: string, color: string) {
  return {
    type: "div",
    props: {
      style: {
        fontFamily: "Mono",
        fontSize: 17,
        letterSpacing: 4,
        textTransform: "uppercase",
        fontWeight: 400,
        color,
      },
      children: text,
    },
  };
}

/** Helper: bottom-right tagline as Space Mono uppercase. */
export function makeBottomTagline(text: string, color: string) {
  return {
    type: "div",
    props: {
      style: {
        fontFamily: "Mono",
        fontSize: 14.5,
        letterSpacing: 2.6,
        textTransform: "uppercase",
        fontWeight: 400,
        color,
      },
      children: text,
    },
  };
}

/** Satori → SVG → PNG. */
export async function renderOgPng(node: unknown): Promise<Buffer> {
  const svg = await satori(node, { width: OG_WIDTH, height: OG_HEIGHT, fonts: SATORI_FONTS });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
}

/* Standard gradient backgrounds used by the marketing-page wrappers. */
export const PRODUCT_GRADIENT: OgBackground = {
  kind: "gradient",
  from: CREAM_LIGHT,
  to: CREAM_DEEP,
};
