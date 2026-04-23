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
    readonly faq: string;
    readonly services: string;
    readonly pricing: string;
    readonly developers: string;
    readonly languageJa: string;
    readonly languageEn: string;
    readonly mega: Readonly<{
      readonly services: Readonly<{
        readonly enterprise: string;
        readonly civic: string;
        readonly civicSub: string;
        readonly critical: string;
        readonly criticalSub: string;
        readonly compliance: string;
        readonly complianceSub: string;
        readonly howItWorks: string;
        readonly howItWorksSub: string;
        readonly materials: string;
        readonly whitepaper: string;
        readonly whitepaperSub: string;
        readonly developer: string;
        readonly trust402Demo: string;
        readonly trust402Sub: string;
        readonly tryDemo: string;
        readonly joinWaitlist: string;
      }>;
      readonly pricing: Readonly<{
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
        readonly x402: string;
        readonly demoSoon: string;
        readonly demoSub: string;
        readonly joinWaitlist: string;
        readonly tryDemo: string;
        readonly readSpecs: string;
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
    readonly subtitle: string;
    readonly backToBlog: string;
    readonly index: Readonly<{
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
    readonly hero: Readonly<{
      readonly tag: string;
      readonly h1: string;
      readonly p: string;
    }>;
    readonly sections: ReadonlyArray<{
      readonly title: string;
      readonly items: ReadonlyArray<{
        readonly q: string;
        readonly a: string;
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
    readonly hero: Readonly<{
      readonly title: string;
      readonly sub: string;
      readonly stat: string;
      readonly ctaDownload: string;
      readonly linkDetails: string;
      readonly scroll: string;
    }>;
    readonly stats: Readonly<{
      readonly stat1Label: string;
      readonly stat1Num: string;
      readonly stat1Desc: string;
      readonly stat2Label: string;
      readonly stat2Num: string;
      readonly stat2Desc: string;
      readonly stat3Label: string;
      readonly stat3Num: string;
      readonly stat3Desc: string;
    }>;
    readonly problem: Readonly<{
      readonly label: string;
      readonly title: string;
      readonly lead: string;
      readonly tableHeaderCategory: string;
      readonly tableHeaderContent: string;
      readonly tableHeaderRate: string;
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
      readonly wall2Num: string;
      readonly wall2Title: string;
      readonly wall2Body: string;
      readonly wall3Num: string;
      readonly wall3Title: string;
      readonly wall3Body: string;
    }>;
    readonly solution: Readonly<{
      readonly label: string;
      readonly title: string;
      readonly lead: string;
      readonly func1Num: string;
      readonly func1Name: string;
      readonly func1Desc: string;
      readonly func2Num: string;
      readonly func2Name: string;
      readonly func2Desc: string;
      readonly func3Num: string;
      readonly func3Name: string;
      readonly func3Desc: string;
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
    readonly cta: Readonly<{
      readonly title: string;
      readonly desc: string;
      readonly wpContent1: string;
      readonly wpContent2: string;
      readonly wpContent3: string;
      readonly wpContent4: string;
      readonly hubspotFormUrl: string;
    }>;
    readonly nav: Readonly<{
      readonly whitepaperDownload: string;
      readonly darkModeToggle: string;
      readonly lightModeToggle: string;
    }>;
    readonly footer: Readonly<{
      readonly copyright: string;
      readonly contact: string;
      readonly contactEmail: string;
    }>;
    readonly skipLink: string;
  }>;
  readonly index: Readonly<{
    readonly hero: Readonly<{
      readonly eyebrow: string;
      readonly h1: string;
      readonly h1Strong: string;
      readonly sub: string;
      readonly cta: string;
      readonly wp: string;
      readonly scroll: string;
    }>;
    readonly marquee: string;
    readonly features: Readonly<{
      readonly tag: string;
      readonly h2: string;
      readonly lead: string;
      readonly cards: ReadonlyArray<{
        readonly num: string;
        readonly h3: string;
        readonly p: string;
        readonly link: string;
      }>;
    }>;
    readonly proof: Readonly<{
      readonly tag: string;
      readonly h2: string;
      readonly h2Strong: string;
      readonly p: string;
      readonly cta: string;
      readonly stats: ReadonlyArray<{
        readonly n: string;
        readonly nUnit?: string;
        readonly l: string;
      }>;
    }>;
    readonly essays: Readonly<{
      readonly tag: string;
      readonly h2: string;
      readonly p: string;
    }>;
    readonly cta: Readonly<{
      readonly eyebrow: string;
      readonly h2: string;
      readonly h2Em: string;
      readonly p: string;
      readonly cta: string;
      readonly wp: string;
    }>;
  }>;
  readonly pricing: Readonly<{
    readonly hero: Readonly<{
      readonly eyebrow: string;
      readonly h1: string;
      readonly h1Em: string;
      readonly p: string;
    }>;
    readonly notice: string;
    readonly nav: Readonly<{
      readonly wp: string;
    }>;
    readonly enterprise: Readonly<{
      readonly tag: string;
      readonly h2: string;
      readonly p: string;
      readonly plans: ReadonlyArray<{
        readonly tag: string;
        readonly name: string;
        readonly sub: string;
        readonly bestFor: string;
        readonly features: ReadonlyArray<string>;
        readonly tiers: ReadonlyArray<ReadonlyArray<string>>;
        readonly priceNote: string;
        readonly cta: string;
      }>;
    }>;
    readonly dev: Readonly<{
      readonly tag: string;
      readonly h2: string;
      readonly p: string;
      readonly plans: ReadonlyArray<{
        readonly name: string;
        readonly desc: string;
        readonly badge: string;
      }>;
      readonly cta: string;
      readonly note: string;
    }>;
    readonly compare: Readonly<{
      readonly tag: string;
      readonly h2: string;
      readonly headers: ReadonlyArray<string>;
      readonly rows: ReadonlyArray<ReadonlyArray<string>>;
    }>;
    readonly faqSection: Readonly<{
      readonly tag: string;
      readonly title: string;
      readonly items: ReadonlyArray<{
        readonly q: string;
        readonly a: string;
      }>;
    }>;
    readonly cta: Readonly<{
      readonly eyebrow: string;
      readonly h2: string;
      readonly h2Em: string;
      readonly p: string;
      readonly cta1: string;
      readonly cta2: string;
    }>;
  }>;
}

const translations: Readonly<Record<Locale, Translations>> = {
  en: en as Translations,
  ja: ja as Translations,
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
