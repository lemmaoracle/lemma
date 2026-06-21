---
brief_no: 6
title: "Google API キー削除後 23 分有効 — credential 失効属性の独立検証不在"
title_en: "Google API Keys Remain Usable for 23 Minutes After Deletion — Independent Verification Gap in Credential Revocation Attributes"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-21
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["003-starlette-badhost", "005-noroboto-lying-fonts", "019-construction-engineer-qualification-fraud", "020-type-designation-conformity-fraud", "021-wirecard-balance-attestation", "022-onlyfake-ai-id-kyc-bypass"]
version: "1.0"
status: published
og_lead_ja: "削除した API キーが 23 分間も有効、失効が独立検証されない — Google"
og_lead_en: "Deleted API keys stayed usable for 23 minutes — Google revocation lag"
gap_detected: "Security firm Aikido measured the revocation lag (up to about 23 minutes) over 10 runs across two days, making it visible to the whole industry."
gap_missing: "As long as the 'deleted' label was trusted, there was no layer to confirm before using a credential whether it had truly been revoked across all servers, leaving up to 23 minutes of room for abuse."
gap_fix: "Before using a credential, independently verify with Lemma that the key has truly been revoked, and prevent it up front."
---

## TL;DR

Aikido demonstrated that Google API keys keep authenticating for up to about 23 minutes after deletion. The cause is eventual consistency: revocation propagates in stages, so an attacker hitting a server where deletion has not yet landed can keep using the key. Aikido measured and surfaced the lag, but detection cannot change the revocation-lag structure itself. What was missing is a layer to independently verify the "deleted" attribute before the credential is used. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident Overview

- **Disclosure**: May 2026, Joe Leon of Aikido security, Aikido official blog
- **Venue**: "Google API keys keep working after you delete them long enough to be exploited"
- **Scope**: All Google API keys (Gemini, BigQuery, Maps, and other Google Cloud APIs)
- **Measured revocation lag**: Minimum approximately 8 minutes, median approximately 16 minutes, maximum approximately 23 minutes (10 trials over 2 days)
- **Test conditions**: After creating and deleting an API key, send 3–5 requests per second continuously and measure the timestamp of the last successful authentication. Additional 5 trials conducted across three regions: US East, Western Europe, and Southeast Asia
- **Revocation-speed differences by API type**: Old Gemini API keys (maximum approximately 23 minutes), new Gemini API key format (approximately 1 minute), Google service account keys (approximately 5 seconds)
- **Google's response**: Treated Aikido's report as "will not fix," "operating as intended," and "not a security issue," and closed it
- **Core**: The structural failure was that a credential's "revoked" attribute was presented as "deleted" without independent verification, so a key not actually revoked across all servers was accepted as a valid credential.

---

## 2. Timeline

- April 2026: Google revises its billing policy and introduces tiered usage limits (while a specification automatically raising limits from $250 USD to $100K USD under certain conditions coexists)
- 2026-05-21: The Register publishes the initial reporting, "Threat hunters find Google API keys still usable 23 minutes after deletion"
- May 2026: Aikido official blog publishes technical detail and test results, including the report to Google and the "will not fix" response
- 2026-05-22: GIGAZINE follows up in Japanese

> Note: Names and measured values are based on primary sources (Joe Leon's test data on the Aikido security official blog, and The Register's initial reporting). Revocation behavior varies by API type and implementation over time, so consult the latest information. This Brief treats the matter as a researcher's measurement of revocation lag and does not exaggerate real-world impact.

---

## 3. Attack Vector

1. **Initial state**: A developer unintentionally leaks a Google API key (GitHub commit, log output, via third-party tool, screen sharing, etc.)
2. **Detection**: The developer or an automated detection tool recognizes the leak
3. **Revocation attempt**: The developer executes deletion of the API key from the Google Cloud management console
4. **Eventual consistency window**: Deletion information propagates across Google's infrastructure in stages. During this period, depending on the authentication server, the deleted key continues to be judged "valid"
5. **Continued exploitation**: The attacker continues using the leaked key; authentication succeeds when it hits a server where deletion has not yet propagated. In testing, an exploit window of approximately 16 minutes at the median and approximately 23 minutes at the maximum was confirmed
6. **Impact realization**: For Gemini projects, this enables exfiltration of uploaded files and cached conversation content. This counts as data exfiltration impact
7. **Billing escalation**: On the billing side, because the tiered usage limit Google introduced in April 2026 automatically raises the cap under certain conditions, multiple cases of billing in the millions of yen scale within a short time have been reported

