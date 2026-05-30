# Lemma Critical Brief — content collection

Per-Brief Markdown lives here as `<NN>-<slug>.md` (e.g. `001-kelpdao-rseth.md`,
`002-stakedao-vsdcrv.md`). The loader glob is `[0-9][0-9][0-9]-*.md`, so this
README and any other adjacent docs are ignored.

Schema lives in [`../../content.config.ts`](../../content.config.ts). The
template + style guide lives outside the repo in Mayumi's local at
`lemma_critical_brief_template.md`.

## Frontmatter

```yaml
brief_no: 1                          # positive integer, never reused
title: "<日本語タイトル>"
title_en: "<English title>"
pillar: 01-verifiable-origin         # 01 / 02 / 03 / 04
primary_category: bridge-config-trust # must belong to the chosen pillar or be crosscutting
secondary_categories: [identity-auth]
incident_date: 2026-04-18
published: 2026-05-29
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response, B-regulatory]
related_briefs: ["002-stakedao-vsdcrv"]
status: draft                        # draft | review | published
version: "1.0"                       # frontmatter version; "Revision History" hidden while 1.0
```

## Allowed values

**Pillars**

- `01-verifiable-origin`
- `02-verifiable-ai`
- `03-agent-authority`
- `04-regulatory-attribute`

**Categories per pillar**

| Pillar | Categories |
| --- | --- |
| 01-verifiable-origin | `bridge-config-trust`, `code-provenance`, `data-provenance` |
| 02-verifiable-ai | `ai-decision-integrity`, `ai-bias-harm`, `model-supply-chain` |
| 03-agent-authority | `agent-runaway`, `agent-infrastructure`, `agent-payment-abuse` |
| 04-regulatory-attribute | `kyc-aml-disclosure`, `attribute-proof-bypass` |
| Crosscutting | `identity-auth` |

`primary_category` may be a Pillar-specific category or a crosscutting one;
the build refuses Pillar/category mismatches.

**Packs**

- `A-incident-response`
- `B-regulatory`
- `C-agent-governance`

## Body

Markdown body follows the 10-section template (TL;DR + §1–§10). Section
numbering is part of the prose, not auto-generated. See the template doc
outside this repo for the section list and style guide.

## URLs

Each `<NN>-<slug>.md` surfaces at:

- `/critical/briefs/<NN>-<slug>/` (EN)
- `/ja/critical/briefs/<NN>-<slug>/` (JA)

The page routes themselves arrive in the next PR; this PR is the schema
and content-collection scaffolding only.
