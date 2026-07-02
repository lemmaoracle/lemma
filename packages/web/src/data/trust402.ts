/**
 * Trust402 developer sub-brand content (Pay hub hero + the new
 * /trust402/sell/ page).
 *
 * Mirrors the pricing.ts / solutions.ts pattern — a single typed const
 * carrying the full bilingual copy, accessed as `FIELD[locale]`. Page
 * copy lives here (not in i18n JSON) for the same reason pricing does:
 * a 14-section page would balloon en.json/ja.json and the hand-kept
 * Translations interface (see translations.ts). Only nav strings stay
 * in i18n JSON.
 *
 * Messaging guardrails baked in (do not "fix" these in copy edits):
 *  - 0% commission — "keep 100% of every sale, paid directly in USDC to
 *    your own wallet (self-custody; we never hold your funds)". Never
 *    write "0% forever".
 *  - Self-custody, not "no crypto". Payments land in the seller's own
 *    wallet; a wallet is a ~2-minute setup. Verifying provenance is free.
 *  - "your work", not "your data", on the Sell side.
 *  - No superlatives, no web3 flavor. Pay and Sell are ONE shared plan.
 *
 * Naming: "Trust402 · Sell" is a placeholder; keeping copy here means a
 * rename is a one-file change.
 */

export interface Localized<T = string> {
  readonly ja: T;
  readonly en: T;
}

/* ── icon ids provided by Trust402Icons.astro sprite ───────────────── */
export type T402IconId =
  | "ic-robot"
  | "ic-robot-proof"
  | "ic-signed"
  | "ic-dataset"
  | "ic-chart"
  | "ic-notebook"
  | "ic-network"
  | "ic-github"
  | "ic-flask"
  | "ic-camera"
  | "ic-pen"
  | "ic-direct"
  | "ic-gem";

interface Card {
  readonly icon: T402IconId;
  readonly title: Localized;
  readonly body: Localized;
}

interface Step {
  readonly who: Localized;
  readonly title: Localized;
  readonly body: Localized;
}

interface Faq {
  readonly q: Localized;
  readonly a: Localized;
  /** Optional follow-up link rendered after the answer. */
  readonly link?: { readonly href: Localized; readonly label: Localized };
}

interface Tier {
  readonly name: string;
  readonly free?: boolean;
  readonly featured?: boolean;
  readonly pos: Localized;
  readonly price: Localized;
  readonly priceSub?: Localized;
  readonly means: Localized;
  readonly state: Localized;
}

export interface Trust402Content {
  readonly sellMeta: { readonly title: Localized; readonly description: Localized };

  /** Pay hub hero (two-way branch) — used by the hub rebrand. */
  readonly hubHero: {
    readonly eyebrow: Localized;
    readonly h1a: Localized;
    readonly h1em: Localized;
    readonly sub: Localized;
    readonly standards: Localized;
    readonly pay: { readonly tag: Localized; readonly h3: Localized; readonly cta: Localized };
    readonly sell: { readonly tag: Localized; readonly h3: Localized; readonly cta: Localized };
  };

