## 1. Human review before implementation

- [ ] 1.1 Approve snapshot terminology, fixed axes, public names and /policy boundary, including the confirmed roots-as-data approach (a) and not standardizing vkey specialization (b).
- [ ] 1.2 Decide cross-organization read authorization and issuer-scope trust mapping.
- [ ] 1.3 Decide production request/template/amount binding, path bit constraints and circuit artifact identity.
- [ ] 1.4 Fix request digest encoding, time/amount units, subject identity source and replay/freshness rules.
- [ ] 1.5 Decide published-epoch path retention/distribution and approve final witness/signals shapes.

## 2. Production semantics and vectors

- [ ] 2.1 Prepare production circuit constraints and artifact generation manifest after 1.3; do not replace generic APIs.
- [x] 2.2 Create one shared JSON vector set for leaf/root/path/ABI/expected failures with tool versions and artifact digests. Internal-stage scope: `fixtures/policy-sharing/v1.json`; production artifact digests are explicitly pending/null, and circuit consumption is not connected (see its README).
- [ ] 2.3 Prove rejection of template/amount substitution and non-bit directions using SDK-bypassing witnesses.

- [ ] 2.4 Confirm the same roots-as-data consumption implementation works for both Groth16 and WHIR, with differences limited to artifact/ABI; account for deferred WHIR resolution.

## 3. Shared pure calculations

- [x] 3.1 Add immutable member/grant/empty and fixed-depth tree/holds internally with co-located Vitest interoperability checks. Includes requested strict internal snapshot decoding; no public wire contract or exports are added, so 3.2 remains pending.
- [ ] 3.2 Define policy wire contract in the appropriate source-of-truth spec and strict internal decoding; follow spec-sync without editing packages/api/spec.
- [ ] 3.3 Adapt dashboard pure calculations/root bundle types only; retain append/revoke/publish and RETURNING-based success/competition logic there.

## 4. Retrieval and path delivery

- [ ] 4.1 Add consistent published snapshot read and GET JSON boundary with session authentication/error/cache tests.
- [ ] 4.2 Provide the approved issuer path retention/distribution mechanism and verify paths match published rather than draft roots.
- [ ] 4.3 Add approved external-verifier read access and test scope isolation before claiming organization-independent operation.

## 5. ABI consumers and release review

- [ ] 5.1 Add pure witness/signals adapters using the approved ABI and shared vectors.
- [ ] 5.2 Connect verifier-owned expectations and replay/freshness checks to existing guardrail; connect submitter witness to existing prove.
- [ ] 5.3 Run real proof end-to-end tests, shared vector tests and existing generic API tests; verify no reverse imports.
- [ ] 5.4 Review final export/package/spec diff with a human before adding public interfaces or publishing npm artifacts.
