---
brief_no: 117
title: "Speechify：音声クローンの同意の確認が自己申告だけだとして、調査が申し立てられた(CFA の申し立て)"
title_en: "Speechify: Consumer group alleges voice-cloning consent relies on self-declaration alone and seeks an investigation (CFA complaint)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-07-27
published: 2026-08-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["105-japro-likeness-voice-ai-provenance", "053-youtube-deepfake-likeness-provenance", "050-grok-deepfake-consent-provenance", "084-hong-kong-deepfake-video-call-fraud", "034-ekyc-liveness-bypass"]
status: published
version: "1.0"
og_lead_ja: "Speechify の音声クローン、同意の確認は自己申告のチェックボックスだけだと CFA が FTC に申し立て"
og_lead_en: "CFA tells the FTC that Speechify's voice-cloning consent check is a single self-declaration checkbox"
layout: "report"
sections: "proof"
gate: "intake"
og_kicker_ja: "AI の事例 · 音声クローンの同意"
og_kicker_en: "AI CASE · VOICE-CLONE CONSENT"
og_headline_ja: "声の持ち主の同意は、\n自己申告だけと訴え。\n<accent>CFA が調査を申し立て</accent>"
og_headline_en: "Voice-clone consent was\nself-declared, CFA says.\n<accent>It seeks an FTC probe.</accent>"
key_figures:
  - value: "1"
    unit: "checkbox"
    label: "The consent check offered: a self-declaration checkbox (plus a name field), with no technical verification (CFA complaint)"
    tone: "alert"
  - value: "2"
    unit: "scripts"
    label: "Scripts of the kind used in real scams were read aloud with no warning or restriction (the complaint authors' testing)"
  - value: "$3.5"
    unit: "billion"
    label: "Reported losses to impersonation scams in 2025, nearly three times 2020 (FTC data cited in the complaint)"
glossary:
  - term: "Voice cloning"
    desc: "Technology that takes recordings of a person's voice and lets any text be spoken in that voice."
  - term: "CFA"
    desc: "Consumer Federation of America, a consumer group. It prepared this complaint with students from UCLA Law."
  - term: "Complaint"
    desc: "A document asking agencies to investigate. It is neither a lawsuit nor a finding of fact by an authority."
insight:
  slug: "declared-consent-not-checked"
  label: "Declared consent is not checked consent"
  quote: "If consent is accepted on the uploader's word alone, nothing checks before generation whether that word is true, and someone else's voice passes through the same steps."
industries: ["ai"]
operations: ["approval"]
controls:
  - slug: "ownership-check"
    item: "Check, before generating audio, that the voice's owner authorized the use"
impact: "The complaint alleges consent was a self-declaration checkbox and name field, and that other people's voices could be cloned"
takeaway: "According to the complaint, consent was self-declared and other people's voices could be cloned. Check the owner's own authorization before generating the voice."
self_check: "Before generating someone's voice or likeness, do you check that the owner authorized it, separately from what the uploader declares?"
countries: ["us"]
---

## 1. Summary

According to the complaint, the voice-cloning flow offered a self-declaration checkbox and a name field as its consent check, with no technical verification of what was entered. The script-reading step, it says, could be bypassed by uploading pre-recorded audio. These are results of testing by a consumer group and law students, not findings by an authority. <strong>If consent is accepted on the uploader's word alone, nothing checks before generation whether that word is true, and someone else's voice passes through the same steps.</strong>

## 2. What got through

- **What got through**: Registering a voice clone, and having text read aloud in the cloned voice. The complaint's authors say they tried cloning both a private individual and a public figure whose voice they had no licence to use, and that no safeguard triggered for either (CFA complaint).
- **What the receiving side gets**: According to the complaint, account creation receives only an email address and a password, and clone registration receives a ticked checkbox, a free-text name and audio. The name can be a pseudonym or the name of the person being cloned, and a different fictitious identity can be entered each time, it says.
- **The script check**: There was a step to read a specified script, but it allegedly did not verify that what was said matched the script, and uploading pre-recorded audio skipped the step entirely.
- **Not disclosed**: Speechify's response (not confirmed at the time of writing). Whether any cloned voice has actually been used in a scam.