  readonly sell: {
    readonly hero: {
      readonly eyebrow: Localized;
      readonly h1a: Localized;
      readonly h1em: Localized;
      readonly sub: Localized;
      readonly ctaPrimary: Localized;
      readonly ctaSecondary: Localized;
      readonly lede: ReadonlyArray<Localized>;
      readonly cardCaption: Localized;
      readonly card: {
        readonly file: string;
        readonly badge: Localized;
        readonly madeBy: Localized;
        readonly madeByVal: Localized;
        readonly untouched: Localized;
        readonly verifiedVal: Localized;
        readonly priceRow: Localized;
        readonly price: Localized;
        readonly checking: Localized;
        readonly checkingVal: Localized;
        readonly note: Localized;
      };
    };
    readonly how: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly sub: Localized;
      readonly steps: ReadonlyArray<Step>;
      readonly stepLink: Localized;
      readonly caption: Localized;
    };
    readonly whatSell: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly sub: Localized;
      readonly cards: ReadonlyArray<Card>;
      readonly caption: Localized;
      readonly modelLink: Localized;
    };
    /** Merged "why it earns more" + "why proof matters" — narrative intro,
     *  3 cards, tech link at the end (13→9 restructure). */
    readonly whyMore: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly sub: Localized;
      readonly items: ReadonlyArray<{ readonly icon: T402IconId; readonly title: Localized; readonly text: Localized }>;
      readonly techLink: Localized;
    };
    /** ✓✕ lists rendered inside the FAQ section (replaces the FAQ items
     *  they duplicated). */
    readonly control: {
      readonly yesTitle: Localized;
      readonly yes: ReadonlyArray<Localized>;
      readonly noTitle: Localized;
      readonly no: ReadonlyArray<Localized>;
    };
    readonly institutional: {
      readonly eyebrow: Localized;
      readonly h2a: Localized;
      readonly h2em: Localized;
      readonly sub: Localized;
      readonly cards: ReadonlyArray<Card>;
      /** "Share this page" loop — students forward the page itself
       *  (Web Share API / copy-link). No request form and no contact CTA:
       *  budget owners read the plan themselves. A direct sign-up from the
       *  pricing tier is planned later (Discovery Call is the enterprise
       *  door — wrong entry point here). */
      readonly share: {
        readonly lead: Localized;
        readonly cta: Localized;
        readonly copied: Localized;
        readonly text: Localized;
      };
    };
    /** Merged "what you actually do" + Dashboard-demo CTA. */
    readonly hands: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly sub: Localized;
      readonly sandboxTitle: Localized;
      readonly sandboxBody: Localized;
      readonly sandboxChip: Localized;
      readonly prodTitle: Localized;
      readonly prodBody: Localized;
      readonly prodChip: Localized;
      readonly cta: Localized;
      readonly ctaNote: Localized;
    };
    /** Thin Pay↔Sell band right before pricing (was the twoSides section). */
    readonly payBand: {
      readonly text: Localized;
      readonly link: Localized;
    };
    readonly pricing: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly sub: Localized;
      readonly tiers: ReadonlyArray<Tier>;
      readonly notes: ReadonlyArray<Localized>;
    };
    readonly faq: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly items: ReadonlyArray<Faq>;
    };
    readonly closing: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly core: Localized;
      readonly ctaPrimary: Localized;
      readonly github: Localized;
    };
  };
}

const GH = "https://github.com/lemmaoracle/trust402";

