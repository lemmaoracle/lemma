---
brief_no: 70
title: "Unitree：人型・四足ロボットを、Bluetooth の初期設定から最上位の権限で乗っ取れると示された(研究者の公表・NVD)"
title_en: "Unitree: Researchers showed its humanoid and quadruped robots could be taken over with root access via Bluetooth setup (researchers, NVD)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2025-09-20
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["068-universal-robots-polyscope-command-injection", "033-f5-bigip-edge-pivot", "003-starlette-badhost", "006-google-api-key-revocation-lag", "025-mcp-stdio-config-to-command-rce"]
status: published
version: "2.1"
og_lead_ja: "Unitree のロボット、全機共通の鍵で Bluetooth から乗っ取れた"
og_lead_en: "Every Unitree robot shared one encryption key, letting attackers take them over via Bluetooth — crack one, and the rest fall too"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "脆弱性の公表 · ロボット"
og_kicker_en: "VULNERABILITY · ROBOTS"
og_headline_ja: "全機が同じ鍵を使っていた。\n1 台の手口が全機に通じる\n<accent>人型と四足の 4 機種</accent>"
og_headline_en: "Every robot used the same key.\nCrack one, crack them all.\n<accent>Across four robot models.</accent>"
key_figures:
  - value: "1"
    unit: "key"
    label: "One encryption key shared by every unit. Extracted from one robot, it worked on the others (NVD, researchers)"
    tone: "alert"
  - value: "4"
    unit: "models"
    label: "Affected models: the G1 and H1 humanoids and the Go2 and B2 quadrupeds (NVD)"
  - value: "2025-05 → 09-20"
    label: "From the researchers contacting Unitree to public disclosure. The researchers say Unitree stopped replying in July (IEEE Spectrum)"
glossary:
  - term: "Bluetooth setup"
    desc: "The entry point used to connect a robot to Wi-Fi, by sending settings over Bluetooth from a nearby phone."
  - term: "Root (root access)"
    desc: "The administrator level that can do anything on a device. Whoever holds it can control the device at will."
  - term: "Firmware"
    desc: "The software that runs inside a device. Updates come from the vendor."
insight:
  slug: "one-key-for-all"
  label: "One key for every unit"
  quote: "If every unit holds the same key, a key taken from one unit opens the entry point of all the others."
industries: ["manufacturing", "public-sector"]
controls:
  - slug: "ownership-check"
    item: "Check a connecting party against a key unique to each unit"
  - slug: "hold-unverified"
    item: "Validate input from setup and other entry points before using it"
