/**
 * Critical Brief の「探し方」用ファセット語彙（2026-10・report レイアウト導入時）。
 *
 * report レイアウトの Brief は frontmatter に `industries` / `operations` /
 * `controls` を持つ。一覧ページで「業界で探す／業務で探す／対策で探す」の
 * チップを集計するための索引で、そのときのラベルとアイコンをここ1か所に置く。
 * 手口・業務・対策は、記事の「この手口・この対策で探す」（lib/briefNextRead.ts・
 * 2026-10-24）のタイルにも使う。記事中の「注意したい業界・業務」の表は md 側で
 * 説明文つきで書く（ラベルだけのチップより情報が多いため）。
 *
 * アイコンは承認済みモック（032_v8）の `<symbol>` をそのまま写した 22×22 の
 * 線画。`paths` は `<symbol viewBox="0 0 22 22" fill="none" stroke="currentColor"
 * stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">` の中身。
 *
 * 業界の slug は config/industriesV1.ts の INDUSTRIES_V1 と同じ並び・同じ値に
 * そろえる（業界ページへ飛ばすため）。industriesV1.ts は本文 HTML を `?raw` で
 * 抱えていて content.config.ts から読むには重いので、slug だけここに複製する。
 * 業界を足すときは両方を直すこと。
 */

export interface FacetEntry {
  readonly slug: string;
  readonly ja: string;
  readonly en: string;
  /** 22×22 の線画（symbol の中身）。 */
  readonly icon: string;
}

export const FACET_ICON_VIEWBOX = "0 0 22 22";
export const FACET_ICON_ATTRS = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.4",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

/** 業界（industriesV1 の slug と一致させる）。 */
export const BRIEF_INDUSTRY_SLUGS = [
  "manufacturing",
  "public-sector",
  "finance",
  "healthcare",
  "supply-chain",
  "media",
  "retail",
  "ai",
  "developers",
] as const;
export type BriefIndustrySlug = (typeof BRIEF_INDUSTRY_SLUGS)[number];

export const BRIEF_INDUSTRIES: Record<BriefIndustrySlug, FacetEntry> = {
  manufacturing: {
    slug: "manufacturing",
    ja: "製造・基幹インフラ",
    en: "Manufacturing & critical infrastructure",
    icon: '<path d="M3 18.5V9l5 3.2V9l5 3.2V9l5 3.2v6.3z"/><path d="M6.5 15.5h1M10.5 15.5h1M14.5 15.5h1"/>',
  },
  "public-sector": {
    slug: "public-sector",
    ja: "自治体・公共",
    en: "Government & public sector",
    icon: '<path d="M4 18.5h14M5.5 18.5V9.5M16.5 18.5V9.5M11 18.5V9.5"/><path d="M3.2 8.6L11 4.2l7.8 4.4"/>',
  },
  finance: {
    slug: "finance",
    ja: "金融・FinTech",
    en: "Finance & FinTech",
    icon: '<path d="M3.2 8.6L11 4.5l7.8 4.1"/><path d="M5.2 10.5v6M9 10.5v6M13 10.5v6M16.8 10.5v6"/><path d="M3 18.5h16"/>',
  },
  healthcare: {
    slug: "healthcare",
    ja: "医療・ヘルスケア",
    en: "Healthcare",
    icon: '<path d="M11 4.5v13M4.5 11h13"/><circle cx="11" cy="11" r="8.2"/>',
  },
  "supply-chain": {
    slug: "supply-chain",
    ja: "調達・サプライチェーン",
    en: "Procurement & supply chain",
    icon: '<path d="M3 7.5l8-3.3 8 3.3v7L11 17.8 3 14.5z"/><path d="M3 7.5l8 3.3 8-3.3M11 10.8v7"/>',
  },
  media: {
    slug: "media",
    ja: "メディア・コンテンツ",
    en: "Media & content",
    icon: '<rect x="3" y="5.5" width="16" height="11" rx="2"/><path d="M9 9.2l4.4 2.3L9 13.8z"/>',
  },
  retail: {
    slug: "retail",
    ja: "サービス・小売",
    en: "Services & retail",
    icon: '<path d="M4 8.5h14l-1 10H5z"/><path d="M8 8.5V6.6a3 3 0 016 0v1.9"/>',
  },
  ai: {
    slug: "ai",
    ja: "AI導入（業種横断）",
    en: "AI adoption (all industries)",
    icon: '<circle cx="11" cy="11" r="2.6"/><circle cx="11" cy="4.2" r="1.7"/><circle cx="4.6" cy="16" r="1.7"/><circle cx="17.4" cy="16" r="1.7"/><path d="M11 8.4V5.9M9.2 12.4l-3 2.6M12.8 12.4l3 2.6"/>',
  },
  developers: {
    slug: "developers",
    ja: "開発者・エージェント運用",
    en: "Developers & agent operations",
    icon: '<path d="M7.6 7.5L4 11l3.6 3.5M14.4 7.5L18 11l-3.6 3.5M12.4 5.5l-2.8 11"/>',
  },
};

