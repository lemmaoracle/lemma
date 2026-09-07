import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * ビルド後の HTML から開発者コメントを落とす Astro integration。
 *
 * 背景（2026-09-07）: Astro は `<!-- -->` をそのまま出力する。`Layout.astro` の
 * `<head>` に置いたコメント（Tally の hydration fallback の経緯など）が全ページ
 * に乗り、本文抽出をすると**タイトル直後・TL;DR の前**に英語の実装メモが挟まる
 * 状態だった。人の目には出ないが、スクレイパも生成AIも本文の一部として読む。
 *
 * ソース側を `{/* *\/}` に一括置換しないのは、`<!--TICKER-->` や
 * `<!-- Latest news -->` のように**文字列置換のプレースホルダとして機能している**
 * コメントが混ざっているため（TopV47Template / IndustryDetailV1）。あれらは
 * レンダリング時に消費されるので、出力側で落とすのが安全かつ取りこぼしがない。
 * markdown 由来のコメントや、今後書かれるコメントも自動的に対象になる。
 *
 * 保護するもの:
 *   - `<script>` `<style>` `<pre>` `<textarea>` の中身。コード見本が
 *     `<!-- -->` を**表示している**場合を壊さない（markdown 経由なら
 *     `&lt;!--` に escape されるので実際には当たらないが、生 HTML を
 *     埋め込む面のために明示的に守る）。
 *   - 条件付きコメント `<!--[if ...]>`。挙動を持つため。
 */

const PROTECTED_BLOCK = /<(script|style|pre|textarea)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const HTML_COMMENT = /<!--(?!\[if)[\s\S]*?-->/g;

/** 保護ブロックを避けてコメントだけ落とす。 */
export function stripComments(html) {
  let out = "";
  let cursor = 0;
  PROTECTED_BLOCK.lastIndex = 0;

  for (let m = PROTECTED_BLOCK.exec(html); m; m = PROTECTED_BLOCK.exec(html)) {
    out += html.slice(cursor, m.index).replace(HTML_COMMENT, "");
    out += m[0];
    cursor = m.index + m[0].length;
  }
  return out + html.slice(cursor).replace(HTML_COMMENT, "");
}

/** dist 配下の .html を再帰的に列挙（Node 22 の実験的 `fs.glob` は使わない）。 */
async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.isFile() && entry.name.endsWith(".html")) yield path;
  }
}

export function stripHtmlComments() {
  return {
    name: "lemma:strip-html-comments",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        let files = 0;
        let bytes = 0;

        for await (const path of htmlFiles(root)) {
          const before = await readFile(path, "utf8");
          const after = stripComments(before);
          if (after !== before) {
            await writeFile(path, after, "utf8");
            files += 1;
            bytes += before.length - after.length;
          }
        }

        logger.info(`stripped comments from ${files} file(s), −${bytes} bytes`);
      },
    },
  };
}
