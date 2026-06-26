---
brief_no: 84
title: "香港 Deepfake ビデオ会議詐欺：CFO・同僚全員をリアルタイム deepfake で偽装し、約 2,600 万ドルの送金を実行させた — 顔と声の確認が「本人が今ここにいる」ことの証明にならなくなった構造（香港警察 / Arup）"
title_en: "Hong Kong deepfake video-call fraud: a real-time deepfake of the CFO and every colleague drove a ~$25.6M transfer — seeing a face and hearing a voice no longer proves the person is actually present (Hong Kong Police / Arup)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth"]
incident_date: 2024-02-04
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["034-ekyc-liveness-bypass", "050-grok-deepfake-consent-provenance", "053-youtube-deepfake-likeness-provenance"]
status: published
version: "1.0"
og_lead_ja: "香港 Deepfake ビデオ会議詐欺、CFO・同僚全員を偽装し約 2,600 万ドル送金"
og_lead_en: "Hong Kong deepfake video-call fraud: faked CFO drove a ~$25.6M transfer"
gap_detected: "Post-transfer reconciliation surfaced the fraud, and the Hong Kong Police investigation and disclosure and Arup's hardened controls all operated."
gap_missing: "There was no means to prove, independently of the video and audio, that the person on the far side of the video call was the real CFO, so the deepfake passed as proof of the approver's identity."
gap_fix: "Before executing a high-value approval, independently verify the approver's identity provenance with Lemma as cryptographic proof separate from video and audio, and prevent it up front."
---

## TL;DR

In January 2024, a finance employee at a multinational company in Hong Kong wired about $25.6 million (HK$200 million) to five accounts after "speaking directly" on a video call with several people including the CFO, the finance team, and an outside adviser. Every participant in that meeting was a real-time deepfake. The employee had been suspicious of an earlier phishing email, but the "video call with familiar faces and voices" turned that suspicion into conviction. The Hong Kong Police disclosed the case on February 4, 2024. Arup (the major UK engineering firm) was later confirmed as the victim company. As a single case, this is the clearest demonstration yet that visual and auditory confirmation — "I saw the face, I heard the voice, I spoke with several people" — no longer functions as a basis for trust under modern AI generation technology.

---

## 1. Incident overview

- **Subject**: A finance employee at a multinational company (Hong Kong-based). Arup (a major UK-based engineering firm) was later confirmed as the victim company
- **Scale of loss**: About HK$200 million (Hong Kong dollars) ≈ about US$25.6 million (at the rate of the time). Dispersed across five Hong Kong bank accounts
- **Summary**: The finance employee received a phishing email purporting to be "instructions from the CFO" regarding a confidential financial transaction. Suspicious of the content, the employee then received and joined an invitation to a video call hosted by the "CFO." The meeting included the CFO, several colleagues, and outside parties, all of whom gave instructions with familiar faces and voices. Every participant was a deepfake
- **Technical method**: Real-time deepfakes generated from publicly available video and audio reproduced the CFO and several colleagues as video and audio
- **How it surfaced**: After the transfer, when the employee checked with the real CFO and parties at headquarters, it emerged that no such meeting or instruction had ever existed
- **Hong Kong Police**: Disclosed the case on 2024-02-04. Around the same time it also announced arrests (6 people) in a separate deepfake fraud case
- **Arup**: Around May 2024, confirmed to the media that it was the victim company. It stated that it had strengthened its security measures
- **Core**: Visual and auditory confirmation — "I saw the face, I heard the voice, I spoke live with several people" — no longer proves that the person is actually present. The approval flow had relied on that confirmation as proof

---

## 2. Timeline

