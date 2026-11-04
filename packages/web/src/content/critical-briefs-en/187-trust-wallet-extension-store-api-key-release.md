---
brief_no: 187
title: "Trust Wallet：改ざんされたブラウザ拡張機能 v2.68 が、正規の公開の手順の外から Chrome ウェブストアに公開された(Trust Wallet の公表)"
title_en: "Trust Wallet: A tampered v2.68 of its browser extension was published to the Chrome Web Store outside the official release process (Trust Wallet disclosure)"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth]
incident_date: 2025-12-24
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["087-polymarket-frontend-supply-chain", "089-secondfi-signing-sdk-provenance", "178-digicert-ev-code-signing-issuance-hijack"]
status: draft
version: "1.0"
og_lead_ja: "Trust Wallet のブラウザ拡張機能、漏れたストアの API キーで改ざん版 v2.68 が公開され、2,520 アドレスから資産が流出"
og_lead_en: "Trust Wallet: a leaked store API key let a tampered v2.68 browser extension ship; 2,520 addresses drained"
layout: "report"
sections: "proof"
gate: "signing"
attack_method: "supply-chain"
og_kicker_ja: "サイバー攻撃事例 · ストアの更新の改ざん"
og_kicker_en: "CYBERATTACK · STORE UPDATE"
og_headline_ja: "改ざんされた拡張機能が、\n正規の更新で届いたと公表。\n<accent>2,520 アドレスが被害</accent>"
og_headline_en: "A tampered extension\nshipped as a real update,\nTrust Wallet says.\n<accent>2,520 addresses drained</accent>"
key_figures:
  - value: "2,520"
    label: "Trust Wallet-linked addresses drained (Trust Wallet disclosure; press reported 2,596)"
    tone: "alert"
  - value: "~$8.5M"
    label: "Assets associated with 17 attacker-controlled addresses (Trust Wallet disclosure; press reported ~$7M)"
  - value: "12-24 → 12-26"
    label: "Exposure window for the tampered version; users who logged in after 11:00 UTC on 12-26 were not affected (Trust Wallet disclosure)"
glossary:
  - term: "Browser extension wallet"
    desc: "A crypto wallet installed in the browser. It handles keys and balances on the user's device and signs transactions. Updates arrive automatically from the store."
  - term: "Chrome Web Store API key"
    desc: "A key a developer uses to submit and publish new versions of an extension to the store. Once a version passes store review, it reaches users."
  - term: "Release process"
    desc: "The internal flow of approving and manually reviewing a new version before publishing it. Per Trust Wallet, the tampered version was published outside this flow."
insight:
  slug: "release-by-key-alone"
  stop: true
  label: "Releases shipped on a key alone"
  quote: "Before publishing to the store, check the build about to ship against the internally approved version, not the publishing key."
industries: ["finance", "developers"]
operations: ["delivery", "approval"]
controls:
  - slug: "verify-entry"
    item: "Before publishing a new version to the store, check that it went through internal approval and manual review, separately from the publishing key"
  - slug: "hold-unverified"
    item: "Hold publication of any version that cannot be tied to internal approval"
  - slug: "audit-trail"
    item: "Record which version was published to which store, with whose approval"
impact: "A tampered v2.68 extension arrived through the store and 2,520 Trust Wallet-linked addresses were drained (~$8.5M tied to attacker addresses)"
takeaway: "The tampered version arrived from the official store as an update to the genuine extension. Before publishing a new version, check that it went through internal approval, separately from the publishing key."
self_check: "When you publish a new version of an app or extension, do you check that it went through internal approval, separately from the publishing key?"
countries: ["global"]
---

## 1. Summary

The tampered version arrived from the official Chrome Web Store as an update to the genuine extension users already had installed. It did not come from a fake site or a fake app.

According to Trust Wallet, the attacker submitted the tampered build directly with a leaked store API key. The build skipped internal approval and manual review, and was published automatically after passing store review. What was broken here was not a company's withdrawal keys or signers, but the channel that delivers software handling keys on users' devices.

<strong>If holding the publishing key is enough to ship a new version, a version that never went through internal approval still reaches users as a genuine extension update.</strong>

## 2. What got through

