/**
 * Use Case detail — v3 template content (authored hooks).
 *
 * The v3 detail template (see `components/usecase/UseCaseV3Body.astro`)
 * compresses the long-form 9-section page into 5 sections and adds two
 * authored hooks that have no source in the markdown:
 *
 *   §1  3 persona quotes (per industry/role)
 *   §2  Before / After data example (raw fields → claims + ZK proof)
 *       + a one-paragraph Lemma-approach callout
 *
 * Everything else the v3 body needs (H1, HIDE→PROVE, lead/abstract,
 * industry tags, reading time, §4 進め方 steps, §5 related cards) is pulled
 * from the existing use case data.
 *
 * Both locales are carried here. Prose fields (persona role/quote, approach)
 * are `{ ja, en }`. Before/After data values are mostly language-neutral
 * (field keys, codes, hashes); only those that contain Japanese carry a
 * `vEn` override — otherwise `v` is shown in both locales. A slug with no
 * entry renders in derived mode (§1 from the audience section, §2 from the
 * approach section + HIDE→PROVE).
 */

interface L10n {
  readonly ja: string;
  readonly en: string;
}

/** One persona voice in §1 — a role label and the concern it speaks. */
export interface V3Persona {
  readonly role: L10n;
  /** First-person concern. No surrounding quotes — the template adds them. */
  readonly quote: L10n;
}

/** One row in the Before card — a raw field that today travels to the AI. */
export interface V3RawRow {
  readonly k: string;
  readonly v: string;
  /** EN override when `v` contains Japanese. */
  readonly vEn?: string;
}

/** One row in the After card — what travels instead under Lemma. */
export interface V3ProofRow {
  readonly k: string;
  readonly v: string;
  readonly vEn?: string;
  /** Emphasize the value (the claim that matters). */
  readonly strong?: boolean;
  /** Render the value as a green ✓ VALID badge. */
  readonly badge?: boolean;
}

export interface UseCaseV3 {
  /** §1 — exactly three persona voices. */
  readonly personas: readonly [V3Persona, V3Persona, V3Persona];
  /** §2 Before card — raw fields handed to the AI today. */
  readonly without: readonly V3RawRow[];
  /** §2 After card — the claims + proof that travel instead. */
  readonly withProof: readonly V3ProofRow[];
  /** §2 approach callout — one paragraph summarizing the Lemma approach. */
  readonly approach: L10n;
}

