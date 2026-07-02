/**
 * Trust402 · Sell — "reference model" section content (who / what / how
 * much). Sits on /trust402/sell/ between the hero and how-it-works.
 *
 * ALL figures (prices, monthly income, volumes, multiples) are
 * ILLUSTRATIVE examples — not real data. Kept here as a data array so
 * they're easy to swap later. Sellers set their own prices; 0% commission
 * (keep 100%) — no sale-fee framing anywhere in this copy.
 */
import type { Localized } from "./trust402";

export interface SellModel {
  readonly meta: { readonly title: Localized; readonly description: Localized };
  readonly entryCta: Localized;
  readonly backLink: Localized;
  readonly eyebrow: Localized;
  readonly h2: Localized;
  readonly sellsLabel: Localized;
  readonly incomeLabel: Localized;
  readonly per: Localized;
  readonly personas: ReadonlyArray<{
    readonly plan: "inst" | "pro";
    readonly planLabel: string;
    readonly name: string;
    readonly initials: string;
    readonly role: Localized;
    readonly sells: ReadonlyArray<{ readonly item: Localized; readonly price: string }>;
    readonly income: string;
    readonly vol: Localized;
  }>;
  readonly catalogH: Localized;
  readonly catalogSub: Localized;
  readonly catalog: ReadonlyArray<{
    readonly title: Localized;
    readonly hl: boolean;
    readonly tags: ReadonlyArray<Localized>;
  }>;
  readonly dashNote: Localized;
  readonly whyH: Localized;
  readonly why: ReadonlyArray<{ readonly num: string; readonly title: Localized; readonly text: Localized }>;
  readonly baH: Localized;
  readonly baExample: Localized;
  readonly beforeTag: Localized;
  readonly beforePrice: string;
  readonly mult: string;
  readonly afterTag: Localized;
  readonly afterPrice: string;
  readonly perItem: Localized;
  readonly chips: ReadonlyArray<{ readonly label: Localized; readonly key: boolean }>;
  readonly baNote: Localized;
  readonly ctaTry: Localized;
  readonly ctaPricing: Localized;
  readonly ctaStart: Localized;
}