/** 業務（どの操作が狙われたか）。 */
export const BRIEF_OPERATION_SLUGS = [
  "payment-change",
  "account-admin",
  "disclosure",
  "delivery",
  "approval",
  "data-access",
] as const;
export type BriefOperationSlug = (typeof BRIEF_OPERATION_SLUGS)[number];

export const BRIEF_OPERATIONS: Record<BriefOperationSlug, FacetEntry> = {
  "payment-change": {
    slug: "payment-change",
    ja: "振込先・口座の変更",
    en: "Payee & bank-account changes",
    icon: '<rect x="3" y="6" width="16" height="10" rx="1.5"/><path d="M3 9h16"/><path d="M12.5 13.2h4M14.8 11.8l1.7 1.4-1.7 1.4"/>',
  },
  "account-admin": {
    slug: "account-admin",
    ja: "アカウント・権限の管理",
    en: "Accounts & permissions",
    icon: '<circle cx="8.5" cy="8" r="3"/><path d="M3.5 18c0-2.9 2.2-4.8 5-4.8 1.3 0 2.4.4 3.2 1"/><circle cx="15.5" cy="14.5" r="2.1"/><path d="M15.5 11.4v1M15.5 16.6v1M18.6 14.5h-1M13.4 14.5h-1"/>',
  },
  disclosure: {
    slug: "disclosure",
    ja: "情報の開示・提供",
    en: "Disclosure & data release",
    icon: '<path d="M5 3.8h8l3.5 3.5V18H5z"/><path d="M13 3.8v3.5h3.5"/><path d="M8 12.5h6M12 10.5l2 2-2 2"/>',
  },
  delivery: {
    slug: "delivery",
    ja: "配信・送付",
    en: "Sending & delivery",
    icon: '<path d="M3.5 10.5L18.5 4l-4 14-3.6-5.6z"/><path d="M10.9 12.4L18.5 4"/>',
  },
  approval: {
    slug: "approval",
    ja: "承認・決裁",
    en: "Approval & sign-off",
    icon: '<path d="M8.5 4.5h5v4.2l3 2.3v2.5h-11V11l3-2.3z"/><path d="M4.5 17.5h13"/>',
  },
  "data-access": {
    slug: "data-access",
    ja: "照会・参照",
    en: "Lookup & data access",
    icon: '<circle cx="9.5" cy="9.5" r="5"/><path d="M13.2 13.2L18 18"/>',
  },
};

/** 対策（何を足せば埋まるか）。 */
export const BRIEF_CONTROL_SLUGS = [
  "separate-approval",
  "ownership-check",
  "hold-unverified",
  "audit-trail",
] as const;
export type BriefControlSlug = (typeof BRIEF_CONTROL_SLUGS)[number];

