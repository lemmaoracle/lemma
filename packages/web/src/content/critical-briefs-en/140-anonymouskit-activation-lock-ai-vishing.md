---
brief_no: 140
title: "AnonyMousKIT：AI 音声エージェントが「Apple サポート」を装い、盗難 iPhone の所有者から解除用パスコードを聞き出していた — パスコードを言えることが、所有者である証明として扱われている"
title_en: "AnonyMousKIT: AI voice agents posing as 'Apple Support' extracted unlock passcodes from stolen-iPhone owners — being able to state the passcode is treated as proof of ownership"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth]
incident_date: 2026-08-24
published: 2026-09-01
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["051-instagram-ai-support-takeover", "047-openclaw-agent-phishing", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "AnonyMousKIT、AI 音声で盗難 iPhone 所有者から解除コード聴取"
og_lead_en: "AnonyMousKIT: AI voice calls harvest stolen-iPhone passcodes"
---

## 1. TL;DR

On August 24, 2026, SOCRadar published an inside-out analysis of AnonyMousKIT, an AI-powered phishing-as-a-service platform built to defeat Activation Lock on stolen iPhones. A single resold codebase drives AI voice agents that pose as "Apple Support" to harvest unlock passcodes and two-factor codes. A flaw on the operators' own side exposed their logs, so detection worked. **What was missing was a layer that independently verifies, before an unlock, whether a caller claiming to be Apple actually is Apple.**

## 2. What happened

- SOCRadar Threat Research Unit (STRU) published its analysis of AnonyMousKIT's internals on 2026-08-24.
- The target is Apple's Activation Lock, introduced in iOS 7, which ties a device to its owner's Apple ID the moment Find My is enabled and renders a stolen device worthless without it.
- A single panel codebase is resold across 506 domains and 168 storefront brands — a reseller ecosystem rather than a single attacker. A scan of the 506-domain family found 41 live backends exposing these logs, across 30 distinct installations on 42 domains; 318 domains are offline or sinkholed and 188 remain live.
- A coding flaw on the operators' own side — bare relative paths that resolve to the web root — exposed production logs, letting STRU examine backend source code and months of operational logs directly. Every deployment of that codebase inherits the flaw.
- The AI voice channel is the second best-documented vector after email. From the operators' account on the commercial voice platform Vapi, researchers recovered 200 call records, 55 conversation transcripts, and five configured personas. 179 of the 200 calls (90%) went to numbers in Brazil, and 178 used the Portuguese persona. The total cost was $19.24 — about 9.6 cents per call. The median call ran 22 seconds.
- Channels are priced separately: email at 1.50 credits, SMS per sender ID, a recorded voice call at 1 credit, and an AI voice agent at 2 credits.

The attack proceeds in seven stages.

1. Profile the stolen device's model and Find My status (online/locked).
2. Log the victim's name, phone number, device model, and tracking link in the panel, drawn from the contact details Lost Mode displays.
3. Deliver a lure via email, SMS, WhatsApp, recorded audio, or AI voice.
4. The victim interacts with a spoofed map showing the device's supposed location.
5. Harvest the four- or six-digit passcode, Apple ID, and six-digit two-factor code. The AI agent opens by confirming ownership, has the victim read out the passcode and reads the digits back, then moves into a story about someone bringing the device to an Apple Store.
6. Exfiltrate the harvested data to the panel and to Telegram.
7. Use the credentials to disable Activation Lock and resell the device.

## 3. Timeline — disclosure and response

- 2024-02: The panel codebase is first observed, traced back via a shared admin library hash on URLScan.
- 2025-03: AI personas are built in English, Spanish, and Brazilian Portuguese.
- 2025-08-31: The first AI voice call is recorded — the start of the 200-call log.
- 2026-05-30: The last AI voice call is recorded.
- 2026-07-30: The last email is logged in the exposed SMTP log.
- 2026-07-31 to 08-04: STRU obtains the victim-facing kit and confirms the panel is active, connecting the panel logs to the capture page.
- 2026-08-10: The last day of operator activity visible in panel logs. SOCRadar states the platform is live and operational as of that date.
- 2026-08-24: SOCRadar publishes its analysis.

> The figures in this brief come from SOCRadar's self-published report, based on direct access to the operators' exposed logs and panel source code. The report itself gives the persona naming two ways: its timeline says all five share the same translated identity, "Alice from Apple Support," while its persona section says the three voice options share "Alice Dias, Apple Support." The divergence in secondary accounts follows from each outlet quoting one of the two. **Success rates warrant care.** The report's outcome column assigns all 200 calls to hung up, silence timeout, no answer, or platform error, and no count of captured credentials appears for any channel. For the one published transcript, however, the report states that the passcode was extracted and verified during the call. This brief treats that individual capture as fact; the overall success rate across the 200 calls is not published. No Apple statement on this matter could be confirmed at the time of writing.

Response and developments:

- SOCRadar published indicators of compromise alongside its analysis, sharing the findings as threat intelligence.
- BleepingComputer, Help Net Security, and The Hacker News covered the report the same week.
- The Hacker News noting that neither the report nor the companies involved have said whether the Vapi account was reported to Vapi or remains active. The platform itself, SOCRadar says, was live on the last day of collection (2026-08-10), and it continues to track it.

## 4. Why it wasn't stopped

This incident's failure is neither a break in Apple's cryptographic authentication nor a design flaw in Activation Lock itself. **Neither victims nor the call and delivery channels independently verified whether the party on the other end of a phone call, email, or WhatsApp message was actually "Apple Support" — a victim simply stating the passcode aloud was treated as proof of ownership.**

Detection worked. SOCRadar exploited an implementation flaw on the operators' own side to examine logs directly, surfacing call scripts, persona configurations, and victim data in full. What was missing sat one step earlier: verifying whether a caller claiming to be Apple actually is Apple.

> "When we realised the iPhone 16 Pro Max was in lost mode, we had to retain it for security reasons and open a recovery case. Did you receive a text message with a security link to recover your device?" — from a recovered call transcript. SOCRadar writes that in this call the software extracted and verified the passcode for roughly ten cents.

What AI voice agents changed was not whether verification existed, but the cost of impersonation. Renting a commercial voice-AI service to build a persona made it possible to reproduce a natural-sounding conversation for roughly ten cents a call, automating and scaling — across languages and regions — a form of social engineering that once required manual labor. That 179 of the 200 calls went to Brazil shows the scaling can be aimed at a chosen region. A passcode is proof of knowledge, meant to be one part of an authentication a genuine owner performs with a legitimate counterpart. But over a channel where the counterpart's identity is unverified, that knowledge is treated as grounds for an unlock action regardless of who it was actually disclosed to.

The same shape appears where an AI support flow granted account changes without independently verifying ownership in [Brief 051](/critical/briefs/051-instagram-ai-support-takeover/), and where credentials left an organization before the sender was verified in [Brief 047](/critical/briefs/047-openclaw-agent-phishing/).

## 5. What proof would have changed

Proof before the action replaces "the caller could state the passcode" with "the disclosure could be verified as a response to a legitimate request from a verified party" as the basis for an unlock or account change. It does not stop impersonation from being generated. It keeps a successful impersonation from turning into an unlock.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Proof of caller identity</strong>: give the recipient an independently verifiable channel to confirm the identity of anyone claiming to be support — grounded in a checkable proof rather than a claimed name.</li>
<li><strong>Binding the context of disclosure</strong>: ground the disclosure of credentials (passcodes, two-factor codes) in an independent cross-check against a legitimate channel, not a verbal confirmation in the moment.</li>
<li><strong>Provenance of the action</strong>: record the provenance of an unlock or account change, tied to the verification process that authorized it.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>It does not recover stolen devices or take down phishing infrastructure. That is law enforcement's work.</li>
<li>It does not detect or block the generation of voice-AI impersonation, and assumes the cost of generating it keeps falling.</li>
<li>Proof can show that a disclosure was a response to a verified party; it cannot show whether the owner handed the credential to a third party themselves.</li>
</ul>

The difference from a call log is here: the record remains after the call, but it is not material for deciding, at the moment of disclosure, whether the credential should have been given to that caller.

Detection and this layer are complementary, not substitutes. The former surfaces the phishing infrastructure and reduces the number of paths; the latter makes "no unlock until the caller's identity is verified" something you can check before the next persona is stood up.

## 6. Sources

- **SOCRadar Threat Research Unit (primary, self-published research)**: "Exposing AnonyMousKIT: AI-Powered PhaaS Supply Chain" (2026-08-24) — <https://socradar.io/blog/anonymouskit-ai-phaas-supply-chain/> (the origin blocks automated retrieval; archived copy: <http://web.archive.org/web/20260829120403/https://socradar.io/blog/anonymouskit-ai-phaas-supply-chain/>)
- **The Hacker News (independent)**: "Fake Apple Support AI Calls Target Stolen-Device Owners for Passcodes and 2FA Codes" (2026-08) — <https://thehackernews.com/2026/08/fake-apple-support-ai-calls-target.html>
- **BleepingComputer (independent)**: "AnonyMousKIT PhaaS uses voice AI agents to phish iPhone passcodes" — <https://www.bleepingcomputer.com/news/security/anonymouskit-phaas-uses-voice-ai-agents-to-phish-iphone-passcodes/>
- **Help Net Security (independent)**: "AnonyMousKIT phishing-as-a-service uses AI voice calls to steal iPhone passcodes" (2026-08-26) — <https://www.helpnetsecurity.com/2026/08/26/anonymouskit-phishing-stolen-iphone/>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving attributes, see [Pillar 04 — Regulatory Attribute Proof](/pillars/#attribute).

Figures come from SOCRadar's self-published report and were cross-checked against three independent outlets. The platform was reported live on the report's last day of collection (2026-08-10); its status since then, and any Apple response, are unpublished as of writing.
