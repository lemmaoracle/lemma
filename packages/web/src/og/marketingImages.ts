/**
 * Marketing-page OG wrappers — Homepage / Seal / Trust402 / Industries
 * / Pricing / Pillars. Each surface is a thin (≈10–20 line) function
 * that supplies a title, top-right label, bottom tagline, and
 * background to `buildOgArtboard`.
 *
 * Copy is locale-aware. The `信頼インフラ` anchor on Industries /
 * Pricing / Pillars is intentional per the v2 dev spec — these
 * surfaces land on social cards as standalone Lemma identity.
 *
 * **地は v47 のスレート＋ライム**（2026-08-05）。以前はクリーム＋サドルブラウン
 * だったが、サイト側が v47（トップ）・seal-v4・pricing v12・industry v1 と
 * スレート系に移り、Brief とブログ記事の OG も #767 でスレートになったため、
 * マーケ面だけが旧配色に取り残されていた。タイムライン上で同じ発信元に見えること
 * を優先して一式を揃える。Trust402 は独自のダーク（#B6F500）を維持する。
 */
import type { Locale } from "../i18n/translations";
import {
  LIME,
  MARKETING_BG,
  SLATE_MUTED,
  SLATE_TITLE,
  buildOgArtboard,
  makeBottomTagline,
  makeTopRightLabel,
  marketingBackdropSvg,
  renderOgPng,
} from "./ogBase";

/**
 * 見出しの直下に引くライムの線。トップ v47 の CTA（`.ctaline`）の実値をそのまま
 * 使う——3px・左から右へ濃くなるグラデーション・外周のにじみ。
 *
 * サイト側はスクロールで引かれるアニメーションだが、静止画の正解は
 * `prefers-reduced-motion` の最終状態（線は引き切り・先端の点は消える）なので、
 * 点は描かない。
 */
const CTA_RULE = {
  type: "div",
  props: {
    style: {
      marginTop: 28,
      width: 560,
      height: 3,
      borderRadius: 2,
      background: `linear-gradient(90deg, rgba(168,224,16,0.25), ${LIME})`,
      boxShadow: "0 0 16px rgba(168,224,16,0.45)",
    },
  },
};

/**
 * 行の見た目の幅を em で見積もる。全角は 1em、半角は 0.5em、空白は 0.28em。
 *
 * 半角は Space Grotesk 600 の実測が約 0.465em/字（`Prove what's real,` が
 * 100px で約 800px）。**わざと 0.5 に丸めて余裕を持たせている**——見積もりが
 * 実寸を下回ると1段大きい号数を選んでしまい、意図しない位置で折り返す。
 * 大きめに見積もる側の誤差は「1段小さく組む」だけで済む。
 */
function widthEm(line: string): number {
  return [...line].reduce((w, ch) => {
    if (ch === " ") return w + 0.28;
    // CJK・かな・全角記号は全角幅として数える
    return w + (/[　-〿぀-ヿ㐀-鿿＀-￯]/.test(ch) ? 1 : 0.5);
  }, 0);
}

/**
 * 版面に収まる最大の号数を選ぶ。
 *
 * 共通の `pickTitleFont` は「1行の文字数」で段を決めるため和文で破綻する
 * ——全角は 1文字 ≒ 1em なので、11文字を 100px で組むと 1100px になり
 * 版面（1010px）を超えて意図しない位置で折り返す。ここは幅で判定する。
 * 共通側を直すとユースケース・柱の詳細カードの号数まで動くので、この面だけで
 * 決める（`titleFont` を渡すと共通側の採寸は使われない）。
 */
function fitTitleFont(title: string): { size: number; lineHeight: number; maxWidth: number } {
  const lines = title.split("\n");
  const widest = Math.max(...lines.map(widthEm));
  /** ヘッダー・ライン・下段を除いた、見出しが使える高さ。 */
  const titleArea = 300;
  const candidates = [
    { size: 100, lineHeight: 1.1, maxWidth: 1010 },
    { size: 84, lineHeight: 1.12, maxWidth: 1040 },
    { size: 68, lineHeight: 1.16, maxWidth: 1040 },
    { size: 56, lineHeight: 1.2, maxWidth: 1040 },
  ];
  return (
    candidates.find(
      (c) =>
        widest * c.size <= c.maxWidth && lines.length * c.size * c.lineHeight <= titleArea,
    ) ?? candidates[candidates.length - 1]
  );
}

