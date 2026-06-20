---
brief_no: 70
title: "全機が同じ鍵を共有していたため、1 台の乗っ取りが機体群ごと崩せた（Unitree ロボット） — 実体エージェントに per-device の identity がなく、共有された 1 つの秘密が機体群全体の信頼を兼ねていた構造（Alias Robotics / UniPwn）"
title_en: "Unitree (UniPwn): one shared key across the fleet — per-device identity absent, so one compromise broke the whole fleet (Alias Robotics)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2025-09-20
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["068-universal-robots-polyscope-command-injection", "033-f5-bigip-edge-pivot", "003-starlette-badhost", "006-google-api-key-revocation-lag", "025-mcp-stdio-config-to-command-rce"]
status: draft
version: "1.0"
og_lead_ja: "全機共通の鍵で 1 台の乗っ取りが機体群ごと崩せた — Unitree / UniPwn"
og_lead_en: "One shared key let a single takeover collapse the whole fleet — Unitree / UniPwn"
gap_detected: "Responsible disclosure by researchers, firmware updates and a review of key management, and network segmentation were all communicated and put in place."
gap_missing: "There was no layer to check before operation whether the connecting party was legitimate against each device's own unique identity, so a passphrase shared across the whole fleet passed straight through."
gap_fix: "Before operation, independently verify with Lemma that this device faces a uniquely legitimate party and this operation stays within the bounds of its authorization, and prevent it up front."
---

## TL;DR

