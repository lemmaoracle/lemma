---
brief_no: 150
title: "北朝鮮IT労働者：国内の支援者から提供された身分証の画像でその支援者になりすまし、業務を受注していた(日米豪独7機関の合同文書・国内初のラップトップ・ファーム解体)"
title_en: "North Korean IT workers: they won contracts in Japan by posing as local enablers, using ID images the enablers supplied (joint advisory by seven agencies in Japan, the US, Australia and Germany; Japan's first laptop farm dismantled)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth]
incident_date: 2026-09-18
published: 2026-09-24
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["141-idscan-net-drivers-license-dark-web-breach", "034-ekyc-liveness-bypass", "084-hong-kong-deepfake-video-call-fraud"]
status: published
version: "2.1"
og_lead_ja: "北朝鮮IT労働者が国内支援者の身分証で業務を受注、国内初のラップトップ・ファーム解体"
og_lead_en: "North Korean IT workers won contracts in Japan with ID images supplied by local enablers"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · なりすまし"
og_kicker_en: "CYBERATTACK · IMPERSONATION"
og_headline_ja: "国内の支援者の\n身分証で、北朝鮮の\n労働者が仕事を受けた。\n<accent>数億円相当を海外へ送金</accent>"
og_headline_en: "North Korean workers took jobs in Japan with local enablers' IDs.\n<accent>Hundreds of millions of yen sent abroad.</accent>"
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
  quote: "Even when an ID is genuine, an image cannot show that its holder is the person working on the other side of the screen."
industries: ["developers"]
operations: ["account-admin"]
controls:
  - slug: "ownership-check"
    item: "Confirm the ID holder and the person doing the work are the same"
  - slug: "audit-trail"
    item: "Record who was given the work and who was paid"
