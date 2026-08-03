/**
 * Lemma glossary terms (EN).
 *
 * Source of truth for /glossary/* pages. 27 terms across 4 categories,
 * mirroring src/data/glossary.ts (JA). Authored under code review — see
 * the SAFETY BOUNDARY note in glossary.ts before extending this set to
 * any external authoring surface (CMS, user content).
 *
 * Type definitions are imported from glossary.ts to avoid duplication.
 * Slugs match across locales — only the displayed copy differs.
 */

import type {
  GlossaryCategory,
  GlossaryRelated,
  GlossarySlug,
  GlossaryTerm,
} from "./glossary";

export const GLOSSARY_TERMS_EN: ReadonlyArray<GlossaryTerm> = [
  // ============ Cryptography Layer ============
  {
    slug: "zk-proof",
    nameJa: "ゼロ知識証明",
    nameEn: "Zero-Knowledge Proof — ZKP",
    category: "暗号レイヤ",
    description:
      "Definition and Lemma implementation of zero-knowledge proofs — a cryptographic primitive that proves a statement true without revealing the underlying secret.",
    lead:
      "A cryptographic primitive that proves a statement true without exposing the statement's contents or the underlying secret values — third-party machine-verifiable.",
    definition: [
      "A zero-knowledge proof (ZKP) is an interactive or non-interactive protocol in which a prover convinces a verifier that a statement is true while leaking no information about the witness behind it. Goldwasser, Micali, and Rackoff introduced the concept in 1985; modern formulations require completeness, soundness, and zero-knowledge.",
      "Most production deployments are non-interactive (NIZK). SNARK families (Groth16, PLONK, Halo2) and STARK families dominate, each trading proof size, verification time, and trusted-setup requirements. Any computation expressed as a constraint system can be proven over private inputs.",
      "ZKP serves two distinct purposes: proving properties without disclosing the underlying values (privacy), and replacing heavy verification with short proofs (scalability). Lemma uses the privacy axis as its primary lever.",
    ],
    implementation: [
      'Lemma\'s core architecture pins provenance, attributes, and AI inference traces as a <code>docHash</code> and emits proofs over a ZK circuit that exposes only the facts that matter — "a provenance chain exists," "an attribute is within a range" — without leaking the underlying content or PII to the verifier.',
      'The stack combines <a href="/glossary/poseidon-hash/">Poseidon hashing</a> for circuit-internal efficiency, <a href="/glossary/commitment/">commitments</a> for staged disclosure, and <a href="/glossary/selective-disclosure/">selective disclosure</a> for attribute-level granularity. Final proofs verify cheaply on EVM-compatible chains.',
      "ZKP is the substrate for every Lemma product (Civic / Critical / Compliance / Trust402). Hiding the evidence while exposing the verification is the only path that satisfies regulatory adherence and confidentiality at once.",
    ],
    related: [
      { slug: "provenance", desc: "Tamper-evident lineage tracking. Pairs with ZKP to prove existence without revealing content." },
      { slug: "verifiable-ai", desc: "The domain that makes AI judgments cryptographically auditable. ZKP is its primary primitive." },
      { slug: "selective-disclosure", desc: "Reveal only specific attributes alongside a cryptographic proof." },
      { slug: "commitment", desc: "Lock in a value while keeping it hidden until reveal." },
    ],
    ctaH2: "Build verifiable AI on zero-knowledge proofs.",
  },
  {
    slug: "aes-gcm",
    nameJa: "AES-GCM",
    nameEn: "AES-GCM (Galois/Counter Mode)",
    category: "暗号レイヤ",
    description:
      "Authenticated symmetric encryption combining AES in counter mode with Galois/Counter authentication — confidentiality and integrity in a single construction.",
    lead:
      "The canonical authenticated symmetric cipher (AEAD). AES block cipher in counter mode paired with a Galois-field MAC delivers confidentiality and integrity in one pass.",
    definition: [
      "AES-GCM, standardized in NIST SP 800-38D, runs AES-128/192/256 in counter mode while producing a Galois-field MAC in parallel. Output is ciphertext plus an authentication tag (typically 128 bits).",
      "It parallelizes well and benefits from hardware acceleration — Intel AES-NI and ARMv8 Crypto Extensions push throughput an order of magnitude beyond software-only implementations. TLS 1.3, SSH, IPsec, Signal, and QUIC all default to it.",
      "Confidentiality (no plaintext recovery from ciphertext) and integrity (tag verification flags tampering) come from a single construction — safer and faster than AES-CBC + HMAC composition. The cost: IV (nonce) uniqueness must be strictly enforced.",
    ],
    implementation: [
      "Lemma uses AES-GCM at every point sensitive data moves or rests — customer attributes, AI inputs, decision logs. Key material lives in HSM/KMS; nonces are derived from a counter combined with a context identifier so uniqueness is structurally guaranteed.",
      'The ZK side never sees plaintext — only <a href="/glossary/doc-hash/">docHash</a> crosses the circuit boundary. This two-layer split (verifiability via ZK, confidentiality via AES-GCM) is Lemma\'s default cryptographic shape.',
      'Even when <a href="/glossary/selective-disclosure/">selective disclosure</a> returns an attribute proof, the underlying document stays AES-GCM encrypted. Only the attribute commitment and the proof traverse the circuit.',
    ],
    related: [
      { slug: "zk-proof", desc: "The verifiability primitive that complements AES-GCM's confidentiality." },
      { slug: "doc-hash", desc: "How the ZK side references AES-GCM-encrypted content." },
      { slug: "commitment", desc: "Pin attribute values without decrypting the source." },
      { slug: "selective-disclosure", desc: "Reveal attributes without ever decrypting the underlying document." },
    ],
    ctaH2: "Confidentiality and verifiability, designed together.",
  },
  {
    slug: "poseidon-hash",
    nameJa: "Poseidonハッシュ",
    nameEn: "Poseidon Hash",
    category: "暗号レイヤ",
    description:
      "An algebraic hash function engineered to minimize cost inside ZK circuits. Proposed by StarkWare et al. in 2019; deployed in StarkNet/Cairo, Filecoin, Aztec, and more.",
    lead:
      "An algebraic hash function tuned for ZK-circuit efficiency. StarkWare et al. proposed it in 2019; StarkNet/Cairo adopts it as the primary hash.",
    definition: [
      "Poseidon follows the HADES strategy (substitution-permutation network with partial S-box layers). Full rounds (R_F) and partial rounds (R_P) combine to maintain collision resistance while cutting in-circuit constraint count by one to two orders of magnitude versus SHA-256.",
      "The reference parameter set is defined over the prime field <code>p = 2^251 + 17·2^192 + 1</code> (StarkWare specification). Filecoin, Aztec, Penumbra, and others use it in production. EIP-5988 proposes a Poseidon precompile for Ethereum.",
      "Bit-oriented hashes such as Keccak or SHA-2 explode in constraint count inside a ZK circuit. Poseidon is built from additions and multiplications only, so circuit cost scales nearly linearly in input length.",
    ],
    implementation: [
      'Lemma hashes the internal <a href="/glossary/doc-hash/">docHash</a> representation with Poseidon. Inside the circuit, docHash, attributes, provenance, and commitments collapse into a single ZK-friendly hash chain.',
      'The choice of Poseidon over a bit-oriented hash reduces downstream <a href="/glossary/zk-proof/">zero-knowledge proof</a> generation time by orders of magnitude — which is what makes "the proof is ready immediately" a viable user-facing claim.',
      'External interoperability uses SHA-256-family identifiers such as <a href="/glossary/cid/">CID</a>. The Poseidon representation is reserved for in-circuit use — a two-layer split that keeps both compatibility and efficiency.',
    ],
    related: [
      { slug: "zk-proof", desc: "The primary use case. Keeps circuit constraint count near-linear." },
      { slug: "doc-hash", desc: "Internal Poseidon vs external SHA-256 — the two-layer split." },
      { slug: "commitment", desc: "Pedersen/KZG commitments can use Poseidon as the underlying hash." },
      { slug: "cid", desc: "External content identifier vs internal Poseidon representation." },
    ],
    ctaH2: "Optimize ZK circuit cost from first principles.",
  },
  {
    slug: "doc-hash",
    nameJa: "docHash",
    nameEn: "docHash — document content digest",
    category: "暗号レイヤ",
    description:
      "A cryptographic digest of a document's byte representation. Lemma uses docHash as the primary identifier that fixes the identity of every provenance, attribute, and citation unit.",
    lead:
      "A cryptographic digest of a document's byte representation. Lemma uses it as the base identifier that pins the identity of every provenance, attribute, and citation unit.",
    definition: [
      "docHash is a fixed-length output of a collision-resistant hash function (SHA-256, BLAKE3, etc.) applied to a document's canonicalized byte representation. Identical bytes always produce the same docHash; a single bit of change produces an entirely different value.",
      "Standing alone, docHash leaks nothing about the document — preimage recovery is computationally infeasible. Sharing the docHash therefore reveals that a document exists without exposing its contents.",
      'For the in-circuit path, Lemma also computes a <a href="/glossary/poseidon-hash/">Poseidon hash</a> representation of docHash. SHA-256-family hashes serve external interoperability; the Poseidon form serves the ZK circuit. Two layers, one logical anchor.',
    ],
    implementation: [
      "Provenance, attributes, and AI inference traces all collapse down to docHash. Documents, datasets, model weights, and logs become byte-level singletons — auditable, verifiable, comparable.",
      'Combined with <a href="/glossary/commitment/">commitments</a>, docHash lets Lemma prove "a document with this attribute exists" via <a href="/glossary/zk-proof/">zero-knowledge proof</a> — without releasing the document. This is the foundation of <a href="/glossary/selective-disclosure/">selective disclosure</a>.',
      'A <a href="/glossary/provenance/">provenance</a> chain is, structurally, a time-linked sequence of docHashes. docHash is the smallest atom in Lemma\'s cryptographic infrastructure.',
    ],
    related: [
      { slug: "zk-proof", desc: "Consumes docHash to prove facts without exposing the underlying bytes." },
      { slug: "poseidon-hash", desc: "ZK-friendly hash for the in-circuit representation of docHash." },
      { slug: "commitment", desc: "docHash + randomness — a pinned but hidden value." },
      { slug: "cid", desc: "An external interoperable content identifier alongside docHash." },
    ],
    ctaH2: "Pin the unit of verification at the byte level.",
  },
  {
    slug: "cid",
    nameJa: "CID",
    nameEn: "Content Identifier — multiformats",
    category: "暗号レイヤ",
    description:
      "A self-describing content-addressed identifier. Combines multihash, multicodec, and multibase so the hash algorithm, encoding, and data type are embedded in the identifier itself.",
    lead:
      "A self-describing content-addressed identifier. multihash, multicodec, and multibase together encode the hash algorithm, the data format, and the string encoding directly into the identifier.",
    definition: [
      "CID, standardized through multiformats and used heavily across the IPFS/IPLD ecosystem, comes in two versions. CIDv0 is the minimal form (<code>Qm…</code>, base58btc + SHA-256 multihash); CIDv1 layers in a multibase prefix, version byte, multicodec, and multihash for forward extensibility.",
      "Self-description means the identifier itself tells you which hash algorithm and which data format you're holding. Migrating between SHA-256 and SHA-3, or between JSON and CBOR, doesn't require touching the identifier format.",
      "Because the identifier is derived from the content (content-addressing), the same bytes always produce the same CID regardless of who uploads them. Equal CIDs guarantee equal bytes.",
    ],
    implementation: [
      'Lemma references objects in distributed storage — RAG documents, provenance metadata, license files — by CID. <a href="/glossary/doc-hash/">docHash</a> is the internal hashing surface; CID is the external interop surface.',
      'Each node in a <a href="/glossary/provenance/">provenance</a> graph links to its predecessor by CID, preserving the durability and verifiability of the chain at the storage layer.',
      'Inside the ZK circuit, CIDs are reduced to short <a href="/glossary/poseidon-hash/">Poseidon</a> values rather than processed as full strings — keeping interop and efficiency separated.',
    ],
    related: [
      { slug: "doc-hash", desc: "CID and docHash — the external/internal pair." },
      { slug: "provenance", desc: "CID is the linkage primitive of the lineage graph." },
      { slug: "poseidon-hash", desc: "How CIDs collapse to short values inside the circuit." },
      { slug: "zk-proof", desc: "Prove integrity over CID references without exposing them." },
    ],
    ctaH2: "Names derived from the content itself.",
  },
  {
    slug: "selective-disclosure",
    nameJa: "選択的開示",
    nameEn: "Selective Disclosure",
    category: "暗号レイヤ",
    description:
      "A technique for revealing only chosen attributes from a document or credential — paired with a cryptographic proof — instead of releasing the whole. The bridge between privacy and compliance.",
    lead:
      "Reveal only the attributes you need, paired with a cryptographic proof of authenticity — instead of releasing the whole document or credential. The bridge between privacy and compliance.",
    definition: [
      "The lineage runs from Camenisch-Lysyanskaya signatures and Anonymous Credentials through modern implementation specs: SD-JWT (Selective Disclosure JWT), BBS+ signatures, AnonCreds.",
      "Structurally: the issuer signs a commitment over all attributes of a document; at disclosure time, the holder reveals specific attributes plus a zero-knowledge proof that those attributes are genuinely part of the signed document. The verifier confirms authenticity and integrity without touching the rest.",
      "This aligns with GDPR data-minimization, KYC/AML identity verification, and medical minimal-disclosure norms. It moves data from a binary all-or-nothing axis to an attribute-level dial.",
    ],
    implementation: [
      'Lemma builds per-attribute disclosure on <a href="/glossary/commitment/">commitments</a> and <a href="/glossary/zk-proof/">zero-knowledge proofs</a>. A bank can verify "resident of an EU country" without ever seeing name, address, or date of birth.',
      'The same machinery serves the high-risk AI auditing required by <a href="/glossary/eu-ai-act/">EU AI Act</a>, the governance reporting under <a href="/glossary/ai-business-guidelines/">AI Business Operator Guidelines</a>, and <a href="/glossary/kyc-aml/">KYC/AML</a> identity checks — every situation where the regulator wants the attribute confirmed and the operator doesn\'t want to ship the data.',
      "Issuer, holder, and verifier remain logically distinct. No party needs to centralize the underlying data, which structurally reduces breach surface.",
    ],
    related: [
      { slug: "zk-proof", desc: "The cryptographic primitive that powers attribute disclosure." },
      { slug: "commitment", desc: "Pins attribute values so partial reveals stay tied to the original signature." },
      { slug: "kyc-aml", desc: "The regulatory domain where selective disclosure is the cleanest implementation path." },
      { slug: "provenance", desc: "Reveal individual provenance stages while keeping the rest closed." },
    ],
    ctaH2: "Prove attributes — nothing more.",
  },
  {
    slug: "commitment",
    nameJa: "コミットメント",
    nameEn: "Commitment Scheme",
    category: "暗号レイヤ",
    description:
      "A cryptographic construction that locks in a value (commit) so it can be revealed later (reveal). Binding (cannot change after commit) plus hiding (does not leak before reveal).",
    lead:
      "Lock in a value (commit) so it can be revealed later (reveal). Binding (no tampering after commit) plus hiding (no leakage before reveal) make this the substrate of staged disclosure.",
    definition: [
      "Classical commitment schemes fall into three families: (1) hash-based — <code>H(m, r)</code> over the value m and a random salt r; (2) Pedersen — group-theoretic <code>g^m · h^r</code>; (3) Kate/KZG — polynomial commitments.",
      'In ZK systems, you commit to values, hand the verifier the commitments, and use a <a href="/glossary/zk-proof/">zero-knowledge proof</a> to open only the slices you need. Commitments are the input-privacy backbone of ZK.',
      "<strong>Binding</strong> resists post-hoc tampering, <strong>hiding</strong> blocks pre-disclosure leakage. Together they enable lock-in-now, reveal-on-demand workflows.",
    ],
    implementation: [
      "Lemma's attribute, model, and provenance commitments use Pedersen or KZG families. To enable per-attribute disclosure, attributes are bound through a vector or polynomial commitment that lets each attribute open independently.",
      '<a href="/glossary/selective-disclosure/">Selective disclosure</a> rides on top of commitment openings; the <a href="/glossary/provenance/">provenance</a> chain is realized as a commitment chain.',
      '<a href="/glossary/poseidon-hash/">Poseidon</a>-based commitments keep in-circuit disclosure cost minimal.',
    ],
    related: [
      { slug: "zk-proof", desc: "The proof primitive that opens commitments cleanly." },
      { slug: "selective-disclosure", desc: "Operationally, attribute-level commitment openings." },
      { slug: "doc-hash", desc: "The document identifier a commitment binds to." },
      { slug: "poseidon-hash", desc: "ZK-circuit-friendly commitment implementation." },
    ],
    ctaH2: "Pin the value before you reveal it.",
  },

  // ============ Verifiable AI ============
  {
    slug: "verifiable-ai",
    nameJa: "検証可能AI",
    nameEn: "Verifiable AI",
    category: "検証可能AI",
    description:
      "The implementation domain for making AI judgments, inferences, and citations cryptographically verifiable. Third-party-confirmable across input provenance, model identity, and inference consistency.",
    lead:
      "An implementation domain that makes AI judgments, inferences, and citations cryptographically verifiable. Not just the output, but the lineage of the input, the identity of the model, and the consistency of the inference — all third-party-confirmable.",
    definition: [
      'Verifiable AI is the technical territory of moving AI output from "trust me" to "verify me." Academically positioned as zkML (Zero-Knowledge Machine Learning) and cryptographic inference: prove that "the declared model returned the declared output on the declared input" without revealing weights, inputs, or activations.',
      "Three layers stack to make this real. <strong>Input provenance</strong>: pin the origin and integrity of the documents/data the model consulted. <strong>Model identity</strong>: prove the running weights match a declared weight hash. <strong>Inference consistency</strong>: prove the output is a legitimate computation of the declared model over the declared input — provable in a ZK circuit.",
      'Through 2025–2026, Lagrange DeepProve, JOLT, and zkPyTorch moved ZK-proven inference for large models from research into production. The market segment of "unverified inference" gets pushed toward a lower tier; regulated and audit-bound domains migrate first.',
    ],
    implementation: [
      'Lemma offers verifiable AI as horizontal cryptographic infrastructure. Inputs are pinned via <code>docHash</code> first — never fed directly into the <a href="/glossary/zk-proof/">zero-knowledge proof</a> path — then expressed in an attribute-decomposable form that supports <a href="/glossary/selective-disclosure/">selective disclosure</a>, so only the attributes the verifier needs ever cross the wire.',
      'On the inference side, the model hash becomes a <a href="/glossary/commitment/">commitment</a>; the proof binds input, output, and model into one verifiable artifact. For RAG pipelines, the citation\'s <a href="/glossary/provenance/">provenance</a> and the literal text match are proven in parallel.',
      "The result is a single path that satisfies both regulatory adherence (the EU AI Act's automated-logging and human-oversight requirements) and confidentiality (GDPR, trade secret) — the most concrete infrastructure for cross-org AI auditing.",
    ],
    related: [
      { slug: "zk-proof", desc: "The cryptographic primitive that proves facts without revealing the substrate. Core element of verifiable AI." },
      { slug: "provenance", desc: "Tracks the lineage of data and judgments. The input layer of verifiable AI." },
      { slug: "x402", desc: "HTTP-402-based machine-to-machine payment. The intersection of agent commerce and verifiability." },
      { slug: "eu-ai-act", desc: "EU law mandating automated logging, human oversight, and data governance for high-risk AI." },
    ],
    ctaH2: "Verifiable AI as the foundation of judgment.",
  },
  {
    slug: "provenance",
    nameJa: "プロヴナンス",
    nameEn: "Provenance — verifiable lineage",
    category: "検証可能AI",
    description:
      "A tamper-evident mechanism for tracking and verifying when, by whom, and from what inputs a data point, model, or decision was produced. The input layer of verifiable AI; a core Lemma pillar.",
    lead:
      "A tamper-evident mechanism for tracking and verifying when, by whom, and from what inputs a data point, model, or decision was produced. The input layer of verifiable AI and one of Lemma's foundational pillars.",
    definition: [
      "Provenance captures the relationship graph of \"where did this object come from\" and \"what transformations did it undergo.\" The conceptual model is W3C PROV (PROV-DM / PROV-O), pairing entities, activities, and agents in time order.",
      'Domain-specific standards extend this. <a href="/glossary/c2pa/">C2PA</a> defines content provenance signatures (capture, edit, AI generation). SLSA defines build provenance for software; SCITT defines transparency logs. AI lacks a unified standard for training data, model, and inference history — which is exactly where verifiable AI enters.',
      'The key distinction is that provenance is a <strong>provable history</strong>, not merely a log. Log files are mutable after the fact and carry weak evidentiary value. Pinning each stage with a <a href="/glossary/commitment/">commitment</a> plus a signature is what makes a lineage hold up to third-party scrutiny.',
    ],
    implementation: [
      'Lemma pins lineage as <code>docHash</code> plus a metadata commitment. <code>docHash</code> covers the document\'s byte digest; the metadata covers timestamp, author, and the link to the prior stage. The chain collapses to a single hash that a downstream <a href="/glossary/zk-proof/">zero-knowledge proof</a> can attest exists.',
      'Combined with <a href="/glossary/selective-disclosure/">selective disclosure</a>, individual attributes from along the chain — "the producer is in the EU," "the data was collected after the regulation took effect" — can be proven without exposing the chain itself. This is how GDPR, trade secret, and state secret constraints coexist with regulatory adherence.',
      "Lemma Civic applies this to public-sector data, Lemma Critical to manufacturing supply-chain parts, Lemma Compliance to customer attributes, and verifiable AI to the document corpora a RAG pipeline cites — all on the same lineage substrate.",
    ],
    related: [
      { slug: "zk-proof", desc: "Proves the existence of a lineage stage without exposing it." },
      { slug: "verifiable-ai", desc: "Treats provenance as the input layer, extending verifiability through inference." },
      { slug: "selective-disclosure", desc: "Open individual lineage attributes while keeping the rest closed." },
      { slug: "eu-ai-act", desc: "Mandates data governance for high-risk AI. Provenance is the direct technical response." },
    ],
    ctaH2: "Turn lineage into a shared, cross-org fact.",
  },
  {
    slug: "provenance-proof",
    nameJa: "プロヴナンス・プルーフ",
    nameEn: "Provenance Proof",
    category: "検証可能AI",
    description:
      "Cryptographic proof that a piece of data originates from a declared lineage. The technical core of any generative AI strategy that needs to prove input authenticity and output provenance without exposing the underlying data.",
    lead:
      "The cryptographic artifact that proves a piece of data really originates from a declared lineage chain — third-party-machine-verifiable. The mechanism that promotes provenance from \"record\" to \"proof.\"",
    definition: [
      'Provenance proof is the composition of <a href="/glossary/provenance/">provenance</a> and a <a href="/glossary/zk-proof/">zero-knowledge proof</a>. It packages lineage information as a ZK proof so the verifier can confirm attributes without seeing the underlying data. In Lemma\'s architecture this is realized as <code>docHash</code> + a lineage commitment + a ZK proof.',
      'Sits alongside record-style standards (<a href="/glossary/c2pa/">C2PA</a>, SCITT, SLSA) but specialized for verifiability. Where those standards capture who did what when, provenance proof is the layer that cryptographically attests that the captured record is authentic.',
      "The concept has gained weight as generative AI moves into core enterprise workflows. Three axes converge on the same primitive: (1) training-data lineage, (2) RAG citation authenticity, (3) model identity. Provenance proof is the single-substrate answer to all three.",
    ],
    implementation: [
      'Lemma\'s core product value is "cryptographic infrastructure that issues and verifies provenance proofs over any attribute or document." Per-product issuance (Civic / Critical / Compliance) plus <a href="/glossary/trust402/">Trust402</a> for verification.',
      'Concrete generative AI strategy use cases: hallucination suppression in <a href="/glossary/rag/">RAG</a> pipelines, audit trails over training datasets, automated logs that satisfy the <a href="/glossary/eu-ai-act/">EU AI Act</a>. All three reduce to the same requirement — prove data lineage without shipping the data.',
      "From 2026 onward the regulatory and contractual pressure makes provenance proof a baseline requirement for enterprise AI systems. Systems without it get relegated to the low-trust tier of audit, procurement, and compliance.",
    ],
    related: [
      { slug: "provenance", desc: "The tamper-evident lineage mechanism that provenance proof is built on." },
      { slug: "zk-proof", desc: "The cryptographic primitive that makes provenance proof verifiable." },
      { slug: "verifiable-ai", desc: "The AI-system surface where provenance proof is embedded." },
      { slug: "c2pa", desc: "Media-domain industry standard for content provenance. Complementary." },
    ],
    ctaH2: "Make provenance proof the foundation of your generative AI strategy.",
  },
  {
    slug: "c2pa",
    nameJa: "C2PA",
    nameEn: "C2PA — Coalition for Content Provenance and Authenticity",
    category: "検証可能AI",
    description:
      "An industry standard for describing and signing media-content provenance. Led by Adobe, Microsoft, BBC, Intel, Sony, and others; widely adopted for AI-generated content identification and edit-trail verification.",
    lead:
      "An industry standard that embeds provenance information for content (images, video, audio, PDF) as Content Credentials (the C2PA Manifest), with each capture / edit / AI-generation step pinned by a cryptographic signature.",
    definition: [
      "C2PA stands for the Coalition for Content Provenance and Authenticity. Co-founded in 2021 by Adobe, Microsoft, BBC, Truepic, Intel, Sony, Arm, and others. The technical spec ships as Content Credentials.",
      "Three-layer mechanism: (1) embed a Manifest (CBOR-encoded) into the content, (2) record Capture / Edit / AI Generation events as Assertions, (3) sign the chain endpoint with an X.509 certificate. Verifiers decode the Manifest and machine-confirm each Assertion's authenticity.",
      'Adoption is accelerating in the AI-content space. When a generative model emits a C2PA Manifest alongside the image, "this is AI-generated" becomes a cryptographically-bound label. Journalism, the <a href="/glossary/eu-ai-act/">EU AI Act</a> Article 50 transparency obligations, and AI-content labeling on social platforms are all driving uptake.',
    ],
    implementation: [
      'Lemma\'s <a href="/glossary/provenance/">provenance</a> stack is complementary to C2PA. C2PA is the industry standard for media content provenance specifically; Lemma provides a cross-domain <a href="/glossary/provenance-proof/">provenance proof</a> substrate — AI inference traces, attribute attestations, regulatory adherence.',
      "Typical integration: feed Assertions from a C2PA Manifest into the Lemma lineage chain as <code>docHash</code> entries, then use ZK proofs for attribute-level selective disclosure. Media-origin data entering an AI pipeline never breaks the lineage chain.",
      "Organizations that adopt Lemma alongside C2PA cover both the media surface (C2PA) and the AI / data surface (Lemma) on a unified provenance infrastructure.",
    ],
    related: [
      { slug: "provenance", desc: "Lemma's lineage substrate. Complementary to C2PA." },
      { slug: "provenance-proof", desc: "The Lemma mechanism for ingesting C2PA Manifests into attribute-level disclosure." },
      { slug: "verifiable-ai", desc: "The umbrella where C2PA is wired into AI-content identification." },
      { slug: "audit-trail", desc: "Structurally similar to C2PA's Assertion chain." },
    ],
    ctaH2: "Unify provenance across media and AI.",
  },
  {
    slug: "authenticity",
    nameJa: "真正性",
    nameEn: "Authenticity",
    category: "検証可能AI",
    description:
      "The definition of authenticity and how Lemma proves provenance. Data and content that is genuine, unaltered, and of verified origin (provenance) — integrity plus verification of origin.",
    lead:
      "Data or content that is genuine, unaltered since creation, and of verified origin (provenance). It is the broader concept of integrity plus verification of where something came from.",
    definition: [
      "Authenticity is the state in which you can trace who made what, when, and how it was handled afterward. Where integrity guarantees only that contents are unchanged, authenticity also covers the genuineness of the origin itself — whether it came from a legitimate source and is not an impersonation.",
      "In Japanese e-records it is defined as one of three requirements — authenticity, legibility, and preservation — under the Electronic Books Preservation Act and medical-information-system guidelines. It is upheld through electronic signatures, timestamps, and management of operation history (provenance).",
    ],
    implementation: [
      "Lemma verifies provenance cryptographically without handing over the source data, proving authenticity. It fixes who created which version, when, and whether it was altered as a tamper-proof proof, and uses zero-knowledge proofs and selective disclosure to reveal only the attributes needed.",
      'What authenticity means by domain (regulation & e-records / media & content / finance & DeFi / AI output) and how to verify it are gathered in the explainer hub, <a href="/authenticity/">“What is authenticity”</a>.',
    ],
    related: [
      { slug: "provenance", desc: "The lineage that authenticity rests on — the chain of who, when, and which version." },
      { slug: "c2pa", desc: "Industry standard for attaching provenance to content. Complementary to Lemma's proof." },
      { slug: "provenance-proof", desc: "The proof that fixes provenance tamper-evidently and verifies authenticity." },
      { slug: "audit-trail", desc: "The operation history that traces alteration or deletion — the basis for authenticity." },
    ],
    ctaH2: "Build authenticity into the decisions that matter.",
  },
  {
    slug: "did",
    nameJa: "分散型識別子 (DID)",
    nameEn: "Decentralized Identifier — DID",
    category: "検証可能AI",
    description:
      "A W3C-standardized identifier specification. An identifier whose issuer, subject, and verifier each operate independently — used for subject identification in attribute attestation and lineage chains.",
    lead:
      "A W3C recommendation finalized in 2022. Identifiers carry their own public keys and verification methods, so no central issuer is required. Paired with <a href=\"/glossary/verifiable-credential/\">Verifiable Credentials</a>, DIDs name the subject of attribute attestation in a verifiable way.",
    definition: [
      "A DID is expressed as a URI of the form <code>did:method:identifier</code>. Each method defines its own resolution mechanism; the resolution result is a DID Document carrying public keys, service endpoints, and authentication methods. Issuance and verification are separated at the spec level.",
      'W3C DID Core 1.0 reached Recommendation status in 2022. Common methods include did:web (HTTPS-hosted), did:key (the public key as the identifier itself), did:jwk, and did:pkh. For enterprise use cases like Lemma, did:web — anchored at an organization\'s own endpoint — is the most natural choice.',
      'A DID does not prove anything by itself. It uniquely identifies a subject; <a href="/glossary/verifiable-credential/">Verifiable Credentials</a> are responsible for the actual attribute claims. The two together let the system express, in a third-party-verifiable form, "who claimed what."',
    ],
    implementation: [
      "Lemma's attribute attestations and <a href=\"/glossary/provenance/\">provenance</a> chains identify both Issuer and Subject by DID. When an organization runs did:web, its own domain — via <code>/.well-known/did.json</code> — becomes the trust anchor directly.",
      'Combined with <a href="/glossary/selective-disclosure/">selective disclosure</a>, the attributes of a DID-identified subject (e.g., "this operator is EU-based," "this AI model was trained by a specific organization") can be proven without revealing the values themselves.',
      "DIDs get most of their visibility in web3 projects, but as a W3C standard they are chain-agnostic. Lemma positions did:web as its primary method so the system rides on the existing DNS + HTTPS trust infrastructure.",
    ],
    related: [
      { slug: "verifiable-credential", desc: "The standard that asserts attributes about a DID-identified subject." },
      { slug: "provenance", desc: "A DID-identified subject serves as the origin of a lineage chain." },
      { slug: "selective-disclosure", desc: "Prove DID-subject attributes without revealing the underlying values." },
      { slug: "verifiable-ai", desc: "Identify the issuer or model provider of AI inference history by DID." },
    ],
    ctaH2: "Compose subject identification and attribute attestation from independent standards.",
  },
  {
    slug: "verifiable-credential",
    nameJa: "検証可能クレデンシャル (VC)",
    nameEn: "Verifiable Credentials — VC",
    category: "検証可能AI",
    description:
      "A W3C-standardized format for third-party-verifiable attribute statements. Attestations flow under a three-party model of Issuer, Holder, and Verifier.",
    lead:
      "The format standardized by the W3C Verifiable Credentials Data Model — a third-party-verifiable representation of attribute claims. A three-party model: an Issuer issues attributes to a Holder (the subject), and a Verifier cryptographically validates them.",
    definition: [
      "A VC is a set of claims signed by an Issuer, packaged in a portable format. Serializations include JSON-LD, JWT, and CBOR-LD; issuer identity, subject identity, expiration, and revocation method are all built into the format. W3C VC Data Model 2.0 reached Recommendation status in 2025.",
      'The subject is most often identified by a <a href="/glossary/did/">DID</a>. VCs and DIDs are designed as a pair under the W3C "Verifiable Data Model." The EU\'s eIDAS 2.0 / EUDI Wallet stack adopts the same framework, adding regulatory momentum.',
      'A VC is not just an attribute record; third-party verifiability is guaranteed at the spec level. Signature verification, revocation checking, and expiration validation all execute independently on the verifier side. Combine with <a href="/glossary/selective-disclosure/">selective disclosure</a> or ZK-SD-VC, and a VC can prove "this attribute is satisfied" without revealing the value.',
    ],
    implementation: [
      "Lemma Compliance issues customer attributes (KYC outcome, region, industry, transaction eligibility) as VCs. The Issuer is a did:web entity under the organization's domain; the Verifier is a counterparty or auditor. Attribute conformance is shown via the VC and its ZK derivatives — without ever shipping certificate files.",
      'In Lemma Civic, residence records and public certificates are issued as VCs, so the "show only the attribute, never the certificate" pattern of municipal DX works out of the box. Verifiers consume the VC through <a href="/glossary/trust402/">Trust402</a> for machine verification.',
      "VCs slot directly into the recordkeeping obligation of EU AI Act Article 12 and the audit-trail requirements of ISO/IEC 23894 (AI risk management). Lemma supplies VC + ZK + provenance chains as one package, automating regulatory conformance.",
    ],
    related: [
      { slug: "did", desc: "Standard for identifying both the Issuer and Subject of a VC." },
      { slug: "selective-disclosure", desc: "Show only that the VC's attribute is satisfied — never the value." },
      { slug: "kyc-aml", desc: "The canonical use case for distributing customer attribute attestations as VCs." },
      { slug: "eu-ai-act", desc: "VCs slot directly into the AI system recordkeeping obligation." },
    ],
    ctaH2: "Run attribute attestation on a standard aligned with regulation.",
  },
  {
    slug: "rag",
    nameJa: "RAG",
    nameEn: "Retrieval-Augmented Generation",
    category: "検証可能AI",
    description:
      "An approach that retrieves external documents at generation time and grounds the response in them. Enables freshness and proprietary knowledge without model retraining — and introduces citation authenticity as a new problem.",
    lead:
      "An approach that retrieves external documents at generation time and grounds the language model's response in them. Avoids retraining for freshness or proprietary knowledge — and surfaces citation authenticity as a new problem.",
    definition: [
      "A standard RAG pipeline has four stages: (1) embed the query, (2) retrieve relevant documents via vector search, (3) concatenate the retrieved documents into the prompt, (4) the model responds grounded in those documents. Meta crystallized the pattern in 2020; it has been the industrial baseline since.",
      "The upside is being able to address fresh information and organization-specific knowledge without retraining, and to surface source citations alongside answers. The downside is undetectable failure when retrieved documents are tampered with or citations are fabricated.",
      "Running RAG in a regulated context requires proving both that the retrieved corpus has a trustworthy lineage and that the citations in the response actually come from those documents. This is the boundary at which verifiable AI becomes necessary.",
    ],
    implementation: [
      'Lemma layers three guarantees onto a RAG pipeline: (1) the retrievable corpus is lineage-pinned by <a href="/glossary/cid/">CID</a> and <a href="/glossary/doc-hash/">docHash</a>; (2) retrieval results carry <a href="/glossary/provenance/">provenance</a> metadata; (3) <a href="/glossary/citation-proof/">citation proofs</a> bind each cited string to its source document.',
      "The recipient can verify, without re-receiving the content, that the answer's text really came from the cited document, that the document came from a trusted issuer, and that the document has not been tampered with.",
      "Financial research assistants, medical decision support, legal AI case-law citation — any domain where citation authenticity bears on professional responsibility — gets a concrete solution out of this stack.",
    ],
    related: [
      { slug: "verifiable-ai", desc: "The superset that makes RAG verifiable." },
      { slug: "citation-proof", desc: "Proves the authenticity of citations inside a RAG response." },
      { slug: "provenance", desc: "Manages the lineage of the retrievable corpus." },
      { slug: "audit-trail", desc: "Records the RAG execution itself in tamper-evident form." },
    ],
    ctaH2: "Make retrieval verifiable.",
  },
  {
    slug: "citation-proof",
    nameJa: "引用証明",
    nameEn: "Citation Proof",
    category: "検証可能AI",
    description:
      "A cryptographic mechanism that proves a citation embedded in an AI response really came from the claimed source document, with neither tampering nor fabrication. The authenticity core of RAG.",
    lead:
      "A cryptographic mechanism that proves a citation embedded in an AI response really came from the claimed source document, with neither tampering nor fabrication. The authenticity core of a RAG pipeline.",
    definition: [
      'Citation proof has two stages. (1) Source identity: the source document\'s byte stream matches a declared <a href="/glossary/doc-hash/">docHash</a>. (2) Citation containment: the quoted string in the response exists, character-for-character, at the declared position within that document.',
      'The second proof never ships the document — only the existence of the quoted string at a position is asserted inside a <a href="/glossary/zk-proof/">zero-knowledge proof</a> circuit. Confidential source material can host verifiable citations.',
      'This is qualitatively different from a "URL footnote." URLs are mutable and replaceable after publication; citation proof is cryptographically bound and resists post-hoc swaps as long as the hash matches at verification time.',
    ],
    implementation: [
      'Lemma attaches a ZK proof to each citation in a <a href="/glossary/rag/">RAG</a> response. The recipient verifies the citation\'s authenticity without ever fetching the underlying document.',
      'The transparency obligations in <a href="/glossary/eu-ai-act/">EU AI Act</a>, journalistic and legal fact-checking, and citation review for medical documents are all domains where citation proof is the direct answer.',
      'Combined with <a href="/glossary/selective-disclosure/">selective disclosure</a>, you can release only the cited paragraph or sentence — while still proving it is a legitimate citation from the source. Copyright\'s subordination and source-attribution requirements line up cleanly with cryptographic authenticity.',
    ],
    related: [
      { slug: "rag", desc: "The pipeline most directly served by citation proofs." },
      { slug: "verifiable-ai", desc: "The umbrella concept citation proof realizes." },
      { slug: "provenance", desc: "Establishes the lineage of the source document." },
      { slug: "zk-proof", desc: "The primitive that proves quoted-text existence without exposing the document." },
    ],
    ctaH2: "Cryptographic authenticity for every citation.",
  },
  {
    slug: "audit-trail",
    nameJa: "監査トレイル",
    nameEn: "Audit Trail",
    category: "検証可能AI",
    description:
      "Tamper-evident records of system execution. Essential wherever after-the-fact verification matters — AI decision logs, payment paths, data-access history.",
    lead:
      "Tamper-evident records of system execution. Essential wherever after-the-fact verification matters — AI decision logs, payment paths, data-access history.",
    definition: [
      "Application-side text logs are administrator-rewritable and therefore weak evidence. Tamper-evident audit trails use Merkle trees, transparency logs (Certificate Transparency / SCITT), or blockchain anchoring to make rewriting detectable.",
      'Structurally: each event is <a href="/glossary/doc-hash/">docHash</a>-pinned and linked to the previous entry. Periodically the chain head is anchored to an external surface, so retroactive tampering becomes detectable.',
      'For AI workloads, the minimum content set is (1) input hash, (2) model version, (3) inference timestamp, (4) output hash, (5) human-approval status. This is the direct technical response to <a href="/glossary/eu-ai-act/">EU AI Act</a> Article 12 (automated logging for high-risk AI).',
    ],
    implementation: [
      'Lemma realizes the audit trail as a <a href="/glossary/commitment/">commitment</a> chain. Each entry hash-links to the prior; the head is anchored to a distributed ledger. <a href="/glossary/selective-disclosure/">Selective disclosure</a> lets the auditor see only the attributes that matter (timestamp, model version) while the rest stays closed.',
      'The body of the data stays hidden; what is provable via <a href="/glossary/zk-proof/">ZK</a> is the fact that the inference happened — a specified model, on a specified input, at a specified time. GDPR and audit obligation hold together on the technical layer.',
      'The same audit-trail substrate covers agent collaboration on <a href="/glossary/a2a/">A2A</a> and tool calls under <a href="/glossary/mcp/">MCP</a>.',
    ],
    related: [
      { slug: "eu-ai-act", desc: "The regulation mandating automated logging for high-risk AI. Direct match." },
      { slug: "verifiable-ai", desc: "Includes the audit trail as a required surface." },
      { slug: "provenance", desc: "Expresses events as a lineage chain." },
      { slug: "commitment", desc: "Pins each audit-trail entry cryptographically." },
    ],
    ctaH2: "Tamper-evident execution history for AI.",
  },

  {
    slug: "scope",
    nameJa: "スコープ",
    nameEn: "Scope — tenant boundary",
    category: "検証可能AI",
    description:
      "Lemma's tenant boundary. Every key, schema, circuit, document, and proof you register is bound to one scope ID. Resource CRUD is scope-isolated; attributes.query can read verified attributes across scopes by design.",
    lead:
      'In Lemma, a <strong>scope</strong> is the unit of tenancy. Every API key, schema, circuit, document, and proof you register belongs to exactly one scope. Resource CRUD is isolated per scope — even when two scopes share an issuer <a href="/glossary/did/">DID</a>. The one deliberate exception is <code>attributes.query</code>, which can read verified attributes across scopes by design.',
    definition: [
      "A scope is created when a developer signs in for the first time. Each subsequent registration — API keys, schemas, circuits, generators, documents, proofs — carries that scope as a foreign key. The dashboard, the workers API, and on-chain hooks all filter by scope before returning data.",
      "Scope is distinct from issuer identity. A single legal entity can run multiple scopes (production / staging / partner-x). Conversely, a single scope can sign documents under multiple issuer DIDs as the operational context shifts.",
      "Resource CRUD isolation is enforced at the workers API layer, not just the UI. A request that authenticates against scope A cannot read or mutate resources under scope B even by constructing a direct API call — the bearer-token check resolves to a scope_id before any route handler runs. The one intentional cross-scope path is <code>attributes.query</code>, a read-only query surface that resolves verified attributes across scopes by design.",
    ],
    implementation: [
      'The scope is the join key on every D1 table. <a href="/glossary/x402/">x402</a> service routes, <a href="/glossary/mcp/">MCP</a> tool access, and the dashboard\'s "my-resources" view all narrow by scope_id. The first key minted at sign-in carries the scope; rotating keys never changes the scope.',
      "Scope-level controls — rate limits, billing aggregation — are designed so a developer can move between scopes the way a workspace user switches teams: same identity, different boundary. The boundary bounds resource CRUD; verified-attribute queries are the deliberate cross-scope read path.",
      'For multi-tenant deployments, the scope is also the privacy unit. <a href="/glossary/selective-disclosure/">Selective disclosure</a> and BBS+ presentations are evaluated within a single scope before they cross outward.',
    ],
    related: [
      { slug: "schema", desc: "The first thing you register under a scope — the typed shape of every document below it." },
      { slug: "x402", desc: "Per-scope API key authorization is the bearer-token side of x402 service access." },
      { slug: "trust402", desc: "Trust402 role enforcement evaluates a proof inside the scope that owns the circuit." },
      { slug: "mcp", desc: "The MCP server scopes every read to the requesting key's scope_id." },
    ],
    ctaH2: "Start a Lemma scope and register your first attribute.",
  },
  {
    slug: "schema",
    nameJa: "スキーマ",
    nameEn: "Schema — typed attribute declaration",
    category: "検証可能AI",
    description:
      "Lemma's typed declaration of the attributes a document carries, anchored to a normalize artifact — a WASM module that hashes raw fields into the canonical form a circuit checks.",
    lead:
      'A <strong>schema</strong> pins the typed shape of an attribute set and anchors it to a <em>normalize artifact</em> — a WASM module that hashes raw fields into the canonical form a <a href="/glossary/zk-proof/">ZK circuit</a> can verify against. Schemas are immutable once registered; you version them by id.',
    definition: [
      "The schema declares names and types only — it does not carry values. The same schema is referenced by every document that conforms to it and every circuit that proves against it. This is the contract layer between issuer, verifier, and AI consumer.",
      "Because a circuit's constraint system depends on the exact hash representation of the inputs, the schema must pin not just the typed fields but the normalization pipeline (the WASM module hash) that produces those inputs. Changing the normalization changes the constraint, which changes the verifying key — so a new normalize artifact is a new schema id.",
      'Versioning is by id (for example "age-over-eighteen.v2"), not by mutation. Old schemas remain queryable so existing documents and proofs stay verifiable forever; new schemas are independent ids that can coexist.',
    ],
    implementation: [
      'A schema is registered against a <a href="/glossary/scope/">scope</a> via <code>schemas.register</code> in the SDK. The payload is a <code>SchemaMeta</code> with <code>id</code>, optional <code>description</code>, and a required <code>NormalizeArtifact</code> (WASM URL + hash + ABI).',
      'Downstream artifacts — <a href="/glossary/generator/">generators</a>, circuits, and documents — reference the schema by id. AI agents querying through <a href="/glossary/mcp/">MCP</a> or x402 use the schema id to know what attributes a verified document exposes.',
      "For verifiable AI workflows such as provenance-tracked RAG, the schema serves as the contract between issuer and retriever: the issuer signs documents to fit the schema, and the retriever validates that the returned document's docHash binds to the same normalize artifact the schema declares.",
    ],
    related: [
      { slug: "scope", desc: "The tenant boundary the schema is registered under." },
      { slug: "generator", desc: "Schemas are referenced by generator artifacts that build proofs against them." },
      { slug: "doc-hash", desc: "The hash a document binds to — produced by the schema's normalize artifact." },
      { slug: "rag", desc: "Schemas shape the typed attribute contract a verifiable RAG pipeline expects." },
    ],
    ctaH2: "Pin your attribute contract with a typed schema.",
  },
  {
    slug: "generator",
    nameJa: "ジェネレータ",
    nameEn: "Generator — document-generation script metadata",
    category: "検証可能AI",
    description:
      "Metadata for a document-generation script. It declares how a rawDoc is produced — input spec, output spec, and source location — and runs on developer infrastructure, not Lemma. The generatorId and its hash become ZK public inputs for verification.",
    lead:
      'A <strong>generator</strong> is the registered metadata for a script that produces a rawDoc — the raw document a <a href="/glossary/schema/">schema</a> later normalizes. It records the input spec, the output spec, and where the script lives. Execution stays on your own infrastructure; Lemma holds only the descriptor and uses the generator\'s hash as a public input when a proof needs to attest which generator produced a document.',
    definition: [
      "A generator does not run on Lemma. It is a descriptor: <code>inputsSpec</code> (the inputs the script expects), <code>outputsSpec</code> (the rawDoc shape it returns and the schema it targets), and <code>source</code> (a URL or other location where the script itself lives). Registration stores this descriptor under your scope.",
      "Keeping the generation logic off-platform means document production stays on developer-controlled infrastructure — external APIs, private data sources, and proprietary assembly steps never touch Lemma's servers. Lemma records only what is needed to reference and verify the generator later.",
      "The <code>generatorId</code> and the hash of its descriptor are treated as ZK public inputs. A proof can therefore attest that a given rawDoc was produced by a specific, registered generator — binding the document's origin into the verifiable record without revealing the generation logic itself.",
    ],
    implementation: [
      'A generator is registered against a <a href="/glossary/scope/">scope</a> and tied to a <a href="/glossary/schema/">schema</a> through its <code>outputsSpec</code>. The dashboard\'s Overview tab lists generators alongside other registered artifacts; the workers API exposes <code>generators.register</code> and <code>generators.getById</code>.',
      'Because the generator hash is a public input, the same descriptor anchors both the document\'s <a href="/glossary/provenance/">provenance</a> and any downstream <a href="/glossary/zk-proof/">ZK proof</a> that references how the document was produced — without exposing the script or its private inputs.',
      'When a produced document is later disclosed selectively, the generator that built it remains referenceable as the document\'s origin, so the disclosure and its provenance resolve to the same registered descriptor.',
    ],
    related: [
      { slug: "schema", desc: "The schema a generator targets — its outputsSpec names the schema the produced rawDoc conforms to." },
      { slug: "zk-proof", desc: "The generatorId hash is a public input, so a proof can attest which generator produced a document." },
      { slug: "commitment", desc: "The generator descriptor's hash is committed and referenced when proving a document's origin." },
      { slug: "selective-disclosure", desc: "Disclosure over a produced document still resolves to the generator that built it." },
    ],
    ctaH2: "Register a generator to describe how your documents are produced.",
  },
  {
    slug: "human-in-the-loop",
    nameJa: "ヒューマン・イン・ザ・ループ",
    nameEn: "Human-in-the-Loop — HITL",
    category: "検証可能AI",
    description:
      "An operating model where a human reviews and approves each AI decision before it executes. The standard control in high-stakes domains — but a throughput ceiling as agent autonomy rises.",
    lead:
      "An operating model where a human reviews and approves an AI system's decision before it takes effect. A human can catch errors and deviations before they execute — but inserting a person into every decision sets the throughput ceiling.",
    definition: [
      "Human-in-the-loop (HITL) describes designs that never execute AI output directly: a human review-and-approval step gates every decision before it is committed. It has long been the standard control in domains where the cost of error is high — lending, medical diagnosis, credit decisions.",
      '<a href="/glossary/eu-ai-act/">EU AI Act</a> Article 14 mandates "human oversight" for high-risk AI; HITL is its most conservative implementation. A human in each decision blocks automation bias and malfunction before execution.',
      "But HITL does not scale by nature. Once decision volume exceeds human review capacity, the approval queue becomes the rate limit. For use cases where an agent decides continuously, gating every decision on a human stops being realistic.",
    ],
    implementation: [
      'Lemma records the fact that a human approved as an element of the <a href="/glossary/audit-trail/">audit trail</a>. The approver, the approval timestamp, and the target docHash are committed, so "this decision passed human approval" becomes provable tamper-evidently after the fact.',
      'This moves HITL from "a claim in an operational log" to "a cryptographically verifiable fact." An auditor can confirm approval via <a href="/glossary/zk-proof/">zero-knowledge proof</a> without seeing the underlying data.',
      'Rather than removing HITL outright, Lemma provides — on the same audit-trail substrate — a path to record the approval as evidence and then migrate progressively toward <a href="/glossary/human-off-the-loop/">human-off-the-loop</a>.',
    ],
    related: [
      { slug: "human-off-the-loop", desc: "Autonomy with human approval removed and substituted by evidence. The opposite pole." },
      { slug: "audit-trail", desc: "The tamper-evident log that records human-approval status." },
      { slug: "eu-ai-act", desc: "Article 14, which mandates human oversight for high-risk AI." },
      { slug: "verifiable-ai", desc: "The umbrella concept that treats the oversight fact as verifiable." },
    ],
    ctaH2: "Make human approval a verifiable fact.",
  },
  {
    slug: "human-off-the-loop",
    nameJa: "ヒューマン・オフ・ザ・ループ",
    nameEn: "Human-off-the-Loop — HOTL",
    category: "検証可能AI",
    description:
      "An operating model where AI executes each decision autonomously without waiting for human approval. Throughput rises, but it presupposes an accountability mechanism standing in for the human eye.",
    lead:
      "An operating model where AI executes decisions without waiting for per-item human approval. A human monitors and intervenes as needed, but does not gate each decision. Throughput rises sharply — and the accountability the human eye used to provide must be filled by another mechanism.",
    definition: [
      "Human-off-the-loop (HOTL) describes designs that commit AI decisions without human approval, with the human moved to exception monitoring and after-the-fact review. For agents executing payments, procurement, or data access continuously, throughput is unattainable without HOTL.",
      "The problem is the accountability gap. A human not being in each decision means that unless 'who decided what, when, and on what basis' can be reconstructed afterward, neither regulatory response nor incident analysis holds. Raising autonomy and losing control are, properly, separate problems.",
      '<a href="/glossary/eu-ai-act/">EU AI Act</a> oversight requirements do not forbid HOTL. What they require is a state that can be supervised — not that a human attend every decision. With after-the-fact verifiable evidence, the oversight requirement can be met on the technical layer.',
    ],
    implementation: [
      'Lemma\'s position is explicit: the further a decision moves off the loop, the more the <a href="/glossary/audit-trail/">audit trail</a> carries the accountability that human approval used to. Each decision\'s input hash, model version, inference timestamp, and output hash are pinned to a commitment chain, so even without a human signature "when, which model, on what input it decided" is preserved tamper-evidently.',
      'In domains like <a href="/glossary/agentic-payments/">agentic payments</a>, where a human cannot approve each item, proving <a href="/glossary/provenance/">provenance</a> via <a href="/glossary/zk-proof/">zero-knowledge proof</a> becomes the functional substitute for human approval — the validity of a decision is verifiable without disclosing the data.',
      "The result: HOTL is not 'autonomy that discarded control' but 'autonomy governed by evidence.' What Lemma provides is the verification layer for raising autonomy without lowering auditability.",
    ],
    related: [
      { slug: "human-in-the-loop", desc: "The control model that gates each decision on human approval. The opposite pole." },
      { slug: "audit-trail", desc: "The tamper-evident evidence that carries accountability once human approval is removed." },
      { slug: "agentic-payments", desc: "The archetypal HOTL domain, where a human cannot approve each item." },
      { slug: "provenance", desc: "The lineage chain for reconstructing the basis of a decision after the fact." },
    ],
    ctaH2: "Leave the loop without giving up auditability.",
  },
  // ============ Threat Model & AI Attack ============
  {
    slug: "mythos",
    nameJa: "ミュトス",
    nameEn: "Mythos",
    category: "脅威モデル・AI攻撃",
    description:
      "Definition and Lemma response path for Mythos — the Anthropic frontier model whose automated zero-day discovery and exploit-chain construction define the contemporary AI threat class.",
    lead:
      "<strong>Claude Mythos Preview</strong>, the Anthropic frontier model offered for defensive use through <strong>Project Glasswing</strong> (launched April 7, 2026). It compresses zero-day discovery, exploit-chain construction, and target adaptation into a single agent. \"Mythos-grade\" names that capability class.",
    definition: [
      "Mythos is the name of the Anthropic frontier model offered through <strong>Project Glasswing</strong> (launched April 7, 2026) for defensive use to a limited set of organizations including AWS, Apple, Cisco, Google, Microsoft, and Cloudflare. What distinguishes it qualitatively from prior AI-assisted tooling: zero-day vulnerability discovery, exploit-chain construction, and target adaptation are completed end-to-end inside a single agent — without a human operator in the middle.",
      "Dual-use sits at the center. A capability assembled for defense is structurally equivalent to the same capability turned outward. In April 2026, the US Treasury and Federal Reserve summoned major bank CEOs; on April 24, Japan's FSA convened a parallel emergency session; over May 12–21, a Prime Ministerial directive, a multi-ministry council, and a Ministry of Internal Affairs cross-industry meeting walked AI cyber defense down the staircase in ten days (full context: <a href=\"/blog/verifiable-ai-financial-agents-2026/\">verifiable AI and financial agents</a>). \"Mythos-grade attack\" became the shorthand for the capability class that drove that response.",
      "What matters operationally: automated attacks leave thin attribution residue. A detection tool's confidence score — say, \"99.7% probability of anomaly\" — is not admissible evidence in regulatory filings, administrative proceedings, or court that an unauthorized authority was exercised (full argument: <a href=\"/blog/detection-is-not-proof/\">detection is not proof</a>). Cryptographically provable provenance and a pre-execution judgment-verification layer are the only path that preserves reproducibility and accountability after the fact.",
    ],
    implementation: [
      '<a href="/pricing/#critical">Lemma Critical</a> targets critical-infrastructure operators — power, water, transport, manufacturing — with a pre-execution attestation layer that independently verifies AI judgments before they reach SCADA/ICS control. Not the AI\'s output but its judgment process is verified: <a href="/glossary/zk-proof/">zero-knowledge proofs</a> gate the principle that "cryptographically valid ≠ semantically right" at commit time.',
      "Domain-specific business rules — equipment safety limits, regulatory requirements, operating SLAs — are pinned as custom ZK circuits, and AI judgments are proven to satisfy them before execution. Prompt injection, data poisoning, and adversarial inputs intrinsic to Mythos-grade attacks fail at the pre-commit verification step. The judgment stops before reaching the control plane — that's the structural break from detection-style defense.",
      'The delegation graph — who authorized what, to whom, to what limit — is pinned as a <a href="/glossary/commitment/">commitment</a> too. AI judgments and the authority behind them remain reproducible six months later for post-incident review and regulatory reporting. Compliance-grade <a href="/glossary/audit-trail/">audit trails</a> become the defensive line of the Mythos era.',
    ],
    related: [
      { slug: "verifiable-ai", desc: "Lemma's response domain to Mythos-grade attack. Verifies the judgment process itself, not its output." },
      { slug: "provenance-proof", desc: "Tamper-evidently binds AI judgments to their inputs. Preserves post-incident reproducibility." },
      { slug: "audit-trail", desc: "The only after-the-fact verification surface that holds in the Mythos era. Compliance-grade." },
      { slug: "human-off-the-loop", desc: "The operating mode where humans no longer approve each AI action — and the precondition for Mythos-grade attack." },
    ],
    ctaH2: "Stop the AI judgment before Mythos-grade attack reaches commit.",
  },
  // ============ Protocols & Agents ============
  {
    slug: "agentic-payments",
    nameJa: "エージェント決済",
    nameEn: "Agentic Payments",
    category: "プロトコル・エージェント",
    description:
      "Transactions and settlements executed autonomously by AI agents. The new-generation payment stack (x402, MCP, A2A) is the substrate; authority and provenance verification are the core problems.",
    lead:
      "A payment model where AI agents complete transactions and settlements autonomously, without per-call human approval. The prerequisite for a world in which LLM-based agents buy compute, APIs, and services, negotiate contracts with other agents, and execute them end-to-end.",
    definition: [
      "Agentic payments are a transaction pattern where autonomous AI agents are the transacting party. The enablers are LLM reasoning improvements, tool use (function calling), longer context windows, and the standardization of agent-to-agent protocols (<a href=\"/glossary/mcp/\">MCP</a>, <a href=\"/glossary/a2a/\">A2A</a>). The concept solidified through 2024–2025 alongside the rapid capability gains in Claude and Google's agent stacks.",
      "The technical stack centers on <a href=\"/glossary/x402/\">x402</a> (Coinbase's revival of HTTP 402 Payment Required), the Stripe Agent SDK for agent-to-agent commerce, and the <a href=\"/glossary/facilitator/\">Facilitator</a> as the settlement intermediary. Traditional payments infrastructure (Stripe, PayPal) is designed around human users; when an agent becomes the transacting party, authority, authentication, and spend-limit controls are structurally missing.",
      "When autonomous agents transact, three trust questions become unavoidable. (1) Who is this agent acting for (delegation)? (2) How much can it spend (spending limit)? (3) Is the data underlying the payment authentic (provenance)? API-key authentication cannot solve the three together.",
    ],
    implementation: [
      "Lemma's <a href=\"/glossary/trust402/\">Trust402</a> sits in front of agent settlement as a verification layer. Before payment proceeds, the agent proves in ZK \"who I'm acting for, what limits I'm under, and what provenance data underlies this transaction.\" With authority and transaction grounding fixed cryptographically, the downstream settlement step can be safely delegated to the agent.",
      "Integration with adjacent technologies is modular. <a href=\"/glossary/x402/\">x402</a> handles the HTTP layer of agent-to-agent payments; <a href=\"/glossary/a2a/\">A2A</a> covers agent discovery and contract negotiation; <a href=\"/glossary/mcp/\">MCP</a> handles tool use. Lemma adds a verification stage on top — \"authority and provenance\" — that the other layers do not own.",
      "The concrete implementation plan and Lemma's role in agentic payments is laid out in the <a href=\"/pillars/#authority\">Agent Authority Proof</a> pillar. This page covers the concept and ecosystem; the pillar covers how Lemma binds the three axes (authority, spend control, provenance) into a single attestation chain.",
    ],
    related: [
      { slug: "trust402", desc: "The pre-settlement verification layer for agent transactions." },
      { slug: "x402", desc: "The HTTP-level protocol for agent-to-agent payments. Proposed by Coinbase." },
      { slug: "a2a", desc: "Standard for agent discovery and contract negotiation." },
      { slug: "mcp", desc: "Tool-use protocol for agents. Led by Anthropic." },
    ],
    ctaH2: "Make agent authority and transactions verifiable.",
  },
  {
    slug: "x402",
    nameJa: "x402",
    nameEn: "HTTP 402-native payment protocol",
    category: "プロトコル・エージェント",
    description:
      "Definition of x402 and Lemma's verification layer (Trust402). An open protocol led by Coinbase that re-purposes HTTP 402 Payment Required to integrate stablecoin settlement directly into HTTP.",
    lead:
      "An open protocol led by Coinbase that re-purposes HTTP 402 Payment Required to put stablecoin settlement directly into API and content access. AI-agent autonomous payment is the headline use case.",
    definition: [
      "x402 puts the HTTP <code>402 Payment Required</code> status code into production duty. A client GETs a protected resource; the server returns 402 with payment requirements (amount, currency, recipient, facilitator). The client signs a payload, attaches it as an <code>X-PAYMENT</code> header on the retry, and the server settles via a facilitator and returns 200 with the resource.",
      "Notable properties: (1) no accounts, sessions, or OAuth flows; (2) multi-network — EVM chains (Base, Polygon, Arbitrum, etc.) and Solana; (3) ERC-20 based, so stablecoins and beyond; (4) extension points cover discovery and auth. Coinbase Developer Platform runs a hosted facilitator.",
      "x402 is solving for the settlement layer of economic activity that does not pass through a human UI. AI agents calling paid APIs, agents exchanging outputs, content consumed in pay-per-call form — all without human per-action approval, using the minimal HTTP extension.",
    ],
    implementation: [
      'Lemma layers verifiability on top of x402 as <a href="/glossary/trust402/">Trust402</a>. While x402 alone answers "did the payment settle," Trust402 adds the second answer: <strong>"a properly authorized agent paid, within the granted scope, for the declared purpose"</strong> — proven in <a href="/glossary/zk-proof/">zero-knowledge</a>.',
      'Concretely: (1) the delegation grant to the agent is bound as a <a href="/glossary/commitment/">commitment</a>; (2) payment timestamp, amount, recipient, and purpose attach to a <a href="/glossary/provenance/">provenance</a> chain; (3) existence is proven in ZK. Delegator, delegate, and payment details open per the auditor\'s clearance level via <a href="/glossary/selective-disclosure/">selective disclosure</a>.',
      'x402 + Trust402 is the only path that separates "the payment happened" from "the payment was authorized" — which is what regulated and audit-bound domains (financial-institution AI, enterprise procurement, public-sector outflows) actually require before adopting x402 at scale.',
    ],
    related: [
      { slug: "trust402", desc: "Lemma's reference implementation that layers verifiability on x402." },
      { slug: "zk-proof", desc: "Proves authorization and intent without exposing the underlying grant." },
      { slug: "eip-3009", desc: "Pre-authorized ERC-20 transfer standard. One of x402's payment primitives." },
      { slug: "facilitator", desc: "Intermediary that validates and submits x402 payments." },
    ],
    ctaH2: "Add verifiability to x402 settlement.",
  },
  {
    slug: "trust402",
    nameJa: "Trust402",
    nameEn: "Trust402 — Lemma's verifiable x402 layer",
    category: "プロトコル・エージェント",
    description:
      "Lemma's reference implementation that adds verifiability to the x402 payment protocol. Proves both the settlement fact and the legitimacy (authority, purpose, scope) of the payment.",
    lead:
      'A reference implementation by Lemma that layers verifiability onto the <a href="/glossary/x402/">x402</a> payment protocol. Cryptographically proves not just that payment happened, but that the payment was legitimate — authorized, scoped, purposeful.',
    definition: [
      'x402 alone answers "did payment settle"; the agent economy adds a second question: "did a properly authorized agent, within the granted scope, pay for the declared purpose?" Trust402 is the layer that answers the second question.',
      'Three stages: (1) the delegator (human or higher agent) issues a payment authority as a <a href="/glossary/commitment/">commitment</a>; (2) the delegated agent runs x402 settlement and proves the authority\'s validity in <a href="/glossary/zk-proof/">zero-knowledge</a>; (3) the facilitator verifies the payment and the proof together at settlement time.',
      'The developer integration path is four-stage: Explorer (trial), Builder (integration), Studio (operations), Pro (production). Interop is preserved with both <a href="/glossary/eip-3009/">EIP-3009</a> meta-transactions and <a href="/glossary/facilitator/">facilitator</a> services.',
    ],
    implementation: [
      "Trust402 sits on Lemma's underlying cryptographic infrastructure (docHash + commitment + ZK proof) and adds an x402-spec adapter. To existing x402 clients and servers, the difference is whether or not an additional <code>X-PROOF</code> HTTP header is understood.",
      "Financial-institution autonomous agents, enterprise procurement automation, public-sector spending APIs — every domain where \"the payment happened\" alone fails to satisfy regulators and audits, and \"the payment was legitimate\" needs to be provable. Trust402 is the bridge.",
      'Settling the audit and compliance question becomes a single read of the <a href="/glossary/audit-trail/">audit trail</a> after the fact.',
    ],
    related: [
      { slug: "x402", desc: "The payment protocol Trust402 sits on top of." },
      { slug: "eip-3009", desc: "The EVM-scheme payment mechanism." },
      { slug: "facilitator", desc: "The x402 settlement intermediary, transparently extended by Trust402." },
      { slug: "zk-proof", desc: "The cryptographic primitive that powers Trust402's legitimacy proof." },
    ],
    ctaH2: "Implement verifiability on top of x402.",
  },
  {
    slug: "eip-3009",
    nameJa: "EIP-3009",
    nameEn: "EIP-3009 — Transfer With Authorization",
    category: "プロトコル・エージェント",
    description:
      "An Ethereum extension standard that lets a signature alone authorize an ERC-20 transfer (no gas paid by signer). The signer, recipient, amount, validity window, and nonce are signed under EIP-712 and submitted by a third party.",
    lead:
      "An Ethereum extension that lets a signature alone authorize an ERC-20 transfer — no gas paid by the signer. Signer, recipient, amount, validity window, and nonce are signed under EIP-712 and submitted by a third party.",
    definition: [
      "The signed message is a structured payload: <code>TransferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce)</code>. EIP-712 typed-data signing blocks replay attacks and cross-network confusion.",
      "The nonce is a user-chosen 32-byte value; the token contract tracks used nonces in a bitmap. Unlike EIP-2612's sequential nonces, parallel authorizations can be processed in any order.",
      '<code>validAfter</code> / <code>validBefore</code> let you schedule: "sign now, valid in two weeks, expires in three." USDC and other major stablecoins implement this.',
    ],
    implementation: [
      'The x402 EVM scheme (<code>scheme_exact_evm</code>) wires <a href="/glossary/eip-3009/">EIP-3009</a>\'s <code>transferWithAuthorization</code> directly into its settlement primitive. The client includes the EIP-3009 signature in the payment payload; the <a href="/glossary/facilitator/">facilitator</a> submits it on-chain.',
      'Lemma\'s <a href="/glossary/trust402/">Trust402</a> requires both the EIP-3009 signature and an authorization-delegation proof, so the "mechanical validity" and the "organizational legitimacy" of a signature are verified separately.',
      "Because the recipient is baked into the signed message, a phished signature still cannot be redirected. This is a safer-default design than EIP-2612 (permit).",
    ],
    related: [
      { slug: "x402", desc: "The HTTP-native protocol that uses EIP-3009 as a payment primitive." },
      { slug: "trust402", desc: "Lemma's overlay that adds authorization proofs over EIP-3009 signatures." },
      { slug: "facilitator", desc: "The intermediary that submits EIP-3009 signatures on-chain." },
      { slug: "a2a", desc: "Agent collaboration that may settle via EIP-3009." },
    ],
    ctaH2: "Extend single-signature payments with verifiability.",
  },
  {
    slug: "facilitator",
    nameJa: "Facilitator",
    nameEn: "Facilitator — x402 settlement intermediary",
    category: "プロトコル・エージェント",
    description:
      "A service that brokers x402 settlement validation and execution. Submits the client's payment payload on-chain and returns settlement status to the resource server.",
    lead:
      "A service that brokers x402 settlement validation and execution. Submits the client's payment payload on-chain and returns settlement status to the resource server.",
    definition: [
      "In a pure peer-to-peer x402 configuration, the resource server has to confirm on-chain state itself, which is operationally heavy. The facilitator role factors that out, consolidating validation, submission, and confirmation in one place.",
      "Coinbase Developer Platform hosts a facilitator that supports Base, Polygon, Arbitrum, World, and Solana, with a free tier of 1,000 transactions per month.",
      "Facilitators hold no client secrets — this is an intermediary for availability, not confidentiality. The payment signature is created client-side; the facilitator only submits and verifies. Multiple facilitators can be selected.",
    ],
    implementation: [
      'Lemma\'s <a href="/glossary/trust402/">Trust402</a> works transparently with existing facilitators. Splitting the <code>X-PAYMENT</code> header (<a href="/glossary/x402/">x402</a> standard) from the <code>X-PROOF</code> header (Trust402 extension) means facilitators that don\'t understand the proof header still settle payment correctly.',
      'For workflows where verifiability is mandatory (financial services, public procurement), a Trust402-aware facilitator validates <code>X-PROOF</code> via <a href="/glossary/zk-proof/">ZK</a> alongside payment validation, only finalizing when both succeed.',
      'Gas costs for submitting the <a href="/glossary/eip-3009/">EIP-3009</a> signature on-chain are fronted by the facilitator and recovered later. The client is fully insulated from gas management.',
    ],
    related: [
      { slug: "x402", desc: "The base protocol the facilitator brokers for." },
      { slug: "trust402", desc: "Facilitator extended to understand the X-PROOF header." },
      { slug: "eip-3009", desc: "The signature standard the facilitator submits on-chain." },
      { slug: "a2a", desc: "Agent-coordination scenarios that invoke a facilitator." },
    ],
    ctaH2: "Add a verification layer to settlement brokering.",
  },
  {
    slug: "a2a",
    nameJa: "A2A",
    nameEn: "Agent2Agent — A2A",
    category: "プロトコル・エージェント",
    description:
      "An open protocol that standardizes communication and coordination between AI agents. Proposed by Google in 2025; migrated to a Linux Foundation independent project in 2026.",
    lead:
      "An open protocol standardizing communication and coordination between AI agents. Proposed by Google in 2025; migrated under the Linux Foundation as an independent project in 2026.",
    definition: [
      "A2A has three primitives. (1) Agent Card: an agent declares its capabilities in JSON. (2) Task: the work unit agents exchange, with a lifecycle. (3) Transport: JSON-RPC 2.0 over HTTPS plus Server-Sent Events.",
      "As of 2026, 150+ organizations have endorsed it (Microsoft, AWS, Salesforce, SAP, ServiceNow, Workday, IBM, and others). The v1.0 stable release adds multi-protocol support, enterprise multi-tenancy, and modernized security flows.",
      '<a href="/glossary/mcp/">MCP</a> connects agents to tools; A2A connects agents to each other. They are complementary and almost always deployed together.',
    ],
    implementation: [
      'Lemma layers verification onto A2A-resident agents through three hooks: (1) pin each agent\'s identity and capability declaration as a <a href="/glossary/commitment/">commitment</a>; (2) record Task execution history as an <a href="/glossary/audit-trail/">audit trail</a>; (3) verify inter-agent authority delegation in <a href="/glossary/zk-proof/">ZK</a>.',
      "Financial, public-sector, and regulated workloads need to be able to answer, after the fact, \"which agent did what, with which authority.\" Binding the verification layer directly onto A2A's Agent Card and Task structures is how that becomes routine.",
      'When A2A exchanges generate payments, the combination of <a href="/glossary/x402/">x402</a> + <a href="/glossary/trust402/">Trust402</a> closes the loop into a single verifiable chain across coordination, payment, and audit.',
    ],
    related: [
      { slug: "mcp", desc: "Complementary connectivity standard. A2A and MCP cover different planes." },
      { slug: "x402", desc: "Settlement layer for economic exchange inside A2A workflows." },
      { slug: "trust402", desc: "Lemma overlay that gives A2A payments verifiability." },
      { slug: "audit-trail", desc: "How A2A Task execution gets logged tamper-evidently." },
    ],
    ctaH2: "Verification, embedded in agent collaboration.",
  },
  {
    slug: "mcp",
    nameJa: "MCP",
    nameEn: "Model Context Protocol — MCP",
    category: "プロトコル・エージェント",
    description:
      "An open protocol that gives AI models a uniform way to connect to external tools, data sources, and services. Released by Anthropic in November 2024; donated to the AAIF under the Linux Foundation in December 2025.",
    lead:
      "An open protocol that gives AI models a uniform way to connect to external tools, data sources, and services. Anthropic released it in November 2024 and donated it to the AAIF (Linux Foundation) in December 2025.",
    definition: [
      "MCP standardizes the wire between client (the model) and server (the tool) on JSON-RPC. The server exposes <code>tools</code>, <code>resources</code>, and <code>prompts</code> as capabilities; the client calls them as needed.",
      "The authoritative specification at the time of writing is 2025-11-25. In 2026, MCP Apps (SEP-1865) extended the standard to deliver interactive UIs — React-based dashboards, forms, visualizations — from MCP servers to host apps like Claude and ChatGPT, on top of the existing text/structured-data wire.",
      "Governance moved into the Agentic AI Foundation (AAIF), co-founded by Anthropic, Block, and OpenAI under the Linux Foundation — making MCP vendor-neutral. Implementations rolled out concurrently in Claude, ChatGPT, and major IDEs.",
    ],
    implementation: [
      'Lemma itself runs an MCP server, exposing <a href="/glossary/zk-proof/">ZK proof</a> generation, <a href="/glossary/provenance/">provenance</a> verification, and <a href="/glossary/selective-disclosure/">selective disclosure</a> as callable MCP tools to any AI agent.',
      'Every MCP tool call lands in an <a href="/glossary/audit-trail/">audit trail</a>: which model invoked which tool with which authority, in what order. Combined with <a href="/glossary/a2a/">A2A</a>, the full agent-collaboration surface becomes auditable.',
      'Embedding MCP into a <a href="/glossary/verifiable-ai/">verifiable AI</a> pipeline makes the boundaries between model, tool, and data cryptographically verifiable end to end.',
    ],
    related: [
      { slug: "a2a", desc: "Complementary agent-coordination protocol." },
      { slug: "x402", desc: "Routes monetization into MCP tool calls." },
      { slug: "audit-trail", desc: "Records MCP invocations tamper-evidently." },
      { slug: "verifiable-ai", desc: "Verifiable AI pipelines with MCP embedded." },
    ],
    ctaH2: "Verifiability between AI and its tools.",
  },

  // ============ Regulatory & Compliance ============
  {
    slug: "kyc-aml",
    nameJa: "KYC / AML",
    nameEn: "Know Your Customer / Anti-Money Laundering",
    category: "規制・コンプライアンス",
    description:
      "An international regulatory regime requiring financial institutions and crypto-asset operators to verify customer identity (KYC) and interdict money-laundering and terrorism-financing pathways (AML).",
    lead:
      "An international regulatory regime requiring financial institutions and crypto-asset operators to verify customer identity (KYC) and interdict money-laundering and terrorism-financing pathways (AML).",
    definition: [
      "KYC obliges institutions to confirm a customer's identity, existence, ultimate beneficial owner, and intended transactions. AML covers suspicious-activity monitoring, reporting, and freezing. FATF (Financial Action Task Force) recommendations are the international skeleton, transposed into national law (US BSA, EU AMLD, Japan APTC).",
      "By 2026 the EU has refreshed the framework with AMLR (Anti-Money Laundering Regulation) + AMLD6 + AMLA (a new supervisor), and is extending the regime to crypto-asset operators. Non-compliance translates directly into business-stop orders and sizable fines.",
      "The core tension is privacy. KYC/AML demands collection of sensitive personal data, while the same data carries breach, secondary-use, and marketing-misuse risks. Attribute-based minimal disclosure is the technical answer.",
    ],
    implementation: [
      'Lemma lets an issuer sign KYC attributes (nationality, age band, KYC-verified flag, not-on-sanctions list) as <a href="/glossary/commitment/">commitments</a>. The customer then opens only the attributes a given bank needs, via <a href="/glossary/selective-disclosure/">selective disclosure</a>.',
      "The receiving institution satisfies identity-verification responsibility without taking custody of the raw data. GDPR's data-minimization mandate, cross-border data restrictions, and KYC/AML obligations all coexist on a single technical path.",
      'Recording who verified which attribute when, in <a href="/glossary/zk-proof/">ZK</a>-bound <a href="/glossary/audit-trail/">audit-trail</a> form, withstands subsequent regulatory inquiry.',
    ],
    related: [
      { slug: "selective-disclosure", desc: "The mechanism that lets KYC reveal only attributes." },
      { slug: "eu-ai-act", desc: "Reg applies when KYC scoring is AI-driven." },
      { slug: "audit-trail", desc: "Tamper-evident record of KYC verifications." },
      { slug: "zk-proof", desc: "The primitive that proves attribute authenticity." },
    ],
    ctaH2: "Identity verification without data exchange.",
  },
  {
    slug: "eu-ai-act",
    nameJa: "EU AI Act",
    nameEn: "EU Artificial Intelligence Act — Regulation (EU) 2024/1689",
    category: "規制・コンプライアンス",
    description:
      "Definition of EU AI Act and Lemma's compliance path. Four risk tiers, a 2025–2027 phased schedule, and automated-logging plus data-governance obligations on high-risk AI.",
    lead:
      "EU regulation that classifies AI systems by risk tier and imposes graduated obligations on providers and deployers. Penalties reach €35 million or 7% of global annual turnover.",
    definition: [
      "Four risk tiers. <strong>Unacceptable</strong> (prohibited): social scoring, indiscriminate biometric surveillance, and other uses that violate fundamental rights. <strong>High</strong>: medical devices, hiring, credit, education evaluation, critical infrastructure, law enforcement — uses with material impact on rights or safety. <strong>Limited</strong>: chatbots and deepfakes — transparency obligations (disclose to the user). <strong>Minimal</strong>: everything else, no additional duty.",
      "Phased application. Prohibited practices and AI-literacy obligations apply from February 2025; general-purpose AI (GPAI) model-provider obligations from August 2025; the substantive high-risk and transparency obligations from August 2026. High-risk systems must meet six requirements: (1) lifecycle risk management, (2) training/validation data governance, (3) auditable technical documentation, (4) automated logging, (5) human-oversight mechanisms, (6) accuracy, robustness, and cybersecurity.",
      "GPAI providers must publish technical documentation, instructions for use, copyright-compliance attestations, and a training-data summary. GPAI judged to present systemic risk additionally undergoes model evaluation, adversarial testing, serious-incident reporting, and cybersecurity hardening.",
    ],
    implementation: [
      'The high-risk requirements collapse to "remain auditable across the lifecycle." Lemma encodes audit logs, data governance, and human-oversight evidence as <code>docHash</code> + attribute <a href="/glossary/commitment/">commitments</a> + <a href="/glossary/zk-proof/">zero-knowledge proofs</a>. The data itself stays within GDPR and trade-secret boundaries; only attribute proofs cross the wire.',
      'Concretely: (1) collection date, source, and classification of training/validation data are pinned as <a href="/glossary/provenance/">provenance</a>; (2) input/model/output hashes for each inference enter the audit trail; (3) the timestamp of human approval and the approver\'s attributes are proven via <a href="/glossary/selective-disclosure/">selective disclosure</a>. Lemma Compliance serves financial high-risk AI; Lemma Civic serves public-sector AI use.',
      'EU AI Act is asking for "a state from which AI trustworthiness can be verified after the fact." Lemma\'s verifiable AI is the concrete technical realization of that state.',
    ],
    related: [
      { slug: "verifiable-ai", desc: "Encodes high-risk AI's logging and governance requirements." },
      { slug: "provenance", desc: "Pins training-data lineage. Direct match for data-governance duties." },
      { slug: "selective-disclosure", desc: "Reveals only attributes auditors need. Reconciles confidentiality with compliance." },
      { slug: "audit-trail", desc: "Tamper-evident execution history. Direct match for automated-logging duties." },
    ],
    ctaH2: "Cryptographic compliance for the EU AI Act.",
    implementationHeading: "Lemma compliance path",
  },
  {
    slug: "ai-business-guidelines",
    nameJa: "AI事業者ガイドライン",
    nameEn: "AI Business Operator Guidelines (METI / MIC)",
    category: "規制・コンプライアンス",
    description:
      "A soft-law set of guidelines for AI operators, jointly issued by Japan's Ministry of Economy, Trade and Industry and the Ministry of Internal Affairs and Communications in April 2024.",
    lead:
      "A comprehensive AI-operator guideline jointly issued by Japan's METI and MIC in April 2024. Organizes obligations across the developer, provider, and deployer roles.",
    definition: [
      "The AI Business Operator Guidelines integrate and update prior \"AI Ethics Guidelines\" and \"Human-Centric AI Society Principles\" into a single soft-law document. Co-authored by METI and MIC; revised on a rolling basis (Version 1.x).",
      "Ten principles: (1) human-centric, (2) safety, (3) fairness, (4) privacy, (5) security assurance, (6) transparency, (7) accountability, (8) education and literacy, (9) fair competition, (10) innovation. Each principle is mapped to the developer / provider / deployer roles.",
      "Not legally binding, but the de facto reference for government procurement standards and industry self-regulation in Japan. Covers similar ground to the EU AI Act's high-risk requirements while adopting a technology-neutral, risk-based approach.",
    ],
    implementation: [
      'Lemma provides the technical substrate for the transparency, explainability, and auditability the guidelines require. <code>docHash</code> + <a href="/glossary/commitment/">commitments</a> + <a href="/glossary/zk-proof/">zero-knowledge proofs</a> turn AI governance reports into concrete evidence.',
      'AI input, model, and output are retained as an <a href="/glossary/audit-trail/">audit trail</a>; when accountability is triggered, only the necessary attributes are released through <a href="/glossary/selective-disclosure/">selective disclosure</a>.',
      'Run in parallel with <a href="/glossary/eu-ai-act/">EU AI Act</a> compliance and a globally-operating Japanese company can unify its AI governance across both regimes.',
    ],
    related: [
      { slug: "eu-ai-act", desc: "The parallel EU regulation. Technical requirements largely align." },
      { slug: "ai-promotion-act", desc: "The Japanese AI framework law that delegates concrete obligations to these guidelines." },
      { slug: "verifiable-ai", desc: "The domain that realizes transparency and explainability cryptographically." },
      { slug: "audit-trail", desc: "Tamper-evident substrate for governance evidence." },
    ],
    ctaH2: "Cryptographic compliance for the AI Business Operator Guidelines.",
    implementationHeading: "Lemma compliance path",
  },
  {
    slug: "ai-promotion-act",
    nameJa: "AI推進法",
    nameEn: "AI Promotion Act (Japan, 2025)",
    category: "規制・コンプライアンス",
    description:
      "Enacted June 2025, formally titled the \"Act on the Promotion of Research, Development, and Utilization of AI-Related Technologies.\" Japan's first AI-related hard law.",
    lead:
      "Japan's first hard law specifically targeting AI. Enacted 4 June 2025. Establishes an AI Strategy Headquarters, mandates a national AI Basic Plan, and grants the government cooperation-request authority over relevant operators.",
    definition: [
      "Formally the \"Act on the Promotion of Research, Development, and Utilization of AI-Related Technologies.\" Establishes the \"AI Strategy Headquarters\" chaired by the Prime Minister, and mandates that the government formulate an AI Basic Plan.",
      "The substance leans toward R&D promotion, talent development, international coordination, and partial risk management. Unlike the EU AI Act, there are no outright prohibitions or fine schedules — promotion and limited risk handling form the dual axes. Direct sanctions are minimal.",
      "Functions as a skeleton law: concrete obligations are delegated to ordinances, the government plan, and various guidelines (the AI Business Operator Guidelines included). Effective enforcement depends on subsequent rulemaking.",
    ],
    implementation: [
      "Lemma's verifiable-AI infrastructure is positioned as the technical answer to the Act's call for \"responsible R&D and use.\" Public procurement and public-sector AI uses are increasingly likely to require verifiability — Lemma's infrastructure is positioned to meet that requirement ahead of the regulatory cycle.",
      'Combined with the <a href="/glossary/ai-business-guidelines/">AI Business Operator Guidelines</a>, hard-law (Promotion Act) plus soft-law (Guidelines) governance lines up across both surfaces.',
      'Companies that have already deployed Lemma against <a href="/glossary/eu-ai-act/">EU AI Act</a> can extend the same infrastructure to the Japanese regulatory perimeter — minimizing the global cost of AI compliance.',
    ],
    related: [
      { slug: "ai-business-guidelines", desc: "Concrete delegated guidance under the Act. Implementation lives there." },
      { slug: "eu-ai-act", desc: "The matching EU regulation. Run in parallel." },
      { slug: "verifiable-ai", desc: "The technical foundation for the Act's \"responsible AI\" mandate." },
      { slug: "audit-trail", desc: "The substrate for after-the-fact verification." },
    ],
    ctaH2: "Stay ahead of Japan's AI regulation curve.",
    implementationHeading: "Lemma compliance path",
  },
  {
    slug: "pii",
    nameJa: "PII / 個人を特定可能な情報",
    nameEn: "PII (Personally Identifiable Information)",
    category: "規制・コンプライアンス",
    description:
      "Information that identifies, or can be used to identify, a specific person — name, address, ID numbers, biometrics. GDPR, CCPA, and Japan's APPI all push operators toward collection minimization and breach-surface reduction.",
    lead:
      "Information that identifies, or can be used to identify, a specific individual — name, contact, ID number, biometrics, device identifiers, location. GDPR, CCPA, and Japan's APPI all require operators to minimize collection and to reduce the breach surface around stored data at the same time.",
    definition: [
      "Scope varies by jurisdiction. GDPR uses <strong>personal data</strong>, CCPA <strong>personal information</strong>, Japan's APPI 「個人情報」; the definitions don't line up exactly. The common floor includes name, address, contact, identifier numbers (national ID, PPID, PAN, ...), biometrics, device identifiers, location, communication records, transaction history. The EU draws an additional perimeter around <strong>special-category</strong> data (sensitive PII — health, race, religion, biometric, sexual orientation, and so on) and demands additional protection.",
      "Regulators put two loads on the operator at once: <strong>collection minimization</strong> and <strong>storage-time protection</strong>. The two are in tension — strengthening the latter doesn't erase the breach surface as long as the original data is held. The structural risk is that stored original PII remains both attack surface and regulatory exposure indefinitely.",
      "Adjacent vocabulary: PHI (Protected Health Information, HIPAA) for healthcare, PAN (Primary Account Number, PCI DSS) for payments. This entry treats PII as the parent concept; the adjacent regulations carry their own surface and live in their own entries.",
    ],
    implementation: [
      'Reframe the operator out of holding original PII, and let only the required attribute travel as a proof. The issuer signs the original; the holder discloses predicates ("over 18", "KYC passed", "Japan resident", ...) via <a href="/glossary/selective-disclosure/">selective disclosure</a>; the verifier sees only the attribute. Three layers; no original in motion.',
      'The original stays under the issuer; it never reaches the verifier, the recipient, or the AI inference path. It sits encrypted under <a href="/glossary/aes-gcm/">AES-GCM</a>; what touches the circuit is the <a href="/glossary/doc-hash/">docHash</a> and the attribute <a href="/glossary/commitment/">commitment</a>. When a breach happens, the surface that can leak is structurally smaller.',
      'The pattern fits anywhere a regulation simultaneously demands attribute verification and data minimization — <a href="/glossary/kyc-aml/">KYC/AML</a>, age checks, residency proofs — and shows up as an alternative path for <a href="/glossary/eu-ai-act/">EU AI Act</a> high-risk inputs, GDPR Article 8, and Japan\'s "anonymized information" pattern under APPI.',
    ],
    related: [
      { slug: "kyc-aml", desc: "The canonical regulated domain where attributes can be proven without the underlying PII." },
      { slug: "selective-disclosure", desc: "Prove the attribute, keep the PII out of motion." },
      { slug: "audit-trail", desc: "Tamper-evident record of who confirmed which attribute and when." },
      { slug: "provenance", desc: "Keep the processing history of PII-handling steps independently verifiable." },
    ],
    ctaH2: "Prove the attribute. Don't ship the PII.",
  },
];

