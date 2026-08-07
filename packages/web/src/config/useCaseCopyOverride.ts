/**
 * Use Case 詳細ページ — スラッグ単位のコピー上書き。
 *
 * `UseCaseV3Body.astro` の共有コピー（36 UC で同じ文言を使う `C`）を、
 * 指定したスラッグのページでだけ差し替える。未登録のスラッグは共有コピーの
 * ままなので、1 本だけ言い回しを変えても他の UC は一切動かない。
 *
 * 初出は照合フレームのトライアル (2026-08)。「原本を渡すか、事実だけを渡すか」
 * という共有の骨組みを、取引先スクリーニングでだけ「照合」の語で言い直す。
 * フレームを全 UC に広げると決めたら、この上書きを消して `UseCaseV3Body` の
 * 共有コピー側を書き換えること。
 *
 * キー名は `UseCaseV3Body` の `C` と同じものを使う（`C` に無いキーを書いても
 * 何も起きない）。
 */
import type { Locale } from "../i18n/translations";

type CopyOverride = Readonly<Record<string, string>>;

const OVERRIDES: Readonly<
  Record<string, Partial<Readonly<Record<Locale, CopyOverride>>>>
> = {
  "kyc-aml-selective-disclosure": {
    ja: {
      s2H2: "原本を渡さず、「結果の証明」だけを渡す。",
      s2Catch: "現場の照合は増えない。相手の確認が変わる。",
      s2AfterFact: "照合された事実",
      s3Lead:
        "「原本を渡さず照合する」「独立検証」「書き換えの検知」の 3 つが同時に要る業務こそが Lemma の領域です。",
      thPass: "原本を渡さず照合",
    },
  },
  "counterparty-screening": {
    ja: {
      // §2 — 「事実を渡す」より「照合の結果を渡す」の方がこの業務の実態に近い。
      s2H2: "原本を渡さず、「結果の証明」だけを渡す。",
      s2Catch: "現場の照合は増えない。相手の確認が変わる。",
      s2AfterFact: "照合された事実",
      // §3 — リードと比較表の列見出しは同じ 3 語を指すので必ず揃える。
      s3Lead:
        "「原本を渡さず照合する」「独立検証」「書き換えの検知」の 3 つが同時に要る業務こそが Lemma の領域です。",
      thPass: "原本を渡さず照合",
    },
  },
};

export function getUseCaseCopyOverride(
  slug: string,
  locale: Locale,
): CopyOverride {
  return OVERRIDES[slug]?.[locale] ?? {};
}