export const T402: Trust402Content = {
  sellMeta: {
    title: {
      en: "Trust402 · Sell — get paid by AI agents for your work | Lemma",
      ja: "Trust402 · Sell — あなたの成果を AI エージェントに販売 | Lemma",
    },
    description: {
      en: "Turn a dataset, paper, or any file into something AI agents can verify and pay for — proof it came from you, paid directly in USDC to your own wallet. No servers, no code. 0% commission.",
      ja: "データセットや論文、どんなファイルも、AI エージェントが検証して購入できる形に。本人が作った本物である証明つきで、USDC が直接あなたのウォレットに届く。コードもサーバーも不要、手数料 0%。",
    },
  },

  hubHero: {
    eyebrow: { en: "trust402", ja: "trust402" },
    h1a: { en: "Are you paying with AI,", ja: "AI で支払う側ですか、" },
    h1em: { en: "or getting paid by it?", ja: "それとも AI に支払われる側?" },
    sub: {
      en: "AI agents are starting to pay for things. Trust402 puts proof on both sides of that payment — so everyone can trust who's paying, and whose work they're paying for. No servers, no code, and no one holding your keys or your money.",
      ja: "AI エージェントがものを買い始めています。Trust402 はその支払いの両側に証明を添えます — 誰が払っているのか、誰の成果に払っているのかを、みんなが信頼できるように。サーバーもコードも不要、鍵もお金も預けません。",
    },
    standards: {
      en: "Works over x402 · MCP · A2A — discoverable in the x402 Bazaar",
      ja: "x402 · MCP · A2A に対応 — x402 Bazaar から発見可能",
    },
    pay: {
      tag: { en: "trust402 · pay", ja: "trust402 · pay" },
      h3: { en: "I'm paying with AI", ja: "AI で支払う" },
      cta: { en: "Go to Pay", ja: "Pay を見る" },
    },
    sell: {
      tag: { en: "trust402 · sell", ja: "trust402 · sell" },
      h3: { en: "I'm getting paid", ja: "成果で支払いを受ける" },
      cta: { en: "Go to Sell", ja: "Sell を見る" },
    },
  },

  sell: {
    hero: {
      eyebrow: { en: "trust402 · sell", ja: "trust402 · sell" },
      h1a: { en: "Made something good?", ja: "その研究も、作品も。" },
      h1em: { en: "Sell it to AI agents.", ja: "AI エージェントに売れる。" },
      sub: {
        en: "Turn a dataset, a paper, or any file into something AI agents can buy — with built-in proof it came from you and hasn't been changed. A no-code way in: no servers, no code, and no one holding your money — you're paid directly in USDC to your own wallet. You keep everything; Lemma is just the tool.",
        ja: "あなたのデータや論文を、AI エージェントが買える形に。「本人が作った」「改ざんなし」の証明つきで、コードもサーバーも不要 — 売上は USDC で直接あなたのウォレットに届きます。",
      },
      ctaPrimary: { en: "Try it free", ja: "無料で試す" },
      ctaSecondary: { en: "See what sells", ja: "何が売れるか見る" },
      lede: [
        { en: "Free to start", ja: "無料で開始" },
        { en: "No code", ja: "ノーコード" },
        { en: "0% commission", ja: "手数料 0%" },
      ],
      cardCaption: {
        en: "an agent checks it's real (free), then pays you ↓",
        ja: "エージェントが本物か確認し(無料)、支払う ↓",
      },
      card: {
        file: "my-dataset.csv",
        badge: { en: "yours ✓", ja: "あなたのもの ✓" },
        madeBy: { en: "made by", ja: "作成者" },
        madeByVal: { en: "you ✓", ja: "あなた ✓" },
        untouched: { en: "untouched", ja: "改ざんなし" },
        verifiedVal: { en: "verified ✓", ja: "検証済み ✓" },
        priceRow: { en: "your price", ja: "あなたの価格" },
        price: { en: "0.05 USDC ≈ $0.05 / use", ja: "0.05 USDC ≈ $0.05 / 回" },
        checking: { en: "checking it's real", ja: "本物か確認" },
        checkingVal: { en: "always free", ja: "常に無料" },
        note: {
          en: "USDC is a digital dollar — the agent pays automatically, straight to your own wallet.",
          ja: "USDC はデジタルのドル。エージェントが自動で支払い、直接あなたのウォレットに届きます。",
        },
      },
    },

    how: {
      eyebrow: { en: "how selling works", ja: "販売の仕組み" },
      h2: { en: "Three steps. You only do the first one.", ja: "3 ステップ。あなたがやるのは最初の 1 つだけ。" },
      sub: {
        en: "The rest is automatic. You don't write code, run a server, or manage payments.",
        ja: "あとは自動です。コードを書く、サーバーを動かす、支払いを管理する — どれも不要。",
      },
      steps: [
        {
          who: { en: "you", ja: "あなた" },
          title: { en: "Point to your file", ja: "ファイルを指定する" },
          body: {
            en: "Upload a dataset, a paper, or an export — or just link one you already have online. That's your whole job.",
            ja: "データセットや論文、エクスポートをアップロード — もしくは既にネット上にあるものをリンクするだけ。あなたの仕事はこれだけです。",
          },
        },
        {
          who: { en: "lemma does this", ja: "lemma がやる" },
          title: { en: "We stamp it and set your price", ja: "証明を添えて価格を設定" },
          body: {
            en: "We attach a proof that it's yours and unchanged, add the price you chose, and turn it into something payable. Zero setup.",
            ja: "あなたのもので改ざんされていないという証明を添え、あなたが決めた価格を付け、支払い可能な形にします。セットアップは不要。",
          },
        },
        {
          who: { en: "an agent does this", ja: "エージェントがやる" },
          title: { en: "It gets found, checked, and bought", ja: "発見され、検証され、購入される" },
          body: {
            en: "An AI agent discovers your listing, checks the proof for free, and pays you automatically. You get paid; it gets a source it can cite.",
            ja: "AI エージェントがあなたの出品を見つけ、証明を無料で検証し、自動で支払います。あなたは報酬を得て、相手は引用できる出典を得ます。",
          },
        },
      ],
      stepLink: { en: "See the preview ↓", ja: "プレビューを見る ↓" },
      caption: {
        en: "Checking your proof is always free. You get paid for the data — not for being trusted.",
        ja: "証明の検証は常に無料。報酬は成果に対して支払われます — 信頼されること自体には課金しません。",
      },
    },

    whatSell: {
      eyebrow: { en: "what you can sell", ja: "売れるもの" },
      h2: { en: "If you made it, an agent can cite it.", ja: "あなたが作ったなら、エージェントの出典になる。" },
      sub: {
        en: "Research work is exactly what AI agents are hungry for — real, structured, and verifiable. A few things people put up:",
        ja: "研究成果こそ AI エージェントが求めているもの — 本物で、構造化され、検証可能。出品されている例をいくつか:",
      },
      cards: [
        {
          icon: "ic-dataset",
          title: { en: "labeled datasets", ja: "ラベル付きデータセット" },
          body: { en: "The training data you built and annotated by hand.", ja: "自分で構築し、手でアノテーションした学習データ。" },
        },
        {
          icon: "ic-signed",
          title: { en: "cleaned corpora", ja: "クリーンなコーパス" },
          body: { en: "Messy sources you turned into something usable.", ja: "雑多なソースを、使える形に整えたもの。" },
        },
        {
          icon: "ic-chart",
          title: { en: "results & benchmarks", ja: "結果・ベンチマーク" },
          body: { en: "Experiment numbers others want to build on.", ja: "他の人が土台にしたい実験の数値。" },
        },
        {
          icon: "ic-notebook",
          title: { en: "methods & notebooks", ja: "手法・ノートブック" },
          body: { en: "The how — pipelines, prompts, reproducible steps.", ja: "その「やり方」— パイプライン、プロンプト、再現手順。" },
        },
      ],
      caption: {
        en: "Whatever you put up becomes a resource an agent can trust, pay for, and cite back to you.",
        ja: "何を出品しても、エージェントが信頼して支払い、あなたを出典として引用できる資源になります。",
      },
      modelLink: { en: "See who sells, what & for how much", ja: "誰が・何を・いくらで売れるか見る" },
    },

    whyMore: {
      eyebrow: { en: "why it earns more", ja: "より高く売れる理由" },
      h2: { en: "Only the real earns a price.", ja: "値段がつくのは、本物だけ。" },
      sub: {
        en: "Scraped versions and AI-made imitations sit right next to your original — without proof, an agent can't tell which one is really yours. Real, verifiable, original: exactly what agents will pay a premium for.",
        ja: "スクレイピングされた版や AI が作った模倣が、あなたの本物のすぐ隣に並びます — 証明がなければ、エージェントはどれが本当にあなたのものか区別できません。本物で・検証でき・オリジナル。それが、エージェントが割増しでも欲しいものです。",
      },
      items: [
        {
          icon: "ic-signed",
          title: { en: "Being real gets it chosen", ja: "本物だと、選ばれる" },
          text: {
            en: "It carries who, when, and unaltered — and AI prefers sources it can verify.",
            ja: "「誰が・いつ・無改変か」が証明つき。AI は裏取りできる一次ソースを優先します。",
          },
        },
        {
          icon: "ic-direct",
          title: { en: "Direct means you keep more", ja: "直接だから、手取りが多い" },
          text: {
            en: "You license the original yourself — no middleman skimming your cut.",
            ja: "オリジナルのまま本人が販売。仲介の中抜きがないぶん、そのまま収入に。",
          },
        },
        {
          icon: "ic-gem",
          title: { en: "The real gets scarce", ja: "本物は、これから希少になる" },
          text: {
            en: "As generated content floods the web, verified human originals only grow more valuable.",
            ja: "生成物が増えるほど、検証済みの“人間の本物”は希少になり、値がつく。",
          },
        },
      ],
      techLink: { en: "How the proof works, technically — Trust402", ja: "証明の技術的な仕組み(Trust402)" },
    },

    control: {
      yesTitle: { en: "What stays yours", ja: "あなたのものであり続けるもの" },
      yes: [
        { en: "Full ownership of your work — always.", ja: "成果の完全な所有権 — 常に。" },
        { en: "The right to sell or share it anywhere else, too.", ja: "他の場所でも売る・共有する権利。" },
        { en: "Your name on it, as the recognized source.", ja: "出典として、あなたの名前が付くこと。" },
        { en: "You set the price, and you can change it.", ja: "価格はあなたが決め、いつでも変更できる。" },
      ],
      noTitle: { en: "What you don't need", ja: "要らないもの" },
      no: [
        { en: "A server, or any code to write.", ja: "サーバーや、書くべきコード。" },
        { en: "A storefront or marketplace account to set up.", ja: "用意すべき店舗やマーケットのアカウント。" },
        { en: "To hand over your raw data just to prove it's real.", ja: "本物だと示すために生データを渡すこと。" },
        { en: "A custodian — you're paid directly in USDC; we never hold your funds.", ja: "資金の預かり先 — USDC が直接届き、私たちが資金を預かることはありません。" },
      ],
    },

    institutional: {
      eyebrow: { en: "institutional id", ja: "institutional id" },
      h2a: { en: "If your lab registers,", ja: "あなたの研究室が登録すれば、" },
      h2em: { en: "everyone in it publishes free.", ja: "ラボメンバー全員が無料で出品。" },
      sub: {
        en: "Registered institutions are just coming online.",
        ja: "登録機関は、これから増えていく段階です。",
      },
      cards: [
        {
          icon: "ic-network",
          title: { en: "Your lab registers once", ja: "研究室が一度だけ登録" },
          body: { en: "A lab or university signs up as the institution. After that, every member can publish under its name.", ja: "研究室や大学が組織として登録。あとはメンバー全員がその名義で出品できます。" },
        },
        {
          icon: "ic-signed",
          title: { en: "You publish under the umbrella", ja: "その名義で、本人は無料" },
          body: { en: "No separate plan or cost for you — just point to your file and set a price.", ja: "個別のプランや費用は不要 — ファイルを指定して価格を決めるだけ。" },
        },
        {
          icon: "ic-robot",
          title: { en: "Credit follows you", ja: "クレジットはあなたに" },
          body: { en: "Everything is attributed to you by name. Move on, and your proofs still check out.", ja: "すべてあなたの名前に帰属します。所属が変わっても、証明は有効なまま。" },
        },
      ],
      share: {
        lead: {
          en: "It starts with getting this page in front of your lab.",
          ja: "まずは、このページを研究室に届けるところから。",
        },
        cta: { en: "Share this page", ja: "このページをシェアする" },
        copied: { en: "Link copied", ja: "リンクをコピーしました" },
        text: {
          en: "A platform for selling research data to AI agents, with proof of authenticity built in. When a lab registers, its members publish free.",
          ja: "研究データを、真贋証明つきでAIエージェントに販売できる基盤。研究室が登録するとメンバーは無料。",
        },
      },
    },

    hands: {
      eyebrow: { en: "hands-on", ja: "実際にやること" },
      h2: { en: "What you actually do: pick a file, set a price — in the Dashboard.", ja: "やることは、ダッシュボードでファイルを選び、価格を決めるだけ。" },
      sub: {
        en: "Nothing to wire up, no code — and you can rehearse the whole thing for free before anything goes live.",
        ja: "設定するものも、書くコードもなし — 本番前に、全体を無料で予行演習できます。",
      },
      sandboxTitle: { en: "① try it in the sandbox", ja: "① サンドボックスで試す" },
      sandboxBody: {
        en: "In the Dashboard, point to a file and set a test price. It runs on a test network, so no real money moves. Break things, retry, get comfortable. Students start here.",
        ja: "ダッシュボードでファイルを指定し、テスト価格を設定するだけ。テストネット上で動くので、実際のお金は動きません。壊して、やり直して、慣れる。学生はここから。",
      },
      sandboxChip: { en: "no real money · testnet", ja: "実マネーなし · テストネット" },
      prodTitle: { en: "② go live in production", ja: "② 本番に出す" },
      prodBody: {
        en: "The exact same steps — now it's real. Agents can discover your listing, verify it for free, and pay you. Nothing new to learn.",
        ja: "同じ手順のまま — 今度は本番。エージェントが出品を見つけ、無料で検証し、支払います。新しく学ぶことはありません。",
      },
      prodChip: { en: "same steps · real payouts", ja: "同じ手順 · 実際の入金" },
      cta: { en: "Open the Dashboard demo", ja: "ダッシュボードデモを開く" },
      ctaNote: {
        en: "Publishing, pricing, and tracking what you've sold all live in the Dashboard. It's a non-functional demo — nothing goes live.",
        ja: "出品も価格設定も、売上の管理も、すべてダッシュボードで完結。非機能デモなので、公開はされません。",
      },
    },

    payBand: {
      text: {
        en: "Pay ↔ Sell — Trust402 puts proof on both sides of the payment. One plan and one monthly allowance cover both.",
        ja: "Pay ↔ Sell — Trust402 は支払いの両側に証明を添えます。1 つのプラン、1 つの月間枠が両方をカバー。",
      },
      link: { en: "See Trust402 · Pay", ja: "Trust402 · Pay を見る" },
    },

    pricing: {
      eyebrow: { en: "pricing · shared with pay", ja: "料金 · pay と共通" },
      h2: { en: "Pay only when you really sell.", ja: "本当に売るときだけ、支払う。" },
      sub: {
        en: "The same three plans cover both Pay and Sell. Checking proofs is always free — you only pay for a plan when you publish for real. No commission on sales.",
        ja: "同じ 3 プランが Pay と Sell の両方をカバー。証明の検証は常に無料 — 本番で公開するときだけプラン料金がかかります。販売手数料はゼロ。",
      },
      tiers: [
        {
          name: "Explorer",
          free: true,
          pos: { en: "Sandbox · test mode. Practice safely.", ja: "サンドボックス · テストモード。安全に練習。" },
          price: { en: "Free", ja: "無料" },
          means: { en: "Try the whole flow end to end — no real money involved. Students start here.", ja: "全体の流れを最初から最後まで — 実際のお金は不要。学生はここから。" },
          state: { en: "Coming soon", ja: "近日公開" },
        },
        {
          name: "Pro",
          featured: true,
          pos: { en: "Your own storefront, live in production.", ja: "あなたの売り場を、本番で持つ。" },
          price: { en: "$19", ja: "¥2,980" },
          priceSub: { en: "/mo · 0% commission on sales", ja: "/月 · 販売手数料 0%" },
          means: {
            en: "Listings, pricing, USDC payouts, your Dashboard — proof of authenticity standard on every listing. Optional API for developers.",
            ja: "出品・価格設定・USDC 受け取り・ダッシュボード — 真贋証明は全出品に標準装備。開発者向け API はオプション。",
          },
          state: { en: "Coming soon", ja: "近日公開" },
        },
        {
          name: "Institutional ID",
          pos: { en: "For labs, universities & organizations.", ja: "研究室・大学・組織向け。" },
          price: { en: "$330", ja: "¥50,000" },
          priceSub: { en: "/mo + identity check at registration", ja: "/月 + 登録時の本人性確認" },
          means: { en: "Register once; members & students publish under the umbrella, free to them.", ja: "一度登録すれば、メンバーや学生がその名義で出品 — 本人は無料。" },
          state: { en: "Coming soon", ja: "近日公開" },
        },
      ],
      notes: [
        {
          en: "Your monthly plan pays for your storefront. Proof of authenticity comes standard on every listing.",
          ja: "月額は、あなたの売り場の費用。真贋証明は、すべての出品に最初からついてきます。",
        },
        {
          en: "0% commission on sales — you keep 100% of every sale, paid directly in USDC to your own wallet (self-custody; we never hold your funds).",
          ja: "販売手数料 0% — 売上の 100% があなたのもので、USDC が直接あなたのウォレットに届きます(セルフカストディ。資金は預かりません)。",
        },
        {
          en: "Agents verify proofs for free — always.",
          ja: "エージェントによる証明の検証は、常に無料。",
        },
      ],
    },

    faq: {
      eyebrow: { en: "common questions", ja: "よくある質問" },
      h2: { en: "Good things to check.", ja: "確認しておきたいこと。" },
      items: [
        {
          q: { en: "I've never done this — where do I start?", ja: "やったことがない — どこから始める?" },
          a: {
            en: "In the free sandbox. In the Dashboard, point to a file and set a test price, watch the whole flow, and pay nothing. When it clicks, going live takes the same steps.",
            ja: "無料のサンドボックスから。ダッシュボードでファイルを指定してテスト価格を決め、流れ全体を見る — 費用はゼロ。感覚が掴めたら、本番も同じ手順です。",
          },
        },
        {
          q: { en: "How do I get paid? Do I need to know crypto?", ja: "支払いはどう受け取る? 暗号資産の知識は要る?" },
          a: {
            en: "In USDC, a digital dollar, straight to your own wallet — self-custody, we never hold your funds. When an agent buys your work, payment settles automatically, no invoicing. If you don't have a wallet, setting one up is a one-time ~2-minute step; we handle all the proof and payment plumbing behind the scenes.",
            ja: "デジタルのドル USDC で、直接あなたのウォレットに — セルフカストディで、資金は預かりません。エージェントが購入すると自動で決済され、請求書も不要。ウォレットがなければ一度用意するだけ(2 分ほど)で、証明や支払いまわりはすべて裏側で処理されます。",
          },
        },
        {
          q: { en: "I'm a student — where do I start, and is there a cost?", ja: "学生です — どこから始める? 費用は?" },
          a: {
            en: "Two steps. First, try everything free in the sandbox — no affiliation, no real money. When you're ready to go live, publish free under your university's or lab's Institutional plan, still credited to you by name. If your institution isn't registered yet, start by sharing this page with your lab.",
            ja: "二段構えです。まずサンドボックスで無料で試す — 所属も実マネーも不要。本番に出すときは、大学や研究室の Institutional プランの名義で無料で公開できます(クレジットはあなたの名前のまま)。機関がまだ登録していなければ、このページを研究室でシェアするところから始めてください。",
          },
          link: {
            href: { en: "#institutional", ja: "#institutional" },
            label: { en: "Share this with your lab", ja: "研究室にシェアする" },
          },
        },
        {
          q: { en: "Is this a marketplace? Does Lemma resell my data?", ja: "これはマーケット? Lemma がデータを転売する?" },
          a: {
            en: "No. You sell; Lemma is just the tool that makes it possible. Discovery happens in the open x402 Bazaar.",
            ja: "いいえ。売るのはあなたで、Lemma はそれを可能にする道具にすぎません。発見はオープンな x402 Bazaar で行われます。",
          },
        },
      ],
    },

    closing: {
      eyebrow: { en: "get started", ja: "はじめる" },
      h2: { en: "Turn your work into something agents trust.", ja: "あなたの成果を、エージェントが信頼できるものに。" },
      core: { en: "Your work. Provably yours.", ja: "あなたの成果。証明できる、あなたのもの。" },
      ctaPrimary: { en: "Try it free", ja: "無料で試す" },
      github: { en: "GitHub", ja: "GitHub" },
    },
  },
};

export const T402_GITHUB = GH;
