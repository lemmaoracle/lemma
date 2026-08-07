/**
 * Industry detail v1 — 業界ページ本文断片（確定版モック 2026-08-02 由来）。
 * IndustryDetailV1.astro が <main class="indv1"> に set:html で注入する。
 * 写真は public/industry/<slug>.jpg（加工ルール v1.2 適用済み・出所は写真ライセンス管理 v1.2）。
 */

import type { Locale } from "../i18n/translations";
import manufacturingJa from "./industry-v1/manufacturing.ja.html?raw";
import publicSectorJa from "./industry-v1/public-sector.ja.html?raw";
import financeJa from "./industry-v1/finance.ja.html?raw";
import healthcareJa from "./industry-v1/healthcare.ja.html?raw";
import supplyChainJa from "./industry-v1/supply-chain.ja.html?raw";
import mediaJa from "./industry-v1/media.ja.html?raw";
import retailJa from "./industry-v1/retail.ja.html?raw";
import aiJa from "./industry-v1/ai.ja.html?raw";
import developersJa from "./industry-v1/developers.ja.html?raw";
import financeEn from "./industry-v1/finance.en.html?raw";
import manufacturingEn from "./industry-v1/manufacturing.en.html?raw";
import publicSectorEn from "./industry-v1/public-sector.en.html?raw";
import healthcareEn from "./industry-v1/healthcare.en.html?raw";
import supplyChainEn from "./industry-v1/supply-chain.en.html?raw";
import mediaEn from "./industry-v1/media.en.html?raw";
import retailEn from "./industry-v1/retail.en.html?raw";
import aiEn from "./industry-v1/ai.en.html?raw";
import developersEn from "./industry-v1/developers.en.html?raw";

/** 1ロケール分の本文。EN は「要点を絞った版」で、JA の逐語訳ではない。 */
export interface IndustryCopy {
  readonly name: string;
  readonly h1: string;
  readonly description: string;
  readonly body: string;
}

/**
 * 業界エントリ。素の `name` / `h1` / `description` / `body` は JA。
 *
 * `en` は **EN 版を用意した業界だけ**が持つ。無い業界に EN ページを作らない
 * ためのフラグでもあるので、未訳を JA でフォールバックさせてはいけない
 * （日本語のページが EN の URL で出てしまう）。
 */
export interface IndustryEntry extends IndustryCopy {
  readonly slug: string;
  readonly en?: IndustryCopy;
}

