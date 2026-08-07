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
 * 色は**色相ではなく彩度**で分ける。ただし明度を3種で揃える規律は
 * **Announcements を明地にした時点で捨てた**（2026-08-08）。暗い3種を並べると
 * 図版どうしの差が並べ方だけになり、写真カバーと混ざる一覧では図版が全部
 * 同じ塊に見えていた。いまの分かれ方は「実写＝暗い／図版＝白い」が先に来て、
 * その中を並べ方で分ける。Technical と Solutions は従来どおり暗地。
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

/**
 * 明地のインク。索引・記事テンプレートの `--ink` と同値。
 * 明地では白が使えない（紙に白は乗らない）ので、格子と非検証ブロックはこれを
 * **ごく薄く**敷く。濃くすると図版が主張しはじめ、写真カバーと並べたときに
 * 図版のほうが前に出る。
 */
const INK = "#0F1412";

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
  /**
   * 明地。地を紙側に置き、格子と非検証ブロックをインクのごく薄い輪郭にする。
   * ライムは走査線と検証済みの印にだけ残す（＝色が付いているものが「通った
   * もの」だと一目で分かる。暗地では白の面が多くて、この対比が弱かった）。
   */
  readonly light?: true;
}

/** 環境光の半径は3種共通（指示書 A-2）。 */
const GLOW_R = 58;

const PATTERNS = {
  /**
   * 一列に整列／**明地**・光は右上。
   *
   * 3種のうちここだけ紙。生成カバーが実際に効いているのは Announcements と
   * Technical の2つで（Industry と Solutions の記事は写真へ移った）、大きめの
   * 四角が4つ並ぶこの版面は余白が多く、明地にしたときに一番静かに収まる。
   * 一覧では「実写＝暗い／図版＝白い」の対比になり、写真と図版が同じ枠に
   * 並んでも取り違えない。
   */
  Announcements: {
    bg: ["#E7ECE4", "#DCE3D7", "#D1D9CA"],
    glow: { cx: 85, cy: 4, opacity: 0.1, color: LIME },
    rx: 56,
    light: true,
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
  readonly light: boolean;
}

/** カテゴリから、この記事の絵を決める（slug には依存しない）。 */
export const coverPattern = (category: string): CoverPattern => {
  const base = PATTERNS[isCoverCategory(category) ? category : FALLBACK_CATEGORY];
  return {
    bg: base.bg,
    glow: base.glow,
    rx: base.rx,
    sweepX: SWEEP_X,
    light: base.light === true,
    blocks: base.blocks.map(([x, y, size]) => ({
      x,
      y,
      size,
      verified: x >= SWEEP_X,
    })),
  };
};

/**
 * この絵が明地か。**OGP が文字色を決めるのに使う**——明地に既定の白文字
 * （`#EBEFE6`）を置くとタイトルが読めない。
 */
export const isLightCover = (category: string): boolean =>
  coverPattern(category).light;

/* ── SVG ─────────────────────────────────────────────────────────── */

/**
 * グラデーションとパターンの id。1ページに複数枚出る（索引・関連記事）ので
 * **カテゴリと slug の両方**で分ける——同じ id が2つあると、SVG は最初の定義に
 * 全部引っぱられて、地の色も光の位置も1枚目のものになる。
 */
const sanitizeId = (s: string): string => s.replace(/[^a-zA-Z0-9_-]/g, "-");

/**
 * **1ページに同じ記事が2回出ることがある**（索引の「すべての記事」と、
 * カテゴリ絞り込み用の隠しリスト）。カテゴリ＋slug だけで id を作ると2枚が
 * 同じ id を持ち、絞り込みで前者が `display:none` になった瞬間、後者の
 * `url(#…)` は**非表示の側の定義**を指すことになる。非表示の subtree にある
 * paint server は描画されないので、地・格子・環境光がまるごと塗られず、
 * カードが白く抜ける（実際に起きていた）。
 *
 * 呼ばれるたびに連番を足して、1枚ごとに別の id にする。
 */
let instanceSeq = 0;

const idPrefix = (category: string, slug: string): string =>
  `bc-${sanitizeId(slug)}-${sanitizeId(category.toLowerCase())}-${String(++instanceSeq)}`;

/** 検証済みの枠とドットの濃さ（指示書 A-2 の値）。 */
const VERIFIED_STROKE_OPACITY = ".62";
const VERIFIED_DOT_OPACITY = ".82";

/** 辺が 150px を超えるブロックのドットは 18、それ以下は 13（A-2）。 */
const dotRadius = (size: number): number => (size > 150 ? 18 : 13);

/**
 * 明地の値。非検証ブロックは**面を塗らず輪郭だけ**にする（紙が透ける）。
 * 暗地では白の面（`fill-opacity .04`）で存在を出していたが、紙に白は乗らない
 * ので、そのままでは6枚のうち3枚が消える。
 */
const LIGHT_BLOCK_STROKE_OPACITY = ".1";
const LIGHT_VERIFIED_STROKE_OPACITY = ".7";

const blockSvg = (block: CoverBlock, rx: number, light: boolean): string => {
  const size = String(block.size);
  const head =
    `<rect x="${String(block.x)}" y="${String(block.y)}" width="${size}"` +
    ` height="${size}" rx="${String(rx)}"`;
  const skin = block.verified
    ? light
      ? ` fill="none" stroke="${LIME}" stroke-opacity="${LIGHT_VERIFIED_STROKE_OPACITY}" stroke-width="2"/>`
      : ` fill="#FFFFFF" fill-opacity=".09" stroke="${LIME}" stroke-opacity="${VERIFIED_STROKE_OPACITY}" stroke-width="2"/>`
    : light
      ? ` fill="none" stroke="${INK}" stroke-opacity="${LIGHT_BLOCK_STROKE_OPACITY}" stroke-width="2"/>`
      : ` fill="#FFFFFF" fill-opacity=".04" stroke="#FFFFFF" stroke-opacity=".14" stroke-width="2"/>`;
  const rect = head + skin;
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
  const blocks = p.blocks.map((b) => blockSvg(b, p.rx, p.light)).join("");
  /* 格子。暗地は白、明地はインク——どちらも「地の上にごく薄く」。 */
  const gridStroke = p.light ? INK : "#FFFFFF";
  const gridOpacity = p.light ? ".07" : ".05";
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
    `<path d="M40 0H0V40" fill="none" stroke="${gridStroke}" stroke-opacity="${gridOpacity}" stroke-width="1"/>`,
    "</pattern>",
    /* OGP の下地。明地では紙側に敷く——暗い下地を明地に置くと、そこだけ
       別の絵のように分かれて見える。文字色は og/blogImage.ts が合わせる。 */
    options.bottomScrim === true
      ? `<linearGradient id="${id}-scrim" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="${p.light ? p.bg[1] : "#141A16"}" stop-opacity="0"/>` +
        `<stop offset="1" stop-color="${p.light ? p.bg[1] : "#141A16"}" stop-opacity="${p.light ? ".78" : ".55"}"/>` +
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