## 3. What to check

The condition that holds whatever the route is this: before a voice is generated, check that the use falls within what the voice's owner authorized, separately from what the uploader declares.

- **Who approves**: The owner of the voice. The uploader's declaration (a checkbox or a name) does not stand in for the owner's approval.
- **Where the check happens**: Just before the cloned voice is generated. Generation that cannot be matched to the owner's authorization does not run. Generation outside the authorized purpose, period or distribution is stopped at the same point.
- **What remains**: A record of which voice generation rested on which authorization from the owner, in a form that shows authorization exists without handing over the owner's identity or contact details.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">A pre-execution check means checking the voice owner's own authorization before the voice is generated, and keeping a record. Detection means finding out afterwards that generation is possible; here, independent testing by a consumer group and others did that. The date is the date of the complaint.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the voice owner's authorization before generation</div>
<div class="rx-zone gapz"><b>What was alleged</b><span>Consent was a self-declaration only;<br>other people's voices could be cloned</span></div>
<div class="rx-zone det"><b>Detection · independent testing worked</b>Shown by testing and filed with the FTC and state AGs</div>
<div class="rx-g g1"><div class="t">SIGN-UP</div><b>Account created with email and password</b></div>
<div class="rx-g g2"><div class="t">CLONE</div><b>Voice registered with a checkbox and a name</b></div>
<div class="rx-g g3"><div class="t">READ</div><b>Scam-style scripts read aloud without warning</b></div>
<div class="rx-g g4"><div class="t">07-27</div><b>CFA publishes the complaint</b></div>
</div>
</figure>

