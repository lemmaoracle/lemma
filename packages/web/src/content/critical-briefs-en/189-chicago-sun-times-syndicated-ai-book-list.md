---
brief_no: 189
title: "Chicago Sun-Times：外部から買った夏の特集が、編集部の確認を経ずに紙面に載り、存在しない本を推薦していた(同紙の声明と検証)"
title_en: "Chicago Sun-Times: Purchased content ran without review and recommended books that do not exist (the paper's statement and review)"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: [ai-decision-integrity]
incident_date: 2025-05-18
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["188-deloitte-dewr-report-fabricated-references", "060-withers-aberdeen-ai-hallucinated-precedent", "053-youtube-deepfake-likeness-provenance"]
status: draft
version: "1.0"
og_lead_ja: "Chicago Sun-Times、外部から買った夏の特集が確認を経ずに載り、推薦図書の多くが存在しない本だった"
og_lead_en: "Chicago Sun-Times ran purchased content without review; most books on its reading list did not exist"
layout: "report"
sections: "proof"
gate: "delivery"
og_kicker_ja: "AI の誤用事例 · 外部の記事の掲載"
og_kicker_en: "AI MISUSE · SYNDICATED CONTENT"
og_headline_ja: "買った特集の推薦図書は、\n存在しない本だった。\n<accent>15 冊中 10 冊</accent>"
og_headline_en: "Purchased content\nrecommended fake books.\n<accent>10 of 15 titles</accent>"
key_figures:
  - value: "10 / 15"
    unit: "books"
    label: "Titles on the reading list that do not exist (the authors are real; the paper's review)"
    tone: "alert"
  - value: "10"
    unit: "stories"
    label: "Stories with named sources; the paper's fact-check found multiple errors in every one"
  - value: "64"
    unit: "pages"
    label: "Size of the \"Heat Index\" section purchased from King Features"
glossary:
  - term: "Syndication"
    desc: "A distributor sells articles, sections or comics to many newspapers, which run them in their own pages, often under their own banner."
  - term: "King Features"
    desc: "A New York-based division of Hearst that sells comics, puzzles and special sections to newspapers."
  - term: "E-paper"
    desc: "An online edition that reproduces the printed page layout as it is."
insight:
  slug: "bought-content-not-reviewed"
  label: "Purchased content runs without review"
  quote: "Content purchased from outside still reaches readers as something the paper has checked once it runs in the paper's pages."
industries: ["media"]
operations: ["delivery"]
controls:
  - slug: "check-origin"
    item: "Before running purchased content, check its distributor, its writer and whether AI was used"
  - slug: "hold-unverified"
    item: "Keep purchased content out of print and digital editions until it is matched to an editorial approval"
  - slug: "audit-trail"
    item: "Record, for each edition, which content came from where and who reviewed and released it"
attack_method: "ai-misuse"
impact: "10 of 15 books on the reading list did not exist; the section ran in two papers"
takeaway: "Content purchased from a syndicator ran in the paper's own pages without going through newsroom review. Match outside content to an editorial approval before it goes out."
self_check: "Do you match content purchased from outside to an editorial approval before they go into print or digital editions?"
countries: ["us"]
---

## 1. Summary

The paper's newsroom did not make the section. The circulation department purchased it from King Features, a Hearst syndicator, and it ran in the Sunday print edition and the e-paper without newsroom review and without saying a third party produced it (the paper's statement and review). According to King Features, a freelance writer used an AI agent to build the section and did not disclose it. The CEO of Chicago Public Media, which runs the paper, described a chain of human mistakes between the distributor and the paper's pages. <strong>Content purchased from outside still reaches readers as something the paper has checked once it runs in the paper's pages.</strong>

## 2. What got through

