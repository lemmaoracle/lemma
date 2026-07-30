---
brief_no: 63
title: "Bright Data SDK：家庭のテレビが、AI 学習向けスクレイピングの中継ノードにされていた — 収集データと中継トラフィックの出所・同意が、独立検証されない構造（Include Security）"
title_en: "Bright Data SDK: your living-room TV became a relay node for AI-scraping — the origin and consent of collected data and relayed traffic not independently verified (Include Security)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["training-data-provenance"]
incident_date: 2026-06-05
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["008-discord-scraping", "036-commonpool-training-data-pii", "011-synthid-watermark-reverse-engineering"]
status: published
version: "1.0"
og_lead_ja: "家庭のテレビが AI スクレイピングの中継ノードに — Bright Data SDK"
og_lead_en: "Your smart TV is a node in the AI-scraping economy — Bright Data SDK"
gap_detected: "Researchers reverse-engineered the SDK to surface how it worked and demonstrated DNS-level blocking, and platforms were later able to restrict the mechanism."
gap_missing: "There was no layer at collection time to check whether a relay truly originated from a consenting device or under what source and consent the training data was gathered, so scraping leaving home connections passed through indistinguishable from ordinary use."
gap_fix: "Before ingesting data into AI training, independently verify with Lemma that this data was gathered under a verifiable source and consent, and prevent it up front."
---

## 1. TL;DR

In June 2026, researchers reverse-engineered the SDK that data broker Bright Data embeds in free apps, showing it turns devices, including always-on smart TVs, into exit nodes relaying AI-scraping traffic from a household's IP. After-the-fact analysis, DNS blocking, and platform restrictions cannot establish under what source and consent the data was gathered; the opt-in ("used sometimes") and the behavior (200 GB/month) do not match. What is missing is a layer that fixes origin and consent to a verifiable trail at collection.

---

## 2. What happened

- **What was shown**: Researchers reverse-engineered the iOS SDK that Bright Data embeds in consumer apps and documented the mechanism that turns devices (including always-on smart TVs) into exit nodes for the web-scraping business Bright Data sells to the AI industry.
- **Disclosure**: 2026-06-05, Include Security and the independent researcher Buchodi. The smart-TV angle was reported earlier (2026-02) by Lowpass (distributed by The Verge); this is the technical analysis of it.
- **Business structure**: Bright Data is the successor to Luminati. It runs a residential proxy network advertising 400M+ home IPs, part of whose supply derives from this SDK, distributed behind an opt-in screen in free apps (described as a "consent-based 150M+ IP" pool).
- **The core risk**: The focus is not hijacked accounts or stolen data. It is that **a household's connection and bandwidth are used as a third party's scraping infrastructure**, and that data headed for AI training is collected without its origin and consent being independently verified.
- **Verified technical weaknesses**:
  - The peer channel carrying relay jobs lacks meaningful authentication (described as "weaker than most malware"). The analysis targeted iOS `brdsdk.framework` v1.532.120, including 30 days of observation via TLS interception.
  - On iOS, that traffic bypasses a configured VPN and largely does not appear in ordinary app-monitoring tools. Unless the battery is low, it keeps relaying in the background even while you are watching or on a call.
  - **The consent gap**: The opt-in screen and what the SDK allows do not match. The Roku app Petflix shows it will be used "sometimes," while the SDK is configured to permit up to 200 GB/month (with even higher caps in some countries, such as Uzbekistan and Oman). The SDK can bundle the same vendor's apps on one person's phone and PC as a single user.

This incident stems from the origin and consent of the collected data — and of the relay traffic carrying it — not being independently verified at the moment of collection. The path is as follows.

