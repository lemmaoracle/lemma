/**
 * Brief 記事末の「対応サービス」バナー（広告枠）。
 *
 * Brief の本文は分析であってセールスではない。製品への導線は本文の外に、
 * ニュースサイトの広告枠と同じ作法で置く: 本文と配布注記の後、引用パネルの
 * 前に1枚だけ。隅に小さく「PR」。絵は事案を図にしない（抽象の地だけ）。
 *
 * 出し分けは **Brief ごとの許可リスト**（BANNER_BY_SLUG）。カテゴリから自動で
 * 決めると事案と商品がずれる（旧 briefAttackCta の Brief→攻撃 LP 導線は
 * 90日でクリック0だった）。
 *
 * 主役は Lemma Cyber の早期アクセス（JA/EN 共通）。JA だけ、国内企業向けの
 * 「導入前の点検」（知見の提供と相談／攻撃シミュレーションによる点検／報告）を
 * 補足として添える。伴走の点検は国内のみ提供のため EN には出さない。
 *
 * 受け皿はどちらも Discovery フォーム（`plan` 隠しフィールド＝`cyber`）。
 * `ref` で「どの Brief のバナーの、どちらのボタンか」を分ける:
 *   brief_banner_<NNN>_early（早期アクセス）／brief_banner_<NNN>_review（点検）。
 * 計測: 表示（50% 見えたら1回）を `brief_service_banner_view`、クリックを
 * `brief_service_banner_click`（cta_label で early/review）で GA4 へ。
 */
import type { Locale } from "../i18n/translations";
import { DISCOVERY_CALL_URL } from "./cta";

export type ServiceBannerKey = "cyber-early-access";

interface ReviewCopy {
  readonly title: string;
  readonly steps: readonly { readonly t: string; readonly d: string }[];
  readonly link: string;
}

interface BannerCopy {
  readonly eyebrow: string;
  readonly head: string;
  readonly body: string;
  readonly button: string;
  readonly prLabel: string;
  /** 導入前の点検（JA のみ）。無ければ出さない。 */
  readonly review?: ReviewCopy;
}

const COPY: Readonly<Record<ServiceBannerKey, Readonly<Record<Locale, BannerCopy>>>> = {
  "cyber-early-access": {
    ja: {
      eyebrow: "LEMMA CYBER · 早期アクセス",
      head: "後戻りできない操作を、\n確定の前に確かめる。",
      body: "振込先や権限の変更など、後戻りできない操作の前に、その依頼が本物で、許された範囲のものかを確かめる仕組みを準備しています。早期アクセスの登録を受け付けています。",
      button: "早期アクセスに登録する →",
      prLabel: "PR",
      review: {
        title: "導入前の点検も、担当者がついてご相談いただけます（国内企業向け）",
        steps: [
          { t: "事案から、自社の論点へ", d: "Brief と AI セキュリティの知見をもとに、組織の業務で起こりうることを一緒に洗い出します" },
          { t: "攻撃シミュレーションで点検", d: "実際の手口を模した試験で、止まる箇所と通ってしまう箇所を確かめます" },
          { t: "報告と改善の提案", d: "見つかった穴と手当ての選択肢を、優先順位をつけてお渡しします" },
        ],
        link: "点検について相談する →",
      },
    },
    en: {
      eyebrow: "LEMMA CYBER · EARLY ACCESS",
      head: "Check irreversible actions\nbefore they go through.",
      body: "We are building a way to confirm, before a payout or permission change takes effect, that the request is genuine and within what was allowed. Early access is open.",
      button: "Join early access →",
      prLabel: "PR",
    },
  },
};

/** 許可リスト。slug → バナー。ここに無い Brief には出さない。 */
const BANNER_BY_SLUG: Readonly<Record<string, ServiceBannerKey>> = {
  "032-booking-payout-account-tampering": "cyber-early-access",
};

export interface ServiceBanner extends BannerCopy {
  readonly key: ServiceBannerKey;
  readonly href: string;
  readonly reviewHref?: string;
}

function inquiryUrl(locale: Locale, briefNoPad: string, intent: "early" | "review"): string {
  const params = new URLSearchParams({
    plan: "cyber",
    ref: `brief_banner_${briefNoPad}_${intent}`,
    utm_source: "brief_banner",
    utm_medium: "cta",
    utm_campaign: intent === "early" ? "brief_to_cyber_early_access" : "brief_to_cyber_review",
    utm_content: briefNoPad,
  });
  return `${DISCOVERY_CALL_URL[locale]}?${params}`;
}

export function serviceBannerFor(
  slug: string,
  briefNoPad: string,
  locale: Locale,
): ServiceBanner | null {
  const key = BANNER_BY_SLUG[slug];
  if (!key) return null;
  const copy = COPY[key][locale];
  return {
    key,
    ...copy,
    href: inquiryUrl(locale, briefNoPad, "early"),
    reviewHref: copy.review ? inquiryUrl(locale, briefNoPad, "review") : undefined,
  };
}

/**
 * Brief 一覧の「点検」帯（2026-10-17）。JA は点検の相談、EN は Cyber の早期
 * アクセス（伴走の点検は国内のみのため）。`ref` は brief_index_<intent>。
 */
export interface IndexBanner {
  readonly label: string;
  readonly head: string;
  readonly body: string;
  readonly button: string;
  readonly href: string;
}

export function indexBannerFor(locale: Locale): IndexBanner {
  const intent = locale === "ja" ? "review" : "early";
  const params = new URLSearchParams({
    plan: "cyber",
    ref: `brief_index_${intent}`,
    utm_source: "brief_index",
    utm_medium: "cta",
    utm_campaign: intent === "early" ? "brief_to_cyber_early_access" : "brief_to_cyber_review",
  });
  const href = `${DISCOVERY_CALL_URL[locale]}?${params}`;
  return locale === "ja"
    ? {
        label: "Lemma の点検サービス",
        head: "この手口が自社に通るか、点検で確かめる",
        body: "事案から論点を洗い出し、攻撃シミュレーションで確かめ、報告にまとめます。",
        button: "点検を相談する →",
        href,
      }
    : {
        label: "Lemma Cyber · early access",
        head: "Check irreversible actions before they go through",
        body: "We are building a way to confirm, before a payout or permission change takes effect, that the request is genuine and within what was allowed.",
        button: "Join early access →",
        href,
      };
}
