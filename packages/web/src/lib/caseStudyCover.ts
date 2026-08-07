/**
 * 導入事例のカバー（1200×630）。
 *
 * ■ なぜ画像ではなく生成 SVG なのか
 * 写真カバーにはサイト側が処理を掛ける——`sepia(.16) saturate(.62)
 * hue-rotate(-8deg) contrast(1.04)` と暗幕、さらに 62% の高さのライムの走査線。
 * これは「写真をブランドの色域へ寄せる」ための処理で、自前で地を持つ図版には
 * 要らない。とくに `saturate(.62)` は致命的で、**ライムを打ち消してしまう**。
 * 処理後に `#A8E010` へ戻すには入力が G=258 / B=-120 という sRGB 外の値に
 * なり、到達できるのは RGB(165,230,85) の黄緑まで。アクセント色が出ない。
 *
 * 隣に並ぶ Critical Brief のカバー（`lib/briefCover.ts`）は生成 SVG なので
 * 処理を受けない。同じ枠に並べて同じシリーズに見せるには、こちらも同じ
 * 経路に乗せるのが素直。版面もあちらに合わせてある:
 *
 *   CASE STUDY  … Space Mono 26 / 字送り 7 / #79837C / ベースライン 94
 *   導入事例     … Noto Sans JP 500 / 50 / **ライム**（Brief は下段の脅威タイプ名に
 *                  ライムを置く。こちらは下段に相当する要素が無いので、
 *                  シリーズを名乗るラベルに持たせる）
 *   主文         … Noto Sans JP 500。1行 10 字なら 92px まで取れる
 *
 * ■ 版面の幅
 * `xMinYMid slice` で嵌まるので左端は動かない。一番きつい 16:10 の枠
 * （業界カード）で見えるのは x=0〜1008 まで。主文はこの中に収める。
 */

export const CASE_COVER_WIDTH = 1200;
export const CASE_COVER_HEIGHT = 630;

const LIME = "#A8E010";
/** 16:10 の枠で切られずに見える右端。 */
const VISIBLE_RIGHT = 1008;
const LEFT = 72;

const esc = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const sanitizeId = (s: string): string => s.replace(/[^a-zA-Z0-9_-]/g, "-");

/**
 * 1ページに同じカバーが2回出ることがある（索引の「すべての記事」と、カテゴリ
 * 絞り込み用の隠しリスト）。key だけで id を作ると2枚が同じ id を持ち、絞り込みで
 * 前者が `display:none` になった瞬間、後者の `url(#…)` は非表示側の定義を指す。
 * 非表示の subtree にある paint server は描画されないので、地・格子・環境光が
 * まるごと塗られずカードが白く抜ける。呼ばれるたびに連番を足して分ける。
 */
let instanceSeq = 0;
const nextId = (prefix: string, key: string): string =>
  `${prefix}-${sanitizeId(key)}-${String(++instanceSeq)}`;

/** 地・格子・環境光。briefCover.ts と同値（格子 40px）。 */
const backdrop = (id: string): string =>
  [
    "<defs>",
    `<linearGradient id="${id}-bg" x1="0" y1="0" x2="0.3" y2="1">`,
    '<stop offset="0" stop-color="#202522"/>',
    '<stop offset="60%" stop-color="#1A1E1C"/>',
    '<stop offset="100%" stop-color="#141816"/>',
    "</linearGradient>",
    `<pattern id="${id}-grid" width="40" height="40" patternUnits="userSpaceOnUse">`,
    `<path d="M40 0H0V40" fill="none" stroke="#FFFFFF" stroke-opacity=".07" stroke-width="1"/>`,
    "</pattern>",
    `<radialGradient id="${id}-glow" cx="88%" cy="8%" r="60%">`,
    `<stop offset="0" stop-color="${LIME}" stop-opacity=".16"/>`,
    `<stop offset="1" stop-color="${LIME}" stop-opacity="0"/>`,
    "</radialGradient>",
    "</defs>",
    `<rect width="${String(CASE_COVER_WIDTH)}" height="${String(CASE_COVER_HEIGHT)}" fill="url(#${id}-bg)"/>`,
    `<rect width="${String(CASE_COVER_WIDTH)}" height="${String(CASE_COVER_HEIGHT)}" fill="url(#${id}-grid)"/>`,
    `<rect width="${String(CASE_COVER_WIDTH)}" height="${String(CASE_COVER_HEIGHT)}" fill="url(#${id}-glow)"/>`,
  ].join("");

export interface CaseStudyCoverInput {
  /** 主文。書き手が改行を決める。1行 10 字までは 92px で組める。 */
  readonly lines: ReadonlyArray<string>;
  readonly locale: "ja" | "en";
  /** SVG 内 id の衝突回避キー（同一ページに複数枚出るため）。 */
  readonly key: string;
}

const SERIES = "CASE STUDY";
const LABEL = { ja: "導入事例", en: "Case study" } as const;

/** 主文が `VISIBLE_RIGHT` に収まる最大の号数。上限は 92px。 */
const bodySize = (lines: ReadonlyArray<string>): number => {
  const longest = Math.max(1, ...lines.map((l) => l.length));
  return Math.max(48, Math.min(92, Math.floor((VISIBLE_RIGHT - LEFT) / longest)));
};

export const caseStudyArtwork = (input: CaseStudyCoverInput): string => {
  const id = nextId("csc", input.key);
  const size = bodySize(input.lines);
  const lh = Math.round(size * 1.42);
  /* 主文の最終行を 530 に置く（下余白 100px）。行が増えたぶんは上へ伸ばす。 */
  const last = 530;
  const first = last - (input.lines.length - 1) * lh;
  return [
    backdrop(id),
    `<text x="${String(LEFT)}" y="94" font-family="'Space Mono',monospace" font-size="26" letter-spacing="7" fill="#79837C">${SERIES}</text>`,
    `<text x="${String(LEFT)}" y="168" font-family="'Noto Sans JP',sans-serif" font-weight="500" font-size="50" fill="${LIME}">${esc(LABEL[input.locale])}</text>`,
    ...input.lines.map(
      (l, i) =>
        `<text x="${String(LEFT)}" y="${String(first + i * lh)}" font-family="'Noto Sans JP',sans-serif" font-weight="500" font-size="${String(size)}" fill="#F0F3EC">${esc(l)}</text>`,
    ),
  ].join("");
};

/**
 * `<svg>` ごと返す（装飾なので `aria-hidden`）。
 *
 * アンカーは Brief と同じ **xMin**。枠は 16:10 / 16:9 と源（16:8.4）より
 * 縦長で、中央寄せだと左端の "CASE STUDY" と主文の頭が欠ける。
 */
export const caseStudyCardSvg = (
  input: CaseStudyCoverInput,
  className?: string,
): string =>
  `<svg viewBox="0 0 ${String(CASE_COVER_WIDTH)} ${String(CASE_COVER_HEIGHT)}"` +
  ` preserveAspectRatio="xMinYMid slice" aria-hidden="true"` +
  (className === undefined ? "" : ` class="${className}"`) +
  `>${caseStudyArtwork(input)}</svg>`;
