---
brief_no: 186
title: "eMudhra：中間 CA の秘密鍵が、鍵を作る手順の誤りで弱く作られ、誰でも求められる状態で信頼されていた(Mozilla の報告)"
title_en: "eMudhra: Intermediate CA private keys were generated weak through a flaw in the key-generation procedure, and stayed trusted while anyone could recover them (Mozilla report)"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth]
incident_date: 2026-10-17
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["178-digicert-ev-code-signing-issuance-hijack", "179-microsoft-fox-tempest-code-signing-service", "074-taiko-bridge-prover-key-leak"]
status: draft
version: "1.0"
og_lead_ja: "インドの認証局 eMudhra、鍵を作る台本の誤りで中間 CA 8 本の秘密鍵が弱く作られ、研究者がその鍵で署名してみせて失効"
og_lead_en: "eMudhra: a key-ceremony script flaw left 8 intermediate CA keys weak; a researcher signed with them and the CAs were revoked"
layout: "report"
sections: "proof"
gate: "signing"
og_kicker_ja: "認証局の事故 · 弱く作られた鍵"
og_kicker_en: "CA INCIDENT · WEAK CA KEYS"
og_headline_ja: "中間 CA の秘密鍵が、\n誰でも求められたと報告。\n<accent>8 本を失効</accent>"
og_headline_en: "Intermediate CA keys\nanyone could recover,\nMozilla reports.\n<accent>8 CAs revoked</accent>"
key_figures:
  - value: "8"
    label: "Intermediate CAs whose private keys were recovered: 6 for TLS, 2 for code signing (Mozilla report)"
    tone: "alert"
  - value: "2025-04-30 → 2026-10-17"
    label: "From the day the keys were generated to the researcher's report (Mozilla report)"
  - value: "~30,000"
    label: "Certificates to be moved to another hierarchy as the root is distrusted (eMudhra estimate)"
glossary:
  - term: "Intermediate CA"
    desc: "A certificate authority below a root CA that signs end-entity certificates. The root signs the intermediate's public key, so the intermediate's signatures are trusted by browsers."
  - term: "Key generation ceremony"
    desc: "The procedure in which a CA generates its keys inside a dedicated device (HSM), following a set script and under witness."
  - term: "Cross-signing"
    desc: "Another CA's root signing the same intermediate's public key, so the intermediate is also trusted through that root."
  - term: "Revocation"
    desc: "A certificate authority invalidating a certificate it issued, so that signatures made with its key are no longer trusted."
insight:
  slug: "valid-key-not-sole-holder"
  stop: true
  label: "A genuine key that was not the owner's alone"
  quote: "Before a root signs an intermediate CA's public key, check the public key in the request against the approved ceremony record, not the key's label."
industries: ["developers", "supply-chain"]
operations: ["approval"]
controls:
  - slug: "check-origin"
    item: "Before a root signs an intermediate's public key, check that the key is recorded as generated under the approved procedure and device"
  - slug: "hold-unverified"
    item: "Hold signing and cross-signing requests for keys that cannot be tied to a generation record"
  - slug: "audit-trail"
    item: "Record which key was generated on which device, under which procedure, and with whose approval it was signed"
attack_method: "human-error"
impact: "A key-generation flaw left 8 intermediate CA keys weak and they were revoked; browsers blocked the intermediates, and Mozilla and Chrome said they would distrust the root above them"
takeaway: "The signatures were made with genuine keys, but those keys were not eMudhra's alone. Before a key goes into use, check that it was generated under the approved procedure."
self_check: "Before a signing key goes into use, do you check that it was generated under the approved procedure and device, separately from the key's name?"
countries: ["in"]
---

## 1. Summary

The keys were not stolen. According to Mozilla's report, intermediate CA private keys generated at the key ceremony lacked sufficient randomness, and anyone could recover them from the public keys in a short time. The researcher who reported it demonstrated signatures with the recovered keys, and those signatures verify as valid signatures by genuine intermediate CA keys.

According to eMudhra, a flaw in the ceremony script created a second, weak key pair. Because the labels were similar, those keys were sent for signing by the root and for cross-signing.

<strong>A signature that verifies under a genuine key does not show that the owner made it, unless the owner is the only one who holds that key.</strong>

## 2. What got through

- **What got through**: eMudhra's root signing the public keys of 8 intermediate CAs, and Sectigo cross-signing them. According to eMudhra, the keys that were signed were not the ones the ceremony was meant to use but the weak pair created by mistake. From then on, anyone who recovered a key could sign as that intermediate CA.
- **What reached the signing side**: In general, a root or another CA asked to sign receives the public key in the certificate signing request (CSR) and the name on it. How and on which device the key was generated, and whether anyone else holds it, does not reach the signer. Browsers and other verifiers likewise see a valid signature by a genuine intermediate key and cannot tell who made it.
- **Not disclosed**: Which part of the script was flawed, and how (eMudhra says it is investigating, has appointed KPMG for an independent review, and will file its full report by 11-09). Whether anyone recovered the keys and signed with them before the report. How the weak keys could be created inside the device (participants asked on Bugzilla; no answer yet).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a root signs an intermediate's public key, it checks the public key in the request against the approved ceremony record, not the key's label.

