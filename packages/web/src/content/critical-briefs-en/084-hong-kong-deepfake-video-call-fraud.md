---
brief_no: 84
title: "香港ディープフェイク会議詐欺（Arup）：英国本社の CFO と同僚を装った録画のビデオ会議を信じ、財務担当者が約 HK$2 億を 15 回に分けて送金した(香港政府の立法会答弁・Arup 確認) — 送金の指示が本物かを、指示が届いたのとは別の経路で確かめる手順が無い"
title_en: "Hong Kong deepfake meeting fraud (Arup): trusting a pre-recorded video call that faked the UK CFO and colleagues, a finance employee sent about HK$200 million in 15 transfers (Hong Kong government LegCo reply, Arup confirmation) — Nothing confirms a payment instruction through a channel other than the one it came in on"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2024-01-29
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["034-ekyc-liveness-bypass", "032-booking-payout-account-tampering", "050-grok-deepfake-consent-provenance"]
status: published
version: "2.0"
og_lead_ja: "香港ディープフェイク会議詐欺：偽の CFO の指示で約 HK$2 億を送金（Arup）"
og_lead_en: "Hong Kong deepfake meeting fraud: a fake CFO's instruction moved HK$200M (Arup)"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · なりすまし"
og_kicker_en: "CYBERATTACK · IMPERSONATION"
og_headline_ja: "本社の CFO と同僚を\n偽の映像で装い、\n送金を指示した。\n<accent>約 HK$2 億を送金</accent>"
og_headline_en: "Fake video of the CFO and colleagues ordered the transfers.\n<accent>About HK$200M sent.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
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
  quote: "A meeting full of familiar faces and voices was taken as proof that a payment instruction was genuine."
industries: ["finance"]
operations: ["approval", "payment-change"]
controls:
  - slug: "separate-approval"
    item: "Confirm a transfer instruction with the person through a channel other than the meeting"
  - slug: "hold-unverified"
    item: "Hold the transfer until the person has confirmed it"
attack_method: "impersonation"
impact: "About HK$200M sent to five accounts in 15 transfers"
takeaway: "Nothing confirmed a payment instruction in a manager's name through a separate channel before the money moved."
self_check: "If a payment instruction in a manager's name came over a video call, could you confirm it with them another way before paying?"
---

> **Revision (v2.0 / 2026-10-21)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". Facts were re-checked against the Hong Kong government's Legislative Council reply. Corrected: the video call was a pre-recorded fake with no dialogue, not a "real-time conversation"; there were 15 transfers; and police disclosed the case on February 2.

## 1. TL;DR

In January 2024, a finance employee at the Hong Kong office of UK engineering firm Arup, acting on instructions in the name of the UK head-office CFO, sent about HK$200 million (about US$25.6 million) to five accounts in 15 transfers over one week. What made the instructions believable was a video call showing the CFO and colleagues; everyone on screen was a fake built from publicly posted video and audio. Hong Kong police disclosed the case on February 2, and Arup confirmed it was the victim in May.

The employee suspected the first message was phishing, but a meeting full of familiar faces and voices dispelled the doubt. The call was pre-recorded with no dialogue; the fake CFO ended it on a pretext, and later instructions came by messaging app and other channels.

The employee spotted the fraud by checking with head office, but only after 15 transfers had gone through. What failed was the layer that confirms a payment instruction is genuine, through a channel other than the one it came in on, before it is carried out.

## 2. What happened

- **Who**: A finance employee at the Hong Kong office of Arup, a major UK engineering firm. The instructions came in the name of the UK head-office CFO.
- **Loss**: About HK$200 million (about US$25.6 million), sent in 15 transfers to five Hong Kong bank accounts within one week.
- **How**: In mid-January a message in the CFO's name proposed a "secret transaction". The employee was suspicious, but the CFO and colleagues appeared on a video call the employee was invited to, and all of them were fakes. Police said it was a recording made from video and audio posted on YouTube and elsewhere, with no dialogue with the employee. The fake CFO ended the meeting on a pretext and continued the instructions by messaging app, email and one-to-one video calls.
- **Discovery**: The employee checked with the UK head office. The case was reported to police on January 29.
- **Internal systems**: Arup said none of its internal systems were compromised and its finances and operations were not affected. Its CIO later called it "technology-enhanced social engineering".
- **Investigation**: Still under investigation as of June 2024 (LegCo reply). As of October 2026, no arrests or recovery of funds in this case have been reported.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, as far as disclosed</span></div>
<p class="rx-ex-cap">The point to stop it was between ③ and ④: after the meeting dispelled the doubt, and before the first transfer, there was a chance to confirm with head office through a channel other than the meeting.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Attacker</div><div class="no">1</div><b>Builds fake video of the CFO and colleagues from public video and audio</b><p>Material from YouTube and elsewhere.</p></div>
<div class="rx-step"><div class="who">Attacker posing as the CFO</div><div class="no">2</div><b>Sends a message about a "secret transaction"</b><p>The employee suspects phishing.</p></div>
<div class="rx-step crit"><div class="who">Fake CFO and colleagues</div><div class="no">3</div><b>Order the transfers on a pre-recorded video call</b><p>No dialogue; the meeting ends on a pretext.</p></div>
<div class="rx-step crit"><div class="who">Employee</div><div class="no">4</div><b>Makes 15 transfers to five accounts in a week</b><p>Instructions continue by messaging app and more.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2024-01 (mid)**: A message in the name of the UK head-office CFO reaches the employee. It is about a secret transaction, and the employee suspects phishing.
- **The following week**: The employee joins the video call and, following instructions, makes 15 transfers to five accounts.
- **2024-01-29**: After checking with head office, the employee realises it is a fraud and the case is reported to police.
- **2024-02-02**: Hong Kong police's Cyber Security and Technology Crime Bureau (CSTCB) discloses the case at a briefing, without naming the company.
- **2024-05-16**: Arup confirms to CNN and others that it was the victim: "fake voices and images were used".
- **2024-06-26**: Hong Kong's Secretary for Security answers in the Legislative Council: the meeting was pre-recorded with no interaction, and the case is under investigation.

