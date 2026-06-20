---
brief_no: 52
title: "年齢を証明するために渡した政府 ID 7 万枚が、第三者から流出した — 規制属性（年齢）の証明と生 ID の保管が分離されていない構造（Discord / 5CA）"
title_en: "70,000 Government IDs Leaked to Prove Age — Discord's Third-Party Verification Vendor Breach"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance", "identity-auth"]
incident_date: 2025-10-03
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["013-coinbase-kyc-insider-breach", "034-ekyc-camera-feed-provenance", "022-onlyfake-ai-id-kyc-bypass"]
status: published
version: "1.0"
og_lead_ja: "年齢証明のため渡した政府 ID 7 万枚が第三者から流出 — Discord"
og_lead_en: "70k government IDs leaked to prove age — Discord / 5CA"
gap_detected: "Discord detected the breach, notified affected users, and could switch vendors."
gap_missing: "There was no mechanism to show that age met the requirement without handing over the raw ID, so to prove a single fact of age the entire ID was passed to a third party and kept accumulating."
gap_fix: "Before authorizing an age-restricted feature, independently verify with Lemma that you can show only that the user is 18 or older without handing over the raw ID, and prevent it up front."
---

## TL;DR

To prove "are you over 18," a user photographs their face and a government-issued ID and sends them to the platform. But that ID goes not to the platform itself but into the hands of a contracted third party, where it piles up. In October 2025, Discord disclosed that a third-party support vendor (5CA) involved in age verification had been breached, and at least 70,000 government-issued ID images were stolen. The structural problem: **to make a user prove one regulatory attribute — age — their raw identity document itself is handed to a third party and stored, so the proof of the attribute and the storage of the raw ID are not separated.** As age-verification mandates advance worldwide, the same structure recurs on every platform. We analyze this through Pillar 04 (Regulatory Attribute Proof) as a structure in which proving an attribute depends on disclosing and storing raw PII, framed as a division of labor with detection.

---

## 1. Incident overview

