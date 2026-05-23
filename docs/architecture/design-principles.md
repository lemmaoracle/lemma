# Design Principles

## Minimal change

Make the smallest change that achieves the goal. Every addition is a liability.

- If a change can be an internal implementation detail, keep it internal.
- Do not widen visibility (e.g. `private` → `public`, un-exported → exported) unless explicitly requested.
- **Public interfaces demand extra caution.** Every addition or modification to a public interface risks creating future breaking changes. "Convenient" is not sufficient reason to add or change one. Ask: does a consumer need this, or can it be composed from what already exists?
- Do not add features, configuration options, or abstractions that were not explicitly requested.
- **Commit scope discipline**: only include files directly relevant to the task. Do not bundle `.gitignore`, formatting tweaks, or unrelated changes without explicit instruction.

## Naming for longevity

Names should survive 10 years without renaming. Prefer domain terms over implementation details. Avoid trendy abbreviations or framework-specific jargon that ages poorly. Aim for single-word names; two words are acceptable; three only with strong justification.

## Structural invariants

- `packages/spec` is the **single source of truth** for core SDK types and OpenAPI spec. Packages that depend on `@lemmaoracle/spec` must not duplicate those types; packages that do not are free to define their own.

## Spec-driven development

Before starting non-trivial work, run `openspec list` to check for an existing change. If none, create `openspec/changes/<name>/` with a `.openspec.yaml` containing `schema: spec-driven` and `created: <date>`, then scaffold artifacts with `openspec instructions <artifact> --change "<name>" --json`.

Follow the **propose → apply → archive** cycle:

1. **Propose** — scaffold each artifact. Run `openspec instructions <artifact> --change "<name>" --json` and follow the emitted templates and rules. Repeat until `openspec status --change "<name>" --json` shows all `applyRequires` artifacts as done. (In Cursor, `/opsx:propose "<name>"` automates this step.)
2. **Apply** — `openspec instructions apply --change "<name>" --json` returns the task list. Implement each task, then validate: `openspec validate --all --json`.
3. **Archive** — `openspec archive "<name>"`.

- If the spec does not express the goal, update the spec, then fix the code.
- **Lightweight path**: skip the full cycle for spikes and small changes — edit `packages/spec` directly and backfill the change record before merging. `packages/web` is exempt from this workflow entirely (no spec dependency).
- **Fallback**: if the `openspec` CLI is not available, manage the `openspec/` directory manually or edit `packages/spec` directly; still backfill a change record before merging.
