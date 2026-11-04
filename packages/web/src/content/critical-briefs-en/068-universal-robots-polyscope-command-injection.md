---
brief_no: 68
title: "Universal Robots PolyScope：認証なしのネットワーク到達だけで、協働ロボットの OS で任意のコードが実行できた(CVE-2026-8153・CISA)"
title_en: "Universal Robots PolyScope: unauthenticated network access alone allowed arbitrary code to run on the cobot's OS (CVE-2026-8153, CISA)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-05-14
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["003-starlette-badhost", "046-servicenow-unauthenticated-api", "007-pocketos-cursor-db-deletion", "033-f5-bigip-edge-pivot", "025-mcp-stdio-config-to-command-rce", "066-litellm-ai-gateway-privilege-escalation"]
status: published
version: "1.0"
og_lead_ja: "未認証のネット到達だけで産業用ロボットに RCE — UR PolyScope"
og_lead_en: "Unauthenticated network access yields RCE on cobots — UR PolyScope"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "脆弱性の公表 · 産業用ロボット"
og_kicker_en: "VULNERABILITY · INDUSTRIAL ROBOTS"
og_headline_ja: "認証なしで、\n協働ロボットの OS に\nコードを実行できた。\n<accent>必要なのはネットワーク到達だけ</accent>"
og_headline_en: "No login was needed to run code on a cobot's OS.\n<accent>Network reach was all it took.</accent>"
key_figures:
  - value: "9.8"
    unit: "CVSS 3.1"
    label: "Severity (Critical). 9.3 on CVSS 4.0. No authentication needed"
    tone: "alert"
  - value: "29999"
    unit: "TCP"
    label: "Default listening port of the Dashboard Server. Reaching it over the network was enough"
  - value: "5.25.1"
    label: "The fixed PolyScope 5 release. Earlier versions are affected"
glossary:
  - term: "Collaborative robot (cobot)"
    desc: "An industrial robot designed to work in the same space as people. Universal Robots' products are widely deployed on manufacturing and logistics floors."
  - term: "OS command injection"
    desc: "A flaw where input received from outside is run as part of an OS command without being neutralised."
  - term: "Dashboard Server"
    desc: "PolyScope 5's network-facing interface. It listens on TCP 29999 by default."
insight:
  slug: "reach-as-authority"
  label: "Reach it and it moves"
  quote: "A command arriving over the network and its sender being allowed to operate the machine are separate facts; on a device where arrival counts as authority, a hole at the entry becomes control."
industries: ["manufacturing"]
controls:
  - slug: "ownership-check"
    item: "Check, before physical motion, that the sender of a command is allowed to operate the robot"
impact: "An attacker with network reach and no authentication could run arbitrary commands on the robot's OS (no exploitation in the wild reported)"
takeaway: "Nothing on the path checked, before a command ran, whether its sender was allowed to operate the robot."
self_check: "For commands that reach your control devices, can you check before they run that the sender is allowed to operate them?"
countries: ["global"]
---

## 1. Summary

CISA warned that PolyScope 5 (before 5.25.1), the control software for collaborative robots, carries a flaw (CVE-2026-8153) by which an unauthenticated attacker can run arbitrary code on the robot's OS. No exploitation in the wild had been reported at the time of writing. Even so, on robots that had not been patched, reaching the listening port over the network was enough to run commands on the OS. <strong>A command arriving over the network and its sender being allowed to operate the machine are separate facts; on a device where arrival counts as authority, a hole at the entry becomes control.</strong>

## 2. What got through

