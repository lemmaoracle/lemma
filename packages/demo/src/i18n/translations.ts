/**
 * i18n: locale type and translation loader for ja/en.
 *
 * Tutorial fields (stakes / businessImpact / failReason / counterFactual)
 * are populated for sample-driven rows so the Oracle Pipeline demo's
 * detail panel doubles as a "why this matters in your business"
 * explainer — restoring the original demo's purpose after the
 * Oracle Pipeline redesign trimmed them.
 */

import en from "./en.json";
import ja from "./ja.json";

export type Locale = "en" | "ja";

export interface SampleCopy {
  /** Short label shown on the sample chip. */
  readonly chip: string;
  /** Paragraph scenario shown at the top of the detail panel. */
  readonly scenario: string;
  /**
   * Outcome note rendered on the timeline. For pass samples this is the
   * positive line under "On-chain Verified"; for fail samples it is the
   * error line under whichever step rejects the document.
   */
  readonly outcome: string;
  /**
   * 2–3 bullets: what the verifier is checking for in this scenario
   * (privacy preserved, audit trail produced, settlement integrity, …).
   * Surfaced in the detail panel under "What's at stake".
   */
  readonly stakes: ReadonlyArray<string>;
  /**
   * 3 bullets for pass samples: what changes operationally once the
   * proof is verified (audit response in under a second vs ~3 days of
   * manual review, …). Empty for fail samples.
   */
  readonly businessImpact: ReadonlyArray<string>;
  /**
   * Plain-language explanation of why this sample fails. Empty for
   * pass samples.
   */
  readonly failReason: string;
  /**
   * For fail samples only: a 3 × 3 comparison of what happens without
   * Lemma vs with Lemma. Surfaced as the "Counter-factual" section.
   */
  readonly counterFactual?: Readonly<{
    readonly without: ReadonlyArray<string>;
    readonly with: ReadonlyArray<string>;
  }>;
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
    /** "Or upload your own proof JSON" heading. */
    readonly uploadLabel: string;
    /** File picker button label. */
    readonly uploadCta: string;
    /** Helper text under the upload control. */
    readonly uploadNote: string;
    /** Shown briefly when a custom JSON parses successfully. */
    readonly uploadSuccess: string;
    /** Prefix for parse-error messages: "Could not parse JSON: …". */
    readonly uploadErrorPrefix: string;
    /** Default chip label for a row spawned from a custom upload. */
    readonly customChip: string;
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
    readonly scenario: string;
    /** "What this protects" section heading (was "What's at stake"). */
    readonly whatAtStake: string;
    /** "What changes with Lemma" section heading (pass samples). */
    readonly businessImpact: string;
    /** "What went wrong" section heading (fail samples). */
    readonly whatWentWrong: string;
    /** Counter-factual sub-headings. */
    readonly counterFactualWithout: string;
    readonly counterFactualWith: string;
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
