---
brief_no: 91
title: "Photo ZIP：認証ランダリングで SPF・DKIM・DMARC を全通過した「Calendly 発」のメールは、攻撃者が書いた偽物だった — ホテル受付に Node.js バックドア（TonRAT）"
title_en: "Photo ZIP: 'Authentication Laundering' Cleared SPF/DKIM/DMARC So a Fake 'via Calendly' Email Looked Legitimate — a Node.js Backdoor (TonRAT) at Hotel Front Desks"
pillar: "01-verifiable-origin"
primary_category: "identity-auth"
secondary_categories: ["code-provenance", "attribute-proof-bypass"]
incident_date: 2026-06-25
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["030-stripe-trusted-channel-skimmer", "064-salesloft-drift-oauth-salesforce", "062-claude-code-github-action-bot-trust", "047-openclaw-agent-phishing"]
status: "published"
version: "1.0"
og_lead_ja: "Photo ZIP：認証ランダリングでメール認証を全通過。認証は送信経路を確かめ、作成主体を確かめない"
og_lead_en: "Photo ZIP: authentication laundering cleared SPF/DKIM/DMARC; email auth verifies the path, not the author"
og_headline_ja: "認証を通ったメールは、\n攻撃者が書いた<accent>偽物</accent>だった。"
og_headline_en: "An email passed every check.\n<accent>An attacker wrote it.</accent>"
gap_detected: "All three email authentication checks — SPF, DKIM, and DMARC — fired and completed, genuinely verifying that the email was sent from legitimate infrastructure (Calendly)."
gap_missing: "Authentication confirmed only the legitimacy of the sending path; there was no layer that, before execution, proved whether a legitimate counterparty had actually authored the booking/complaint message (its authorship)."
gap_fix: "Attach a cryptographic provenance proof of authorship to legitimate booking and guest communications, and independently verify with Lemma any message that lacks it, to prevent it up front."
---

## 1. TL;DR

On 2026-06-25, Microsoft threat intelligence disclosed "Photo ZIP," a multi-stage campaign targeting the hotel and hospitality industry across Europe and Asia. The technical core is "authentication laundering": by routing messages through the notification infrastructure of a legitimate scheduling SaaS (Calendly) and a Google redirect, all three email authentication checks — SPF, DKIM, and DMARC — pass as legitimate. The sender display name shown to recipients is "Booking Manager (via Calendly)." When front-desk staff open an LNK file disguised as a PNG image (inside `photo-<random>.zip`), a legitimate Node.js runtime is dropped via PowerShell and the implant TonRAT establishes dual registry persistence and C2. Japanese lures (guest complaints, bedbug reports) were the most prevalent, putting Japanese accommodations in range. Email authentication completed — but, ironically, that only endorsed the attack as "legitimate." Authentication verifies the sending path, not authorship.

---

## 2. What happened

- **Research party**: Microsoft Defender Security Research Team (Parth Jomadkar). Published a technical report and IoCs (C2 domains, hashes, etc.) on 2026-06-25
- **Subject**: The hotel and hospitality industry across Europe and Asia. Reservation and front-desk staff were selectively targeted (accounts whose device names included `reception-`, `frontdesk-`, `accueil`, `recepcja`, etc.)
- **Scale**: Microsoft confirmed intrusions at multiple organizations. The ultimate objective is unknown at this time; the investment in obfuscation and persistence is assessed as a staging phase for follow-on activity. There is no attribution to a known threat actor (to be confirmed: number of victim organizations, country breakdown)
- **Structural points**: (i) using the "true attribute" of a trusted SaaS sender as a cover for the "false authorship" of the attacker's text; (ii) hiding the executable's provenance behind a PNG-disguised LNK; (iii) evading detection by masquerading as a legitimate runtime (Node.js)

The incident came together as the following chain.

1. **Routing through a legitimate SaaS**: The attacker generates an email notification in Calendly's system and embeds a multi-hop link in the body: Calendly's `/url` redirect → Google's share redirect → `photo-<number>.cfd`
2. **Passing every email check**: Because the email is actually sent from Calendly's infrastructure, it passes the recipient's SPF, DKIM, and DMARC and lands in the inbox as "Booking Manager (via Calendly)." Authentication confirms "did it go through legitimate sending infrastructure," not "who wrote it"
3. **Getting the PNG-disguised LNK opened**: When front-desk staff click the link, `photo-<random>.zip` is downloaded, and they mistake the `IMG/PHOTO-<random>.png.lnk` inside it (which looks like a PNG image under default settings) for a photo and open it
4. **Masquerading as a legitimate runtime**: LNK execution → obfuscated PowerShell (decoding a URL hidden with BigInt arithmetic) → fetching the legitimate Node.js v24.13.0 runtime from nodejs.org into user space → running the JavaScript implant TonRAT on top of it
5. **Persistence and C2**: Establishes dual persistence in two Windows registry locations (`HKCU\Run` and `HKCU\RunOnce`) and C2 with campaign domains. Post-compromise activity observed includes C2 beaconing, forced shutdowns, and compilation of PE payloads (in Wave 2, .NET DLL generation via `csc.exe`). The ultimate objective is unconfirmed

