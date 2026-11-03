---
brief_no: 178
title: "DigiCert：審査を通った注文の EV コード署名証明書を、サポートの画面から攻撃者が受け取った(DigiCert の事後報告)"
title_en: "DigiCert: An attacker picked up EV code signing certificates for approved orders through the support portal (DigiCert incident report)"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth]
incident_date: 2026-04-02
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["082-xz-utils-backdoor-identity-provenance", "089-secondfi-signing-sdk-provenance", "087-polymarket-frontend-supply-chain"]
status: draft
version: "1.0"
og_lead_ja: "認証局 DigiCert、サポートの端末への侵入で審査済みの注文の発行コードが取り出され、EV コード署名証明書 60 枚を失効"
og_lead_en: "DigiCert: a support-desk intrusion exposed pickup codes for approved orders; 60 EV code signing certificates revoked"
layout: "report"
sections: "proof"
gate: "signing"
og_kicker_ja: "サイバー攻撃事例 · 証明書の横取り"
og_kicker_en: "CYBERATTACK · CODE SIGNING CERTS"
og_headline_ja: "審査済みの注文の証明書を、\n攻撃者が受け取ったと報告。\n<accent>60 枚を失効</accent>"
og_headline_en: "An attacker picked up\napproved certificates,\nDigiCert reports.\n<accent>60 certificates revoked</accent>"
key_figures:
  - value: "60"
    label: "EV code signing certificates revoked; 27 of them were tied to the attacker (DigiCert report)"
    tone: "alert"
  - value: "04-04 → 04-14"
    label: "From the compromise of the second workstation to its discovery (DigiCert report)"
  - value: "04-17"
    label: "The last certificate was revoked, with the revocation date set back to the date of issuance (DigiCert report)"
glossary:
  - term: "EV code signing certificate"
    desc: "A certificate used to sign software and show which organisation made it. The certificate authority validates the applying organisation strictly before issuance; the key is kept on a hardware token."
  - term: "Initialization code"
    desc: "The code entered to pick up the certificate for an approved order onto a token. In DigiCert's report, the code plus an approved order was enough to obtain the certificate."
  - term: "Revocation"
    desc: "A certificate authority invalidating a certificate it issued, so that signatures made with it are no longer trusted."
insight:
  slug: "pickup-by-code-alone"
  label: "Certificates released on a code alone"
  quote: "If holding a pickup code is enough to receive a certificate, the certificate can end up with someone other than the party that was validated, however sound the validation was."
industries: ["developers", "supply-chain"]
operations: ["delivery", "account-admin"]
controls:
  - slug: "verify-entry"
    item: "Before releasing a certificate, check that the pickup request comes from a registered administrator of the validated subscriber"
  - slug: "hold-unverified"
    item: "Hold issuance when a pickup request cannot be matched to the subscriber"
  - slug: "audit-trail"
    item: "Record which order's certificate was picked up, by whom and where"
impact: "Pickup codes for approved orders were taken and 60 EV code signing certificates were revoked (27 tied to the attacker)"
takeaway: "Validation went through as normal; the certificate was intercepted at the final handover. Before releasing a certificate, check that the pickup request comes from the validated subscriber."
self_check: "When you hand over certificates or keys, do you check that the recipient is the validated party, separately from the pickup code?"
countries: ["us"]
---

## 1. Summary

Validation of the applying organisations went through the normal process. According to DigiCert's report, the attacker got onto support analysts' workstations and, from the support portal, read the initialization codes for EV code signing orders that had been approved and were waiting for pickup. The code plus an approved order was enough to obtain the certificate, so certificates were issued in the names of genuine organisations, and some were used to sign malware. Validation itself was not broken; what was intercepted was the final handover. <strong>If holding a pickup code is enough to receive a certificate, the certificate can end up with someone other than the party that was validated, however sound the validation was.</strong>

## 2. What got through

- **What got through**: Certificate pickup (key generation and issuance) against approved EV code signing orders. Using initialization codes read in the support portal, the attacker obtained certificates across several customer accounts and several issuing CAs (DigiCert report).
- **What reached the issuing side**: In DigiCert's report, pickup checks the initialization code and the approved order it belongs to. The code works for whoever holds it; whether the person picking up belongs to the validated organisation does not reach the CA. In general, the side running signed software also sees a valid signature issued in a genuine organisation's name, and cannot tell it apart from the contents.
- **Not disclosed**: Who the attacker is. Where the signed malware reached, and how many users. When the certificates were used (DigiCert says it does not track misuse dates). Why the second workstation had no endpoint sensor (DigiCert says the logs that would show this are past their retention period).

