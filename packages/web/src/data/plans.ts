/**
 * Plan-page content for Lemma Civic / Critical / Compliance, both locales.
 * Consumed by templates/PlanTemplate.astro via getPlanContent(planKey, locale).
 *
 * Structure-shared strings (section labels, the bridge line, the steps, the
 * tier ranges, the closing CTA) live in COMMON[locale]; only the per-plan,
 * per-locale copy lives in UNIQUE. getPlanContent() composes the two into the
 * exact shape PlanTemplate renders.
 *
 * Permission gate (pre-permission): §6 is an "illustrative scenario", never a
 * case study; no MizuDAkO / client-identifying context anywhere here.
 *
 * NOTE: Civic copy is the confirmed Wave 1 spec. Critical & Compliance copy is
 * AUTHORED to mirror Civic (only one-line taglines were specified) and is
 * pending review.
 */
import type { Locale } from "../i18n/translations";

export type PlanKey = "civic" | "critical" | "compliance";

interface DoItem {
  h: string;
  p: string;
}
interface Step {
  n: string;
  h: string;
  lead: string;
  p: string;
}
export interface PlanContent {
  meta: { title: string; desc: string };
  hero: {
    badgeTag: string;
    name: string;
    seg: string;
    h1a: string;
    h1b: string;
    lead: string;
    ctaLabel: string;
    ctaNote: string;
  };
  doSec: { label: string; h: string; items: DoItem[] };
  bridge: { quote: string; body: string };
  flow: { label: string; h: string; items: Step[] };
  tiers: {
    label: string;
    h: string;
    body: string;
    items: { name: string; range: string }[];
    note: string;
  };
  caseSec: { label: string; h: string; body: string };
  steps: { label: string; h: string; items: Step[] };
  uc: { label: string; h: string; items: string[]; all: string };
  close: { h: string; sub: string };
}

interface Common {
  badgeTag: string;
  ctaLabel: string;
  ctaNote: string;
  doLabel: string;
  doH: string;
  bridge: { quote: string; body: string };
  flowLabel: string;
  flowH: string;
  tiersLabel: string;
  tiersH: string;
  tiersItems: { name: string; range: string }[];
  tiersNote: string;
  caseLabel: string;
  stepsLabel: string;
  stepsH: string;
  steps: Step[];
  ucLabel: string;
  ucH: string;
  ucAll: string;
  close: { h: string; sub: string };
}

const COMMON: Record<Locale, Common> = {
  ja: {
    badgeTag: "プラン",
    ctaLabel: "問い合わせる",
    ctaNote: "導入のご相談・お見積もり・ご検討から。",
    doLabel: "このプランでできること",
    doH: "中身を見せずに、確かさだけを渡す。",
    bridge: {
      quote: "持たないから、流出しない。任せても、証拠は残る。",
      body: "Lemma が現場と AI の間に入り、中身は渡さずに「確かさ」だけを受け渡します。むずかしい処理は引き受けるので、いつもの業務のまま、安心して任せられます。",
    },
    flowLabel: "運用イメージ（いつもの業務のまま）",
    flowH: "新しい操作は、増えません。",
    tiersLabel: "対象とプラン構成",
    tiersH: "拠点数に応じた、段階プラン。",
    tiersItems: [
      { name: "Tier 1", range: "1〜3 拠点" },
      { name: "Tier 2", range: "4〜10 拠点" },
      { name: "Tier 3", range: "11+ 拠点（カスタム）" },
    ],
    tiersNote: "年契約・拠点数ベース。拠点や利用が増えたら上位ティアへアップグレード。標準サーキット・テンプレート構成。",
    caseLabel: "活用例 ［想定シナリオ］",
    stepsLabel: "進め方（一緒に作る・既存運用は止めない）",
    stepsH: "小さく始めて、止めずに広げる。",
    steps: [
      { n: "01", h: "お問い合わせ", lead: "ご相談・ご検討から", p: "30 分の対話も。機微情報の開示は不要。" },
      { n: "02", h: "PoC", lead: "区切った範囲で実証", p: "1 シナリオで実装・検証。" },
      { n: "03", h: "本番", lead: "既存運用を変えず展開", p: "前段に重ねるだけ。共存運用。" },
    ],
    ucLabel: "このプランのユースケース",
    ucH: "課題から選べます。",
    ucAll: "すべて見る →",
    close: {
      h: "導入して終わり、にはしません。",
      sub: "エンジニアが現場に入り、伴走します。導入はもちろん、業務やシステムとの連携もご相談ください。",
    },
  },
  en: {
    badgeTag: "Plan",
    ctaLabel: "Contact us",
    ctaNote: "Start with a conversation — about fit, scope, or pricing.",
    doLabel: "What this plan does",
    doH: "Pass on the certainty, not the contents.",
    bridge: {
      quote: "Hold nothing, leak nothing. Delegate the work — keep the proof.",
      body: "Lemma sits between your front line and your AI, passing along only the certainty — never the contents. It takes on the hard parts, so you can keep working exactly as you do today and hand it off with confidence.",
    },
    flowLabel: "How it works (no change to daily operations)",
    flowH: "No new steps to learn.",
    tiersLabel: "Who it's for & plan structure",
    tiersH: "Tiered by number of sites.",
    tiersItems: [
      { name: "Tier 1", range: "1–3 sites" },
      { name: "Tier 2", range: "4–10 sites" },
      { name: "Tier 3", range: "11+ sites (custom)" },
    ],
    tiersNote: "Annual contract, priced by the number of sites. Upgrade to a higher tier as sites or usage grow. Built on standard circuits and templates.",
    caseLabel: "Use case [illustrative scenario]",
    stepsLabel: "How we engage (we build it with you — without stopping your operations)",
    stepsH: "Start small, scale without disruption.",
    steps: [
      { n: "01", h: "Get in touch", lead: "Start with a conversation", p: "A 30-minute talk works too. No sensitive information required." },
      { n: "02", h: "PoC", lead: "Prove it in a bounded scope", p: "Build and validate one scenario." },
      { n: "03", h: "Production", lead: "Roll out without changing your operations", p: "Layer it in front — it runs alongside what you already have." },
    ],
    ucLabel: "Use cases in this plan",
    ucH: "Pick by the problem you're solving.",
    ucAll: "See all →",
    close: {
      h: "We don't deploy and walk away.",
      sub: "Our engineers embed with your team and stay alongside you. Talk to us about deployment — and about integrating with your operations and systems.",
    },
  },
};

