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
const BRIEF_PATH_FRAGMENTS = ["/src/content/critical-briefs/", "/src/content/critical-briefs-en/"];

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

/* ------------------------------------------------------------------ *
 * report レイアウトの自動組み替え（2026-10）
 *
 * 著者は普通の markdown を書き、ここで 032 の手書き HTML と同じ要素・
 * クラスに組み替える（CSS は手書き版のものをそのまま使う）。手書きの
 * HTML ブロックは md の段階では `raw` ノードなので、ここでは触らない
 * ——既に手で書かれた部品は二重に組み替わらない。
 * 規則の一覧は critical-briefs/README.md の「report レイアウト」。
 * ------------------------------------------------------------------ */

const isEl = (n, tag) => n?.type === "element" && (tag === undefined || n.tagName === tag);

const DEFAULT_SUMMARY_LABELS = {
  ja: ["何が起きたか", "なぜ見分けられないか", "欠けていた層"],
  en: ["What happened", "Why it was hard to see", "The missing layer"],
};

/** 章 num の本文（h2 の次から次の h2 の手前まで）の [start, end)。 */
function sectionRange(root, num) {
  const hi = sectionHeadIndex(root, num);
  if (hi < 0) return null;
  let end = hi + 1;
  while (end < root.length && !isEl(root[end], "h2")) end++;
  return [hi + 1, end];
}

/** 章の中の要素を、直前の h3 の見出し文字列と一緒に返す。 */
function sectionBlocks(root, num) {
  const r = sectionRange(root, num);
  if (!r) return [];
  const out = [];
  let h3 = "";
  for (let i = r[0]; i < r[1]; i++) {
    const n = root[i];
    if (!isEl(n)) continue;
    if (n.tagName === "h3") h3 = textOf(n).trim();
    out.push({ node: n, h3 });
  }
  return out;
}

/** 前後の空白テキストを除いた子要素。 */
function meaningful(children) {
  return (children ?? []).filter((c) => !isBlank(c));
}

/** li の中身（ルーズなリストの <p> 1つは剥がす）。 */
function liInline(li) {
  const kids = meaningful(li.children);
  if (kids.length >= 1 && isEl(kids[0], "p")) {
    return [...kids[0].children, ...kids.slice(1)];
  }
  return li.children ?? [];
}

/**
 * `**ラベル**: 本文` の形の li を { label, rest } に分ける。
 * ラベルの後ろのコロン（: / ：）と空白は落とす。形が違えば null。
 */
const LABEL_SEP_RE = /^\s*[:：]\s*/;
function splitLabel(li) {
  const inline = liInline(li);
  let k = 0;
  while (k < inline.length && isBlank(inline[k])) k++;
  const strong = inline[k];
  const next = inline[k + 1];
  if (!isEl(strong, "strong") || next?.type !== "text" || !LABEL_SEP_RE.test(next.value)) {
    return null;
  }
  const value = next.value.replace(LABEL_SEP_RE, "");
  const rest = [...(value ? [txt(value)] : []), ...inline.slice(k + 2)];
  return { label: strong.children, labelText: textOf(strong).trim(), rest };
}

/** リストの全項目が `**ラベル**: 本文` なら、その分解の配列を返す。 */
function labelledItems(list) {
  const items = (list.children ?? []).filter((c) => isEl(c, "li"));
  if (!items.length) return null;
  const parts = items.map(splitLabel);
  return parts.every(Boolean) ? parts : null;
}

/** `業界 · サービス・小売` → { kicker: "業界", title: "サービス・小売" } */
const KICKER_SPLIT_RE = /\s+[·|｜]\s+/;
function splitKicker(text) {
  const parts = text.split(KICKER_SPLIT_RE);
  if (parts.length < 2) return null;
  return { kicker: parts[0].trim(), title: parts.slice(1).join(" · ").trim() };
}

function replaceNode(root, from, to) {
  const i = root.indexOf(from);
  if (i >= 0) root[i] = to;
}

