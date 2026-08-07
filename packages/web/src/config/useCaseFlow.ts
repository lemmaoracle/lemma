/**
 * Use Case §2「変化」— 照合の図・「渡すもの」の新旧・仕組み（スラッグ単位）。
 *
 * §2 は 3 面フロー → 表 → 従来/Lemma の 2 枚フロー と作り直してきたが、
 * どれも文章で読ませる形になっていた。ここでは順番を変えて、
 *
 *   1. Lemma の照合そのものを図にする（語数は最小限）。境界線を引き、
 *      原本は内側に留まり、証明だけが外へ出ることを線で見せる。
 *   2. そのうえで「渡すもの」だけを新旧で並べる（チップ 2 段）。
 *   3. 最後に仕組みの説明を、見出しつきの節として置く。
 *
 * 既定値は UseCaseV3Body の `C.flow`（全 UC で成立する一般形）。ここに登録した
 * スラッグだけ、その業務の言葉に差し替わる。
 */
import type { Locale } from "../i18n/translations";

export interface UseCaseFlow {
  /** 境界の内と外の呼び名。原本が留まる側と、証明が届く側。 */
  readonly insideLabel: string;
  readonly outsideLabel: string;
  /** 境界に添える一言。何が越えないのかを言い切る。 */
  readonly boundaryNote: string;
  /** 照合する 2 つの源。 */
  readonly aLabel: string;
  readonly aItems: ReadonlyArray<string>;
  readonly bLabel: string;
  readonly bItems: ReadonlyArray<string>;
  /** 合流点のラベル（既定「照合」）。 */
  readonly opLabel: string;
  /** 照合の結果＝相手に渡る述語。 */
  readonly results: ReadonlyArray<string>;
  /** 境界を越えるものの呼び名。 */
  readonly crossLabel: string;
  /** 受け手と、その人がすること。 */
  readonly toLabel: string;
  readonly toNote: string;
  /** 「渡すもの」の落差。並べるのではなく、データの重さの違いを見せる。 */
  readonly payLead: string;
  readonly wasTitle: string;
  readonly wasDetail: string;
  readonly wasVolume: string;
  readonly nowTitle: string;
  readonly nowDetail: string;
  readonly nowVolume: string;
  /** 仕組みの節 — 要点 3 つ。しるしは順に 🔒 / 証明 / 検証で固定。 */
  readonly mechPoints: ReadonlyArray<{ readonly t: string; readonly d: string }>;
}

const FLOWS: Readonly<
  Record<string, Partial<Readonly<Record<Locale, UseCaseFlow>>>>
> = {
  "kyc-aml-selective-disclosure": {
    ja: {
      insideLabel: "自社のなか",
      outsideLabel: "相手のところ",
      boundaryNote: "本人属性は、ここを越えない",
      aLabel: "照合対象 ── 本人の属性",
      aItems: ["氏名・住所", "生年月日", "取引履歴"],
      bLabel: "照合先 ── KYC/AML の要件",
      bItems: ["年齢", "居住地", "制裁リスト"],
      opLabel: "照合",
      opNote: "照合そのものは、既存の KYC / eKYC のパイプラインのままでよい。",
      results: ["18 歳以上", "制裁リストに非該当"],
      lockNote: "原本（氏名・住所・生年月日・取引履歴）は、送信も開示もされない。",
      outNote:
        "双方の原本は外に出ない。渡るのは「いつ・誰が・改ざんなく発行したか」を示せる、約200バイトの証明だけ。",
      actorMatch: "自社 ／ コンプライアンス部門",
      actorIssue: "裏で API 連携",
      actorVerify: "委託先・提携先・監査人・当局",
      joinIssue: "照合結果",
      joinVerify: "証明 URL",
      payLead: "「本人属性まるごと」から「判定結果（原本 0 文字）」へ。",
      wasTitle: "本人属性・原本まるごと（過剰共有）",
      wasDetail: "氏名・住所・生年月日・取引履歴",
      wasVolume: "数千文字の詳細データ",
      nowTitle: "ZK 証明（最小限）",
      nowDetail: "「18 歳以上」「制裁リストに非該当」の判定事実のみ",
      nowVolume: "約 200 バイト ／ 原本 0 文字",
      mechPoints: [
        {
          t: "原本は外に出さない",
          d: "氏名・住所・生年月日・取引履歴といった本人属性は発行者内に留まる。渡さないので、漏洩・拡散のリスクが動かない。",
        },
        {
          t: "渡すのは「判定結果」だけ",
          d: "「18 歳以上」「制裁リストに非該当」という事実のみを、約 200 バイトの ZK 証明として発行する。",
        },
        {
          t: "相手はリンクを開くだけ",
          d: "委託先も当局もアカウント作成は不要。受け取った証明から「いつ・誰が・改ざんなく発行したか」を自力で確かめられる。",
        },
      ],
    },
  },
  "counterparty-screening": {
    ja: {
      insideLabel: "自社のなか",
      outsideLabel: "相手のところ",
      boundaryNote: "原本は、ここを越えない",
      aLabel: "取引先の情報",
      aItems: ["社名・法人番号", "代表者・役員", "所在地"],
      bLabel: "与信・反社データベース",
      bItems: ["反社・制裁リスト", "信用情報", "取引制限国"],
      opLabel: "照合",
      results: ["反社リストに非該当", "与信区分が基準以上"],
      crossLabel: "証明（約 200 バイト）",
      toLabel: "取引先・グループ会社・監査人",
      toNote: "リンクを開くだけ。アカウントもキーも要らない",
      payLead: "「原本丸ごと」から「判定結果（原本 0 文字）」へ。",
      wasTitle: "原本データ（過剰共有）",
      wasDetail: "取引履歴・個人情報・社内スコア・照会履歴",
      wasVolume: "数千文字の詳細データ",
      nowTitle: "ZK 証明（最小限）",
      nowDetail: "「反社リストに非該当」「与信区分が基準以上」の判定事実のみ",
      nowVolume: "約 200 バイト ／ 原本 0 文字",
      mechPoints: [
        {
          t: "原本は外に出さない",
          d: "取引履歴・詳細スコア・照会履歴といった機微データは自社内に留まる。渡さないので、漏洩・名誉毀損のリスクが動かない。",
        },
        {
          t: "渡すのは「判定結果」だけ",
          d: "「反社リストに非該当」「与信区分が基準以上」という事実のみを、約 200 バイトの ZK 証明として発行する。",
        },
        {
          t: "相手はリンクを開くだけ",
          d: "取引先も監査人もアカウント作成は不要。受け取った証明から「いつ・誰が・改ざんなく発行したか」を自力で確かめられる。",
        },
      ],
    },
  },
};

export function getUseCaseFlow(
  slug: string,
  locale: Locale,
): UseCaseFlow | undefined {
  return FLOWS[slug]?.[locale];
}
