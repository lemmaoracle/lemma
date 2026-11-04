---
brief_no: 86
title: "Sumsub：本人確認事業者のサポート環境に悪意ある添付ファイルから入られ、取引先の利用者の氏名・連絡先が約 18 か月気づかれないまま読める状態にあった(同社発表)"
title_en: "Sumsub: a malicious attachment let attackers into an identity-verification vendor's support environment, where client end-users' names and contact details sat readable and unnoticed for about 18 months (company disclosure)"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-02-04
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach", "052-discord-age-verification-id-leak"]
status: "published"
version: "2.1"
og_lead_ja: "Sumsub：本人確認事業者のサポート環境に約 18 か月気づかず侵入、利用者の氏名・連絡先が露出"
og_lead_en: "Sumsub: an 18-month undetected breach of a KYC vendor's support environment exposed users' names and contacts"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · 委託先の侵害"
og_kicker_en: "CYBERATTACK · VENDOR BREACH"
og_headline_ja: "本人確認の委託先で、\n利用者の氏名と連絡先が\n読める状態にあった。\n<accent>約 18 か月、気づかれず</accent>"
og_headline_en: "At an ID-check vendor, users' names and contacts sat readable.\n<accent>Unnoticed for about 18 months.</accent>"
key_figures:
  - value: "≈ 18"
    unit: "months"
    label: "From the intrusion (2024-07) to its retrospective discovery in an internal review (2026-01)"
    tone: "alert"
  - value: "02-04"
    label: "Sumsub disclosed it (2026). Affected clients were told individually by their account managers"
  - value: "Undisclosed"
    label: "Number of people affected. The company says only \"a limited number of customer accounts\""
glossary:
  - term: "Identity-verification (KYC) vendor"
    desc: "A company that checks users' ID documents and faces on behalf of banks and crypto exchanges. It holds a lot of users' personal data."
  - term: "Support ticket"
    desc: "The record of a single enquiry. Along with the conversation and attachments, it often holds the user's name and contact details."
insight:
  slug: "data-lingers-outside-core"
  label: "Personal data left outside the core"
  quote: "Personal data held for you, if you do not check where it remains outside the core and who can read it, stays readable beyond the place you thought you were protecting."
