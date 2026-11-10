---
brief_no: 197
title: "Cloudflare：BYOIP の掃除用の定期処理が、値の空の条件を「すべて」と解釈し、顧客の IP アドレスの経路を取り下げた(同社の事後報告)"
title_en: "Cloudflare: A recurring BYOIP cleanup task read a condition with no value as \"all\" and withdrew the routes of customers' IP addresses (Cloudflare's post-mortem)"
pillar: 03-agent-authority
primary_category: agent-runaway
secondary_categories: [agent-infrastructure]
incident_date: 2026-02-20
published: 2026-11-10
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["007-pocketos-cursor-db-deletion", "080-replit-agent-code-freeze-data-loss"]
status: draft
version: "1.0"
og_lead_ja: "Cloudflare で、BYOIP の掃除用の定期処理が空の条件を「すべて」と解釈し、顧客の約 1,100 の IP プレフィックスの経路を取り下げた"
og_lead_en: "At Cloudflare, a recurring BYOIP cleanup task read an empty condition as \"all\" and withdrew the routes of about 1,100 customer IP prefixes"
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "システム障害事例 · 自動処理の削除"
og_kicker_en: "OUTAGE · AUTOMATED DELETION"
og_headline_ja: "掃除の定期処理が、\n空の条件を全件と読み、\n顧客の経路を消した。\n<accent>約 1,100 件・6 時間</accent>"
og_headline_en: "A cleanup task read\nan empty filter as \"all\"\nand pulled customer IPs.\n<accent>~1,100 prefixes, 6 hours.</accent>"
key_figures:
  - value: "About 1,100"
    unit: "prefixes"
    label: "BYOIP prefixes whose routes were withdrawn (about 25% of the 4,306 BYOIP prefixes; 17:56 to 18:46 UTC; Cloudflare's post-mortem)"
    tone: "alert"
  - value: "17:56 → 23:03"
    label: "From the start of impact until every prefix was restored (2026-02-20, UTC; Cloudflare puts the incident at 6 hours 7 minutes)"
  - value: "About 300"
    unit: "prefixes"
    label: "Prefixes whose service configurations were removed from the edge, so customers could not restore them from the dashboard (Cloudflare's post-mortem)"
glossary:
  - term: "BYOIP (Bring Your Own IP)"
    desc: "A service in which a customer brings its own IP address ranges to Cloudflare and has Cloudflare's network advertise them to the internet."
  - term: "Prefixes and route advertisement"
    desc: "A prefix is a block of IP addresses. Advertising its route over BGP lets internet traffic reach it; withdrawing the route means traffic to those addresses no longer arrives."
  - term: "Service binding"
    desc: "The setting that ties a prefix to the service it is used for, such as the CDN or Magic Transit. If it is removed, the service does not work even when the route is advertised again."
insight:
  slug: "cleanup-scope-from-query-alone"
  stop: true
  label: "A deletion scoped by a query result alone"
  quote: "Before a recurring task deletes customer configuration, check the number and scope of targets against the record of customers' deletion requests, not the query result."
industries: ["developers", "supply-chain"]
operations: ["approval"]
controls:
  - slug: "bound-automation"
    item: "Cap how many items and what scope a recurring task can delete in one run, and do not run it when a condition is empty or unspecified"
  - slug: "hold-unverified"
    item: "Hold, before execution, any deletion whose count does not match the record of customers' deletion requests"
  - slug: "audit-trail"
    item: "Record, apart from the task, which task deleted which customer's configuration under which condition, together with the prior state"
attack_method: "human-error"
impact: "Routes of about 1,100 BYOIP prefixes were withdrawn, affecting some customers using the CDN, Spectrum, Dedicated Egress and Magic Transit for about six hours (Cloudflare's post-mortem). Not an attack"
takeaway: "A recurring BYOIP cleanup task passed a condition with no value, which was read as \"all BYOIP prefixes\", and withdrew about 1,100 routes. A query result is not necessarily the right set of targets. Before deleting, check the count and scope against the record of deletion requests."
self_check: "Do you know the per-run cap on what a recurring automated task can delete from customer configuration, and how it handles the condition that selects its targets?"
countries: ["us"]
---

