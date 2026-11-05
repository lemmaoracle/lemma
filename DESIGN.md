# Lemma Web Design System

Visual and editorial conventions for `lemma.frame00.com` (`packages/web`). The implementation is the source of truth for token values (`packages/web/src/styles/top-v47.css` under `.topx`); this document defines where and how each component, layout pattern, and term is used.

## Color

| Role | Token / Value | Usage |
|---|---|---|
| Surface | White (`#ffffff`) · `--lite` (`#eef1eb`) | Base canvas surfaces |
| Dark Stage | `#121611` · `#191d17` | High-contrast dark stages and footer surfaces |
| Text | `--tx` · `--tx-soft` · `--muted` | Body copy, supporting descriptions, and footnotes |
| Accent Lime | `--ok` (`#a8e010`) | Primary interactive accents and emphasis underlines |
| Dark Green Text | `--ok-light` | Text and links over pale lime backgrounds |
| Error / Alert | `--err` | Held actions, verification mismatches, and risk indicators |

Legacy brown, tan, and warm-cream palettes are deprecated and must not be used. All surfaces use Lemma's slate, stone, obsidian, and lime palette without blue-tinted navy tones.

## Buttons

Differentiate button weight by tier on every surface. Never place two buttons of identical visual weight side by side.

| Tier | Appearance | Usage | Example |
|---|---|---|---|
| Primary | Dark ink background, white text (`.btn.solid`) | Single most important action on a light surface (one per surface) | "Book a consultation" |
| Entry / Callout | Lime background, dark ink text | Primary action on dark surfaces or landing page hero entry points | "Talk to an expert ↗" |
| Secondary | Pale lime tint, dark green text (`.btn.ghostd`) | Supporting paths and persistent global navigation actions | "Dashboard ↗" in global nav |
| Utility | White background, thin border | Local utility actions such as saving, exporting, or resetting | "Save as PDF", "Reset answers" |

- On dark surfaces, Accent Lime serves as the primary button tier.
- Do not place an Entry button immediately next to a Primary ink button unless one is demoted to Secondary or outline style.
- **Shape**: `4px` border-radius for standard buttons and interactive selector tabs.
- **Icons**: When pairing an icon with button text, place it to the left at matching cap height (`--ok-light` on light backgrounds, lime on dark ink backgrounds).
- **Touch targets**: Minimum `44px` height on both desktop and mobile; full-width for mobile yes/no/unknown response buttons.

## Labels & Badges

- **Shape**: Pill (`999px` border-radius) for category tags, scenario labels, and status legends so they are visually distinct from `4px` interactive buttons.
- **Status colors**: Pass / Yes = `--ok` (lime fill, dark ink text); Alert / Held / No = `--err`; Unknown / Pending = `--muted`.

## Typography & Sizing

- On desktop viewports (`761px` and wider), constrain line measure and scale up font sizes rather than setting small type across wide containers.
- Reference sizes for interactive checks: item copy `16px` desktop / `14.5px` mobile; step headings `21px` desktop / `19px` mobile; paired action buttons max-width `640px` on desktop.
- Do not use glowing text shadows or text gradients. Establish hierarchy through solid color contrast and typographic scale jumps.
- On product landing pages, let section headings (`<h2>`) stand on their own without small eyebrow sub-headings above them.

## Lists & Dividers

- Separate items inside a bordered card or box with dotted horizontal dividers.
- Omit the top divider on the first visible item inside a container (the container border marks the start), including when lists are filtered or reordered dynamically.

## Product & Interactive Landing Pages

### Interactive Self-Check (`/ja/critical/self-check/`)

- Keep prose minimal; consolidate explanations into compact legends, metric bands, and miniature UI previews (email, chat, notification, or report cards).
- Use `.example` for all illustrative sender addresses and domains.
- Allow visitors to switch scenarios by role via tabs.
- Show a bottom progress bar with the remaining item count during check flows.
- Refer to yes/no prompts as "check items" (`チェック項目`) rather than "questions."
- Label short vs. comprehensive paths by pace (e.g., quick check vs. thorough check) with item count and estimated time (`25s` per item).

### Product Landing Page (`/cyber/`, `/ja/cyber/`)

- **High-contrast stage alternation**: Alternate sections across pale stone (`#eef1eb`), pure white (`#ffffff`), and deep obsidian/charcoal (`#121611` / `#191d17`).
- **Heading style**: In Japanese copy, prefer concise noun-phrase headings (体言止め) oriented around executive and governance outcomes rather than conversational phrasing.
- **Feature cards with UI mocks**: Present core capabilities as crisp white cards inside a dark stage, pairing each card's copy with a light-mode UI mock (delegated AI permission scopes, recipient bank account matching, and cryptographic change-notice verification).
- **Architectural diagram**: Illustrate how pre-execution verification relates to classical guardrails (perimeter pattern matching and authentication) using a 45-degree isometric bird's-eye diagram and synchronized step bar.
- **Empirical & statistical evidence**: Always pair attack test results and market statistics with explicit denominators (e.g., models × scenarios), scope notes, and primary source links in the same section.

