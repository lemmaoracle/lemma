import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Scope to this package's own TS tests. The nested `circuits/` directory
    // is a standalone, workspace-external package (own package-lock.json +
    // snarkjs/circom toolchain) whose proof test needs compiled artifacts that
    // the root pnpm install doesn't produce — so `pnpm -r test` must not pick
    // it up. Run circuit tests standalone: `cd circuits && npm ci && npm test`.
    // (Mirrors the include-scoped convention in seal / agent / mcp / sdk.)
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
