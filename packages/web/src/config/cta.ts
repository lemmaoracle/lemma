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