interface Unique {
  meta: { title: string; desc: string };
  name: string;
  seg: string;
  h1a: string;
  h1b: string;
  lead: string;
  doItems: DoItem[];
  flowItems: Step[];
  tiersBody: string;
  caseH: string;
  caseBody: string;
  ucItems: string[];
}

const UNIQUE: Record<PlanKey, Record<Locale, Unique>> = {
  civic: {
    ja: {
      meta: {
        title: "Lemma Civic — 自治体の記録を、AI に任せられる確かなデータに｜公共・自治体向けプラン",
        desc: "窓口・給付・住民参加など自治体の現場で生まれる記録に、中身を見せずに真正性を付与。個人情報を見せず、いつもの運用のまま AI 活用へ。公共・自治体（B2B2G）向け、拠点数ベースの段階プラン。",
      },
      name: "Lemma Civic",
      seg: "公共・自治体（B2B2G）",
      h1a: "自治体の現場で生まれる記録を、",
      h1b: "AI が安全に使えるデータに。",
      lead: "窓口対応・給付・福祉相談・住民参加など、現場で生まれる記録に、中身を見せずに改ざん不能な来歴と真正性を付与します。個人情報を見せずに、AI が安心して使えるデータ基盤を、いつもの運用を変えずに構築できます。",
      doItems: [
        { h: "資格・条件を中身を見せず確認", p: "受給資格・年齢・資格などを、個人情報を出さずに。" },
        { h: "改ざん不能な来歴の記録", p: "監査と説明責任のための、書き換えられない記録。" },
        { h: "標準テンプレートで小さく", p: "公共向けひな型から、特定の業務ひとつを選んで。" },
      ],
      flowItems: [
        { n: "01", h: "集める", lead: "住民・事業者が記録を出す", p: "いつもの申請・活動のまま。新しい操作は増えません。" },
        { n: "02", h: "確かめる", lead: "職員は中身を見ずに確認", p: "「条件を満たす・本物である」だけを確認して処理を進める。" },
        { n: "03", h: "残す・活かす", lead: "改ざんなく残り、AI に使える", p: "監査でも AI 活用でも、後から検証できる形で残ります。" },
      ],
      tiersBody: "自治体・公益事業者、および B2B2G で市民向けサービスを提供する事業者向けです。複数拠点・複数自治体への展開にも、拠点数に応じた段階プランで対応します。",
      caseH: "補助金・給付の受給資格証明",
      caseBody: "所得や属性の中身を出さず「受給要件を満たす」ことだけを証明し、給付主体が検証できます。標準テンプレートで構成できる、Civic の代表的な使い方です。",
      ucItems: [
        "補助金・給付の受給資格証明（給付）",
        "公共サービスの適格性証明（窓口）",
        "長期契約の記録・見積の証明（契約）",
        "有資格者の配置・安全教育の証明（人材）",
      ],
    },
    en: {
      meta: {
        title: "Lemma Civic — Turn public-sector records into data you can trust your AI with | Plan for government & public services",
        desc: "Give the records your public-sector operations generate — front desk, benefits, civic participation — verifiable authenticity without revealing their contents. No personal data exposed, no change to how you already work. For government and public services (B2B2G), tiered by the number of sites.",
      },
      name: "Lemma Civic",
      seg: "Government & public sector (B2B2G)",
      h1a: "Turn everyday public-sector records",
      h1b: "into data AI can safely use.",
      lead: "For the records your front line generates — service desks, benefits, welfare consultations, civic participation — Lemma adds tamper-proof provenance and authenticity, without ever revealing what's inside. The result is a data foundation your AI can rely on: no personal information exposed, and no change to how you already work.",
      doItems: [
        { h: "Verify eligibility without revealing the contents", p: "Confirm eligibility, age, or qualifications — without exposing personal data." },
        { h: "Tamper-proof provenance records", p: "Unalterable records for audit and accountability." },
        { h: "Start small with standard templates", p: "Pick one workflow from ready-made public-sector templates." },
      ],
      flowItems: [
        { n: "01", h: "Collect", lead: "Residents and businesses submit records", p: "Through the same applications and activities as always — no new steps." },
        { n: "02", h: "Verify", lead: "Staff confirm without seeing the contents", p: "Confirm only that it meets the criteria and is genuine, then proceed." },
        { n: "03", h: "Keep & use", lead: "Stored tamper-proof, ready for AI", p: "Kept in a form you can verify later — for audits and for AI alike." },
      ],
      tiersBody: "For municipalities, public utilities, and businesses delivering citizen-facing services under a B2B2G model. Rollouts across multiple sites or municipalities are covered by tiers that scale with the number of sites.",
      caseH: "Proving eligibility for subsidies and benefits",
      caseBody: "Prove only that the eligibility requirements are met — without disclosing income or attributes — so the issuing body can verify it. A representative Civic use case that can be built from standard templates.",
      ucItems: [
        "Eligibility proof for subsidies and benefits (Payments)",
        "Eligibility proof for public services (Front desk)",
        "Proof of records and quotes for long-term contracts (Contracts)",
        "Proof of qualified staffing and safety training (Workforce)",
      ],
    },
  },
  critical: {
    ja: {
      meta: {
        title: "Lemma Critical — 製造・基幹インフラの記録を、AI に任せられる確かなデータに｜基幹インフラ・製造向けプラン",
        desc: "品質・検査・サプライチェーンなど製造・基幹インフラの現場で生まれる記録に、中身を見せずに真正性を付与。機微な技術情報を抱えずに、いつもの運用のまま AI 活用へ。基幹インフラ・製造向け、拠点数ベースの段階プラン。",
      },
      name: "Lemma Critical",
      seg: "基幹インフラ・製造",
      h1a: "現場で生まれる品質・検査の記録を、",
      h1b: "AI が安全に使えるデータに。",
      lead: "品質・検査・サプライチェーンなど、製造と基幹インフラの現場で生まれる記録に、中身を見せずに改ざん不能な来歴と真正性を付与します。機微な技術情報を抱え込まずに、AI が安心して使えるデータ基盤を、いつもの運用を変えずに構築できます。",
      doItems: [
        { h: "検査・品質を中身を見せず証明", p: "検査結果・規格適合・工程履歴を、技術情報を出さずに。" },
        { h: "改ざん不能な来歴の記録", p: "監査とトレーサビリティのための、書き換えられない記録。" },
        { h: "標準テンプレートで小さく", p: "製造・インフラ向けひな型から、特定の工程ひとつを選んで。" },
      ],
      flowItems: [
        { n: "01", h: "集める", lead: "現場・サプライヤーが記録を出す", p: "いつもの検査・報告のまま。新しい操作は増えません。" },
        { n: "02", h: "確かめる", lead: "担当者は中身を見ずに確認", p: "「規格を満たす・本物である」だけを確認して工程を進める。" },
        { n: "03", h: "残す・活かす", lead: "改ざんなく残り、AI に使える", p: "監査でも AI 活用でも、後から検証できる形で残ります。" },
      ],
      tiersBody: "製造業・基幹インフラ事業者、およびサプライチェーン全体で記録を扱う事業者向けです。複数拠点・複数サプライヤーへの展開にも、拠点数に応じた段階プランで対応します。",
      caseH: "サプライチェーンの品質・適合証明",
      caseBody: "技術情報や原価の中身を出さず「規格・要件を満たす」ことだけを証明し、発注者や監査人が検証できます。標準テンプレートで構成できる、Critical の代表的な使い方です。",
      ucItems: [
        "検査・品質結果の適合証明（品質）",
        "サプライチェーンの来歴・トレーサビリティ（調達）",
        "設備・保守記録の改ざん不能な保全（保全）",
        "有資格者の配置・安全教育の証明（人材）",
      ],
    },
    en: {
      meta: {
        title: "Lemma Critical — Turn manufacturing & critical-infrastructure records into data you can trust your AI with | Plan for critical infrastructure & manufacturing",
        desc: "Give the quality, inspection, and supply-chain records your manufacturing and critical-infrastructure operations generate verifiable authenticity without revealing their contents. No sensitive technical data hoarded, no change to how you already work. For critical infrastructure & manufacturing (B2B), tiered by the number of sites.",
      },
      name: "Lemma Critical",
      seg: "Critical infrastructure & manufacturing",
      h1a: "Turn quality and inspection records",
      h1b: "into data AI can safely use.",
      lead: "For the records your manufacturing and critical-infrastructure operations generate — quality, inspection, supply chain — Lemma adds tamper-proof provenance and authenticity, without ever revealing what's inside. The result is a data foundation your AI can rely on: no sensitive technical data hoarded, and no change to how you already work.",
      doItems: [
        { h: "Prove inspection & quality without revealing the contents", p: "Confirm test results, standards conformance, or process history — without exposing technical data." },
        { h: "Tamper-proof provenance records", p: "Unalterable records for audit and traceability." },
        { h: "Start small with standard templates", p: "Pick one process from ready-made manufacturing templates." },
      ],
      flowItems: [
        { n: "01", h: "Collect", lead: "The floor and suppliers submit records", p: "Through the same inspections and reports as always — no new steps." },
        { n: "02", h: "Verify", lead: "Your team confirms without seeing the contents", p: "Confirm only that it meets the standard and is genuine, then move the process on." },
        { n: "03", h: "Keep & use", lead: "Stored tamper-proof, ready for AI", p: "Kept in a form you can verify later — for audits and for AI alike." },
      ],
      tiersBody: "For manufacturers, critical-infrastructure operators, and businesses handling records across the supply chain. Rollouts across multiple sites or suppliers are covered by tiers that scale with the number of sites.",
      caseH: "Proving supply-chain quality & conformance",
      caseBody: "Prove only that the standard or requirement is met — without disclosing technical data or costs — so buyers and auditors can verify it. A representative Critical use case that can be built from standard templates.",
      ucItems: [
        "Conformance proof for inspection & quality results (Quality)",
        "Provenance and traceability across the supply chain (Procurement)",
        "Tamper-proof preservation of equipment & maintenance records (Maintenance)",
        "Proof of qualified staffing and safety training (Workforce)",
      ],
    },
  },
  compliance: {
    ja: {
      meta: {
        title: "Lemma Compliance — 本人確認・取引のデータを、個人情報を抱えずに AI 活用へ｜金融・FinTech 向けプラン",
        desc: "本人確認・取引・KYC/AML など金融の現場で生まれるデータに、中身を見せずに真正性を付与。個人情報を抱えずに、いつもの運用のまま AI 活用へ。金融・FinTech 向け、拠点数ベースの段階プラン。",
      },
      name: "Lemma Compliance",
      seg: "金融・FinTech",
      h1a: "本人確認・取引のデータを、",
      h1b: "個人情報を抱えずに AI へ。",
      lead: "本人確認・取引・KYC/AML など、金融の現場で生まれるデータに、中身を見せずに改ざん不能な来歴と真正性を付与します。個人情報を抱え込まずに、AI が安心して使えるデータ基盤を、いつもの運用を変えずに構築できます。",
      doItems: [
        { h: "属性・適格性を中身を見せず確認", p: "年齢・居住・取引適格性などを、個人情報を出さずに。" },
        { h: "改ざん不能な取引来歴", p: "監査と説明責任のための、書き換えられない記録。" },
        { h: "標準テンプレートで小さく", p: "金融向けひな型から、特定の手続きひとつを選んで。" },
      ],
      flowItems: [
        { n: "01", h: "集める", lead: "顧客・取引先がデータを出す", p: "いつもの申込・取引のまま。新しい操作は増えません。" },
        { n: "02", h: "確かめる", lead: "担当者は中身を見ずに確認", p: "「要件を満たす・本物である」だけを確認して手続きを進める。" },
        { n: "03", h: "残す・活かす", lead: "改ざんなく残り、AI に使える", p: "監査でも AI 活用でも、後から検証できる形で残ります。" },
      ],
      tiersBody: "銀行・証券・保険・FinTech 事業者、および金融サービスを提供する事業者向けです。複数拠点・複数サービスへの展開にも、拠点数に応じた段階プランで対応します。",
      caseH: "本人確認（KYC）の属性証明",
      caseBody: "氏名や口座の中身を出さず「本人要件を満たす」ことだけを証明し、検証主体が確認できます。標準テンプレートで構成できる、Compliance の代表的な使い方です。",
      ucItems: [
        "本人確認（KYC）の属性証明（本人確認）",
        "取引適格性・与信の証明（取引）",
        "改ざん不能な取引・監査記録（監査）",
        "資格・登録要件の充足証明（規制対応）",
      ],
    },
    en: {
      meta: {
        title: "Lemma Compliance — Put identity and transaction data to work for AI without hoarding personal information | Plan for finance & FinTech",
        desc: "Give the identity, transaction, and KYC/AML data your financial operations generate verifiable authenticity without revealing their contents. No personal data hoarded, no change to how you already work. For finance & FinTech (B2B), tiered by the number of sites.",
      },
      name: "Lemma Compliance",
      seg: "Finance & FinTech",
      h1a: "Put identity and transaction data to work",
      h1b: "for AI — without hoarding it.",
      lead: "For the data your financial operations generate — identity, transactions, KYC/AML — Lemma adds tamper-proof provenance and authenticity, without ever revealing what's inside. The result is a data foundation your AI can rely on: no personal information hoarded, and no change to how you already work.",
      doItems: [
        { h: "Verify attributes & eligibility without revealing the contents", p: "Confirm age, residency, or transaction eligibility — without exposing personal data." },
        { h: "Tamper-proof transaction provenance", p: "Unalterable records for audit and accountability." },
        { h: "Start small with standard templates", p: "Pick one procedure from ready-made finance templates." },
      ],
      flowItems: [
        { n: "01", h: "Collect", lead: "Customers and counterparties submit data", p: "Through the same applications and transactions as always — no new steps." },
        { n: "02", h: "Verify", lead: "Your team confirms without seeing the contents", p: "Confirm only that it meets the requirement and is genuine, then proceed." },
        { n: "03", h: "Keep & use", lead: "Stored tamper-proof, ready for AI", p: "Kept in a form you can verify later — for audits and for AI alike." },
      ],
      tiersBody: "For banks, securities and insurance firms, and FinTechs delivering financial services. Rollouts across multiple sites or services are covered by tiers that scale with the number of sites.",
      caseH: "Attribute proof for identity verification (KYC)",
      caseBody: "Prove only that the identity requirement is met — without disclosing names or account details — so the verifying party can confirm it. A representative Compliance use case that can be built from standard templates.",
      ucItems: [
        "Attribute proof for identity verification / KYC (Identity)",
        "Proof of transaction eligibility and creditworthiness (Transactions)",
        "Tamper-proof transaction & audit records (Audit)",
        "Proof of meeting licensing & registration requirements (Regulatory)",
      ],
    },
  },
};

export function getPlanContent(planKey: PlanKey, locale: Locale): PlanContent {
  const c = COMMON[locale];
  const u = UNIQUE[planKey][locale];
  return {
    meta: u.meta,
    hero: {
      badgeTag: c.badgeTag,
      name: u.name,
      seg: u.seg,
      h1a: u.h1a,
      h1b: u.h1b,
      lead: u.lead,
      ctaLabel: c.ctaLabel,
      ctaNote: c.ctaNote,
    },
    doSec: { label: c.doLabel, h: c.doH, items: u.doItems },
    bridge: c.bridge,
    flow: { label: c.flowLabel, h: c.flowH, items: u.flowItems },
    tiers: {
      label: c.tiersLabel,
      h: c.tiersH,
      body: u.tiersBody,
      items: c.tiersItems,
      note: c.tiersNote,
    },
    caseSec: { label: c.caseLabel, h: u.caseH, body: u.caseBody },
    steps: { label: c.stepsLabel, h: c.stepsH, items: c.steps },
    uc: { label: c.ucLabel, h: c.ucH, items: u.ucItems, all: c.ucAll },
    close: c.close,
  };
}