- **What got through**: Publication of a new browser extension version (v2.68) to the Chrome Web Store. Using a leaked API key, the attacker submitted a tampered build, which passed store review and was published automatically (Trust Wallet disclosure). On users' side, it installed as an ordinary update.
- **What reached the receiving side**: In general, the store receives a submission authenticated by the developer's API key, plus the contents of the build. Whether the build went through the developer's internal approval and review cannot be told from the key. Users, too, receive a new store-published version of the genuine extension, indistinguishable by its delivery channel. Per Trust Wallet, once loaded, the tampered version let the attacker access sensitive wallet data and execute transactions without authorisation.
- **Not disclosed**: Who the attacker is. Where and how the API key was stored in the development environment. What store review checked. When the tampered build was submitted (press reported publication at 12:32 UTC on 12-24). How much was taken from addresses not linked to Trust Wallet (the company says it is still tracking this).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is checking, before publication to the store, that the version about to ship went through internal approval, separately from the publishing API key.

- **Who approves**: A registered internal approver for releases. They approve which version (build) ships, using a key or device held apart from the publishing key. Holding the publishing key, or an action by an automated publishing pipeline, does not count as this approval.
- **Where it is checked**: Before submission and publication to the store. The pipeline checks the build it is about to submit against the approved build. If they do not match (no approval record, different contents), submission is held.
- **What is recorded**: Which version went to which store, with whose approval. This later separates versions in distribution that were approved from those that came from outside the process.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before publication to the store, that the version went through internal approval, separately from the publishing key, and keeping a record. Detection means noticing drained funds or a suspicious version after publication. Dates are from Trust Wallet's disclosure (the 12-26 time is UTC).</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before publishing, match the build to internal approval</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A tampered build was sent with a leaked key<br>It shipped as a genuine extension update</span></div>
<div class="rx-zone det"><b>Detection · worked after publication</b>Alerts from researchers and partners, rollback</div>
<div class="rx-g g1"><div class="t">2025-11</div><b>Development secrets leak, exposing the store API key</b></div>
<div class="rx-g g2"><div class="t">12-24</div><b>Tampered v2.68 is published to the store</b></div>
<div class="rx-g g3"><div class="t">12-25</div><b>First draining is publicly reported</b></div>
<div class="rx-g g4"><div class="t">12-26</div><b>Logins after 11:00 UTC are not affected</b></div>
</div>
</figure>

Detection did work: the draining surfaced the day after publication through alerts from researchers and partners, and the company shipped a rolled-back version, but only after the tampered version had reached users and been loaded. Similar cases, where code entered a legitimate distribution channel without its origin being checked, are [Polymarket](/critical/briefs/087-polymarket-frontend-supply-chain/) (malicious code injected through a front-end dependency) and [SecondFi](/critical/briefs/089-secondfi-signing-sdk-provenance/) (external analysis says signing code was swapped for an unaudited SDK). A case where validation passed but the final handover was intercepted is [DigiCert](/critical/briefs/178-digicert-ev-code-signing-issuance-hijack/) (an attacker picked up certificates for approved orders).

## 4. What Lemma does

**Lemma builds the check in section 03 into the step where a developer publishes a new version to the store.** It does not replace store review or intrusion detection in the development environment; before them, it confirms that the version about to be published is tied to internal approval.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Organisations that ship wallet, trading or payment apps and extensions through stores. An update to software that handles keys and transactions on users' devices becomes a direct route to draining funds.
- **Industry · Developers & agent operations**: Organisations that publish to stores and distribution channels with API keys or automated pipelines. If a key leaks, versions can ship outside the internal process.
- **Operation · Sending & delivery**: Delivering new versions to users through store auto-updates.
- **Operation · Approval & sign-off**: Internal approval and manual review of which version to publish.

### Current controls vs Lemma

The route in this case runs from the first column through the second to the third. If the first does not stop it, the update in the second arrives as a genuine extension update, and the draining in the third happens on users' devices.

| Control | Publishing a new version to the store | Distributing the update to users' devices | Extracting wallet data and sending funds |
| --- | --- | --- | --- |
| Store review | Partial | Not relevant | Not relevant |
| Internal approval and manual review | Not effective | Not relevant | Not relevant |
| Alerts from researchers and partners, and rollback | Not relevant | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Not relevant | Not effective |

Store review looks at the contents of the submitted build; per Trust Wallet, the tampered version passed it. It does not look at whether the build went through the developer's internal process. Internal approval and manual review, per the company, were not passed through by a version submitted directly with the API key; where a key alone can publish, versions can ship without this step. Alerts and rollback surfaced the draining and delivered a rolled-back version, but only after the tampered version had been loaded. Lemma checks, before store submission, that the version about to be published is tied to internal approval. It does not stop behaviour on users' devices once an update has arrived, or transactions. It does not revoke leaked keys or recover drained funds.

