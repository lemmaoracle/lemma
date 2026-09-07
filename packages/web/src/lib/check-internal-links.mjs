/**
 * 内部リンクの検査（`astro:build:done`）。
 *
 * Cloudflare Pages の `directory` 形式では `/blog/foo` は `/blog/foo/` へ
 * 308 で転送される。転送されるリンクは往復が増えるだけでなく、クロール
 * 予算が2つの URL に割れ、`canonical` / `og:url` が実際に配信される URL と
 * ずれる。#887 で記事ページのそれを直したが、テンプレート側には同じ形が
 * 7,000 箇所以上残っていた。人手の grep では取りこぼすので出力を数える。
 *
 * 2種類を見る。
 *   redirect … 行き先は在るが末尾スラッシュが無い（308）
 *   dead     … 行き先が無い（404）
 *
 * ビルドを落とすのは **テンプレート由来の redirect だけ**。正しい形が
 * 一意に決まる（スラッシュを足す）ので機械的に直せる。
 *
 * 警告に留めるのは2つ。
 *   - 著者の Markdown（`blog-body` / `brief-body` / 関連リンク）の中の
 *     リンク。`lemmaoracle/posts` 側なのでこのリポジトリでは直せず、
 *     記事の typo でサイトのビルドが落ちる状態にはしない。
 *   - dead（404）。行き先をどこに変えるかは文面の判断であって、
 *     ビルドが決められることではない。一覧は出す。
 *
 * `public/_redirects`（Cloudflare Pages）で救われている URL は 404 ではない。
 * 旧 URL からの 301 が効いているので警告に留める。ただしリンク自体を新しい
 * URL に書き換えれば1ホップ減るので、黙らせはしない。
 *
 * `LEMMA_POSTS_REPO` が無いビルド（CI の `pnpm -r build`）では記事と
 * ユースケースが posts リポジトリから取れず、そのページ自体が出力されない。
 * そこへのリンクは当然 404 になるので、この条件では dead を数えない
 * （680件を超える偽の警告で本物が埋まる）。redirect の検査は影響を受けない。
 *
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

/** 著者が書いた Markdown が流し込まれる容器。ここの中は警告どまり。 */
const CONTENT_CONTAINERS = [
  { klass: "blog-body", tag: "div" },
  { klass: "brief-body", tag: "article" },
  // 記事 frontmatter の `resources`（関連リンク）。中身は posts 側。
  { klass: "blog-resources", tag: "section" },
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.isFile()) yield path;
  }
}

/** 容器の開始タグから対応する閉じタグまでの [start, end) を集める。 */
function contentRanges(html) {
  const ranges = [];
  for (const { klass, tag } of CONTENT_CONTAINERS) {
    const open = new RegExp(`<${tag}\\b[^>]*\\bclass="[^"]*\\b${klass}\\b[^"]*"[^>]*>`, "gi");
    for (let m = open.exec(html); m; m = open.exec(html)) {
      const scan = new RegExp(`<${tag}\\b|</${tag}\\s*>`, "gi");
      scan.lastIndex = m.index + m[0].length;
      let depth = 1;
      let end = html.length;
      for (let s = scan.exec(html); s; s = scan.exec(html)) {
        depth += s[0][1] === "/" ? -1 : 1;
        if (depth === 0) {
          end = scan.lastIndex;
          break;
        }
      }
      ranges.push([m.index, end]);
    }
  }
  return ranges;
}

const ORIGIN = "https://lemma.frame00.com";

/**
 * `_redirects` を読み、転送元のパスを集める。
 *
 * 形式は `<from> <to> <status>` の空白区切り。`*` を含む行は前方一致
 * （`/use-cases/*`）なので接頭辞として持つ。コメントと空行は捨てる。
 */
function parseRedirects(text) {
  const exact = new Set();
  const prefixes = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [from] = trimmed.split(/\s+/);
    if (!from?.startsWith("/")) continue;
    if (from.endsWith("*")) prefixes.push(from.slice(0, -1));
    else exact.add(from);
  }
  return { exact, prefixes };
}

