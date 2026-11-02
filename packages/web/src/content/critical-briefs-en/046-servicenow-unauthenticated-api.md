---
brief_no: 46
title: "ServiceNow：認証を求めない設定の REST エンドポイントから、一部の顧客のインスタンスが照会された(ServiceNow のアドバイザリ)"
title_en: "ServiceNow: a REST endpoint set not to require authentication let some customers' instances be queried (ServiceNow advisory)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-06-09
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["006-google-api-key-revocation-lag", "033-f5-bigip-edge-pivot", "029-github-dev-oauth-token", "013-coinbase-kyc-insider-breach"]
status: published
layout: "report"
sections: "proof"
gate: "identity"
version: "1.0"
og_lead_ja: "ServiceNow：認証を求めない設定の REST エンドポイントから、一部の顧客のインスタンスのテーブルが照会された"
og_lead_en: "ServiceNow: a REST endpoint set not to require authentication let some customers' instance tables be queried"
og_kicker_ja: "セキュリティ事案 · 認証の無い API"
og_kicker_en: "SECURITY INCIDENT · UNAUTHENTICATED API"
og_headline_ja: "認証の無い API で、\n顧客のテーブルが\n照会されたと公表。\n<accent>一部の顧客で照会が成功</accent>"
og_headline_en: "ServiceNow says an\nendpoint with no auth\nlet tables be queried.\n<accent>Some customers affected</accent>"
key_figures:
  - value: "06-02 → 06-05"
    label: "From suspicious access being observed to ServiceNow making the endpoint require authentication"
    tone: "alert"
  - value: "04-22"
    label: "The day ServiceNow received a confidential bug bounty report describing a similar issue"
  - value: "06-09"
    label: "Affected customers notified (a bulletin inside the support portal and individual support cases)"
glossary:
  - term: "Scripted REST Resource"
    desc: "A resource in a ServiceNow instance that can be called as a REST API. The `requires_authentication` setting decides whether a call must be authenticated."
  - term: "Instance"
    desc: "The environment ServiceNow hosts for each customer. It holds IT support tickets, employee records, asset inventories, security-incident records, workflow data and more."
  - term: "Bug bounty"
    desc: "A program that takes bug reports from outside researchers and pays rewards for them."
insight:
  slug: "auth-left-to-a-setting"
  label: "Authentication left to one setting"
  quote: "When whether to accept a request is left to a single setting, then once that setting is off, a request from anyone is handled the same way."
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Return no data until the requester's authentication is confirmed"
impact: "Unauthenticated queries of instance tables succeeded for some customers (per ServiceNow)"
takeaway: "Left set not to require authentication, the endpoint answered unauthenticated requests too. Before returning data, check that the requester is allowed to make that query."
self_check: "For an API that returns customer data, can you check before returning it, apart from the endpoint's settings, that the requester is allowed to make that query?"
countries: ["global"]
---

## 1. Summary

In ServiceNow's hosted instances, a Scripted REST Resource shipped set not to require authentication (`requires_authentication=false`). Requests were accepted with no session, token or credential check, and ServiceNow confirmed evidence that queries against instance tables succeeded for some customers. ServiceNow switched the setting to require authentication and says the observed activity likely came from researcher- or customer-led research. <strong>When whether to accept a request is left to a single setting, then once that setting is off, a request from anyone is handled the same way.</strong>

## 2. What got through

- **What got through**: Requests with no session, token or credential to a Scripted REST Resource set not to require authentication (`/api/now/related_list_edit/create`), and the resulting queries against customer-instance tables. For some customers, the queries succeeded (ServiceNow).
- **What reached the receiving side**: In general, an endpoint set not to require authentication handles a request the same way whoever sent it. Each request looks normal at the protocol level, and the missing setting shows up from outside as a normal response.
- **What could follow the queries**: A ServiceNow instance can hold IT support tickets, employee records, asset inventories, security-incident records and workflow data, plus API keys and credentials pasted into ticket bodies. Depending on what was accessed, this could lead to secondary credential exposure. These are possibilities, not confirmed harm.
- **Not disclosed**: Which data was accessed. Who was behind the activity (ServiceNow said it was likely tied to researcher- or customer-led research associated with the bug bounty, not necessarily malicious actors). Whether a CVE will be issued (said to be under consideration).