export const USE_CASE_V3: Readonly<Record<string, UseCaseV3>> = {
  // ── P2 検証可能 AI · リファレンス実装 ──────────────────────────────
  "ai-document-isolation": {
    personas: [
      {
        role: { ja: "情シス・情報セキュリティ", en: "IT / InfoSec" },
        quote: {
          ja: "AI を業務に入れたいが、社内文書をモデルや外部に渡すのが怖くて止まっている",
          en: "We want AI in our workflows, but handing internal documents to a model or outside is too risky — so it's stalled",
        },
      },
      {
        role: { ja: "DX 推進・業務部門", en: "Digital transformation / business unit" },
        quote: {
          ja: "PoC は成功した。でも、本番投入の承認がガバナンス側で止まっている",
          en: "The PoC succeeded — but production sign-off is stuck with governance",
        },
      },
      {
        role: { ja: "CISO・内部監査", en: "CISO / internal audit" },
        quote: {
          ja: "AI が何を参照したか、後から監査時に再現・説明できる仕組みがない",
          en: "We have no way to reconstruct or explain what the AI referenced at audit time",
        },
      },
    ],
    without: [
      { k: "name", v: "田中太郎", vEn: "Taro Tanaka" },
      { k: "address", v: "東京都品川区…", vEn: "Shinagawa, Tokyo…" },
      { k: "contract", v: "A プラン", vEn: "Plan A" },
      { k: "date", v: "2024-08-15" },
      { k: "id", v: "09xxx-xxxx-xxxx" },
    ],
    withProof: [
      { k: "claim", v: "契約区分 = A", vEn: "contract tier = A", strong: true },
      { k: "docHash", v: "0x4a3f…" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach: {
      ja: "文書を暗号化したまま、AI には「必要な事実・属性」だけを証明付きで渡します。生の PII や原本にはモデルを触れさせません。AI が「この事実だけを使った」ことを証跡として残せるので、後から原本を開示せず参照内容を説明できます。",
      en: "The document stays encrypted, and the AI receives only the necessary facts and attributes — with proof. The model never touches raw PII or the original. Because the AI can prove it used only that fact, you can later explain what it referenced without disclosing the source.",
    },
  },

  "ai-audit-log-proof": {
    personas: [
      {
        role: { ja: "内部監査・コンプライアンス", en: "Internal audit / compliance" },
        quote: {
          ja: "AI 判断の根拠を後から再現するために、入力・モデル・過程の証跡が必要",
          en: "To reconstruct the basis of an AI decision later, we need a trail of the inputs, model and process",
        },
      },
      {
        role: { ja: "法務・経営層", en: "Legal / executives" },
        quote: {
          ja: "AI による意思決定を、規制当局・株主に説明できる仕組みがない",
          en: "We can't explain AI-driven decisions to regulators or shareholders",
        },
      },
      {
        role: { ja: "CISO・セキュリティ", en: "CISO / security" },
        quote: {
          ja: "AI 判断の改ざん検知ができず、責任の所在が曖昧になる",
          en: "We can't detect tampering of AI decisions, so accountability is blurred",
        },
      },
    ],
    without: [
      { k: "prompt", v: "〇〇案件の与信判断", vEn: "credit decision for case ○○" },
      { k: "model", v: "gpt-internal-v4" },
      { k: "params", v: "temp=0.2 …" },
      { k: "response", v: "承認", vEn: "approved" },
      { k: "timestamp", v: "2024-08-15…" },
    ],
    withProof: [
      { k: "claim", v: "承認判断 = 規定遵守", vEn: "approval = policy-compliant", strong: true },
      { k: "model_hash", v: "0x7a2c…" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach: {
      ja: "AI が判断を下した瞬間に、使ったモデル・入力した事実・適用した基準・最終結論を、ひとつの検証可能な証跡として固定します。原本データは社内に留まり、外部に渡るのは「いつ・どのモデルが・何を根拠に・何を判断したか」という事実だけ。モデルが更新されても過去の判断は不変に残り、当時のデータを開示せず、当局・監査人・申立者が同じ証跡を独立に検証できます。",
      en: "At the moment the AI decides, the model used, the facts input, the criteria applied, and the final conclusion are fixed as one verifiable trail. The raw data stays in-house; what leaves is only the fact of \"when, which model, on what basis, decided what.\" Past decisions stay immutable even as the model updates, and regulators, auditors and claimants can independently verify the same trail without disclosing the original data.",
    },
  },

  "kyc-aml-selective-disclosure": {
    personas: [
      {
        role: { ja: "金融機関 KYC 担当", en: "Bank KYC team" },
        quote: {
          ja: "顧客の年齢・適格性だけ確認したいが、原本（パスポート・住所証明）を全部受け取ってしまう",
          en: "We only need to confirm a customer's age and eligibility, yet we end up receiving the full originals — passport, proof of address",
        },
      },
      {
        role: { ja: "コンプライアンス", en: "Compliance" },
        quote: {
          ja: "規制当局には適合性だけ証明したい。個人情報の流出リスクは取りたくない",
          en: "We want to prove only compliance to regulators, without taking on PII leakage risk",
        },
      },
      {
        role: { ja: "プラットフォーム事業者", en: "Platform operator" },
        quote: {
          ja: "KYC を委託先に依頼するたび、個人情報が外部に拡散している",
          en: "Every time we outsource KYC, personal data spreads further outside",
        },
      },
    ],
    without: [
      { k: "name", v: "田中太郎", vEn: "Taro Tanaka" },
      { k: "dob", v: "1985-04-12" },
      { k: "address", v: "東京都…", vEn: "Tokyo…" },
      { k: "passport_no", v: "TR1234…" },
      { k: "id_image", v: "base64…" },
    ],
    withProof: [
      { k: "claim", v: "年齢 ≥ 18 ∧ 居住 = JP", vEn: "age ≥ 18 ∧ residence = JP", strong: true },
      { k: "claim", v: "AML clean", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach: {
      ja: "審査を済ませた発行者（金融機関）が、顧客属性を一つずつ独立した証跡として発行します。住所・生年月日・取引履歴の原本は発行者の手元に留まり、受け入れ側に渡るのは「18 歳以上」「居住地は日本」「制裁リスト不適合」といった必要な属性の証明だけ。データを共有せずに、属性の真正性・発行者・有効期限・本人同意を、規制当局・受け入れ機関・顧客が独立に検証できます。",
      en: "An issuer that has already done the screening (the bank) issues each customer attribute as an independent trail. The original address, date of birth and transaction history stay with the issuer; what the receiving side gets is only the proof of the needed attributes — \"18 or older,\" \"resident in Japan,\" \"not on a sanctions list.\" Without sharing the data, regulators, receiving institutions and the customer can independently verify the attribute's authenticity, issuer, validity and consent.",
    },
  },

  // ── P1 来歴証明（主軸）/ P4 規制 横断 ──────────────────────────────
  "supply-chain-esg": {
    personas: [
      {
        role: { ja: "調達部・サプライチェーン管理", en: "Procurement / supply-chain management" },
        quote: {
          ja: "サプライヤから ESG / 関税適合情報を集めたいが、商取引データそのものは受け取りたくない",
          en: "We want ESG / customs-compliance info from suppliers, but not their actual transaction data",
        },
      },
      {
        role: { ja: "規制対応・コンプライアンス", en: "Regulatory / compliance" },
        quote: {
          ja: "EUDR / CBAM 適合を多階層で証明する必要があるが、サプライヤの機密が壁",
          en: "We must prove EUDR / CBAM compliance across tiers, but supplier confidentiality is the wall",
        },
      },
      {
        role: { ja: "ESG 担当", en: "ESG lead" },
        quote: {
          ja: "調達先のカーボン強度・原産国を、原本データを集めず連鎖検証したい",
          en: "We want to chain-verify suppliers' carbon intensity and origin without collecting raw data",
        },
      },
    ],
    without: [
      { k: "supplier", v: "ABC corp" },
      { k: "contract_value", v: "5,200,000 USD" },
      { k: "co2_intensity", v: "0.83 kgCO2/kg" },
      { k: "origin_country", v: "BR…" },
      { k: "invoice", v: "…" },
    ],
    withProof: [
      { k: "claim", v: "CBAM 適合 ∧ EUDR 適合", vEn: "CBAM compliant ∧ EUDR compliant", strong: true },
      { k: "claim", v: "carbon_intensity < 1.0", strong: true },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach: {
      ja: "サプライチェーンの各階層が ESG 属性（排出量・原産地・労働条件）を発行者署名付きで発行し、上流とつなげて多階層チェーンを連鎖させます。原料明細・サプライヤ名・契約条件は各社の手元に留まり、外部に渡るのは「CBAM 閾値以下」「EUDR 適合」のような適合性の証明だけ。二重計上は原料単位の紐付けで構造的に検出され、自律発注エージェントも発注確定前にこれを検証できます。",
      en: "Each supply-chain tier issues ESG attributes (emissions, origin, labor conditions) with an issuer signature, chained upstream into a multi-tier proof. Material details, supplier names and contract terms stay with each company; what leaves is only the compliance proof — \"below the CBAM threshold,\" \"EUDR-compliant.\" Double counting is structurally detected by per-material binding, and an autonomous purchasing agent can verify this before confirming an order.",
    },
  },

  "rag-source-attestation": {
    personas: [
      {
        role: { ja: "情シス・DX 推進", en: "IT / digital transformation" },
        quote: {
          ja: "RAG が回答した内容の引用元が、本当に最新版・正本かを確認する手段がない",
          en: "We have no way to confirm a RAG answer's citation is really the latest, authentic version",
        },
      },
      {
        role: { ja: "AI 開発担当", en: "AI engineering" },
        quote: {
          ja: "RAG パイプラインに信頼できないソースが紛れ込んでも検知できない",
          en: "We can't detect an untrusted source slipping into the RAG pipeline",
        },
      },
      {
        role: { ja: "監査・品質", en: "Audit / quality" },
        quote: {
          ja: "AI 回答の出所を、後から監査時に再現・説明できる仕組みが必要",
          en: "We need to reconstruct and explain where an AI answer came from at audit time",
        },
      },
    ],
    without: [
      { k: "query", v: "育児休業の申請手順は？", vEn: "How do I apply for parental leave?" },
      { k: "retrieved_doc", v: "就業規則.pdf", vEn: "work-rules.pdf" },
      { k: "version", v: "v2.1（旧版）", vEn: "v2.1 (old)" },
      { k: "content", v: "本文抜粋…", vEn: "excerpt…" },
      { k: "source", v: "社内共有ドライブ", vEn: "shared drive" },
    ],
    withProof: [
      { k: "claim", v: "就業規則 @ v3.2（latest）", vEn: "work-rules @ v3.2 (latest)", strong: true },
      { k: "docHash", v: "0x9b1d…" },
      { k: "signed_by", v: "docs.internal" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach: {
      ja: "AI が回答に引用した各ソースを、その引用が指す正確な文書バージョンに暗号的に紐付けます。引用は単なるラベルではなく、検証可能な参照になります。原本本体はインデックスにも回答にも渡らず、外部に渡るのは「この引用は回答時点で有効だった版に由来する」という事実だけ。ベクトル DB が再構築されてもポリシーが改訂されても、過去の回答に付いた引用証明は不変です。",
      en: "Each source the AI cites is cryptographically bound to the exact document version that citation points to. A citation becomes a verifiable reference, not just a label. The original body reaches neither the index nor the answer; what leaves is only the fact that \"this citation comes from the version valid at answer time.\" Even if the vector DB is rebuilt or the policy is revised, the citation proof attached to a past answer stays immutable.",
    },
  },

  "rag-content-provenance": {
    personas: [
      {
        role: { ja: "情シス・業務 DX", en: "IT / business DX" },
        quote: {
          ja: "RAG に取り込む文書の来歴を、取り込み時点で固定する仕組みが要る",
          en: "We need to lock a document's provenance at the moment it's ingested into RAG",
        },
      },
      {
        role: { ja: "ガバナンス", en: "Governance" },
        quote: {
          ja: "文書が改ざんされていないこと、誰が発行したかを後から検証したい",
          en: "We want to verify later that a document is untampered and who issued it",
        },
      },
      {
        role: { ja: "AI 開発担当", en: "AI engineering" },
        quote: {
          ja: "文書のバージョン管理と、改ざん検知を一体で運用したい",
          en: "We want document versioning and tamper detection operated as one",
        },
      },
    ],
    without: [
      { k: "doc_path", v: "/shared/就業規則.pdf", vEn: "/shared/work-rules.pdf" },
      { k: "uploaded_by", v: "user-123" },
      { k: "content", v: "本文…", vEn: "body…" },
      { k: "version", v: "未管理", vEn: "untracked" },
      { k: "signed", v: "なし", vEn: "none" },
    ],
    withProof: [
      { k: "claim", v: "就業規則 @ v3 · 発行 docs.internal", vEn: "work-rules @ v3 · issued by docs.internal", strong: true },
      { k: "docHash", v: "0x4f8a…" },
      { k: "chain", v: "prev_hash → curr_hash" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach: {
      ja: "社内文書を RAG に取り込む瞬間に、原本を暗号化したうえで、文書の指紋（docHash）・発行者署名・有効バージョンをインデックス側に刻みます。AI が検索でヒットさせるのは原本そのものではなく、来歴を持つ事実だけ。引用された一文は、刻まれた指紋経由でどの版に由来するかを追跡でき、改訂されれば古い版の引用は構造的に検知できます。",
      en: "At the moment an internal document is ingested into RAG, the original is encrypted and its fingerprint (docHash), issuer signature and valid version are inscribed on the index side. What the AI retrieves is not the original itself but only facts that carry provenance. A cited sentence can be traced through the inscribed fingerprint to the version it came from, and once revised, citations of the old version are structurally detected.",
    },
  },

  // ── P2 検証可能 AI（DeFi / セキュリティ）──────────────────────────
  "defi-bridge-verification": {
    personas: [
      {
        role: { ja: "DeFi プロトコル開発者", en: "DeFi protocol developer" },
        quote: {
          ja: "Bridge 経由の tx が改ざんされていないか、独立検証する手段が要る",
          en: "We need to independently verify that a bridged tx wasn't tampered with",
        },
      },
      {
        role: { ja: "プロトコル運営", en: "Protocol operations" },
        quote: {
          ja: "Bridge を経由する資金の正当性を、外部の利用者に証明したい",
          en: "We want to prove to external users that funds crossing the bridge are legitimate",
        },
      },
      {
        role: { ja: "セキュリティ", en: "Security" },
        quote: {
          ja: "Bridge 攻撃の検知に、暗号証跡が必要",
          en: "We need a cryptographic trail to detect bridge attacks",
        },
      },
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
    approach: {
      ja: "受信側が状態を確定する前に、メッセージの起点が正規かどうかを独立に検証する層を追加します。既存の検証ネットワークを置き換えるのではなく、第二の独立した検証として並走させる多層防御の構造です。起点の正しさが検証できなければ確定は成立せず、境界で停止します。攻撃後にログが消されても、固定された認証記録は残り、フォレンジック証拠は失われません。",
      en: "Before the receiving side finalizes state, a layer independently verifies whether the message's origin is legitimate. Rather than replacing the existing verification network, it runs alongside as a second, independent check — defense in depth. If the origin can't be verified, finalization doesn't happen; it stops at the boundary. Even if logs are wiped after an attack, the fixed attestation record remains and the forensic evidence is not lost.",
    },
  },

  "financial-data-exfiltration": {
    personas: [
      {
        role: { ja: "CISO・セキュリティ運用", en: "CISO / security operations" },
        quote: {
          ja: "金融データの流出疑いをアラート化したいが、原データを SOC に送れない",
          en: "We want to alert on suspected financial-data exfiltration, but can't send raw data to the SOC",
        },
      },
      {
        role: { ja: "フォレンジック・SOC", en: "Forensics / SOC" },
        quote: {
          ja: "不正アクセス・流出を検知したいが、機密データ自体は触りたくない",
          en: "We want to detect unauthorized access and exfiltration without touching the sensitive data itself",
        },
      },
      {
        role: { ja: "法務・コンプライアンス", en: "Legal / compliance" },
        quote: {
          ja: "インシデント報告で、何が流出したかを原データなしで証明したい",
          en: "For incident reporting, we want to prove what was exfiltrated without the raw data",
        },
      },
    ],
    without: [
      { k: "tx_id", v: "TX-001" },
      { k: "account", v: "9876-…" },
      { k: "amount", v: "¥10,000,000" },
      { k: "counterparty", v: "〇〇株式会社", vEn: "Acme Co." },
      { k: "memo", v: "…" },
    ],
    withProof: [
      { k: "claim", v: "異常検知 (rule-3)", vEn: "anomaly detected (rule-3)", strong: true },
      { k: "claim", v: "影響範囲 = customer_segment_A", vEn: "impact = customer_segment_A", strong: true },
      { k: "signed_by", v: "internal-monitor" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach: {
      ja: "組織間のすべてのデータアクセスについて、誰がいつ何にアクセスしたかを、改ざんできない記録として固定します。顧客データ自体は一切外に出さず、規制当局・出元組織・受け入れ組織の三者が同じ記録を独立に検証できる構造にします。検知（DLP）とログ集約（SIEM）の間に空いていた「記録自体の改ざん不能性」と「組織を跨いだ共有真実」のギャップを、検証可能な事実で埋めます。",
      en: "For every cross-organization data access, who accessed what and when is fixed as a tamper-proof record. The customer data itself never leaves; regulators, the originating org and the receiving org can each independently verify the same record. The gap that sat between detection (DLP) and log aggregation (SIEM) — \"tamper-proofness of the record itself\" and \"a shared truth across organizations\" — is filled with verifiable facts.",
    },
  },

  // ── P3 エージェント権限証明（自律エージェント · Trust402）──────────────
  "agent-expense-approval": {
    personas: [
      {
        role: { ja: "経理・財務", en: "Accounting / Finance" },
        quote: {
          ja: "経費承認の自動化を進めたいが、無制限の権限委譲は怖い",
          en: "We want to automate expense approvals, but handing over unlimited authority is scary",
        },
      },
      {
        role: { ja: "法務・内部統制", en: "Legal / internal control" },
        quote: {
          ja: "AI による承認の権限スコープを、後から監査可能な形で残したい",
          en: "We want the AI's approval-authority scope kept in an auditable form",
        },
      },
      {
        role: { ja: "DX 推進", en: "Digital transformation" },
        quote: {
          ja: "経費承認の reaction time を 24h → 即時に短縮したい",
          en: "We want to cut approval turnaround from 24h to instant",
        },
      },
    ],
    without: [
      { k: "request", v: "¥85,000" },
      { k: "category", v: "出張", vEn: "travel" },
      { k: "approver", v: "AI-001" },
      { k: "approved", v: "yes" },
      { k: "log", v: "timestamp / IP / session_id…" },
    ],
    withProof: [
      { k: "agent", v: "did:lemma:agent-expense-bot" },
      { k: "delegatedBy", v: "did:lemma:org-acme-fin" },
      { k: "role", v: "expense_approver" },
      { k: "spendLimitUSDC", v: "1000", strong: true },
      { k: "scope", v: "[travel, office, client]" },
      { k: "validUntil", v: "2026-12-31" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach: {
      ja: "経理・財務部門が、上限額・カテゴリ・担当範囲・有効期限を持つ委任を署名付きで発行します。エージェントは承認を出す前にこの範囲を runtime で検証し、範囲内なら自律承認、範囲外は人間にエスカレーションして止まります。承認権限の中身を開示せず、「正規の委任の範囲内で承認した」ことを後から独立に検証できます。",
      en: "The finance team issues a signed delegation with a spend ceiling, categories, scope and validity. Before approving, the agent verifies it stays within that scope at runtime — auto-approving inside it and escalating to a human outside it. Without disclosing the approval authority itself, the fact \"approved within an authorized delegation\" can later be independently verified.",
    },
  },

  "agent-procurement": {
    personas: [
      {
        role: { ja: "調達部・購買", en: "Procurement / purchasing" },
        quote: {
          ja: "定型発注の自動化を進めたいが、ベンダ選定権を AI に丸投げできない",
          en: "We want to automate routine ordering, but can't hand vendor selection wholesale to the AI",
        },
      },
      {
        role: { ja: "経理", en: "Accounting" },
        quote: {
          ja: "発注の予算統制を、リアルタイムで効かせたい",
          en: "We want budget control on orders enforced in real time",
        },
      },
      {
        role: { ja: "監査", en: "Audit" },
        quote: {
          ja: "AI による発注の権限根拠を、後から検証可能にしたい",
          en: "We want the authority behind an AI's order to be verifiable after the fact",
        },
      },
    ],
    without: [
      { k: "vendor", v: "ABC corp" },
      { k: "amount", v: "5,500,000 JPY" },
      { k: "category", v: "office_supplies" },
      { k: "authorized_by", v: "AI-002" },
      { k: "ordered_at", v: "2024-08-15…" },
    ],
    withProof: [
      { k: "agent", v: "did:lemma:agent-procurement-bot" },
      { k: "delegatedBy", v: "did:lemma:org-acme-procurement" },
      { k: "role", v: "procurement_agent" },
      { k: "spendLimitUSDC", v: "5000", strong: true },
      { k: "scope", v: "[vendor:authorized, category:office-supplies]" },
      { k: "validUntil", v: "2026-09-30" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach: {
      ja: "調達・購買部門が、上限額・認証済みベンダ・カテゴリ・有効期限を持つ委任を署名付きで発行します。エージェントは発注を確定する前にこの範囲を runtime で検証し、範囲内なら自律発注、範囲外は止まります。取引先データや予算の中身を開示せず、「正規の委任の範囲内で発注した」ことを独立に検証できます。",
      en: "The procurement team issues a signed delegation with a spend ceiling, approved vendors, categories and validity. Before confirming an order, the agent verifies it stays within scope at runtime — ordering autonomously inside it and stopping outside it. Without disclosing supplier data or budgets, the fact \"ordered within an authorized delegation\" can be independently verified.",
    },
  },

  "agent-api-billing": {
    personas: [
      {
        role: { ja: "開発者", en: "Developer" },
        quote: {
          ja: "AI エージェントに API キーを渡すリスクを避けたい。範囲付きで委任したい",
          en: "We want to avoid the risk of handing an AI agent the API key — delegate with scope instead",
        },
      },
      {
        role: { ja: "IT 部門", en: "IT" },
        quote: {
          ja: "AI が使う API の課金を、リアルタイムで統制したい",
          en: "We want real-time control over the billing of the APIs the AI uses",
        },
      },
      {
        role: { ja: "セキュリティ", en: "Security" },
        quote: {
          ja: "API キー漏洩のリスクを構造的に解消したい",
          en: "We want to structurally eliminate the risk of API-key leakage",
        },
      },
    ],
    without: [
      { k: "api_key", v: "sk-proj-…" },
      { k: "endpoint", v: "/v1/chat/completions" },
      { k: "cost", v: "$0.05" },
      { k: "agent", v: "AI-003" },
      { k: "total_month", v: "$124.50" },
    ],
    withProof: [
      { k: "agent", v: "did:lemma:agent-AI-003" },
      { k: "delegatedBy", v: "did:lemma:org-acme-dev" },
      { k: "role", v: "api_caller" },
      { k: "spendLimitUSDC", v: "100", strong: true },
      { k: "scope", v: "x402://api.openai.com/*" },
      { k: "validUntil", v: "2026-06-30T23:59:59Z" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach: {
      ja: "組織・開発者が、課金上限・許可 API・有効期限を持つ委任を署名付きで発行します。API キーそのものはエージェントに渡しません。x402 middleware が API call の前に Trust402 で権限を確認し、範囲内なら自律実行、範囲外は実行前に止まります。キーや課金権限の中身を開示せず、「範囲内で呼び出した」ことを独立に検証できます。",
      en: "An org or developer issues a signed delegation with a billing ceiling, allowed APIs and validity — without handing the agent the API key itself. x402 middleware checks authority via Trust402 before each call, executing inside scope and stopping before anything outside it. Without disclosing keys or billing authority, the fact \"called within scope\" can be independently verified.",
    },
  },

  "agent2agent-settlement": {
    personas: [
      {
        role: { ja: "A2A 開発者", en: "A2A developer" },
        quote: {
          ja: "マルチエージェント間の権限委任を、可監査な形で実装したい",
          en: "We want to implement delegation across multiple agents in an auditable form",
        },
      },
      {
        role: { ja: "プロトコル運営", en: "Protocol operations" },
        quote: {
          ja: "エージェント間取引の正当性を、第三者検証可能にしたい",
          en: "We want the legitimacy of agent-to-agent transactions to be third-party verifiable",
        },
      },
      {
        role: { ja: "監査", en: "Audit" },
        quote: {
          ja: "AI エージェント取引の責任の所在を、chain として残したい",
          en: "We want accountability for AI-agent transactions kept as a chain",
        },
      },
    ],
    without: [
      { k: "from_agent", v: "A-001" },
      { k: "to_agent", v: "A-002" },
      { k: "tx", v: "250 USDC" },
      { k: "purpose", v: "data_purchase" },
      { k: "chain", v: "?（権限の根拠が不明）", vEn: "? (basis unknown)" },
    ],
    withProof: [
      { k: "agent", v: "did:lemma:agent-A-002" },
      { k: "delegatedBy", v: "did:lemma:org-acme-fin" },
      { k: "role", v: "settlement_agent" },
      { k: "chain", v: "[org-acme-fin → A-001 → A-002]", strong: true },
      { k: "scope", v: "a2a://acme.fin/*" },
      { k: "validUntil", v: "2026-12-31" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach: {
      ja: "root 組織 → エージェント → サブエージェントの階層的な委任を、それぞれ署名付きの証明として発行します。取引の前段で委任の連鎖が範囲内かを runtime で検証し、連鎖が途切れていれば取引は成立しません。委任関係や取引内容の中身を開示せず、最終取引から委任元までを chain として辿り、正当性を独立に検証できます。",
      en: "Hierarchical delegations — root org → agent → sub-agent — are each issued as a signed proof. Before a transaction, the delegation chain is verified to be in scope at runtime; if the chain is broken, the transaction does not settle. Without disclosing the delegation relationships or transaction contents, the chain can be traced from the final transaction back to its origin and its legitimacy independently verified.",
    },
  },
};

export function getUseCaseV3(slug: string): UseCaseV3 | undefined {
  return USE_CASE_V3[slug];
}
