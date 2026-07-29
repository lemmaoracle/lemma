/**
 * Shared OG artboard primitives for the unified Lemma OG generator
 * (Phase 0 + 1 + 2 per the v2 dev spec).
 *
 * Single base + 8 thin wrapper renderers:
 *   - Homepage / Seal / Trust402 / Industries / Pricing / Pillars
 *   - Blog (per-post) / Critical Brief (per-brief)
 *
 * Every artboard shares: 1200×630 canvas, 60/72 padding, Lemma
 * wordmark top-left at 66 px, Sora 700 auto-shrink H1 (100 / 84 / 68),
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

/**
 * 生のフォントデータ。**この共通アートボードに乗らない OG**（ブログの
 * 生成カバーのように、自前の SVG へ satori のテキストだけを重ねるもの）が
 * 独自のフォントセットを組めるように出しておく。
 */
export const OG_FONT_DATA = {
  jaRegular,
  jaMedium,
  jaBold,
  soraBold,
  spaceMonoRegular,
} as const;

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

/* ── Balanced title layout (opt-in via OgArtboardInput.balanceTitle) ──
 * When a surface supplies a purpose-built short title (e.g. a blog
 * post's `ogTitle`), we can do better than satori's greedy wrap. This
 * picks the largest font tier at which the title fits within the line
 * budget (auto-fit shrink), then inserts explicit line breaks chosen to
 * even the lines out. Balancing the line widths is what removes the
 * single-word "orphan" last line (e.g. a lone "showed") that greedy
 * wrapping leaves behind.
 *
 * This path is only taken when balanceTitle is set AND the title has no
 * manual "\n", no <accent> markup, and no titleFont override — so every
 * title that does NOT opt in renders byte-for-byte as before. */
const TITLE_TIERS = [
  { size: 100, lineHeight: 1.08, maxWidth: 1010, maxLines: 2 },
  { size: 84, lineHeight: 1.08, maxWidth: 1040, maxLines: 3 },
  { size: 68, lineHeight: 1.12, maxWidth: 1040, maxLines: 3 },
] as const;

/* Kana / CJK ideographs / full-width forms — glyphs that advance ~1em
 * and can break between any two of them (no spaces). */
const CJK_CHAR = /[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/;

/** Rough per-glyph advance (px) for the Sora / Noto 700 display face.
 * Deliberately a slight over-estimate (letter-spacing is negative, so
 * real widths are a touch tighter) — over-estimating keeps satori from
 * re-wrapping a line we already placed and re-introducing an orphan. */
function glyphAdvance(ch: string, size: number): number {
  if (ch === " ") return size * 0.3;
  if (CJK_CHAR.test(ch)) return size * 1.0;
  return size * 0.56;
}

function textWidth(text: string, size: number): number {
  let w = 0;
  for (const ch of text) w += glyphAdvance(ch, size);
  return w;
}

/* Japanese line-break preferences (light-touch kinsoku): break *before*
 * an opening bracket, and *after* a closing bracket or clause/sentence
 * punctuation — never in the middle of a 「…」 phrase. */
const CJK_OPEN = "「『（【〔《〈［｛“‘";
const CJK_BREAK_AFTER = "」』）】〕》〉］｝、。，．・！？：；”’…—";

/** Segment a space-free (CJK) title into break-safe chunks at punctuation
 * and bracket boundaries, so the balancer wraps between phrases instead of
 * mid-phrase. Over-long chunks fall back to per-character breaking. */
function segmentCjk(text: string): string[] {
  const chars = Array.from(text);
  const chunks: string[] = [];
  let cur = "";
  const flush = () => {
    if (cur !== "") {
      chunks.push(cur);
      cur = "";
    }
  };
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (CJK_OPEN.includes(ch)) flush(); // break before an opening bracket
    cur += ch;
    const hasNext = i + 1 < chars.length;
    const next = hasNext ? chars[i + 1] : "";
    if (
      CJK_BREAK_AFTER.includes(ch) &&
      hasNext &&
      !CJK_BREAK_AFTER.includes(next) && // keep runs like 」。 together
      !CJK_OPEN.includes(next) // a following 「 is handled by break-before
    ) {
      flush();
    }
  }
  flush();
  // Safety net: a chunk must never be wider than a line — split any
  // over-long unpunctuated run back into single characters.
  const MAX_CHUNK = 12;
  const out: string[] = [];
  for (const c of chunks) {
    const cChars = Array.from(c);
    if (cChars.length > MAX_CHUNK) out.push(...cChars);
    else out.push(c);
  }
  return out;
}

/** Wrap tokens: whole words for space-delimited (Latin) titles,
 * punctuation-safe phrase chunks for space-free (CJK) titles. */
function tokenizeTitle(text: string): { tokens: string[]; sep: string } {
  const trimmed = text.trim();
  if (/\s/.test(trimmed) && /[A-Za-z0-9]/.test(trimmed)) {
    return { tokens: trimmed.split(/\s+/), sep: " " };
  }
  return { tokens: segmentCjk(trimmed), sep: "" };
}

