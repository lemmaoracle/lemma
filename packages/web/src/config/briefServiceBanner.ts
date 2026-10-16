/**
 * Brief 記事末の「対応サービス」バナー（広告枠）。
 *
 * Brief の本文は分析であってセールスではない。製品への導線は本文の外に、
 * ニュースサイトの広告枠と同じ作法で置く: 本文（Sources・参照カード・配布
 * 注記）の後、引用パネルの前に1枚だけ。小さな「PR」表示を枠の隅に付ける。
 *
 * 出し分けは **Brief ごとの許可リスト**（BANNER_BY_SLUG）。カテゴリから自動で
 * 決めると事案と商品がずれる（旧 briefAttackCta の Brief→攻撃 LP 導線は
 * 90日でクリック0だった）。載せるのは、事案で欠けていた層に商品が
 * 一対一で当たる Brief だけ。
 *
 * 計測: 表示（50% 見えたら1回）を `brief_service_banner_view`、クリックを
 * `brief_service_banner_click` で GA4 へ送る。判断は表示あたりのクリック率で
 * 行う（Brief への流入は Direct が多く、セッションを分母にすると誤る）。
 * 問い合わせは Discovery フォームの `plan` 隠しフィールドに `cyber` を渡し、
 * `ref` でどの Brief のバナーから来たかを分ける。
 */
import type { Locale } from "../i18n/translations";
import { DISCOVERY_CALL_URL } from "./cta";

export type ServiceBannerKey = "cyber-payment-change";

interface BannerCopy {
  readonly eyebrow: string;
  /** 見出し。要素ごとに改行して描く。 */
  readonly head: readonly string[];
  readonly body: string;
  readonly button: string;
  readonly prLabel: string;
  /** 右の図（届いた依頼のカード＋判定スタンプ＋求めた証明）の文字。 */
  readonly art: {
    readonly noticeTitle: string;
    readonly fieldLabel: string;
    readonly fieldValue: string;
    readonly sender: string;
    readonly stamp: string;
    readonly stampSub: string;
    readonly cardRows: readonly [string, string];
  };
}

const COPY: Readonly<Record<ServiceBannerKey, Readonly<Record<Locale, BannerCopy>>>> = {
  "cyber-payment-change": {
    ja: {
      eyebrow: "LEMMA CYBER",
      head: ["その振込先の変更、", "本物ですか。"],
      body: "取引先や管理者を装った口座変更・支払い指示を、実行の前に確かめる仕組みを準備しています。",
      button: "早期導入を相談する →",
      prLabel: "PR",
      art: {
        noticeTitle: "振込先変更のお知らせ",
        fieldLabel: "新しい振込先",
        fieldValue: "口座 ●●●● 7713",
        sender: "差出人: 経理部 ✓ ログイン済み",
        stamp: "BLOCK",
        stampSub: "実行の前に停止",
        cardRows: ["発行者　—", "変更権限　—"],
      },
    },
    en: {
      eyebrow: "LEMMA CYBER",
      head: ["Is that payout-account change", "genuine?"],
      body: "We are building a way to check bank-account changes and payment instructions before they execute, even from a trusted-looking account.",
      button: "Talk to us about early access →",
      prLabel: "PR",
      art: {
        noticeTitle: "Payout account change",
        fieldLabel: "New payout account",
        fieldValue: "Acct ●●●● 7713",
        sender: "From: Finance ✓ signed in",
        stamp: "BLOCK",
        stampSub: "Stopped before execution",
        cardRows: ["Issuer  —", "Authority  —"],
      },
    },
  },
};

/** 許可リスト。slug → バナー。ここに無い Brief には出さない。 */
const BANNER_BY_SLUG: Readonly<Record<string, ServiceBannerKey>> = {
  "032-booking-payout-account-tampering": "cyber-payment-change",
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
    utm_campaign: "brief_to_cyber",
    utm_content: briefNoPad,
  });
  return { key, ...COPY[key][locale], href: `${DISCOVERY_CALL_URL[locale]}?${params}` };
}
