/**
 * Use case detail — §2 Before/After data for DERIVED use cases.
 *
 * The authored UCs carry their §2 key:value tables in `useCaseV3.ts`. The
 * remaining (derived) UCs previously rendered §2 as a HIDE→PROVE concept
 * card (text only). This map gives them the same concrete key:value table
 * (`Lemma_UC_concrete_data_fix_PR.md` §3) WITHOUT promoting them to authored
 * mode — §1 stays derived (audience-driven), only §2 gains the data table.
 *
 * Shape mirrors `UseCaseV3.without` / `.withProof` (reused row types). Values
 * containing Japanese carry a `vEn` override; everything else (ids, hashes,
 * DIDs, code-like arrays) is language-neutral. The `proof` scheme line is
 * omitted per the schema-audit convention — `ZK verified ✓` (badge) stands in.
 * One row per card carries `strong` (the claim that matters); `ZK verified`
 * carries `badge`.
 */
import type { V3RawRow, V3ProofRow } from "./useCaseV3";

export interface UseCaseBeforeAfter {
  /** Before card — raw fields handed over today. */
  readonly without: readonly V3RawRow[];
  /** After card — the claims + proof that travel instead. */
  readonly withProof: readonly V3ProofRow[];
}

export const USE_CASE_BEFORE_AFTER: Readonly<Record<string, UseCaseBeforeAfter>> = {
  // ── P1 来歴証明 ────────────────────────────────────────────────────
  "long-term-contract-record": {
    without: [
      { k: "contract_id", v: "CT-2024-08-15-001" },
      { k: "parties", v: "株式会社A, 株式会社B", vEn: "Corp A, Corp B" },
      { k: "amount", v: "5,200,000 JPY" },
      { k: "terms", v: "60ヶ月 / 月次払い", vEn: "60 months / monthly" },
      { k: "clauses", v: "第1条〜第18条（全文）", vEn: "Art. 1–18 (full text)" },
      { k: "signatures", v: "田中（A社CFO）, 鈴木（B社代表）", vEn: "Tanaka (A CFO), Suzuki (B CEO)" },
    ],
    withProof: [
      { k: "subject", v: "did:lemma:contract-CT2024" },
      { k: "issuer", v: "did:lemma:org-A-corp" },
      { k: "sourceHash", v: "0x9f3a…c4e8", strong: true },
      { k: "lineageChain", v: "[draft, review, sign]" },
      { k: "recordedAt", v: "2024-08-15T10:23:00Z" },
      { k: "integrity", v: "poseidon-merkle" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "internal-control-approval-proof": {
    without: [
      { k: "approval_id", v: "AP-2024-001" },
      { k: "amount", v: "1,200,000 JPY" },
      { k: "category", v: "設備投資", vEn: "capex" },
      { k: "requester", v: "田中（部長）", vEn: "Tanaka (Dept. head)" },
      { k: "approver_1", v: "山田（取締役）", vEn: "Yamada (Director)" },
      { k: "approver_2", v: "高橋（CFO）", vEn: "Takahashi (CFO)" },
    ],
    withProof: [
      { k: "subject", v: "did:lemma:approval-AP2024-001" },
      { k: "issuer", v: "did:lemma:org-acme-fin" },
      { k: "sourceHash", v: "0x4f8a…e1d3" },
      { k: "lineageChain", v: "[request, approve_1, approve_2]", strong: true },
      { k: "recordedAt", v: "2024-08-15T14:30:00Z" },
      { k: "integrity", v: "poseidon-merkle" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "incident-response-record": {
    without: [
      { k: "incident_id", v: "IC-2024-08-001" },
      { k: "customer", v: "C-9847（山田様）", vEn: "C-9847 (Yamada)" },
      { k: "issue", v: "商品破損クレーム", vEn: "product-damage claim" },
      { k: "response", v: "返金処理 + 担当者謝罪", vEn: "refund + apology" },
      { k: "handler", v: "鈴木（CS）", vEn: "Suzuki (CS)" },
      { k: "timestamp", v: "2024-08-15 14:30" },
    ],
    withProof: [
      { k: "subject", v: "did:lemma:incident-IC2024-08-001" },
      { k: "issuer", v: "did:lemma:org-acme-cs" },
      { k: "sourceHash", v: "0x7a2c…8b9a" },
      { k: "lineageChain", v: "[report, investigate, resolve, close]", strong: true },
      { k: "recordedAt", v: "2024-08-15T14:30:00Z" },
      { k: "integrity", v: "poseidon-merkle" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "supply-chain-component-provenance": {
    without: [
      { k: "component_id", v: "COMP-ABC-001" },
      { k: "part_name", v: "モーター制御基板", vEn: "motor control board" },
      { k: "supplier_tier_1", v: "A社", vEn: "Corp A" },
      { k: "supplier_tier_2", v: "B社", vEn: "Corp B" },
      { k: "supplier_tier_3", v: "C社", vEn: "Corp C" },
      { k: "batch", v: "2024-Q3-15" },
    ],
    withProof: [
      { k: "subject", v: "did:lemma:component-COMP-ABC-001" },
      { k: "issuer", v: "did:lemma:supplier-A" },
      { k: "sourceHash", v: "0x3c8d…f7a2" },
      { k: "lineageChain", v: "[tier-3, tier-2, tier-1, assembly]", strong: true },
      { k: "recordedAt", v: "2024-08-15T08:00:00Z" },
      { k: "integrity", v: "poseidon-merkle" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "credential-presentation": {
    without: [
      { k: "holder_id", v: "P-345-67-8901" },
      { k: "name", v: "山田太郎", vEn: "Taro Yamada" },
      { k: "dob", v: "1995-04-12" },
      { k: "qualification", v: "第一種電気工事士", vEn: "Class-1 electrician" },
      { k: "expires", v: "2025-03-14" },
      { k: "license_no", v: "ABC123456789" },
    ],
    withProof: [
      { k: "subject", v: "did:lemma:holder-yamada-001", strong: true },
      { k: "issuer", v: "did:lemma:authority-meti" },
      { k: "sourceHash", v: "0x6b2c…e4a9" },
      { k: "recordedAt", v: "2020-03-15T00:00:00Z" },
      { k: "integrity", v: "poseidon-merkle" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "x402-commerce": {
    without: [
      { k: "buyer", v: "AI-001 (API key sk-…)" },
      { k: "seller", v: "vendor-acme" },
      { k: "product", v: "data feed (premium)" },
      { k: "amount", v: "100 USDC" },
      { k: "transaction_id", v: "TX-2024-08-15-…" },
      { k: "all_history", v: "visible" },
    ],
    withProof: [
      { k: "subject", v: "did:lemma:tx-TX2024-08-15" },
      { k: "issuer", v: "did:lemma:trust402.proxy" },
      { k: "sourceHash", v: "0xa1f3…7d8e" },
      { k: "agent", v: "did:lemma:agent-buyer-001" },
      { k: "scope", v: "x402://vendor-acme/*", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  // ── P3 エージェント権限証明（既存 2）──────────────────────────────────
  "multi-agent-workflows": {
    without: [
      { k: "workflow", v: "order-fulfillment" },
      { k: "agents", v: "[A-001-intake, A-002-process, A-003-ship]" },
      { k: "log", v: "各 agent の動作履歴…", vEn: "per-agent action logs…" },
      { k: "attestation", v: "?（連鎖の正当性不明）", vEn: "? (chain legitimacy unknown)" },
    ],
    withProof: [
      { k: "agent", v: "did:lemma:agent-A-003-ship" },
      { k: "delegatedBy", v: "did:lemma:agent-A-002 → A-001 → root-org" },
      { k: "role", v: "shipping_agent" },
      { k: "chain", v: "[intake-proof, process-proof, ship-proof]", strong: true },
      { k: "scope", v: "workflow://order-fulfillment/*" },
      { k: "validUntil", v: "2026-12-31" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "delegated-treasury": {
    without: [
      { k: "agent", v: "AI-treasury-042" },
      { k: "wallet", v: "0xabc…" },
      { k: "balance", v: "5,000 USDC" },
      { k: "auth", v: "api_key + policy_doc.pdf" },
      { k: "spend_today", v: "$480" },
      { k: "attestation", v: "?" },
    ],
    withProof: [
      { k: "agent", v: "did:lemma:agent-treasury-042" },
      { k: "delegatedBy", v: "did:lemma:org-acme-fin" },
      { k: "role", v: "treasury_agent" },
      { k: "spendLimitUSDC", v: "500", strong: true },
      { k: "scope", v: "x402://api.partner.jp/*" },
      { k: "validUntil", v: "2026-06-30T23:59:59Z" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  // ── P4 規制属性証明 ──────────────────────────────────────────────────
  "counterparty-screening": {
    without: [
      { k: "target_company", v: "株式会社B", vEn: "Corp B" },
      { k: "company_id", v: "1234-567-890" },
      { k: "representatives", v: "田中, 鈴木, 山田", vEn: "Tanaka, Suzuki, Yamada" },
      { k: "revenue", v: "1.2B JPY" },
      { k: "risk_score", v: "7.5/10" },
      { k: "risk_factors", v: "…（理由 全文）", vEn: "…(full rationale)" },
    ],
    withProof: [
      { k: "holder", v: "did:lemma:org-target-B" },
      { k: "issuer", v: "did:lemma:authority-mof" },
      { k: "jurisdiction", v: "JP" },
      { k: "licenseType", v: "counterparty-assessment" },
      { k: "disclosed", v: "[judgement, basis]" },
      { k: "hidden", v: "[score, factors, sanctions_detail]" },
      { k: "judgement", v: "取引可", vEn: "OK to transact", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "customer-flag-need-to-know": {
    without: [
      { k: "customer_id", v: "C-9847" },
      { k: "name", v: "山田太郎", vEn: "Taro Yamada" },
      { k: "flag_type", v: "要注意", vEn: "flagged" },
      { k: "flag_reason", v: "過去苦情 3回 / 暴言履歴", vEn: "3 prior complaints / abuse history" },
      { k: "score", v: "8/10" },
      { k: "assigned_by", v: "マネージャー田中", vEn: "Mgr. Tanaka" },
    ],
    withProof: [
      { k: "holder", v: "did:lemma:customer-C9847" },
      { k: "issuer", v: "did:lemma:org-acme-frontdesk" },
      { k: "jurisdiction", v: "JP" },
      { k: "licenseType", v: "customer-handling" },
      { k: "disclosed", v: "[handling_tier]" },
      { k: "hidden", v: "[reason, score, history, assigner_id]" },
      { k: "handling_tier", v: "要注意", vEn: "flagged", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "age-eligibility-verification": {
    without: [
      { k: "name", v: "山田太郎", vEn: "Taro Yamada" },
      { k: "dob", v: "2006-04-12" },
      { k: "address", v: "東京都…", vEn: "Tokyo…" },
      { k: "id_type", v: "運転免許証", vEn: "driver's license" },
      { k: "purchase_item", v: "アルコール", vEn: "alcohol" },
    ],
    withProof: [
      { k: "holder", v: "did:lemma:user-customer-002" },
      { k: "issuer", v: "did:lemma:authority-jp-npa" },
      { k: "jurisdiction", v: "JP" },
      { k: "licenseType", v: "age-attestation" },
      { k: "disclosed", v: "[age_20+]" },
      { k: "hidden", v: "[name, dob, address, id_no]" },
      { k: "attestation", v: "age >= 20", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "store-network-compliance": {
    without: [
      { k: "store_id", v: "ST-001" },
      { k: "location", v: "東京都渋谷区…", vEn: "Shibuya, Tokyo…" },
      { k: "license_no", v: "飲食店営業 12345", vEn: "restaurant license 12345" },
      { k: "hygiene_cert", v: "HG-2024-001" },
      { k: "insurance", v: "賠償責任保険 ABC-001", vEn: "liability insurance ABC-001" },
      { k: "expires", v: "2025-03-31" },
    ],
    withProof: [
      { k: "holder", v: "did:lemma:store-ST-001" },
      { k: "issuer", v: "did:lemma:authority-jp-mhlw" },
      { k: "jurisdiction", v: "JP-shibuya" },
      { k: "licenseType", v: "restaurant-operation" },
      { k: "disclosed", v: "[isLicensed, isHygieneCompliant, isInsured, validUntilYear]" },
      { k: "hidden", v: "[license_no, address, inspection_log]" },
      { k: "attestation", v: "全て有効", vEn: "all valid", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "supplier-credential-verification": {
    without: [
      { k: "supplier", v: "ABC社", vEn: "Corp ABC" },
      { k: "iso_certificates", v: "ISO 9001, ISO 14001 (PDF)" },
      { k: "financial_statements", v: "B/S, P/L（過去3期）", vEn: "B/S, P/L (3 yrs)" },
      { k: "licenses", v: "製造業許可 #ABC123", vEn: "mfg license #ABC123" },
      { k: "audit_reports", v: "監査法人報告書", vEn: "auditor report" },
    ],
    withProof: [
      { k: "holder", v: "did:lemma:supplier-ABC" },
      { k: "issuer", v: "did:lemma:authority-iso" },
      { k: "jurisdiction", v: "JP" },
      { k: "licenseType", v: "iso-9001-14001" },
      { k: "disclosed", v: "[isISO9001Certified, isISO14001Certified, validUntilYear]" },
      { k: "hidden", v: "[certificate_no, financial_detail, audit_detail]" },
      { k: "attestation", v: "ISO 認証有効", vEn: "ISO certs valid", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "qualified-worker-attestation": {
    without: [
      { k: "worker_id", v: "W-001" },
      { k: "name", v: "山田太郎", vEn: "Taro Yamada" },
      { k: "qualification", v: "第一種電気工事士", vEn: "Class-1 electrician" },
      { k: "license_no", v: "ABC123" },
      { k: "training_records", v: "2024-01 安全教育, 2024-03 高所作業", vEn: "2024-01 safety, 2024-03 heights" },
    ],
    withProof: [
      { k: "holder", v: "did:lemma:worker-W001" },
      { k: "issuer", v: "did:lemma:authority-jp-meti" },
      { k: "jurisdiction", v: "JP" },
      { k: "licenseType", v: "electrician-class-1" },
      { k: "disclosed", v: "[isQualified, hasSafetyTraining, validUntilYear]" },
      { k: "hidden", v: "[worker_name, license_no, training_detail]" },
      { k: "attestation", v: "有資格 + 安全教育済", vEn: "qualified + safety-trained", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "work-fitness-attestation": {
    without: [
      { k: "staff_id", v: "S-345" },
      { k: "name", v: "鈴木花子", vEn: "Hanako Suzuki" },
      { k: "health_check", v: "2024-05 実施", vEn: "2024-05 done" },
      { k: "training", v: "接客マナー研修済", vEn: "hospitality training done" },
      { k: "certification", v: "食品衛生責任者", vEn: "food-hygiene manager" },
      { k: "medical_detail", v: "…（健診結果）", vEn: "…(health-check results)" },
    ],
    withProof: [
      { k: "holder", v: "did:lemma:staff-S345" },
      { k: "issuer", v: "did:lemma:authority-jp-mhlw" },
      { k: "jurisdiction", v: "JP" },
      { k: "licenseType", v: "work-fitness" },
      { k: "disclosed", v: "[isHealthChecked, hasFoodHandlingCert, validUntilYear]" },
      { k: "hidden", v: "[staff_name, medical_detail, training_detail]" },
      { k: "attestation", v: "就業適格", vEn: "fit for work", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },

  "benefit-eligibility-proof": {
    without: [
      { k: "applicant_id", v: "1234-5678" },
      { k: "name", v: "山田太郎", vEn: "Taro Yamada" },
      { k: "income", v: "3,500,000 JPY" },
      { k: "household", v: "4 人", vEn: "4 people" },
      { k: "asset", v: "12,000,000 JPY" },
      { k: "benefit_program", v: "児童手当", vEn: "child allowance" },
    ],
    withProof: [
      { k: "holder", v: "did:lemma:applicant-1234" },
      { k: "issuer", v: "did:lemma:authority-jp-municipal" },
      { k: "jurisdiction", v: "JP" },
      { k: "licenseType", v: "benefit-eligibility" },
      { k: "disclosed", v: "[isEligible, programType]" },
      { k: "hidden", v: "[income, household_detail, asset, name]" },
      { k: "attestation", v: "児童手当受給要件 = 満たす", vEn: "child-allowance eligibility = met", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
  },
};

export function getUseCaseBeforeAfter(slug: string): UseCaseBeforeAfter | undefined {
  return USE_CASE_BEFORE_AFTER[slug];
}
