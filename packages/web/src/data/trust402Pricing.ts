/**
 * Trust402 pricing — the single source for the pricing sections on the
 * Pay hub (/trust402/ + /ja/trust402/) and the Sell page. Content spec:
 * trust402_pricing_mock_final (2026-07-03, rough mock — tokens/components
 * follow the live .t402/.t402b design system, not the mock pixels).
 *
 * PRICES / QUOTAS / UNIT RATES live in T402_PRICE below, so a repricing is
 * a one-object change. The USD figures are working conversions of the JPY
 * list prices — swap them the same way once official USD pricing lands.
 *
 * Display-only: the billing flow itself (x402 middleware, spend caps,
 * usage notifications) is out of scope here (separate issue).
 *
 * Shared-copy guardrails:
 *  - Verification is ALWAYS free — you pay to issue proofs and settle,
 *    never to be trusted.
 *  - 0% commission, keep 100%. Never imply a share of sales.
 *  - Pay and Sell share ONE issuance allowance; no plan is side-specific.
 *  - Non-custodial: sales (USDC) go buyer-agent → seller wallet, directly.
 *  - Payment rails: Builder/Pro = x402 (USDC), Pro notes card support as
 *    coming; Institutional = invoice (bank transfer). No Stripe mentions.
 */
import { DISCOVERY_CALL_URL } from "../config/cta";
import type { Localized } from "./trust402";

/** All swappable numbers in one place. */
export const T402_PRICE = {
  /** Metered per-issuance rate (Builder always, Pro overage). */
  unit: "$0.005",
  pro: { ja: "¥2,980", en: "$19" },
  /** Issuances included in Pro per month. */
  proIncluded: "1,000",
  /** Institutional — monthly-equivalent headline + annual-contract total. */
  instMonthly: { ja: "¥100,000", en: "$667" },
  instYearly: { ja: "¥1,200,000", en: "$8,000" },
} as const;

export interface PricingTier {
  readonly key: "explorer" | "builder" | "pro" | "institutional";
  readonly name: string;
  readonly pos: Localized;
  readonly price: Localized;
  readonly priceUnit?: Localized;
  /** Mono meter line under the price (allowance / rate / contract). */
  readonly meter: Localized;
  readonly features: ReadonlyArray<{ readonly text: Localized; readonly soon?: boolean }>;
  /** Payment-rail line at the card foot. */
  readonly payment: Localized;
  /** "Coming soon" state line (plans are pre-launch; no dead CTA buttons). */
  readonly state?: Localized;
  /** Consultative contact link instead of a state line (Institutional). */
  readonly contact?: { readonly label: Localized; readonly hrefJa: string; readonly hrefEn: string };
  readonly featured?: boolean;
  /** Dark (ink) card variant. */
  readonly dark?: boolean;
}

export interface Trust402Pricing {
  readonly h2: Localized;
  readonly sub: Localized;
  readonly chips: ReadonlyArray<{ readonly text: Localized; readonly key?: boolean }>;
  readonly tiers: ReadonlyArray<PricingTier>;
  readonly billingH: Localized;
  readonly billing: ReadonlyArray<{ readonly num: string; readonly title: Localized; readonly text: Localized }>;
  readonly footnote: Localized;
}

