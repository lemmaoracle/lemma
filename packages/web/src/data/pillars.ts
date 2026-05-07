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

export interface Pillar {
  readonly slug: PillarSlug;
  readonly title: string;
  readonly slogan: string;
  readonly subtitle: string;
  readonly problemStatement: string;
  readonly whyNow: string;
  readonly howLemmaFits: ReadonlyArray<string>;
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
    title: "Verifiable Origin",
    slogan: "Cryptographically valid ≠ semantically right",
    subtitle: "Incident-grade Data Trust",
    problemStatement:
      "Bridge・クロスチェーン移転において、資産の「出所」は暗号論理的に証明されていない",
    whyNow: "2024年 Ronin bridge $625M事件、2025年 FSA暗号資産ガイドライン施行",
    howLemmaFits: [
      "Poseidon hash for on-chain commitment",
      "BBS+ signatures for selective disclosure",
      "Groth16 proofs for cross-chain verification",
    ],
    useCaseSlugs: ["financial-data-exfiltration", "defi-bridge-verification"],
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
    title: "Verifiable AI",
    slogan: "Finds bugs ≠ proves decisions",
    subtitle: "Models change. Proofs remain.",
    problemStatement:
      "AIの判断根拠を後から検証できる仕組みが欠如している。説明責任と監査対応で根本的な問いに直面する",
    whyNow: "EU AI Act 2026年施行、ISO 42001認証需要の高まり",
    howLemmaFits: [
      "ZK proofs for AI decision attribution",
      "Permanent provenance for RAG sources",
      "Selective disclosure for compliance reports",
    ],
    useCaseSlugs: ["financial-data-exfiltration"],
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
    title: "Agent Trust Chain",
    slogan: "Pays ≠ trustworthy",
    subtitle: "Agent Trust Chain",
    problemStatement:
      "エージェント同士の取引において、誰が何の権限でどのデータに基づく支払いかを検証する手段がない",
    whyNow: "x402プロトコルの普及、MCPエコシステムの拡大、エージェント経済の急速な成長",
    howLemmaFits: [
      "ZK-proven agent identity and role",
      "On-chain spend control attestation",
      "Cross-agent trust chain verification",
    ],
    useCaseSlugs: [],
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
    title: "Regulatory Attribute Proof",
    slogan: "Compliance promised ≠ compliance proven",
    subtitle: "",
    problemStatement:
      "規制要件（KYC/AML/データレジデンシー/DPP/ESG）を満たしているという主張を、プログラムで検証できる証明に変える",
    whyNow: "GDPR強化、EU AI Act、暗号資産ガイドライン、サプライチェーンDDP義務化の動き",
    howLemmaFits: [
      "Attribute-level compliance proofs",
      "Schema-bound regulatory requirements",
      "Auditable proof trail without data exposure",
    ],
    useCaseSlugs: ["defi-bridge-verification"],
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
