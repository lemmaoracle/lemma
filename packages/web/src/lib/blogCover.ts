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
 * カテゴリで変えるのは地の色相・環境光の位置・**ブロックの密度**だけ。
 *
 * ■ ブロックは必ず格子の交点に置く
 * 指示書 §4 は「各ブロックの位置を ±18/±22px 振る」だが、**px でずらすと
 * 列と行が歪み、密なカテゴリ（Industry）で絵が塩基配列の図のように読めて
 * しまう**。そこでブロックは格子に固定し、記事ごとに変えるのは
 * **どのマスを埋めるか**だけにした。並びは常に整然としたまま、記事が違えば
 * 埋まるマスが違う。乱数は使わないので、同じ記事は何度ビルドしても同じ絵に
 * なる（画像がビルドごとに差分として出ない）。
 *
 * カバー（記事本文・索引のサムネイル）と OGP は同じ絵で、**OGP だけ**タイトル
 * とロゴを重ねる。重ねる側は `og/blogImage.ts`。
 */

export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 630;

/** ライム。検証済みのシグナルで、カテゴリでは変えない。 */
const LIME = "#A8E010";

/** ブロックの一辺と角丸。記事によって変えない。 */
const BLOCK_SIZE = 96;
const BLOCK_RADIUS = 22;

/* ── 格子 ─────────────────────────────────────────────────────────
 * 96px のブロックを 130px 間隔（あき 34px）で置く。左右それぞれ 4列×4行の
 * 16マス。上下の余白・左右の余白・走査線までの間は、どれも意図した値で
 * 揃えてある——ここを崩すと「整然と並んでいる」が壊れる。 */

/** 走査線の x。左のマスの右端から 54px、右のマスの左端まで 54px。 */
const SWEEP_X = 600;

/** 行の y（上余白 72px / 下余白 72px）。 */
const ROWS: ReadonlyArray<number> = [72, 202, 332, 462];

/** 未検証（走査線の左）の列。右端は 546 なので走査線まで 54px あく。 */
const COLS_LEFT: ReadonlyArray<number> = [60, 190, 320, 450];

/** 検証済み（走査線の右）の列。右端は 1140 で右余白 60px。 */
const COLS_RIGHT: ReadonlyArray<number> = [654, 784, 914, 1044];

interface Cell {
  readonly x: number;
  readonly y: number;
}

const latticeOf = (cols: ReadonlyArray<number>): ReadonlyArray<Cell> =>
  cols.flatMap((x) => ROWS.map((y) => ({ x, y })));

const LEFT_CELLS = latticeOf(COLS_LEFT);

/**
 * 右上の1マスは**空けておく**。OGP はそこにワードマークを置くので
 * （`og/blogImage.ts`・右から 80px / 上から 64px）、ブロックがあると
 * ロゴと枠が重なって読めない。カバーと OGP で同じ絵を出すため、ロゴが
 * 無いカバー側でもこのマスは使わない。
 */
const RIGHT_CELLS = latticeOf(COLS_RIGHT).filter(
  (cell) => !(cell.x === COLS_RIGHT[COLS_RIGHT.length - 1] && cell.y === ROWS[0]),
);

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

interface CoverDensity {
  /** 地のグラデーション3ストップ（0% / 55% / 100%）。 */
  readonly bg: readonly [string, string, string];
  readonly glow: CoverGlow;
  /** 走査線の左（未検証）に埋めるマスの数。16マス中。 */
  readonly left: number;
  /** 走査線の右（検証済み）に埋めるマスの数。15マス中（右上はロゴ用に空ける）。 */
  readonly right: number;
}

interface CoverPattern {
  readonly bg: readonly [string, string, string];
  readonly glow: CoverGlow;
  readonly sweepX: number;
  readonly blocks: readonly CoverBlock[];
}

/**
 * 4カテゴリ。`data/blog.ts` の `BLOG_CATEGORIES` と同じ4つで、これ以外
 * （Guides・Foundations・FAQ 等）は Announcements に寄せる。
 *
 * カテゴリの性格は**密度**で出す。位置のゆらぎをやめたぶん、v5 の「ゆるい波」
 * 「上下に揺れる流れ」のような並びの表情は出せないので、埋めるマスの数を
 * v5 の個数から少し調整している（Technical は16マス全部＝完全に整列した格子
 * のまま、Industry は欠けの位置が記事ごとに動くよう 13 に落とす）。
 */
