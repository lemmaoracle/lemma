---
brief_no: 111
title: "Wanchain：署名メッセージの符号化が曖昧だったため、正規の署名 1 つが桁違いの払い出しに再利用された"
title_en: "Wanchain — a non-injective signed-message encoding let one legitimate signature be reused for a vastly larger withdrawal"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["data-provenance", "identity-auth"]
incident_date: 2026-07-20
published: 2026-07-28
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["016-verus-ethereum-bridge", "107-verus-ethereum-bridge-repeat-exploit", "067-syscoin-bridge-spv-proof-parsing", "074-taiko-bridge-prover-key-leak", "108-afx-trade-validator-key-quorum"]
status: published
version: "1.0"
og_lead_ja: "Wanchain — 曖昧な署名符号化で正規署名が 6.5 万倍の払い出しに再利用"
og_lead_en: "Wanchain — ambiguous signing encoding let one signature move 65,000× more"
gap_detected: "BlockSec's preliminary analysis identified the non-injective signed-message encoding as the cause, on-chain investigators traced the four withdrawals, Wanchain halted the bridge, and the Midnight Foundation delimited the scope of impact."
gap_missing: "Signature verification only confirms 'is this a valid signature over these bytes,' and because the encoding was non-injective, 'that the withdrawal this signature points to is uniquely this one' was never verified at the moment of the withdrawal."
gap_fix: "Before a withdrawal executes, require an independently verifiable proof that the signed message is encoded in a canonical form with separators and length markers and is inseparably bound to this one withdrawal alone, and deny up front any withdrawal not accompanied by that proof."
---

## TL;DR

On 2026-07-20, about 515.2 million NIGHT (roughly $10 million) drained from the Cardano-side treasury of the Cardano–BNB Chain bridge operated by Wanchain, in four transactions over nine minutes. By BlockSec's preliminary analysis, the cause was neither a break in cryptography nor a theft of signing keys. The bridge's `TreasuryCheck` validator built the signed message by concatenating 14 variable-length fields with no separators and no length markers, making the encoding non-injective — different transaction data could collapse into the same byte string. As a result, a legitimate signature that authorized a transfer of about 3,110 NIGHT on BNB Chain became reusable for a withdrawal of 203,001,692 NIGHT on Cardano (over 65,000× the intended amount). Neither Cardano's consensus nor Wanchain's validator private keys were compromised. What was exploited was how the bridge interpreted a correctly generated signature. Detection and pre-action proof are complementary, not substitutes.

---

## 1. Incident Summary

