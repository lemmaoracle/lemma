---
brief_no: 150
title: "北朝鮮IT労働者：国内の支援者から提供された身分証の画像でその支援者になりすまし、業務を受注していた(日米豪独7機関の合同文書・国内初のラップトップ・ファーム解体) — 身分証は本物でも、その持ち主と画面の向こうで働く人物を、業務を渡す前に結びつける層が無い"
title_en: "North Korean IT workers: they won contracts in Japan by posing as local enablers, using ID images the enablers supplied (joint advisory by seven agencies in Japan, the US, Australia and Germany; Japan's first laptop farm dismantled) — the ID was genuine, but nothing tied its holder to the person doing the work before the work was handed over"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth]
incident_date: 2026-09-18
published: 2026-09-24
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["141-idscan-net-drivers-license-dark-web-breach", "034-ekyc-liveness-bypass", "084-hong-kong-deepfake-video-call-fraud"]
status: published
version: "2.0"
og_lead_ja: "北朝鮮IT労働者が国内支援者の身分証で業務を受注、国内初のラップトップ・ファーム解体"
og_lead_en: "North Korean IT workers won contracts in Japan with ID images supplied by local enablers"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · なりすまし"
og_kicker_en: "CYBERATTACK · IMPERSONATION"
og_headline_ja: "国内の支援者の\n身分証で、北朝鮮の\n労働者が仕事を受けた。\n<accent>数億円相当を海外へ送金</accent>"
og_headline_en: "North Korean workers took jobs in Japan with local enablers' IDs.\n<accent>Hundreds of millions of yen sent abroad.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "Hundreds of millions"
    unit: "yen"
    label: "Sent abroad by North Korean IT workers in crypto and other forms, including amounts found in related investigations"
    tone: "alert"
  - value: "A first"
    label: "Japan's first laptop farm, remote-controlled PCs placed in an enabler's home, identified and dismantled"
  - value: "7"
    unit: "agencies"
    label: "Japanese, US, Australian and German authorities in the joint advisory (2026-09-18)"
glossary:
  - term: "Laptop farm"
    desc: "PCs placed in an enabler's home and remote-controlled from abroad, so the work appears to be done from inside the country."
  - term: "Enabler"
    desc: "A local person who supplies ID images, a bank account or a home connection to help North Korean IT workers win work."
  - term: "Crowdsourcing"
    desc: "Online services for giving work to freelancers. Clients often meet the worker only through a screen."
insight:
  slug: "id-image-not-the-worker"
  label: "The ID holder isn't the worker"
  quote: "The ID submitted was genuine, but nothing tied its holder to the person actually working on the other side of the screen before the work was handed over."
industries: ["developers"]
operations: ["account-admin"]
controls:
  - slug: "ownership-check"
    item: "Confirm the ID holder and the person doing the work are the same"
  - slug: "audit-trail"
    item: "Record who was given the work and who was paid"
attack_method: "impersonation"
impact: "Japan's first laptop farm dismantled; hundreds of millions of yen sent abroad"
takeaway: "The ID was genuine, but nothing tied its holder to the person working on the other side of the screen before the work was handed over."
self_check: "Before handing over work, can you confirm the outside worker is the same person as the ID holder?"
---

> **Revision (v2.0 / 2026-10-21)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". The joint advisory was re-read and the harm to clients it describes (published source code, a defaced website) was added. A description of Brief 084 as a "real-time deepfake" was removed to match that Brief's revision (the call was a recording with no dialogue).

## 1. TL;DR

On September 18, 2026, Japan's National Police Agency and National Cybersecurity Office, together with US, Australian and German authorities, published the activities of North Korean IT workers. The workers took ID images from enablers living in Japan and, posing as those enablers, won work through crowdsourcing services. Remote-controlled PCs placed in an enabler's home (a laptop farm) were identified and dismantled for the first time in Japan, and hundreds of millions of yen had been sent abroad in crypto and other forms.

The ID was genuine and the connection came from the enabler's home in Japan. From the client's side, both the document check and the connection check pass correctly.