/**
 * マーケ面の共通指定。地は透過にして生 SVG を後ろへ差し込む。
 *
 * **見出しは塗り分けない**——クリーム1色にして、ライムは見出し直下の線1本だけに
 * 持たせる（v47 の CTA と同じ「メッセージ＋ライン」）。サイト側も h1・h3 に色付き
 * の語はなく、ライムは線・点・ボタンに限って使っている。左下のアクセントの帯は、
 * 線と競合するので出さない。
 */
function marketingArtboard(input: {
  title: string;
  label?: string;
  tagline?: string;
}): unknown {
  return buildOgArtboard({
    title: input.title,
    titleFont: fitTitleFont(input.title),
    titleColorOverride: SLATE_TITLE,
    accentOverride: LIME,
    afterTitle: CTA_RULE,
    hideFooterRule: true,
    topRight: input.label === undefined ? undefined : makeTopRightLabel(input.label, LIME),
    bottomTagline:
      input.tagline === undefined ? undefined : makeBottomTagline(input.tagline, SLATE_MUTED),
    background: MARKETING_BG,
  });
}

/** マーケ面はすべて同じ地なので、生成は1回で足りる。 */
const BACKDROP = marketingBackdropSvg();

interface Copy {
  readonly ja: string;
  readonly en: string;
}

function localize<T>(map: { ja: T; en: T }, locale: Locale): T {
  return locale === "ja" ? map.ja : map.en;
}

/* ───────────────────────── Homepage ───────────────────────── */

/**
 * トップの h1 と一致させる（`config/top-v47.{ja,en}.html`）。旧カードは
 * 「AI に、証明された事実を。」で、v47 で h1 が変わったあとも取り残されていた。
 * この画像は `getDefaultOgImage()` 経由で**専用 OG を持たない全ページの既定**
 * にもなるので、ここがサイトの顔になる。
 */
const HOME_TITLE: Copy = {
  ja: "AI時代に、\n何が本物かを証明する。",
  en: "Prove what's real,\nin the age of AI.",
};

const HOME_TAGLINE: Copy = {
  ja: "Built for decisions that matter",
  en: "Built for decisions that matter",
};

export async function renderHomeOg(locale: Locale): Promise<Buffer> {
  const node = marketingArtboard({
    title: localize(HOME_TITLE, locale),
    tagline: localize(HOME_TAGLINE, locale),
  });
  return renderOgPng(node, BACKDROP);
}

/* ───────────────────────── Product: Seal ───────────────────────── */

const SEAL_TITLE: Copy = {
  ja: "鍵ではなく、\n証明を送る。",
  en: "Send proofs,\nnot keys.",
};

const SEAL_LABEL: Copy = {
  ja: "For Developers · Seal",
  en: "For Developers · Seal",
};

const SEAL_TAGLINE: Copy = {
  ja: "ZK Sign-in SDK · Open source",
  en: "ZK Sign-in SDK · Open source",
};

export async function renderSealOg(locale: Locale): Promise<Buffer> {
  const node = marketingArtboard({
    title: localize(SEAL_TITLE, locale),
    label: localize(SEAL_LABEL, locale),
    tagline: localize(SEAL_TAGLINE, locale),
  });
  return renderOgPng(node, BACKDROP);
}

/* ───────────────────────── Product: Trust402 ─────────────────────────
 * Trust402 (Pay + Sell) carries a developer sub-brand tone — fluorescent
 * green (#B6F500) on dark ink (#1F1E1A), not the cream/brown marketing
 * tone. These cards match the page: dark background, light logo/title,
 * a green accent word + rule, green label, muted-light tagline. */
const T402_INK = "#1F1E1A";
const T402_INK_DEEP = "#141310";
const T402_GREEN = "#B6F500";
const T402_FG = "#ECEBE3";
const T402_MUTED = "#8F8E86";
/** Dark gradient, flagged isDark so the shared artboard lightens the logo/text. */
const T402_DARK_BG = { kind: "gradient" as const, from: T402_INK, to: T402_INK_DEEP, isDark: true };

