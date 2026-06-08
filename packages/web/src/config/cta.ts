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
