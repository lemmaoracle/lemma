## Context

This is a design proposal awaiting approval, not a published contract. Keep the current branch.

Materials reviewed:

- `docs/architecture/{design-principles,fp,spec-sync}.md` and `packages/verify/src/*.ts` (including tests) in this checkout.
- This checkout does not contain `packages/api` / dashboard. The specified API spec lines 336–357, circuits route, templates.ts, migration 0021, registry.ts and merkle.ts were read at the same relative paths under `/tmp/wt-dashboard-codex/`. The implementation in that worktree is not treated as present on this branch.
- `/tmp/gate-exp/debug_gate2.circom` was read. The 24,500 constraints, nPublic=13, and proof interoperability/rejection experiments are accepted as the requester's measured results; the proof experiments were not rerun in this work.
- `openspec list` showed the existing 3 changes as Complete. There was no ongoing change matching this one.

Refer to existing requirements for listing-binding-v2's registered `(orgDid, memberRoot)` matching and listingRoot calculation, org-identity-v1 freshness and duplicate checks, and warnings about SDK bypass. Do not redefine them here. Do not equate a policy scope with backing by a DNS-verified institution. The purpose is to identify where those requirements apply to the new scheme.

## Goals / Non-Goals

**Goals:** Make concrete the minimal shared boundary, serialization, pure conversion and unresolved semantic binding needed for consumption flows across organizations.

**Non-Goals:** Implementation or npm publishing, specializing generic APIs for a scheme, sharing DB operations, an arbitrary axis-extension framework, signature infrastructure, a new distribution service, or standardizing vkey specialization. Only the policy leg of the consumption flow is covered; the card template ↔ circuitId/policy correspondence is outside this change's scope. Variant circuits embedding criteria in artifacts are excluded from the standard flow and are exceptions only for deployments with frozen criteria and registered artifacts.

## Decisions

### 1. Policy is a published-criteria snapshot, not the whole authorization policy

The recommendation is `Policy`. It consists of a scope, scheme, common epoch, member/grant roots and counts. A tree is a data structure for inclusion; a policy is a bundle of criteria selected by the verifier. An epoch cannot be obtained from a tree alone, and both axes must be fixed together, so calling the shared protocol merely merkle hides a necessary boundary.

**Counterargument to this assessment:** There are also reasons to keep calling it a tree. The snapshot itself contains no request semantics, execution decision, issuer legitimacy or maximum age. Mistaking these for guarantees of a policy would overstate its assurances. For a consumer with a single axis and circuit that manages the epoch externally, a Merkle root/path is sufficient and Policy becomes an unnecessary wrapper. Therefore, saying it is "no longer a tree" is too strong. More precisely, it is a "policy snapshot protocol using Merkle trees as components." It must not become a complete authorization object.

### 2. Modules and names

Recommended layout for the next stage:

| Internal file (verify/src/policy/) | Responsibility | Public candidates |
| --- | --- | --- |
| leaves.ts | Fixed leaf vocabulary and Poseidon | member, grant, empty / Member, Grant |
| merkle.ts | Immutable tree construction, positions and siblings, inclusion checks | tree, holds / Tree, Path |
| policy.ts | Snapshot type and strict JSON decoding | Policy (decoder initially internal) |
| adapter.ts | Pure conversion for the selected ABI | witness, signals (only after ABI approval) |
| index.ts | Selective exports of the above | A single `/policy` subpath |

Do not re-export from the root index. Consumers can compose `policy → prove/guardrail`; generic APIs must not reference policy. Retrieval uses ordinary fetch at the application boundary, with no need to expose a new fetch helper. Share only tree construction, leaves and root-bundle types; keep registry append/revoke/publish, snapshot DB reads, authentication, revision comparisons and RETURNING-based decisions in the dashboard. Use Readonly / ReadonlyArray and discriminated unions for results, without classes, mutable objects or synchronous throw.

Candidate public shapes (not approval to add code):

