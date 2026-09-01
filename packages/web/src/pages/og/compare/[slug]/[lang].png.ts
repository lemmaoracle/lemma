import type { APIRoute } from "astro";
import { renderCompareOg } from "../../../../og/marketingImages";
import type { Locale } from "../../../../i18n/translations";

export const prerender = true;

export function getStaticPaths() {
  const slugs = ["ai-models-attack-resistance", "fable5-vs-kimi", "gpt5-vs-opus"] as const;
  const langs = ["ja", "en"] as const;
  return slugs.flatMap((slug) =>
    langs.map((lang) => ({ params: { slug, lang } })),
  );
}

export const GET: APIRoute = async ({ params }) => {
  const png = await renderCompareOg(params.slug as string, params.lang as Locale);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
