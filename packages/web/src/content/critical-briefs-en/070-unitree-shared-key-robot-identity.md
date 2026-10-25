---
brief_no: 70
title: "Unitree：全機で同じ暗号の鍵を使っていたため、Bluetooth の初期設定から最上位の権限で乗っ取れることが示された(研究者の公表・NVD) — 接続してきた相手を、機体ごとの鍵で照合する層が無い"
title_en: "Unitree: Robots shared one encryption key across every unit, so they could be taken over with root access through Bluetooth setup (researchers, NVD) — No layer checks a connecting party against a per-unit key"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2025-09-20
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["068-universal-robots-polyscope-command-injection", "033-f5-bigip-edge-pivot", "003-starlette-badhost", "006-google-api-key-revocation-lag", "025-mcp-stdio-config-to-command-rce"]
status: published
version: "2.0"
og_lead_ja: "Unitree のロボット、全機共通の鍵で Bluetooth から乗っ取れた — 1 台の手口がほかの機体にも通じる"
og_lead_en: "Unitree robots could be taken over via Bluetooth with one key shared by every unit — one method works on all"
layout: "report"
og_kicker_ja: "脆弱性の公表 · ロボット"
og_kicker_en: "VULNERABILITY · ROBOTS"
og_headline_ja: "全機が同じ鍵を使っていた。\n1 台の手口が全機に通じる。\n<accent>人型と四足の 4 機種</accent>"
og_headline_en: "Every robot used the same key.\nOne method works on all.\n<accent>Four humanoid and quadruped models.</accent>"
summary_labels: ["What happened", "Why nothing stopped it", "The missing layer"]
key_figures:
  - value: "1"
    unit: "key"
    label: "One encryption key shared by every unit. Extracted from one robot, it worked on the others (NVD, researchers)"
    tone: "alert"
  - value: "4"
    unit: "models"
    label: "Affected models: the G1 and H1 humanoids and the Go2 and B2 quadrupeds (NVD)"
  - value: "2025-05 → 09-20"
    label: "From the researchers contacting Unitree to public disclosure. Unitree stopped replying in July (IEEE Spectrum)"
glossary:
  - term: "Bluetooth setup (BLE provisioning)"
    desc: "The entry point used to connect a robot to Wi-Fi, by sending settings over Bluetooth from a nearby phone."
  - term: "Root"
    desc: "The administrator level that can do anything on a device. Whoever holds it can control the device at will."
insight:
  slug: "one-key-for-all"
  label: "One key for every unit"
  quote: "The key was the same on every robot. Extract it from one, and it opened the entry point of every other unit too."
industries: ["manufacturing", "public-sector"]
controls:
  - slug: "ownership-check"
    item: "Check a connecting party against a key unique to each unit"
  - slug: "hold-unverified"
    item: "Validate input from setup and other entry points before using it"
self_check: "Before deploying robots or IoT devices, do you confirm that each unit checks connecting parties against its own key?"
countries: ["global"]
---

> **Revision (v2.0 / 2026-10-25)**: Restructured for general readers, with §5 rewritten as "How to counter this". Facts re-checked against the arXiv paper, IEEE Spectrum and the NVD CVE records. The paper's authors are now listed as Mayoral-Vilches, Makris and Finisterre. The location of the outside servers was removed, as the paper's abstract does not state it. Added that Unitree stopped replying in July and on 29 September said most fixes were done. The description of Lemma's design was removed, and the status set to published.

## 1. TL;DR

On 20 September 2025, researchers Andreas Makris and Kevin Finisterre disclosed a method (UniPwn) for taking over Unitree's humanoid (G1, H1) and quadruped (Go2, B2) robots through their Bluetooth setup entry point. Every unit used the same encryption key, and sending a handshake containing the string "unitree" passed authentication.

Commands then sent disguised as a Wi-Fi network name or password were run by the robot with root access. Because the key was the same on every unit, a method that worked on one robot worked on the others, and the researchers say it could spread automatically to nearby robots.

Unitree said on 29 September that most fixes were done, but that came after disclosure. What was missing was a layer that checks a connecting party against a key unique to each unit.

## 2. What happened

- **Researchers**: Andreas Makris and Kevin Finisterre found and disclosed it. With Víctor Mayoral-Vilches of Alias Robotics, they posted a paper on the G1's security to arXiv (2025-09).
- **Affected models**: The G1, H1, Go2 and B2, which share common firmware (NVD).
- **Entry point**: The Bluetooth setup used to connect the robot to Wi-Fi.
- **Why authentication passed**: The same encryption key and initialization value were built into every unit (CVE-2025-60250), and any handshake containing the substring "unitree" was accepted (CVE-2025-60251).
- **Root execution**: Commands slipped into strings sent as the Wi-Fi network name or password were run as root when Wi-Fi was reset (CVE-2025-35027, CVE-2025-60017).
- **Spread to other units**: The researchers say a compromised robot could look for other Unitree robots within Bluetooth range and take them over automatically.
- **Weak configuration encryption**: The paper says the encryption protecting settings also relied on a fixed scheme and predictable values.
- **Outbound data**: The paper says the robot sent sensor and status data to two outside servers every 300 seconds without telling the operator.

