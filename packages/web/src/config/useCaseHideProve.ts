/**
 * Use case detail — HIDE → PROVE hero device content.
 *
 * Per slug, the two concise one-liners the mockup
 * (`lemma_usecase_detail_mockup_2026-06-02.html`) frames as
 * "what stays inside" and "what travels out". Slogan is sourced from the
 * use case's frontmatter `thesis` field; only the two HIDE / PROVE lines
 * live here. Slugs with no entry render no device — the hero falls back
 * to thesis + abstract as it did before.
 *
 * Drafts below are seeded by Claude from each use case's
 * thesis / cardSummary; treat them as a first cut to refine in copy
 * review. The shape stays writer-friendly: one short phrase each, no
 * punctuation tail, no overlapping vocabulary across the two cells.
 */

export interface HideProvePair {
  /** Concise list of what does NOT leave the holder's side. */
  readonly hide: string;
  /** Concise predicate that DOES travel across the boundary. */
  readonly prove: string;
}

export const USE_CASE_HIDE_PROVE: Readonly<Record<string, HideProvePair>> = {
  // P4 規制属性証明
  "counterparty-screening": {
    hide: "判定の理由・スコア・照会履歴",
    prove: "基準を満たす／要注意",
  },
  "kyc-aml-selective-disclosure": {
    hide: "氏名・住所・生年月日などの本人属性",
    prove: "KYC / AML 要件を満たしている",
  },
  "financial-data-exfiltration": {
    hide: "アクセスされた個別データの中身",
    prove: "正規のアクセス制御の内側で行われた",
  },
  "benefit-eligibility-proof": {
    hide: "所得・世帯・属性の詳細",
    prove: "受給要件を満たしている",
  },
  "credential-presentation": {
    hide: "成績・履修科目・在籍履歴",
    prove: "正規の学位・資格を有効に保有",
  },
  "qualified-worker-attestation": {
    hide: "本人の履歴・受講記録",
    prove: "必要な資格を有効に保有",
  },
  "customer-flag-need-to-know": {
    hide: "取扱いの理由・履歴・スコア",
    prove: "必要な対応区分（要注意／通常）",
  },

  // P1 来歴証明
  "long-term-contract-record": {
    hide: "台帳・契約原本",
    prove: "この時点で正当に承認・修正された",
  },
  "supply-chain-component-provenance": {
    hide: "サプライヤ内部の取引情報",
    prove: "部品が正規ルートの来歴を持つ",
  },
  "supplier-credential-verification": {
    hide: "証書の原本・認証機関の連絡先",
    prove: "有効な ISO 認証を保有",
  },
  "rag-content-provenance": {
    hide: "文書原本・全文",
    prove: "AI が参照した版が正規発行物である",
  },
  "defi-bridge-verification": {
    hide: "送信元の鍵・ノード内部状態",
    prove: "メッセージの起点が正規である",
  },
  "x402-commerce": {
    hide: "売り手の内部情報",
    prove: "決済前に売り手の属性が満たされている",
  },

  // P2 検証可能 AI
  "ai-document-isolation": {
    hide: "文書原本・機微情報",
    prove: "AI が判断に必要な事実だけ持っている",
  },
  "ai-audit-log-proof": {
    hide: "プロンプト・入力データ・モデル内部",
    prove: "正規の指示と入力で生成された出力である",
  },
  "rag-source-attestation": {
    hide: "モデル内部のコンテキスト",
    prove: "引用ごとに参照元の版が紐付いている",
  },

  // P3 エージェント権限証明
  "multi-agent-workflows": {
    hide: "エージェント間の中間ステップ",
    prove: "成果物が認可された委任チェーン上で生成された",
  },
  "delegated-treasury": {
    hide: "トレジャリーの内部ルール",
    prove: "支出が認可された制御の内側で行われた",
  },

  // P4 / P1 横断 (note: internal-control-approval-proof isn't in the
  // posts registry yet — entry kept so it lights up once the page lands)
  "internal-control-approval-proof": {
    hide: "承認内容・承認者・職務分掌",
    prove: "正当な権限と手順で承認された",
  },

  // P4 サプライチェーン適合
  "supply-chain-esg": {
    hide: "原価・調達数量・サプライヤ取引内部",
    prove: "ESG / CBAM 要件を満たすサプライチェーン構成である",
  },
};

export function getUseCaseHideProve(slug: string): HideProvePair | undefined {
  return USE_CASE_HIDE_PROVE[slug];
}
