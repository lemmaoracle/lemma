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
 * 参照バナー（6章化 2026-07-30）: 「参照:」/「References:」で始まる段落を
 * `data-brief-refs` 付きに変えて、マーカーは剥がす。BriefTemplate の CSS が
 * この段落をカード（ライム縁＋上辺バー＋モノスペースのラベル）として描画
 * する。§5 末尾の blog / Pillar / Trust402 リンク段落の定型に使う——md 側は
 * プレーンな markdown のままで、見た目だけがテンプレート側の規約に乗る。
 */
const REFS_MARKER_RE = /^(参照|References):\s*/;

export function rehypeBriefSectionNumber() {
  return (tree, file) => {
    const path = file?.history?.[0] ?? file?.path ?? "";
    const inScope = BRIEF_PATH_FRAGMENTS.some((frag) => path.includes(frag));
    if (!inScope) return;

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
        const match = first.value.match(REFS_MARKER_RE);
        if (!match) return;
        first.value = first.value.replace(REFS_MARKER_RE, "");
        node.properties = node.properties || {};
        node.properties["dataBriefRefs"] = "";
      }
    });
  };
}
