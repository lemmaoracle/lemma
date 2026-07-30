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
gap_detected: "Deepfake detection, image forensics, and injection detection did actually stop many of the fraudulent attempts."
gap_missing: "There was no layer to cryptographically confirm before account opening whether each ID was genuine and actually issued by the issuer, so images that merely looked authentic passed straight through."
gap_fix: "Before account opening, independently verify with Lemma that the identity attribute was legitimately issued as a signed credential from the issuer, and prevent it up front."
---

## 1. TL;DR

In February 2024, 404 Media reported that a UK passport image from the fake-ID service "OnlyFake" cleared the KYC check at the major crypto exchange OKX. KYC review only judges whether an ID image looks authentic; it never verifies that the issuer actually issued the document. Strengthening detection is an arms race with the generative side and cannot answer whether an image came from a genuine issuer. What is missing is a layer that cryptographically verifies the issuer signature before account opening.

---

## 2. What happened

- **Demonstration report**: 2024-02-05, 404 Media reported that an OnlyFake-generated UK passport image cleared OKX's KYC. The case is also indexed in the OECD.AI incident registry
- **Service offering**: USD 15 per ID. Covers 26 countries including the US, Canada, the UK, Australia, and EU member states. Buyer specifies name, date of birth, address, expiry, and signature; even the "shot lying on a carpet" texture commonly used in KYC capture is reproduced
- **Metadata spoofing**: EXIF spoofing for capture device, timestamp, and GPS is supported
- **Operator claims**: An anonymous operator (self-styled "John Wick") claimed the service could clear KYC at major exchanges and crypto-friendly neobanks. They described the pipeline as a "neural network." (404 Media explicitly noted it could not verify the AI-use claim itself; the price point, however, points at automated generation)
- **Target-side framing**: OKX framed the case as industry-wide rather than as a single-firm problem

The incident came together as the following chain.

1. **Document image generation**: an attacker uses OnlyFake or a similar service to generate a photorealistic ID image with the desired name and attributes at low cost. Capture conditions and metadata are spoofed as well
2. **Clearing document review**: the generated image is submitted to the KYC flow. Document review judges the "look" of the image (template fit, texture, internal consistency) — it does not cryptographically verify that the issuer actually issued the document
3. **Clearing biometric review**: face swap plus camera injection defeats selfie matching and liveness checks. As long as both KYC pillars — document and biometric — are judging "the look of the presented artifact," progress on the generative side translates directly into bypass rate
4. **Attribute acquisition**: the regulatory attribute "cleared KYC" is conferred and the account is opened. From that point onward, the attribute is accepted downstream as the precondition for trades and transfers
5. **Impact realization**: the fraudulent account is used for fraud or money laundering. The operator faces after-the-fact monitoring and regulatory exposure, and onboarding gaps surface as AML/KYC fines

---

## 3. Timeline — disclosure and response

- 2024-02-05: 404 Media publishes the OnlyFake demonstration report. The OKX KYC bypass is confirmed
- 2024-02: Industry press follows. OKX frames the case as industry-wide. OECD.AI indexes the incident in its registry
- 2025: The World Economic Forum and others document attack chains combining AI-generated documents, face swap, and camera injection that defeat both document and biometric checks
- 2025: Identity-verification industry statistics report a 2,137% rise in deepfake-related fraud attempts over three years, with about one in twenty identity-verification failures reported to be deepfake-related
- H1 2025: Reported deepfake-driven fraud losses reach roughly USD 410 million in a half-year. Regulatory fines for AML/KYC violations also rise sharply

> Note: proper names and CVEs are based on primary sources (research institutions, GitHub Advisory, NVD, etc.); each implementation's remediation status varies over time, so consult the latest information. This case is a researcher/press demonstration report, not a specific incident of realized harm — do not overstate it.

The response and industry movement after disclosure:

- **Target side**: OKX framed the case as industry-wide. Identity-verification vendors continued to strengthen deepfake and injection detection while reporting that the underlying generative-vs-detection arms race remains a structural feature
- **International bodies / industry statistics**: WEF and others documented attack chains combining AI-generated documents, face swap, and camera injection. Deepfake-related fraud attempts were reported to be up 2,137% over three years, with about one in twenty identity-verification failures in 2025 reported to be deepfake-related
- **Shift in regulatory center of gravity**: Penalties for AML/KYC violations continued to harden, and onboarding-stage identity-verification gaps became a primary reason for enforcement action. In parallel, an institutional shift toward identity verification grounded in issuer-signed digital credentials with selective disclosure — exemplified by the EU's eIDAS 2.0 and the EUDI Wallet — has begun, so a structural transition from "review the image" to "verify the proof" is now under way on the regulatory side as well

The absence of a layer that cryptographically verifies the issuer of the evidence at the moment of onboarding is surfacing not as a single-firm problem but as a cross-industry operational challenge in finance and identity verification.

---

## 4. Why it wasn't stopped

