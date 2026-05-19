// Validate all Lemma Bazaar JSON Schemas under Draft 2020-12.
// Run: node scripts/validate-schemas.mjs  (or: pnpm validate:schemas)
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
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

const files = readdirSync(schemasDir).filter((f) => f.endsWith(".json"));
let pass = 0;
let fail = 0;
for (const file of files) {
  const path = join(schemasDir, file);
  const schema = JSON.parse(readFileSync(path, "utf-8"));
  try {
    ajv.compile(schema);
    console.log(`  OK   ${file}`);
    pass++;
  } catch (e) {
    console.log(`  FAIL ${file}: ${e.message}`);
    fail++;
  }
}
console.log(`\n${pass} passed, ${fail} failed (out of ${files.length})`);
process.exit(fail === 0 ? 0 : 1);
