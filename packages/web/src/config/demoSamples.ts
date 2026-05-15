/**
 * Slug → demo sample mapping for the v0.3.1.1 reciprocal entry points
 * (spec §3g). Updating this file is the only edit needed when the demo
 * adds or retires a sample.
 *
 * Pillar 01 (verifiable-origin) and Use Case `defi-bridge-verification`
 * are intentionally absent — their target samples are deferred per the
 * spec roadmap.
 */

import type { Locale } from "../i18n/translations";

export type DemoSampleId =
  | "financial_valid_approval"
  | "financial_tampered_output"
  | "manufacturing_valid_process"
  | "manufacturing_model_swap"
  | "agent_valid_chain_with_x402"
  | "agent_replay_duplicate";

export type DemoSource = "pillars" | "use-cases" | "trust402";

const PILLAR_SAMPLES: Readonly<Record<string, DemoSampleId | undefined>> = {
  "verifiable-origin": undefined,
  "verifiable-ai": "financial_valid_approval",
  "agent-authority-proof": "agent_valid_chain_with_x402",
  "regulatory-attribute-proof": "financial_valid_approval",
};

const USE_CASE_SAMPLES: Readonly<Record<string, DemoSampleId | undefined>> = {
  "kyc-aml-selective-disclosure": "financial_valid_approval",
  "ai-audit-log-proof": "financial_tampered_output",
  "supply-chain-esg": "manufacturing_valid_process",
  "defi-bridge-verification": undefined,
  "x402-commerce": "agent_valid_chain_with_x402",
};

/**
 * Secondary inline pair-link for use-case pages where comparing valid vs
 * invalid in-page is meaningful. Rendered inside the page body, not as a
 * second CTA component (spec §3g supply-chain-esg row).
 */
export const USE_CASE_PAIR_SAMPLE: Readonly<Record<string, DemoSampleId | undefined>> = {
  "supply-chain-esg": "manufacturing_model_swap",
};

export function getDemoSampleForPillar(slug: string): DemoSampleId | null {
  return PILLAR_SAMPLES[slug] ?? null;
}

export function getDemoSampleForUseCase(slug: string): DemoSampleId | null {
  return USE_CASE_SAMPLES[slug] ?? null;
}

export function getUseCasePairSample(slug: string): DemoSampleId | null {
  return USE_CASE_PAIR_SAMPLE[slug] ?? null;
}

/**
 * Build the demo deep-link URL with the v0.3 UTM convention (§6). The
 * `?sample=` query is what `demo/packages/demo` consumes on first load
 * and converts to `#sample=<id>` for in-app round-trip (spec §2a).
 */
export function buildDemoUrl(
  sampleId: DemoSampleId,
  locale: Locale,
  source: DemoSource,
): string {
  const localePath = locale === "ja" ? "ja/" : "";
  const url = new URL(`https://demo.lemma.frame00.com/${localePath}`);
  url.searchParams.set("sample", sampleId);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "web");
  url.searchParams.set("utm_campaign", "ppsi_provenance");
  url.searchParams.set("utm_content", sampleId);
  return url.toString();
}
