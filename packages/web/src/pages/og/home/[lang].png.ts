import type { APIRoute } from "astro";
import { renderHomeOg } from "../../../og/marketingImages";
import type { Locale } from "../../../i18n/translations";

export const prerender = true;

export function getStaticPaths() {
  return [{ params: { lang: "ja" } }, { params: { lang: "en" } }];
}

export const GET: APIRoute = async ({ params }) => {
  const png = await renderHomeOg(params.lang as Locale);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
