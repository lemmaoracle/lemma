# Functional Style Guide

All TypeScript packages (except contracts) are linted with **eslint-plugin-functional (strict preset)**.

## Core principles

- **Immutability**: All data structures use `Readonly<>` / `ReadonlyArray<>`.
- **No statements**: Branching via expressions (`R.cond`, ternary), not `if`/`switch`.
- **No mutation**: Use spread, `R.assoc`, `R.evolve` instead of direct assignment.
- **Pure functions**: Side effects only at boundaries (fetch, crypto).

## Ramda patterns used

```typescript
import * as R from "ramda";

// Branching
R.cond([                              // Multi-case branching
  [predicate1, transform1],
  [predicate2, transform2],
  [R.T, defaultTransform]             // Default case
])
R.ifElse(predicate, onTrue, onFalse)  // If-then-else
R.when(predicate, transform)          // Transform when predicate holds
R.unless(predicate, transform)        // Transform when predicate fails

// Predicate composition (for branching logic)
R.both(pred1, pred2)                  // Logical AND of predicates
R.either(pred1, pred2)                // Logical OR of predicates
R.allPass([pred1, pred2, ...])        // All predicates must pass
R.anyPass([pred1, pred2, ...])        // Any predicate must pass
R.complement(predicate)               // Negate a predicate

// Safe value handling
R.defaultTo(defaultValue, value)      // Provide default if null/undefined
R.pathOr(defaultValue, path, obj)     // Get nested value with default

// Data transformation
R.pipe(fn1, fn2, fn3)                 // Left-to-right function composition
R.compose(fn3, fn2, fn1)              // Right-to-left function composition
R.map(fn) / R.filter(pred) / R.reduce(fn, initial)
R.assoc(key, value, obj) / R.dissoc(key, obj) / R.mergeRight(obj1, obj2)
R.prop(key) / R.path(path) / R.pathOr(default, path)
```
