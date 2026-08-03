# Lemma Critical Brief — writing rules (v2, six-chapter format)

Canonical since the six-chapter restructure of 2026-07-30 (PR #720); this
supersedes the old 10-/9-section guidance. Japanese version (primary):
[`../critical-briefs/README.md`](../critical-briefs/README.md)

Each Brief lives as `<NNN>-<slug>.md` and **must mirror the file of the same
name in `../critical-briefs/`** (JA is authored first; EN mirrors it). The
loader glob is `[0-9]*.md`, so this README is not ingested. Numbers are never
reused. Schema: [`../../content.config.ts`](../../content.config.ts).

URLs: `/critical/briefs/<NNN>-<slug>/` (EN) / `/ja/critical/briefs/<NNN>-<slug>/` (JA)

## Frontmatter

Same schema as the JA file (see the JA README for the annotated example).
EN-specific rules:

- `gap_detected` / `gap_missing` / `gap_fix` are written **in English** in this
  collection (og_lead_* likewise). They feed the always-on right-rail panel
  ("The core of this Brief": ✓ detection worked / ✕ no proof existed / → what
  Lemma changes) and are **clamped to 4 lines** on the rail — keep them short.
  `gap_missing` should echo the TL;DR's closing claim.

## The six chapters

Headings are **numbered**; the table of contents (§1–§6) aligns with them.

| § | Heading | Role |
|---|---|---|
| 1 | `## 1. TL;DR` | The conclusion. The detection–proof gap is dissolved into prose |
| 2 | `## 2. What happened` | Overview bullets + the attack chain (numbered list) |
| 3 | `## 3. Timeline — disclosure and response` | Disclosure, patches, industry reaction |
| 4 | `## 4. Why it wasn't stopped` | The structural argument. "Detection worked / no proof existed" in prose |
| 5 | `## 5. What proof would have changed` | The prescription |
| 6 | `## 6. Sources` | Primary sources |

**The detection–proof gap is not a standalone chapter.** It is the skeleton of
§4 and §5 (its summary lives permanently in the right-rail gap panel). "The
detection–proof gap" and "structural / by construction" remain brand
vocabulary in the body text.

### §1 TL;DR

- **A few sentences, shorter than the JA original — condense, do not translate
  1:1.** Put search terms (product / incident names) up front. No trailing
  section-number lists.
- Close by naming the missing layer and stop there:
  "**What didn't exist was a layer to independently confirm … before acting.**"
  Do **not** append "detection and pre-execution attestation are complements,
  not substitutes" — §4/§5 carry that positioning.

### §2 What happened

- Facts only. Overview bullets → a bridge sentence ("The attack came together
  as the following chain.") → the numbered chain.
- No "Core" / "Root cause" digest bullets (the §4 opening sentence owns that).

### §3 Timeline — disclosure and response

- Order: timeline `ul` → caveat blockquote (primary-source limits, research
  environment, etc.) → "The response and industry movement after disclosure:"
  → response/industry bullets.
- **Keep "Timeline" in the heading** — it triggers the vertical-line + lime-dot
  timeline styling on the list that follows.

### §4 Why it wasn't stopped — compress, don't concatenate

- Three or four short paragraphs plus a blockquote is the target shape.
- Open with the verdict sentence: "The failure here is neither X nor Y.
  **There was no layer that independently …**"
- Fold "Detection worked. … What didn't work sits in front of it." into one
  paragraph — don't restate the detection successes twice.
- **No category bookkeeping**: no "This incident belongs to the `X` category of
  Pillar N", no "We note `Y` as a secondary category" — the hero tags carry
  that information.
- Move memorable quotes into a blockquote. Compress related-Brief connections
  into a single paragraph.

### §5 What proof would have changed

- The prescription paragraph (where exactly attestation inserts one step into
  the path) → Lemma design bullets (pre-action authorization proof, provenance
  binding, scoped authority, selective disclosure — whichever fit the case) →
  close on the complement-to-detection framing. "Complements, not substitutes"
  belongs here.

### §6 Sources

- **Primary sources first.** Read repos/READMEs/official statements directly
  (`gh api`) before citing; secondary reporting gets lists, CVE attribution,
  counts, and takedown states wrong. Verify URLs return 200. Annotate each
  entry ((primary), (independent analysis), …).

## Article tail conventions

```markdown
## 6. Sources

- ...

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), [Pillar 02 — Verifiable AI](https://lemma.frame00.com/pillars/#inference), [Trust402](https://lemma.frame00.com/trust402/)
```

- **Reference cards**: a paragraph starting `References: ` placed after the
  Sources list is transformed at render time — **only the links** surface, as a
  card row at the article tail (surrounding prose is dropped). BLOG / PILLAR /
  PRODUCT labels derive from the URL. Only include links relevant to the case.
- **Do not write the distribution boilerplate** (old §9) — the template renders
  it after Sources. Only case-specific notes (e.g. disputed-facts disclaimers)
  go in the markdown (see 077).
- **Revision history** renders automatically when `version` ≠ "1.0". A revision
  blockquote may sit at the very top of the body, before `## 1.` (see 077).

## Link conventions

- Every in-text "Brief NNN" reference **must be a link**: EN uses relative
  `/critical/briefs/<slug>/`; JA uses absolute
  `https://lemma.frame00.com/ja/critical/briefs/<slug>/`.
- Same for blog / pillars / product pages (EN relative, JA absolute `/ja/...`).

## Markdown pitfalls

- **Emphasis adjacent to CJK brackets breaks**: patterns like `…」**であり`
  fail CommonMark's flanking rules and render literal `**`. Use
  `<strong>…</strong>` for spans that start or end with 「」『』（）.
- Tables render as white cards, code blocks on the slate gradient — styling is
  the template's job; never specify themes in content.
- An `hr` immediately before a heading is hidden automatically.
- Put glob patterns like `/api/v1/**` in inline code.

## Style

- Keep "structural / structurally / by construction". The one collocation to
  unify is "structural gap" → "the detection–proof gap".
- Company names OK; Japanese municipality names need clearance before naming.
- Research demonstrations (no real-world breach) must say so in the §3 caveat
  and must not inflate impact.