A crypto exchange spotted red flags and declined to hire, and police tracked down the farm. What failed was the layer that confirms, before work is handed over, that the ID holder and the person doing the work are the same.

## 2. What happened

- **Disclosure**: On September 18, 2026, the National Police Agency and National Cybersecurity Office published a joint advisory with the US FBI and DoD Cyber Crime Center (DC3), Australia's ASD's ACSC, and Germany's BND and BfV: seven agencies in all.
- **Method**: Using ID images supplied by enablers, the workers posed as the enablers and won work. In other cases they took on work the enablers had won, or had pay sent to the enabler's bank account and forwarded on.
- **Hiding their location**: Remote-controlled PCs in enablers' homes (laptop farms), or VPSs rented by enablers, made the work appear to come from inside Japan.
- **Money sent**: Hundreds of millions of yen sent abroad in crypto and other forms, including amounts found in related investigations.
- **Harm to clients**: In one case, after a payment dispute, a worker published the source code they had worked on; in another, a website a worker helped build was later defaced.
- **Related attacks**: The same advisory covers "WaterPlum", a group that poses as recruiters to get IT professionals to run malware; an estimated 30,000+ devices in over 100 countries and regions were infected. The NPA and FBI assess that WaterPlum and some North Korean IT workers operate under the same command.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The impersonation scheme the advisory describes</span></div>
<p class="rx-ex-cap">The point to stop it is ③: before handing over work and access, confirm the person doing it is the same as the ID holder.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Local enabler</div><div class="no">1</div><b>Hands over their own ID images and hosts a PC at home</b><p>Lends a bank account too.</p></div>
<div class="rx-step"><div class="who">North Korean IT worker</div><div class="no">2</div><b>Connects through the enabler's PC or a VPS to appear local</b><p>Applies through crowdsourcing.</p></div>
<div class="rx-step crit"><div class="who">Client</div><div class="no">3</div><b>Checks the ID and connection, and hands over work as if to the enabler</b><p>The document is genuine and the connection is local.</p></div>
<div class="rx-step crit"><div class="who">Enabler's bank account</div><div class="no">4</div><b>Receives the pay and forwards it to the worker</b><p>Hundreds of millions of yen sent abroad.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2025-05**: Someone applies for an engineering job at crypto exchange bitFlyer with a résumé in another person's name. The firm, aware it might be a North Korean IT worker, interviews them, spots red flags and declines to hire (no harm).
- **2026-07-31**: The NPA, Ministry of Foreign Affairs and others publish an alert about North Korean IT workers.
- **2026-09-18**: The seven agencies publish the joint advisory, including the dismantling of Japan's first laptop farm.

> The primary source is the joint advisory by seven agencies in Japan, the US, Australia and Germany. The laptop farm's location, when it was dismantled, the number of enablers involved and the names of Japanese clients have not been disclosed. "Hundreds of millions of yen" is the advisory's own wording.

### After disclosure

- **For organisations that outsource**: Consider that North Korean IT workers may be involved, including through subcontractors, and make bans on outsourcing and subcontracting explicit in contracts. Keep information and access given to contractors to a minimum, and revoke accounts and sessions as soon as there is suspicion.
- **Hiring checks**: The advisory lists matching the access IP address with the stated location, checking contact details, asking for concrete explanations of skills, and checking certification numbers.
- **Legal warning**: Giving work to and paying North Korean IT workers, or helping them earn foreign currency, may violate Japanese law and sanctions on North Korea. Separately, paying someone known to be North Korean, or giving them ID documents (including images), may amount to taking part in a crime.

## 4. Why it wasn't stopped

This case was not a failure to spot forged IDs, nor of careless interviewers. The ID was genuine, and nothing tied its holder to the person actually working on the other side of the screen before the work was handed over.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof works before work and access are handed over; detection works after red flags surface. In between, the worker is treated as the ID holder.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Before handing over work, confirm the worker is the ID holder</div>
<div class="rx-zone gapz"><b>The gap</b><span>Work and access were handed over.<br>Pay went to the enabler's account</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>Spot red flags in answers or connections</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>ID and connection pass</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Work and access handed over</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Red flags noticed</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Account stopped</b></div>
</div>
</figure>

