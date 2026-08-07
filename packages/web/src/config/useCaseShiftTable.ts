/**
 * Use Case §2「変化」— 従来 ↔ Lemma の比較表（スラッグ単位の上書き）。
 *
 * §2 は一度、登場人物つきの 3 面フロー図で組んだが、読み解くのに時間がかかる
 * という判断で「スライド1枚で伝わる表」へ作り直した。軸は 比較項目／従来
 * （課題）／Lemma（解決策）／ビジネス上のメリット の 4 列。
 *
 * 既定の 4 行は UseCaseV3Body の `C.shiftRows` にあり、全 UC で成立する
 * 一般形。ここに登録したスラッグだけ、その業務の言葉に差し替わる。
 *
 * §3 の表とは軸が違う（あちらは代替手段どうしの比較、ここは運用の前後）。
 */
import type { Locale } from "../i18n/translations";

export interface ShiftRow {
  /** 比較項目（見出し）と、その括弧書き。 */
  readonly k: string;
  readonly kSub: string;
  /** 従来のやり方（課題）。 */
  readonly was: string;
  /** Lemma 導入後（解決策）。 */
  readonly now: string;
  /** 解決策側に添えるしるし。原本を抱えたままなら lock、相手の即時検証なら check。 */
  readonly mark?: "lock" | "check";
  /** ビジネス上のメリット — 一言と、その補足。 */
  readonly gain: string;
  readonly gainSub: string;
}

export interface UseCaseShiftTable {
  readonly rows: ReadonlyArray<ShiftRow>;
  /** 表の下に置く一言。導入のハードルを下げる補足を書く。 */
  readonly foot: string;
}

const TABLES: Readonly<
  Record<string, Partial<Readonly<Record<Locale, UseCaseShiftTable>>>>
> = {
  "counterparty-screening": {
    ja: {
      rows: [
        {
          k: "照合方法",
          kSub: "データ確認",
          was: "相手に原本（信用情報・照会履歴など）を直接渡す",
          now: "手元で照合し、結果だけを証明化する。原本は自社から出さない",
          mark: "lock",
          gain: "漏洩・名誉毀損リスクを外す",
          gainSub: "機微データは 1 文字も流出しない",
        },
        {
          k: "渡すもの",
          kSub: "相手への共有",
          was: "理由・スコアなどの詳細データ（または PDF）",
          now: "「判定結果のみ」の、約 200 バイトの証明データ",
          gain: "軽量で、安全",
          gainSub: "「反社リストに非該当」「与信区分が基準以上」の事実だけが伝わる",
        },
        {
          k: "相手の確認",
          kSub: "検証コスト",
          was: "相手も同じ照合を重複して行うか、平文を信じるしかない",
          now: "専用アカウント不要。リンクを開くだけで自力で検証できる",
          mark: "check",
          gain: "確認の手間を大幅に削減",
          gainSub: "取引先・グループ会社・監査人の受け取りの負担が消える",
        },
        {
          k: "信頼性",
          kSub: "改ざん対策",
          was: "PDF や画面キャプチャのため、改ざんの疑いを捨てきれない",
          now: "ハッシュと暗号署名で、1 文字の変更も検証の時点で検知される",
          gain: "真正性を担保",
          gainSub: "「いつ・誰が・改ざんなく発行したか」を第三者に示せる",
        },
      ],
      foot: "既存の照合システム（与信／反社パイプライン・API）はそのまま使える。双方が原本を手元に置いたまま、取引判断だけを渡す構成である。",
    },
  },
};

export function getUseCaseShiftTable(
  slug: string,
  locale: Locale,
): UseCaseShiftTable | undefined {
  return TABLES[slug]?.[locale];
}
