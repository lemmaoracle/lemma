---
brief_no: 68
title: "未認証のネットワークアクセスだけで、産業用ロボットの OS で任意コードが実行できた（Universal Robots PolyScope） — ロボット（実体エージェント）が、命令の送り手の権限を物理動作の前に検証しない構造（Universal Robots / CISA）"
title_en: "Unauthenticated Network Access Yields RCE on Industrial Robots — Universal Robots PolyScope (CVE-2026-8153)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-05-14
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["003-starlette-badhost", "046-servicenow-unauthenticated-api", "007-pocketos-cursor-db-deletion", "033-f5-bigip-edge-pivot", "025-mcp-stdio-config-to-command-rce", "066-litellm-ai-gateway-privilege-escalation"]
status: draft
version: "1.0"
og_lead_ja: "未認証のネット到達だけで産業用ロボットに RCE — UR PolyScope"
og_lead_en: "Unauthenticated network access yields RCE on cobots — UR PolyScope"
---

## TL;DR

A factory collaborative robot moves physically on instructions received over the network — "start," "stop," "load program" — and if it executes them without confirming the sender is a legitimate controller, the robot will move on anyone's command. On 2026-05-14, CISA issued an industrial control systems advisory (ICSA-26-134-17) warning that the control software for the widely deployed Universal Robots cobots, **PolyScope 5 (before 5.25.1), carries a critical vulnerability by which an unauthenticated attacker can execute arbitrary code on the robot's OS (CVE-2026-8153, CVSS 9.8 under v3.1 / 9.3 under v4.0)**. The cause: PolyScope's Dashboard Server passed user-supplied input to the OS as a command without sufficiently neutralizing it — anyone who can reach the Dashboard Server port over the network can run commands without authentication. What the attack required was not "legitimate authority to operate the robot" but only "network reachability." Universal Robots fixed it in PolyScope 5.25.1. We analyze this through Pillar 03 (Agent Authority Proof) as a structure in which **a robot — an "embodied agent" — never independently verified the authority or identity of the command's sender before moving physically.** Agent authority proof is needed not only for software agents (the gateway of Brief 066, the unauthenticated API of Brief 046) but, in the same form, for embodied agents that act in the physical world.

---

## 1. Incident overview

- **Target**: PolyScope 5 (versions before 5.25.1), the control software for Universal Robots' collaborative robots (cobots) — the control foundation of industrial robots widely operating on manufacturing and logistics floors.
- **Disclosing party**: CISA (industrial control systems advisory ICSA-26-134-17, 2026-05-14). Universal Robots also published its own security advisory for the vulnerability. The finder is Vera Mens of Claroty Team82.
- **Vulnerability**: CVE-2026-8153 (OS command injection, CWE-78). CVSS v3.1 base 9.8 (Critical), CVSS v4.0 base 9.3.
- **Core of the technique**: PolyScope's Dashboard Server interface passed user-supplied input to the OS without neutralizing special characters. An **unauthenticated attacker** who can reach the Dashboard Server port over the network (the default listener is TCP 29999) can execute arbitrary commands on the robot's OS via crafted input.
- **What it required**: not "legitimate authority to operate the robot" but only "network reachability to the Dashboard Server port." No authentication is demanded.
- **Plausible impact**: arbitrary code execution on the robot OS can lead to altering control logic, disrupting operation, and establishing a foothold for lateral movement. It opens room for a manufacturing-line embodied agent to act on an attacker's instruction (directly tied to cyber-physical safety).
- **Fix**: Universal Robots released the fix in PolyScope 5.25.1.
- **Core**: the robot is an embodied agent that executes network commands as physical motion. It never **independently verified, before moving,** whether the command's sender was a legitimate controller — the authorization check itself was simply absent from the path.

---

## 2. Timeline

- (prior): a flaw existed in PolyScope 5's Dashboard Server, passing input to the OS without neutralization.
- 2026-05-14: CISA publishes the industrial control systems advisory ICSA-26-134-17, warning of CVE-2026-8153 (CVSS 9.8). Universal Robots also publishes its advisory and announces the fix in PolyScope 5.25.1.
- After: operators are advised to update to 5.25.1 and to block/segment network exposure of the Dashboard Server port.

