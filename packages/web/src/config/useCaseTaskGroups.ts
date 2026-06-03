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
  readonly heading: string;
  readonly description: string;
  readonly slugs: ReadonlyArray<string>;
}

export const USE_CASE_TASK_GROUPS_JA: ReadonlyArray<UseCaseTaskGroup> = [
  {
    id: "01",
    heading: "AIに生データを渡さず任せる",
    description: "漏洩させずに AI を業務に入れたいとき。",
    slugs: [
      "ai-document-isolation",
      "ai-audit-log-proof",
      "rag-content-provenance",
      "rag-source-attestation",
    ],
  },
  {
    id: "02",
    heading: "記録・契約・承認を後から証明する",
    description: "「その時、正しかった」を、改ざんなく残したいとき。",
    slugs: [
      "long-term-contract-record",
      "internal-control-approval-proof",
      "financial-data-exfiltration",
    ],
  },
  {
    id: "03",
    heading: "取引相手・仕入先を確かめる",
    description: "相手の信頼性を、中身を見ずに確認したいとき。",
    slugs: [
      "counterparty-screening",
      "kyc-aml-selective-disclosure",
      "supplier-credential-verification",
    ],
  },
  {
    id: "04",
    heading: "サプライチェーンの来歴・適合を証明する",
    description: "調達の正しさを、営業秘密を守って示したいとき。",
    slugs: [
      "supply-chain-component-provenance",
      "supply-chain-esg",
    ],
  },
  {
    id: "05",
    heading: "資格・実績・受給資格を証明する",
    description: "人や組織の資格を、履歴を出さずに示したいとき。",
    slugs: [
      "credential-presentation",
      "qualified-worker-attestation",
      "benefit-eligibility-proof",
    ],
  },
  {
    id: "06",
    heading: "エージェント・決済の権限を証明する",
    description: "エージェントや決済の権限を、コードで証明したいとき（開発者向け）。",
    slugs: [
      "multi-agent-workflows",
      "delegated-treasury",
      "x402-commerce",
      "defi-bridge-verification",
    ],
  },
];
