// Dockerfile と lock の SHA-256。PCR manifest に残し、検証側が同じファイルを再ハッシュする。
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const BUILD_INPUT_FILES = ["Dockerfile", "package.json", "package-lock.json", "requirements.txt"];
export const BUILD_SCHEMA = "lemma-cauldron.build.v1";

export function hashBuildInputs(dir) {
  const inputs = {};
  for (const name of BUILD_INPUT_FILES) {
    inputs[name] = createHash("sha256").update(fs.readFileSync(path.join(dir, name))).digest("hex");
  }
  return inputs;
}

function main() {
  const dir = process.argv[2];
  const manifestPath = process.argv[3];
  if (!dir || !manifestPath) {
    process.stderr.write("usage: hash-build-inputs.mjs <enclave-dir> <pcrs.json>\n");
    process.exit(1);
  }
  const doc = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  doc.build = { schema: BUILD_SCHEMA, inputs: hashBuildInputs(dir) };
  fs.writeFileSync(manifestPath, `${JSON.stringify(doc, null, 2)}\n`);
}

const isMain = (() => {
  if (!process.argv[1]) return false;
  try { return import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href; }
  catch { return false; }
})();
if (isMain) main();