- **January 2024 (early to mid)**: The finance employee receives an email claiming to be "confidential transaction instructions from the CFO." Suspects it may be phishing
- **January 2024 (mid)**: Receives and joins an invitation to a video call hosted by the "CFO." In the meeting, participants posing as the CFO, several colleagues, and outside parties (all deepfakes) instruct the employee to execute the transaction
- **January 2024 (same to late)**: The employee disperses HK$200 million across five accounts. The fraud is later discovered through verification with the real parties. Reported to the Hong Kong Police
- **2024-02-04**: The Hong Kong Police disclose the case at a press conference (the company and employee names withheld). They also announce arrests (6 people) in a separate, contemporaneous deepfake fraud case
- **Around May 2024**: Arup is confirmed as the victim company. Comments that it has conducted an investigation and strengthened its measures

> Note: This Brief draws on the Hong Kong Police disclosure and Arup's confirmation of the breach as primary sources. The company name was initially withheld, and the loss amount is an approximate currency conversion as of the time of disclosure. Figures and the sequence of events vary across reporting outlets, so refer to the latest public information.

---

## 3. Attack vector

1. **Collection of public material**: Collect public video (meeting recordings, talks, social-media video, etc.) and audio of the target company's CFO, executives, and staff
2. **Generation of the deepfake model**: Use the collected video and audio to generate deepfake video and voice clones that can be applied to a real-time video call
3. **Initial contact via phishing email**: Send the finance employee an email claiming to be "confidential transaction instructions from the CFO." The employee is suspicious
4. **Dispelling the suspicion (video call)**: Have the employee join a video-call invitation, where the deepfake-reproduced CFO, several colleagues, and outside parties give "direct" instructions. The visual and auditory confirmation of "I confirmed several familiar faces and voices" turns the employee's suspicion into trust
5. **Execution of the transfer**: The employee disperses HK$200 million across five accounts, executing after the "I confirmed it directly on the video call" procedure
6. **Discovery through verification**: After the transfer, the fraud is discovered through verification with the real CFO and parties

---

## 4. Structural analysis

This incident belongs to the `regulatory-attribute` category under Pillar 04 (Regulatory Attribute Proof). The central **failure primitive is "the visual and auditory confirmation of having seen the face, heard the voice, and spoken in real time on video no longer functions as proof that the person is actually present."**

Corporate financial-approval processes have long substituted "I confirmed the CFO's face and voice over phone or video call" for the factual confirmation that "the CFO instructed this directly." This case makes clear that the substitution no longer holds. Deepfake technology made the sensory confirmation of "matching face and voice" copyable — given publicly available video and audio, a person's appearance can be generated in real time while the person is absent.

The employee's decision process was reasonable: suspicion of the phishing email → confirmation of several known individuals on the video call → trust and execution. The problem lies in the **system design in which visual and auditory confirmation functioned as "proof of provenance."** It tried to prove the fact that "the CFO approved this transfer" by the sensory confirmation that "the CFO joined the video call by face and voice," but the latter no longer proves the former.

Comparison with Brief No.034 (eKYC liveness bypass): No.034 deceived a biometric authentication system with "injected video," but this case differs structurally in that it **deceived human sensory confirmation**. Rather than fooling an automated system, it surrounded a suspicious, sensible human with multiple deepfakes to make them "certain." It shares the attribute-proof-bypass category with Brief No.050 (Grok non-consensual deepfake generation) and No.053 (YouTube deepfake of a public figure), but this case is the largest-scale instance in which a deepfake was used as the direct causal path of fraud loss.

