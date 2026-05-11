/**
 * Pillars data layer.
 * Hardcoded pillar definitions for the 4 Lemma pillars.
 */

export type PillarSlug =
  | "verifiable-origin"
  | "verifiable-ai"
  | "agent-trust-chain"
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
  readonly orientation?: LocalizedStrings;
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
      en: "In bridge and cross-chain transfers, asset origin is not cryptographically proven",
      ja: "Bridge・クロスチェーン移転において、資産の「出所」は暗号論理的に証明されていない",
    },
    whyNow: {
      en: "2024 Ronin bridge $625M exploit; 2025 FSA crypto-asset guidelines enforcement",
      ja: "2024年 Ronin bridge $625M事件、2025年 FSA暗号資産ガイドライン施行",
    },
    howLemmaFits: {
      en: [
        "Poseidon hash for on-chain commitment",
        "BBS+ signatures for selective disclosure",
        "Groth16 proofs for cross-chain verification",
      ],
      ja: [
        "オンチェーンコミットメントにPoseidonハッシュ",
        "選択的開示にBBS+署名",
        "クロスチェーン検証にGroth16証明",
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
    tags: ["origin", "bridge", "cross-chain", "forensics"],
    orientation: {
      en: "Data crosses organizations, systems, and AIs — and loses its origin at every hop.\nThe $625M moved in the 2024 Ronin bridge incident was cryptographically valid at every step.\nDocuments indexed into a 2026 RAG pipeline lose their identity the moment they're touched.\nValidity of form and validity of meaning are not the same thing.",
      ja: "データは、組織を越え、システムを越え、AI に読まれるたびに「出所」を失っていきます。\n2024 年の Ronin bridge 事案で動いた 6 億 2,500 万ドルは、暗号的にはすべて有効でした。\n2026 年の RAG インデックスに取り込まれた文書も、AI に読まれた瞬間、原本との同一性を失います。\n形式の正しさと、意味の正しさは別物です。",
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
      en: "No mechanism exists to retrospectively verify AI decision rationale. Accountability and audit requirements pose fundamental challenges",
      ja: "AIの判断根拠を後から検証できる仕組みが欠如している。説明責任と監査対応で根本的な問いに直面する",
    },
    whyNow: {
      en: "EU AI Act enforcement in 2026; rising ISO 42001 certification demand",
      ja: "EU AI Act 2026年施行、ISO 42001認証需要の高まり",
    },
    howLemmaFits: {
      en: [
        "ZK proofs for AI decision attribution",
        "Permanent provenance for RAG sources",
        "Selective disclosure for compliance reports",
      ],
      ja: [
        "AI判断の帰属にZK証明",
        "RAG情報源の永続的来歴",
        "コンプラインス報告のための選択的開示",
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
    orientation: {
      en: "AI is now making decisions across enterprise and public services every day.\nThe EU AI Act, effective 2026, mandates automated logging and data governance for high-risk AI.\nISO 42001 requires AI management systems to be auditable.\nModels update, logs decay — but the obligation to explain each decision remains.",
      ja: "AI は、企業と公共の判断を、日常的に下し始めています。\nEU AI Act は 2026 年に高リスク AI への自動ログとデータガバナンスを義務化し、\nISO 42001 は AI マネジメントシステムの監査可能性を求めています。\nモデルは更新され、ログは散逸する。それでも「なぜそう判断したか」を説明する責務は残ります。",
    },
  },
  {
    slug: "agent-trust-chain",
    title: { en: "Agent Trust Chain", ja: "エージェント信頼チェーン" },
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
      en: "In agent-to-agent transactions, there is no way to verify who has what authority and what data underlies a payment",
      ja: "エージェント同士の取引において、誰が何の権限でどのデータに基づく支払いかを検証する手段がない",
    },
    whyNow: {
      en: "x402 protocol adoption, expanding MCP ecosystem, rapid growth of agent economy",
      ja: "x402プロトコルの普及、MCPエコシステムの拡大、エージェント経済の急速な成長",
    },
    howLemmaFits: {
      en: [
        "ZK-proven agent identity and role",
        "On-chain spend control attestation",
        "Cross-agent trust chain verification",
      ],
      ja: [
        "ZK証明によるエージェント身元と権限",
        "オンチェーン支払制限アテステーション",
        "エージェント間信頼チェーン検証",
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
    tags: ["agent", "x402", "mcp", "trust-chain", "agentic-payments"],
    orientation: {
      en: "AI agents are now buying, contracting, and transacting on behalf of humans.\nIn Q1 2026, Coinbase captured over 90% of on-chain agentic stablecoin volume.\nx402 settled more than 100 million payments. The rails are in.\nThe unresolved question is who proves these transactions were authorized — and on what data.",
      ja: "AI エージェントが、人の代わりに買い物・契約・取引を執行する時代が始まっています。\nCoinbase は 2026 年 Q1、オンチェーンのエージェント決済の 90% 超を独占し、\nx402 は 1 億件を超えました。レールは出揃いました。\n残された問いは、その上に走る取引の「正当性」を誰がどう証明するか、です。",
    },
    seo: {
      title: {
        en: "Agent Trust Chain — Agentic Payments Trust Layer | Lemma Oracle",
        ja: "エージェント信頼チェーン — エージェント決済の信頼レイヤー | Lemma Oracle",
      },
      description: {
        en: "Agentic payments need more than a payment rail. Lemma's Agent Trust Chain makes autonomous agent authority, spend limits, and provenance cryptographically verifiable across x402 and MCP.",
        ja: "エージェント決済 (agentic payments) には決済レール以上のものが必要です。Lemma のエージェント信頼チェーンは、自律エージェントの権限・支払い限度・来歴を x402 や MCP を横断して暗号的に検証可能にします。",
      },
    },
    extraSection: {
      label: {
        en: "Agentic payments",
        ja: "エージェント決済",
      },
      heading: {
        en: "Agentic payments and Trust Chain — the trust layer for autonomous transactions",
        ja: "Agentic payments と Trust Chain — エージェント決済の信頼レイヤー",
      },
      paragraphs: {
        en: [
          'Agentic payments — transactions executed autonomously by AI agents — became a real category in 2024–2025 with x402, the Stripe Agent SDK, and MCP-driven tool use. The payment rail problem is largely solved. The remaining problem is trust: who is the agent acting for, how much can it spend, and is the data underlying the payment authentic.',
          "Agent Trust Chain is the trust layer that sits in front of the payment step. Rather than handing agents API keys and hoping prompt-engineered guardrails hold, Lemma issues authority, spending limits, and provenance as cryptographic attestations — verifiable on-chain or by any counterparty.",
          'The Trust402 product is the protocol-level realization of this layer for x402-style agent payments. The delegated-treasury, multi-agent-workflows, and x402-commerce use cases linked above show how the pieces compose. For the conceptual scope of agentic payments itself, see the <a href="/glossary/agentic-payments/">glossary entry</a>.',
        ],
        ja: [
          "エージェント決済 (agentic payments) — AI エージェントが自律的に実行する取引 — は、2024〜2025 年の x402・Stripe Agent SDK・MCP 駆動のツール使用によって現実のカテゴリになった。決済レールの問題はほぼ解けている。残るのは信頼の問題: そのエージェントは誰の代理か、いくらまで使えるか、支払いの根拠データは真正か。",
          "エージェント信頼チェーン (Agent Trust Chain) は、決済の前段に置かれる信頼レイヤー。エージェントに API キーを渡してプロンプトのガードレールに頼るのではなく、Lemma は権限・支払い限度・来歴を暗号的アテステーションとして発行する。オンチェーン、または任意の取引相手側で検証可能。",
          "Trust402 はこのレイヤーを x402 型エージェント決済向けにプロトコルレベルで実装したもの。上記の delegated-treasury / multi-agent-workflows / x402-commerce ユースケースが、各部品の組み合わせ方を示す。エージェント決済そのものの概念整理は <a href=\"/ja/glossary/agentic-payments/\">用語集</a> を参照。",
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
          en: 'A transaction pattern where autonomous AI agents — not humans — are the transacting party. The technical stack centers on x402 (Coinbase\'s revival of HTTP 402 Payment Required), the Stripe Agent SDK, MCP for tool use, and a Facilitator for settlement. The unresolved problem is trust: authority delegation, spend limits, and provenance. See <a href="/glossary/agentic-payments/">the glossary entry</a> for the full definition.',
          ja: '自律 AI エージェントが — 人間ではなく — 取引主体となる決済形態。技術スタックは x402 (Coinbase が HTTP 402 を実用化したもの)、Stripe Agent SDK、ツール使用の MCP、決済仲介の Facilitator が中心。残されているのは信頼の問題: 権限委譲・支払い限度・来歴。完全な定義は <a href="/ja/glossary/agentic-payments/">用語集</a> を参照。',
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
          en: 'Provenance answers the third trust question: "is the data underlying this payment genuine and unaltered." Without it, an agent can be tricked — by retrieved documents, by upstream tool outputs, by another agent — into authorizing the wrong transaction. Lemma\'s provenance stack is fed into the same Trust Chain so that the attestation an agent shows at payment time includes a proof that the input data is verifiable. See the <a href="/pillars/verifiable-origin/">Verifiable Origin pillar</a> for the input side.',
          ja: 'プロヴナンス (来歴) は三つ目の信頼問題 — 「この支払いの根拠データは真正か」 — に答える要素。これがないと、検索文書・上流ツール出力・別エージェントを通じてエージェントが誤った取引を承認させられる経路が残る。Lemma の来歴インフラは同じ Trust Chain に流し込まれ、支払い時にエージェントが提示するアテステーションに「入力データが真正であること」の証明が含まれる。入力側は <a href="/ja/pillars/verifiable-origin/">Verifiable Origin ピラー</a> を参照。',
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
      en: "Regulatory compliance (KYC/AML, data residency, DPP, ESG) still relies on self-declaration and paper documentation — not on programmatically verifiable proofs",
      ja: "規制要件 (KYC/AML・データレジデンシー・DPP・ESG) への適合は、いまも自己申告と紙のドキュメントに依存しており、プログラムで検証できる証明には変換されていない",
    },
    whyNow: {
      en: "GDPR strengthening, EU AI Act, crypto-asset guidelines, supply chain DDP mandates",
      ja: "GDPR強化、EU AI Act、暗号資産ガイドライン、サプライチェーンDDP義務化の動き",
    },
    howLemmaFits: {
      en: [
        "Attribute-level compliance proofs",
        "Schema-bound regulatory requirements",
        "Auditable proof trail without data exposure",
      ],
      ja: [
        "属性レベルのコンプライアンス証明",
        "スキーマバインド規制要件",
        "データ開示なしの監査可能な証明トレイル",
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
    orientation: {
      en: "GDPR. EU AI Act. Crypto-asset guidelines. CBAM. EUDR. DPP.\nRegulation is converging on a single demand: not \"disclose your data,\"\nbut \"prove your compliance.\"\nYet most enterprises still respond with self-declaration and paper trails.\nWhat's required now is proof — not promise.",
      ja: "GDPR、EU AI Act、暗号資産ガイドライン、CBAM・EUDR・DPP——\n規制は「データを開示しろ」ではなく「コンプライアンスを証明しろ」を求める方向に揃いつつあります。\nしかし現場の多くは、いまも自己申告と紙のサプライヤ書類で対応しています。\n求められているのは「約束」ではなく「証明」です。",
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