1. **Obtaining consent**: An opt-in screen in a free app takes consent under wording like the device and connection being used "sometimes." The granularity of the wording and what the SDK actually allows (200 GB/month, etc.) do not match.
2. **Becoming a relay node**: On app launch, the SDK connects to Bright Data's servers and receives instructions without sufficient checks. Thereafter the servers have it fetch other sites' pages over the household's connection.
3. **Unverifiable relay traffic**: The channel carrying relay jobs lacks meaningful authentication, bypasses the VPN on iOS, and rarely surfaces in monitoring tools. The traffic's origin (is this device a genuinely consented relay?) cannot be independently confirmed from outside.
4. **Supply to AI training**: Scraping results sourced from residential IPs are supplied as data for the AI industry. The origin and consent of the collected data (whose what was gathered, under which consent) are not independently verified on the receiving side.
5. **After-the-fact restriction**: Platform vendors restrict background proxy SDKs, and researchers show blocking measures (DNS-level blocks, etc.). This is an after-the-fact chain that acts once collection and relay have run.

---

## 3. Timeline — disclosure and response

- 2015: Bright Data's predecessor Luminati (out of Hola VPN) is noted to have sold free users' bandwidth as exit nodes at $20/GB (the origin of the same model).
- 2025-10: Krebs on Security reports that botnet-sourced proxies such as Aisuru underpin large-scale AI data collection (the device-hijacking side).
- 2026-01: Google dismantles the criminal proxy network IPIDEA.
- 2026-02: Lowpass (distributed by The Verge) reports the smart-TV angle first.
- 2026-06-05: Include Security and Buchodi publish the technical analysis of the iOS SDK.
- After: Google, Amazon, and Roku restrict background proxy SDKs and Bright Data withdraws from those platforms. Samsung's Tizen and LG's webOS, however, remain listed as targets.

> Note: The reach to smart TVs is based on Bright Data's platform support, public partner list, and prior reporting (the deepest technical evidence is for the iOS SDK). Bright Data publishes a partner list, but the researchers caution that "being listed only indicates a past collaboration and does not mean the app currently contains the SDK." This text makes no assertion about individual apps.

The response and industry movement after disclosure:

- **Platforms / the vendor**: Google, Amazon, and Roku restricted background proxy SDKs and Bright Data withdrew from those platforms (Samsung Tizen and LG webOS remain listed). Researchers offered DNS-level blocking. But on a mobile connection the traffic bypasses office Wi-Fi, so network blocking alone cannot fully catch it.
- **The meaning-of-consent question**: The difference between device-hijacking botnet proxies (Aisuru, IPIDEA, etc.) and vendor proxies that claim opt-in consent lies in "consent" — but when the display and the actual behavior do not match, whether that consent is meaningful remains an open question.
- **A cross-industry issue**: Because anti-bot measures reject datacenter IPs, AI scraping is shifting to residential connections. A demand is emerging across the AI-training-data supply chain to independently verify, at the moment of collection, the origin and consent of the collected data and the provenance of the collection infrastructure (the relay traffic).

The absence of a layer that independently verifies, at the moment of collection, the provenance and consent of collected data and the collection infrastructure is not a problem of a specific vendor; it remains a cross-organizational challenge for any organization handling AI-training data.

---

## 4. Why it wasn't stopped

The central failure primitive is that **the origin and consent of the collected data headed for AI training, and of the relay traffic that carries out the collection, are not fixed as an independently verifiable trail at the moment of collection.** Consent is taken as the wording "used sometimes," but is not tied to the SDK's actual behavior (200 GB/month of relay), so the consent attribute cannot be verified against the actual action.

This is the same shape as [Brief 008](/critical/briefs/008-discord-scraping/) (Discord scraping via a public API redistributed as AI-training data): **the look of "public / consented" is decoupled from independently verifiable provenance.** Where 008 is "public ≠ consent," this is "the opt-in display ≠ consent to the actual behavior" — two cross-sections of the same thesis. It connects directly to [Brief 036](/critical/briefs/036-commonpool-training-data-pii/) (13.8 billion AI-training images with passports, résumés, and faces mixed in, whose provenance and consent were not verified at collection) through the primitive of absent provenance verification at the moment of collection. It connects to [Brief 011](/critical/briefs/011-synthid-watermark-reverse-engineering/) (provenance marks on AI artifacts can be stripped) in that provenance is not fixed in an independently verifiable form.

What this incident foregrounds is the layer of **the provenance of the collection infrastructure.** When not just the data's content but the collection provenance — "from which IP, under which consent, over which path the data was gathered" — goes unverified, residential IPs become a third party's scraping infrastructure without the owner's knowledge, and AI-training data circulates with its origin unquestioned. After-the-fact blocking and platform restrictions are a separate chain from a layer that fixes provenance before the action.

