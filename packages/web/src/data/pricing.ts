/**
 * Pricing page (product hub + plans + option packs) content.
 *
 * Mirrors the solutions.ts pattern — a single typed const carrying the
 * full bilingual copy for /ja/pricing/ and /pricing/.
 *
 * Per the v4 mockup brief:
 *   - 3 enterprise plans (Civic / Critical / Compliance) widened from
 *     industry-bound to function-axis positioning.
 *   - Trust402 as the 4th developer product.
 *   - 3 Option Packs (Incident Response / Regulatory / Agent Governance)
 *     gated to Critical / Compliance Tier 2+, no standalone sale.
 *   - Compare matrix carries only the 12 standard features (Option Packs
 *     live in their own section as a separate axis).
 *   - 5-step adoption flow surfaced as customer-facing (no internal
 *     sales register).
 *
 * Terminology: 証明 / 証明層. The brand surface is "Lemma" — "Lemma
 * Oracle" is reserved for the internal tech name and not surfaced here.
 */

interface Localized<T = string> {
  readonly ja: T;
  readonly en: T;
}

export type PricingIconName =
  | "shield-alert"
  | "doc-stack"
  | "agent-network";

type CellSpec =
  | { kind: "yes" }
  | { kind: "no" }
  | { kind: "tier"; label: Localized };

export interface PricingContent {
  readonly meta: { readonly title: Localized; readonly description: Localized };
  readonly hero: {
    readonly eyebrow: Localized;
    readonly h1Lines: Localized<readonly string[]>;
    readonly sub: Localized;
    readonly trustLine: Localized<readonly string[]>;
  };

  readonly enterprise: {
    readonly eyebrow: Localized;
    readonly h2Head: Localized;
    readonly h2Accent: Localized;
    readonly sub: Localized;
    readonly bestForLabel: Localized;
    readonly plans: ReadonlyArray<{
      readonly slug: "civic" | "critical" | "compliance";
      readonly segment: Localized;
      readonly name: string;
      readonly tagline: Localized;
      readonly bestFor: Localized;
      readonly features: Localized<readonly string[]>;
      readonly tiers: ReadonlyArray<{ readonly no: string; readonly scope: Localized }>;
      readonly pricingModel: Localized;
      readonly ctaPrimary: { readonly label: Localized; readonly href: string };
      readonly ctaSecondary: { readonly label: Localized; readonly href: string };
    }>;
  };

  readonly trust402: {
    readonly eyebrow: Localized;
    readonly h2Head: Localized;
    readonly h2Accent: Localized;
    readonly sub: Localized;
    readonly name: string;
    readonly tagline: Localized;
    readonly desc: Localized;
    readonly status: Localized;
    readonly tiers: ReadonlyArray<{
      readonly name: string;
      readonly desc: Localized;
      readonly status: Localized;
    }>;
    readonly ctaPrimary: { readonly label: Localized; readonly href: string };
    readonly ctaSecondary: { readonly label: Localized; readonly href: string };
    readonly footerNote: Localized;
  };

  readonly packs: {
    readonly eyebrow: Localized;
    readonly h2Head: Localized;
    readonly h2Accent: Localized;
    readonly sub: Localized;
    readonly metaTierLabel: Localized;
    readonly metaEntryLabel: Localized;
    readonly metaScopeLabel: Localized;
    readonly items: ReadonlyArray<{
      readonly variant: "a" | "b" | "c";
      readonly letter: string;
      readonly name: string;
      readonly icon: PricingIconName;
      readonly goalLines: Localized<readonly string[]>;
      readonly desc: Localized;
      readonly tier: Localized;
      readonly entryOrScope: Localized;
      readonly entryKind: "entry" | "scope";
    }>;
    readonly note: Localized;
  };

  readonly compare: {
    readonly eyebrow: Localized;
    readonly h2Head: Localized;
    readonly h2Accent: Localized;
    readonly sub: Localized;
    readonly featureColLabel: Localized;
    readonly planColLabels: ReadonlyArray<string>;
    readonly rows: ReadonlyArray<{
      readonly feature: Localized;
      readonly civic: CellSpec;
      readonly critical: CellSpec;
      readonly compliance: CellSpec;
      readonly trust402: CellSpec;
    }>;
  };

