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
import { COVER_HEIGHT, COVER_WIDTH, coverArtwork, isLightCover } from "../lib/blogCover";
import { LEMMA_LOGO_PATHS } from "./lemmaWordmark";
import { OG_FONT_DATA } from "./ogBase";

const TITLE_INK = "#EBEFE6";
/**
 * 明地カバー（Announcements）の文字色。紙に `#EBEFE6` を置くと読めないので、
 * 索引・記事テンプレートと同じインクへ入れ替える。カテゴリラベルのライムも、
 * 紙の上では `--ok-ink` に落とさないとコントラストが足りない。
 */
const TITLE_INK_ON_LIGHT = "#0F1412";
const LIME = "#A8E010";
const LIME_ON_LIGHT = "#6F9C00";

const inkFor = (light: boolean): string => (light ? TITLE_INK_ON_LIGHT : TITLE_INK);
const limeFor = (light: boolean): string => (light ? LIME_ON_LIGHT : LIME);

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

/**
 * ワードマークの位置と大きさ。
 *
 * ⚠ viewBox（0 0 142 65）で指定すると**見た目より小さくなる**。パスが実際に
 * 占めているのは x 6.4〜129.8 / y 10.2〜50.3 で、縦は 65 のうち 40 しかない
 * ——指示書の「高さ 26px」を viewBox の高さと読むと、字の高さは 16px しか
 * 出ず、1200px のキャンバスで存在感が無かった。**インクの実寸で指定する**。
 */
const LOGO_INK = { x1: 6.4, x2: 129.8, y1: 10.2, y2: 50.3 } as const;

/** 出したい字の高さ。52px のタイトルに対してこれくらいが釣り合う。 */
const LOGO_INK_HEIGHT = 32;

/**
 * 字の上端の y。ブロックの1行目は y=72 からで、検証済みのライムのドットは
 * その 13px 上（y=59）まで来るので、そこに触らない高さに置く。
 * （指示書の「上から 64px」は1行目のブロックに重なる位置だった。）
 */
const LOGO_INK_TOP = 20;

const LOGO_SCALE = LOGO_INK_HEIGHT / (LOGO_INK.y2 - LOGO_INK.y1);
/** 字の右端をタイトルと同じ 80px の余白に揃える。 */
const LOGO_X = COVER_WIDTH - SIDE_PAD - LOGO_INK.x2 * LOGO_SCALE;
const LOGO_Y = LOGO_INK_TOP - LOGO_INK.y1 * LOGO_SCALE;

const logoSvg = (light: boolean): string =>
  `<g transform="translate(${LOGO_X.toFixed(1)},${LOGO_Y.toFixed(1)}) scale(${LOGO_SCALE.toFixed(4)})" fill="${inkFor(light)}">` +
  LEMMA_LOGO_PATHS.map((d) => `<path d="${d}"/>`).join("") +
  "</g>";

const textNode = (category: string, title: string, light: boolean): unknown => ({
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
            color: limeFor(light),
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
            color: inkFor(light),
            lineClamp: TITLE_MAX_LINES,
          },
          children: title,
        },
      },
    ],
  },
});

export async function renderBlogOg(post: BlogPost): Promise<Buffer> {
  const light = isLightCover(post.category);
  const textSvg = await satori(
    textNode(post.category, post.ogTitle ?? post.title, light) as Parameters<typeof satori>[0],
    { width: COVER_WIDTH, height: COVER_HEIGHT, fonts: FONTS },
  );
  const artwork =
    coverArtwork(post.category, post.slug, {
      blockOpacity: OG_BLOCK_OPACITY,
      bottomScrim: true,
    }) + logoSvg(light);
  // satori が返す SVG の開き `<svg …>` の直後へ差し込む（＝文字の下に来る）。
  const svg = textSvg.replace(/<svg[^>]*>/, (open) => open + artwork);
  return new Resvg(svg, { fitTo: { mode: "width", value: COVER_WIDTH } }).render().asPng();
}
