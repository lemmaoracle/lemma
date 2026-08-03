---
brief_no: 74
title: "Taiko ブリッジ：proof は正しく検証されたのに、署名鍵の漏洩で偽の出金が「有効」と通った — prover の署名鍵が公開リポジトリに漏れ、proof の形式的有効性と prover identity の独立検証が分離した構造（BlockSec / Blockaid）"
title_en: "Taiko Bridge: Forged Withdrawals Passed as Valid After a Prover Signing Key Leaked — a prover signing key leaked to a public repo, splitting a proof's formal validity from independent verification of prover identity (BlockSec / Blockaid)"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["code-provenance", "identity-auth"]
incident_date: 2026-06-22
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["067-syscoin-bridge-spv-proof-parsing", "016-verus-ethereum-bridge", "023-alephium-tokenbridge", "045-humanity-protocol-multisig-key-custody", "002-stakedao-vsdcrv", "001-kelpdao-rseth"]
status: published
version: "1.0"
og_lead_ja: "prover の署名鍵漏洩で偽の出金が「有効」と通った — Taiko ブリッジ"
og_lead_en: "A leaked prover signing key let forged withdrawals pass as valid — Taiko bridge"
gap_detected: "After discovery, halting block production, halting bridge withdrawals, asking exchanges to pause TAIKO deposits, and publishing the attacker addresses all worked, and Blockaid detected the anomaly in real time."
gap_missing: "There was no layer to independently verify, before the withdrawal executed, whether the prover that signed this proof was a legitimately authorized party — whether its signing key had leaked — so a forged proof that was formally valid went straight through."
gap_fix: "Before the withdrawal executes, independently verify with Lemma that the prover that signed this proof is an authorized party and that its signing key has not been compromised, and prevent it up front."
---

## 1. TL;DR

On Taiko's bridge (a Layer 2 of Ethereum), roughly $1.7M worth of assets were withdrawn from the Ethereum-side vault even though there was no corresponding deposit on the counterpart chain. The cryptography was not broken. The signing key of the prover that generates Taiko's proofs (the Raiko SGX-enclave signing key) had been left publicly exposed on GitHub, and the attacker used that key to register their own prover as a legitimate participant and signed a forged, formally "valid" withdrawal proof. The on-chain verifier accepted this proof as correct. After discovery, real-time detection, halting block production, asking exchanges to pause deposits, and publishing the relevant addresses all worked, but there was no layer to independently verify, before the withdrawal executed, whether the prover that signed this proof was truly a legitimately authorized prover. A proof being cryptographically valid was decoupled from the legitimacy of the party that signed it actually existing.

---

## 2. What happened

- **Target**: Taiko's L1 (Ethereum) bridge and ERC20 Vault. Taiko is a Layer 2 of Ethereum whose design backs the validity of transactions with proofs using a multi-prover stack called Raiko.
- **Loss**: roughly $1.7M worth of assets drained from the Ethereum-side vault (initially estimated at over $1M, later updated to ~$1.7M). The TAIKO token fell more than 20% after disclosure.
- **Date**: 2026-06-22. The same day, Taiko halted block production and urged users to withdraw funds from all bridges deployed on the chain.
- **Root cause (per BlockSec)**: the **signing key** of the Intel SGX enclave used by Raiko's prover had been left **publicly exposed on GitHub**. This key was supposed to be sealed inside secure hardware, on the premise that only authorized provers could generate valid proofs.
- **Core of the abuse**: because the key was exposed, the attacker could **register their own prover as a legitimate network participant** and sign a forged withdrawal proof. Taiko's on-chain verifier accepted this proof as "valid," and the bridge authorized the withdrawal on that basis. As a result, a forged withdrawal request passed on the Ethereum side with no corresponding `MessageSent` event (deposit) on the Taiko side.
- **Detection**: blockchain-security firm Blockaid detected the exploit in real time via its exploit-detection system and shared the affected contract, the attacker wallet, and the exploit transaction.
- **Containment**: Taiko confirmed containment at roughly 2:08 a.m. ET. It fully halted withdrawals from the L1 Bridge and ERC20 Vault. Before the freeze, the attacker had already moved about 2 million TAIKO (~$170K) to an account on the MEXC exchange. Taiko activated its Security Council (a multisig governance body) and stated it would respond on both technical and legal fronts. A full post-mortem is to be published once the investigation is complete.
- **Context**: 2026 cross-chain bridge-related exploits are reported to have reached a cumulative total of over $340M, all of which come down to the same question — how the destination chain verifies what actually happened on the counterpart chain.

The incident came together as the following chain.