---

## 4. Structural Analysis

This incident is a representative case of a structure in which the **"revocation attribute" (valid / revoked) of a credential is operated without independent verification**. Google API keys' assertion of "deleted" is not simultaneously valid across all servers, yet is presented to developers, users, and regulatory reporting as "revoked." The divergence between the asserted attribute and the actual state cannot be made visible without a verification layer.

The primitive differs from Brief 003 (Starlette / BadHost) — here the assertion is "revoked," in Brief 003 it was path-based authentication — but the underlying structure is shared: **a trust assertion is detached from the layer that verifies it**. The structure is also shared with Brief 005 (Noroboto), and is adjacent to Briefs 001 / 002 / 004 (the absence of independent verification of message origin or commit origin) at the cross-cutting layer of credential lifecycle.

---

## 5. The detection–proof gap

In this incident, Aikido measured revocation lag from approximately 1 minute to 23 minutes across 10 trials over 2 days and made the problem visible across the industry. This is a typical success of cross-industry threat hunting by detection firms, and this Brief does not deny the role of detection firms. Detection remains essential for shaping the contours of an event, surfacing cross-industry argument, and prompting cross-organizational operational review.

That said, detection cannot change the structure of revocation lag caused by eventual consistency. Given Google's position of "will not fix," developers and users — as long as they treat a leaked API key as "deleted" — are left with the maximum 23-minute exploitation window unaddressed. This is a structurally independent layer's gap outside the reach of detection.

For the purposes of establishing in regulatory filings, administrative proceedings, or litigation that "the credential was reliably revoked," for cases like this one ("still valid for 23 minutes after deletion"), an independent layer is required between detection scores and proof of revocation. Pre-execution attestation stands in a **complementary**, not substitutive, relationship to detection; the combination of both layers establishes the trust boundary for credential lifecycle.

For the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and Industry Developments

- **Aikido security (Joe Leon)**: Published technical detail and test results on the official blog, presenting the problem to the industry. Includes a recommendation to monitor request status by credential from "APIs and services enabled" in the Google Cloud console. Proposed as a cross-industry operational requirement that "deletion of a leaked Google API key should be treated not as 'immediate completion' but as 'a task that takes about 30 minutes'"
- **Google**: Closed Aikido's report as "will not fix," "operating as intended," "not a security issue." No plans for a fix. The Register also reports no response to its request for comment at the time of publication

What the revocation-speed differences by API type indicate:

- Old Gemini API keys: Up to approximately 23 minutes
- New Gemini API key format: Approximately 1 minute
- Google service account keys: Approximately 5 seconds

This suggests that "faster revocation is technically possible," and Aikido presents the point as a cross-industry argument. Because credential lifecycle design on the service provider side differs by vendor, the need for a layer on the user side to independently verify attribute certainty has emerged as a cross-industry operational issue.

---

## 7. Lemma's Analysis

Lemma's design answers this incident's gap — no independent verification of the revocation attribute and the lag window caused by eventual consistency — by fixing the attribute as a proof decoupled from each server's local state.

- **Attribute provenance binding**: Credential attributes (validity, revocation, scope, expiration, etc.) — for API keys, access tokens, authentication credentials — are committed as independently verifiable cryptographic proofs.
- **Proof-as-auth before use**: The proof is verified before a credential is used, fixing revocation status upstream of use rather than relying on each server's "valid" judgment.
- **Selective disclosure**: By fixing the attribute as a proof, a regulatory reporter or auditor can independently verify just the fact "revoked" without exposing the key itself.
- **Complement to detection**: The revocation lag that Aikido measured and surfaced and a layer that fixes the attribute as a proof function as a two-stage configuration, not opposing approaches.

This is the design philosophy of having the verifier check an attribute fixed as a proof rather than local state — it complements, rather than replaces, the detection layer.

For the design and its scope, see [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/regulatory-attribute-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Aikido security technical analysis**: "Google API keys keep working after you delete them long enough to be exploited" by Joe Leon (2026-05, Aikido official blog, including measurement data across 10 trials over 2 days, technical detail, and the report-to-Google history) — https://www.aikido.dev/blog/google-api-keys-deletion
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
