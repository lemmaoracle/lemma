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
  | "ic-github";

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
      readonly lede: Localized;
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
    };
    readonly control: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly sub: Localized;
      readonly yesTitle: Localized;
      readonly yes: ReadonlyArray<Localized>;
      readonly noTitle: Localized;
      readonly no: ReadonlyArray<Localized>;
    };
    readonly whyProof: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly sub: Localized;
      readonly sloganA: Localized;
      readonly sloganEm: Localized;
      readonly note: Localized;
      readonly noteEm: Localized;
    };
    readonly institutional: {
      readonly eyebrow: Localized;
      readonly h2a: Localized;
      readonly h2em: Localized;
      readonly sub: Localized;
      readonly cards: ReadonlyArray<Card>;
    };
    readonly underHood: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly sub: Localized;
      readonly d1Summary: Localized;
      readonly primitives: ReadonlyArray<{ readonly label: Localized; readonly sub: Localized; readonly tech?: string }>;
      readonly d2Summary: Localized;
      readonly d2Body: Localized;
    };
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
    };
    readonly form: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly sub: Localized;
      readonly ribbon: Localized;
      readonly previewTag: Localized;
      readonly ribbonNote: Localized;
      readonly fileLabel: Localized;
      readonly fileHint: Localized;
      readonly titleLabel: Localized;
      readonly titleValue: Localized;
      readonly versionLabel: Localized;
      readonly priceLabel: Localized;
      readonly asLabel: Localized;
      readonly asYou: Localized;
      readonly asInst: Localized;
      readonly submit: Localized;
      readonly note: Localized;
      readonly previewLabel: Localized;
      readonly cardNote: Localized;
      readonly signedBadge: Localized;
      readonly priceInit: Localized;
      readonly unit: Localized;
      readonly untitled: Localized;
      readonly asYouShort: Localized;
      readonly asInstShort: Localized;
    };
    readonly listings: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly sub: Localized;
      readonly sumUses: Localized;
      readonly sumEarned: Localized;
      readonly sumListings: Localized;
      readonly colListing: Localized;
      readonly colStatus: Localized;
      readonly colPrice: Localized;
      readonly colUses: Localized;
      readonly colEarned: Localized;
      readonly note: Localized;
      readonly statusLive: Localized;
      readonly statusSandbox: Localized;
      readonly statusTestnet: Localized;
      readonly dashLink: Localized;
      readonly rows: ReadonlyArray<{
        readonly title: Localized;
        readonly file: string;
        readonly status: "live" | "sandbox";
        readonly price: string;
        readonly uses: string;
        readonly earned: Localized;
      }>;
    };
    readonly twoSides: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly sub: Localized;
      readonly payTag: Localized;
      readonly payH3: Localized;
      readonly payBody: Localized;
      readonly sellTag: Localized;
      readonly sellH3: Localized;
      readonly sellBody: Localized;
      readonly link: Localized;
    };
    readonly pricing: {
      readonly eyebrow: Localized;
      readonly h2: Localized;
      readonly sub: Localized;
      readonly tiers: ReadonlyArray<Tier>;
      readonly note: Localized;
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
      readonly ctaWaitlist: Localized;
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
      ja: "データセットや論文、ファイルを、AI エージェントが検証して購入できる資源に。あなた由来である証明つきで、USDC が直接あなたのウォレットに届く。サーバーもコードも不要、手数料 0%。",
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
      h1a: { en: "Your research, your work.", ja: "その研究も、作品も。" },
      h1em: { en: "Sell it to AI agents.", ja: "AI エージェントに売れる。" },
      sub: {
        en: "Turn your data or papers into something AI agents can buy — with proof it's yours and unaltered. No code, no server; you're paid directly in USDC to your own wallet.",
        ja: "あなたのデータや論文を、AI エージェントが買える形に。「本人が作った」「改ざんなし」の証明つきで、コードもサーバーも不要 — 売上は USDC で直接あなたのウォレットに届きます。",
      },
      ctaPrimary: { en: "Try it free", ja: "無料で試す" },
      ctaSecondary: { en: "See what sells", ja: "何が売れるか見る" },
      lede: {
        en: "Free to start · no code · 0% commission",
        ja: "無料で開始 · ノーコード · 手数料0%",
      },
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
      stepLink: { en: "See the form ↓", ja: "フォームを見る ↓" },
      caption: {
        en: "Checking your proof is always free. You get paid for the data — not for being trusted.",
        ja: "証明の検証は常に無料。報酬は成果に対して支払われます — 信頼されること自体には課金しません。",
      },
    },

    whatSell: {
      eyebrow: { en: "what you can sell", ja: "売れるもの" },
      h2: { en: "If you made it, an agent can cite it.", ja: "あなたが作ったなら、エージェントは引用できる。" },
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
    },

    control: {
      eyebrow: { en: "no strings attached", ja: "縛りなし" },
      h2: { en: "You stay in control.", ja: "主導権はあなたに。" },
      sub: { en: "Selling through Lemma doesn't take anything away from you.", ja: "Lemma で売っても、あなたから何かを奪うことはありません。" },
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

    whyProof: {
      eyebrow: { en: "why proof matters", ja: "なぜ証明が要るのか" },
      h2: { en: "The web fills with copies. Only one is really yours.", ja: "ネットは、コピーで埋まっていく。本物は、あなたのだけ。" },
      sub: {
        en: "Scraped versions and AI-made imitations sit right next to your original. Without proof, an agent can't tell which one is really yours — so it might pay someone else, or trust a fake.",
        ja: "スクレイピングされた版や AI が作った模倣が、あなたの本物のすぐ隣に並びます。証明がなければ、エージェントはどれが本当にあなたのものか区別できず — 別人に支払ったり、偽物を信頼したりしかねません。",
      },
      sloganA: { en: "A copy can look identical.", ja: "コピーは見た目がまったく同じでも、" },
      sloganEm: { en: "Only yours can prove it.", ja: "証明できるのはあなたのものだけ。" },
      note: { en: "The technical way to say it: ", ja: "技術的に言えば: " },
      noteEm: { en: "Signed is the only real.", ja: "署名されたものだけが本物。" },
    },

    institutional: {
      eyebrow: { en: "institutional id · shared with pay", ja: "institutional id · pay と共通" },
      h2a: { en: "At a university or lab?", ja: "大学や研究室に所属?" },
      h2em: { en: "You're already covered.", ja: "すでに対象です。" },
      sub: {
        en: "The Institutional ID plan lets an organization register once — then everyone under it publishes under that umbrella. It's the same plan on the Pay side.",
        ja: "Institutional ID プランなら、組織が一度登録すれば — 傘下の全員がその名義で出品できます。Pay 側と同じプランです。",
      },
      cards: [
        {
          icon: "ic-network",
          title: { en: "Your institution registers once", ja: "組織が一度だけ登録" },
          body: { en: "A university or lab signs up as an institution. After that, its members can publish.", ja: "大学や研究室が組織として登録。あとはメンバーが出品できます。" },
        },
        {
          icon: "ic-signed",
          title: { en: "You publish under the umbrella", ja: "その名義で出品" },
          body: { en: "No separate plan or cost for you — just point to your file and set a price.", ja: "個別のプランや費用は不要 — ファイルを指定して価格を決めるだけ。" },
        },
        {
          icon: "ic-robot",
          title: { en: "Credit follows you", ja: "クレジットはあなたに" },
          body: { en: "Everything is attributed to you by name. Move on, and your proofs still check out.", ja: "すべてあなたの名前に帰属します。所属が変わっても、証明は有効なまま。" },
        },
      ],
    },

    underHood: {
      eyebrow: { en: "for the curious", ja: "詳しく知りたい人へ" },
      h2: { en: "How the proof actually works.", ja: "証明の実際の仕組み。" },
      sub: {
        en: "You never have to touch any of this — but if you like knowing what's under the hood, here it is.",
        ja: "触れる必要は一切ありません — でも中身を知りたい人のために、ここに置いておきます。",
      },
      d1Summary: { en: "The three things we attach to your file", ja: "ファイルに添える 3 つのもの" },
      primitives: [
        {
          label: { en: "who made it", ja: "誰が作ったか" },
          sub: { en: "A signature proving you're the publisher — you can reveal only the parts you want.", ja: "あなたが発行者だと示す署名 — 開示する部分は選べます。" },
          tech: "BBS+ over BLS12-381",
        },
        {
          label: { en: "not changed", ja: "改ざんされていない" },
          sub: { en: "A fingerprint that breaks if even one byte is altered.", ja: "1 バイトでも変わると壊れる指紋。" },
          tech: "Poseidon over BN254",
        },
        {
          label: { en: "which version", ja: "どのバージョンか" },
          sub: { en: "So an agent always knows it's citing the exact version you meant.", ja: "エージェントが、あなたの意図した版を正確に引用できるように。" },
        },
      ],
      d2Summary: { en: "How agents find and pay for it", ja: "エージェントが発見して支払う仕組み" },
      d2Body: {
        en: "Your listing is discoverable in the x402 Bazaar — a shared directory agents browse. It's added automatically the first time someone buys. Payment happens over the open x402 standard in USDC. You never run an x402 server; the standard template handles it for you.",
        ja: "あなたの出品は x402 Bazaar — エージェントが見て回る共有ディレクトリ — から発見できます。誰かが最初に購入した時点で自動的に追加されます。支払いはオープンな x402 標準で USDC で行われます。x402 サーバーを動かす必要はなく、標準テンプレートが処理します。",
      },
    },

    hands: {
      eyebrow: { en: "hands-on", ja: "実際にやること" },
      h2: { en: "What you actually do: fill one short form.", ja: "やることは、短いフォームを 1 つ埋めるだけ。" },
      sub: {
        en: "No dashboard to wire up, no code — and you can rehearse the whole thing for free before anything goes live.",
        ja: "ダッシュボードの設定もコードも不要 — 本番前に、全体を無料で予行演習できます。",
      },
      sandboxTitle: { en: "① try it in the sandbox", ja: "① サンドボックスで試す" },
      sandboxBody: {
        en: "Fill one short form — point to a file, set a test price. It runs on a test network, so no real money moves. Break things, retry, get comfortable. Students start here.",
        ja: "短いフォームを 1 つ埋める — ファイルを指定し、テスト価格を設定。テストネット上で動くので、実際のお金は動きません。壊して、やり直して、慣れる。学生はここから。",
      },
      sandboxChip: { en: "no real money · testnet", ja: "実マネーなし · テストネット" },
      prodTitle: { en: "② go live in production", ja: "② 本番に出す" },
      prodBody: {
        en: "The exact same form — now it's real. Agents can discover your listing, verify it for free, and pay you. Nothing new to learn.",
        ja: "まったく同じフォーム — 今度は本番。エージェントが出品を見つけ、無料で検証し、支払います。新しく学ぶことはありません。",
      },
      prodChip: { en: "same steps · real payouts", ja: "同じ手順 · 実際の入金" },
    },

    form: {
      eyebrow: { en: "the form · preview", ja: "フォーム · プレビュー" },
      h2: { en: "This is the whole form.", ja: "これがフォームのすべて。" },
      sub: {
        en: "A live preview — play with it here, nothing gets published. The real form lives in your Dashboard. Five fields: fill them in and your listing takes shape on the right, exactly what an agent sees.",
        ja: "ライブプレビューです — ここで触っても何も公開されません。本物のフォームはダッシュボードにあります。5 項目を埋めると、右側にあなたの出品が形になります — エージェントが見るものそのままです。",
      },
      ribbon: { en: "publish a listing", ja: "出品を公開" },
      previewTag: { en: "preview", ja: "preview" },
      ribbonNote: { en: "nothing is saved here", ja: "ここでは何も保存されません" },
      fileLabel: { en: "your file", ja: "ファイル" },
      fileHint: { en: "drop a file, or point to a URL you already host", ja: "ファイルをドロップ、または既存の URL を指定" },
      titleLabel: { en: "title", ja: "タイトル" },
      titleValue: { en: "Labeled image set — 2026", ja: "ラベル付き画像セット — 2026" },
      versionLabel: { en: "version", ja: "バージョン" },
      priceLabel: { en: "price per use", ja: "1 回あたりの価格" },
      asLabel: { en: "publish as", ja: "発行者" },
      asYou: { en: "You (individual)", ja: "あなた(個人)" },
      asInst: { en: "Under your institution", ja: "所属組織の名義で" },
      submit: { en: "Publish in the Dashboard", ja: "ダッシュボードで公開" },
      note: { en: "no real money · testnet", ja: "実マネーなし · テストネット" },
      previewLabel: { en: "what the agent sees ↓", ja: "エージェントが見るもの ↓" },
      cardNote: {
        en: "This card is your listing. Agents verify the proof for free, then pay to get the file.",
        ja: "このカードがあなたの出品です。エージェントは証明を無料で検証し、支払ってファイルを受け取ります。",
      },
      signedBadge: { en: "signed", ja: "署名済み" },
      priceInit: { en: "0.05 USDC / use", ja: "0.05 USDC / 回" },
      unit: { en: " USDC / use", ja: " USDC / 回" },
      untitled: { en: "untitled", ja: "無題" },
      asYouShort: { en: "you ✓", ja: "あなた ✓" },
      asInstShort: { en: "you · under your institution ✓", ja: "あなた・組織の名義 ✓" },
    },

    listings: {
      eyebrow: { en: "your listings", ja: "あなたの出品" },
      h2: { en: "After you publish, track it here.", ja: "公開したら、ここで追える。" },
      sub: {
        en: "Everything you've put up lives in one place — whether it's live or still a sandbox test, how many times it's been used, and what it's earned.",
        ja: "出したものがすべて一か所に — 本番かサンドボックスか、何回使われ、いくら稼いだか。",
      },
      sumListings: { en: "active listings", ja: "有効な出品" },
      sumUses: { en: "total uses", ja: "総利用回数" },
      sumEarned: { en: "earned", ja: "獲得額" },
      colListing: { en: "listing", ja: "出品" },
      colStatus: { en: "status", ja: "状態" },
      colPrice: { en: "price", ja: "価格" },
      colUses: { en: "uses", ja: "利用" },
      colEarned: { en: "earned", ja: "獲得" },
      note: {
        en: "Sandbox listings run on a test network — the numbers are there so you can watch the whole loop before going live.",
        ja: "サンドボックスの出品はテストネット上 — 本番前に全体の流れを見られるよう、数値も表示しています。",
      },
      statusLive: { en: "live", ja: "公開中" },
      statusSandbox: { en: "sandbox", ja: "お試し" },
      statusTestnet: { en: "testnet", ja: "テストネット" },
      dashLink: { en: "Open the Dashboard", ja: "ダッシュボードを開く" },
      rows: [
        {
          title: { en: "Labeled image set — 2026", ja: "ラベル付き画像セット — 2026" },
          file: "my-dataset.csv",
          status: "live",
          price: "0.05 USDC",
          uses: "840",
          earned: { en: "42.00 USDC", ja: "42.00 USDC" },
        },
        {
          title: { en: "Cleaned JA text corpus", ja: "整形済み日本語コーパス" },
          file: "corpus-ja.jsonl",
          status: "live",
          price: "0.03 USDC",
          uses: "400",
          earned: { en: "12.00 USDC", ja: "12.00 USDC" },
        },
        {
          title: { en: "Benchmark results · Q2", ja: "ベンチマーク結果 · Q2" },
          file: "bench-q2.csv",
          status: "sandbox",
          price: "0.10 USDC",
          uses: "—",
          earned: { en: "testnet", ja: "テストネット" },
        },
      ],
    },

    twoSides: {
      eyebrow: { en: "part of trust402", ja: "trust402 の一部" },
      h2: { en: "Two sides, one idea.", ja: "2 つの側面、1 つの考え。" },
      sub: {
        en: "Trust402 attaches proof to the moment money moves — whichever side you're on. One plan and one monthly allowance cover both.",
        ja: "Trust402 は、お金が動く瞬間に証明を添えます — どちら側でも。1 つのプラン、1 つの月間枠が両方をカバーします。",
      },
      payTag: { en: "trust402 · pay", ja: "trust402 · pay" },
      payH3: { en: "When you pay", ja: "支払うとき" },
      payBody: {
        en: "Prove an agent is allowed to spend — who, by what authority, up to how much.",
        ja: "エージェントに支払い権限があると証明 — 誰が、どの権限で、いくらまで。",
      },
      sellTag: { en: "trust402 · sell", ja: "trust402 · sell" },
      sellH3: { en: "When you sell", ja: "売るとき" },
      sellBody: {
        en: "Prove what you publish is authentic, unchanged, and yours. You're here.",
        ja: "公開するものが本物で、改ざんされておらず、あなたのものだと証明。いまここ。",
      },
      link: { en: "See Trust402 · Pay", ja: "Trust402 · Pay を見る" },
    },

    pricing: {
      eyebrow: { en: "pricing · shared with pay", ja: "料金 · pay と共通" },
      h2: { en: "Free while you learn. Pay only when you really sell.", ja: "学ぶ間は無料。本当に売るときだけ支払う。" },
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
          pos: { en: "Production · for individuals selling on their own.", ja: "本番 · 個人で売る人向け。" },
          price: { en: "$19", ja: "$19" },
          priceSub: { en: "/mo · 0% commission on sales", ja: "/月 · 販売手数料 0%" },
          means: { en: "Everything in Explorer, live. Optional API for developers.", ja: "Explorer の全機能を本番で。開発者向け API はオプション。" },
          state: { en: "Coming soon", ja: "近日公開" },
        },
        {
          name: "Institutional ID",
          pos: { en: "For universities, labs & organizations.", ja: "大学・研究室・組織向け。" },
          price: { en: "¥50k", ja: "¥50k" },
          priceSub: { en: "/mo + attestation", ja: "/月 + アテステーション" },
          means: { en: "Register once; members & students publish under the umbrella, free to them.", ja: "一度登録すれば、メンバーや学生がその名義で出品 — 本人は無料。" },
          state: { en: "Coming soon", ja: "近日公開" },
        },
      ],
      note: {
        en: "0% commission on sales — you keep 100% of every sale, paid directly in USDC to your own wallet (self-custody; we never hold your funds). Your monthly plan covers producing proofs; checking them is always free. Students & lab members publish free under their institution's plan.",
        ja: "販売手数料 0% — 売上の 100% があなたのもので、USDC が直接あなたのウォレットに届きます(セルフカストディ。資金は預かりません)。月額プランは証明の生成をカバーし、検証は常に無料。学生や研究室メンバーは組織のプランで無料で出品できます。",
      },
    },

    faq: {
      eyebrow: { en: "questions students ask", ja: "学生からよくある質問" },
      h2: { en: "Good things to check.", ja: "確認しておきたいこと。" },
      items: [
        {
          q: { en: "Are Pay and Sell separate plans?", ja: "Pay と Sell は別プラン?" },
          a: {
            en: "No — it's one set of plans. Explorer, Pro, and Institutional ID each cover both Pay and Sell, with a single monthly allowance shared across the two. Checking proofs is always free on either side.",
            ja: "いいえ — プランは 1 セットです。Explorer・Pro・Institutional ID はいずれも Pay と Sell の両方をカバーし、月間枠は両者で共有されます。証明の検証はどちら側でも常に無料です。",
          },
        },
        {
          q: { en: "I've never done this — where do I start?", ja: "やったことがない — どこから始める?" },
          a: {
            en: "In the free sandbox. Fill one short form on a test network, watch the whole flow happen, and pay nothing. When it clicks, going live is the same form.",
            ja: "無料のサンドボックスから。テストネットで短いフォームを 1 つ埋め、流れ全体を見る — 費用はゼロ。感覚が掴めたら、本番も同じフォームです。",
          },
        },
        {
          q: { en: "Do I need to know anything about crypto or blockchain?", ja: "暗号資産やブロックチェーンの知識は要る?" },
          a: {
            en: "You receive USDC — a digital dollar — to your own wallet, so you set one up once (a 2-minute step if you don't have one). We handle all the proof and payment plumbing behind the scenes.",
            ja: "USDC — デジタルのドル — を自分のウォレットで受け取るので、ウォレットを一度用意します(なければ 2 分ほど)。証明や支払いまわりは、すべて裏側で私たちが処理します。",
          },
        },
        {
          q: { en: "How do I actually get paid?", ja: "実際どうやって支払われる?" },
          a: {
            en: "In USDC, a digital dollar, straight to your own wallet — self-custody, we never hold your funds. When an agent buys your work, the payment settles automatically and shows up in your wallet, no invoicing.",
            ja: "デジタルのドル USDC で、直接あなたのウォレットに — セルフカストディで、資金は預かりません。エージェントが購入すると自動で決済され、請求書なしでウォレットに届きます。",
          },
        },
        {
          q: { en: "Do I have to give away my data to prove it's mine?", ja: "自分のものだと示すためにデータを渡す必要は?" },
          a: {
            en: "No. Agents check a proof, not the raw file. Your data stays with you until someone actually pays for it.",
            ja: "いいえ。エージェントが確認するのは証明で、生ファイルではありません。誰かが実際に支払うまで、データはあなたの手元に残ります。",
          },
        },
        {
          q: { en: "Can I still use or sell my work somewhere else?", ja: "他の場所でも使える・売れる?" },
          a: {
            en: "Yes. It's yours. Selling through Lemma doesn't lock you in or take exclusive rights.",
            ja: "はい。あなたのものです。Lemma で売っても囲い込みや独占権はありません。",
          },
        },
        {
          q: { en: "I'm a student — where do I start, and is there a cost?", ja: "学生です — どこから始める? 費用は?" },
          a: {
            en: "Start free in the sandbox to try it with no real money. When you're ready to go live, publish free under your school's institutional plan — still credited to you by name.",
            ja: "まずサンドボックスで無料で試す(実マネー不要)。本番の準備ができたら、学校の Institutional プランで無料で公開 — クレジットはあなたの名前のまま。",
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
      ctaWaitlist: { en: "Join the waitlist", ja: "ウェイトリストに登録" },
      github: { en: "GitHub", ja: "GitHub" },
    },
  },
};

export const T402_GITHUB = GH;
