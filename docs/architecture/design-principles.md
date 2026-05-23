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

When building features, derive the interface from the OpenAPI spec first, then implement.
This naturally enforces goal-oriented development and prevents scope creep.

- Define the route/schema in `packages/spec` before writing handler code.
- Run `pnpm --filter @lemmaoracle/spec validate:openapi` early and often.
- If the spec does not express the goal, update the spec, not the implementation.
