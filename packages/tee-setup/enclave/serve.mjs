#!/usr/bin/env node
// enclave 内で動く処理。stdin で zkey_0000 を受け、enclave 内 CSPRNG の乱数で
// snarkjs zkey contribute を実行し、sha256(zkey_0000)||sha256(zkey_final) を nonce に
// NSM attestation doc を取得して返す。
//
// toxic waste（貢献乱数）はプロセス引数にしか載せない。失敗時の Error や stderr には
// 出さない（enclave console と SSH の stderr は親から読める）。

import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { commitmentNonceHex, readFrame, writeFrame } from "./frame.mjs";

export { commitmentNonceHex };

const redact = (text, secret) => {
  const s = String(text ?? "");
  if (!secret) return s;
  return s.split(secret).join("[redacted]");
};

const contribute = (entropy) => {
  // グローバルインストールの snarkjs を PATH から起動する。ヒープは zkey 全体を載せる。
  const child = spawnSync("snarkjs", [
    "zkey", "contribute", "/tmp/zkey_0000", "/tmp/zkey_final",
    "-n", "lemma-tee-setup", "-e", entropy,
  ], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=6144" },
  });
  if (child.error || child.status !== 0) {
    const stderr = redact(child.stderr, entropy);
    const stdout = redact(child.stdout, entropy);
    const spawnErr = redact(child.error?.message, entropy);
    throw new Error(
      `zkey contribute failed (status ${child.status}, signal ${child.signal}): ${spawnErr} ${stderr.slice(-1500)} ${stdout.slice(-500)}`,
    );
  }
};

const attest = (nonceHex) => {
  const child = spawnSync("python3", ["/app/attest.py", nonceHex], { stdio: ["ignore", "pipe", "pipe"] });
  if (child.error || child.status !== 0) {
    const stderr = Buffer.from(child.stderr ?? Buffer.alloc(0)).toString("utf8");
    throw new Error(`attestation failed (status ${child.status}): ${stderr.slice(-1500)}`);
  }
  return Buffer.from(child.stdout ?? Buffer.alloc(0));
};

const rmQuiet = (p) => { try { fs.rmSync(p, { force: true }); } catch { /* enclave 終了時に消える */ } };

const main = async () => {
  let entropy = "";
  try {
    const zkey0 = await readFrame(process.stdin);
    fs.writeFileSync("/tmp/zkey_0000", zkey0, { mode: 0o600 });
    entropy = randomBytes(32).toString("hex");
    contribute(entropy);
    const zkeyFinal = fs.readFileSync("/tmp/zkey_final");
    const nonce = commitmentNonceHex(zkey0, zkeyFinal);
    const doc = attest(nonce);
    process.stderr.write(`[serve] zkey_0000 ${zkey0.length} bytes, zkey_final ${zkeyFinal.length} bytes, attestation ${doc.length} bytes\n`);
    await writeFrame(process.stdout, zkeyFinal);
    await writeFrame(process.stdout, doc);
  } catch (e) {
    throw new Error(redact(e.message, entropy));
  } finally {
    entropy = "";
    rmQuiet("/tmp/zkey_0000");
    rmQuiet("/tmp/zkey_final");
  }
};

const isMain = (() => {
  if (!process.argv[1]) return false;
  try {
    return import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href;
  } catch {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  }
})();

if (isMain) {
  main()
    .then(() => process.exit(0))
    .catch((e) => { process.stderr.write(`${e.message || e}\n`); process.exit(1); });
}