  readonly adoption: {
    readonly eyebrow: Localized;
    readonly h2Head: Localized;
    readonly h2Accent: Localized;
    readonly sub: Localized;
    readonly steps: ReadonlyArray<{
      readonly no: string;
      readonly title: Localized;
      readonly meta: Localized;
    }>;
  };

  readonly faq: {
    readonly eyebrow: Localized;
    readonly h2Head: Localized;
    readonly h2Accent: Localized;
    readonly items: ReadonlyArray<{ readonly q: Localized; readonly a: Localized }>;
  };

  readonly visionClose: {
    readonly eyebrow: Localized;
    readonly h2Head: Localized;
    readonly h2Accent: Localized;
    readonly sub: Localized;
    readonly ctaPrimary: { readonly label: Localized; readonly href: string };
    readonly ctaSecondary: { readonly label: Localized; readonly href: string };
  };
}

const WP_URL_HERO = "https://tally.so/r/xX0VYv";
const WP_URL_PLAN = "https://tally.so/r/7RJXdR";
const DISCOVERY_URL = "https://tally.so/r/EkBqDX";
const TRUST402_WAITLIST = "https://tally.so/r/kd0bZR";

export const PRICING: PricingContent = {
  meta: {
    title: {
      ja: "Pricing — 信頼インフラの導入は相談から | Lemma",
      en: "Pricing — Engagement starts with a Discovery Call | Lemma",
    },
    description: {
      ja: "Seal / Trust402 / Industries（Civic · Critical · Compliance）の各プランは Discovery Call から個別構成。年契約ベース、要件に合わせた最適形をご提案します。30 分・無料。",
      en: "Plans for Seal, Trust402, and Industries (Civic / Critical / Compliance) are tailored from a Discovery Call. Annual contract, calibrated to your requirements. 30 minutes, free.",
    },
  },

  hero: {
    eyebrow: { ja: "Products & Pricing", en: "Products & Pricing" },
    h1Lines: {
      ja: ["3 つの入口、", "1 つの暗号基盤。"],
      en: ["Four doors in,", "one cryptographic foundation."],
    },
    sub: {
      ja: "3 つのエンタープライズセグメントと、開発者向け 1 プロダクト。すべて Lemma の同じ暗号基盤上に。",
      en: "Three enterprise segments and one developer product. All built on Lemma.",
    },
    trustLine: {
      ja: [
        "live in production since 2025",
        "対応標準: MCP / A2A / x402 / C2PA / W3C VC",
        "ETHGlobal AI Agents 2026 Finalist",
      ],
      en: [
        "live in production since 2025",
        "Compatible standards: MCP / A2A / x402 / C2PA / W3C VC",
        "ETHGlobal AI Agents 2026 Finalist",
      ],
    },
  },

  enterprise: {
    eyebrow: { ja: "エンタープライズ", en: "Enterprise" },
    h2Head: { ja: "3 つのセグメント、", en: "Three segments," },
    h2Accent: { ja: "1 つの信頼レイヤー。", en: "one trust layer." },
    sub: {
      ja: "運用要件・規制要件・対象セクターに応じた 3 つのプラン。",
      en: "Three plans aligned to operational, regulatory, and sector requirements.",
    },
    bestForLabel: { ja: "Best for", en: "Best for" },
    plans: [
      {
        slug: "civic",
        segment: { ja: "公共・公益サービス", en: "Public · Civic services" },
        name: "Lemma Civic",
        tagline: { ja: "市民・住民向けサービスを提供する組織へ", en: "For organizations serving citizens" },
        bestFor: {
          ja: "自治体、公益事業者、B2B2G の事業者など、市民・住民向けに証明可能な属性検証が必要な組織。",
          en: "For municipalities, utilities, and B2B2G operators that need verifiable attribute checks for citizen-facing services.",
        },
        features: {
          ja: [
            "公共サービス適格性の ZK 証明済み属性検証",
            "マルチサイトティアリング — 運用サイト数に応じたスケーリング",
            "監査および公共の説明責任のためのオンチェーン来歴証明",
            "公共インフラ向け標準スキーマライブラリ",
          ],
          en: [
            "ZK-attested attribute checks for civic eligibility",
            "Multi-site tiering — scales with the number of operating sites",
            "On-chain provenance for audit and public accountability",
            "Standard schema library for civic infrastructure",
          ],
        },
        tiers: [
          { no: "Tier 1", scope: { ja: "1〜3 サイト", en: "1–3 sites" } },
          { no: "Tier 2", scope: { ja: "4〜10 サイト", en: "4–10 sites" } },
          { no: "Tier 3", scope: { ja: "11+ カスタム", en: "11+ custom" } },
        ],
        pricingModel: {
          ja: "年契約ベース。サイト数・検証通話量・カスタムスキーマ登録に応じて Discovery 型で個別構成。Pack 対象外。",
          en: "Annual contract. Configured per site count, verification volume, and custom schema registration via Discovery. Option Packs not applicable.",
        },
        ctaPrimary: { label: { ja: "Discovery Call を予約 →", en: "Book a Discovery Call →" }, href: DISCOVERY_URL },
        ctaSecondary: { label: { ja: "ホワイトペーパー ↗", en: "Whitepaper ↗" }, href: WP_URL_PLAN },
      },
      {
        slug: "critical",
        segment: { ja: "運用基盤・業務継続", en: "Operational systems" },
        name: "Lemma Critical",
        tagline: { ja: "業務継続性が問われる運用に", en: "For business-critical operations" },
        bestFor: {
          ja: "重要インフラ、製造業、大規模事業など、業務継続性と規制遵守が問われる運用システムに AI を組み込む組織。",
          en: "For critical infrastructure, manufacturing, and large enterprises embedding AI into operational systems where business continuity and regulatory compliance matter.",
        },
        features: {
          ja: [
            "ドメイン固有のビジネスルール向けカスタム ZK サーキット",
            "コンプライアンスグレードの監査証跡",
            "SLA 保証稼働率 · オンプレミスデプロイメントオプション",
            "施設数と統合範囲に応じたティアリング",
          ],
          en: [
            "Custom ZK circuits for domain-specific business rules",
            "Compliance-grade audit trail",
            "SLA-backed uptime · on-premises deployment option",
            "Tiering by facility count and integration scope",
          ],
        },
        tiers: [
          { no: "Tier 1", scope: { ja: "単一施設", en: "Single facility" } },
          { no: "Tier 2", scope: { ja: "2〜10 施設", en: "2–10 facilities" } },
          { no: "Tier 3", scope: { ja: "エンタープライズ", en: "Enterprise" } },
        ],
        pricingModel: {
          ja: "年契約ベース。施設規模・SLA 要件・ZK サーキットの複雑さに応じて Discovery 型で個別構成。Tier 2 以上で Option Pack(Incident Response / Regulatory)を追加可能。",
          en: "Annual contract. Configured per facility scale, SLA needs, and ZK circuit complexity via Discovery. Option Packs (Incident Response / Regulatory) available from Tier 2.",
        },
        ctaPrimary: { label: { ja: "Discovery Call を予約 →", en: "Book a Discovery Call →" }, href: DISCOVERY_URL },
        ctaSecondary: { label: { ja: "ホワイトペーパー ↗", en: "Whitepaper ↗" }, href: WP_URL_PLAN },
      },
      {
        slug: "compliance",
        segment: { ja: "規制対応・データ保護", en: "Compliance · Data protection" },
        name: "Lemma Compliance",
        tagline: { ja: "属性検証・監査証跡が求められる業務へ", en: "For regulated workflows" },
        bestFor: {
          ja: "金融機関・FinTech・規制対象機関など、属性検証と監査証跡が求められる業務に AI を運用する組織。EU AI Act / GDPR / 国内規制への対応も。",
          en: "For banks, FinTechs, and regulated institutions running AI in workflows that demand attribute verification and audit trails — including EU AI Act / GDPR / domestic compliance.",
        },
        features: {
          ja: [
            "データ開示のない KYC/AML 属性検証",
            "EU AI Act および ISO 42001 準拠の監査証跡",
            "選択的開示 — 事実を証明し PII を保護",
            "クエリごとに完全な来歴証明付きの RAG ポリシーレイヤー",
          ],
          en: [
            "KYC/AML attribute verification without data disclosure",
            "EU AI Act and ISO 42001 audit trail",
            "Selective disclosure — prove the fact, protect the PII",
            "RAG policy layer with full provenance per query",
          ],
        },
        tiers: [
          { no: "Tier 1", scope: { ja: "中小 FinTech", en: "SMB FinTech" } },
          { no: "Tier 2", scope: { ja: "地方銀行", en: "Regional bank" } },
          { no: "Tier 3", scope: { ja: "メガバンク", en: "Global bank" } },
        ],
        pricingModel: {
          ja: "USD 価格・年契約ベース。機関規模・通話量に応じて Discovery 型で構成。Tier 2 以上で Option Pack(Regulatory / Agent Governance)を追加可能。",
          en: "USD pricing, annual contract. Configured per institution scale and volume via Discovery. Option Packs (Regulatory / Agent Governance) available from Tier 2.",
        },
        ctaPrimary: { label: { ja: "Discovery Call を予約 →", en: "Book a Discovery Call →" }, href: DISCOVERY_URL },
        ctaSecondary: { label: { ja: "ホワイトペーパー ↗", en: "Whitepaper ↗" }, href: WP_URL_PLAN },
      },
    ],
  },

  trust402: {
    eyebrow: { ja: "開発者", en: "Developer" },
    h2Head: { ja: "Trust402", en: "Trust402" },
    h2Accent: { ja: " — x402 / MCP 開発者向け。", en: " — for x402 / MCP developers." },
    sub: {
      ja: "x402 と MCP エコシステム向けのプロダクト。",
      en: "A product for the x402 and MCP ecosystem.",
    },
    name: "Trust402",
    tagline: { ja: "Explorer · Builder · Studio · Pro", en: "Explorer · Builder · Studio · Pro" },
    desc: {
      ja: "エージェント駆動のエコシステムで、API レイヤーから ZK 証明済みの行動 / 決済 / 権限を提供。",
      en: "ZK-attested action / payment / authority at the API layer for the agent-driven ecosystem.",
    },
    status: { ja: "2026-06 公開予定", en: "Launching 2026-06" },
    tiers: [
      {
        name: "Explorer",
        desc: {
          ja: "サンドボックスアクセス。コミット前に ZK 属性検証を評価。テストネット限定。",
          en: "Sandbox access. Evaluate ZK attribute checks before committing. Testnet only.",
        },
        status: { ja: "近日公開", en: "Coming soon" },
      },
      {
        name: "Builder",
        desc: {
          ja: "プロダクションアクセス。x402 と MCP でアプリを出荷する個人開発者向け。標準通話量を含む。",
          en: "Production access. For solo developers shipping on x402 and MCP. Standard call volume included.",
        },
        status: { ja: "近日公開", en: "Coming soon" },
      },
      {
        name: "Studio",
        desc: {
          ja: "チームプラン。複数 API キー、優先サポート、拡張通話量。小規模チーム向け。",
          en: "Team plan. Multiple API keys, priority support, extended volume. For small teams.",
        },
        status: { ja: "近日公開", en: "Coming soon" },
      },
      {
        name: "Pro",
        desc: {
          ja: "高ボリューム本番運用。SLA 保証の専用サポート。エコシステムで規模の段階にあるプロダクト向け。",
          en: "High-volume production. SLA-backed dedicated support. For products scaling on the ecosystem.",
        },
        status: { ja: "近日公開", en: "Coming soon" },
      },
    ],
    ctaPrimary: { label: { ja: "ウェイトリストに登録 →", en: "Join the waitlist →" }, href: TRUST402_WAITLIST },
    ctaSecondary: { label: { ja: "製品ページを見る ↗", en: "Product page ↗" }, href: "/trust402" },
    footerNote: {
      ja: "詳細な料金とドキュメントはリリース時に提供されます。",
      en: "Detailed pricing and documentation publish at release.",
    },
  },

  packs: {
    eyebrow: { ja: "Option Packs", en: "Option Packs" },
    h2Head: { ja: "達成したい目的で", en: "Choose by the goal —" },
    h2Accent: { ja: "選ぶ、3 つの拡張。", en: "three extensions." },
    sub: {
      ja: "目的に応じた機能拡張。Critical / Compliance プランの Tier 2 以上で追加可能。",
      en: "Goal-driven extensions. Available from Tier 2 on Critical or Compliance.",
    },
    metaTierLabel: { ja: "対応 Tier", en: "Available on" },
    metaEntryLabel: { ja: "入口", en: "Entry" },
    metaScopeLabel: { ja: "範囲", en: "Scope" },
    items: [
      {
        variant: "a",
        letter: "Pack A",
        name: "Incident Response",
        icon: "shield-alert",
        goalLines: {
          ja: ["インシデントから、", "復旧と証明へ。"],
          en: ["From incident,", "to recovery and proof."],
        },
        desc: {
          ja: 'セキュリティ事案の発生時、改ざん不能な来歴証跡から原因究明・復旧・規制報告を行うための運用パック。CISO・内部監査の事後対応プロセスに組み込む。',
          en: "An operational pack for root-cause analysis, recovery, and regulatory reporting from a tamper-evident provenance trail at incident time. Slots into the CISO / internal-audit response process.",
        },
        tier: { ja: "Critical Tier 2 以上", en: "Critical Tier 2+" },
        entryOrScope: { ja: "PoC-A / PoC-B", en: "PoC-A / PoC-B" },
        entryKind: "entry",
      },
      {
        variant: "b",
        letter: "Pack B",
        name: "Regulatory",
        icon: "doc-stack",
        goalLines: {
          ja: ["規制への適合を、", "証跡として残す。"],
          en: ["Compliance,", "recorded as a proof trail."],
        },
        desc: {
          ja: "EU AI Act・能動的サイバー防御法・国内重要インフラ規制への適合を、技術と書類の両面で支援。NCO 様式での提出書類、適合性証跡の作成までを統合。",
          en: "Supports conformity to EU AI Act, the Active Cyber Defense Act, and domestic critical-infrastructure rules on both the technical and documentation sides — including NCO-format submissions and conformity evidence.",
        },
        tier: { ja: "Critical T3 / Compliance T2 以上", en: "Critical T3 / Compliance T2+" },
        entryOrScope: { ja: "NCO 様式 · EU AI Act", en: "NCO format · EU AI Act" },
        entryKind: "scope",
      },
      {
        variant: "c",
        letter: "Pack C",
        name: "Agent Governance",
        icon: "agent-network",
        goalLines: {
          ja: ["AI エージェントを、", "組織で運用可能に。"],
          en: ["AI agents,", "ready for enterprise governance."],
        },
        desc: {
          ja: "AI エージェントが業務代理・自動取引を担う体制への対応パック。Trust402 との連携で、エージェント権限の独立検証層を組織ガバナンスに組み込む。経費承認・購買・顧客対応の自動化に。",
          en: "An operational pack for organizations where AI agents handle delegation and automated transactions. With Trust402, an independent verification layer for agent authority slots into enterprise governance — for expense approval, procurement, and customer-facing automation.",
        },
        tier: { ja: "Compliance T2 以上 / Trust402 連携", en: "Compliance T2+ / Trust402 integration" },
        entryOrScope: { ja: "PoC-C", en: "PoC-C" },
        entryKind: "entry",
      },
    ],
    note: {
      ja: "提供範囲: Pack は Critical / Compliance プランの Tier 2 以上で追加可能。Civic は対象外(公共性維持・価格据置)、各プランの Tier 1 も対象外(軽量版のため)。組み合わせ構成は Discovery セッションで業務要件に応じて設計します。",
      en: "Scope: Option Packs add on from Tier 2 on Critical or Compliance. Civic is out of scope (public-utility pricing preserved); Tier 1 is out of scope on every plan (lightweight tier). Pack combinations get designed against business requirements in the Discovery session.",
    },
  },

  compare: {
    eyebrow: { ja: "機能比較", en: "Feature comparison" },
    h2Head: { ja: "どのプランが", en: "Which plan fits" },
    h2Accent: { ja: "組織に合っているか?", en: "your organization?" },
    sub: {
      ja: "4 プランの標準機能差分。Option Pack は別軸の機能拡張として上記 §Option Packs 参照。",
      en: "Standard feature deltas across the 4 plans. Option Packs are a separate axis — see the §Option Packs section above.",
    },
    featureColLabel: { ja: "機能", en: "Feature" },
    planColLabels: ["Civic", "Critical", "Compliance", "Trust402"],
    rows: [
      {
        feature: { ja: "AES-GCM 暗号化 · docHash / CID", en: "AES-GCM · docHash / CID" },
        civic: { kind: "yes" }, critical: { kind: "yes" }, compliance: { kind: "yes" }, trust402: { kind: "yes" },
      },
      {
        feature: { ja: "ZK 証明 — 標準サーキット", en: "ZK proof — standard circuits" },
        civic: { kind: "yes" }, critical: { kind: "yes" }, compliance: { kind: "yes" }, trust402: { kind: "yes" },
      },
      {
        feature: { ja: "オンチェーン来歴証明のアンカー", en: "On-chain provenance anchor" },
        civic: { kind: "yes" }, critical: { kind: "yes" }, compliance: { kind: "yes" }, trust402: { kind: "yes" },
      },
      {
        feature: { ja: "選択的開示", en: "Selective disclosure" },
        civic: { kind: "yes" }, critical: { kind: "yes" }, compliance: { kind: "yes" }, trust402: { kind: "yes" },
      },
      {
        feature: { ja: "カスタム ZK サーキット開発", en: "Custom ZK circuit development" },
        civic: { kind: "no" }, critical: { kind: "yes" },
        compliance: { kind: "tier", label: { ja: "Tier 2/3", en: "Tier 2/3" } },
        trust402: { kind: "no" },
      },
      {
        feature: { ja: "オンプレミスデプロイメント", en: "On-prem deployment" },
        civic: { kind: "no" },
        critical: { kind: "tier", label: { ja: "Tier 2/3", en: "Tier 2/3" } },
        compliance: { kind: "tier", label: { ja: "Tier 3", en: "Tier 3" } },
        trust402: { kind: "no" },
      },
      {
        feature: { ja: "SLA 保証稼働率", en: "SLA-backed uptime" },
        civic: { kind: "tier", label: { ja: "Tier 2/3", en: "Tier 2/3" } },
        critical: { kind: "yes" }, compliance: { kind: "yes" },
        trust402: { kind: "tier", label: { ja: "Pro", en: "Pro" } },
      },
      {
        feature: { ja: "RAG ポリシーレイヤー統合", en: "RAG policy layer" },
        civic: { kind: "yes" }, critical: { kind: "yes" }, compliance: { kind: "yes" }, trust402: { kind: "yes" },
      },
      {
        feature: { ja: "EU AI Act / ISO 42001 準拠", en: "EU AI Act / ISO 42001 readiness" },
        civic: { kind: "no" },
        critical: { kind: "tier", label: { ja: "Tier 2/3", en: "Tier 2/3" } },
        compliance: { kind: "yes" }, trust402: { kind: "no" },
      },
      {
        feature: { ja: "x402 決済ヘッダー統合", en: "x402 payment header" },
        civic: { kind: "no" }, critical: { kind: "no" }, compliance: { kind: "no" }, trust402: { kind: "yes" },
      },
      {
        feature: { ja: "セルフサインアップ", en: "Self-signup" },
        civic: { kind: "no" }, critical: { kind: "no" }, compliance: { kind: "no" }, trust402: { kind: "yes" },
      },
      {
        feature: { ja: "契約タイプ", en: "Contract type" },
        civic: { kind: "tier", label: { ja: "B2B 年契約", en: "B2B annual" } },
        critical: { kind: "tier", label: { ja: "B2B 年契約", en: "B2B annual" } },
        compliance: { kind: "tier", label: { ja: "B2B 年契約", en: "B2B annual" } },
        trust402: { kind: "tier", label: { ja: "月額 / 年額", en: "Monthly / annual" } },
      },
    ],
  },

  adoption: {
    eyebrow: { ja: "ご導入プロセス", en: "Adoption flow" },
    h2Head: { ja: "Discovery から、", en: "From Discovery" },
    h2Accent: { ja: "本番運用まで。", en: "to production." },
    sub: {
      ja: "業務要件に応じて構成を設計、PoC を経て本番運用へ。",
      en: "Configuration designed against business requirements; PoC, then production.",
    },
    steps: [
      { no: "Step 1", title: { ja: "Talk to us", en: "Talk to us" }, meta: { ja: "お問い合わせ", en: "Get in touch" } },
      { no: "Step 2", title: { ja: "Discovery", en: "Discovery" }, meta: { ja: "30-60 分のヒアリング", en: "30–60 min intake" } },
      { no: "Step 3", title: { ja: "構成提案", en: "Proposal" }, meta: { ja: "Tier + Pack 設計", en: "Tier + Pack design" } },
      { no: "Step 4", title: { ja: "PoC", en: "PoC" }, meta: { ja: "12 週間で実装・検証", en: "12-week build & validate" } },
      { no: "Step 5", title: { ja: "本番運用", en: "Production" }, meta: { ja: "既存システムと共存", en: "Coexists with existing systems" } },
    ],
  },

  faq: {
    eyebrow: { ja: "FAQ", en: "FAQ" },
    h2Head: { ja: "料金について、", en: "Pricing —" },
    h2Accent: { ja: "よくある質問。", en: "common questions." },
    items: [
      {
        q: { ja: "なぜ公開価格がないのですか?", en: "Why are prices not published?" },
        a: {
          ja: "エンタープライズ料金はティア、サイト数、SLA 要件、ZK サーキットの複雑さに依存します。文脈のない数字は誤解を招くため、実際のユースケースに応じて価格設定します。",
          en: "Enterprise pricing depends on tier, site count, SLA requirements, and ZK circuit complexity. Numbers without context mislead, so we price against your actual use case.",
        },
      },
      {
        q: { ja: "どのプランが組織に合っていますか?", en: "Which plan fits my organization?" },
        a: {
          ja: "市民・住民向けサービスや公益事業 → Civic。業務継続性・運用基盤への AI 組み込み → Critical。属性検証・監査証跡・規制対応 → Compliance。x402 / MCP 上での実装 → Trust402。判別は Discovery セッションで一緒に整理します。",
          en: "Citizen-facing services and utilities → Civic. AI embedded in operational systems with business-continuity demands → Critical. Attribute verification, audit trails, regulated workflows → Compliance. Building on x402 / MCP → Trust402. We map you to the right plan during Discovery.",
        },
      },
      {
        q: { ja: "料金はどのように設定されていますか?", en: "How is pricing set?" },
        a: {
          ja: "エンタープライズプランは年契約ベース。月額基本料金 + 検証通話量 + オプションのカスタムスキーマ登録、必要に応じて Option Pack の追加で構成されます。Discovery 型営業で Lemma 側が Tier + Pack 構成を提案します。",
          en: "Enterprise plans are annual contracts: monthly base + verification volume + optional custom-schema registration, plus Option Packs when relevant. Discovery returns a Tier + Pack proposal from Lemma.",
        },
      },
      {
        q: { ja: "Option Pack はどのように選びますか?", en: "How do Option Packs get selected?" },
        a: {
          ja: "Pack 単品販売はありません。ティアゲート型で、Critical / Compliance プランの Tier 2 以上で追加可能。Discovery で業務要件をヒアリングし、Lemma 側が Tier + Pack 構成を提案します。Civic と各プランの Tier 1 は Pack 対象外。",
          en: "Option Packs aren't sold standalone — they gate to Critical / Compliance Tier 2 and above. Discovery intakes the business requirement; Lemma proposes a Tier + Pack configuration. Civic and Tier 1 on every plan are out of scope.",
        },
      },
      {
        q: { ja: "無料トライアルはありますか?", en: "Is there a free trial?" },
        a: {
          ja: "Trust402 にはサンドボックス評価用の Explorer ティアが含まれます。エンタープライズ評価はスコープ付き PoC で対応します。",
          en: "Trust402 includes the Explorer tier for sandbox evaluation. Enterprise evaluation runs via a scoped PoC.",
        },
      },
      {
        q: { ja: "Trust402 はいつリリースされますか?", en: "When does Trust402 launch?" },
        a: {
          ja: "詳細な価格は x402 統合デモで発表されます。ウェイトリストにご登録いただくと最初にお知らせします。",
          en: "Detailed pricing publishes with the x402 integration demo. Join the waitlist to hear first.",
        },
      },
      {
        q: { ja: "低いティアから始めてアップグレードできますか?", en: "Can we start at a lower tier and upgrade?" },
        a: {
          ja: "はい。すべてのエンタープライズティアはデプロイメントの成長に合わせて上方移行できるように設計されています。",
          en: "Yes. Every enterprise tier is designed to move up as the deployment grows.",
        },
      },
    ],
  },

  visionClose: {
    eyebrow: { ja: "パートナープログラム", en: "Partner Program" },
    h2Head: { ja: "AI は変わっても、", en: "Models change." },
    h2Accent: { ja: "証明は残る。", en: "Proofs remain." },
    sub: {
      ja: "業界と規模に合った構成を、Discovery Call で 1 営業日以内にご提案します。",
      en: "We return a configuration matched to your industry and scale within one business day of the Discovery Call.",
    },
    ctaPrimary: { label: { ja: "Discovery Call を予約 →", en: "Book a Discovery Call →" }, href: DISCOVERY_URL },
    ctaSecondary: { label: { ja: "ホワイトペーパー DL ↗", en: "Whitepaper ↗" }, href: WP_URL_HERO },
  },
};