1. **Exposure of the signing key**: the SGX-enclave signing key used by the prover of Raiko (Taiko's multi-prover stack) had been left on a public GitHub repository — a key that was supposed to be sealed inside hardware and never leave it.
2. **Registering a rogue prover**: using the exposed key, the attacker registers their own prover as a legitimate network participant. The very basis (the key) of the authority to generate proofs fell into the attacker's hands.
3. **Signing a forged proof**: for a withdrawal request with no corresponding deposit (`MessageSent` event) on the counterpart chain, the attacker signs a formally "valid" proof. The cryptographic algorithm itself is not broken.
4. **Acceptance by the verifier**: Taiko's on-chain verifier accepts this forged proof as valid, treating it as a proof signed with a legitimate prover's key.
5. **Executing an unbacked withdrawal**: trusting the proof, the bridge authorizes the withdrawal, and roughly $1.7M worth is drained from the Ethereum-side ERC20 Vault.
6. **Moving assets and containment**: the attacker moves about 2 million TAIKO to an exchange. Following Blockaid's real-time detection, Taiko moves to contain by halting withdrawals, halting block production, and activating the Security Council (an after-the-fact sequence that acts once the proof has been accepted).

---

## 3. Timeline — disclosure and response

- 2026-06-22: Blockaid's detection system detects the exploit in real time and warns the community.
- 2026-06-22: a forged withdrawal proof drains roughly $1.7M worth from the Ethereum-side vault. Before the freeze, the attacker moves about 2 million TAIKO to MEXC.
- 2026-06-22 (around 2:08 a.m. ET): Taiko confirms containment. It fully halts withdrawals from the L1 Bridge / ERC20 Vault, halts block production, and asks exchanges to pause TAIKO deposits.
- 2026-06-22: Taiko publishes several attacker addresses and activates the Security Council. It states it will pursue technical and legal measures.
- 2026-06-22: BlockSec identifies the root cause (the Raiko SGX signing key exposed on GitHub).
- Thereafter: Taiko signals it will publish a full post-mortem (not yet published as of this Brief's writing).

> Note: the technical facts in this Brief are based on the analyses by BlockSec and Blockaid and on established media reporting. The root cause predates Taiko's official post-mortem, and we record it as the stage at which security firms have pointed to "an SGX signing key exposed on GitHub." We avoid asserting scale or attribution definitively and name our sources.

The response and industry movement after disclosure:

- **Taiko**: halted block production on the day of the attack and fully halted withdrawals from the L1 Bridge / ERC20 Vault. It asked exchanges to pause TAIKO deposits and activated the Security Council. It published the attacker addresses and stated it would pursue technical and legal measures. A full post-mortem is to be published once the investigation is complete.
- **Blockaid**: detected the exploit in real time and gave early warning by sharing the affected contract, the attacker wallet, and the exploit transaction.
- **BlockSec**: identified the root cause (the Raiko SGX signing key exposed on GitHub) and once again made visible that key management is one of the most important operational issues for blockchain infrastructure.
- **A cross-industry framing**: 2026 bridge-related exploits are reported to have reached a cumulative total of over $340M, with cases centered on "forged cross-chain proofs" recurring. It was re-recognized that not the cryptographic strength of a proof but the management and provenance of the authority (the signing key) that generates the proof, together with verification of the signer's legitimacy, govern a bridge's safety.
- **Key-management practice**: secret scanning in CI/CD pipelines, pre-commit credential-detection hooks, HSM (hardware security module) integration, and other operations that catch exposure before a key reaches production were shared as the first line of defense.

"How to independently verify a cross-chain proof — as the legitimacy of the signer and the soundness of the key, separately from formal validity" is, on the back of this incident, expected to advance as an essential requirement of multi-prover / TEE bridge design.

---

## 4. Why it wasn't stopped

The central failure primitive is that the proof — the basis for authorizing a cross-chain withdrawal — was **accepted while "being cryptographically verified as valid" and "the prover that signed this proof being a legitimately authorized party" remained decoupled.** The verifier confirmed "this proof was signed with a legitimate prover's key and is formally valid," but it did not independently guarantee "is the prover that holds that key truly an authorized party (has the key not leaked)." Because the provenance and custody state of the signing key — the trust anchor — were cut off from verification, the exposure of the key became the entry point through which the entire proof system was bypassed.

It is the flip side of its sibling case, [Brief 067](/critical/briefs/067-syscoin-bridge-spv-proof-parsing/) (Syscoin, where a parsing flaw let a forged proof be accepted as "a valid proof of a burn"). In 067, the proof's **verification logic** mistook a forged proof; in this case, the proof was correctly verified but the **legitimacy of the signer** was not independently verified. In both, "formal validity" is cut off from "the actual existence of the fact or party it points to." It is also the same `bridge-config-trust` as [Brief 016](/critical/briefs/016-verus-ethereum-bridge/) (Verus-Ethereum, a valid Merkle Proof but no verification of input/output amount integrity) and [Brief 023](/critical/briefs/023-alephium-tokenbridge/) (Alephium, the guardian keys intact but the provenance of the signed event unverified), with an isomorphic primitive. In particular, it directly connects to [Brief 045](/critical/briefs/045-humanity-protocol-multisig-key-custody/) (Humanity Protocol, where a key held at a single custody point drained funds beyond the multisig threshold) in that **a fund transfer is authorized on trust in the key alone, while the custody and provenance of the key — the trust anchor — are never independently verified.**

Multi-prover and TEE (trusted execution environments such as SGX) are designs that distribute and harden proof generation, but their safety ultimately depends on the premise that "the signing key remains sealed inside hardware." The moment the key leaks to a public repository, even the most sophisticated cryptographic construction collapses along with its trust model. Even when a proof passes, only once the legitimacy of the prover that signed it is independently verified can a cross-chain withdrawal be safely placed at the point of settlement and operations.

Blockaid's real-time exploit detection, Taiko's immediate halting of the bridge and of block production, the request to exchanges to pause deposits, the publication of the attacker addresses, and the containment through the Security Council are indispensable for early grasp and suppression of the damage, and this Brief does not negate that role. Indeed, the speed of detection held the loss to about $1.7M, and halting the network prevented further outflow.

At the same time, detection does not change what the receiving side (the on-chain verifier, the bridge that authorizes the withdrawal) actually **accepts — which proof, as whose signature.** In this incident, the attacker's prover was registered as a legitimate participant with the exposed key, and its signature was formally valid, so the verifier's verification passed. What was missing was a layer to independently verify, before the withdrawal executed, "is the prover that signed this proof truly an authorized party — has the signing key leaked" — a verification on a separate track from the formal verification of the proof. Anomaly detection firing after the withdrawal does not stop the authorization at the moment the verifier accepted it. For regulatory reporting and audit, the fact that a proof was formally valid is, by itself, no independent evidentiary trail of the signer's legitimacy that "this cross-chain withdrawal was backed by a proof from a legitimately authorized prover."

---

## 5. What proof would have changed

Pre-execution attestation takes the design choice of receiving the cross-chain proof in a form the receiving side can independently verify before executing the withdrawal, and — decoupled from the proof's formal validity — verifying that "the prover that signed this proof is an authorized party and its signing key has not been compromised." If the signer's legitimacy cannot be confirmed, it blocks the withdrawal in advance even when the proof passes formally. The formal acceptance of a proof (the detection-style "this proof passes") and the pre-execution attestation of the signer's legitimacy ("the prover that signed is legitimate and the key is safe") are **complements**, not substitutes; only where the two overlap can a cross-chain withdrawal be safely put into practice.

Against the detection–proof gap this incident exposed (a cross-chain proof not independently verified, separately from formal validity, as the legitimacy of the prover that signed it and the soundness of the key), Lemma proposes a design that treats the proof passed cross-chain in a form the receiving side can independently verify before executing the withdrawal.

- **Pre-execution attestation of signer legitimacy**: decoupled from the proof's formal validity, verify that "the prover that signed this proof is an authorized party and its signing key has not been compromised," and reject the withdrawal in advance if it cannot be confirmed.
- **Authorization without sending the key**: discard the premise of sharing or exposing the signing key itself, leaning toward a Proof-as-Auth design that proves only "this is an authorized prover" without ever sending the key.
- **Pinning the provenance of the trust anchor**: pin the prover's registration and the key's custody state as tamper-proof provenance, and exclude exposed or unauthorized provers from the withdrawal-authorization path.
- **Selective disclosure**: without disclosing the prover's internal state or the key itself, disclose only the minimum — that "this signer is legitimate and uncompromised" — reconciling independent verification with the protection of sensitive information.

Against the verifiable-origin category's design thinking that "cryptographically valid ≠ the party that signed is legitimate," this incident is a case in which that anticipated failure mode has materialized as a recent real-world loss. Detection (after-the-fact pause, freeze, analysis) works on remediating the damage; pre-execution attestation (independent verification of the signer's legitimacy before the withdrawal executes) works on establishing trust in cross-chain withdrawals — each complementary to the other.

---

## 6. Sources

- **thirdweb (technical explanation, citing BlockSec / Blockaid)**: "Taiko Bridge Exploit Explained: How a Leaked Key Led to $1.7M in Forged Withdrawals" (2026-06-22) — <https://blog.thirdweb.com/taiko-bridge-exploit-explained-how-a-leaked-key-led-to-1-7m-in-forged-withdrawals/>
- **CoinDesk**: "Taiko halts its Ethereum layer 2 network after a bridge exploit, token dives 10%" (2026-06-22) — <https://www.coindesk.com/tech/2026/06/22/taiko-halts-its-ethereum-layer-2-network-after-a-bridge-exploit-token-dives-10>
- **The Block**: "Ethereum Layer 2 Taiko halts block production following exploit; urges users to withdraw funds" (2026-06-22) — <https://www.theblock.co/post/405486/taiko-confirms-exploit>
- **Crypto Times**: "$1.7M Gone: Taiko Bridge Exploited After SGX Signing Key Leak" (2026-06-22) — <https://www.cryptotimes.io/2026/06/22/1-7m-gone-taiko-bridge-exploited-after-sgx-signing-key-leak/>
- **Bankless Times**: "Taiko Halts Blocks After $1.7M Exploit, Urges Users to Exit Bridges" (2026-06-22) — <https://www.banklesstimes.com/articles/2026/06/22/taiko-halts-blocks-after-1-7m-exploit-urges-users-to-exit-bridges/>
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/#provenance), [Trust402](https://lemma.frame00.com/trust402/)
