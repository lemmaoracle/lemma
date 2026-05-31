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

/** v2 concept-hub: structured content for §1-§4 of the detail page.
 * §1 → incidents + regulatory landscape; §2 → Lemma's role narrative;
 * §3 → business scenarios mapped to use cases; §4 → onward navigation. */
export interface PillarConceptHub {
  readonly incidents: ReadonlyArray<Readonly<{
    readonly date: string;
    readonly title: LocalizedStrings;
    readonly desc: LocalizedStrings;
    /** Critical Brief slug under content/critical-briefs/, when one exists. */
    readonly briefSlug?: string;
  }>>;
  readonly regulatory: LocalizedArray;
  readonly approach: Readonly<{
    readonly lead: LocalizedStrings;
    readonly bullets: ReadonlyArray<Readonly<{
      readonly label: LocalizedStrings;
      readonly text: LocalizedStrings;
    }>>;
    readonly links: ReadonlyArray<Readonly<{
      readonly label: LocalizedStrings;
      readonly href: string;
    }>>;
  }>;
  readonly scenarios: ReadonlyArray<Readonly<{
    readonly label: LocalizedStrings;
    readonly title: LocalizedStrings;
    readonly desc: LocalizedStrings;
    /** Use case slug under content/use-cases/, when one exists. */
    readonly useCaseSlug?: string;
  }>>;
  readonly further: ReadonlyArray<Readonly<{
    readonly label: LocalizedStrings;
    readonly title: LocalizedStrings;
    readonly desc: LocalizedStrings;
    readonly href: string;
  }>>;
}

export interface Pillar {
  readonly slug: PillarSlug;
  readonly title: LocalizedStrings;
  /** Poetic "X ≠ Y" tag, used in the v2 hub as auxiliary text next to the
   * Pillar number eyebrow (was the v1 main slogan). */
  readonly slogan: LocalizedStrings;
  /** Poetic subline ("Data is copied. Provenance is carved."). In the v2
   * hub it is rendered below the plain elevator with a dashed separator. */
  readonly subtitle: LocalizedStrings;
  /** v2 — Plain-language elevator describing what the pillar actually does.
   * Required for the new hub card. Set as the lead text under the card
   * title. */
  readonly plainElevator: LocalizedStrings;
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
  /** v2 concept-hub copy for the redesigned detail page. */
  readonly conceptHub?: PillarConceptHub;
}

/* ── Pillar Data (hardcoded) ───────────────────────────────────── */