- `member(value: Member): bigint`. Member = Readonly<{ idCommitment: bigint; roleId: bigint }>.
- `grant(value: Grant): bigint`. Grant order is roleId, templateId, dbTargetId, actionId, maxAmount, startDay, endDay. All are bigint.
- `empty: bigint` = Poseidon1(0). Do not remove elements from the array after revocation.
- `tree(leaves: ReadonlyArray<bigint>): Result<Tree>`. The scheme has fixed depth=20, so do not initially expose an arbitrary depth argument. Tree is an immutable value with a root and `path(index): Result<Path>`. Reject paths for unallocated positions for submitters.
- `holds(leaf: bigint, path: Path, root: bigint): boolean`. Invalid fields, length≠20 and non-bit directions also return false. This is only an inclusion check, not authorization.
- Path = Readonly<{ siblings: ReadonlyArray<bigint>; directions: ReadonlyArray<0 | 1> }>. Order is from leaf to root; 0 means the current node is on the left, 1 on the right. Position = Σ directions[i]·2^i. Siblings change with each epoch.

`Result` is the illustrative `Readonly<{ok:true;value:T}> | Readonly<{ok:false;reason:string}>`. No new generic Result export is proposed. There is no reason to freeze synchronous computation into the provisional async shape. Review implementation compatibility before exposing it.

Keep terminology mapping inside the adapter: member ↔ DB subject ↔ ABI subjectRoot, grant ↔ DB permission ↔ ABI permRoot. Reuse the existing memberRoot vocabulary without claiming the same hash as the listing-binding-v2 tree scheme.

### 3. Retrieval and serialization contract

The recommended initial endpoint is dashboard `GET /api/cyber/policy`. Use the same session scope and JSON envelope as templates.ts, with `content-type: application/json` and `cache-control: private, no-store`. A 200 response is `{ "policy": <snapshot> }`. Retrieve only the single latest **published** epoch in the session scope. Do not override it with a scope specified in the query/body.

Concrete snapshot shape (illustrative values, not actual roots):

```json
{
  "version": 1,
  "scheme": "member-grant-v1",
  "scope": "issuer-scope",
  "epoch": "7",
  "publishedAt": "2026-10-17T00:00:00.000Z",
  "member": { "root": "123", "leafCount": 4, "revokedCount": 1 },
  "grant": { "root": "456", "leafCount": 8, "revokedCount": 2 }
}
```

`member-grant-v1` is a proposed scheme identifier; do not register it before the production ABI is finalized. version identifies the JSON contract, while scheme identifies the leaf/tree scheme. The scheme fixes: the BN254 scalar field, each arity of circomlib-compatible Poseidon, depth=20, parent Poseidon2(left,right), empty=Poseidon1(0), and the leaf orders above. Empty subtrees repeat the same parent calculation for 20 levels. There are exactly two fixed axes; do not introduce a dynamic map.

Epoch and roots are nonnegative decimal strings without leading zeros (epoch is at least 1; all are below the field modulus). Do not round field values through JSON numbers. leafCount is the number of allocated slots (including revoked slots), an integer in 0..2^20; revokedCount is in 0..leafCount. Counts and timestamps are operational metadata, not proof public inputs. publishedAt is the UTC timestamp of simultaneous publication. There is **no** signature and no signature field. Do not canonicalize JSON key order or whitespace for signing.

Read both axes together as a snapshot of the same scope and epoch; return 503 for missing or duplicate axes or inconsistencies. Return 404 `{error:...}` before publication, 401 without authentication, and 503 for DB failure. Do not disguise an unpublished state as an empty policy or epoch=0. Draft appends and revocations must not appear in 200 responses until the next publish. Do not silently fall back to an older epoch when the latest rows are incomplete.

**What the verifier checks:** Trusted lemma origin/TLS and authentication route, correspondence to the expected issuer scope, supported version/scheme, strict field/count/time formats, both axes in the same epoch, and the application's freshness/rollback policy. A valid root string alone does not establish issuer legitimacy. Obtain both roots and epoch for public inputs from the retrieved snapshot; do not replace them with submitter values.