The independent testing showed concretely that the steps were nominal, but it found a state in which generation was already possible. Other cases where consent or provenance was not checked before generation or publication are [JAPRO's likeness and voice survey](https://lemma.frame00.com/critical/briefs/105-japro-likeness-voice-ai-provenance/) and [Grok's deepfake consent](https://lemma.frame00.com/critical/briefs/050-grok-deepfake-consent-provenance/). The bypassable biometric step also echoes [the eKYC liveness bypass](https://lemma.frame00.com/critical/briefs/034-ekyc-liveness-bypass/).

## 4. What Lemma does

**Lemma builds the check in section 3 into the point just before a voice is generated.** It does not judge voice quality or detect scam scripts; it checks, before generation, that the generation falls within what the voice's owner authorized.

### Industries and operations to watch

- **Industry · AI**: Services that generate speech or images that sound or look like a real person from their voice or likeness.
- **Operation · Approvals**: Accepting the owner's consent for generation that uses someone else's voice or likeness.

### Current controls vs Lemma

The route in this case is column 1 (accepting the owner's consent when registering a voice clone). Column 2 is generating text read aloud in the cloned voice; the complaint says there was no review of the text's content.

| Control | Registering a voice clone (owner's consent) | Reading text aloud in the cloned voice |
| --- | --- | --- |
| Self-declaration checkbox and name field | Not effective | Not relevant |
| Script-reading check | Not effective | Not relevant |
| **Lemma (pre-execution check)** | Effective | Partial |

According to the complaint, the checkbox and name field only receive a declaration and carry no technical verification. The script-reading check did not verify that what was read matched the script, and could be skipped by uploading pre-recorded audio. Lemma checks, before generation, an authorization issued by the voice's owner, not the uploader's declaration. For reading text aloud, binding a purpose or period to the authorization stops out-of-scope generation, but Lemma does not judge whether text within that scope is a scam.

Note: Lemma's check works only when it is built in just before voice generation and the owner's authorization is issued and managed separately from the uploader. Generation within the scope the owner authorized passes this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three items to confirm for generation that uses someone else's voice or likeness

- Is the consent check only the uploader's self-declaration (a checkbox or a name)?
- Do you check the voice owner's own authorization before generation?
- Can you stop generation outside the authorized purpose, period or distribution before it runs?

## 5. Facts and timeline

- **Who filed**: The Consumer Federation of America (CFA) and students from UCLA Law School's Information Policy Lab, a project of the UCLA Institute for Technology, Law & Policy. Addressed to the Attorneys General of the United States and the Federal Trade Commission (FTC).
- **Testing method**: The authors write in the complaint's methodology section that they created accounts and tested the free and paid tiers and Speechify Studio.
- **Consent check**: The complaint says Speechify Studio's only mechanism for verifying ownership or consent is a self-certification checkbox and a name field, and that neither the voice owner's identity nor whether the uploader obtained consent is technically verified. It says a single actor can clone dozens of voices, each under a different fictitious identity.
- **Account creation**: Only an email address and a password are needed, with no identity verification, it says.
- **Text read aloud**: There is no content review, it says; in the authors' testing, scripts of the kind used in real scams (a USPS impersonation demanding a $1.45 shipping fee and card details, and a boss impersonation asking for five $100 Apple gift cards and the codes) were read aloud without any flag, warning or restriction.
- **Legal basis claimed**: The complaint invokes Section 5(a) of the FTC Act, state unfair and deceptive practices (UDAP) laws and digital forgery statutes, and includes a section on why Section 230 of the Communications Decency Act does not immunize the pipeline.

### Timeline

- **2026-07-27**: Date of the complaint, addressed to the Attorneys General of the United States and the FTC.
- **2026-07-27**: CFA issues a press release urging the FTC and state Attorneys General to investigate Speechify's voice-cloning practices.
- **2026-07-27**: The complaint itself is published as a PDF on CFA's site. The document is headed "Draft Complaint"; this Brief relies on that published version.

> The facts here rest on the complaint and press release CFA published. The complaint asks agencies to investigate; it is neither a lawsuit nor a finding of fact. The safeguard failures described are results of the authors' own independent testing, and Speechify's response had not been confirmed at the time of writing. This Brief does not blame any particular company. What has not been disclosed does not mean there were no controls.

### After disclosure

- **The complaint's argument**: It frames voice cloning as content creation rather than hosting, and argues that Section 230 does not reach a voice-cloning generation pipeline.
- **Background figures**: Citing FTC data, the complaint says reported losses to impersonation scams reached $3.5 billion in 2025, nearly three times 2020, making impersonation the most commonly reported type of fraud.
- **Terms of service**: The complaint quotes Speechify's Terms of Service and Privacy Policy, which state that employees do not monitor user content and that there is no systematic review of user material, as support for the absence of content review.

## 6. Sources

- **CFA / UCLA Law (primary)**: "Draft Complaint — To: Attorneys General of the United States; Federal Trade Commission" (2026-07-27, PDF) — <https://consumerfed.org/media/iy5hjsp2/speechify-complaint-cfa.pdf>
- **CFA (primary, press release)**: "Consumer Federation of America Urges FTC and State Attorneys General to Investigate Speechify Over AI Voice-Cloning Practices" (2026-07-27) — <https://consumerfed.org/news/press-releases/consumer-federation-of-america-urges-ftc-and-state-attorneys-general-to-investigate-speechify-over-ai-voice-cloning-practices/>
- **CFA (primary, filing page)**: "CFA Complaint Against Speechify for Facilitating AI Voice Cloning Impersonation Scams" — <https://consumerfed.org/news/testimony-comments/cfa-complaint-against-speechify-for-facilitating-ai-voice-cloning-impersonation-scams/>
- **CFA (background report, primary)**: Ben Winters, "Scamplified" (2025) — <https://consumerfed.org/reports/scamplified/>
- **FTC (background, primary)**: "FTC Data Show People Reported Losing $3.5 Billion to Imposter Scams in 2025" (2026-06) — <https://www.ftc.gov/news-events/news/press-releases/2026/06/ftc-data-show-people-reported-losing-3-point-5-billion-imposter-scams-2025>
- **FBI / IC3 (background, primary)**: "Federal Bureau of Investigation Internet Crime Report 2025" (PDF) — <https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
