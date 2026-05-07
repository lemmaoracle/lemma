/**
 * Use Cases data layer.
 * Fetches Use Case content from GitHub repository at build time.
 * Mirrors the blog.ts pattern for consistency.
 *
 * Environment variables:
 *   LEMMA_POSTS_REPO   — "owner/repo" (e.g. "lemmaoracle/posts")
 *   LEMMA_POSTS_BRANCH — branch to read from (default: "main")
 *   LEMMA_POSTS_PATH   — subdirectory inside the repo (default: root)
 *   LEMMA_GH_TOKEN     — PAT for private repos / higher rate limits (optional)
 */

import matter from "gray-matter";
import { marked } from "marked";
import type { Tokens } from "marked";

export type BlogLocale = "en" | "ja";

export interface Heading {
  readonly id: string;
  readonly text: string;
  readonly level: number;
}

export interface UseCaseSection {
  readonly key: string;
  readonly title: string;
  readonly body: string;
  readonly headings: ReadonlyArray<Heading>;
}

export interface UseCase {
  readonly slug: string;
  readonly locale: BlogLocale;
  readonly title: string;
  readonly abstract: string;
  readonly pillar: string;
  readonly targetVerticals: ReadonlyArray<string>;
  readonly relatedUseCases: ReadonlyArray<string>;
  readonly cover?: string;
  readonly tags?: ReadonlyArray<string>;
  readonly sections: ReadonlyArray<UseCaseSection>;
  readonly readingTime: number;
}

/* ── Config ─────────────────────────────────────────────────────── */

const POSTS_REPO = import.meta.env.LEMMA_POSTS_REPO || "";
const POSTS_BRANCH = import.meta.env.LEMMA_POSTS_BRANCH || "main";
const POSTS_PATH = import.meta.env.LEMMA_POSTS_PATH || "";
const GH_TOKEN = import.meta.env.LEMMA_GH_TOKEN || "";

const SECTION_ORDER: ReadonlyArray<string> = [
  "scenario",
  "architecture",
  "proof-points",
  "pitch-deck",
  "cross-case",
];

/* ── Internal types ─────────────────────────────────────────────── */

interface GitHubContentEntry {
  readonly name: string;
  readonly path: string;
  readonly type: "file" | "dir";
  readonly download_url: string | null;
}

interface UseCaseFrontmatter {
  readonly title?: string;
  readonly abstract?: string;
  readonly pillar?: string;
  readonly targetVerticals?: ReadonlyArray<string>;
  readonly relatedUseCases?: ReadonlyArray<string>;
  readonly cover?: string;
  readonly tags?: ReadonlyArray<string>;
}

/* ── GitHub fetching ────────────────────────────────────────────── */

const githubHeaders = (): Record<string, string> =>
  GH_TOKEN
    ? {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "lemma-usecases-builder",
        Authorization: `Bearer ${GH_TOKEN}`,
      }
    : {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "lemma-usecases-builder",
      };

interface UseCaseDir {
  readonly name: string;
  readonly files: ReadonlyArray<{ readonly name: string; readonly content: string }>;
}

const fetchUseCaseDirectories = async (): Promise<ReadonlyArray<UseCaseDir>> => {
  if (!POSTS_REPO) {
    console.warn("[useCases] LEMMA_POSTS_REPO is not set — returning empty list.");
    return [];
  }

  const useCasesPath = POSTS_PATH ? `${POSTS_PATH}/use-cases` : "use-cases";
  const contentsUrl = `https://api.github.com/repos/${POSTS_REPO}/contents/${useCasesPath}?ref=${POSTS_BRANCH}`;

  const res = await fetch(contentsUrl, { headers: githubHeaders() });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[useCases] GitHub API ${String(res.status)}: ${body}`);
    throw new Error(`[useCases] GitHub API ${String(res.status)} fetching ${useCasesPath}: ${body}`);
  }

  const entries: unknown = await res.json();
  const dirs = (entries as readonly GitHubContentEntry[]).filter((e) => e.type === "dir");

  const results = await Promise.all(
    dirs.map(async (dir): Promise<UseCaseDir | undefined> => {
      const dirContentsUrl = `https://api.github.com/repos/${POSTS_REPO}/contents/${dir.path}?ref=${POSTS_BRANCH}`;
      const dirRes = await fetch(dirContentsUrl, { headers: githubHeaders() });

      if (!dirRes.ok) {
        console.error(`[useCases] GitHub API ${String(dirRes.status)} fetching ${dir.path}`);
        throw new Error(`[useCases] GitHub API ${String(dirRes.status)} fetching ${dir.path}`);
      }

      const dirEntries: unknown = await dirRes.json();
      const mdFiles = (dirEntries as readonly GitHubContentEntry[]).filter(
        (e) => e.type === "file" && e.download_url && e.name.endsWith(".md"),
      );

      const files = await Promise.all(
        mdFiles.map(async (file): Promise<{ readonly name: string; readonly content: string } | undefined> => {
          if (!file.download_url) return undefined;
          const raw = await fetch(file.download_url, {
            headers: { "User-Agent": "lemma-usecases-builder" },
          });
          return raw.ok ? { name: file.name, content: await raw.text() } : undefined;
        }),
      );

      const validFiles = files.filter(
        (f): f is { readonly name: string; readonly content: string } => f !== undefined,
      );

      return { name: dir.name, files: validFiles };
    }),
  );

  return results.filter((r): r is UseCaseDir => r !== undefined);
};

/* ── Markdown utilities ─────────────────────────────────────────── */

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

