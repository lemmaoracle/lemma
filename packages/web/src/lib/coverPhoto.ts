/**
 * 記事カバー画像の決定ロジック（カバー・OGP生成 実装指示 v2 §A-5 / §B-2）。
 *
 * **ルールは1本**——「指定があればそれ、無ければ抽象」。
 *
 *   frontmatter に画像の指定があり、かつファイルが実在する → その画像
 *   それ以外                                                → 抽象パターン（3種）
 *
 * カテゴリは問わない。Announcements がコードブロックの図を持つことも、
 * business 記事が写真を持つことも、同じ1本のルールで扱う。
 *
 * ■ 受け付けるのは**サイト内の絶対パス**（`/assets/covers/<slug>.jpg`）だけ
 * posts 側には旧デザインの遺物として `cover: "assets/cover-solutions.png"` の
 * ような**リポジトリ相対**の指定が 46 記事に残っている。これはカテゴリ共通の
 * プレースホルダ画像で、いま採用すると 3 種の抽象カバーがほぼ全滅する。
 * 先頭が `/` のものだけを「この記事のために用意された画像」とみなす。
 * リポジトリ相対の値は従来どおり `post.cover`（raw.githubusercontent の URL）
 * として残り、カバーの決定には関与しない。
 *
 * ■ 実在判定はビルド時のファイルシステムで行う（v2 §0.3）
 * HTTP ステータスでは判定できない——存在しないアセットはこれまで 200 で HTML を
 * 返していた（`src/pages/404.astro` で 404 に直したが、判定をそこに依存させない）。
 * 写真の未着・パス違いでビルドを落とさないため、ここでは throw しない。
 *
 * 画像は無加工で入稿される。色調・暗いヴェール・ライムの走査線はすべて CSS 側
 * （`.cover--photo` / `.cover-photo`）で行う。JPEG に焼き込むと後から調整できない。
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PUBLIC_DIR = fileURLToPath(new URL("../../public/", import.meta.url));

/** サイト内絶対パスで、public/ に実体があるものだけ通す。 */
const resolveLocal = (path: string | undefined): string | undefined =>
  path && path.startsWith("/") && existsSync(PUBLIC_DIR + path.slice(1))
    ? path
    : undefined;

/**
 * この記事のカバー画像。無ければ undefined（= 抽象カバーに落ちる）。
 *
 * `coverPhoto` と `cover` の両方を見る。どちらもサイト内絶対パスのみ有効で、
 * 先に指定された `coverPhoto` を優先する。
 */
export function resolveCoverImage(
  post: Readonly<{ coverPhoto?: string; cover?: string }>,
): string | undefined {
  return resolveLocal(post.coverPhoto) ?? resolveLocal(post.cover);
}

/**
 * 旧シグネチャ（`coverPhoto` 単体）。呼び出し側の移行が済むまで残す。
 * @deprecated `resolveCoverImage(post)` を使う。
 */
export function resolveCoverPhoto(coverPhoto: string | undefined): string | undefined {
  return resolveLocal(coverPhoto);
}
