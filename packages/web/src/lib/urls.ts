/**
 * 内部 URL の組み立て。
 *
 * このサイトは Cloudflare Pages の `directory` 形式で配信しているので、
 * `/blog/foo` は `/blog/foo/` へ 308 で転送される。内部リンクは必ず
 * スラッシュ付きで書く必要がある。転送は往復が1回増えるだけでなく、
 * クロール予算が2つの URL に割れ、`og:url` / `canonical` に「実際に
 * 配信されている URL ではないもの」が静かに入る（#887 がまさにそれ）。
 *
 * ここの関数は構造的にスラッシュ付きしか返さないので、呼び出し側からは
 * 問題を持ち込めない。出力全体に同じ規則を課すのは
 * `integrations/check-internal-links.mjs`（ビルド後の検査）の役目。
 */

/** ロケール接頭辞。EN は空文字、JA は `/ja`。 */
export type LocaleBase = "" | "/ja";

/** 正規のオリジン。canonical / og:url / JSON-LD / sitemap の基点。 */
export const SITE_ORIGIN = "https://lemma.frame00.com";

/**
 * `base` と `path` を継いで、先頭と末尾のスラッシュを1つずつに整える。
 *
 * クエリとフラグメントは末尾スラッシュの後ろに置く（`/faq/#q3`）。
 * パス部が空になる場合は `/` を返す。
 */
export function localePath(base: string, path = "/"): string {
  const [, rawPath = "", tail = ""] = /^([^?#]*)(.*)$/.exec(path) ?? [];
  const joined = `${base}/${rawPath}`.replace(/\/{2,}/g, "/");
  const withSlash = joined.endsWith("/") ? joined : `${joined}/`;
  return `${withSlash}${tail}`;
}

/** 絶対 URL。内部リンクではなく canonical / og:url / JSON-LD 用。 */
export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/* ---- ブログ ------------------------------------------------------------ */

/** ブログ一覧。`/blog/` または `/ja/blog/`。 */
export const blogIndexPath = (base: string): string => localePath(base, "/blog/");

/** 記事本体。`/blog/<slug>/`。 */
export const blogArticlePath = (base: string, slug: string): string =>
  localePath(base, `/blog/${slug}/`);

/** カテゴリ一覧。`slug` は `categorySlug()` を通したもの。 */
export const blogCategoryPath = (base: string, slug: string): string =>
  localePath(base, `/blog/category/${slug}/`);

/* ---- ユースケース ------------------------------------------------------ */

/** 業界別ソリューション索引。 */
export const useCaseIndexPath = (base: string): string =>
  localePath(base, "/solutions/use-cases/");

/** ユースケース詳細。 */
export const useCasePath = (base: string, slug: string): string =>
  localePath(base, `/solutions/use-cases/${slug}/`);

/* ---- Critical Brief ---------------------------------------------------- */

/** Brief 一覧。 */
export const briefIndexPath = (base: string): string =>
  localePath(base, "/critical/briefs/");

/** Brief 本体。 */
export const briefPath = (base: string, slug: string): string =>
  localePath(base, `/critical/briefs/${slug}/`);
