# Scenarios: Use-Cases & Pillars Web Integration

## Scenario 1: Prospect discovers pillars from services page

**Given** a prospect is on the `/services/` page
**When** they click "Lemmaの4つの柱を見る"
**Then** they land on `/pillars/` and see 4 pillar cards with slogans and subtitles
**And** each card links to its pillar detail page

## Scenario 2: Prospect reads a pillar page

**Given** a prospect is on `/pillars/verifiable-origin/`
**When** the page loads
**Then** they see the 6-block template in order: Problem Statement → Why Now → How Lemma Fits → Use Cases → Recent Thinking → CTA
**And** "Talk to us" CTA is primary, "Demo repo" is secondary

## Scenario 3: Prospect navigates from pillar to use case

**Given** a prospect is on `/pillars/verifiable-origin/`
**When** they click a use case card in block 4
**Then** they land on `/use-cases/financial-data-exfiltration/`
**And** the use case page shows section navigation (Scenario → Architecture → Proof Points → Pitch Deck)

## Scenario 4: Builder joins Trust402 waitlist from P3

**Given** a builder is on `/pillars/agent-trust-chain/`
**When** they click "Join Trust402 waitlist"
**Then** they are directed to tally.so/r/kd0bZR

## Scenario 5: Compliance officer downloads regulatory whitepaper from P4

**Given** a compliance officer is on `/pillars/regulatory-attribute-proof/`
**When** they click "Download regulatory whitepaper"
**Then** they are directed to tally.so/r/xX0VYv

## Scenario 6: Recent Thinking shows fresh blog content

**Given** a visitor is on any pillar detail page
**When** they view block 5 (Recent Thinking)
**Then** they see the 3 most recent blog posts related to that pillar's tags
**And** the posts update automatically as new blog content is published

## Scenario 7: SEO crawler indexes pillar and use case pages

**Given** a search engine crawler visits `/pillars/verifiable-origin/`
**When** the page is rendered
**Then** the page has a unique `<title>`, `<meta description>`, `og:image`, structured data, canonical link, and hreflang

## Scenario 8: Japanese visitor reads a pillar page

**Given** a Japanese visitor navigates to `/ja/pillars/verifiable-origin/`
**When** the page loads
**Then** the content and navigation are in Japanese
**And** hreflang cross-references point to the English version