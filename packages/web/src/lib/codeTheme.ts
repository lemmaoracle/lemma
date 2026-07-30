import type { ThemeRegistration } from "shiki";

/**
 * ブログ記事のコードブロックの配色。
 *
 * Shiki の `github-dark` をそのまま使うと、記事の面（スレート地＋ライム）に
 * GitHub の青紫が混ざる。指示書 `Lemma_コンテンツテンプレート_実装指示_v1_
 * 2026-07-30.md` §2.2 の「pre はスレートのグラデ（**Shiki の github-dark は
 * 使わない**）」に合わせて、モックの3色
 * （keyword=ライム／comment=グレー／string=セージ）を軸にした配色を持つ。
 *
 * `editor.background` は `pre` のインライン style に出るが、テンプレート側の
 * `background: linear-gradient(...)` が background-image として上に乗るので
 * 見えるのはグラデのほう。地色はグラデの中間色に合わせてある。
 */
export const LEMMA_CODE_THEME: ThemeRegistration & { readonly name: string } = {
  name: "lemma-slate",
  type: "dark",
  colors: {
    "editor.background": "#333B34",
    "editor.foreground": "#D8DDD1",
  },
  settings: [
    { settings: { background: "#333B34", foreground: "#D8DDD1" } },
    {
      scope: ["comment", "punctuation.definition.comment", "string.comment"],
      settings: { foreground: "#8B9285", fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator.new",
        "storage",
        "storage.type",
        "storage.modifier",
        "constant.language",
        "support.type.primitive",
        "entity.name.tag",
      ],
      settings: { foreground: "#A8E010" },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "constant.other.symbol",
        "meta.embedded.line",
      ],
      settings: { foreground: "#C9D6A8" },
    },
    {
      scope: ["constant.numeric", "constant.language.boolean", "constant.language.null"],
      settings: { foreground: "#DCE8B4" },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: "#EBEFE6" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.class",
        "entity.other.attribute-name",
      ],
      settings: { foreground: "#CBD8AE" },
    },
    {
      scope: [
        "punctuation",
        "meta.brace",
        "keyword.operator",
        "variable",
        "variable.other",
        "meta.definition.variable.name",
        "support.variable",
      ],
      settings: { foreground: "#BFC6B8" },
    },
  ],
};
