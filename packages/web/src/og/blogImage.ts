/**
 * ブログ記事の OGP 画像（1200×630）。
 *
 * 絵は記事本文・索引のサムネイルと**同じ生成カバー**（`lib/blogCover.ts`）で、
 * OGP だけタイトル・カテゴリ・ロゴを重ねる。記事ごとの写真は使わない。
 * 指示書: `Lemma_カバー・OGP生成_実装指示_v1_2026-07-30.md`
 *
 * 作り方は「絵は自分で SVG を書き、文字だけ satori に組ませる」。
 * - 絵を satori に描かせることはできない（`<pattern>` の 40px 方眼を扱えない）
 * - 文字を自分で書くと resvg にフォントを渡すことになるが、Space Mono は
 *   **woff しか無く** resvg が読めない（resvg が読めるのは ttf/otf/ttc）
 * そこで satori には**文字だけ**を組ませ（satori はグリフをパスに焼くので
 * resvg 側にフォントは要らない）、返ってきた SVG の `<svg>` 直後に絵を差し
 * 込む。先に入れたものが下に来るので、絵→ロゴ→文字の重なりになる。
 */
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import type { BlogPost } from "../data/blog";
import { COVER_HEIGHT, COVER_WIDTH, coverArtwork } from "../lib/blogCover";
import { LEMMA_LOGO_PATHS } from "./lemmaWordmark";
import { OG_FONT_DATA } from "./ogBase";

const TITLE_INK = "#EBEFE6";
const LIME = "#A8E010";

/** タイトルは 52px 固定・最大3行。あふれたら satori が末尾を「…」にする。 */
const TITLE_SIZE = 52;
const TITLE_LINE_HEIGHT = 1.45;
const TITLE_MAX_LINES = 3;

/** 左 80px / 下から 150px。 */
const SIDE_PAD = 80;
const BOTTOM_PAD = 150;

const LABEL_SIZE = 22;
const LABEL_TRACKING = LABEL_SIZE * 0.16;

/** タイトルが左下のブロックに重なるので、OGP だけブロックを薄くする。 */
const OG_BLOCK_OPACITY = 0.82;

/**
 * 指示書は Noto Sans JP 600 だが、リポジトリにあるのは Regular / Medium /
 * Bold の3ウェイト。600 は Medium で受ける（Bold だと太すぎる）。
 */
const FONTS = [
  {
    name: "Title",
    data: OG_FONT_DATA.jaMedium,
    weight: 600 as const,
    style: "normal" as const,
  },
  {
    name: "Label",
    data: OG_FONT_DATA.spaceMonoRegular,
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Label",
    data: OG_FONT_DATA.jaRegular,
    weight: 400 as const,
    style: "normal" as const,
  },
];

/** ワードマークは viewBox 0 0 142 65。高さ 26px ＝ 0.4 倍で右上に置く。 */
const LOGO_SCALE = 26 / 65;
const LOGO_WIDTH = 142 * LOGO_SCALE;

const logoSvg = (): string =>
  `<g transform="translate(${String(COVER_WIDTH - SIDE_PAD - LOGO_WIDTH)},64) scale(${String(LOGO_SCALE)})" fill="${TITLE_INK}">` +
  LEMMA_LOGO_PATHS.map((d) => `<path d="${d}"/>`).join("") +
  "</g>";

const textNode = (category: string, title: string): unknown => ({
  type: "div",
  props: {
    style: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      padding: `0 ${String(SIDE_PAD)}px ${String(BOTTOM_PAD)}px`,
    },
    children: [
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            fontFamily: "Label",
            fontSize: LABEL_SIZE,
            letterSpacing: LABEL_TRACKING,
            color: LIME,
            marginBottom: 20,
          },
          children: category.toUpperCase(),
        },
      },
      {
        type: "div",
        props: {
          style: {
            display: "block",
            fontFamily: "Title",
            fontWeight: 600,
            fontSize: TITLE_SIZE,
            lineHeight: TITLE_LINE_HEIGHT,
            color: TITLE_INK,
            lineClamp: TITLE_MAX_LINES,
          },
          children: title,
        },
      },
    ],
  },
});

export async function renderBlogOg(post: BlogPost): Promise<Buffer> {
  const textSvg = await satori(
    textNode(post.category, post.ogTitle ?? post.title) as Parameters<typeof satori>[0],
    { width: COVER_WIDTH, height: COVER_HEIGHT, fonts: FONTS },
  );
  const artwork =
    coverArtwork(post.category, post.slug, {
      blockOpacity: OG_BLOCK_OPACITY,
      bottomScrim: true,
    }) + logoSvg();
  // satori が返す SVG の開き `<svg …>` の直後へ差し込む（＝文字の下に来る）。
  const svg = textSvg.replace(/<svg[^>]*>/, (open) => open + artwork);
  return new Resvg(svg, { fitTo: { mode: "width", value: COVER_WIDTH } }).render().asPng();
}
