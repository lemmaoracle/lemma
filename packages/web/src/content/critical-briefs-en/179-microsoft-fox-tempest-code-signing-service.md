---
brief_no: 179
title: "Fox Tempest：偽の身元で Microsoft の署名サービスの資格を得て、マルウェアに署名するサービスを売っていた(Microsoft の公表)"
title_en: "Fox Tempest: Using fake identities to obtain access to Microsoft's signing service, it sold signatures for malware (Microsoft disclosure)"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth, attribute-proof-bypass]
incident_date: 2026-05-19
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["178-digicert-ev-code-signing-issuance-hijack", "082-xz-utils-backdoor-identity-provenance", "022-onlyfake-ai-id-kyc-bypass"]
status: draft
version: "1.0"
og_lead_ja: "Microsoft、Fox Tempest を提訴。偽の身元で Artifact Signing の資格を得て、マルウェアに署名するサービスを売っていたと公表"
og_lead_en: "Microsoft sues Fox Tempest, saying it used fake identities to get Artifact Signing access and sold malware signing as a service"
layout: "report"
sections: "proof"
gate: "signing"
og_kicker_ja: "サイバー犯罪事例 · 署名の悪用"
og_kicker_en: "CYBERCRIME · CODE SIGNING ABUSE"
og_headline_ja: "偽の身元で、\n署名の資格を得たと\nMicrosoft が公表。\n<accent>証明書 1,000 枚超</accent>"
og_headline_en: "Fake identities got\ncode-signing access,\nsays Microsoft.\n<accent>1,000+ certificates</accent>"
key_figures:
  - value: "1,000+"
    label: "Code signing certificates created by Fox Tempest and revoked by Microsoft (Microsoft)"
    tone: "alert"
  - value: "72"
    unit: "hours"
    label: "How long each of the certificates was valid (Microsoft)"
  - value: "2025-05 → 2026-05"
    label: "When the service is said to have been offered, and the month Microsoft disrupted it (Microsoft)"
glossary:
  - term: "Code signing"
    desc: "Attaching a digital signature tied to the publisher's name to software. Operating systems and security products treat a valid signature as a signal of trust."
  - term: "Artifact Signing"
    desc: "Microsoft's code signing service (formerly Azure Trusted Signing). After identity validation of the applicant, it signs with certificates issued by Microsoft."
  - term: "Fox Tempest"
    desc: "Microsoft's name for the group that ran this signing service."
insight:
  slug: "signing-access-by-fake-identity"
  stop: true
  label: "Genuine signing access, obtained with fake identities"
  quote: "Before granting signing access, check that the applicant belongs to the organisation with that organisation's registered contact, not the documents submitted."
industries: ["developers"]
operations: ["account-admin", "delivery"]
controls:
  - slug: "ownership-check"
    item: "Confirm that an applicant for signing access is who they claim within the organisation named, and has that organisation's authority"
  - slug: "limit-and-revoke"
    item: "Grant signing access for short periods and revoke certificates found to be abused"
  - slug: "audit-trail"
    item: "Record which application was granted access, on whose approval and against which attributes"
attack_method: "impersonation"
impact: "Microsoft says access obtained with fake identities produced more than 1,000 code signing certificates, used to sign malware for ransomware groups and others"
takeaway: "According to Microsoft, no keys were stolen; genuine signing access was obtained with fake identities. Before granting access, check that the applicant is the organisation it claims to be."
self_check: "Before granting signing or publishing access, do you check that the applicant is the organisation it claims to be, separately from the documents submitted?"
countries: ["global"]
---

## 1. Summary

According to Microsoft, Fox Tempest obtained genuine access to Microsoft's signing service with fake identities and by impersonating legitimate organisations. With the resulting certificates, it signed malware its customers brought in, and the signed malware was distributed as legitimate software.

According to Microsoft, no signing keys were stolen. The customers included groups that deploy ransomware.

<strong>Even if no signing key is stolen, unless the applicant's identity is checked when signing access is granted, signatures made with access obtained under a fake identity pass as genuine.</strong>

## 2. What got through

