/**
 * i18n: locale type and translation loader for ja/en.
 */

import en from "./en.json";
import ja from "./ja.json";

export type Locale = "en" | "ja";

export interface Translations {
  readonly nav: Readonly<{
    readonly lemmaOracle: string;
    readonly overview: string;
    readonly changelog: string;
    readonly essays: string;
    readonly blog: string;
    readonly pillars: string;
    readonly faq: string;
    readonly services: string;
    readonly pricing: string;
    readonly solutions: string;
    readonly resources: string;
    readonly developers: string;
    readonly contact: string;
    readonly contactCta: string;
    readonly whitepaperCta: string;
    readonly dashboardCta: string;
    readonly languageJa: string;
    readonly languageEn: string;
    readonly mega: Readonly<{
      readonly pillars: Readonly<{
        readonly label: string;
        readonly overview: string;
        readonly overviewSub: string;
        readonly pillar01: string;
        readonly auth: string;
        readonly pillar03: string;
        readonly pillar02: string;
        readonly pillar04: string;
      }>;
      readonly products: Readonly<{
        readonly enterprise: string;
        readonly civic: string;
        readonly civicSub: string;
        readonly critical: string;
        readonly criticalSub: string;
        readonly compliance: string;
        readonly complianceSub: string;
        readonly developer: string;
        readonly agentDeveloper: string;
        readonly lemmaApi: string;
        readonly lemmaApiSub: string;
        readonly trust402Pay: string;
        readonly trust402PaySub: string;
        readonly trust402Sell: string;
        readonly trust402SellSub: string;
        readonly institutionalId: string;
        readonly institutionalIdSub: string;
        readonly devResources: string;
        readonly seeAllPricing: string;
        readonly sealSub: string;
        readonly industriesSub: string;
        readonly trust402: string;
        readonly trust402Sub: string;
        readonly pricing: string;
        readonly pricingSub: string;
      }>;
      readonly solutions: Readonly<{
        readonly label: string;
        readonly overview: string;
        readonly aiAudit: string;
        readonly kycAml: string;
        readonly supplyChain: string;
        readonly defiBridge: string;
      }>;
      readonly developers: Readonly<{
        readonly architecture: string;
        readonly specs: string;
        readonly specsSub: string;
        readonly guides: string;
        readonly encrypt: string;
        readonly encryptSub: string;
        readonly prove: string;
        readonly proveSub: string;
        readonly disclose: string;
        readonly discloseSub: string;
        readonly query: string;
        readonly querySub: string;
        readonly define: string;
        readonly defineSub: string;
        readonly provenance: string;
        readonly provenanceSub: string;
        readonly trust402: string;
        readonly demoSoon: string;
        readonly demoSub: string;
        readonly joinWaitlist: string;
        readonly tryDemo: string;
        readonly readSpecs: string;
        readonly whitepaper: string;
        readonly whitepaperSub: string;
        readonly github: string;
      }>;
      readonly resources: Readonly<{
        readonly label: string;
        readonly criticalBrief: string;
        readonly blog: string;
        readonly whitepaper: string;
        readonly glossary: string;
        readonly authenticity: string;
        readonly faq: string;
      }>;
      readonly mobile: Readonly<{
        readonly talkToUs: string;
      }>;
    }>;
  }>;
  readonly masthead: Readonly<{
    readonly title: string;
    readonly tagline: string;
    readonly ctaGetStarted: string;
    readonly ctaReadDocs: string;
  }>;
  readonly features: Readonly<{
    readonly sectionHeading: string;
    readonly encryptHeading: string;
    readonly encryptBody: string;
    readonly proveHeading: string;
    readonly proveBody: string;
    readonly discloseHeading: string;
    readonly discloseBody: string;
    readonly queryHeading: string;
    readonly queryBody: string;
    readonly schemaHeading: string;
    readonly schemaBody: string;
    readonly provenanceHeading: string;
    readonly provenanceBody: string;
  }>;
  readonly footer: Readonly<{
    readonly copyright: string;
    readonly aboutUs: string;
    readonly faq: string;
    readonly blog: string;
    readonly privacy: string;
    readonly terms: string;
    readonly tagline: string;
    readonly colCompany: string;
    readonly specs: string;
    readonly github: string;
    readonly smithery: string;
    readonly contact: string;
  }>;
  readonly ctaSection: Readonly<{
    readonly finalTag: string;
    readonly finalH2: string;
    readonly finalH2Em: string;
    readonly finalP: string;
    readonly finalCtaText: string;
    readonly finalWpText: string;
  }>;
  readonly blog: Readonly<{
    readonly title: string;
    readonly metaTitle: string;
    readonly metaDescription: string;
    readonly subtitle: string;
    readonly backToBlog: string;
    readonly index: Readonly<{
      readonly categoriesLabel: string;
      readonly allTag: string;
      readonly featuredTag: string;
      readonly featuredCta: string;
      readonly recentTag: string;
      readonly archiveTag: string;
      readonly foundationsTag: string;
      readonly headerDesc: string;
      readonly essaysTag: string;
      readonly readEssay: string;
      readonly guidesTag: string;
      readonly guidesTitle: string;
      readonly guidesDesc: string;
      readonly readGuide: string;
      readonly specsTitle: string;
      readonly specsDesc: string;
      readonly readSpecs: string;
    }>;
    readonly sections: Readonly<Record<string, string>>;
  }>;
  readonly rebuild: Readonly<{
    readonly title: string;
    readonly intro: string;
    readonly option1Title: string;
    readonly option1Desc: string;
    readonly option2Title: string;
    readonly option2Desc: string;
    readonly option2CurlNotePrefix: string;
    readonly option2CurlNoteSuffix: string;
    readonly backHome: string;
  }>;
  readonly faq: Readonly<{
    readonly title?: string;
    readonly subtitle?: string;
    readonly metaTitle: string;
    readonly metaDescription: string;
    readonly hero: Readonly<{
      readonly tag: string;
      readonly h1: string;
      readonly p: string;
    }>;
    /** "Find by intent" router cards above the FAQ proper. */
    readonly intentRouter: Readonly<{
      readonly label: string;
      readonly upperTierBadge: string;
      readonly items: ReadonlyArray<{
        readonly title: string;
        readonly desc: string;
        readonly href: string;
        readonly isUpperTier?: boolean;
      }>;
    }>;
    readonly searchPlaceholder: string;
    readonly noResultsText: string;
    readonly sections: ReadonlyArray<{
      /** Used as the anchor id (e.g. "trust-layers"). */
      readonly id: string;
      readonly title: string;
      readonly items: ReadonlyArray<{
        readonly q: string;
        readonly a: string;
        /** Optional pillar tag for chip coloring. */
        readonly pillar?: "p1" | "p2" | "p3" | "p4";
        /**
         * Optional "Related" links shown below the answer.
         * Used when the answer text references other pages.
         */
        readonly links?: ReadonlyArray<{
          readonly label: string;
          readonly href: string;
        }>;
      }>;
    }>;
    readonly sidebar: Readonly<{
      readonly title: string;
      readonly links: ReadonlyArray<string>;
    }>;
    readonly comparison: Readonly<{
      readonly h2: string;
      readonly headers: ReadonlyArray<string>;
      readonly rows: ReadonlyArray<ReadonlyArray<string>>;
      /** 0-based row indices to highlight. The Lemma row gets the brown emphasis. */
      readonly highlightRows?: ReadonlyArray<number>;
    }>;
    /** Bottom Critical Brief surface block (isolated from Q&A). */
    readonly criticalBriefBlock: Readonly<{
      readonly badge: string;
      readonly label: string;
      readonly h2: string;
      readonly body: string;
      readonly cta: ReadonlyArray<{
        readonly label: string;
        readonly href: string;
      }>;
    }>;
    readonly partner: Readonly<{
      readonly tag: string;
      readonly h2: string;
      readonly p: string;
      readonly cta: string;
      readonly link: string;
    }>;
  }>;
  readonly layout: Readonly<{
    readonly defaultTitle: string;
    readonly defaultDescription: string;
    /** og:site_name。ソーシャルカードの見出し上に出る小さなラベル。
     * ロケールごとに分ける（ベタ書きだと EN のカードに日本語が出る）。 */
    readonly siteName: string;
  }>;
  readonly demoCta: Readonly<{
    readonly tag: string;
    readonly title: string;
    readonly lead: string;
    readonly ctaLabel: string;
    readonly pairLinkLabel: string;
  }>;
  /** `services` and `index` blocks were removed for the same reason: the
   * /services/ pages became /solutions/ (copy now lives in
   * src/data/solutions.ts) and the homepage renders TopV47Template from
   * config/top-v47.{ja,en}.html, so neither JSON carries those keys. */
  /** Pricing page content is now sourced from src/data/pricing.ts as a
   * single typed const (the old i18n-based shape would have ballooned
   * the JSON files). The Translations interface no longer carries a
   * pricing block. */
  readonly thankYou: Readonly<{
    readonly eyebrow: string;
    readonly title: string;
    readonly titleEm: string;
    readonly sub: string;
    readonly dlCard: Readonly<{
      readonly label: string;
      readonly title: string;
      readonly desc: string;
      readonly button: string;
    }>;
    readonly next: Readonly<{
      readonly label: string;
      readonly title: string;
      readonly desc: string;
    }>;
  }>;
  /** Only the use-case detail/index templates consume this (as `pillarT`);
   * the retired pillars-hub copy was removed as dead strings. */
  readonly pillars: Readonly<{
    readonly viewUseCase: string;
    readonly ctaEyebrow: string;
    readonly ctaTitle: string;
    readonly ctaDesc: string;
  }>;
  readonly useCases: Readonly<{
    readonly title: string;
    readonly subtitle: string;
    readonly sections: string;
    readonly overview: string;
    readonly backToPillar: string;
    /** Index — industry chip filter labels. */
    readonly finderLabel: string;
    readonly industryAll: string;
    readonly industryLabels: Readonly<{
      readonly mfg: string;
      readonly fin: string;
      readonly pub: string;
      readonly sc: string;
      readonly svc: string;
      readonly ai: string;
      readonly edu: string;
      readonly dev: string;
    }>;
    /** Index — counts (use {n} for the number). */
    readonly countAll: string;
    readonly countMatch: string;
    readonly emptyState: string;
    readonly cardCta: string;
    /** Index — soft footer link to Critical Briefs (altitude reader path). */
    readonly briefLinkLabel: string;
  }>;
}

const translations: Readonly<Record<Locale, Translations>> = {
  en: en,
  ja: ja,
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