- **Who approves**: The ceremony lead and witnesses. They record the public key and its fingerprint with the device and script version used, and approve it. A matching key label, or the action of the person who submitted the request, does not count as this approval.
- **Where it is checked**: Before the root signs the intermediate's request, and before asking another CA to cross-sign. If the public key in the request cannot be tied to the approved ceremony record, signing is held.
- **What is recorded**: Which key was generated on which device, under which script, and with whose approval it went for signing. Later, this separates the intermediates made the same way and sets the scope of investigation and revocation.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means matching the public key in the request to the approved ceremony record before a root signs an intermediate's public key, and keeping a record. Detection means noticing the weak keys or their misuse after they have been signed and published. Dates are from Mozilla's report and the Bugzilla record (UTC).</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before signing, match the request's public key to the approved ceremony record</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Weak keys were signed by the root and cross-signed<br>and trusted while anyone could recover them</span></div>
<div class="rx-zone det"><b>Detection · worked after publication</b>Researcher's report, browser blocking, revocation</div>
<div class="rx-g g1"><div class="t">2025-04-30</div><b>Intermediate CA keys are generated at a key ceremony</b></div>
<div class="rx-g g2"><div class="t">10-17</div><b>A researcher recovers the keys and reports with signatures</b></div>
<div class="rx-g g3"><div class="t">10-18</div><b>eMudhra revokes the 8 intermediates</b></div>
<div class="rx-g g4"><div class="t">10-20</div><b>Mozilla and Chrome say they will distrust the root</b></div>
</div>
</figure>

Detection did work: Firefox blocked the intermediates within three hours of the report, and eMudhra revoked them the next day, but only after the keys had been trusted for about a year and a half while recoverable. Similar cases, where a signature made with a genuine key was accepted as the key owner's act, are [Taiko](/critical/briefs/074-taiko-bridge-prover-key-leak/) (a signing key leaked to a public repository let a fake withdrawal pass as valid) and [DigiCert](/critical/briefs/178-digicert-ev-code-signing-issuance-hijack/) (an attacker was reported to have picked up certificates for approved orders).

## 4. What Lemma does

**Lemma builds the check in section 03 into the step where a root signs an intermediate's public key.** It does not replace assurance of the key-generation device or scanning published keys for weakness; ahead of those, it confirms before signing that the key sent for signing is tied to the approved ceremony record.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Organisations that generate and use their own code signing or API signing keys. When the generation procedure changes, an unintended key can end up in use.
- **Industry · Procurement & supply chain**: Certificate authorities and services that pass on trust by signing another party's key (cross-signing, key registration and similar).
- **Operation · Approval & sign-off**: The step that signs a key or certificate to approve its use; before signing, check where the thing being signed came from.

### Current controls vs Lemma

In this case, the first column put signatures on weak keys, and in the second column anyone who recovered the keys could sign. The third column is the response after discovery.

| Control | Root signing an intermediate's public key (including cross-signing) | Third parties signing with recovered keys | Revocation and blocking after discovery |
| --- | --- | --- | --- |
| Key ceremony procedure and annual audits | Partial | Not effective | Not relevant |
| Scanning published CA keys for weakness | Not relevant | Partial | Partial |
| Revocation and browser blocking (OneCRL, CRLSet, root removal) | Not relevant | Partial | Effective |
| **Lemma (pre-execution check)** | Effective | Not effective | Partial |

The ceremony, per eMudhra, ran under an approved deviation, yet the mistakenly created keys were used for the requests and later audits did not find them. Scanning for weak keys found these keys through the researcher's work, but per Chrome, earlier checks did not cover small-value elliptic curve keys and left out intermediates that had issued no certificates. Revocation and blocking worked quickly in browsers, but per a Bugzilla participant, clients that do not check revocation can still accept signatures third parties made after disclosure. Lemma checks, before signing, that the request's public key is tied to the approved ceremony record. It does not stop signatures once a key is in third-party hands, and it does not revoke keys, but the record of how each key was made helps set the scope of investigation and revocation.

Note: Lemma's check works only when the approved ceremony record (public key fingerprint, device, script version) is managed apart from the people submitting requests, and is built in before root signing and cross-signing requests. It passes if the approved key is itself weak, or if the record was made with the wrong key. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent weak keys or intrusions, and it does not revoke keys or certificates.

### Checklist

Three things to confirm for organisations that generate signing keys and put them into use

- When you change the key-generation procedure, is there a step to inspect keys made under the changed procedure before they go into use?
- For each signing key, do you keep a traceable record of the device and procedure used to generate it and whose approval put it into use?
- Do you have a step to reconcile signatures made with your keys, and certificates issued in your name, against those you actually made or issued?

## 5. Facts and timeline

