---
brief_no: 100
title: "Aptos：Move VM の型混同で、あるオンチェーン資源が別の資源として扱われ得た（約 3,000 ドルの検証環境で再現）"
title_en: "Aptos: a Move VM type confusion could let one on-chain resource be treated as another (reproduced in a ~$3,000 test environment)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["bridge-config-trust", "data-provenance"]
incident_date: 2026-07-04
published: 2026-07-10
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["067-syscoin-bridge-spv-proof-parsing", "085-secret-network-axelar-bridge-infinite-mint", "016-verus-ethereum-bridge", "074-taiko-bridge-prover-key-leak", "002-stakedao-vsdcrv"]
status: published
version: "1.0"
og_lead_ja: "Aptos — 約 3,000 ドルの検証環境で Move VM の型混同を再現、波及すれば約 700 億ドル規模のリスク"
og_lead_en: "Aptos — a ~$3,000 rig reproduced a Move VM type confusion, a risk cascading to ~$70B"
gap_detected: "The detection chain worked — Hexens's discovery and responsible disclosure, Aptos's fix pushed to mainnet within hours, a traceable response in public repositories, and zero fund outflow — closing a critical flaw before real-world harm."
gap_missing: "There is no layer that independently verifies — at the moment downstream bridges, stablecoins, and exchanges accept Aptos-side state — whether that state was correctly produced under sound type resolution."
gap_fix: "Before an action such as a bridge withdrawal or a stablecoin issuance, verify the integrity and provenance of the upstream state relied on and the authorization to accept it — decoupled from the chain's own fix — and stop acceptance when no proof accompanies it, verified independently by Lemma, and prevent it up front."
---

## TL;DR

The blockchain security firm Hexens disclosed a critical vulnerability in Aptos's Move VM (the execution environment that processes every smart contract on this layer-1) that, through a stale-cache-derived type confusion, could make one on-chain resource be treated as a resource of another kind. Attacker-controlled code could write into another contract's storage, bypassing the guarantee of the type system that is supposed to keep each program's data isolated. Hexens ran a proof of concept on more than 30 validator nodes reproducing a near-mainnet stake distribution, transaction load, and execution contention (about $3,000, roughly one-third of the validator set), obtaining a success rate close to 90% (about 17–18 out of 20 runs) under near-real-world conditions. It estimated Aptos's own direct exposure at "the low single-digit billions of dollars," and the first-order systemic risk that could cascade from there at about $70 billion. It was reported on 2026-02-25; Aptos fixed mainnet within hours, and the disclosure was published after patching on 2026-07-04 (no fund outflow). What was missing is a layer that independently verifies the integrity of the Aptos-side state before downstream trust systems accept it. Detection and pre-execution proof are complements, not substitutes.

---

## 1. Incident overview

- **Subject**: the Move VM of Aptos (a layer-1 blockchain). The core component responsible for executing every smart contract on the network.
- **Reporter**: a research disclosure by the blockchain security firm Hexens. Following a responsible-disclosure process, it was published after the patch was applied.
- **Nature of the vulnerability**: a stale-cache-derived type confusion. It could trick the system into treating one on-chain resource as a resource of another kind, letting attacker-controlled code write into another contract's storage and bypass the type-system guarantee that isolates each program's data.
- **PoC scale and success rate**: verified on more than 30 validator nodes reproducing a near-mainnet stake distribution, near-real transaction load, and high execution contention. Setup cost was about $3,000, simulating roughly one-third of the validator set. A success rate close to 90% (about 17–18 out of 20 runs) under near-real-world conditions. Insider privileges and special permissions were reportedly unnecessary.
- **Harm / risk assessment (Hexens estimate)**: no fund outflow. Aptos's own direct exposure was assessed at "the low single-digit billions of dollars," and the first-order systemic risk that could cascade through bridges, cross-chain messaging, stablecoin operations, and exchanges at about $70 billion (both are Hexens estimates, not confirmed loss figures).
- **Response**: Hexens reported it on 2026-02-25. Aptos pushed a fix to mainnet within hours, and public-repository activity indicates work on 2026-02-27. Publication was 2026-07-04.
- **Core**: the layer-1 execution environment failed to soundly preserve the identity of a resource's "type (what it is)." As a result, the downstream parties that accept that state and assets (bridges, stablecoin issuers, exchanges) were structured to operate on that premise without any means to independently verify the integrity of the Aptos-side state.

---

## 2. Timeline

