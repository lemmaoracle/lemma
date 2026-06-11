/**
 * Static OG image endpoint for blog posts.
 *
 * URL: `/og/blog/{ja|en}/{slug}.png`
 *
 * `prerender = true` + `getStaticPaths` enumerate every (locale × post)
 * pair so the site ships as one PNG per post per language, served as
 * a flat static asset from Cloudflare Pages — no runtime image render.
 *
 * Posts are fetched through `getAllPosts(locale)` which reads from the
 * external posts repo (LEMMA_POSTS_REPO). When the repo env var is
 * unset (local dev) no posts are returned and the endpoint emits
 * nothing — matching the rest of the blog surface.
 */
import type { APIRoute } from "astro";
import { renderBlogOg } from "../../../../og/blogImage";
import { getAllPosts, type BlogLocale, type BlogPost } from "../../../../data/blog";

export const prerender = true;

const LOCALES: ReadonlyArray<BlogLocale> = ["ja", "en"];

export async function getStaticPaths() {
  const paths: Array<{
    params: { lang: BlogLocale; slug: string };
    props: { post: BlogPost };
  }> = [];
  for (const lang of LOCALES) {
    const posts = await getAllPosts(lang);
    for (const post of posts) {
      paths.push({ params: { lang, slug: post.slug }, props: { post } });
    }
  }
  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  const post = (props as { post: BlogPost }).post;
  const png = await renderBlogOg(post);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