function extractHeadings(content: string): Heading[] {
  const tokens = marked.lexer(content) as readonly Tokens.Generic[];
  return tokens
    .filter((token): token is Tokens.Heading => token.type === "heading" && (token.depth === 2 || token.depth === 3))
    .map((token) => ({
      id: slugifyHeading(token.text),
      text: cleanHeadingText(token.text),
      level: token.depth,
    }));
}

function calculateReadingTime(content: string, locale: BlogLocale): number {
  if (locale === "ja") {
    const chars = content.replace(/\s/g, "").length;
    return Math.max(1, Math.round(chars / 500));
  }
  const words = content.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.max(1, Math.round(words / 200));
}

/* ── Parse Use Case ─────────────────────────────────────────────── */

function extractTitleFromContent(content: string): string | undefined {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : undefined;
}

const LOCALE_SUFFIX = /\.(en|ja)\.md$/;

function localeAndBaseFromFilename(
  filename: string,
): { locale: BlogLocale; base: string } | undefined {
  const match = filename.match(LOCALE_SUFFIX);
  return match
    ? { locale: match[1] as BlogLocale, base: filename.replace(LOCALE_SUFFIX, "") }
    : filename.endsWith(".md")
      ? { locale: "en", base: filename.replace(/\.md$/, "") }
      : undefined;
}

function parseUseCaseForLocale(dir: UseCaseDir, locale: BlogLocale): UseCase | undefined {
  const readmeSuffix = locale === "ja" ? ".ja.md" : locale === "en" ? ".en.md" : ".md";
  const readmeFile =
    dir.files.find((f) => f.name === `README${readmeSuffix}`) ??
    dir.files.find((f) => f.name === `index${readmeSuffix}`) ??
    (locale === "en" ? dir.files.find((f) => f.name === "README.md" || f.name === "index.md") : undefined);
  if (!readmeFile) return undefined;

  const { data, content } = matter(readmeFile.content);
  const fm = data as UseCaseFrontmatter;

  const title = fm.title ?? extractTitleFromContent(readmeFile.content);
  if (!title) return undefined;

  // Parse sections for this locale
  const sectionSuffix = locale === "ja" ? ".ja.md" : locale === "en" ? ".en.md" : ".md";
  const sectionFiles = dir.files.filter((f) => {
    if (f.name === "README.md" || f.name === "index.md") return false;
    if (f.name === "README.ja.md" || f.name === "README.en.md") return false;
    if (f.name === "index.ja.md" || f.name === "index.en.md") return false;
    if (locale === "ja") return f.name.endsWith(".ja.md");
    if (locale === "en") return f.name.endsWith(".en.md") || (!f.name.endsWith(".ja.md") && f.name.endsWith(".md"));
    return false;
  });

  const sections: UseCaseSection[] = sectionFiles
    .map((file): UseCaseSection | undefined => {
      const { content: sectionContent } = matter(file.content);
      const key = file.name.replace(/\.md$/, "");
      const title = key
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        key,
        title,
        body: marked.parse(sectionContent, { async: false }),
        headings: extractHeadings(sectionContent),
      };
    })
    .filter((s): s is UseCaseSection => s !== undefined)
    .sort((a, b) => {
      const aIdx = SECTION_ORDER.indexOf(a.key);
      const bIdx = SECTION_ORDER.indexOf(b.key);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });

  const totalContent = content + sectionFiles.map((f) => matter(f.content).content).join("\n");

  return {
    slug: dir.name,
    locale,
    title,
    abstract: fm.abstract ?? "",
    pillar: fm.pillar ?? "verifiable-origin",
    targetVerticals: fm.targetVerticals ?? [],
    relatedUseCases: fm.relatedUseCases ?? [],
    cover: fm.cover,
    tags: fm.tags && fm.tags.length > 0 ? fm.tags : undefined,
    sections,
    readingTime: calculateReadingTime(totalContent, locale),
  };
}

/* ── Cached loader ───────────────────────────────────────────────── */

const loadUseCases = (() => {
  const cache: { current?: Promise<ReadonlyArray<UseCase>> } = {};
  return (): Promise<ReadonlyArray<UseCase>> =>
    cache.current
      ? cache.current
      : (cache.current = (async () => {
          const dirs = await fetchUseCaseDirectories();
          const locales: ReadonlyArray<BlogLocale> = ["en", "ja"];
          return dirs.flatMap((dir) =>
            locales
              .map((locale) => parseUseCaseForLocale(dir, locale))
              .filter((u): u is UseCase => u !== undefined),
          );
        })());
})();

/* ── Public API ─────────────────────────────────────────────────── */

export async function getAllUseCases(locale?: BlogLocale): Promise<ReadonlyArray<UseCase>> {
  const all = await loadUseCases();
  return locale ? all.filter((u) => u.locale === locale) : all;
}

export async function getUseCaseBySlug(slug: string, locale: BlogLocale = "en"): Promise<UseCase | undefined> {
  const useCases = await loadUseCases();
  return useCases.find((u) => u.slug === slug && u.locale === locale);
}

export async function getUseCasesByPillar(pillarSlug: string, locale: BlogLocale = "en"): Promise<ReadonlyArray<UseCase>> {
  const useCases = await loadUseCases();
  return useCases.filter((u) => u.pillar === pillarSlug && u.locale === locale);
}

export async function getUseCasesBySlugs(slugs: ReadonlyArray<string>, locale: BlogLocale = "en"): Promise<ReadonlyArray<UseCase>> {
  const useCases = await loadUseCases();
  return useCases.filter((u) => slugs.includes(u.slug) && u.locale === locale);
}