Detection worked: bitFlyer declined to hire after mismatches between the résumé and the answers, and police tracked down the farm. But most checks in the advisory look for red flags, and WaterPlum members advised each other to use face-swapping software in interviews for only a few minutes, then turn the video off, blaming the connection. "The ID is genuine" and "the person working is its holder" are separate facts, and once red flags are erased, the first alone gets through. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [eKYC liveness bypass](/critical/briefs/034-ekyc-liveness-bypass/) (swapped video passing an identity check).

## 5. How to counter this

**Confirm the person doing the work, not an ID image, before handing over work and access.** An image can be copied and handed over, so it cannot tie the holder to the worker. Confirm it is the same person not only at contract time but every time they enter your systems, and align the payee with the person you confirmed.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Organisations that outsource software development or web production through crowdsourcing or contracts. They often hand over source code and credentials.
- **Operation · Accounts & permissions**: Giving outside workers accounts for repositories and internal systems. Once given, their actions are treated as legitimate.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Checking ID images | Ineffective | The IDs belonged to real residents of Japan and were genuine. |
| Checking the connection (IP address) | Ineffective | Connections came from enablers' homes or servers they rented. |
| Judgement in interviews | Partial | Odd answers gave one case away, but red flags can be erased. |
| Minimising information and access given | Partial | It limits harm, but who received it remains unknown. |

### What is needed

1. **Confirm with a method only the person can use, not an ID image.** For workers in Japan, use something like the My Number Card's public certificate, which only the person holding the card and PIN can pass. Unlike an image, it cannot be copied and handed over.
2. **Confirm it is the same person at every access.** Check that the person entering repositories and internal systems is the one confirmed at contract time, every time. Revoke accounts and sessions at the first suspicion.
3. **Record who was given the work and who was paid.** Align the payee with the confirmed person and keep it in a form that can later be shown to a third party: in other words, as proof. It also serves as the client's explanation if questioned over a violation.

### Checklist

Three things to confirm in your organisation about giving work to outside workers

- Do you confirm, by something other than an image, that outside workers are the ID holders themselves?
- Do your contracts, including subcontracting, let you know who is actually doing the work?
- Can you stop accounts given to workers at once when suspicion arises?

Note: an ID holder colluding by handing over the card or device itself cannot be stopped by this check. Extra confirmation also makes short, small jobs harder to outsource.

## 6. Sources

- **National Police Agency / National Cybersecurity Office (Primary, government disclosure)**: Public attribution by Japan, the US, Australia and Germany regarding WaterPlum and North Korean IT workers (2026-09-18, Japanese) — <https://www.npa.go.jp/bureau/cyber/koho/caution/caution20260918.html>
- **Seven agencies (Primary, joint advisory, Japanese)**: Joint advisory on WaterPlum and North Korean IT workers (2026-09-18) — <https://www.npa.go.jp/bureau/cyber/pdf/20260918_j.pdf>
- **Seven agencies (Primary, joint advisory, English)**: "North Korean 'WaterPlum,' commonly referred to as 'Contagious Interview,' Cyber Actor Group Targeting IT Professionals; Activities of North Korean IT Workers in Japan, the United States and Europe" (2026-09-18) — <https://www.npa.go.jp/bureau/cyber/pdf/20260918_e.pdf>
- **National Police Agency and others (Primary, earlier alert)**: Alert to companies about North Korean IT workers (2026-07-31, Japanese) — <https://www.npa.go.jp/bureau/security/northkorea_IT/NK_IT_202607.html>
- **The Register (Reporting)**: "North Korea's fake job interviews infected 30,000 devices" (2026-09-18) — <https://www.theregister.com/security/2026/09/18/north-koreas-fake-job-interviews-infected-30000-devices/5297461>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
