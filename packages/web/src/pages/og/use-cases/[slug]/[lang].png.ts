import type { APIRoute } from "astro";
import { getAllUseCases } from "../../../../data/useCases";
import { renderUseCaseOg } from "../../../../og/detailImages";

export const prerender = true;

export async function getStaticPaths() {
  const jaCases = await getAllUseCases("ja");
  const enCases = await getAllUseCases("en");
  const seen = new Set<string>();
  const paths: Array<{
    params: { slug: string; lang: string };
    props: { title: string; pillar: string };
  }> = [];
  for (const uc of jaCases) {
    if (!seen.has(uc.slug)) {
      seen.add(uc.slug);
      paths.push({
        params: { slug: uc.slug, lang: "ja" },
        props: { title: uc.title, pillar: uc.pillar },
      });
    }
  }
  for (const uc of enCases) {
    const dup = seen.has(uc.slug);
    seen.add(uc.slug);
    paths.push({
      params: { slug: uc.slug, lang: "en" },
      props: { title: uc.title, pillar: uc.pillar },
    });
  }
  return paths;
}

export const GET: APIRoute = async ({ params, props }) => {
  const { title, pillar } = props as { title: string; pillar: string };
  const png = await renderUseCaseOg(title, pillar);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