export const T402_PRICING: Trust402Pricing = {
  h2: {
    ja: "検証は、常に無料。支払うのは、証明の発行と決済のため。",
    en: "Verification is always free. You pay to issue proofs and settle.",
  },
  sub: {
    ja: "信頼されること自体には課金しません。Pay と Sell は一つの発行枠を共有 — どのプランでも両方使えます。",
    en: "Being trusted costs nothing. Pay and Sell share one issuance allowance — every plan covers both.",
  },
  chips: [
    { text: { ja: "検証 無料", en: "verification free" }, key: true },
    { text: { ja: "販売手数料 0% — keep 100%", en: "0% commission — keep 100%" }, key: true },
    { text: { ja: "Pay / Sell 共有発行枠", en: "one allowance across Pay / Sell" } },
    { text: { ja: "ノンカストディ — 売上は自分のウォレットへ直接", en: "non-custodial — sales go straight to your wallet" } },
  ],
  tiers: [
    {
      key: "explorer",
      name: "Explorer",
      pos: { ja: "まず試す — サンドボックス", en: "Try it first — sandbox" },
      price: { ja: "¥0", en: "$0" },
      meter: { ja: "testnet 無制限", en: "unlimited on testnet" },
      features: [
        { text: { ja: "testnet で発行・出品を練習", en: "Practice issuing & listing on testnet" } },
        { text: { ja: "フォームでも API でも", en: "By form or by API — both" } },
        { text: { ja: "本番発行なし(コストゼロ)", en: "No production issuance (zero cost)" } },
      ],
      payment: { ja: "アカウントのみ (GitHub)", en: "account only (GitHub)" },
      state: { ja: "近日公開", en: "Coming soon" },
    },
    {
      key: "builder",
      name: "Builder",
      pos: { ja: "使った分だけ — 開発者・エージェント", en: "Pay as you go — developers & agents" },
      price: { ja: "¥0", en: "$0" },
      priceUnit: { ja: "/月", en: "/mo" },
      meter: { ja: `${T402_PRICE.unit} / 発行(都度 x402)`, en: `${T402_PRICE.unit} / issuance (per-call x402)` },
      features: [
        { text: { ja: "本番。月額なし・最低額なし", en: "Production. No monthly fee, no minimum" } },
        { text: { ja: "1コール目から都度決済 — 払わなければ実行されないだけ", en: "Per-call settlement from call one — unpaid simply doesn't run" } },
        { text: { ja: "API キー1本目 無料", en: "First API key free" } },
        { text: { ja: "spend cap(月次上限)設定可", en: "Spend cap (monthly ceiling) available" } },
      ],
      payment: { ja: "x402 (USDC)", en: "x402 (USDC)" },
      state: { ja: "近日公開", en: "Coming soon" },
    },
    {
      key: "pro",
      name: "Pro",
      featured: true,
      pos: { ja: "継続して出品 — 研究者・クリエイター", en: "Publish regularly — researchers & creators" },
      price: { ja: T402_PRICE.pro.ja, en: T402_PRICE.pro.en },
      priceUnit: { ja: "/月", en: "/mo" },
      meter: {
        ja: `同梱 ${T402_PRICE.proIncluded} 発行/月 · 超過 ${T402_PRICE.unit}`,
        en: `includes ${T402_PRICE.proIncluded} issuances/mo · overage ${T402_PRICE.unit}`,
      },
      features: [
        { text: { ja: "都度払いが消える — 月額内で出品し放題*", en: "Per-call payments disappear — publish freely within the plan*" } },
        { text: { ja: "真贋証明つきの来歴を、チェーンに永続", en: "Provenance with proof of authenticity, persisted on-chain" } },
        { text: { ja: "フォーム＋API", en: "Form + API" } },
        { text: { ja: "枠 80% / 100% で通知 · spend cap", en: "Alerts at 80% / 100% of allowance · spend cap" } },
      ],
      payment: { ja: "x402 (USDC) — カード対応 準備中", en: "x402 (USDC) — card support in preparation" },
      state: { ja: "近日公開", en: "Coming soon" },
    },
    {
      key: "institutional",
      name: "Institutional ID",
      dark: true,
      pos: { ja: "機関の正規主張 — 大学・研究・医療", en: "Official institutional claims — universities, research, healthcare" },
      price: { ja: T402_PRICE.instMonthly.ja, en: T402_PRICE.instMonthly.en },
      priceUnit: { ja: "/月", en: "/mo" },
      meter: {
        ja: `年間契約(${T402_PRICE.instYearly.ja}/年) · アテステーション込み`,
        en: `annual contract (${T402_PRICE.instYearly.en}/yr) · attestation included`,
      },
      features: [
        { text: { ja: "機関確認(登記＋ドメイン)＋属性アテステーション", en: "Institution verification (registry + domain) + attribute attestation" } },
        { text: { ja: "メンバーは無料で出品 — 機関が名簿で保証", en: "Members publish free — vouched by the institution's roster" } },
        { text: { ja: "一括登録(CSV / API)・失効管理", en: "Bulk enrollment (CSV / API) & revocation management" } },
        { text: { ja: "在籍・帰属の照会サービス(提供予定)", en: "Affiliation-lookup service (planned)" }, soon: true },
      ],
      payment: { ja: "請求書払い(銀行振込)", en: "invoice billing (bank transfer)" },
      contact: {
        label: { ja: "相談する →", en: "Talk to us →" },
        hrefJa: `${DISCOVERY_CALL_URL.ja}?plan=institutional`,
        hrefEn: `${DISCOVERY_CALL_URL.en}?plan=institutional`,
      },
    },
  ],
  billingH: { ja: "課金のしくみ", en: "How billing works" },
  billing: [
    {
      num: "01",
      title: { ja: "発行に課金、検証は無料", en: "Issuance is billed, verification is free" },
      text: {
        ja: "証明を「作る」ときだけ課金。誰かがあなたの証明を「確かめる」のは、いつでも・どこでも・無料。",
        en: "You pay only when a proof is created. Anyone checking your proof pays nothing — anywhere, anytime.",
      },
    },
    {
      num: "02",
      title: { ja: "Pay も Sell も、一つの枠", en: "Pay and Sell share one allowance" },
      text: {
        ja: "支払いの権限証明も、出品の来歴発行も、同じ発行枠を消費。プランは器の大きさだけ — どのプランでも両方使えます。",
        en: "Authority proofs for payments and provenance for listings draw from the same allowance. Plans differ only in size — every plan covers both.",
      },
    },
    {
      num: "03",
      title: { ja: "売上は、直接あなたへ", en: "Sales go straight to you" },
      text: {
        ja: "エージェントの支払い(USDC)は、あなたのウォレットに直接届きます。手数料 0%。Lemma は資金に触れません。",
        en: "Agent payments (USDC) land directly in your wallet. 0% commission. Lemma never touches the funds.",
      },
    },
  ],
  footnote: {
    ja: `* 同梱 ${T402_PRICE.proIncluded} 発行は、フォームでの通常出品(月数百件)を余裕で覆う設計です。超過は API 等での大量発行時のみ、1 発行 ${T402_PRICE.unit}(都度 x402)。spend cap を設定すれば上限で自動停止します。価格は税別。`,
    en: `* The included ${T402_PRICE.proIncluded} issuances comfortably cover normal form-based publishing (a few hundred listings a month); overage applies only to high-volume API issuance, at ${T402_PRICE.unit} per issuance (per-call x402). Set a spend cap and it stops automatically at your ceiling. Prices exclude tax.`,
  },
};
