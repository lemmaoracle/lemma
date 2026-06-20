---
brief_no: 71
title: "1 つの認証で、7,000 台のロボット掃除機のカメラ・マイクに届いた（DJI ROMO） — クラウド基盤が、機体ごとの認可を分離せず、認証済みなら全機の映像・音声を購読できた構造（DJI / The Verge）"
title_en: "One Authenticated Client Reached 7,000 Robot Vacuums' Cameras — DJI ROMO (No Broker ACL)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-02-17
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["070-unitree-shared-key-robot-identity", "068-universal-robots-polyscope-command-injection", "057-deepseek-clickhouse-exposed-db", "006-google-api-key-revocation-lag", "052-discord-age-verification-id-leak"]
status: draft
version: "1.0"
og_lead_ja: "1 つの認証で 7,000 台のロボット掃除機のカメラ・マイクに到達 — DJI ROMO"
og_lead_en: "One authenticated client reached 7,000 robot vacuums' cameras — DJI ROMO"
gap_detected: "Responsible disclosure by researchers, reporting via the media, DJI's swift fix and bounty, and after-the-fact logs of which connection subscribed to what were all carried out and recorded."
gap_missing: "There was no layer to check before access whether the party attempting to subscribe held authority over a given device, so a single authenticated connection passed straight through to every device."
gap_fix: "Before access, independently verify with Lemma that this party holds legitimate authority over this device, and prevent it up front."
---

## TL;DR

A home robot vacuum moves its camera, microphone, and floor map through the cloud — and if that backend only checks "are you authenticated?" without checking "does this user have authority over *this one* unit," a single authenticated person can reach everyone else's units. In February 2026, researcher Sammy Azdoufal — trying to drive his own DJI ROMO robot vacuum with a PS5 controller (using AI coding tools to reverse the app's protocol) — connected his homemade client to DJI's cloud and **~7,000 other people's ROMOs (across 24+ countries) responded.** The cause: the MQTT broker brokering device↔server traffic had **no ACL (access control list), so a single authenticated client could subscribe to any unit's topics.** Live camera video, microphone audio, and home-mapping data became reachable by an unrelated user. The researcher reported to DJI via The Verge; DJI fixed it in 02-08 / 02-10 updates and paid a $30,000 bounty. We analyze this through Pillar 03 (Agent Authority Proof) as a structure in which **the cloud backend did not separate "authenticated?" from "authorized over this unit?", and never independently verified per-device authorization.** It is the consumer / smart-home counterpart to Brief 070 (humanoid and quadruped robots with no per-device identity).

---

## 1. Incident overview

- **Target**: DJI's ROMO robot vacuum, and its device / phone app / cloud backend. A consumer embodied agent placed in the home, handling camera, microphone, and floor maps.
- **Discovery / disclosure**: found by researcher Sammy Azdoufal. While reverse-engineering the DJI app's protocol (with AI coding tools) to drive his own ROMO with a PS5 controller, he noticed that when his homemade remote-control client connected to DJI's backend, many other units responded. Reported to DJI via The Verge.
- **Scale**: ~7,000 ROMOs responded (at least 24 countries). Live camera video, microphone audio, and home-mapping data were reachable by an unrelated user.
- **Root cause**: the MQTT broker brokering device↔server traffic had no ACL (access control list), so **one authenticated client — not bound to any specific unit — could subscribe to any topic.** The backend's authorization check (which user has authority over which unit) was missing.
- **What it required**: not ownership of individual units, but the ability to connect to the backend as an "authenticated client." Authentication passed, but per-device authorization was not separated out.
- **Response**: DJI shipped an initial fix on 2026-02-08 and a supplement on 02-10. It paid the finder a $30,000 bounty (for one of his findings); separately, some reported issues — including a PIN bypass on the camera feed — were reported as still unpatched at the time of reporting.
- **Core**: authentication (are you authenticated?) and authorization (do you have authority over this unit?) were not separated, and the broker did not independently verify per-device authorization. "Authenticated" had become "may access all units."

---

## 2. Timeline

- 2026-02 (prior): the researcher reverse-engineers the app's protocol to drive his ROMO with a PS5 controller, and discovers that on his client's connection many other units respond.
- 2026-02-08: DJI deploys an initial fix.
- 2026-02-10: DJI completes a supplementary fix.
- 2026-02-17 onward: the researcher shares with The Verge, which confirms with DJI; established media report. DJI pays the finder a $30,000 bounty. Some reported issues remain unpatched at the time of reporting.

