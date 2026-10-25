import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { renderSelfCheckOg } from "../../../og/marketingImages";
import type { BriefEntry } from "../../../data/criticalBriefs";
import { selfCheckGroups, selfCheckItemCount } from "../../../lib/briefSelfCheck";

export const prerender = true;

export const GET: APIRoute = async () => {
  const briefs = (await getCollection("critical-briefs")) as BriefEntry[];
  const png = await renderSelfCheckOg(selfCheckItemCount(selfCheckGroups(briefs)));
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
