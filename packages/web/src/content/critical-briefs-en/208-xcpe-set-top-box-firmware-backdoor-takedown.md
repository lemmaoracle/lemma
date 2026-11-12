---
brief_no: 208
title: "XCPE ボットネット：Android TV のセットトップボックスに製造元が事前導入したとされるバックドアで家庭の機器がレジデンシャルプロキシにされ、Google が警察庁と連携してテイクダウンした(Google・警察庁の公表)"
title_en: "XCPE botnet: A backdoor its maker is assessed to have preinstalled on Android TV set-top boxes turned home devices into residential proxies, and Google took it down working with Japan's National Police Agency (Google and NPA disclosures)"
pillar: 01-verifiable-origin
primary_category: identity-auth
secondary_categories: [code-provenance]
incident_date: 2026-11-03
published: 2026-11-12
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["063-smart-tv-residential-proxy-ai-scraping", "082-xz-utils-backdoor-identity-provenance", "201-bank-sinopac-vendor-setting-unauthorized-transfers"]
fact_check:
  by: "muse-spark-1.3×7 + GLM-5.3"
  at: 2026-11-12
  rev: "c5637ef064608599"
  ref: "https://github.com/lemmaoracle/lemma/pull/1162"
status: draft
version: "1.0"
og_lead_ja: "XCPE ボットネット：Android TV のセットトップボックス 130 万台超に事前導入されたバックドアを、Google が警察庁と連携してテイクダウンした"
og_lead_en: "XCPE botnet: Google, working with Japan's NPA, took down a backdoor preinstalled on more than 1.3 million Android TV set-top boxes"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · 製造元のバックドア"
og_kicker_en: "CYBERATTACK · FIRMWARE BACKDOOR"
og_headline_ja: "家庭のテレビ用端末が、\n製造元のバックドアで\n踏み台にされた。\n<accent>130 万台超</accent>"
og_headline_en: "Set-top boxes became\nproxies through a\nmaker's built-in backdoor.\n<accent>Over 1.3 million devices.</accent>"
key_figures:
  - value: "Over 1.3 million"
    label: "Set-top boxes enrolled into a botnet by the XCPE backdoor (Google's disclosure)"
    tone: "alert"
  - value: "At least 10 million"
    label: "Devices also infected through routes other than XCPE, to which Google estimates its C2 domain takedowns severed access"
  - value: "About 44"
    unit: "%"
    label: "Share of 2024 online banking fraud cases in Japan in which a residential proxy was used (at least 1,918 cases, about ¥2.89 billion in losses; NPA analysis)"
glossary:
  - term: "Residential proxy"
    desc: "A device on a household internet line that relays a third party's traffic. The destination records the IP address assigned to the household, hiding the real source (NPA, MIC and NICT)."
  - term: "Set-top box"
    desc: "A device connected to a television to watch streaming video. Many run Android TV and ship with firmware prepared by the manufacturer."
insight:
  slug: "home-ip-is-not-the-customer"
  stop: true
  label: "A domestic home IP does not show the customer"
  quote: "Before an online banking transfer is executed, check the customer making the request against the key on their registered device, not against the source IP address."
industries: ["finance", "manufacturing"]
operations: ["approval", "account-admin"]
controls:
  - slug: "verify-entry"
    item: "Let an online banking transfer request through only after confirming it with the key on the customer's registered device, not by source IP address or country"
  - slug: "hold-unverified"
    item: "Hold transfers and new payees after a login from a new device or environment until confirmed on a registered device"
  - slug: "check-origin"
    item: "Before certifying, shipping or deploying a device, confirm where its firmware came from and what it contains, apart from the maker's own declaration"
  - slug: "audit-trail"
    item: "Record which transfer was confirmed with which device's key, apart from the source IP address"
attack_method: "supply-chain"
impact: "More than 1.3 million set-top boxes were enrolled into a botnet and used for residential proxies and ad fraud (Google's disclosure). Google estimates its C2 takedowns severed access to at least 10 million other infected devices"
takeaway: "Through a backdoor its maker is assessed to have preinstalled, home TV boxes relayed other people's traffic. A connection from a domestic home IP address need not be the customer. Check transfers against the key on the customer's registered device before letting them through."
self_check: "Do you know what, besides source IP address or country, you rely on to treat an online banking transfer as the customer's own request?"
countries: ["jp", "global"]
search_title: "XCPE ボットネット：警察庁と Google がテイクダウン"
search_description: "Android TV のセットトップボックスなどに事前導入されたバックドア XCPE のボットネット（130 万台超）を、Google が警察庁などと連携してテイクダウンした（Google・警察庁の公表）。経緯と対策を整理。"
---

