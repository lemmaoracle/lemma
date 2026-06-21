---
brief_no: 60
title: "AI が作った「実在しない判例」を、対立する双方の弁護士が裁判所に提出した（ミシシッピ連邦地裁） — AI が示した引用元の実在性・来歴が、書面提出の前に独立検証されない構造（Rule 11）"
title_en: "Both Sides Cited Cases That Never Existed — AI-Hallucinated Precedent and Rule 11 Sanctions (N.D. Miss.)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance"]
incident_date: 2026-06-08
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["005-noroboto-lying-fonts", "011-synthid-watermark-reverse-engineering", "012-williams-frt-wrongful-arrest", "017-mckinsey-lilli-system-prompts"]
status: published
version: "1.0"
og_lead_ja: "AI の幻覚判例を双方の弁護士が提出し制裁 — ミシシッピ連邦地裁"
og_lead_en: "Both sides filed AI-hallucinated cases, both sanctioned — N.D. Miss."
gap_detected: "The judge and opposing counsel caught the hallucinated citations after filing and imposed sanctions under Rule 11."
gap_missing: "There was no layer to independently check before the act of filing whether a cited precedent actually existed and the citation traced to a correct source, so authentic-looking citations passed straight through."
gap_fix: "Before filing, independently verify with Lemma that the basis for this claim actually exists and its provenance traces to a correct source, and prevent it up front."
---

## TL;DR

In June 2026, in Withers v. City of Aberdeen, counsel on both opposing sides filed AI-generated cases that do not exist, and Judge Aycock (N.D. Miss.) sanctioned all four under Rule 11. Catching the hallucinated citations after filing cannot establish that the cited authorities exist and carry a legitimate origin; a Rule 11 signature only self-certifies and guarantees nothing. What is structurally missing is a layer that, before the act, fixes the existence and provenance of cited sources to a verifiable trail. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident overview

