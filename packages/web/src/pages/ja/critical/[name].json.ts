import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import type { BriefEntry } from "../../../data/criticalBriefs";
import { isDraftBrief, showDrafts } from "../../../lib/briefDrafts";

/**
 * 回覧する下書きの数と題名（/ja/critical/drafts.json・2026-10-31）。CLUBS の BOARD が
 * 「あなたの OK が要るもの」に1行出すために読む（clubsx の lib/lemma/briefDrafts.ts）。
 * 回覧の1枚（drafts/[...p].astro）と同じく、プレビューと手元だけで作る。本番のビルドでは
 * getStaticPaths が空を返すので、ファイルそのものが無い。出すのは番号と題名の前半だけ。
 * パスは読んだ側のホストからの相対（prerelease の下書きは本番には無いので、絶対 URL にしない）。
 */
export const prerender = true;

export function getStaticPaths() {
  return showDrafts ? [{ params: { name: "drafts" } }] : [];
}

export const GET: APIRoute = async () => {
  const drafts = ((await getCollection("critical-briefs", isDraftBrief)) as BriefEntry[]).sort(
    (a, b) => b.data.published.getTime() - a.data.published.getTime() || b.data.brief_no - a.data.brief_no,
  );
  const body = {
    drafts: drafts.length,
    page: "/ja/critical/drafts/",
    items: drafts.map((b) => ({
      no: b.data.brief_no,
      title: b.data.title.split(" — ")[0],
      url: `/ja/critical/briefs/${b.id}/`,
    })),
  };
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
