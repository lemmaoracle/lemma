/**
 * Pillars data layer.
 * Hardcoded pillar definitions for the 4 Lemma pillars.
 */

export type PillarSlug =
  | "verifiable-origin"
  | "verifiable-ai"
  | "agent-authority-proof"
  | "regulatory-attribute-proof";

export interface CTA {
  readonly label: string;
  readonly href: string;
  readonly type: "talk-to-us" | "waitlist" | "download" | "whitepaper" | "github" | "demo";
}

export interface LocalizedStrings {
  readonly en: string;
  readonly ja: string;
}

export interface LocalizedArray {
  readonly en: ReadonlyArray<string>;
  readonly ja: ReadonlyArray<string>;
}

export interface CtaCopy {
  readonly eyebrow: LocalizedStrings;
  readonly title: LocalizedStrings;
  readonly desc: LocalizedStrings;
}

export interface HomepageCardTitle {
  readonly en: { readonly line1: string; readonly line2: string };
  readonly ja: { readonly line1: string; readonly line2: string };
}

export interface PillarSEO {
  readonly title?: LocalizedStrings;
  readonly description?: LocalizedStrings;
}

export interface PillarExtraSection {
  readonly label: LocalizedStrings;
  readonly heading: LocalizedStrings;
  readonly paragraphs: LocalizedArray;
}

export interface PillarFAQ {
  readonly q: LocalizedStrings;
  readonly a: LocalizedStrings;
}

export interface Pillar {
  readonly slug: PillarSlug;
  readonly title: LocalizedStrings;
  readonly slogan: LocalizedStrings;
  readonly subtitle: LocalizedStrings;
  readonly homepageCardTitle: HomepageCardTitle;
  readonly homepageBlurb: LocalizedStrings;
  readonly problemStatement: LocalizedStrings;
  readonly whyNow: LocalizedStrings;
  readonly howLemmaFits: LocalizedArray;
  readonly useCaseSlugs: ReadonlyArray<string>;
  readonly primaryCTA: CTA;
  readonly secondaryCTA?: CTA;
  readonly ctaCopy?: CtaCopy;
  readonly cover?: string;
  readonly order: number;
  readonly tags: ReadonlyArray<string>;
  readonly seo?: PillarSEO;
  readonly extraSection?: PillarExtraSection;
  readonly faq?: ReadonlyArray<PillarFAQ>;
}

/* ── Pillar Data (hardcoded) ───────────────────────────────────── */

