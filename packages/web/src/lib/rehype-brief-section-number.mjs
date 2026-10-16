/**
 * Rehype plugin scoped to Lemma Critical Brief markdown.
 *
 * Each Brief body's section headings follow the canonical "N. Title"
 * pattern (e.g. "1. Incident Overview", "8. Sources"). The mockup detail
 * v1 (PR #274) renders this as two distinct visual elements:
 *
 *   §  1                   <- mono brown eyebrow
 *   Incident Overview      <- Sora 30px black
 *
 * This plugin strips the "N. " prefix from h2 text so the heading reads
 * cleanly, and tags the h2 with `data-section-num="N"`. BriefTemplate's
 * CSS uses a counter to render the "§ N" eyebrow via ::before, and only
 * targets h2's that are not :first-child (the first h2 is "TL;DR" which
 * has its own card treatment and never carries a § badge).
 *
 * The TL;DR h2 is left alone — its text is "TL;DR" and no "N. " prefix
 * is present, so the regex below doesn't match it.
 *
 * Scoping: only applies inside src/content/critical-briefs/ and
 * src/content/critical-briefs-en/. Other markdown surfaces (blog,
 * methodology, etc.) are untouched.
 *
 * No external dep — uses a tiny inline visitor over the hast tree so
 * we don't add unist-util-visit just for this.
 */
const BRIEF_PATH_FRAGMENTS = [
  "/src/content/critical-briefs/",
  "/src/content/critical-briefs-en/",
];

const SECTION_NUMBER_RE = /^(\d+)\.\s+(.+)$/;

function visitElements(node, fn) {
  if (!node || typeof node !== "object") return;
  if (node.type === "element") fn(node);
  const children = node.children;
  if (Array.isArray(children)) {
    for (const child of children) visitElements(child, fn);
  }
}

/**
 * 参照カード（6章化 2026-07-30、レビューで段落バナー→1リンク=1カードへ）:
 * 「参照:」/「References:」で始まる段落から**リンクだけ**を取り出し、
 * `div[data-brief-refs]` に組み替える。地のテキストと区切りは落ちる。
 * 各リンクには href から種別（blog / pillar / product）を `data-ref-kind`
 * として付け、BriefTemplate の CSS が小さなカードの列として描画する。
 * 記事末尾（Sources の後）に置く定型——md 側はプレーンな markdown の
 * リンク列を書くだけでよい。
 */
const REFS_MARKER_RE = /^(参照|References):\s*/;

function refKind(href) {
  if (typeof href !== "string") return "product";
  if (href.includes("/blog/")) return "blog";
  if (href.includes("/pillars/")) return "pillar";
  return "product";
}

/**
 * report レイアウト（frontmatter `layout: "report"`・2026-10 opt-in）だけの
 * 組み替え。frontmatter は Astro が `file.data.astro.frontmatter` に渡す。
 * レイアウト未指定の Brief はここを一切通らない。
 *
 *   - 本文先頭の改訂注記（`> **改訂（vX / 日付）**: …`）を描画から外す。版と
 *     日付は表紙下のメタ行が出す。md には残す——BriefTemplate の
 *     dateModified が生の本文からこの注記を読むため。
 *   - 「参照:」段落はカードに組み替えず、1行の注（p.rx-also）のまま残す。
 *   - `glossary` を §2 の最初のブロック（事実の表）の直後に「用語メモ」として差す。
 *   - `insight.quote` を §4 の最初の段落の直後に「この事案の核心」として差す。
 *     `insight.slug` / `label` は一覧用で、ここでは描画しない。
 *
 * 呼ばれる時点では md 内の HTML ブロックはまだ `raw` ノード（rehype-raw は
 * ユーザープラグインの後）なので、「最初のブロック」は element と raw の
 * 両方を数える。
 */
