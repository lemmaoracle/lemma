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

export interface RelatedLink {
  readonly label: string;
  readonly href: string;
}

export interface Heading {
  readonly id: string;
  readonly text: string;
  readonly level: number;
}

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
  readonly cover?: string;
  readonly tags?: ReadonlyArray<string>;
  readonly relatedLinks?: ReadonlyArray<RelatedLink>;
  readonly headings: ReadonlyArray<Heading>;
  readonly readingTime: number;
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
  Industry: "#10B981",
  Solutions: "#8B5CF6",
  Technical: "#3B82F6",
  Announcements: "#F59E0B",
};

const defaultSectionByCategory: Readonly<Record<string, string>> = {
  Release: "Changelog",
  Application: "Field Notes",
  Announcements: "Changelog",
};

/* ── Blog post taxonomy ─────────────────────────────────────────────
 * The canonical essay categories, in display order. Single source of
 * truth for category filter pills, category archive pages
 * (/blog/category/<slug>), and the article breadcrumb link.
 */
export const BLOG_CATEGORIES = ["Industry", "Solutions", "Technical", "Announcements"] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const isBlogCategory = (c: string): c is BlogCategory =>
  (BLOG_CATEGORIES as ReadonlyArray<string>).includes(c);

/** URL slug for a category archive page, e.g. "Solutions" → "solutions". */
export const categorySlug = (category: string): string => category.toLowerCase();

/* Doc/guide categories (EN + JA labels) — these render in their own
 * sections on the blog index and are excluded from the essay feed and
 * the category pills. */
const DOC_CATEGORIES: ReadonlyArray<string> = ["Guides", "Foundations", "ガイド", "基盤"];

/** True for guide/foundation posts (either locale's label). */
export const isDocCategory = (category: string): boolean => DOC_CATEGORIES.includes(category);

/* ── Tag → destination mapping ──────────────────────────────────────
 * Used by BlogArticleTemplate to render end-of-article tag chips as
 * navigation back into Pillar / UseCase / glossary pages. Tags without
 * a destination here render as plain (non-link) chips.
 *
 * Locale-aware: getTagDestination prepends the page base so /ja/ posts
 * link to /ja/pillars/... / /ja/use-cases/... / /ja/glossary/...
 */
const TAG_DESTINATIONS: Readonly<Record<string, string>> = {
  // Pillars
  "verifiable-origin": "/pillars/verifiable-origin/",
  "verifiable-ai": "/pillars/verifiable-ai/",
  "agent-security": "/pillars/agent-authority-proof/",
  "agent-authority": "/pillars/agent-authority-proof/",
  compliance: "/pillars/regulatory-attribute-proof/",
  // Use cases
  "financial-services": "/use-cases/kyc-aml-selective-disclosure/",
  // Glossary
  provenance: "/glossary/provenance/",
  "zk-proof": "/glossary/zk-proof/",
  "selective-disclosure": "/glossary/selective-disclosure/",
  "agentic-payments": "/glossary/agentic-payments/",
  "ai-agents": "/glossary/agentic-payments/",
  // Trust Layer overview fallback for concepts that span multiple pillars
  "pre-execution-attestation": "/pillars/",
  "trust-layer": "/pillars/",
};

export function getTagDestination(tag: string, base: string): string | undefined {
  const path = TAG_DESTINATIONS[tag];
  if (!path) return undefined;
  return `${base}${path}`;
}

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
  readonly cover?: string;
  readonly tags?: ReadonlyArray<string>;
  readonly relatedLinks?: ReadonlyArray<RelatedLink>;
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

        const res = await fetch(contentsUrl, { headers: githubHeaders(), cache: "no-store" });
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
                          cache: "no-store",
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
  "solidity",
  "sql",
  "text",
  "ts",
  "typescript",
  "yaml",
  "yml",
] as const;

const escapeCodeHtml = (raw: string): string =>
  raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ── Cover URL resolution ───────────────────────────────────────── */

function joinPaths(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .map((part) => part.replace(/^\/+|\/+$/g, "")) // 前後のスラッシュを削除
    .filter(Boolean)
    .join("/");
}

