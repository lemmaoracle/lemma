## Why

Issuers, submitters and verifiers need to generate and verify proofs against the same published criteria within a scope, even when they belong to different organizations. Generic-circuit prove/guardrail already exists, but policy JSON retrieval and scheme-specific witness/publicSignals conversion do not.

## What Changes

- Propose a retrieval contract for policy snapshots using roots, epoch and leaf terminology.
- Propose `@lemmaoracle/verify/policy` as the only scheme-specific public boundary.
- Define information ownership, gaps and trust boundaries from issuance through verification, and the limitations of the measured ABI.
- Cover only the policy leg of the consumption flow. The card template ↔ circuitId/policy correspondence is outside this change's scope.
- This change is design only. Adding public interfaces, implementation and publishing are separate stages after human review.

## Capabilities

### New Capabilities

- `policy-sharing`: retrieval of a published root bundle within a scope, pure scheme conversion and consumer integration contracts.

### Modified Capabilities

None. Existing API requirements are neither changed nor duplicated.

## Impact

The next stage covers a new verify subpath, a dashboard read boundary, and the necessary spec synchronization and shared vectors. Generic guardrail/prove/settlement/resolver semantics remain unchanged. DB mutations and concurrency control remain in the dashboard. This change only modifies documents in this OpenSpec change.
