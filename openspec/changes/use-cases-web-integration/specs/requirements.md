# Requirements: Use-Cases & Pillars Web Integration

## Functional Requirements

- **FR-01:** The website must display a `/pillars/` hub page listing all 4 pillars as cards.
- **FR-02:** Each pillar must have a detail page at `/pillars/[slug]/` with a fixed 6-block template (Problem Statement, Why Now, How Lemma Fits, Use Cases, Recent Thinking, CTA).
- **FR-03:** Each use case must have a detail page at `/use-cases/[slug]/` with section-based navigation (scenario, architecture, proof-points, pitch-deck).
- **FR-04:** Pillar content must be sourced from YAML data files via Astro Content Collections.
- **FR-05:** Use case content must be sourced from `posts/use-cases/` directory via Astro Content Collections.
- **FR-06:** Each pillar detail must include pillar-specific CTAs mapped to lead funnels (Talk to Us, Waitlist, Download).
- **FR-07:** Each pillar detail must auto-feed the 3 most recent related blog posts in the "Recent Thinking" block.
- **FR-08:** Both EN and JA versions of all pages must exist.
- **FR-09:** Each pillar and use case page must include unique SEO metadata.

## CTA Mapping Requirements

- **FR-10:** P1 Verifiable Origin: primary = Talk to us, secondary = Demo repo
- **FR-11:** P2 Verifiable AI: primary = Talk to us, secondary = Whitepaper DL
- **FR-12:** P3 Agent Trust Chain: primary = Join Trust402 waitlist (tally.so/r/kd0bZR)
- **FR-13:** P4 Regulatory Attribute Proof: primary = Download regulatory whitepaper (tally.so/r/xX0VYv)

## Non-Functional Requirements

- **NFR-01:** Content collection build must complete within existing build time budget.
- **NFR-02:** No new runtime npm packages for v1.
- **NFR-03:** Directory structure must support future MDX migration without breaking changes.

## Integration Requirements

- **IR-01:** `/services/` page must include a link to `/pillars/`.
- **IR-02:** Related blog posts must include cross-links to corresponding pillar/use case pages.
- **IR-03:** Each use case detail page must include CTA buttons (inherited from parent pillar).