---
brief_no: 71
title: "DJI ROMO：1 つの認証済みの接続で、他人のロボット掃除機のカメラ・マイクに届いたと研究者が報告した(研究者の報告・Malwarebytes)"
title_en: "DJI ROMO: A researcher reported that one authenticated connection reached other people's robot vacuum cameras and microphones (researcher's report, Malwarebytes)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-02-17
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["070-unitree-shared-key-robot-identity", "068-universal-robots-polyscope-command-injection", "057-deepseek-clickhouse-exposed-db", "006-google-api-key-revocation-lag", "052-discord-age-verification-id-leak"]
status: published
gate: "permission-change"
version: "1.0"
og_lead_ja: "DJI ROMO：研究者の 1 つの接続に、約 7,000 台のロボット掃除機が応答したと報じられた"
og_lead_en: "DJI ROMO: about 7,000 robot vacuums reportedly responded to one researcher's connection"
layout: "report"
sections: "proof"
og_kicker_ja: "脆弱性の報告 · 家庭用ロボット"
og_kicker_en: "VULNERABILITY · HOME ROBOTS"
og_headline_ja: "研究者の 1 つの接続に\n他人の機体が応答したと報告\n<accent>約 7,000 台・24 か国以上</accent>"
og_headline_en: "One login reached\nothers' robot vacuums,\na researcher reports.\n<accent>~7,000 units, 24+ countries</accent>"
key_figures:
  - value: "~7,000"
    unit: "units"
    label: "ROMO units reported to have responded to one researcher's connection (Malwarebytes and others)"
    tone: "alert"
  - value: "24+"
    unit: "countries"
    label: "Countries where responding units were located (Malwarebytes)"
  - value: "02-08 → 02-10"
    label: "According to reports, from DJI's initial fix to its supplementary fix"
glossary:
  - term: "MQTT broker"
    desc: "A server that relays messages between devices and apps. Devices publish data to destinations called topics, and apps subscribe to topics to receive it."
  - term: "ACL (access control list)"
    desc: "A list that sets which parties may subscribe or publish to which topics."
  - term: "Authentication vs authorization"
    desc: "Authentication confirms who the connecting party is. Authorization decides what that party is allowed to do, and on which unit."
insight:
  slug: "authenticated-not-authorized-per-device"
  label: "Authenticated, but no per-unit authorization"
  quote: "Authenticating a connection without checking which unit it may see lets one connection reach every unit."
industries: ["manufacturing"]
operations: ["data-access"]
controls:
  - slug: "ownership-check"
    item: "Confirm the party subscribing to a unit's feed actually owns that unit"
takeaway: "One authenticated connection was reportedly able to subscribe to other units' video and audio. Before handing over data, check that the party holds permission for that unit."
self_check: "For devices with cameras or microphones, have you confirmed with the vendor that its cloud never hands a user data from other users' units?"
countries: ["global"]
---

## 1. Summary

The researcher reportedly did nothing more than connect to the cloud as a user, with an app he had built to drive his own unit. Authentication passed, but, according to the technical writeup, which units' data a connection could receive was not separated per unit. Fixes were rolled out, but some reported issues were said to be still unpatched at the time of reporting. <strong>Authenticating a connection without checking which unit it may see lets one connection reach every unit.</strong>

## 2. What got through

- **What got through**: Subscribing to unit topics over one authenticated connection. Malwarebytes explained that the MQTT broker had no topic ACL, so an authenticated connection, bound to no specific unit, could also subscribe to other units' topics.
- **What reached the receiving side**: In general, a broker that allows subscriptions on authentication alone receives the owner's subscription and an unrelated user's subscription as the same "authenticated subscription." According to the researcher's report, live camera video, microphone audio and floor-map data from each unit were reachable by an unrelated user's connection.
- **Not disclosed**: Whether anyone other than the researcher received other people's unit data by the same route, and whether there is a record of which connection received what (the reports we consulted do not say).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that the side handing over unit data checks, before handing it over, whether the receiving party is one the unit's owner has permitted.

- **Who approves**: The unit's owner (the user), who permits, unit by unit, which accounts or devices may view it. The vendor provides a way to issue that permission per unit.
- **Where it is checked**: The part of the cloud that relays a unit's video, audio, floor maps and commands (such as the MQTT broker). Before a subscription or command, it checks that the party holds permission for that unit, and does not pass subscriptions that lack it. Having passed authentication is not enough on its own.
- **What is recorded**: Which party received which data from which unit, under which permission.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before handing over video and audio, that the party holds permission for that unit. Detection means noticing afterwards that other people's units were reachable. The dates below are the reported fix and report dates, not when other people's units became reachable.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before a subscription, check that the party holds permission for that unit</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>One authenticated connection received<br>other units' video and audio (researcher's report)</span></div>
<div class="rx-zone det"><b>Detection · partial</b>The researcher found it; DJI rolled out fixes</div>
<div class="rx-g g1"><div class="t">2026-02</div><b>Researcher finds it and tells DJI</b></div>
<div class="rx-g g2"><div class="t">02-08</div><b>DJI rolls out an initial fix</b></div>
<div class="rx-g g3"><div class="t">02-10</div><b>DJI completes a supplementary fix</b></div>
<div class="rx-g g4"><div class="t">02-17</div><b>Press reports</b></div>
</div>
</figure>