attack_method: "impersonation"
impact: "Japan's first laptop farm dismantled; hundreds of millions of yen sent abroad"
takeaway: "A genuine ID does not mean its holder is the person doing the work. Before handing over work and access, check this with a method only the person can use."
self_check: "Before handing over work, can you confirm the outside worker is the same person as the ID holder?"
countries: ["jp"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged.

## 1. Summary

The ID images the enablers supplied were genuine, and the connection came from the enabler's home in Japan. From the client's side, both the document check and the connection check pass correctly. A crypto exchange spotted red flags and declined to hire, and police tracked down the farm. <strong>Even when an ID is genuine, an image cannot show that its holder is the person working on the other side of the screen.</strong>

## 2. What got through

- **What got through**: An application on a crowdsourcing service backed by an enabler's ID image and a connection from inside Japan, and then the work and access that were handed over. The workers won work by posing as the enablers.
- **What was stopped**: In May 2025, crypto exchange bitFlyer received an application with a résumé in another person's name, spotted red flags and declined to hire (no harm).
- **What reached the receiving side**: In general, what reaches a client is an ID image, a connection source and the answers given. An image can be copied and handed over, so it does not show that the holder and the person doing the work are the same. A connection routed through an enabler's home PC or a server the enabler rented also appears to come from inside Japan.
- **Not disclosed**: The laptop farm's location and when it was dismantled, the number of enablers involved, and the names of Japanese clients.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever hands over work and access checks, before handing it over, that the person doing the work is the ID holder, not from an image but by a method only that person can use.

- **Who approves**: The ID holder in person. For workers in Japan, a method such as the My Number Card's public certificate, which only the person holding the card and PIN can pass, and which cannot be copied and handed over like an image.
- **Where it is checked**: The step that hands over work, and the point that accepts each access to repositories and internal systems. The person confirmed at contract time is matched with the person entering, every time, and entry is refused if they do not match. At the first suspicion, accounts and sessions are stopped.
- **What is recorded**: Who was given the work and who was paid. The payee is aligned with the confirmed person, and the record is kept in a form that can later be shown to a third party.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before work and access are handed over, that the worker is the ID holder, by a method only that person can use, and keeping a record. Detection means noticing red flags in answers or connections afterwards. The dates below are when the agencies or firms confirmed or disclosed a point, not when the impersonation took place.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before handing over, confirm the worker is the ID holder by a method only that person can use</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Work and access were handed over<br>and pay went to the enabler's account</span></div>
<div class="rx-zone det"><b>Detection · noticed in some cases</b>Spot red flags in answers or connections</div>
<div class="rx-g g1"><div class="t">2025-05</div><b>Red flags spotted; hire declined</b></div>
<div class="rx-g g2"><div class="t">2026-07-31</div><b>Alert published</b></div>
<div class="rx-g g3"><div class="t">2026-09-18</div><b>Seven agencies publish the advisory</b></div>
<div class="rx-g g4"><div class="t">2026-09-18</div><b>First laptop farm in Japan dismantled</b></div>
</div>
</figure>

Red flags can be erased, and most checks in the advisory look for red flags. A similar case, where swapped video passed an identity check, is [eKYC liveness bypass](/critical/briefs/034-ekyc-liveness-bypass/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that hands over work and access.** It does not look for intrusions; it checks that the person doing the work is the ID holder, before handing over and at every access, by a method only that person can use.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Organisations that outsource software development or web production through crowdsourcing or contracts. They often hand over source code and credentials.
- **Operation · Accounts & permissions**: Giving outside workers accounts for repositories and internal systems. Once given, their actions are treated as legitimate.

### Current controls vs Lemma

The route in this case is column 1 (from application to handing over work) and column 2 (access after handover). Column 3 is the payout, which went to an account in the enabler's name.

| Control | From application to handover | Access after handover | Payout |
| --- | --- | --- | --- |
| Checking ID images | Not effective | Not relevant | Not relevant |
| Checking the connection (IP address) | Not effective | Not effective | Not relevant |
| Judgement in interviews | Partial | Not relevant | Not relevant |
| Minimising information and access given | Not relevant | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Effective | Partial |

The IDs belonged to real residents of Japan and were genuine. Connections came from enablers' homes or servers they rented. Odd answers gave one case away in interviews, but red flags can be erased. Minimising information and access limits harm, but who received it remains unknown. Lemma checks, before handover and at every access, by a method only the person can use, rather than by an image.

Note: Lemma's check works only when it is built into the step that hands over work and the point that accepts access, and a method only the person can use (such as a public certificate) is available. An ID holder colluding by handing over the card or device itself passes the check. Aligning the payee with the confirmed person leaves a record but does not stop pay going to an account in an enabler's name. Extra confirmation also makes short, small jobs harder to outsource. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about giving work to outside workers

- Do you confirm, by something other than an image, that outside workers are the ID holders themselves?
- Do your contracts, including subcontracting, let you know who is actually doing the work?
- Can you stop accounts given to workers at once when suspicion arises?

## 5. Facts and timeline

- **Disclosure**: On September 18, 2026, the National Police Agency and National Cybersecurity Office published a joint advisory with the US FBI and DoD Cyber Crime Center (DC3), Australia's ASD's ACSC, and Germany's BND and BfV: seven agencies in all.
- **Method**: Using ID images supplied by enablers, the workers posed as the enablers and won work. In other cases they took on work the enablers had won, or had pay sent to the enabler's bank account and forwarded on.
- **Hiding their location**: Remote-controlled PCs in enablers' homes (laptop farms), or VPSs rented by enablers, made the work appear to come from inside Japan.
- **Money sent**: Hundreds of millions of yen sent abroad in crypto and other forms, including amounts found in related investigations.
- **Harm to clients**: In one case, after a payment dispute, a worker published the source code they had worked on; in another, a website a worker helped build was later defaced.
- **Related attacks**: The same advisory covers "WaterPlum", a group that poses as recruiters to get IT professionals to run malware; an estimated 30,000+ devices in over 100 countries and regions were infected. The NPA and FBI assess that WaterPlum and some North Korean IT workers operate under the same command.

### Timeline

- **2025-05**: Someone applies for an engineering job at crypto exchange bitFlyer with a résumé in another person's name. The firm, aware it might be a North Korean IT worker, interviews them, spots red flags and declines to hire (no harm).
- **2026-07-31**: The NPA, Ministry of Foreign Affairs and others publish an alert about North Korean IT workers.
- **2026-09-18**: The seven agencies publish the joint advisory, including the dismantling of Japan's first laptop farm.

> The primary source is the joint advisory by seven agencies in Japan, the US, Australia and Germany. The laptop farm's location, when it was dismantled, the number of enablers involved and the names of Japanese clients have not been disclosed. "Hundreds of millions of yen" is the advisory's own wording. What has not been disclosed does not mean there were no controls.

### After disclosure

- **For organisations that outsource**: Consider that North Korean IT workers may be involved, including through subcontractors, and make bans on outsourcing and subcontracting explicit in contracts. Keep information and access given to contractors to a minimum, and revoke accounts and sessions as soon as there is suspicion.
- **Hiring checks**: The advisory lists matching the access IP address with the stated location, checking contact details, asking for concrete explanations of skills, and checking certification numbers.
- **Legal warning**: Giving work to and paying North Korean IT workers, or helping them earn foreign currency, may violate Japanese law and sanctions on North Korea. Separately, paying someone known to be North Korean, or giving them ID documents (including images), may amount to taking part in a crime.

## 6. Sources

- **National Police Agency / National Cybersecurity Office (Primary, government disclosure)**: Public attribution by Japan, the US, Australia and Germany regarding WaterPlum and North Korean IT workers (2026-09-18, Japanese) — <https://www.npa.go.jp/bureau/cyber/koho/caution/caution20260918.html>
- **Seven agencies (Primary, joint advisory, Japanese)**: Joint advisory on WaterPlum and North Korean IT workers (2026-09-18) — <https://www.npa.go.jp/bureau/cyber/pdf/20260918_j.pdf>
- **Seven agencies (Primary, joint advisory, English)**: "North Korean 'WaterPlum,' commonly referred to as 'Contagious Interview,' Cyber Actor Group Targeting IT Professionals; Activities of North Korean IT Workers in Japan, the United States and Europe" (2026-09-18) — <https://www.npa.go.jp/bureau/cyber/pdf/20260918_e.pdf>
- **National Police Agency and others (Primary, earlier alert)**: Alert to companies about North Korean IT workers (2026-07-31, Japanese) — <https://www.npa.go.jp/bureau/security/northkorea_IT/NK_IT_202607.html>
- **The Register (Reporting)**: "North Korea's fake job interviews infected 30,000 devices" (2026-09-18) — <https://www.theregister.com/security/2026/09/18/north-koreas-fake-job-interviews-infected-30000-devices/5297461>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