- 2026-02-25: Hexens reports the Move VM vulnerability through Aptos's emergency security channel.
- 2026-02-25 – 27: Aptos pushes a fix to mainnet within hours. Public-repository activity indicates work on 2026-02-27.
- 2026-07-04: on the premise that the patch is applied, Hexens's analysis and technique are published (no fund outflow).

> Note: the technical facts are based on Hexens's disclosure and reporting by CoinDesk and others. The PoC success rate (close to 90%), the ~$3,000 test environment, and the simulation of about one-third of the validator set are from Hexens's verification. The direct exposure of "the low single-digit billions of dollars" and the systemic risk of about $70 billion are both Hexens estimates, not confirmed loss figures. The publication date is given as 2026-07-04 (some reporting says 07-05) and varies by source. For the final determination of the root cause and assessment, refer to the official materials from Hexens and Aptos.

---

## 3. Attack vector

> This case is not an actual attack but a proof of concept (PoC) by Hexens. The following shows the structure of the disclosed exploit chain.

1. **Inducing the type confusion**: exploiting a stale-cache condition to make the Move VM resolve one on-chain resource as a resource of another kind (type confusion).
2. **Bypassing the type-system guarantee**: because the resource's type is misidentified, the type-system guarantee that is supposed to isolate each program's data collapses.
3. **Writing into another contract's storage**: attacker-controlled code reaches a state where it can write into another contract's storage that it should not be able to access.
4. **Reproduction under near-real-world conditions**: reproduced with a success rate close to 90% in an environment recreating a near-mainnet stake distribution, transaction load, and execution contention. Insider privileges are unnecessary.
5. **Presumed cascade**: the impact could spread beyond direct Aptos assets, through bridges, cross-chain messaging, stablecoin operations, and exchanges, to downstream systems that operate on the premise of the Aptos-side state (Hexens assessed this first-order cascade at about $70 billion).

---

## 4. Structural analysis

This case falls in the `code-provenance` category of Pillar 01 (Verifiable Origin). The central failure primitive is that the layer-1 execution environment could not soundly preserve the identity of a resource's "type = what it is," and **the downstream parties that accept that state and assets operate on that premise without being able to independently verify the integrity of the Aptos-side state**. The type confusion is a flaw internal to the Move VM, but what matters as threat intelligence is that the flaw does not stay confined to a single chain — it can cascade, without a layer of independent verification, into the layers that operate on the premise of "what happened on the other chain": bridges, cross-chain messaging, stablecoins, and exchanges. As secondaries, we add `bridge-config-trust` in that downstream bridges and cross-chain systems operate on the premise of the upstream state, and `data-provenance` in the sense of the resource's identity and backing.