This is a case of **authentication laundering** that exploits a blind spot in email authentication. SPF, DKIM, and DMARC guarantee the authenticity of the sending domain/path, but not the authenticity of authorship — who wrote the text.

---

## 3. Timeline — disclosure and response

- 2026-04: The "Photo ZIP" campaign begins (Wave 1), using `IMG-<random>.png.lnk` as the initial technique
- Late 2026-05: The delivery technique evolves. "Authentication laundering" via the Calendly notification infrastructure plus a Google redirect is introduced. Sender display name "Booking Manager (via Calendly)"
- Wave 2: The filename prefix changes from `IMG-` to `PHOTO-`. A stage that dynamically compiles a .NET DLL via `csc.exe` from PowerShell is added. `photo-<number>.cfd` domains behind Cloudflare are added
- 2026-06-25: The Microsoft Defender Security Research Team publishes the technical report and IoCs

> Note: This case is based on research and observation disclosed by Microsoft threat intelligence; the ultimate objective is unconfirmed as of this Brief's writing (assessed as a staging phase for follow-on activity). There is no attribution to a known threat actor. The lure languages observed were Japanese (most prevalent), Danish, and Dutch; `accueil`, `recepcja`, etc., are reported as device-name patterns. The implant is tracked as TonRAT, but we make no claims about its C2 resolution beyond what was disclosed (paths other than domains). Refer to the latest primary source (Microsoft's official post) for scale, country breakdown, and IoCs (domains/hashes). We do not exaggerate.

The response and industry movement after disclosure:

- **Microsoft (research party)**: As mitigations, recommends staff-wide awareness of emails whose sender name is "Booking Manager (via Calendly)," checking the final destination of redirect URLs, enabling display of known file extensions, LNK execution restrictions and ASR rules, adding SIEM/EDR rules that detect non-standard placement of a legitimate runtime (Node.js) and its external communication, and registering the published IoCs. Points to related Microsoft Defender alerts
- **Abuse of business characteristics**: This case is an extension of a series of phishing campaigns targeting the hotel industry (Booking.com impersonation, repeated advisories for the hospitality sector), exploiting the hospitality trait of "a front desk that routinely handles photo and document attachments" for target selection. Japanese lures were the most prevalent, putting Japanese accommodations among the targets
- **Cross-industry point**: The technique of "routing through a legitimate SaaS sending infrastructure to pass path authentication" can generalize beyond Calendly to scheduling, booking, and notification SaaS at large. This should be treated not as the fault of a particular tool but as a cross-organizational operational issue: email authentication does not vouch for authorship

How to independently verify, before opening and execution, the provenance of a message's author is expected to advance as a design point for email security and business communication in the wake of this case.

---

## 4. Why it wasn't stopped

The central failure primitive is that **"the channel is legitimate" (channel_is_legitimate) was mistaken for "the message is authentic" (message_is_authentic)**. The unit of trust was placed on the transport path, not on authorship. Email authentication did fire, but what it proved was only that the message "went through a legitimate SaaS sending infrastructure," not that "the claimed counterparty wrote this booking/complaint message with that authority." The moment a legitimate SaaS was used as a relay, detection instead endorsed the attack as "authenticated."