const TRUST402_TITLE: Copy = {
  ja: "AI エージェントの\n支払いに、<accent>信頼を</accent>。",
  en: "Trust for AI agent\n<accent>payments</accent>.",
};

const TRUST402_LABEL: Copy = {
  ja: "For Agent Builders · Trust402",
  en: "For Agent Builders · Trust402",
};

const TRUST402_TAGLINE: Copy = {
  ja: "x402 · MCP · A2A · USDC",
  en: "x402 · MCP · A2A · USDC",
};

export async function renderTrust402Og(locale: Locale): Promise<Buffer> {
  const node = buildOgArtboard({
    title: localize(TRUST402_TITLE, locale),
    titleColorOverride: T402_FG,
    accentOverride: T402_GREEN,
    topRight: makeTopRightLabel(localize(TRUST402_LABEL, locale), T402_GREEN),
    bottomTagline: makeBottomTagline(localize(TRUST402_TAGLINE, locale), T402_MUTED),
    background: T402_DARK_BG,
  });
  return renderOgPng(node);
}

/* ───────────────────────── Trust402 · Sell ─────────────────────────
 * Own card for /trust402/sell/ social shares, same developer tone. JA
 * production uses the delivered v9 listing card (dark + green as well);
 * this generator gives EN a matching card and JA a fallback. */
const TRUST402_SELL_TITLE: Copy = {
  ja: "その成果を、AI エージェントに\n<accent>売れる</accent>。",
  en: "Get paid by AI agents\n<accent>for your work</accent>.",
};

const TRUST402_SELL_LABEL: Copy = {
  ja: "For Researchers & Creators · Trust402 · Sell",
  en: "For Researchers & Creators · Trust402 · Sell",
};

const TRUST402_SELL_TAGLINE: Copy = {
  ja: "データ · 論文 · USDC · 手数料 0%",
  en: "Datasets · Papers · USDC · 0% commission",
};

export async function renderTrust402SellOg(locale: Locale): Promise<Buffer> {
  const node = buildOgArtboard({
    title: localize(TRUST402_SELL_TITLE, locale),
    titleColorOverride: T402_FG,
    accentOverride: T402_GREEN,
    topRight: makeTopRightLabel(localize(TRUST402_SELL_LABEL, locale), T402_GREEN),
    bottomTagline: makeBottomTagline(localize(TRUST402_SELL_TAGLINE, locale), T402_MUTED),
    background: T402_DARK_BG,
  });
  return renderOgPng(node);
}

/* ───────────────────────── Product: Industries ───────────────────────── */

const INDUSTRIES_TITLE: Copy = {
  ja: "信頼インフラを、\n業界の現場へ。",
  en: "The Trust Infrastructure,\nfor the industries.",
};

const INDUSTRIES_LABEL: Copy = {
  ja: "For Enterprise · Industries",
  en: "For Enterprise · Industries",
};

const INDUSTRIES_TAGLINE: Copy = {
  ja: "Civic · Critical · Compliance",
  en: "Civic · Critical · Compliance",
};

export async function renderIndustriesOg(locale: Locale): Promise<Buffer> {
  const node = marketingArtboard({
    title: localize(INDUSTRIES_TITLE, locale),
    label: localize(INDUSTRIES_LABEL, locale),
    tagline: localize(INDUSTRIES_TAGLINE, locale),
  });
  return renderOgPng(node, BACKDROP);
}

/* ───────────────────────── Pricing ───────────────────────── */

const PRICING_TITLE: Copy = {
  ja: "信頼インフラの、\n導入相談から。",
  en: "Start from a Discovery\nCall, not a price tag.",
};

const PRICING_LABEL: Copy = {
  ja: "Plans · Pricing",
  en: "Plans · Pricing",
};

const PRICING_TAGLINE: Copy = {
  ja: "Discovery Call · 30 分 · 無料",
  en: "Discovery Call · 30 min · Free",
};