function resolveCoverUrl(relativePath: string): string {
  return !relativePath || !POSTS_REPO
    ? relativePath
    : relativePath.startsWith("http://") || relativePath.startsWith("https://")
      ? relativePath
      : (() => {
          const repo = POSTS_REPO;
          const branch = POSTS_BRANCH;
          const fullPath = joinPaths(POSTS_PATH, relativePath);
          return `https://raw.githubusercontent.com/${repo}/${branch}/${fullPath}`;
        })();
}

/* ── Markdown → BlogPost ────────────────────────────────────────── */

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[▸◇◆●○★☆◀▶]/g, " ")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function cleanHeadingText(text: string): string {
  return text.replace(/^\s*[▸◇◆●○★☆◀▶]\s*/, "").trim();
}

function inlineText(tokens: ReadonlyArray<Tokens.Generic> | undefined): string {
  return !tokens
    ? ""
    : tokens
        .map((t) => {
          const nested = t.tokens as ReadonlyArray<Tokens.Generic> | undefined;
          return nested && nested.length > 0
            ? inlineText(nested)
            : typeof t.text === "string"
              ? t.text
              : "";
        })
        .join("");
}

const isHeadingToken = (token: Tokens.Generic): token is Tokens.Heading =>
  token.type === "heading" && (token.depth === 2 || token.depth === 3);

function extractHeadings(content: string): Heading[] {
  const tokens = marked.lexer(content) as readonly Tokens.Generic[];
  return tokens
    .filter(isHeadingToken)
    .map((token) => {
      const plain =
        inlineText(token.tokens) ||
        token.text;
      return {
        id: slugifyHeading(plain),
        text: cleanHeadingText(plain),
        level: token.depth,
      };
    });
}

function calculateReadingTime(content: string, locale: BlogLocale): number {
  if (locale === "ja") {
    const chars = content.replace(/\s/g, "").length;
    return Math.max(1, Math.round(chars / 500));
  }
  const words = content.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.max(1, Math.round(words / 200));
}

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
              cover: fm.cover ? resolveCoverUrl(fm.cover) : undefined,
              tags: fm.tags && fm.tags.length > 0 ? fm.tags : undefined,
              relatedLinks:
                fm.relatedLinks && fm.relatedLinks.length > 0 ? fm.relatedLinks : undefined,
              headings: extractHeadings(content),
              readingTime: calculateReadingTime(content, parsed.locale),
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
                const safeText: string = text;
                const safeLang: string = lang ?? "text";
                const tryHighlight = (): string =>
                  highlighter.codeToHtml(safeText, {
                    lang: safeLang,
                    theme: BLOG_CODE_THEME,
                  });
                return tryHighlight() || `<pre><code>${escapeCodeHtml(safeText)}</code></pre>`;
              },
              heading({ tokens, depth, text }: Tokens.Heading) {
                const inner = marked.parseInline(tokens.map((t) => t.raw).join("")) as string;
                const id = slugifyHeading(text);
                const depthStr = String(depth);
                return `<h${depthStr} id="${id}">${inner}</h${depthStr}>\n`;
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

export interface PostNavigation {
  readonly prev?: BlogPost;
  readonly next?: BlogPost;
}

export async function getPostNavigation(slug: string, locale: BlogLocale): Promise<PostNavigation> {
  const posts = (await loadPosts()).filter((p) => p.locale === locale);
  const currentIndex = posts.findIndex((p) => p.slug === slug);

  return currentIndex === -1
    ? {}
    : {
        prev: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : undefined,
        next: currentIndex > 0 ? posts[currentIndex - 1] : undefined,
      };
}

export async function getRelatedPosts(
  slug: string,
  locale: BlogLocale,
  limit: number = 5,
): Promise<ReadonlyArray<BlogPost>> {
  const posts = (await loadPosts()).filter((p) => p.locale === locale);
  const currentPost = posts.find((p) => p.slug === slug);

  return !currentPost || !currentPost.category
    ? []
    : posts.filter((p) => p.slug !== slug && p.category === currentPost.category).slice(0, limit);
}