## 3. What to check

Whatever the route, the condition for telling them apart is that the CA checks, before issuing and releasing a certificate, that the pickup request comes from a registered administrator of the validated subscriber, separately from the initialization code.

- **Who approves**: A registered administrator of the validated subscriber, who approves that the pickup request is theirs through a contact or device registered apart from the order and the code. Actions by the CA's support staff, or by anyone merely holding the code, do not count as this approval.
- **Where it is checked**: Before the certificate is generated against the approved order and delivered to a token. When a pickup request cannot be tied to the subscriber's approval (for example, only the code was used), issuance is held.
- **What is recorded**: Which order's certificate went to which pickup request, with whose approval, so that you can later separate certificates that reached the subscriber from those that did not, and set the scope of revocation.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before a certificate is released, that the pickup request comes from a registered administrator of the validated subscriber, and keeping a record. Detection means noticing rogue certificates or the intrusion after issuance. Dates are from DigiCert's report (UTC).</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before release, match the pickup request to the subscriber's approval</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Codes for approved orders were read<br>Certificates issued in genuine names</span></div>
<div class="rx-zone det"><b>Detection · worked after issuance</b>Researchers' problem reports, scoping, revocation</div>
<div class="rx-g g1"><div class="t">04-02</div><b>A malicious file arrives through support chat</b></div>
<div class="rx-g g2"><div class="t">04-04</div><b>A second analyst's workstation is compromised</b></div>
<div class="rx-g g3"><div class="t">04-14</div><b>The second compromise is found; scope widens</b></div>
<div class="rx-g g4"><div class="t">04-17</div><b>The last certificate is revoked</b></div>
</div>
</figure>

Detection did work: the first workstation was found and contained the next day, and certificates were revoked one by one as researchers reported them, but only after they had been issued and used to sign. Similar cases, where a trusted signature was accepted without checking where it came from, are [xz utils](/critical/briefs/082-xz-utils-backdoor-identity-provenance/) (a maintainer who gained authority planted a backdoor in signed official releases) and [SecondFi](/critical/briefs/089-secondfi-signing-sdk-provenance/) (external analysis says signing code was swapped for an unaudited SDK).

## 4. What Lemma does

**Lemma builds the check in section 03 into the step where a CA releases the certificate for an approved order.** It does not replace validation of the applicant or intrusion detection on endpoints; after them, it confirms before issuance that the pickup request is tied to the validated subscriber's approval.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Organisations that sign and ship their software with code signing certificates. Certificates can be issued in their name without ever reaching them.
- **Industry · Procurement & supply chain**: Services that hand over certificates, keys or accounts by code or link after validation or contracting.
- **Operation · Sending & delivery**: The final handover of something already validated or approved.
- **Operation · Accounts & permissions**: Features that let support staff view customer accounts from the customer's perspective.

### Current controls vs Lemma

The route in this case runs from the first column into the second. If the first does not stop it, the signatures in the second pass as valid signatures in a genuine organisation's name. The third column is the response after issuance.

| Control | Pickup of certificates for approved orders | Signing malware with the certificates | Revocation after issuance |
| --- | --- | --- | --- |
| Validation of the applying organisation | Not effective | Not effective | Not relevant |
| Endpoint monitoring of analysts (EDR) | Partial | Not relevant | Not relevant |
| Researchers' problem reports and revocation | Not relevant | Partial | Effective |
| **Lemma (pre-execution check)** | Effective | Not effective | Partial |

Validation confirms that the applying organisation is genuine; here it was passed legitimately, and it does not check who picks up. Endpoint monitoring, per DigiCert's report, found and contained the first compromise, but the second workstation had no sensor; it looks for intrusions, not at the pickup request itself. Researchers' reports and revocation invalidated the certificates, but only after they had been used to sign. Lemma checks, before issuance, that the pickup request is tied to the validated subscriber's approval. It does not stop signatures once a certificate is out, and it does not revoke certificates, but the record of which certificates went through the subscriber's approval helps set the scope of revocation.

Note: Lemma's check works only when it is built into the CA's handover step and the subscriber's registered administrators and contacts are managed apart from the support portal and order data. It passes if the subscriber's administrator account itself is taken over, or the registered contact has been altered. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and it does not revoke certificates.

### Checklist