- **Case**: Withers v. City of Aberdeen (a civil action over unpaid attorney's fees), U.S. District Court for the Northern District of Mississippi (Case No. 1:24-cv-00218)
- **Judge**: Sharion Aycock, Senior U.S. District Judge
- **What happened**: On both the plaintiff's and the defendant's side, out-of-state attorneys admitted pro hac vice used AI tools for research and drafting and, without verifying the output, filed briefs containing **citations to cases that do not exist (hallucinatory citations)**. Each side, independently of the other, engaged in the same conduct.
- **Legal basis**: Violation of Federal Rule of Civil Procedure 11 (counsel's duty to certify the accuracy of filed papers).
- **Sanctions**: All four attorneys were removed from the case and the trial was vacated. Kathleen M. Wilson (plaintiff's side, out-of-state pro hac vice / admission revoked, barred from appearing in the district for two years, fined $2,500); Kathryn Y. Williams (defendant's side, out-of-state pro hac vice / revoked, two-year bar, fined $3,500); and the local attorneys who sponsored their pro hac vice admission and signed the filings, Shauncey Hunter Ridgeway and Mark McClinton (fined $1,000 each, disqualified from the case).
- **The court's framing**: The judge placed the local counsel's "rubberstamp[ing]" of the out-of-state attorneys' briefs at the heart of the problem. Under Rule 11, a signature certifies the accuracy of the filing's contents — yet that certification was made without independently confirming the existence of the underlying authorities.
- **The core**: Whether the cases cited in the briefs "exist and carry a legitimate origin" was not independently verified before the act of filing. Verification did not engage until the judge and opposing party noticed and sanctioned the conduct after the fact.

---

## 2. Timeline

- 2024: Withers v. City of Aberdeen is pending (a dispute over unpaid attorney's fees).
- Early 2026: The out-of-state attorneys on both sides file briefs drafted with AI. The briefs contain citations to cases that do not exist. Local counsel signed each filing.
- 2026-01-20: A hearing is held. Wilson and Williams admit to using AI and to not verifying the existence of the citations before filing.
- 2026-06-08: Judge Aycock signs the sanctions order, sanctioning all four attorneys for Rule 11 violations and vacating the trial (reported June 9). The matter was widely reported as an unusual situation in which a federal court sanctioned both opposing parties for the same AI misuse at once.

> Note: The fine amounts, who was barred from appearing, and the disposition categories are based on the sanctions order (the Withers v. City of Aberdeen, No. 1:24-cv-00218 docket on CourtListener). This Brief is not intended to censure individual attorneys; it addresses the structure in which the grounds for an AI output go independently unverified before action.

---

## 3. The chain: how the grounds an AI surfaced become action without being verified

This incident stems from a structure in which the existence and provenance of the authorities surfaced by AI are not independently verified before they are acted upon (the act of filing). The path by which the failure propagates into sanction is as follows.

1. **AI generation**: A lawyer delegates research and drafting to an AI tool, which generates case citations supporting the argument. The citations look authentic, but their existence is not guaranteed.
2. **Grounds left unverified**: Whether the generated authorities (cases) exist and whether the citations are accurate is not independently verified before filing. The look of the AI output is equated with the authenticity of the grounds.
3. **Certification bypassed by signature**: Local counsel sign the out-of-state attorneys' briefs. Under Rule 11, a signature "certifies the accuracy of the contents," but it is made without independently confirming the existence of the authorities — what the judge called a "rubberstamp."
4. **Conversion into action**: Briefs containing nonexistent cases are filed with the court. Filing and signing are counsel's own certification of accuracy, so the truth or falsity of the grounds is carried directly into the legal proceeding.
5. **Repetition on both sides**: Both opposing parties, independently, engage in the same conduct. AI-mediated "non-verification of the grounds" appears not as one party's lapse but as a precondition of the whole proceeding.
6. **After-the-fact detection and sanction**: The judge and the opposing party notice the hallucinated citations, leading to Rule 11 sanctions and a vacated trial. This is an after-the-fact chain that acts once the briefs have been filed.

---

## 4. Structural analysis

This incident belongs to the `ai-decision-integrity` category of Pillar 02 (Verifiable AI). The central **failure primitive is "the existence and provenance of the authorities (grounds) surfaced by AI are not fixed as an independently verifiable trail before they are acted upon, and the look of the output is equated with the authenticity of the grounds."** We note `data-provenance` (the origin and provenance of the cited authority as the ground) as a secondary category.

The point is not "that the lawyers used AI" as such. AI-assisted research and drafting is settling into practice and is itself a productivity gain. What was missing is a layer that, **before the work enters practice**, independently confirms the existence and origin of the grounds the AI surfaced. With that layer, using AI is not itself the problem; indeed, if the authenticity of the grounds is independently verified before action, AI use and practical trust can coexist. The judge's decision to center "rubberstamp[ing]" reinforces this: certification by signature, absent a layer that independently confirms the existence of the grounds, leaves only the form and lets faulty grounds pass through.

This is the same shape as Brief 005 (Noroboto / font spoofing that splits what the AI reads from what the human sees): **the authenticity of an AI judgment's inputs and outputs is not verified as an independent layer.** Where 005 concerns the integrity of the "input" to the AI, this incident concerns the existence and provenance of the "output" from the AI (its cited grounds) — two cross-sections of the same thesis. It connects to Brief 011 (SynthID / provenance marks on AI artifacts can be stripped) in that the provenance of an AI artifact is not fixed in an independently verifiable form. It is the same shape as Brief 012 (a facial-recognition AI determination led directly to a coercive administrative disposition without independent verification), in that an AI output leads directly into a legal process or disposition without independent verification — and this incident moves that into the grounds of a judicial proceeding (the case law). It also connects to Brief 017 (McKinsey Lilli / the layer governing AI has neither integrity nor provenance) through the absence of a provenance layer that would underwrite trust in an AI output.

That "both opposing sides committed the same misuse at once" sharpens the point. It cannot be reduced to the inattention of individual counsel. When a layer to independently verify the grounds an AI surfaced is absent across the whole proceeding, the misuse appears not as one party's fault but as a structural precondition shared by both.

---

## 5. The gap between detection and proof

The judge's scrutiny, the opposing party's flagging, and the Rule 11 sanction are indispensable for correcting the faulty filings and deterring recurrence, and this Brief does not negate that role. After-the-fact detection and sanction in a judicial process are an important check on AI misuse.

At the same time, detection provides no material to independently establish — **before the action** — whether the grounds of the brief about to be filed exist and carry a legitimate origin. A citation to a nonexistent case looks authentic on the page and is indistinguishable from a legitimate argument at the moment of filing. The judge and the opposing party notice only after the brief has been filed and brought into the proceeding. Rule 11 requires counsel to certify accuracy, but that is the filer's self-certification, not an external layer that independently underwrites the existence of the grounds. That even a local counsel's signature can become a "rubberstamp" shows that self-certification alone cannot guarantee the existence of the grounds. What was missing is a mechanism to fix, before the action, an independently verifiable trail that "this authority exists and the citation derives from that source" — a chain separate from after-the-fact scrutiny and sanction.

The idea of pre-execution attestation flips the grounds an AI surfaces from "reconcile them by hand after the fact" to "fix, before the action, an independently verifiable trail of their existence and provenance." Bind the authorities an AI cites (cases, statutes, sources) to their actual origins as provenance, and make their existence and the consistency of the citation independently verifiable at the moment of the act — and an output that lacks grounds is screened out before the act of filing. Detecting the error (the detection-style "what was wrong") and proving the grounds ("were these grounds independently verified to exist and to derive from their source") are not substitutes but **complements**. Independently verifying the origin of the grounds an AI used connects directly to designs that attest the sources of RAG (retrieval-augmented generation).

For the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and industry trends

- **The court / Rule 11**: Judge Aycock sanctioned counsel on both sides and vacated the trial. Rule 11 is the framework that has counsel certify the accuracy of filed papers, but this incident showed that self-certification alone cannot independently guarantee the existence of AI-generated grounds — and that a local counsel's signature in particular can become a "rubberstamp."
- **AI guidance in the judiciary**: Across jurisdictions, guidance is developing on the use of generative AI in courts and legal practice and on the duty to verify citations. The debate is moving not toward banning AI use but toward building verification of outputs (especially cited sources) into practice procedures.
- **A cross-industry issue**: The demand to independently verify the grounds an AI surfaces (sources, citations, data sources) before they enter practice is not limited to the judiciary. Across every domain that makes decisions on the basis of AI outputs — contracts, audit, procurement, administrative procedure — verifying the existence and provenance of cited sources is emerging as a new requirement (the RAG source-attestation context).

The absence of a layer that independently verifies, before action, the grounds an AI surfaces is not a problem of a specific attorney or firm; it remains a cross-organizational challenge for any organization that builds AI into its operational decisions.

---

## 7. Lemma's analysis

Against the gap this incident exposed (the existence and provenance of the authorities an AI surfaces are not independently verified before they enter practice), Lemma proposes a design that fixes the grounds an AI used for a judgment or claim as an independently verifiable cryptographic proof at the moment of the act.

- **Source provenance binding (RAG source attestation)**: Bind the authorities an AI cites (cases, statutes, data sources) to their actual origins via a docHash, making "this authority exists and the citation derives from that source" independently verifiable at the moment of the act.
- **Gating ungrounded output**: Aim for a design in which actions such as filing or finalizing can proceed only when an independently verifiable proof of the grounds' existence and provenance is satisfied. An output based on grounds that do not exist is screened out before the action.
- **Record authenticity proof**: Bind an AI's output and the grounds it relied on at the moment of issuance, making "which output rests on which grounds" independently verifiable without depending on after-the-fact reconciliation.
- **Selective disclosure**: Without exposing internal prompts or model implementation, disclose only the minimum — that "the grounds for this output exist and meet the verification conditions" — reconciling independent verification with the protection of sensitive information.

In this way, a proof fixed at the moment of the act functions as an independently verifiable trail of whether "this claim rests on grounds that exist, and their provenance is verifiable," without depending on after-the-fact human reconciliation. Detection (after-the-fact scrutiny and sanction) works on correcting errors; attestation (independent verification of the grounds at the moment of the act) works on establishing trust in AI outputs — each complementary to the other. Rather than rejecting AI use itself, making the grounds checkable in layers lets AI use and practical trust coexist.

For the design and its scope, see [Pillar 02 — Verifiable AI](https://lemma.frame00.com/pillars/verifiable-ai/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Sanctions order (primary, court document)**: U.S. District Court, N.D. Mississippi, Withers v. City of Aberdeen (Case No. 1:24-cv-00218) Sanctions Order (CourtListener docket) — <https://www.courtlistener.com/docket/69485760/withers-v-city-of-aberdeen/>
- **Bloomberg Law**: "Lawyers on Both Sides in Mississippi Case Punished for AI Errors" — <https://news.bloomberglaw.com/litigation/lawyers-on-both-sides-in-mississippi-case-punished-for-ai-errors>
- **The New York Times**: "AI 'Hallucinated' Cases. Lawyers on Both Sides Were Sanctioned." (2026-06-09) — <https://www.nytimes.com/2026/06/09/us/ai-lawyers-sanctioned-mississippi.html>
- **ABA Journal**: "Federal judge removes 4 plaintiff and defense attorneys over AI errors" — <https://www.abajournal.com/news/article/federal-judge-terminates-4-plaintiff-and-defense-attorneys-over-ai-errors>
- **Reason (The Volokh Conspiracy)**: "Nonexistent Case Citations on Both Sides + 'Rubberstamp[ing]' by 'Local Counsel'" (2026-06-09) — <https://reason.com/volokh/2026/06/09/nonexistent-case-citations-on-both-sides-rubberstamping-by-local-counsel/>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