## 3. What to check

Whatever the route, the condition for telling them apart is that the side returning data checks, before returning it and apart from the endpoint's settings, who the requester is and whether they are allowed to make that query.

- **Who approves**: The person who decides which requesters may query which tables, and within what scope, such as the instance administrator. Who is allowed and how far is decided apart from the endpoint's settings.
- **Where it is checked**: Just before data is returned. Check the requester's authentication and that the query is within the allowed scope; a request that cannot be checked gets no data. This check remains even if an endpoint's setting is off.
- **What is recorded**: Which requester queried which table under which approval, kept apart from the fact that the endpoint responded.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before data is returned, the requester's authentication and that the query is within the allowed scope, and keeping a record. Detection means noticing anomalous activity after it surfaces. The dates below are when reports, observations, changes and notifications happened, not necessarily when the endpoint came to have this setting.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before returning data, check the requester's authentication and the scope of the query</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>With no authentication,<br>some customers' tables were queried</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Detecting anomalous activity, tracing the queries in logs, changing the setting</div>
<div class="rx-g g1"><div class="t">04-22</div><b>Report of a similar issue received</b></div>
<div class="rx-g g2"><div class="t">06-02</div><b>Suspicious access observed</b></div>
<div class="rx-g g3"><div class="t">06-05</div><b>Endpoint made to require auth</b></div>
<div class="rx-g g4"><div class="t">06-09</div><b>Affected customers notified</b></div>
</div>
</figure>

Detecting the activity and changing the setting work after a state has arisen in which unauthenticated requests can be processed; they are not a way to check, before data is returned, that the requester is allowed to make the query. Other cases where the state of authentication or authorization was taken as a premise of trust are [Google API key revocation](/critical/briefs/006-google-api-key-revocation-lag/) (keys stayed valid after deletion) and [the github.dev OAuth token](/critical/briefs/029-github-dev-oauth-token/) (the token was not scoped to the repository being viewed).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that returns data.** It does not look for weaknesses or anomalous activity; it checks, before data is returned and apart from the endpoint's settings, that the requester is allowed to make that query.

### Industries and operations to watch

- **Industry · Any sector**: Organizations using a SaaS such as ServiceNow that gathers IT support, employee and asset records in one place. Ticket bodies can contain API keys and credentials.
- **Operation · Lookup & data access**: APIs that return customer data. When whether to require authentication is left to a per-endpoint setting, one setting being off removes the check on the requester altogether.

### Current controls vs Lemma

What this incident was confirmed to involve is column 1; column 2 is queries by requests that did pass authentication, and column 3 is secondary exposure from the data queried.

| Control | Unauthenticated requests querying tables | Authenticated requests querying beyond the allowed scope | Exposure of credentials in the tickets queried |
| --- | --- | --- | --- |
| Changing the endpoint setting to require authentication | Partial | Not relevant | Not relevant |
| Continuous checks for configuration drift | Partial | Not relevant | Not relevant |
| Anomaly detection and log tracing (after acceptance) | Not effective | Not effective | Not effective |
| Not storing credentials in tickets or workflows | Not relevant | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not relevant |

Requiring authentication in the setting stops unauthenticated requests from being accepted, but it depends on each endpoint's setting staying correct. Checks for configuration drift shorten how long a wrong setting goes unnoticed, but requests are processed until it is noticed. Anomaly detection and log tracing come after the requests are processed. Keeping credentials out of tickets reduces secondary exposure if the tickets are queried, but does not stop the queries. Lemma checks the requester's authentication and the scope of the query before data is returned, and keeps a record of which requester queried which table under which approval.

Note: Lemma's check works only when it is built in just before data is returned and the approvals are managed apart from the endpoint's settings. If the allowed scope is set loosely, queries within it still get through. Lemma does not delete data already accessed or rotate credentials left in tickets. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for SaaS APIs that return customer data

