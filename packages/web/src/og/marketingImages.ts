/**
 * Marketing-page OG wrappers — Homepage / Seal / Trust402 / Industries
 * / Pricing / Pillars. Each surface is a thin (≈10–20 line) function
 * that supplies a title, top-right label, bottom tagline, and
 * background to `buildOgArtboard`.
 *
 * Copy is locale-aware. The `信頼インフラ` anchor on Industries /
 * Pricing / Pillars is intentional per the v2 dev spec — these
 * surfaces land on social cards as standalone Lemma identity.
 */
import type { Locale } from "../i18n/translations";
import {
  BROWN,
  CREAM_DEEP,
  PRODUCT_GRADIENT,
  buildOgArtboard,
  makeBottomTagline,
  makeTopRightLabel,
  renderOgPng,
} from "./ogBase";

interface Copy {
  readonly ja: string;
  readonly en: string;
}

function localize<T>(map: { ja: T; en: T }, locale: Locale): T {
  return locale === "ja" ? map.ja : map.en;
}

/* ───────────────────────── Homepage ───────────────────────── */

const HOME_TITLE: Copy = {
  ja: "AI に、\n<accent>証明された事実</accent>を。",
  en: "Give AI\n<accent>proven facts</accent>.",
};

const HOME_TAGLINE: Copy = {
  ja: "Built for decisions that matter",
  en: "Built for decisions that matter",
};

export async function renderHomeOg(locale: Locale): Promise<Buffer> {
  const node = buildOgArtboard({
    title: localize(HOME_TITLE, locale),
    bottomTagline: makeBottomTagline(localize(HOME_TAGLINE, locale), BROWN),
    background: { kind: "solid", color: CREAM_DEEP },
  });
  return renderOgPng(node);
}

/* ───────────────────────── Product: Seal ───────────────────────── */

const SEAL_TITLE: Copy = {
  ja: "鍵ではなく、\n<accent>証明を送る</accent>。",
  en: "Send proofs,\n<accent>not keys</accent>.",
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
  const node = buildOgArtboard({
    title: localize(SEAL_TITLE, locale),
    topRight: makeTopRightLabel(localize(SEAL_LABEL, locale), BROWN),
    bottomTagline: makeBottomTagline(localize(SEAL_TAGLINE, locale), BROWN),
    background: PRODUCT_GRADIENT,
  });
  return renderOgPng(node);
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
  ja: "<accent>信頼インフラ</accent>を、\n業界の現場へ。",
  en: "<accent>The Trust Infrastructure</accent>,\nfor the industries.",
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
  const node = buildOgArtboard({
    title: localize(INDUSTRIES_TITLE, locale),
    topRight: makeTopRightLabel(localize(INDUSTRIES_LABEL, locale), BROWN),
    bottomTagline: makeBottomTagline(localize(INDUSTRIES_TAGLINE, locale), BROWN),
    background: PRODUCT_GRADIENT,
  });
  return renderOgPng(node);
}

/* ───────────────────────── Pricing ───────────────────────── */

const PRICING_TITLE: Copy = {
  ja: "<accent>信頼インフラ</accent>の、\n導入相談から。",
  en: "Start from a Discovery\nCall, <accent>not a price tag</accent>.",
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
  const node = buildOgArtboard({
    title: localize(PRICING_TITLE, locale),
    topRight: makeTopRightLabel(localize(PRICING_LABEL, locale), BROWN),
    bottomTagline: makeBottomTagline(localize(PRICING_TAGLINE, locale), BROWN),
    background: PRODUCT_GRADIENT,
  });
  return renderOgPng(node);
}

/* ───────────────────────── Pillars ───────────────────────── */

const PILLARS_TITLE: Copy = {
  ja: "<accent>信頼インフラ</accent>を、\n4 つの軸で。",
  en: "<accent>The Trust Infrastructure</accent>,\nin four axes.",
};

const PILLARS_LABEL: Copy = {
  ja: "Trust Infrastructure · Pillars",
  en: "Trust Infrastructure · Pillars",
};

const PILLARS_TAGLINE: Copy = {
  ja: "Provenance · Verifiable AI · Agent · Regulatory",
  en: "Provenance · Verifiable AI · Agent · Regulatory",
};

export async function renderPillarsOg(locale: Locale): Promise<Buffer> {
  const node = buildOgArtboard({
    title: localize(PILLARS_TITLE, locale),
    topRight: makeTopRightLabel(localize(PILLARS_LABEL, locale), BROWN),
    bottomTagline: makeBottomTagline(localize(PILLARS_TAGLINE, locale), BROWN),
    background: PRODUCT_GRADIENT,
  });
  return renderOgPng(node);
}

/* ─────────────── AI 業務あんしん LP (/ai-gyomu-anshin/) ─────────────── */

const AIANSHIN_TITLE: Copy = {
  ja: "「AIは不安」を、\n<accent>「任せて安心」</accent>へ。",
  en: 'From "AI feels risky"\nto <accent>"safe to delegate."</accent>',
};

const AIANSHIN_LABEL: Copy = {
  ja: "AI導入ガイド",
  en: "AI Adoption Guide",
};

const AIANSHIN_TAGLINE: Copy = {
  ja: "社内のデータは外に出さず、確かめた事実だけを AI へ。",
  en: "Your data stays in-house — only verified facts reach the AI.",
};

export async function renderAiGyomuAnshinOg(locale: Locale): Promise<Buffer> {
  const node = buildOgArtboard({
    title: localize(AIANSHIN_TITLE, locale),
    topRight: makeTopRightLabel(localize(AIANSHIN_LABEL, locale), BROWN),
    bottomTagline: makeBottomTagline(localize(AIANSHIN_TAGLINE, locale), BROWN),
    background: { kind: "solid", color: CREAM_DEEP },
  });
  return renderOgPng(node);
}

/* ─────────────── Model comparison LPs (/compare/...) ─────────────── */

const COMPARE_COPY: Record<string, { title: Copy; label: Copy; tagline: Copy }> = {
  "ai-models-attack-resistance": {
    title: {
      ja: "6 つの AI モデルに、\n<accent>同じ攻撃</accent>を仕掛けた。",
      en: "Six AI models,\n<accent>one identical attack.</accent>",
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
      ja: "Claude Fable 5\n<accent>vs Kimi-K2.6</accent>",
      en: "Claude Fable 5\n<accent>vs Kimi-K2.6</accent>",
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
      ja: "GPT-5.5\n<accent>vs Opus 4.8</accent>",
      en: "GPT-5.5\n<accent>vs Opus 4.8</accent>",
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

export async function renderCompareOg(
  slug: string,
  locale: Locale,
): Promise<Buffer> {
  const c = COMPARE_COPY[slug] ?? COMPARE_COPY["ai-models-attack-resistance"];
  const node = buildOgArtboard({
    title: localize(c.title, locale),
    topRight: makeTopRightLabel(localize(c.label, locale), BROWN),
    bottomTagline: makeBottomTagline(localize(c.tagline, locale), BROWN),
    background: PRODUCT_GRADIENT,
  });
  return renderOgPng(node);
}
