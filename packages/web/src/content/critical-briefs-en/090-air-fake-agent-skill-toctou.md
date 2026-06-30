---
brief_no: 90
title: "AIR：偽のエージェントスキルが全スキャナーを通過し、約26,000エージェントに到達した — スキャン後に差し替えられる外部リンクが盲点だった"
title_en: "AIR: A Fake Agent Skill Cleared Every Scanner and Reached ~26,000 Agents — the Blind Spot Was an External Link Mutable After the Scan"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["agent-infrastructure", "identity-auth"]
incident_date: 2026-06-29
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["014-tanstack-oidc-trusted-publisher", "082-xz-utils-backdoor-identity-provenance", "030-stripe-trusted-channel-skimmer", "037-agent-config-auto-execution"]
status: "published"
version: "1.0"
og_lead_ja: "AIR：偽のエージェントスキルが全スキャナーを通過。スキャン後に差し替わる外部リンクが盲点だった"
og_lead_en: "AIR: a fake agent skill cleared every scanner; the blind spot was an external link swapped after the scan"
gap_detected: "The scanners (Cisco, Nvidia, skills.sh) analyzed the submitted package itself and correctly judged that, as submitted, it contained no malicious code."
gap_missing: "The external link the skill follows at runtime could be swapped after submission, and there was no layer that, at the moment of execution, independently verified whether the artifact now running was identical to the one that was scanned."
gap_fix: "Independently verify with Lemma that the skill and the resource it points to still match the scanned known-good at the moment of execution, and prevent it up front."
---

## TL;DR

In a public test, security firm AIR showed that a malicious agent skill, `brand-landingpage`, cleared every scanner it tried — Cisco, Nvidia, and skills.sh — and, by AIR's account, reached ~26,000 agents, some on corporate accounts. The flaw is not novel: the skill pointed to legitimate external docs at scan time, then the link was swapped after it had passed and spread. A clean scan or GitHub stars describe a past state, not the artifact as it runs — a classic time-of-check/time-of-use gap that hardening detection cannot close. Detection and pre-execution proof are complements, not substitutes.

---

## 1. Incident overview

