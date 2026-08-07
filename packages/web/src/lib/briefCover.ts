/**
 * Critical Brief のカバー（1200×630）。
 *
 * 指示書: `Lemma_カバー・OGP生成_実装指示_v2_2026-08-04.md` C節
 * 参照モック: `lemma_brief_cover_v11.html`
 *
 * ■ 地は炭 `#1A1E1C`
 * ブログ抽象3色（深緑・藍・深紫）のどれとも当たらず、Brief だけが無彩に落ちる
 * ので「読みものではない」ことが色で伝わる。明度はブログ3色とほぼ揃うので、
 * 3枚並んでも浮かない。格子はブログ（.05）より**強く見せる**（.07）——Brief の
 * 性格差はここでも出る。共通記号のライムの縦線は3媒体すべてに引く。
 *
 * ■ 2プリセット
 *   カード（Latest news 枠2・関連Brief）→ **番号**が主役。360px 幅で確実に
 *     読めるのは番号だけなので、258px の Inter 200 を据える。
 *   OGP（1200×630）→ **脅威タイプ名**が主役。共有先では何の話かが要る。
 *     日本語の説明行は入れない（英語圏の目にも触れ、SNS ではタイトルが
 *     カード下に別途出るため二重になる）。
 *
 * カード用の日本語行「AI×信頼の最前線」は EN では出さない（C-5）。
 */

export const BRIEF_COVER_WIDTH = 1200;
export const BRIEF_COVER_HEIGHT = 630;

const LIME = "#A8E010";

/** 日本語のコピー。EN では出さない（C-5）。 */
const JA_TAGLINE = "AI×信頼の最前線";

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

/**
 * 地・格子・環境光（C-2 共通）。`gridSize` はカード 40／OGP 60。
 * 1ページに複数枚出るので id は呼び出し側の鍵で分ける。
 */
const backdrop = (id: string, gridSize: number): string =>
  [
    "<defs>",
    `<linearGradient id="${id}-bg" x1="0" y1="0" x2="0.3" y2="1">`,
    '<stop offset="0" stop-color="#202522"/>',
    '<stop offset="60%" stop-color="#1A1E1C"/>',
    '<stop offset="100%" stop-color="#141816"/>',
    "</linearGradient>",
    `<pattern id="${id}-grid" width="${String(gridSize)}" height="${String(gridSize)}" patternUnits="userSpaceOnUse">`,
    `<path d="M${String(gridSize)} 0H0V${String(gridSize)}" fill="none" stroke="#FFFFFF" stroke-opacity=".07" stroke-width="1"/>`,
    "</pattern>",
    `<radialGradient id="${id}-glow" cx="88%" cy="8%" r="60%">`,
    `<stop offset="0" stop-color="${LIME}" stop-opacity=".16"/>`,
    `<stop offset="1" stop-color="${LIME}" stop-opacity="0"/>`,
    "</radialGradient>",
    "</defs>",
    `<rect width="${String(BRIEF_COVER_WIDTH)}" height="${String(BRIEF_COVER_HEIGHT)}" fill="url(#${id}-bg)"/>`,
    `<rect width="${String(BRIEF_COVER_WIDTH)}" height="${String(BRIEF_COVER_HEIGHT)}" fill="url(#${id}-grid)"/>`,
    `<rect width="${String(BRIEF_COVER_WIDTH)}" height="${String(BRIEF_COVER_HEIGHT)}" fill="url(#${id}-glow)"/>`,
  ].join("");

/** 縦の走査線。カードは .45、OGP は .35（C-3 / C-4）。 */
const scanline = (opacity: string): string =>
  `<line x1="600" y1="60" x2="600" y2="570" stroke="${LIME}" stroke-width="3" stroke-opacity="${opacity}"/>`;

export interface BriefCardCoverInput {
  /** ゼロ埋め済みの番号（`047`）。`No.` の接頭辞は付けない（C-3）。 */
  readonly no: string;
  /** 脅威タイプ名（ロケール済みの表示名）。 */
  readonly threat: string;
  readonly locale: "ja" | "en";
  /** SVG 内 id の衝突回避キー（同一ページに複数枚出るため）。 */
  readonly key: string;
}