> Note: This is a researcher discovery and responsible disclosure, not a condemnation of any actor. This Brief states the scale (~7,000 units, 24+ countries) and the fix dates as reported, and avoids assertion. The use of AI coding tools is a fact about the analysis method; this Brief's concern is the absence of authorization separation on the backend.

---

## 3. The chain: one authenticated client reaches every unit's video and audio

This incident shows a structure in which, because the cloud backend did not separate authentication from authorization and never verified per-device authorization, one authenticated connection reaches the sensors of the whole fleet. As this was a researcher's discovery rather than an external attack, we describe it as a sequence.

1. **A legitimate connection**: to operate his own unit, the researcher connects his homemade client to DJI's cloud backend (the MQTT broker) as an authenticated client.
2. **Absence of an ACL**: the broker has no ACL, so the authenticated client — unbound to any specific unit — can subscribe to any unit's topics.
3. **Reaching the fleet**: ~7,000 other units (24+ countries) respond to the connection. Each unit's live video, audio, and mapping data were reachable by the unrelated user's connection.
4. **The missing authorization check**: the broker never verified "does this user have authority over *this one* unit." Authentication passed; per-device authorization did not exist.
5. **Report and fix**: the researcher reports to DJI via The Verge; DJI fixes it in the 02-08 / 02-10 updates (an after-the-fact sequence that severs the reach).

---

## 4. Structural analysis

This incident belongs to Pillar 03 (Agent Authority Proof). The central failure primitive is that **the cloud backend did not separate "authenticated?" from "authorized over this unit?", and never independently verified per-device authorization.** That the MQTT broker has no ACL means "whoever passes authentication can subscribe to any unit's topics" — reachability had become access to every unit's sensors. We note `identity-auth` (per-unit authorization) as primary, and `agent-infrastructure` (cloud / IoT backend) and `attribute-proof-bypass` (no independent verification of the accessing party's authority attribute) as secondary.

It is the sister case to Brief 070 (Unitree — every unit shares one hardcoded key, no per-device identity), forming a physical cluster of agent-authority cases. Where 070 was "no per-device selfhood (identity)," this incident differs in that **authentication worked, but per-device authorization was not separated** — the two are two sides of the same "per-device identity and authorization" question. It is nearly identical to Brief 057 (an AI backend with no authentication, where reachability became total retrieval) in the structure where reachability and authorization aren't separated. It connects to Brief 006 (a credential's revocation attribute not independently verified) in that the accessing party's attribute is not independently verified, and to Brief 052 (raw IDs handed over for age verification leaked from third-party storage) in that consumers' sensitive data — here camera, mic, floor plan — turns into an exposure surface without being separated and protected.

What this incident throws into relief is **how a backend independently verifies, per unit, the authorization of an embodied agent entering the home.** A robot vacuum is a living-space sensor with camera, mic, and floor map; if its per-unit authorization is not separated, one authenticated connection reaches another household's privacy. Being able to reach is different from holding legitimate authority over that unit, and only once per-unit authorization is independently verified before the action can home embodied agents be used with confidence.

---

## 5. The gap between detection and proof

Responsible disclosure by the researcher, the report via The Verge, and DJI's swift fix and bounty are indispensable for correcting the exposure, and this Brief does not negate that role. Rolling out the fix was an important check that severed the reach.

At the same time, server-side log monitoring and patches are no material for the backend to independently verify, per unit, **before the access**, "does the party now trying to subscribe hold authority over *this* unit?" The core of this incident is that the broker did not separate authentication from authorization and lacked the per-device authorization check itself. After-the-fact traffic analysis reconstructs "which connection subscribed to which topic," but is no material to independently verify, before the action, "was that subscription based on legitimate authority over this unit." Once it has reached live video/audio, the privacy exposure at that moment cannot be retroactively undone.

