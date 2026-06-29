/**
 * Use-case → recommended plan (Civic / Critical / Compliance).
 *
 * DRAFT (2026-06-27) — assignments proposed from each use case's business
 * domain (pillar alone does not determine the plan). Pending product review.
 *
 *   - civic      : public-sector / B2B2G / citizen-facing services
 *   - compliance : KYC-AML, regulatory-attribute, selective disclosure, audit
 *   - critical   : business-critical operations, operational AI, agent ops,
 *                  supply-chain provenance
 *
 * Keyed by use-case slug (see data/useCases.ts). A slug absent from this map
 * renders no plan badge, so partial coverage is safe.
 */
import type { PlanKey } from "./plans";

export const USE_CASE_PLAN: Readonly<Record<string, PlanKey>> = {
  // Public sector / citizen-facing → Civic
  "benefit-eligibility-proof": "civic",
  "public-procurement-attestation": "civic",
  "credential-presentation": "civic",

  // KYC-AML / regulatory-attribute / audit / financial → Compliance
  "kyc-aml-selective-disclosure": "compliance",
  "ai-act-compliance-attestation": "compliance",
  "age-eligibility-verification": "compliance",
  "cbam-supplier-attestation": "compliance",
  "counterparty-screening": "compliance",
  "customer-flag-need-to-know": "compliance",
  "eudr-traceability": "compliance",
  "financial-data-exfiltration": "compliance",
  "internal-control-approval-proof": "compliance",
  "lp-claim-attestation": "compliance",
  "qualified-worker-attestation": "compliance",
  "store-network-compliance": "compliance",
  "supplier-credential-verification": "compliance",
  "supply-chain-esg": "compliance",
  "work-fitness-attestation": "compliance",

  // Business-critical operations / operational AI / agent ops / supply chain → Critical
  "agent-api-billing": "critical",
  "agent-expense-approval": "critical",
  "agent-procurement": "critical",
  "agent2agent-settlement": "critical",
  "agentic-payment-fraud": "critical",
  "ai-audit-log-proof": "critical",
  "ai-document-isolation": "critical",
  "defi-bridge-verification": "critical",
  "delegated-treasury": "critical",
  "incident-response-record": "critical",
  "long-term-contract-record": "critical",
  "model-version-attestation": "critical",
  "multi-agent-workflows": "critical",
  "prompt-injection-detection": "critical",
  "rag-content-provenance": "critical",
  "rag-source-attestation": "critical",
  "supply-chain-component-provenance": "critical",
  "x402-commerce": "critical",
};
