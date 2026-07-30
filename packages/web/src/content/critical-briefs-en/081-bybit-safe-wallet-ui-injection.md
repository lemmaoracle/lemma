---
brief_no: 81
title: "Bybit：UI を信頼して署名した「正規の」マルチシグ承認が、安全なはずの Ethereum ウォレットを空にした — Safe{Wallet} フロントエンドへの JavaScript 注入で、署名者は何に署名しているかを確かめる手段がなかった（Bybit / Mandiant）"
title_en: "Bybit: a \"legitimate\" multisig approval signed by trusting the UI drained a supposedly secure Ethereum wallet — JavaScript injected into the Safe{Wallet} frontend left signers no way to verify what they were signing (Bybit / Mandiant)"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2025-02-21
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["045-humanity-protocol-multisig-key-custody", "016-verus-ethereum-bridge", "067-syscoin-bridge-spv-proof-parsing", "004-megalodon-github-supply-chain"]
status: published
version: "1.0"
og_lead_ja: "署名 UI への JS 注入で約 15 億ドルが流出 — Bybit"
og_lead_en: "JS injected into the signing UI drained ~$1.5B — Bybit"
gap_detected: "After discovery, the statement, Mandiant's post-incident forensics, fund tracing, cross-exchange blacklisting, and OFAC sanctions were all carried out, and the breach path was identified after the fact."
gap_missing: "There was no layer to check, independently of the UI, whether \"what the screen displayed matched the provenance of the bytes actually being signed\" before signing, so the injection that swapped the display for the signed target went straight through."
gap_fix: "Before signing executes, independently verify with Lemma that \"the transaction being signed carries the provenance of the intended approval flow,\" and prevent it up front."
---

## 1. TL;DR

In February 2025, roughly 401,347 ETH (worth ~$1.5B at the time) was drained from the crypto exchange Bybit. The cryptography was not broken. The attacker compromised a Safe{Wallet} (formerly Gnosis Safe) developer's machine and injected malicious JavaScript into the frontend: the multisig signers' screens displayed a "normal ETH transfer," while what they were actually made to sign was a `delegatecall` that swapped Safe's implementation contract for an attacker-controlled address. The multisig threshold was met, but the signers had no way to verify, independently of the UI, whether "what the screen displayed" matched "the provenance of the bytes actually signed." Post-discovery fund tracing, sanctions, and market coordination had some containment effect, but there was no layer to independently verify, before signing, whether "this transaction was truly what was intended."

---

## 2. What happened

- **Target**: Bybit's (a crypto exchange) ETH cold wallet, using a Safe{Wallet} (formerly Gnosis Safe) multisig
- **Loss**: approximately 401,347 ETH (~$1.4–1.5B at the time). The largest single-incident crypto theft on record
- **Date**: 2025-02-21
- **Attribution**: North Korea's Lazarus Group (officially attributed by the FBI in February of that year; also known as TraderTraitor)
- **Origin of the attack**: a Safe{Wallet} developer's machine was compromised, and malicious JavaScript was injected into the frontend code
- **Core of the abuse**: when Bybit's signers approved the transaction, the UI displayed "a normal ETH transfer (a routine move to a warm wallet)." The bytes actually signed were a `delegatecall` that swapped Safe's implementation contract for an attacker-controlled address, replacing Safe's entire logic. The attacker then drained all the ETH in the wallet through the contract
- **Structural point**: the multisig "threshold" (3-of-X) was met. The strength of the cryptographic signatures was not the problem. The problem was that the signers had no means to confirm, independently of the UI's display, "what they were actually signing"
- **Aftermath**: Bybit issued a statement and pledged to cover customer losses from its own assets. Mandiant performed forensics and confirmed the Safe{Wallet} supply-chain compromise. Elliptic and Chainalysis began fund tracing. Cross-exchange address blacklisting was carried out. The U.S. Treasury's OFAC added the related addresses to the sanctions list

The incident came together as the following chain.