export default function checkInternalLinks() {
  return {
    name: "lemma:check-internal-links",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const root = dir.pathname.replace(/\/$/, "");

        // dist が実際に持っている URL を先に集める。
        const pages = new Set(); // "/a/b/" 形式
        const files = new Set(); // "/rss.xml" 等
        for await (const path of walk(root)) {
          const rel = `/${relative(root, path).split(sep).join("/")}`;
          if (rel.endsWith("/index.html")) pages.add(rel.slice(0, -"index.html".length));
          else files.add(rel);
        }

        // posts が取れないビルドでは記事ページが存在しないので 404 を数えない。
        const postsAvailable = Boolean(process.env.LEMMA_POSTS_REPO);

        // Cloudflare Pages の転送規則。public/ の中身は dist にコピーされる。
        let redirects = { exact: new Set(), prefixes: [] };
        try {
          redirects = parseRedirects(await readFile(join(root, "_redirects"), "utf8"));
        } catch {
          // _redirects が無いビルドもある。その場合は転送なしとして扱う。
        }
        const isRedirected = (target) =>
          redirects.exact.has(target) || redirects.prefixes.some((p) => target.startsWith(p));

        const errors = [];
        const warnings = [];

        for await (const path of walk(root)) {
          if (!path.endsWith(".html")) continue;
          const page = `/${relative(root, path).split(sep).join("/")}`.replace(/index\.html$/, "");
          const html = await readFile(path, "utf8");
          const ranges = contentRanges(html);
          const inContent = (i) => ranges.some(([a, b]) => i >= a && i < b);

          for (const m of html.matchAll(/\bhref="([^"]*)"/g)) {
            let href = m[1];
            if (href.startsWith(ORIGIN)) href = href.slice(ORIGIN.length) || "/";
            if (!href.startsWith("/")) continue; // 外部・mailto:・#anchor
            const target = href.split(/[?#]/)[0];
            if (!target) continue; // "#anchor" だけ

            let kind = null;
            if (target.endsWith("/")) {
              if (!pages.has(target)) kind = "dead";
            } else if (pages.has(`${target}/`)) {
              kind = "redirect";
            } else if (!files.has(target)) {
              kind = "dead";
            }
            if (!kind) continue;
            // _redirects が拾う旧 URL は 404 ではない。書き換えれば1ホップ減る。
            if (kind === "dead" && isRedirected(target)) kind = "legacy";
            if (kind === "dead" && !postsAvailable) continue;

            const label = { redirect: "308", dead: "404", legacy: "301" }[kind];
            const finding = `${label} ${target}  (on ${page})`;
            const fixable = kind === "redirect" && !inContent(m.index);
            (fixable ? errors : warnings).push(finding);
          }
        }

        if (warnings.length) {
          const uniq = [...new Set(warnings)];
          logger.warn(
            `要修正リンク ${warnings.length} 件（404 / 旧URLの301 / 記事本文の308）:\n  ` +
              uniq.slice(0, 20).join("\n  ") +
              (uniq.length > 20 ? `\n  …他 ${uniq.length - 20} 件` : ""),
          );
        }
        if (errors.length) {
          const uniq = [...new Set(errors)];
          throw new Error(
            `内部リンクが ${errors.length} 件、転送または 404 になります。` +
              `末尾スラッシュ付きで書くか、src/lib/urls.ts のヘルパーを使ってください。\n  ` +
              uniq.slice(0, 40).join("\n  ") +
              (uniq.length > 40 ? `\n  …他 ${uniq.length - 40} 件` : ""),
          );
        }
        logger.info(
          `internal links OK (警告 ${warnings.length} 件` +
            (postsAvailable ? "" : "、LEMMA_POSTS_REPO 未設定のため 404 は未検査") +
            ")",
        );
      },
    },
  };
}