This case is isomorphic to Brief No.067 (Syscoin, where a parsing flaw let a fake proof be accepted as "proof of a valid burn") and Brief No.085 (Secret Network, where a deposit from a fake channel went unverified and led directly to unbacked issuance), in that the receiving side verifies only part of "what actually happened on the other side" and does not independently verify the authenticity and integrity of the whole. It is continuous with Brief No.016 (Verus-Ethereum, where the Merkle proof was valid but the consistency of input and output amounts was unverified), in that only a portion of the cross-chain-relayed state was verified. It connects to Brief No.074 (Taiko, where the proof was correctly verified but the signer's legitimacy was not independently verified), in that the authenticity of the basis authorizing an asset movement was not independently verified. The difference is that this case is rooted not in a bridge's configuration or keys but in the type soundness of the layer-1 execution environment itself, and that it is a research disclosure with no real-world harm.

This case has one more layer that reflects the thesis of the Brief series. The reason a single VM flaw can be amplified into systemic risk (about $70 billion by Hexens's estimate) many tens of times its direct exposure (the low single-digit billions of dollars by Hexens's estimate) is that each downstream system accepts "that it is recorded as such on Aptos" as the ultimate basis, without independently verifying the integrity of the upstream state. The path of amplification runs precisely along the connection points where no layer of independent verification is placed.

---

## 5. The detection-versus-proof gap

Hexens's discovery and responsible disclosure, Aptos's fix pushed within hours, a traceable response in public repositories, and the outcome of zero fund outflow all functioned to close a critical flaw before real-world harm. This Brief does not diminish that role. On the contrary, this case is an example of researcher detection and a rapid patch working at their best. Detection and remediation did indeed function.

At the same time, detection does not provide the material to independently establish — **at the moment downstream bridges, stablecoins, and exchanges accept that state** — whether "the state and assets recorded on the Aptos side were correctly produced under sound type resolution." A state in which the type confusion has succeeded is formally indistinguishable from legitimate on-chain state. The patch closes future flaws of the same kind, but the very structure in which downstream systems accept "that it is recorded as such on Aptos" as the ultimate basis is not changed by a patch. As material for an audit to establish "is this bridge withdrawal, this issuance, backed by legitimate state that was soundly produced," the mere fact that "there was a record on Aptos" is not an independent trace of the integrity of the upstream state. This is a gap of a structurally independent layer that lies beyond the reach of the detection layer.

Pre-action attestation fills this gap by confirming, in an independently verifiable form, the integrity and provenance of the Aptos-side state before a downstream system accepts it and acts. Before authorizing a bridge withdrawal or a stablecoin issuance, it verifies "is this state legitimate, produced under sound execution," and blocks acceptance beforehand when no proof accompanies it. It severs — with a proof at each connection point — the systemic amplification of a single upstream flaw through connection points that lack independent verification. Pre-execution proof is not a substitute for detection (the researcher's discovery and patch) but a **complement**; only when the two overlap can cross-chain asset movement and issuance be put into practice with confidence.

---

## 6. Response and industry context

- **Aptos**: on Hexens's emergency report, pushed a fix to mainnet within hours. Public-repository activity indicates work on 2026-02-27. Thanks to the patch, no fund outflow from this flaw had occurred as of publication.
- **Research (Hexens)**: identified the stale-cache-derived type confusion and reproduced it in a test environment under near-mainnet conditions. It assessed direct exposure and systemic risk separately and quantitatively showed that a single VM flaw can be amplified through downstream trust connections.
- **Cross-industry**: the assessment that a flaw in a layer-1 execution environment can cascade into systemic risk far beyond that chain's direct assets drew attention to the structure in which bridges, cross-chain messaging, stablecoins, and exchanges take "the upstream chain's state" as a premise without independently verifying it. While responsible disclosure and a rapid patch worked effectively, how downstream systems independently verify the integrity of the upstream state remains a challenge on a separate track from any individual chain's fix.

---

## 7. Lemma's analysis

As a premise, the type soundness of the layer-1 execution environment (the Move VM) itself is a domain for that chain to design and fix, and Lemma does not take that over. What Lemma addresses in this case is the path along which a single upstream flaw is systemically amplified — that is, the connection points where downstream systems accept the upstream state without independently verifying it. Against the detection-versus-proof gap exposed here (downstream bridges, stablecoins, and exchanges do not independently verify the integrity of the Aptos-side state before acceptance), Lemma proposes the following design.

- **Pre-execution proof of upstream-state integrity**: before an action that takes the upstream chain's state as a premise, such as a bridge withdrawal or a stablecoin issuance, independently verify that the state is "legitimate, produced under sound execution," and reject acceptance beforehand when it cannot be confirmed.
- **Verification at each connection point**: sever the amplification of a single upstream flaw through connection points that lack independent verification, by verifying the integrity and provenance of the state at each cross-chain connection point.
- **Anchoring provenance and selective disclosure**: anchor the provenance of the state and assets to be accepted in a tamper-proof form, and prove only that "this state was legitimately produced," with minimal disclosure, without revealing the internal state.

Detection (the researcher's discovery, a rapid patch, and traceable remediation) works to remove individual flaws; pre-execution proof (integrity verification before acceptance downstream) works to sever systemic amplification — each complementary.

---

## 8. Sources

- **CoinDesk**: “How ethical hackers with just a $3,000 server found a flaw that could’ve put $70 billion in crypto at risk” (2026-07-04) — <https://www.coindesk.com/tech/2026/07/04/how-ethical-hackers-with-just-a-usd3-000-server-found-a-flaw-that-could-ve-put-usd70-billion-in-crypto-at-risk>
- **Crypto Briefing**: “Aptos fixes critical vulnerability that cost hundreds of dollars to exploit” (2026-07) — <https://cryptobriefing.com/aptos-fixes-critical-vulnerability-move-vm/>
- **CryptoDaily**: “Aptos’ Security Scare: What the Patched Move VM Flaw Means for APT Trust” (2026-07) — <https://cryptodaily.co.uk/2026/07/aptos-patched-move-vm-flaw-apt-trust>
- **Phemex News**: “Aptos Blockchain Vulnerability Fixed After $70 Billion Risk Exposed” (2026-07) — <https://phemex.com/news/article/aptos-blockchain-vulnerability-fixed-after-70-billion-risk-exposed-91840>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
