/**
 * 写真カバーの決定ロジック（`Lemma_ビジネス記事の刷新_実装指示_v1_2026-08-04.md` §C-2）。
 *
 *   if (coverPhoto が指定され、public/ 配下にファイルが実在する) → 写真カバー
 *   else                                                          → 抽象パターン（BlogCover）
 *
 * `audience: business` でも写真が無ければ抽象に落とす。抽象は slug から生成
 * できるので供給が途切れないが、写真は途切れる — 写真の未着・パス違いで
 * ビルドを失敗させない（存在チェックだけで throw しない）。
 *
 * 画像ファイルは無加工で入稿される。色調・暗いヴェール・ライムの走査線は
 * すべて CSS 側（BlogArticleTemplate の `.cover--photo`）で行う。JPEG に
 * 焼き込むと後から調整できないため。
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PUBLIC_DIR = fileURLToPath(new URL("../../public/", import.meta.url));

/** 実在する写真カバーのパスを返す。無ければ undefined（= 抽象カバー）。 */
export function resolveCoverPhoto(coverPhoto: string | undefined): string | undefined {
  if (!coverPhoto || !coverPhoto.startsWith("/")) return undefined;
  return existsSync(PUBLIC_DIR + coverPhoto.slice(1)) ? coverPhoto : undefined;
}