- **What got through**: The granting of code signing access after Artifact Signing's identity validation. According to Microsoft, Fox Tempest created hundreds of Microsoft accounts and Azure tenants with fabricated identities and by impersonating legitimate organisations, and created more than 1,000 certificates. Microsoft assesses that it very likely used stolen identities from the United States and Canada to pass identity validation.
- **What got through next**: Signing malware brought in by customers. The signed files were distributed through pages such as a fake Microsoft Teams download page (Microsoft).
- **What reached the receiving side**: In general, the side that receives a signed file sees a valid signature and the name on the certificate. A valid signature shows the file was signed under that certificate's access; it does not show whether the person who obtained that access was the organisation it claimed to be.
- **Not disclosed**: Which steps of identity validation were passed, and how. The number and names of infected organisations. The names of the defendants and the claims in the lawsuit (not stated in Microsoft's blog posts).

## 3. What to check

Whatever the route, the condition for telling them apart is to check, before granting signing access, that the applicant is the organisation it claims to be, with that organisation's registered contact rather than the documents submitted. The receiving side checks, before running the software, that the signer is the organisation registered as its publisher, not only that the signature is valid.

- **Who approves**: The organisation being named. It approves the application for signing access through its registered contact (not a contact written in the application). An individual's identity is shown with attributes signed by their issuer, not self-asserted by the applicant.
- **Where it is checked**: Before signing access is granted (the issuing side), and before signed software is run or distributed inside an organisation (the receiving side). The receiving side checks that the signer's name matches the name registered as that software's publisher, and does not run it if it does not match.
- **What is recorded**: Which application was granted access, on whose approval and against which attributes, kept in a form that lets you trace later whether many accounts or certificates were created under the same identity or organisation name.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before granting signing access, that the applicant is the organisation it claims to be, and keeping a record. Detection means finding abused certificates or signed malware afterwards and revoking the certificates. Dates are from Microsoft's disclosures and press reports.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before granting access, check that the applicant is the organisation it claims to be</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Hundreds of accounts were created with fake identities<br>1,000+ certificates were used to sign malware</span></div>
<div class="rx-zone det"><b>Detection · worked after signing</b>Abused certificates are found and revoked, and the service is disrupted</div>
<div class="rx-g g1"><div class="t">2025-05</div><b>The service is offered (since at least this month)</b></div>
<div class="rx-g g2"><div class="t">2025-10</div><b>200+ certificates used to sign fake Teams installers are revoked (press)</b></div>
<div class="rx-g g3"><div class="t">2026-02</div><b>The operators move to third-party virtual machines</b></div>
<div class="rx-g g4"><div class="t">2026-05-19</div><b>Microsoft unseals its lawsuit and seizes the site</b></div>
</div>
</figure>

Microsoft was finding and revoking abused certificates, but revocation came after signing, and the operators kept going by moving accounts and infrastructure (Microsoft). A case where signing certificates were handed over at a step of the legitimate process is [DigiCert](/critical/briefs/178-digicert-ev-code-signing-issuance-hijack/) (an attacker picked up certificates for approved orders through the support portal). On checking who holds a valid signing key, see [xz utils](/critical/briefs/082-xz-utils-backdoor-identity-provenance/); on passing identity checks with a fake identity, see [OnlyFake](/critical/briefs/022-onlyfake-ai-id-kyc-bypass/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that grants signing access and the side that accepts signed software.** It does not look for malware; before execution, it confirms that an application for access could be matched to the named organisation's approval and to issuer-signed attributes, and that the signer matches the registered publisher.

### Industries and operations to watch

- **Industry · Developers and OSS**: Services that issue code signing certificates or the right to publish packages and apps. Signatures from those who hold the access are treated by recipients as the mark of a genuine publisher.
- **Operation · Account and permission management**: Creating and granting accounts that can sign or publish. Many accounts can be created under the same identity or organisation name.
- **Operation · Delivery**: Accepting and distributing software inside an organisation, where whether a signature is valid decides whether something may run.

### Current controls vs Lemma

The route in this case is the first column (granting signing access). The second column is the side that receives signed files, and the third is how certificates are handled once abuse is known; both come after the route in this case.

| Control | Granting signing access (applicant identity) | Before running or distributing a signed file | Certificates after abuse is known |
| --- | --- | --- | --- |
| Identity validation of signing-service applicants (Artifact Signing) | Partial | Not relevant | Not relevant |
| Certificate revocation (Microsoft revoked 1,000+) | Not relevant | Partial | Effective |
| Endpoint anti-malware (Defender detection, SmartScreen and others recommended by Microsoft) | Not relevant | Partial | Not relevant |
| **Lemma (pre-execution check)** | Partial | Partial | Not relevant |

Microsoft's disclosure shows that identity validation can be passed with fake or stolen identities (the use of stolen identities is Microsoft's assessment). Revocation works once abuse is known, but may come too late for files signed and distributed before it. Endpoint anti-malware stops a file it recognises as malware, but a validly signed file arrives carrying a signal of trust. Lemma checks an application for access against the named organisation's approval, and on the receiving side checks the signer against the registered publisher.

Note: Lemma's check works only when it is built into the process for granting signing access, and the named organisation's registered contact or issuer-signed attributes are managed apart from the application. It can be passed with a genuine stolen identity or a genuine credential. It can also be passed when the organisation's registered contact itself has been taken over. The receiving-side check works only where the software's publisher has been registered. Lemma does not revoke certificates or remove malware. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about signing and signed software

- After granting signing access, do you confirm that many accounts or certificates are not being created under the same identity or organisation name?
- Before running software inside your organisation, do you confirm that its signer matches the name registered as that software's publisher?
- When a certificate is revoked, is there a procedure to stop files signed with it inside your organisation?

## 5. Facts and timeline

- **Service**: Fox Tempest (Microsoft's name) offered a service that signed malware since at least May 2025. Customers uploaded malware, and it was signed with legitimate code signing credentials, including ones tied to Artifact Signing (Microsoft).
- **How access was obtained**: Hundreds of Microsoft accounts were created with fabricated identities and by impersonating legitimate organisations, and hundreds of Azure tenants and subscriptions were used. Microsoft assesses that stolen identities from the United States and Canada were very likely used to pass Artifact Signing's identity validation.
- **Certificates**: Fox Tempest created more than 1,000 certificates, and Microsoft revoked more than 1,000 certificates attributed to it. The certificates were valid for only 72 hours (Microsoft).
- **Pricing**: Customers paid thousands of dollars, with higher payments buying faster access. Microsoft's technical write-up gives three prices in its text, $5,000, $7,500 and $9,000 (a figure caption gives different amounts). Microsoft says the model generated millions in proceeds.
- **Customers**: Vanilla Tempest used it to deploy Oyster, Lumma Stealer, Vidar and Rhysida ransomware. Microsoft's investigation also links Fox Tempest to INC, Qilin, Akira and other ransomware (Microsoft).
- **Distribution**: Signed malware spread through search manipulation and malicious ads, with AI used to refine these campaigns, including through a fake Microsoft Teams download page (Microsoft).
- **Impact**: Thousands of machines were infected and networks were compromised worldwide (Microsoft).
- **October 2025 revocation**: In early October 2025, Microsoft revoked more than 200 certificates used to sign Vanilla Tempest's fake Teams installers. Certificates from SSL.com, DigiCert and GlobalSign were used as well as Trusted Signing (press).

### Timeline

- **2025-05**: The Fox Tempest service is offered (since at least this month; Microsoft).
- **2025-06**: Vanilla Tempest begins using the service (Microsoft).
- **2025-09**: Microsoft begins tracking Fox Tempest (Microsoft).
- **2025-10**: Microsoft revokes more than 200 certificates used to sign fake Teams installers (press).
- **2026-02**: As accounts were disabled and certificates revoked, the operators move to virtual machines hosted by a third party, and later try to move customers to another code signing service (Microsoft).
- **2026-05-19**: Microsoft unseals a lawsuit in the U.S. District Court for the Southern District of New York, seizes the site signspace[.]cloud and takes offline hundreds of virtual machines used in the operation (Microsoft).

> The facts rely on Microsoft's disclosures (the Digital Crimes Unit blog and Microsoft Threat Intelligence's write-up). Fox Tempest's conduct and its links to customers are Microsoft's findings and allegations in its lawsuit, not findings of the court. The lawsuit targets Fox Tempest's infrastructure and names Vanilla Tempest as a co-conspirator (Microsoft). The defendants' names, the claims and the dates of any court orders are not stated in the blog posts. The use of stolen identities is Microsoft's assessment. The October 2025 revocation relies on press reports. Whether Microsoft counts those certificates among Fox Tempest's 1,000+ has not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Microsoft**: Says it is removing fraudulent accounts, strengthening verification and limiting how this kind of access can be reused. It is working with Cloudzy on the infrastructure the operators moved to, and worked with Resecurity, Europol's European Cybercrime Centre (EC3) and the FBI.
- **Microsoft's recommendations**: Turn on cloud-delivered protection, Safe Links and Safe Attachments in Defender for Office 365, browsers that support SmartScreen, tamper protection and attack surface reduction rules.

## 6. Sources

- **Microsoft On the Issues (Primary, party)**: "Disrupting Fox Tempest: A cybercrime service that turned 'verified' software into a pathway for ransomware" (Steven Masada, 2026-05-19) — <https://blogs.microsoft.com/on-the-issues/2026/05/19/disrupting-fox-tempest-a-cybercrime-service/>
- **Microsoft Security Blog (Primary, Microsoft Threat Intelligence)**: "Exposing Fox Tempest: A malware-signing service operation" (2026-05-19) — <https://www.microsoft.com/en-us/security/blog/2026/05/19/exposing-fox-tempest-a-malware-signing-service-operation/>
- **CSO Online (Press)**: "Microsoft disrupts malware code-signing service used by ransomware gangs" (2026-05-19) — <https://www.csoonline.com/article/4173417/microsoft-disrupts-malware-code-signing-service-used-by-ransomware-gangs.html>
- **SecurityWeek (Press)**: "Microsoft Revokes Over 200 Certificates to Disrupt Ransomware Campaign" (2025-10-16) — <https://www.securityweek.com/microsoft-revokes-over-200-certificates-to-disrupt-ransomware-campaign/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
