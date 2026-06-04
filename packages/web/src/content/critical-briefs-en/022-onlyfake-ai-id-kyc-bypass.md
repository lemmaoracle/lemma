---
brief_no: 22
title: "OnlyFake — AI 生成 ID による KYC 突破"
title_en: "OnlyFake — AI-Generated IDs Bypass Exchange KYC"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2024-02-05
published: 2026-06-04
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["021-wirecard-balance-attestation", "019-construction-engineer-qualification-fraud", "011-synthid-watermark-reverse-engineering", "006-google-api-key-revocation-lag"]
version: "1.0"
status: published
og_lead_ja: "AI 生成 ID で取引所 KYC を突破、画像審査は発行者検証ではない — OnlyFake"
og_lead_en: "AI-generated IDs bypassed exchange KYC — image review isn't issuer verification — OnlyFake"
---

## TL;DR

On February 5, 2024, US outlet 404 Media reported that an image of a UK passport produced by the fake-ID generation service "OnlyFake" passed the KYC (identity verification) check at the major crypto exchange OKX. OnlyFake generated ID images for 26 countries at USD 15 apiece, let the buyer freely specify name, address, expiry, and signature, and also covered the spoofing of capture-device, timestamp, and GPS metadata. The operator claimed the images were produced by a "neural network" (404 Media said it could not verify that claim itself) and asserted that the major exchanges and crypto-friendly neobanks could be cleared. OKX framed the issue as industry-wide rather than specific to any one firm. International bodies subsequently documented attack chains that combine AI-generated documents, face swap, and camera injection to defeat both document and biometric checks, and by 2025 about one in twenty global identity-verification failures was reported to be deepfake-related. This Brief examines a structure in which the regulatory attribute "cleared KYC" is built on top of evidence — a document image — whose issuer cannot be cryptographically verified. Once the cost of producing a "convincing image" collapses, image review without issuer verification stops functioning as attribute proof.

Reviewed the image ≠ verified the issuer

---

## 1. Incident Overview

- **Demonstration report**: 2024-02-05, 404 Media reported that an OnlyFake-generated UK passport image cleared OKX's KYC. The case is also indexed in the OECD.AI incident registry
- **Service offering**: USD 15 per ID. Covers 26 countries including the US, Canada, the UK, Australia, and EU member states. Buyer specifies name, date of birth, address, expiry, and signature; even the "shot lying on a carpet" texture commonly used in KYC capture is reproduced
- **Metadata spoofing**: EXIF spoofing for capture device, timestamp, and GPS is supported
- **Operator claims**: An anonymous operator (self-styled "John Wick") claimed the service could clear KYC at major exchanges and crypto-friendly neobanks. They described the pipeline as a "neural network." (404 Media explicitly noted it could not verify the AI-use claim itself; the price point, however, points at automated generation)
- **Target-side framing**: OKX framed the case as industry-wide rather than as a single-firm problem

---

## 2. Timeline

- 2024-02-05: 404 Media publishes the OnlyFake demonstration report. The OKX KYC bypass is confirmed
- 2024-02: Industry press follows. OKX frames the case as industry-wide. OECD.AI indexes the incident in its registry
- 2025: The World Economic Forum and others document attack chains combining AI-generated documents, face swap, and camera injection that defeat both document and biometric checks
- 2025: Identity-verification industry statistics report a 2,137% rise in deepfake-related fraud attempts over three years, with about one in twenty identity-verification failures reported to be deepfake-related
- H1 2025: Reported deepfake-driven fraud losses reach roughly USD 410 million in a half-year. Regulatory fines for AML/KYC violations also rise sharply

---

## 3. Attack Vector

1. **Document image generation**: an attacker uses OnlyFake or a similar service to generate a photorealistic ID image with the desired name and attributes at low cost. Capture conditions and metadata are spoofed as well
2. **Clearing document review**: the generated image is submitted to the KYC flow. Document review judges the "look" of the image (template fit, texture, internal consistency) — it does not cryptographically verify that the issuer actually issued the document
3. **Clearing biometric review**: face swap plus camera injection defeats selfie matching and liveness checks. As long as both KYC pillars — document and biometric — are judging "the look of the presented artifact," progress on the generative side translates directly into bypass rate
4. **Attribute acquisition**: the regulatory attribute "cleared KYC" is conferred and the account is opened. From that point onward, the attribute is accepted downstream as the precondition for trades and transfers
5. **Impact realization**: the fraudulent account is used for fraud or money laundering. The operator faces after-the-fact monitoring and regulatory exposure, and onboarding gaps surface as AML/KYC fines

---

## 4. Structural Argument

This incident belongs to the `attribute-proof-bypass` category of Pillar 04 (Regulatory Attribute Proof). The central failure primitive is that **a regulatory attribute — "cleared KYC" — is built on top of evidence whose issuer cannot be verified.** What the document review actually checks is not the document but its image; the substance of the review is a "looks-plausible" judgment. Disconnected from the cryptographic fact of an issuer signature, this review stops functioning as attribute proof at the moment the cost of producing a "convincing image" collapses. `identity-auth` (binding between the person and their attributes) and `data-provenance` (the provenance of AI-generated content) are noted as secondary categories.

Convincing-looking ≠ issued

Briefs 019 (worker qualification), 020 (product conformity) and 021 (asset existence) surfaced as insider data tampering and false reporting. This case is their counterpart: **an external attacker exploited the same structural gap — an attribute assertion decoupled from the layer that would verify it.** That the gap is the same shows the answer is not "more rigorous review of the presented artifact" but "add the verification layer." Through the lens of AI-generated content provenance, this case also sits adjacent to Brief 011 (SynthID watermark reverse engineering).

---

## 5. The Structural Gap Detection Cannot Close

