---
brief_no: 34
title: "ライブ生体認証が「注入された映像」に突破された — KYC は本人の生体を確認したと信じたが、撮影の来歴は検証されなかった"
title_en: "Live Biometric Verification Defeated by an Injected Video Feed — KYC Believed It Had Captured a Live Person, But the Provenance of the Capture Was Never Verified"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-04-15
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["022-onlyfake-ai-id-kyc-bypass", "012-williams-frt-wrongful-arrest", "013-coinbase-kyc-insider-breach"]
version: "1.0"
status: published
og_lead_ja: "ライブ生体認証が注入映像に突破された — eKYC liveness"
og_lead_en: "Live biometric verification defeated by an injected video feed — eKYC"
gap_detected: "Detection models that spot synthetic video (deepfakes), multi-layered liveness, and monitoring of fraud patterns are being continuously strengthened."
gap_missing: "There was no layer to confirm the capture's origin — whether the video was captured on the spot from a real camera and not swapped out — so injected video passed straight through on the same path as legitimate camera footage."
gap_fix: "Rather than whether the video looks authentic, independently verify with Lemma that the video carries provenance of being captured live from a real sensor, and prevent it up front."
---

## TL;DR

MIT Technology Review found off-the-shelf tools — virtual cameras, deepfakes, stolen biometric bundles — that defeat banks' and exchanges' facial liveness checks, sold openly on Telegram. Deepfake detection keeps improving, but if it cannot judge a feed synthetic, the attribute is established anyway. What was missing was independent verification of capture provenance — that the video was live-captured from a real sensor, not injected — so injected video arrived over a legitimate camera feed's path. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident overview

- **Target**: eKYC / facial liveness checks at banks, crypto exchanges, and payment apps (Binance, BBVA, Revolut, and others named explicitly)
- **Disclosure**: 2026-04-15, investigative reporting by MIT Technology Review (Biometric Update and others reported the same month)
- **Scale**: 22 public Telegram channels/groups operating in Chinese, Vietnamese, and English openly sell KYC-bypass tools
- **Tools sold**:
  - Virtual camera (VCam): injects pre-recorded / AI-generated video into the device's camera feed to pass liveness prompts like "turn your head"
  - Stolen biometric bundles: selfie videos, ID-document scans, proof of address, and phone numbers packaged by country
  - Deepfake generators / hooking frameworks: on rooted Android, intercept the camera API calls inside the target banking app
- **Pricing (observed in early 2026)**: a basic VCam Android build at ~$30–$60, stolen-ID bundles at $100–$300, and "VIP" custom deepfakes tailored to a specific institution's liveness flow at $500–$2,000
- **Context**: Sumsub's tally puts deepfakes at 11% of all fraud in 2026 (up from 7% in 2024). This is not a one-off incident but the visualization of a commercialized KYC-bypass ecosystem.
- **Core**: a liveness check trusted the attribute "the face on camera is a real biometric" without verifying the provenance of the capture feed, so injected video passed straight through on the same path as legitimate camera footage

---

## 2. Chain of events

(This is investigative reporting on a commercial tool market, not a single incident at one company. The confirmed structure is recorded below.)

- 2014–ongoing: facial liveness checks become standard in bank and exchange onboarding (selfie video + active liveness like "turn your head")
- Early 2026: a market for VCam, deepfakes, hooking frameworks, and stolen biometric bundles is observed on Telegram
- 2026-04-15: MIT Technology Review investigates and publishes the market of 22 channels, naming Binance, BBVA, Revolut, and others as targets
- Same month: Biometric Update and others follow with reporting; Sumsub reports the rising fraud share of deepfakes

> Note: proper names and CVEs are based on primary sources (research institutions, GitHub Advisory, NVD, etc.); each implementation's remediation status varies by point in time, so consult the latest information. This is investigative reporting / demonstration of a commercial tool market; it does not assert per-institution victim counts or success rates, and does not exaggerate effect beyond the existence of the tools.

---

## 3. Attack vector

1. **Obtain biometric material**: acquire stolen or AI-generated selfie videos and ID documents in country bundles
2. **Spoof the capture feed**: use VCam software to inject a pre-recorded / deepfake video into the device's camera feed, or use a hooking framework on rooted Android to intercept the banking app's camera API calls
3. **Pass the liveness prompts**: respond to active liveness ("turn your head," "blink") with injected video / real-time deepfake
4. **Forge the attribute**: the verifier judges that it has "confirmed a live, genuine biometric," and identity as a regulatory attribute is established
5. **Fraudulent account opening / takeover**: open an account with the fake verification, or register a device on an existing account to move funds

---

## 4. Structural analysis

This case is anchored in the `attribute-proof-bypass` category of Pillar 04 (Regulatory Attribute Proof) and also intersects Pillar 02 (Verifiable AI). Secondary categories are `ai-decision-integrity` (the verifying AI cannot distinguish an injected feed from a real one) and `identity-auth`.

