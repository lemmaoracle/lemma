/**
 * Use Case §2 — 照合バンド（「A と B を照合する」の可視化）。
 *
 * 照合フレーム (2026-08) の UC で、§2 の冒頭に「何と何を突き合わせるのか」を
 * 先に見せるための帯。左に手元の情報、右に発行者側の台帳、下に**相手へ渡る
 * 結果だけ**を置く。既存の ①操作画面 → ②検証画面 のカード列は「どう渡るか」
 * を示すもので、その手前の「何を照合するか」がこれまで絵になっていなかった。
 *
 * 登録の無いスラッグでは帯ごと描画されないので、他の UC は不変。
 * 文言の言い回し自体の差し替えは config/useCaseCopyOverride.ts の方。
 */
import type { Locale } from "../i18n/translations";

export interface UseCaseCollation {
  /** 左カードの見出しと中身 — 手元にある側。 */
  readonly aLabel: string;
  readonly aItems: ReadonlyArray<string>;
  /** 右カードの見出しと中身 — 発行者が抱えている側。 */
  readonly bLabel: string;
  readonly bItems: ReadonlyArray<string>;
  /** 2 枚のあいだに置く演算子ラベル（既定「照合」）。 */
  readonly opLabel: string;
  /** 下段 — 相手に渡る結果。 */
  readonly outLabel: string;
  readonly outValue: string;
  readonly outNote: string;
}

const COLLATION: Readonly<
  Record<string, Partial<Readonly<Record<Locale, UseCaseCollation>>>>
> = {
  "counterparty-screening": {
    ja: {
      aLabel: "A ── 手元にある取引先の情報",
      aItems: ["社名・法人番号", "代表者・役員", "所在地・実質支配者"],
      bLabel: "B ── 発行者が持つ与信・反社リスト",
      bItems: ["反社・制裁リスト", "信用情報・与信区分", "取引制限国"],
      opLabel: "照合",
      outLabel: "相手に渡るのは、照合の結果だけ",
      outValue: "反社リストに非該当 ／ 与信区分が基準以上",
      outNote:
        "A も B も、原本は相手に渡らない。渡るのは、この結果が「いつ・誰の発行で・改ざんなく」出たかを確かめられる証明だけ。",
    },
  },
};

export function getUseCaseCollation(
  slug: string,
  locale: Locale,
): UseCaseCollation | undefined {
  return COLLATION[slug]?.[locale];
}