## Top Page Hero Hierarchy

Entry points in the top-page first view follow a strict priority order aligned with primary reader journeys (enterprise & partner inquiries → developers):

| Priority | Entry Point | Presentation |
|---|---|---|
| 1 | Enterprise consultation | Primary button (lime on dark hero, single instance) |
| 2 | Verify a proof sample | Secondary button |
| 3 | Self-check links | Single text line (not a button, keeping the hero focused on cryptographic proof) |
| 4 | Release / news notice | Single text line |

- Case study banners sit in the top strip above the hero on a pale green surface, linking to internal case-study articles without exposing client names in the banner.
- Limit hero buttons to at most two. Track all entry clicks via analytics attributes (`data-top-ev`, `data-cy-ev`).

## Editorial & Terminology Guidelines

Adapt tone to the target reader while keeping functional terminology consistent across the site:

| Surface | Reader | Tone | Example Description |
|---|---|---|---|
| Product & Technical (Top, Products, API, Industry, Critical Briefs) | IT, engineering, corporate planning, partners | Use Lemma's core terms (*proof*, *verification*, *authenticity*). On first mention, add one sentence stating what is verified and by whom. | Attach cryptographic proofs to records, data, and AI actions so recipients can verify facts independently. |
| Business & Operations (Self-check, Product LPs) | Executive leadership, finance, accounting, security leads | Describe concrete operational scenes—what is checked before execution and what routes to human review—without unnecessary jargon. | Verify transfer instructions, account updates, and AI actions before execution, routing anomalies to human review. |

Never state or guarantee absolute security outcomes (do not claim an organization is "100% safe," "fully protected," or "immune to attacks").

### Verb Distinction

Maintain a strict distinction between system verification and human review across all surfaces (English and Japanese):

| Term (JA / EN) | Usage |
|---|---|
| `照合` (Verify / Cross-check) | **System action (Lemma / ProofGate)**. Automated cryptographic or registry comparison. Always specify *what* is being compared against *what* (e.g., incoming bank details against registered partner master records). |
| `確認` (Review / Confirm) | **Human action**. A designated person inspecting a held operation or calling a registered phone number to make the final decision. |
| `チェック` (Check) | Approval point categories or interactive self-check items (`チェック項目`). |

### Japanese Operational Copy Conventions

| Avoid | Prefer | Reason |
|---|---|---|
| Using `照合` for human tasks (visual inspection, callback) | `確認` | `照合` is reserved for automated system verification. Mixing the two obscures what the product does. |
| Unqualified `照合` ("only verified items pass") | State both sides of the comparison and leave the final decision to the receiving person or system | Clarifies what records are compared and who authorizes the hold or execution. |
| `振込先の変更` (in fraud contexts) | `振込先の書き換え` | Distinguishes malicious tampering from routine administrative updates. |
| `届いた経路とは別の経路で` | `届いたメールやチャットとは別の手段（登録済みの電話番号など）で` | Concrete communication channel rather than abstract "route." |
| `範囲外の一斉配信` | `予定と違う宛先への一斉配信` | Clarifies what boundary was exceeded. |
| `影響評価` | `情報の扱いに問題がないかの確認` | Plain business Japanese over compliance jargon. |
| `問い` · `質問` | `チェック項目` (counted as `項目`) | Standard term for yes/no self-check items. |
| `業務` (for targeted workflows) | `場面` (e.g., `振込先・口座の変更`, `承認・決裁`) | Readers associate `業務` with job departments rather than specific operational moments. |
| `要点だけ` | `お急ぎ点検` (paired with `じっくり点検`) | Avoids implying that the short path alone is sufficient. |
| `言い切れない` | `分からない` | Clearer answer choice in self-check flows. |
| `診断` · `監査` · `助言` | `点検` | Self-check tools provide an operational check rather than formal audit or legal advice. |
| `備えができています` · `防げる` · `安全です` | Omit guarantees | Security outcomes cannot be guaranteed; any gap warrants review. |
| `穴をつぶす` | `システムや業務の抜け漏れを点検し、対策を進める` | Formal business register. |
| `億単位の` · `下記は` | Omit sensational modifiers and layout-dependent references | Keep copy objective and viewport-independent. |
