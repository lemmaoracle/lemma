---
brief_no: 34
title: "eKYC の顔認証を破る道具が Telegram で売られていた：仮想カメラで録画や合成の映像を差し込み、銀行・取引所のライブネス検査を通す(MIT Technology Review 調査)"
title_en: "Tools to defeat eKYC face checks were on sale on Telegram: a virtual camera slips recorded or synthetic video into bank and exchange liveness checks (MIT Technology Review investigation)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-04-15
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["084-hong-kong-deepfake-video-call-fraud", "022-onlyfake-ai-id-kyc-bypass", "013-coinbase-kyc-insider-breach"]
version: "2.1"
status: published
og_lead_ja: "eKYC の顔認証を破る道具が Telegram で販売、仮想カメラで映像を差し替え"
og_lead_en: "eKYC face-check bypass kits sold on Telegram swap in fake camera video"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · なりすまし"
og_kicker_en: "CYBERATTACK · IMPERSONATION"
og_headline_ja: "本人確認のカメラの映像を、\n録画や合成に差し替える\n道具が売られていた。\n<accent>22 の Telegram チャネルで販売</accent>"
og_headline_en: "Kits that swap the ID-check camera feed for fake video were on sale.\n<accent>22 Telegram channels selling them.</accent>"
key_figures:
  - value: "22"
    unit: "channels"
    label: "Public Telegram channels and groups selling bypass kits and stolen biometric data (Chinese, Vietnamese, English)"
    tone: "alert"
  - value: "≈ 25"
    unit: "×"
    label: "Virtual-camera attacks in 2024 versus 2023 (iProov)"
  - value: "2027-04-01"
    label: "Date Japan ends remote ID checks that send a photo image (the \"ho\" method and others)"
glossary:
  - term: "eKYC"
    desc: "Identity verification done online. A common method matches an ID document against a video of the face taken on the spot."
  - term: "Liveness check"
    desc: "A check that the person in front of the camera is there live, not a photo or recording. Many ask the user to turn their head or similar."
  - term: "Virtual camera"
    desc: "Software that hands an app prepared video or images as if they came from the real camera. To the app it is hard to tell apart from a real one."
insight:
  slug: "camera-feed-taken-as-live"
  label: "Video received is taken as the live person"
  quote: "However much the video looks like the person, whether it was taken live by a real camera cannot be told from its content."
industries: ["finance"]
operations: ["account-admin"]
controls:
  - slug: "ownership-check"
    item: "Check, separately from the video, that it was taken live by a real camera"
  - slug: "hold-unverified"
    item: "Don't open the account if the video's origin can't be checked"
