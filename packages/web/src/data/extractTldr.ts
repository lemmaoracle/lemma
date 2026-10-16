/**
 * Extract the TL;DR section from a Brief's markdown body.
 *
 * The Brief template puts a `## TL;DR` block as the first body section
 * (template authoritative; README.md notes the convention). This util
 * finds that block, strips inline Markdown decorations, collapses
 * whitespace, and optionally truncates to a target length.
 *
 * Used by:
 *   - BriefCard.astro (archive grids, ~200 chars)
 *   - RSS feeds (item description, ~500 chars)
 *
 * Returns "" when the body is missing or has no TL;DR section. Callers
 * fall back to whatever default they prefer.
 */

/**
 * 見出しの採番は任意。§5.4 の6章立て（`## 1. TL;DR` 〜 `## 6. Sources`）へ
 * 移行した Brief と、旧9章の `## TL;DR` の両方を拾う。採番を見ていなかった
 * 2026-09-07 以前は移行済みの Brief 全件で "" を返しており、RSS の
 * description と BriefCard は副題へのフォールバックだけで動いていた。
 * 番号の剥がしは表示側の rehype-brief-section-number が担当していて、
 * ここは**生の markdown** を見るので採番がそのまま残っている点に注意。
 */
const TLDR_REGEX = /##\s*(?:\d+\.\s*)?TL;DR\s*\n+([\s\S]+?)(?:\n+##\s|$)/;
const MD_LINK = /\[([^\]]+)\]\([^)]+\)/g;
const MD_BOLD = /\*\*([^*]+)\*\*/g;
const MD_ITALIC = /\*([^*]+)\*/g;
const MD_CODE = /`([^`]+)`/g;
const WHITESPACE = /\s+/g;
/**
 * report レイアウト（2026-10）の TL;DR は HTML ブロック（要旨の表）で書く。
 * 行頭の小見出し（`<div class="lab">01<b>何が起きたか</b></div>`）は要約の
 * 文ではないので落とし、残りのタグを剥がして本文の段落だけを残す。
 */
const HTML_LABEL = /<div class="lab">[\s\S]*?<\/div>/g;
const HTML_BLOCK_END = /<\/(?:p|li|div|dd|dt|ol|ul)>/g;
// 既知のタグ名だけ剥がす（091 の本文にある `<random>` のような地の文を消さない）。
const HTML_TAG = /<\/?(?:div|ol|ul|li|p|b|strong|em|span|br|a|dl|dt|dd)(?:\s[^>]*)?\/?>/g;

export function extractTldr(
  body: string | undefined,
  maxChars: number = 200,
): string {
  if (!body) return "";
  const match = body.match(TLDR_REGEX);
  if (!match) return "";
  const stripped = match[1]
    .trim()
    .replace(HTML_LABEL, " ")
    .replace(HTML_BLOCK_END, " ")
    .replace(HTML_TAG, "")
    .replace(MD_LINK, "$1")
    .replace(MD_BOLD, "$1")
    .replace(MD_ITALIC, "$1")
    .replace(MD_CODE, "$1")
    .replace(WHITESPACE, " ")
    .trim();
  if (stripped.length <= maxChars) return stripped;
  return stripped.slice(0, maxChars) + "…";
}
