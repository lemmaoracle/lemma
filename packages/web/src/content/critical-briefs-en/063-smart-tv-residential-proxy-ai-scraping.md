---
brief_no: 63
title: "Bright Data SDK：家庭のスマートテレビなどが、AI 学習向けスクレイピングの中継ノードにされていると報告された(Include Security の解析)"
title_en: "Bright Data SDK: Researchers report it turns devices, including living-room smart TVs, into relay nodes for AI scraping (Include Security)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["training-data-provenance"]
incident_date: 2026-06-05
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["008-discord-scraping", "036-commonpool-training-data-pii", "011-synthid-watermark-reverse-engineering"]
status: published
gate: "intake"
version: "1.0"
og_lead_ja: "Bright Data の SDK が家庭のテレビなどを AI スクレイピングの中継ノードにすると、Include Security が解析"
og_lead_en: "Include Security reports Bright Data's SDK turns devices, including smart TVs, into AI-scraping relay nodes"
search_title: "Bright Data SDK：テレビが AI 収集の中継に"
search_description: "無料アプリに組み込まれた Bright Data の SDK が、スマートテレビなどを AI 向けスクレイピングの中継ノードにしていると研究者が報告した（Include Security）。何が起きたか、なぜ見分けにくいか、対策を整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "AI の事例 · 学習データの出所"
og_kicker_en: "AI CASE · TRAINING-DATA ORIGIN"
og_headline_ja: "家庭のテレビが、\nAI 収集の中継に\nされていると報告。\n<accent>設定は月 200GB まで</accent>"
og_headline_en: "Living-room TVs relay\nAI scraping, study says.\n<accent>Up to 200 GB a month.</accent>"
key_figures:
  - value: "200"
    unit: "GB/month"
    label: "Relay cap allowed by the SDK configuration in the Roku app Petflix, whose consent screen says \"sometimes\" (Include Security analysis)"
    tone: "alert"
  - value: "400M+"
    unit: "IPs"
    label: "Residential IPs Bright Data advertises for its residential proxy network (the company's description)"
  - value: "150M+"
    unit: "IPs"
    label: "IPs the company describes as \"consent-based\" (the company's description)"
glossary:
  - term: "Residential proxy"
    desc: "A setup that relays traffic to other sites through the IP address of a home connection. To the receiving site, it looks like ordinary household use."
  - term: "Exit node (relay node)"
    desc: "The device in a residential proxy network that actually sends traffic out to other sites. Here, devices running apps that embed the SDK are said to play that role."
  - term: "SDK"
    desc: "A third-party component that app developers build into their apps. It runs inside the app, using the same device and connection as the app."
insight:
  slug: "consent-label-not-behavior"
  label: "The consent label versus the behavior it allows"
  quote: "If consent is accepted on the wording of a screen alone, nothing checks whether the actual behavior falls within it, and whoever receives the collected data cannot tell its origin or consent."
industries: ["ai", "developers"]
controls:
  - slug: "check-origin"
    item: "Confirm the source and collection route of data before it is taken in for AI training"
  - slug: "hold-unverified"
    item: "Exclude data whose source and consent cannot be confirmed before it is taken in"
impact: "Household devices were reported to be used as relay nodes for scraping sold to the AI industry"
takeaway: "According to the analysis, the consent screen said \"sometimes\" while the SDK configuration allowed 200 GB of relaying a month. Check data's origin and consent before taking it into AI training."
self_check: "Before data is taken into AI training, do you check where it came from and under what consent it was collected?"
countries: ["global"]
---

## 1. Summary

According to the researchers' analysis, an SDK embedded in free apps turned devices, including always-on smart TVs, into exit nodes relaying scraping for the AI industry from a household's connection. Consent is taken on an opt-in screen in a free app, but what the screen says and what the SDK configuration allows are said not to match. Collection from residential IPs is hard to tell apart from ordinary household use, and whoever receives the collected data sees neither its origin nor its consent. <strong>If consent is accepted on the wording of a screen alone, nothing checks whether the actual behavior falls within it, and whoever receives the collected data cannot tell its origin or consent.</strong>

## 2. What got through

- **What got through**: Household devices fetching other sites' pages (relaying scraping), and the results being supplied as data for the AI industry. The analysis shows that on app launch the SDK connects to Bright Data's servers and takes instructions, after which the servers can have it fetch other sites' pages over the household connection (Include Security).
- **What reaches the receiving side**: Scraped sites generally receive requests that look like ordinary traffic from a home IP address. The peer channel carrying relay jobs is said to lack meaningful authentication, to bypass a configured VPN on iOS, and largely not to appear in ordinary app-monitoring tools (Include Security). Whoever receives the collected data gets scraping results sourced from residential IPs, not whose data was gathered or under what consent.
- **Not disclosed**: Which apps on the public partner list contain the SDK today (the researchers caution that being listed shows only a past collaboration). Which organizations used the relayed data for AI training. Bright Data's view on the analysis is not included in this Brief's sources.

