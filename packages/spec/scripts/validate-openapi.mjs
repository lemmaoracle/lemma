// Validate openapi.lemma.v2.json:
//   1. redocly lint           — catches OpenAPI spec violations
//   2. $ref existence check    — catches broken local refs early
//   3. x-bazaar metadata check — catches malformed Bazaar entries
//
// Usage: pnpm --filter @lemmaoracle/spec validate:openapi
// Requires: @redocly/cli, ajv, ajv-formats (all in devDependencies).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const openapiPath = resolve(packageRoot, "openapi.lemma.v2.json");
const schemasDir = resolve(packageRoot, "schemas");

const fail = (msg) => {
  console.error(`  FAIL ${msg}`);
  process.exitCode = 1;
};

console.log(`Validating ${openapiPath}\n`);

// --- 1. redocly lint --------------------------------------------------------
try {
  execFileSync("npx", ["--no-install", "@redocly/cli", "lint", openapiPath], {
    stdio: "inherit",
  });
  console.log("  OK   redocly lint");
} catch {
  fail("redocly lint failed (see output above)");
}

// --- 2. $ref existence check ------------------------------------------------
const openapi = JSON.parse(readFileSync(openapiPath, "utf-8"));

const collectRefs = (node, refs = []) => {
  if (node === null || typeof node !== "object") return refs;
  if (typeof node.$ref === "string") refs.push(node.$ref);
  for (const value of Array.isArray(node) ? node : Object.values(node)) {
    collectRefs(value, refs);
  }
  return refs;
};

const refs = collectRefs(openapi);
const localRefs = refs.filter(
  (r) => r.startsWith("./schemas/") || r.startsWith("schemas/")
);
let refCheckOk = true;
for (const ref of localRefs) {
  const refPath = join(packageRoot, ref);
  if (!existsSync(refPath)) {
    fail(`$ref points at missing file: ${ref}`);
    refCheckOk = false;
  }
}
if (refCheckOk) {
  console.log(`  OK   $ref existence (${localRefs.length} local refs)`);
}

// --- 3. x-bazaar metadata schema check --------------------------------------
const ajv = new Ajv2020({
  strict: true,
  allErrors: true,
  allowUnionTypes: true,
});
addFormats(ajv);

const bazaarMetadataSchemaPath = resolve(
  schemasDir,
  "bazaar-extension-metadata.json"
);
if (!existsSync(bazaarMetadataSchemaPath)) {
  fail("schemas/bazaar-extension-metadata.json is missing — add it before merging");
} else {
  const metadataSchema = JSON.parse(readFileSync(bazaarMetadataSchemaPath, "utf-8"));
  const validate = ajv.compile(metadataSchema);

  let bazaarCount = 0;
  let bazaarFail = 0;

  const paths = openapi.paths ?? {};
  for (const [pathKey, ops] of Object.entries(paths)) {
    for (const [method, op] of Object.entries(ops)) {
      if (!op || typeof op !== "object") continue;
      const bazaar = op["x-bazaar"];
      if (!bazaar) continue;
      bazaarCount++;
      if (!validate(bazaar)) {
        fail(
          `${method.toUpperCase()} ${pathKey} — x-bazaar invalid: ${JSON.stringify(validate.errors)}`
        );
        bazaarFail++;
      }
    }
  }
  if (bazaarFail === 0) {
    console.log(`  OK   x-bazaar metadata (${bazaarCount} operations checked)`);
  }
}

if (process.exitCode === 1) {
  console.error("\nopenapi validation FAILED");
  process.exit(1);
} else {
  console.log("\nopenapi validation PASSED");
}
