/**
 * Brief 記事末の「対応サービス」バナー（広告枠）。
 *
 * Brief の本文は分析であってセールスではない。製品への導線は本文の外に、
 * ニュースサイトの広告枠と同じ作法で置く: 本文と配布注記の後、引用パネルの
 * 前に1枚だけ。隅に小さく「PR」。絵は事案を図にしない（抽象の地だけ）。
 *
 * 出し分けは **Brief ごとの許可リスト**（BANNER_BY_SLUG）。カテゴリから自動で
 * 決めると事案と商品がずれる（旧 briefAttackCta の Brief→攻撃 LP 導線は
 * 90日でクリック0だった）。§5 の「点検チェックリスト」を受けて、その点検を
 * 組織の業務で行う相談へつなぐ。中身は「知見の提供と相談／攻撃シミュレーションに
 * よる点検／レポート」（Lemma の製品統合は別の話として、ここでは出さない）。
 *
 * 計測: 表示（50% 見えたら1回）を `brief_service_banner_view`、クリックを
 * `brief_service_banner_click` で GA4 へ送る。判断は表示あたりのクリック率で
 * 行う（Brief への流入は Direct が多く、セッションを分母にすると誤る）。
 * 問い合わせは Discovery フォームの `plan` 隠しフィールドに `cyber` を渡し、
 * `ref` でどの Brief のバナーから来たかを分ける。
 */
import type { Locale } from "../i18n/translations";
import { DISCOVERY_CALL_URL } from "./cta";

export type ServiceBannerKey = "cyber-review";

interface BannerCopy {
  readonly eyebrow: string;
  readonly head: string;
  readonly body: string;
  readonly button: string;
  readonly prLabel: string;
  /** 何をしてもらえるか。担当者と進める3段。 */
  readonly steps: readonly { readonly t: string; readonly d: string }[];
}

const COPY: Readonly<Record<ServiceBannerKey, Readonly<Record<Locale, BannerCopy>>>> = {
  "cyber-review": {
    ja: {
      eyebrow: "LEMMA CYBER · 点検",
      head: "この点検を、担当者がついて一緒に進めます。",
      body: "チェックリストを渡して終わりにしません。Brief と AI セキュリティの知見、攻撃シミュレーションを使い、最初の相談から報告まで同じ担当者が伴走します。",
      button: "点検について相談する →",
      prLabel: "PR",
      steps: [
        { t: "知見の提供と相談", d: "Brief と AI セキュリティの知見を、組織の業務に当てはめて一緒に整理する" },
        { t: "攻撃シミュレーションで点検", d: "実際の手口を模した試験で、どこが止まり、どこを通るかを確かめる" },
        { t: "レポート", d: "見つかった穴と手当ての選択肢を、優先順位をつけて渡す" },
      ],
    },
    en: {
      eyebrow: "LEMMA CYBER · REVIEW",
      head: "We run this check with you, hands-on.",
      body: "Not just a checklist. Drawing on our Briefs, AI-security expertise and attack simulation, one dedicated person works with your team from first conversation to final report.",
      button: "Talk to us about a review →",
      prLabel: "PR",
      steps: [
        { t: "Insight & advice", d: "Apply our Brief and AI-security knowledge to your own workflows" },
        { t: "Attack-simulation check", d: "Test with realistic attack patterns to see what stops and what gets through" },
        { t: "Report", d: "A prioritised list of the gaps found and the options to close them" },
      ],
    },
  },
};

/** 許可リスト。slug → バナー。ここに無い Brief には出さない。 */
const BANNER_BY_SLUG: Readonly<Record<string, ServiceBannerKey>> = {
  "032-booking-payout-account-tampering": "cyber-review",
};

export interface ServiceBanner extends BannerCopy {
  readonly key: ServiceBannerKey;
  readonly href: string;
}

export function serviceBannerFor(
  slug: string,
  briefNoPad: string,
  locale: Locale,
): ServiceBanner | null {
  const key = BANNER_BY_SLUG[slug];
  if (!key) return null;
  const params = new URLSearchParams({
    plan: "cyber",
    ref: `brief_banner_${briefNoPad}`,
    utm_source: "brief_banner",
    utm_medium: "cta",
    utm_campaign: "brief_to_cyber_review",
    utm_content: briefNoPad,
  });
  return { key, ...COPY[key][locale], href: `${DISCOVERY_CALL_URL[locale]}?${params}` };
}