/** §1 の段落 → 要旨の表（rx-exsum）。 */
function deriveExecSummary(root, fm, isEn) {
  const r = sectionRange(root, 1);
  if (!r) return;
  const blocks = meaningful(root.slice(r[0], r[1]));
  if (!blocks.length || !blocks.every((b) => isEl(b, "p"))) return;
  const labels =
    Array.isArray(fm.summary_labels) && fm.summary_labels.length
      ? fm.summary_labels.map(String)
      : DEFAULT_SUMMARY_LABELS[isEn ? "en" : "ja"];
  if (labels.length !== blocks.length) return;
  const lis = blocks.map((p, i) =>
    h("li", i === blocks.length - 1 ? "key" : null, [
      h("div", "lab", [txt(String(i + 1).padStart(2, "0")), h("b", null, [txt(labels[i])])]),
      h("p", null, p.children),
    ]),
  );
  const box = h("div", "rx-exsum", [h("ol", null, lis)]);
  root.splice(r[0], r[1] - r[0], txt("\n"), box, txt("\n"));
}

/** `**ラベル**: 本文` の ul → 定義表（rx-facts。全項目に区分があれば rx-scope）。 */
function factsTable(parts) {
  const kickers = parts.map((p) => splitKicker(p.labelText));
  const scope = kickers.every(Boolean);
  const kids = [];
  parts.forEach((p, i) => {
    const dt = scope ? [h("span", "kk", [txt(kickers[i].kicker)]), txt(kickers[i].title)] : p.label;
    kids.push(h("dt", null, dt), h("dd", null, p.rest));
  });
  const div = h("div", "rx-facts", [h("dl", null, kids)]);
  if (scope) div.properties.className.push("rx-scope");
  return div;
}

function deriveFacts(root, num, skip = () => false) {
  for (const { node, h3 } of sectionBlocks(root, num)) {
    if (!isEl(node, "ul") || skip(h3)) continue;
    const parts = labelledItems(node);
    if (parts) replaceNode(root, node, factsTable(parts));
  }
}

/** §3: 小見出しより前の `**日付**: 本文` の ul → 時系列（rx-tl）、引用 → 注（rx-aside）。 */
const DATE_LIKE_RE = /^\d{4}(?:[-/.]\d{1,2})?/;
function deriveTimeline(root, num = 3, datesOnly = false) {
  let done = false;
  for (const { node, h3 } of sectionBlocks(root, num)) {
    if (h3 && !datesOnly) break;
    if (h3 && AFTER_DISCLOSURE_RE.test(h3)) break;
    if (!done && isEl(node, "ul")) {
      const parts = labelledItems(node);
      if (!parts) continue;
      // proof の章立てでは、事実の表と同じ章にあるので、日付だけの箇条を時系列にする。
      if (datesOnly && !parts.every((p) => DATE_LIKE_RE.test(p.labelText))) continue;
      const lis = parts.map((p) =>
        h("li", null, [
          h("time", DATE_LIKE_RE.test(p.labelText) ? null : "nd", p.label),
          h("span", null, p.rest),
        ]),
      );
      replaceNode(root, node, h("ul", "rx-tl", lis));
      done = true;
      continue;
    }
    if (isEl(node, "blockquote")) {
      const ps = meaningful(node.children).filter((c) => isEl(c, "p"));
      const i = root.indexOf(node);
      root.splice(i, 1, ...ps.map((p) => h("p", "rx-aside", p.children)));
    }
  }
}

/** 次の要素（空白を飛ばす）。 */
function nextEl(root, i) {
  let j = i + 1;
  while (j < root.length && isBlank(root[j])) j++;
  return j < root.length ? j : -1;
}

function panelHead(kicker, title) {
  return h("div", "rx-ex-h", [
    h("span", "rx-ex-no", [txt(kicker)]),
    h("span", "rx-ex-t", [txt(title)]),
  ]);
}

const BOX_HEADS = /^(必要になるもの|What it takes|What is needed)$/i;
const CHECK_HEADS = /^(点検チェックリスト|Checklist)$/i;
const NOTE_RE = /^(注[：:]|Note:)/;

/** 対策の状態語 → チップのクラス。 */
const STATUS = new Map([
  ["効かない", "no"],
  ["一部", "part"],
  ["関係しない", "na"],
  ["効く", "ok"],
  ["not effective", "no"],
  ["ineffective", "no"],
  ["partial", "part"],
  ["partly", "part"],
  ["not relevant", "na"],
  ["effective", "ok"],
]);

