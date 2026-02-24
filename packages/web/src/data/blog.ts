/**
 * Blog data layer.
 * Fetches Markdown articles from a dedicated GitHub repository at build time.
 *
 * Environment variables:
 *   GITHUB_POSTS_REPO   — "owner/repo" (e.g. "lemmaoracle/blog-posts")
 *   GITHUB_POSTS_BRANCH — branch to read from (default: "main")
 *   GITHUB_POSTS_PATH   — subdirectory inside the repo (default: root)
 *   GITHUB_TOKEN        — PAT for private repos / higher rate limits (optional)
 */

import matter from "gray-matter";
import { marked } from "marked";

export interface BlogPost {
  readonly slug: string;
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

const POSTS_REPO = import.meta.env.GITHUB_POSTS_REPO ?? "";
const POSTS_BRANCH = import.meta.env.GITHUB_POSTS_BRANCH ?? "main";
const POSTS_PATH = import.meta.env.GITHUB_POSTS_PATH ?? "";
const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN ?? "";

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
  if (GITHUB_TOKEN) {
    base.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  return base;
}

async function fetchMarkdownEntries(): Promise<
  ReadonlyArray<{ readonly name: string; readonly content: string }>
> {
  if (!POSTS_REPO) {
    console.warn(
      "[blog] GITHUB_POSTS_REPO is not set — returning empty list.",
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
    (e) => e.type === "file" && e.name.endsWith(".md") && e.download_url,
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

/* ── Markdown → BlogPost ────────────────────────────────────────── */

function parsePost(filename: string, raw: string): BlogPost | undefined {
  const { data, content } = matter(raw);
  const fm = data as PostFrontmatter;
  if (!fm.title) return undefined;

  const slug = fm.slug ?? filename.replace(/\.md$/, "");
  const category = fm.category ?? "";
  const section =
    fm.section ?? defaultSectionByCategory[category] ?? "Essays";
  const color =
    fm.categoryColor ?? categoryColorByCategory[category] ?? "#000";
  const body = marked.parse(content, { async: false }) as string;

  return {
    slug,
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

export async function getBlogSections(): Promise<ReadonlyArray<BlogSection>> {
  const posts = await loadPosts();

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

export async function getAllPosts(): Promise<ReadonlyArray<BlogPost>> {
  return loadPosts();
}

export async function getPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  const posts = await loadPosts();
  return posts.find((p) => p.slug === slug);
}