This case connects, in the same lineage, with a series of Briefs where a trusted path or sender was repurposed for attack. [Brief No.030](/critical/briefs/030-stripe-trusted-channel-skimmer/) (Stripe, where trusted API infrastructure was repurposed for delivering and storing card theft) is the same shape as this case in that a trusted path itself does not vouch for the authenticity of content. [Brief No.064](/critical/briefs/064-salesloft-drift-oauth-salesforce/) (Salesloft Drift, where a trusted integration's OAuth was abused) connects in that an established trust relationship became cover for malicious operations. [Brief No.062](/critical/briefs/062-claude-code-github-action-bot-trust/) (Claude Code GitHub Action, where a `[bot]` claim was trusted into privileged execution) shares the same failure primitive of trusting a "claimed identity" without verifying it. [Brief No.047](/critical/briefs/047-openclaw-agent-phishing/) (OpenClaw, where credentials were sent out before the sender was verified) is adjacent in the absence of authorship verification around booking and accommodation. In all of them, **the basis of trust was placed on a "path or claimed name," and the "provenance of the author" was not independently verified**.

Email authentication and sender reputation are useful as a precondition, but only once a message's author is independently verified as provenance — "is this the claimed party?" — can booking and guest communications be handled with confidence on the front-desk front line.

That all three checks — SPF, DKIM, and DMARC — fired and completed is indispensable for countering spoofed email, and this Brief does not deny that role. That the email was sent from legitimate infrastructure (Calendly) was indeed verified. Detection (authentication of the sending domain/path) did work.

At the same time, what email authentication confirmed was only "was it sent from Calendly (the legitimacy of the path)," and no one could prove "did a legitimate counterparty write this booking/complaint message (authorship)." What was missing was a layer that, before execution (the front-desk staff's opening and clicking), independently verifies whether a message's author is "the claimed party, with legitimate authority" — a verification on a separate track from authentication of the path. The moment a legitimate SaaS was used as a relay, authentication instead endorsed the attack as "authenticated" and lowered the recipient's guard. Even if the email is re-judged malicious after the fact, the backdoor that has already reached opening and execution is not stopped.

---

## 5. What proof would have changed

Pre-execution attestation proves, before execution, not the "legitimacy of the path" but the "legitimacy of authorship," in an independently verifiable form. By attaching a cryptographic provenance proof of authorship (such as Seal) to legitimate booking and guest communications, front-desk staff and the email infrastructure can immediately identify "a message lacking the expected authorship proof." Only by not separating authentication of the path (the detection-style "it arrived from legitimate infrastructure") from pre-execution attestation of the author's provenance ("the claimed party wrote it"), and by letting the two overlap, can booking and guest communications be handled with confidence in real operations. The unit of trust moves from "path" to "author," and authentication laundering no longer works. Detection and pre-execution proof are complements, not substitutes.

Against the gap this case exposed (the message's path was authenticated, but the author's provenance is not independently verified before execution), Lemma proposes the following design.

- **Provenance proof of authorship**: Attach a Seal-based authorship proof to legitimate booking systems and guest communications, so the receiving side can mechanically verify "did the claimed party write this communication, with that authority?"
- **Path ≠ author**: Separate the fact of the path ("it went through a legitimate SaaS sending infrastructure") from the fact of authorship ("the claimed party wrote it"), and make the latter the subject of pre-execution attestation. Even if Calendly or the like is used as a relay to pass SPF/DKIM/DMARC, a message lacking the expected authorship proof surfaces as "looks legitimate but is unproven"
- **Making absence visible**: Rather than promising to block all phishing, attach verifiable provenance to legitimate communications and make its absence visible as an anomaly. By moving the unit of trust from "path" to "author," authentication laundering no longer works
- **Selective disclosure**: Without disclosing the sender's internal information or full authority, prove with minimal disclosure only that "this communication was authored by the claimed party, with that authority"

Detection (email authentication, the after-the-fact malicious verdict) works toward finding spoofed paths, and pre-execution attestation (independent verification of the author's provenance before execution) works toward establishing trust in business communication; the two are complementary. The gap is closed not by "hardening email authentication" but by "moving the unit of trust from path to author." For the design and its scope, see [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/) and [Seal](https://lemma.frame00.com/seal/).

---

## 6. Sources

- **Microsoft Security Blog (research, primary)**: "Photo ZIP campaign targeting hospitality industry delivers Node.js implant for persistent access" (Microsoft Defender Security Research Team / Parth Jomadkar, 2026-06-25) — <https://www.microsoft.com/en-us/security/blog/2026/06/25/photo-zip-campaign-targeting-hospitality-industry-delivers-node-js-implant-persistent-access/>
- **The Hacker News**: "Microsoft Warns of Photo ZIP Phishing Campaign Targeting Hotels with Node.js Implant" — <https://thehackernews.com/2026/06/microsoft-warns-of-photo-zip-phishing.html>
- **SC Media**: "Photo-themed phishing campaign targets European and Asian hotels with Node.js implant" — <https://www.scworld.com/brief/photo-themed-phishing-campaign-targets-european-and-asian-hotels-with-node-js-implant>
- **Security Measures Lab (Japanese commentary)**: "Microsoft discloses the 'Photo ZIP campaign'" (2026-06-30) — <https://rocket-boys.co.jp/security-measures-lab/hotel-frontdesk-phishing-node-backdoor/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/)