Pre-execution attestation treats access to a unit's sensors/topics not as "being authenticated" but as "an independently verifiable proof of authorization, by a subject holding legitimate authority over *this* unit." If actions like subscribing, operating, or pulling video are verified before access against the unit's specific identity and the grantor's authorization, then merely passing authentication no longer reaches other units' topics. Detecting reach (the detection-style "who connected") and proving per-unit authorization ("is this based on authority over this unit") are **complements**, not substitutes; only where the two overlap can home embodied agents be used with confidence (for verifying authorization independently at the moment of the act, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and industry trends

- **DJI**: resolved the ROMO MQTT broker's authorization-validation issue with an initial fix on 2026-02-08 and a supplement on 02-10, and paid the finder a $30,000 bounty (for one finding). Some reported issues, including a camera-feed PIN bypass, were reported as still unpatched at the time of reporting.
- **Researcher / The Verge**: reported the finding to DJI via The Verge, establishing the responsible-disclosure path and surfacing the method and impact scope.
- **For consumer-IoT operators / makers**: the need to separate authentication from authorization in cloud-dependent fleets, and to independently verify per-device authorization (which user has authority over which one unit) at the backend, became the talking point. Broker ACLs / topic isolation are the floor.
- **A cross-industry issue**: as embodied agents enter homes and living space (vacuums, monitoring devices, etc.), how to independently verify per-device identity and authorization — together with Brief 070 (device identity) — is being shared as a privacy-and-safety requirement.

The absence of a design that does not mistake reachability for legitimate authority over a unit is not a problem of a specific manufacturer; it is increasingly shared as a cross-industry challenge for spreading cloud-connected embodied agents through society.

---

## 7. Lemma's analysis

Against the detection–proof gap this incident exposed (the cloud backend not separating authentication from authorization and not independently verifying per-device authorization), Lemma proposes a design that backs access to a unit's sensors/operations not with "being authenticated" or "having reached" but with "an independently verifiable proof of authorization, by a subject holding legitimate authority over that unit."

- **Per-device authorization (proof-as-auth)**: independently verify actions like subscribing, operating, or pulling video, before access, against the unit's specific identity and the grantor's authorization. Replace "the fact of having authenticated" with a per-unit, per-action proof.
- **Separating reachability from authorization**: break the assumption that "reached the backend = may access," separating reachability from authorization (connecting to the reach-equals-total-retrieval structure of Brief 057).
- **Operated together with per-device identity**: handle each unit's unique selfhood (Brief 070) and authorization over that unit as one, severing the path by which one authenticated connection reaches the whole fleet.
- **Selective disclosure**: without exposing unit/user internal data, disclose only the minimum — that "this subject holds legitimate authority over this unit" — reconciling independent verification with privacy protection.

In this way, a proof fixed at the moment of the act functions as an independently verifiable trail of whether "this subscription / operation is based on legitimate authority over this unit," without depending on after-the-fact traffic analysis. Detection (after-the-fact analysis, fixes) works on correcting exposure; pre-execution attestation (independent verification of per-unit authorization) works on establishing trust in home embodied agents — each complementary to the other. For the design and its scope, see [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Malwarebytes (technical writeup)**: "Hobby coder accidentally creates vacuum robot army" (2026-02-17; MQTT broker with no topic ACL = an authenticated client subscribes to other units, ~7,000 units / 24 countries, some issues unpatched) — <https://www.malwarebytes.com/blog/news/2026/02/hobby-coder-accidentally-creates-vacuum-robot-army>
- **PetaPixel**: "Someone Remotely Accessed the Cameras in 7,000 DJI Robot Vacuums" (2026-02-24) — <https://petapixel.com/2026/02/24/someone-remotely-accessed-the-cameras-in-7000-dji-robot-vacuums/>
- **DroneXL**: "DJI ROMO Security Breach: Researcher Remotely Accessed 7,000 Home Cameras — And One Hole Remains" (2026-02-17) — <https://dronexl.co/2026/02/17/dji-romo-security-breach/>
- **DroneDJ**: "DJI fixes ROMO security bug that exposed thousands of homes" (2026-03-10, fix and bounty) — <https://dronedj.com/2026/03/10/dji-romo-security-bug-bounty/>

---

## 9. About Brief distribution

The Lemma Critical Brief is a threat-intelligence brief published by Lemma. This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization. If you use it as a reference for decision-making, please consult your Lemma Critical contact directly.

[Discovery Call →](https://tally.so/r/Pd2Rl5)
[Whitepaper →](https://tally.so/r/7RJXdR)
[✉️ Newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