const PILLARS: ReadonlyArray<Pillar> = [
  {
    slug: "verifiable-origin",
    title: { en: "Verifiable Origin", ja: "来歴証明" },
    slogan: { en: "Cryptographically valid ≠ semantically right", ja: "暗号論理的に有効 ≠ 意味的に正しい" },
    subtitle: { en: "Data is copied. Provenance is carved.", ja: "データは複製される。来歴は刻まれる。" },
    plainElevator: {
      en: "A cryptographic layer that lets receivers verify where a fact originated, without exposing the original.",
      ja: "流通する事実が「どこから来たか」を、原本を渡さずに検証可能にする暗号レイヤー。",
    },
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
    conceptHub: {
      incidents: [
        {
          date: "2026-05",
          title: { ja: "Noroboto フォント偽装攻撃", en: "Noroboto font impersonation attack" },
          desc: {
            ja: "悪意フォントで AI 文書レビューの入力が改ざんされ、契約書の準拠法・金額・日付が乖離。",
            en: "Malicious fonts altered what the AI document reviewer saw, leaving contract law, amount, and date divergent from the underlying file.",
          },
          briefSlug: "005-noroboto-lying-fonts",
        },
        {
          date: "2026-05",
          title: { ja: "Discord 20.5 億メッセージ scraping", en: "Discord 2.05B message scraping" },
          desc: {
            ja: "公開チャンネルデータが研究機関により AI 学習 dataset として無断再配布。",
            en: "Public channel data was redistributed by a research institute as an AI training dataset without consent.",
          },
          briefSlug: "008-discord-scraping",
        },
        {
          date: "2026-03",
          title: { ja: "SynthID 透かし剥がし", en: "SynthID watermark reverse-engineering" },
          desc: {
            ja: "Google DeepMind の AI 生成コンテンツ来歴標識が、独立研究者により reverse-engineering で剥離可能と実証。",
            en: "Independent researchers demonstrated that Google DeepMind's AI-generated-content watermark can be stripped via reverse-engineering.",
          },
          briefSlug: "011-synthid-watermark-reverse-engineering",
        },
        {
          date: "2026-03",
          title: { ja: "Claude Code 流出便乗マルウェア", en: "Claude Code leak-lure malware" },
          desc: {
            ja: "公式パッケージの来歴シグナルが悪意 actor の配送路として転用、ソフトウェアサプライチェーンで「正規ソースから来た」の根拠が機能しなくなる。",
            en: "Official package provenance signals were repurposed by malicious actors as a delivery path — \"came from a legitimate source\" stopped being a usable claim in the software supply chain.",
          },
          briefSlug: "010-claude-code-leak-lure",
        },
      ],
      regulatory: {
        ja: ["EU AI Act", "C2PA", "米 SEC AI 開示", "日本 FSA 暗号資産ガイドライン"],
        en: ["EU AI Act", "C2PA", "US SEC AI disclosure", "Japan FSA crypto guidelines"],
      },
      approach: {
        lead: {
          ja: "Lemma は、流通する事実に発行者の暗号署名を埋め込み、受信側が原本にアクセスせずに来歴を独立検証できる暗号レイヤーを提供する。フォーマット標準と独立検証可能性を分業として扱うことで、発行者・受信者・監査人が共通の事実基盤に立てる。",
          en: "Lemma embeds an issuer's cryptographic signature into each fact it carries, giving receivers a way to verify origin independently — without contacting the issuer or seeing the original. Format standards and independent verifiability are kept as separate concerns so publishers, receivers, and auditors share a common factual basis.",
        },
        bullets: [
          {
            label: { ja: "役割", en: "Role" },
            text: {
              ja: "流通する各事実に発行者由来の独立検証可能な来歴 proof を付帯。原本は発行者の管理下、受信側は proof だけで真正性を確認する。",
              en: "Each fact in flight carries an independently verifiable, issuer-signed provenance proof. The original stays with the issuer; the receiver verifies authenticity from the proof alone.",
            },
          },
          {
            label: { ja: "隣接領域との違い", en: "Distinct from adjacent layers" },
            text: {
              ja: "C2PA / W3C VC が標準フォーマットを定義する。Lemma はその上で受信側が独立検証する暗号レイヤーを提供する(補完関係)。",
              en: "C2PA / W3C VC define standard formats. Lemma provides the cryptographic verification layer on top — complementary, not competing.",
            },
          },
          {
            label: { ja: "既存実装", en: "Available today" },
            text: {
              ja: "Lemma Oracle 経由。SDK は 2026/6/24 公開予定。",
              en: "Via Lemma Oracle. SDK public release scheduled 2026-06-24.",
            },
          },
        ],
        links: [
          { label: { ja: "Lemma Oracle 仕様書", en: "Lemma Oracle specs" }, href: "/blog/lemma-oracle-specs" },
          { label: { ja: "Developer Guides", en: "Developer guides" }, href: "/guides" },
        ],
      },
      scenarios: [
        {
          label: { ja: "RAG · エンタープライズ", en: "RAG · Enterprise" },
          title: { ja: "社内 RAG の文書来歴", en: "Document provenance in internal RAG" },
          desc: {
            ja: "日々索引化される社内文書が、来歴を失わずに AI 引用に乗ること。",
            en: "Internal docs indexed each day carry provenance into AI citations instead of losing it on the way.",
          },
          useCaseSlug: "rag-content-provenance",
        },
        {
          label: { ja: "AI 監査 · コンプライアンス", en: "AI audit · Compliance" },
          title: { ja: "AI 文書処理の入力 integrity", en: "Input integrity for AI document processing" },
          desc: {
            ja: "AI が読む契約書・申請書が改ざんされていないことを、判断前に確認できる。",
            en: "Before judgment, AI document reviewers can confirm contracts and applications haven't been modified.",
          },
          useCaseSlug: "ai-audit-log-proof",
        },
        {
          label: { ja: "サプライチェーン · 製造", en: "Supply chain · Manufacturing" },
          title: { ja: "多階層サプライヤの部品来歴", en: "Component provenance across supplier tiers" },
          desc: {
            ja: "各サプライヤ階層からの来歴属性が、組立側で独立検証可能な形で連鎖する。",
            en: "Per-tier provenance attributes chain together so the assembling side can independently verify the full path.",
          },
          useCaseSlug: "supply-chain-component-provenance",
        },
        {
          label: { ja: "広告 · メディア · 出版", en: "Advertising · Media · Publishing" },
          title: { ja: "AI 生成コンテンツの来歴", en: "Provenance of AI-generated content" },
          desc: {
            ja: "AI が生成したコンテンツの出所を、後段の配信先で改ざんされずに検証できる。",
            en: "Downstream distribution can verify the origin of AI-generated content without it being modified along the way.",
          },
          useCaseSlug: "rag-source-attestation",
        },
      ],
      further: [
        {
          label: { ja: "Brief", en: "Brief" },
          title: { ja: "来歴喪失起因の構造的事案分析", en: "Structural analysis of provenance-loss incidents" },
          desc: {
            ja: "公開情報の構造化分析。CSO・アナリスト向け。",
            en: "Structured analysis of public information. For CSOs and analysts.",
          },
          href: "/critical/briefs/",
        },
        {
          label: { ja: "Use Case", en: "Use Case" },
          title: { ja: "業界別の活用シナリオ", en: "Industry application scenarios" },
          desc: {
            ja: "来歴証明を業務に組み込むパターン。",
            en: "Patterns for putting Verifiable Origin into operation.",
          },
          href: "/use-cases/",
        },
        {
          label: { ja: "Product", en: "Product" },
          title: { ja: "Lemma Industries", en: "Lemma Industries" },
          desc: {
            ja: "エンタープライズ向けの提供形態。",
            en: "Enterprise delivery model.",
          },
          href: "/pricing",
        },
        {
          label: { ja: "Specs", en: "Specs" },
          title: { ja: "Lemma Oracle 仕様書", en: "Lemma Oracle specs" },
          desc: {
            ja: "信頼レイヤーの技術仕様。",
            en: "Technical specification of the trust layer.",
          },
          href: "/guides",
        },
      ],
    },
  },
  {
    slug: "verifiable-ai",
    title: { en: "Verifiable AI", ja: "検証可能 AI" },
    slogan: { en: "Finds bugs ≠ proves decisions", ja: "バグを見つける ≠ 決定を証明する" },
    subtitle: { en: "Models change. Proofs remain.", ja: "モデルは変わる。証明は残る。" },
    plainElevator: {
      en: "A way to record an AI's decision process as a reproducible cryptographic proof — what was the input, which model, what was decided.",
      ja: "AI の判断過程を、再現可能な暗号証明として記録する仕組み。何を入力に、どのモデルで、どう決定したかを後から独立検証できる。",
    },
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
    conceptHub: {
      incidents: [
        {
          date: "2026-05",
          title: { ja: "Robert Williams 誤認逮捕", en: "Robert Williams wrongful arrest" },
          desc: {
            ja: "顔認識 AI の照合結果が独立検証なく行政の強制処分に直結、米国初の FRT 起因誤認逮捕事例。",
            en: "Face-recognition AI output drove enforcement action without independent verification — the first US wrongful arrest attributed to facial recognition.",
          },
          briefSlug: "012-williams-frt-wrongful-arrest",
        },
        {
          date: "2026-05",
          title: { ja: "Noroboto フォント偽装攻撃", en: "Noroboto font impersonation attack" },
          desc: {
            ja: "AI 文書処理での入力 integrity 偽装、契約書 AI レビューの判断根拠が乖離。",
            en: "Input integrity forged in AI document processing — the basis of the contract review AI's judgment came apart from the actual document.",
          },
          briefSlug: "005-noroboto-lying-fonts",
        },
        {
          date: "2026-04",
          title: { ja: "PocketOS Cursor 本番 DB 削除", en: "PocketOS Cursor production DB deletion" },
          desc: {
            ja: "AI coding agent が単一 API call で 9 秒で production database を削除、判断過程の事前検証が不在。",
            en: "An AI coding agent deleted the production database with a single API call in 9 seconds — no pre-execution verification of the decision process.",
          },
          briefSlug: "007-pocketos-cursor-db-deletion",
        },
      ],
      regulatory: {
        ja: ["EU AI Act 高リスク AI 要件", "NY Local Law 144 (採用 AI 監査義務)", "米 SEC AI 開示ガイダンス", "EEOC AI 採用差別ガイダンス"],
        en: ["EU AI Act high-risk AI requirements", "NY Local Law 144 (hiring AI audit duty)", "US SEC AI disclosure guidance", "EEOC AI hiring discrimination guidance"],
      },
      approach: {
        lead: {
          ja: "検証可能 AI は、AI の判断を「説明する」のではなく「再現できる暗号証拠として残す」設計。入力・モデル・推論結果を改ざん不能な形で結びつけ、第三者監査が後から独立検証できる証跡を提供する。",
          en: "Verifiable AI is designed not to explain an AI's decision but to preserve it as reproducible cryptographic evidence. Inputs, model version, and inference output are bound together in a tamper-evident form so a third-party auditor can independently verify after the fact.",
        },
        bullets: [
          {
            label: { ja: "役割", en: "Role" },
            text: {
              ja: "AI 判断の入力 / モデルバージョン / 推論結果を、改ざん不能な暗号コミットメントで紐づけた証跡として残す。",
              en: "Bind inputs, model version, and inference output via tamper-evident cryptographic commitments — a record that survives model updates.",
            },
          },
          {
            label: { ja: "隣接領域との違い", en: "Distinct from adjacent layers" },
            text: {
              ja: "XAI / interpretability ツールは判断の「説明」を生成する。Lemma は判断の「事実」を独立検証可能にする(補完関係)。",
              en: "XAI / interpretability tools generate explanations of a decision. Lemma makes the facts of the decision independently verifiable — complementary, not competing.",
            },
          },
          {
            label: { ja: "既存実装", en: "Available today" },
            text: {
              ja: "Lemma Oracle 経由。zkML primitives の本番実装は 2026 後半予定、それまでは commitment scheme のみで対応。",
              en: "Via Lemma Oracle. Production zkML primitives scheduled for late 2026; commitment-scheme-only coverage in the interim.",
            },
          },
        ],
        links: [
          { label: { ja: "Lemma Oracle 仕様書", en: "Lemma Oracle specs" }, href: "/blog/lemma-oracle-specs" },
          { label: { ja: "Developer Guides", en: "Developer guides" }, href: "/guides" },
        ],
      },
      scenarios: [
        {
          label: { ja: "HR · コンプライアンス", en: "HR · Compliance" },
          title: { ja: "AI 採用評価の説明責任", en: "Accountability for AI hiring evaluation" },
          desc: {
            ja: "採用候補の評価過程を、後から独立検証可能な形で残す。",
            en: "Preserve the evaluation process for hiring candidates in an independently verifiable form.",
          },
          useCaseSlug: "ai-audit-log-proof",
        },
        {
          label: { ja: "金融 · 規制対応", en: "Finance · Regulatory" },
          title: { ja: "AI 融資審査の監査ログ", en: "Audit log for AI lending decisions" },
          desc: {
            ja: "融資判断の入力・モデル・結果を、規制当局が後から確認できる証跡として記録する。",
            en: "Record lending decision inputs, model, and output as evidence regulators can verify after the fact.",
          },
          useCaseSlug: "ai-audit-log-proof",
        },
        {
          label: { ja: "ヘルスケア · 医療機器", en: "Healthcare · Medical devices" },
          title: { ja: "AI 医療判定の証跡保持", en: "Trace records for AI clinical decisions" },
          desc: {
            ja: "診断 AI の判断過程を、医療機器規制への適合証跡として保持する。",
            en: "Preserve clinical AI decision processes as evidence of compliance with medical device regulation.",
          },
          useCaseSlug: "ai-audit-log-proof",
        },
        {
          label: { ja: "法務 · 契約管理", en: "Legal · Contracts" },
          title: { ja: "AI 文書レビューの判断根拠", en: "Decision basis for AI document review" },
          desc: {
            ja: "契約レビュー AI が「何を見て」「どう判断したか」を、後から再現可能な形で残す。",
            en: "Preserve what a contract-review AI saw and how it decided, in a reproducible form.",
          },
          useCaseSlug: "ai-audit-log-proof",
        },
      ],
      further: [
        {
          label: { ja: "Brief", en: "Brief" },
          title: { ja: "AI 判断の独立検証ギャップ", en: "Independent verification gaps in AI decisions" },
          desc: {
            ja: "公開情報の構造化分析。CSO・アナリスト向け。",
            en: "Structured analysis of public information. For CSOs and analysts.",
          },
          href: "/critical/briefs/",
        },
        {
          label: { ja: "Use Case", en: "Use Case" },
          title: { ja: "業界別の活用シナリオ", en: "Industry application scenarios" },
          desc: {
            ja: "検証可能 AI を業務に組み込むパターン。",
            en: "Patterns for putting Verifiable AI into operation.",
          },
          href: "/use-cases/",
        },
        {
          label: { ja: "Product", en: "Product" },
          title: { ja: "Lemma Industries", en: "Lemma Industries" },
          desc: {
            ja: "エンタープライズ向けの提供形態。",
            en: "Enterprise delivery model.",
          },
          href: "/pricing",
        },
        {
          label: { ja: "Specs", en: "Specs" },
          title: { ja: "Lemma Oracle 仕様書", en: "Lemma Oracle specs" },
          desc: {
            ja: "信頼レイヤーの技術仕様。",
            en: "Technical specification of the trust layer.",
          },
          href: "/guides",
        },
      ],
    },
  },
  {
    slug: "agent-authority-proof",
    title: { en: "Agent Authority Proof", ja: "エージェント権限証明" },
    slogan: { en: "Pays ≠ trustworthy", ja: "支払う ≠ 信頼できる" },
    subtitle: { en: "Authority can be delegated. Only provable authority should be.", ja: "権限は渡せる。証明できる権限だけが。" },
    plainElevator: {
      en: "A way to prove \"for whom\" and \"how far\" an AI agent is authorized to act, without giving it signing keys.",
      ja: "AI エージェントが「誰の代理で」「どの範囲まで」動けるかを、署名鍵を持たせずに暗号証明する仕組み。",
    },
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
      href: "https://tally.so/r/Pd2Rl5",
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
    conceptHub: {
      incidents: [
        {
          date: "2026-05",
          title: { ja: "GTG-1002 中国国家支援グループ", en: "GTG-1002 China state-backed group" },
          desc: {
            ja: "AI エージェントが攻撃の 80-90% を自律実行、人間介入なしに約 30 標的に侵入試行、エージェント権限が独立検証されない構造。",
            en: "AI agents autonomously executed 80–90% of the attack — roughly 30 targets attempted with no human intervention. The agents' authority went uninspected end-to-end.",
          },
          briefSlug: "009-gtg1002-ai-orchestrated-espionage",
        },
        {
          date: "2026-04",
          title: { ja: "PocketOS Cursor 本番 DB 削除", en: "PocketOS Cursor production DB deletion" },
          desc: {
            ja: "AI coding agent が destructive 権限を持ったまま単一 API call で 9 秒で全削除。",
            en: "An AI coding agent retained destructive authority and dropped the entire database in one 9-second API call.",
          },
          briefSlug: "007-pocketos-cursor-db-deletion",
        },
        {
          date: "2026-05",
          title: { ja: "Starlette BadHost CVE-2026-48710", en: "Starlette BadHost CVE-2026-48710" },
          desc: {
            ja: "HTTP Host ヘッダー操作で MCP server 認証回避、エージェントインフラの権限境界が機能しない。",
            en: "Host-header tampering let MCP server auth be bypassed — the authority boundary in the agent infrastructure stopped working.",
          },
          briefSlug: "003-starlette-badhost",
        },
        {
          date: "2026-05",
          title: { ja: "Google API キー失効遅延 23 分", en: "Google API key revocation lag (23 min)" },
          desc: {
            ja: "credential 失効属性が独立検証されず、削除後も最長 23 分間認証成功。",
            en: "Credential revocation status was not independently verifiable — the deleted key still authenticated for up to 23 minutes.",
          },
          briefSlug: "006-google-api-key-revocation-lag",
        },
      ],
      regulatory: {
        ja: ["EU AI Act 高リスク AI 自律性要件", "NIST AI RMF", "米 OMB AI ガバナンスメモ (M-24-10)", "ISO/IEC 42001 AI MS"],
        en: ["EU AI Act high-risk autonomy requirements", "NIST AI RMF", "US OMB AI governance memo (M-24-10)", "ISO/IEC 42001 AI MS"],
      },
      approach: {
        lead: {
          ja: "エージェント権限証明は、AI エージェントに署名鍵を持たせる代わりに、行為ごとに「委任された範囲内である」ことを暗号で立証する仕組み。鍵漏洩のリスクを構造的に排除しながら、エージェントの行為を独立検証可能にする。",
          en: "Agent Authority Proof avoids handing signing keys to an AI agent and instead proves at each action that the agent is operating within delegated scope. Key-leak risk is structurally removed while every action stays independently verifiable.",
        },
        bullets: [
          {
            label: { ja: "役割", en: "Role" },
            text: {
              ja: "委任関係を暗号化された capability credential として発行、各行為時に「権限範囲内」を範囲付き proof で証明する。",
              en: "Issue the delegation as an encrypted capability credential, and prove at each action that the action falls within scope via a scope-bound proof.",
            },
          },
          {
            label: { ja: "隣接領域との違い", en: "Distinct from adjacent layers" },
            text: {
              ja: "IAM / OAuth は静的な権限を管理する。Lemma は各行為時の動的な権限行使を proof で立証する(補完関係)。",
              en: "IAM / OAuth manage static permissions. Lemma proves the dynamic exercise of authority at each action — complementary, not competing.",
            },
          },
          {
            label: { ja: "既存実装", en: "Available today" },
            text: {
              ja: "Lemma Oracle + Trust402 経由。x402 標準と連動。",
              en: "Via Lemma Oracle + Trust402. Aligned with the x402 standard.",
            },
          },
        ],
        links: [
          { label: { ja: "Lemma Oracle 仕様書", en: "Lemma Oracle specs" }, href: "/blog/lemma-oracle-specs" },
          { label: { ja: "Developer Guides", en: "Developer guides" }, href: "/guides" },
        ],
      },
      scenarios: [
        {
          label: { ja: "コーポレート · ファイナンス", en: "Corporate · Finance" },
          title: { ja: "経費承認 AI の権限境界", en: "Authority boundary for expense-approval AI" },
          desc: {
            ja: "経費精算エージェントが上長委任の範囲内でのみ承認できることを行為ごとに証明する。",
            en: "Prove on each action that the expense-approval agent is operating inside the manager's delegated scope.",
          },
          useCaseSlug: "delegated-treasury",
        },
        {
          label: { ja: "調達 · サプライチェーン", en: "Procurement · Supply chain" },
          title: { ja: "購買発注 AI の代理権限", en: "Delegated authority for purchasing AI" },
          desc: {
            ja: "発注 AI が「誰の代理で」「いくらまで」発注できるかを、取引先側で独立検証できる。",
            en: "The counterparty can independently verify on whose behalf and up to what limit the purchasing AI is authorized.",
          },
          useCaseSlug: "delegated-treasury",
        },
        {
          label: { ja: "カスタマーサクセス · 営業", en: "Customer success · Sales" },
          title: { ja: "顧客対応 AI の代理範囲", en: "Delegated scope for customer-facing AI" },
          desc: {
            ja: "カスタマー対応 AI の権限範囲を、顧客側で確認可能な proof として提示する。",
            en: "Present the customer-facing AI's scope as a proof the customer can verify.",
          },
          useCaseSlug: "multi-agent-workflows",
        },
        {
          label: { ja: "エンジニアリング · DevOps", en: "Engineering · DevOps" },
          title: { ja: "AI coding agent の destructive 権限制御", en: "Destructive-authority control for AI coding agents" },
          desc: {
            ja: "コード変更エージェントの権限境界(書き込み範囲・削除権限)を、各操作前に独立検証する。",
            en: "Independently verify the coding agent's authority boundary (write scope, destructive rights) before each operation.",
          },
          useCaseSlug: "multi-agent-workflows",
        },
      ],
      further: [
        {
          label: { ja: "Brief", en: "Brief" },
          title: { ja: "エージェント権限を巡る構造的事案", en: "Structural incidents around agent authority" },
          desc: {
            ja: "公開情報の構造化分析。CSO・アナリスト向け。",
            en: "Structured analysis of public information. For CSOs and analysts.",
          },
          href: "/critical/briefs/",
        },
        {
          label: { ja: "Use Case", en: "Use Case" },
          title: { ja: "業界別の活用シナリオ", en: "Industry application scenarios" },
          desc: {
            ja: "エージェント権限証明を業務に組み込むパターン。",
            en: "Patterns for putting Agent Authority Proof into operation.",
          },
          href: "/use-cases/",
        },
        {
          label: { ja: "Product", en: "Product" },
          title: { ja: "Trust402", en: "Trust402" },
          desc: {
            ja: "x402 上のエージェント信頼レイヤー。",
            en: "Trust layer for agents on x402.",
          },
          href: "/trust402",
        },
        {
          label: { ja: "Specs", en: "Specs" },
          title: { ja: "Lemma Oracle 仕様書", en: "Lemma Oracle specs" },
          desc: {
            ja: "信頼レイヤーの技術仕様。",
            en: "Technical specification of the trust layer.",
          },
          href: "/guides",
        },
      ],
    },
  },
  {
    slug: "regulatory-attribute-proof",
    title: { en: "Regulatory Attribute Proof", ja: "規制属性証明" },
    slogan: { en: "Compliance promised ≠ compliance proven", ja: "コンプライアンスの約束 ≠ コンプライアンスの証明" },
    subtitle: { en: "Data stays. Proofs travel.", ja: "データは渡さない。証明は渡る。" },
    plainElevator: {
      en: "Prove regulatory attributes (KYC, AML, age, residency, credit score) without disclosing the underlying personal data.",
      ja: "KYC、AML、年齢、所在、信用スコアなど規制要件に紐づく属性を、原本の個人情報を渡さずに証明する。",
    },
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
    conceptHub: {
      incidents: [
        {
          date: "2026-05",
          title: { ja: "Google API キー失効遅延", en: "Google API key revocation lag" },
          desc: {
            ja: "credential 失効属性の独立検証が機能せず、削除済 API キーが 23 分間有効。",
            en: "The revocation attribute on credentials wasn't independently verifiable — a deleted API key kept authenticating for 23 minutes.",
          },
          briefSlug: "006-google-api-key-revocation-lag",
        },
        {
          date: "2026-05",
          title: { ja: "Discord 20.5 億メッセージ scraping", en: "Discord 2.05B message scraping" },
          desc: {
            ja: "公開属性の再配布で training data の attribute 来歴が消失。",
            en: "Public attributes redistributed at scale — the attribute provenance of the training data was lost on the way.",
          },
          briefSlug: "008-discord-scraping",
        },
        {
          date: "過去事案",
          title: { ja: "各国 KYC データベース漏洩", en: "KYC database breaches across jurisdictions" },
          desc: {
            ja: "KYC 通過の「証明」のために収集された原本(パスポート画像、住所証明、自撮り)が漏洩する構造(直近 6 ヶ月で複数の取引所事案)。",
            en: "Originals (passport scans, address proofs, selfies) collected for the sake of \"proving\" KYC clearance keep leaking — multiple exchange incidents in the past six months.",
          },
        },
      ],
      regulatory: {
        ja: ["GDPR データ最小化原則", "FATF Travel Rule", "日本 FSA 暗号資産ガイドライン", "EU eIDAS 2 (EUDI Wallet)", "米州 BIPA (生体認証)"],
        en: ["GDPR data minimization", "FATF Travel Rule", "Japan FSA crypto guidelines", "EU eIDAS 2 (EUDI Wallet)", "US state BIPA (biometric)"],
      },
      approach: {
        lead: {
          ja: "規制属性証明は、規制要件を満たすために原本(パスポート・診療記録・卒業証書など)を渡す構造を解体し、必要な属性だけを述語で開示する設計。データを溜める受信側のリスクを構造的に縮小しながら、規制適合の証明を成立させる。",
          en: "Regulatory Attribute Proof dismantles the pattern of handing over originals (passports, medical records, diplomas) to satisfy a regulation, and instead discloses only the predicate that's required. Receiver-side aggregation risk shrinks structurally while compliance attestation still goes through.",
        },
        bullets: [
          {
            label: { ja: "役割", en: "Role" },
            text: {
              ja: "発行者が原本に署名し、ホルダーが述語(「18 歳以上」「KYC 通過」)だけを選択的開示、検証者は属性のみ確認できる。",
              en: "An issuer signs the original; the holder selectively discloses only the predicate (\"over 18\", \"KYC passed\"); the verifier sees only the attribute.",
            },
          },
          {
            label: { ja: "隣接領域との違い", en: "Distinct from adjacent layers" },
            text: {
              ja: "W3C VC / EUDI Wallet が credential フォーマットを定義する。Lemma はその上で predicate proof / range proof を実装する暗号レイヤー(補完関係)。",
              en: "W3C VC / EUDI Wallet define credential formats. Lemma is the cryptographic layer on top that implements predicate proofs and range proofs — complementary, not competing.",
            },
          },
          {
            label: { ja: "既存実装", en: "Available today" },
            text: {
              ja: "Lemma Oracle + Lemma Compliance プラン経由。",
              en: "Via Lemma Oracle + the Lemma Compliance plan.",
            },
          },
        ],
        links: [
          { label: { ja: "Lemma Oracle 仕様書", en: "Lemma Oracle specs" }, href: "/blog/lemma-oracle-specs" },
          { label: { ja: "Developer Guides", en: "Developer guides" }, href: "/guides" },
        ],
      },
      scenarios: [
        {
          label: { ja: "金融 · 暗号資産取引所", en: "Finance · Crypto exchange" },
          title: { ja: "KYC / AML 選択的開示", en: "KYC / AML selective disclosure" },
          desc: {
            ja: "顧客の KYC 属性を、原本を渡さずに規制要件として証明する。",
            en: "Prove KYC attributes as the regulation requires without handing over the underlying original.",
          },
          useCaseSlug: "kyc-aml-selective-disclosure",
        },
        {
          label: { ja: "オンラインゲーム · 酒類販売 · 規制コンテンツ", en: "Online gaming · Alcohol · Regulated content" },
          title: { ja: "年齢・居住地証明", en: "Age and residency proof" },
          desc: {
            ja: "「18 歳以上」「規制対象国の居住者ではない」などの述語だけを開示する。",
            en: "Disclose only predicates like \"over 18\" or \"not resident of a restricted jurisdiction\".",
          },
          useCaseSlug: "kyc-aml-selective-disclosure",
        },
        {
          label: { ja: "保険 · 医療機関 · 治験参加", en: "Insurance · Healthcare · Clinical trials" },
          title: { ja: "医療要件の属性証明", en: "Attribute proof for clinical requirements" },
          desc: {
            ja: "診療記録を渡さずに、保険適用条件や治験参加要件の充足を証明する。",
            en: "Prove eligibility for insurance coverage or trial participation without handing over the medical record.",
          },
          useCaseSlug: "kyc-aml-selective-disclosure",
        },
        {
          label: { ja: "EEO · 人事 · 学位検証", en: "EEO · HR · Credential verification" },
          title: { ja: "雇用適格性証明", en: "Employment eligibility proof" },
          desc: {
            ja: "学位や職務経歴を渡さずに、ポジション要件への適合だけを証明する。",
            en: "Prove fitness for a position without handing over diplomas or employment history.",
          },
          useCaseSlug: "kyc-aml-selective-disclosure",
        },
      ],
      further: [
        {
          label: { ja: "Brief", en: "Brief" },
          title: { ja: "規制属性を巡る構造的事案", en: "Structural incidents around regulatory attributes" },
          desc: {
            ja: "公開情報の構造化分析。CSO・アナリスト向け。",
            en: "Structured analysis of public information. For CSOs and analysts.",
          },
          href: "/critical/briefs/",
        },
        {
          label: { ja: "Use Case", en: "Use Case" },
          title: { ja: "業界別の活用シナリオ", en: "Industry application scenarios" },
          desc: {
            ja: "規制属性証明を業務に組み込むパターン。",
            en: "Patterns for putting Regulatory Attribute Proof into operation.",
          },
          href: "/use-cases/",
        },
        {
          label: { ja: "Product", en: "Product" },
          title: { ja: "Lemma Compliance", en: "Lemma Compliance" },
          desc: {
            ja: "金融・規制対応向けの提供形態。",
            en: "Delivery model for finance and regulated operations.",
          },
          href: "/pricing",
        },
        {
          label: { ja: "Specs", en: "Specs" },
          title: { ja: "Lemma Oracle 仕様書", en: "Lemma Oracle specs" },
          desc: {
            ja: "信頼レイヤーの技術仕様。",
            en: "Technical specification of the trust layer.",
          },
          href: "/guides",
        },
      ],
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
