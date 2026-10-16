# Lemma Critical Brief — writing rules (v2, six-chapter format)

Canonical since the six-chapter restructure of 2026-07-30 (PR #720); this
supersedes the old 10-/9-section guidance. Japanese version (primary):
[`../critical-briefs/README.md`](../critical-briefs/README.md)

Each Brief lives as `<NNN>-<slug>.md` and **must mirror the file of the same
name in `../critical-briefs/`** (JA is authored first; EN mirrors it). The
loader glob is `[0-9]*.md`, so this README is not ingested. Numbers are kept
contiguous: a new Brief takes the **lowest free number**, or max + 1 if none is
free (ignore the number in the draft). A withdrawn Brief's URLs are 301'd to the
index in `public/_redirects`. Schema: [`../../content.config.ts`](../../content.config.ts).

URLs: `/critical/briefs/<NNN>-<slug>/` (EN) / `/ja/critical/briefs/<NNN>-<slug>/` (JA)

## Frontmatter

Same schema as the JA file (see the JA README for the annotated example).
EN-specific rules:

- **`gap_detected` / `gap_missing` / `gap_fix` are retired (2026-08-21). Do not
  write them for new Briefs.** They used to feed the always-on right-rail panel
  ("The core of this Brief"), which restated the TL;DR's closing line and §5 and
  went unread beside the body, so it was removed (PR #848). Existing values are
  kept on existing Briefs but render nowhere. `og_lead_*` is still
  written in English in this collection.

### Title

Rules every recent Brief follows that were missing here (checked against the
latest 11 on 2026-09-12). Same principles as the JA canon.

- **Put the searchable proper noun early in the half before the `—`** (product,
  organisation, vulnerability, code name). Rankings and index pages show only
  that half, so a title without a proper noun there cannot be found.
- The `Name: ` colon form is fine when the noun should lead.
- **Put the source or identifier at the end of that half, in parentheses**
  (e.g. `(Unit 42 research)`, `(CVE-2026-59822, added to CISA KEV)`).
- The H1 is a **statement** (something happened), not a noun phrase.
- The half after the `—` says, in one sentence, **what was structurally missing**.

## The six chapters

Headings are **numbered**; the table of contents (§1–§6) aligns with them.

| § | Heading | Role |
|---|---|---|
| 1 | `## 1. TL;DR` | The conclusion. The detection–proof gap is dissolved into prose |
| 2 | `## 2. What happened` | Overview bullets + the attack chain (numbered list) |
| 3 | `## 3. Timeline — disclosure and response` | Disclosure, patches, industry reaction |
| 4 | `## 4. Why it wasn't stopped` | The structural argument. "Detection worked / no proof existed" in prose |
| 5 | `## 5. What proof would have changed` | The prescription (report layout: `## 5. How to counter this`) |
| 6 | `## 6. Sources` | Primary sources |

**The detection–proof gap is not a standalone chapter.** It is the skeleton of
§4 and §5 (its summary is carried by the TL;DR's closing line; the old
right-rail gap panel is retired). "The
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

## Report layout (opt-in, 2026-10)

Only Briefs with `layout: "report"` in the frontmatter render in the report
layout (sample: 032). Briefs without it keep the default page. The six
chapters and the chapter rules above still apply.

**What it turns on**: a slate cover (generative art seeded by `brief_no`, plus
`key_figures`), a meta row under it (incident date / published / revised /
authors), chapter heads in the form "01 Heading", a right rail with the table of
contents only (no threat banner or brand box), and the component CSS below. The
leading revision blockquote is not rendered; version and date move into the meta
row (keep it in the markdown — dateModified is read from it). The
`References: ` line stays a single line instead of becoming cards.

**§3 may use a `### After disclosure` subheading instead of the connector
sentence** ("The response and industry movement after disclosure:").

**§5 is `## 5. How to counter this`** (JA: `## 5. 対策するには`). It tells
readers what to do in their own organisation; it is not a product prescription.

### Extra frontmatter

Same fields as the JA README's example. `key_figures` (max 3; a `→` in `value`
draws a lime arrow; `tone: "alert"` on one figure at most), `glossary`
(rendered as a small glossary note right after §2's first block), `insight`
(`quote` is rendered as the "The core of this case" block after §4's first
paragraph; `slug` / `label` are for the index only). Write these three in
English in the EN file. `industries` / `operations` / `controls` are **index
facets and are not rendered in the article**; vocabularies, labels and icons
live in `config/briefFacets.ts`. Write the "Industries and operations to watch"
table in markdown/HTML with descriptions.

### Components an author writes

No blank lines inside an HTML block (a blank line drops back into markdown).

```html
<div class="rx-exsum"><ol>
<li><div class="lab">01<b>What happened</b></div><p>…</p></li>
<li class="key"><div class="lab">03<b>The missing layer</b></div><p>…</p></li>
</ol></div>

<div class="rx-facts"><dl><dt>Who</dt><dd>…</dd></dl></div>
<div class="rx-facts rx-scope"><dl><dt><span class="kk">Industry</span>Services &amp; retail</dt><dd>…</dd></dl></div>

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">…</span></div>
<p class="rx-ex-cap">…</p>
<div class="rx-chain"><div class="rx-step crit"><div class="who">Third party</div><div class="no">2</div><b>…</b><p>…</p></div></div>
</figure>

<ul class="rx-tl"><li><time>2026-05-23</time><span>…</span></li></ul>
<p class="rx-aside">Note: …</p>

<section class="rx-box"><div class="rx-ex-h"><span class="rx-ex-no">Controls</span><span class="rx-ex-t">What is needed</span></div>
<ol class="num"><li><b>….</b> …</li></ol>
</section>
<div class="bx-checklist"><div class="rx-ex-h"><span class="rx-ex-no">Check</span><span class="rx-ex-t">Checklist</span></div><p class="rx-box-cap">…</p><ul><li>…</li></ul></div>

<ol class="rx-srcs"><li><span class="ty">Press</span><span class="bs"><b>Outlet</b> "Title"<span class="meta">2026-06-03 · <a href="…">…</a></span></span></li></ol>
```

The controls table is a plain markdown table; mark the status with
`<span class="bx-st no">Ineffective</span>` (`part` Partial / `na` Not relevant).
Open §5 with `<p class="rx-lead"><strong>Conclusion.</strong> …</p>`. Copy the
`rx-gap` exhibit structure from 032.

### What not to write

- **No product names or CTAs in the analysis.** The template renders the tail CTA.
- **Facet chips are for the index, not the article** (no "find by this
  control" rows).

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
