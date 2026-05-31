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
  ja: "https://tally.so/r/Pd2Rl5",
  en: "https://tally.so/r/Pd2Rl5",
} as const;

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