Three things to confirm for services that hand over certificates, keys or accounts

- Are values that work for whoever holds them, such as pickup codes, kept off screens that support staff can view from the customer's perspective?
- For each pickup request, do you keep a traceable record of which certificate or key was released, with whose approval?
- Do you have a step to reconcile certificates issued in your name against the certificates you actually received?

## 5. Facts and timeline

- **Party**: DigiCert, a US certificate authority. Two support analysts' workstations were compromised.
- **Entry point**: Through the customer support chat, the attacker sent a file disguised as a customer screenshot. Four attempts were blocked; the fifth compromised the first workstation. The second was compromised through the same vector (DigiCert report).
- **What was taken**: Initialization codes for EV code signing orders that were approved and awaiting pickup, read through a support portal function that lets analysts view customer accounts from the customer's perspective. That function cannot manage accounts or orders, but the codes were not masked (DigiCert report).
- **Certificates**: 60 were revoked, from four CAs: two DigiCert CAs and CAs under the GoGetSSL and Verokey names. 27 were tied to the attacker (11 through problem reports from researchers and others, 16 through DigiCert's investigation); the other 33 were revoked as a precaution because customer control could not be confirmed. Pending orders were cancelled (DigiCert report).
- **What was signed**: The certificates identified by researchers had been used to sign the "Zhong Stealer" malware family (DigiCert report).
- **Contributing factors named by DigiCert**: Inconsistent endpoint detection coverage; insufficient privilege minimisation in the support portal function; initialization codes not protected as bearer credentials; support channels accepting risky file types.
- **Other impact**: DigiCert says it found no misuse of other internal systems or validation information, and no mis-issuance of non-code-signing certificates.

### Timeline

- **2026-04-02**: The attacker repeatedly sends malicious files to an analyst through support chat; one is opened on the first workstation.
- **2026-04-03**: Endpoint monitoring detects and contains the first workstation. At this point the second is not considered compromised.
- **2026-04-04**: A second analyst's workstation is compromised through the same vector (established by the later investigation).
- **2026-04-05 to 04-16**: Certificate problem reports arrive from researchers and others; DigiCert revokes each within 24 hours.
- **2026-04-14**: The second compromise is found and the scope widens. Analyst accounts are suspended and a change masking initialization codes in the support portal is deployed in the US (API and EU the next day).
- **2026-04-17**: The last identified certificate is revoked, with the revocation date set to the date of issuance.
- **2026-04-18**: DigiCert files a preliminary report on Mozilla's Bugzilla.
- **2026-04-28**: DigiCert posts its full incident report (revised on 05-04 and 05-05).
- **2026-07-09**: DigiCert reports all action items complete and requests closure.

> The facts rely on DigiCert's incident report on Mozilla's Bugzilla and its later replies (primary). On the second workstation, DigiCert first described the sensor as malfunctioning, then revised this on 05-04 and 05-05 to say it was not installed. Help Net Security links Zhong Stealer to Chinese e-crime and cryptocurrency theft and reports that a researcher's report helped uncover the second workstation; these are the outlet's statements and are not in DigiCert's report. What has not been disclosed does not mean there were no controls.

### After disclosure

- **DigiCert**: Masked initialization codes in both the support portal and the API, and made proxied support access read-only. Blocked risky file types in chat and case attachments and added sandboxing for attachments. Automated reconciliation of endpoint sensor enrolment and blocked non-compliant devices from corporate systems. Restricted initialization codes to authorised customer account administrators. It says all 21 action items are complete.
- **DigiCert's commitments**: To treat initialization codes as single-use bearer credentials throughout their lifecycle, including expiry. In its replies, DigiCert said the codes were valid for 30 days.
- **Industry discussion**: In the Bugzilla thread, the chair of the CA/Browser Forum Code Signing Working Group noted that CAs cannot tell at issuance whether an organisation will later sign malware. DigiCert says it has seen an ongoing increase in social engineering attempts through its support channels in the same period.

## 6. Sources

- **DigiCert (Primary, incident report)**: "DigiCert: Misissued code signing certificates" (Mozilla Bugzilla 2033170, 2026-04-18 to 07-09) — <https://bugzilla.mozilla.org/show_bug.cgi?id=2033170>
- **Help Net Security (Press)**: "DigiCert breached via malicious screensaver file" (2026-05-04) — <https://www.helpnetsecurity.com/2026/05/04/digicert-breach-code-signing-certificates-malware/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
