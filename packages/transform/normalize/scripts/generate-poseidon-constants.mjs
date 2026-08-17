/**
 * Vendors circomlib Poseidon constants (t=2, t=3) from poseidon-lite into
 * src/poseidon_constants.rs so the Rust normalizer is bit-identical to the
 * JS `poseidon1`/`poseidon2` used by @lemmaoracle/content.
 *
 * Run from packages/transform:  node normalize/scripts/generate-poseidon-constants.mjs
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(
  path.join(
    fileURLToPath(new URL(".", import.meta.url)),
    "../../package.json",
  ),
);

const unstringify = (o) => {
  if (Array.isArray(o)) return o.map(unstringify);
  if (typeof o === "object") {
    const res = {};
    for (const [k, v] of Object.entries(o)) res[k] = unstringify(v);
    return res;
  }
  const bytes = Buffer.from(o, "base64");
  return BigInt("0x" + bytes.toString("hex"));
};

// `constants/*` is not an exported subpath — resolve the package root and
// load the CJS constants module by absolute path.
const pkgRoot = path.dirname(require.resolve("poseidon-lite"));
const load = (t) =>
  unstringify(require(path.join(pkgRoot, "constants", `${t - 1}.js`)).default);

const rustStrArray = (name, values) =>
  `pub const ${name}: [&str; ${values.length}] = [\n` +
  values.map((v) => `    "${v.toString()}",`).join("\n") +
  "\n];\n";

const rustMatrix = (name, m) =>
  `pub const ${name}: [[&str; ${m.length}]; ${m.length}] = [\n` +
  m
    .map((row) => `    [${row.map((v) => `"${v.toString()}"`).join(", ")}],`)
    .join("\n") +
  "\n];\n";

const t2 = load(2);
const t3 = load(3);

const header = `//! Circomlib Poseidon constants for BN254, t=2 and t=3.
//!
//! Vendored from poseidon-lite (identical to circomlib's
//! \`poseidon_constants.circom\`). Regenerate with:
//!   node normalize/scripts/generate-poseidon-constants.mjs
//! Do not edit by hand.

`;

const out =
  header +
  rustStrArray("C_T2", t2.C) +
  "\n" +
  rustMatrix("M_T2", t2.M) +
  "\n" +
  rustStrArray("C_T3", t3.C) +
  "\n" +
  rustMatrix("M_T3", t3.M);

const dest = path.join(
  fileURLToPath(new URL(".", import.meta.url)),
  "../src/poseidon_constants.rs",
);
fs.writeFileSync(dest, out);
console.log(
  `wrote ${dest}: C_T2=${t2.C.length} M_T2=${t2.M.length}x${t2.M[0].length} C_T3=${t3.C.length} M_T3=${t3.M.length}x${t3.M[0].length}`,
);
