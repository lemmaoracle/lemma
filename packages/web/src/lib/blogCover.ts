/**
 * ブログ記事の抽象カバー／OGP 画像（1200×630）を、記事の**カテゴリから**生成する。
 *
 * 指示書: `Lemma_カバー・OGP生成_実装指示_v2_2026-08-04.md` A節
 * 参照モック: `lemma_cover_patterns_v9.html`（ブログ抽象3種）
 *
 * カバーは3媒体になった（v2 §0.1）。写真は `audience: business` の記事が持ち、
 * ここが受け持つのは**それ以外の記事**——本文が中身を予告するので、絵は署名に
 * 徹する。共通記号のライムの縦線は3媒体すべてに引く。
 *
 * ■ 3種だけ・カテゴリで画を分けきらない
 * Industry パターンは廃止した（Industry の記事は写真へ移る）。空いた紺は
 * Technical へ、Solutions のオリーブは廃止して深紫を新設——オリーブは色相が
 * ライム #A8E010 に近すぎて、ブロックのライム枠とドット（＝通過の印）が背景に
 * 沈んでいた。カテゴリは一覧のフィルタとして4値のまま残る。**画で分けるのを
 * やめただけ**。
 *
 * ■ 見分けているのは「並べ方」
 * Announcements=一列に整列（72px では横一本の帯）／Technical=等間隔の格子
 * （細かい目）／Solutions=対角に流れる・**粒が不揃い**（斜めの流れ）。
 * ミニサムネで残るのはこの並びなので、サイズと角丸だけに寄せない。特に
 * Solutions は「大きさが不揃い」であること自体が識別子なので揃えてはいけない。
 * 色は**色相ではなく彩度**で分ける（明度は3種とも約18%に揃える。明度を上げると
 * 軽く見える）。グレースケールでも3種が区別できることを確認している。
 *
 * ■ ブロックは走査線をまたがない
 * 左は `x + 辺 ≦ 600`、右は `x ≧ 600`。v1 の「slug をシードにマスを選ぶ」
 * ゆらぎは v2 で廃止して座標を固定した——記事ごとに絵が動く必要はなく、
 * カテゴリの署名として同じ絵が返るほうが速く読める。
 *
 * カバー（記事本文・索引のサムネイル）と OGP は同じ絵で、**OGP だけ**タイトル
 * とロゴを重ねる。重ねる側は `og/blogImage.ts`。
 */

export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 630;

/** ライム。検証済みのシグナルで、カテゴリでは変えない。 */
const LIME = "#A8E010";

/** 走査線の x。ブロックはこの線をまたがない。 */
const SWEEP_X = 600;

export interface CoverBlock {
  /** 左上の x。`verified` のとき、この点がライムのドットの中心にもなる。 */
  readonly x: number;
  readonly y: number;
  /** 一辺（Solutions だけ個別指定）。 */
  readonly size: number;
  /** 走査線を通ったもの（ライムの枠＋左上のドット）。x ≧ 600 から決まる。 */
  readonly verified: boolean;
}

interface CoverGlow {
  /** % 指定（SVG の radialGradient と同じ）。 */
  readonly cx: number;
  readonly cy: number;
  readonly opacity: number;
  /** 環境光の色。カテゴリごとに変える（ライムとは限らない）。 */
  readonly color: string;
}

interface CoverPatternDef {
  /** 地のグラデーション3ストップ（0% / 55% / 100%）。 */
  readonly bg: readonly [string, string, string];
  readonly glow: CoverGlow;
  /** ブロックの角丸。 */
  readonly rx: number;
  /** [x, y, 辺] の並び。verified は x ≧ 600 から導く。 */
  readonly blocks: ReadonlyArray<readonly [number, number, number]>;
}

/** 環境光の半径は3種共通（指示書 A-2）。 */
const GLOW_R = 58;