## 1. Summary

On 20 February 2026, routes for customer prefixes in Cloudflare's BYOIP service (which advertises customers' own IP addresses from Cloudflare) were withdrawn over BGP. According to Cloudflare's post-mortem, about 1,100 prefixes were withdrawn between 17:56 and 18:46 UTC, about 25% of the 4,306 BYOIP prefixes. Connections failed for some customers using the CDN and security services, Spectrum, Dedicated Egress and Magic Transit, and everything was restored at 23:03 UTC. Cloudflare says the cause was an internal change, not an attack.

The cause was a cleanup task that regularly looks for prefixes customers have asked to remove and removes them. It passed a pending_delete condition with no value, and the API read the empty value as a request for all BYOIP prefixes. The task went on deleting prefixes and related objects such as service bindings until an engineer noticed and stopped it. Cloudflare lists a stricter type for API conditions, configuration rollouts that can be reverted, and a mechanism that halts rollouts on changes that are too fast or too broad.

<strong>A condition that selects deletion targets reaches the accepting side in the same form as a correct request, whether it is empty or wrong.</strong>

## 2. What got through

- **What got through**: Deletion of BYOIP prefixes and related configuration through the Addressing API. A recurring cleanup task, merged on 5 February and deployed to production at 17:46 UTC on 20 February, ran it from 17:56 UTC. In its query for prefixes pending deletion the task passed pending_delete with no value, and the API treated this as a request for all BYOIP prefixes rather than those pending deletion (Cloudflare's post-mortem).
- **What reached the accepting side**: In general, an API that manages configuration receives queries and deletion requests from a legitimate task. It does not receive whether the query condition is what was intended, or whether the number returned matches the customers' requests. Cloudflare says testing focused on the self-service API path customers use and missed the case where the task changes user data without explicit input. Staging data was not close enough to production.
- **Not disclosed**: How often the recurring task ran. How many prefixes were actually pending deletion. How many customers were affected (Cloudflare says not all BYOIP customers were). Whether the task had a cap on how many items it could delete in one run.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a recurring task deletes customer configuration, the number and scope of targets are checked against the record of deletion requests customers made, apart from the task's own query result.

- **Who approves**: The customer who owns the prefix. When it requests deletion in the dashboard or API, a record of which prefixes to remove is kept in a form the cleanup task cannot produce.
- **Where it is checked**: The step at which the cleanup task executes the deletion. If the targets returned by the query do not match the record of deletion requests by count and by prefix, if a condition is empty or unspecified, or if one run exceeds the cap, the deletion is held before execution.
- **What is recorded**: Which task deleted which customer's prefixes and bindings, under which condition. It is kept apart from the task, together with the prior state, as a basis for restoring.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a recurring task deletes customer configuration, the number and scope of targets against the record of deletion requests, and keeping a record. Detection means noticing failed connections and stopping the task. Times are UTC on 2026-02-20 and rely on Cloudflare's post-mortem.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the targets against customers' deletion requests by count before executing</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Routes of about 1,100 prefixes withdrawn<br>About 300 could not be restored from the dashboard</span></div>
<div class="rx-zone det"><b>Detection · noticed after 17 minutes, stopped after 50</b>Failures on 1.1.1.1 noticed; an engineer stops the task</div>
<div class="rx-g g1"><div class="t">17:46</div><b>The release with the cleanup task reaches production</b></div>
<div class="rx-g g2"><div class="t">17:56</div><b>The task runs and withdrawals begin</b></div>
<div class="rx-g g3"><div class="t">18:46</div><b>An engineer stops the task and disables regular execution</b></div>
<div class="rx-g g4"><div class="t">23:03</div><b>The global configuration rollout completes and impact ends</b></div>
</div>
</figure>

The task was stopped 50 minutes after withdrawals began, and full restoration took about four more hours. Cases where an AI agent ran an operation that deleted production data without human approval include [PocketOS](/critical/briefs/007-pocketos-cursor-db-deletion/) (one API call deleted the production database and its backups) and [Replit](/critical/briefs/080-replit-agent-code-freeze-data-loss/) (the production database was deleted during a code freeze). Here it was not AI but a legitimate recurring task written by people that, with an empty condition, deleted customer configuration without narrowing its targets.

## 4. What Lemma does

**Lemma builds the pre-execution check into the step at which the cleanup task deletes customer configuration.** It does not look for outages; it checks, before execution, that the targets rest on customers' deletion requests.

### Industries and operations to watch

- **Industry · Developers & IT**: Cloud and network providers that create, change and delete customer configuration and resources through recurring tasks and automation. One task reaches many customers' configuration.
- **Industry · Procurement & supply chain**: Companies that leave IP address advertisement and network routing to an outside provider. Here Laravel Cloud says it was unreachable for about 3 hours 15 minutes while its own infrastructure stayed up.
- **Operation · Approval & sign-off**: Bulk operations that delete customer configuration, and confirming their scope (count and targets).

### Current controls vs Lemma

The route in this case is column 1 (a recurring task deleted beyond the requested scope because of a wrong condition). Column 2 covers a human operator issuing a bulk deletion with a wrong condition; nothing disclosed says that happened here. Column 3 is restoring deleted configuration; every control below stops or narrows execution, so none works there.

| Control | Wrong condition in a recurring task | Wrong bulk deletion by a human operator | Restoring deleted configuration |
| --- | --- | --- | --- |
| Code review and testing | Partial | Not effective | Not effective |
| Connectivity monitoring and detection | Partial | Partial | Not effective |
| Halting rollouts on changes too fast or too broad (Cloudflare's remediation) | Partial | Partial | Not effective |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Code review and testing catch errors before production, but here they focused on the self-service path and missed the case with no explicit input. Monitoring and detection worked here through failures on 1.1.1.1, but only after about 1,100 prefixes had been withdrawn over about 50 minutes. The change breaker Cloudflare lists looks at the speed and breadth of changes, so a wrong deletion below its threshold can pass. Lemma checks, before execution, not the volume of change but whether the targets match the record of customers' deletion requests.

Note: Lemma's check works only when it is built into the step at which the cleanup task executes deletions and the record of customers' deletion requests is managed apart from the task's query. If the request record itself is wrong, it can pass. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect outages, and it does not restore deleted configuration or data.

### Checklist

Three things to confirm about automated tasks that change and delete customer configuration

- When a condition passed to an automated task is empty or unspecified, does the API reject the request rather than read it as "all"?
- Does your staging environment hold data close to production in volume and shape, and do you test paths that change user data without explicit input?
- When an automated task deletes configuration, can you identify from records which customer lost what, and restore the prior state without waiting for customers to act?

## 5. Facts and timeline

- **Parties**: Cloudflare, Inc. (United States) and customers using its BYOIP service. This Brief relies on Cloudflare's post-mortem and the Cloudflare Status record (both primary), and on the incident report of Laravel Cloud, an affected customer.
- **What happened**: According to Cloudflare's post-mortem, as part of its Code Orange: Fail Small work it introduced a change to automate the removal of BYOIP prefixes, which customers had been requesting manually. A sub-task within it, which regularly looks for prefixes that should be removed and removes them, passed pending_delete with no value, and the server side read the empty value as a request for all BYOIP prefixes rather than those pending deletion. The task began systematically deleting all BYOIP prefixes and their related objects, including service bindings, and continued until an engineer noticed and stopped it. Because the change was applied iteratively rather than all at once, the impact differed by customer.
- **Impact**: Between 17:56 and 18:46 UTC, about 1,100 of the 6,500 prefixes advertised to one peer were withdrawn. BYOIP accounted for 4,306 of them, so about 25% were withdrawn. On the CDN and security services, connections to affected sites failed; Spectrum apps could not proxy traffic; Dedicated Egress customers could not send traffic to their destinations; and applications protected by Magic Transit timed out. The 1.1.1.1 website returned HTTP 403, but DNS resolution through 1.1.1.1 (including DNS over HTTPS) was not affected. Cloudflare puts the incident at 6 hours 7 minutes.
- **Why restoration took long**: Prefixes were affected in different ways. Those that were only withdrawn could be re-advertised by customers from the dashboard, but those that lost some or all service bindings could not. For about 300 prefixes, a software bug had removed their service configurations from the edge, so they could not be restored from the dashboard and a configuration update was rolled out to every machine on the edge.
- **Why it was missed**: Cloudflare says staging data was not close enough to production and the mock data was insufficient. Testing and initial code review focused on the self-service API path customers use and did not cover the case where the task changes user data without explicit input.

### Timeline

- **2026-02-05**: The code containing the cleanup task is merged (21:53 UTC).
- **2026-02-20**: The release reaches production at 17:46 UTC. At 17:56 the task runs and withdrawals begin.
- **2026-02-20**: At 18:13 Cloudflare engages over failures on 1.1.1.1; at 18:18 an internal incident is declared; at 18:21 the Addressing API team is paged. At 18:45 the first Cloudflare Status post appears. At 18:46 an engineer stops the task and disables regular execution.
- **2026-02-20**: At 19:19 customers can re-advertise from the dashboard. At 20:30 a release restores prefixes that still had bindings. At 21:08 a configuration rollout across the edge begins; it completes at 23:03 and impact ends. At 23:50 Cloudflare Status marks the incident resolved.
- **2026-02-21**: Cloudflare publishes its post-mortem.

> The facts rely on Cloudflare's post-mortem and the Cloudflare Status record (both primary). The post-mortem gives 17:48 UTC as the start in its opening and 17:56 UTC as the start of impact in its timeline; this Brief uses the timeline value. The "about 25%" in the post-mortem is a share of BYOIP prefixes, not of customers. The number of affected customers, how often the task ran and how many prefixes were actually pending deletion have not been disclosed. Laravel Cloud's times rely on its own incident report. What has not been disclosed does not mean there were no controls. This Brief does not evaluate Cloudflare's response. Written as of 10 November.

### After disclosure

- **Cloudflare**: To prevent recurrence, it will replace the string-typed pending_delete condition with a standardised schema that is easier to validate; separate the configuration customers change from the state running in production, deploying configuration snapshots through health-mediated rollouts that can be quickly reverted; and add a mechanism (a circuit breaker) that detects changes too fast or too broad, such as mass withdrawals or deletions of prefixes, and halts the rollout, using signals on whether customer services are working correctly. It placed all of these within Code Orange: Fail Small.
- **Laravel Cloud**: Says its own monitoring detected connectivity failures at 18:42 UTC, that it tried to re-advertise from the dashboard but the prefixes were locked in a withdrawn state, and that it was restored at 21:57 UTC. It says no customer data was lost and that it will extend redundancy to its IP announcement layer.

## 6. Sources

- **Cloudflare (Primary, company post-mortem)**: "Cloudflare outage on February 20, 2026" (2026-02-21) — <https://blog.cloudflare.com/cloudflare-outage-february-20-2026/>
- **Cloudflare (Primary, company post-mortem, Japanese edition)**: The Japanese edition of the same post-mortem — <https://blog.cloudflare.com/ja-jp/cloudflare-outage-february-20-2026/>
- **Cloudflare Status (Primary, company incident record)**: "Cloudflare is investigating connectivity issues" (2026-02-20) — <https://www.cloudflarestatus.com/incidents/kwy3dt82bwbt>
- **Laravel (Primary, affected customer's incident report)**: "Laravel Cloud Incident Report: February 20, 2026" (2026-02) — <https://laravel.com/blog/laravel-cloud-incident-report-february-20-2026>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
