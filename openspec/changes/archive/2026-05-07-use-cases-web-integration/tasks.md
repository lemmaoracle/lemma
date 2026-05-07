# Tasks: Use-Cases & Pillars Web Integration

## 1. Content Source Setup
- [ ] 1.1 Add `posts` as git submodule or configure content path under `packages/web/`
- [ ] 1.2 Verify content builds correctly from submodule path

## 2. Content Collection Schemas
- [ ] 2.1 Create `src/content.config.ts` with `pillars` data collection schema
- [ ] 2.2 Add `use-cases` content collection schema to `content.config.ts`
- [ ] 2.3 Add TypeScript interfaces for `Pillar`, `CTA`, `UseCase`, `UseCaseSection` in `src/data/`

## 3. Pillar Data Files
- [ ] 3.1 Create `content/pillars/verifiable-origin.yaml` (P1)
- [ ] 3.2 Create `content/pillars/verifiable-ai.yaml` (P2)
- [ ] 3.3 Create `content/pillars/agent-trust-chain.yaml` (P3)
- [ ] 3.4 Create `content/pillars/regulatory-attribute-proof.yaml` (P4)

## 4. Content Migration
- [ ] 4.1 Rename `README.md` → `index.md` in each use case directory
- [ ] 4.2 Add frontmatter to each `index.md` including `pillar` field linking to parent pillar
- [ ] 4.3 Verify all section files (scenario.md, architecture.md, proof-points.md, pitch-deck.md) are present

## 5. Pillar Hub Page
- [ ] 5.1 Create `src/pages/pillars/index.astro` (EN — 4 pillar cards with slogans)
- [ ] 5.2 Create `src/pages/ja/pillars/index.astro` (JA — 4 pillar cards)

## 6. Pillar Detail Pages (6-block template)
- [ ] 6.1 Create `src/pages/pillars/[slug].astro` with 6-block layout
- [ ] 6.2 Implement block 4: Use Cases cards linking to `/use-cases/[slug]/`
- [ ] 6.3 Implement block 5: Recent Thinking auto-feed (3 blog posts filtered by pillar tags)
- [ ] 6.4 Implement block 6: Pillar-specific CTA (primary + secondary per mapping)
- [ ] 6.5 Create `src/pages/ja/pillars/[slug].astro` (JA version)

## 7. Use Case Detail Pages
- [ ] 7.1 Create `src/pages/use-cases/[slug].astro` with section navigation
- [ ] 7.2 Create `src/pages/ja/use-cases/[slug].astro` (JA version)

## 8. SEO
- [ ] 8.1 Add unique `<title>`, `<meta description>`, `og:image`, structured data, canonical, hreflang to pillar pages
- [ ] 8.2 Add unique SEO metadata to use case pages
- [ ] 8.3 Add sitemap entries for pillar and use case pages

## 9. Navigation Integration
- [ ] 9.1 Add "Pillars" link to `/services/` page
- [ ] 9.2 Add cross-links from related blog posts to pillar/use case pages
- [ ] 9.3 Add CTA buttons on use case detail pages (inherited from parent pillar)