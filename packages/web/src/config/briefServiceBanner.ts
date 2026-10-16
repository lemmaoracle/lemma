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
 * 組織の業務で行う相談へつなぐ。
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
}

const COPY: Readonly<Record<ServiceBannerKey, Readonly<Record<Locale, BannerCopy>>>> = {
  "cyber-review": {
    ja: {
      eyebrow: "LEMMA CYBER · 点検",
      head: "この点検を、組織で一度やってみませんか。",
      body: "振込先や権限の変更など、後戻りできない操作の前に、誰が何を確かめているか。業務を棚卸しして、確かめる層が抜けている箇所を洗い出します。",
      button: "点検について相談する →",
      prLabel: "PR",
    },
    en: {
      eyebrow: "LEMMA CYBER · REVIEW",
      head: "Run this check across your own operations.",
      body: "Before irreversible actions such as payout or permission changes, who checks what? We map your workflows and find where that check is missing.",
      button: "Talk to us about a review →",
      prLabel: "PR",
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
