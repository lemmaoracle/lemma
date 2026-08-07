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
  /** 「渡すもの」の新旧比較。now は results と同じでよい。 */
  readonly wasPayload: ReadonlyArray<string>;
  /** 仕組みの節の見出し（散文の要約 1 行）。 */
  readonly mechLead: string;
}

const FLOWS: Readonly<
  Record<string, Partial<Readonly<Record<Locale, UseCaseFlow>>>>
> = {
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
      wasPayload: ["判定の理由", "スコア", "照会履歴", "リストの中身"],
      mechLead:
        "照合した発行者が結果を述語として発行し、受け取った側は原本に触れずに検証する。",
    },
  },
};

export function getUseCaseFlow(
  slug: string,
  locale: Locale,
): UseCaseFlow | undefined {
  return FLOWS[slug]?.[locale];
}