The researcher found and reported it, and DJI rolled out fixes. But fixes come after discovery, and video and audio that have already been delivered cannot be taken back. Similar cases are the [DeepSeek database](/critical/briefs/057-deepseek-clickhouse-exposed-db/) (an unauthenticated database was exposed, so reaching it meant reading it) and [Unitree's robots](/critical/briefs/070-unitree-shared-key-robot-identity/) (every unit used the same key, with no per-unit key).

## 4. What Lemma does

**Lemma builds the pre-execution check into the part of the cloud that relays a unit's video, audio and commands.** It does not look for intrusions; it checks, before handing over data, that the subscribing party holds permission from that unit's owner.

### Industries and operations to watch

- **Industry · Manufacturing & critical infrastructure**: Organizations that build appliances or robots with cameras and microphones and deliver their video and audio to users through the cloud.
- **Operation · Lookup & data access**: Making a unit's video, audio and floor-map data viewable from the user's app. How far an authenticated party's access extends across units is the deciding point.

### Current controls vs Lemma

The route in this case is column 2 (subscribing to other units' video, audio and floor maps). Column 1, connecting to the cloud, is what the researcher did for his own unit, and authentication passed.

| Control | Connecting to the cloud | Subscribing to other units' video, audio and floor maps |
| --- | --- | --- |
| User authentication | Effective | Not effective |
| Broker topic ACL | Not relevant | Effective |
| After-the-fact log analysis | Not relevant | Partial |
| **Lemma (pre-execution check)** | Not relevant | Effective |

User authentication confirms who the connecting party is, but does not decide which units that party may see. A broker topic ACL limits which topics each party can subscribe to; Malwarebytes explained that there was none. After-the-fact log analysis can, in general, reconstruct which connection subscribed to which topic, but cannot take back video and audio already delivered. Lemma checks, before a subscription, that the party holds permission issued by that unit's owner, and records that the check was made.

Note: Lemma's check works only where the vendor builds it into the part that relays a unit's video and audio, and makes owner permission issuable per unit. It passes if the owner's device or account, or the permission itself, is stolen. Other reported routes, such as the camera PIN bypass, each need their own fix. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that build or deploy connected devices

- Does your product's cloud limit the units a connected party can subscribe to or control to the units that party is permitted to use?
- Do you record which party received video or audio from which unit?
- Do you have a channel for vulnerability reports from outside researchers, and a procedure for shipping fixes?

## 5. Facts and timeline

- **Target**: DJI's ROMO robot vacuum, with its units, phone app and cloud backend. Placed in homes, it handles a camera, a microphone and floor maps.
- **Discovery**: Researcher Sammy Azdoufal. While analyzing the app's communications with AI coding tools in order to drive his own ROMO with a PS5 controller, he reportedly noticed that when his homemade app connected to DJI's backend, many other units responded. He told DJI via The Verge.
- **What was confirmed (researcher's report)**: About 7,000 ROMO units (in at least 24 countries) responded, and live camera video, microphone audio and floor-map data were reachable by an unrelated user.
- **What it required**: Not owning individual units, but being able to connect to the backend as an "authenticated client."
- **Explanation of the cause**: Malwarebytes explained that the MQTT broker had no topic ACL, so an authenticated connection, bound to no specific unit, could subscribe to any unit's topics.

### Timeline

- **2026-02**: The researcher notices that many other units respond to his homemade app's connection, and tells DJI via The Verge.
- **2026-02-08**: According to reports, DJI rolls out an initial fix.
- **2026-02-10**: According to reports, DJI completes a supplementary fix.
- **2026-02-17**: Malwarebytes and DroneXL report.
- **2026-02-24**: PetaPixel reports.
- **2026-03-10**: DroneDJ reports the fix and the bounty.

> The facts here rest on Malwarebytes' technical writeup and on reporting by PetaPixel, DroneXL and DroneDJ. This is a researcher's discovery and disclosure; this Brief blames neither a malicious actor nor the manufacturer. Scale and fix dates are stated as reported. The use of AI coding tools is a fact about the analysis method; this Brief's concern is how per-unit authorization was separated. What has not been disclosed does not mean no controls existed.

### Response after disclosure

- **DJI**: According to reports, it resolved the ROMO MQTT broker's authorization-validation issue with an initial fix on 2026-02-08 and a supplementary fix on 02-10, and paid the finder a $30,000 bounty (for one finding).
- **Remaining issues**: Some reported issues, including a camera-feed PIN bypass, were said to be still unpatched at the time of reporting (Malwarebytes, DroneXL).

## 6. Sources

- **Malwarebytes (technical writeup)**: "Hobby coder accidentally creates vacuum robot army" (2026-02-17; MQTT broker with no topic ACL = an authenticated client subscribes to other units, ~7,000 units / 24 countries, some issues unpatched) — <https://www.malwarebytes.com/blog/news/2026/02/hobby-coder-accidentally-creates-vacuum-robot-army>
- **PetaPixel**: "Someone Remotely Accessed the Cameras in 7,000 DJI Robot Vacuums" (2026-02-24) — <https://petapixel.com/2026/02/24/someone-remotely-accessed-the-cameras-in-7000-dji-robot-vacuums/>
- **DroneXL**: "DJI ROMO Security Breach: Researcher Remotely Accessed 7,000 Home Cameras — And One Hole Remains" (2026-02-17) — <https://dronexl.co/2026/02/17/dji-romo-security-breach/>
- **DroneDJ**: "DJI fixes ROMO security bug that exposed thousands of homes" (2026-03-10, fix and bounty) — <https://dronedj.com/2026/03/10/dji-romo-security-bug-bounty/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
