/**
 * ブログ記事のカバー／OGP 画像（1200×630）を、記事の**カテゴリと slug から
 * 生成する**。写真は使わない。
 *
 * 指示書: `Lemma_カバー・OGP生成_実装指示_v1_2026-07-30.md`
 * 参照モック: `lemma_cover_patterns_v5.html`（4カテゴリの確定版）
 *
 * 絵の意味は全カテゴリで同じ——**走査線より左は証明の付いていないもの、右は
 * 付いたもの**。ライムの記号（走査線・枠・ドット）が「検証済み」のシグナルで、
 * これはカテゴリで変えない（変えると記号の意味がカテゴリ依存になる）。
 * カテゴリで変えるのは地の色相・環境光の位置・並びのリズムだけ。
 *
 * 同じカテゴリの記事が同じ絵にならないよう、**slug をシードにした決定的な
 * ゆらぎ**を入れる。乱数は使わないので、同じ記事は何度ビルドしても同じ絵に
 * なる（画像がビルドごとに差分として出ない）。
 *
 * カバー（記事本文・索引のサムネイル）と OGP は同じ絵で、**OGP だけ**タイトル
 * とロゴを重ねる。重ねる側は `og/blogImage.ts`。
 */

export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 630;

/** ライム。検証済みのシグナルで、カテゴリでは変えない。 */
const LIME = "#A8E010";

/** ブロックの一辺と角丸。ゆらぎでも動かさない。 */
const BLOCK_SIZE = 96;
const BLOCK_RADIUS = 22;

/** 走査線と、その左右に置くブロックの間に最低限あける距離。 */
const SWEEP_GAP = 6;

export interface CoverBlock {
  /** 左上の x。`verified` のとき、この点がライムのドットの中心にもなる。 */
  readonly x: number;
  readonly y: number;
  /** 走査線を通ったもの（ライムの枠＋左上のドット）。 */
  readonly verified: boolean;
}

interface CoverGlow {
  /** % 指定（SVG の radialGradient と同じ）。 */
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly opacity: number;
}

interface CoverPattern {
  /** 地のグラデーション3ストップ（0% / 55% / 100%）。 */
  readonly bg: readonly [string, string, string];
  readonly glow: CoverGlow;
  readonly sweepX: number;
  readonly blocks: readonly CoverBlock[];
}

const unverified = (x: number, y: number): CoverBlock => ({ x, y, verified: false });
const verified = (x: number, y: number): CoverBlock => ({ x, y, verified: true });

/**
 * 4カテゴリの基準レイアウト。`data/blog.ts` の `BLOG_CATEGORIES` と同じ4つ。
 * これ以外のカテゴリ（Guides・Foundations・FAQ 等）は Announcements に寄せる。
 */
const PATTERNS = {
  /** ゆるい波が右へ抜ける／緑スレート・光は右上。 */
  Announcements: {
    bg: ["#3C443D", "#333B34", "#2E362F"],
    glow: { cx: 88, cy: 4, r: 58, opacity: 0.3 },
    sweepX: 660,
    blocks: [
      unverified(110, 300),
      unverified(250, 220),
      unverified(390, 270),
      unverified(510, 180),
      verified(720, 240),
      verified(870, 300),
      verified(1010, 210),
    ],
  },
  /** 密なフィールドから、わずかが抜ける／青スレート・光は左上。 */
  Industry: {
    bg: ["#39424A", "#313943", "#2B333B"],
    glow: { cx: 8, cy: 10, r: 70, opacity: 0.18 },
    sweepX: 600,
    blocks: [
      unverified(60, 70),
      unverified(60, 200),
      unverified(60, 330),
      unverified(60, 460),
      unverified(180, 120),
      unverified(180, 250),
      unverified(180, 380),
      unverified(180, 505),
      unverified(300, 70),
      unverified(300, 200),
      unverified(300, 330),
      unverified(300, 460),
      unverified(420, 120),
      unverified(420, 250),
      unverified(420, 380),
      verified(680, 180),
      verified(830, 300),
      verified(980, 180),
    ],
  },
  /** 整列した構造のうち、一部だけが通る／無彩スレート・光は中央上。 */
  Technical: {
    bg: ["#343A37", "#2C322F", "#262B29"],
    glow: { cx: 50, cy: -8, r: 72, opacity: 0.26 },
    sweepX: 620,
    blocks: [
      unverified(110, 110),
      unverified(240, 110),
      unverified(370, 110),
      unverified(500, 110),
      unverified(110, 250),
      unverified(240, 250),
      unverified(370, 250),
      unverified(500, 250),
      unverified(110, 390),
      unverified(240, 390),
      unverified(370, 390),
      unverified(500, 390),
      verified(700, 110),
      verified(830, 250),
      verified(700, 390),
      verified(960, 180),
      verified(1090, 320),
    ],
  },
  /** 上下に揺れながら続く流れ／オリーブ・光は右下。 */
  Solutions: {
    bg: ["#44463C", "#3A3C33", "#33352D"],
    glow: { cx: 88, cy: 94, r: 66, opacity: 0.26 },
    sweepX: 620,
    blocks: [
      unverified(80, 150),
      unverified(205, 265),
      unverified(330, 170),
      unverified(455, 330),
      unverified(500, 60),
      verified(690, 290),
      verified(805, 175),
      verified(940, 330),
      verified(1065, 205),
    ],
  },
} as const satisfies Readonly<Record<string, CoverPattern>>;

export type CoverCategory = keyof typeof PATTERNS;

const FALLBACK_CATEGORY: CoverCategory = "Announcements";