self_check: "Do the robots and connected devices you deploy check whoever connects against a key unique to each unit?"
countries: ["global"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged.

## 1. Summary

The researchers showed that every unit used the same encryption key, and that a handshake containing the string "unitree" was enough to pass authentication. The reports we consulted describe no real-world exploitation. Unitree said it had completed most fixes, but until updates arrive, the same key still opens the entry point. <strong>If every unit holds the same key, a key taken from one unit opens the entry point of all the others.</strong>

## 2. What got through

- **What got through**: A connection to the Bluetooth setup entry point, and strings sent there as a Wi-Fi network name or password. A handshake made with the shared key passed authentication, and commands slipped into those strings were executed as root (the top-level privilege) when the Wi-Fi settings were applied (CVE-2025-60250, 60251, 35027, 60017).
- **What reached the receiving side**: In general, at an entry point with no per-unit key, a connection with a matching handshake arrives as the same "correct connection" whoever it comes from. An attacker using an extracted key cannot be told apart from the genuine setup app at the entry point.
- **Spread to other units**: The researchers say a compromised robot could look for other Unitree robots within Bluetooth range and take them over automatically.
- **Not disclosed**: Real-world exploitation (the reports we consulted describe none), and whether the fix updates had shipped (not confirmed as of IEEE Spectrum's article, updated 2025-11).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever accepts connections at an entry point such as setup checks the connecting party, before accepting it, against a key or certificate unique to that unit.

- **Who approves**: The device vendor. It issues a unique key or certificate for each unit, and never builds the same secret into every unit. The connecting party answers with the key that matches that unit.
- **Where it is checked**: The part of the unit that accepts connections at setup and similar entry points. A connection whose key does not match is not accepted. Input that is accepted is still validated before use, and strings received as a Wi-Fi name or password are not passed straight into execution.
- **What is recorded**: Which party connected to which unit with which key. What the device sends to outside servers is also made visible to the deploying organization.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking the connecting party against a per-unit key before accepting the connection. Detection means noticing a takeover or outbound data afterwards. The dates below are when the researchers, NVD and Unitree published each point, not when a takeover became possible.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the party against a per-unit key before accepting the connection</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>With the shared key, taken over as root<br>from the setup entry point (researchers' demonstration)</span></div>
<div class="rx-zone det"><b>Detection · partial</b>Researchers found it; fixes in progress</div>
<div class="rx-g g1"><div class="t">2025-05</div><b>Researchers contact Unitree</b></div>
<div class="rx-g g2"><div class="t">09-17</div><b>Paper posted to arXiv</b></div>
<div class="rx-g g3"><div class="t">09-20</div><b>UniPwn disclosed</b></div>
<div class="rx-g g4"><div class="t">09-29</div><b>Unitree says most fixes are done</b></div>
</div>
</figure>

Researchers found and reported it, and Unitree worked on fixes, but fixes come after discovery. A similar case, where outside commands were run through an entry point, is [Universal Robots PolyScope](/critical/briefs/068-universal-robots-polyscope-command-injection/) (outside commands could be run through an industrial robot's control screen).

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that accepts connections at setup and similar entry points.** It does not look for intrusions; it checks, before the connection is accepted, that the connecting party holds the key unique to that unit.

### Industries and operations to watch

- **Industry · Manufacturing & core infrastructure**: Organizations that build robots or connected devices, and those that deploy them in factories and facilities.
- **Industry · Government & public sector**: Organizations trialing robots for security or inspection (IEEE Spectrum noted UK police testing a Go2).

### Current controls vs Lemma

The route in this case is column 1 (a connection to the setup entry point) and column 2 (running a string that arrives through that entry point). Column 3 is units that have not yet received the fix; shipped updates had not been confirmed as of the 2025-11 report.

| Control | Connection to the setup entry point | Running a string from the entry point | Units without the update |
| --- | --- | --- | --- |
| Encrypting communications | Not effective | Not relevant | Not relevant |
| Handshake authentication | Not effective | Not relevant | Not relevant |
| Network segmentation | Partial | Not relevant | Not relevant |
| Firmware updates | Not relevant | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Partial | Not effective |

Encrypting communications did not help because the key was the same on every unit. Handshake authentication passed anything containing "unitree". Network segmentation can restrict Wi-Fi traffic, but anyone nearby can reach the Bluetooth entry point. Firmware updates: Unitree said most fixes were done, but no shipped update had been confirmed. Lemma checks the party against a per-unit key before accepting the connection.

Note: Lemma's check works only on units that carry a unique key or certificate and have the check built into the part that accepts connections. Units that do not get the update keep the same key scheme, so the check does not apply to them. It passes if a unit's own key has been extracted, or if the genuine setup app has been taken over. Validation that keeps input strings out of execution is something the device maker adds separately. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that build or deploy robots and connected devices

- Have you confirmed with the vendor that strings arriving through device setup are never executed as-is?
- Do you know what your deployed devices send to outside servers?
- Do you have a procedure for receiving and installing firmware updates from the vendor?

## 5. Facts and timeline

- **Researchers**: Andreas Makris and Kevin Finisterre found and disclosed the flaws. With Víctor Mayoral-Vilches of Alias Robotics, they posted a paper on the G1's security to arXiv (2025-09).
- **Affected models**: The G1, H1, Go2 and B2, which share common firmware (NVD).
- **Entry point**: The Bluetooth setup used to connect the robot to Wi-Fi.
- **Why authentication passed**: The same encryption key and initialization vector (IV) were built into every unit (CVE-2025-60250), and any handshake containing the substring "unitree" was accepted (CVE-2025-60251).
- **Root execution**: Commands slipped into strings sent as the Wi-Fi network name or password were executed as root when the Wi-Fi settings were applied (CVE-2025-35027, CVE-2025-60017).
- **Spread to other units**: The researchers say a compromised robot could look for other Unitree robots within Bluetooth range and take them over automatically.
- **Weak configuration encryption**: The paper says the encryption protecting settings also relied on a fixed scheme and predictable values.
- **Outbound data**: The paper says the robot sent sensor and status data to two outside servers every 300 seconds without telling the operator.

### Timeline

- **2025-05**: The researchers contact Unitree.
- **2025-07**: Makris publishes the keys on X. The researchers say Unitree stopped replying from this month (IEEE Spectrum).
- **2025-09-17**: The paper is posted to arXiv.
- **2025-09-20**: The researchers disclose UniPwn.
- **2025-09-26**: The CVEs are published in the NVD.
- **2025-09-29**: Unitree says on LinkedIn that most fixes are done.

> The facts rely on the researchers' paper (primary), the NVD CVE records and IEEE Spectrum's reporting. This is a research demonstration, and the reports we consulted describe no real-world exploitation. This Brief does not assign blame to the manufacturer; its subject is the shared key and the missing input validation. What has not been disclosed does not mean there were no controls. This attack requires being within Bluetooth range. We will revise this Brief if Unitree announces that updates have shipped.

### After disclosure

- **Unitree**: On 29 September it said on LinkedIn that it had begun addressing the concerns immediately, had completed most fixes, and would roll out updates soon (IEEE Spectrum). Whether updates had shipped was not confirmed as of IEEE Spectrum's article (updated 2025-11).
- **Researchers**: Argued in the paper that defenses are needed as humanoid robots move into critical infrastructure.

## 6. Sources

- **arXiv (Research, primary)**: Mayoral-Vilches, Makris, Finisterre, "Cybersecurity AI: Humanoid Robots as Attack Vectors" (2025-09-17) — <https://arxiv.org/abs/2509.14139>
- **NVD (Primary, CVE)**: "CVE-2025-35027" (2025-09-26) — related: CVE-2025-60250, CVE-2025-60251, CVE-2025-60017 — <https://nvd.nist.gov/vuln/detail/CVE-2025-35027>
- **IEEE Spectrum (Press)**: "Exploit Allows for Takeover of Fleets of Unitree Robots" (2025-09-25) — <https://spectrum.ieee.org/unitree-robot-exploit>
- **Help Net Security (Press)**: "Humanoid robot found vulnerable to Bluetooth hack, data leaks to China" (2025-10-16) — <https://www.helpnetsecurity.com/2025/10/16/unitree-g1-humanoid-robot-vulnerability/>
- **Hackaday (Press)**: "Unitree Humanoid Robot Exploit Looks Like A Bad One" (2025-09-30) — <https://hackaday.com/2025/09/30/unitree-humanoid-robot-exploit-looks-like-a-bad-one/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
