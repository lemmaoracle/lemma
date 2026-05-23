# Design Principles

## Minimal change

Make the smallest change that achieves the goal. Every addition is a liability.

- If a change can be an internal implementation detail, keep it internal.
- Do not widen visibility (e.g. `private` → `public`, un-exported → exported) unless explicitly requested.
- **Public interfaces demand extra caution.** Every addition or modification to a public interface risks creating future breaking changes. "Convenient" is not sufficient reason to add or change one. Ask: does a consumer need this, or can it be composed from what already exists?

## Naming for longevity

Names should survive 10 years without renaming. Prefer domain terms over implementation details. Avoid trendy abbreviations or framework-specific jargon that ages poorly.

## Structural invariants

- `packages/spec` is the **single source of truth** for shared types and OpenAPI spec. No type duplication across packages.
- Changes flow spec → SDK → Workers. Never the reverse.
- Side effects only at boundaries. Pure functions everywhere else.

## Spec-driven development

When building features, define the interface before implementation. Use the [OpenSpec](https://github.com/Fission-AI/OpenSpec) workflow (`openspec/` directory) to manage changes.

Follow the propose → apply → archive cycle:

1. **Propose**: create `openspec/changes/<name>/` with `proposal.md`, `specs/`, `design.md`, `tasks.md`.
2. **Apply**: implement the tasks.
3. **Validate**: `openspec validate --all --json`.
4. **Archive**: `openspec archive <name>`.

Use `openspec instructions <artifact> --change <name> --json` to get per-artifact templates and rules. For implementation guidance, `openspec instructions apply --change <name> --json`.

- If the spec does not express the goal, update the spec, then fix the code.
- **Lightweight path**: for spikes and small changes, you may skip the full OpenSpec change and work directly against `packages/spec`. Backfill or update the OpenSpec change before merging.
