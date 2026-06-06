/**
 * Use case detail — HIDE → PROVE hero / §2 device content.
 *
 * Per slug, the two concise one-liners the v3 template frames as
 * "what stays hidden" and "what gets proven". Sourced originally from each
 * use case's thesis / cardSummary; refined in copy review.
 *
 * Each phrase carries both locales. `getUseCaseHideProve(slug, locale)`
 * resolves to a flat `{ hide, prove }` pair for the requested language.
 * Slugs with no entry render no device — the §2 surface falls back to the
 * derived approach prose (and the hero falls back to thesis + abstract).
 *
 * The shape stays writer-friendly: one short phrase each, no punctuation
 * tail, no overlapping vocabulary across the two cells.
 */
import type { Locale } from "../i18n/translations";

/** Resolved (single-locale) pair the templates consume. */
export interface HideProvePair {
  /** Concise list of what does NOT leave the holder's side. */
  readonly hide: string;
  /** Concise predicate that DOES travel across the boundary. */
  readonly prove: string;
}

interface L10n {
  readonly ja: string;
  readonly en: string;
}
interface HideProveL10n {
  readonly hide: L10n;
  readonly prove: L10n;
}

const USE_CASE_HIDE_PROVE: Readonly<Record<string, HideProveL10n>> = {
  // P4 規制属性証明
  "counterparty-screening": {
    hide: { ja: "判定の理由・スコア・照会履歴", en: "the reasoning, score and lookup history" },
    prove: { ja: "基準を満たす／要注意", en: "meets the criteria / flagged" },
  },
  "kyc-aml-selective-disclosure": {
    hide: { ja: "氏名・住所・生年月日などの本人属性", en: "name, address, date of birth and other identity attributes" },
    prove: { ja: "KYC / AML 要件を満たしている", en: "meets KYC / AML requirements" },
  },
  "financial-data-exfiltration": {
    hide: { ja: "アクセスされた個別データの中身", en: "the contents of the data accessed" },
    prove: { ja: "正規のアクセス制御の内側で行われた", en: "happened inside authorized access controls" },
  },
  "benefit-eligibility-proof": {
    hide: { ja: "所得・世帯・属性の詳細", en: "income, household and attribute details" },
    prove: { ja: "受給要件を満たしている", en: "meets the benefit eligibility rules" },
  },
  "credential-presentation": {
    hide: { ja: "成績・履修科目・在籍履歴", en: "grades, courses taken and enrollment history" },
    prove: { ja: "正規の学位・資格を有効に保有", en: "holds a valid, accredited degree / credential" },
  },
  "qualified-worker-attestation": {
    hide: { ja: "本人の履歴・受講記録", en: "personal history and training records" },
    prove: { ja: "必要な資格を有効に保有", en: "holds the required qualification, valid" },
  },
  "customer-flag-need-to-know": {
    hide: { ja: "取扱いの理由・履歴・スコア", en: "the reason, history and score behind the flag" },
    prove: { ja: "必要な対応区分（要注意／通常）", en: "the handling tier you need (flagged / normal)" },
  },
  "age-eligibility-verification": {
    hide: { ja: "生年月日・本人確認書類", en: "date of birth and ID documents" },
    prove: { ja: "販売できる年齢・資格を満たす", en: "meets the age / eligibility to purchase" },
  },
  "store-network-compliance": {
    hide: { ja: "証書原本・店舗内部の情報", en: "original certificates and store-internal data" },
    prove: { ja: "必要な許認可・衛生・保険を有効に保有", en: "holds the required permits, hygiene and insurance, valid" },
  },
  "incident-response-record": {
    hide: { ja: "顧客情報・対応の詳細", en: "customer data and response details" },
    prove: { ja: "正当な手順・権限で対応した（その時点）", en: "handled with proper procedure and authority, at that time" },
  },
  "work-fitness-attestation": {
    hide: { ja: "健診結果・受講履歴・要配慮個人情報", en: "health-check results, training history and sensitive personal data" },
    prove: { ja: "必要な健康確認・研修・資格を満たす", en: "meets the required health checks, training and qualifications" },
  },

  // P1 来歴証明
  "long-term-contract-record": {
    hide: { ja: "台帳・契約原本", en: "the ledger and original contracts" },
    prove: { ja: "この時点で正当に承認・修正された", en: "was validly approved / amended at this point in time" },
  },
  "supply-chain-component-provenance": {
    hide: { ja: "サプライヤ内部の取引情報", en: "supplier-internal transaction data" },
    prove: { ja: "部品が正規ルートの来歴を持つ", en: "the part carries a legitimate provenance chain" },
  },
  "supplier-credential-verification": {
    hide: { ja: "証書の原本・認証機関の連絡先", en: "original certificates and the certifier's contact" },
    prove: { ja: "有効な ISO 認証を保有", en: "holds a valid ISO certification" },
  },
  "rag-content-provenance": {
    hide: { ja: "文書原本・全文", en: "the document original and full text" },
    prove: { ja: "AI が参照した版が正規発行物である", en: "the version the AI used is an authentic publication" },
  },
  "defi-bridge-verification": {
    hide: { ja: "送信元の鍵・ノード内部状態", en: "the sender's keys and node-internal state" },
    prove: { ja: "メッセージの起点が正規である", en: "the message originates from a legitimate source" },
  },
  "x402-commerce": {
    hide: { ja: "売り手の内部情報", en: "the seller's internal data" },
    prove: { ja: "決済前に売り手の属性が満たされている", en: "the seller's attributes are satisfied before payment" },
  },

  // P2 検証可能 AI
  "ai-document-isolation": {
    hide: { ja: "文書原本・機微情報", en: "the document original and sensitive data" },
    prove: { ja: "AI が判断に必要な事実だけ持っている", en: "the AI holds only the facts it needs to decide" },
  },
  "ai-audit-log-proof": {
    hide: { ja: "プロンプト・入力データ・モデル内部", en: "the prompt, input data and model internals" },
    prove: { ja: "正規の指示と入力で生成された出力である", en: "the output came from authorized instructions and inputs" },
  },
  "rag-source-attestation": {
    hide: { ja: "モデル内部のコンテキスト", en: "the model's internal context" },
    prove: { ja: "引用ごとに参照元の版が紐付いている", en: "each citation is bound to its source version" },
  },
  "prompt-injection-detection": {
    hide: { ja: "プロンプト・入力 content の中身", en: "the prompt and input content itself" },
    prove: { ja: "「人が見た入力 = AI が読む入力」の整合性", en: "what the human saw equals what the AI read" },
  },
  "ai-act-compliance-attestation": {
    hide: { ja: "AI システム内部・学習データ・モデル詳細", en: "the AI system internals, training data and model details" },
    prove: { ja: "AI Act 各条項への適合", en: "compliance with each AI Act provision" },
  },
  "model-version-attestation": {
    hide: { ja: "モデル内部・パラメータ・学習データ", en: "the model internals, parameters and training data" },
    prove: { ja: "モデル切替前後の同一判断（または差分）", en: "the same decision before and after a model change (or the diff)" },
  },

  // P3 エージェント権限証明
  "agent-expense-approval": {
    hide: { ja: "経費データ・承認権限の中身", en: "expense data and the approval authority itself" },
    prove: { ja: "範囲内なら、AI が承認できる", en: "within scope, the AI may approve" },
  },
  "agent-procurement": {
    hide: { ja: "発注権限・予算・取引先データ", en: "ordering authority, budget and supplier data" },
    prove: { ja: "範囲内なら、AI が発注実行", en: "within scope, the AI may place the order" },
  },
  "agent-api-billing": {
    hide: { ja: "API キー・課金権限", en: "the API key and billing authority" },
    prove: { ja: "範囲内なら、AI が API を呼べる", en: "within scope, the AI may call the API" },
  },
  "agent2agent-settlement": {
    hide: { ja: "委任関係・取引内容の中身", en: "the delegation relationships and transaction contents" },
    prove: { ja: "委任の連鎖と、取引の正当性", en: "the delegation chain and the transaction's legitimacy" },
  },
  "multi-agent-workflows": {
    hide: { ja: "エージェント間の中間ステップ", en: "the intermediate steps between agents" },
    prove: { ja: "成果物が認可された委任チェーン上で生成された", en: "the result was produced on an authorized delegation chain" },
  },
  "delegated-treasury": {
    hide: { ja: "トレジャリーの内部ルール", en: "the treasury's internal rules" },
    prove: { ja: "支出が認可された制御の内側で行われた", en: "the spend happened inside authorized controls" },
  },

  // P4 / P1 横断
  "internal-control-approval-proof": {
    hide: { ja: "承認内容・承認者・職務分掌", en: "the approval contents, approver and separation of duties" },
    prove: { ja: "正当な権限と手順で承認された", en: "approved with proper authority and procedure" },
  },

  // P4 サプライチェーン適合
  "supply-chain-esg": {
    hide: { ja: "原価・調達数量・サプライヤ取引内部", en: "cost, procurement volume and supplier-internal dealings" },
    prove: { ja: "ESG / CBAM 要件を満たすサプライチェーン構成である", en: "a supply-chain structure that meets ESG / CBAM requirements" },
  },
  "cbam-supplier-attestation": {
    hide: { ja: "生産データ・原価・サプライヤ取引内部", en: "production data, cost and supplier-internal dealings" },
    prove: { ja: "CBAM 要件の国・原産・カーボン強度を満たす", en: "meets CBAM-required country, origin and carbon-intensity attributes" },
  },
  "eudr-traceability": {
    hide: { ja: "サプライヤ間の原本・取引情報", en: "supplier raw records and transaction data" },
    prove: { ja: "EUDR の原産地・伐採時期・許可属性を満たす", en: "meets EUDR origin, harvest-date and permit attributes" },
  },
  "public-procurement-attestation": {
    hide: { ja: "入札者の原本書類・実績の内部情報", en: "the bidder's raw documents and performance internals" },
    prove: { ja: "入札要件の適格性を満たす", en: "meets the tender's eligibility requirements" },
  },

  // P3 エージェント権限 / DeFi
  "agentic-payment-fraud": {
    hide: { ja: "エージェントの鍵・委任の中間ステップ", en: "the agent's keys and the intermediate delegation steps" },
    prove: { ja: "各支払いが認可された委任の範囲内である", en: "each payment stayed within an authorized delegation" },
  },
  "lp-claim-attestation": {
    hide: { ja: "LP の本人確認データ・残高", en: "the LP's KYC data and balances" },
    prove: { ja: "地域・リスク許容など規制要件を満たす", en: "meets the regulatory regime (region, risk tolerance)" },
  },
};

export function getUseCaseHideProve(slug: string, locale: Locale): HideProvePair | undefined {
  const entry = USE_CASE_HIDE_PROVE[slug];
  if (!entry) return undefined;
  return { hide: entry.hide[locale], prove: entry.prove[locale] };
}
