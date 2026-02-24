/**
 * Blog data layer. Currently uses dummy data.
 * TODO: fetch from Affine workspace by tag (e.g. tag "blog") via getStaticPaths at build time.
 * See https://affine.pro/blog/using-affine-as-a-blog-technical for approach (public workspace / session token + affine-reader).
 */

import * as lemmaOracleSpecs from "../../posts/lemma-oracle-specs.md";

export interface BlogPost {
  readonly slug: string;
  readonly date: string;
  readonly category: string;
  readonly title: string;
  readonly abstract: string;
  readonly body: string;
  readonly categoryColor?: string;
}

export interface BlogSection {
  readonly section: string;
  readonly posts: ReadonlyArray<BlogPost>;
}

const categoryColorByCategory: Readonly<Record<string, string>> = {
  Research: "#2563EB",
  Foundations: "#7C3AED",
  Theory: "#059669",
  Release: "#DC2626",
  Application: "#EA580C",
  Tutorial: "#0891B2",
};

const dummyPosts: ReadonlyArray<BlogPost> = [
  {
    slug: lemmaOracleSpecs.frontmatter.slug,
    date: lemmaOracleSpecs.frontmatter.date,
    category: lemmaOracleSpecs.frontmatter.category,
    title: lemmaOracleSpecs.frontmatter.title,
    abstract: lemmaOracleSpecs.frontmatter.abstract,
    body: lemmaOracleSpecs.compiledContent(),
    categoryColor: lemmaOracleSpecs.frontmatter.categoryColor,
  },
  {
    slug: "temporal-reasoning-uncertainty",
    date: "2026.02.18",
    category: "Research",
    title: "Temporal reasoning and the architecture of uncertainty",
    abstract:
      "A framework for modeling decision systems that operate across extended timeframes where information asymmetry compounds with each step.",
    body: "<p>Placeholder body. Replace with Affine-sourced content.</p>",
    categoryColor: "#2563EB",
  },
  {
    slug: "oracles-horizon-problems",
    date: "2026.02.10",
    category: "Foundations",
    title: "Why oracles fail at horizon problems",
    abstract:
      "Traditional prediction systems collapse when asked to maintain coherence over multi‑stage reasoning chains. We examine the structural causes.",
    body: "<p>Placeholder body. Replace with Affine-sourced content.</p>",
    categoryColor: "#7C3AED",
  },
];

function withCategoryColor(post: BlogPost): BlogPost {
  const color = post.categoryColor ?? categoryColorByCategory[post.category] ?? "#000";
  return { ...post, categoryColor: color };
}

/** Dummy sections matching the original BlogList structure. Replace with Affine fetch by tag. */
export function getBlogSections(): ReadonlyArray<BlogSection> {
  const essays = dummyPosts.slice(0, 2).map(withCategoryColor);
  const changelog: BlogPost[] = [
    {
      slug: "v0-8-0-recursive-proof-validation",
      date: "2026.02.15",
      category: "Release",
      title: "v0.8.0 — Recursive proof validation",
      abstract:
        "Introduced hierarchical proof checking across nested reasoning steps. Improves reliability on complex decision trees by 47%.",
      body: "<p>Placeholder.</p>",
      categoryColor: "#DC2626",
    },
  ];
  const fieldNotes: BlogPost[] = [
    {
      slug: "supply-chain-prediction",
      date: "2026.02.12",
      category: "Application",
      title: "Using Lemma Oracle for supply chain prediction",
      abstract:
        "A case study from a manufacturing partner: forecasting bottlenecks six quarters out with proof‑verified confidence intervals.",
      body: "<p>Placeholder.</p>",
      categoryColor: "#EA580C",
    },
  ];
  return [
    { section: "Essays", posts: essays },
    { section: "Changelog", posts: changelog },
    { section: "Field Notes", posts: fieldNotes },
  ];
}

/** All posts flattened for blog index and getStaticPaths. */
export function getAllPosts(): ReadonlyArray<BlogPost> {
  return getBlogSections().flatMap((s) => s.posts.map(withCategoryColor));
}

/** Get a single post by slug. Returns undefined if not found. */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}