const REVISION_RE = /^(改訂|Revision)\s*[（(]v[\d.]+/;

const h = (tagName, className, children, extra = {}) => ({
  type: "element",
  tagName,
  properties: { ...(className ? { className: [className] } : {}), ...extra },
  children,
});
const txt = (value) => ({ type: "text", value });

function isBlank(node) {
  return node.type === "text" && !node.value.trim();
}

function textOf(node) {
  if (!node) return "";
  if (node.type === "text") return node.value;
  return (node.children ?? []).map(textOf).join("");
}

function sectionHeadIndex(children, num) {
  return children.findIndex(
    (c) =>
      c.type === "element" &&
      c.tagName === "h2" &&
      String(c.properties?.dataSectionNum ?? "") === String(num),
  );
}

function applyReportLayout(tree, fm, isEn) {
  const root = tree.children ?? [];

  // 1) 改訂注記の blockquote を外す（最初の h2 より前にあるものだけ）。
  const firstH2 = root.findIndex((c) => c.type === "element" && c.tagName === "h2");
  for (let i = 0; i < (firstH2 < 0 ? root.length : firstH2); i++) {
    const c = root[i];
    if (c.type === "element" && c.tagName === "blockquote") {
      if (REVISION_RE.test(textOf(c).trim())) {
        root.splice(i, 1);
        break;
      }
    }
  }

  // 2) 用語メモ（§2 の最初のブロックの後）。
  const glossary = Array.isArray(fm.glossary) ? fm.glossary : [];
  if (glossary.length) {
    const hi = sectionHeadIndex(root, 2);
    if (hi >= 0) {
      let j = hi + 1;
      while (j < root.length && isBlank(root[j])) j++;
      const kids = [h("span", "k", [txt(isEn ? "Glossary" : "用語メモ")])];
      for (const g of glossary) {
        kids.push(h("br", null, []));
        kids.push(h("b", null, [txt(g.term)]));
        kids.push(txt(` — ${g.desc}`));
      }
      root.splice(Math.min(j + 1, root.length), 0, h("p", "rx-note", kids));
    }
  }

  // 3) この事案の核心（§4 の最初の段落の後）。
  const quote = fm.insight?.quote;
  if (quote) {
    const hi = sectionHeadIndex(root, 4);
    if (hi >= 0) {
      let j = hi + 1;
      while (
        j < root.length &&
        !(root[j].type === "element" && root[j].tagName === "p") &&
        !(root[j].type === "element" && root[j].tagName === "h2")
      ) {
        j++;
      }
      if (j < root.length && root[j].tagName === "p") {
        root.splice(
          j + 1,
          0,
          h("figure", "rx-key", [
            h("figcaption", null, [txt(isEn ? "The core of this case" : "この事案の核心")]),
            h("blockquote", null, [txt(quote)]),
          ]),
        );
      }
    }
  }
}

export function rehypeBriefSectionNumber() {
  return (tree, file) => {
    const path = file?.history?.[0] ?? file?.path ?? "";
    const inScope = BRIEF_PATH_FRAGMENTS.some((frag) => path.includes(frag));
    if (!inScope) return;
    const fm = file?.data?.astro?.frontmatter ?? {};
    const isReport = fm.layout === "report";
    const isEn = path.includes("/critical-briefs-en/");

    visitElements(tree, (node) => {
      if (node.tagName === "h2") {
        const first = node.children?.[0];
        if (!first || first.type !== "text") return;
        const match = first.value.match(SECTION_NUMBER_RE);
        if (!match) return;
        const [, num, title] = match;
        first.value = title;
        node.properties = node.properties || {};
        node.properties["dataSectionNum"] = num;
        return;
      }
      if (node.tagName === "p") {
        const first = node.children?.[0];
        if (!first || first.type !== "text") return;
        if (!REFS_MARKER_RE.test(first.value)) return;
        if (isReport) {
          node.properties = node.properties || {};
          node.properties.className = ["rx-also"];
          return;
        }
        const links = (node.children ?? []).filter(
          (c) => c.type === "element" && c.tagName === "a",
        );
        if (links.length === 0) return;
        for (const link of links) {
          link.properties = link.properties || {};
          link.properties["dataRefKind"] = refKind(link.properties.href);
        }
        node.tagName = "div";
        node.children = links;
        node.properties = node.properties || {};
        node.properties["dataBriefRefs"] = "";
      }
    });

    if (isReport) applyReportLayout(tree, fm, isEn);
  };
}
