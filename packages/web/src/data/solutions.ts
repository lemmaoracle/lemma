/**
 * Solutions page (biz buyer LP) content.
 *
 * Mirrors the pillars.ts pattern — a single typed const module holding
 * the full bilingual copy for /ja/solutions/ and /solutions/.
 *
 * Per the v3 mockup brief: data-less / proof layer / HIDE → PROVE
 * framing. Terminology: 証明 / 証明層 / Proof Layer. The Solutions surface
 * does NOT use "立証層" or "Trust Layer" as the unit name.
 *
 * Use case slug paths are kept locale-prefixed as-is; the wider URL
 * migration to /solutions/use-cases/ is handled in Stage B.
 */

interface Localized<T = string> {
  readonly ja: T;
  readonly en: T;
}

export type SolutionsIconName =
  | "lock"
  | "audit-doc"
  | "shield-check"
  | "doc-stack"
  | "kyc-shield"
  | "robot"
  | "supply-box";

export interface SolutionsContent {
  readonly meta: {
    readonly title: Localized;
    readonly description: Localized;
  };
  readonly hero: {
    readonly eyebrow: Localized;
    /** 2-line H1; the 2nd line renders inside .accent span. */
    readonly h1Lines: Localized<readonly string[]>;
    readonly sub: Localized;
    readonly ctaPrimary: { readonly label: Localized; readonly href: string };
    readonly ctaSecondary: { readonly label: Localized; readonly href: string };
    readonly trustLine: Localized<readonly string[]>;
  };
  readonly walls: {
    readonly eyebrow: Localized;
    readonly h2Head: Localized;
    readonly h2Accent: Localized;
    readonly sub: Localized;
    readonly before: { readonly label: Localized; readonly title: Localized; readonly desc: Localized };
    readonly after: { readonly label: Localized; readonly title: Localized; readonly desc: Localized };
    readonly items: ReadonlyArray<{
      readonly no: string;
      readonly title: Localized;
      readonly icon: SolutionsIconName;
      readonly pain: Localized;
      readonly answer: Localized;
    }>;
  };
  readonly scenarios: {
    readonly eyebrow: Localized;
    readonly h2Head: Localized;
    readonly h2Accent: Localized;
    readonly sub: Localized;
    readonly items: ReadonlyArray<{
      readonly roleLabel: Localized;
      readonly roleTitle: Localized;
      readonly icon: SolutionsIconName;
      readonly hide: Localized;
      readonly prove: Localized;
      readonly desc: Localized;
      readonly useCaseSlug: string;
      readonly linkLabel: Localized;
    }>;
  };
  readonly useCasesHub: {
    readonly eyebrow: Localized;
    readonly h2Head: Localized;
    readonly h2Accent: Localized;
    readonly sub: Localized;
    readonly items: ReadonlyArray<{
      readonly category: Localized;
      readonly title: Localized;
      readonly desc: Localized;
      /** When absent the card links to the use-cases index. */
      readonly useCaseSlug?: string;
      readonly linkLabel: Localized;
    }>;
    readonly pillarLink: { readonly prefix: Localized; readonly label: Localized };
  };
  readonly adoption: {
    readonly eyebrow: Localized;
    readonly h2Head: Localized;
    readonly h2Accent: Localized;
    readonly sub: Localized;
    readonly steps: ReadonlyArray<{
      readonly no: string;
      readonly label: Localized;
      readonly title: Localized;
      readonly desc: Localized;
      readonly duration: Localized;
    }>;
    readonly code: {
      readonly comment1: Localized;
      readonly comment2: Localized;
      readonly note: Localized;
    };
    readonly ctaPrimary: { readonly label: Localized; readonly href: string };
    readonly ctaSecondary: { readonly label: Localized; readonly href: string };
  };
  readonly checklist: {
    readonly eyebrow: Localized;
    readonly h2Head: Localized;
    readonly h2Accent: Localized;
    readonly intro: Localized;
    readonly items: Localized<readonly string[]>;
    readonly threshold: number;
    readonly resultText: Localized;
    readonly resultCta: { readonly label: Localized; readonly href: string };
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

const WP_URL = "https://tally.so/r/xX0VYv";
const DISCOVERY_URL = "https://tally.so/r/EkBqDX";

export const SOLUTIONS: SolutionsContent = {
  meta: {
    title: {
      ja: "Industries — Civic · Critical · Compliance | Lemma",
      en: "The data-less trust infrastructure — Solutions | Lemma",
    },
    description: {
      ja: "公共インフラ・製造業・規制金融に最適化した Civic / Critical / Compliance の 3 製品ライン。データを持たないままで、業界の現場に信頼インフラを実装。",
      en: "Three walls that stall AI adoption, dissolved structurally by a data-less design.",
    },
  },

  hero: {
    eyebrow: { ja: "Solutions", en: "Solutions" },
    h1Lines: {
      ja: ["PoC は通った。", "でも、本番が止まる。"],
      en: ["PoC works.", "Production stalls."],
    },
    sub: {
      ja: "機密を渡せない。判断を証明できない。規制が通らない。AI エージェントに、業務を任せられない。AI 導入の最後のハードルは、モデルの精度ではなく証明層。Lemma は「データを持たない」設計で、これを構造的に解消します。",
      en: "You can't expose secrets. You can't audit decisions. You can't pass regulation. AI agents can't be trusted with work. The last hurdle of AI adoption isn't model quality — it's the proof layer. Lemma resolves it structurally with a data-less design.",
    },
    ctaPrimary: {
      label: { ja: "ホワイトペーパーをダウンロード →", en: "Download the Whitepaper →" },
      href: WP_URL,
    },
    ctaSecondary: {
      label: { ja: "Discovery Call を予約 →", en: "Book a Discovery Call →" },
      href: DISCOVERY_URL,
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

  walls: {
    eyebrow: { ja: "課題", en: "Challenge" },
    h2Head: { ja: "AI 採用が止まる、", en: "Three walls" },
    h2Accent: { ja: "3 つの壁。", en: "before AI goes live." },
    sub: {
      ja: "多くの企業で AI PoC は成功するが、本番運用に出す前で止まる。理由はモデル選定ではなく、組織として AI に責任を持って使うための証明基盤が不足していること。",
      en: "Many companies' AI PoCs succeed but stall before production. The reason isn't model selection — it's the lack of a proof base for using AI accountably as an organization.",
    },
    before: {
      label: { ja: "いまの組織", en: "Today's organization" },
      title: { ja: "PoC で止まる", en: "Stalls at PoC" },
      desc: {
        ja: "機密の壁・説明責任の壁・規制の壁の前で、AI 採用が現場に届かない。CISO・法務・コンプライアンスが推進を慎重にせざるを得ない構造。",
        en: "Caught at the secrecy / accountability / regulation walls, AI adoption never reaches operations. CISO, Legal, and Compliance have no choice but to slow it down.",
      },
    },
    after: {
      label: { ja: "証明層を組み込んだ組織", en: "With a proof layer" },
      title: { ja: "本番に出せる", en: "Ships to production" },
      desc: {
        ja: "データを渡さずに事実を証明できる構造で、3 つの壁を技術的に解消。CISO・法務・コンプライアンスが推進を加速できる土台ができる。",
        en: "Facts get proven without handing over data, dissolving the three walls technically. CISO, Legal, and Compliance can accelerate adoption.",
      },
    },
    items: [
      {
        no: "01",
        icon: "lock",
        title: { ja: "機密の壁", en: "Secrecy wall" },
        pain: {
          ja: "機密情報を AI に渡せない。クラウド AI で社内データを扱うリスクが許容できない。",
          en: "Confidential information can't be handed to AI. Running internal data through cloud AI exceeds the risk tolerance.",
        },
        answer: {
          ja: "→ データを持たない設計で、AI が原データに触れずに判断できる構造へ。",
          en: "→ A data-less design: AI decides without touching the original.",
        },
      },
      {
        no: "02",
        icon: "audit-doc",
        title: { ja: "説明責任の壁", en: "Accountability wall" },
        pain: {
          ja: "AI 判断の根拠を、後から再現・監査できない。CISO・内部監査が production 移行を承認しない。",
          en: "The basis of an AI decision can't be replayed or audited. CISO and internal audit won't sign off on production.",
        },
        answer: {
          ja: "→ 判断の入力・モデル・過程を独立検証可能な暗号証跡として記録。",
          en: "→ Record inputs, model, and process as independently verifiable cryptographic evidence.",
        },
      },
      {
        no: "03",
        icon: "shield-check",
        title: { ja: "規制の壁", en: "Regulation wall" },
        pain: {
          ja: "EU AI Act・ISO 42001・国内規制への適合を証明する手段がない。法務が PoC を本番に出させない。",
          en: "There's no way to prove conformity with EU AI Act, ISO 42001, or local rules. Legal blocks PoC from going live.",
        },
        answer: {
          ja: "→ 監査グレードの暗号証跡と選択的開示で、規制適合性を技術的に提示可能。",
          en: "→ Audit-grade cryptographic evidence and selective disclosure make conformity demonstrable.",
        },
      },
    ],
  },

  scenarios: {
    eyebrow: { ja: "業務シナリオ", en: "Scenarios" },
    h2Head: { ja: "中身を明かさず、", en: "Disclose nothing." },
    h2Accent: { ja: "必要なことだけ証明する。", en: "Prove what matters." },
    sub: {
      ja: "業務領域ごとに、AI に渡したくない情報がある。Lemma は HIDE → PROVE の構造で、機密を保ったまま AI に判断・行動を任せる。",
      en: "Each operational line has data it doesn't want to hand over. Lemma's HIDE → PROVE structure lets AI judge and act while secrets stay put.",
    },
    items: [
      {
        roleLabel: { ja: "情シス · 業務部門", en: "IT · Business unit" },
        roleTitle: { ja: "エンタープライズ RAG", en: "Enterprise RAG" },
        icon: "doc-stack",
        hide: { ja: "社内文書\nの中身", en: "Internal\ndocument body" },
        prove: { ja: "出所と\n完全性", en: "Origin\n& integrity" },
        desc: {
          ja: "原本を暗号化、AI には docHash と CID だけを渡す。引用元の真正性と改ざん不在を、原本にアクセスせずに検証可能。",
          en: "Encrypt the original; AI sees only docHash and CID. Authenticity and tamper absence verify without ever opening the original.",
        },
        useCaseSlug: "rag-content-provenance",
        linkLabel: { ja: "RAG content provenance →", en: "RAG content provenance →" },
      },
      {
        roleLabel: { ja: "金融 · コンプライアンス", en: "Finance · Compliance" },
        roleTitle: { ja: "KYC / AML 選択的開示", en: "KYC / AML selective disclosure" },
        icon: "kyc-shield",
        hide: { ja: "個人情報\nの中身", en: "Personal\ninformation" },
        prove: { ja: "KYC / AML\n適合", en: "KYC / AML\nclearance" },
        desc: {
          ja: "パスポート・住所証明の原本は渡さず、「18 歳以上」「日本居住」「AML 適合」など必要な属性のみを BBS+ で選択的開示。",
          en: 'Passports and address proofs stay put — only attributes like "over 18", "Japan resident", or "AML clear" disclose via BBS+.',
        },
        useCaseSlug: "kyc-aml-selective-disclosure",
        linkLabel: { ja: "KYC/AML 選択的開示 →", en: "KYC/AML selective disclosure →" },
      },
      {
        roleLabel: { ja: "DevOps · 経理 · 購買", en: "DevOps · Finance · Procurement" },
        roleTitle: { ja: "AI エージェント代理", en: "AI agent delegation" },
        icon: "robot",
        hide: { ja: "秘密鍵 /\n代理権限", en: "Signing key /\ndelegated authority" },
        prove: { ja: "代理権限\nと範囲", en: "Delegated authority\n& scope" },
        desc: {
          ja: "エージェントに鍵を渡さず、「この AI は経費承認の代理権限がある」「上限 100 万円まで」を行為ごとに範囲付き proof で証明。",
          en: 'No keys handed to the agent — instead, prove per action that "this AI is delegated for expense approval" and "up to ¥1M" with a scope-bound proof.',
        },
        useCaseSlug: "ai-audit-log-proof",
        linkLabel: { ja: "AI 監査ログ証明 →", en: "AI Audit Log Proof →" },
      },
      {
        roleLabel: { ja: "調達 · ESG · 規制対応", en: "Procurement · ESG · Regulatory" },
        roleTitle: { ja: "サプライチェーン", en: "Supply chain" },
        icon: "supply-box",
        hide: { ja: "商取引\nデータ", en: "Transaction\ndata" },
        prove: { ja: "規制属性\n適合", en: "Regulatory attribute\nconformity" },
        desc: {
          ja: "調達先の取引データ・原産地情報は秘匿したまま、ESG 開示・関税分類・国際規制への適合だけを発行者署名と紐づけて証明。",
          en: "Supplier transaction data and origin info stay confidential; only ESG disclosure, tariff classification, and international rule conformity bind to issuer signatures.",
        },
        useCaseSlug: "supply-chain-esg",
        linkLabel: { ja: "サプライチェーン ESG →", en: "Supply Chain ESG →" },
      },
    ],
  },

  useCasesHub: {
    eyebrow: { ja: "業界別ユースケース", en: "Industry use cases" },
    h2Head: { ja: "業界の現場に、", en: "The proof layer" },
    h2Accent: { ja: "証明層が組み込まれる。", en: "fits operations." },
    sub: {
      ja: "業界・業務単位での実装シナリオを集約。自社の業務にどう組み込むかは、各 Use Case で詳述。",
      en: "Implementation scenarios indexed by industry and operational line. The 'how to integrate' details live in each Use Case.",
    },
    items: [
      {
        category: { ja: "エンタープライズ AI", en: "Enterprise AI" },
        title: { ja: "AI 監査ログ証明", en: "AI Audit Log Proof" },
        desc: {
          ja: "AI 判断の入力・モデル・結果を改ざん不能な証跡として残す。",
          en: "Preserve inputs, model, and output of AI decisions as tamper-evident evidence.",
        },
        useCaseSlug: "ai-audit-log-proof",
        linkLabel: { ja: "詳細 →", en: "View →" },
      },
      {
        category: { ja: "金融 · FinTech", en: "Finance · FinTech" },
        title: { ja: "KYC / AML 選択的開示", en: "KYC / AML Selective Disclosure" },
        desc: {
          ja: "原データを渡さずに規制属性のみを暗号証明で開示。",
          en: "Disclose only regulatory attributes as cryptographic proofs — no raw data.",
        },
        useCaseSlug: "kyc-aml-selective-disclosure",
        linkLabel: { ja: "詳細 →", en: "View →" },
      },
      {
        category: { ja: "製造 · 調達", en: "Manufacturing · Procurement" },
        title: { ja: "サプライチェーン ESG", en: "Supply Chain ESG" },
        desc: {
          ja: "多階層サプライヤの来歴を改ざん不能な連鎖として記録。",
          en: "Record multi-tier supplier provenance as a tamper-evident chain.",
        },
        useCaseSlug: "supply-chain-esg",
        linkLabel: { ja: "詳細 →", en: "View →" },
      },
      {
        category: { ja: "情シス · 業務 DX", en: "IT · Business DX" },
        title: { ja: "RAG Content Provenance", en: "RAG Content Provenance" },
        desc: {
          ja: "社内文書 RAG の来歴を保持、AI 回答の根拠を監査可能に。",
          en: "Preserve internal RAG document provenance; make AI citations auditable.",
        },
        useCaseSlug: "rag-content-provenance",
        linkLabel: { ja: "詳細 →", en: "View →" },
      },
      {
        category: { ja: "公共インフラ · 自治体", en: "Public infrastructure · Civic" },
        title: { ja: "公共サービス適格性証明", en: "Civic Service Eligibility" },
        desc: {
          ja: "市民の属性を開示せずに公共サービス適格を独立検証。",
          en: "Independently verify civic eligibility without disclosing citizen attributes.",
        },
        linkLabel: { ja: "詳細 →", en: "View →" },
      },
      {
        category: { ja: "全ユースケース", en: "All use cases" },
        title: { ja: "Use Case 一覧", en: "Use Case Index" },
        desc: {
          ja: "業界・業務別の組み込み事例を網羅的に参照。",
          en: "Browse implementation patterns by industry and operational line.",
        },
        linkLabel: { ja: "一覧へ →", en: "Browse →" },
      },
    ],
    pillarLink: {
      prefix: { ja: "証明層の概念整理は", en: "Conceptual structure →" },
      label: { ja: "信頼インフラ(Why) →", en: "Trust Infrastructure (Why) →" },
    },
  },

  adoption: {
    eyebrow: { ja: "採用ステップ", en: "Adoption" },
    h2Head: { ja: "3 ヶ月で、", en: "From Discovery" },
    h2Accent: { ja: "信頼インフラを本番運用へ。", en: "to production in 3 months." },
    sub: {
      ja: "既存システムは止めない。共存設計で、信頼インフラを前段に組み込むだけ。",
      en: "Existing systems keep running. Coexistence design: drop the trust infrastructure in front.",
    },
    steps: [
      {
        no: "01",
        label: { ja: "Discovery", en: "Discovery" },
        title: { ja: "機能と活用場面を確認", en: "Capabilities and fit" },
        desc: {
          ja: "Lemma の機能・活用場面と、想定される論点を 30 分で確認。詳細な業務設計は PoC フェーズで進めます。",
          en: "Review Lemma's capabilities, fit, and the key questions in 30 minutes. Detailed scoping happens in the PoC phase.",
        },
        duration: { ja: "Discovery Call · 30 分", en: "Discovery Call · 30 min" },
      },
      {
        no: "02",
        label: { ja: "PoC", en: "PoC" },
        title: { ja: "4 週間で動く構成に", en: "Working integration in 4 weeks" },
        desc: {
          ja: "対象業務の 1 シナリオで、Lemma を組み込んだ信頼インフラを実装、社内検証まで。",
          en: "Implement the trust infrastructure for one target scenario, end-to-end through internal validation.",
        },
        duration: { ja: "4 週間 · 1 シナリオ", en: "4 weeks · 1 scenario" },
      },
      {
        no: "03",
        label: { ja: "本番", en: "Production" },
        title: { ja: "1 行追加で展開", en: "Roll out with one line added" },
        desc: {
          ja: "PoC の構成をそのまま本番に展開。既存システムを止めず、信頼インフラを前段に組み込む。",
          en: "Promote the PoC configuration as-is. Keep existing systems running; the trust infrastructure sits in front.",
        },
        duration: { ja: "2 ヶ月以内 · 共存運用", en: "Within 2 months · coexistence" },
      },
    ],
    code: {
      comment1: {
        ja: "// 既存の AI 呼び出しの前段に追加するだけ",
        en: "// Add this in front of your existing AI call",
      },
      comment2: {
        ja: "// proof を AI に渡す。原データは渡さない。",
        en: "// Pass the proof to AI. The original never leaves.",
      },
      note: {
        ja: "SDK は近日公開予定。エンタープライズは先行 PoC からご相談ください。既存システムへの組み込みは Discovery Call にて設計",
        en: "SDK launches soon. Enterprise customers can start with a preliminary PoC. Custom integrations are designed in the Discovery Call.",
      },
    },
    ctaPrimary: {
      label: { ja: "Discovery Call を予約 →", en: "Book a Discovery Call →" },
      href: DISCOVERY_URL,
    },
    ctaSecondary: {
      label: { ja: "ホワイトペーパー DL ↗", en: "Whitepaper ↗" },
      href: WP_URL,
    },
  },

  checklist: {
    eyebrow: { ja: "自己診断", en: "Self-check" },
    h2Head: { ja: "チェックリスト:", en: "Checklist:" },
    h2Accent: { ja: "信頼インフラが必要か?", en: "do you need trust infrastructure?" },
    intro: {
      ja: "該当する項目にチェック。3 つ以上で、Lemma の組み込み検討フェーズに入る価値あり。",
      en: "Check each item that applies. Three or more means it's worth a serious look at integrating Lemma.",
    },
    items: {
      ja: [
        "AI 導入を進めたいが、社内データの機密管理に不安がある",
        "RAG / 文書 AI 回答の出所を、監査時に再現できる必要がある",
        "AI エージェントの行動権限を、後から証明する手段が必要",
        "KYC / AML / 年齢確認で、原データを渡さずに属性のみ証明したい",
        "サプライチェーンをまたいだトレーサビリティの証明が求められている",
        "EU AI Act / ISO 42001 / 国内規制への適合に、監査証跡が必要",
        "取引先・行政への証明で、機密情報の開示を最小化したい",
        "外部の事実確認に基づく承認・支払いの自動化を進めたい",
      ],
      en: [
        "We want to expand AI but worry about confidentiality of internal data.",
        "We need to be able to reproduce the basis of RAG / document AI answers at audit time.",
        "We need a way to prove the action authority of an AI agent after the fact.",
        "For KYC / AML / age checks, we want to prove the attribute without handing over the original.",
        "Cross-supplier traceability proof is being demanded.",
        "We need audit evidence for conformity with EU AI Act / ISO 42001 / local regulation.",
        "We want to minimize disclosure of confidential info in proofs to partners and authorities.",
        "We want to automate approvals / payments based on external fact verification.",
      ],
    },
    threshold: 3,
    resultText: {
      ja: "3 つ以上の該当で、信頼インフラの組み込みを検討する価値があります。Discovery Call で機能や活用場面についてのご質問にお答えします。",
      en: "Three or more matches means trust infrastructure is worth integrating. The Discovery Call answers your questions about capabilities and fit.",
    },
    resultCta: {
      label: { ja: "Discovery Call を予約 →", en: "Book a Discovery Call →" },
      href: DISCOVERY_URL,
    },
  },

  visionClose: {
    eyebrow: { ja: "次の一手", en: "Next step" },
    h2Head: { ja: "AI を、", en: "Move AI" },
    h2Accent: { ja: "本番運用へ。", en: "to production." },
    sub: {
      ja: "機密も、説明責任も、規制対応も。証明層から組み込むことで、AI 採用の次の一手が動き出す。",
      en: "Confidentiality, accountability, regulatory compliance — integrating from the proof layer first sets AI adoption's next move in motion.",
    },
    ctaPrimary: {
      label: { ja: "Discovery Call を予約 →", en: "Book a Discovery Call →" },
      href: DISCOVERY_URL,
    },
    ctaSecondary: {
      label: { ja: "ホワイトペーパー DL ↗", en: "Whitepaper ↗" },
      href: WP_URL,
    },
  },
};
