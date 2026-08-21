/**
 * Critical Brief 一覧まわりの共有設定。
 *
 * 在庫が 130 本を超えて全件フル展開が縦に長くなりすぎたため、一覧トップは
 * 「最新 LATEST_COUNT 本＋よく見られている」だけを出し、全件は別ページ
 * （`/critical/briefs/archive/`）に月別で置く（2026-08-21）。
 *
 * SEO 上の前提: 各 Brief は個別 URL で索引されるので、トップから古い分を
 * 外しても評価は落ちない。ただし **アーカイブページへの内部リンクを常に
 * 出し、アーカイブ側は全件を静的 HTML で出力する**こと（JS 遅延挿入にしない）。
 * sitemap は全ページ自動収載、feed.xml は従来どおり全件を含む。
 */

/** 一覧トップに出す「最新」の件数。ここ1箇所で調整する。 */
export const LATEST_COUNT = 12;

/** 一覧トップ（最新）。`base` は JA なら "/ja"、EN なら ""。 */
export const briefsIndexHref = (base: string) => `${base}/critical/briefs/`;

/** 全件アーカイブ（月別）。 */
export const briefsArchiveHref = (base: string) =>
  `${base}/critical/briefs/archive/`;

/**
 * 脅威タイプ／柱／検索の deep link は従来どおりクエリで受ける。ただし絞り込み
 * 対象の一覧はアーカイブ側にあるので、リンク先はアーカイブページにする
 * （Brief 記事のタグ・柱ページからの導線を壊さないため）。
 */
export const briefsCategoryHref = (base: string, category: string) =>
  `${briefsArchiveHref(base)}?category=${category}`;
