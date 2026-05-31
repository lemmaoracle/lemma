/**
 * Display copy for the Lemma Critical Brief archive pages.
 *
 * Single source of truth for Pillar / Category labels and descriptions
 * across `pages/critical/briefs/pillar/*` and
 * `pages/critical/briefs/category/*` (and their JA mirrors).
 *
 * Slug enums and Pillar/category membership live in
 * `src/content.config.ts` (Zod). Keep the slug lists here in sync with
 * that file — adding a category in only one place will surface as a
 * Type error against `Record<CategorySlug, ...>`.
 */

import type { Locale } from "../i18n/translations";

export type PillarSlug =
  | "01-verifiable-origin"
  | "02-verifiable-ai"
  | "03-agent-authority"
  | "04-regulatory-attribute";

export type CategorySlug =
  // Pillar 01
  | "bridge-config-trust"
  | "code-provenance"
  | "data-provenance"
  | "training-data-provenance"
  // Pillar 02
  | "ai-decision-integrity"
  | "ai-bias-harm"
  | "model-supply-chain"
  // Pillar 03
  | "agent-runaway"
  | "agent-infrastructure"
  | "agent-payment-abuse"
  // Pillar 04
  | "kyc-aml-disclosure"
  | "attribute-proof-bypass"
  // Crosscutting
  | "identity-auth";

export const PILLAR_SLUGS: ReadonlyArray<PillarSlug> = [
  "01-verifiable-origin",
  "02-verifiable-ai",
  "03-agent-authority",
  "04-regulatory-attribute",
];

export const CATEGORIES_BY_PILLAR: Readonly<
  Record<PillarSlug, ReadonlyArray<CategorySlug>>
> = {
  "01-verifiable-origin": [
    "bridge-config-trust",
    "code-provenance",
    "data-provenance",
    "training-data-provenance",
  ],
  "02-verifiable-ai": [
    "ai-decision-integrity",
    "ai-bias-harm",
    "model-supply-chain",
  ],
  "03-agent-authority": [
    "agent-runaway",
    "agent-infrastructure",
    "agent-payment-abuse",
  ],
  "04-regulatory-attribute": [
    "kyc-aml-disclosure",
    "attribute-proof-bypass",
  ],
};

export const CROSSCUTTING_CATEGORIES: ReadonlyArray<CategorySlug> = [
  "identity-auth",
];

interface LocalizedCopy {
  readonly ja: string;
  readonly en: string;
}

/** Short display label (used in badges, hero, breadcrumbs). */
export const PILLAR_LABELS: Readonly<Record<PillarSlug, LocalizedCopy>> = {
  "01-verifiable-origin": {
    ja: "Pillar 01 来歴証明",
    en: "Pillar 01 Verifiable Origin",
  },
  "02-verifiable-ai": {
    ja: "Pillar 02 検証可能 AI",
    en: "Pillar 02 Verifiable AI",
  },
  "03-agent-authority": {
    ja: "Pillar 03 エージェント権限証明",
    en: "Pillar 03 Agent Authority Proof",
  },
  "04-regulatory-attribute": {
    ja: "Pillar 04 規制属性証明",
    en: "Pillar 04 Regulatory Attribute Proof",
  },
};

/** One-line description (Methodology #256 §4 derived). */
export const PILLAR_DESCRIPTIONS: Readonly<Record<PillarSlug, LocalizedCopy>> = {
  "01-verifiable-origin": {
    ja: "メッセージ・データ・コードの origin を独立検証する層。",
    en: "The layer that independently verifies the origin of messages, data, and code.",
  },
  "02-verifiable-ai": {
    ja: "AI 判断の過程を ZK で commit する層。",
    en: "The layer that ZK-commits the process of AI judgment.",
  },
  "03-agent-authority": {
    ja: "エージェントの委任関係を証跡化する層。",
    en: "The layer that records and proves the delegation relationships of agents.",
  },
  "04-regulatory-attribute": {
    ja: "KYC / AML / 規制属性を選択的開示で証明する層。",
    en: "The layer that proves KYC / AML / regulatory attributes via selective disclosure.",
  },
};

export const CATEGORY_LABELS: Readonly<Record<CategorySlug, LocalizedCopy>> = {
  "bridge-config-trust": {
    ja: "Bridge Config Trust",
    en: "Bridge Config Trust",
  },
  "code-provenance": { ja: "Code Provenance", en: "Code Provenance" },
  "data-provenance": { ja: "Data Provenance", en: "Data Provenance" },
  "training-data-provenance": {
    ja: "Training Data Provenance",
    en: "Training Data Provenance",
  },
  "ai-decision-integrity": {
    ja: "AI Decision Integrity",
    en: "AI Decision Integrity",
  },
  "ai-bias-harm": { ja: "AI Bias / Harm", en: "AI Bias / Harm" },
  "model-supply-chain": {
    ja: "Model Supply Chain",
    en: "Model Supply Chain",
  },
  "agent-runaway": { ja: "Agent Runaway", en: "Agent Runaway" },
  "agent-infrastructure": {
    ja: "Agent Infrastructure",
    en: "Agent Infrastructure",
  },
  "agent-payment-abuse": {
    ja: "Agent Payment Abuse",
    en: "Agent Payment Abuse",
  },
  "kyc-aml-disclosure": {
    ja: "KYC / AML Disclosure",
    en: "KYC / AML Disclosure",
  },
  "attribute-proof-bypass": {
    ja: "Attribute Proof Bypass",
    en: "Attribute Proof Bypass",
  },
  "identity-auth": { ja: "Identity & Auth", en: "Identity & Auth" },
};