const PILLARS: ReadonlyArray<Pillar> = [
  {
    slug: "verifiable-origin",
    title: { en: "Verifiable Origin", ja: "来歴証明" },
    slogan: { en: "Cryptographically valid ≠ semantically right", ja: "暗号論理的に有効 ≠ 意味的に正しい" },
    subtitle: { en: "Data is copied. Provenance is carved.", ja: "データは複製される。来歴は刻まれる。" },
    homepageCardTitle: {
      en: { line1: "Data is copied.", line2: "Provenance is carved." },
      ja: { line1: "データは複製される。", line2: "来歴は刻まれる。" },
    },
    homepageBlurb: {
      en: "Lock the origin of assets, documents, and parts to a tamper-proof crypto layer.",
      ja: "資産、文書、部品の出所を、改ざん不能な暗号レイヤで固定する。",
    },
    problemStatement: {
      en: "Data crosses organizations and systems and loses its origin at every hop. Where assets, documents, and parts came from has not been cryptographically provable — auditors and receivers have had to take the publisher's word for it. Lemma carves provenance onto a tamper-evident layer at the moment data is published, so any downstream system can verify origin independently, without re-contacting the publisher. <strong>Verifiable Origin is the data-lineage capability of the Lemma Trust Layer</strong> — one of four cryptographic capabilities composing it.",
      ja: "データは組織やシステムを越えるたびに「出所」を失っていきます。資産・文書・部品が「どこから来たか」は、いまも暗号論理的に証明されておらず、受信側や監査人は発行元の保証を額面通りに受け取るしかありませんでした。Lemma は、データが発行される瞬間に来歴を改ざん耐性のあるレイヤーに刻み、下流のどのシステムも、発行元に問い合わせずに独立して検証できるようにします。<strong>来歴証明は、Lemma の信頼レイヤーが「データ来歴」を担保する層です</strong> — 信頼レイヤーを構成する 4 つの暗号能力のひとつ。",
    },
    whyNow: {
      en: "EU AI Act 2026 — data governance and training / RAG source-provenance requirements for high-risk AI; ISO 42001 audit-trail expectations; supply-chain DPP and CBAM provenance mandates; 2022 Ronin bridge $625M exploit as a cross-domain reference case",
      ja: "EU AI Act 2026 年施行（高リスク AI への学習データ・RAG 来歴義務）、ISO 42001 監査トレイル要件、サプライチェーン DPP / CBAM の来歴義務化、領域横断の参照事案として 2022 年 Ronin bridge $625M 事件",
    },
    howLemmaFits: {
      en: [
        "On-chain origin commitments (Poseidon) — every downstream system verifies without contacting the publisher",
        "Selective disclosure (BBS+) — receivers see only the attribute they need, not the full document",
        "Cross-chain portability (Groth16 ZK) — the same proof travels across chains and tools without reissue",
      ],
      ja: [
        "オンチェーンの出所コミットメント (Poseidon) — 下流のシステムは発行元に問い合わせずに検証できる",
        "選択的開示 (BBS+) — 受信側は必要な属性だけを受け取る。文書全体は渡さない",
        "クロスチェーン移植性 (Groth16 ZK) — 同じ証明を再発行せずにチェーンやツールを越えて持ち運べる",
      ],
    },
    useCaseSlugs: ["rag-content-provenance", "supply-chain-component-provenance", "defi-bridge-verification"],
    primaryCTA: {
      label: "Talk to us",
      href: "/services",
      type: "talk-to-us",
    },
    secondaryCTA: {
      label: "Demo repo",
      href: "https://github.com/lemmaoracle/example-origin",
      type: "github",
    },
    order: 1,
    tags: ["origin", "rag", "ai-data-governance", "supply-chain", "forensics"],
    seo: {
      title: {
        en: "Verifiable Origin — Cryptographic Data Provenance | Lemma Oracle",
        ja: "来歴証明 — データの出所を暗号的に証明 | Lemma Oracle",
      },
      description: {
        en: "Lemma's Verifiable Origin carves data provenance onto a tamper-evident layer at the moment of publication, so any downstream system can verify origin independently — the data-lineage capability of the Lemma Trust Layer.",
        ja: "Lemma の来歴証明は、発行時点で来歴を改ざん耐性のあるレイヤーに刻み、下流のシステムが発行元に問い合わせずに独立検証できるようにします — Lemma の信頼レイヤーを構成する「データ来歴」の能力。",
      },
    },
  },
  {
    slug: "verifiable-ai",
    title: { en: "Verifiable AI", ja: "AI出力の検証可能性" },
    slogan: { en: "Finds bugs ≠ proves decisions", ja: "バグを見つける ≠ 決定を証明する" },
    subtitle: { en: "Models change. Proofs remain.", ja: "モデルは変わる。証明は残る。" },
    homepageCardTitle: {
      en: { line1: "Models change.", line2: "Proofs remain." },
      ja: { line1: "モデルは変わる。", line2: "証明は残る。" },
    },
    homepageBlurb: {
      en: "Record AI decisions and citations so you can trace them back even after model upgrades.",
      ja: "AIの判断と引用を、モデル更新後も遡れる構造で記録する。",
    },
    problemStatement: {
      en: "AI now makes decisions across enterprise and public services every day, and regulation (EU AI Act, ISO 42001) is mandating explainability. But model logs are vendor-controlled and rotate with each upgrade, so there is still no mechanism to verify, after the fact, why a model decided what it decided. Lemma records the inputs, retrieved sources, applied rules, and model generation behind each decision as a tamper-evident attestation, so the audit trail outlives the model version it was made on. <strong>Verifiable AI is the AI-decision capability of the Lemma Trust Layer</strong> — one of four cryptographic capabilities composing it.",
      ja: "AI は、企業と公共の判断を日常的に下しています。規制（EU AI Act、ISO 42001）は説明可能性を義務化しつつありますが、モデルログはベンダー側で管理され、世代交代のたびに失われていくため、「なぜそう判断したか」を後から検証できる仕組みは、いまもありません。Lemma は、判断ごとの入力データ・参照ソース・適用ルール・モデル世代を改ざん耐性のあるアテステーションとして記録し、モデル更新後も監査トレイルが残るようにします。<strong>検証可能 AI は、Lemma の信頼レイヤーが「AI 判断」を担保する層です</strong> — 信頼レイヤーを構成する 4 つの暗号能力のひとつ。",
    },
    whyNow: {
      en: "EU AI Act enforcement in 2026; rising ISO 42001 certification demand",
      ja: "EU AI Act 2026年施行、ISO 42001認証需要の高まり",
    },
    howLemmaFits: {
      en: [
        "ZK attribution — prove which model generation made a decision, on which data, verifiable years later",
        "RAG provenance anchoring — retrieved citations can't drift or be silently reissued",
        "Selective disclosure for compliance reports — reveal only what the auditor needs, not the full input",
      ],
      ja: [
        "ZK 帰属証明 — どのモデル世代がどのデータで判断を下したかを、何年経っても検証できる",
        "RAG 来歴アンカリング — 参照ソースが差し替えられたり消えたりするのを防ぐ",
        "コンプライアンス報告の選択的開示 — 入力全体ではなく、監査人が必要とする部分だけを開示できる",
      ],
    },
    useCaseSlugs: ["ai-audit-log-proof", "rag-source-attestation"],
    primaryCTA: {
      label: "Talk to us",
      href: "/services",
      type: "talk-to-us",
    },
    secondaryCTA: {
      label: "Whitepaper",
      href: "https://tally.so/r/7RJXdR",
      type: "whitepaper",
    },
    order: 2,
    tags: ["ai", "explainability", "audit", "compliance"],
    seo: {
      title: {
        en: "Verifiable AI — Audit-Proof AI Decisions | Lemma Oracle",
        ja: "検証可能 AI — AI 判断を後から検証可能に | Lemma Oracle",
      },
      description: {
        en: "Lemma's Verifiable AI records every AI decision — inputs, retrieved sources, applied rules, model generation — as a tamper-evident attestation that outlives model upgrades. The AI-decision capability of the Lemma Trust Layer.",
        ja: "Lemma の検証可能 AI は、AI 判断ごとの入力・参照ソース・適用ルール・モデル世代を改ざん耐性のあるアテステーションとして記録し、モデル更新後も監査トレイルが残ります — Lemma の信頼レイヤーを構成する「AI 判断」の能力。",
      },
    },
  },
  {
    slug: "agent-authority-proof",
    title: { en: "Agent Authority Proof", ja: "エージェント権限証明" },
    slogan: { en: "Pays ≠ trustworthy", ja: "支払う ≠ 信頼できる" },
    subtitle: { en: "Authority can be delegated. Only provable authority should be.", ja: "権限は渡せる。証明できる権限だけが。" },
    homepageCardTitle: {
      en: { line1: "Authority can be delegated.", line2: "Only provable authority should be." },
      ja: { line1: "権限は渡せる。", line2: "証明できる権限だけが。" },
    },
    homepageBlurb: {
      en: "Make autonomous agents' authority and transactions cryptographically verifiable.",
      ja: "自律エージェントの権限と取引を、暗号的に検証可能にする。",
    },
    problemStatement: {
      en: "AI agents are buying, contracting, and transacting on behalf of humans. Payment rails (x402, MCP) are in place — but most production deployments still hand the agent an API key and rely on prompt-engineered guardrails to prevent over-spending or the wrong recipient. <strong>Lemma calls the missing layer Agent Authority Proof</strong> — authority, spending limits, and the data underlying each transaction are issued as cryptographic attestations, so the receiving side can verify them independently before the transaction commits. Agent Authority Proof covers both the delegation chain — who an agent ultimately acts for, through how many hops — and the per-transaction payment authorization that justifies the spend.",
      ja: "AI エージェントが、人の代わりに買い物・契約・取引を執行しはじめています。決済レール（x402、MCP）は出揃いましたが、本番運用の多くはいまだに、エージェントに API キーを渡し、超過支出や誤送信をプロンプト側のガードレールで防ぐ設計のままです。<strong>Lemma はこの不足を埋める層を「エージェント権限証明 (Agent Authority Proof)」と呼んでいます</strong> — 権限・支払い限度・取引の根拠データを暗号的アテステーションとして発行し、受信側が決済確定の前に独立して検証できる構造です。エージェント権限証明は、権限の連鎖 (delegation chain) — エージェントが最終的に誰の代理で、何段の委譲を経たか — と、その取引の決済権限 (payment authorization) の両方をカバーします。",
    },
    whyNow: {
      en: "x402 protocol adoption, expanding MCP ecosystem, rapid growth of agent economy",
      ja: "x402プロトコルの普及、MCPエコシステムの拡大、エージェント経済の急速な成長",
    },
    howLemmaFits: {
      en: [
        "Prove which principal an agent represents — issued as a ZK attestation, verifiable on-chain or by any counterparty",
        "Bind spending limits to a cryptographic attestation, not to a raw API key or wallet",
        "Carry the upstream principal's authority through multi-step agent chains so it remains verifiable at the leaf",
      ],
      ja: [
        "エージェントが誰の代理かを ZK アテステーションとして発行し、受信側 / オンチェーンで検証できる",
        "支払い限度を、API キーやウォレットではなく暗号的アテステーションに紐付ける",
        "エージェントが多段で連鎖する場面でも、上流の権限を末端まで証明できる",
      ],
    },
    useCaseSlugs: ["delegated-treasury", "multi-agent-workflows", "x402-commerce"],
    primaryCTA: {
      label: "Talk to us",
      href: "https://tally.so/r/EkBqDX",
      type: "talk-to-us",
    },
    secondaryCTA: {
      label: "Join Trust402 waitlist",
      href: "https://tally.so/r/kd0bZR",
      type: "waitlist",
    },
    ctaCopy: {
      eyebrow: { en: "Get Started", ja: "はじめる" },
      title: {
        en: "Ready to issue agent authority as cryptographic attestations — not soft prompts?",
        ja: "エージェントへの権限委譲を、ソフトプロンプトではなく暗号的アテステーションとして発行する準備はできましたか。",
      },
      desc: {
        en: "Talk to us about your use case. We respond within one business day.",
        ja: "ユースケースについてお聞かせください。1 営業日以内にご返信いたします。",
      },
    },
    order: 3,
    tags: ["agent", "x402", "mcp", "authority-proof", "agentic-payments"],
    seo: {
      title: {
        en: "Agent Authority Proof — Agentic Payments Trust Layer | Lemma Oracle",
        ja: "エージェント権限証明 — エージェント決済の信頼レイヤー | Lemma Oracle",
      },
      description: {
        en: "Agentic payments need more than a payment rail. Lemma's Agent Authority Proof makes autonomous agent authority, spend limits, and provenance cryptographically verifiable across x402 and MCP.",
        ja: "エージェント決済 (agentic payments) には決済レール以上のものが必要です。Lemma のエージェント権限証明は、自律エージェントの権限・支払い限度・来歴を x402 や MCP を横断して暗号的に検証可能にします。",
      },
    },
    extraSection: {
      label: {
        en: "Agentic payments",
        ja: "エージェント決済",
      },
      heading: {
        en: "Agent Authority Proof and Trust402 — where the trust layer fits in agentic payments",
        ja: "エージェント権限証明と Trust402 — エージェント決済のどこに入るか",
      },
      paragraphs: {
        en: [
          "Lemma proposes Agent Authority Proof as the trust layer that sits in front of the agent payment step. Rather than handing agents API keys and hoping prompt-engineered guardrails hold, the layer issues authority, spending limits, and provenance as cryptographic attestations — verifiable on-chain or by any counterparty, before the transaction settles. <strong>Trust402 is Lemma's product that realizes this layer at the protocol level for x402-style agent payments.</strong>",
          "Why this layer is needed now: agentic payments — transactions executed autonomously by AI agents — became a real category in 2024–2025 with x402, the Stripe Agent SDK, and MCP-driven tool use. The payment rail problem is largely solved. What remains is the trust question — who is the agent acting for, how much can it spend, and is the data underlying the payment authentic.",
          'The delegated-treasury, multi-agent-workflows, and x402-commerce use cases linked above show how Trust402 and the surrounding pieces compose. For the broader conceptual scope of agentic payments, see the <a href="/glossary/agentic-payments/">glossary entry</a>.',
        ],
        ja: [
          "Lemma が提唱するエージェント権限証明は、エージェント決済の前段に置かれる信頼レイヤーです。エージェントに API キーを渡してプロンプト側のガードレールに頼るのではなく、権限・支払い限度・来歴を暗号的アテステーションとして発行し、オンチェーン、または任意の取引相手側で、決済確定の前に検証できる構造を指します。<strong>Trust402 は、この層を x402 型エージェント決済向けにプロトコルレベルで実装した Lemma の製品です。</strong>",
          "なぜ今このレイヤーが必要か。エージェント決済 (agentic payments) — AI エージェントが自律的に実行する取引 — は、2024〜2025 年の x402・Stripe Agent SDK・MCP 駆動のツール使用によって現実のカテゴリになりました。決済レールの問題はほぼ解けています。残っているのは信頼の問題 — そのエージェントは誰の代理か、いくらまで使えるか、支払いの根拠データは真正か。",
          "上記の delegated-treasury / multi-agent-workflows / x402-commerce ユースケースが、Trust402 と各部品の組み合わせ方を示します。エージェント決済そのものの広い概念整理は <a href=\"/ja/glossary/agentic-payments/\">用語集</a> を参照してください。",
        ],
      },
    },
    faq: [
      {
        q: {
          en: "What is agentic payments?",
          ja: "Agentic payments (エージェント決済) とは何か?",
        },
        a: {
          en: 'A transaction pattern where autonomous AI agents — not humans — are the transacting party. The technical stack centers on x402 (Coinbase\'s revival of HTTP 402 Payment Required), the Stripe Agent SDK, MCP for tool use, and a Facilitator for settlement. The unresolved problem is trust — authority delegation, spend limits, and provenance. Lemma calls this layer Agent Authority Proof, and ships Trust402 as the x402-targeted product implementation. See <a href="/glossary/agentic-payments/">the glossary entry</a> for the full definition.',
          ja: '自律 AI エージェントが — 人間ではなく — 取引主体となる決済形態です。技術スタックは x402 (Coinbase が HTTP 402 を実用化したもの)、Stripe Agent SDK、ツール使用の MCP、決済仲介の Facilitator が中心。残されているのは信頼の問題 — 権限委譲・支払い限度・来歴です。Lemma はこの層をエージェント権限証明と呼び、x402 向けの製品実装として Trust402 を提供しています。完全な定義は <a href="/ja/glossary/agentic-payments/">用語集</a> を参照してください。',
        },
      },
      {
        q: {
          en: "What is the relationship between x402 and Trust402?",
          ja: "x402 と Trust402 の関係は?",
        },
        a: {
          en: 'x402 is a payment protocol; Trust402 is the verification layer that sits in front of it. x402 answers "how does the agent pay" — Trust402 answers "should the agent be allowed to pay, and is the underlying data real." They are complementary, not competing. Trust402 emits ZK attestations of authority, spend limits, and provenance that any x402 facilitator can verify before settlement.',
          ja: "x402 が決済プロトコル、Trust402 はその前段に置かれる検証層。x402 が「エージェントがどう支払うか」に答えるのに対し、Trust402 は「そのエージェントに支払いを許可してよいか、根拠データは真正か」に答える。両者は競合せず相補。Trust402 が権限・限度額・来歴の ZK アテステーションを発行し、x402 の任意の Facilitator が決済前に検証できる。",
        },
      },
      {
        q: {
          en: "How is the Delegated Treasury use case different from other solutions?",
          ja: "Delegated Treasury は他のソリューションと何が違うか?",
        },
        a: {
          en: "Existing agent-payments approaches grant an API key or wallet to the agent and rely on prompt-engineered guardrails to prevent over-spending. Delegated Treasury issues the spending authority itself as a cryptographic attestation — limit, allow-list of counterparties, time window, and the data conditions that justify the transaction. The treasury never grants raw access; the agent earns the right to spend, per transaction, by proving the attestation in zero knowledge.",
          ja: "既存のエージェント決済は、API キーやウォレットをエージェントに渡し、超過支出をプロンプトのガードレールで防ぐ設計が主流。Delegated Treasury では、支払い権限そのものを暗号的アテステーションとして発行する — 限度額・取引相手のホワイトリスト・有効期間・取引を正当化するデータ条件まで。生の権限は渡さない。エージェントは取引ごとにそのアテステーションを ZK で証明することで、支払う権利を得る。",
        },
      },
      {
        q: {
          en: "Where does provenance fit into agentic payments?",
          ja: "Agentic payments のなかで来歴 (provenance) はどこに位置するか?",
        },
        a: {
          en: 'Provenance answers the third trust question: "is the data underlying this payment genuine and unaltered." Without it, an agent can be tricked — by retrieved documents, by upstream tool outputs, by another agent — into authorizing the wrong transaction. Lemma\'s provenance stack is fed into the same Authority Proof attestation chain so that the proof an agent shows at payment time includes evidence that the input data is verifiable. See the <a href="/pillars/verifiable-origin/">Verifiable Origin pillar</a> for the input side.',
          ja: 'プロヴナンス (来歴) は三つ目の信頼問題 — 「この支払いの根拠データは真正か」 — に答える要素。これがないと、検索文書・上流ツール出力・別エージェントを通じてエージェントが誤った取引を承認させられる経路が残る。Lemma の来歴インフラは同じ権限証明のアテステーション連鎖に流し込まれ、支払い時にエージェントが提示する証明に「入力データが真正であること」の根拠が含まれる。入力側は <a href="/ja/pillars/verifiable-origin/">来歴証明の柱</a> を参照。',
        },
      },
    ],
  },
  {
    slug: "regulatory-attribute-proof",
    title: { en: "Regulatory Attribute Proof", ja: "規制属性証明" },
    slogan: { en: "Compliance promised ≠ compliance proven", ja: "コンプライアンスの約束 ≠ コンプライアンスの証明" },
    subtitle: { en: "Data stays. Proofs travel.", ja: "データは渡さない。証明は渡る。" },
    homepageCardTitle: {
      en: { line1: "Data stays.", line2: "Proofs travel." },
      ja: { line1: "データは渡さない。", line2: "証明は渡る。" },
    },
    homepageBlurb: {
      en: "Satisfy KYC/AML, ESG, and data-leakage compliance without sharing originals.",
      ja: "KYC/AML・ESG・データ漏洩対策を、原本を共有せずに成立させる。",
    },
    problemStatement: {
      en: "GDPR, EU AI Act, crypto-asset guidelines, CBAM, EUDR, DPP — regulation's center of gravity is shifting from \"disclose your data\" to \"prove your compliance.\" Most enterprises still respond with self-declaration and paper trails. Lemma issues compliance as cryptographic attestations: regulators and counterparties verify the attribute itself — \"this entity passed KYC,\" \"this shipment is CBAM-compliant,\" \"this dataset met the AI Act requirement\" — without the underlying data ever leaving the enterprise. <strong>Regulatory Attribute Proof is the regulatory-attestation capability of the Lemma Trust Layer</strong> — one of four cryptographic capabilities composing it.",
      ja: "GDPR、EU AI Act、暗号資産ガイドライン、CBAM・EUDR・DPP——規制の重心は、データ開示からコンプライアンス証明へと移ってきています。しかし現場の多くは、いまも自己申告と紙のドキュメントで対応しています。Lemma は、コンプライアンスを暗号的アテステーションとして発行します。「この企業は KYC を通過した」「この出荷は CBAM 適合」「このデータセットは AI Act の要件を満たした」といった属性そのものを、原本データを企業外に出さずに、規制当局や取引相手に検証してもらえる形にします。<strong>規制属性証明は、Lemma の信頼レイヤーが「規制適合」を担保する層です</strong> — 信頼レイヤーを構成する 4 つの暗号能力のひとつ。",
    },
    whyNow: {
      en: "GDPR strengthening, EU AI Act, crypto-asset guidelines, supply chain DDP mandates",
      ja: "GDPR強化、EU AI Act、暗号資産ガイドライン、サプライチェーンDDP義務化の動き",
    },
    howLemmaFits: {
      en: [
        "Attribute-level proofs — \"KYC passed\", \"CBAM compliant\", \"AI Act met\" — verifiable without disclosing the underlying records",
        "Schema-bound proofs — each proof is bound to the regulatory schema it satisfies, so auditors verify against the rule text",
        "Auditable proof trail — regulators can independently replay verification without ever receiving the raw data",
      ],
      ja: [
        "属性レベルの証明 — 「KYC 通過」「CBAM 適合」「AI Act 要件達成」を、根拠データを開示せずに検証可能にする",
        "スキーマバインド証明 — 各証明を、それが満たす規制スキーマと紐付け、監査人は規制条文に対して直接検証できる",
        "監査可能な証明トレイル — 原本データを渡さず、規制当局が独立に再検証できる形で残せる",
      ],
    },
    useCaseSlugs: ["financial-data-exfiltration", "kyc-aml-selective-disclosure", "supply-chain-esg"],
    primaryCTA: {
      label: "Download regulatory whitepaper",
      href: "https://tally.so/r/xX0VYv",
      type: "download",
    },
    order: 4,
    tags: ["regulatory", "kyc", "aml", "compliance", "esg"],
    seo: {
      title: {
        en: "Regulatory Attribute Proof — Compliance Without Disclosure | Lemma Oracle",
        ja: "規制属性証明 — データを共有せずに規制適合を証明 | Lemma Oracle",
      },
      description: {
        en: "Lemma's Regulatory Attribute Proof issues compliance as cryptographic attestations — regulators verify the attribute itself (KYC passed, CBAM-compliant, AI Act met) without the underlying data leaving the enterprise. The regulatory capability of the Lemma Trust Layer.",
        ja: "Lemma の規制属性証明は、コンプライアンスを暗号的アテステーションとして発行 — 「KYC 通過」「CBAM 適合」「AI Act 要件達成」を原本データを企業外に出さずに証明できます — Lemma の信頼レイヤーを構成する「規制適合」の能力。",
      },
    },
  },
];

/* ── Public API ───────────────────────────────────────────────── */

export function getAllPillars(): ReadonlyArray<Pillar> {
  return PILLARS.slice().sort((a, b) => a.order - b.order);
}

export function getPillarBySlug(slug: string): Pillar | undefined {
  return PILLARS.find((p) => p.slug === slug);
}