From the researchers' disclosures, a takeover unfolds in this chain.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The takeover chain, from the researchers' disclosures</span></div>
<p class="rx-ex-cap">The stopping point is ②. Had the connecting party been checked against a per-unit key, a key extracted from another robot would not have worked.</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">1</div><b>Connects to the setup entry point within Bluetooth range</b><p>Being nearby is enough.</p></div>
<div class="rx-step crit"><div class="who">Robot</div><div class="no">2</div><b>Accepts a handshake made with the shared key</b><p>No per-unit check.</p></div>
<div class="rx-step crit"><div class="who">Robot</div><div class="no">3</div><b>Runs commands hidden in Wi-Fi settings as root</b><p>Input is not validated.</p></div>
<div class="rx-step crit"><div class="who">Robot</div><div class="no">4</div><b>Could spread to nearby units</b><p>The key is the same on all.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2025-05**: The researchers contact Unitree.
- **2025-07**: Makris publishes the keys on X. Unitree stops replying.
- **2025-09-17**: The paper is posted to arXiv.
- **2025-09-20**: The researchers disclose UniPwn.
- **2025-09-26**: The CVEs are published in the NVD.
- **2025-09-29**: Unitree says on LinkedIn that most fixes are done.

> The facts rely on the researchers' paper (primary), the NVD CVE records and IEEE Spectrum's reporting. This Brief does not blame the manufacturer or any country; its subject is the shared key and the missing input validation. No real-world exploitation has been reported.

### After disclosure

- **Unitree**: On 29 September it said on LinkedIn that it had begun addressing the concerns immediately, had completed most fixes, and would roll out updates soon (IEEE Spectrum). Whether updates had shipped was not confirmed at the time of reporting.
- **Researchers**: Argued in the paper that defenses are needed as humanoid robots move into critical infrastructure.

## 4. Why it wasn't stopped

The failure was not a lack of encryption. **The key was the same on every unit, and nothing checked a connecting party against each unit's own key.**

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means accepting a connecting party only after checking it against a key unique to that unit. Detection means noticing a takeover or outbound data afterwards.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · missing</b>Check the connecting party against a per-unit key</div>
<div class="rx-zone gapz"><b>Gap</b><span>One method<br>works on all</span></div>
<div class="rx-zone det"><b>Detection layer · partial</b>Researchers found it; fixes in progress</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Bluetooth connection</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Shared key passes</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Root execution</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Other units</b></div>
</div>
</figure>

Researchers found and disclosed it, and Unitree worked on fixes. But as long as the key is the same on every unit, a key taken from one robot opens every unit that has not yet been fixed. That distance is the **gap between detection and proof**, and it is structural.

The same structure appears in [Universal Robots PolyScope](/critical/briefs/068-universal-robots-polyscope-command-injection/) (outside commands could be run through an industrial robot's control screen).

## 5. How to counter this

**Accept a connecting party only after checking it against a key or certificate unique to that unit.** With a different key on each unit, a key taken from one robot does not open the others. Validate input arriving through entry points such as setup before using it. It sits in front of detection, not in place of it.

### Industries and operations to watch

- **Industry · Manufacturing & core infrastructure**: Organizations that build robots or IoT devices, and those that deploy them in factories and facilities.
- **Industry · Public sector**: Organizations trialling robots for security or inspection (IEEE Spectrum noted UK police testing a Go2).

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Encrypting communications | Ineffective | The key was the same on every unit and could be extracted from one. |
| Handshake authentication | Ineffective | Anything containing "unitree" passed. |
| Network segmentation | Partial | The Bluetooth entry point, outside Wi-Fi, is reachable from nearby. |
| Firmware updates | Partial | Most fixes were said to be done, but shipping was not confirmed at the time of reporting. |

### What is needed

1. **Give each unit its own key or certificate, and check connecting parties against it.** Do not build the same secret into every unit.
2. **Validate input from setup and other entry points before using it.** Do not pass strings received as a Wi-Fi name or password straight into execution.
3. **Tell users what devices send outside, and let them stop it.** Let deploying organizations see destinations and contents.

### Checklist

Three things to confirm for organizations that build or deploy robots and IoT devices

- Do your devices use a different key or password on each unit?
- Do you know what your deployed devices send to outside servers?
- Do you have a procedure for receiving and applying firmware updates from the vendor?

Note: this method requires being within Bluetooth range. We will revise this Brief if Unitree announces that updates have shipped.

## 6. Sources

- **arXiv (Research, primary)**: Mayoral-Vilches, Makris, Finisterre, "Cybersecurity AI: Humanoid Robots as Attack Vectors" (2025-09-17) — <https://arxiv.org/abs/2509.14139>
- **NVD (Primary, CVE)**: "CVE-2025-35027" (2025-09-26) — related: CVE-2025-60250, CVE-2025-60251, CVE-2025-60017 — <https://nvd.nist.gov/vuln/detail/CVE-2025-35027>
- **IEEE Spectrum (Press)**: "Unitree Robot Hack: What You Need to Know" — <https://spectrum.ieee.org/unitree-robot-exploit>
- **Help Net Security (Press)**: "Humanoid robot found vulnerable to Bluetooth hack" (2025-10-16) — <https://www.helpnetsecurity.com/2025/10/16/unitree-g1-humanoid-robot-vulnerability/>
- **Hackaday (Press)**: "Unitree Humanoid Robot Exploit Looks Like A Bad One" (2025-09-30) — <https://hackaday.com/2025/09/30/unitree-humanoid-robot-exploit-looks-like-a-bad-one/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
