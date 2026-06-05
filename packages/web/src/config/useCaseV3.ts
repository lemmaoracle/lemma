/**
 * Use Case detail — v3 template content.
 *
 * The v3 detail template (see `components/usecase/UseCaseV3Body.astro`)
 * compresses the long-form 9-section page into 5 sections and adds three
 * enterprise-reader hooks that have no source in the markdown:
 *
 *   §1  3 persona quotes (per industry/role)
 *   §2  Before / After data example (raw fields → claims + ZK proof)
 *       + a one-paragraph Lemma-approach callout
 *
 * Everything else the v3 body needs (H1, HIDE→PROVE, lead/abstract,
 * industry tags, reading time, §4 進め方 steps, §5 related cards) is pulled
 * from the existing use case data — only the hooks above live here.
 *
 * A slug is rendered with v3 ONLY when it has an entry in this map AND the
 * locale is JA. Slugs without an entry (and all EN pages) keep the current
 * long-form template untouched, so v3 can roll out one reference UC at a
 * time. EN copy ships in a follow-up PR.
 *
 * Drafts are seeded from each use case's content + the v3 PR spec; treat
 * persona quotes and the After-card claims as copy to refine in review.
 */

/** One persona voice in §1 — a role label and the concern it speaks. */
export interface V3Persona {
  /** Role / function, e.g. "情シス・情報セキュリティ". */
  readonly role: string;
  /** First-person concern, quoted. No surrounding 「」 — the template adds them. */
  readonly quote: string;
}

/** One row in the Before card — a raw field that today travels to the AI. */
export interface V3RawRow {
  readonly k: string;
  readonly v: string;
}

/** One row in the After card — what travels instead under Lemma. */
export interface V3ProofRow {
  readonly k: string;
  readonly v: string;
  /** Emphasize the value (the claim that matters). */
  readonly strong?: boolean;
  /** Render the value as a green ✓ VALID badge. */
  readonly badge?: boolean;
}

export interface UseCaseV3 {
  /** §1 — exactly three persona voices. */
  readonly personas: readonly [V3Persona, V3Persona, V3Persona];
  /** §2 Before card — 5 raw fields handed to the AI today. */
  readonly without: readonly V3RawRow[];
  /** §2 After card — the claims + proof that travel instead (≈3 rows). */
  readonly withProof: readonly V3ProofRow[];
  /** §2 approach callout — one paragraph summarizing the Lemma approach. */
  readonly approach: string;
}