- **What got through**: Crafted input that reached the Dashboard Server port (TCP 29999 by default), and the arbitrary commands it ran on the robot's OS. The input was passed to the OS without neutralising special characters. All the attack needed was network reachability; no authentication was demanded (per CISA and Universal Robots).
- **What reached the receiving side**: In general, a command that reaches control software carries no information on whether its sender holds authority to operate the machine. From the receiving side, you cannot tell whether a command that arrived over the network comes from someone allowed to operate it.
- **What was stopped**: On robots running the fixed release (PolyScope 5.25.1), the flaw is fixed (per Universal Robots). Network segmentation and blocking exposure of the Dashboard Server port were also given as mitigations.
- **Not disclosed**: Exploitation in the wild (none reported at the time of writing). Altered control logic or disrupted operation after code execution on the robot OS are plausible impacts, not confirmed harm.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever carries out a command that leads to physical motion checks, before it runs, that the sender is allowed to operate the machine, wherever on the network the command came from.

- **Who approves**: Whoever decides who may operate the robot, such as the person responsible for its operation. Who may start it, run it or load a program, and within what scope, is decided outside the robot.
- **Where it is checked**: One point just before a command that leads to physical motion runs. A command from the internal network and one from outside pass the same check. A command that does not match a permission is stopped, not run.
- **What is recorded**: Which permission allowed whose command to run as which motion, kept apart from the record of network reach.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a command that leads to physical motion runs, that the sender is allowed to operate the machine, and keeping a record. Detection means noticing after a flaw or anomaly surfaces. The date below is when CISA published its advisory, not necessarily when the flaw became exploitable.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check that the sender is allowed to operate the machine before a command runs</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>With no authentication, network reach alone<br>could run commands on the OS</span></div>
<div class="rx-zone det"><b>Detection · worked</b>The flaw was found, and CISA and the vendor issued advisories</div>
<div class="rx-g g1"><div class="t">BEFORE</div><b>A flaw passing input to the OS unneutralised</b></div>
<div class="rx-g g2"><div class="t">05-14</div><b>CISA publishes its advisory</b></div>
<div class="rx-g g3"><div class="t">AFTER</div><b>Update to 5.25.1 and segment</b></div>
<div class="rx-g g4"><div class="t">AT WRITING</div><b>No exploitation in the wild reported</b></div>
</div>
</figure>

The advisory and the fixed release address the flaw that was found; they are not a mechanism that checks the sender of a command that arrives. Another case where an entry point with no authentication led to actions on a business platform is [ServiceNow's unauthenticated API](/critical/briefs/046-servicenow-unauthenticated-api/) (the requester's authorisation was not checked before the action ran).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that carries out commands leading to physical motion.** It does not look for flaws or intrusions; it checks, before a command runs and whatever the network path, whether its sender is allowed to operate the machine.

### Industries and operations to watch

- **Industry · Manufacturing**: Organisations that run collaborative robots on manufacturing and logistics floors. The robot's control software has an entry point reachable over the network.
- **Operation · Starting, running and loading programs on robots**: Commands that lead to physical motion. That a sender reached the network does not show it is allowed to operate the machine.

### Current controls vs Lemma

The route in this case is a command that leads to physical motion, arriving over the network.

| Control | Command leading to physical motion, arriving over the network |
| --- | --- |
| Applying the fixed release (PolyScope 5.25.1 or later) | Partial |
| Network segmentation and blocking exposure | Partial |
| Anomaly detection (after the motion) | Not effective |
| **Lemma (pre-execution check)** | Effective |

Applying the fixed release closes this flaw, but it is not a mechanism that checks the sender of a command that arrives. Segmentation narrows who can reach the robot, but the robot does not thereby check whether the party that reached it is allowed to operate it. Anomaly detection comes after the command has run and the motion has happened, and the result cannot be undone. Lemma checks commands that lead to physical motion, before they run, against whether the sender is allowed to operate the machine. A record of what ran is also kept, so which motion happened under which permission can be confirmed without relying on a record of network reach alone.

Note: Lemma's check works only when it is built in just before commands such as start, run and load-program, and the record of permissions is managed outside the robot. A party running code on the robot's OS may be able to cause motion without passing this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about control devices (robots)

