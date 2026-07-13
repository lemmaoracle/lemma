# @lemmaoracle/canonical-sort

Deterministic JSON serialisation (canonical-sort-v1) for commitment schemes.

## What it does

Produces a canonical byte string from arbitrary JSON so that the same logical data always yields the same commitment, regardless of key ordering or number formatting in the source.

## Rules (subset of RFC 8785 / JCS)

1. Object keys sorted by Unicode code point (recursive, deep — not flattened)
2. Arrays: order preserved, elements recursively canonicalised
3. Numbers: shortest round-trip representation; `-0` → `"0"`
4. Strings: standard JSON escaping; no whitespace

## Usage

```typescript
import { canonicalize, canonicalSort } from "@lemmaoracle/canonical-sort";

const { canonical, bytes } = canonicalSort({ b: 2, a: 1 });
// canonical === '{"a":1,"b":2}'
// bytes === Uint8Array(11) [ ... ]
```

## License

Apache-2.0
