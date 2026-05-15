/**
 * i18n: locale type and translation loader for ja/en.
 *
 * v0.3.1 — introduces JA simultaneous launch. Spec §6b governs locale rules.
 */

import en from "./en.json";
import ja from "./ja.json";

export type Locale = "en" | "ja";

export interface SampleCopy {
  readonly label: string;
  readonly scenario: string;
  readonly stakes: ReadonlyArray<string>;
  /** 3 business-impact bullets for pass samples; empty for fail samples. */
  readonly businessImpact: ReadonlyArray<string>;
  /** Plain-language fail reason for fail samples; empty for pass samples. */
  readonly failReason: string;
  /** Counter-factual pairs for fail samples (3 entries each); absent on pass samples. */
  readonly counterFactual?: Readonly<{
    readonly without: ReadonlyArray<string>;
    readonly with: ReadonlyArray<string>;
  }>;
}

export interface StepCopy {
  readonly label: string;
  readonly primitive: string;
  readonly subStages: ReadonlyArray<string>;
}

export interface PillarCopy {
  readonly title: string;
  readonly proofLabel: string;
  readonly href: string;
}

export interface Translations {
  readonly meta: Readonly<{
    readonly title: string;
    readonly description: string;
  }>;
  readonly header: Readonly<{
    readonly eyebrow: string;
    readonly h1Line1: string;
    readonly h1Line2: string;
    readonly lead: string;
    readonly equation: string;
    readonly langToggleLabel: string;
    readonly otherLocaleLabel: string;
  }>;
  readonly sampleChooser: Readonly<{
    readonly title: string;
    readonly sub: string;
    readonly industry: Readonly<{
      readonly financial: string;
      readonly manufacturing: string;
      readonly agent: string;
    }>;
    readonly badgeValid: string;
    readonly badgeInvalid: string;
    readonly stakesLabel: string;
    readonly regulatoryLabel: string;
    readonly primitivesLabel: string;
  }>;
  readonly customUpload: Readonly<{
    readonly cta: string;
    readonly note: string;
    readonly readyPrefix: string;
  }>;
  readonly verify: Readonly<{
    readonly button: string;
    readonly buttonInFlight: string;
    readonly hintPick: string;
    readonly hintReadySample: string;
    readonly hintReadyCustom: string;
  }>;
  readonly result: Readonly<{
    readonly passOverall: string;
    readonly failOverall: string;
    readonly sessionLabel: string;
    readonly browserOnlyBadge: string;
    readonly provenHeading: string;
    readonly impactHeading: string;
    readonly failHeading: string;
  }>;
  readonly verifyAnim: Readonly<{
    readonly steps: ReadonlyArray<StepCopy>;
    readonly statusPending: string;
    readonly statusVerifying: string;
    readonly statusPass: string;
    readonly statusFail: string;
    readonly failedStepSuffix: string;
    readonly traceToggleShow: string;
    readonly traceToggleHide: string;
    readonly traceAriaLabel: string;
  }>;
  readonly trustBadges: Readonly<{
    readonly primitivesLabel: string;
    readonly regulatoryLabel: string;
    readonly onChainLabel: string;
    readonly openSpecLabel: string;
    readonly openSpecHref: string;
  }>;
  readonly counterFactual: Readonly<{
    readonly withoutLabel: string;
    readonly withLabel: string;
  }>;
  readonly pillars: Readonly<{
    readonly verifiableOrigin: PillarCopy;
    readonly verifiableAi: PillarCopy;
    readonly agentAuthorityProof: PillarCopy;
    readonly regulatoryAttributeProof: PillarCopy;
  }>;
  readonly cta: Readonly<{
    readonly salesLabel: string;
    readonly salesTitle: string;
    readonly salesHref: string;
    readonly waitlistLabel: string;
    readonly waitlistTitle: string;
    readonly waitlistHref: string;
  }>;
  readonly footer: Readonly<{
    readonly tagline: string;
    readonly microsite: string;
    readonly micrositeHref: string;
    readonly github: string;
    readonly privacy: string;
    readonly privacyHref: string;
    readonly note: string;
  }>;
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
