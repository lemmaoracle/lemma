/**
 * Use case index — task-axis grouping (JA, handoff
 * `lemma_usecases_index_by-task_mockup_2026-06-02.html`).
 *
 * Each group corresponds to a single business job the reader might be doing,
 * NOT a Pillar. The ordering of `slugs` is the order the cards render inside
 * the group. A slug that is not yet in the use-case registry is silently
 * skipped — the group still renders as long as at least one slug resolves.
 *
 * Group 02 heading swaps the mockup's 「立証する」 to 「証明する」 — 立証/
 * 立証層 is banned site-wide per project rule.
 */

export interface UseCaseTaskGroup {
  /** Two-digit id displayed in the eyebrow, e.g. "01". */
  readonly id: string;
  /** Hash anchor + section id, e.g. "ai-data". */
  readonly anchor: string;
  readonly heading: string;
  readonly description: string;
  readonly slugs: ReadonlyArray<string>;
}

export const USE_CASE_TASK_GROUPS_JA: ReadonlyArray<UseCaseTaskGroup> = [
  {
    id: "01",
    anchor: "ai-data",
    heading: "社内データを外に出さず、AI に使わせる",
    description: "漏洩させずに AI を業務に入れたいとき。",
    slugs: [
      "ai-document-isolation",
      "ai-audit-log-proof",
      "rag-content-provenance",
      "rag-source-attestation",
      "prompt-injection-detection",
      "ai-act-compliance-attestation",
      "model-version-attestation",
    ],
  },
  {
    id: "02",
    anchor: "verify",
    heading: "取引相手・データの正しさを確かめる",
    description: "相手・調達・資格の正しさを、中身や履歴を出さずに確認・証明したいとき。",
    slugs: [
      "counterparty-screening",
      "kyc-aml-selective-disclosure",
      "customer-flag-need-to-know",
      "age-eligibility-verification",
      "store-network-compliance",
      "supplier-credential-verification",
      "supply-chain-component-provenance",
      "supply-chain-esg",
      "credential-presentation",
      "qualified-worker-attestation",
      "work-fitness-attestation",
      "benefit-eligibility-proof",
    ],
  },
  {
    id: "03",
    anchor: "agent",
    heading: "AI・エージェントの権限を安全に委ねる",
    description: "エージェントや決済の権限を、決めた範囲でコードによって証明したいとき（開発者向け）。",
    slugs: [
      "agent-expense-approval",
      "agent-procurement",
      "agent-api-billing",
      "agent2agent-settlement",
      "multi-agent-workflows",
      "delegated-treasury",
      "x402-commerce",
      "defi-bridge-verification",
    ],
  },
  {
    id: "04",
    anchor: "records",
    heading: "判断・記録を後から証明する",
    description: "「その時、正しかった」を、改ざんなく残したいとき。",
    slugs: [
      "long-term-contract-record",
      "internal-control-approval-proof",
      "incident-response-record",
      "financial-data-exfiltration",
    ],
  },
];
