/**
 * Static OG image endpoint for Critical Briefs.
 *
 * URL: `/og/critical-briefs/{ja|en}/{slug}.png`
 *
 * `prerender = true` + `getStaticPaths` enumerate every (locale × brief)
 * pair so the site ships as one PNG per brief per language, served as
 * a flat static asset from Cloudflare Pages — no runtime image render.
 *
 * Slug enumeration follows the same pattern as
 * `src/pages/critical/briefs/[slug].astro`: the JA collection is the
 * source of truth for which Brief numbers exist; EN routes prefer the
 * matching `critical-briefs-en` entry and fall back to the JA body for
 * any brief that has not yet been translated.
 */
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { renderCriticalBriefOg } from "../../../../og/criticalBriefImage";
import { getEnBriefMap } from "../../../../data/getEnBriefMap";
import type { Locale } from "../../../../i18n/translations";

export const prerender = true;

export async function getStaticPaths() {
  const jaBriefs = await getCollection("critical-briefs");
  const enById = await getEnBriefMap();
  const paths: Array<{
    params: { lang: Locale; slug: string };
    props: { brief: Awaited<ReturnType<typeof getCollection<"critical-briefs">>>[number] };
  }> = [];
  for (const ja of jaBriefs) {
    paths.push({ params: { lang: "ja", slug: ja.id }, props: { brief: ja } });
    const en = enById.get(ja.id) ?? ja;
    paths.push({
      params: { lang: "en", slug: ja.id },
      props: { brief: en as typeof ja },
    });
  }
  return paths;
}

export const GET: APIRoute = async ({ params, props }) => {
  const lang = params.lang as Locale;
  const brief = (props as { brief: Parameters<typeof renderCriticalBriefOg>[0] }).brief;
  const png = await renderCriticalBriefOg(brief, lang);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
