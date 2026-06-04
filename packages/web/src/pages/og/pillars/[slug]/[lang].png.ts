import type { APIRoute } from "astro";
import { getAllPillars } from "../../../../data/pillars";
import { renderPillarDetailOg } from "../../../../og/detailImages";
import type { Locale } from "../../../../i18n/translations";

export const prerender = true;

export async function getStaticPaths() {
  const pillars = getAllPillars();
  return pillars.flatMap((pillar) => [
    {
      params: { slug: pillar.slug, lang: "ja" },
      props: { order: pillar.order, titleJa: pillar.title.ja, titleEn: pillar.title.en },
    },
    {
      params: { slug: pillar.slug, lang: "en" },
      props: { order: pillar.order, titleJa: pillar.title.ja, titleEn: pillar.title.en },
    },
  ]);
}

export const GET: APIRoute = async ({ params, props }) => {
  const { order, titleJa, titleEn } = props as {
    order: number;
    titleJa: string;
    titleEn: string;
  };
  const png = await renderPillarDetailOg(
    params.slug!,
    order,
    titleJa,
    titleEn,
    params.lang as Locale,
  );
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