- Are your PolyScope 5 robots on 5.25.1 or later?
- Do you know from where on the network the Dashboard Server port can be reached, and have you closed the ranges you do not need?
- Is there a step that checks, before a command runs, that its sender is allowed to operate the robot, even for commands from the internal network?

## 5. Facts and timeline

- **Target**: PolyScope 5 (versions before 5.25.1), the control software for Universal Robots' collaborative robots (cobots), the control foundation of industrial robots widely deployed on manufacturing and logistics floors.
- **Disclosing party**: CISA (industrial control systems advisory ICSA-26-134-17, 2026-05-14). Universal Robots also published an advisory for the same vulnerability. The finder is Vera Mens of Claroty Team82.
- **Vulnerability**: CVE-2026-8153 (OS command injection, CWE-78). CVSS v3.1 base score 9.8 (Critical); CVSS v4.0 base score 9.3.
- **Core of the technique**: PolyScope's Dashboard Server interface passed user-supplied input to the OS without neutralising special characters. An unauthenticated attacker who can reach the Dashboard Server port over the network (the default listener is TCP 29999) could run arbitrary commands on the robot's OS via crafted input.
- **What it required**: Not authority to operate the robot, but only network reachability to the Dashboard Server port. No authentication is demanded.
- **Plausible impact**: Arbitrary code execution on the robot OS can lead to altered control logic, disrupted operation and a foothold for lateral movement. It opens room for a robot on a manufacturing line to act on an attacker's instruction.
- **Fix**: Universal Robots released the fix in PolyScope 5.25.1.

### Timeline

- **(Before)**: A flaw existed in PolyScope 5's Dashboard Server, passing input to the OS without neutralising it.
- **2026-05-14**: CISA publishes industrial control systems advisory ICSA-26-134-17, warning of CVE-2026-8153 (CVSS 9.8). Universal Robots also publishes an advisory for the same vulnerability and points to the fix in PolyScope 5.25.1.
- **After**: Operators are advised to update to 5.25.1 and to block or segment network exposure of the Dashboard Server port.

> This Brief covers the CVE-2026-8153 vulnerability and its structure; no exploitation in the wild had been reported at the time of writing. The CISA advisory and Universal Robots' advisory are the dated anchors, and scale and technique are described from the primary sources. What has not been disclosed does not mean there were no controls.

### Response after disclosure

- **Universal Robots**: Published a security advisory for CVE-2026-8153 and released the fix in PolyScope 5.25.1. Pointed operators to the update.
- **CISA**: Issued ICS advisory ICSA-26-134-17, publicising the risk of unauthenticated code execution and the mitigations (update, network segmentation, minimising exposure).
- **Recommendations for OT and industrial-robot operators**: Update to PolyScope 5.25.1 or later, block or segment network exposure of the Dashboard Server port, and apply least privilege on the control network.

## 6. Sources

- **Universal Robots (primary, vendor advisory)**: "CVE-2026-8153: Command Injection in the PolyScope 5 Dashboard Server" (credits Vera Mens, Claroty Team82) — <https://www.universal-robots.com/articles/ur/cybersecurity/cve-2026-8153-command-injection-in-the-polyscope-5-dashboard-server/>
- **CISA (primary, ICS advisory)**: "Universal Robots PolyScope 5" (ICSA-26-134-17, 2026-05-14) — <https://www.cisa.gov/news-events/ics-advisories/icsa-26-134-17> (cisa.gov may return 403 for some readers; stable CIRCL mirror: <https://vulnerability.circl.lu/vuln/icsa-26-134-17>)
- **SecurityWeek**: "Critical Vulnerability Exposes Industrial Robot Fleets to Hacking" — <https://www.securityweek.com/critical-vulnerability-exposes-industrial-robot-fleets-to-hacking/>
- **SC Media**: "Critical vulnerability in Universal Robots' PolyScope OS allows remote command execution" — <https://www.scworld.com/brief/critical-vulnerability-in-universal-robots-polyscope-os-allows-remote-command-execution>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