## 1. Summary

On 3 November, Google Threat Intelligence Group disclosed that it and industry partners had dismantled "XCPE", a backdoor preinstalled in the firmware of Android TV set-top boxes and other devices, together with its botnet. Google assesses with high confidence that Videostrong Technology, an Android device manufacturer, intentionally developed and operated the backdoor and botnet for financial gain. Infected devices were used as residential proxies (relaying other people's traffic) and for ad fraud.

On 4 November, Japan's National Police Agency (NPA) said that, after it had worked with Google together with the Kanto Regional Police Bureau's Cyber Special Investigation Unit and the Fukuoka Prefectural Police, Google took legal action and other steps in the United States leading to the takedown of domains and servers linked to residential proxies. One starting point was a search in September 2025 by the Fukuoka police of the source of unauthorised access in an online banking fraud case, which found an IoT device carrying a malicious app. The NPA has analysed that a residential proxy was used in about 44% of online banking fraud cases in 2024.

<strong>A connection from a domestic home IP address need not be sent by the customer.</strong>

## 2. What got through

- **What got through**: Two things. One is unauthorised access to online banking and transfers: according to the NPA, a residential proxy was used in at least 1,918 online banking fraud cases in 2024. The other is the maker's backdoored firmware passing certification tests. According to Google, Videostrong used obfuscation to exploit a gap in the tests and loaded malicious code after the device's first boot.
- **What reached the accepting side**: In general, online banking receives credentials such as an ID and password, and the source IP address. Through a residential proxy, the record shows the IP address of the relaying household, the real source is hidden, and servers that restrict access from abroad are reached as well (NPA, MIC and NICT). On the device side, a backdoor preinstalled in the system partition cannot be removed by the user (Google).
- **Not disclosed**: The losses and number of transfers in the Fukuoka case, and how the credentials were obtained in it. Whether the device found by the Fukuoka police was infected with XCPE (the NPA's material does not name XCPE or the maker). The number of botnet devices by country. The exact date of the takedown (Google says "last week"). Where Videostrong is based, and Videostrong's own response.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a transfer is executed, the request is checked as coming from the customer's own device, against a key the customer registered on that device and not against the source IP address.

- **Who approves**: The account holder. A transfer or a new payee is signed with a key held inside the device the customer registered. A third party holding only the ID and password, or a home device used as a relay, cannot produce that signature.
- **Where it is checked**: The step at which online banking executes a transfer. Even when the source is a domestic home IP address, a request not tied to the registered device's key is held until the customer confirms it on a registered device.
- **The other place**: On the manufacturing side, before a device is certified or shipped, the origin and contents of its firmware are checked apart from the maker's own declaration. Google says it is improving how it ensures firmware integrity on certified Android TV devices. A design that pulls in code from outside after first boot, as here, is out of reach of a check at shipping alone.
- **What is recorded**: Which transfer was confirmed with which device's key. It is kept apart from the record of source IP addresses, so that an investigation into fraudulent transfers can still establish whether a request was the customer's when the traffic's real source cannot be traced.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a transfer is executed, the request against the key on the customer's registered device, and keeping a record. Detection means tracing the device and its maker from a fraud investigation and taking down the control servers. Dates rely on the NPA's and Google's disclosures.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check a transfer request against the registered device's key, not the source IP address</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Over 1.3 million set-top boxes in a botnet<br>About 44% of 2024 fraud cases via residential proxies</span></div>
<div class="rx-zone det"><b>Detection · worked</b>A search found the device; analysis went to Google; domains and servers were taken down</div>
<div class="rx-g g1"><div class="t">2024</div><b>A residential proxy is used in at least 1,918 fraud cases (NPA analysis)</b></div>
<div class="rx-g g2"><div class="t">2025-09</div><b>Fukuoka police find an IoT device with a malicious app at the access source</b></div>
<div class="rx-g g3"><div class="t">2026-03</div><b>The NPA and others begin working with Google</b></div>
<div class="rx-g g4"><div class="t">11-03 to 04</div><b>Google and the NPA disclose the takedown</b></div>
</div>
</figure>

The takedown came from tracing the device and its maker out of a fraud investigation, so detection and tracing worked. Even so, at the time of the transfers, what the record held was the IP address of a relaying household. A case where living-room smart TVs and other devices were reported to be relay nodes is [Bright Data SDK](/critical/briefs/063-smart-tv-residential-proxy-ai-scraping/); one where a backdoor was built into official releases is [xz utils](/critical/briefs/082-xz-utils-backdoor-identity-provenance/); and one where transfers went through online banking without the customer's action is [Bank SinoPac](/critical/briefs/201-bank-sinopac-vendor-setting-unauthorized-transfers/). Here, a backdoor its maker is assessed to have installed before shipping turned home devices themselves into relays.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side of online banking that executes transfers.** It does not look for residential proxies; it checks, before execution, that a transfer request was signed with the key on the customer's registered device.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Banks and payment providers with online banking or payment services that tell suspicious access apart by source IP address or country. Through a residential proxy, the source looks like a domestic household.
- **Industry · Manufacturing & critical infrastructure**: Companies that make, sell or certify devices on home or shop internet lines, such as streaming boxes, routers and cameras. Malicious software can enter during manufacturing or distribution (NPA, MIC and NICT).
- **Operation · Approval & sign-off**: Online banking transfers and adding payees.
- **Operation · Accounts & permissions**: Login authentication, registering new devices and restrictions by source.

### Current controls vs Lemma

The route in this case is column 1 (transfers with stolen credentials via a domestic home IP address). In the NPA's analysis, a residential proxy was used in about 44% of 2024 fraud cases. Column 2 covers transfers made directly from a foreign IP address, and column 3 a takeover of the customer's own device; nothing disclosed says either happened here.

| Control | Transfer with stolen credentials via a home IP address | Transfer with stolen credentials from a foreign IP address | Transfer after the customer's own device is taken over |
| --- | --- | --- | --- |
| Restrictions by source IP address or country | Not effective | Effective | Not effective |
| One-time passwords by SMS or email | Partial | Partial | Not effective |
| Detection of suspicious transactions | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Restrictions by source tell connections from abroad apart, but pass traffic relayed through a domestic home IP address. One-time passwords by SMS or email narrow transfers made with only an ID and password, but pass when stolen at the same time through a fake site or similar. Detection of suspicious transactions notices after the transfer or from signs at the time, and has fewer clues when the source looks like a household. Lemma checks, before execution, not the source but whether the request was signed with the key on the customer's registered device.

Note: Lemma's check works only when it is built into transfer execution and the customer's key is managed so that it never leaves the registered device. If the customer's device is taken over, or the customer is deceived into approving a transfer on their own device, it can pass. A check on the manufacturing side does not reach code pulled in from outside after shipping. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions or botnets, and it does not recover funds already sent.

### Checklist

Three things to confirm about online banking transfers and devices on your network

- Do you hold transfers and new payees after a login from a new device or environment until they are confirmed on a registered device?
- Do you keep a list of the streaming boxes, routers and cameras used in your offices and shops, with their makers and whether they are certified?
- Do your transfer records show not only the source IP address but also which device's key confirmed each transfer, so you can check later?

## 5. Facts and timeline

- **Parties**: Google (which runs Android and its certification) and Videostrong Technology (an Android OEM and ODM), which Google assesses developed and operated XCPE. On the Japanese side, the NPA, the Kanto Regional Police Bureau's Cyber Special Investigation Unit and the Fukuoka Prefectural Police. Google says it worked with the NPA as well as Lumen, HUMAN Security, Plume, Synthient and TrendAI.
- **What happened**: According to Google, XCPE enrolled more than 1.3 million set-top boxes into a botnet. The backdoor was preinstalled in the firmware's system partition and cannot be removed by the user. Videostrong sold access to criminal affiliates and loaded their malware modules onto infected devices, which were used for residential proxies, ad fraud and installing further malware. Most were Android TV set-top boxes, and infections were also seen on telehealth devices, karaoke machines and digital signage. Google says this was not an isolated rogue insider or a development oversight.
- **How it was found**: According to the NPA, because many residential proxies run Android OS, the NPA and the Kanto unit have worked with Google, including by sharing information, since March 2026. In September 2025, the Fukuoka police searched the source of unauthorised access in an online banking fraud case and found an IoT device carrying a malicious app. The Kanto unit analysed the app, investigated how the device was made and sold, and passed the information to Google.
- **Link to fraudulent transfers**: According to material by the NPA, the Ministry of Internal Affairs and Communications (MIC) and NICT (21 July 2026), at least 1,918 online banking fraud cases in 2024 used a residential proxy at the time of the crime, with losses of about ¥2.89 billion, about 44% of cases and about 33% of losses. In NICT's survey, up to about 27,000 IP addresses a day on average have been observed as residential proxy exit nodes since January 2026, and at least tens of thousands of such devices are estimated to exist in Japan.
- **Google's actions**: Through legal action, Google took down the domains and servers Videostrong used to control the botnet and install malware, and the C2 domains of more than a dozen malware families loaded through the backdoor. Because the affiliates also distribute through channels other than XCPE, it estimates the C2 takedowns severed access to at least 10 million other infected devices.

### Timeline

- **2024**: A residential proxy is used at the time of the crime in at least 1,918 online banking fraud cases (NPA analysis).
- **Late 2024**: According to Google, from at least this time Videostrong rebuilds its preinstalled malware into a form that loads modules.
- **2025-09**: Fukuoka police, searching the source of unauthorised access in an online banking fraud case, find an IoT device carrying a malicious app.
- **2026-03**: The NPA and the Kanto unit begin working with Google, including by sharing information.
- **2026-07-21**: The NPA, MIC and NICT publish a paper on residential proxies abusing home IoT devices and set up a residential proxy countermeasures alliance.
- **Late October 2026**: Google and partners dismantle the XCPE backdoor ("last week" in the 3 November disclosure).
- **2026-11-03**: Google Threat Intelligence Group discloses (Japanese version on 4 November).
- **2026-11-04**: The NPA discloses the takedown of criminal infrastructure in cooperation with Google.

> The facts rely on the NPA's press material (4 November), the NPA, MIC and NICT paper (21 July) and Google Threat Intelligence Group's disclosure (3 November), all primary. That Videostrong developed and operated XCPE is Google's assessment (high confidence). The NPA's material does not name XCPE or Videostrong, and whether the device found by the Fukuoka police was infected with XCPE has not been disclosed. Neither the losses in the Fukuoka case nor how the credentials were obtained have been disclosed. The NPA's web page gives the 2024 losses as "at least about ¥3 billion" and its paper as "about ¥2.89 billion"; this Brief uses the paper's figure. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the responses of the companies or agencies. Written as of 12 November.

### After disclosure

- **Google**: Cut ties with Videostrong and banned Videostrong and any future subsidiaries or affiliates from building and selling certified Android devices, or supplying software to other certified vendors. Said it is improving how it ensures firmware integrity on certified Android TV devices. Urged users to avoid apps that offer payment for "unused bandwidth", to buy devices from reputable manufacturers, and to keep Google Play Protect active.
- **NPA, MIC and NICT**: Summarised how residential proxies are abused and what users can do, and set up a residential proxy countermeasures alliance in which industry bodies, telecommunications carriers, security firms and others consult (21 July).

## 6. Sources

- **National Police Agency (Primary, authority disclosure)**: 「Google社と連携した犯罪インフラのテイクダウンについて」 (2026-11-04) — <https://www.npa.go.jp/news/release/2026/20261104001.html>
- **National Police Agency (Primary, authority press material)**: 「Google社と連携した犯罪インフラのテイクダウンについて」 press material (2026-11-04) — <https://www.npa.go.jp/news/release/2026/202261104news.pdf>
- **National Police Agency (Primary, authority disclosure)**: 「家庭用IoT機器を悪用したサイバー攻撃への官民一体となった対策の推進について」 — <https://www.npa.go.jp/bureau/cyber/koho/news/residentialproxy.html>
- **NPA, MIC and NICT (Primary, authority paper)**: 「家庭用 IoT 機器を悪用するレジデンシャルプロキシの現状」 (2026-07-21) — <https://www.npa.go.jp/bureau/cyber/pdf/20260721-1_residentialproxy.pdf.pdf>
- **Google Threat Intelligence Group (Primary, company disclosure)**: "Shutting the Door on the XCPE Botnet" (2026-11-03) — <https://cloud.google.com/blog/topics/threat-intelligence/shutting-the-door-on-the-xcpe-botnet>
- **Google Threat Intelligence Group (Primary, company disclosure, Japanese)**: 「XCPE ボットネットを完全封鎖：Google による脅威への対抗と詳細解析」 (2026-11-04) — <https://cloud.google.com/blog/ja/topics/threat-intelligence/shutting-the-door-on-the-xcpe-botnet>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
