## ADDED Requirements

### Requirement: Immutable policy snapshot

The policy protocol SHALL represent one published scope and epoch with exactly member and grant roots, using the serialization and fixed scheme defined in design.md section 3. Counts SHALL include allocated revoked slots. Implementations SHALL reject malformed fields, unsupported versions and incomplete axis bundles. This requirement is a proposed future contract, not an authorization to publish interfaces.

#### Scenario: Consistent published snapshot
- **WHEN** a scope has a complete published epoch and newer draft mutations
- **THEN** retrieval returns only the published pair and its counts, without draft leaves or private paths

#### Scenario: Incomplete latest publication
- **WHEN** the latest epoch lacks either axis
- **THEN** retrieval fails with 503 rather than silently returning an older epoch

### Requirement: Scope constrained retrieval

The initial dashboard GET /api/cyber/policy SHALL follow templates.ts session scope and JSON conventions, including private no-store caching. It SHALL return the policy envelope on success, 401 without authentication, 404 before first publication and 503 on storage failure. Cross-organization access SHALL require an explicitly approved authorization contract before claiming that consumption flow is supported. Establishing and providing cross-organization issuer-scope read authorization SHALL be a blocking prerequisite for the standard cross-organization consumption flow; a session-only endpoint SHALL NOT satisfy that prerequisite.

#### Scenario: Attempt to select another scope
- **WHEN** a session for scope A submits a scope B query
- **THEN** the query cannot grant access to B or change the session scope

#### Scenario: Unpublished scope
- **WHEN** an authenticated scope has no published epoch
- **THEN** retrieval returns 404 without inventing epoch zero or an empty policy

#### Scenario: External verifier lacks issuer read access
- **WHEN** an external verifier has no approved read access to the issuer scope
- **THEN** the standard cross-organization consumption flow remains blocked until that access is established and provided

### Requirement: Roots delivered as data

Policy roots SHALL reach the verifier as retrieved or pinned data. The standard flow SHALL NOT require key distribution or artifact deployment for each policy change. Verification-key specialization SHALL NOT be standardized. A variant circuit embedding criteria in its artifact SHALL be permitted only for a deployment with frozen criteria and a registered artifact.

#### Scenario: Published criteria change
- **WHEN** published criteria change without changing the circuit or ABI
- **THEN** the verifier replaces the policy roots as data without requiring distribution of a new vkey or deployment of a new verifier contract

### Requirement: Pure scheme boundary

The proposed /policy surface SHALL keep leaf hashing, immutable Merkle calculation and ABI transformation separate from database mutations and generic circuit APIs. Only policy consumers SHALL depend on generic prove/guardrail; generic APIs SHALL NOT import policy. Root exports SHALL remain unchanged.

#### Scenario: Generic circuit consumer
- **WHEN** a caller proves or verifies an unrelated circuit
- **THEN** no policy snapshot, issuer scope or member/grant semantics are required

### Requirement: Epoch bound private paths

Submitters SHALL retain both path directions and siblings, validate their correspondence to the published scope and epoch, and receive updated siblings after relevant mutations are published. Revocation SHALL preserve positions by replacing the effective leaf with empty, not deleting the slot. The issuer SHALL provide a defined way to reproduce paths for the published epoch before the flow is considered complete.

#### Scenario: Other member added
- **WHEN** an append changes a sibling subtree in a new published epoch
- **THEN** the submitter retains its position but obtains a path matching the new root before proving

### Requirement: Verifier owned expectations

The policy consumer SHALL obtain expected roots and epoch from its trusted issuer snapshot and construct the eleven public inputs from trusted request context. It SHALL treat nullifier and requestTag as proof outputs, not independently derivable expected inputs. It SHALL apply issuer, circuit, freshness and replay decisions outside the pure adapter, referring to the existing API verification obligations without redefining them.

Scope and scheme SHALL NOT be treated as directly proof-bound by this protocol. Epoch SHALL be treated as proof-bound only when included as a circuit public input and used in its constraints. The verifier SHALL enforce trusted issuer-scope/snapshot correspondence, allowed circuitId/scheme/ABI/artifact correspondence, and freshness, rollback and replay rules outside the adapter; these checks SHALL NOT be represented as circuit-level scope or scheme binding.

#### Scenario: Snapshot metadata without circuit binding
- **WHEN** a snapshot supplies scope, scheme or an epoch absent from the circuit public inputs
- **THEN** the verifier applies its external correspondence and freshness rules without claiming that the proof binds those metadata values

#### Scenario: Submitter supplies a private tree root
- **WHEN** a submitter offers publicSignals with a self-created root
- **THEN** the verifier constructs signals with its trusted policy root and cannot accept merely because the submitted array verifies

#### Scenario: Experimental signal order
- **WHEN** the experimental debug_gate2 adapter constructs signals
- **THEN** it emits exactly the thirteen entries in the order specified in design.md section 5, preserving the two leading outputs

### Requirement: Production ABI approval

Implementations SHALL NOT expose witness/signals as stable public interfaces before the production ABI, artifact correspondence, request semantics and public interface review are complete. Production authorization SHALL constrain request template and amount correspondence and path direction bits in the circuit rather than relying on SDK checks alone.

#### Scenario: Substitution using a fresh proof
- **WHEN** a prover uses a permitted private template or smaller private amount against a different execution request
- **THEN** production conformance tests require rejection even if the prover regenerates the proof

#### Scenario: SDK bypass
- **WHEN** a prover supplies non-bit Merkle path directions directly
- **THEN** production circuit constraints reject the witness independently of TypeScript validation

### Requirement: Shared interoperability vectors

Implementation SHALL use a single versioned fixture consumed by TypeScript and circuit proof tests, with pinned scheme/tool versions and artifact digests. Tests SHALL distinguish proof regeneration from third-party signal replacement and cover revocation, axis coupling, path updates and request binding.

#### Scenario: Root replacement
- **WHEN** an old proof is tested with a newly published root using the same circuit key
- **THEN** cryptographic verification rejects the modified statement while a newly generated valid proof can verify