- **Subject**: the Cardano–BNB Chain bridge operated by Wanchain. The Cardano-side treasury was the source of the withdrawals.
- **Drain**: about 515.2 million NIGHT. Four withdrawals (about 203M / 129.6M / 120.4M / 62.1M NIGHT, all rounded), all to the same attacker wallet. Loss estimates range from about $9 million to $13 million depending on the valuation point; the widely reported figure is about $10 million.
- **Window**: 14:46–14:55 UTC on 2026-07-20 (about nine minutes).
- **Cause (preliminary analysis)**: a non-injective signed-message encoding. The `TreasuryCheck` validator (an on-chain validation script on the Cardano side — distinct from the bridge's node operators, who are the signers) built the signed message by concatenating 14 variable-length redeemer fields with `AppendByteString`, without separators or length markers, so different transaction data could become indistinguishable after encoding (the class of ambiguity where fields "12" + "3" and "1" + "23" produce the same byte string).
- **The reuse in concrete terms**: a legitimate signature authorizing about 3,110 NIGHT on BNB Chain was reused for a withdrawal of 203,001,692 NIGHT on Cardano (about 65,000× the intended amount).
- **What was not compromised**: Cardano's consensus, Midnight's core protocol, and the private keys of Wanchain's signers (validators). The tokens were not newly minted; they were moved out of the existing treasury.
- **Scale of impact**: of the roughly 527 million NIGHT held at the Cardano-side address before the drain, about 12 million NIGHT remained. About 97.8% of the treasury backing Wanchain-wrapped NIGHT on BNB Chain was lost. The NIGHT price fell 30–43% at one point (the figure varies by source), reaching near an all-time low (about $0.016), then rebounded about 19% over the following 24 hours. Other assets in the treasury (Mynth, XER, WMT, and others) were not withdrawn, so NIGHT was deliberately targeted.
- **Status**: Wanchain halted the bridge and is investigating. The Midnight Foundation stated that the Midnight blockchain itself is intact and that the event is confined to Wanchain's third-party bridge infrastructure.

---

## 2. Timeline

- 2026-07-20 14:46–14:55 UTC: about 515.2M NIGHT drains from the Cardano-side treasury to the attacker's wallet across four withdrawals.
- 2026-07-21: BlockSec's preliminary analysis and reporting by several outlets. Signature reuse via a non-injective signed-message encoding is indicated as the cause.
- around 2026-07-21: Wanchain halts the bridge and opens an investigation. The Midnight Foundation states that Midnight itself and Cardano consensus are intact. The NIGHT price partially rebounds after the sharp fall.
- Since then: Wanchain's final post-mortem and compensation policy remain unpublished as of this writing.

> Note: the technical facts are based on BlockSec's preliminary analysis and on established media and analyses reporting it (CoinDesk, The Crypto Times, blockchainreporter, and others). The loss estimate (about $9–13 million) varies with the valuation point. The cause analysis is "preliminary" and is expected to be settled by Wanchain's own final post-mortem. Consult the latest primary sources.

---

## 3. Attack Vector

1. **Obtaining a legitimate signature**: the attacker starts from a legitimate signature (correctly generated by the validators) that authorizes a transfer of about 3,110 NIGHT on BNB Chain.
2. **Exploiting the encoding ambiguity**: because the `TreasuryCheck` validator built the signed message by concatenating 14 variable-length fields without separators or length markers, field boundaries are not uniquely determined. The attacker could construct different transaction data — a withdrawal orders of magnitude larger — that encodes to the same byte string.
3. **Reusing the signature**: the attacker presents the original signature as valid for a different withdrawal, 203,001,692 NIGHT on the Cardano side. Signature verification passes — the signature itself is correct, and the bytes of the message being verified match.
4. **Draining the treasury**: about 97.8% of the treasury moves to the attacker's wallet in four transactions — without compromising the validators' private keys or the Cardano/Midnight protocols.

---

## 4. Structural Analysis

This incident belongs to the `bridge-config-trust` category of Pillar 01 (Verifiable Origin). As secondary categories we add `data-provenance` on the surface of the uniqueness of "the action itself" that the signature points to (the withdrawal amount and destination), and `identity-auth` on the surface where a valid signature worked beyond the range it originally authorized.

The central failure primitive is that **whether a signature is valid (cryptographic correctness) and whether that signature "uniquely authorizes this one withdrawal alone" (injectivity of the encoding) were not separated in the bridge's verification**. Signature verification confirms "is this a valid signature over these bytes," but if the encoding is non-injective, different withdrawals can collapse into the same byte string. In other words, the bridge confirmed that "a valid signature exists," but never that "the withdrawal this signature points to is uniquely this one." This is not a problem of key management or of the cryptographic algorithm; it is a problem of **canonical serialization of the signed message — the uniqueness of provenance.**

This structure stands in the lineage of bridge incidents where a proof or signature is formally valid but the consistency of what it authorizes is not independently verified. It is of the same type as Brief No.016 ([the Verus–Ethereum bridge](/critical/briefs/016-verus-ethereum-bridge/), where the Merkle proof was valid but the consistency of input and output amounts went unverified) and Brief No.107 ([the repeat exploit of Verus](/critical/briefs/107-verus-ethereum-bridge-repeat-exploit/)), in that "the validity of a proof or signature and the consistency of the amount it authorizes are different things." It is close to Brief No.067 ([the Syscoin bridge](/critical/briefs/067-syscoin-bridge-spv-proof-parsing/), where a forged proof was interpreted as "valid" through lax parsing), in that the verifier is deceived by the interpretation of a byte string. By **contrast**, Brief No.074 ([the Taiko bridge](/critical/briefs/074-taiko-bridge-prover-key-leak/), where the proof was verified correctly but the signing key leaked) and Brief No.108 ([AFX Trade](/critical/briefs/108-afx-trade-validator-key-quorum/), where compromised validator signing keys satisfied the quorum) differ from this case — here no key compromise was involved at all, and the exploit was established purely through the **interpretation** of a correctly generated signature. What is required is independent verification of a canonical, injective encoding that binds a signature inseparably to "this one unique action."

---

## 5. The Detection–Proof Gap

BlockSec's preliminary analysis, on-chain investigators' tracing of the withdrawals, Wanchain's immediate halt of the bridge, and the Midnight Foundation's delimitation of the scope of impact — this detection-and-response sequence is indispensable to limiting further harm and establishing the cause, and this Brief does not deny that role. The anomalous withdrawals were inscribed on-chain and could be traced and made visible after the fact. Detection does play its part.

At the same time, signature verification by itself does not guarantee that "the signature now being verified authorizes only this one withdrawal (this amount, this destination)." As long as the encoding is non-injective, signature verification only confirms "a valid signature over these bytes"; it does not confirm which transaction those bytes uniquely correspond to. Anomaly detection and after-the-fact on-chain tracing surfaced as correlations only once the withdrawals had occurred; they did not establish, at the moment a withdrawal executes, that "the action this signature points to is this and no other." As material for an audit to establish "was this bridge withdrawal the one legitimately authorized transaction?", the mere fact that "a valid signature existed" is not a trail of the uniqueness of the authorized action. This is a gap in a structurally independent layer, outside the reach of the detection layer.

Pre-action attestation requires, before a withdrawal executes, an independently verifiable proof that the signature is inseparably bound to "this one withdrawal alone" through a canonical, injective encoding. Concretely: encode the signed message in a canonical form with length markers and separators, guarantee that different transactions cannot collapse into the same byte string, and make verification of that canonicity a condition for permitting the withdrawal (proof-as-auth). If no proof accompanies it, the withdrawal is denied by default (deny-by-default). Pre-action attestation is not a substitute for signature verification; it is a **complement** that layers "is the action the signature points to unique?" on top of "is the signature valid?" The combination of the two layers is what guarantees that a bridge withdrawal corresponds to the one authorized action.

---

## 6. Response and Industry Context

- **Wanchain**: halted the bridge and is investigating. Its final post-mortem and compensation policy remain unpublished as of this writing.
- **Midnight Foundation**: stated that Midnight itself — its protocol, validator network, consensus, and core infrastructure — and Cardano are intact, and that the event is confined to Wanchain's third-party bridge. It requested cooperation from the major exchanges.
- **Exchange response**: at the Midnight Foundation's request, seven exchanges — Binance, OKX, Kraken, KuCoin, Bybit, Gate, and MEXC — blacklisted the attacker's wallets, temporarily froze associated accounts, and suspended NIGHT deposits and withdrawals, blocking movement of the drained funds.
- **BlockSec / the research community**: identified the non-injective signed-message encoding as the preliminary cause and assessed that Wanchain's signing keys were not compromised (this was the reuse of a legitimately generated signature), and pointed to the need for canonical serialization (adding separators and length markers).
- **Cross-industry point**: this case made concrete a third class of failure — neither "safe if you protect the keys" nor "safe if you verify the proof" — in which the absence of **uniqueness in the encoding of the signed message** lets an authorization orders of magnitude larger be established with correct keys and a correct signature. In bridge implementations, canonical encoding that binds a signature inseparably to "this one unique action," and making its verification a precondition for withdrawal, is being reappraised as a requirement.

"How to bind a valid signature inseparably to the one withdrawal it authorizes" is expected to advance, prompted by this incident, as a requirement in cross-chain bridge design.

---

## 7. Lemma's Analysis

Against the detection–proof gap this incident exposed (the validity of the signature was verified, but the uniqueness of the withdrawal it points to — the injectivity of the encoding — was not), Lemma proposes a design that requires, before an authorized action executes, that the action be provably bound as unique.

- **Verification of a canonical, injective encoding**: encode the signed message in a canonical form with separators and length markers, making it verifiable that different transactions cannot collapse into the same byte string. Layer "the action this signature points to is this and no other" on top of "a valid signature exists."
- **Deny-by-default per-action authorization (proof-as-auth)**: before a withdrawal begins, have it prove that the signature is inseparably bound to a specific amount, destination, and chain, and deny by default any withdrawal not accompanied by that proof. Do not make the validity of the signature alone the basis for a withdrawal.
- **Fixing the uniqueness of provenance**: fix the object of authorization (the content of the withdrawal) uniquely at the moment of signing, so that later reinterpretation or reuse cannot be established.
- **Selective disclosure**: disclose at minimum only "this withdrawal corresponds to a canonical authorization," keeping internal keys and credentials out of the environment.

The scope of Lemma's claim is not to replace a bridge's cryptography or key management, but to fix **the uniqueness and provenance of the action** that a signature or proof authorizes, as an independently verifiable trail before execution. Detection (after-the-fact on-chain tracing and cause analysis) works on remediation after discovery, and pre-action attestation (verification of the encoding and uniqueness before a withdrawal) works on independently verifying the authorized action — the two work complementarily.

---

## 8. Sources

- **The Crypto Times (technical explainer conveying BlockSec's preliminary analysis)**: “The Signature Flaw Behind Wanchain's $10M NIGHT Exploit” (2026-07-22) — <https://www.cryptotimes.io/insights/wanchain-night-bridge-exploit-signature-flaw/>
- **CoinDesk**: “Midnight token rebounds 19% after Wanchain bridge hack, Hoskinson calls for ZK revamp” (2026-07-22; the price fall and rebound, and the industry reaction. It reports the drain as 290M NIGHT and the fall as 43%, figures that differ from the BlockSec-derived 515M) — <https://www.coindesk.com/business/2026/07/22/midnight-token-rebounds-after-wanchain-bridge-hack-hoskinson-calls-for-industry-overhaul>
- **blockchainreporter**: “Wanchain Cardano Bridge Exploit Drains 515M NIGHT, Token Plunges 30% To Record Low” (2026-07) — <https://blockchainreporter.net/wanchain-cardano-bridge-exploit-drains-515m-night-token-plunges-30-to-record-low/>
- **CoinGape**: “Wanchain Cardano Bridge Breached in $13M Hack, 515M NIGHT Tokens Drained” (2026-07) — <https://coingape.com/wanchain-cardano-bridge-breached-in-13m-hack-515m-night-tokens-drained/>
- **U.Today**: “515 Million NIGHT Exploit Update: 7 Major Exchanges Lock Down Stolen Funds for Cardano's Privacy Network” (2026-07; the freeze by seven exchanges) — <https://u.today/515-million-night-exploit-update-7-major-exchanges-lock-down-stolen-funds-for-cardanos-privacy>

---

## 9. About this Brief's distribution

This material is a structured analysis of public information and is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