const PATTERNS = {
  /** 一列に整列／深緑・光は右上。 */
  Announcements: {
    bg: ["#2F4433", "#26382A", "#1F2E23"],
    glow: { cx: 85, cy: 4, opacity: 0.3, color: LIME },
    rx: 56,
    blocks: [
      [90, 195, 240],
      [350, 195, 240],
      [640, 195, 240],
      [900, 195, 240],
    ],
  },
  /** 等間隔の格子／紺・光は上から（旧 Industry の紺を引き継ぐ）。 */
  Technical: {
    bg: ["#2B3A4C", "#22303F", "#1A2532"],
    glow: { cx: 45, cy: -8, opacity: 0.22, color: "#9FD4E8" },
    rx: 10,
    blocks: [
      [60, 90, 130],
      [220, 90, 130],
      [380, 90, 130],
      [60, 250, 130],
      [220, 250, 130],
      [380, 250, 130],
      [60, 410, 130],
      [700, 90, 130],
      [860, 90, 130],
      [1020, 90, 130],
      [700, 250, 130],
      [860, 410, 130],
    ],
  },
  /** 対角に流れる・大きさが不揃い／深紫・光は右下。 */
  Solutions: {
    bg: ["#413046", "#36263A", "#2A1D2D"],
    glow: { cx: 92, cy: 94, opacity: 0.26, color: "#8FA0F0" },
    rx: 34,
    blocks: [
      [60, 50, 200],
      [300, 250, 140],
      [110, 420, 165],
      [660, 110, 120],
      [820, 270, 230],
      [700, 440, 150],
    ],
  },
} as const satisfies Readonly<Record<string, CoverPatternDef>>;

export type CoverCategory = keyof typeof PATTERNS;

/**
 * 3種に無いカテゴリ（Industry・Guides・Foundations・FAQ …）の寄せ先。
 * Solutions にするのは、一列（お知らせの形）でも格子（技術の形）でもない
 * 中庸の並びで、読みもの一般に当たりが柔らかいため。Industry の記事は写真
 * カバーへ移るので、ここへ来るのは例外的なケースだけになる。
 */
const FALLBACK_CATEGORY: CoverCategory = "Solutions";

const isCoverCategory = (c: string): c is CoverCategory =>
  Object.prototype.hasOwnProperty.call(PATTERNS, c);

export interface CoverPattern {
  readonly bg: readonly [string, string, string];
  readonly glow: CoverGlow;
  readonly rx: number;
  readonly sweepX: number;
  readonly blocks: ReadonlyArray<CoverBlock>;
}

/** カテゴリから、この記事の絵を決める（slug には依存しない）。 */
export const coverPattern = (category: string): CoverPattern => {
  const base = PATTERNS[isCoverCategory(category) ? category : FALLBACK_CATEGORY];
  return {
    bg: base.bg,
    glow: base.glow,
    rx: base.rx,
    sweepX: SWEEP_X,
    blocks: base.blocks.map(([x, y, size]) => ({
      x,
      y,
      size,
      verified: x >= SWEEP_X,
    })),
  };
};

/* ── SVG ─────────────────────────────────────────────────────────── */

/**
 * グラデーションとパターンの id。1ページに複数枚出る（索引・関連記事）ので
 * **カテゴリと slug の両方**で分ける——同じ id が2つあると、SVG は最初の定義に
 * 全部引っぱられて、地の色も光の位置も1枚目のものになる。
 */
const sanitizeId = (s: string): string => s.replace(/[^a-zA-Z0-9_-]/g, "-");

const idPrefix = (category: string, slug: string): string =>
  `bc-${sanitizeId(slug)}-${sanitizeId(category.toLowerCase())}`;

/** 検証済みの枠とドットの濃さ（指示書 A-2 の値）。 */
const VERIFIED_STROKE_OPACITY = ".62";
const VERIFIED_DOT_OPACITY = ".82";

/** 辺が 150px を超えるブロックのドットは 18、それ以下は 13（A-2）。 */
const dotRadius = (size: number): number => (size > 150 ? 18 : 13);

const blockSvg = (block: CoverBlock, rx: number): string => {
  const size = String(block.size);
  const rect =
    `<rect x="${String(block.x)}" y="${String(block.y)}" width="${size}"` +
    ` height="${size}" rx="${String(rx)}" fill="#FFFFFF"` +
    (block.verified
      ? ` fill-opacity=".09" stroke="${LIME}" stroke-opacity="${VERIFIED_STROKE_OPACITY}" stroke-width="2"/>`
      : ` fill-opacity=".04" stroke="#FFFFFF" stroke-opacity=".14" stroke-width="2"/>`);
  return block.verified
    ? `${rect}<circle cx="${String(block.x)}" cy="${String(block.y)}" r="${String(dotRadius(block.size))}" fill="${LIME}" fill-opacity="${VERIFIED_DOT_OPACITY}"/>`
    : rect;
};

