---
brief_no: 46
title: "設定ひとつで認証が外れ、未認証のまま顧客インスタンスが照会された — ServiceNow の REST エンドポイントが、要求者の認可を実行前に証明していなかった構造"
title_en: "ServiceNow Scripted REST Endpoint Served Customer Data Without Authentication"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-06-09
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["006-google-api-key-revocation-lag", "033-f5-bigip-edge-pivot", "029-github-dev-oauth-token", "013-coinbase-kyc-insider-breach"]
status: published
version: "1.0"
og_lead_ja: "設定一つで認証が外れ、未認証で顧客インスタンスが照会された — ServiceNow"
og_lead_en: "A flipped auth flag let an unauthenticated API query customer instances — ServiceNow"
gap_detected: "ServiceNow detected the suspicious access as anomalous activity and could trace the query trail from the logs."
gap_missing: "There was no layer to confirm before responding whether the requester was permitted to query this customer data, so with a single auth flag flipped off the request passed straight through."
gap_fix: "Before returning data, independently verify with Lemma that the request is authorized for this subject within this scope, and prevent it up front."
---

## TL;DR

ServiceNow disclosed that a Scripted REST endpoint had shipped with `requires_authentication=false`, letting customer-instance tables be queried with no session, token, or credential check; unauthenticated requests queried customer data successfully. Anomaly detection and log tracing act only after such requests could already be processed — after-the-fact detection. What is structurally missing is a layer that verifies, before the response, whether this requester may query this customer data; with a single auth flag flipped off, the request passed straight through. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident overview

- **Scope**: ServiceNow hosted customer instances (the Australia platform release, or customers on older releases who made certain configuration changes).
- **Disclosure**: On 2026-06-09, ServiceNow notified affected customers via a bulletin inside the support portal (behind customer login) and via individual support cases. On 6-10 it published an additional advisory on the Trust portal.
- **Where the flaw sat**: A Scripted REST Resource shipped with `requires_authentication=false`, accepting requests without checking session, token, or credential. The endpoint in question is `/api/now/related_list_edit/create`.
- **Observed activity**: ServiceNow detected "anomalous activity" related to this issue and confirmed evidence that, for some customers, queries against instance tables succeeded. The activity traces back to June 2–3, with the external IP `51.159.98.241` reaching the endpoint.
- **Remediation**: On 2026-06-05, ServiceNow changed the endpoint configuration to limit access to authenticated users only (setting `requires_authentication` to `true`).
- **Potentially affected data**: A ServiceNow instance can hold IT support tickets, employee records, asset inventories, security-incident records, and workflow data — plus API keys and credentials embedded in ticket bodies. Which data was actually accessed has not been disclosed.
- **The crux**: Not the fact that the flag meant to enforce authentication was off, but that **"does this requester hold the authorization to perform this data query" was not independently verified before the endpoint responded**.

---

## 2. Timeline

- 2026-04-22: ServiceNow receives a confidential bug bounty submission describing a similar issue.
- 2026-06-02 to 03: Suspicious access to the endpoint is observed (external IP `51.159.98.241`). For some customers, successful queries against instance tables are confirmed.
- 2026-06-05: ServiceNow applies an update to hosted instances changing the endpoint configuration to require authentication.
- 2026-06-09: Affected customers are notified via support bulletin / individual cases. BleepingComputer reports.
- 2026-06-10: ServiceNow updates the advisory on the Trust portal. It states the observed activity is likely tied to researchers / customer-led research associated with the bug bounty, rather than malicious actors, and that a CVE is still under consideration.

> Note: ServiceNow is still evaluating whether to issue a CVE, and the identity of the actors and the scope of data accessed depend on the progress of the investigation, so this text asserts none of them.

---

## 3. Attack vector

This incident stems from a structure in which the endpoint never independently verifies the requester's authorization before responding. The path by which the failure propagates into data queries is as follows.

1. **The missing auth flag**: The Scripted REST Resource shipped with `requires_authentication=false`, in a state where it accepted requests without checking session, token, or credential.
2. **Accepting the unauthenticated request**: An attacker (or researcher) reached `/api/now/related_list_edit/create` unauthenticated. The endpoint responded as if "being called == permitted to process."
3. **Querying instance tables**: Without passing an authentication boundary, queries went through to customer-instance tables, creating a state in which internal data could be reached.
4. **Possible spillover to stored secrets**: Because ServiceNow tickets and workflows can contain API keys and credentials, depending on what data was accessed, this can chain into secondary credential exposure.
5. **After-the-fact remediation**: The configuration was changed to require authentication after the anomaly was detected. But this acts after the endpoint could already respond unauthenticated — an after-the-fact measure.

---

## 4. Structural analysis

This incident belongs to the reading of Pillar 03 (Agent Authority Proof) as proof of authority and identity for actors in general — not only AI agents. The central failure primitive is that **a request to the endpoint was accepted by relying on a configuration-level assumption — "authentication is surely being enforced" — rather than making the requester prove their authorization per action.** We note `agent-infrastructure` (the API as an infrastructure layer) and `attribute-proof-bypass` (the "authenticated" attribute presumed without authenticity verification) as secondary categories.

