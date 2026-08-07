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
  /** 照合面の脚注 — 導入イメージ（既存の仕組みのままでよい、など）。 */
  readonly opNote: string;
  /** 発行面 — 相手に渡る述語。複数書くと ✓ の箇条書きになる。 */
  readonly outItems: ReadonlyArray<string>;
  /** 発行面 — 渡らない側（🔒 でグレーに落とす行）。 */
  readonly lockNote: string;
  /** 図の下に置く一文。 */
  readonly outNote: string;
  /** 各面の登場人物。誰の手元で起きているのかを面の頭に出す。 */
  readonly actorMatch: string;
  readonly actorIssue: string;
  readonly actorVerify: string;
  /** 面と面をつなぐ矢印のラベル。 */
  readonly joinIssue: string;
  readonly joinVerify: string;
}

const COLLATION: Readonly<
  Record<string, Partial<Readonly<Record<Locale, UseCaseCollation>>>>
> = {
  "counterparty-screening": {
    ja: {
      aLabel: "照合対象 ── 手元にある取引先の情報",
      aItems: ["社名・法人番号", "代表者・役員", "所在地・実質支配者"],
      bLabel: "照合先 ── 与信・反社データベース",
      bItems: ["反社・制裁リスト", "信用情報・与信区分", "取引制限国"],
      opLabel: "照合",
      opNote: "照合そのものは、既存の与信／反社パイプライン・API のままでよい。",
      outItems: ["反社リストに非該当", "与信区分が基準以上"],
      lockNote: "原本（取引履歴・スコア・照会履歴）は、送信も開示もされない。",
      outNote:
        "双方の原本は外に出ない。渡るのは「いつ・誰が・改ざんなく発行したか」を示せる、約200バイトの証明だけ。",
      actorMatch: "自社 ／ 与信・コンプライアンス部門",
      actorIssue: "裏で API 連携",
      actorVerify: "取引先・グループ会社・監査人",
      joinIssue: "照合結果",
      joinVerify: "証明 URL",
    },
  },
};

export function getUseCaseCollation(
  slug: string,
  locale: Locale,
): UseCaseCollation | undefined {
  return COLLATION[slug]?.[locale];
}