The researchers' reverse engineering, the DNS-level blocking they offered, and the platform vendors' restriction of background proxy SDKs are indispensable for making the harm visible and deterring it, and this Brief does not negate that role. Technical analysis and blocking are an important check on household devices being used as relays.

At the same time, detection provides no material to independently establish — **at the moment of collection** — whether this relay traffic originates from a genuinely consented source, or whether this AI-training data was collected under verifiable provenance and consent. Scraping from a residential IP is hard to distinguish from ordinary household use (which is exactly how it evades measures that reject datacenter IPs), and the origin of the collected data is invisible to the receiving side. Even if blocking addresses can be shown after the fact, the provenance of the relay that already ran and the data that already circulated cannot be fixed retroactively. What was missing is a mechanism to fix, at the moment of collection, an independently verifiable trail that "this relay derives from a consented device, and this data was collected under this origin and consent" — a chain separate from after-the-fact blocking and restriction.

---

## 5. What proof would have changed

Pre-execution attestation flips data collection from "infer the origin after the fact" to "bind origin and consent to an independently verifiable trail at the moment of collection." Tie relay traffic to a proof of a genuinely consented device, and bind collected data to the provenance of its origin and consent — and data lacking proof of provenance and consent can be screened out before it is taken into AI training. Detecting the collection infrastructure (the detection-style "which devices are relaying") and proving provenance ("under which origin and consent can this data be independently verified to have been gathered") are not substitutes but **complements.**

Against the gap this incident exposed (the origin and consent of the collected data headed for AI training, and of the relay traffic, are not independently verified at the moment of collection), Lemma proposes a design that binds data and its collection path to provenance as an independently verifiable cryptographic proof at the moment of collection.

- **Provenance binding of collected data**: Bind data taken into AI training, via a docHash, to its origin and collection path, making "from which origin and under which consent this data was collected" independently verifiable.
- **Consent attribute proof**: Record, at the moment of collection, a consent attribute verifiable against the actual collection/relay behavior — not the wording "used sometimes." Close the gap between display and actual behavior with consent verification.
- **Gating data without provenance**: Aim for a design in which intake into AI training and circulation proceeds only when an independently verifiable proof of origin and consent is satisfied. Data lacking proof of provenance and consent is screened out before intake.
- **Selective disclosure**: Without exposing the details of an individual's device or behavior, disclose only the minimum — that "this data was collected under verifiable origin and consent" — reconciling provenance verification with privacy protection.

In this way, a proof fixed at the moment of collection functions as an independently verifiable trail of whether "this training data was gathered under verifiable origin and consent," without depending on after-the-fact blocking and restriction. Detection (after-the-fact analysis, blocking, platform restriction) works on correcting harm; attestation (independent verification of provenance and consent at collection) works on establishing trust in AI-training data — each complementary to the other.

---

## 6. Sources

- **Include Security (primary, technical analysis)**: "The Smart TV in Your Living Room Is a Node in the AI-Scraping Economy" (2026-06-05, reverse engineering of the iOS SDK) — <https://blog.includesecurity.com/2026/06/the-smart-tv-in-your-livingroom-is-a-node-in-the-aiscraping-economy/>
- **The Hacker News**: "Free Apps Are Quietly Turning Smart TVs Into Web-Scraping Proxies for AI" (2026-06-06) — <https://thehackernews.com/2026/06/free-apps-are-quietly-turning-smart-tvs.html>
- **Lowpass (distributed by The Verge)**: prior reporting on smart TVs × web-scraping proxy networks (2026-02) — <https://www.lowpass.cc/p/smart-tv-web-scraping-ai-bright-data-proxy-networks>
- **Krebs on Security**: "Aisuru Botnet Shifts from DDoS to Residential Proxies" (2025-10, the context of residential proxies underpinning AI data collection) — <https://krebsonsecurity.com/2025/10/aisuru-botnet-shifts-from-ddos-to-residential-proxies/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/), [Trust402](https://lemma.frame00.com/trust402/)
