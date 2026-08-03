/**
 * Use case detail page — exit CTA variant map.
 *
 * Each entry maps a use-case slug to the reader / industry pairing that
 * drives the `<UseCaseExitCta>` rendering. The lookup matches the
 * "frontmatter pillar/industry から自動" rule in
 * `usecase_exit_cta_block.html` so the writer never edits this map per
 * page — adding a new use case slug here once is enough.
 *
 * Unmapped slugs fall back to a generic enterprise variant inside the
 * component, so the page always renders something sensible.
 */

export type ExitPillarCode = "P1" | "P2" | "P3" | "P4";
export type ExitReader = "enterprise" | "dev";
export type ExitIndustry = "finance" | "public" | "manufacturing" | "service" | "ai" | "developer";

export interface ExitVariant {
  readonly reader: ExitReader;
  readonly pillarCode: ExitPillarCode;
  readonly industry: ExitIndustry;
  /** Suffix that follows "導入を相談" on the primary CTA: "(Compliance)", "" etc. */
  readonly planLabel: string;
}

const PILLAR_FROM_SLUG: Record<string, ExitPillarCode> = {
  "01-verifiable-origin": "P1",
  "02-verifiable-ai": "P2",
  "03-agent-authority": "P3",
  "04-regulatory-attribute": "P4",
};

export const PILLAR_LABEL_JA: Record<ExitPillarCode, string> = {
  P1: "来歴証明",
  P2: "検証可能 AI",
  P3: "エージェント権限証明",
  P4: "規制属性証明",
};

export const PILLAR_HREF: Record<ExitPillarCode, string> = {
  P1: "/pillars/#provenance",
  P2: "/pillars/#inference",
  P3: "/pillars/#authority",
  P4: "/pillars/#attribute",
};

export const INDUSTRY_LABEL_JA: Record<ExitIndustry, string> = {
  finance: "金融",
  public: "公共",
  manufacturing: "製造・調達",
  service: "サービス・小売",
  ai: "AI 横断",
  developer: "開発者",
};

/* Per-slug assignments transcribed from the handoff in
   usecase_exit_cta_block.html ([全19ユースケースの割り当て早見]). */
export const USE_CASE_EXIT_VARIANTS: Readonly<Record<string, ExitVariant>> = {
  // Enterprise — Finance → Compliance
  "kyc-aml-selective-disclosure": { reader: "enterprise", pillarCode: "P4", industry: "finance", planLabel: "(Compliance)" },
  "financial-data-exfiltration":  { reader: "enterprise", pillarCode: "P4", industry: "finance", planLabel: "(Compliance)" },
  "counterparty-screening":       { reader: "enterprise", pillarCode: "P4", industry: "finance", planLabel: "(Compliance)" },
  "ai-audit-log-proof":            { reader: "enterprise", pillarCode: "P2", industry: "finance", planLabel: "(Compliance)" },
  "internal-control-approval-proof": { reader: "enterprise", pillarCode: "P1", industry: "finance", planLabel: "(Compliance)" },

  // Enterprise — Public → Civic
  "benefit-eligibility-proof":     { reader: "enterprise", pillarCode: "P4", industry: "public", planLabel: "(Civic)" },
  "credential-presentation":       { reader: "enterprise", pillarCode: "P4", industry: "public", planLabel: "(Civic)" },
  "long-term-contract-record":     { reader: "enterprise", pillarCode: "P1", industry: "public", planLabel: "(Civic)" },
  "qualified-worker-attestation":  { reader: "enterprise", pillarCode: "P4", industry: "public", planLabel: "(Civic)" },

  // Enterprise — Service & Retail (batch4 svc taxonomy)
  "customer-flag-need-to-know":   { reader: "enterprise", pillarCode: "P4", industry: "service", planLabel: "(Compliance)" },
  "age-eligibility-verification": { reader: "enterprise", pillarCode: "P4", industry: "service", planLabel: "(Compliance)" },
  "store-network-compliance":     { reader: "enterprise", pillarCode: "P4", industry: "service", planLabel: "(Critical)" },
  "incident-response-record":     { reader: "enterprise", pillarCode: "P1", industry: "service", planLabel: "(Critical)" },
  "work-fitness-attestation":     { reader: "enterprise", pillarCode: "P4", industry: "service", planLabel: "(Critical)" },

  // Enterprise — Manufacturing/Procurement → Critical
  "supply-chain-esg":                  { reader: "enterprise", pillarCode: "P4", industry: "manufacturing", planLabel: "(Critical)" },
  "supply-chain-component-provenance": { reader: "enterprise", pillarCode: "P1", industry: "manufacturing", planLabel: "(Critical)" },
  "supplier-credential-verification":  { reader: "enterprise", pillarCode: "P4", industry: "manufacturing", planLabel: "(Critical)" },

  // Enterprise — AI cross → general
  "ai-document-isolation":  { reader: "enterprise", pillarCode: "P2", industry: "ai", planLabel: "" },
  "rag-content-provenance": { reader: "enterprise", pillarCode: "P1", industry: "ai", planLabel: "" },
  "rag-source-attestation": { reader: "enterprise", pillarCode: "P2", industry: "ai", planLabel: "" },

  // Developer-led
  "x402-commerce":           { reader: "dev", pillarCode: "P1", industry: "developer", planLabel: "" },
  "defi-bridge-verification": { reader: "dev", pillarCode: "P1", industry: "developer", planLabel: "" },
  "multi-agent-workflows":   { reader: "dev", pillarCode: "P3", industry: "developer", planLabel: "" },
  "delegated-treasury":      { reader: "dev", pillarCode: "P3", industry: "developer", planLabel: "" },
};

/**
 * Resolves a use-case slug to its exit variant. Falls back to a generic
 * enterprise variant when the slug is not in the map, deriving the pillar
 * code from the supplied `fallbackPillarSlug` (the use-case frontmatter's
 * `pillar` field, e.g. "verifiable-origin"). The fallback uses no plan
 * label and the AI industry tag because that's the broadest "consult
 * generally" surface.
 */
export function getUseCaseExitVariant(
  slug: string,
  fallbackPillarSlug: string,
): ExitVariant {
  const direct = USE_CASE_EXIT_VARIANTS[slug];
  if (direct) return direct;
  const normalized = fallbackPillarSlug.startsWith("0")
    ? fallbackPillarSlug
    : `0?-${fallbackPillarSlug}`;
  const guessed = PILLAR_FROM_SLUG[normalized]
    ?? PILLAR_FROM_SLUG[`01-${fallbackPillarSlug}`]
    ?? PILLAR_FROM_SLUG[`02-${fallbackPillarSlug}`]
    ?? PILLAR_FROM_SLUG[`03-${fallbackPillarSlug}`]
    ?? PILLAR_FROM_SLUG[`04-${fallbackPillarSlug}`]
    ?? "P1";
  return {
    reader: "enterprise",
    pillarCode: guessed,
    industry: "ai",
    planLabel: "",
  };
}