1. **Initial compromise**: a Safe{Wallet} (frontend service) developer's machine is compromised. The specific malware path is established by forensics
2. **JS injection**: using developer access, malicious JavaScript is injected into the frontend code, reportedly designed to fire only on Bybit's wallet-management UI
3. **UI poisoning**: when Bybit's signers perform a transaction-approval operation in the Safe UI, the screen displays "a normal ETH transfer." The malicious JS swaps the payload actually being signed, converting it into a `delegatecall` that rewrites Safe's implementation contract address to the attacker's contract
4. **Meeting the multisig threshold**: multiple signers each approve (via legitimate procedures), meeting the multisig threshold. At this point all of them believed it was "a normal transfer"
5. **Swapping the contract implementation**: once the signatures pass, the implementation contract that Safe's proxy points to is changed to an attacker-controlled address
6. **Draining all assets**: the attacker drains all the ETH in the wallet (~401,347 ETH) through the new implementation
7. **Dispersing the funds**: the attacker disperses the destination addresses across multiple hops in an attempt to launder

---

## 3. Timeline — disclosure and response

- **2025-02-21 (estimated, just before the attack)**: the Safe{Wallet} developer machine is compromised and malicious JS is injected into the frontend
- **2025-02-21**: Bybit's signers approve a transaction that appeared to be a routine warm-wallet transfer. The attacker executes the ETH withdrawal
- **2025-02-21 (that day)**: Bybit CEO Ben Zhou discloses the breach on X (formerly Twitter). The exchange pledges customer compensation (from its own assets)
- **2025-02-21 to 22**: Elliptic and Chainalysis begin fund tracing. Exchanges and blockchain parties coordinate to advance address blacklisting
- **2025-02-26**: Mandiant confirms the Safe{Wallet} supply-chain compromise (via the developer machine)
- **early 2025-03**: the FBI announces its official attribution to North Korea's Lazarus Group (TraderTraitor). Sanctions measures against the related addresses advance

> Note: proper nouns, CVEs, and attribution are recorded with Mandiant, the FBI, and the exchange's disclosures as primary sources. This Brief is based on the values confirmable at the time of research, avoids asserting scale or method definitively, names its sources, and asks the reader to consult the latest primary information.

The response and industry movement after disclosure:

- **Bybit**: CEO Ben Zhou issued a same-day statement. Pledged to compensate all customers from its own assets, and actually carried out the reimbursement
- **Safe{Wallet} (Gnosis Safe)**: paused the service, identified and removed the compromised portion of the frontend, and conducted a full audit of related infrastructure
- **Mandiant (Google Cloud)**: as the forensics lead, confirmed and disclosed the supply-chain compromise path (developer machine → frontend JS injection)
- **FBI**: officially announced attribution to North Korea's Lazarus Group (TraderTraitor)
- **Cross-industry**: Elliptic and Chainalysis's fund tracing, address blacklisting at major exchanges, and OFAC sanctions were carried out in coordination
- **A framing for the industry**: as the first large-scale incident to squarely target the UI layer of a multisig wallet as a supply-chain attack surface, debate intensified over mandating direct transaction display on hardware wallets and independent verification of the signed payload

---

## 4. Why it wasn't stopped

The central **failure primitive is that "what the multisig signers approved was what the UI displayed, and it was not verified independently of the provenance of the bytes of the transaction actually signed."**

Safe's multisig design guarantees that "if multiple keyholders agree, it executes." But what this incident showed is the point that whether "what the keyholders agreed to" and "the actual transaction that was signed" are identical is something that design does not guarantee. The UI is an interface that displays the signing target, and the provenance of that displayed content is not cryptographically protected. The attacker did not need to break cryptography; they intervened in the "translation layer" between the UI and the signed bytes.

It is the same `bridge-config-trust` category as [Brief No.045](/critical/briefs/045-humanity-protocol-multisig-key-custody/) (Humanity Protocol multisig key concentration), No.016 (Verus bridge, absent semantic integrity of a Merkle Proof), and No.067 (Syscoin SPV-proof parsing flaw), but the novelty of this case is that **the attack surface was neither on-chain nor the proof-verification logic, but the off-chain supply chain of the signing UI.** Not the content of the proof, but the provenance of "what is presented to the signer as the proof," was poisoned. It shares a root with No.004 (Megalodon GitHub supply chain) in that, starting from developer access, malicious code was mixed into legitimate distribution artifacts.

