---
brief_no: 57
title: "DeepSeek: An unauthenticated database was exposed, and logs and chat history were readable by anyone (Wiz Research)"
title_en: "DeepSeek: An unauthenticated database was exposed, and logs and chat history were readable by anyone (Wiz Research)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["attribute-proof-bypass", "data-provenance"]
incident_date: 2025-01-29
published: 2026-06-15
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["056-mchire-paradox-recruiting-auth", "013-coinbase-kyc-insider-breach", "036-commonpool-training-data-pii", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "認証なしの AI バックエンド、到達＝全取得 — DeepSeek / ClickHouse"
og_lead_en: "No auth on the AI backend — reachable meant readable — DeepSeek"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー事例 · 認証のない公開"
og_kicker_en: "CYBER INCIDENT · NO AUTHENTICATION"
og_headline_ja: "認証のない\nデータベースが公開。\n<accent>ログと履歴を誰でも読めた</accent>"
og_headline_en: "A database with no login\nwas open to anyone.\n<accent>Logs and chats readable.</accent>"
key_figures:
  - value: "1M+"
    unit: "log lines"
    label: "Exposed along with plaintext chat history, API keys and secret tokens (Wiz Research)"
    tone: "alert"
  - value: "8123 / 9000"
    label: "Open ports reachable without authentication, where arbitrary SQL could be run (BleepingComputer)"
  - value: "~30 min"
    label: "From Wiz Research's responsible disclosure to DeepSeek remediating the exposure"
glossary:
  - term: "ClickHouse"
    desc: "A database for collecting and querying large volumes of logs. Here it was open to external SQL with no authentication."
  - term: "Responsible disclosure"
    desc: "Telling the party concerned about a weakness before making it public, so they have time to fix it."
insight:
  slug: "reach-is-read"
  label: "Reaching it means reading it"
  quote: "On a backend with no authentication, there is no way to tell whether a party that reached it is legitimate, so reaching the network is itself the authority to read."
industries: ["ai"]
operations: ["data-access"]
controls:
  - slug: "verify-entry"
    item: "Separate network reach from authorization to read data, and refuse unauthenticated access"
impact: "Over a million log lines and plaintext chat history exposed"
takeaway: "A data backend was exposed with no authentication, and anyone who could reach it could read it. Check a party's authentication and authority at the backend's entry, before it reads."
self_check: "Can your data backend be read just by reaching it over the network? Do you check the party's authority before it reads?"
countries: ["cn"]
---

## 1. Summary

When a data backend is exposed to the internet with no authentication, reaching it is reading it. External monitoring and responsible disclosure work after the exposure already exists, and it was fixed in about 30 minutes. <strong>On a backend with no authentication, there is no way to tell whether a party that reached it is legitimate, so reaching the network is itself the authority to read.</strong>

## 2. What got through

- **What got through**: Queries to the database over an unauthenticated connection. Arbitrary SQL could be run through the open ports (8123 for HTTP, and 9000) (BleepingComputer).
- **What reached the receiving side**: In general, a backend with no authentication runs the queries it receives without telling who sent them. From the backend's side, reaching it over the network cannot be told apart from having authority to read the data.
- **What was found**: Over a million log lines (the `log_stream` table), plaintext user chat history, API keys, secret access tokens, and backend operational data (Wiz Research).
- **Not disclosed**: Whether third parties illicitly retrieved the data (this Brief does not assert it), and whether the exposed API keys and tokens were used on other systems.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that the data backend, before it accepts a query, checks whether the party holds authority over this scope of data, separately from whether it reached the network.

- **Who approves**: The owner of the data (the organization). It decides in advance which party may read which scope.
- **Where it is checked**: The entry to the data backend. Connections from outside and from inside are checked at one point before reading. A query that does not match the authority is not run.
- **What is recorded**: Which party read which scope, under which authority. After the read, it can be traced whether the read was legitimate.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before data is read, that the party holds authority over that scope, and keeping a record. Detection means finding the exposure after it exists. The dates below follow the disclosures.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the party's authority before it reads</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Over a million log lines and plaintext<br>chat history reached with no authentication</span></div>
<div class="rx-zone det"><b>Detection · worked after the exposure</b>Wiz Research finds it and discloses it to DeepSeek</div>
<div class="rx-g g1"><div class="t">From 01-06</div><b>Logs accumulating</b></div>
<div class="rx-g g2"><div class="t">2025-01</div><b>Two instances found</b></div>
<div class="rx-g g3"><div class="t">01-29</div><b>Responsible disclosure</b></div>
<div class="rx-g g4"><div class="t">~30 min later</div><b>DeepSeek fixes the exposure</b></div>
</div>
</figure>

External monitoring and disclosure found the exposure and prompted the fix, but they worked after the exposure existed. A similar case, where a read happened with no check of authority, is [McHire](/critical/briefs/056-mchire-paradox-recruiting-auth/) (guessable credentials).

## 4. What Lemma does

**Lemma builds the pre-execution check into the entry to the data backend.** It does not look for intrusions or exposures; it confirms, before a read, that the party holds authority over this scope.

### Industries and operations to watch

- **Industry · AI**: AI services that gather sensitive data such as chat history and logs into a backend. In fast growth, a backend can be exposed with its reach control and authorization not separated.
- **Operation · Running and exposing data backends**: Exposure scope of backends that collect logs and history, authentication on connections, and storage of API keys and tokens.

### Current controls vs Lemma

The route in this case is column 1 (reading data over an unauthenticated connection). Column 2 is moving to other systems with exposed API keys and tokens; whether that happened here has not been disclosed.

| Control | Reading data over an unauthenticated connection | Moving to other systems with exposed API keys and tokens |
| --- | --- | --- |
| Continuous external monitoring for exposure, and responsible disclosure | Partial | Not relevant |
| Authentication and authority checks on the backend itself | Effective | Not relevant |
| Managing and rotating API keys and tokens | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Partial |

External monitoring and disclosure found the exposure and prompted the fix, but they work after the exposure exists. Authentication and authority checks on the backend itself are the layer missing here; with them, a party that reached the backend could be told apart. Managing and rotating keys and tokens reduces secondary harm after exposure. Lemma checks a party's authority before it reads, outside the backend. If it is designed to send a check that the authority passed rather than the key itself, keys need not be held in plaintext.

Note: Lemma's check works only when it is built in before the backend accepts queries and authority decisions are managed apart from the backend. It can be passed if the credentials of a party that holds authority are stolen. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about data backends

- Can your data backend be read just by reaching it over the network?
- Do you check the authority of the party reading the data, at the backend's entry, before it reads?
- Do you avoid holding API keys and tokens in plaintext, and can you rotate them if they are exposed?

## 5. Facts and timeline

- **Subject**: DeepSeek's (AI / LLM service) backend infrastructure.
- **Discoverer**: Wiz Research, during a security assessment of external infrastructure.
- **Exposure point**: A ClickHouse instance was open to the outside with no authentication (`oauth2callback.deepseek.com:9000`, `dev.deepseek.com:9000`). The open ports were 8123 (HTTP) and 9000, and arbitrary SQL could be run through a web interface with no authentication.
- **What was exposed**: Over a million log lines (the `log_stream` table), plaintext user chat history, API keys, secret access tokens, and backend operational metadata.
- **Data range**: Logs had accumulated from at least 2025-01-06 onward.

### Timeline

- **2025-01-06**: The exposed database's logs accumulate from this date onward.
- **2025-01**: Wiz Research finds two ClickHouse instances during an assessment of external infrastructure.
- **2025-01-29**: Wiz discloses responsibly to DeepSeek. DeepSeek remediates within about 30 minutes.

> Proper names rest on primary sources (research labs). This case rests on a research lab's responsible disclosure and does not assert whether third parties illicitly retrieved data. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Discovery and fix**: Following Wiz Research's responsible disclosure, DeepSeek remediated the exposure within about 30 minutes.
- **Industry point**: The basic operational-security fact that a backend for sensitive data such as chat history could be exposed with no authentication, in a fast-growing AI service, became a focal point again.
- **Possible secondary harm**: Exposed API keys and secret tokens can be a starting point for moving to other systems and escalating privileges, so the importance of secret management and rotation was re-recognized.
- **Regulatory context**: It overlapped with debates over national regulation and usage restrictions around DeepSeek, and heightened interest in AI-service data protection and governance.

## 6. Sources

- **Wiz Research**: "Wiz Research Uncovers Exposed DeepSeek Database Leaking Sensitive Information, Including Chat History" (primary — the original account of the discovery; 2025-01) — <https://www.wiz.io/blog/wiz-research-uncovers-exposed-deepseek-database-leak>
- **BleepingComputer**: "DeepSeek exposes database with over 1 million chat records" (ports, exposed content, remediation) — <https://www.bleepingcomputer.com/news/security/deepseek-exposes-database-with-over-1-million-chat-records/>
- **The Register**: "DeepSeek database left open, exposing sensitive info" (2025-01-30; timeline) — <https://www.theregister.com/2025/01/30/deepseek_database_left_open/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
