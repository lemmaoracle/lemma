---
brief_no: 84
title: "香港ディープフェイク会議詐欺（Arup）：英国本社の CFO と同僚を装った録画のビデオ会議を信じ、財務担当者が約 HK$2 億を 15 回に分けて送金した(香港政府の立法会答弁・Arup 確認)"
title_en: "Hong Kong deepfake meeting fraud (Arup): trusting a pre-recorded video call that faked the UK CFO and colleagues, a finance employee sent about HK$200 million in 15 transfers (Hong Kong government LegCo reply, Arup confirmation)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2024-01-29
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["034-ekyc-liveness-bypass", "032-booking-payout-account-tampering", "050-grok-deepfake-consent-provenance"]
status: published
version: "2.1"
og_lead_ja: "香港ディープフェイク会議詐欺：偽の CFO の指示で約 HK$2 億を送金（Arup）"
og_lead_en: "Hong Kong deepfake meeting fraud: a fake CFO's instruction moved HK$200M (Arup)"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · なりすまし"
og_kicker_en: "CYBERATTACK · IMPERSONATION"
og_headline_ja: "本社の CFO と同僚を\n偽の映像で装い、\n送金を指示した。\n<accent>約 HK$2 億を送金</accent>"
og_headline_en: "Fake video of the CFO and colleagues ordered the transfers.\n<accent>About HK$200M sent.</accent>"
key_figures:
  - value: "≈ HK$200"
    unit: "million"
    label: "Sent (about US$25.6 million), on instructions in the name of the UK head-office CFO"
    tone: "alert"
  - value: "15"
    unit: "transfers"
    label: "Made within one week, to five Hong Kong bank accounts"
  - value: "01-29 → 05-16"
    label: "From the police report to Arup confirming it was the victim"
glossary:
  - term: "Deepfake"
    desc: "AI-made video or audio that imitates a real person. Publicly posted video and audio are the raw material."
  - term: "Business email compromise (BEC)"
    desc: "Fraud that poses as an executive or supplier to order a payment or a change of bank details. Here a video call was added to the email."
  - term: "Callback"
    desc: "Calling the person back on a contact registered in advance, not the one the instruction came from, to confirm it is really them."
insight:
  slug: "face-and-voice-as-approval"
  label: "Faces and voices taken as the authority"
  quote: "A meeting of familiar faces and voices does not, by itself, show that a payment instruction is genuine."
industries: ["finance"]
operations: ["approval", "payment-change"]
controls:
  - slug: "hold-unverified"
    item: "Hold the transfer until the person has confirmed it"
