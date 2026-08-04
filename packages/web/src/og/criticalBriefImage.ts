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
import type { CollectionEntry } from "astro:content";
import type { Locale } from "../i18n/translations";
import { OG_FONT_DATA, formatDate } from "./ogBase";
import {
  BRIEF_COVER_HEIGHT,
  BRIEF_COVER_WIDTH,
  briefOgArtwork,
  ogThreatFontSize,
  ogThreatLetterSpacing,
} from "../lib/briefCover";
import { CATEGORY_LABELS } from "../data/criticalBriefs";

type BriefEntry =
  | CollectionEntry<"critical-briefs">
  | CollectionEntry<"critical-briefs-en">;

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
];

const threatLabel = (brief: BriefEntry, locale: Locale): string =>
  CATEGORY_LABELS[brief.data.primary_category as keyof typeof CATEGORY_LABELS]?.[
    locale === "ja" ? "ja" : "en"
  ] ?? "";

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
