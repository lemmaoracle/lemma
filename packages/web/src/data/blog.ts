/**
 * Blog data layer.
 * Fetches Markdown articles from a dedicated GitHub repository at build time.
 * Supports bilingual posts via filename: post-entry.en.md, post-entry.ja.md
 * (plain .md is treated as locale "en" for backward compatibility).
 *
 * Environment variables:
 *   LEMMA_POSTS_REPO   — "owner/repo" (e.g. "lemmaoracle/blog-posts")
 *   LEMMA_POSTS_BRANCH — branch to read from (default: "main")
 *   LEMMA_POSTS_PATH   — subdirectory inside the repo (default: root)
 *   LEMMA_GH_TOKEN     — PAT for private repos / higher rate limits (optional)
 */

import matter from "gray-matter";
import { marked } from "marked";
import type { Tokens } from "marked";
import { createHighlighter } from "shiki";

export type BlogLocale = "en" | "ja";

export interface BlogPost {
  readonly slug: string;
  readonly locale: BlogLocale;
  readonly date: string;
  readonly category: string;
  readonly section: string;
  readonly title: string;
  readonly abstract: string;
  readonly body: string;
  readonly categoryColor?: string;
}

export interface BlogSection {
  readonly section: string;
  readonly posts: ReadonlyArray<BlogPost>;
}

/* ── Config ─────────────────────────────────────────────────────── */

const POSTS_REPO = import.meta.env.LEMMA_POSTS_REPO || "";
const POSTS_BRANCH = import.meta.env.LEMMA_POSTS_BRANCH || "main";
const POSTS_PATH = import.meta.env.LEMMA_POSTS_PATH || "";
const GH_TOKEN = import.meta.env.LEMMA_GH_TOKEN || "";

const SECTION_ORDER: ReadonlyArray<string> = ["Essays", "Changelog", "Field Notes"];

const categoryColorByCategory: Readonly<Record<string, string>> = {
  Research: "#2563EB",
  Foundations: "#7C3AED",
  Theory: "#059669",
  Release: "#DC2626",
  Application: "#EA580C",
  Tutorial: "#0891B2",
};

const defaultSectionByCategory: Readonly<Record<string, string>> = {
  Release: "Changelog",
  Application: "Field Notes",
};

/* ── Internal types ─────────────────────────────────────────────── */

interface GitHubContentEntry {
  readonly name: string;
  readonly path: string;
  readonly type: "file" | "dir";
  readonly download_url: string | null;
}

interface PostFrontmatter {
  readonly slug?: string;
  readonly date?: string;
  readonly category?: string;
  readonly section?: string;
  readonly title?: string;
  readonly abstract?: string;
  readonly categoryColor?: string;
}

/* ── GitHub fetching ────────────────────────────────────────────── */

const githubHeaders = (): Record<string, string> =>
  GH_TOKEN
    ? {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "lemma-blog-builder",
        Authorization: `Bearer ${GH_TOKEN}`,
      }
    : {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "lemma-blog-builder",
      };

const fetchMarkdownEntries = (): Promise<
  ReadonlyArray<{ readonly name: string; readonly content: string }>
> =>
  POSTS_REPO
    ? (async () => {
        const contentsUrl = POSTS_PATH
          ? `https://api.github.com/repos/${POSTS_REPO}/contents/${POSTS_PATH}?ref=${POSTS_BRANCH}`
          : `https://api.github.com/repos/${POSTS_REPO}/contents?ref=${POSTS_BRANCH}`;

        const res = await fetch(contentsUrl, { headers: githubHeaders() });
        return res.ok
          ? (async () => {
              const entries: unknown = await res.json();
              const mdEntries = (entries as readonly GitHubContentEntry[]).filter(
                (e) =>
                  e.type === "file" &&
                  e.download_url &&
                  (e.name.endsWith(".en.md") ||
                    e.name.endsWith(".ja.md") ||
                    (e.name.endsWith(".md") && !/\.(en|ja)\.md$/.test(e.name))),
              );

              const results = await Promise.all(
                mdEntries.map(async (entry) => {
                  const url = entry.download_url;
                  return url
                    ? (async () => {
                        const raw = await fetch(url, {
                          headers: { "User-Agent": "lemma-blog-builder" },
                        });
                        return raw.ok
                          ? ({ name: entry.name, content: await raw.text() } as const)
                          : undefined;
                      })()
                    : undefined;
                }),
              );

              return results.filter(
                (r): r is { readonly name: string; readonly content: string } => r !== undefined,
              );
            })()
          : (async () => {
              console.warn(`[blog] GitHub API ${String(res.status)}: ${await res.text()}`);
              return Promise.resolve([]);
            })();
      })()
    : (async () => {
        console.warn("[blog] LEMMA_POSTS_REPO is not set — returning empty list.");
        return Promise.resolve([]);
      })();