## 3. Pre-execution check

The condition that holds whatever the route is this: before data is taken into AI training, check from which source, under which consent and over which path it was collected, separately from what the collector declares.

- **Who approves**: The owner of the connection and device. Consent needs to be given for the behavior actually allowed (volume, time, purpose), not for the wording on a screen. The record of the data's origin and consent is issued at collection time by whoever carried out the collection.
- **Where the check happens**: Just before the collected data is taken into AI training. Data whose origin and consent record cannot be checked is not taken in.
- **What remains**: A record of which data intake rested on which origin and consent record, in a form that shows such a record exists without handing over details of an individual's device or behavior.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">A pre-execution check means checking the origin and consent record of data before it is taken into AI training, and keeping a record. Detection means finding out afterwards that relaying and collection are running; here, the researchers' analysis did that. The date is the date the analysis was published.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the data's origin and consent record before intake</div>
<div class="rx-zone gapz"><b>What was reported</b><span>The consent screen says "sometimes";<br>the SDK allows up to 200 GB a month</span></div>
<div class="rx-zone det"><b>Detection · the researchers' analysis worked</b>Analyze the SDK and show how to block it</div>
<div class="rx-g g1"><div class="t">CONSENT</div><b>Consent taken on a free app's opt-in screen</b></div>
<div class="rx-g g2"><div class="t">RELAY</div><b>Other sites fetched over the home connection on server instruction</b></div>
<div class="rx-g g3"><div class="t">SUPPLY</div><b>Results from residential IPs go to the AI industry</b></div>
<div class="rx-g g4"><div class="t">06-05</div><b>Include Security and Buchodi publish the analysis</b></div>
</div>
</figure>

