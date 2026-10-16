/**
 * Critical Brief の OG 画像（1200×630）。
 *
 * 指示書: `Lemma_カバー・OGP生成_実装指示_v2_2026-08-04.md` C-4
 * 参照モック: `lemma_brief_cover_v11.html`
 *
 * v2 で**クリーム地＋茶の共通アートボードから載せ替えた**。地は炭 `#1A1E1C`
 * （ブログ抽象3色のどれとも当たらず、Brief だけが無彩に落ちるので「読みもの
 * ではない」ことが色で伝わる）。カード用プリセットが番号を主役にするのに対し、
 * **OGP の主役は脅威タイプ名**——共有先では何の話かが要るため。
 *
 * **日本語の説明行は入れない**（C-4 / G-9）。共有先では英語圏の目にも触れ、
 * タイトルがカード下に別途出る SNS では二重になる。
 *
 * 実装上の分担: 地・格子・環境光・走査線・ライムの下線は生の SVG
 * （`lib/briefCover.ts` の `briefOgArtwork`）、文字だけ satori。Resvg は
 * フォントを持たないので、生の `<text>` はラスタライズで消えてしまう。
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import type { Locale } from "../i18n/translations";
import { CATEGORY_LABELS, type BriefEntry } from "../data/criticalBriefs";
import { LIME, OG_FONT_DATA, formatDate } from "./ogBase";
import {
  BRIEF_COVER_HEIGHT,
  BRIEF_COVER_WIDTH,
  briefOgArtwork,
  ogThreatFontSize,
  ogThreatLetterSpacing,
} from "../lib/briefCover";
import { briefCoverArt } from "../lib/briefCoverArt";

const SERIES_LABEL = "CRITICAL BRIEF";

/** Inter 300 は番号（ラテン数字）にしか使わないので和文フォールバックは不要。 */
const interLight = readFileSync(
  resolve(process.cwd(), "node_modules/@fontsource/inter/files/inter-latin-300-normal.woff"),
);

const FONTS = [
  {
    name: "Mono",
    data: OG_FONT_DATA.spaceMonoRegular,
    weight: 400 as const,
    style: "normal" as const,
  },
  { name: "Num", data: interLight, weight: 300 as const, style: "normal" as const },
  { name: "Threat", data: OG_FONT_DATA.jaBold, weight: 700 as const, style: "normal" as const },
  /* 上段ラベルの和文（Space Mono に無い字の受け皿）。 */
  { name: "Kicker", data: OG_FONT_DATA.jaMedium, weight: 400 as const, style: "normal" as const },
];

const threatLabel = (brief: BriefEntry, locale: Locale): string =>
  CATEGORY_LABELS[brief.data.primary_category][locale === "ja" ? "ja" : "en"];

/** 絶対配置のテキスト1つ（satori は position:absolute を解釈する）。 */
const text = (
  content: string,
  style: Record<string, unknown>,
): Record<string, unknown> => ({
  type: "div",
  props: { style: { position: "absolute", ...style }, children: content },
});

export async function renderCriticalBriefOg(
  brief: BriefEntry,
  locale: Locale,
): Promise<Buffer> {
  if (brief.data.layout === "report") return renderReportOg(brief, locale);
  const no = String(brief.data.brief_no).padStart(3, "0");
  const threat = threatLabel(brief, locale);
  const size = ogThreatFontSize(threat);

  const node = {
    type: "div",
    props: {
      style: {
        position: "relative",
        display: "flex",
        width: BRIEF_COVER_WIDTH,
        height: BRIEF_COVER_HEIGHT,
      },
      children: [
        // "CRITICAL BRIEF" — Space Mono 27 / ls 7 / #79837C / ベースライン 102
        text(SERIES_LABEL, {
          left: 72,
          top: 102 - 27,
          fontFamily: "Mono",
          fontSize: 27,
          letterSpacing: 7,
          color: "#79837C",
        }),
        // "No.<番号>" — Inter 300 / 44 / 右端 1128 に揃える
        text(`No.${no}`, {
          right: BRIEF_COVER_WIDTH - 1128,
          top: 102 - 44,
          fontFamily: "Num",
          fontSize: 44,
          color: "#F0F3EC",
        }),
        // 脅威タイプ名（主役）— Noto Sans JP 700 / ベースライン 372
        text(threat, {
          left: 72,
          top: 372 - size,
          fontFamily: "Threat",
          fontWeight: 700,
          fontSize: size,
          letterSpacing: ogThreatLetterSpacing(size),
          color: "#F2F5EE",
        }),
        // 公開日 — Space Mono 24 / ls 3 / #6B746D / ベースライン 556
        text(formatDate(brief.data.published), {
          left: 72,
          top: 556 - 24,
          fontFamily: "Mono",
          fontSize: 24,
          letterSpacing: 3,
          color: "#6B746D",
        }),
      ],
    },
  };

  const textSvg = await satori(node, {
    width: BRIEF_COVER_WIDTH,
    height: BRIEF_COVER_HEIGHT,
    fonts: FONTS,
  });
  // 地は satori が出した SVG の開きタグ直後へ差し込む（＝文字の下に来る）。
  const svg = textSvg.replace(
    /<svg[^>]*>/,
    (open) => open + briefOgArtwork({ threat, no, key: `${brief.id}-${locale}` }),
  );
  return new Resvg(svg, {
    fitTo: { mode: "width", value: BRIEF_COVER_WIDTH },
  })
    .render()
    .asPng();
}