- **Subject**: Discord's age-verification flow. When asked to confirm their age, a user sends a selfie holding a government-issued ID, plus their Discord username, to Trust & Safety / support
- **Disclosure**: In 2025-10, Discord reported a breach at a third-party customer-support / support vendor (5CA). At least ~70,000 people (70,000 government-issued ID images) were said to be affected
- **Leaked data**: Government-issued ID images (passports, driver's licenses, etc.), plus names, Discord usernames, email addresses, contact details, limited billing data (payment type, last four digits of cards), purchase history, IP addresses, and support-conversation content. A ransom demand by the attackers was also reported
- **The attribute-check context**: Age verification is requested when the platform suspects a user is a minor, or on access from regions that require identity confirmation. To show that "age meets the requirement," the user submits the raw identity document itself
- **What followed**: Discord terminated its contract with 5CA and secured the support systems. It partnered with a new third-party vendor (K-ID) and says ID images "are deleted promptly." The global rollout of "teen-by-default" was reportedly delayed to late 2026 after user backlash
- **The crux**: To make users prove one attribute — that "age meets the requirement" — the raw identity document itself is handed to a third party and stored; the proof of the attribute and the storage of the raw ID are not separated

---

## 2. Timeline

- 2025-09-20: The third-party support vendor 5CA is breached. Credentials are stolen via a vishing (impersonation) phone call to a support agent
- 2025-09-22 to -24: The attackers access Discord's support system for about 58 hours and siphon sensitive data, including raw IDs, from support tickets
- 2025-10-03: Discord discloses the breach; confirms theft of at least ~70,000 people's government-issued ID images. A ransom demand by the attackers is also reported
- Early 2026 onward: Discord plans a global rollout of "teen-by-default" settings; partners with a new vendor, K-ID
- 2026 (delayed to later): After user backlash, the global age-verification rollout is delayed to late 2026

> Note: The scale (at least ~70,000) and the contents are based on Discord's account and reporting. The exhaustive scope of the attack depends on the ongoing investigation, so we do not assert it here.

---

## 3. Chain of events: how raw IDs pile up in order to prove age

This incident stems from a structure in which proving a regulatory attribute (age) depends on disclosing and storing raw IDs with a third party. The path by which the failure propagates into a mass ID leak:

1. **The attribute-proof request**: The platform asks the user to confirm their age. The user is prompted to show one attribute — "age meets the requirement"
2. **Disclosure of the raw ID**: To show the attribute, the user submits a selfie holding a government-issued ID — the raw identity document itself. What they want to prove is one thing, age; what is submitted is the entire ID
3. **Third-party storage**: The submitted ID goes to the contracted third-party vendor, where it is processed and stored. For the one-time purpose of proving an attribute, raw IDs accumulate on the third party's storage surface
4. **Breach of the storage surface**: The third-party vendor is breached, and the accumulated raw IDs are stolen in bulk. A temporary disclosure for attribute proof turns into a permanent, irrecoverable PII leak
5. **After-the-fact response**: Breach detection, notification, and vendor switching kick in. But this is an after-the-fact sequence operating only after the raw IDs were stolen, and the leaked identity documents cannot be recovered

---

## 4. Structural analysis

This incident belongs to the `attribute-proof-bypass` category under Pillar 04 (Regulatory Attribute Proof). The central failure primitive is that **to make a user prove one regulatory attribute — that "age meets the requirement" — the raw identity document itself is disclosed and stored with a third party, so the proof of the attribute and the storage of the raw PII are not separated.** As secondary we note `data-provenance` (the provenance of the submitted ID and its capture) and `identity-auth` (the confirmation of identity and age).

The crux is over-disclosure: to "prove age," you hand over "the entire ID." What should be proven is one predicate, "is this person 18+," but what actually changes hands is the entire ID — name, date of birth, document number, face photo — and it is stored with a third party. A disclosure to prove an attribute once turns into a permanent storage risk. The more age-verification mandates advance worldwide, the more each platform collects raw IDs through third parties, and the same leak structure recurs across the board.

It shares a root with Brief 013 (storage of raw personal data required by regulation turned into a leak surface through insider misuse): the very PII storage kept for compliance becomes the attack surface. It connects to Brief 034 (in eKYC, identity was accepted while the capture-feed provenance went unverified) and Brief 022 (KYC bypassed with an AI-generated ID), in that the confirmation of identity/attributes depends on the exchange of raw documents, and that exchange becomes the attack/evasion surface. What this case shows is the consequence of entrusting attribute proof to the disclosure and storage of raw IDs — and its recurrence is especially high in the age-verification mandate phase.

---

## 5. The gap between detection and proof

Breach detection, notification of affected users, vendor switching (5CA to K-ID), and the policy of promptly deleting ID images are all indispensable for grasping, containing, and preventing recurrence of the harm; this Brief does not deny that role. Identifying the leak's scope and alerting users are the highest-priority operational responses.

At the same time, detection and after-the-fact response do not change "can age be proven without disclosing and storing a raw ID." Switching vendors, or shortening the ID retention period, leaves the structure of "hand a raw ID to a third party to show age" in place, so the storage surface remains an attack surface. A deletion policy, too, is irrecoverable if theft precedes deletion. What was missing is a mechanism to show only that "age meets the requirement," in an independently verifiable form, without disclosing the raw ID — a design on a separate track from vendor selection and retention shortening. As long as the exchange of raw IDs is equated with attribute proof, leak risk is managed by trailing the storage.

Pre-execution attestation and selective disclosure close this gap by separating the disclosure and storage of raw IDs from the proof of the attribute. If only the predicate "is 18 or older" can be proven with minimal disclosure, without sending raw IDs (name, document number, face photo) outside the environment, then there is no raw ID for a third party to store, and the storage surface itself disappears. Confirming whether the attribute meets the requirement (the detection-style "is this ID genuine and does it meet the age condition") and selectively proving the attribute ("prove only that the age condition is met, without a raw ID") are not substitutes but **complements**.

---

## 6. Response and industry trends

- **Discord / vendors**: Discord disclosed the breach, switched its third-party vendor from 5CA to K-ID, and stated a policy of promptly deleting ID images. The global age-verification rollout was reportedly delayed to late 2026 after user backlash
- **The age-verification question**: As age-verification mandates advance worldwide, the practice of "handing a raw ID to a third party to prove age" creating cross-platform storage risk has surfaced as an issue. Interest is growing in attribute proof without raw-ID storage (selective disclosure, age tokenization, etc.)
- **Cross-industry point**: There is growing discussion of shifting the center of gravity of identity-verification design away from entrusting regulatory-attribute proof to the disclosure and storage of raw documents, toward showing only the necessary predicate (that the age condition is met) in an independently verifiable form (attribute proof / selective disclosure). The more a mandate phase advances, the higher the value of a design that creates no storage surface

---

## 7. Lemma's analysis

Against the structure this incident exposed (proving an attribute depends on disclosing and storing raw IDs with a third party, and the storage surface becomes the attack surface), Lemma proposes a design that separates the disclosure and storage of raw PII from the proof of the attribute.

- **Selective disclosure of attributes**: Prove only the predicate "age meets the requirement" with minimal disclosure, without sending raw IDs (name, document number, face photo, etc.) outside the environment. Resolve the gap between the goal of the proof (one thing, age) and the scope of disclosure (the entire ID)
- **Eliminating the storage surface**: Instead of handing raw IDs to a third party to store, present a verifiable attribute proof, so there is no raw ID to store in the first place — a design in which there is no raw ID to leak even if breached
- **Provenance binding**: Bind the check underlying the attribute proof (the basis for age) to tamper-resistant provenance, making the capture and submission verifiable (connecting to the capture-provenance problem of Brief 034)
- **Pre-action authorization**: Do not authorize age-restricted features or access unless an attribute proof that the age condition is met holds

Through this, proving an attribute is separated from raw-ID storage, and "does age meet the requirement" functions as an independently verifiable trail without piling raw IDs up with a third party. Detection and after-the-fact response (breach detection, vendor switching, deletion) serve to manage harm, while selective-disclosure attribute proof (proof without a raw ID) serves to eliminate the storage surface itself — each working complementarily.

---

## 8. Sources

- **TechCrunch**: "Discord suffers data breach impacting at least 70,000 users" (2025-10-09; third-party vendor breach, government ID leak) — <https://techcrunch.com/2025/10/09/discord-suffers-data-breach-impacting-at-least-70000-users>
- **Proton**: "Discord ID data breach: Why the world isn't ready for age verification laws" (the structure of age-verification mandates and raw-ID storage risk) — <https://proton.me/blog/discord-age-verfication-breach>
- **Bitdefender (HotForSecurity)**: "Discord Data Breach: 5CA Named as Vendor Behind Leak of 70,000 IDs" (the third-party vendor 5CA, breach mechanics) — <https://www.bitdefender.com/en-us/blog/hotforsecurity/discord-data-breach-5ca-leak-70000-ids>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
