/**
 * Plan-page content for Lemma Civic / Critical / Compliance, both locales.
 * Consumed by templates/PlanTemplate.astro via getPlanContent(planKey, locale).
 *
 * Each plan is meaningfully distinct (per the confirmed mockups), so most copy
 * is per-plan in UNIQUE — including the §2 icons, the bridge body, the flow
 * label, and the whole tier structure (Civic = sites; Critical = facilities +
 * Option Packs; Compliance = institution size + Option Packs). COMMON holds
 * only what is genuinely identical across all three (labels, the bridge quote,
 * the steps, the closing CTA).
 *
 * Permission gate (pre-permission): §6 is an "illustrative scenario", never a
 * case study; no client-identifying context anywhere here.
 *
 * Source of truth: the Lemma BizDev plan-page mockups. EN mirrors the JA.
 */
import type { Locale } from "../i18n/translations";

export type PlanKey = "civic" | "critical" | "compliance";

/** Subset of CivicIconName used by the §2 capability cards. */
type PlanIconName =
  | "check"
  | "history"
  | "template"
  | "adjustments"
  | "clipboard-check"
  | "server"
  | "user-check"
  | "eye-off";

interface DoItem {
  icon: PlanIconName;
  h: string;
  p: string;
}
interface Step {
  n: string;
  h: string;
  lead: string;
  p: string;
}
interface Tier {
  name: string;
  range: string;
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
  tiers: { label: string; h: string; body: string; items: Tier[]; note: string };
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
  bridgeQuote: string;
  flowH: string;
  tiersLabel: string;
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
    bridgeQuote: "持たないから、流出しない。任せても、証拠は残る。",
    flowH: "新しい操作は、増えません。",
    tiersLabel: "対象とプラン構成",
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
    bridgeQuote: "Hold nothing, leak nothing. Delegate the work — keep the proof.",
    flowH: "No new steps to learn.",
    tiersLabel: "Who it's for & plan structure",
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
  bridgeBody: string;
  flowLabel: string;
  flowItems: Step[];
  tiersH: string;
  tiersBody: string;
  tiersItems: Tier[];
  tiersNote: string;
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
        { icon: "check", h: "資格・条件を中身を見せず確認", p: "受給資格・年齢・資格などを、個人情報を出さずに。" },
        { icon: "history", h: "改ざん不能な来歴の記録", p: "監査と説明責任のための、書き換えられない記録。" },
        { icon: "template", h: "標準テンプレートで小さく", p: "公共向けひな型から、特定の業務ひとつを選んで。" },
      ],
      bridgeBody: "Lemma が現場と AI の間に入り、中身は渡さずに「確かさ」だけを受け渡します。むずかしい処理は引き受けるので、いつもの業務のまま、安心して任せられます。",
      flowLabel: "運用イメージ（いつもの業務のまま）",
      flowItems: [
        { n: "01", h: "集める", lead: "住民・事業者が記録を出す", p: "いつもの申請・活動のまま。新しい操作は増えません。" },
        { n: "02", h: "確かめる", lead: "職員は中身を見ずに確認", p: "「条件を満たす・本物である」だけを確認して処理を進める。" },
        { n: "03", h: "残す・活かす", lead: "改ざんなく残り、AI に使える", p: "監査でも AI 活用でも、後から検証できる形で残ります。" },
      ],
      tiersH: "拠点数に応じた、段階プラン。",
      tiersBody: "自治体・公益事業者、および B2B2G で市民向けサービスを提供する事業者向けです。複数拠点・複数自治体への展開にも、拠点数に応じた段階プランで対応します。",
      tiersItems: [
        { name: "Tier 1", range: "1〜3 拠点" },
        { name: "Tier 2", range: "4〜10 拠点" },
        { name: "Tier 3", range: "11+ 拠点（カスタム）" },
      ],
      tiersNote: "年契約・拠点数ベース。拠点や利用が増えたら上位ティアへアップグレード。標準サーキット・テンプレート構成。",
      caseH: "受給資格照合 ── 補助金・給付",
      caseBody: "所得や属性の中身を出さず「受給要件を満たす」ことだけを証明し、給付主体が検証できます。標準テンプレートで構成できる、Civic の代表的な使い方です。",
      ucItems: [
        "受給資格照合（給付）",
        "公共サービスの適格性証明（窓口）",
        "長期契約の記録・見積の証明（契約）",
        "有資格者の配置照合（人材）",
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
        { icon: "check", h: "Verify eligibility without revealing the contents", p: "Confirm eligibility, age, or qualifications — without exposing personal data." },
        { icon: "history", h: "Tamper-proof provenance records", p: "Unalterable records for audit and accountability." },
        { icon: "template", h: "Start small with standard templates", p: "Pick one workflow from ready-made public-sector templates." },
      ],
      bridgeBody: "Lemma sits between your front line and your AI, passing along only the certainty — never the contents. It takes on the hard parts, so you can keep working exactly as you do today and hand it off with confidence.",
      flowLabel: "How it works (no change to daily operations)",
      flowItems: [
        { n: "01", h: "Collect", lead: "Residents and businesses submit records", p: "Through the same applications and activities as always — no new steps." },
        { n: "02", h: "Verify", lead: "Staff confirm without seeing the contents", p: "Confirm only that it meets the criteria and is genuine, then proceed." },
        { n: "03", h: "Keep & use", lead: "Stored tamper-proof, ready for AI", p: "Kept in a form you can verify later — for audits and for AI alike." },
      ],
      tiersH: "Tiered by number of sites.",
      tiersBody: "For municipalities, public utilities, and businesses delivering citizen-facing services under a B2B2G model. Rollouts across multiple sites or municipalities are covered by tiers that scale with the number of sites.",
      tiersItems: [
        { name: "Tier 1", range: "1–3 sites" },
        { name: "Tier 2", range: "4–10 sites" },
        { name: "Tier 3", range: "11+ sites (custom)" },
      ],
      tiersNote: "Annual contract, priced by the number of sites. Upgrade to a higher tier as sites or usage grow. Built on standard circuits and templates.",
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
        title: "Lemma Critical — 品質・検査・サプライチェーンの記録を、AI に任せられる確かなデータに｜基幹インフラ・製造向けプラン",
        desc: "製造・基幹インフラの現場で生まれる記録に、営業秘密を出さずに真正性を付与。業務を止めず、監査にも AI にも任せられるデータ基盤へ。基幹インフラ・製造（B2B）向け、段階プラン。",
      },
      name: "Lemma Critical",
      seg: "基幹インフラ・製造（B2B）",
      h1a: "品質・検査・サプライチェーンの記録を、",
      h1b: "AI に任せられる確かなデータに。",
      lead: "製造・基幹インフラの現場で生まれる記録に、営業秘密を出さずに真正性を付与。業務を止めず、監査にも AI にも任せられるデータ基盤へ。",
      doItems: [
        { icon: "adjustments", h: "自社ルールに合わせた専用証明", p: "業務ルールに合わせて作り込めるカスタム証明。" },
        { icon: "clipboard-check", h: "監査にそのまま使える証跡", p: "コンプライアンス対応の証跡を、標準で残せます。" },
        { icon: "server", h: "SLA・オンプレにも対応", p: "稼働率保証・自社環境（オンプレミス）への導入も。" },
      ],
      bridgeBody: "Lemma が現場と AI の間に入り、営業秘密は出さずに「確かさ」だけを受け渡します。むずかしい処理は引き受けるので、業務を止めずに、安心して任せられます。",
      flowLabel: "運用イメージ ── いつもの工程のまま、こう使えます",
      flowItems: [
        { n: "01", h: "集める", lead: "現場・サプライヤが記録を出す", p: "品質・検査・点検・部品来歴を、いつもの工程のまま。" },
        { n: "02", h: "確かめる", lead: "営業秘密を出さずに確認", p: "「基準を満たす・本物である」だけを確認して進める。" },
        { n: "03", h: "残す・活かす", lead: "改ざんなく残り、監査・AI に", p: "監査・規制報告・AI 活用に、後から検証できる形で。" },
      ],
      tiersH: "規模に応じた、段階プラン。",
      tiersBody: "重要インフラ・製造業・大規模事業など、業務継続性と規制遵守が問われる運用に AI を組み込む組織向けです。施設数と連携範囲に応じた段階プランで展開できます。",
      tiersItems: [
        { name: "Tier 1", range: "単一施設" },
        { name: "Tier 2", range: "2〜10 施設" },
        { name: "Tier 3", range: "エンタープライズ" },
      ],
      tiersNote: "年契約。Tier 2 以上で Option Pack を追加可能 ── インシデント対応（復旧と証明）／規制対応（適合の証跡・提出書類）。詳しくはお問い合わせください。SLA・オンプレミス対応。",
      caseH: "サプライチェーン部品来歴",
      caseBody: "多階層のサプライヤが、各段階の部品・検査記録を署名付きで連鎖させます。組立側は営業秘密を見ずに「基準に適合し、改ざんがない」ことを検証でき、調達リスクと監査対応を同時に下げられます。",
      ucItems: [
        "サプライチェーン部品来歴（来歴）",
        "仕入先資格照合（調達）",
        "内部統制・承認フローの非改ざん証明（統制）",
        "有資格者の配置照合（人材）",
      ],
    },
    en: {
      meta: {
        title: "Lemma Critical — Turn quality, inspection & supply-chain records into data you can trust your AI with | Plan for critical infrastructure & manufacturing",
        desc: "For records from manufacturing and critical-infrastructure operations, add authenticity without exposing trade secrets — keep work running, ready for audits and AI alike. Critical infrastructure & manufacturing (B2B), tiered plan.",
      },
      name: "Lemma Critical",
      seg: "Critical infrastructure & manufacturing (B2B)",
      h1a: "Turn quality, inspection & supply-chain records",
      h1b: "into data you can trust AI with.",
      lead: "For the records generated across manufacturing and critical-infrastructure operations, Lemma adds authenticity without exposing trade secrets — a data foundation you can hand to audits and AI alike, without stopping work.",
      doItems: [
        { icon: "adjustments", h: "Custom proofs built to your rules", p: "Proofs tailored to your operational rules." },
        { icon: "clipboard-check", h: "Audit-ready evidence", p: "Keep compliance-ready evidence by default." },
        { icon: "server", h: "SLA & on-prem ready", p: "Uptime SLAs and on-premise deployment available." },
      ],
      bridgeBody: "Lemma sits between your floor and your AI, passing along only the certainty — never the trade secrets. It takes on the hard parts, so you can keep operations running and hand it off with confidence.",
      flowLabel: "How it works — in your existing process",
      flowItems: [
        { n: "01", h: "Collect", lead: "The floor and suppliers submit records", p: "Quality, inspection, maintenance, and part provenance — in your existing process." },
        { n: "02", h: "Verify", lead: "Confirm without exposing trade secrets", p: "Confirm only that it meets the standard and is genuine, then move on." },
        { n: "03", h: "Keep & use", lead: "Tamper-proof, ready for audit & AI", p: "For audits, regulatory reporting, and AI — kept verifiable after the fact." },
      ],
      tiersH: "Tiered by scale.",
      tiersBody: "For critical infrastructure, manufacturers, and large operations embedding AI where business continuity and regulatory compliance matter. Roll out in tiers by number of facilities and integration scope.",
      tiersItems: [
        { name: "Tier 1", range: "Single facility" },
        { name: "Tier 2", range: "2–10 facilities" },
        { name: "Tier 3", range: "Enterprise" },
      ],
      tiersNote: "Annual contract. Tier 2+ can add Option Packs — Incident response (recovery & proof) / Regulatory (conformance evidence & filings). Contact us for details. SLA & on-prem available.",
      caseH: "Supply-chain part provenance",
      caseBody: "Multi-tier suppliers chain signed part and inspection records at each stage. The assembler verifies that everything conforms to standard and is untampered — without seeing trade secrets — lowering procurement risk and audit burden at once.",
      ucItems: [
        "Supply-chain part provenance (Provenance)",
        "Supplier licenses, ISO & certificate checks (Procurement)",
        "Tamper-proof internal-control & approval flows (Controls)",
        "Proof of qualified staffing and safety training (Workforce)",
      ],
    },
  },
  compliance: {
    ja: {
      meta: {
        title: "Lemma Compliance — 本人確認や取引のデータを、AI に任せられる確かなデータに｜金融・FinTech 向けプラン",
        desc: "KYC・取引・規制対応の現場で、個人情報を保管・開示せず「要件を満たす」ことだけを証明。監査証跡を残しながら、AI に業務を任せられます。金融・FinTech（B2B）向け、段階プラン。",
      },
      name: "Lemma Compliance",
      seg: "金融・FinTech（B2B）",
      h1a: "本人確認や取引のデータを、",
      h1b: "AI に任せられる確かなデータに。",
      lead: "KYC・取引・規制対応の現場で、個人情報を保管・開示せず「要件を満たす」ことだけを証明。監査証跡を残しながら、AI に業務を任せられます。",
      doItems: [
        { icon: "user-check", h: "個人情報を開示せず本人確認", p: "KYC/AML を、中身を保管・開示せずに。" },
        { icon: "clipboard-check", h: "規制対応の監査証跡", p: "EU AI Act・ISO 42001 に対応した証跡を残せます。" },
        { icon: "eye-off", h: "必要な事実だけ選択開示", p: "個人情報は伏せたまま、要件だけを証明します。" },
      ],
      bridgeBody: "Lemma が顧客と AI の間に入り、個人情報は保管せずに「確かさ」だけを受け渡します。生データを抱え込まないので、漏えい面そのものを小さくできます。",
      flowLabel: "運用イメージ ── いつもの取引フローのまま、こう使えます",
      flowItems: [
        { n: "01", h: "受け取る", lead: "取引のなかで情報を受け取る", p: "いつもの本人確認・取引フローのまま。" },
        { n: "02", h: "確かめる", lead: "保管・開示せず要件を確認", p: "KYC 通過・サンクション非該当・年齢などだけを確認。" },
        { n: "03", h: "残す・活かす", lead: "監査証跡として残り、AI に", p: "規制報告・AI 運用に、後から検証できる形で。" },
      ],
      tiersH: "規模に応じた、段階プラン。",
      tiersBody: "金融機関・FinTech・規制対象機関など、属性検証と監査証跡が求められる業務に AI を運用する組織向けです。EU AI Act / GDPR / 国内規制への対応も。機関規模に応じた段階プランで展開できます。",
      tiersItems: [
        { name: "Tier 1", range: "中小 FinTech" },
        { name: "Tier 2", range: "地方銀行" },
        { name: "Tier 3", range: "メガバンク" },
      ],
      tiersNote: "年契約。Tier 2 以上で Option Pack を追加可能 ── 規制対応（適合の証跡）／エージェント・ガバナンス（AI 権限の検証）。詳しくはお問い合わせください。",
      caseH: "KYC / AML 選択的開示",
      caseBody: "顧客の生年月日や本人確認書類を保管せず、「18 歳以上・サンクション非該当・許可された地域」など必要な属性だけを証明します。原本を受け取らずに規制要件を満たし、漏えい時のリスクそのものを小さくできます。",
      ucItems: [
        "KYC / AML 選択的開示（KYC）",
        "取引先スクリーニング（結果だけ）（与信）",
        "AI 監査ログ証明（監査）",
        "金融データ流出防止（統制）",
      ],
    },
    en: {
      meta: {
        title: "Lemma Compliance — Turn identity & transaction data into data you can trust your AI with | Plan for finance & FinTech",
        desc: "In KYC, transactions, and regulatory work, prove only that requirements are met — without storing or disclosing personal data. Keep audit trails while handing work to AI. Finance & FinTech (B2B), tiered plan.",
      },
      name: "Lemma Compliance",
      seg: "Finance & FinTech (B2B)",
      h1a: "Turn identity & transaction data",
      h1b: "into data you can trust AI with.",
      lead: "Across KYC, transactions, and regulatory work, prove only that requirements are met — without storing or disclosing personal data. Keep audit trails while handing work to AI.",
      doItems: [
        { icon: "user-check", h: "Identity checks without disclosure", p: "KYC/AML without storing or exposing the contents." },
        { icon: "clipboard-check", h: "Regulatory audit trails", p: "Keep evidence aligned with the EU AI Act and ISO 42001." },
        { icon: "eye-off", h: "Selective disclosure", p: "Prove only the requirement, with personal data hidden." },
      ],
      bridgeBody: "Lemma sits between your customers and your AI, passing along only the certainty — without storing personal data. By not hoarding raw data, you shrink the leak surface itself.",
      flowLabel: "How it works — in your existing transaction flow",
      flowItems: [
        { n: "01", h: "Receive", lead: "Receive information in the course of business", p: "In your existing identity-check and transaction flows." },
        { n: "02", h: "Verify", lead: "Confirm requirements without storing or disclosing", p: "Confirm only KYC pass, no-sanctions, age, and the like." },
        { n: "03", h: "Keep & use", lead: "Kept as an audit trail, ready for AI", p: "For regulatory reporting and AI operations — kept verifiable after the fact." },
      ],
      tiersH: "Tiered by scale.",
      tiersBody: "For financial institutions, FinTechs, and regulated entities running AI where attribute verification and audit trails are required. EU AI Act / GDPR / domestic regulation covered. Roll out in tiers by institution size.",
      tiersItems: [
        { name: "Tier 1", range: "SME FinTech" },
        { name: "Tier 2", range: "Regional bank" },
        { name: "Tier 3", range: "Megabank" },
      ],
      tiersNote: "Annual contract. Tier 2+ can add Option Packs — Regulatory (conformance evidence) / Agent governance (verifying AI authority). Contact us for details.",
      caseH: "KYC / AML selective disclosure",
      caseBody: "Without storing a customer's date of birth or ID documents, prove only the needed attributes — over 18, not sanctioned, in a permitted region. Meet regulatory requirements without receiving originals, and shrink the risk in the event of a leak.",
      ucItems: [
        "KYC / AML selective disclosure (KYC)",
        "Counterparty credit & AML checks, results only (Credit)",
        "AI audit-log proof (Audit)",
        "Financial-data leak prevention (Controls)",
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
    bridge: { quote: c.bridgeQuote, body: u.bridgeBody },
    flow: { label: u.flowLabel, h: c.flowH, items: u.flowItems },
    tiers: {
      label: c.tiersLabel,
      h: u.tiersH,
      body: u.tiersBody,
      items: u.tiersItems,
      note: u.tiersNote,
    },
    caseSec: { label: c.caseLabel, h: u.caseH, body: u.caseBody },
    steps: { label: c.stepsLabel, h: c.stepsH, items: c.steps },
    uc: { label: c.ucLabel, h: c.ucH, items: u.ucItems, all: c.ucAll },
    close: c.close,
  };
}
