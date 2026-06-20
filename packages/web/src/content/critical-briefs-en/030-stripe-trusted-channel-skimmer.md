---
brief_no: 30
title: "Stripe の信頼された API インフラが、カード窃取コードの配送と窃取データの保管に転用された — allowlist はドメインの身元を信頼し、運ばれる内容の来歴を検証しない"
title_en: "Stripe's Trusted API Infrastructure Repurposed to Deliver Card-Skimming Code and Store Stolen Data — Allowlists Trust the Domain's Identity, Not the Provenance of What It Carries"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-06-04
published: 2026-06-06
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["010-claude-code-leak-lure", "004-megalodon-github-supply-chain"]
version: "1.0"
status: published
og_lead_ja: "信頼 API がカード窃取コードの配送路に — Stripe Magecart"
og_lead_en: "Trusted Stripe API repurposed as a card-skimming channel"
gap_detected: "Containment by EC security vendors worked — analyzing the skimmer, providing IOCs, and notifying affected stores."
gap_missing: "There was no layer to confirm before execution whether the code running at checkout had been legitimately placed by the store, so trust in the domain's identity was used in place of the provenance of the contents."
gap_fix: "Before code runs at checkout, independently verify with Lemma that the script carries provenance of legitimate placement by the store, and prevent it up front."
---

## TL;DR

E-commerce security firm Sansec disclosed a Magecart card-skimming campaign abusing Stripe's API infrastructure (Stripe itself was not breached). The attacker repurposed the trusted domains a store allows by default (`api.stripe.com`, Google) as both the delivery channel for the skimmer and the storage backend for stolen data, slipping past CSP and network filters. What is missing is a layer that verifies, before code runs at checkout, whether that script carries provenance of legitimate placement by the store — trust in the domain's identity was used in place of the provenance of its contents. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident overview

- **Target**: Magento / Adobe Commerce checkout pages (the victims are the e-commerce stores; Stripe and Google are abused trusted infrastructure, not victims).
- **Disclosure**: 2026-06-04, analysis published by Sansec.
- **Abused trusted infrastructure**: `api.stripe.com` (payment processing) and `googletagmanager.com` (tag management) — both domains stores allow by default.
- **Delivery**: malicious code is embedded in a legitimate-looking GTM container; on reaching checkout it queries a Stripe API customer record (e.g. `cus_TfFjAAZQNOYENR`), reconstructs JavaScript from its metadata, and runs it via `new Function()`.
- **Stolen**: credit card number, expiry, CVV, name, billing address, email, phone.
- **Storage / exfiltration**: stolen data is concatenated into a single string → XOR-obfuscated → stored locally. A separate routine, running right after page load and every minute, splits the data and **creates a new customer object in the attacker's Stripe account**, storing it in metadata. After copying, it wipes the local copy to erase traces.
- **The evasion core**: both payload and stolen cards travel through `api.stripe.com`. Because the store allows that domain by default, it slips past the CSP and network filters that would catch an unknown skimmer domain.
- **Variant**: a version using Google Firestore instead of Stripe (project `braintree-payment-app`, document `tracking/captcha`) was also seen — naming that blends with legitimate payment / bot-defense traffic.
- **Origin**: the Stripe customer record holding the skimmer was created on 2025-12-24, suggesting activity from at least that date.

---

## 2. Chain of events

(This is an attack campaign, but the full set of victim stores has not been published, so we lay it out as a chain of events, based on Sansec's analysis.)

- 2025-12-24: the Stripe customer record holding the skimmer is created (likely the start of activity).
- During the period: malicious code is embedded in victim stores' GTM containers, firing on reaching checkout.
- Per purchase: the skimmer fetches customer-record metadata from the Stripe API → reconstructs and runs JavaScript → steals card data, XOR-obfuscates, stores locally.
- After page load / every minute: it splits the stolen data, creates fake customer records in the attacker's Stripe account, and wipes the local copy.
- 2026-06-04: Sansec discloses; BleepingComputer and others report; the Firestore variant is confirmed alongside.

---

## 3. Technical structure of the chain

1. **Parasitizing trusted domains**: the attacker uses `googletagmanager.com` / `api.stripe.com`, which stores allow by default, for delivery and storage — never exposing a domain of their own.
2. **Indirect code placement**: the skimmer body sits in the metadata of a Stripe customer record and is reconstructed and run via `new Function()`. Static code inspection and domain allowlists don't flag it as malicious.
3. **Steal and stash locally**: card data from checkout is stolen, XOR-obfuscated, and held locally for a moment.
4. **Exfiltration over the trusted channel**: stolen data is written into a fake customer record in the attacker's Stripe account. Because the destination is `api.stripe.com`, it passes CSP and egress filters.
5. **Trace erasure and redundancy**: the local copy is wiped after sending; the Firestore variant adds delivery / storage redundancy.

---

## 4. Structural analysis

This belongs to Pillar 01 (Verifiable Origin), category `code-provenance`. The central failure primitive is that **CSP / network allowlists trust a domain's "identity" (this is Stripe; this is Google) but do not verify the "provenance" of the code and data it carries (who placed this script, and by which legitimate path)**. We mark `identity-auth` (over-reliance on a trusted domain's identity) and `data-provenance` (stolen data exfiltrated over a legitimate channel) as secondary.