- **Party**: eMudhra, an Indian certificate authority that runs CAs under the emSign name. Sectigo had also cross-signed the keys of these intermediates.
- **Affected keys**: Of 24 intermediate CA keys generated on 2025-04-30, the 8 elliptic curve (P-384) keys in series B and C. Six are for TLS and were trusted by Chrome, Mozilla, Microsoft and Apple; two are for code signing and were trusted by Microsoft (Mozilla report). The same 8 keys also had Sectigo cross-certificates (researcher's report).
- **Key weakness**: Mozilla says it recovered the keys independently, without knowing the researcher's method, and that the key generation process was flawed and trivial to exploit. It places the problem in how the keys were generated, not in the signatures produced (Mozilla report).
- **eMudhra's account**: The keys were generated in Utimaco HSMs. This ceremony included an approved deviation to test wrapping keys for export. A flaw in the script created a second, weaker key pair; because the labels were similar, that pair was used to create the requests, which the root signed and which were sent to Sectigo for cross-signing. RSA keys went through a different path and are not affected. eMudhra does not believe the device is at fault.
- **Use of the keys**: eMudhra says only one of the 8 was in production, none issued end-entity certificates, and the two code signing CAs were not used. Per a Bugzilla participant, between 10-20 and 10-21 about 107,000 certificates signed with six of the keys were logged to Certificate Transparency logs by third parties, most of them as tests.
- **Evidence of misuse**: Mozilla's post does not say whether the keys were misused before the report. BleepingComputer reports no evidence that they were (press).
- **Earlier signal**: Mozilla pointed to Bug 1970728, in which CRLs for the same six TLS intermediates had failed signature validation since May 2025. eMudhra replied that the CRLs had been signed with the original keys, failed validation, and were re-signed with the weak keys.

### Timeline

- **2025-04-30**: 24 intermediate CA keys are generated at a key ceremony.
- **2026-10-17**: While scanning published CA keys, a researcher finds the weak keys and reports to Apple, Chrome, Microsoft, Mozilla and eMudhra with signed attestations for each key (18:05). Mozilla receives it at 20:06 and completes blocking in Firefox (OneCRL) at 22:59. eMudhra acknowledges at 21:29.
- **2026-10-18**: eMudhra revokes the 8 intermediates for CA compromise (09:24 to 09:38). Mozilla opens the Bugzilla record.
- **2026-10-19**: Sectigo completes revocation of the cross-certificates.
- **2026-10-20**: Citing several people recovering the keys independently, Mozilla says it will remove trust in the root above them (emSign ECC Root CA - G3); Chrome commits to the same path. eMudhra stops issuance under that root. Mozilla ships Firefox 158.0.1 and other updates.
- **2026-10-27**: The date the new Chrome Root Store was expected to land in Stable.
- **2026-11-02**: eMudhra says it has appointed KPMG for an independent review and will file the full report by 11-09.

> The facts rely on Mozilla's Bugzilla record, with entries from Mozilla, Chrome, eMudhra, Sectigo and the researcher, and on Mozilla's security blog (primary). How the keys came to be weak is eMudhra's account. The investigation continues. The third-party certificate logging is a Bugzilla participant's report. The statement that there is no evidence of misuse comes from BleepingComputer and is not in the primary sources. What has not been disclosed does not mean there were no controls.

### After disclosure

- **eMudhra**: Revoked the 8 intermediates and stopped issuance under the root. Said about 30,000 certificates would move to the hierarchy under its RSA root (97% issued through ACME, per eMudhra). In an announcement cited by a Bugzilla participant, it says it will exit the global TLS certificate business.
- **Mozilla**: Blocked the intermediates through OneCRL and shipped Firefox 158.0.1, ESR updates and NSS 3.131.1, which removes the root. Notified other trust store operators.
- **Chrome**: Blocked the intermediates through CRLSet and said it would distrust the root. It noted that earlier weak-key checks did not cover small-value elliptic curve keys and did not scan intermediates that had issued no certificates, and proposed running weak-key checks before CA certificates can be disclosed to the CCADB.
- **Industry discussion**: eMudhra said the keys were public for about 18 months, cross-signed and audited, without anyone noticing, and that other checks in the ecosystem should be examined too. A Bugzilla participant pointed out that the May 2025 CRL problem was the earliest signal.

## 6. Sources

- **Mozilla and others (Primary, Bugzilla record)**: "eMudhra: Private key compromise of Intermediate Certificates" (Mozilla Bugzilla 2083449, 2026-10-18 to 11-02) — <https://bugzilla.mozilla.org/show_bug.cgi?id=2083449>
- **Mozilla (Primary, statement)**: "Protecting Firefox users following the compromise of eMudhra intermediate certificates" (2026-10-20, updated 10-21) — <https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates/>
- **BleepingComputer (Press)**: "Mozilla, Google, Apple block compromised eMudhra CA certificates" (2026-10-20) — <https://www.bleepingcomputer.com/news/security/mozilla-google-apple-block-compromised-emudhra-ca-certificates/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