The API's authorization model is the crux. A setting like `requires_authentication` substitutes the question of whether the calling actor is legitimately authorized with the assumption that "the configuration guarantees it." The moment that one setting is off, the authorization check itself disappears. This incident shows that, by entrusting authentication to "the state of a flag," there was no layer to independently verify — before the response — **which data, on whose authorization, the requester may query.**

It is the same family as Brief 006 (the revocation attribute of a Google API key was not independently verified, and the key stayed valid even after deletion): a structure in which the state of authentication/authorization is taken as a premise of trust but is not independently verified. It shares its root with Brief 033 (positional trust of an edge device plus stored credentials let lateral movement be accepted) in that "a once-established trust premise carries over without being bound to the scope of the action," and with Brief 029 (an OAuth token valid for all repositories rather than scoped to the target) in that authorization is not bound to the scope of the action. This incident is a real-world case where that primitive surfaced at the **API boundary of enterprise SaaS** and spilled over into the queryability of entire customer instances.

---

## 5. The gap between detection and proof

ServiceNow's anomaly detection, application of the configuration update, notification of affected customers, and the visibility provided by external researchers and reporting are indispensable for grasping impact, containment, and prevention, and this Brief does not negate their role. Identifying the exposed endpoint, scrutinizing logs, and rotating credentials embedded in tickets are the highest-priority operational responses.

At the same time, detection does not change "may this requester perform this data query" itself. The queries in this incident proceeded through a legitimate REST endpoint, and each request, on its own, looks protocol-normal. The missing setting manifests externally as a normal response, and by the time it was detected, unauthenticated requests could already be processed. What was missing was the response-time independent verification of "does this requester hold the authorization and provenance to perform this query, within this scope" — a chain distinct from anomaly detection or after-the-fact log tracing. As long as the state of a configuration flag is equated with proof of authorization, detection cannot help but trail the exposure.

Pre-execution attestation adopts a design that inverts authentication from "is the configuration enforcing authentication" to "response-time verification of whether this request carries scoped authorization and provenance." Instead of depending on the endpoint's configuration state, it makes each request present a verifiable, scoped, non-reusable proof — so that even if one setting is off, if the proof says "this query lacks legitimate authorization/provenance," the response is blocked beforehand. Detecting anomalies (the detection-style "is this request unusual") and attesting requests beforehand (the "does this query carry authorization/provenance") are not substitutes but **complements**.

---

## 6. Response and industry trends

- **ServiceNow**: After anomaly detection, it applied an update on 6-05 changing the endpoint to require authentication. On 6-09 to 10 it notified affected customers and updated the advisory on the Trust portal. It stated the observed activity is likely tied to researchers / customer-led research associated with the bug bounty, and that a CVE is under consideration.
- **Disclosure questions**: The fact that the initial bulletin sat behind customer login and was not widely visible, and the time it took from the 4-22 bug bounty report to the 6-05 update, have been raised externally as points of concern.
- **Cross-industry questions**: In SaaS APIs, a design that places authentication/authorization on the premise that "the endpoint configuration guarantees it" becomes an amplifier in which a single missing setting wipes out the authorization check itself. The debate is shifting the center of gravity of API identity design toward not equating configuration state with proof of authorization, but verifying scoped authorization and provenance per request (proof-as-auth / per-request attestation). Not storing credentials in tickets or workflows, and continuous inspection for configuration drift, are also operational points.

---

## 7. Lemma's analysis

Against the structure this incident exposed (a request to the endpoint is accepted by relying on a configuration-level premise rather than making the requester prove authorization per action), Lemma proposes a design that inverts authentication from "is the configuration enforcing authentication" to "response-time proof of scoped authorization and provenance per request." Under the proof-as-auth idea, where a proof is presented without depending on configuration state or long-lived credentials, even if one endpoint setting is off, the query is rejected beforehand unless the proof of legitimate authorization/provenance holds. By binding the endpoint's response to a pre-execution attestation of "this request carries authorization/provenance" rather than "it was called," unauthorized queries can be distinguished before execution even amid configuration drift or unauthenticated requests.

---

## 8. Sources

- **ServiceNow Trust (primary)**: Security notification (2026-06; advisory on unauthenticated access, observed activity, and the bug bounty report) — <https://trust.servicenow.com/notifications/1205429e-fea3-4cbf-b37b-8cd3a4e07aef>
- **BleepingComputer**: "ServiceNow discloses security incident exposing customer data" (2026-06-09, updated 6-10; endpoint, configuration, timeline) — <https://www.bleepingcomputer.com/news/security/servicenow-discloses-security-incident-exposing-customer-data/>
- **SOCRadar**: "ServiceNow Breach: Customer Data Exposed Through Unauthenticated API Access" (2026-06; scope of impact, response) — <https://socradar.io/blog/servicenow-breach-customer-api-access/>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
