/**
 * Use Case §2「変化」— 従来 / Lemma を 2 枚のフロー図で見せる（スラッグ単位）。
 *
 * §2 は 3 面フロー図 → 比較表 と作り直してきたが、表は「誰から誰へ何が動くのか」
 * が絵にならず、しかも §3 の表と並んで表が続いてしまった。ここではスライド
 * 2 枚のつもりで、上段＝従来・下段＝Lemma の同じ骨格（送り手 → 渡るもの →
 * 受け手 → その結果どうなるか）を並べ、渡るものの中身だけが変わることを見せる。
 *
 * 既定値は UseCaseV3Body の `C.flow`（全 UC で成立する一般形）。ここに登録した
 * スラッグだけ、その業務の言葉に差し替わる。
 */
import type { Locale } from "../i18n/translations";

export interface UseCaseFlow {
  /** 送り手。従来／Lemma で共通の主体。 */
  readonly fromLabel: string;
  readonly fromNote: string;
  /** Lemma 側だけに付く、送り手の手元に残るものの注記（鍵つきで出る）。 */
  readonly fromKeeps: string;
  /** 受け手。 */
  readonly toLabel: string;
  /** 渡るもの — 従来は原本ごと、Lemma は結果の証明だけ。 */
  readonly wasPayload: ReadonlyArray<string>;
  readonly nowPayload: ReadonlyArray<string>;
  /** 受け手が何をすることになるか。 */
  readonly wasToNote: string;
  readonly nowToNote: string;
  /** 各パネルの結び。 */
  readonly wasOut: string;
  readonly nowOut: string;
}

const FLOWS: Readonly<
  Record<string, Partial<Readonly<Record<Locale, UseCaseFlow>>>>
> = {
  "counterparty-screening": {
    ja: {
      fromLabel: "自社 ／ 与信・コンプライアンス部門",
      fromNote: "与信・反社データベースと照合し、判定を確定する",
      fromKeeps: "原本（取引履歴・スコア・照会履歴）は自社に残る",
      toLabel: "取引先・グループ会社・監査人",
      wasPayload: ["判定の理由", "スコア", "照会履歴", "リストの中身"],
      nowPayload: ["「反社リストに非該当」", "「与信区分が基準以上」"],
      wasToNote: "受け取った根拠を読むか、同じ相手をもう一度自分で照合する",
      nowToNote: "リンクを開くだけ。アカウントもキーも要らない",
      wasOut:
        "根拠ごと渡るため、漏洩・名誉毀損・取引妨害のリスクが動く。渡さなければ、各社が同じ相手を重複して照合する。",
      nowOut:
        "原本は外に出ない。渡るのは約 200 バイトの証明だけで、「いつ・誰が・改ざんなく発行したか」を相手がその場で確かめられる。",
    },
  },
};

export function getUseCaseFlow(
  slug: string,
  locale: Locale,
): UseCaseFlow | undefined {
  return FLOWS[slug]?.[locale];
}