export async function renderPricingOg(locale: Locale): Promise<Buffer> {
  const node = marketingArtboard({
    title: localize(PRICING_TITLE, locale),
    label: localize(PRICING_LABEL, locale),
    tagline: localize(PRICING_TAGLINE, locale),
  });
  return renderOgPng(node, BACKDROP);
}

/* ───────────────────────── Pillars ───────────────────────── */

const PILLARS_TITLE: Copy = {
  ja: "Lemma API、\n5つの証明をひとつの API で。",
  en: "The Lemma API,\nfive proofs in one API.",
};

const PILLARS_LABEL: Copy = {
  ja: "Lemma API · Five Proofs",
  en: "Lemma API · Five Proofs",
};

const PILLARS_TAGLINE: Copy = {
  ja: "Provenance · Verifiable AI · Agent · Regulatory",
  en: "Provenance · Verifiable AI · Agent · Regulatory",
};

export async function renderPillarsOg(locale: Locale): Promise<Buffer> {
  const node = marketingArtboard({
    title: localize(PILLARS_TITLE, locale),
    label: localize(PILLARS_LABEL, locale),
    tagline: localize(PILLARS_TAGLINE, locale),
  });
  return renderOgPng(node, BACKDROP);
}

/* ─────────────── AI 業務あんしん LP (/ai-gyomu-anshin/) ─────────────── */

const AIANSHIN_TITLE: Copy = {
  ja: "本物のデータだけを、\nAIに。",
  en: "Only authentic data,\nfor your AI.",
};

const AIANSHIN_LABEL: Copy = {
  ja: "AI導入ガイド",
  en: "AI Adoption Guide",
};

const AIANSHIN_TAGLINE: Copy = {
  ja: "中身を渡さず、「本物である」ことだけを証明する。",
  en: "Hand over no data — prove only that it's authentic.",
};

export async function renderAiGyomuAnshinOg(locale: Locale): Promise<Buffer> {
  const node = marketingArtboard({
    title: localize(AIANSHIN_TITLE, locale),
    label: localize(AIANSHIN_LABEL, locale),
    tagline: localize(AIANSHIN_TAGLINE, locale),
  });
  return renderOgPng(node, BACKDROP);
}

/* ─────────────── Model comparison LPs (/compare/...) ─────────────── */

const COMPARE_COPY: Record<string, { title: Copy; label: Copy; tagline: Copy }> = {
  "ai-models-attack-resistance": {
    title: {
      ja: "6 つの AI モデルに、\n同じ攻撃を仕掛けた。",
      en: "Six AI models,\none identical attack.",
    },
    label: {
      ja: "AIモデル比較 · 攻撃耐性",
      en: "AI Model Comparison · Attack Resistance",
    },
    tagline: {
      ja: "AI を攻撃役にすると、防御は抜かれた。止めるのは Lemma。",
      en: "Make an AI the attacker, and defenses fall. Lemma stops it.",
    },
  },
  "fable5-vs-kimi": {
    title: {
      ja: "Claude Fable 5\nvs Kimi-K2.6",
      en: "Claude Fable 5\nvs Kimi-K2.6",
    },
    label: {
      ja: "AIモデル比較 · 1対1",
      en: "AI Model Comparison · Head-to-head",
    },
    tagline: {
      ja: "拒否できても、守れない。止めるのは Lemma。",
      en: "Refusal isn’t protection. Lemma stops the attack.",
    },
  },
  "gpt5-vs-opus": {
    title: {
      ja: "GPT-5.5\nvs Opus 4.8",
      en: "GPT-5.5\nvs Opus 4.8",
    },
    label: {
      ja: "AIモデル比較 · 1対1",
      en: "AI Model Comparison · Head-to-head",
    },
    tagline: {
      ja: "最強モデルほど、よく破った — 止めるのは Lemma。",
      en: "The strongest models broke the most — Lemma stops them.",
    },
  },
};

export async function renderCompareOg(slug: string, locale: Locale): Promise<Buffer> {
  const c = COMPARE_COPY[slug] ?? COMPARE_COPY["ai-models-attack-resistance"];
  const node = marketingArtboard({
    title: localize(c.title, locale),
    label: localize(c.label, locale),
    tagline: localize(c.tagline, locale),
  });
  return renderOgPng(node, BACKDROP);
}