Note: Lemma's check works only when it is built into the store submission and publishing pipeline, and the publishing API key is placed where only that pipeline can use it. A build can pass if the publishing key is usable outside the pipeline, or if an approver's key or device is itself taken over. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, revoke keys or recover funds.

### Checklist

Three things to confirm for organisations that ship apps or extensions through stores

- Are the keys used to publish to stores and distribution channels kept separate from development environments and repository secrets?
- Do you have a step to reconcile the versions live in distribution against the versions you approved internally?
- For each release, do you keep a traceable record of which version went to which channel, with whose approval?

## 5. Facts and timeline

- **Party**: Trust Wallet, a crypto wallet. Affected users were those who opened and logged in to browser extension v2.68 between 12-24 and 12-26. The company says mobile app users and users of other extension versions were not affected (Trust Wallet disclosure).
- **Publishing route**: According to Trust Wallet, development secrets were exposed in the November 2025 "Sha1-Hulud" supply chain incident, giving the attacker the extension source code and the Chrome Web Store API key. The attacker submitted the tampered build directly with the key; it skipped internal approval and manual review and was published automatically after passing store review. The company describes this link with "high confidence" while saying the investigation of the exact vector continues.
- **Attacker preparation**: The attacker registered domains with names resembling Trust Wallet to host malicious code, and the tampered build loaded that code (Trust Wallet disclosure).
- **Impact**: 2,520 Trust Wallet-linked addresses were drained. About $8.5 million in assets is associated with 17 attacker-controlled addresses. The attacker also drained addresses not linked to Trust Wallet; the company says it is still tracking those (Trust Wallet disclosure). BleepingComputer reported 2,596 addresses identified by the company and about $7 million in losses.
- **Reimbursement**: Trust Wallet says it is voluntarily reimbursing affected users. It has received over 5,000 claims, many likely duplicate or fraudulent, and reviews them case by case (Trust Wallet disclosure).

### Timeline

- **2025-11**: Development secrets are exposed in the "Sha1-Hulud" incident (Trust Wallet's assessment).
- **2025-12-24**: A tampered v2.68 is published to the Chrome Web Store outside the official release process. Press reported publication at 12:32 UTC.
- **2025-12-25**: The first draining is publicly reported; researchers, partners and internal systems raise alerts.
- **2025-12-26**: The company says users who opened and logged in after 11:00 UTC were not affected.
- **2025-12-29**: BleepingComputer reports the CEO saying v2.68 was not released through the internal manual process and was likely submitted with a leaked API key.
- **2025-12-30**: Trust Wallet publishes its incident update (updated 2026-07-17).

> The facts rely on Trust Wallet's blog disclosure (primary). The company says the investigation is ongoing and figures may change. The address count (2,596), loss figure (~$7 million), publication time and pausing of release APIs come from BleepingComputer's reporting. Its figures differ from the company's (2,520; ~$8.5 million). What has not been disclosed does not mean there were no controls.

### After disclosure

- **Trust Wallet**: Rolled back to the clean v2.67 and released it as v2.69, urging users to update. Disabled publishing access and related API credentials and restricted deployment permissions. Says it added safeguards on extension releases, release system and tool access, and monitoring, and is reviewing publishing pipelines, dependency scanning, access controls, credential management and rotation policies.
- **Claims process**: Claims go through the official support form, and the company planned a verification code in extension v2.70 to help verify claims. It says it will never ask for private keys, seed phrases or passwords, and warns of impersonators.
- **Press**: BleepingComputer reports that the company paused release APIs for two weeks, that the registrar suspended the domain hosting the malicious code, and that a phishing domain using the Trust Wallet name asked users for seed phrases.

## 6. Sources

- **Trust Wallet (Primary, disclosure)**: "Trust Wallet Browser Extension v2.68 Incident: An Update to Our Community" (2025-12-30, updated 2026-07-17) — <https://trustwallet.com/blog/announcements/trust-wallet-browser-extension-v268-incident-community-update>
- **BleepingComputer (Press)**: "Trust Wallet says 2,596 wallets drained in $7 million crypto theft attack" (2025-12-29) — <https://bleepingcomputer.com/news/security/trust-wallet-says-7-million-crypto-theft-attack-drained-2-596-wallets>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