> Note: This Brief covers the CVE-2026-8153 vulnerability and its structure; no in-the-wild exploitation has been reported as of writing (CISA notes no known public exploitation, and the CVE is not in the CISA KEV catalog). It anchors on the CISA and Universal Robots advisories by name and date, and describes scale/method per primary sources.

---

## 3. Attack Vector

1. **Network reach**: the attacker reaches the port on which the robot's PolyScope Dashboard Server listens (default TCP 29999), over the network. No authentication is required.
2. **Unsanitized input**: the Dashboard Server passes user-supplied input into the OS command string without neutralizing special characters.
3. **OS command injection**: with crafted input, the attacker executes arbitrary commands on the robot's OS (CVE-2026-8153).
4. **Impact on the embodied agent**: using code execution on the robot OS as a foothold, altering control logic, disrupting operation, retrieving stored information, and lateral movement can follow. An embodied agent that performs physical motion gains room to move on instructions from someone who is not a legitimate controller.
5. **Fix and mitigation**: updating to PolyScope 5.25.1, and network segmentation / exposure blocking of the Dashboard Server port, are the mitigations (an after-the-fact, perimeter sequence that cuts off exposure).

---

## 4. Structural analysis

This incident belongs to Pillar 03 (Agent Authority Proof). The central failure primitive is that **the robot, an embodied agent, never independently verified — before moving — the authority or identity of the sender of a command that leads to physical motion.** The Dashboard Server accepts "a command that arrived over the network" and passes it to the OS, but lacked a layer to verify "does the sender of this command hold legitimate authority to operate this robot." The fact that the attack required not authority but only network reachability shows this plainly. We note `identity-auth` (per-command authorization) as primary, and `agent-infrastructure` (the robot control foundation) and `attribute-proof-bypass` (the absence of independent verification of the operating party's authority attributes) as secondary.

It shares a root with Brief 003 (Starlette/BadHost, where Host-header manipulation bypassed MCP authentication) and Brief 046 (a ServiceNow unauthenticated API that never proved the requester's authorization before execution), in the structure where **authorization passes to the privileged side without being independently verified before the action** — differing in that this incident shows it at the exit of **physical robot motion** rather than a software response. It connects to Brief 007 (an AI coding agent that deleted a production DB without its destructive authority being independently verified) in that an agent's destructive, irreversible action lacks independent verification of authorization. It connects to Brief 033 (the compromise of an implicitly trusted edge appliance becoming a foothold for lateral movement) and Brief 025 (MCP's default design becoming a broad RCE path) in the structure where a single point on the infrastructure, lacking authorization verification, becomes a foothold.

What this incident throws into relief is that **agent authority proof is not limited to software agents.** Brief 066 (a hijacked AI gateway steering an agent's execution flow) posed the same question on the software side; this incident shows that embodied agents performing physical motion on manufacturing and logistics floors equally need a layer that independently verifies, before motion, "is this motion an instruction from a sender with legitimate authority." Only once the command sender's authority is independently verified per action can increasingly autonomous robots be safely placed on factory and warehouse floors.

---

## 5. The gap between detection and proof

The CISA and Universal Robots advisories, updating to PolyScope 5.25.1, and network segmentation of the Dashboard Server port are indispensable for deterring exposure, and this Brief does not negate that role. Patching and network segmentation are an important check that severs the path of reach.

At the same time, network monitoring and patches are no material for the robot to independently verify — **before moving** — whether "the command just received may be executed in light of the sender's authority." The core of this incident is that the Dashboard Server passed the command to the OS without verifying the sender's authorization — the authorization check itself was absent from the path. Network segmentation narrows "who can reach," but the robot does not thereby confirm whether the party that reached it is a legitimate controller. Anomaly detection firing after the motion cannot undo the result at the moment the command executed and physical motion occurred. For audit and safety reporting, a record of network reach alone is no independent evidentiary trail that "this robot's motion was based on an instruction held by legitimate authority."

Pre-execution attestation takes the design choice of treating a command the robot receives not as "the fact that it arrived over the network" but as "an independently verifiable proof of authorization from a sender holding legitimate authority." If commands that lead to physical motion — start, operate, load program — are verified before motion against the bounds of the grantor's authorization, then network reachability alone does not produce motion. Detecting network reach (the detection-style "who reached") and proving the command's authorization ("is the command based on legitimate authority") are **complements**, not substitutes; only where the two overlap can increasingly autonomous robots be safely placed on manufacturing and logistics floors (for verifying authorization independently at the moment of the act, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and industry trends

- **Universal Robots**: published the security advisory for CVE-2026-8153 and released the fix in PolyScope 5.25.1, advising operators to update.
- **CISA**: issued industrial control systems advisory ICSA-26-134-17, publicizing the unauthenticated-RCE risk and the mitigations (update, network segmentation, minimizing exposure).
- **Recommendations for OT / industrial-robot operators**: update to PolyScope 5.25.1 or later; block and segment network exposure of the Dashboard Server port; apply least privilege to the control network. Do not open the robot control surface without verification merely because it sits on a "trusted" internal network.
- **A cross-industry issue**: as robots and autonomous systems proliferate on industrial floors and AI agents come to participate in operational decisions, "how to independently verify, before motion, the authority of a command's sender" in cyber-physical systems is being framed as a safety requirement. A shift is called for, from implicit trust resting on network reachability (positional trust) to per-action authorization verification.

The absence of a design that moves the command sender's authority from the implicit trust of "reached the network = legitimate" to "a proof of authorization independently verified per action" is not a problem of a specific product; it is increasingly shared as a cross-organizational challenge for any organization operating robots and autonomous systems.

---

## 7. Lemma's analysis

Against the detection–proof gap this incident exposed (an embodied agent not independently verifying the command sender's authority before physical motion), Lemma proposes a design that backs an agent's action — software or embodied — not with "network reach or the presentation of a token" but with "a proof of authorization scoped per action and independently verifiable."

- **Per-action scoped authorization (proof-as-auth)**: independently verify commands that lead to physical motion (start, operate, load program), before motion, against the bounds of the grantor's authorization. Replace "the fact of having reached the network" with a per-command proof.
- **Eliminating positional trust**: break the implicit trust that "arrived from the internal network = legitimate," and independently verify the authority attributes of the command sender before the action (connecting to the positional trust and lateral movement of Brief 033).
- **Consistent application to embodied agents**: apply the same authorization-proof framework used for software agents (the gateway of Brief 066) consistently to embodied agents that perform physical motion.
- **Selective disclosure**: without exposing internal data, disclose only the minimum — that "this command is within the grantor's authorization" — reconciling independent verification with the protection of operational information.

In this way, a proof fixed at the moment of the act functions as an independently verifiable trail of whether "this robot's motion is based on an instruction from a sender holding legitimate authority," without depending on after-the-fact network logs. Detection (after-the-fact monitoring, patching, segmentation) works on correcting exposure; pre-execution attestation (independent verification of authorization before motion) works on establishing trust in embodied agents — each complementary to the other. For the design and its scope, see [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Universal Robots (primary, vendor advisory)**: "CVE-2026-8153: Command Injection in the PolyScope 5 Dashboard Server" (credits Vera Mens, Claroty Team82) — <https://www.universal-robots.com/articles/ur/cybersecurity/cve-2026-8153-command-injection-in-the-polyscope-5-dashboard-server/>
- **CISA (primary, ICS advisory)**: "Universal Robots PolyScope 5" (ICSA-26-134-17, 2026-05-14) — <https://www.cisa.gov/news-events/ics-advisories/icsa-26-134-17> (cisa.gov may return 403 for some readers; stable CIRCL mirror: <https://vulnerability.circl.lu/vuln/icsa-26-134-17>)
- **SecurityWeek**: "Critical Vulnerability Exposes Industrial Robot Fleets to Hacking" — <https://www.securityweek.com/critical-vulnerability-exposes-industrial-robot-fleets-to-hacking/>
- **SC Media**: "Critical vulnerability in Universal Robots' PolyScope OS allows remote command execution" — <https://www.scworld.com/brief/critical-vulnerability-in-universal-robots-polyscope-os-allows-remote-command-execution>

---

## 9. About Brief distribution

The Lemma Critical Brief is a threat-intelligence brief published by Lemma. This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization. If you use it as a reference for decision-making, please consult your Lemma Critical contact directly.

[Discovery Call →](https://tally.so/r/Pd2Rl5)
[Whitepaper →](https://tally.so/r/7RJXdR)
[✉️ Newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
