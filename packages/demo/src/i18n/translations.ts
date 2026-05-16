/**
 * i18n: locale type and translation loader for ja/en.
 *
 * Restructured for the Oracle Pipeline demo view: the previous editorial
 * surface (hero, "how it works", trust badges, CTA, counter-factual) is
 * gone, replaced by a dashboard-like shell with a compact demo banner +
 * sample-chip walkthrough. Strings shrink accordingly.
 *
 * `samples` keeps a per-sample chip label + outcome line for the inline
 * verification flow that runs when the user picks a chip; the long-form
 * scenario / business-impact bullets that lived in the old design are
 * dropped.
 */

import en from "./en.json";
import ja from "./ja.json";

export type Locale = "en" | "ja";

export interface SampleCopy {
  /** Short label shown on the sample chip. */
  readonly chip: string;
  /** One-line scenario shown when the row is opened in the detail panel. */
  readonly scenario: string;
  /**
   * Outcome note rendered on the timeline. For pass samples this is the
   * positive line under "On-chain Verified"; for fail samples it is the
   * error line under whichever step rejects the document.
   */
  readonly outcome: string;
}

export interface Translations {
  readonly meta: Readonly<{
    readonly title: string;
    readonly description: string;
  }>;
  readonly brand: Readonly<{
    readonly name: string;
    readonly demoBadge: string;
    readonly versionPrefix: string;
  }>;
  readonly nav: Readonly<{
    readonly overview: string;
  }>;
  readonly topbar: Readonly<{
    readonly title: string;
    readonly subtitle: string;
    readonly searchPlaceholder: string;
    readonly themeToggleLabel: string;
    readonly langToggleLabel: string;
    readonly otherLocaleLabel: string;
  }>;
  readonly demoBanner: Readonly<{
    readonly pill: string;
    readonly title: string;
    readonly body: string;
    readonly walkthrough: string;
  }>;
  readonly sampleStrip: Readonly<{
    readonly label: string;
    readonly hint: string;
    readonly industryFinancial: string;
    readonly industryManufacturing: string;
    readonly industryAgent: string;
  }>;
  readonly tabs: Readonly<{
    readonly all: string;
    readonly received: string;
    readonly verifying: string;
    readonly verified: string;
    readonly onchain: string;
    readonly rejected: string;
  }>;
  readonly table: Readonly<{
    readonly document: string;
    readonly schema: string;
    readonly status: string;
    readonly chain: string;
    readonly updated: string;
    readonly empty: string;
    /** "Showing {n} items" — replace {n} at render time. */
    readonly showing: string;
  }>;
  readonly detail: Readonly<{
    readonly titleSuffix: string;
    readonly closeLabel: string;
    readonly verificationPipeline: string;
    readonly documentInfo: string;
    readonly cryptographic: string;
    readonly hookExecutions: string;
    readonly onchain: string;
    readonly steps: Readonly<{
      readonly registered: string;
      readonly verifying: string;
      readonly offchain: string;
      readonly onchain: string;
    }>;
    readonly fields: Readonly<{
      readonly docHash: string;
      readonly schema: string;
      readonly ipfsCid: string;
      readonly issuer: string;
      readonly subject: string;
      readonly commitmentScheme: string;
      readonly commitmentRoot: string;
      readonly revocationRoot: string;
      readonly signatureFormat: string;
      readonly chain: string;
    }>;
    readonly hookStatusSucceeded: string;
    readonly hookStatusFailed: string;
  }>;
  readonly footbar: Readonly<{
    readonly network: string;
    readonly apiHealthy: string;
    readonly browserOnly: string;
    readonly github: string;
    readonly githubHref: string;
    readonly privacy: string;
    readonly privacyHref: string;
    readonly microsite: string;
    readonly micrositeHref: string;
  }>;
  /**
   * Per-sample chip copy. Keys are Sample.id from `data/fixtures.ts`.
   * Missing keys fall back to a generic "Sample" label at runtime.
   */
  readonly samples: Readonly<Record<string, SampleCopy>>;
}

const ALL: Readonly<Record<Locale, Translations>> = {
  en: en as Translations,
  ja: ja as Translations,
} as const;

export function getTranslations(locale: Locale): Translations {
  return ALL[locale];
}

export const SUPPORTED_LOCALES: ReadonlyArray<Locale> = ["en", "ja"];