It is the same shape as Brief 010 (Claude Code source-leak lure malware). 010 repurposed the trust signal of the Anthropic brand and the legitimate delivery path of GitHub Releases for malware delivery. This case repurposed the infrastructure of trusted brands — Stripe / Google — for skimmer delivery and stolen-data storage. Both share the core of the verifiable-origin category: what is trusted is the issuer's identity, not the provenance of the contents it carries. It is also adjacent to Brief 004 (Megalodon) in using a legitimate ecosystem (GitHub / a payment API) as the attack's transport layer.

What matters is that this primitive strikes the very premise of the allowlist defense. An allowlist works by rejecting unknown domains, but as long as a trusted domain can carry arbitrary code and data, per-domain trust guarantees nothing about the correctness of the contents. That `api.stripe.com` is Stripe's legitimate API, and that the metadata it carries is legitimate payment data, are separate questions.

---

## 5. The detection–proof gap

Skimmer analysis, IOC sharing, and victim-store notification by e-commerce security firms like Sansec are essential to containing the campaign; this Brief does not dispute that role. Users can also reduce risk with single-use virtual cards with limits.

But detection does not change "whether the browser executes code loaded from a trusted domain" or "whether data sent to a trusted domain is allowed." Here the traffic is to `api.stripe.com` / `googletagmanager.com`, which CSP and network filters allow by default. The skimmer body is scattered across customer-record metadata and dynamically assembled via `new Function()`, so it is hard to catch even with static inspection. Stolen data leaves through the legitimate Stripe customer-object-creation API. What was missing is provenance verification of "is the script that runs on this checkout page one the store placed legitimately?" — a different track from domain allowlists and anomaly detection. For regulatory reporting and PCI audit, too, after a leak there is little independent trail beyond reconciling GTM history with access logs to prove "which script, by whose placement, touched the card data when."

Pre-execution attestation verifies the code that runs at checkout not by a domain allowlist but by **the provenance of who placed it, by which path, and with what content** — before execution. If the proof says "this script has no legitimate store-placement provenance," execution is blocked even when it comes from a trusted domain. A domain allowlist ("is this a known trusted source") and pre-execution proof of code provenance ("was this content placed legitimately") are not substitutes but **complements**.

---

## 6. Response and industry context

- **Sansec**: analyzed and disclosed the skimmer's behavior, the abuse structure across both Stripe and Firestore, and the customer-record creation date (2025-12-24), giving stores visibility.
- **The trusted-infrastructure side (Stripe / Google)**: neither company's own systems were breached; what was abused were legitimate API and tag-management features. Shutting down attacker accounts / containers is the operators' domain.
- **Cross-industry**: Magecart that repurposes trusted domains for delivery and storage exposes the limits of per-domain defenses like CSP and domain allowlists. The argument to verify the provenance of code that runs at checkout independently of the domain's identity is gaining weight through this case and Brief 010. In the PCI DSS context, script-integrity management for payment pages is strengthening as a requirement.

---

## 7. Lemma's analysis

Against the detection–proof gap exposed here (an allowlist trusts a domain's identity but does not verify the provenance of the code and data it carries), Lemma proposes a design that verifies executed code and exchanged data — not by a domain allowlist but as the provenance of who placed it, by which path, and with what content — as an independently verifiable cryptographic proof before execution. Even when delivered from a trusted domain, if the provenance proof reports the absence of legitimate placement, execution and exfiltration are rejected in advance. This rests on the "a domain is trusted ≠ the provenance of its contents is correct" design of the verifiable-origin category. For the same shape of trust-signal repurposing, see Brief 010.

---

## 8. Sources

- **Sansec**: Magecart campaign analysis (Stripe / Firestore abuse structure, customer-record creation date, IOCs) (2026-06) — https://sansec.io/research
- **BleepingComputer**: "Credit card theft campaign abuses Stripe to host stolen payment info" (2026-06-04) — https://www.bleepingcomputer.com/news/security/credit-card-theft-campaign-abuses-stripe-to-host-stolen-payment-info/
- **The Hacker News**: "New Magecart Campaign Abuses Stripe API to Host and Exfiltrate Stolen Card Data" (2026-06) — https://thehackernews.com/
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
