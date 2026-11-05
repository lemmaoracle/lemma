---
brief_no: 188
title: "Deloitte：豪雇用職場関係省に納めた報告書の参考文献と判決の要約に誤りがあり、差し替え版に生成 AI の利用が書き加えられた"
title_en: "Deloitte: A report delivered to Australia's employment department had errors in its references and in a court-case summary, and the replacement added a note on generative AI use"
pillar: 02-verifiable-ai
primary_category: ai-decision-integrity
secondary_categories: [data-provenance]
incident_date: 2025-07-04
published: 2026-11-05
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["060-withers-aberdeen-ai-hallucinated-precedent", "189-chicago-sun-times-syndicated-ai-book-list"]
status: published
version: "1.0"
og_lead_ja: "Deloitte が豪雇用職場関係省に納めた報告書、参考文献と判決の要約の誤りで差し替え。差し替え版に生成 AI の利用の記載"
og_lead_en: "Deloitte's report for Australia's employment department replaced over faulty references; the new version notes generative AI use"
layout: "report"
sections: "proof"
gate: "delivery"
og_kicker_ja: "AI の利用事例 · 納品物の誤り"
og_kicker_en: "AI USE · DELIVERABLE ERRORS"
og_headline_ja: "豪州の省の報告書、\n参考文献に誤り。\n<accent>約 44 万豪ドルの契約</accent>"
og_headline_en: "Deloitte's welfare review\nhad faulty citations.\n<accent>A$440K contract</accent>"
key_figures:
  - value: "Up to 20"
    unit: "errors"
    label: "Found in the first version (a University of Sydney researcher, as reported by AP)"
    tone: "alert"
  - value: "A$440K"
    label: "Contract value (press reports); the final instalment was refunded"
  - value: "07-04 → 09-26"
    label: "Date of the first version and of the replacement (2025)"
glossary:
  - term: "TCF (Targeted Compliance Framework)"
    desc: "The framework in Australia's employment services that uses IT systems to apply payment suspensions and similar measures depending on whether people on benefits meet job-search and other obligations. The report assessed whether that system matches policy and business rules."
  - term: "The Amato case"
    desc: "A 2019 Federal Court case over \"Robodebt\", a scheme that automatically raised welfare overpayment debts from averaged income. The report cites it as an example that automated processing needs a legal basis and evidence."
  - term: "Replacement version"
    desc: "A version posted on the department's page in place of the earlier one. The page states the date of the version it replaced."
insight:
  slug: "citation-not-matched-to-source"
  stop: true
  label: "Citations delivered without matching them to sources"
  quote: "Before delivering a report, check each cited work or judgment against the record of the original, not against the report's own reference list."
industries: ["public-sector", "ai"]
operations: ["delivery", "approval"]
controls:
  - slug: "check-origin"
    item: "Match each work or judgment a report cites against the record of the original"
  - slug: "hold-unverified"
    item: "Hold a report before delivery while any citation cannot be matched to its original"
  - slug: "audit-trail"
    item: "Record, for each version, which citation was checked against what and what was corrected"
attack_method: "ai-misuse"
impact: "A report delivered to the department had errors in its references and a court-case summary, and a replacement was posted; the contract's final instalment was refunded (press reports)"
takeaway: "A reference list can look right without showing that the works exist. Before delivering a report, match each citation against its original."
self_check: "For reports you deliver externally, do you check before delivery that the works and judgments cited exist in the original sources?"
countries: ["au"]
---

## 1. Summary

The final report by Deloitte that the department published contained citations and reference entries that did not match their sources. According to press reports, the first version also included works that do not exist and a quotation attributed to a Federal Court judge.

The replacement's note says it corrected the citations and reference-list entries that contained errors, and the summary of a court case. The report's conclusions were not in question; the findings and recommendations are unaffected.

<strong>A neatly formatted reference list does not show that the works in it exist.</strong>

## 2. What got through

- **What went through**: Deloitte, the contractor, delivered the final report to the department as the contract's last milestone (Milestone 4), and the department posted the PDF on its website (the report; the department's page). The citations and references went into a public document as the basis for the analysis.
- **What the receiving side sees**: In general, the receiving side gets a report in the usual form, with complete footnotes and a reference list. Whether each cited work or judgment exists, and whether a quotation matches the original, is not visible until each one is looked up.
- **How it was found**: A University of Sydney researcher found up to 20 errors in the first version and alerted the media (AP).
- **The AI note**: Appendix C of the replacement (technical review methodology) says that the assessment of whether system code could be mapped to business requirements used a generative AI tool chain (Azure OpenAI GPT-4o) licensed by the department and hosted in its Azure tenancy. This note does not appear in the July version's PDF. The department's page does not mention AI.
- **Not disclosed**: In which part of the work the faulty citations were produced, whether AI was used to write the citations or references, and what checks were done before delivery. Deloitte did not answer when asked whether AI generated the errors (AP).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that each cited work or judgment is checked against the record of the original before delivery, for whether it exists there and whether the quoted words match.

