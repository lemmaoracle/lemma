---
brief_no: 86
title: "Sumsub：本人確認事業者のサポート環境に悪意ある添付ファイルから入られ、取引先の利用者の氏名・連絡先が約 18 か月気づかれないまま読める状態にあった(同社発表) — 本人確認のために預かった個人データが、中心の外のどこに残り、誰が読めるかを確かめる層が無い"
title_en: "Sumsub: a malicious attachment let attackers into an identity-verification vendor's support environment, where client end-users' names and contact details sat readable and unnoticed for about 18 months (company disclosure) — No layer checks where data held for identity checks lingers outside the core, and who can read it"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-02-04
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach", "052-discord-age-verification-id-leak"]
status: "published"
version: "2.0"
og_lead_ja: "Sumsub：本人確認事業者のサポート環境に約 18 か月気づかず侵入、利用者の氏名・連絡先が露出"
og_lead_en: "Sumsub: an 18-month undetected breach of a KYC vendor's support environment exposed users' names and contacts"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · 委託先の侵害"
og_kicker_en: "CYBERATTACK · VENDOR BREACH"
og_headline_ja: "本人確認の委託先で、\n利用者の氏名と連絡先が\n読める状態にあった。\n<accent>約 18 か月、気づかれず</accent>"
og_headline_en: "At an ID-check vendor, users' names and contacts sat readable.\n<accent>Unnoticed for about 18 months.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
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
  quote: "The core of identity verification was protected, but users' names and contact details left in the support environment sat readable and unnoticed for about 18 months."