export const USE_CASE_V3: Readonly<Record<string, UseCaseV3>> = {
  // ── P2 検証可能 AI · リファレンス実装 ──────────────────────────────
  "ai-document-isolation": {
    personas: [
      {
        role: "情シス・情報セキュリティ",
        quote: "AI を業務に入れたいが、社内文書をモデルや外部に渡すのが怖くて止まっている",
      },
      {
        role: "DX 推進・業務部門",
        quote: "PoC は成功した。でも、本番投入の承認がガバナンス側で止まっている",
      },
      {
        role: "CISO・内部監査",
        quote: "AI が何を参照したか、後から監査時に再現・説明できる仕組みがない",
      },
    ],
    without: [
      { k: "name", v: "田中太郎" },
      { k: "address", v: "東京都品川区…" },
      { k: "contract", v: "A プラン" },
      { k: "date", v: "2024-08-15" },
      { k: "id", v: "09xxx-xxxx-xxxx" },
    ],
    withProof: [
      { k: "claim", v: "契約区分 = A", strong: true },
      { k: "docHash", v: "0x4a3f…" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach:
      "文書を暗号化したまま、AI には「必要な事実・属性」だけを証明付きで渡します。生の PII や原本にはモデルを触れさせません。AI が「この事実だけを使った」ことを証跡として残せるので、後から原本を開示せず参照内容を説明できます。",
  },

  "ai-audit-log-proof": {
    personas: [
      { role: "内部監査・コンプライアンス", quote: "AI 判断の根拠を後から再現するために、入力・モデル・過程の証跡が必要" },
      { role: "法務・経営層", quote: "AI による意思決定を、規制当局・株主に説明できる仕組みがない" },
      { role: "CISO・セキュリティ", quote: "AI 判断の改ざん検知ができず、責任の所在が曖昧になる" },
    ],
    without: [
      { k: "prompt", v: "〇〇案件の与信判断" },
      { k: "model", v: "gpt-internal-v4" },
      { k: "params", v: "temp=0.2 …" },
      { k: "response", v: "承認" },
      { k: "timestamp", v: "2024-08-15…" },
    ],
    withProof: [
      { k: "claim", v: "承認判断 = 規定遵守", strong: true },
      { k: "model_hash", v: "0x7a2c…" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach:
      "AI が判断を下した瞬間に、使ったモデル・入力した事実・適用した基準・最終結論を、ひとつの検証可能な証跡として固定します。原本データは社内に留まり、外部に渡るのは「いつ・どのモデルが・何を根拠に・何を判断したか」という事実だけ。モデルが更新されても過去の判断は不変に残り、当時のデータを開示せず、当局・監査人・申立者が同じ証跡を独立に検証できます。",
  },

  "kyc-aml-selective-disclosure": {
    personas: [
      { role: "金融機関 KYC 担当", quote: "顧客の年齢・適格性だけ確認したいが、原本（パスポート・住所証明）を全部受け取ってしまう" },
      { role: "コンプライアンス", quote: "規制当局には適合性だけ証明したい。個人情報の流出リスクは取りたくない" },
      { role: "プラットフォーム事業者", quote: "KYC を委託先に依頼するたび、個人情報が外部に拡散している" },
    ],
    without: [
      { k: "name", v: "田中太郎" },
      { k: "dob", v: "1985-04-12" },
      { k: "address", v: "東京都…" },
      { k: "passport_no", v: "TR1234…" },
      { k: "id_image", v: "base64…" },
    ],
    withProof: [
      { k: "claim", v: "年齢 ≥ 18 ∧ 居住 = JP", strong: true },
      { k: "claim", v: "AML clean", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach:
      "審査を済ませた発行者（金融機関）が、顧客属性を一つずつ独立した証跡として発行します。住所・生年月日・取引履歴の原本は発行者の手元に留まり、受け入れ側に渡るのは「18 歳以上」「居住地は日本」「制裁リスト不適合」といった必要な属性の証明だけ。データを共有せずに、属性の真正性・発行者・有効期限・本人同意を、規制当局・受け入れ機関・顧客が独立に検証できます。",
  },

  // ── P1 来歴証明（主軸）/ P4 規制 横断 ──────────────────────────────
  "supply-chain-esg": {
    personas: [
      { role: "調達部・サプライチェーン管理", quote: "サプライヤから ESG / 関税適合情報を集めたいが、商取引データそのものは受け取りたくない" },
      { role: "規制対応・コンプライアンス", quote: "EUDR / CBAM 適合を多階層で証明する必要があるが、サプライヤの機密が壁" },
      { role: "ESG 担当", quote: "調達先のカーボン強度・原産国を、原本データを集めず連鎖検証したい" },
    ],
    without: [
      { k: "supplier", v: "ABC corp" },
      { k: "contract_value", v: "5,200,000 USD" },
      { k: "co2_intensity", v: "0.83 kgCO2/kg" },
      { k: "origin_country", v: "BR…" },
      { k: "invoice", v: "…" },
    ],
    withProof: [
      { k: "claim", v: "CBAM 適合 ∧ EUDR 適合", strong: true },
      { k: "claim", v: "carbon_intensity < 1.0", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach:
      "サプライチェーンの各階層が ESG 属性（排出量・原産地・労働条件）を発行者署名付きで発行し、上流とつなげて多階層チェーンを連鎖させます。原料明細・サプライヤ名・契約条件は各社の手元に留まり、外部に渡るのは「CBAM 閾値以下」「EUDR 適合」のような適合性の証明だけ。二重計上は原料単位の紐付けで構造的に検出され、自律発注エージェントも発注確定前にこれを検証できます。",
  },

  "rag-source-attestation": {
    personas: [
      { role: "情シス・DX 推進", quote: "RAG が回答した内容の引用元が、本当に最新版・正本かを確認する手段がない" },
      { role: "AI 開発担当", quote: "RAG パイプラインに信頼できないソースが紛れ込んでも検知できない" },
      { role: "監査・品質", quote: "AI 回答の出所を、後から監査時に再現・説明できる仕組みが必要" },
    ],
    without: [
      { k: "query", v: "〇〇規程について" },
      { k: "retrieved_doc", v: "doc-xyz.pdf" },
      { k: "version", v: "?" },
      { k: "content", v: "text dump" },
      { k: "source", v: "?" },
    ],
    withProof: [
      { k: "claim", v: "doc-xyz @ v3.2（latest）", strong: true },
      { k: "docHash", v: "0x9b1d…" },
      { k: "signed_by", v: "docs.internal" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach:
      "AI が回答に引用した各ソースを、その引用が指す正確な文書バージョンに暗号的に紐付けます。引用は単なるラベルではなく、検証可能な参照になります。原本本体はインデックスにも回答にも渡らず、外部に渡るのは「この引用は回答時点で有効だった版に由来する」という事実だけ。ベクトル DB が再構築されてもポリシーが改訂されても、過去の回答に付いた引用証明は不変です。",
  },

  "rag-content-provenance": {
    personas: [
      { role: "情シス・業務 DX", quote: "RAG に取り込む文書の来歴を、取り込み時点で固定する仕組みが要る" },
      { role: "ガバナンス", quote: "文書が改ざんされていないこと、誰が発行したかを後から検証したい" },
      { role: "AI 開発担当", quote: "文書のバージョン管理と、改ざん検知を一体で運用したい" },
    ],
    without: [
      { k: "doc_path", v: "/shared/policy-v3.pdf" },
      { k: "uploaded_by", v: "user-123" },
      { k: "content", v: "text…" },
      { k: "version", v: "?" },
      { k: "signed", v: "?" },
    ],
    withProof: [
      { k: "claim", v: "policy @ v3 · signed by docs.internal", strong: true },
      { k: "docHash", v: "0x4f8a…" },
      { k: "chain", v: "prev_hash → curr_hash" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach:
      "社内文書を RAG に取り込む瞬間に、原本を暗号化したうえで、文書の指紋（docHash）・発行者署名・有効バージョンをインデックス側に刻みます。AI が検索でヒットさせるのは原本そのものではなく、来歴を持つ事実だけ。引用された一文は、刻まれた指紋経由でどの版に由来するかを追跡でき、改訂されれば古い版の引用は構造的に検知できます。",
  },

  // ── P2 検証可能 AI（DeFi / セキュリティ）──────────────────────────
  "defi-bridge-verification": {
    personas: [
      { role: "DeFi プロトコル開発者", quote: "Bridge 経由の tx が改ざんされていないか、独立検証する手段が要る" },
      { role: "プロトコル運営", quote: "Bridge を経由する資金の正当性を、外部の利用者に証明したい" },
      { role: "セキュリティ", quote: "Bridge 攻撃の検知に、暗号証跡が必要" },
    ],
    without: [
      { k: "tx_hash", v: "0x1234…" },
      { k: "from_chain", v: "ETH" },
      { k: "to_chain", v: "ARB" },
      { k: "amount", v: "100 ETH" },
      { k: "sender", v: "0xabc…" },
    ],
    withProof: [
      { k: "claim", v: "tx confirmed on source chain", strong: true },
      { k: "state_root", v: "0x7e2a…" },
      { k: "merkle_proof", v: "valid" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach:
      "受信側が状態を確定する前に、メッセージの起点が正規かどうかを独立に検証する層を追加します。既存の検証ネットワークを置き換えるのではなく、第二の独立した検証として並走させる多層防御の構造です。起点の正しさが検証できなければ確定は成立せず、境界で停止します。攻撃後にログが消されても、固定された認証記録は残り、フォレンジック証拠は失われません。",
  },

  "financial-data-exfiltration": {
    personas: [
      { role: "CISO・セキュリティ運用", quote: "金融データの流出疑いをアラート化したいが、原データを SOC に送れない" },
      { role: "フォレンジック・SOC", quote: "不正アクセス・流出を検知したいが、機密データ自体は触りたくない" },
      { role: "法務・コンプライアンス", quote: "インシデント報告で、何が流出したかを原データなしで証明したい" },
    ],
    without: [
      { k: "tx_id", v: "TX-001" },
      { k: "account", v: "9876-…" },
      { k: "amount", v: "¥10,000,000" },
      { k: "counterparty", v: "〇〇株式会社" },
      { k: "memo", v: "…" },
    ],
    withProof: [
      { k: "claim", v: "異常検知 (rule-3)", strong: true },
      { k: "claim", v: "影響範囲 = customer_segment_A", strong: true },
      { k: "signed_by", v: "internal-monitor" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach:
      "組織間のすべてのデータアクセスについて、誰がいつ何にアクセスしたかを、改ざんできない記録として固定します。顧客データ自体は一切外に出さず、規制当局・出元組織・受け入れ組織の三者が同じ記録を独立に検証できる構造にします。検知（DLP）とログ集約（SIEM）の間に空いていた「記録自体の改ざん不能性」と「組織を跨いだ共有真実」のギャップを、検証可能な事実で埋めます。",
  },
};

export function getUseCaseV3(slug: string): UseCaseV3 | undefined {
  return USE_CASE_V3[slug];
}