export interface CoverArtworkOptions {
  /**
   * ブロック全体の不透明度。OGP はタイトルが左下のブロックに重なるので
   * `0.82` まで落とす。カバーは落とさない（既定）。
   */
  readonly blockOpacity?: number;
  /** OGP 用。下半分に、タイトルが読めるだけの下地を1枚敷く。 */
  readonly bottomScrim?: boolean;
}

/**
 * カバーの絵を、`<svg>` の**中身**として返す。
 *
 * `<svg>` 自体は使う側が書く——記事は装飾なので `aria-hidden`、OGP は
 * satori が出した SVG の中へ差し込む、と扱いが違うため。
 */
export const coverArtwork = (
  category: string,
  slug: string,
  options: CoverArtworkOptions = {},
): string => {
  const p = coverPattern(category);
  const id = idPrefix(category, slug);
  const blocks = p.blocks.map((b) => blockSvg(b, p.rx)).join("");
  const opacity = options.blockOpacity;
  return [
    "<defs>",
    `<linearGradient id="${id}-bg" x1="0" y1="0" x2="0.4" y2="1">`,
    `<stop offset="0" stop-color="${p.bg[0]}"/>`,
    `<stop offset="55%" stop-color="${p.bg[1]}"/>`,
    `<stop offset="100%" stop-color="${p.bg[2]}"/>`,
    "</linearGradient>",
    `<radialGradient id="${id}-glow" cx="${String(p.glow.cx)}%" cy="${String(p.glow.cy)}%" r="${String(GLOW_R)}%">`,
    `<stop offset="0" stop-color="${p.glow.color}" stop-opacity="${String(p.glow.opacity)}"/>`,
    `<stop offset="1" stop-color="${p.glow.color}" stop-opacity="0"/>`,
    "</radialGradient>",
    `<pattern id="${id}-grid" width="40" height="40" patternUnits="userSpaceOnUse">`,
    '<path d="M40 0H0V40" fill="none" stroke="#FFFFFF" stroke-opacity=".05" stroke-width="1"/>',
    "</pattern>",
    options.bottomScrim === true
      ? `<linearGradient id="${id}-scrim" x1="0" y1="0" x2="0" y2="1">` +
        '<stop offset="0" stop-color="#141A16" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#141A16" stop-opacity=".55"/>' +
        "</linearGradient>"
      : "",
    "</defs>",
    `<rect width="${String(COVER_WIDTH)}" height="${String(COVER_HEIGHT)}" fill="url(#${id}-bg)"/>`,
    `<rect width="${String(COVER_WIDTH)}" height="${String(COVER_HEIGHT)}" fill="url(#${id}-grid)"/>`,
    `<rect width="${String(COVER_WIDTH)}" height="${String(COVER_HEIGHT)}" fill="url(#${id}-glow)"/>`,
    opacity === undefined ? blocks : `<g opacity="${String(opacity)}">${blocks}</g>`,
    `<line x1="${String(p.sweepX)}" y1="60" x2="${String(p.sweepX)}" y2="570" stroke="${LIME}" stroke-width="3"/>`,
    options.bottomScrim === true
      ? `<rect y="${String(COVER_HEIGHT / 2)}" width="${String(COVER_WIDTH)}" height="${String(COVER_HEIGHT / 2)}" fill="url(#${id}-scrim)"/>`
      : "",
  ].join("");
};

/**
 * `<svg>` ごと返す（記事・索引のサムネイル用）。装飾なので `aria-hidden`。
 * ラスタライズしないので、追加のネットワークリクエストは発生しない。
 */
export const coverSvg = (
  category: string,
  slug: string,
  className?: string,
): string =>
  `<svg viewBox="0 0 ${String(COVER_WIDTH)} ${String(COVER_HEIGHT)}"` +
  ` preserveAspectRatio="xMidYMid slice" aria-hidden="true"` +
  (className === undefined ? "" : ` class="${className}"`) +
  `>${coverArtwork(category, slug)}</svg>`;
