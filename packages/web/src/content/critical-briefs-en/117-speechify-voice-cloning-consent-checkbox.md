---
brief_no: 117
title: "Speechify の音声クローン、同意の確認はチェックボックス1つだった — 米消費者団体が FTC と州司法長官に調査を申し立て"
title_en: "Speechify verified voice-cloning consent with a single checkbox — CFA asks the FTC and state AGs to investigate"
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
og_lead_ja: "Speechify の音声クローン、同意確認は自己申告チェックボックス1つ — CFA が FTC に申立て"
og_lead_en: "Speechify's voice-cloning consent is one self-certification checkbox; CFA files with the FTC"
gap_detected: "Independent testing by a consumer group and a law school demonstrated concretely that the consent check and the script-reading safeguard do not work, and brought it to regulators."
gap_missing: "A layer that independently verifies, at the moment the audio is generated, that the voice's owner authorized the use."
gap_fix: "Require the owner's authorization as an independently verifiable proof before a voice clone is generated, and refuse generation that carries no proof."
---

## 1. TL;DR

On July 27, 2026, the Consumer Federation of America (CFA), working with students from UCLA Law School's Information Policy Lab, published a complaint asking the Federal Trade Commission and the Attorneys General of the United States to investigate the voice-cloning service Speechify. Its core allegation: the only mechanism Speechify offers for verifying ownership or consent is **a single self-certification checkbox and a free-text name field**, with no technical verification of any kind. The other purported safeguard — reading a specified script aloud — does not verify that the recording matches the script, and can be bypassed entirely by uploading a pre-recorded audio file. Detection, in the form of independent testing and a regulatory filing, worked. **What was missing is the layer that verifies, at the moment the audio is generated, that the voice's owner authorized the use.**

## 2. What happened

- The complaint was prepared by CFA with students from UCLA Law School's Information Policy Lab, a project of the UCLA Institute for Technology, Law & Policy. It is addressed to "Attorneys General of the United States; Federal Trade Commission" and dated July 27, 2026.
- The filing includes a methodology section: the authors created accounts and tested the free and paid tiers of the standard product as well as Speechify Studio. For voice cloning they tested both a non-public figure and a non-licensed public figure, to show the tool has safeguards for neither.
- The only consent mechanism is a self-certification checkbox plus a name field. No technical verification confirms the identity of the voice owner or that the uploader obtained consent. The complaint notes the name can be a pseudonym, a fictitious name, or the name of the person whose voice is being cloned — and that a single actor can clone dozens of voices, each under a different fabricated identity.
- Account creation requires only an email address and a password. No identity verification is performed.
- There is no content moderation of the text to be spoken. In the authors' testing, scripts drawn from known scams — a delivery-company impersonation demanding a $1.45 shipping fee and card details, and a boss-impersonation demanding an urgent transfer — were accepted and read aloud without any flag, warning, or restriction.
- The complaint invokes Section 5(a) of the FTC Act along with state UDAP laws and digital forgery statutes, and devotes a section to why Section 230 does not immunize Speechify's voice-cloning pipeline.

Consent verification fails through the following chain.

1. A user creates an account with only an email address and a password. No identity check occurs.
2. At the cloning step, the user is asked to read a specified script. The platform does not verify that what was said matches the script. Anything passes.
3. The script step can be skipped entirely by uploading a pre-recorded audio file.
4. The user ticks one checkbox and types a name. That is the entirety of the "I have the right to this voice" declaration; nothing corroborates it.
5. The cloned voice reads any text the user supplies. There is no content review.

## 3. Timeline — disclosure and response

- 2026-07-27: The complaint is dated, addressed to the Attorneys General of the United States and the FTC.
- 2026-07-27: CFA publishes a press release urging the FTC and state Attorneys General to investigate Speechify's voice-cloning practices.
- 2026-07-27: The complaint itself is published as a PDF on CFA's site. The document is headed "Draft Complaint"; that published version is what this Brief cites.

> Note: the facts here come from the complaint and press release CFA published. The filing asks agencies to investigate; it is neither litigation nor a finding of fact. The described safeguard failures are the results of the authors' own independent testing, and no response from Speechify was available at the time of writing. This Brief is not a condemnation of a particular vendor but an examination of a structure in which consent, as an attribute, is never verified at the moment of generation.

Response and industry movement after publication:

- The filing pairs Section 5(a) of the FTC Act with state UDAP and digital forgery statutes, and argues Section 230 does not reach a voice-cloning generation pipeline — framing voice cloning as content creation rather than hosting.
- As background, the complaint cites FTC data showing people lost $3.5 billion to impersonation scams in 2025, with reported losses up nearly threefold since 2020. Impersonation is now the most commonly reported type of fraud.
- The complaint quotes Speechify's own Terms of Service and Privacy Policy — which state that employees do not monitor user content and that there is no systematic review of user material — as corroboration that content moderation is absent.