/**
 * カード用（`<svg>` の中身）。主役は番号。
 * 360px 幅まで縮んでも番号だけは残る、という前提の版面。
 */
export const briefCardArtwork = (input: BriefCardCoverInput): string => {
  const id = nextId("bfc", input.key);
  return [
    backdrop(id, 40),
    `<text x="72" y="94" font-family="'Space Mono',monospace" font-size="26" letter-spacing="7" fill="#79837C">CRITICAL BRIEF</text>`,
    input.locale === "ja"
      ? `<text x="72" y="168" font-family="'Noto Sans JP',sans-serif" font-weight="500" font-size="50" fill="#C6CEC8">${esc(JA_TAGLINE)}</text>`
      : "",
    `<text x="66" y="474" font-family="Inter,sans-serif" font-weight="200" font-size="258" letter-spacing="-9" fill="#F0F3EC">${esc(input.no)}</text>`,
    `<text x="72" y="560" font-family="'Noto Sans JP',sans-serif" font-weight="500" font-size="46" fill="${LIME}">${esc(input.threat)}</text>`,
    scanline(".45"),
  ].join("");
};

/**
 * カード用を `<svg>` ごと返す（装飾なので `aria-hidden`）。
 *
 * アンカーは **xMin**。カードの枠は 16:10 で、この版面（16:8.4）を slice すると
 * 横がはみ出して切られる——中央寄せ（xMid）だと左端の "CRITICAL BRIEF" と
 * 番号の頭が欠ける。版面は左揃え（文字はすべて x=72）で右側は余白なので、
 * 左端を固定して右を落とすのが正しい。
 */
export const briefCardSvg = (
  input: BriefCardCoverInput,
  className?: string,
): string =>
  `<svg viewBox="0 0 ${String(BRIEF_COVER_WIDTH)} ${String(BRIEF_COVER_HEIGHT)}"` +
  ` preserveAspectRatio="xMinYMid slice" aria-hidden="true"` +
  (className === undefined ? "" : ` class="${className}"`) +
  `>${briefCardArtwork(input)}</svg>`;

/* ── OGP ─────────────────────────────────────────────────────────── */

/** 脅威タイプ名の文字寸法（C-4）。長い名前ほど小さく、下限 76・上限 152。 */
export const ogThreatFontSize = (threat: string): number =>
  Math.max(76, Math.min(152, Math.floor(1010 / Math.max(1, threat.length))));

/** 152〜121px は 4、120px 以下は 2（C-4）。 */
export const ogThreatLetterSpacing = (fontSize: number): number =>
  fontSize >= 121 ? 4 : 2;

/**
 * OGP のライムの下線。脅威タイプ名の実寸に合わせて右端を決める（C-4）。
 * 右余白 72px を割らないよう 1128 で頭打ちにする。
 */
export const ogUnderlineX2 = (threat: string, fontSize: number): number =>
  Math.min(1128, 72 + threat.length * fontSize);

export interface BriefOgCoverInput {
  readonly threat: string;
  /** ゼロ埋め済みの番号。 */
  readonly no: string;
  readonly key: string;
}

/**
 * OGP の**地**（`<svg>` の中身）。文字は satori 側で重ねる——Resvg は
 * フォントを持たないので、生の `<text>` はラスタライズで消える。
 * ここが出すのは地・格子・環境光・走査線・ライムの下線まで。
 */
export const briefOgArtwork = (input: BriefOgCoverInput): string => {
  const size = ogThreatFontSize(input.threat);
  return [
    backdrop(nextId("bfo", input.key), 60),
    scanline(".35"),
    `<line x1="72" y1="432" x2="${String(ogUnderlineX2(input.threat, size))}" y2="432" stroke="${LIME}" stroke-width="5"/>`,
  ].join("");
};