When you put a robot on Wi-Fi, you hand it the network name and password from your phone over Bluetooth — and that "first-time setup" exchange can become the way in to take the robot over. On 2025-09-20, researchers Andreas Makris (Bin4ry) and Kevin Finisterre (analysis by Alias Robotics) disclosed **"UniPwn,"** a technique abusing the BLE (Bluetooth Low Energy) provisioning interface of Unitree's humanoid and quadruped robots (G1, H1, Go2, B2). At its core: **every unit shipped with the same hardcoded encryption key.** An attacker passes authentication simply by sending the string `unitree` encrypted with that shared key, then ships code disguised as the Wi-Fi SSID/password — which the robot executes **as root, without validation**. Because the key is identical fleet-wide, all it takes is BLE proximity and a "same-for-everyone" secret extractable from the software. Take one unit and you can take any other with the same key; it can self-propagate to nearby robots (**wormable**). The config-file encryption used a single 128-bit key across all units too, so cracking one cracked all. We analyze this through Pillar 03 (Agent Authority Proof) as a structure in which **embodied agents had no per-device identity (a per-unit, independently verifiable selfhood), and one shared secret stood in for the whole fleet's trust.** It is the sister case to Brief 068 (an industrial robot that never verified a command sender's authority before physical motion).

---

## 1. Incident overview

- **Target**: Unitree's G1 and H1 humanoid robots and Go2 and B2 quadrupeds — including consumer-priced units sold in the US.
- **Disclosing party**: independent researchers Andreas Makris (Bin4ry), Kevin Finisterre, and Konstantin Severov found and published it (exploit name "UniPwn"). Alias Robotics (Víctor Mayoral-Vilches) published the analysis paper (arXiv:2509.14139).
- **Core of the technique**: the BLE Wi-Fi provisioning interface does not validate the input it receives. **Every unit shares the same hardcoded AES key**, so sending the string `unitree` encrypted with it is treated as an "authenticated user." Code disguised as the Wi-Fi SSID/password is then **executed as root, without validation**, when the robot attempts to connect.
- **CVEs**: chiefly CVE-2025-35027 (command injection via the spoofed SSID/password → root execution), CVE-2025-60250 (hardcoded, fleet-wide BLE key/IV), and CVE-2025-60251 (the handshake accepts any payload whose decryption contains the `unitree` substring); CVE-2025-60017 is also part of the set.
- **What it required**: BLE proximity and the "same-for-every-unit" key extractable from a device. There was no per-unit identity check.
- **Fleet-scale spread**: because the key is fleet-wide, one unit's technique works on the rest. The attacker can keep control by changing credentials or adding remote accounts, and it can self-propagate to nearby robots (a wormable-botnet concern — a demonstrated capability, not observed in-the-wild spread).
- **Weak config encryption**: config-file protection also relied on a single 128-bit key shared across units (recoverable from software) — an outer Blowfish layer in a weak repeating mode, an inner layer on a predictable generator — so cracking one unit cracks all.
- **Context**: network analysis found the robots periodically transmit to external servers (reported as China-based) without user notice/consent, and some paths disabled TLS certificate validation. This Brief's concern is not the destination's geography but the structure in which **transmission/connection happens without independent verification or consent**.
- **Core**: the embodied agent's "selfhood" was not per-unit but collapsed into one shared secret. Per-device identity, and its independent verification, did not exist.

---

## 2. Timeline

- 2025-05: researchers begin responsible disclosure to Unitree (the response is reported as limited thereafter).
- 2025-09-20: researchers publicly release UniPwn (root via BLE proximity + the shared key; fleet spread and wormability noted).
- 2025-09–10: Alias Robotics publishes the analysis paper (arXiv:2509.14139) with two case studies (surveillance and attack). Established media report on it.
- After: per-unit keys / per-device identity, input validation on the provisioning path, and consent/verification for telemetry become industry talking points.

> Note: This Brief covers the vulnerability and structure UniPwn revealed, not a condemnation of any actor or nationality. The destination geography is mentioned in one line as context; the analysis is confined to the absence of per-device identity and input validation. Unverifiable claims are not adopted.

---

## 3. The chain: one shared secret stands in for the fleet's selfhood

This incident shows a structure in which, with no per-unit selfhood and one fleet-wide secret doubling as the provisioning authentication, one unit's compromise technique spreads to the whole fleet. The path is as follows.

1. **BLE proximity**: the attacker approaches and connects to the target robot's BLE provisioning interface.
2. **Passing auth with the shared key**: sending the string `unitree` encrypted with the fleet-wide hardcoded key is accepted as an "authenticated user." No per-unit selfhood check applies.
3. **Unvalidated root execution**: code injected disguised as the Wi-Fi SSID/password is executed by the robot as root, without validation, on the connection attempt.
4. **Maintaining control**: the attacker keeps control by changing credentials or adding remote accounts.
5. **Spread to the fleet**: because the key is fleet-wide, the same technique works on other units and can self-propagate to nearby robots (wormable). The config encryption also uses one fleet-wide key, so cracking one unit cracks all.

---

## 4. Structural analysis

This incident belongs to Pillar 03 (Agent Authority Proof). The central failure primitive is that **the embodied agent had no per-device identity (a per-unit, independently verifiable selfhood), and one shared hardcoded secret doubled as the whole fleet's authentication.** "Every unit holds the same key" means one unit's trust and the fleet's trust are not separated, so one unit's compromise *is* the fleet's compromise. The provisioning path then root-executed, without validation, the input of whoever that shared secret declared "authenticated." We note `identity-auth` (per-unit selfhood and command authorization) as primary, and `agent-infrastructure` (the robot as a physical foundation) and `attribute-proof-bypass` (no independent verification of the selfhood attribute) as secondary.

It is the sister case to Brief 068 (Universal Robots PolyScope — an industrial robot that never verifies a command sender's authority before physical motion), forming a physical cluster of agent-authority cases. Where 068 was "no authorization check on the path at all," this incident differs in that **authentication exists, but it is a single fleet-wide secret that lacks per-unit uniqueness and independent verification.** It shares a root with Brief 033 (the compromise of an implicitly trusted single point cascading, with stored credentials, to the whole) in that breaching a trusted single point (the shared key) chains to the entire fleet. It connects to Brief 006 (a credential's revocation attribute never independently verified, valid even after deletion) in that a credential attribute — here, "is it per-unit?" — is not independently verified, and to Brief 003 (authentication bypassed via Host-header manipulation) and Brief 025 (a config → command-execution path becoming a broad RCE route) in that authentication/config-path input passes to the privileged side without validation.

What this incident throws into relief is the question of **how to independently verify an embodied agent's "selfhood."** The more autonomous machines enter homes, factories, and public space, the more each unit is not just a product but an actor (an agent). If that actor's selfhood is not per-unit but collapsed into a shared secret, one unit's flaw breaks the whole fleet's trust. Only once a per-unit, independently verifiable identity is in place can autonomous machines be safely welcomed into living and working spaces.

---

## 5. The gap between detection and proof

Responsible disclosure by the researchers, firmware updates and key-management review, and network segmentation are indispensable for deterring exposure, and this Brief does not negate that role. Surfacing the vulnerability and driving fixes are an important check on the damage.

At the same time, firmware updates and network monitoring are no material for the unit to independently verify — **before acting** — against its own per-unit selfhood, "is the party that just connected to the provisioning path a legitimate subject to set up and operate *this* unit?" The core of this incident is that authentication depended on a single fleet-wide secret, with no per-unit uniqueness or independent verification. Once the shared key is extracted, any unit can be passed by the same technique, spreading to nearby units. After-the-fact traffic analysis reconstructs "which unit sent what," but is no material to independently verify, before the action, "is this setup/command based on legitimate authority over *this* unit."

Pre-execution attestation treats a unit's selfhood, and the authorization of commands against it, not as "the presentation of a fleet-wide secret" but as "a per-unit, independently verifiable proof." If privileged operations — provisioning, operation, updates — are verified at the moment of the act against the unit's own identity and the grantor's authorization, then extracting the shared secret alone no longer passes authentication, and the path by which one unit's flaw spreads to the fleet is severed. Detecting exposure (the detection-style "which unit did what") and proving selfhood/authorization ("is this based on legitimate authority over this unit") are **complements**, not substitutes; only where the two overlap can autonomous machines be safely welcomed into living and working spaces (for verifying authorization independently at the moment of the act, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and industry trends

- **Researchers / Alias Robotics**: published the UniPwn technique with its fleet spread and wormability, and the analysis paper (arXiv:2509.14139) with two case studies (surveillance, attack), surfacing the embodied-agent design problem across the industry.
- **The call for per-device identity**: not a fleet-wide hardcoded key, but a per-unit, independently verifiable identity (keys/certificates) and input validation on the provisioning path became the talking points.
- **Telemetry consent/verification**: because external transmission happened without user notice/consent and some paths disabled TLS certificate validation, independent verification and consent for transmission/connection entered the discussion (the structure of verification/consent, not the destination's geography).
- **A cross-industry issue**: as autonomous machines enter homes, factories, and public space, how to independently verify an embodied agent's selfhood and command authorization per unit is being shared as a safety requirement. With Brief 068, the recognition is spreading that agent authority proof is needed whether software or physical.

The absence of a design that treats an embodied agent's selfhood not as "a fleet-wide secret" but as "a per-unit, independently verified proof" is not a problem of a specific manufacturer; it is increasingly shared as a cross-industry challenge for welcoming autonomous machines into society.

---

## 7. Lemma's analysis

Against the detection–proof gap this incident exposed (embodied agents with no per-device identity, one shared secret doubling as the fleet's trust), Lemma proposes a design that backs an agent's selfhood and actions — software or physical — not with "the presentation of a shared secret or token" but with "a unique, independently verifiable proof."

- **Per-device identity**: give each unit a unique, independently verifiable selfhood, separating one unit's trust from the fleet's. Sever the structure where extracting one shared secret directly breaches the whole fleet.
- **Per-action scoped authorization (proof-as-auth)**: independently verify privileged operations (provisioning, operation, updates) at the moment of the act against the unit's own identity and the grantor's authorization. Replace presentation of a shared secret with a per-operation proof (connecting to the physical-command authorization of Brief 068).
- **Integrity of input and path**: make the provenance of input/connections on the provisioning and telemetry paths independently verifiable, rejecting unvalidated root execution and certificate-less connections before they execute or are established.
- **Selective disclosure**: without exposing internal data, disclose only the minimum — that "this unit is a unique legitimate subject and this operation is within authorization" — reconciling independent verification with protection of unit/user information.

In this way, a proof fixed at the moment of the act functions as an independently verifiable trail of whether "this unit is uniquely legitimate, and this operation is within authorization," without depending on after-the-fact traffic analysis. Detection (after-the-fact analysis, updates, segmentation) works on correcting exposure; pre-execution attestation (independent verification of per-unit selfhood and authorization) works on establishing trust in embodied agents — each complementary to the other. For the design and its scope, see [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Alias Robotics / researchers (primary, analysis paper)**: "Cybersecurity AI: Humanoid Robots as Attack Vectors" (UniPwn, shared hardcoded key, BLE root, fleet spread, arXiv:2509.14139) — <https://arxiv.org/abs/2509.14139>
- **NVD (CVE)**: CVE-2025-35027 (command injection → root execution; related: CVE-2025-60250 / 60251 / 60017) — <https://nvd.nist.gov/vuln/detail/CVE-2025-35027>
- **Help Net Security**: "Humanoid robot found vulnerable to Bluetooth hack" (2025-10-16, overview of method and impact) — <https://www.helpnetsecurity.com/2025/10/16/unitree-g1-humanoid-robot-vulnerability/>
- **IEEE Spectrum**: "Unitree Robot Hack: What You Need to Know" — <https://spectrum.ieee.org/unitree-robot-exploit>
- **Hackaday**: "Unitree Humanoid Robot Exploit Looks Like A Bad One" (2025-09-30) — <https://hackaday.com/2025/09/30/unitree-humanoid-robot-exploit-looks-like-a-bad-one/>

---

## 9. About Brief distribution

The Lemma Critical Brief is a threat-intelligence brief published by Lemma. This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization. If you use it as a reference for decision-making, please consult your Lemma Critical contact directly.

[Discovery Call →](https://tally.so/r/Pd2Rl5)
[Whitepaper →](https://tally.so/r/7RJXdR)
[✉️ Newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