After the attack was discovered, Bybit's immediate statement, Mandiant's identification of the supply-chain compromise path, Elliptic and Chainalysis's fund tracing, the cross-exchange blacklisting, and the OFAC sanctions are indispensable for grasping, containing, and discussing the recurrence of the damage, and this Brief does not negate that role. Here too, this coordination worked to trace the drained funds and freeze a portion. Detection did indeed work.

At the same time, detection does not change what the receiving side (the signer asked to sign, the contract that receives and executes the signature) actually accepts. The signers confirmed the transaction content displayed in the UI, but had no means to confirm, independently of the UI, "whether that content matched the bytes actually being signed." The malicious JS swapped the display for the signed target outside the signers' confirmation action. Meeting the multisig threshold proves "legitimate keyholders agreed to something," but does not prove "that something was what the signers intended." What was missing was a layer that independently verifies, before signing executes and on a separate track from the UI, "whether the transaction being signed carries the provenance of the intended approval flow." Even when after-the-fact detection fires into sanctions and tracing, it does not stop the withdrawal at the moment the signatures passed.

---

## 5. What proof would have changed

Pre-execution attestation fixes the transaction bytes being signed and their provenance (through which approval flow they were generated) as a cryptographic proof independently verifiable before signing executes. It attests in advance that what the UI displays is "a transaction with this provenance," and does not begin the signing session unless the match between the display and the signed bytes can be independently confirmed. It does not decouple the confirmation of the displayed content (the detection-style "this is how the screen looks") from the pre-execution attestation of the signed target's provenance ("the bytes being signed went through the legitimate approval flow"); only where the two overlap can a multisig approval be safely put into practice. Detection and pre-execution attestation are **complements**, not substitutes.

Against the detection–proof gap this incident exposed (the "provenance of the content" the signers approved was decoupled from "the bytes actually signed"), Lemma proposes the following design.

- **Provenance attestation of the signing target**: fix as a cryptographic proof independently verifiable before signing executes that the transaction bytes "were generated through an approved business flow," detecting in advance any divergence between the UI display and the signing target
- **Independence from the UI**: establish a layer that verifies the signing target's provenance hash on a channel independent of the UI the signer confirms
- **Multisig threshold ≠ legitimacy of content**: do not decouple the fact that "multiple signers agreed" from whether "what they agreed to is as intended," and make the latter the object of pre-execution attestation
- **Selective disclosure**: without exposing the entire internal business flow, prove with minimal disclosure only that "this transaction went through the legitimate approval flow"

Detection (after-the-fact statement, forensics, tracing, sanctions) works on remediating the damage; pre-execution attestation (independent verification of the signing target's provenance before signing executes) works on establishing trust in multisig approval — each complementary to the other.

---

## 6. Sources

- **Bybit official statement**: CEO Ben Zhou's posts on X (formerly Twitter) (2025-02-21) and the official Bybit blog
- **Mandiant (Google Cloud)**: technical analysis report on the Safe{Wallet} supply-chain compromise (published around 2025-02-26). Reporting on Mandiant's forensic findings — https://thehackernews.com/2025/03/safewallet-confirms-north-korean.html
- **FBI official statement**: "North Korea Responsible for $1.5 Billion Bybit Hack" (2025-03) — https://www.fbi.gov/investigate/cyber/alerts/2025/north-korea-responsible-for-1-5-billion-bybit-hack
- **Elliptic**: fund-tracing report (2025-02 to 03)
- **Chainalysis**: blockchain analysis report (2025-02 to 03)
- **Unchained / The Block / CoinDesk, etc.**: reporting on the incident's course (2025-02-21 onward)

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/), [Seal](https://lemma.frame00.com/seal/)