- **What went through**: The routine placement of a 64-page section, "Heat Index," purchased from a distributor as a paid premium edition, in the Sunday print edition and e-paper of 2025-05-18. The paper's circulation department dealt with King Features, and the section was packaged under the Sun-Times banner (the paper's statement and review).
- **What the receiving side sees**: In general, readers get it as their usual newspaper. Who made each story and how far it was checked is not visible from the page. The paper also says the section ran without saying a third party produced it.
- **At the distributor**: According to King Features, it has a policy barring staff and freelancers from using AI, and the writer did not disclose AI use. The CEO of Chicago Public Media said King Features likely did not thoroughly fact-check or copy edit the work (the paper's review).
- **Not disclosed**: The name of the AI tool used. The result of King Features' internal review. Where the errors were first pointed out. When the Philadelphia Inquirer ran the section and how it was handled there.

## 3. What to check

The condition that holds regardless of route: before content received from outside goes out under the organization's own name, check, separately from the department that received it, where it came from, who made it and whether it went through the organization's editorial review.

- **Who approves**: The editorial side of the publishing paper. Even for purchased content, approval to run it comes from an editor, not from the department that signs the purchase (here, circulation).
- **Where to check**: Just before content is placed into the print or digital edition. For each item, check that the distributor and writer, the AI-use declaration and the editorial approval are all present, and that the approval was given for the same content going into the edition. Items that do not line up stay out.
- **What is recorded**: For each edition, which content came from which distributor and who reviewed and released it. This also backs the label telling readers that content came from outside.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">Detection vs. a pre-execution check</span></div>
<p class="rx-ex-cap">Pre-execution check = before purchased content runs, checking that its origin and an editorial approval are in place, and recording it. Detection = finding out after it runs, for example from readers or authors. The dates below are those given in the paper's statement and review.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not visible from the disclosure</b>Before running, check that the origin and an editorial approval are in place</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>10 of 15 recommended books do not exist<br>Errors in all 10 stories with named sources</span></div>
<div class="rx-zone det"><b>Detection · found after it ran</b>Errors came to light after publication; the paper issued a statement and a review</div>
<div class="rx-g g1"><div class="t">2025-04</div><b>King Features pitches the section</b></div>
<div class="rx-g g2"><div class="t">2025-05-18</div><b>The section runs in print and e-paper</b></div>
<div class="rx-g g3"><div class="t">2025-05-20</div><b>The paper issues a statement and pulls it from the e-paper</b></div>
<div class="rx-g g4"><div class="t">2025-05-29</div><b>The paper publishes its review</b></div>
</div>
</figure>

Detection worked. Two days after publication the paper issued a statement and removed the section from the e-paper, and eleven days after, it published a story-by-story fact-check. But it was found after it had reached readers. Things that did not exist, made by AI, also went out unchecked in [Withers v. City of Aberdeen](/critical/briefs/060-withers-aberdeen-ai-hallucinated-precedent/) (court filings citing cases that never existed). Synthetic content of unknown origin was not told apart on a distribution platform in [YouTube's fake celebrities](/critical/briefs/053-youtube-deepfake-likeness-provenance/).

## 4. What Lemma does

**Lemma builds the check in section 3 into the step that places content into an edition or a send.** It does not judge whether a story is accurate. Before content runs, it checks, item by item, that the origin declaration and an editorial approval are in place and that the approval was given for the same content being placed.

### Industries and operations to watch

- **Industry · Media & content**: Newspapers, publishers, broadcasters and web outlets that purchase articles, sections or sponsored features from syndicators or outside producers and run them under their own name. When purchasing and editing sit in different departments, content can go out without entering the review path.
- **Operation · Sending & delivery**: Assembling content received from outside into the organization's editions or sends for readers or customers. Received content reaches them as the organization's own, whether or not it was reviewed.

### Current controls vs Lemma

This case took the route in column 1 (purchased content running without editorial review). Column 2 is errors left in content that did go through review, which was not the route here.

| Control | Outside content running without review | Errors left after review |
| --- | --- | --- |
| Labeling third-party content and its origin (the paper's post-incident policy) | Partial | Not relevant |
| The distributor's policy barring AI (King Features' account) | Partial | Partial |
| Newsroom fact-checking and copy editing | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Not relevant |

Labeling tells readers content came from outside, but by itself does not show whether it was reviewed. The distributor's AI policy works only if the writer discloses (King Features says the writer did not; per the paper's review, the writer said the contracts had no AI policy). Newsroom fact-checking catches errors in content, but only in content that reaches it. Lemma checks, before running, whether content entered the review path. It does not judge accuracy, so it does nothing about errors left after review.

Note: Lemma's check works only when it is built into the step that places content into an edition or send, and when the editorial side, separately from the department that signs purchases, registers who may give editorial approval. If the approver did not look at the content closely, wrong content still passes. Lemma does not delete content or recall printed papers. Checking that content is factual is the newsroom's job. The table compares what each control checks; it does not show whether anything would have been stopped in this case. Lemma does not detect or prevent intrusions.

### Checklist

Three things to check in your organization about content purchased from outside and published under your name

- For purchased content, is there an agreement that the distributor declares who wrote it and whether AI was used?
- When the department receiving purchased content is not the newsroom, is there a rule to send it through editorial review?
- Do you record, for each edition, which content was reviewed and released by whom?

## 5. Facts and timeline

- **Organization**: The Chicago Sun-Times (run by the nonprofit Chicago Public Media). The section also ran in the Philadelphia Inquirer; both papers purchased it from King Features (the paper's review).
- **The section**: "Heat Index: Your Guide to the Best of Summer," 64 pages of summer stories, including a "Summer reading list for 2025" on page 62 (the paper's review).
- **Background to the purchase**: For the past two years the paper has offered home-delivery subscribers about 10 special sections a year for an extra $3 each. Staff originally wrote them, but that number has been scaled back; purchasing from King Features was a way to keep meeting revenue goals during the shift from print to digital. King Features' April sales email pitched it as a "premium summer lifestyle section" (the paper's review).
- **What was confirmed**: 10 of the 15 books on the list do not exist, though the authors are real; authors or their representatives confirmed it. The paper fact-checked the 10 stories with named sources and found multiple errors in each, including people whose existence could not be confirmed and quotes the named person denied giving (the paper's review).
- **AI use**: According to King Features, a freelance writer used an AI agent to build the section and did not disclose it. Per the paper's review, the writer attributed the errors to the use of AI and a failure to fact-check (the paper's statement and review).
- **Another section**: In a November holiday guide also purchased from King Features, the paper could not confirm that a person quoted exists (the paper's review).

### Timeline

- **2025-04**: King Features pitches the section in a sales email.
- **2025-05-18**: "Heat Index" runs in the Sunday print edition and the e-paper.
- **2025-05-20**: The paper issues a statement: the reading list was created with an AI tool and recommended books that do not exist. It removes the section from the e-paper and says subscribers will not be charged for this premium edition.
- **2025-05-29**: The paper publishes its review.

> The facts here rest on the Chicago Sun-Times statement (2025-05-20) and the review written by its reporters (2025-05-29). The account of AI use and of the writer comes from King Features as reported by the paper; the path from distributor to page is the account of the paper and Chicago Public Media. The CEO of Chicago Public Media described a chain of human mistakes spanning the writer, King Features, the Sun-Times and Chicago Public Media; this Brief does not assess the fault of any person or organization. The AI tool used, the result of King Features' internal review, and what happened on the Philadelphia Inquirer's side have not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Chicago Sun-Times (statement)**: Updating policies so that licensed third-party content meets its journalistic standards, and explicitly labeling third-party content and its origin. Reviewing its relationships with national content partners.
- **Chicago Public Media (as stated in the review)**: Removing "Heat Index" and the November guide from the e-paper archives. Ending purchases of special sections from King Features while keeping its comics and puzzles. Drafting a public AI policy; it will keep experimenting with AI but will not use AI agents to write its stories.
- **King Features (as reported by the paper)**: Said the writer violated its AI policy and ended the relationship, and is conducting an internal review (the paper's review).

## 6. Sources

- **Chicago Sun-Times (primary, party)**: "Chicago Sun-Times response to May 18 special section" (2025-05-20) — <https://chicago.suntimes.com/press-room/2025/05/20/chicago-sun-times-response-to-may-18-special-section>
- **Chicago Sun-Times (primary, party's review)**: "Special section with fake book list plagued with additional errors, Sun-Times review finds" (2025-05-29) — <https://chicago.suntimes.com/news/2025/05/29/special-section-king-fake-book-list-errors-sun-times-review>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
