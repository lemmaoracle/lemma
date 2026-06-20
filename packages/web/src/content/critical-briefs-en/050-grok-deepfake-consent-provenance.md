---
brief_no: 50
title: "非同意の画像が、生成の時点で誰の同意も年齢も確かめられずに作られた — 被写体の同意・年齢と生成物の来歴が、生成時点で独立検証されない構造（Grok）"
title_en: "Generated Without Consent or Age Verification — The Provenance Gap Behind the Grok Deepfake Controversy"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance", "ai-decision-integrity"]
incident_date: 2026-01-26
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["011-synthid-watermark-reverse-engineering", "034-ekyc-camera-feed-provenance", "024-invisible-unicode-instruction-injection"]
status: published
version: "1.0"
og_lead_ja: "非同意画像、生成の時点で同意・年齢が未検証 — Grok"
og_lead_en: "Consent and age unverified at generation — Grok deepfakes"
gap_detected: "Reports, detection technology, and investigations by national authorities operated to remove and remediate the spread outputs."
gap_missing: "At generation time there was no layer to confirm whether the subject consented or was not a minor, and the outputs carried no verifiable provenance marker, so harmful generations could not be distinguished until the spread had begun."
gap_fix: "Before generating an image, independently verify with Lemma that the subject's consent and age are confirmed and authorized, and prevent it up front."
---

## TL;DR

> This Brief does not describe any of the generated imagery. Given the severity of the harm (which includes children), it is limited to the factual record of the regulatory and platform response and to the structure of the trust layer (the absence of attribute and provenance verification).

Grok's image generation integrated into X was abused at scale to produce non-consensual deepfakes of real people — said to include minors as subjects — and the EU, Ireland, the UK, and other authorities opened investigations. The structural problem: the subject's consent and age are not verified before generation, and the output carries no verifiable provenance marker. Reporting, detection, and takedowns operate only after distribution begins. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident overview

- **Subject**: Grok's image-generation feature integrated into X. Abuse in which non-consensual altered images are generated from images of real people was widely reported
- **Nature of harm**: Non-consensual sexual deepfakes were generated at scale, and authorities and reporting noted that some used minors as subjects. Multiple authorities treat this as the possible generation and distribution of "illegal sexual imagery" and "child sexual abuse material (CSAM)"
- **Regulatory response**: The European Commission opened formal proceedings into whether X's AI tools meet their obligations under the EU Digital Services Act (DSA), expanding an existing investigation to cover the deployment of Grok. Ireland's Data Protection Commission (DPC) notified X of a large-scale inquiry under EU data protection rules. The UK's Ofcom announced an investigation under online-safety regulation into whether X / xAI breached its duties. Investigations are also advancing in France, India, and elsewhere
- **The crux**: At the moment of generation, the attributes of the subject's **consent** and **age** are not independently verified, and the output carries no verifiable **provenance marker**. The judgment of illegality or harm is made only after generation and distribution

---

## 2. Timeline

- 2025-12 to 2026-01: Mass generation of non-consensual deepfakes via Grok's image generation surfaces, with indications that some used minors as subjects
- 2026-01-26: The European Commission opens formal proceedings against X under the DSA, expanding an existing investigation to the deployment of Grok (generation of deepfakes of women and minors)
- 2026-02-17: Ireland's DPC notifies X of a large-scale inquiry under EU data protection rules. An EU privacy-side investigation proceeds in parallel
- Ongoing: The UK's Ofcom announces an investigation under online-safety regulation. Investigations and regulatory responses also advance in France, India, and elsewhere

> Note: The figures for the number of images generated and the scale of harm vary across investigations and reporting. This Brief does not state specific counts or describe content; it focuses on the structure of absent attribute and provenance verification. The final judgment of illegality is left to each country's investigations.

---

## 3. Chain of events: generated with neither attribute nor provenance checked

This incident stems from a structure in which, at the moment of generation, the subject's attributes and the output's provenance are not independently verified. The path by which the failure propagates into harmful distribution:

1. **Attribute-unverified input**: A user gives the AI an image of a real person and an instruction. Whether the subject **consents** or **is not a minor** is not verified before generation
2. **Generation without a provenance marker**: The AI generates an altered image. The output carries no verifiable provenance marker indicating that it is AI-generated and under whose authorization it was made
3. **Distribution**: The output is shared and spread on the platform. The judgment of illegality or harm is made afterward
4. **After-the-fact detection and takedown**: Reports, detection, and regulatory response trigger takedowns and investigations. But this is an after-the-fact sequence operating only after generation and distribution, and harm that has already spread is hard to recover

---

## 4. Structural analysis

This incident belongs to the `attribute-proof-bypass` category under Pillar 04 (Regulatory Attribute Proof). The central failure primitive is that **at the moment of generation, regulatorily significant attributes — the subject's consent and age — are not independently verified, and the output is given no verifiable provenance.** As secondary we note `data-provenance` (the provenance of AI output) and `ai-decision-integrity` (the verifiability of generation as an AI action).

The center of gravity here is not "fairness" or "whether the content is good or bad," but **whether, before the action (generation and publication), there is evidence that the attributes regulation requires were independently verified and authorized.** Consent and age are attributes that ought to be verified before generation. Yet generation runs without attribute verification, and the output spreads lacking provenance. Because the judgment of illegality comes after generation and distribution, detection and takedown trail behind the harm.

