---
brief_no: 34
title: "eKYC の顔認証を破る道具が Telegram で売られていた：仮想カメラで録画や合成の映像を差し込み、銀行・取引所のライブネス検査を通す(MIT Technology Review 調査) — 届いた映像が、実在のカメラでその場で撮られたかを確かめる層が無い"
title_en: "Tools to defeat eKYC face checks were on sale on Telegram: a virtual camera slips recorded or synthetic video into bank and exchange liveness checks (MIT Technology Review investigation) — No layer checks that the video came from a real camera, live"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-04-15
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["084-hong-kong-deepfake-video-call-fraud", "022-onlyfake-ai-id-kyc-bypass", "013-coinbase-kyc-insider-breach"]
version: "2.0"
status: published
og_lead_ja: "eKYC の顔認証を破る道具が Telegram で販売、仮想カメラで映像を差し替え"
og_lead_en: "eKYC face-check bypass kits sold on Telegram swap in fake camera video"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · なりすまし"
og_kicker_en: "CYBERATTACK · IMPERSONATION"
og_headline_ja: "本人確認のカメラの映像を、\n録画や合成に差し替える\n道具が売られていた。\n<accent>22 の Telegram チャネルで販売</accent>"
og_headline_en: "Kits that swap the ID-check camera feed for fake video were on sale.\n<accent>22 Telegram channels selling them.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
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
  quote: "Video that reached the app was accepted as the person's face without checking it came from a real camera, live."
industries: ["finance"]
operations: ["account-admin"]
controls:
  - slug: "ownership-check"
    item: "Check the video was taken live by a real camera"
  - slug: "hold-unverified"
    item: "Don't open the account if the video's origin can't be checked"
attack_method: "impersonation"
impact: "Bypass kits sold in 22 Telegram channels and groups"
takeaway: "Nothing checked that video reaching the app was taken live by a real camera."
self_check: "If the face video in your ID check were swapped for a recording or a deepfake, would you catch it before opening the account?"
countries: ["global"]
---

> **Revision (v2.0 / 2026-10-21)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". Facts were re-checked against the MIT Technology Review article. Removed price ranges the article does not give, and a "deepfakes are 11% of fraud" figure whose source could not be confirmed. "Rooted Android" was changed to match the article (offers to jailbreak phones). Added the FinCEN alert, Japan's rule change and iProov's test.

## 1. TL;DR

Over a two-month investigation, MIT Technology Review found 22 public Telegram channels and groups selling kits that defeat the face liveness checks in banks' and crypto exchanges' online identity verification (eKYC), along with stolen biometric data, and reported it in April 2026. The core tool is a virtual camera, which swaps the phone's camera feed for prepared recorded or synthetic (deepfake) video. Binance, Spain's BBVA and the UK's Revolut were named as targets.

To the app, the swapped video arrives by the same route as a real camera's. However much the content looks like the person, it cannot show whether it was taken live by a real camera.

The firms are aware of such attempts and detection of synthetic traces is improving, yet in iProov's test a virtual-camera swap on a non-rooted Android phone went unnoticed by the liveness check. What failed was the layer that checks that video reaching the app was taken live by a real camera.

## 2. What happened

- **Investigation**: MIT Technology Review spent two months in early 2026 and reported on April 15. In 22 public Telegram channels and groups in Chinese, Vietnamese and English, it found bypass kits and stolen biometric data on sale.
- **Tools**: Virtual cameras (swapping the camera feed for video or photos of a real or synthetic person); code known as a "hooking framework" injected into a financial institution's app so that opening the camera triggers the virtual camera; offers to jailbreak phones; and mixes of stolen biometrics and deepfakes.
- **Targets**: Binance, a major crypto exchange, Spain's BBVA and the UK's Revolut were named on the channels.
- **Firms' response**: All three said they were aware of such bypasses and called them an industry-wide challenge. Binance said it had seen attempts and prevented them. BBVA and Revolut declined to comment on whether their safeguards had been breached.
- **Harm**: The number of victims and success rates are not known. Telegram removed the channels and groups the reporter flagged for violating its terms, but similar ones remain.
- **Scale**: iProov reports virtual-camera attacks in 2024 were about 25 times the 2023 level (up 2,665%).

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">How a virtual-camera swap works</span></div>
<p class="rx-ex-cap">How the kits on sale are used, and the flow shown in iProov's test. The point to stop it is ③: check, separately from the video, that it came from a real camera.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Seller</div><div class="no">1</div><b>Sells virtual cameras and stolen biometric data on Telegram</b><p>Jailbreaking offered too.</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">2</div><b>Prepares video of someone else's face, or synthetic video</b><p>From stolen data or public photos.</p></div>
<div class="rx-step crit"><div class="who">Virtual camera</div><div class="no">3</div><b>Swaps the feed of the camera the app opened</b><p>It arrives by the same route as a real camera's.</p></div>
<div class="rx-step crit"><div class="who">ID check</div><div class="no">4</div><b>Judges it "the live person" and opens the account</b><p>Accounts serve as mule accounts or to move money.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2024-06-18**: Japan's government adopts a comprehensive anti-fraud package: remote identity checks are to be unified, in principle, on the My Number Card's public certificate, and methods that send images of a driving licence or similar are to be abolished.
- **2024-11-13**: The US FinCEN issues an alert on deepfake fraud targeting financial institutions, listing red flags such as using a third-party webcam plugin during a live verification check.
- **2025-02-27**: iProov reports virtual-camera attacks up 2,665% on 2023.
- **2025-06-24**: Japan promulgates an amended rule under its anti-money-laundering act. Remote checks that send a photo image (the "ho" method and others) can no longer be used from 2027-04-01.
- **2025-10-10**: Hong Kong police announce 22 arrests in a group that used AI to put faces onto photos from lost ID cards, passed online identity checks and opened bank accounts.
- **2025-12-16**: iProov's test is published in MITRE ATLAS: on non-rooted Android, a virtual-camera app and face swap passed a liveness check.
- **2026-04-15**: MIT Technology Review reports its investigation of 22 Telegram channels and groups.