attack_method: "impersonation"
impact: "About HK$200M sent to five accounts in 15 transfers"
takeaway: "Nothing confirmed a payment instruction in a manager's name through a separate channel before the money moved."
self_check: "If a payment instruction in a manager's name came over a video call, could you confirm it with them another way before paying?"
countries: ["hk", "gb"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through. Facts and sources are unchanged. In v2.0 (2026-10-21) the facts were re-checked against the Hong Kong government's Legislative Council reply, correcting that the video call was a pre-recorded fake with no dialogue, that there were 15 transfers, and that police disclosed the case on February 2.

## 1. Summary

The employee suspected the first message of being phishing, but a call full of familiar faces and voices dispelled the doubt. The call was a recording with no dialogue, the fake CFO ended it on a pretext, and further instructions came by messaging app and similar channels. The employee checked with the UK head office and realised it was a fraud only after the transfers had gone through. <strong>A meeting of familiar faces and voices does not, by itself, show that a payment instruction is genuine.</strong>

## 2. What got through

- **What got through**: Transfers by a finance employee to outside bank accounts, on instructions in the name of the UK head-office CFO. They went to five Hong Kong accounts, split across one week (Hong Kong government LegCo reply).
- **What was stopped**: The employee suspected the first message of being phishing. In the end the employee checked with head office and noticed the fraud, but after the transfers.
- **What reached the receiving side**: In general, faces seen and voices heard on a video call reach a payment process as a sign that the person giving the instruction approved it. Whether the video and voices are genuine cannot be told from the meeting screen.
- **Not disclosed**: The date of the video call, and how many people appeared in it (reports differ). As of October 2026, no arrests or recovery of funds in this case have been reported.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever executes a payment checks, before it goes out, that the instruction is genuine, on a channel other than the one it came in on, through a contact registered in advance.

- **Who approves**: The person the instruction claims to come from (a manager or head office). The approval is obtained by calling back a phone number or account registered in advance, such as the internal directory. Contacts given in the instruction, or checks inside the same meeting or chat, do not count.
- **Where it is checked**: The process that executes the payment. Transfers that meet set conditions, such as amount or a new payee, are held and not made until they match the person's approval. Treat "secret" and "urgent" as reasons to hold.
- **What is recorded**: For each transfer, who confirmed it, through which channel and when, kept apart from the payment process in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming with the person, on another channel and before a payment goes out, that the instruction is genuine, and keeping a record. Detection means noticing after the fraud comes to light. The dates below are when the police and Arup confirmed or disclosed each point, not when the transfers were made.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before paying, check on a separate channel, through a registered contact</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>About HK$200M sent in 15 transfers<br>Head office was checked only afterwards</span></div>
<div class="rx-zone det"><b>Detection · noticed</b>The employee checks with head office and the fraud is found</div>
<div class="rx-g g1"><div class="t">2024-01 (mid)</div><b>Doubt dispelled by the call</b></div>
<div class="rx-g g2"><div class="t">01-29</div><b>Reported to police</b></div>
<div class="rx-g g3"><div class="t">02-02</div><b>Police disclose the case</b></div>
<div class="rx-g g4"><div class="t">05-16</div><b>Arup confirms it was the victim</b></div>
</div>
</figure>

"The CFO appeared on the call" and "the CFO ordered this payment" are separate facts. A case where a made-up video was used to get past an identity check is [the eKYC liveness bypass](/critical/briefs/034-ekyc-liveness-bypass/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that executes payments.** It does not look for intrusions; it checks, before a payment goes out, that the instruction rests on the person's approval, through a registered contact.

### Industries and operations to watch

- **Industry · Finance & accounting**: Finance and accounting teams that may be told to pay by an overseas head office or parent. The more an executive's video and voice are public from talks and social media, the more raw material exists for a fake.
- **Operation · Approval & sign-off**: Paying on the strength of a manager's instruction or approval. Here, seeming to meet the person who gave the instruction on a call stood in for approval.

### Current controls vs Lemma

The route in this case is a pre-recorded video call plus follow-up instructions by messaging app and email. Other routes (such as the registered contact itself being taken over) have not been disclosed, so they are not split into columns and are covered in the note.

| Control | Payment instruction delivered by a video call and follow-up messages (this case) |
| --- | --- |
| Caution about suspicious messages | Partial |
| Confirming with a manager on a video call | Ineffective |
| Approval by more than one person | Partial |
| Checking with head office | Partial |
| **Lemma (pre-execution check)** | Effective |

Caution about suspicious messages: the employee doubted the first message, but the following meeting dispelled the doubt. Confirming with a manager on a video call: the meeting used to confirm was itself fake video and voices. Approval by more than one person still passes if approvers rely on the same meeting or the same channel's instructions. Checking with head office revealed the fraud, but only after the transfers. Lemma checks the person's approval, through a registered contact on a channel other than the meeting, before the payment.

Note: Lemma's check works only when it is built into the process that executes payments and the contact used for approval is managed apart from the meeting and messages that carry the instruction. If the registered contact itself is hijacked, a separate-channel check passes too. The extra step also delays urgent legitimate payments. The police's spotting tips (asking the person to move, testing with conversation) work against recorded fakes, but video generation keeps improving, so spotting alone cannot be relied on. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about payment instructions from managers or head office

- Is there a set procedure to confirm a payment instruction in a manager's name with them through a separate channel?
- Is that check impossible to skip, whatever the amount or a "secret" label?
- When an employee doubts an instruction, is it clear who they can stop and consult?

## 5. Facts and timeline

- **Who**: A finance employee at the Hong Kong office of Arup, a major UK engineering firm. The instructions came in the name of the UK head-office CFO.
- **Loss**: About HK$200 million (about US$25.6 million), sent in 15 transfers to five Hong Kong bank accounts within one week.
- **How**: In mid-January a message in the CFO's name proposed a "secret transaction". The employee was suspicious, but the CFO and colleagues appeared on a video call the employee was invited to, and all of them were fakes. Police said it was a recording made from video and audio posted on YouTube and elsewhere, with no dialogue with the employee. The fake CFO ended the meeting on a pretext and continued the instructions by messaging app, email and one-to-one video calls.
- **Discovery**: The employee checked with the UK head office. The case was reported to police on January 29.
- **Internal systems**: Arup said none of its internal systems were compromised and its finances and operations were not affected. Its CIO later called it "technology-enhanced social engineering".
- **Investigation**: Still under investigation as of June 2024 (LegCo reply). As of October 2026, no arrests or recovery of funds in this case have been reported.

### Timeline

- **2024-01 (mid)**: A message in the name of the UK head-office CFO reaches the employee. It is about a secret transaction, and the employee suspects phishing.
- **The following week**: The employee joins the video call and, following instructions, makes 15 transfers to five accounts.
- **2024-01-29**: After checking with head office, the employee realises it is a fraud and the case is reported to police.
- **2024-02-02**: Hong Kong police's Cyber Security and Technology Crime Bureau (CSTCB) discloses the case at a briefing, without naming the company.
- **2024-05-16**: Arup confirms to CNN and others that it was the victim: "fake voices and images were used".
- **2024-06-26**: Hong Kong's Secretary for Security answers in the Legislative Council: the meeting was pre-recorded with no interaction, and the case is under investigation.

> Facts rest on the Hong Kong government's Legislative Council reply (primary), Arup's statement and its CIO's interview, and reporting of the police briefing. The date of the video call has not been disclosed, and reports differ on how many people appeared in it. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Hong Kong police**: Advised testing a suspicious video call by asking the person to move their head or by probing with questions, and calling to check when a relative or friend asks for money (LegCo reply).
- **Arup**: Said attacks such as invoice fraud, phishing, WhatsApp voice spoofing and deepfakes were rising in number and sophistication.

## 6. Sources

- **Hong Kong SAR Government, Security Bureau (Primary, LegCo reply)**: "LCQ9: Combating frauds involving deepfake" (2024-06-26) — <https://www.info.gov.hk/gia/general/202406/26/P2024062600192.htm>
- **World Economic Forum (Primary, Arup CIO interview)**: "'This happens more frequently than people realize': Arup chief on the lessons learned from a $25m deepfake crime" (2025-02-04) — <https://www.weforum.org/stories/2025/02/deepfake-ai-cybercrime-arup/>
- **CNN (Reporting, quotes Arup's statement)**: "Arup revealed as victim of $25 million deepfake scam involving Hong Kong employee" (2024-05-16) — <https://edition.cnn.com/2024/05/16/tech/arup-deepfake-scam-loss-hong-kong-intl-hnk>
- **Fortune (Reporting, quotes Arup's statement)**: "A deepfake 'CFO' tricked the British design firm behind the Sydney Opera House in $25 million fraud" (2024-05-17) — <https://fortune.com/europe/2024/05/17/arup-deepfake-fraud-scam-victim-hong-kong-25-million-cfo/>
- **The Standard (Reporting, police briefing)**: "HK's first deepfake video conference scam involving HK$200 million" (2024-02-04) — <https://www.thestandard.com.hk/news/article/213122/HKs-first-deepfake-video-conference-scam-involving-HK200-million>
- **Hong Kong Free Press (Reporting, AFP)**: "Multinational loses HK$200 million to deepfake video scam" (2024-02-05) — <https://hongkongfp.com/2024/02/05/multinational-loses-hk200-million-to-deepfake-video-conference-scam-hong-kong-police-say/>
- **CNN (Reporting)**: "Finance worker pays out $25 million after video call with deepfake 'chief financial officer'" (2024-02-04) — <https://edition.cnn.com/2024/02/04/asia/deepfake-cfo-scam-hong-kong-intl-hnk>
- **South China Morning Post (Reporting)**: "'Everyone looked real': multinational firm's Hong Kong office loses HK$200 million after scammers stage deepfake video meeting" (2024-02-04) — <https://www.scmp.com/news/hong-kong/law-and-crime/article/3250851/everyone-looked-real-multinational-firms-hong-kong-office-loses-hk200-million-after-scammers-stage>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/)