- **Who approves**: A reviewer on the delivering side who did not write the report. Each citation is approved together with the original record it was checked against (a bibliographic record, a court record, and so on). It is not decided by the author or by the tool that produced the text.
- **Where to check**: Just before the report is delivered, and just before the receiving side publishes it. Hold any report that still has a citation not linked to an original record, or a quotation that does not match the original. The receiving side also checks, before publishing, that a record of the citation checks is attached.
- **What is recorded**: For each version, which citation was checked against which original record, and who approved it, kept so that a replacement can be compared with the earlier version to show what changed.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">Detection vs. a pre-execution check</span></div>
<p class="rx-ex-cap">Pre-execution check = before the report is delivered, checking each citation against the record of the original, and recording it. Detection = finding out after delivery, for example when a reader notices an error after publication. The dates below are those in the report and on the department's page, and the date of the press report.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not visible from the disclosure</b>Before delivery, check each citation against the record of the original</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Citations and reference entries with errors<br>Errors in a court-case summary (replacement's note)</span></div>
<div class="rx-zone det"><b>Detection · a reader reported it</b>A researcher noticed errors in the published report and alerted the media</div>
<div class="rx-g g1"><div class="t">2025-07-04</div><b>Date of the final report</b></div>
<div class="rx-g g2"><div class="t">2025-08</div><b>The report is posted on the department's page</b></div>
<div class="rx-g g3"><div class="t">2025-10-03</div><b>The page switches to the replacement</b></div>
<div class="rx-g g4"><div class="t">2025-10-07</div><b>Refund of the final instalment reported</b></div>
</div>
</figure>

Detection worked. A researcher who read the published report noticed the errors, and Deloitte and the department confirmed them and replaced the report. But it was noticed after publication. Citations to cases that did not exist, produced by AI, were found after filing in [Withers v. City of Aberdeen](/critical/briefs/060-withers-aberdeen-ai-hallucinated-precedent/). A list of books that did not exist was found after publication in a syndicated section of the [Chicago Sun-Times](/critical/briefs/189-chicago-sun-times-syndicated-ai-book-list/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the procedure for delivering a report.** It does not find errors in the prose or detect AI use. Before delivery, and separately from the author or tool, it checks that each citation in the report is linked to the record of its original.

### Industries and operations to watch

- **Industry · Government & public sector**: Organizations that receive evaluation and research reports from contractors and publish them as a basis for policy decisions. Citations in a published document are read as part of the public record.
- **Industry · AI adoption (all industries)**: Organizations that use generative AI to draft research, evaluation and proposal documents. Citations in a plausible bibliographic form are hard to tell apart without looking up the original.
- **Operation · Sending & delivery**: Delivering reports and deliverables to clients or readers. A delivered document feeds the receiver's decisions and publications.
- **Operation · Approval & sign-off**: Accepting deliverables and approving payment or publication. If acceptance does not include checking citations, citation errors survive past payment and publication.

### Current controls vs Lemma

The errors reported were mainly in column 1 (citations and references matching their originals). The replacement's note also says it corrected errors in the summary of the Amato case, which falls in column 2 (accuracy of summaries and analysis).

| Control | Citations and references matching their originals | Accuracy of summaries, analysis and conclusions |
| --- | --- | --- |
| Peer reading and quality review by someone other than the author | Partial | Partial |
| Generating citations from bibliographic records in a reference manager | Partial | Not relevant |
| Setting, in policy or contract, which tasks and tools may use generative AI | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Not relevant |

A peer review catches the errors the reader notices, but unless each citation is looked up, a well-formed fictitious citation passes. A reference manager keeps the bibliographic form of citations built from its records, but a wrong record becomes a wrong citation. A policy on AI use narrows where AI-written text can enter, but it does not check the citations produced within that scope. Lemma checks, citation by citation, that each is linked to the record of its original. If the original exists but the summary or interpretation of it is wrong, the check passes.

Note: Lemma's check works only when it is built into the delivery procedure and the records of the originals (bibliographic records, court records, and so on) can be looked up apart from the author or tool. Material with no original record (interviews, internal documents) needs a separate record of approval. Lemma does not rewrite text or withdraw published documents. Judging whether the analysis and conclusions are right is the job of the organizations that write and receive the report. The table compares what each control checks; it does not show whether anything would have been stopped in this case. Lemma does not detect or prevent intrusions.

### Checklist

Three things to check in your organization about reports you deliver or receive

- Do contractors state in writing, at the time of the order, which tasks and tools in the deliverable use generative AI?
- Before publishing a report you received, do you compare at least a few citations with the originals?
- When you replace a report, do you record which version changed what, and show it to readers?

## 5. Facts and timeline

- **Organizations**: Commissioned by Australia's Department of Employment and Workplace Relations (DEWR), Deloitte conducted an independent assurance review of the TCF system from December 2024 to June 2025 (the department's page). The Order for Services is dated 2024-12-23 (the report).
- **The report**: The final report was the review's fourth milestone (Milestone 4), dated 2025-07-04 (the report). The department says it has begun immediate steps on the urgent actions the review identified (the department's page).
- **Replacement**: The replacement is dated 2025-09-26. Its note says it corrects citations and reference-list entries that contained errors in the earlier version, amends the summary of the Amato proceeding which contained errors, and makes revisions for clarity, with no effect on the findings and recommendations (the report). The department's page says the report was updated to address a small number of corrections to references and footnotes and replaces the report dated 4 July 2025 (the department's page).
- **The case summary**: The July version cited the Amato case as "[2021] FCA 1019" and quoted the judge with paragraph numbers. The replacement gives the file number and date (VID611/2019, 2019-11-27) and quotes instead from the notes to the consent orders (the two PDFs).
- **Errors reported**: Works that do not exist (including a book attributed to a university professor) and a quotation attributed to a Federal Court judge were removed in the replacement. The department said Deloitte had confirmed some footnotes and references were incorrect, and that the substance and recommendations were unchanged (AP; CFO Dive).
- **The AI note**: Appendix C of the replacement and the methodology chapter state that one stage of the assessment used a generative AI tool chain (Azure OpenAI GPT-4o) licensed by the department (the report). The note does not appear in the July version (the July PDF).
- **Refund**: Deloitte agreed to repay the final instalment of the contract (AP). A department spokesperson said the refund was more than A$97,000 (CFO Dive). The contract was valued at about A$440,000 (same source).