const isCoverCategory = (c: string): c is CoverCategory =>
  Object.prototype.hasOwnProperty.call(PATTERNS, c);

/* ── slug をシードにした決定的なゆらぎ ────────────────────────────
 * 「同じ記事はいつも同じ絵／違う記事は違う絵」を、乱数なしで作る。
 * ハッシュは FNV-1a、そこから n 番目の値を取り出す。 */

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

const seedFromSlug = (slug: string): number =>
  Array.from(slug).reduce(
    (h, ch) => Math.imul(h ^ ch.charCodeAt(0), FNV_PRIME) >>> 0,
    FNV_OFFSET,
  );

/** シードから n 番目の 0.0〜1.0 を取り出す（純関数・状態を持たない）。 */
const randAt = (seed: number, n: number): number => {
  const a = (seed + Math.imul(n + 1, 0x9e3779b1)) >>> 0;
  const b = Math.imul(a ^ (a >>> 15), 0x85ebca6b) >>> 0;
  const c = Math.imul(b ^ (b >>> 13), 0xc2b2ae35) >>> 0;
  return ((c ^ (c >>> 16)) >>> 0) / 0x1_0000_0000;
};

/** ±amp の整数のゆらぎ。 */
const wobble = (r: number, amp: number): number => Math.round((r * 2 - 1) * amp);

const BLOCK_X_AMP = 18;
const BLOCK_Y_AMP = 22;
const SWEEP_AMP = 40;
const GLOW_CX_AMP = 8;

/** ゆらぎ用に予約したインデックス（ブロックは 0..2n-1 を使う）。 */
const SWEEP_INDEX = 900;
const GLOW_INDEX = 901;

const clamp = (v: number, min: number, max: number): number =>
  Math.min(Math.max(v, min), max);

/**
 * 走査線をまたがないように x を寄せる。**未検証は線の左、検証済みは線の右**
 * ——これは絵の意味そのものなので、ゆらぎで崩さない。
 */
const clampToSide = (x: number, block: CoverBlock, sweepX: number): number =>
  block.verified
    ? Math.max(x, sweepX + SWEEP_GAP)
    : Math.min(x, sweepX - BLOCK_SIZE - SWEEP_GAP);

/**
 * カテゴリと slug から、この記事の絵を決める。
 *
 * ゆらぎを入れるのは各ブロックの位置・走査線の x・環境光の cx だけ。
 * ブロックの大きさ・角丸・色・個数・検証済みの数、左右の位置関係は動かさない。
 *
 * なお指示書は「検証済みフラグを1つだけ同じ側の未検証ブロックと交換してよい」
 * も許しているが、**4つの基準レイアウトはどれも検証済み＝線の右／未検証＝線の
 * 左に完全に分かれている**ため、交換の相手が同じ側に存在しない。実装しても
 * 常に空振りになるので入れていない。
 */
export const coverPattern = (category: string, slug: string): CoverPattern => {
  const base = PATTERNS[isCoverCategory(category) ? category : FALLBACK_CATEGORY];
  const seed = seedFromSlug(slug);
  const sweepX = clamp(
    base.sweepX + wobble(randAt(seed, SWEEP_INDEX), SWEEP_AMP),
    BLOCK_SIZE + SWEEP_GAP * 2,
    COVER_WIDTH - BLOCK_SIZE - SWEEP_GAP * 2,
  );
  return {
    bg: base.bg,
    glow: {
      ...base.glow,
      cx: base.glow.cx + wobble(randAt(seed, GLOW_INDEX), GLOW_CX_AMP),
    },
    sweepX,
    blocks: base.blocks.map((block, i) => ({
      verified: block.verified,
      x: clampToSide(
        block.x + wobble(randAt(seed, i * 2), BLOCK_X_AMP),
        block,
        sweepX,
      ),
      y: block.y + wobble(randAt(seed, i * 2 + 1), BLOCK_Y_AMP),
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

const blockSvg = (block: CoverBlock): string => {
  const rect =
    `<rect x="${String(block.x)}" y="${String(block.y)}" width="${String(BLOCK_SIZE)}"` +
    ` height="${String(BLOCK_SIZE)}" rx="${String(BLOCK_RADIUS)}" fill="#FFFFFF"` +
    (block.verified
      ? ` fill-opacity=".09" stroke="${LIME}" stroke-opacity=".78" stroke-width="2"/>`
      : ` fill-opacity=".04" stroke="#FFFFFF" stroke-opacity=".14" stroke-width="2"/>`);
  return block.verified
    ? `${rect}<circle cx="${String(block.x)}" cy="${String(block.y)}" r="13" fill="${LIME}"/>`
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
  const p = coverPattern(category, slug);
  const id = idPrefix(category, slug);
  const blocks = p.blocks.map(blockSvg).join("");
  const opacity = options.blockOpacity;
  return [
    "<defs>",
    `<linearGradient id="${id}-bg" x1="0" y1="0" x2="0.4" y2="1">`,
    `<stop offset="0" stop-color="${p.bg[0]}"/>`,
    `<stop offset="55%" stop-color="${p.bg[1]}"/>`,
    `<stop offset="100%" stop-color="${p.bg[2]}"/>`,
    "</linearGradient>",
    `<radialGradient id="${id}-glow" cx="${String(p.glow.cx)}%" cy="${String(p.glow.cy)}%" r="${String(p.glow.r)}%">`,
    `<stop offset="0" stop-color="${LIME}" stop-opacity="${String(p.glow.opacity)}"/>`,
    `<stop offset="1" stop-color="${LIME}" stop-opacity="0"/>`,
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
