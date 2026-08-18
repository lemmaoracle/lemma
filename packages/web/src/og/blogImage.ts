/**
 * ブログ記事の OGP 画像（1200×630）。
 *
 * 絵は記事ページのカバーと同じで、OGP だけタイトル・カテゴリ・ロゴを重ねる。
 * **カバー写真を持つ記事はその写真**、無ければ生成カバー（`lib/blogCover.ts`）。
 * 指示書 v1 の「記事ごとの写真は使わない」は写真カバーの仕組み
 * （`lib/coverPhoto.ts`）が入る前の前提で、そのままだと**ページ上は写真・SNS
 * 共有だけ抽象**という食い違いが残る。
 * 指示書: `Lemma_カバー・OGP生成_実装指示_v1_2026-07-30.md` / 同 v2
 *
 * 写真の色調（`.cover--photo` の `filter`）は SVG フィルタで**描画時に**掛ける。
 * 入稿 JPEG は無加工のまま（`lib/coverPhoto.ts` の方針）で、焼き込まない。
 *
 * 作り方は「絵は自分で SVG を書き、文字だけ satori に組ませる」。
 * - 絵を satori に描かせることはできない（`<pattern>` の 40px 方眼を扱えない）
 * - 文字を自分で書くと resvg にフォントを渡すことになるが、Space Mono は
 *   **woff しか無く** resvg が読めない（resvg が読めるのは ttf/otf/ttc）
 * そこで satori には**文字だけ**を組ませ（satori はグリフをパスに焼くので
 * resvg 側にフォントは要らない）、返ってきた SVG の `<svg>` 直後に絵を差し
 * 込む。先に入れたものが下に来るので、絵→ロゴ→文字の重なりになる。
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import type { BlogPost } from "../data/blog";
import { COVER_HEIGHT, COVER_WIDTH, coverArtwork, isLightCover } from "../lib/blogCover";
import { resolveCoverImage } from "../lib/coverPhoto";
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

const logoPaths = (fill: string): string =>
  `<g transform="translate(${LOGO_X.toFixed(1)},${LOGO_Y.toFixed(1)}) scale(${LOGO_SCALE.toFixed(4)})" fill="${fill}">` +
  LEMMA_LOGO_PATHS.map((d) => `<path d="${d}"/>`).join("") +
  "</g>";

const logoSvg = (light: boolean): string => logoPaths(inkFor(light));

/**
 * 写真の上のワードマーク。空のように明るい場所に白を置くと読めないので、
 * 同じ字形を暗色でぼかして下に敷く（太らせてから blur）。
 */
const logoHaloSvg = (): string =>
  '<defs><filter id="og-logo-halo" x="-50%" y="-50%" width="200%" height="200%">' +
  '<feGaussianBlur stdDeviation="9"/></filter></defs>' +
  `<g filter="url(#og-logo-halo)" opacity=".95" stroke="#0A0E0B" stroke-width="9">${logoPaths("#0A0E0B")}</g>`;

const textNode = (category: string, title: string, light: boolean, shadow: boolean): unknown => ({
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
            ...(shadow ? { textShadow: PHOTO_TEXT_SHADOW } : {}),
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
            ...(shadow ? { textShadow: PHOTO_TEXT_SHADOW } : {}),
            lineClamp: TITLE_MAX_LINES,
          },
          children: title,
        },
      },
    ],
  },
});

/**
 * `public/` の実パス。
 *
 * ⚠ `new URL("../../public/", import.meta.url)` は使えない。このモジュールは
 * バンドル後に `dist/pages/og/blog/[lang]/[slug].png.astro.mjs` へ畳み込まれ、
 * 相対の段数が変わって別の場所を指す（`lib/coverPhoto.ts` が同じ書き方で動くのは
 * `dist/chunks/` に出て段数がたまたま合うから）。このエンドポイントは
 * `prerender = true` でビルド時にしか走らないので、プロジェクト直下を起点にする。
 */
const PUBLIC_DIR = join(process.cwd(), "public");

/**
 * `.cover--photo` の `filter: sepia(.16) saturate(.62) hue-rotate(-8deg)
 * contrast(1.04)` と同じ変換。前3つは1本の行列に畳んであり、contrast だけ
 * `feComponentTransfer`（v → 1.04v − 0.02）で掛ける。
 */
const GRADE_MATRIX =
  "0.6618 0.4042 -0.0143 0 0 0.1144 0.8469 0.0707 0 0 0.1752 0.2763 0.5575 0 0 0 0 0 1 0";

/**
 * 暗いヴェール（`linear-gradient(200deg, …)`）を SVG の座標で引き直したもの。
 * CSS の 200deg は右上→左下。1200×630 に対する勾配線の端点を実寸で置く。
 */
const VEIL = { x1: 771, y1: -156, x2: 429, y2: 786 } as const;

/**
 * ライムの走査線。ページ側は高さ 62% だが、OGP は下半分がタイトルなので
 * そこに引くと取り消し線に見える。文字に触れない上側へ移す。太さはページの
 * 2px を 1200px 幅に合わせて 3px に（生成カバーの縦線と同じ太さ）。
 */
const SCAN_TOP = COVER_HEIGHT * 0.26;
const SCAN_HEIGHT = 3;

/**
 * 写真の上に置く文字を読ませるためのスクリム。ページ側のヴェールだけでは
 * 足りない——ヴェールは 200deg で右上がいちばん薄く（不透明度 .06）、明るい
 * 空や外壁の写真だと、右上のワードマークと左のカテゴリラベルが沈む。
 *
 * 下は高さ 28% から、上は 150px の帯で落とす。それでも明るい空の写真では
 * 3:1 に届かないが、そこまでスクリムを強めると写真が黒い板になる。スクリムは
 * 「写真を残したまま沈める」ところまでにして、可読性は文字側の影
 * （`PHOTO_TEXT_SHADOW` とワードマークのハロー）で担保する。
 */