**Cross-organization access gap:** A session-scoped GET alone cannot let another organization's verifier retrieve the issuer policy. The initial contract is limited to direct retrieval by an authenticated principal with issuer-scope read access. Do not solve this by distributing issuer cookies to other organizations. General cross-organization end-to-end operation remains incomplete until a human chooses public reads or scope-limited machine authentication. Establishing and providing cross-organization read authorization is a blocking prerequisite for the standard flow; do not proceed with providing the cross-organization consumption flow until it is satisfied. Do not allow another scope to be read through an unauthenticated query. Signed portable snapshots are not a solution in this change either.

Freshness: epoch expresses order, not elapsed time. The verifier maintains an allowed difference between now and publishedAt and, if needed, a minimum known epoch. The initial recommendation is to accept only the latest epoch at retrieval, with no grace period. A human must decide when to retrieve again if publication occurs after acceptance, the allowed time until execution, and maximum elapsed time. no-store does not guarantee atomic execution-time freshness. Note that a timestamp-only expiry setting also expires a policy that has not been published for a long time because nothing has changed.

### 4. Consumption flow and information ownership

| Stage | Existing components to use | Gaps / next stage | Information owner |
| --- | --- | --- | --- |
| 1 Append / replace with empty | Reference dashboard /cyber/registry, registry, 0021 | Importing into this branch is outside this design's scope | issuer: leaf list, fixed index, revision |
| 2 Publish epoch | registry.publish two-axis INSERT and revision/previous-epoch matching | Consistent published snapshot read for JSON | issuer: common epoch and both roots, publication timestamp |
| 3 Receive credentials | Pure merkle.tree/path calculations | Authenticated credential/path delivery and updates are not yet provided | submitter: own member/grant, each index and siblings, corresponding scope/epoch, secret |
| 4 witness / prove | Generic prove({circuitId,witness}) already exists | Policy witness adapter, finalizing scheme and artifact | submitter: witness, independent of the template author's organization |
| 5 Retrieve policy | templates GET provides an authentication/JSON precedent | The GET above itself, cross-organization read authorization | verifier: trusted origin, expected issuer scope, retrieved snapshot |
| 6 Public inputs | API spec verification responsibilities provide a precedent | signals adapter and application logic constructing expectations from the request | verifier: request, clock, challenge, subject correspondence, allowed circuit |
| 7 Cryptographic verification | guardrail and resolver, reference API getCircuitById | Registration of the finalized circuit and artifact distribution | registry: vkey/artifact. verifier: circuit allowance decision |
| 8 Criteria / freshness | Refer to registered-root matching and freshness requirements in the existing API spec | Mandatory enforcement in the new scheme's execution path | verifier: scope correspondence, freshness/replay decisions, execution decision |

The issuer supplies positions initially and then updates paths for the same positions for each published epoch. Update data must include correspondence to scope, epoch and both roots; the submitter checks it with holds. Active membership does not hold for revoked members. Paths built from the latest DB draft may differ from the published roots. The current registry has no way to reproduce or retain leaf snapshots for published epochs. The initial recommendation is for the issuer to retain a distribution snapshot at publication; decide its storage and access mechanism before implementation. The public GET does not return leaves, index, secret or path.

### 5. Separate expectation selection from ABI array construction for public inputs

Place pure `signals({ policy, expected, outputs }) → Result<ReadonlyArray<string>>` in the adapter (shape awaiting approval). Obtain both roots and epoch from policy. expected contains today, maxAmount, actionId, dbTargetId, requestDigestLo/Hi, challenge, idCommitment. outputs contains nullifier/requestTag.

The array is exactly `[nullifier, requestTag, subjectRoot, permRoot, epoch, today, maxAmount, actionId, dbTargetId, requestDigestLo, requestDigestHi, challenge, idCommitment]`. Validate the field format of all 13 entries, and also check today as 32 bit and maxAmount as 64 bit. policy.member.root→subjectRoot, policy.grant.root→permRoot.