function deriveCounter(root, isEn, roles = sectionRoles({})) {
  const r = sectionRange(root, roles.counter);
  if (!r) return;

  // 冒頭の段落 → リード。
  const first = nextEl(root, r[0] - 1);
  if (first >= 0 && first < r[1] && isEl(root[first], "p")) {
    const p = root[first];
    p.properties = { ...(p.properties ?? {}), className: ["rx-lead"] };
  }

  for (const { node } of sectionBlocks(root, roles.counter)) {
    // 対策の表: 状態語だけのセルをチップに（1列目は対策の名前なので除く）。操作の種類ごとに
    // 列を分けた表（proof の章立て・2026-10-31）でも、どの列の状態語もチップになる。
    if (isEl(node, "table")) {
      visitElements(node, (row) => {
        if (row.tagName !== "tr") return;
        for (const cell of row.children.filter((c) => isEl(c, "td")).slice(1)) {
          const word = textOf(cell).trim();
          const cls = STATUS.get(word.toLowerCase());
          if (cls) cell.children = [h("span", `bx-st ${cls}`, [txt(word)])];
        }
      });
      continue;
    }
    // 小見出し → 対策／点検のパネル。
    if (isEl(node, "h3")) {
      const title = textOf(node).trim();
      const hi = root.indexOf(node);
      if (BOX_HEADS.test(title)) {
        const li = nextEl(root, hi);
        if (li < 0 || !isEl(root[li], "ol")) continue;
        const ol = root[li];
        for (const item of ol.children.filter((c) => isEl(c, "li"))) {
          item.children = liInline(item).map((c) =>
            isEl(c, "strong") ? { ...c, tagName: "b" } : c,
          );
        }
        ol.properties = { ...(ol.properties ?? {}), className: ["num"] };
        const box = h("section", "rx-box", [panelHead(isEn ? "Controls" : "対策", title), ol]);
        root.splice(hi, li - hi + 1, box);
        continue;
      }
      if (CHECK_HEADS.test(title)) {
        let j = nextEl(root, hi);
        const kids = [panelHead(isEn ? "Check" : "点検", title)];
        if (j >= 0 && isEl(root[j], "p")) {
          kids.push(h("p", "rx-box-cap", root[j].children));
          j = nextEl(root, j);
        }
        if (j < 0 || !isEl(root[j], "ul")) continue;
        kids.push(root[j]);
        root.splice(hi, j - hi + 1, h("div", "bx-checklist", kids));
      }
    }
  }

  // 注：の段落 → 小さな注（§3〜§5）。
  for (const num of roles.notes) {
    for (const { node } of sectionBlocks(root, num)) {
      if (isEl(node, "p") && !node.properties?.className && NOTE_RE.test(textOf(node).trim())) {
        node.properties = { ...(node.properties ?? {}), className: ["rx-aside"] };
      }
    }
  }
}

/** `**媒体（種別）**: 題（日付） — <url>` の ul → 出典（rx-srcs）。 */
const SRC_TYPE_RE = /^(.*?)\s*[（(]([^（()）]+)[）)]\s*$/;
const SRC_DATE_RE = /\s*[（(](\d{4}-\d{2}(?:-\d{2})?[^（()）]*)[）)]\s*$/;
const SRC_SEP = " — ";

function shortUrl(href) {
  let s = String(href)
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "")
    .replace(/\.html?$/, "");
  if (s.length > 60) {
    const segs = s.split("/");
    s = segs.length > 2 ? `${segs[0]}/${segs[1]}/…` : `${s.slice(0, 57)}…`;
  }
  return s;
}