### Timeline

- **2024-12-23**: Date of the Order for Services (the report).
- **2025-07-04**: Date of the final report.
- **2025-08-14**: Creation date of the department's page (the department's page).
- **Afterwards**: A University of Sydney researcher notices the errors and alerts the media (AP).
- **2025-09-26**: Date of the replacement.
- **2025-10-03**: The department's page is updated to the replacement.
- **2025-10-07**: Refund of the final instalment reported (AP).
- **2026-02-03**: According to the department's page, the report is updated again, replacing the 26 September version.

> The facts here rest on the department's page (Internet Archive captures of 2025-11-25 and 2026-10-07) and on the PDFs of two versions of the report (dated 2025-07-04 and 2025-09-26). The department's site could not be opened directly at the time of writing, so archived copies were used. The number and content of the errors, the researcher's findings, and the refund amount come from press reports. Neither the report nor the department's page says in which part of the work the faulty citations were produced. This Brief does not treat the errors as produced by AI. The page does not describe what the February 2026 update changed. At which stage the errors entered, and what checks were done before delivery and after receipt, have not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **The department**: Posted the replacement and said the substance and recommendations were unchanged. On 2026-02-03 it replaced the report again with a further corrected version (the department's page).
- **Deloitte**: Added the update note and the note on the generative AI tool chain to the replacement (the report). It said the matter had been resolved directly with the client (AP).

## 6. Sources

- **Department of Employment and Workplace Relations (DEWR, primary, party)**: "Targeted Compliance Framework Assurance Review – Final Report" (web page, capture after the 2025-10-03 update) — <https://web.archive.org/web/20251125121405/https://www.dewr.gov.au/assuring-integrity-targeted-compliance-framework/resources/targeted-compliance-framework-assurance-review-final-report>
- **Department of Employment and Workplace Relations (DEWR, primary, party)**: Same page, capture after the 2026-02-03 update — <https://web.archive.org/web/20261007001244/https://www.dewr.gov.au/assuring-integrity-targeted-compliance-framework/resources/targeted-compliance-framework-assurance-review-final-report>
- **Deloitte / DEWR (primary, report)**: "Targeted Compliance Framework — Independent Review Final Report" (2025-09-26, replacement, Appendix C) — <https://web.archive.org/web/20251006173740/https://www.dewr.gov.au/download/17099/targeted-compliance-framework-assurance-review-final-report/41163/targeted-compliance-framework-independent-review-final-report/pdf>
- **Deloitte / DEWR (primary, report)**: "Independent Review of the TCF – Final Report" (2025-07-04, first version) — <https://web.archive.org/web/20250816013629/https://www.dewr.gov.au/download/17099/targeted-compliance-framework-assurance-review-final-report/40749/targeted-compliance-framework-independent-review-final-report/pdf>
- **Korea JoongAng Daily (AP wire, Press)**: "Deloitte to partially refund Australian government for report with apparent AI-generated errors" (2025-10-08) — <https://www.koreajoongangdaily.com/world/deloitte-to-partially-refund-australian-government-for-report-with-apparent-ai-generated-errors/12113870>
- **CFO Dive (Press)**: "Deloitte refunds over $60K for report with AI errors, Australian government says" (2025-10-21) — <https://www.cfodive.com/news/deloitte-refunds-60k-report-ai-errors-australian-government-accounting/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
