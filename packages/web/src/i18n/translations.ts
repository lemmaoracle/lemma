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
        readonly pillar02: string;
        readonly pillar03: string;
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
        readonly blog: string;
        readonly whitepaper: string;
        readonly glossary: string;
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
  }>;
  readonly services: Readonly<{
    readonly title: string;
    readonly metaDescription: string;
    readonly hero: Readonly<{
      readonly eyebrow: string;
      readonly title: string;
      readonly sub: string;
      readonly ctaDownload: string;
      readonly ctaDemo: string;
      readonly scroll: string;
    }>;
    readonly problem: Readonly<{
      readonly label: string;
      readonly title: string;
      readonly lead: string;
      readonly tableHeaderCategory: string;
      readonly tableHeaderContent: string;
      readonly issue1Tag: string;
      readonly issue1Content: string;
      readonly issue2Tag: string;
      readonly issue2Content: string;
      readonly issue3Tag: string;
      readonly issue3Content: string;
      readonly issue4Tag: string;
      readonly issue4Content: string;
      readonly highlight: string;
    }>;
    readonly walls: Readonly<{
      readonly label: string;
      readonly title: string;
      readonly wall1Num: string;
      readonly wall1Title: string;
      readonly wall1Body: string;
      readonly wall1Links: ReadonlyArray<Readonly<{ text: string; href: string }>>;
      readonly wall2Num: string;
      readonly wall2Title: string;
      readonly wall2Body: string;
      readonly wall2Links: ReadonlyArray<Readonly<{ text: string; href: string }>>;
      readonly wall3Num: string;
      readonly wall3Title: string;
      readonly wall3Body: string;
      readonly wall3Links: ReadonlyArray<Readonly<{ text: string; href: string }>>;
    }>;
    readonly solution: Readonly<{
      readonly label: string;
      readonly title: string;
      readonly lead: string;
      readonly pillars: ReadonlyArray<Readonly<{
        readonly num: string;
        readonly title: string;
        readonly desc: string;
        readonly href: string;
      }>>;
      readonly badge: string;
    }>;
    readonly beforeAfter: Readonly<{
      readonly label: string;
      readonly title: string;
      readonly lead: string;
      readonly beforeLabel: string;
      readonly afterLabel: string;
      readonly before1Label: string;
      readonly before1Text: string;
      readonly before2Label: string;
      readonly before2Text: string;
      readonly before3Label: string;
      readonly before3Text: string;
      readonly before4Label: string;
      readonly before4Text: string;
      readonly before5Label: string;
      readonly before5Text: string;
      readonly before6Label: string;
      readonly before6Text: string;
      readonly after1Label: string;
      readonly after1Text: string;
      readonly after2Label: string;
      readonly after2Text: string;
      readonly after3Label: string;
      readonly after3Text: string;
      readonly after4Label: string;
      readonly after4Text: string;
      readonly after5Label: string;
      readonly after5Text: string;
      readonly after6Label: string;
      readonly after6Text: string;
    }>;
    readonly checklist: Readonly<{
      readonly label: string;
      readonly title: string;
      readonly lead: string;
      readonly item1: string;
      readonly item2: string;
      readonly item3: string;
      readonly item4: string;
      readonly item5: string;
      readonly item6: string;
      readonly resultPrefix: string;
      readonly resultSuffix: string;
    }>;
    readonly plans: Readonly<{
      readonly label: string;
      readonly title: string;
      readonly lead: string;
      readonly items: ReadonlyArray<Readonly<{
        readonly name: string;
        readonly desc: string;
        readonly href: string;
      }>>;
    }>;
    readonly demo: Readonly<{
      readonly eyebrow: string;
      readonly title: string;
      readonly lead: string;
      readonly cta: string;
      readonly href: string;
    }>;
    readonly cta: Readonly<{
      readonly title: string;
      readonly desc: string;
      readonly wpContent1: string;
      readonly wpContent2: string;
      readonly wpContent3: string;
      readonly wpContent4: string;
      readonly hubspotFormUrl: string;
      readonly partnerCta: string;
    }>;
    readonly nav: Readonly<{
      readonly whitepaperDownload: string;
      readonly darkModeToggle: string;
      readonly lightModeToggle: string;
    }>;
    readonly skipLink: string;
  }>;
  readonly demoCta: Readonly<{
    readonly tag: string;
    readonly title: string;
    readonly lead: string;
    readonly ctaLabel: string;
    readonly pairLinkLabel: string;
  }>;
  readonly index: Readonly<{
    readonly hero: Readonly<{
      readonly eyebrow: string;
      readonly h1: string;
      readonly sub: string;
      readonly primaryCta: string;
      readonly primaryCtaHref: string;
      readonly secondaryCta: string;
      readonly secondaryCtaHref: string;
    }>;
    readonly trustLayer: Readonly<{
      readonly eyebrow: string;
      readonly h2: string;
      readonly barLabel: string;
      readonly barFoot: string;
      readonly modules: Readonly<{
        readonly origin: Readonly<{ readonly title: string; readonly desc: string; readonly tech: string; readonly href: string }>;
        readonly ai: Readonly<{ readonly title: string; readonly desc: string; readonly tech: string; readonly href: string }>;
        readonly authority: Readonly<{ readonly title: string; readonly desc: string; readonly tech: string; readonly href: string }>;
        readonly regulatory: Readonly<{ readonly title: string; readonly desc: string; readonly tech: string; readonly href: string }>;
      }>;
    }>;
    readonly featured: Readonly<{
      readonly eyebrow: string;
      readonly title: string;
      readonly subtitle: string;
      readonly cta: string;
    }>;
    readonly nowBanner: Readonly<{
      readonly eyebrow: string;
      readonly text: string;
      readonly cta: string;
      readonly href: string;
    }>;
    readonly lemmaFor: Readonly<{
      readonly eyebrow: string;
      readonly h2Line1: string;
      readonly h2Line2: string;
      readonly lead: string;
      readonly cards: ReadonlyArray<{
        readonly tag: string;
        readonly titleLine1: string;
        readonly titleLine2: string;
        readonly body: string;
        readonly cases: string;
        readonly href: string;
      }>;
      readonly seeAll: string;
      readonly seeAllHref: string;
    }>;
    readonly thinking: Readonly<{
      readonly title: string;
      readonly lead: string;
      readonly seeAll: string;
    }>;
    readonly partner: Readonly<{
      readonly label: string;
      readonly h2Line1: string;
      readonly h2Line2: string;
      readonly body: string;
      readonly primaryCta: string;
      readonly secondaryCta: string;
    }>;
  }>;
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
  readonly pillars: Readonly<{
    readonly title: string;
    readonly heroTitle: string;
    readonly subtitle: string;
    readonly categoryEyebrow: string;
    readonly categoryAttribution: string;
    readonly viewPillar: string;
    readonly blockProblem: string;
    readonly blockWhyNow: string;
    readonly blockHowLemmaFits: string;
    readonly blockUseCases: string;
    readonly blockRecentThinking: string;
    readonly blockOtherPillars: string;
    readonly viewUseCase: string;
    readonly comingSoon: string;
    readonly ctaEyebrow: string;
    readonly ctaTitle: string;
    readonly ctaDesc: string;
    /** v2 redesign — Index hero (replaces single heroTitle). Lines render
     * stacked with a hard break between them. */
    readonly heroH1Lines: ReadonlyArray<string>;
    /** v2 redesign — Hero sub paragraph (4-question setup). */
    readonly heroSub: string;
    /** v2 redesign — Four-questions block under the hero. */
    readonly questionsLabel: string;
    readonly questions: ReadonlyArray<Readonly<{
      readonly tag: string;
      readonly stem: string;
      readonly answer: string;
    }>>;
    /** v2 redesign — Composition diagram section. */
    readonly compositionLabel: string;
    readonly compositionH2: string;
    readonly compositionCenterLabel: string;
    readonly compositionCaption: string;
    /** v2 redesign — Technical docs section (demoted). */
    readonly technicalDocsLabel: string;
    readonly technicalDocsH2: string;
    /** v2 detail concept-hub — §1-§4 section labels and sub-headings. */
    readonly conceptSec1Label: string;
    readonly conceptSec2Label: string;
    readonly conceptSec3Label: string;
    readonly conceptSec4Label: string;
    readonly conceptIncidentsHeading: string;
    readonly conceptRegulatoryHeading: string;
    readonly conceptReadBrief: string;
    readonly conceptViewUseCase: string;
    readonly conceptApproachLinksLabel: string;
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
      readonly ai: string;
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
