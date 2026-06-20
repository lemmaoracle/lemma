---
brief_no: 38
title: "盗んだ認証情報で自分を再公開する npm ワームが、開発者の鍵をまるごと抜いていた — 正規の公開ワークフローには、公開者が本当の作者かを実行時に確かめる層がない"
title_en: "IronWorm — When Stolen Credentials Become Publishing Authority (npm Self-Propagating Implant)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-04
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["014-tanstack-oidc-trusted-publisher", "028-npm-dependency-confusion-recon", "004-megalodon-github-supply-chain", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "盗んだ認証情報で自分を再公開する npm ワーム — IronWorm"
og_lead_en: "A self-propagating npm worm republishes itself with stolen credentials — IronWorm"
gap_detected: "Analysis by security firms such as JFrog and registry response identified and disabled the infected packages."
gap_missing: "At publish and commit time there was no layer to confirm whether the party attempting to publish was the legitimate author of the artifact, so presenting valid credentials alone became the basis for publishing."
gap_fix: "Before publishing or committing, independently verify with Lemma that the artifact is authorized by a legitimate author and carries legitimate provenance, and prevent it up front."
---

## TL;DR

JFrog reported "IronWorm," a self-propagating npm worm that harvests a developer environment's credentials, then uses the stolen keys to commit itself into the victim's repository and republish through the developer's own legitimate workflow. Registry disablement and vendor analysis act only after publication and credential theft — after-the-fact detection. What is structurally missing is a layer that verifies, at publish, whether the publisher is truly the artifact's legitimate author; a valid token alone is the grounds for publication. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident overview

- **Report**: On 2026-06-04, JFrog Security Research reported "IronWorm," a self-propagating malware on npm. Roughly 37 packages were infected.
- **Implementation**: A ~976 KB Rust-written ELF executed from a preinstall hook. It ships a modified UPX stub that defeats signature-based unpacking, encrypts strings with a unique key per call site, and includes an eBPF-based rootkit capability (the eBPF rootkit technical detail is from Phoenix Security's analysis).
- **Harvesting targets**: It sweeps 86 environment variables and 20+ credential files. Beyond AWS, GCP, Azure, HashiCorp Vault, Kubernetes, npm, Docker, and GitHub, it also takes the 2026-generation AI provider keys (Anthropic, OpenAI, Gemini, Cohere, Mistral, Groq, Perplexity, xAI).
- **Self-propagation**: Using the stolen credentials, it commits itself into the victim's GitHub repository and republishes to npm through the developer's legitimate workflow. The compromise of a single environment chains outward to every repository and package reachable from it.
- **C2**: It fetches the Tor expert bundle, writes its own torrc, and beacons to `/api/agent` on a hidden service.
- **Assessment**: From the combination of capability and encryption, JFrog characterized it as a "carefully built, purpose-made implementation" and suggested it may be a dress rehearsal rather than the campaign's final form. It belongs to the Shai-Hulud lineage (the same family includes TeamPCP's Mini Shai-Hulud / Miasma).

---

## 2. Timeline

- 2026-05: TeamPCP open-sources Mini Shai-Hulud (the lineage of self-propagating npm worms spreads).
- 2026-06-01 onward: A relative, Miasma, is deployed across the Red Hat and Microsoft ecosystems (a separate implementation; the Brief 014 family).
- 2026-06-04: JFrog reports IronWorm (Rust-built, eBPF rootkit, Tor C2, ~37 packages).
- 2026-06: Identification and disablement of affected packages proceeds. JFrog notes the campaign may continue and evolve.

> Note: The exact total number of affected packages, the download scale, and attribution depend on the progress of the investigation, so this text does not assert them.

---

## 3. The attack path: how stolen credentials convert into publishing authority

This incident stems from a structure in which the publishing workflow never verifies the publisher's authorship at runtime. The path by which the failure propagates into self-propagation is as follows.

1. **Initial execution**: When an infected package is installed, the Rust implementation launches from the preinstall hook. Encryption and the modified UPX slip past signature- and pattern-based inspection.
2. **Credential theft**: It sweeps the development environment's environment variables and credential files (cloud, registry, GitHub, AI provider keys). A stolen token means, directly, the authority to publish and to commit.
3. **Exploiting the absence of authorship**: Both publishing to npm and committing to GitHub treat "a valid token was presented" as the grounds for publication. Whether the presenter is the legitimate author of the artifact is not independently verified at the moment of publication.
4. **Self-propagation**: With the stolen credentials, it commits itself into the victim's repository and republishes through the legitimate workflow. To downstream consumers, it looks like a normally published, legitimate package.
5. **Detection and disablement**: Vendor research and the registry's response identify and disable the infected packages. But this acts after publication and after credentials have been stolen — an after-the-fact measure.

---

## 4. Structural analysis

This incident belongs to the `code-provenance` category of Pillar 01 (Verifiable Origin). The central failure primitive is that **stolen credentials convert directly into publishing authority, and the publishing workflow never verifies — at the moment of publication — whether the publisher is truly the legitimate author of the artifact.** As long as presenting a valid token is the grounds for publication, a worm that steals a token can distribute itself as a "legitimate publication," indistinguishable from an ordinary package downstream. We note `identity-auth` (authentication of the publishing party) as a secondary category.

Brief 014 (an artifact signed by a legitimate OIDC trusted publisher is still malicious), Brief 028 (dependency confusion that spoofs an internal scope), and Brief 004 (supply-chain contamination via CI/CD credential theft) differ in their subjects, but the shared primitive is the same: **the publication and distribution of an artifact is decoupled from the layer that verifies its authorship and provenance.** What IronWorm makes vivid is that the stolen credentials drive a self-propagating loop of "theft → republication → further theft," and the damage chains for as long as credential revocation and rotation cannot keep up (the absence of independent verification of a credential's revocation attribute connects to Brief 006).

---

## 5. The gap between detection and proof

In this incident, the detection chain — vendor research (JFrog and others) and the registry's disablement — functioned, and the implementation and infection were made visible from the outside. This is a typical success of detection, and this Brief does not negate the role of the detection layer. Detection is indispensable for analyzing the implementation, identifying the scope of infection, and disabling and remediating it.

At the same time, detection provides no material to independently establish — **at the moment of publication** — whether the artifact about to be published was authorized by a legitimate author. The registry sees only "a publication by a valid token," and IronWorm is built to slip past signature and pattern inspection with encryption and the modified UPX. Both vendor research and the registry's disablement are after-the-fact chains that act once the artifact has been published and the credentials stolen. This is a structurally independent layer gap, outside the reach of the detection layer.

As things stand, across the package ecosystem as a whole, independent verification of a publisher's authorship still depends on trust in "a valid token was presented," and is not yet treated as an independent layer (mechanisms in which a leaked token alone cannot publish — such as npm's staged publishing — are beginning to be adopted, but they do not amount to proof of authorship itself). Pre-execution attestation closes this gap by inserting one step of authorship proof into the publish/commit path. Attestation is not a replacement for detection but its **complement**; the combination of the two layers establishes the artifact's trust boundary.

---

## 6. Response and industry trends

- **Registries and vendors**: Identification and disablement of infected packages is proceeding, and npm has introduced measures such as staged publishing in which a leaked token alone cannot publish. These, however, strengthen post-publication detection and pre-publication gating; they do not reach independent verification of the publisher's authorship itself.
- **Credential operations**: Because stolen credentials are the fuel for propagation, the immediacy of revocation and rotation becomes the issue. A chain that could be severed by fully rotating credentials after the first infection persists because of operational lag.
- **A shift in regulatory center of gravity**: The center of gravity of regulation is moving from data disclosure to proof of compliance. In the software supply chain, the demand grows to show an artifact's origin and a publisher's legitimacy in an independently verifiable form at the moment of publication, not as after-the-fact logs.
- **A follow-on wave (Phantom Gyp / Miasma)**: A same-lineage follow-on wave (2026-06-03, dubbed "Phantom Gyp" by StepSecurity; broader campaign name "Miasma") moved initial execution from `preinstall`/`postinstall` into `binding.gyp` / `node-gyp` (and RubyGems' `extconf.rb`). It spread to 57 packages / 286+ versions, and re-infected packages forged Sigstore provenance to look validly signed. Both exploit "files that auto-execute at install/build time but that nobody classifies as a 'script'" — showing that **the auto-execution trigger keeps moving**. Because the primitive (stolen credentials converting straight into publishing authority) is identical to this case, it is not assigned a separate Brief number.

The absence of a layer that independently verifies an artifact's authorship and provenance at the moment of publication is not a problem of a specific package; it remains a cross-organizational operational challenge for any organization that uses the package ecosystem.

---

## 7. Lemma's analysis

Against the gap this incident exposed (stolen credentials convert directly into publishing authority, and a publisher's authorship is not independently verified at the moment of publication), Lemma proposes a design that requires, at the moment of publication and commit, an independently verifiable cryptographic proof that "this artifact is authorized by a legitimate author."

- **Authorship attestation**: Back publication and commit not with the presentation of a token but with a signed proof bound to the legitimate author. A stolen token alone cannot satisfy the proof of authorship.
- **Artifact provenance binding**: Bind the published artifact to its origin and build process via a docHash, making tampering and substitution verifiable before publication.
- **Immediate reflection of revocation**: Make the validity attributes of credentials and keys independently verifiable, so that revocation and rotation are reflected in the publishing decision immediately (severing the republication chain driven by stolen credentials).
- **Selective disclosure**: Disclose only the minimum — that "the publisher meets the legitimate authorship requirement" — without letting internal keys or credentials leave the environment.

In this way, a proof fixed at the moment of publication functions as an independently verifiable trail of whether "this artifact is legitimately authorized and carries legitimate provenance," before downstream consumes it. Detection (after-the-fact vendor research and disablement) works on remediation after discovery; attestation (authorship and provenance verification at the moment of publication) works on the independent verification of the supply chain — each complementary to the other.

---

## 8. Sources

- **JFrog Security Research (primary)**: "IronWorm: Shai-Hulud's rustier cousin" (2026-06-04; Rust implementation, eBPF rootkit, Tor C2, credential theft and self-propagation) — <https://research.jfrog.com/post/iron-worm-shai-hulud-rustier-cousin/>
- **Dark Reading (secondary)**: "Rust-Written IronWorm Hits NPM Supply Chain" — <https://www.darkreading.com/cyberattacks-data-breaches/rust-written-ironworm-npm-supply-chain>
- **BleepingComputer (secondary)**: "New IronWorm malware hits 36 packages in npm supply-chain attack" — <https://www.bleepingcomputer.com/news/security/new-ironworm-malware-hits-36-packages-in-npm-supply-chain-attack/>
- **Phoenix Security (secondary, technical detail)**: "IronWorm (No CVE): Rust-Built npm Worm Ships an eBPF Rootkit, Tor C2, and a Self-Propagating Supply Chain Implant Across 37 Packages" — <https://phoenix.security/ironworm-npm-supply-chain-worm-rust-ebpf-rootkit-tor/>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