The central **failure primitive is "a regulatory attribute — 'cleared KYC' — is built on top of evidence (an image) whose issuer cannot be verified."** What the document review actually checks is not the document but its image; the substance of the review is a "looks-plausible" judgment. Disconnected from the cryptographic fact of an issuer signature, this review stops functioning as attribute proof at the moment the cost of producing a "convincing image" collapses.

Convincing-looking ≠ issued

Briefs 019 (worker qualification), 020 (product conformity) and 021 (asset existence) surfaced as insider data tampering and false reporting. This case is their counterpart: **an external attacker exploited the same detection–proof gap — an attribute assertion decoupled from the layer that would verify it.** That the gap is the same shows the answer is not "more rigorous review of the presented artifact" but "add the verification layer." Through the lens of AI-generated content provenance, this case also sits adjacent to [Brief 011](/critical/briefs/011-synthid-watermark-reverse-engineering/) (SynthID watermark reverse engineering).

The industry's initial response to this case is to strengthen detection. Deepfake detection, image forensics, and injection detection actually stop a large share of fraud attempts, and this Brief does not dispute the role of the detection layer. Detection remains essential as the layer that lowers bypass rate and raises attacker cost.

Detection, however, cannot itself answer the question "did the presented image capture a document the issuer actually issued?" What detection scores is the presence or absence of generation artifacts; the generative side and the detection side are structurally locked in an arms race. No matter how high the detection rate climbs, it is a probabilistic score — not, on its own, material that proves in regulatory reporting, administrative procedure, or litigation that "this account was opened through legitimate identity verification." This is a structurally independent gap beyond detection's reach.

As things stand, across the operating model for identity verification, issuer verification of the presented evidence is not yet treated as a distinct layer. Pre-execution attestation closes the gap by inserting one step of issuer-signed attribute proof into the onboarding path. When the object of review shifts from "image" to "proof," progress on the generative side no longer translates into bypass rate. Pre-execution attestation complements detection rather than replacing it; together the two layers establish the trust boundary for identity verification.

---

## 5. What proof would have changed

For the detection–proof gap exposed here — a regulatory attribute for identity verification built on top of image evidence whose issuer cannot be verified — Lemma offers a design in which identity verification shifts from "image review" to "cryptographic verification of an issuer-signed credential," so the verifying side can confirm that "the requirements are satisfied" without receiving the original data.

- **Issuer-signed credentials**: governments, issuing authorities, and verified IdPs issue subject attributes with an issuer signature. What gets verified is not the look of an image but the cryptographic fact of the issuer's signature
- **Selective disclosure**: BBS+ over BLS12-381 discloses only what the regulation requires — "over 18," "not on the sanctions list," "cleared KYC" — never the original ID or the full attribute set
- **Validity and revocation**: committed with Poseidon over BN254; validity and non-revocation proven with Groth16 (Circom circuits); bound to the original via docHash so revocation (withdrawal, expiry) is tracked

A proof fixed at the point of onboarding then functions, years later when "was this account opened through legitimate identity verification?" is asked, as an independently verifiable trail that discloses no original data. Detection (deepfake detection, after-the-fact monitoring) raises attacker cost and serves remediation after disclosure; pre-execution attestation (issuer verification) serves independent verification of attribute legitimacy — complementary layers.

Data doesn't move. Proofs do.

---

## 6. Sources

- **404 Media (primary)**: "Inside the Underground Site Where 'Neural Networks' Churn Out Fake IDs" (2024-02-05, the OnlyFake demonstration, operator claims, pricing, country coverage)
- **OECD.AI incident registry**: "AI-Generated Fake IDs Bypass Crypto Exchange KYC Checks" (indexed 2024-02-05) — https://oecd.ai/en/incidents/2024-02-05-37e8
- **Decrypt (secondary)**: "People Are Using Basic AI to Bypass KYC — But Should You?" (2024-02) — https://decrypt.co/216188/ai-generated-fake-id-bypass-kyc-aml-banks-crypto-onlyfakes
- **Benzinga / Nasdaq (secondary)**: "AI-Generated Fake IDs Bypass Crypto Exchange KYC Checks, OKX Says Industry-Wide Issue" (2024-02) — https://www.nasdaq.com/articles/ai-generated-fake-ids-bypass-crypto-exchange-kyc-checks-okx-says-industry-wide-issue
- **AInvest (secondary, statistical aggregation)**: "Deepfake Fraud: $897M Trail and Crypto Market Risk" (2026-04, deepfake-driven fraud losses, identity-verification statistics, regulatory penalties aggregated) — https://www.ainvest.com/news/deepfake-fraud-897m-trail-crypto-market-risk-2604/
- **Signicat (industry statistics)**: 2,137% rise in deepfake fraud attempts over three years — https://www.signicat.com/press-releases/fraud-attempts-with-deepfakes-have-increased-by-2137-over-the-last-three-year

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/regulatory-attribute-proof/), [Trust402](https://lemma.frame00.com/trust402/)
