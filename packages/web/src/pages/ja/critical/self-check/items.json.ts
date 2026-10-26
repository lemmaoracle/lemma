import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import type { BriefEntry } from "../../../../data/criticalBriefs";
import { selfCheckGroups } from "../../../../lib/briefSelfCheck";

/**
 * セルフチェックの項目の番号と文の一覧（2026-10-26）。相談のフォーム（CLUBS）には
 * 番号（gaps・unsure）だけが届くので、返信する人と AI、送った人への自動のメールが
 * ここで番号の中身を引く。項目の文はページの「全項目を見る」にも出ている。
 * 複数の場面に出る項目は 1 件にまとめ、場面を scenes に並べる。
 */
export const prerender = true;

const SITE = "https://lemma.frame00.com";

export const GET: APIRoute = async () => {
  const briefs = (await getCollection("critical-briefs")) as BriefEntry[];
  const groups = selfCheckGroups(briefs);
  const items = new Map<
    string,
    { id: string; text: string; scenes: string[]; cases: { no: number; title: string; url: string }[] }
  >();
  groups.forEach((g) =>
    g.items.forEach((it) => {
      const seen = items.get(it.id);
      if (seen) {
        seen.scenes.push(g.key);
        return;
      }
      items.set(it.id, {
        id: it.id,
        text: it.text,
        scenes: [g.key],
        cases: it.sources.map((s) => ({ no: s.no, title: s.title, url: `${SITE}/ja/critical/briefs/${s.id}/` })),
      });
    }),
  );
  const body = {
    page: `${SITE}/ja/critical/self-check/`,
    scenes: groups.map((g) => ({ key: g.key, label: g.label })),
    items: [...items.values()],
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