/** Category descriptions. JA from the template doc; EN translated to Lemma voice. */
export const CATEGORY_DESCRIPTIONS: Readonly<Record<CategorySlug, LocalizedCopy>> = {
  "bridge-config-trust": {
    ja: "bridge 信頼設定の単一鍵集中、cross-chain message origin の偽装。",
    en: "Single-key concentration in bridge trust configs; cross-chain message origin forgery.",
  },
  "code-provenance": {
    ja: "supply chain attack、commit forgery、CI/CD 経由侵入。",
    en: "Supply-chain attacks, commit forgery, intrusion via CI/CD.",
  },
  "data-provenance": {
    ja: "RAG poisoning、訓練データ汚染、document chain の改ざん。",
    en: "RAG poisoning, training-data contamination, tampered document chains.",
  },
  "training-data-provenance": {
    ja: "AI training data の収集元・利用 scope 属性が独立検証されないまま下流に流通する構造を扱う。chat プラットフォームの公開 API 経由 scraping、規約違反 scope での dataset 配布、AI training audit 層の不在等。",
    en: "Structures where the origin and use-scope attributes of AI training data flow downstream without independent verification — public-API scraping of chat platforms, dataset distribution outside the licensed scope, gaps in AI training-data audit layers.",
  },
  "ai-decision-integrity": {
    ja: "ハルシネーション訴訟、誤判断による業務損害、出力の根拠不在。",
    en: "Hallucination litigation, operational harm from misjudgment, ungrounded outputs.",
  },
  "ai-bias-harm": {
    ja: "差別的出力、偏見ベースの自動拒否、保護属性に基づく不公正。",
    en: "Discriminatory output, bias-driven automatic rejection, unfair treatment on protected attributes.",
  },
  "model-supply-chain": {
    ja: "poisoned model weights、backdoored checkpoints、評価データ汚染。",
    en: "Poisoned model weights, backdoored checkpoints, evaluation-data contamination.",
  },
  "agent-runaway": {
    ja: "自律エージェントの権限外行動、意図しない決済・契約・委任。",
    en: "Autonomous agents acting outside authority; unintended payments, contracts, or delegation.",
  },
  "agent-infrastructure": {
    ja: "Starlette/BadHost、MCP server credential 漏洩、エージェントハーネスの脆弱性。",
    en: "Starlette/BadHost-class agent-harness vulnerabilities, MCP server credential leaks.",
  },
  "agent-payment-abuse": {
    ja: "x402 経由の不正消費、escrow 操作、署名権限の濫用。",
    en: "Unauthorized consumption via x402, escrow manipulation, signing-authority abuse.",
  },
  "kyc-aml-disclosure": {
    ja: "PII の過開示、KYC ベース漏洩、custody chain の規制違反。",
    en: "PII over-disclosure, KYC-anchored leaks, custody-chain regulatory violations.",
  },
  "attribute-proof-bypass": {
    ja: "属性主張の未検証 accept、年齢・国籍・jurisdiction 偽装。",
    en: "Unverified acceptance of attribute claims; age, nationality, or jurisdiction forgery.",
  },
  "identity-auth": {
    ja: "credential 漏洩、key compromise、認証回避。",
    en: "Credential leaks, key compromise, authentication bypass.",
  },
};

export function pillarLabel(pillar: PillarSlug, locale: Locale): string {
  return PILLAR_LABELS[pillar][locale];
}

export function pillarDescription(pillar: PillarSlug, locale: Locale): string {
  return PILLAR_DESCRIPTIONS[pillar][locale];
}

export function categoryLabel(category: CategorySlug, locale: Locale): string {
  return CATEGORY_LABELS[category][locale];
}

export function categoryDescription(
  category: CategorySlug,
  locale: Locale,
): string {
  return CATEGORY_DESCRIPTIONS[category][locale];
}

/**
 * Which Pillar a category belongs to. Crosscutting categories (identity-auth)
 * return null — they have no canonical owning Pillar.
 */
export function pillarFor(category: CategorySlug): PillarSlug | null {
  for (const pillar of PILLAR_SLUGS) {
    if (
      (CATEGORIES_BY_PILLAR[pillar] as ReadonlyArray<CategorySlug>).includes(
        category,
      )
    ) {
      return pillar;
    }
  }
  return null;
}
