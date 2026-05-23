# Design Principles

## Public surface minimization

- **Do not increase the public API surface.** If a change can be an internal implementation detail, keep it internal.
- Do not propose widening function visibility (e.g. `private` → `public`, un-exporting → exporting) unless explicitly requested.
- New exports require justification: "does the consumer need this, or can it be composed from existing exports?"

## Naming for longevity

- Names should survive 10 years without renaming. Prefer domain terms over implementation details.
- Avoid trendy abbreviations or framework-specific jargon that ages poorly.

## Structural invariants

- `packages/spec` is the **single source of truth** for shared types and OpenAPI spec. No type duplication across packages.
- Changes flow spec → SDK → Workers. Never the reverse.
- Side effects only at boundaries. Pure functions everywhere else.

## OpenSpec-driven development

When building features, use the [OpenSpec](https://github.com/Fission-AI/OpenSpec) workflow (`openspec/` directory) to define the interface before implementation. OpenSpec adds a lightweight spec layer so you agree on what to build before any code is written.

Follow the propose → apply → archive cycle:

1. **Propose**: create `openspec/changes/<name>/` with `proposal.md`, `specs/`, `design.md`, `tasks.md`.
2. **Apply**: implement the tasks.
3. **Validate**: `openspec validate --all --json`.
4. **Archive**: `openspec archive <name>`.

- Run `pnpm --filter @lemmaoracle/spec validate:openapi` early and often.
- If the spec does not express the goal, update the spec, then fix the code.
- **Lightweight path**: for spikes and small changes (single-route tweak, bug fix), you may skip the full OpenSpec change and work directly against `packages/spec`. Backfill or update the OpenSpec change before merging.
