/**
 * 下書きの Brief（status が published 以外）を、本番に出さない（2026-10-26）。
 *
 * 本番は Cloudflare Pages の main のビルド。下書きを出すのは、main 以外のブランチの
 * プレビュー（prerelease など）と、手元の dev、`LEMMA_SHOW_DRAFTS=1` を付けたビルドだけ。
 * 手元の `pnpm build` は本番と同じに下書きを外す。
 *
 * 回覧は prerelease の /ja/critical/drafts/ のリンク1本で行い、承認は CLUBS の
 * いつもの仕事「Critical Brief 作成ルール」の承認ポイントで1回にまとめる。
 * 承認された Brief を status: published にする PR で、本番に出る。
 */

const env = (key: string): string | undefined =>
  typeof process === "undefined" ? undefined : process.env[key];

const branch = env("CF_PAGES_BRANCH");

export const showDrafts: boolean =
  import.meta.env.DEV ||
  env("LEMMA_SHOW_DRAFTS") === "1" ||
  (branch !== undefined && branch !== "main");

export const isDraftBrief = (b: { data: { status: string } }): boolean =>
  b.data.status !== "published";

/** getCollection の絞り込みに渡す。本番では公開済みだけを通す。 */
export const isVisibleBrief = (b: { data: { status: string } }): boolean =>
  showDrafts || !isDraftBrief(b);
