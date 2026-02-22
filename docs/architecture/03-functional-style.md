# Functional Style Guide

The SDK and Workers are linted with **eslint-plugin-functional (strict preset)**.

## Core principles

- **Immutability**: All data structures use `Readonly<>` / `ReadonlyArray<>`.
- **No statements**: Branching via expressions (`R.cond`, ternary), not `if`/`switch`.
- **No mutation**: Use spread, `R.assoc`, `R.evolve` instead of direct assignment.
- **Pure functions**: Side effects only at boundaries (fetch, crypto).

## Ramda patterns used

```typescript
import * as R from "ramda";

// Branching
R.cond([...])
R.ifElse(pred, onTrue, onFalse)
R.when(pred, transform)
R.unless(pred, transform)

// Data transformation
R.pipe(fn1, fn2, fn3)
R.map / R.filter / R.reduce
R.assoc / R.dissoc / R.mergeRight
R.prop / R.path / R.pathOr
```
