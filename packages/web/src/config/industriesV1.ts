/**
 * Industry detail v1 — 業界ページ本文断片（確定版モック 2026-08-02 由来）。
 * IndustryDetailV1.astro が <main class="indv1"> に set:html で注入する。
 * 写真は public/industry/<slug>.jpg（加工ルール v1.2 適用済み・出所は写真ライセンス管理 v1.2）。
 */

import manufacturingJa from "./industry-v1/manufacturing.ja.html?raw";
import publicSectorJa from "./industry-v1/public-sector.ja.html?raw";
import financeJa from "./industry-v1/finance.ja.html?raw";
import healthcareJa from "./industry-v1/healthcare.ja.html?raw";
import supplyChainJa from "./industry-v1/supply-chain.ja.html?raw";
import mediaJa from "./industry-v1/media.ja.html?raw";
import retailJa from "./industry-v1/retail.ja.html?raw";
import aiJa from "./industry-v1/ai.ja.html?raw";
import developersJa from "./industry-v1/developers.ja.html?raw";

export interface IndustryEntry {
  readonly slug: string;
  readonly name: string;
  readonly h1: string;
  readonly description: string;
  readonly body: string;
}

export const INDUSTRIES_V1: ReadonlyArray<IndustryEntry> = [
  { slug: "manufacturing", name: "製造・基幹インフラ", h1: "出荷が、書類の往復で止まらない。", description: "検査記録や計測値が本物であることを、受け取った相手がその場で確認できます。提出後の原本照会・立会・再検査の往復を大きく減らします。", body: manufacturingJa },
  { slug: "public-sector", name: "自治体・公共", h1: "書類確認は確かに、手続きは速く。", description: "発行した記録に証明を付けると、受け取った窓口がその場で本物と確認できます。原本の提出や発行元への電話照会を大きく減らします。", body: publicSectorJa },
  { slug: "finance", name: "金融・FinTech", h1: "照会の往復をなくして、審査を短くする。", description: "書類の真偽を、発行元へ照会せずにその場で判定。Lemma が書類に証明を付与し、審査の流れを止めません。", body: financeJa },
  { slug: "healthcare", name: "医療・ヘルスケア", h1: "資格確認は確かに、配置は速く。", description: "資格・研修・就業適格の記録を、コピーを集めずにその場で確認できます。個人情報を預からない仕組みで、配置前の「確認待ち」を大きく減らします。", body: healthcareJa },
  { slug: "supply-chain", name: "調達・サプライチェーン", h1: "「届いたか」ではなく、「有効か」をその場で判定。", description: "許認可やISO証書を、集めて目視で確かめる代わりに、提示を受けてその場で判定できます。仕入先審査の待ち時間と、確認の作業負荷を大きく減らします。", body: supplyChainJa },
  { slug: "media", name: "メディア・コンテンツ", h1: "偽物が出回っても、本物はすぐ分かる。", description: "発信の瞬間に証明を付けると、本物かどうかを読者や取引先が自分で確かめられます。偽物への後手の対応を大きく減らします。", body: mediaJa },
  { slug: "retail", name: "サービス・小売", h1: "会員資格や優待の確認を、その場で速く。", description: "本部への照会を挟まず、提示を受けたその場で判定できます。個人データを配らない仕組みで、お客様の待ち時間を大きく減らします。", body: retailJa },
  { slug: "ai", name: "AI導入（業種横断）", h1: "AIに、安心して任せられる。", description: "AIの判断根拠と実行ログに証明を付けると、監査にも第三者にも「本物の記録」として示せます。説明の負担を大きく減らします。", body: aiJa },
  { slug: "developers", name: "開発者・エージェント運用", h1: "権限の外は、実行されない。", description: "なりすましやプロンプトインジェクションは、権限チェックだけでは止まりません。Lemma は実行の前に依頼の出どころと権限証明を検証し、未承認の依頼をリクエスト時点で止めます。", body: developersJa },
];

export function getIndustryBySlug(slug: string): IndustryEntry | undefined {
  return INDUSTRIES_V1.find((e) => e.slug === slug);
}