> Facts rest on the Hong Kong government's Legislative Council reply (primary), Arup's statement and its CIO's interview, and reporting of the police briefing. The date of the video call has not been disclosed, and reports differ on how many people appeared in it.

### After disclosure

- **Hong Kong police**: Advised testing a suspicious video call by asking the person to move their head or by probing with questions, and calling to check when a relative or friend asks for money (LegCo reply).
- **Arup**: Said attacks such as invoice fraud, phishing, WhatsApp voice spoofing and deepfakes were rising in number and sophistication.

## 4. Why it wasn't stopped

This case was not a failure of the employee's care or of the meeting software. The payment instruction was checked only inside the channels it arrived through (the messages and the meeting), and those channels were fake end to end.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof works before a transfer is made; detection works after the fraud surfaces. In between, the faces and voices seen on the call are treated as the reason to believe the instruction.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Before paying, confirm the instruction through a channel other than the meeting</div>
<div class="rx-zone gapz"><b>The gap</b><span>15 transfers went through.<br>Head office not yet asked</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>Check with head office and find the fraud</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>A fake meeting dispels the doubt</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>15 transfers go through</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Head office check reveals it</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Reported to police</b></div>
</div>
</figure>

Detection worked: the employee doubted the first message and in the end found the fraud by checking with head office. But that check came after the transfers, and although "I saw the CFO on a call" and "the CFO ordered this transfer" are separate facts, the first was accepted as grounds for the second. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [eKYC liveness bypass](/critical/briefs/034-ekyc-liveness-bypass/) (fabricated video passing an identity check).

## 5. How to counter this

**Confirm a payment instruction through a channel other than the one it arrived on, before paying.** However good fake video gets, confirming with the person on a contact registered in advance tells you whether the instruction is genuine regardless of the video. Make it a rule that this check is never skipped, least of all for large transactions or instructions labelled "secret" or "urgent".

### Industries and operations to watch

- **Industry · Finance & FinTech**: Finance and accounting teams that can be told to pay by an overseas head office or parent company. The more executives' video and voice are public through talks and social media, the more raw material there is for fakes.
- **Operation · Approval & sign-off**: Paying on the strength of a manager's instruction or approval. Here, seeming to meet the instructing person on a call stood in for approval.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Caution about suspicious messages | Partial | The employee doubted the first message, but the following meeting dispelled the doubt. |
| Confirming with a manager on a video call | Ineffective | The meeting used to confirm was itself fake video and voices. |
| Approval by more than one person | Partial | It still passes if approvers rely on the same meeting or the same channel's instructions. |
| Checking with head office | Partial | It revealed the fraud, but only after the transfers. |

### What is needed

1. **Confirm with the person through a separate channel.** Call back on a phone number or account registered in advance, such as the internal directory. Contacts given in the instruction, or checks inside the same meeting or chat, do not count.
2. **Hold the transfer until it is confirmed.** Transfers that meet set conditions, such as amount or a new payee, are not made until the check is done. Treat "secret" and "urgent" as reasons to hold.
3. **Record who confirmed, and through which channel.** For each transfer, record who checked, the channel and the time, in a form that can later be shown to a third party: in other words, as proof.

### Checklist

Three things to confirm in your organisation about payment instructions from managers or head office

- Is there a set procedure to confirm a payment instruction in a manager's name with them through a separate channel?
- Is that check impossible to skip, whatever the amount or a "secret" label?
- When an employee doubts an instruction, is it clear who they can stop and consult?

Note: if the registered contact itself is hijacked, the separate-channel check passes too. The extra step also delays urgent legitimate payments. The police's spotting tips (asking the person to move, testing with conversation) work against recorded fakes, but video generation keeps improving, so spotting alone cannot be relied on.

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