industries: ["finance"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Don't let support staff read user data until the need is confirmed"
  - slug: "audit-trail"
    item: "Record where personal data is kept and who could read it"
attack_method: "supply-chain"
impact: "Client end-users' names and contact details exposed (number undisclosed)"
takeaway: "Nothing checked where personal data held for identity checks lingered outside the core, or who could read it."
self_check: "If your identity-check vendor leaked users' contact details, could you say right away whose and which data?"
---

> **Revision (v2.0 / 2026-10-21)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". Facts were re-checked against Sumsub's disclosure and its clients' notices (Ndax, Bitpanda). The earlier "French users' contact data" framing was removed: it came only from a low-quality outlet's headline, unsupported even by its own text, and that outlet was dropped from the sources. The FinCEN proposed rule was removed as only loosely related.

## 1. TL;DR

On February 4, 2026, identity-verification (KYC) vendor Sumsub disclosed that its internal support environment had been accessed without authorisation in July 2024. The way in was a malicious attachment an outside attacker sent through a third-party support-ticketing service. The exposed data was mainly names, with some email addresses and phone numbers. Clients' notices show it included users of the crypto exchanges Ndax and Bitpanda.

Face images, ID document images and bank details were protected along with the core verification systems. Even so, users' names and contact details remained in the support environment.

An internal review found the intrusion retrospectively in January 2026, but for about 18 months before that the data sat readable. What failed was the layer that checks where personal data held for identity checks lingers outside the core and who can read it, and keeps nothing that isn't needed.

## 2. What happened

- **Who**: Sumsub, a London-based identity-verification and anti-fraud vendor that verifies users on behalf of clients such as crypto exchanges.
- **Way in**: In July 2024 an outside attacker sent a malicious attachment through a third-party support-ticketing service (not named) and gained limited access to a support-related internal environment.
- **Exposed**: Mainly names; some records also included email addresses or phone numbers. The number of people has not been disclosed (the company says "a limited number of customer accounts").
- **Whose data**: Sumsub does not say, but its clients Ndax and Bitpanda told their own users that names, email addresses and phone numbers may have been accessed.
- **Not exposed**: Biometric data, ID document images, bank and payment details, and government ID information. Live verification workflows, client-facing APIs and core production systems were not affected (per the company).
- **Discovery**: Found retrospectively in an internal security review in January 2026. The company says it has seen no signs of unauthorised activity after July 2024 and is still assessing why discovery took so long.
- **Response**: Brought in independent forensic experts and told affected clients directly through their account managers. Revised support staff's access controls and strengthened monitoring and detection.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, as far as disclosed</span></div>
<p class="rx-ex-cap">The point to stop it was ③. Had personal data not needed for support been kept out, and who could read what been checked, little would have been readable after the break-in.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Attacker</div><div class="no">1</div><b>Sends a malicious attachment with an enquiry</b><p>Through the third-party ticketing service.</p></div>
<div class="rx-step crit"><div class="who">Sumsub support environment</div><div class="no">2</div><b>The attachment opens a way into the internal support environment</b><p>Separate from the verification core.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">3</div><b>Users' names and contacts left there become readable</b><p>2024-07.</p></div>
<div class="rx-step"><div class="who">Sumsub</div><div class="no">4</div><b>About 18 months later, an internal review finds it</b><p>2026-01.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2024-07**: The attacker sends a malicious attachment and gets into the support-related internal environment.
- **2026-01**: An internal security review finds it retrospectively.
- **2026-02-04**: Sumsub discloses the incident, having told affected clients directly.
- **2026-02-06**: French crypto outlet Cryptoast reports the notice Bitpanda sent its users.
- **2026-02-07**: Ndax tells its users on X and warns them about phishing.
- **2026-02-09**: Sumsub says on X that "in our 10-year history, this is the first incident of its kind".

> Facts rest on Sumsub's disclosure and Ndax's post (both primary) and on Cryptoast's report of Bitpanda's notice. The ticketing service's name, the number of people, affected clients other than Ndax and Bitpanda, and any regulator notification have not been disclosed. As of October 2026, the disclosure has not been updated.

### After disclosure

- **Ndax**: Said none of its systems were compromised and no passwords, ID documents or banking details were exposed, and warned users about phishing.
- **Bitpanda**: Told users their names, email addresses and phone numbers may have been affected (per Cryptoast).

## 4. Why it wasn't stopped

This case was not a failure to protect the verification core. Face and ID images were protected, but users' names and contacts remained in the support environment, which sat readable and unnoticed for about 18 months.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof works before data is stored and before it is read; detection works after an intrusion surfaces. In between, data left outside the core stays readable.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Check where held personal data lingers and who can read it</div>
<div class="rx-zone gapz"><b>The gap</b><span>For about 18 months,<br>names and contacts were readable</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>An internal review finds it retrospectively</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>In through an attachment</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Data becomes readable</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Review finds it</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Clients told</b></div>
</div>
</figure>

Detection worked: Sumsub found the intrusion in its own review and told its clients. But it found it about 18 months later, and although "the core is protected" and "held data exists only where it is needed" are separate facts, only the first had been checked. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [IDMerit](/critical/briefs/077-idmerit-kyc-data-exposure/) (data collected for identity checks left publicly exposed without protection).

## 5. How to counter this

**Keep personal data held for identity checks only where it is needed, and keep checking where it remains.** Environments outside the core, such as support, should hold only what they need. Organisations that outsource should also ask where their vendor keeps what, so that if it leaks they can say whose data, and which, was involved.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Crypto exchanges, payment services and others that outsource identity checks. Leaked contact details can be used for phishing aimed at their users.
- **Operation · Lookup & data access**: Support staff looking up user information to answer enquiries. This tends to be less protected than the core systems.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Protecting the verification core | Partial | Face and ID images were protected. Names and contacts left in the support environment sat outside it. |
| Vendor certifications and audits (SOC 2, ISO) | Partial | They show the vendor's management system, not which data remains in which environment. |
| Intrusion monitoring | Partial | An internal review found it, but about 18 months later. |
| Warning users about phishing | Partial | It reduces harm after the leak, but cannot undo it. |

### What is needed

1. **Keep personal data not needed for support out of support.** Let support staff see only the fields needed to answer an enquiry, and set how long they are kept.
2. **Check what remains where, and who can read it.** Ask vendors, too, which environments hold the data you entrust and who can read it.
3. **Record what was checked.** Keep records of where data is and who could read it in a form that can later be shown to a third party: in other words, as proof. Then, if it leaks, you can say at once whose data, and which.

### Checklist

Three things to confirm in an organisation that outsources identity checks

- Can you say which user information your identity-check vendor keeps, and in which environments?
- Is there an agreement that, after a leak, the vendor promptly tells you whose data, and which, was involved?
- If users' contact details leak, is there a procedure to warn them about phishing?

Note: keeping data only where it is needed still leaks if that place is breached. And the less data is kept, the harder it can be for support staff to answer enquiries.

## 6. Sources

- **Sumsub (Primary, company disclosure)**: "Security Incident Update" (2026-02-04) — <https://sumsub.com/newsroom/security-incident-update/>
- **Ndax (Primary, client notice on X)**: Notice to users about the Sumsub incident (2026-02-07) — <https://x.com/ndaxio/status/2020187936889659691>
- **Sumsub (Primary, post on X)**: Reply calling it "the first incident of its kind" in its 10-year history (2026-02-09) — <https://x.com/sumsub/status/2020897419911684165>
- **Cryptoast (Reporting, quotes Bitpanda's notice)**: "Bitget, Bybit, MoonPay, Bitpanda : des données personnelles de clients pourraient avoir fuité à cause de ce fournisseur de KYC" (2026-02-06) — <https://cryptoast.fr/bitget-bybit-moonpay-bitpanda-donnees-personnelles-clients-pourraient-avoir-fuite-a-cause-fournisseur-kyc/>
- **Univers Freebox (Reporting)**: "Fuite de données : un des principaux tiers de confiance pour vérifier l'identité touché... il s'en rend compte avec un an et demi de retard" (2026-02-10) — <https://www.universfreebox.com/article/591322/fuite-de-donnees-un-des-principaux-tiers-de-confiance-pour-verifier-lidentite-touche-et-sen-rend-compte-avec-un-an-et-demi-de-retard/amp>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