## 4. Why it wasn't stopped

The failure here is not that safeguards were absent. It is that none of the safeguards provided **verifies that the voice's owner authorized the use**. A checkbox is a declaration, not a proof. A name field is self-reported, not an identity. A script-reading check confirms that audio exists; it does not confirm whose voice it is or what that person agreed to.

Detection worked. A consumer group and a law school created accounts, cloned both a private person and a public figure, had scam scripts read aloud, showed concretely that the safeguards were nominal, and took it to regulators. What was missing came earlier — the layer that, at the instant the audio is generated, verifies whether that generation falls within what the owner authorized.

> A self-certification checkbox costs a bad actor nothing. It constrains only honest users, never those with a motive to route around it. Presented as a safeguard, all it leaves with the recipient is the impression that verification occurred.

The same structure runs through [Brief 105 (JAPRO's likeness and voice survey)](/critical/briefs/105-japro-likeness-voice-ai-provenance/), where flawless takedown and monitoring still could not stop the next generation; [Brief 053 (YouTube's fake celebrities)](/critical/briefs/053-youtube-deepfake-likeness-provenance/), where likeness provenance was never fixed before publication; and [Brief 050 (Grok's deepfake consent)](/critical/briefs/050-grok-deepfake-consent-provenance/), where a default permission state passed as proof of consent. In each, whether consent was *declared* and whether consent is *being verified now* are different questions. The fact that a supposedly biometric check turned out to be trivially bypassable also echoes [Brief 034 (eKYC liveness bypass)](/critical/briefs/034-ekyc-liveness-bypass/).

## 5. What proof would have changed

Proof-as-auth inserts one layer into the path ahead of each individual act of generating a cloned voice: an independent verification of the owner's authorization. Instead of treating a checkbox and a typed name as a stand-in for consent, it asks — before generation succeeds — whether this use of this voice falls within what its owner authorized. If the answer is "no proof of authorization," generation is refused up front.

Lemma's design against this primitive:

- **Verify authorization before generation.** Bind voice cloning to a verifiable authorization issued by the owner rather than to a self-report. Requests carrying no proof are separated out before generation.
- **Selective disclosure of the attribute.** Make "this use is authorized" provable on its own, without handing over the owner's identity or contact details, so that verifying consent does not require accumulating personal data.
- **Scope the authorization.** Bind purpose, duration, and distribution scope into the proof, so out-of-scope generation is excluded up front and one grant does not become unlimited use.
- **Bind provenance to the output.** Attach the authorization's provenance to the generated audio itself, in tamper-evident form, so recipients can check it independently.

Lemma is not a product that judges the quality of a cloned voice, nor one that detects scam scripts. Its scope is to verify the owner's authorization independently before audio is generated, and to exclude generation that lacks proof. Detection (surveys, independent testing, regulatory filings and enforcement) and pre-execution proof (an audit trail that independently verifies authorization before generation) are complementary, not alternatives. The first grasps and remedies harm that has occurred; the second establishes trust before harm can occur. For design detail see ["Proof-as-Auth: Sign in without ever sending your key"](/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for scope, [Pillar 04 — Regulatory Attribute Proof](/pillars/regulatory-attribute-proof/).

## 6. Sources

- **CFA / UCLA Law (primary)**: "Draft Complaint — To: Attorneys General of the United States; Federal Trade Commission" (2026-07-27, PDF) — <https://consumerfed.org/media/iy5hjsp2/speechify-complaint-cfa.pdf>
- **CFA (primary, press release)**: "Consumer Federation of America Urges FTC and State Attorneys General to Investigate Speechify Over AI Voice-Cloning Practices" (2026-07-27) — <https://consumerfed.org/news/press-releases/consumer-federation-of-america-urges-ftc-and-state-attorneys-general-to-investigate-speechify-over-ai-voice-cloning-practices/>
- **CFA (primary, filing page)**: "CFA Complaint Against Speechify for Facilitating AI Voice Cloning Impersonation Scams" — <https://consumerfed.org/news/testimony-comments/cfa-complaint-against-speechify-for-facilitating-ai-voice-cloning-impersonation-scams/>
- **CFA (background report)**: Ben Winters, "Scamplified" (2025) — <https://consumerfed.org/reports/scamplified/>
- **FBI / IC3 (background, primary)**: "Federal Bureau of Investigation Internet Crime Report 2025" (PDF) — <https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf>

References: ["The last layer left to AI-era cyber defense"](/blog/detection-is-not-proof/) (Lemma, 2026-05) · [Pillar 04 — Regulatory Attribute Proof](/pillars/regulatory-attribute-proof/) · [Brief 105 (JAPRO's likeness and voice survey)](/critical/briefs/105-japro-likeness-voice-ai-provenance/) · [Brief 053 (YouTube's fake celebrities)](/critical/briefs/053-youtube-deepfake-likeness-provenance/)