> Facts rest on MIT Technology Review's investigation and on disclosures by FinCEN, the Japanese government, iProov and others. This is not one company's incident but an investigation of a market in kits. The number of victims and success rates have not been disclosed.

### After disclosure

- **Telegram**: Removed the channels and groups the reporter flagged for violating its terms. Similar ones remain.
- **Binance**: Said it had seen bypass attempts and prevented them, and that some services selling bypasses are themselves scams.

## 4. Why it wasn't stopped

This case was not a failure of face-matching accuracy or of the kind of liveness prompt. Video reaching the app was taken to be shot live by a real camera, and its origin was never checked.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof works before the account opens; detection works after synthetic traces or fraudulent transactions surface. In between, the video received is treated as the live person.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Check the video arrived live from a real camera</div>
<div class="rx-zone gapz"><b>The gap</b><span>The account opened.<br>The fake shows only after use</span></div>
<div class="rx-zone det"><b>Detection layer · improving</b>Spot synthetic traces or odd transactions</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>The video is swapped</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>The ID check passes</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>The account is used</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Anomaly noticed</b></div>
</div>
</figure>

Detection is getting stronger. But detecting synthetic traces is a race against the tools that make them, and what it cannot tell apart gets through. "The video looks like the person" and "the video was taken live by a real camera" are separate facts, and the second cannot be checked from the video's content; that distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in the [Hong Kong deepfake meeting fraud](/critical/briefs/084-hong-kong-deepfake-video-call-fraud/) (a recording of familiar faces and voices became the grounds for a payment instruction).

## 5. How to counter this

**Check where the video came from, not what it shows.** Confirm, separately from the video, that the device and app are genuine and that the video arrived live from a real camera. In Japan, from April 2027 remote checks that send a photo image can no longer be used, and reading the My Number Card's IC chip becomes the main method: regulation, too, is moving away from relying on how an image looks.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Banks, crypto exchanges, payment apps and others that open accounts online. Accounts opened this way serve as mule accounts or to move money.
- **Operation · Accounts & permissions**: Opening accounts and registering new devices. Both use face video as proof of the person.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Face matching (against the ID photo) | Ineffective | Stolen or synthetic faces are prepared to match the document photo. |
| Movement prompts (turn head, blink) | Partial | They stop a plain recording, but synthetic video can respond to them. |
| Detecting synthetic traces | Partial | It stops what it can tell apart, but it is a race against the tools. |
| IC-chip reading, public certificate | Partial | Checks the person without relying on face video. Passes if the card and PIN are stolen together. |

### What is needed

1. **Check the video's origin separately from the video.** Use device attestation and similar means to check that the device and app are untampered and that the camera feed has not passed through a virtual camera or hooking. If that cannot be confirmed, do not pass the check however natural the video looks.
2. **Add checks that don't rely on video.** In Japan, move to IC-chip reading or the public certificate. Send applicants to extra checks on red flags such as wanting to switch communication methods mid-check, citing glitches.
3. **Record what was checked before letting it through.** Keep the result of the origin check and the decision in a form that can later be shown to a third party: in other words, as proof.

### Checklist

Three things to confirm in your organisation about online identity checks

- Do you have a way to tell when ID-check video comes from a virtual camera?
- Do you have a plan to move off methods that rely on a photo image alone?
- If signs of fraud appear just after an account opens, such as large transactions in a short time, is there a procedure to redo the identity check?

Note: if the device itself is in the attacker's hands, the origin check can be broken too. Tighter checks also mean more legitimate users giving up partway. The number of victims of these kits has not been disclosed; this Brief rests on the market's existence and the technique shown in testing.

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