export const BRIEF_CONTROLS: Record<BriefControlSlug, FacetEntry> = {
  "separate-approval": {
    slug: "separate-approval",
    ja: "変更は、別の人が別の方法で確認する",
    en: "Changes confirmed by someone else, another way",
    icon: '<circle cx="7" cy="8" r="2.6"/><circle cx="15" cy="8" r="2.6"/><path d="M2.8 17c0-2.6 1.9-4.3 4.2-4.3S11 14.4 11 17M11 17c0-2.6 1.8-4.3 4-4.3s4.2 1.7 4.2 4.3"/>',
  },
  "ownership-check": {
    slug: "ownership-check",
    ja: "送り主や口座が本物か確認する",
    en: "Check the sender or account is genuine",
    icon: '<rect x="3" y="5" width="16" height="12" rx="1.5"/><circle cx="8" cy="10" r="2"/><path d="M5.2 14.4c.5-1.3 1.6-2 2.8-2s2.3.7 2.8 2M13 9h3.5M13 12h2.5"/>',
  },
  "hold-unverified": {
    slug: "hold-unverified",
    ja: "確認できるまで、送金や配信を止める",
    en: "Hold payments or sends until confirmed",
    icon: '<circle cx="11" cy="11" r="7.8"/><path d="M9 8v6M13 8v6"/>',
  },
  "audit-trail": {
    slug: "audit-trail",
    ja: "誰が何を確認したかを記録する",
    en: "Record who confirmed what",
    icon: '<path d="M5.5 3.8h11v14.4h-11z"/><path d="M8 7.5h6M8 10.5h6M8 13.5h3.5"/><path d="M13 15.5l1.2 1.2 2.3-2.4"/>',
  },
};

/**
 * 手口（2026-10-17）。一覧の「手口」絞り込みと行のメタ。OGP の札・X 投稿の
 * 書き出しと同じ言葉にそろえる。13 の脅威タイプ（primary_category）は製品・
 * Pillar との対応づけ用の内部分類で、読者向けの入口には使わない。
 */
export const BRIEF_ATTACK_SLUGS = [
  "account-takeover",
  "impersonation",
  "privilege-abuse",
  "supply-chain",
  "human-error",
  "ai-misuse",
] as const;
export type BriefAttackSlug = (typeof BRIEF_ATTACK_SLUGS)[number];

export const BRIEF_ATTACKS: Record<BriefAttackSlug, FacetEntry> = {
  "account-takeover": {
    slug: "account-takeover",
    ja: "アカウント乗っ取り",
    en: "Account takeover",
    icon: '<circle cx="7.5" cy="11" r="3.5"/><path d="M11 11h8M16 11v3M18.5 11v2"/>',
  },
  impersonation: {
    slug: "impersonation",
    ja: "なりすまし",
    en: "Impersonation",
    icon: '<circle cx="11" cy="7.5" r="3.2"/><path d="M4.5 18.5c.6-3.3 3.2-5.3 6.5-5.3s5.9 2 6.5 5.3"/><path d="M7.2 7.2h7.6"/>',
  },
  "privilege-abuse": {
    slug: "privilege-abuse",
    ja: "権限の悪用",
    en: "Privilege abuse",
    icon: '<path d="M11 3.5l6.5 2.6v4.6c0 4-2.8 6.6-6.5 7.8-3.7-1.2-6.5-3.8-6.5-7.8V6.1z"/><path d="M11 14V8.5M8.6 10.8L11 8.4l2.4 2.4"/>',
  },
  "supply-chain": {
    slug: "supply-chain",
    ja: "サプライチェーン",
    en: "Supply chain",
    icon: '<rect x="2.8" y="8.2" width="8" height="5.6" rx="2.8"/><rect x="11.2" y="8.2" width="8" height="5.6" rx="2.8"/>',
  },
  "human-error": {
    slug: "human-error",
    ja: "人の操作ミス",
    en: "Human error",
    icon: '<path d="M11 3.8L19 17.8H3z"/><path d="M11 9v4.2M11 15.6v.4"/>',
  },
  "ai-misuse": {
    slug: "ai-misuse",
    ja: "AI の誤作動・悪用",
    en: "AI failure or misuse",
    icon: '<rect x="5.5" y="5.5" width="11" height="11" rx="2"/><path d="M9 9h4v4H9zM8.5 3v2.5M13.5 3v2.5M8.5 16.5V19M13.5 16.5V19M3 8.5h2.5M3 13.5h2.5M16.5 8.5H19M16.5 13.5H19"/>',
  },
};

/**
 * 論点（`insight.slug`）。Brief が増えるごとに足す。ここは閉じた enum に
 * しない——新しい論点はまず Brief 側で slug を書き、一覧で束ねる段階で
 * ラベルとアイコンをここに足す。
 */
export const BRIEF_INSIGHTS: Record<string, FacetEntry> = {
  "confirmed-by-login-alone": {
    slug: "confirmed-by-login-alone",
    ja: "ログインだけで確定する操作",
    en: "Operations confirmed by login alone",
    icon: '<circle cx="7.5" cy="11" r="3.4"/><path d="M10.9 11h7.6v3M15.6 11v2.2"/>',
  },
};