industries: ["finance"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Don't let support staff read user data until the need is confirmed"
  - slug: "audit-trail"
    item: "Record where personal data is kept and who could read it"
attack_method: "supply-chain"
impact: "Client end-users' names and contact details exposed (number undisclosed)"
takeaway: "Check, before storing and before letting anyone read it, where personal data held for identity checks remains outside the core and who can read it."
self_check: "Do you know which user information your identity-check vendor keeps, and where?"
countries: ["gb"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged.

> **Revision (v2.0 / 2026-10-21)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". Facts were re-checked against Sumsub's disclosure and its clients' notices (Ndax, Bitpanda). The earlier "French users' contact data" framing was removed: it came only from a low-quality outlet's headline, unsupported even by its own text, and that outlet was dropped from the sources. The FinCEN proposed rule was removed as only loosely related.

## 1. Summary

The core of identity verification was protected. Face and ID images were not exposed, and neither the verification workflows nor the client-facing APIs were affected (per Sumsub). Even so, users' names and contact details remained in the support environment, and that environment sat readable and unnoticed for about 18 months. <strong>Personal data held for you, if you do not check where it remains outside the core and who can read it, stays readable beyond the place you thought you were protecting.</strong>

## 2. What got through

- **What got through**: Receipt of a malicious attachment sent through a third-party support-ticketing service, and the reading of user data left in a support-related internal environment reached through it. In July 2024 an outside attacker used the attachment to gain limited access to that environment (per Sumsub).
- **What was protected**: Biometric data, ID document images, bank and payment details, and government ID information were not exposed. Live verification workflows, client-facing APIs and core production systems were not affected (per the company).
- **What reached the receiving side**: In general, an attachment to an enquiry arrives as part of ordinary support traffic. Data in an environment support staff can read sits outside the core, so what is stored there and who can read it must be managed separately from the core's protection.
- **Not disclosed**: The ticketing service's name, the number of people affected (the company says "a limited number of customer accounts"), affected clients other than Ndax and Bitpanda, any regulator notification, and why discovery took so long (still being assessed).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever places personal data in an environment outside the core, such as support, or lets someone read it, checks beforehand, both before storing it and before letting anyone read it, that the field is needed and the reader is within the range allowed, against a list decided in advance.

- **Who approves**: The client that handed the data over and the vendor that holds it decide in advance, in a list, which fields may be kept in which environment and who may read them. They do not rely on the support staff's own declaration.
- **Where it is checked**: The mechanism that places and reads data in the support environment. Fields not on the list are not stored, and people not on the list cannot read them. Once an enquiry is closed, data past its retention period is deleted.
- **What is recorded**: Which fields remain in which environment, until when, and who could read them. It is kept in a form that can later be shown to a third party, so that after a leak you can say at once whose data, and which, was involved.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking against the list, before storing data and before letting anyone read it, and keeping a record. Detection means noticing after an intrusion has happened. 2024-07 and 2026-01 below are the intrusion and discovery times as disclosed by Sumsub; 02-04 onward are the dates of disclosure and notices.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check against the list before storing and before reading</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Users' names and contact details<br>readable for about 18 months</span></div>
<div class="rx-zone det"><b>Detection · worked after about 18 months</b>An internal review finds it retrospectively</div>
<div class="rx-g g1"><div class="t">2024-07</div><b>In through an attachment</b></div>
<div class="rx-g g2"><div class="t">2026-01</div><b>Internal review finds it</b></div>
<div class="rx-g g3"><div class="t">02-04</div><b>Sumsub discloses</b></div>
<div class="rx-g g4"><div class="t">02-07</div><b>Ndax tells its users</b></div>
</div>
</figure>

Detection worked, but it found the intrusion about 18 months later. A similar case, where customer data was left in a test environment that had served its purpose, is [Awa Bank](/critical/briefs/142-awa-bank-test-environment-repurposed-leak/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that stores personal data in, or lets people read it from, an environment outside the core, such as support.** It does not look for intrusions; it checks, before storing and before reading, whether the field and the reader match the list.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Crypto exchanges, payment services and others that outsource identity checks. Leaked contact details can be used for phishing aimed at their users.
- **Operation · Lookup & data access**: Support staff looking up user information to answer enquiries. This tends to be less protected than the core systems.

### Current controls vs Lemma

In this case, the way in was column 2 (receiving a malicious attachment), and what remained readable was column 1 (data in the support environment). Column 3 is phishing aimed at users after a leak.

| Control | Holding and reading data in the support environment | Receiving a malicious attachment | Phishing aimed at users after a leak |
| --- | --- | --- | --- |
| Protecting the verification core | Partial | Not relevant | Not relevant |
| Vendor certifications and audits (SOC 2, ISO) | Partial | Not relevant | Not relevant |
| Intrusion monitoring | Partial | Partial | Not relevant |
| Warning users about phishing | Not relevant | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Not effective | Not relevant |

Protecting the verification core kept face and ID images safe, but the names and contacts left in the support environment sat outside it. Vendor certifications and audits show the vendor's management system, not which data remains in which environment. An internal review found the intrusion, but about 18 months later. Warning users about phishing reduces harm after the leak but cannot undo it. Lemma checks, in the support environment, whether the stored field and the reader match the list.

Note: Lemma's check works only when it is built into the mechanism that stores and reads data in the support environment, and the list is managed apart from the support staff. If a legitimate account of someone on the list is taken over, the data in that range can be read. Keeping data only where it is needed still leaks if that place is breached. And the less data is kept, the harder it can be for support staff to answer enquiries. The break-in through a malicious attachment is not stopped by this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in an organisation that outsources identity checks

- Do you limit the user information you pass to the vendor to what the identity check needs?
- Is there an agreement that, after a leak, the vendor promptly tells you whose data, and which, was involved?
- If users' contact details leak, is there a procedure to warn them about phishing?

## 5. Facts and timeline

- **Who**: Sumsub, a London-based identity-verification and anti-fraud vendor that verifies users on behalf of clients such as crypto exchanges.
- **Exposed**: Mainly names; some records also included email addresses or phone numbers. The number of people has not been disclosed (the company says "a limited number of customer accounts").
- **Whose data**: Sumsub does not say, but its clients Ndax and Bitpanda told their own users that names, email addresses and phone numbers may have been accessed.
- **Discovery**: Found retrospectively in an internal security review in January 2026. The company says it has seen no signs of unauthorised activity after July 2024 and is still assessing why discovery took so long.
- **Response**: Brought in independent forensic experts and told affected clients directly through their account managers. Revised support staff's access controls and strengthened monitoring and detection.

### Timeline

- **2024-07**: The attacker sends a malicious attachment and gets into the support-related internal environment.
- **2026-01**: An internal security review finds it retrospectively.
- **2026-02-04**: Sumsub discloses the incident, having told affected clients directly.
- **2026-02-06**: French crypto outlet Cryptoast reports the notice Bitpanda sent its users.
- **2026-02-07**: Ndax tells its users on X and warns them about phishing.
- **2026-02-09**: Sumsub says on X that "in our 10-year history, this is the first incident of its kind".

> Facts rest on Sumsub's disclosure and Ndax's post (both primary) and on Cryptoast's report of Bitpanda's notice. The ticketing service's name, the number of people, affected clients other than Ndax and Bitpanda, and any regulator notification have not been disclosed. As of October 2026, the disclosure has not been updated. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Ndax**: Said none of its systems were compromised and no passwords, ID documents or banking details were exposed, and warned users about phishing.
- **Bitpanda**: Told users their names, email addresses and phone numbers may have been affected (per Cryptoast).

## 6. Sources

- **Sumsub (Primary, company disclosure)**: "Security Incident Update" (2026-02-04) — <https://sumsub.com/newsroom/security-incident-update/>
- **Ndax (Primary, client notice on X)**: Notice to users about the Sumsub incident (2026-02-07) — <https://x.com/ndaxio/status/2020187936889659691>
- **Sumsub (Primary, post on X)**: Reply calling it "the first incident of its kind" in its 10-year history (2026-02-09) — <https://x.com/sumsub/status/2020897419911684165>
- **Cryptoast (Reporting, quotes Bitpanda's notice)**: "Bitget, Bybit, MoonPay, Bitpanda : des données personnelles de clients pourraient avoir fuité à cause de ce fournisseur de KYC" (2026-02-06) — <https://cryptoast.fr/bitget-bybit-moonpay-bitpanda-donnees-personnelles-clients-pourraient-avoir-fuite-a-cause-fournisseur-kyc/>
- **Univers Freebox (Reporting)**: "Fuite de données : un des principaux tiers de confiance pour vérifier l'identité touché... il s'en rend compte avec un an et demi de retard" (2026-02-10) — <https://www.universfreebox.com/article/591322/fuite-de-donnees-un-des-principaux-tiers-de-confiance-pour-verifier-lidentite-touche-et-sen-rend-compte-avec-un-an-et-demi-de-retard/amp>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