The analysis and the blocking measures showed concretely that household devices were being used as relays, but they found this after relaying and collection had run. Other cases where the look of being public or consented was decoupled from a checkable origin are [Discord scraping](/critical/briefs/008-discord-scraping/) (public is not consent) and [personal data in CommonPool's training data](/critical/briefs/036-commonpool-training-data-pii/) (origin and consent were not checked at collection). Origin markers that are not fixed in an independently checkable form also echo [the SynthID watermark analysis](/critical/briefs/011-synthid-watermark-reverse-engineering/).

## 4. What Lemma does

**Lemma builds the check in section 3 into the point just before data is taken into AI training.** It does not find relaying devices or block traffic; it checks, before intake, whether the data carries a checkable record of its origin and consent.

### Industries and operations to watch

- **Industry · AI**: Organizations that gather or buy AI-training data through scraping or from outside collection vendors.
- **Industry · Developers**: Developers who build third-party SDKs that use users' connections or bandwidth into free apps.

### Current controls vs Lemma

The route in this case spans both columns. Column 1 is relaying over a household device's connection; column 2 is taking the data collected through that relaying into AI training.

| Control | Relaying on household devices | Taking data into AI training |
| --- | --- | --- |
| Opt-in consent screen | Partial | Not relevant |
| DNS-level blocking | Partial | Not relevant |
| Platform restrictions on background proxy SDKs | Partial | Not relevant |
| **Lemma (pre-execution check)** | Not relevant | Effective |

According to the analysis, the consent screen does take consent, but what it says does not match what the SDK configuration allows. The researchers offered DNS-level blocking, but on a mobile connection the traffic bypasses office Wi-Fi, so network blocking alone cannot fully catch it. Google, Amazon and Roku restricted background proxy SDKs, but Samsung's Tizen and LG's webOS remain listed as targets. All of these act on the relaying side and do not touch intake by whoever receives the data. Lemma checks the origin and consent record of data before intake, but does not stop the relaying on household devices itself.

Note: Lemma's check works only when it is built in just before data is taken into AI training and the origin and consent record is issued and managed at collection time, separately from the side taking the data in. If what the record says differs from the actual collection, the data passes this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and it does not delete collected data.

### Checklist

Three items to confirm for data taken into AI training and SDKs built into apps

- For data you gather or buy from outside, are you told which connections and devices it was collected from?
- Do you have a step that stops data whose origin and consent cannot be confirmed before it is taken in?
- Do you know how much of users' connection and bandwidth the third-party SDKs in your apps use, and have you confirmed that it matches what the consent screen says?

## 5. Facts and timeline

- **Service**: The SDK Bright Data embeds in free consumer apps, and the residential proxy network that uses it. Bright Data is the successor to Luminati; it advertises 400M+ residential IPs, part of whose supply derives from this SDK (the company describes a "consent-based 150M+ IP" pool).
- **Analysis**: Include Security and the independent researcher Buchodi reverse-engineered iOS `brdsdk.framework` v1.532.120, including 30 days of observation via TLS interception, and documented the mechanism that turns devices into exit nodes for the web-scraping business Bright Data sells to the AI industry.
- **What was found**: The peer channel carrying relay jobs lacks meaningful authentication (described as "weaker than most malware"). On iOS, that traffic bypasses a configured VPN and largely does not appear in ordinary app-monitoring tools. Unless the battery is low, it keeps relaying in the background even while the user is watching or on a call (Include Security analysis).
- **Consent screen and configuration**: The Roku app Petflix says it will be used "sometimes," while the SDK configuration permits up to 200 GB a month (with higher caps in some countries, such as Uzbekistan and Oman). The SDK is said to be able to bundle one person's phone and PC running the same vendor's apps as a single user.
- **Reach to smart TVs**: Based on Bright Data's platform support, public partner list and prior reporting. The deepest technical evidence is for the iOS SDK.

### Timeline

- **2015**: Bright Data's predecessor Luminati (out of Hola VPN) is noted to have sold free users' bandwidth as exit nodes at $20/GB.
- **2025-10**: Krebs on Security reports that botnet-sourced proxies such as Aisuru underpin large-scale AI data collection (the device-hijacking side).
- **2026-01**: Google dismantles the criminal proxy network IPIDEA.
- **2026-02**: Lowpass (distributed by The Verge) reports the smart-TV angle first.
- **2026-06-05**: Include Security and Buchodi publish the technical analysis of the iOS SDK.
- **2026-06-06**: The Hacker News reports it.
- **After**: Google, Amazon and Roku restrict background proxy SDKs and Bright Data withdraws from those platforms. Samsung's Tizen and LG's webOS remain listed as targets.

> The facts here rest on the analysis by Include Security and Buchodi and on reporting about it. The mechanism and behavior are the researchers' findings; the IP counts and the "consent-based" description are Bright Data's. Bright Data publishes a partner list, but the researchers caution that "being listed only indicates a past collaboration and does not mean the app currently contains the SDK," and this Brief makes no assertion about individual apps. What has not been disclosed does not mean no controls were in place.

### Response after disclosure

- **Platforms · the vendor**: Google, Amazon and Roku restricted background proxy SDKs and Bright Data withdrew from those platforms (Samsung Tizen and LG webOS remain listed).
- **Researchers**: Offered DNS-level blocking, while noting that on a mobile connection the traffic bypasses office Wi-Fi, so network blocking alone cannot fully catch it.
- **The meaning of consent**: The difference between device-hijacking botnet proxies (Aisuru, IPIDEA and others) and vendor proxies that claim opt-in consent lies in consent, but when the screen and the actual behavior do not match, whether that consent is meaningful remains an open question.
- **A cross-industry issue**: Because anti-bot measures reject datacenter IPs, AI scraping is shifting to residential connections. A demand is emerging across the AI-training-data supply chain to check, at the moment of collection, the origin and consent of collected data and the provenance of the relaying that carried it out.

## 6. Sources

- **Include Security (primary, technical analysis)**: "The Smart TV in Your Living Room Is a Node in the AI-Scraping Economy" (2026-06-05, reverse engineering of the iOS SDK) — <https://blog.includesecurity.com/2026/06/the-smart-tv-in-your-livingroom-is-a-node-in-the-aiscraping-economy/>
- **The Hacker News**: "Free Apps Are Quietly Turning Smart TVs Into Web-Scraping Proxies for AI" (2026-06-06) — <https://thehackernews.com/2026/06/free-apps-are-quietly-turning-smart-tvs.html>
- **Lowpass (distributed by The Verge)**: prior reporting on smart TVs × web-scraping proxy networks (2026-02) — <https://www.lowpass.cc/p/smart-tv-web-scraping-ai-bright-data-proxy-networks>
- **Krebs on Security**: "Aisuru Botnet Shifts from DDoS to Residential Proxies" (2025-10, the context of residential proxies underpinning AI data collection) — <https://krebsonsecurity.com/2025/10/aisuru-botnet-shifts-from-ddos-to-residential-proxies/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
