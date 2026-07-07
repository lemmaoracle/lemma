import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // @lemmaoracle/sdk's package `exports` resolve to dist/, which the
    // workspace CI test run does not build (dist is gitignored, produced only
    // by `pnpm build`). The unit test value-imports { create, toScalar } from
    // it, so resolve the bare specifier to source and let vitest transpile it —
    // hermetic, no build step. Safe because sdk's own suite already runs off
    // sdk/src, its @lemmaoracle/spec imports are all type-only (erased), and
    // the remaining runtime deps are installed. Exact-match regex so subpaths
    // aren't accidentally rewritten.
    alias: [
      {
        find: /^@lemmaoracle\/sdk$/,
        replacement: fileURLToPath(new URL("../sdk/src/index.ts", import.meta.url)),
      },
    ],
  },
  test: {
    globals: false,
  },
});