/** モックにあった汎用アイコン（被害の広がり）。まだどの語彙にも結んでいない。 */
export const BRIEF_FACET_EXTRA_ICONS: Record<string, string> = {
  exposure:
    '<circle cx="11" cy="11" r="7.6"/><circle cx="11" cy="11" r="4"/><circle cx="11" cy="11" r="0.9" fill="currentColor"/><path d="M11 1.8v3M11 17.2v3M1.8 11h3M17.2 11h3"/>',
};

/**
 * 国・地域（2026-10-23）。一覧の行のラベル・「国・地域」の絞り込み・表紙の下の
 * 段に出す。事案が起きた国（被害を受けた組織の所在、公表・処分した当局の国）で
 * 選び、調査した研究者の国では選ばない。2 か国が同じだけ中心なら 2 つまで。
 * 国に結びつかないもの（OSS・ライブラリの脆弱性、暗号資産のプロトコル、AI の
 * ツールや模型の研究、多国にまたがる攻撃）は `global`。並びは絞り込みの並び。
 */
export const BRIEF_COUNTRY_SLUGS = [
  "jp",
  "us",
  "gb",
  "kr",
  "cn",
  "hk",
  "tw",
  "sg",
  "au",
  "nz",
  "ca",
  "de",
  "fr",
  "it",
  "nl",
  "dk",
  "se",
  "ie",
  "in",
  "my",
  "ru",
  "kg",
  "ae",
  "br",
  "mx",
  "global",
] as const;
export type BriefCountrySlug = (typeof BRIEF_COUNTRY_SLUGS)[number];

export const BRIEF_COUNTRIES: Record<BriefCountrySlug, { slug: string; ja: string; en: string }> = {
  jp: { slug: "jp", ja: "日本", en: "Japan" },
  us: { slug: "us", ja: "米国", en: "US" },
  gb: { slug: "gb", ja: "英国", en: "UK" },
  kr: { slug: "kr", ja: "韓国", en: "South Korea" },
  cn: { slug: "cn", ja: "中国", en: "China" },
  hk: { slug: "hk", ja: "香港", en: "Hong Kong" },
  tw: { slug: "tw", ja: "台湾", en: "Taiwan" },
  sg: { slug: "sg", ja: "シンガポール", en: "Singapore" },
  au: { slug: "au", ja: "オーストラリア", en: "Australia" },
  nz: { slug: "nz", ja: "ニュージーランド", en: "New Zealand" },
  ca: { slug: "ca", ja: "カナダ", en: "Canada" },
  de: { slug: "de", ja: "ドイツ", en: "Germany" },
  fr: { slug: "fr", ja: "フランス", en: "France" },
  it: { slug: "it", ja: "イタリア", en: "Italy" },
  nl: { slug: "nl", ja: "オランダ", en: "Netherlands" },
  dk: { slug: "dk", ja: "デンマーク", en: "Denmark" },
  se: { slug: "se", ja: "スウェーデン", en: "Sweden" },
  ie: { slug: "ie", ja: "アイルランド", en: "Ireland" },
  in: { slug: "in", ja: "インド", en: "India" },
  my: { slug: "my", ja: "マレーシア", en: "Malaysia" },
  ru: { slug: "ru", ja: "ロシア", en: "Russia" },
  kg: { slug: "kg", ja: "キルギス", en: "Kyrgyzstan" },
  ae: { slug: "ae", ja: "アラブ首長国連邦", en: "UAE" },
  br: { slug: "br", ja: "ブラジル", en: "Brazil" },
  mx: { slug: "mx", ja: "メキシコ", en: "Mexico" },
  global: { slug: "global", ja: "国際", en: "Global" },
};

/** 表示用：「日本・米国」/「Japan / US」。 */
export function briefCountryLabel(
  slugs: readonly string[] | undefined,
  loc: "ja" | "en",
): string | null {
  if (!slugs || slugs.length === 0) return null;
  const names = slugs.map((s) => BRIEF_COUNTRIES[s as BriefCountrySlug]?.[loc] ?? s);
  return names.join(loc === "ja" ? "・" : " / ");
}