/* ── Locale from filename: *.en.md, *.ja.md, or *.md (en) ──────── */

const LOCALE_SUFFIX = /\.(en|ja)\.md$/;

function localeAndSlugFromFilename(
  filename: string,
): { locale: BlogLocale; slug: string } | undefined {
  const match = filename.match(LOCALE_SUFFIX);
  return match
    ? { locale: match[1] as BlogLocale, slug: filename.replace(LOCALE_SUFFIX, "") }
    : filename.endsWith(".md")
      ? { locale: "en", slug: filename.replace(/\.md$/, "") }
      : undefined;
}

const BLOG_CODE_THEME = "github-dark";

const BLOG_CODE_LANGS = [
  "bash",
  "css",
  "diff",
  "html",
  "javascript",
  "js",
  "json",
  "jsonc",
  "markdown",
  "md",
  "plaintext",
  "shell",
  "sql",
  "text",
  "ts",
  "typescript",
  "yaml",
  "yml",
] as const;

const escapeCodeHtml = (raw: string): string =>
  raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ── Markdown → BlogPost ────────────────────────────────────────── */

function parsePost(filename: string, raw: string): BlogPost | undefined {
  const parsed = localeAndSlugFromFilename(filename);
  return parsed
    ? (() => {
        const { data, content } = matter(raw);
        const fm = data as PostFrontmatter;
        return fm.title
          ? {
              slug: fm.slug ?? parsed.slug,
              locale: parsed.locale,
              date: fm.date ?? "",
              category: fm.category ?? "",
              section: fm.section || defaultSectionByCategory[fm.category || ""] || "Essays",
              title: fm.title,
              abstract: fm.abstract ?? "",
              body: marked.parse(content, { async: false }),
              categoryColor:
                fm.categoryColor || categoryColorByCategory[fm.category || ""] || "#000",
            }
          : undefined;
      })()
    : undefined;
}

/* ── Cached loader (shared across callers within one build) ────── */

const loadPosts = (() => {
  const cache: { current?: Promise<ReadonlyArray<BlogPost>> } = {};
  return (): Promise<ReadonlyArray<BlogPost>> =>
    cache.current
      ? cache.current
      : (cache.current = (async () => {
          const highlighter = await createHighlighter({
            themes: [BLOG_CODE_THEME],
            langs: [...BLOG_CODE_LANGS],
          });
          marked.use({
            renderer: {
              code({ text, lang }: Tokens.Code) {
                const safeLang = lang ?? "text";
                const tryHighlight = (): string =>
                  highlighter.codeToHtml(text, {
                    lang: safeLang,
                    theme: BLOG_CODE_THEME,
                  });
                return tryHighlight() || `<pre><code>${escapeCodeHtml(text)}</code></pre>`;
              },
            },
          });
          const entries = await fetchMarkdownEntries();
          return entries
            .map((e) => parsePost(e.name, e.content))
            .filter((p): p is BlogPost => p !== undefined)
            .toSorted((a, b) => (a.date > b.date ? -1 : 1));
        })());
})();

/* ── Public API (async) ─────────────────────────────────────────── */

export async function getBlogSections(locale: BlogLocale): Promise<ReadonlyArray<BlogSection>> {
  const posts = (await loadPosts()).filter((p) => p.locale === locale);
  const grouped = posts.reduce<Record<string, BlogPost[]>>(
    (acc, post) => ({
      ...acc,
      [post.section]: [...(acc[post.section] ?? []), post],
    }),
    {},
  );

  const entries = Object.entries(grouped);
  const filtered = entries.filter((s) => s[1].length > 0);
  const mapped = filtered.map(([section, sectionPosts]) => ({ section, posts: sectionPosts }));
  const sorted = mapped.slice().sort((a, b) => {
    const aIdx = SECTION_ORDER.indexOf(a.section);
    const bIdx = SECTION_ORDER.indexOf(b.section);
    return aIdx === -1 && bIdx === -1 ? 0 : aIdx === -1 ? 1 : bIdx === -1 ? -1 : aIdx - bIdx;
  });
  return sorted;
}

export async function getAllPosts(locale: BlogLocale): Promise<ReadonlyArray<BlogPost>> {
  const posts = await loadPosts();
  return posts.filter((p) => p.locale === locale);
}

export async function getPostBySlug(
  slug: string,
  locale: BlogLocale,
): Promise<BlogPost | undefined> {
  const posts = await loadPosts();
  return posts.find((p) => p.slug === slug && p.locale === locale);
}
