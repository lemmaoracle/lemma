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
    readonly languageJa: string;
    readonly languageEn: string;
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
  }>;
  readonly blog: Readonly<{
    readonly title: string;
    readonly subtitle: string;
    readonly backToBlog: string;
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
  readonly layout: Readonly<{
    readonly defaultTitle: string;
    readonly defaultDescription: string;
  }>;
}

const translations: Readonly<Record<Locale, Translations>> = {
  en: en as Translations,
  ja: ja as Translations,
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