const PHOTO_SCRIM_TOP = COVER_HEIGHT * 0.28;
const PHOTO_SCRIM_OPACITY = 0.82;
const PHOTO_TOP_SCRIM_HEIGHT = 150;
const PHOTO_TOP_SCRIM_OPACITY = 0.42;

/**
 * 文字とワードマークの影。スクリムだけで写真を 3:1 まで沈めると、写真が
 * ほぼ黒い板になってしまう。写真は明るいまま残し、文字側に影を持たせる
 * ——文字は satori の `textShadow`、ワードマークは下に暗いぼかしを敷く。
 */
const PHOTO_TEXT_SHADOW = "0 2px 20px rgba(10,14,11,.96), 0 1px 4px rgba(10,14,11,.92)";

/**
 * カバー写真を OGP の絵として返す。写真を持たない記事は `undefined`。
 *
 * resvg は data URI の `<image>` を描けるので JPEG は base64 で埋め込む。
 * `slice` が CSS の `object-fit: cover` にあたる（入稿は 16:9、OGP は 1.9:1）。
 */
const photoArtwork = (post: BlogPost): string | undefined => {
  const src = resolveCoverImage(post);
  if (src === undefined) return undefined;
  // 起点の取り方が `lib/coverPhoto.ts`（import.meta.url）と違うので、ここでも
  // 実在を見てから読む。取り違えても生成カバーに落ちるだけで、ビルドは落ちない。
  const file = join(PUBLIC_DIR, src);
  if (!existsSync(file)) return undefined;
  // 現状の入稿は全て JPEG だが、PNG を置かれたときに黙って壊れないよう拡張子で見る。
  const mime = src.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
  const data = readFileSync(file).toString("base64");
  const w = String(COVER_WIDTH);
  const h = String(COVER_HEIGHT);
  return [
    "<defs>",
    '<filter id="og-grade" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">',
    `<feColorMatrix type="matrix" values="${GRADE_MATRIX}"/>`,
    "<feComponentTransfer>",
    '<feFuncR type="linear" slope="1.04" intercept="-0.02"/>',
    '<feFuncG type="linear" slope="1.04" intercept="-0.02"/>',
    '<feFuncB type="linear" slope="1.04" intercept="-0.02"/>',
    "</feComponentTransfer>",
    "</filter>",
    `<linearGradient id="og-veil" gradientUnits="userSpaceOnUse" x1="${String(VEIL.x1)}" y1="${String(VEIL.y1)}" x2="${String(VEIL.x2)}" y2="${String(VEIL.y2)}">`,
    '<stop offset="0" stop-color="#101611" stop-opacity=".06"/>',
    '<stop offset=".62" stop-color="#101611" stop-opacity=".3"/>',
    '<stop offset="1" stop-color="#101611" stop-opacity=".52"/>',
    "</linearGradient>",
    '<linearGradient id="og-scrim" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#141A16" stop-opacity="0"/>',
    '<stop offset=".3" stop-color="#141A16" stop-opacity=".5"/>',
    '<stop offset=".65" stop-color="#141A16" stop-opacity=".78"/>',
    `<stop offset="1" stop-color="#141A16" stop-opacity="${String(PHOTO_SCRIM_OPACITY)}"/>`,
    "</linearGradient>",
    '<linearGradient id="og-top" x1="0" y1="0" x2="0" y2="1">',
    `<stop offset="0" stop-color="#141A16" stop-opacity="${String(PHOTO_TOP_SCRIM_OPACITY)}"/>`,
    '<stop offset="1" stop-color="#141A16" stop-opacity="0"/>',
    "</linearGradient>",
    "</defs>",
    `<image href="data:${mime};base64,${data}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" filter="url(#og-grade)"/>`,
    `<rect width="${w}" height="${h}" fill="url(#og-veil)"/>`,
    `<rect y="${String(SCAN_TOP)}" width="${w}" height="${String(SCAN_HEIGHT)}" fill="${LIME}" opacity=".85"/>`,
    `<rect width="${w}" height="${String(PHOTO_TOP_SCRIM_HEIGHT)}" fill="url(#og-top)"/>`,
    `<rect y="${String(PHOTO_SCRIM_TOP)}" width="${w}" height="${String(COVER_HEIGHT - PHOTO_SCRIM_TOP)}" fill="url(#og-scrim)"/>`,
  ].join("");
};

export async function renderBlogOg(post: BlogPost): Promise<Buffer> {
  const photo = photoArtwork(post);
  // 写真はヴェールとスクリムで暗くなるので、明地カバーの文字色は使わない。
  const light = photo === undefined && isLightCover(post.category);
  const textSvg = await satori(
    textNode(post.category, post.ogTitle ?? post.title, light, photo !== undefined) as Parameters<
      typeof satori
    >[0],
    { width: COVER_WIDTH, height: COVER_HEIGHT, fonts: FONTS },
  );
  const artwork =
    photo === undefined
      ? coverArtwork(post.category, post.slug, {
          blockOpacity: OG_BLOCK_OPACITY,
          bottomScrim: true,
        }) + logoSvg(light)
      : photo + logoHaloSvg() + logoSvg(false);
  // satori が返す SVG の開き `<svg …>` の直後へ差し込む（＝文字の下に来る）。
  const svg = textSvg.replace(/<svg[^>]*>/, (open) => open + artwork);
  return new Resvg(svg, { fitTo: { mode: "width", value: COVER_WIDTH } }).render().asPng();
}