**The first two entries are public outputs** and cannot be independently recomputed by a verifier without the secret. Strictly decode the submitted outputs, place them first, and establish their correctness through cryptographic verification. This is not a design that passes the entire submitted publicSignals array to guardrail. Use verifier values for the remaining 11 entries. Checking whether a nullifier has been consumed and challenge validity/single use belong at the application boundary. Persistence and execution concurrency control also stay outside the pure adapter.

Keep expected construction in the verifier application: request normalization, digest calculation and 128 bit split direction, UTC day origin/rounding, amount units, request→action/db mapping, the selected grant's upper limit and trusted request-subject→idCommitment correspondence, challenge issuance, allowed circuitId and scheme/ABI correspondence. Do not unconditionally resolve a submitter-specified circuitId. The adapter must not fetch or infer digest/clock/authentication.

**Measured evidence for Verifier owned expectations (confirmed results from the requester, not rerun in this work):** An unregistered subject generated idCommitment from its own secret and produced a proof using nonexistent roleId=9, templateId=777 and maxAmount=100,000,000 (the registered policy limit was 1,000,000). The results were as follows.

| Verifier input selection | Result |
| --- | --- |
| Use submitted public signals unchanged | `{"ok":true}` (bypass) |
| Construct roots from the registered policy | `{"ok":false}` |
| Fix roots and limit from the registered policy | `{"ok":false}` |

Measurements with the same guardrail showed valid 13 signals returning `{"ok":true}`, maxAmount increased by +1 returning `{"ok":false}`, a different circuit's vkey returning `{"ok":false}`, and a valid proof in base64 wire format returning `{"ok":true}`. This demonstrates that cryptographic verification alone cannot replace criteria selection, and that a verifier-side semantic interpretation layer (request → expectations → public signal construction) is necessary.

`alg` must be `"groth16-bn254-snarkjs"`; `"groth16"` returns `ok:false` even for a valid proof (measured). The existing resolver assumes Groth16 JSON vkeys; WHIR params resolution is deferred (`packages/verify/src/resolver.ts`).

**What the scheme does not guarantee (consumption contract):** Scope and scheme are not directly proof-bound. Epoch is not bound merely by appearing in a snapshot either; it is bound only when included as a circuit public input and used in its constraints. The experimental ABI has epoch as a public input, but do not assume the same guarantee for another ABI. The verifier externally enforces trusted issuer-scope/snapshot correspondence, allowed circuitId/scheme/ABI/artifact correspondence, freshness, rollback and replay rules. These correspondence checks do not add circuit-level scope/scheme binding; domain separation requires circuit changes if needed.

**Measured ABI gaps:** templateId and amount exist only in the witness, with no constraints connecting them to the digest. requestTag connects the digest and secret, but does not show that the digest contents match the witness templateId/amount. A prover can prove with a smaller amount and a different templateId and regenerate requestTag for a request digest specifying a larger amount and another template. Sharing roleId prevents axis mix-ups but is separate from request-semantic binding. This does not claim that any unauthorized template necessarily passes; it means substitution with another permitted template cannot be distinguished.

Therefore, treat debug_gate2 as an experimental ABI for scheme interoperability. Production must either make templateId/amount public inputs whose expected values the verifier can specify, or prove their equality to the request commitment inside the circuit. Do not freeze the 13-entry order as a permanent API. In addition, Path isRight lacks explicit boolean constraints in the circuit (Mux1 arithmetic selection). A malicious prover can bypass TS 0/1 checks. Add bit constraints to the production circuit and verify them in the actual artifact's constraints. Circuit/setup/artifact updates may be needed even without ABI additions.

### 6. Submitter entry point and ease of use

Ease of use means passing credentials from the issuer and the verifier's request without memorizing leaf hash order, ABI names or array order. Do not send secrets to the server, omit positions, or pretend to retrieve outdated paths automatically.