/* ── report Brief の OG（2026-10-17） ─────────────────────────────
 * 脅威タイプ名（「Attribute Proof Bypass」など）が主役の共通型では、X の
 * カードを見ても何の事件か分からない。report Brief は本文の表紙と同じ
 * 生成グラフィックを地にして、事件そのもの（`og_headline_*`）を主役にする。
 * 上段は事例の種類（`og_kicker_*`）、下段は番号だけ。 */

const REPORT_W = BRIEF_COVER_WIDTH;
const REPORT_H = BRIEF_COVER_HEIGHT;

/** `\n` で行を分け、`<accent>…</accent>` をライムの1行として取り出す。 */
const parseHeadline = (raw: string): { lines: string[]; accent: string | null } => {
  const m = /<accent>([\s\S]*?)<\/accent>/.exec(raw);
  const accent = m ? m[1].trim() : null;
  const main = raw.replace(/<accent>[\s\S]*?<\/accent>/, "").trim();
  return { lines: main.split(/\n/).map((l) => l.trim()).filter(Boolean), accent };
};

/** 長い見出しは一段小さく。英語は語で折れるので字数の閾値を大きく取る。
 *  スマホのカード（幅 ~360px＝0.3倍）でも読める大きさを下限にする。 */
const reportHeadlineSize = (text: string, ja: boolean): number => {
  const n = Array.from(text).length;
  if (ja) return n > 40 ? 58 : 66;
  return n > 80 ? 60 : 70;
};

/** 強調の1行は折り返させない。長ければ見出しより一段小さくする。 */
const accentSize = (accent: string, size: number, ja: boolean): number => {
  const n = Array.from(accent).length;
  return n > (ja ? 13 : 26) ? Math.round(size * 0.8) : size;
};

/** 上段の札（Space Mono 700）。和文は Noto Sans JP Bold に落とす。 */
const spaceMonoBold = readFileSync(
  resolve(process.cwd(), "node_modules/@fontsource/space-mono/files/space-mono-latin-700-normal.woff"),
);
const REPORT_FONTS = [
  ...FONTS,
  { name: "Tag", data: spaceMonoBold, weight: 700 as const, style: "normal" as const },
  { name: "TagJa", data: OG_FONT_DATA.jaBold, weight: 700 as const, style: "normal" as const },
];

/* スマホで縮むと上下の小さな文字はつぶれ、X はカード左下にドメインを重ねる。
 * なので下段は持たず、種類の札と番号を上の1行にまとめ、見出しを大きく取る。 */
async function renderReportOg(brief: BriefEntry, locale: Locale): Promise<Buffer> {
  const ja = locale === "ja";
  const no = String(brief.data.brief_no).padStart(3, "0");
  const kicker =
    (ja ? brief.data.og_kicker_ja : brief.data.og_kicker_en) ??
    `${SERIES_LABEL} · ${threatLabel(brief, locale)}`;
  const raw =
    (ja ? brief.data.og_headline_ja : brief.data.og_headline_en) ??
    (ja ? brief.data.title : brief.data.title_en).split(/ — |：/)[0];
  const { lines, accent } = parseHeadline(raw);
  const size = reportHeadlineSize(lines.join(""), ja);

  const line = (content: string, color: string, extra: Record<string, unknown> = {}) => ({
    type: "div",
    props: { style: { display: "flex", color, ...extra }, children: content },
  });

  const node = {
    type: "div",
    props: {
      style: { position: "relative", display: "flex", width: REPORT_W, height: REPORT_H },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 64,
              right: 64,
              top: 52,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            },
            children: [
              line(kicker, "#14190F", {
                fontFamily: "Tag, TagJa",
                fontWeight: 700,
                fontSize: 30,
                letterSpacing: ja ? 1.5 : 1.8,
                background: LIME,
                borderRadius: 8,
                padding: "6px 18px",
              }),
              line(`No.${no}`, "#CFD8C4", {
                fontFamily: "Tag",
                fontWeight: 700,
                fontSize: 30,
                letterSpacing: 1.2,
              }),
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 64,
              right: ja ? 260 : 150,
              top: 150,
              display: "flex",
              flexDirection: "column",
              fontFamily: "Threat",
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.22,
              letterSpacing: ja ? 0.7 : -0.7,
            },
            children: [
              ...lines.map((l) => line(l, "#F6F8F1")),
              ...(accent
                ? [line(accent, LIME, { marginTop: 20, fontSize: accentSize(accent, size, ja) })]
                : []),
            ],
          },
        },
      ],
    },
  };

  const textSvg = await satori(node, { width: REPORT_W, height: REPORT_H, fonts: REPORT_FONTS });
  const art = briefCoverArt(brief.data.brief_no);
  const ground =
    `<defs><linearGradient id="rog${no}" x1="0.4" y1="0" x2="0.6" y2="1">` +
    `<stop offset="0" stop-color="#3c443d"/><stop offset=".58" stop-color="#2f372f"/>` +
    `<stop offset="1" stop-color="#272e28"/></linearGradient></defs>` +
    `<rect width="${String(REPORT_W)}" height="${String(REPORT_H)}" fill="url(#rog${no})"/>` +
    `<svg x="0" y="0" width="${String(REPORT_W)}" height="${String(REPORT_H)}" viewBox="${art.viewBox}" preserveAspectRatio="${art.preserveAspectRatio}" opacity=".8">${art.inner}</svg>`;
  const svg = textSvg.replace(/<svg[^>]*>/, (open) => open + ground);
  return new Resvg(svg, { fitTo: { mode: "width", value: REPORT_W } }).render().asPng();
}