attack_method: "impersonation"
impact: "Bypass kits sold in 22 Telegram channels and groups"
takeaway: "Check, separately from the video, that it was taken live by a real camera before accepting it as the person's face."
self_check: "If the face video in your ID check were swapped for a recording or a deepfake, would you catch it before opening the account?"
countries: ["global"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. In v2.0 (2026-10-21), facts were re-checked against the MIT Technology Review article, and price ranges the article does not give and a "deepfakes are 11% of fraud" figure whose source could not be confirmed were removed. Facts and sources are unchanged in v2.1.

## 1. Summary

To the app, the swapped video arrives by the same route as a real camera's. The firms are aware of such attempts and detection of synthetic traces is improving, yet in iProov's test a virtual-camera swap on a non-rooted Android phone went unnoticed by the liveness check. <strong>However much the video looks like the person, whether it was taken live by a real camera cannot be told from its content.</strong>

## 2. What got through

- **What got through**: Video swapped in by a virtual camera, entered into an eKYC liveness check. In iProov's test, a virtual-camera app and face swap on a non-rooted Android phone passed a liveness check (published in MITRE ATLAS on 2025-12-16).
- **What was stopped**: Binance said it had seen bypass attempts and prevented them (MIT Technology Review). BBVA and Revolut declined to comment on whether their safeguards had been breached.
- **What reached the receiving side**: In general, a virtual camera's video arrives at the app by the same route as a real camera's. However much the content looks like the person, it cannot be told from the content whether it was taken live by a real camera.
- **Not disclosed**: The number of victims and success rates of the kits, and whether any firm's safeguards were in fact breached.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever accepts identity-check video checks, before accepting it and separately from the video's content, that it was taken live by a real camera.

- **Who approves**: The business running the identity check. That the device and app are genuine is shown by a mechanism on the device side (device attestation or similar), and the business checks it before accepting the video. It is not something the sending side can simply declare for itself.
- **Where it is checked**: Just before the video is accepted and judged. It checks that the device and app are untampered and that the camera feed has not passed through a virtual camera or hooking. If that cannot be confirmed, the identity check is not passed, however natural the video looks.
- **What is recorded**: The result of the origin check and the decision, kept in a form that can later be shown to a third party.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before video is accepted and separately from it, that it was taken live by a real camera, and keeping a record. Detection means noticing after synthetic traces or fraudulent transactions surface. The dates below are when each firm or body confirmed or published a point, not when attacks took place.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before accepting, check the video's origin separately from the video</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Kits that swap the video were on sale<br>iProov's test passed a liveness check</span></div>
<div class="rx-zone det"><b>Detection · improving</b>Spot synthetic traces or odd transactions</div>
<div class="rx-g g1"><div class="t">2024-11-13</div><b>FinCEN alerts on deepfake fraud</b></div>
<div class="rx-g g2"><div class="t">2025-02-27</div><b>iProov reports the rise in virtual-camera attacks</b></div>
<div class="rx-g g3"><div class="t">2025-12-16</div><b>iProov's test published in MITRE ATLAS</b></div>
<div class="rx-g g4"><div class="t">2026-04-15</div><b>MIT Technology Review reports its investigation</b></div>
</div>
</figure>

Detection is getting stronger, but detecting synthetic traces is a race against the tools that make them, and what it cannot tell apart gets through. A similar case, where a recording of familiar faces and voices became the grounds for a payment instruction, is the [Hong Kong deepfake meeting fraud](/critical/briefs/084-hong-kong-deepfake-video-call-fraud/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that accepts identity-check video.** It does not look for intrusions; it checks, before the video is accepted and separately from it, that it was taken live by a real camera.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Banks, crypto exchanges, payment apps and others that open accounts online. Accounts opened this way serve as mule accounts or to move money.
- **Operation · Accounts & permissions**: Opening accounts and registering new devices. Both use face video as confirmation of the person.

### Current controls vs Lemma

The route in this case is column 1 (swapping the video with a virtual camera). Column 2 is where the device itself is in the attacker's hands; whether that applied here has not been disclosed.

| Control | Swapping the video with a virtual camera | The device itself is in the attacker's hands |
| --- | --- | --- |
| Face matching (against the ID photo) | Not effective | Not relevant |
| Movement prompts (turn head, blink) | Partial | Not relevant |
| Detecting synthetic traces | Partial | Not relevant |
| IC-chip reading, public certificate | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Not effective |

Face matching does not help, because stolen or synthetic faces are prepared to match the document photo. Movement prompts stop a plain recording, but synthetic video can respond to them. Detecting synthetic traces stops what it can tell apart, but it is a race against the tools. IC-chip reading and the public certificate check the person without relying on face video, but pass if the card and PIN are stolen together. Lemma checks the video's origin, not its content, before it is accepted.

Note: Lemma's check works only when it is built into the mechanism that accepts the video, and the device attestation comes in a form the sending side cannot declare for itself. If the device itself is in the attacker's hands, the origin check can be broken too. Tighter checks also mean more legitimate users giving up partway. The number of victims of these kits has not been disclosed; this Brief rests on the market's existence and the technique shown in testing. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about online identity checks

- Do you have a way to tell when ID-check video comes from a virtual camera?
- Do you have a plan to move off methods that rely on a photo image alone?
- If signs of fraud appear just after an account opens, such as large transactions in a short time, is there a procedure to redo the identity check?

## 5. Facts and timeline

- **Investigation**: MIT Technology Review spent two months in early 2026 and reported on April 15. In 22 public Telegram channels and groups in Chinese, Vietnamese and English, it found bypass kits and stolen biometric data on sale.
- **Tools**: Virtual cameras (swapping the camera feed for video or photos of a real or synthetic person); code known as a "hooking framework" injected into a financial institution's app so that opening the camera triggers the virtual camera; offers to jailbreak phones; and mixes of stolen biometrics and deepfakes.
- **Targets**: Binance, a major crypto exchange, Spain's BBVA and the UK's Revolut were named on the channels.
- **Firms' response**: All three said they were aware of such bypasses and called them an industry-wide challenge. Binance said it had seen attempts and prevented them. BBVA and Revolut declined to comment on whether their safeguards had been breached.
- **Harm**: The number of victims and success rates are not known. Telegram removed the channels and groups the reporter flagged for violating its terms, but similar ones remain.
- **Scale**: iProov reports virtual-camera attacks in 2024 were about 25 times the 2023 level (up 2,665%).

### Timeline

- **2024-06-18**: Japan's government adopts a comprehensive anti-fraud package: remote identity checks are to be unified, in principle, on the My Number Card's public certificate, and methods that send images of a driving licence or similar are to be abolished.
- **2024-11-13**: The US FinCEN issues an alert on deepfake fraud targeting financial institutions, listing red flags such as using a third-party webcam plugin during a live verification check.
- **2025-02-27**: iProov reports virtual-camera attacks up 2,665% on 2023.
- **2025-06-24**: Japan promulgates an amended rule under its anti-money-laundering act. Remote checks that send a photo image (the "ho" method and others) can no longer be used from 2027-04-01.
- **2025-10-10**: Hong Kong police announce 22 arrests in a group that used AI to put faces onto photos from lost ID cards, passed online identity checks and opened bank accounts.
- **2025-12-16**: iProov's test is published in MITRE ATLAS: on non-rooted Android, a virtual-camera app and face swap passed a liveness check.
- **2026-04-15**: MIT Technology Review reports its investigation of 22 Telegram channels and groups.

> Facts rest on MIT Technology Review's investigation and on disclosures by FinCEN, the Japanese government, iProov and others. This is not one company's incident but an investigation of a market in kits. The number of victims and success rates have not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Telegram**: Removed the channels and groups the reporter flagged for violating its terms. Similar ones remain.
- **Binance**: Said it had seen bypass attempts and prevented them, and that some services selling bypasses are themselves scams.

## 6. Sources

- **MIT Technology Review (Primary, original investigation)**: "Cyberscammers are bypassing banks' security with illicit tools sold on Telegram" (2026-04-15) — <https://www.technologyreview.com/2026/04/15/1135898/cyberscammers-bypassing-bank-telegram/>
- **US Treasury FinCEN (Primary, alert)**: "FinCEN Alert on Fraud Schemes Involving Deepfake Media Targeting Financial Institutions" (2024-11-13) — <https://www.fincen.gov/sites/default/files/shared/FinCEN-Alert-DeepFakes-Alert508FINAL.pdf>
- **Japan, Ministerial Council on Crime Control (Primary, government decision)**: "Comprehensive measures to protect the public from fraud" (2024-06-18, Japanese) — <https://www.cas.go.jp/jp/seisakukaigi/hanzai/kettei/240618/honbun.pdf>
- **National Police Agency JAFIC (Primary, regulation)**: Order amending the Ordinance for Enforcement of the Act on Prevention of Transfer of Criminal Proceeds (2025-06-24, Japanese) — <https://www.npa.go.jp/sosikihanzai/jafic/hourei/250624/anbun02.pdf>
- **iProov (Primary, researcher's own disclosure)**: "iProov Issues Annual Identity Verification Threat Intelligence Report" (2025-02-27) — <https://www.iproov.com/press/annual-identity-verification-threat-intelligence-report>
- **iProov (Primary, researcher's own disclosure)**: "MITRE ATLAS Publishes Critical Vulnerability in the KYC Identity Process Discovered by iProov" (2025-12-16) — <https://www.iproov.com/press/mitre-atlas-publishes-critical-vulnerability-in-the-kyc-identity-process>
- **Biometric Update (Reporting)**: "KYC bypass tools sold on Telegram to defeat biometric checks" (2026-04-17) — <https://www.biometricupdate.com/202604/kyc-bypass-tools-sold-on-telegram-to-defeat-biometric-checks>
- **The Standard (Reporting, Hong Kong police announcement)**: "Police dismantle AI-driven fraud syndicate, arresting 22" (2025-10-10) — <https://www.thestandard.com.hk/news/article/313790/Police-dismantle-AI-driven-fraud-syndicate-arresting-22>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/)