export const INDUSTRIES_V1: ReadonlyArray<IndustryEntry> = [
  {
    slug: "manufacturing",
    name: "製造・基幹インフラ",
    h1: "出荷が、書類の往復で止まらない。",
    description: "検査記録や計測値が本物であることを、受け取った相手がその場で確認できます。提出後の原本照会・立会・再検査の往復を大きく減らします。",
    body: manufacturingJa,
    en: {
      name: "Manufacturing & critical infrastructure",
      h1: "Shipments that don't stall on the paperwork round-trip.",
      description: "Whoever receives an inspection record or a measurement can confirm on the spot that it is genuine — removing most of the requests for originals, witness inspections and re-tests after submission.",
      body: manufacturingEn,
    },
  },
  {
    slug: "public-sector",
    name: "自治体・公共",
    h1: "書類確認は確かに、手続きは速く。",
    description: "発行した記録に証明を付けると、受け取った窓口がその場で本物と確認できます。原本の提出や発行元への電話照会を大きく減らします。",
    body: publicSectorJa,
    en: {
      name: "Government & public sector",
      h1: "Document checks stay rigorous. The procedure gets faster.",
      description: "Attach a proof to the records you issue and the counter receiving them can confirm they are genuine on the spot — removing most requests for originals and most calls back to the issuing office.",
      body: publicSectorEn,
    },
  },
  {
    slug: "finance",
    name: "金融・FinTech",
    h1: "照会の往復をなくして、審査を短くする。",
    description: "書類の真偽を、発行元へ照会せずにその場で判定。Lemma が書類に証明を付与し、審査の流れを止めません。",
    body: financeJa,
    en: {
      name: "Finance & FinTech",
      h1: "Cut out the round-trip. Cut the review time.",
      description: "Judge a document's authenticity on the spot, without querying the issuer. Lemma attaches a proof to the document so the review never stalls.",
      body: financeEn,
    },
  },
  {
    slug: "healthcare",
    name: "医療・ヘルスケア",
    h1: "資格確認は確かに、配置は速く。",
    description: "資格・研修・就業適格の記録を、コピーを集めずにその場で確認できます。個人情報を預からない仕組みで、配置前の「確認待ち」を大きく減らします。",
    body: healthcareJa,
    en: {
      name: "Healthcare",
      h1: "Credential checks stay rigorous. Staffing gets faster.",
      description: "Confirm licenses, training and fitness-to-work on the spot, without collecting copies. Because you never hold the personal data, most of the waiting before an assignment disappears.",
      body: healthcareEn,
    },
  },
  {
    slug: "supply-chain",
    name: "調達・サプライチェーン",
    h1: "「届いたか」ではなく、「有効か」をその場で判定。",
    description: "許認可やISO証書を、集めて目視で確かめる代わりに、提示を受けてその場で判定できます。仕入先審査の待ち時間と、確認の作業負荷を大きく減らします。",
    body: supplyChainJa,
    en: {
      name: "Procurement & supply chain",
      h1: "Not whether it arrived — whether it's valid, settled on the spot.",
      description: "Instead of collecting licenses and ISO certificates and checking them by eye, take them on presentation and settle it on the spot. Both the wait in supplier review and the checking workload drop sharply.",
      body: supplyChainEn,
    },
  },
  {
    slug: "media",
    name: "メディア・コンテンツ",
    h1: "偽物が出回っても、本物はすぐ分かる。",
    description: "発信の瞬間に証明を付けると、本物かどうかを読者や取引先が自分で確かめられます。偽物への後手の対応を大きく減らします。",
    body: mediaJa,
    en: {
      name: "Media & content",
      h1: "Fakes will circulate. The real one stays obvious.",
      description: "Attach a proof at the moment you publish, and readers and partners can check for themselves which one is genuine — instead of chasing every fake after the fact.",
      body: mediaEn,
    },
  },
  {
    slug: "retail",
    name: "サービス・小売",
    h1: "会員資格や優待の確認を、その場で速く。",
    description: "本部への照会を挟まず、提示を受けたその場で判定できます。個人データを配らない仕組みで、お客様の待ち時間を大きく減らします。",
    body: retailJa,
    en: {
      name: "Services & retail",
      h1: "Membership and entitlement checks, settled at the counter.",
      description: "Decide on the spot, from what the customer presents, with no query to head office. Because customer data is never distributed to the sites, the waiting largely disappears.",
      body: retailEn,
    },
  },
  {
    slug: "ai",
    name: "AI導入（業種横断）",
    h1: "AIに、安心して任せられる。",
    description: "AIの判断根拠と実行ログに証明を付けると、監査にも第三者にも「本物の記録」として示せます。説明の負担を大きく減らします。",
    body: aiJa,
    en: {
      name: "AI adoption (all industries)",
      h1: "Hand work to AI, and still be able to account for it.",
      description: "Attach proof to the grounds an AI decided on and to what it actually executed, and both can be shown to an auditor or a third party as a genuine record. The burden of explaining drops sharply.",
      body: aiEn,
    },
  },
  {
    slug: "developers",
    name: "開発者・エージェント運用",
    h1: "権限の外は、実行されない。",
    description: "なりすましやプロンプトインジェクションは、権限チェックだけでは止まりません。Lemma は実行の前に依頼の出どころと権限証明を検証し、未承認の依頼をリクエスト時点で止めます。",
    body: developersJa,
    en: {
      name: "Developers & agent operations",
      h1: "Outside the authority, nothing executes.",
      description: "Impersonation and prompt injection do not stop at a permission check. Lemma verifies where a request came from, and the proof of its authority, before anything runs — so an unauthorized request is dropped at request time.",
      body: developersEn,
    },
  },
];

export function getIndustryBySlug(slug: string): IndustryEntry | undefined {
  return INDUSTRIES_V1.find((e) => e.slug === slug);
}

/** その業界のロケール別コピー。EN が無い業界では JA が返る（呼ぶ前に `entry.en` を確認すること）。 */
export function getIndustryCopy(entry: IndustryEntry, locale: Locale): IndustryCopy {
  return locale === "en" && entry.en ? entry.en : entry;
}