function deriveSources(root, isEn) {
  for (const { node } of sectionBlocks(root, 6)) {
    if (!isEl(node, "ul")) continue;
    const parts = labelledItems(node);
    if (!parts) continue;
    const typed = parts.map((p) => p.labelText.match(SRC_TYPE_RE));
    if (!typed.every(Boolean)) continue;
    const lis = parts.map((p, i) => {
      const [, name, type] = typed[i];
      // 区切り「 — 」の最後の出現で、題と付記（URL・状態）に分ける。
      const rest = p.rest;
      let cut = -1;
      let at = -1;
      rest.forEach((c, k) => {
        if (c.type === "text" && c.value.includes(SRC_SEP)) {
          cut = k;
          at = c.value.lastIndexOf(SRC_SEP);
        }
      });
      let title = rest;
      let tail = [];
      if (cut >= 0) {
        const t = rest[cut].value;
        title = [...rest.slice(0, cut), ...(t.slice(0, at) ? [txt(t.slice(0, at))] : [])];
        const after = t.slice(at + SRC_SEP.length);
        tail = [...(after ? [txt(after)] : []), ...rest.slice(cut + 1)];
      }
      // 題の末尾の（日付）を取り出す。
      let date = "";
      const last = title[title.length - 1];
      if (last?.type === "text") {
        const m = last.value.match(SRC_DATE_RE);
        if (m) {
          date = m[1].trim();
          const v = last.value.slice(0, m.index);
          title = [...title.slice(0, -1), ...(v ? [txt(v)] : [])];
        }
      }
      // 題の前後の空白を整え、括弧で始まらない題（英語の引用符など）の前にだけ空白を置く。
      if (title[0]?.type === "text") title[0] = txt(title[0].value.replace(/^\s+/, ""));
      const lastT = title[title.length - 1];
      if (lastT?.type === "text") title[title.length - 1] = txt(lastT.value.replace(/\s+$/, ""));
      const head = textOf({ children: title });
      const lead = head && !/^[「『【（(]/.test(head) ? [txt(" ")] : [];
      // 自動リンク（表示 = URL）は短く表示する。
      tail = tail.map((c) =>
        isEl(c, "a") && textOf(c).trim() === String(c.properties?.href ?? "")
          ? { ...c, children: [txt(shortUrl(c.properties.href))] }
          : c,
      );
      const meta = [
        ...(date ? [txt(date)] : []),
        ...(date && tail.length ? [txt(" · ")] : []),
        ...tail,
      ];
      return h("li", null, [
        h("span", "ty", [txt(type.trim())]),
        h("span", "bs", [
          h("b", null, [txt(name.trim())]),
          ...lead,
          ...title,
          ...(meta.length ? [h("span", "meta", meta)] : []),
        ]),
      ]);
    });
    // 一次ソースは開いたまま、それ以外（報道・解析）は畳む。どちらかが無ければ畳まない。
    const primary = typed.map(([, , type]) => PRIMARY_RE.test(type));
    const shown = lis.filter((_, i) => primary[i]);
    const folded = lis.filter((_, i) => !primary[i]);
    if (!shown.length || !folded.length) {
      replaceNode(root, node, h("ol", "rx-srcs", lis));
      continue;
    }
    const more = h("details", "rx-srcs-more", [
      h("summary", null, [
        txt(isEn ? `${folded.length} more (reporting, analysis)` : `報道・解析 ${folded.length} 件`),
      ]),
      h("ol", "rx-srcs", folded),
    ]);
    replaceNode(root, node, h("div", "rx-srcs-wrap", [h("ol", "rx-srcs", shown), more]));
  }
}
const PRIMARY_RE = /一次|primary/i;

/**
 * `**…。** 本文` の空白を落とす。日本語では閉じの `**` の直後に文字を続けると
 * CommonMark の flanking 規則で強調が閉じないため、著者は空白を1つ挟んで書く。
 * 強調が全角の句読点・括弧で終わり、続く文字が非 ASCII のときだけ落とす。
 */
const CJK_END_RE = /[。、！？」』）]$/;
function tightenCjkStrong(tree) {
  visitElements(tree, (node) => {
    const kids = node.children ?? [];
    for (let i = 0; i < kids.length - 1; i++) {
      const s = kids[i];
      const n = kids[i + 1];
      if (
        isEl(s, "strong") &&
        CJK_END_RE.test(textOf(s)) &&
        n.type === "text" &&
        /^ [^\x00-\x7f]/.test(n.value)
      ) {
        n.value = n.value.slice(1);
      }
    }
  });
}

/**
 * 章の番号と役目（2026-10-31）。`sections: "proof"` の Brief は、事実の章を後ろに回し、
 * 「通った操作 → 実行の前に確かめられること → 対策」を前に置く（README「proof の章立て」）。
 * 01 要点／02 通った操作／03 実行の前に確かめられること／04 対策するには／05 事実と時系列／06 出典。
 */
export function sectionRoles(fm) {
  return fm?.sections === "proof"
    ? { facts: [2, 3, 5], timeline: 5, counter: 4, insight: 3, glossary: 5, notes: [2, 3, 4, 5] }
    : { facts: [2], timeline: 3, counter: 5, insight: 4, glossary: 2, notes: [3, 4, 5] };
}

const AFTER_DISCLOSURE_RE = /^(公表後の対応|After disclosure)$/i;

function deriveReportComponents(root, fm, isEn) {
  const roles = sectionRoles(fm);
  const proof = fm?.sections === "proof";
  tightenCjkStrong({ children: root });
  deriveExecSummary(root, fm, isEn);
  deriveTimeline(root, roles.timeline, proof);
  for (const n of roles.facts) deriveFacts(root, n, proof && n === roles.timeline ? (h3) => AFTER_DISCLOSURE_RE.test(h3) : undefined);
  deriveCounter(root, isEn, roles);
  deriveFacts(root, roles.counter);
  markWeeklySlot(root, roles.counter, proof);
  deriveSources(root, isEn);
}

/**
 * メールの入口の目印を置く（中身は BriefTemplate の BriefWeeklyCta・
 * 2026-10-24）。TL;DR のあとの 1 行と、チェックリスト（とその「注：」）の直後。本文は登録なしで
 * 全部読めるまま。対策の章の表を畳む案も試したが、SEO も読み手の得も変わらず、
 * 対策を探しに来た人には表も答えの一部なので、開いたままにした。
 */
function markWeeklySlot(root, counterNum = 5, proof = false) {
  const slot = (name) => ({ type: "element", tagName: "div", properties: { [name]: "" }, children: [] });
  // TL;DR のあと（2 章の h2 の直前）の 1 行の入口。
  const s2 = sectionHeadIndex(root, 2);
  if (s2 >= 0) root.splice(s2, 0, slot("dataBriefWeeklyTopSlot"));
  const r = sectionRange(root, counterNum);
  if (!r) return;
  let i = r[0];
  for (; i < root.length; i++) {
    const node = root[i];
    if (isEl(node, "h2")) break;
    const cls = String(node.properties?.className ?? "");
    if (!(isEl(node) && /\bbx-checklist\b/.test(cls))) continue;
    if (proof) {
      // proof：表（とその注）を読み終えたところ＝最初のチェックリストの直前に、導入の相談・デモの帯
      // （2026-11-01）。チェックリストのあとの帯は proof では出さない。
      root.splice(i, 0, slot("dataBriefDemoSlot"));
      return;
    }
    // 直後の「注：」はチェックリストの続きなので、その後ろに置く。
    const nx = nextEl(root, i);
    const after = nx >= 0 && /\brx-aside\b/.test(String(root[nx].properties?.className ?? "")) ? nx : i;
    root.splice(after + 1, 0, slot("dataBriefWeeklySlot"));
    return;
  }
  // チェックリストの無い proof の記事は、章の終わりに帯を置く（黙って消えないように）。
  if (proof) root.splice(i, 0, slot("dataBriefDemoSlot"));
}

function applyReportLayout(tree, fm, isEn) {
  const root = tree.children ?? [];

  // 0) 普通の markdown から部品を組み立てる（用語メモ・核心を差す前に）。
  deriveReportComponents(root, fm, isEn);

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
  const roles = sectionRoles(fm);
  const glossary = Array.isArray(fm.glossary) ? fm.glossary : [];
  if (glossary.length) {
    const hi = sectionHeadIndex(root, roles.glossary);
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
    const hi = sectionHeadIndex(root, roles.insight);
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
    markNextReadSlot(tree, isReport);
  };
}

/**
 * 「似た事例を一覧で読む」の差し込み口（2026-10-24）。中身は BriefTemplate が
 * 組み立て（BriefNextRead）、ページを開いたときにここへ移す。
 * - Sources の h2 の直前：対策を読み終えたところのブロック。
 * - report の 3 章の h2 の直前（2 章「何が起きたか」を読み終えたところ）：本文の
 *   途中の 1 行の入口。対策の章の直前だと「答えを読む前によそへ行け」と読まれた
 *   （読み手のレビュー）。
 */
function markNextReadSlot(tree, isReport) {
  const root = tree.children ?? [];
  const slot = (name) => ({ type: "element", tagName: "div", properties: { [name]: "" }, children: [] });
  const src = root.findIndex((n) => isEl(n, "h2") && textOf(n).trim() === "Sources");
  if (src >= 0) root.splice(src, 0, slot("dataBriefNextSlot"));
  if (!isReport) {
    // 旧い形の記事にも入口を置く（2026-10-25）：§5 を読み終えたところ（似た事例の前）と、
    // TL;DR のあと（2 章の直前）。report は applyReportLayout が置く。
    if (src >= 0) root.splice(src, 0, slot("dataBriefWeeklySlot"));
    const s2 = sectionHeadIndex(root, 2);
    if (s2 >= 0) root.splice(s2, 0, slot("dataBriefWeeklyTopSlot"));
    return;
  }
  const after2 = sectionHeadIndex(root, 3);
  if (after2 >= 0) root.splice(after2, 0, slot("dataBriefNextInlineSlot"));
}