- **Research party**: Security firm AIR, which published a test in which it deliberately built a malicious agent skill, placed it on a public skill distribution path, cleared the scanners, and spread it
- **Subject artifact**: A skill called `brand-landingpage`. It claimed to generate a landing page using Google's Stitch design tool and was aimed mainly at non-technical users. It was listed in a GitHub repository, `agents`, with about 36,000 stars, and promoted via an Instagram ad
- **Common failure**: A skill is scanned once at submission, yet the external resource it points to can be changed at any time afterward. The check is a one-time event against the submitted artifact and does not guarantee the identity of the artifact fetched and followed at runtime
- **Scanner verdict**: The skill-security scanners AIR tried — Cisco, Nvidia, and skills.sh — all marked `brand-landingpage` safe. The verdict was correct for the submitted package; the package itself contained no malicious code
- **Scale reached (AIR's claim)**: AIR states it reached about 26,000 agents, some of them on corporate accounts. AIR says it counted the reach by the number of emails the payload sent home (not independently confirmed; see the §2 note)
- **Payload**: A harmless placeholder that only collected and sent back the user's email address. AIR nonetheless claims the same foothold could have been used to read files, exfiltrate data, or reach internal systems
- **Core**: There was no layer that, at the moment of execution, independently verified whether the artifact now running was identical to the one that was scanned; through an external link that could be swapped after the scan, unverified instructions reached execution while still wearing the appearance of having passed review

---

## 2. Timeline

- At submission / review: The skill points not to the legitimate `stitch.withgoogle.com` but to SDK setup instructions on `stitch-design.ai`, a domain AIR controlled. At this point the link led to real, benign documentation, so the scanners cleared it as a clean package
- After distribution / spread: Once the skill was widely installed, AIR swapped the page behind that link. The new page changed to instruct the agent to download and run a script
- Reach measurement: The swapped-in script sent the user's email address back to AIR, and AIR says it counted the number of agents reached (claimed ~26,000) from those messages
- Disclosure: AIR published the series of tests as "The Story of Skills"; multiple news outlets followed (late June 2026)

> Note: This case is a deliberate test by AIR in a research environment, conducted with a harmless placeholder payload; we do not exaggerate the harm. **Not independently confirmed** are the ~26,000 reach figure, the corporate-account detail, and the claim that an attacker could have seized full control. AIR is launching a managed skill marketplace (AIR Marketplace) and closes its write-up promoting that service — it has a commercial interest in the severity, which the reader should weigh. The **method, however, is independently sound**: that the named scanners judge only the submitted package, that the external-link blind spot is real, and that the trust signals AIR borrowed (stars and a clean scan) are exactly the ones the ecosystem still treats as proof of safety. The conclusion does not depend on the disputed numbers; even at a fraction of the claimed reach, the structural point stands. Refer to the latest primary sources (AIR / primary reporting) for named entities and figures.

---

## 3. Attack mechanics (time-of-check / time-of-use)

1. **The check happens once; the target can change later**: Scanners evaluate the artifact as submitted. This skill directed agents to install an SDK by following documentation at `stitch-design.ai`, a domain AIR controlled. At scan time that link pointed to real, benign documentation, so the package looked clean
2. **The trust signals were borrowed**: The two signals the ecosystem treats as proof of safety — a clean scanner verdict and GitHub stars — neither describes behaviour at execution time. Both describe a past state of the submission or the repository
3. **The page is swapped after distribution**: Once the skill was widely installed, the page behind the link was swapped. The new page changed to instruct the agent to download and run a script
4. **Unverified instructions reach execution while looking vetted**: As a "skill that passed review," the agent fetches and follows the swapped external page. The package that was the object of the check and the artifact followed at runtime diverge
5. **A foothold is established**: The payload here stopped at collecting an email, but the same foothold could be used to read files, exfiltrate data, or reach internal systems (AIR's claim)

This is a classic **time-of-check to time-of-use (TOCTOU)** gap applied to the agent-skill supply chain. Anthropic's own documentation warns that skills fetching external URLs are risky for exactly this reason: the content can change after the skill is vetted.

---

## 4. Structural analysis

This case belongs to the `code-provenance` category under Pillar 01 (Verifiable Origin). The central failure primitive is that **it does not guarantee the artifact at check time and the artifact fetched and followed at execution time are identical (point-in-time vetting — a one-time check)**. The scanner verdict itself was correct for the submitted package, and in that sense detection worked. What was missing was a layer that, at execution, independently proves "is the artifact I am now following identical to the scanned known-good?" From the user's point of view, the skill ran as a legitimate item that had passed review. Which provenance the external artifact fetched at runtime carried was not verified on each use.

This case connects, in the same `code-provenance` lineage, with a series of Briefs where artifacts reaching production were executed without their provenance being independently verified. Brief No.014 (TanStack, where a trusted-publisher trust signal described only the state at publish time and did not guarantee the identity of the distributed artifact at runtime) is the same shape as this case in the divergence between a trust signal and the runtime artifact. Brief No.082 (xz-utils, where a backdoor was introduced after a long, clean provenance, so past trust did not vouch for the current artifact) shares the time gap at the trust boundary — the TOCTOU in which a past check does not vouch for the present. Brief No.030 (Stripe, where the provenance of code riding a trusted channel was tainted) is adjacent in that the trusted path itself does not vouch for an artifact's provenance. Brief No.037 (agent config auto-execution, where instructions fetched externally fed straight into the agent's execution) shares the fragility of the path by which an agent ingests external references at runtime. In all of them, **signals describing a past state — a scan, stars, a trusted path — were misused as material to vouch for the provenance of the runtime artifact**.

As secondary categories, we note `agent-infrastructure` (the infrastructural point of an agent ingesting external references at runtime) and `identity-auth` (borrowed trust signals — a clean scan, stars — mistaken for the basis of "a legitimate origin, a legitimate artifact"). Trust signals such as scan quality or star counts are useful as a precondition, but only once an artifact is independently verified as "matching the scanned known-good even at the moment of execution" can an agent skill be placed with confidence in real operations.

---

## 5. The gap between detection and proof

That the scanners analyzed the submitted package and judged it to contain no malicious code as submitted is indispensable for supply-chain defense, and this Brief does not deny that role. The package itself contained no malicious code, and within that scope the scanner verdict was correct. Detection (static and dynamic analysis of the submission) did indeed work.

At the same time, a one-time check cannot vouch for an artifact that can change after the check. In this case the external link pointed to by a skill that had passed the scan was swapped after distribution, and the package that was the object of the check diverged from the artifact followed at runtime. What was missing was a layer that, at the moment of execution, independently verifies "is the artifact I am now running and following identical to the legitimately scanned known-good — has it been swapped?" — a verification on a separate track from the submission scan. Neither a clean scan nor GitHub stars are an independent record of the runtime artifact's provenance; they only describe a past state. Even if the skill is re-judged malicious after the fact, the unverified instructions that have already reached execution are not stopped.

Pre-execution attestation proves, at the moment of execution, "does the artifact in hand match the scanned, known-good reference?" in an independently verifiable form, and does not let it run if a match cannot be confirmed. The center of gravity of defense has to move from vetting-time to use-time — re-verifying, as auditable evidence rather than assumption, that a skill, tool, or model still matches the known-good at the instant it runs. Only by not separating the submission check (the detection-style "the package was clean") from the pre-execution attestation of the runtime artifact's provenance ("the artifact I am now following is the scanned, legitimate one"), and by letting the two overlap, can an agent skill be placed with confidence in real operations. Detection and pre-execution proof are complements, not substitutes.

For the thesis that after-the-fact detection is not proof, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for design that verifies independently before the action or execution, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and industry trends

- **AIR (research party)**: Published the series of tests as "The Story of Skills," demonstrating that scanners that look only at the submitted package cannot catch external references that can be swapped at runtime. The firm is launching a managed skill marketplace (AIR Marketplace) and closes its write-up promoting that service; its commercial interest in the severity should be discounted accordingly (see the §2 note)
- **The platform-side premise**: When a skill fetches an external URL, its content can be changed after the check — Anthropic's own documentation states explicitly that skills fetching external URLs are risky for exactly this reason. Provenance fixing such as signing, publisher verification, and reproducible builds remains optional rather than enforced across much of the field
- **Cross-industry point**: The same weakness runs through the wider agent/MCP supply chain. September 2025 saw the first publicly documented in-the-wild malicious MCP server, integrated by roughly 300 organisations before disclosure; by February 2026, npm typosquatting campaigns were targeting AI coding assistants with packages mimicking popular utilities. The common denominator is reliance on point-in-time vetting
- **Generalization**: This should be treated not as the fault of a particular skill or a particular scanner but as a cross-organizational operational issue. The more the toolchain is assembled dynamically by agents, the more risk concentrates in the window between "checked" and "used" (between vetting and use)

How to independently verify, at the moment of use, the provenance of the artifact fetched and followed at runtime is expected to advance as a design point for agent skills and marketplaces in the wake of this case.

---

## 7. Lemma's analysis

Against the gap this case exposed (the artifact fetched and followed at execution is not independently verified, at the moment of use, as identical to the scanned known-good), Lemma proposes the following design.

- **Use-time provenance matching**: Match, as an independently verifiable provenance proof, that a skill, tool, or model still matches the scanned, known-good reference at the instant it runs. If a match cannot be confirmed it is not executed, excluding before execution an artifact swapped while still wearing the appearance of having been scanned
- **Provenance binding of external references**: Pin the external resources a skill points to (links, SDKs, scripts, model weights) to tamper-proof provenance, cutting off the path by which a post-scan swap reaches execution
- **Scanned ≠ runtime identity**: Do not separate a past state ("it was clean at submission," "it has many stars") from the fact that "the artifact I am now following carries a legitimate provenance," and make the latter the subject of pre-execution attestation
- **Selective disclosure**: Without disclosing the skill's implementation or the entire build pipeline, prove with minimal disclosure only that "this artifact carries a scanned, legitimate provenance and is still identical"

Detection (the submission scan, the after-the-fact malicious verdict) works toward finding illegitimate artifacts, and pre-execution attestation (independent verification of the runtime artifact's provenance at the moment of use) works toward establishing trust in agent skills; the two are complementary. For the design and its scope, see [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/) and [Seal](https://lemma.frame00.com/seal/).

---

## 8. Sources

- **AIR (research, primary)**: "The Story of Skills" — the test in which a malicious skill `brand-landingpage` cleared every scanner and reached execution via an external-link swap; includes the context of a managed marketplace (AIR Marketplace) launch — <https://www.air.security/blog-posts/the-story-of-skills>
- **The Hacker News**: "Fake AI Agent Skill Passed Security Scans and Reportedly Reached 26,000 Agents" (2026-06) — <https://thehackernews.com/2026/06/fake-ai-agent-skill-passed-security.html>
- **The Next Web**: "A fake AI agent skill passed every security scanner and reportedly reached 26,000 agents" — <https://thenextweb.com/news/fake-ai-agent-skill-security-scanners-bypassed-26000-agents>
- **CSO Online**: "How a malicious AI agent skill passed security checks and reached 26,000 users" — <https://www.csoonline.com/article/4188840/how-a-malicious-ai-agent-skill-passed-security-checks-and-reached-26000-users.html>
- **Cybernews**: "Researchers hijack 26,000 AI agents using fake skill on Instagram" — <https://cybernews.com/ai-news/fake-ai-skill-hijacks-26000-agents-instagram/>
- **PipeLab**: "The State of MCP Security 2026" (background literature) — <https://pipelab.org/blog/state-of-mcp-security-2026/>
- **Cycode**: "OWASP MCP Top 10" (background literature) — <https://cycode.com/blog/owasp-mcp-top-10/>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