const PATTERNS = {
  /** ゆるく散る／緑スレート・光は右上。 */
  Announcements: {
    bg: ["#3C443D", "#333B34", "#2E362F"],
    glow: { cx: 88, cy: 4, r: 58, opacity: 0.3 },
    left: 4,
    right: 3,
  },
  /** 密なフィールドから、わずかが抜ける／青スレート・光は左上。 */
  Industry: {
    bg: ["#39424A", "#313943", "#2B333B"],
    glow: { cx: 8, cy: 10, r: 70, opacity: 0.18 },
    left: 13,
    right: 3,
  },
  /** 整列した構造のうち、一部だけが通る／無彩スレート・光は中央上。 */
  Technical: {
    bg: ["#343A37", "#2C322F", "#262B29"],
    glow: { cx: 50, cy: -8, r: 72, opacity: 0.26 },
    left: 16,
    right: 5,
  },
  /** 中くらいの密度で続く流れ／オリーブ・光は右下。 */
  Solutions: {
    bg: ["#44463C", "#3A3C33", "#33352D"],
    glow: { cx: 88, cy: 94, r: 66, opacity: 0.26 },
    left: 6,
    right: 4,
  },
} as const satisfies Readonly<Record<string, CoverDensity>>;

export type CoverCategory = keyof typeof PATTERNS;

const FALLBACK_CATEGORY: CoverCategory = "Announcements";

const isCoverCategory = (c: string): c is CoverCategory =>
  Object.prototype.hasOwnProperty.call(PATTERNS, c);

/* ── slug をシードにした決定的な選び方 ──────────────────────────
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

/** ±amp の整数のゆらぎ。いまは環境光の位置にだけ使う。 */
const wobble = (r: number, amp: number): number => Math.round((r * 2 - 1) * amp);

const GLOW_CX_AMP = 8;

/** ゆらぎ／選び方に使うインデックス。マスの数（16）と重ならないように離す。 */
const LEFT_SALT = 0;
const RIGHT_SALT = 100;
const GLOW_INDEX = 900;

/**
 * 16マスから `count` マスを、slug から決まる順番で選ぶ。
 *
 * マスごとにシード由来の鍵を作って並べ替え、先頭から取る——これで偏りのない
 * 決定的な選び方になる。最後に上→左の順に並べ直すのは、出力の SVG を
 * 読みやすく・差分を安定させるため（描画結果は順番に依存しない）。
 */
const chooseCells = (
  cells: ReadonlyArray<Cell>,
  count: number,
  seed: number,
  salt: number,
): ReadonlyArray<Cell> =>
  cells
    .map((cell, i) => ({ cell, key: randAt(seed, salt + i) }))
    .sort((a, b) => a.key - b.key)
    .slice(0, count)
    .map((picked) => picked.cell)
    .sort((a, b) => a.y - b.y || a.x - b.x);

/**
 * カテゴリと slug から、この記事の絵を決める。
 *
 * 記事ごとに変わるのは**どのマスを埋めるか**と環境光の cx だけ。ブロックの
 * 大きさ・角丸・色・格子の位置・埋めるマスの数、左右の意味（左＝未検証／
 * 右＝検証済み）は動かさない。ブロックは格子の交点にしか置かないので、
 * 走査線をまたぐことも起きない。
 */
export const coverPattern = (category: string, slug: string): CoverPattern => {
  const base = PATTERNS[isCoverCategory(category) ? category : FALLBACK_CATEGORY];
  const seed = seedFromSlug(slug);
  return {
    bg: base.bg,
    glow: {
      ...base.glow,
      cx: base.glow.cx + wobble(randAt(seed, GLOW_INDEX), GLOW_CX_AMP),
    },
    sweepX: SWEEP_X,
    blocks: [
      ...chooseCells(LEFT_CELLS, base.left, seed, LEFT_SALT).map((cell) => ({
        x: cell.x,
        y: cell.y,
        verified: false,
      })),
      ...chooseCells(RIGHT_CELLS, base.right, seed, RIGHT_SALT).map((cell) => ({
        x: cell.x,
        y: cell.y,
        verified: true,
      })),
    ],
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
