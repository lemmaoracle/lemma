import { BlogEntry } from "./BlogEntry";

interface Post {
  date: string;
  category: string;
  title: string;
  abstract: string;
  categoryColor?: string;
}

interface BlogSection {
  section: string;
  posts: Post[];
}

const blogData: BlogSection[] = [
  {
    section: "Essays",
    posts: [
      {
        date: "2026.02.18",
        category: "Research",
        title: "Temporal reasoning and the architecture of uncertainty",
        abstract:
          "A framework for modeling decision systems that operate across extended timeframes where information asymmetry compounds with each step.",
        categoryColor: "#2563EB",
      },
      {
        date: "2026.02.10",
        category: "Foundations",
        title: "Why oracles fail at horizon problems",
        abstract:
          "Traditional prediction systems collapse when asked to maintain coherence over multi‑stage reasoning chains. We examine the structural causes.",
        categoryColor: "#7C3AED",
      },
      {
        date: "2026.02.01",
        category: "Theory",
        title: "Proof‑carrying predictions: a new primitive",
        abstract:
          "Exploring computational proofs as a substrate for trustworthy long‑term inference, and why this matters for AI alignment.",
        categoryColor: "#059669",
      },
      {
        date: "2026.01.20",
        category: "Research",
        title: "Compositional semantics for planning under ambiguity",
        abstract:
          "How Lemma Oracle builds meaning from partial information, treating uncertainty not as noise but as structure.",
        categoryColor: "#2563EB",
      },
    ],
  },
  {
    section: "Changelog",
    posts: [
      {
        date: "2026.02.15",
        category: "Release",
        title: "v0.8.0 — Recursive proof validation",
        abstract:
          "Introduced hierarchical proof checking across nested reasoning steps. Improves reliability on complex decision trees by 47%.",
        categoryColor: "#DC2626",
      },
      {
        date: "2026.02.08",
        category: "Release",
        title: "v0.7.2 — Performance optimization",
        abstract:
          "Reduced inference latency on multi‑horizon queries by ~3x through improved caching and parallel execution strategies.",
        categoryColor: "#DC2626",
      },
      {
        date: "2026.01.28",
        category: "Release",
        title: "v0.7.0 — Temporal context windows",
        abstract:
          "New API for defining decision horizons dynamically. Allows users to specify granular time‑awareness parameters per query.",
        categoryColor: "#DC2626",
      },
      {
        date: "2026.01.15",
        category: "Release",
        title: "v0.6.5 — Python SDK GA",
        abstract:
          "General availability of the Python SDK with full documentation, examples, and type stubs for type‑safe integration.",
        categoryColor: "#DC2626",
      },
    ],
  },
  {
    section: "Field Notes",
    posts: [
      {
        date: "2026.02.12",
        category: "Application",
        title: "Using Lemma Oracle for supply chain prediction",
        abstract:
          "A case study from a manufacturing partner: forecasting bottlenecks six quarters out with proof‑verified confidence intervals.",
        categoryColor: "#EA580C",
      },
      {
        date: "2026.02.03",
        category: "Application",
        title: "Portfolio construction in uncertain regimes",
        abstract:
          "How a quantitative fund applies temporal reasoning to rebalancing strategies when market conditions shift unpredictably.",
        categoryColor: "#EA580C",
      },
      {
        date: "2026.01.22",
        category: "Tutorial",
        title: "Quickstart: Your first multi‑step inference",
        abstract:
          "A practical guide to setting up Lemma Oracle, defining a simple decision graph, and interpreting probabilistic outputs.",
        categoryColor: "#0891B2",
      },
      {
        date: "2026.01.10",
        category: "Application",
        title: "Climate modeling with long‑horizon constraints",
        abstract:
          "Research collaboration using Lemma Oracle to validate policy scenarios under deep uncertainty about ecological feedback loops.",
        categoryColor: "#EA580C",
      },
    ],
  },
];

export function BlogList() {
  return (
    <div className="max-w-[1400px] mx-auto px-8 py-16">
      {blogData.map((section, sectionIndex) => (
        <section key={sectionIndex} className="mb-20 last:mb-0">
          <h2 className="text-[11px] font-mono tracking-wider uppercase text-black/30 mb-8 pb-3 border-b border-black/10">
            {section.section}
          </h2>
          <div>
            {section.posts.map((post, postIndex) => (
              <BlogEntry
                key={postIndex}
                date={post.date}
                category={post.category}
                title={post.title}
                abstract={post.abstract}
                categoryColor={post.categoryColor}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
