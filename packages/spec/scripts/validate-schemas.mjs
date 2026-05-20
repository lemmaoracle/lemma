// Validate all Lemma Bazaar JSON Schemas under Draft 2020-12.
// Run: node scripts/validate-schemas.mjs  (or: pnpm validate:schemas)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemasDir = join(__dirname, "..", "schemas");

// allowUnionTypes is required because some schemas legitimately use
// union types like ["string", "number"] for fields that accept either form
// (e.g. range predicate values).
const ajv = new Ajv2020({ strict: true, allErrors: true, allowUnionTypes: true });
addFormats(ajv);

// Recursively collect .json files (skip _headers and other non-schema files)
function collectJsonFiles(dir, base = "") {
  let results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const relPath = base ? `${base}/${entry}` : entry;
    if (statSync(fullPath).isDirectory()) {
      results = results.concat(collectJsonFiles(fullPath, relPath));
    } else if (entry.endsWith(".json")) {
      results.push({ fullPath, relPath });
    }
  }
  return results;
}

const files = collectJsonFiles(schemasDir);
let pass = 0;
let fail = 0;
for (const { fullPath, relPath } of files) {
  const schema = JSON.parse(readFileSync(fullPath, "utf-8"));
  try {
    ajv.compile(schema);
    console.log(`  OK   ${relPath}`);
    pass++;
  } catch (e) {
    console.log(`  FAIL ${relPath}: ${e.message}`);
    fail++;
  }
}
console.log(`\n${pass} passed, ${fail} failed (out of ${files.length})`);
process.exit(fail === 0 ? 0 : 1);