export const T402_SELL_MODEL: SellModel = {
  meta: {
    title: {
      en: "Trust402 · Sell — reference model: who's selling, and for how much | Lemma",
      ja: "Trust402 · Sell — 参考モデル：誰が・何を・いくらで売れるか | Lemma",
    },
    description: {
      en: "Illustrative examples of who sells to AI agents through Trust402, what they list, and roughly what they earn — plus what else you can sell. Figures are examples; you set your own price, 0% commission.",
      ja: "Trust402 で AI エージェントに売る人の例 — 誰が・何を出品し、目安でいくら稼ぐか。ほかに出品できるものも。金額は例示で、価格は自分で設定、手数料 0%。",
    },
  },
  entryCta: { en: "See the reference model", ja: "参考モデルを見る" },
  backLink: { en: "← Trust402 · Sell", ja: "← Trust402 · Sell" },
  eyebrow: { en: "trust402 · sell", ja: "trust402 · sell" },
  h2: { en: "The kind of people already selling to AI agents.", ja: "こんな人が、AI エージェントに売れる。" },
  sellsLabel: { en: "what they sell", ja: "売るもの" },
  incomeLabel: { en: "monthly income", ja: "月の収入" },
  per: { en: "/mo", ja: "/月" },

  personas: [
    {
      plan: "inst",
      planLabel: "Institutional ID",
      name: "Dr. Aisha Rahman",
      initials: "AR",
      role: { en: "Researcher · university lab", ja: "研究者 · 大学ラボ" },
      sells: [
        { item: { en: "Consented measurement data", ja: "被験者同意済みの計測データ" }, price: "$0.50" },
        { item: { en: "Annotated corpora", ja: "注釈付きコーパス" }, price: "$0.40" },
      ],
      income: "$250",
      vol: { en: "approx. ~500 / mo", ja: "目安：月 ~500 件" },
    },
    {
      plan: "pro",
      planLabel: "Pro",
      name: "Marco Ferretti",
      initials: "MF",
      role: { en: "Independent researcher · data journalist", ja: "独立研究者 · データジャーナリスト" },
      sells: [
        { item: { en: "Verified primary datasets", ja: "検証済み一次データセット" }, price: "$0.20" },
        { item: { en: "Sourced analysis", ja: "出典付き分析" }, price: "$0.50" },
      ],
      income: "$180",
      vol: { en: "approx. ~450 / mo", ja: "目安：月 ~450 件" },
    },
    {
      plan: "pro",
      planLabel: "Pro",
      name: "Sofia Almeida",
      initials: "SA",
      role: { en: "Photographer · filmmaker", ja: "フォトグラファー · 映像作家" },
      sells: [
        { item: { en: "Original photography", ja: "オリジナル写真" }, price: "$0.20" },
        { item: { en: "Short video clips", ja: "ショート動画クリップ" }, price: "$0.80" },
        { item: { en: "Voice & narration snippets", ja: "声・語りのスニペット" }, price: "$0.30" },
      ],
      income: "$220",
      vol: { en: "approx. ~450 / mo", ja: "目安：月 ~450 件" },
    },
    {
      plan: "pro",
      planLabel: "Pro",
      name: "Liam O'Connor",
      initials: "LO",
      role: { en: "Content creator", ja: "コンテンツクリエイター" },
      sells: [
        { item: { en: "Everyday original photos", ja: "日常のオリジナル写真" }, price: "$0.15" },
        { item: { en: "Local knowledge & firsthand accounts", ja: "地域知識・一次体験" }, price: "$0.10" },
      ],
      income: "$80",
      vol: { en: "approx. ~600 / mo", ja: "目安：月 ~600 件" },
    },
  ],

  catalogH: { en: "More you can put up for sale.", ja: "ほかにも、こんなものが出品できる。" },
  catalogSub: { en: "Including items actually traded in the Bazaar.", ja: "Bazaar で実際に取引されている商品を含む。" },
  catalog: [
    {
      title: { en: "Research & data", ja: "研究・データ" },
      hl: true,
      tags: [
        { en: "Experiment & measurement data", ja: "実験・計測データ" },
        { en: "Sourced datasets", ja: "出典付きデータセット" },
        { en: "Annotated corpora", ja: "注釈付きコーパス" },
        { en: "Papers & preprints", ja: "論文・プレプリント" },
        { en: "Field observations & sensors", ja: "フィールド観測・センサー" },
      ],
    },
    {
      title: { en: "Images & video", ja: "画像・映像" },
      hl: true,
      tags: [
        { en: "Original photos", ja: "オリジナル写真" },
        { en: "Short video", ja: "ショート動画" },
        { en: "Timelapse & footage", ja: "タイムラプス・素材" },
        { en: "Illustration & design", ja: "イラスト・デザイン" },
      ],
    },
    {
      title: { en: "Audio", ja: "音声" },
      hl: true,
      tags: [
        { en: "Voice & narration", ja: "声・ナレーション" },
        { en: "Interviews", ja: "インタビュー" },
        { en: "Ambient & field recordings", ja: "環境音・フィールド録音" },
      ],
    },
    {
      title: { en: "Writing & knowledge", ja: "文章・知識" },
      hl: false,
      tags: [
        { en: "Firsthand accounts & reports", ja: "一次体験・レポート" },
        { en: "Local knowledge", ja: "地域知識" },
        { en: "Domain know-how", ja: "専門ノウハウ" },
        { en: "Reviews & evaluations", ja: "レビュー・評価" },
      ],
    },
    {
      title: { en: "Code & works", ja: "コード・作品" },
      hl: false,
      tags: [
        { en: "Scripts & tools", ja: "スクリプト・ツール" },
        { en: "Data transforms", ja: "データ変換" },
        { en: "Prompts & skills", ja: "プロンプト・スキル" },
      ],
    },
    {
      title: { en: "Other", ja: "その他" },
      hl: false,
      tags: [
        { en: "Translation & bitext", ja: "翻訳・対訳" },
        { en: "Classification & labeling", ja: "分類・ラベル付け" },
        { en: "Something no one's posted yet", ja: "まだ誰も出していないもの" },
      ],
    },
  ],
  dashNote: {
    en: "When you publish, the Dashboard suggests a reference price based on your content. You always set your own price.",
    ja: "出品時、ダッシュボードが内容に応じた参考価格を表示します。価格は自分で自由に設定できます。",
  },

  whyH: { en: "Why it sells for more.", ja: "なぜ、より高く売れるのか。" },
  why: [
    {
      num: "01",
      title: { en: "You can prove it's real", ja: "本物だと証明できる" },
      text: {
        en: "It carries \"whose, when, unaltered.\" AI prefers verified primary sources.",
        ja: "「誰の・いつの・改竄なし」が付く。AI は検証済みの一次ソースを優先して選ぶ。",
      },
    },
    {
      num: "02",
      title: { en: "No middleman", ja: "仲介を通さない" },
      text: {
        en: "You license it directly, as the original — no one skims your cut.",
        ja: "本人が、オリジナルのまま直接ライセンス。取り分を中抜きされない。",
      },
    },
    {
      num: "03",
      title: { en: "The real gets scarce", ja: "本物は希少になる" },
      text: {
        en: "As the web fills with generated content, verified human primary data and work grow more valuable.",
        ja: "ウェブが生成物で溢れるほど、検証済みの人間の一次データ・作品の価値が上がる。",
      },
    },
  ],

  baH: { en: "What changes with Trust402.", ja: "Trust402 で、どう変わるか。" },
  baExample: { en: "Example: one piece of your primary data", ja: "例：あなたの一次データ 1件" },
  beforeTag: { en: "Before — through a middleman", ja: "Before — 仲介（下請け）を通す" },
  beforePrice: "$0.05",
  mult: "≈ 10×",
  afterTag: { en: "After — direct, with Trust402", ja: "After — Trust402 で自分が直接" },
  afterPrice: "$0.50",
  perItem: { en: "/item", ja: "/件" },
  chips: [
    { label: { en: "Your own primary data", ja: "一次データを自分で" }, key: true },
    { label: { en: "Original license", ja: "オリジナルライセンス" }, key: true },
    { label: { en: "0% commission", ja: "手数料 0%" }, key: false },
    { label: { en: "Verification is free", ja: "検証は無料" }, key: false },
  ],
  baNote: {
    en: "Sellers set their own prices. Figures shown are illustrative; actual earnings vary with content and demand.",
    ja: "販売価格は出品者が自由に設定できます。表示の金額は目安で、実際の収入は内容や需要によって変わります。",
  },

  ctaTry: { en: "Try it free →", ja: "無料で試す →" },
  ctaPricing: { en: "See pricing", ja: "料金を見る" },
  ctaStart: { en: "See how to get started", ja: "始め方を見る" },
};