It shares a root with Brief 011 (SynthID's watermark can be statistically stripped, so the provenance marker on AI output fails to function): the output's provenance is not fixed in verifiable form. It connects to Brief 034 (in eKYC, identity was accepted while the capture-feed provenance went unverified), in that an attribute (identity / consent and age) passes while its provenance is unverified. It moves Brief 024's "divergence between display and substance" (invisible Unicode diverging what is seen from what the AI ingests) onto the attributes and provenance of generative AI. What this case shows is the consequence of generative AI operating in public space without attribute verification and provenance binding — and the severity stands out because the harm includes children.

---

## 5. The gap between detection and proof

Reporting channels, detection technology, platform takedowns, and the investigations by national authorities (EU DSA, Ireland DPC, UK Ofcom, etc.) are indispensable for grasping, removing, and deterring harm, and this Brief does not deny that role. In particular, the detection, takedown, and reporting of material involving children is the highest-priority operational response and should be strengthened.

At the same time, detection and takedown do not, **at the moment of generation**, independently establish "whether this output went through consent and age attribute verification and carries authorized provenance." Watermarks can be stripped (Brief 011), detection operates after generation and distribution, and takedown does not fully recover harm that has already spread. What was missing is the at-generation independent verification of "does this generation come with evidence that the subject's consent and age were independently verified and authorized," which is a separate track from after-the-fact detection and takedown. As long as attribute verification and provenance binding are pushed to after generation, the response can only trail the harm. Regulatory analysis (BISI and others) likewise notes that the solution lies at the moment of generation (upstream).

Pre-execution attestation closes this gap by inserting one step — verification of the subject's attributes and provenance binding — into the output path of the generative AI. By requiring, before generation, that "the subject's consent and age attributes are independently verified and authorized," and by binding a verifiable provenance marker to the output at the moment of action, generation lacking attribute verification, and outputs without provenance, can be distinguished before generation and distribution. Detecting the output (the detection-style "is this harmful") and the pre-execution attestation of generation ("does this generation carry attribute verification, authorization, and provenance") are not substitutes but **complements**.

---

## 6. Response and industry trends

- **Regulators**: The EU under the DSA, Ireland's DPC under EU data protection rules, and the UK's Ofcom under online-safety regulation are advancing investigations. Generative-AI platforms are being asked to fulfill their duty to prevent the generation and distribution of illegal and harmful content
- **The provenance and labeling question**: As mandatory provenance markers and labeling for AI output advance (EU AI Act, etc.), the challenge has surfaced that provenance which is strippable or added after the fact carries no real effect. The point of debate is upstream design that binds verifiable provenance at the moment of generation
- **Cross-industry point**: There is growing discussion of shifting the center of gravity of generative-AI trust design away from after-the-fact content moderation, toward performing the subject's consent and age attribute verification and provenance binding in an independently verifiable form before generation (attribute proof / pre-execution attestation). Preventing harm involving children requires, alongside stronger detection, attribute verification at the moment of generation

---

## 7. Lemma's analysis

Against the gap this incident exposed (at the moment of generation, the subject's consent and age attributes are not independently verified, and the output is given no provenance), Lemma proposes a design that, before the act of generation, requires attribute verification and provenance binding as independently verifiable cryptographic proof.

- **Pre-execution attestation of attributes**: Before generation, prove with a signature that the subject's consent and age attributes were independently verified and authorized. Distinguish generation that lacks attribute verification before the action
- **Provenance-binding of the output**: Bind to the output, at the moment of generation, a verifiable provenance indicating that it is AI-generated and which authorization and attribute verification it passed through (docHash binding). Make after-the-fact stripping and forgery verifiable from the provenance side
- **Selective disclosure**: Disclose only that the attribute conditions "the subject has consented and is an adult" are met, without exposing the subject's personal information itself outside the environment
- **Scoped authorization**: Bind the generative AI's output to attribute conditions, so generation that does not meet them cannot succeed without proof

Through this, proof fixed at the moment of generation functions as an independently verifiable trail for "does this generation carry attribute verification, authorization, and provenance," before distribution. Detection and takedown (after-the-fact moderation and regulatory response) serve to remove and deter harm, while pre-execution attestation (attribute verification and provenance binding at the moment of generation) serves to distinguish harmful generation before it occurs — each working complementarily.

---

## 8. Sources

- **TechPolicy.Press**: "Tracking Regulator Responses to the Grok 'Undressing' Controversy" (an organized timeline of national authorities' responses) — <https://www.techpolicy.press/tracking-regulator-responses-to-the-grok-undressing-controversy/>
- **Al Jazeera**: "EU probes Musk's Grok AI feature over deepfakes of women, minors" (2026-01-26; opening of EU DSA proceedings) — <https://www.aljazeera.com/news/2026/1/26/eu-launches-probe-into-grok-ai-feature-creating-deepfakes-of-women-minors>
- **BISI (Bloomsbury Intelligence & Security Institute)**: "Deepfake Regulation Accelerates After Grok Controversy" (regulatory trends; the need for an upstream response) — <https://bisi.org.uk/reports/deepfake-regulation-accelerates-after-grok-controversy>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