The central **failure primitive is "a liveness check trusts the attribute that the face on camera is a real biometric present here and now, without verifying the provenance of the capture feed."** What the verifier sees is a "processed camera feed," and whether it was live-captured from a real sensor, injected by a VCam, or swapped via an API hook cannot be told from the feed's content. The authenticity of the attribute (the person's biometric) is decoupled from the provenance of the capture (proof of live capture from a real biometric).

This is the same lineage as Brief 022 (OnlyFake, defeating KYC with AI-generated static ID documents) — "looks right but the provenance is fake" — but it goes a step further: this case targets **live video / biometrics rather than a static document**, showing that even "dynamic verification" like active liveness cannot substitute for provenance. It shares a root with Brief 012 (a facial-recognition AI decision feeding directly into an administrative action with no independent verification): when a biometric AI decision lacks independent verification, it leads directly to serious consequences. The divergence "looks genuine to both the human operator and the verifying AI, but the provenance is fake" is also the biometric/video version of Brief 005 (Noroboto, the divergence between what a human and an AI see).

---

## 5. The detection–proof gap

Advancing deepfake-detection models, layering liveness, monitoring fraud patterns, and taking down Telegram channels are indispensable for deterring harm; this Brief does not dispute that role. The detection side is being continuously strengthened.

But detection does not change "on what basis the verifier accepts the video it receives as a 'live, genuine person'" itself. From the verifier's side, VCam injection and API hooks arrive over the same path as a legitimate camera feed. Deepfake detection becomes a perpetual cat-and-mouse with rising generation quality, and if detection cannot judge "this is synthetic," the attribute is established anyway. What was missing is independent verification that "this video was live-captured from a real sensor and has not been injected or swapped" — the provenance of the capture, a different track from synthesis detection. For regulation (KYC/AML), too, there is little independent trail beyond the verification log to later prove "was this identity check based on a real biometric?"

Pre-execution attestation inverts liveness from "judging whether the video looks genuine" to "provenance proof that the capture was live-acquired from a real sensor and not tampered with or injected." Through device and capture-path attestation, if the feed's provenance cannot be proven, the identity check does not hold no matter how natural the video looks. Deepfake detection (the detection-style "is this synthetic?") and pre-execution proof of capture provenance ("is this a live capture from a real biometric?") are not substitutes but **complements**.

For the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and industry context

- **MIT Technology Review / Biometric Update**: visualized the commercialized KYC-bypass market (VCam, deepfakes, hooking, stolen biometric bundles) and presented target institutions and price ranges
- **Cross-industry**: even "dynamic verification" via active liveness (turn your head, blink) can be defeated by injection unless the provenance of the capture feed is verified. Because advancing deepfake detection alone becomes a perpetual cat-and-mouse, the argument is advancing to shift the center of gravity of identity-verification design toward proving "the provenance of live capture" via capture-path and device attestation. Because biometrics cannot be reissued, the circulation of stolen biometric bundles leaves long-term risk.

The need to "prove identity as the provenance of the capture rather than the appearance of the video" is expected to be re-recognized across finance, fintech, and exchanges in the wake of this case.

---

## 7. Lemma's analysis

Against the structure exposed here (identity as a regulatory attribute is accepted on the appearance of the video without verifying the provenance of the capture), Lemma proposes a design that inverts identity verification from "judging whether the video looks genuine" to "independent verification of the provenance that the capture was live-acquired from a real sensor."

- **Invert appearance into provenance**: shift identity verification from "does the video look genuine?" to independent verification of "does the capture carry provenance of being live-acquired from a real sensor?"
- **Capture-path and device attestation**: prove the feed's provenance via device and capture-path attestation, cutting off VCam injection and API-hook swaps at the provenance stage.
- **Block in advance on missing provenance**: no matter how natural the feed, if the proof of capture provenance does not hold, do not establish the attribute and reject the identity check in advance.
- **Complement to detection**: place deepfake detection (synthetic or not) and pre-execution proof of capture provenance (live-captured or not) side by side as separate tracks, not relying on a cat-and-mouse race.

If the proof of capture provenance does not hold, the attribute is not established, and detection is complemented by proof beforehand. Read together with Brief 022 (OnlyFake) as the "looks right but the provenance is fake" lineage.

For the design and its scope, see [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/regulatory-attribute-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **MIT Technology Review**: "Cyberscammers are bypassing banks' security with illicit tools sold on Telegram" (2026-04-15; the market of 22 channels, tools, target institutions, pricing) — https://www.technologyreview.com/2026/04/15/1135898/cyberscammers-bypassing-bank-telegram/
- **Biometric Update**: "KYC bypass tools sold on Telegram to defeat biometric checks" (2026-04) — https://www.biometricupdate.com/202604/kyc-bypass-tools-sold-on-telegram-to-defeat-biometric-checks

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