The industry's initial response to this case is to strengthen detection. Deepfake detection, image forensics, and injection detection actually stop a large share of fraud attempts, and this Brief does not dispute the role of the detection layer. Detection remains essential as the layer that lowers bypass rate and raises attacker cost.

Detection, however, cannot itself answer the question "did the presented image capture a document the issuer actually issued?" What detection scores is the presence or absence of generation artifacts; the generative side and the detection side are structurally locked in an arms race. No matter how high the detection rate climbs, it is a probabilistic score — not, on its own, material that proves in regulatory reporting, administrative procedure, or litigation that "this account was opened through legitimate identity verification." This is a structurally independent gap beyond detection's reach.

As things stand, across the operating model for identity verification, issuer verification of the presented evidence is not yet treated as a distinct layer. Pre-execution attestation closes the gap by inserting one step of issuer-signed attribute proof into the onboarding path. When the object of review shifts from "image" to "proof," progress on the generative side no longer translates into bypass rate. Pre-execution attestation complements detection rather than replacing it; together the two layers establish the trust boundary for identity verification (for more on the relationship between detection and pre-execution attestation, see [The Last Layer Left for Cyber Defense in the AI Era](https://lemma.frame00.com/ja/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and Industry Response

- **Target side**: OKX framed the case as industry-wide. Identity-verification vendors continued to strengthen deepfake and injection detection while reporting that the underlying generative-vs-detection arms race remains a structural feature
- **International bodies / industry statistics**: WEF and others documented attack chains combining AI-generated documents, face swap, and camera injection. Deepfake-related fraud attempts were reported to be up 2,137% over three years, with about one in twenty identity-verification failures in 2025 reported to be deepfake-related
- **Shift in regulatory center of gravity**: Penalties for AML/KYC violations continued to harden, and onboarding-stage identity-verification gaps became a primary reason for enforcement action. In parallel, an institutional shift toward identity verification grounded in issuer-signed digital credentials with selective disclosure — exemplified by the EU's eIDAS 2.0 and the EUDI Wallet — has begun, so a structural transition from "review the image" to "verify the proof" is now under way on the regulatory side as well

The absence of a layer that cryptographically verifies the issuer of the evidence at the moment of onboarding is surfacing not as a single-firm problem but as a cross-industry operational challenge in finance and identity verification.

---

## 7. Lemma's Analysis

For the structural gap exposed here — a regulatory attribute for identity verification built on top of image evidence whose issuer cannot be verified — Lemma offers a design in which identity verification shifts from "image review" to "cryptographic verification of an issuer-signed credential," so the verifying side can confirm that "the requirements are satisfied" without receiving the original data.

- **Issuer-signed credentials**: governments, issuing authorities, and verified IdPs issue subject attributes with an issuer signature. What gets verified is not the look of an image but the cryptographic fact of the issuer's signature
- **Selective disclosure**: BBS+ over BLS12-381 discloses only what the regulation requires — "over 18," "not on the sanctions list," "cleared KYC" — never the original ID or the full attribute set
- **Validity and revocation**: committed with Poseidon over BN254; validity and non-revocation proven with Groth16 (Circom circuits); bound to the original via docHash so revocation (withdrawal, expiry) is tracked

A proof fixed at the point of onboarding then functions, years later when "was this account opened through legitimate identity verification?" is asked, as an independently verifiable trail that discloses no original data. Detection (deepfake detection, after-the-fact monitoring) raises attacker cost and serves remediation after disclosure; pre-execution attestation (issuer verification) serves independent verification of attribute legitimacy — complementary layers.

Data doesn't move. Proofs do.

For the design and scope, see the use case [KYC/AML Selective Disclosure](https://lemma.frame00.com/ja/solutions/use-cases/kyc-aml-selective-disclosure/) and [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/ja/pillars/regulatory-attribute-proof/).

---

## 8. Sources

- **404 Media (primary)**: "Inside the Underground Site Where 'Neural Networks' Churn Out Fake IDs" (2024-02-05, the OnlyFake demonstration, operator claims, pricing, country coverage)
- **OECD.AI incident registry**: "AI-Generated Fake IDs Bypass Crypto Exchange KYC Checks" (indexed 2024-02-05) — https://oecd.ai/en/incidents/2024-02-05-37e8
- **Decrypt (secondary)**: "People Are Using Basic AI to Bypass KYC — But Should You?" (2024-02) — https://decrypt.co/216188/ai-generated-fake-id-bypass-kyc-aml-banks-crypto-onlyfakes
- **Benzinga / Nasdaq (secondary)**: "AI-Generated Fake IDs Bypass Crypto Exchange KYC Checks, OKX Says Industry-Wide Issue" (2024-02) — https://www.nasdaq.com/articles/ai-generated-fake-ids-bypass-crypto-exchange-kyc-checks-okx-says-industry-wide-issue
- **AInvest (secondary, statistical aggregation)**: "Deepfake Fraud: $897M Trail and Crypto Market Risk" (2026-04, deepfake-driven fraud losses, identity-verification statistics, regulatory penalties aggregated) — https://www.ainvest.com/news/deepfake-fraud-897m-trail-crypto-market-risk-2604/
- **Signicat (industry statistics)**: 2,137% rise in deepfake fraud attempts over three years — https://www.signicat.com/press-releases/fraud-attempts-with-deepfakes-have-increased-by-2137-over-the-last-three-year

---

## 9. About distribution

Lemma Critical Brief is a threat intelligence brief published by Lemma. It is structured analysis of public information — not an audit, assessment, or recommendation directed at any specific organization. For decision-support use, please consult your Lemma Critical contact directly.

[Book a Discovery Call →](https://tally.so/r/Pd2Rl5)
[Download the whitepaper →](https://tally.so/r/7RJXdR)
[Subscribe to the newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
