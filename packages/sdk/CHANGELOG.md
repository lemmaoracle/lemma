# @lemmaoracle/sdk — Migration Notes

This file records **migration-relevant** changes between SDK releases. It is *not* a full
per-release changelog; for complete history consult the git tag history and the published
versions on npm ([`@lemmaoracle/sdk`](https://www.npmjs.com/package/@lemmaoracle/sdk)).

Created as follow-up #2 to GitHub issue
[#587](https://github.com/lemmaoracle/lemma/issues/587).

---

## Migrating from 0.0.14 → 0.0.3x

> **Attribution note.** Version `0.0.14` is the *reporter's stated pre-upgrade version* from
> the #587 issue thread. It is **not** present in this repository's git history — the earliest
> `packages/sdk/package.json` commit (`c2ad15a`) already records `0.0.23` with the `exports`
> map fully encapsulated. The boundary below is therefore a consumer-reported baseline, not a
> repo-reconstructable one.

All version numbers below are **published npm versions**. They can lag the `version` string in
the in-tree `package.json` at commit time — for example the publish commit `9664e40` ("feat
(sdk): publish `commit` and `/disclose` export path") records `0.0.34` in-tree but shipped as
**`0.0.35`** on npm. Cite the npm numbers, not the in-tree strings.

### 1. Breaking — deep `./dist/*` imports no longer resolve (`0.0.14` → `0.0.33`)

Before the `exports` map was encapsulated, consumers could reach into the compiled output by
path. Those paths are no longer resolvable; only the subpaths declared in `exports` are public.
Update any imports that reference `./dist/*` directly.

Before:

```ts
// ❌ no longer resolves — internal dist path, not a declared export
import { create } from "@lemmaoracle/sdk/dist/client.js";
import { sign } from "@lemmaoracle/sdk/dist/disclose.js";
```

After:

```ts
// ✅ declared subpaths from the `exports` map
import { create } from "@lemmaoracle/sdk/client";
import { sign } from "@lemmaoracle/sdk/disclose";
```

### 2. New public surface (`0.0.33` → `0.0.35`)

Two additions, both shipped in npm `0.0.35` (publish commit `9664e40`,
"feat(sdk): publish `commit` and `/disclose` export path"):

- **`commit`** is now a root export (`packages/sdk/src/index.ts` line 11). It was previously
  available only as the internal `commitNormalized` helper. Prefer the root import:

  ```ts
  import { commit } from "@lemmaoracle/sdk";
  ```

- **`./disclose`** subpath. The selective-disclosure helpers now have a stable subpath export.
  Members: `sign`, `reveal`, `verify`, `verifyProof`, `generateKeyPair`,
  `toSelectiveDisclosure`, `fromSelectiveDisclosure` (and, from `0.0.36`, `createProof` —
  see §3).

  ```ts
  import {
    sign,
    reveal,
    verify,
    verifyProof,
    generateKeyPair,
    toSelectiveDisclosure,
    fromSelectiveDisclosure,
  } from "@lemmaoracle/sdk/disclose";
  ```

### 3. `disclose.createProof` added (`0.0.35` → `0.0.36`)

A high-level `createProof` helper landed in npm `0.0.36` (commit `757fbae`,
"feat(sdk): add disclose.createProof high-level helper"):

```ts
import { createProof } from "@lemmaoracle/sdk/disclose";
```

> **Caveat — the README ran ahead of the implementation.** The `0.0.35` README already
> advertised `disclose.createProof`, but the helper was not implemented until `0.0.36`. If you
> are on `0.0.35` and hit `createProof is not a function`, **upgrade to `0.0.36`** — there is
> no runtime shim on `0.0.35`.

### 4. Diagnostics — network rejections now include `apiBase` + `apiKey` status (`0.0.36`+)

This is **not** an API break — only the *error message text* on `fetch()`-level rejections
changed (commit `8513d83`, "fix(sdk): enrich fetch network errors with apiBase + apiKey
status", #601). When `fetch()` itself rejects (network / DNS failure), the error now reads:

```text
fetch failed (apiBase: https://...; apiKey: set|unset)
```

Only the **status** of `apiKey` (`set` / `unset`) is surfaced — never the key value. Existing
HTTP-status error messages (e.g. `HTTP 404: ...`) propagate unchanged.

---

## Tracked, not yet done

- **`PrepareOutput` cleanup** (#587, item #3). The `PrepareOutput` type still carries
  internal/intermediate fields. Cleanup is a **type-level** change and is therefore a
  deliberate design decision; it has **not** been performed. Tracked for a future release.
  Until then, do not assume any field of `PrepareOutput` is stable public surface.

---

*Last reviewed against npm `0.0.36`.*