const TERMS_BY_SLUG_EN: ReadonlyMap<GlossarySlug, GlossaryTerm> = new Map(
  GLOSSARY_TERMS_EN.map((t) => [t.slug, t]),
);

export function getGlossaryTermEn(slug: string): GlossaryTerm | undefined {
  return TERMS_BY_SLUG_EN.get(slug as GlossarySlug);
}

export const GLOSSARY_CATEGORIES_EN: ReadonlyArray<GlossaryCategory> = [
  "暗号レイヤ",
  "検証可能AI",
  "脅威モデル・AI攻撃",
  "プロトコル・エージェント",
  "規制・コンプライアンス",
];

const CATEGORY_LABELS_EN: Readonly<Record<GlossaryCategory, string>> = {
  暗号レイヤ: "Cryptography Layer",
  検証可能AI: "Verifiable AI",
  "脅威モデル・AI攻撃": "Threat Model & AI Attack",
  "プロトコル・エージェント": "Protocols & Agents",
  "規制・コンプライアンス": "Regulatory & Compliance",
};

const CATEGORY_DESCRIPTIONS_EN: Readonly<Record<GlossaryCategory, string>> = {
  暗号レイヤ:
    "The cryptographic primitives Lemma uses for proving, disclosing, and tamper-evidence: ZK proofs, symmetric encryption, hashes, and commitments.",
  検証可能AI:
    "The terminology that makes AI judgments, citations, and inference traces cryptographically verifiable. Lineage, citation, and audit basics.",
  "脅威モデル・AI攻撃":
    "The threat class Lemma's pre-execution attestation layer responds to. Frontier-model zero-day discovery and automated exploit-chain construction — the capability range named \"Mythos-grade.\"",
  "プロトコル・エージェント":
    "Protocols for autonomous agent transactions and machine-to-machine settlement: x402, Trust402, MCP, A2A, and their adjacent specs.",
  "規制・コンプライアンス":
    "The regulatory frameworks Lemma's proofs plug into: AI regulation (EU and Japan) and identity verification (KYC/AML).",
};

export interface GlossaryCategoryGroupEn {
  readonly category: GlossaryCategory;
  readonly label: string;
  readonly description: string;
  readonly terms: ReadonlyArray<GlossaryTerm>;
}

export function getGlossaryByCategoryEn(): ReadonlyArray<GlossaryCategoryGroupEn> {
  return GLOSSARY_CATEGORIES_EN.map((category, i) => ({
    category,
    label: `${String(i + 1).padStart(2, "0")} · ${CATEGORY_LABELS_EN[category]}`,
    description: CATEGORY_DESCRIPTIONS_EN[category],
    terms: GLOSSARY_TERMS_EN.filter((t) => t.category === category),
  }));
}

export function getEnCategoryLabel(category: GlossaryCategory): string {
  return CATEGORY_LABELS_EN[category];
}

// Re-export shared types for convenience.
export type { GlossaryCategory, GlossaryRelated, GlossarySlug, GlossaryTerm };
