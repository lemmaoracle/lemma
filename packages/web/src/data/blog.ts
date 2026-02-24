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

const POSTS_REPO = import.meta.env.LEMMA_POSTS_REPO ?? "";
const POSTS_BRANCH = import.meta.env.LEMMA_POSTS_BRANCH ?? "main";
const POSTS_PATH = import.meta.env.LEMMA_POSTS_PATH ?? "";
const GH_TOKEN = import.meta.env.LEMMA_GH_TOKEN ?? "";

const SECTION_ORDER: ReadonlyArray<string> = [
  "Essays",
  "Changelog",
  "Field Notes",
];

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

function githubHeaders(): Record<string, string> {
  const base: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "lemma-blog-builder",
  };
  if (GH_TOKEN) {
    base.Authorization = `Bearer ${GH_TOKEN}`;
  }
  return base;
}

async function fetchMarkdownEntries(): Promise<
  ReadonlyArray<{ readonly name: string; readonly content: string }>
> {
  if (!POSTS_REPO) {
    console.warn(
      "[blog] LEMMA_POSTS_REPO is not set — returning empty list.",
    );
    return [];
  }

  const contentsUrl = POSTS_PATH
    ? `https://api.github.com/repos/${POSTS_REPO}/contents/${POSTS_PATH}?ref=${POSTS_BRANCH}`
    : `https://api.github.com/repos/${POSTS_REPO}/contents?ref=${POSTS_BRANCH}`;

  const res = await fetch(contentsUrl, { headers: githubHeaders() });
  if (!res.ok) {
    console.warn(`[blog] GitHub API ${res.status}: ${await res.text()}`);
    return [];
  }

  const entries: ReadonlyArray<GitHubContentEntry> = await res.json();
  const mdEntries = entries.filter(
    (e) =>
      e.type === "file" &&
      e.download_url &&
      (e.name.endsWith(".en.md") ||
        e.name.endsWith(".ja.md") ||
        (e.name.endsWith(".md") && !/\.(en|ja)\.md$/.test(e.name))),
  );

  const results = await Promise.all(
    mdEntries.map(async (entry) => {
      const raw = await fetch(entry.download_url!, {
        headers: { "User-Agent": "lemma-blog-builder" },
      });
      if (!raw.ok) return undefined;
      return { name: entry.name, content: await raw.text() } as const;
    }),
  );

  return results.filter(
    (r): r is { readonly name: string; readonly content: string } =>
      r !== undefined,
  );
}

/* ── Locale from filename: *.en.md, *.ja.md, or *.md (en) ──────── */

const LOCALE_SUFFIX = /\.(en|ja)\.md$/;

function localeAndSlugFromFilename(
  filename: string,
): { locale: BlogLocale; slug: string } | undefined {
  const match = filename.match(LOCALE_SUFFIX);
  if (match) {
    return {
      locale: match[1] as BlogLocale,
      slug: filename.replace(LOCALE_SUFFIX, ""),
    };
  }
  if (filename.endsWith(".md")) {
    return {
      locale: "en",
      slug: filename.replace(/\.md$/, ""),
    };
  }
  return undefined;
}

/* ── Markdown → BlogPost ────────────────────────────────────────── */

function parsePost(
  filename: string,
  raw: string,
): BlogPost | undefined {
  const parsed = localeAndSlugFromFilename(filename);
  if (!parsed) return undefined;

  const { data, content } = matter(raw);
  const fm = data as PostFrontmatter;
  if (!fm.title) return undefined;

  const slug = fm.slug ?? parsed.slug;
  const category = fm.category ?? "";
  const section =
    fm.section ?? defaultSectionByCategory[category] ?? "Essays";
  const color =
    fm.categoryColor ?? categoryColorByCategory[category] ?? "#000";
  const body = marked.parse(content, { async: false }) as string;

  return {
    slug,
    locale: parsed.locale,
    date: fm.date ?? "",
    category,
    section,
    title: fm.title,
    abstract: fm.abstract ?? "",
    body,
    categoryColor: color,
  };
}

/* ── Cached loader (shared across callers within one build) ────── */

let _cache: Promise<ReadonlyArray<BlogPost>> | undefined;

function loadPosts(): Promise<ReadonlyArray<BlogPost>> {
  if (!_cache) {
    _cache = fetchMarkdownEntries().then((entries) =>
      entries
        .map((e) => parsePost(e.name, e.content))
        .filter((p): p is BlogPost => p !== undefined)
        .toSorted((a, b) => (a.date > b.date ? -1 : 1)),
    );
  }
  return _cache;
}

/* ── Public API (async) ─────────────────────────────────────────── */

export async function getBlogSections(
  locale: BlogLocale,
): Promise<ReadonlyArray<BlogSection>> {
  const posts = (await loadPosts()).filter((p) => p.locale === locale);

  const grouped = new Map<string, BlogPost[]>(
    SECTION_ORDER.map((s) => [s, []]),
  );

  for (const post of posts) {
    const list = grouped.get(post.section);
    if (list) {
      list.push(post);
    } else {
      grouped.set(post.section, [post]);
    }
  }

  return [...grouped.entries()]
    .map(([section, sectionPosts]) => ({ section, posts: sectionPosts }))
    .filter((s) => s.posts.length > 0);
}

export async function getAllPosts(
  locale: BlogLocale,
): Promise<ReadonlyArray<BlogPost>> {
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