- Do you keep a list of the resources in your instance that are set not to require authentication?
- Is it your practice not to paste API keys or passwords into ticket or workflow bodies?
- Can you see, outside the instance, a record of which request queried which table under whose approval?

## 5. Facts and timeline

- **Subject**: ServiceNow's hosted customer instances (the Australia platform release, or customers on older releases who made certain configuration changes).
- **What was confirmed**: A Scripted REST Resource shipped with `requires_authentication=false`, accepting requests without checking session, token or credential. The endpoint in question is `/api/now/related_list_edit/create`.
- **Observed activity**: ServiceNow detected "anomalous activity" related to this issue and confirmed evidence that, for some customers, queries against instance tables succeeded. The activity traces back to June 2–3, with the external IP `51.159.98.241` reaching the endpoint.
- **Remediation**: On 2026-06-05, ServiceNow changed the endpoint configuration to limit access to authenticated users (setting `requires_authentication` to `true`).
- **Data**: An instance can hold IT support tickets, employee records, asset inventories, security-incident records and workflow data, plus API keys and credentials pasted into ticket bodies. Which data was accessed has not been disclosed.
- **Disclosure**: On 2026-06-09, ServiceNow notified affected customers via a bulletin inside the support portal (behind customer login) and individual support cases. On June 10 it published an additional advisory on the Trust portal.

### Timeline

- **2026-04-22**: ServiceNow receives a confidential bug bounty report describing a similar issue.
- **2026-06-02**: Suspicious access to the endpoint is observed (through June 3; external IP `51.159.98.241`). For some customers, successful queries against instance tables are confirmed.
- **2026-06-05**: ServiceNow applies an update to hosted instances changing the endpoint configuration to require authentication.
- **2026-06-09**: Affected customers are notified via support bulletin and individual cases. BleepingComputer reports.
- **2026-06-10**: ServiceNow updates the advisory on the Trust portal. It states the observed activity is likely tied to researcher- or customer-led research associated with the bug bounty, not necessarily malicious actors, and that a CVE is under consideration.

> The facts here rest on ServiceNow's Trust portal advisory and reporting by BleepingComputer and SOCRadar. ServiceNow is still considering whether to issue a CVE, and who was behind the activity and the scope of data accessed depend on how the investigation proceeds, so this Brief asserts neither. What has not been disclosed does not mean there were no controls.

### After disclosure

- **ServiceNow**: After detecting the anomalous activity, it applied an update on June 5 making the endpoint require authentication. On June 9–10 it notified affected customers and updated the advisory on the Trust portal. It stated the observed activity is likely tied to researcher- or customer-led research associated with the bug bounty, and that a CVE is under consideration.
- **Disclosure questions**: That the initial bulletin sat behind customer login and was not widely visible, and the time from the April 22 bug bounty report to the June 5 update, have been raised externally as points of concern.
- **Industry questions**: In SaaS APIs, when authentication and authorization are left to endpoint configuration, a single missing setting removes the authorization check itself. Discussion is moving toward not treating configuration state as grounds for authorization, and instead verifying scoped authorization and provenance per request. Not storing credentials in tickets or workflows, and continuous checks for configuration drift, are also raised as operational points.

## 6. Sources

- **ServiceNow Trust (primary)**: Security notification (2026-06; advisory on unauthenticated access, observed activity, and the bug bounty report) — <https://trust.servicenow.com/notifications/1205429e-fea3-4cbf-b37b-8cd3a4e07aef>
- **BleepingComputer**: "ServiceNow discloses security incident exposing customer data" (2026-06-09, updated 6-10; endpoint, configuration, timeline) — <https://www.bleepingcomputer.com/news/security/servicenow-discloses-security-incident-exposing-customer-data/>
- **SOCRadar**: "ServiceNow Breach: Customer Data Exposed Through Unauthenticated API Access" (2026-06; scope of impact, response) — <https://socradar.io/blog/servicenow-breach-customer-api-access/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
