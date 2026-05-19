// Bundle openapi.lemma.v2.json — inline all $refs into a single
// distribution-ready file.
//
// Output: packages/spec/openapi.lemma.v2.bundled.json (must be committed
//         so CI can detect drift via `git diff --exit-code`).
//
// Usage: pnpm --filter @lemmaoracle/spec bundle:openapi
// Requires: @redocly/cli (devDependency).
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const src = resolve(packageRoot, "openapi.lemma.v2.json");
const dest = resolve(packageRoot, "openapi.lemma.v2.bundled.json");

console.log(`Bundling ${src}`);
console.log(`     → ${dest}\n`);

try {
  execFileSync(
    "npx",
    [
      "--no-install",
      "@redocly/cli",
      "bundle",
      src,
      "-o",
      dest,
      // `--ext json` forces JSON output even though the source is .json.
      "--ext",
      "json",
    ],
    { stdio: "inherit" }
  );
  console.log("\nbundle openapi PASSED");
} catch {
  console.error("\nbundle openapi FAILED (see redocly output above)");
  process.exit(1);
}
