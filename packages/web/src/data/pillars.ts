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

export interface Pillar {
  readonly slug: PillarSlug;
  readonly title: LocalizedStrings;
  readonly slogan: LocalizedStrings;
  readonly subtitle: LocalizedStrings;
  readonly problemStatement: LocalizedStrings;
  readonly whyNow: LocalizedStrings;
  readonly howLemmaFits: LocalizedArray;
  readonly useCaseSlugs: ReadonlyArray<string>;
  readonly primaryCTA: CTA;
  readonly secondaryCTA?: CTA;
  readonly cover?: string;
  readonly order: number;
  readonly tags: ReadonlyArray<string>;
}

/* ── Pillar Data (hardcoded) ───────────────────────────────────── */

const PILLARS: ReadonlyArray<Pillar> = [
  {
    slug: "verifiable-origin",
    title: { en: "Verifiable Origin", ja: "来歴証明" },
    slogan: { en: "Cryptographically valid ≠ semantically right", ja: "暗号論理的に有効 ≠ 意味的に正しい" },
    subtitle: { en: "Incident-grade Data Trust", ja: "インシデント級のデータ信頼" },
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
  },
  {
    slug: "verifiable-ai",
    title: { en: "Verifiable AI", ja: "AI出力の検証可能性" },
    slogan: { en: "Finds bugs ≠ proves decisions", ja: "バグを見つける ≠ 決定を証明する" },
    subtitle: { en: "Models change. Proofs remain.", ja: "モデルは変わる。証明は残る。" },
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
  },
  {
    slug: "agent-trust-chain",
    title: { en: "Agent Trust Chain", ja: "エージェント信頼チェーン" },
    slogan: { en: "Pays ≠ trustworthy", ja: "支払う ≠ 信頼できる" },
    subtitle: { en: "Agent Trust Chain", ja: "エージェント信頼チェーン" },
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
    useCaseSlugs: ["x402-commerce", "delegated-treasury", "multi-agent-workflows"],
    primaryCTA: {
      label: "Join Trust402 waitlist",
      href: "https://tally.so/r/kd0bZR",
      type: "waitlist",
    },
    order: 3,
    tags: ["agent", "x402", "mcp", "trust-chain"],
  },
  {
    slug: "regulatory-attribute-proof",
    title: { en: "Regulatory Attribute Proof", ja: "規制属性証明" },
    slogan: { en: "Compliance promised ≠ compliance proven", ja: "コンプライアンスの約束 ≠ コンプライアンスの証明" },
    subtitle: { en: "", ja: "" },
    problemStatement: {
      en: "Claims of regulatory compliance (KYC/AML/data residency/DPP/ESG) must be transformed into programmatically verifiable proofs",
      ja: "規制要件（KYC/AML/データレジデンシー/DPP/ESG）を満たしているという主張を、プログラムで検証できる証明に変える",
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
  },
];

/* ── Public API ───────────────────────────────────────────────── */

export function getAllPillars(): ReadonlyArray<Pillar> {
  return PILLARS.slice().sort((a, b) => a.order - b.order);
}

export function getPillarBySlug(slug: string): Pillar | undefined {
  return PILLARS.find((p) => p.slug === slug);
}