/** Greedy line count when packing token widths at `limit` px per line. */
function lineCountAtLimit(tokenWidths: number[], sepWidth: number, limit: number): number {
  let lines = 1;
  let cur = 0;
  for (const w of tokenWidths) {
    const add = cur === 0 ? w : sepWidth + w;
    if (cur !== 0 && cur + add > limit) {
      lines += 1;
      cur = w;
    } else {
      cur += add;
    }
  }
  return lines;
}

/** Greedy pack tokens into lines at `limit` px per line. */
function packAtLimit(
  tokens: string[],
  tokenWidths: number[],
  sep: string,
  sepWidth: number,
  limit: number,
): string[] {
  const lines: string[] = [];
  let cur = "";
  let curW = 0;
  tokens.forEach((tok, i) => {
    const w = tokenWidths[i];
    const add = curW === 0 ? w : sepWidth + w;
    if (curW !== 0 && curW + add > limit) {
      lines.push(cur);
      cur = tok;
      curW = w;
    } else {
      cur = curW === 0 ? tok : cur + sep + tok;
      curW += add;
    }
  });
  if (cur !== "") lines.push(cur);
  return lines;
}

/**
 * Lay a short title out over ≤3 lines: auto-fit the font down until it
 * fits, then balance the line widths so the last line is never a lone
 * short word. Returns the title with explicit "\n" breaks inserted plus
 * the chosen font metrics.
 */
export function layoutBalancedTitle(raw: string): {
  text: string;
  size: number;
  lineHeight: number;
  maxWidth: number;
} {
  const { tokens, sep } = tokenizeTitle(raw);
  const sepIsSpace = sep === " ";

  for (const tier of TITLE_TIERS) {
    const tokenWidths = tokens.map((t) => textWidth(t, tier.size));
    const sepWidth = sepIsSpace ? glyphAdvance(" ", tier.size) : 0;
    // A single token wider than the line can't fit this tier — shrink.
    if (Math.max(...tokenWidths) > tier.maxWidth) continue;
    const minLines = lineCountAtLimit(tokenWidths, sepWidth, tier.maxWidth);
    if (minLines > tier.maxLines) continue;
    // Balance: the smallest per-line width limit that still yields the
    // same (minimal) line count. Tightening the limit pushes words down
    // off an over-full first line, evening the lines and killing orphans.
    let lo = Math.ceil(Math.max(...tokenWidths));
    let hi = Math.ceil(tier.maxWidth);
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (lineCountAtLimit(tokenWidths, sepWidth, mid) <= minLines) hi = mid;
      else lo = mid + 1;
    }
    const lines = packAtLimit(tokens, tokenWidths, sep, sepWidth, lo);
    return { text: lines.join("\n"), size: tier.size, lineHeight: tier.lineHeight, maxWidth: tier.maxWidth };
  }

  // Fallback: pathologically long title — pack greedily at the smallest
  // tier's width. (Such a title should set an explicit ogTitle with its
  // own line breaks; this just keeps output sane.)
  const tier = TITLE_TIERS[TITLE_TIERS.length - 1];
  const tokenWidths = tokens.map((t) => textWidth(t, tier.size));
  const sepWidth = sepIsSpace ? glyphAdvance(" ", tier.size) : 0;
  const lines = packAtLimit(tokens, tokenWidths, sep, sepWidth, tier.maxWidth);
  return { text: lines.join("\n"), size: tier.size, lineHeight: tier.lineHeight, maxWidth: tier.maxWidth };
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
  | { kind: "gradient"; from: string; to: string; isDark?: boolean }
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
  /** Override the accent colour used for `<accent>` title spans and the
   *  bottom rule (default: brown). Set for sub-brand tones — e.g. Trust402's
   *  fluorescent green on a dark card. */
  readonly accentOverride?: string;
  /**
   * Opt in to balanced title layout (auto-fit + orphan-free line breaks).
   * Only takes effect for a plain title — no manual "\n", no <accent>
   * markup, and no titleFont override. Surfaces that pass a bespoke short
   * title (e.g. a blog post's `ogTitle`) set this; everything else leaves
   * it unset and renders exactly as before.
   */
  readonly balanceTitle?: boolean;
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
    return { isDark: bg.isDark ?? false, underlayColor: bg.from, hasCover: false, gradient: { from: bg.from, to: bg.to } };
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
  const accent = input.accentOverride ?? (resolved.isDark ? BROWN_LIGHT : BROWN);
  const titleAccent = accent;

  // Balanced layout is opt-in and only for a plain title: a manual "\n"
  // means the author already controls the breaks, <accent> markup would
  // be lost by re-wrapping, and an explicit titleFont is a hard override.
  const canBalance =
    input.balanceTitle &&
    !input.titleFont &&
    !/\n/.test(input.title) &&
    !/<accent>/.test(input.title);
  const balanced = canBalance ? layoutBalancedTitle(input.title) : undefined;
  const renderedTitle = balanced ? balanced.text : input.title;
  const t =
    input.titleFont ??
    (balanced
      ? { size: balanced.size, lineHeight: balanced.lineHeight, maxWidth: balanced.maxWidth }
      : pickTitleFont(input.title));

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
            width: 145,
            height: 66,
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
      children: renderTitle(renderedTitle, fg, titleAccent),
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
