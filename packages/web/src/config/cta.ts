/**
 * Discovery Call CTA — single source of truth for the inquiry CTA across
 * the site. Templates and locale-specific pages import from here instead
 * of hardcoding labels or URLs.
 *
 * To swap the inquiry form (e.g., move from Tally to Calendly), change
 * the URLs here. Labels are kept per-locale so the section heading
 * pairs cleanly with the button label on every page.
 *
 * Out of scope (not Discovery Call):
 *   - Trust402 demo / waitlist
 *   - Whitepaper downloads
 *   - Partner candidate registration
 *   - Header / footer "Contact" menu items
 */

import type { Locale } from "../i18n/translations";

export const DISCOVERY_CALL_URL: Readonly<Record<Locale, string>> = {
  ja: "https://tally.so/r/EkBqDX",
  en: "https://tally.so/r/Pd2Rl5",
} as const;

/**
 * Self-serve entry point ("Get Started" / 始める). Used by the global Nav
 * button and the homepage Hero primary CTA — a self-serve B2B SaaS pattern
 * that routes high-intent readers straight to the Dashboard. Opens in a new
 * tab (external app). Locale-agnostic. The high-friction Discovery Call is
 * kept for in-page CTAs (Pillar §6 / Use Case §4 / Solutions §6), not the Nav.
 */
/**
 * Brief 右レール（脅威タイプ別バナー）の CTA。**この1か所で差し替える。**
 *
 * 2026-08-21 時点は Critical Weekly の購読フォーム（入力はメール1項目）。
 * 「デモをリクエスト」→ Discovery Call だった枠を、軽い接点に置き換えた:
 *   - 旧 CTA は 90日でクリック0。末尾CTAのエンタープライズ相談と役割も重複。
 *   - 資料請求は候補に挙がったが、WP の中身が古く出せるものが無い（4フォーム
 *     合計でも開設以来5件しか申請が無く、受け皿として機能していない）。
 *   - 購読フォームは「2.5か月で購読者0」ではなく実態は「90日で4クリックしか
 *     到達していない」で、露出不足。全 Brief ページの sticky 枠に文脈つきで
 *     出すのは初めての本番テストになる。
 * 後日ホワイトペーパーや軽量の質問フォームに替えるときは、ここだけ変える。
 * `ref` は購読フォームの隠しフィールドで、面ごとの流入を Tally 側で分けるため。
 */
export const BRIEF_RAIL_CTA_URL: Readonly<Record<Locale, string>> = {
  ja: "https://tally.so/r/EkMj82?ref=brief_rail&utm_source=brief_rail&utm_medium=cta&utm_campaign=brief_to_weekly",
  en: "https://tally.so/r/rjvN2X?ref=brief_rail&utm_source=brief_rail&utm_medium=cta&utm_campaign=brief_to_weekly",
} as const;

/**
 * セルフチェック（/ja/critical/self-check/）の結果から開く「メールで相談」の
 * Tally のフォーム（2026-10-24・日本語だけ）。ページが ops（選んだ業務）・
 * gaps（「はい」と言い切れなかった項目の番号）・ref を足して開く。
 */
export const CONSULT_FORM_URL =
  "https://tally.so/r/2jE9dj?utm_source=selfcheck&utm_medium=cta&utm_campaign=selfcheck_to_consult" as const;

/** 定期のメールの登録（日本語）。セルフチェックの結果の下の小さな入口。 */
export const BRIEF_WEEKLY_URL =
  "https://tally.so/r/EkMj82?ref=selfcheck&utm_source=selfcheck&utm_medium=cta&utm_campaign=selfcheck_to_weekly" as const;

/**
 * 記事の対策の章、チェックリストのあとの入口（2026-10-24）。
 * 本文は登録なしで全部読めるまま。日本語はセルフチェックのページ（記事の
 * slug を ?from= で足す：BriefWeeklyCta・サイトの中のリンクなので utm は
 * 付けない＝GA の流入元を上書きしない。どこから来たかはクリックのイベントで見る）、英語は定期のメールの Tally の
 * フォーム。`ref` で置き場所を分ける。
 */
export const BRIEF_CHECKLIST_CTA_URL: Readonly<Record<Locale, string>> = {
  ja: "/ja/critical/self-check/",
  en: "https://tally.so/r/rjvN2X?ref=brief_checklist&utm_source=brief_checklist&utm_medium=cta&utm_campaign=brief_to_weekly",
} as const;

/**
 * 訴求ごとのセルフチェックのページ（2026-10-25・日本語だけ）。今は不正送金の
 * 1 ページだけ。アカウントの乗っ取り・情報の流出のページができたら、ここに足して
 * `selfCheckPathFor` の振り分けを直す（記事の入口はこの 1 か所で付け替わる）。
 */
export const SELF_CHECK_PAGES = {
  remittance: { path: "/ja/critical/self-check/", label: "不正送金の対策チェックツール" },
} as const;

export type SelfCheckPageKey = keyof typeof SELF_CHECK_PAGES;

/**
 * 記事の業務（operations）から、飛ばすセルフチェックのページを決める。当たるページが
 * 無ければ null（記事の入口はメールの相談が主になる・2026-10-25）。不正送金のページに
 * 情報の流出やアカウントの事件から飛ばすと、題材がずれる。
 */
export function selfCheckPageFor(operations: ReadonlyArray<string> = []): SelfCheckPageKey | null {
  return operations.includes("payment-change") ? "remittance" : null;
}

/** 同じ入口の、記事の TL;DR のあとの 1 行（2026-10-24）。 */
export const BRIEF_TLDR_CTA_URL: Readonly<Record<Locale, string>> = {
  ja: "/ja/critical/self-check/",
  en: "https://tally.so/r/rjvN2X?ref=brief_tldr&utm_source=brief_tldr&utm_medium=cta&utm_campaign=brief_to_weekly",
} as const;

export const DASHBOARD_URL = "https://dashboard.lemma.workers.dev" as const;

export const DISCOVERY_CALL: Readonly<
  Record<Locale, { readonly sectionHeading: string; readonly buttonLabel: string }>
> = {
  ja: {
    sectionHeading: "Lemma Discovery Call — まずは30分、会話から",
    buttonLabel: "Discovery Call を予約 →",
  },
  en: {
    sectionHeading: "Lemma Discovery Call — Start with a 30-minute conversation",
    buttonLabel: "Book a Discovery Call →",
  },
} as const;