As a secondary category we note `identity-auth` (the absence of provenance proof for the CFO's instruction within the transfer-approval flow).

---

## 5. The gap between detection and proof

Reporting, reconciliation, the Hong Kong Police investigation, and Arup's hardened internal controls are indispensable for grasping the harm and deterring recurrence, and this Brief does not deny that role. In fact, the fraud was discovered through post-transfer reconciliation, and the disclosure of the case spread awareness of the similar method across the industry. These after-the-fact responses should be strengthened.

At the same time, detection and reconciliation do not establish — independently of the video and audio, and before the transfer is executed — "that the person on the far side of the video call is the real CFO." The finance employee did all the verification possible (was suspicious, and confirmed several faces and voices on the video call). What was missing is a mechanism that cryptographically fixes, independently of video and audio, the provenance of the CFO's identity having "approved this transfer." Unless the fact of approval and the identity of the approver are recorded in an independently verifiable form, visual confirmation will keep being used as a "substitute proof" and will keep being defeated. As long as detection judges the authenticity of video after the fact, the response can only trail the harm.

Pre-execution attestation closes this gap by inserting one step — independent verification of the approver's identity provenance — into the execution path of a high-value approval. By requiring, before execution, that "this transaction was approved by this authorized party under these conditions" via a cryptographic channel separate from video and audio, and by fixing the fact of approval as a pre-execution proof, it provides a design in which, even if a deepfake reproduces the video, that proof cannot be forged. Detection that judges the authenticity of video after the fact and pre-execution attestation that independently verifies the approver's identity before execution are not substitutes but **complements**.

For the thesis that after-the-fact detection is not proof, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for design that verifies independently before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and industry trends

- **Hong Kong Police**: Disclosed the case on 2024-02-04. Issued an alert as a deepfake fraud case. Also announced 6 arrests in a separate case at the same time
- **Arup**: Confirmed the breach and conducted internal security training and procedural hardening. Officially commented that "the threat from AI and deepfakes is real"
- **Cross-industry point**: Since this case, companies that had positioned "face confirmation on a video call" as an approval procedure for financial transactions have been forced to review their procedures. Mandating out-of-band verification — reconciliation over an independent communication path — has been debated
- **Democratization of AI and generation technology**: It has been noted that the improved accessibility of real-time deepfake generation tools has spread to criminal groups attacks that previously only state-level actors could carry out
- **Regulation and compliance**: Strengthening of internal controls at financial institutions and multinationals (especially "two-or-more approvers," "out-of-band verification," and "additional verification for high-value transactions") is accelerating. The debate also widens in relation to the EU AI Act's deepfake transparency requirements

---

## 7. Lemma's analysis

Against the gap this case exposed (visual confirmation of "face and voice" no longer functioning as proof of "the person's actual presence"), Lemma proposes the following.

- **Pre-execution attestation of the approver's identity**: Before executing a high-value transfer or critical business approval, confirm the approver's identity provenance (independent verification of identity via public key / ZK proof) through a cryptographic channel separate from video and audio
- **Fixing the provenance of approval**: Record the fact that "this transaction was approved by this authorized party, at this date and time, under these conditions" as cryptographic proof that cannot be tampered with after the fact. No matter how sophisticated the deepfake, forging this proof would require access to the private key
- **Independence from video confirmation**: Demote visual and auditory confirmation from "trust gate" to "auxiliary information," and support the move to a design in which independent attribute proof is the gate
- **Selective disclosure**: Without disclosing the CFO's full personal information, prove with minimal disclosure only that "this person approved with this authority," and use it as an internal compliance record

Detection (after-the-fact judgment of the authenticity of video) and pre-execution attestation (independent verification of the approver's identity before execution) are not substitutes but complements, and only by combining them can deepfake-based approval impersonation be distinguished before it occurs. For the design and its scope, see [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/regulatory-attribute-proof/) and [Seal](https://lemma.frame00.com/seal/).

---

## 8. Sources

- **Hong Kong Police (primary, disclosure)**: 2024-02-04 press conference. Announced as a "super deepfake" fraud case — reported by multiple international media outlets
- **Arup official confirmation**: Arup's comment to the media confirming it as the victim company (around May 2024) — BBC, The Guardian, CNN, etc.
- **South China Morning Post**: "Deepfake video call used in HK$200 million fraud" (2024-02-04)
- **CNN**: "Finance worker pays out $25 million after video call with deepfake 'chief financial officer'" (2024-02-04)
- **The Guardian**: "Arup loses $25m after employee duped by deepfake video call" (2024)

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
