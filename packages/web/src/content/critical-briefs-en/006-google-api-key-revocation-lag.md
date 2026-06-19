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
---

## TL;DR

In May 2026, Joe Leon, a researcher at the security firm Aikido, disclosed that Google API keys can continue to authenticate for up to approximately 23 minutes after deletion. Across 10 trials, revocation lag was as short as approximately 8 minutes, with a median of approximately 16 minutes and a maximum of approximately 23 minutes. The cause is Google's eventual-consistency design: deletion information propagates across the infrastructure in stages. Even after a developer who recognizes a leaked API key executes deletion, an attacker can succeed in authentication by hitting "servers where the deletion has not yet propagated" via high-volume requests. For Gemini projects, this enables exfiltration of uploaded files and cached conversation content; on the billing side, cases of damages in the millions of yen scale have been reported. The new Gemini API key format propagates in approximately 1 minute and service account keys in approximately 5 seconds, which Aikido points to as evidence that faster revocation is technically possible. Google has taken the position that this is "operating as intended, not a security issue" and will not fix it. This incident is a representative case of a structure in which the revocation attribute of credentials is not independently verified.

---

## 1. Incident Overview

- **Disclosure**: May 2026, Joe Leon of Aikido security, Aikido official blog
- **Venue**: "Google API keys keep working after you delete them long enough to be exploited"
- **Scope**: All Google API keys (Gemini, BigQuery, Maps, and other Google Cloud APIs)
- **Measured revocation lag**: Minimum approximately 8 minutes, median approximately 16 minutes, maximum approximately 23 minutes (10 trials over 2 days)
- **Test conditions**: After creating and deleting an API key, send 3–5 requests per second continuously and measure the timestamp of the last successful authentication. Additional 5 trials conducted across three regions: US East, Western Europe, and Southeast Asia
- **Revocation-speed differences by API type**: Old Gemini API keys (maximum approximately 23 minutes), new Gemini API key format (approximately 1 minute), Google service account keys (approximately 5 seconds)
- **Google's response**: Treated Aikido's report as "will not fix," "operating as intended," and "not a security issue," and closed it

---

## 2. Timeline

- April 2026: Google revises its billing policy and introduces tiered usage limits (while a specification automatically raising limits from $250 USD to $100K USD under certain conditions coexists)
- 2026-05-21: The Register publishes the initial reporting, "Threat hunters find Google API keys still usable 23 minutes after deletion"
- May 2026: Aikido official blog publishes technical detail and test results, including the report to Google and the "will not fix" response
- 2026-05-22: GIGAZINE follows up in Japanese

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

Against the detection–proof gap exposed by this incident (no independent verification of the revocation attribute of credentials, the lag window caused by eventual consistency), Lemma proposes a design that commits credential attributes (validity, revocation, scope, expiration, etc.) — for API keys, access tokens, authentication credentials — as independently verifiable cryptographic proofs, so that a verifier (the receiving server, regulatory reporter, auditor) can independently verify the attribute fixed as a proof without relying on the local state of each server. Even when a revocation-lag window exists due to eventual consistency, the proof tells the verifier through a separate channel whether "this credential is revoked / is still valid."

---

## 8. Sources

- **Aikido security technical analysis**: "Google API keys keep working after you delete them long enough to be exploited" by Joe Leon (2026-05, Aikido official blog, including measurement data across 10 trials over 2 days, technical detail, and the report-to-Google history) — https://www.aikido.dev/blog/google-api-keys-deletion
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