Candidate: `witness({ policy, member, grant, paths, secret, request }) → Result<Readonly<Record<string, unknown>>>`. member/grant are the semantic types above. paths contains member/grant Path values. secret is subjectSecret/subjectId. request contains verifier-issued expected and amount (for the experimental ABI). The adapter checks roleId equality, idCommitment derivation equality, both holds checks, time/amount ranges, and policy/distributed-credential epoch equality, and outputs subjectPathElements/Indices and permPathElements/Indices without omission. Do not log secrets or inputs.

Usage has two steps: pass the successful value of `witness(input)` to the existing `prove({ circuitId, witness: value })`. No new policy.prove wrapper is needed. Do not use prove's returned `inputs` as the source of verifier expectations. signals and witness use the same internal ABI definition but do not share retrieval or authorization decisions.

Unresolved parts are the final request semantic type, ABI identification tied to an artifact, digest encoding, and the output submission envelope. Do not export witness/signals until these and the production circuit are settled. The initial member/grant/tree/holds/empty candidates alone must not be treated as a complete production consumption flow.

### 7. Roots arrive as retrieved or pinned data

As the confirmed human decision, make (a) delivering roots to the verifier as retrieved or pinned data and assembling them into public inputs the default. Even when pinning, the verifier manages correspondence to the trusted issuer scope, scheme and epoch, and freshness policy. Criteria changes are handled by replacing roots; key distribution or artifact deployment for each change is not the standard path. (b) Do not standardize vkey specialization that folds roots or constants into the verification key. (c) Variant circuits embedding criteria in artifacts are exceptions only for deployments with frozen criteria, conditional on registering the corresponding artifact in the circuits registry.

Reasons for the decision:

- **Actual WHIR implementation:** `verifyWhir` in `packages/sdk/src/verifier.ts` calls `whir.verify(wasm, params, publicInputs, proof)`. The artifact is `{wasm, params}`, with no equivalent of Groth16 zkey/vkey. Vkey specialization in this sense is structurally impossible.
- **Conditions for folding:** Both (i) a verification equation linear in public inputs and (ii) a verification key with group elements for each public input (Groth16's IC array) are required. Groth16 satisfies them. The conclusion that PLONK-family schemes do not is a structural inference, not a measurement. Hash-based schemes such as WHIR have no vkey into which to fold values.
- **Alternative cost of variants:** WHIR requires new params/wasm artifacts, and the on-chain settlement path also requires deployment of a verifier contract. This is costly as a standard flow for every criteria change.
- **Transparency:** A locally derived vkey in the current flow has neither a CID nor a URL and is not named in `circuits`' `circuitId → artifact{wasm, zkey, vkey?}` mapping. Third-party verification breaks unless a derivation record including the base vkey CID, folded constants and signature is published. An implementation comment also notes that existing https vkeys are weak because their URLs are mutable; a URL alone does not guarantee immutability. This change does not introduce a derivation-record mechanism.
- **Portability of (a):** Roots are data consisting of field elements, so the same retrieval/pin → expectations → public signals implementation works for both Groth16 and WHIR, with differences limited to artifact/ABI. This is a design commonality, not a claim that the existing resolver's WHIR support is complete or that both schemes have been measured end to end.

## Risks / Trade-offs

- [Overconfidence in the object name] → Limit Policy to a snapshot. Issuer credentials and execution rules remain external requirements.
- [Cross-organization retrieval unavailable] → Make read authorization a blocking prerequisite for the standard flow, and provide cross-organization consumption after the authentication contract is decided and provided.
- [Scope/scheme not directly proof-bound; epoch requires circuit public inputs and constraints] → Fix correspondence in the verifier's mapping. The circuit cannot distinguish proof reuse for another scope using the same roots and epoch. If separation is mandatory, a circuit domain input is needed.
- [Updates between freshness checks and verification] → Define retrieval-time semantics without promising immediate revocation. If immediacy is required, re-querying immediately before execution or a similar mechanism is needed.
- [Path redistribution availability / leakage] → Positions remain fixed but siblings change. Authenticated issuer distribution is required without assuming publication of all leaves. DB drafts alone cannot reconstruct paths for past published epochs.
- [Mistaking TS checks outside circuit constraints for guarantees] → Test constraints assuming SDK bypass. Resolve template/amount/bit gaps in the circuit.
- [One nullifier per epoch] → Multiple requests from the same subject may be rejected. Reuse becomes possible after an epoch update. Collisions may also occur across scopes. A human decides the unit of single use.
- [Longevity of a fixed hash scheme] → Separate schema/version from scheme. Do not disguise a different scheme as the same v1. Vkey specialization is neither a substitute for root updates nor a general substitute for variant circuits.
- [Key specialization / variant deployment and transparency] → Do not standardize (b), given WHIR's structure, artifact/contract deployment costs, and the inability of third parties to verify unregistered derived keys described in §7. Limit (c) to deployments with frozen criteria and registered artifacts.
- [No signature] → Assume a trusted origin accessed over TLS. This proposal is insufficient if portable or offline verification becomes a requirement.
- [Computation cost] → Recomputing all leaves in the reference tree is expensive at maximum capacity. Performance improvements are outside the request; do not guarantee scale without measurement.

## Migration Plan

Implementation order is in tasks.md. First obtain human approval of the public surface, retrieval authorization and production circuit semantics. Then fix shared vectors and implement pure calculations, JSON reads, ABI conversion and cross-organization integration in that order. Root-only changes can use the same circuit/setup/vkey. Changes to circuit constraints require preparation as a separate artifact/circuitId.

Retain existing HTML/DB mutations and introduce public API additions in parallel. On failure, disable the new retrieval/scheme path and reject; do not fall back to submitter-specified roots. Removing published names is a breaking change, so do not export before review. Define and generate types/endpoints whose source of truth is packages/spec using spec-sync; do not hand-edit packages/api/spec. If internal library types are separated from generated wire types, keep only bigint⇔string boundary conversion and do not duplicate wire definitions.

Place shared test vectors in a single JSON fixture in the repository in the next stage. Store field/scheme constants; both roots for empty trees, 1 leaf, odd leaf counts and after revocation; fixed positions/siblings; member/grant; publicSignals names and order; **test-only** witnesses including secrets; and expected success/failure. Include pinned Circom/compiler/circomlib/poseidon-lite/snarkjs versions, circuit/wasm/zkey/vkey digests and regeneration instructions. Do not require equality of random proof bytes themselves; check root equality between both implementations and verification of real proofs.

Use co-located Vitest tests for leaf order, path directions, strict decoding and conversion. On the circuit side, generate witnesses from the same fixture and run snarkjs prove/verify. In addition to successful cases, distinguish role mismatches, expiry, amount overflows, root/epoch mixing, revocation, outdated siblings, omitted positions, non-bit directions, template/amount substitution, subject impersonation and third-party signal replacement. Do not confuse attacks that regenerate proofs with modification of existing proofs. Test 401/404/503, scope mixing, atomicity of both axes and draft non-disclosure at the retrieval boundary. Retain existing generic API tests. If implementation absorbs external OSS, declare attribution.json and headers in the same commit.

## Open Questions

Decisions for human review (with recommendations):

1. Approve Policy as a snapshot and `/policy` with fixed member/grant axes? Recommendation: approve, without adding generic root exports.
2. Issuer-scope read authorization for external verifiers. Choose public reads or machine authentication. A session-only version does not complete cross-organization delivery.
3. Production circuit including templateId/amount semantic binding and path bit constraints. Recommendation: modify the circuit and use a separate artifact. Do not use a debug name as a long-term public name.
4. Request normalization, digest splitting, amount units, dates, the trusted source of idCommitment, and selection of grant limits. The adapter must not infer these.
5. Maximum age, rollback retention, time from retrieval to execution, and suitability of per-epoch nullifiers. Initial recommendation: latest only, with no grace period for past epochs.
6. Responsibility and authentication for path retention/redistribution for each published epoch. Initial recommendation: issuer snapshot retention at publication.
7. Public witness/signals shapes and wire-contract placement after the above decisions. All public additions await human confirmation.
