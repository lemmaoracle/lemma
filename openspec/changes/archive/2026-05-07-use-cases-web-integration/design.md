# Design: Use-Cases & Pillars Web Integration

## 3-Layer Architecture

```
/pillars/                    ← Pillar Hub (card grid of 4 pillars)
/pillars/[slug]/             ← Pillar detail (6-block template)
/use-cases/[slug]/           ← Use case detail (section-based navigation)
```

## Content Source

Add `posts` repository as a git submodule under the web package:

```
lemma/packages/web/
  content/
    use-cases/          ← symlink or submodule pointing to posts/use-cases/
```

Build-time: Astro Content Collections reads from this directory.

## Content Collection Schemas

### Pillars Collection

```typescript
// src/content.config.ts
import { defineCollection, z } from "astro:content";

const pillars = defineCollection({
  type: "data",           // YAML/JSON data (no markdown body)
  schema: z.object({
    title: z.string(),
    slogan: z.string(),                        // equation slogan (e.g. "Origin ≠ Trust → ∃ Proof")
    subtitle: z.string(),                      // sub-copy
    problemStatement: z.string(),              // ≤100 chars
    whyNow: z.string(),                        // 1–2 anchors
    howLemmaFits: z.array(z.string()).length(3), // 3 ZK primitive bullets
    useCases: z.array(z.string()),             // slugs linking to use-cases collection
    primaryCTA: z.object({
      label: z.string(),
      href: z.string(),
      type: z.enum(["talk-to-us", "waitlist", "download"]),
    }),
    secondaryCTA: z.object({
      label: z.string(),
      href: z.string(),
      type: z.enum(["whitepaper", "github", "demo", "download"]),
    }).optional(),
    cover: z.string().optional(),
    order: z.number(),
  }),
});

const useCases = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    abstract: z.string(),
    targetVerticals: z.array(z.string()).optional(),
    relatedUseCases: z.array(z.string()).optional(),
    pillar: z.string(),                    // slug of parent pillar
    cover: z.string().optional(),
    tags: z.array(z.string()).optional(),
    section: z.enum(["Use Case"]).default("Use Case"),
    categoryColor: z.string().optional(),
  }),
});

export const collections = { pillars, "use-cases": useCases };
```

### Pillar Data Files

```
content/pillars/
  verifiable-origin.yaml
  verifiable-ai.yaml
  agent-trust-chain.yaml
  regulatory-attribute-proof.yaml
```

Example `verifiable-origin.yaml`:

```yaml
title: "Verifiable Origin"
slogan: "Origin ≠ Trust → ∃ Proof"
subtitle: "出所の証明こそが、信頼の起点"
problemStatement: "Bridge・クロスチェーン移転において、資産の"出所"は暗号論理的に証明されていない"
whyNow: "2024年 Ronin bridge $625M事件、2025年 FSA暗号資産ガイドライン施行"
howLemmaFits:
  - "Poseidon hash for on-chain commitment"
  - "BBS+ signatures for selective disclosure"
  - "Groth16 proofs for cross-chain verification"
useCases:
  - financial-data-exfiltration
  - defi-bridge-verification
primaryCTA:
  label: "Talk to us"
  href: "/contact"
  type: "talk-to-us"
secondaryCTA:
  label: "Demo repo"
  href: "https://github.com/lemmaoracle/example-mw"
  type: "demo"
cover: "/assets/pillars/verifiable-origin.webp"
order: 1
```

## Use Case Directory Convention

```
content/use-cases/
  financial-data-exfiltration/
    index.md              ← entry point (frontmatter = use case metadata)
    scenario.md           ← section: scenario
    architecture.md       ← section: architecture
    proof-points.md       ← section: proof-points
    pitch-deck.md         ← section: pitch-deck
  defi-bridge-verification/
    index.md
    scenario.md
    architecture.md
    proof-points.md
    pitch-deck.md
```

**Migration:** Current `README.md` files renamed to `index.md` with frontmatter added. Each frontmatter includes `pillar` field linking to parent pillar.

## Data Layer

New modules: `src/data/pillars.ts` and `src/data/useCases.ts`

```typescript
// pillars.ts
export interface Pillar {
  readonly slug: string;
  readonly title: string;
  readonly slogan: string;
  readonly subtitle: string;
  readonly problemStatement: string;
  readonly whyNow: string;
  readonly howLemmaFits: ReadonlyArray<string>;
  readonly useCaseSlugs: ReadonlyArray<string>;
  readonly primaryCTA: CTA;
  readonly secondaryCTA?: CTA;
  readonly cover?: string;
  readonly order: number;
}

export interface CTA {
  readonly label: string;
  readonly href: string;
  readonly type: "talk-to-us" | "waitlist" | "download" | "whitepaper" | "github" | "demo";
}
```

```typescript
// useCases.ts
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
```

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/pillars/` | `src/pages/pillars/index.astro` | Pillar Hub — 4 pillar cards |
| `/pillars/[slug]` | `src/pages/pillars/[slug].astro` | Pillar detail — 6-block template |
| `/use-cases/[slug]` | `src/pages/use-cases/[slug].astro` | Use case detail with section nav |
| `/ja/pillars/` | `src/pages/ja/pillars/index.astro` | JA pillar hub |
| `/ja/pillars/[slug]` | `src/pages/ja/pillars/[slug].astro` | JA pillar detail |
| `/ja/use-cases/[slug]` | `src/pages/ja/use-cases/[slug].astro` | JA use case detail |

## Pillar Detail 6-Block Template

```
┌─────────────────────────────────────┐
│ 1. Problem Statement (1 paragraph)  │
│    ≤100 chars, structural problem   │
├─────────────────────────────────────┤
│ 2. Why Now (1 paragraph)            │
│    1–2 anchors (regulation/event)   │
├─────────────────────────────────────┤
│ 3. How Lemma Fits (3 bullets)       │
│    Poseidon / BBS+ / Groth16        │
├─────────────────────────────────────┤
│ 4. Use Cases (2–3 cards)            │
│    → /use-cases/[slug]/             │
├─────────────────────────────────────┤
│ 5. Recent Thinking (3 blog posts)   │
│    auto-feed from blog collection   │
├─────────────────────────────────────┤
│ 6. CTA                              │
│    primary + secondary (per pillar) │
└─────────────────────────────────────┘
```

## SEO

Each `/pillars/[slug]/` and `/use-cases/[slug]/` gets unique:
- `<title>` — e.g., "Verifiable Origin — Origin ≠ Trust → ∃ Proof | Lemma Oracle"
- `<meta name="description">` — from problemStatement / abstract
- `<meta property="og:image">` — from cover or fallback
- Structured data (`Service` schema)
- `<link rel="canonical">`
- `<link rel="alternate" hreflang="ja/en">` cross-references

## Integration Points

### Services Page → Pillars

Add a "Pillars" section to `/services/`:

```
Lemmaの4つの柱を見る → /pillars/
```

### Blog Posts → Pillars / Use Cases

Related blog posts link to the corresponding pillar or use case:

```
関連ピラー: Verifiable Origin → /pillars/verifiable-origin/
関連ユースケース: DeFi Bridge Verification → /use-cases/defi-bridge-verification/
```

### Recent Thinking Auto-Feed

Pillar page block 5 pulls the 3 most recent blog posts matching pillar tags. This can be implemented via a `getCollection("blog")` query filtered by tag intersection.

## Dependencies

- Astro Content Collections (built into Astro 4+)
- `gray-matter` (already in web package)
- No new npm packages for v1