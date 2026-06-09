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
  ja: "データを渡さず、\n<accent>AI を動かす</accent>。",
  en: "AI runs on proofs,\n<accent>not data</accent>.",
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

/* ───────────────────────── Product: Trust402 ───────────────────────── */

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
    topRight: makeTopRightLabel(localize(TRUST402_LABEL, locale), BROWN),
    bottomTagline: makeBottomTagline(localize(TRUST402_TAGLINE, locale), BROWN),
    background: PRODUCT_GRADIENT,
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
