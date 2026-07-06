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
  /** Metered rate per PROOF ISSUANCE (Builder always, Pro overage).
   *  Denominated in USDC — the actual settlement currency — so the JA
   *  page doesn't mix ¥ plan prices with $ metered rates. */
  unit: "0.005 USDC",
  pro: { ja: "¥2,980", en: "$19" },
  /** Proof issuances included in Pro per month. */
  proIncluded: "1,000",
  /** Institutional — monthly-equivalent headline (annual contract). */
  instMonthly: { ja: "¥100,000", en: "$667" },
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
  // Two headline chips only — the shared allowance and non-custody points
  // get their first, fuller mention in the "課金のしくみ" cells below (02/03),
  // so keeping them here too would just repeat.
  chips: [
    { text: { ja: "検証 無料", en: "verification free" }, key: true },
    { text: { ja: "販売手数料 0% — keep 100%", en: "0% commission — keep 100%" }, key: true },
  ],
  tiers: [
    {
      key: "explorer",
      name: "Explorer",
      pos: { ja: "まず試す — サンドボックス", en: "Try it first — sandbox" },
      price: { ja: "¥0", en: "$0" },
      meter: { ja: "testnet 無制限", en: "unlimited on testnet" },
      features: [
        { text: { ja: "testnet で証明発行・出品を練習", en: "Practice proof issuance & listing on testnet" } },
        { text: { ja: "フォームでも API でも", en: "By form or by API — both" } },
        { text: { ja: "本番の証明発行なし(コストゼロ)", en: "No production proof issuance (zero cost)" } },
      ],
      payment: { ja: "アカウントのみ (GitHub)", en: "account only (GitHub)" },
      state: { ja: "近日公開", en: "Coming soon" },
    },
    {
      key: "builder",
      name: "Builder",
      pos: { ja: "使った分だけ — 開発者・エージェント", en: "Pay as you go — developers & agents" },
      // Builder is metered, not monthly: lead with the per-proof rate (the
      // number that actually matters) and demote "月額 ¥0" to the meter, so
      // the free-to-start point doesn't visually drown out the unit price.
      price: { ja: T402_PRICE.unit, en: T402_PRICE.unit },
      priceUnit: { ja: "/ 証明1件", en: "/ proof" },
      meter: { ja: "月額 ¥0・最低額なし", en: "$0/mo · no minimum" },
      features: [
        { text: { ja: "本番。月額なし・最低額なし", en: "Production. No monthly fee, no minimum" } },
        { text: { ja: "証明の発行ごとに x402 決済 — 払わなければ発行されないだけ", en: "x402 settles each proof issued — unpaid simply isn't issued" } },
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
      // Flat, fair-use — no per-count promise on the card (counting would
      // need usage tracking we don't ship in Phase 1). The metered overage
      // for high-volume API issuance is spelled out in the footnote.
      meter: {
        ja: "定額で、出品し放題（フェアユース）",
        en: "Flat rate — publish freely (fair use)",
      },
      features: [
        { text: { ja: "定額で、出品し放題（フェアユース枠内）", en: "Publish freely, within fair use" } },
        { text: { ja: "真贋証明つきの来歴を、チェーンに永続", en: "Provenance with proof of authenticity, persisted on-chain" } },
        { text: { ja: "安定運用・優先サポート（SLA）", en: "Reliable operation & priority support (SLA)" } },
      ],
      payment: { ja: "x402 (USDC)", en: "x402 (USDC)" },
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
        ja: "年間契約 · アテステーション込み",
        en: "annual contract · attestation included",
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
    ja: `通常の出品はフェアユース枠内で、追加費用はありません。従量になるのは API 等での大量の自動発行のみ(証明 1 件につき ${T402_PRICE.unit}・発行ごとに x402 決済)。spend cap を設定すれば上限で自動停止します。価格は税別。`,
    en: `Normal publishing stays within fair use at no extra cost. Only high-volume automated issuance (e.g. via API) is metered — ${T402_PRICE.unit} per proof, settled per issuance via x402. Set a spend cap and it stops automatically at your ceiling. Prices exclude tax.`,
  },
};

/**
 * Pay-side developer plans (placeholder). Pay's authority-proof pricing is
 * absorbed into the Lemma API developer ladder, so the Pay hub shows plan
 * names + one-liners only — no prices, no Sell/creator framing. All cards
 * are pre-launch ("近日公開"); the sole retained pricing message is that
 * verification is always free. See Trust402_ページ改修スペック_20260706 §1.
 */
export interface DevPlanCard {
  readonly name: string;
  /** Optional qualifier shown next to the name, e.g. Scale (dashboard). */
  readonly tag?: Localized;
  readonly blurb: Localized;
}

export const T402_DEV_PLANS = {
  eyebrow: { ja: "pricing", en: "pricing" } as Localized,
  h2: { ja: "開発者向けプラン（近日公開）", en: "Developer plans (coming soon)" } as Localized,
  sub: {
    ja: "Pay（x402 権限証明）は Lemma API の開発者プランでご利用いただけます。",
    en: "Pay (x402 authority proofs) is available through the Lemma API developer plans.",
  } as Localized,
  /** The one pricing message carried over from the old tier table. */
  freeNote: { ja: "検証は、常に無料。", en: "Verification is always free." } as Localized,
  cards: [
    {
      name: "Builder",
      blurb: {
        ja: "使った分だけ（PAYG）。権限証明を発行ごとに x402 決済・月額なし。",
        en: "Pay as you go (PAYG). Authority proofs settle per issuance via x402 — no monthly fee.",
      },
    },
    {
      name: "Team",
      blurb: {
        ja: "定額＋発行 quota＋API 割引。開発者・チーム向け。",
        en: "Flat rate + issuance quota + API discounts. For developers and teams.",
      },
    },
    {
      name: "Scale",
      tag: { ja: "ダッシュボード", en: "dashboard" },
      blurb: {
        ja: "委譲レジストリ・失効管理・監査ダッシュボード・SLA を含む managed プラン。",
        en: "A managed plan with delegated registry, revocation management, an audit dashboard, and SLA.",
      },
    },
    {
      name: "Enterprise",
      blurb: {
        ja: "カスタム回路・オンプレ・規制対応（→ Lemma Critical / Compliance）。",
        en: "Custom circuits, on-prem, and regulatory compliance (→ Lemma Critical / Compliance).",
      },
    },
  ] as ReadonlyArray<DevPlanCard>,
  note: { ja: "価格は近日公開。", en: "Pricing coming soon." } as Localized,
  state: { ja: "近日公開", en: "Coming soon" } as Localized,
  cta: { ja: "ウェイトリストに登録 →", en: "Join the waitlist →" } as Localized,
  ctaHref: "https://tally.so/r/kd0bZR",
} as const;
