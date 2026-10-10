#!/usr/bin/env node
// enclave 内で動く処理。stdin で zkey_0000 を受け、enclave 内 CSPRNG の乱数で
// snarkjs zkey contribute を実行し、入力 zkey の SHA-256 を nonce に
// NSM attestation doc を取得して返す。toxic waste（乱数）は enclave 外に出ない。

import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs";

const frame = (buf) => {
  const h = Buffer.alloc(4);
  h.writeUInt32BE(buf.length);
  return Buffer.concat([h, buf]);
};

const readFrame = () =>
  new Promise((resolve, reject) => {
    let state = "len"; let need = 4; let chunks = []; let got = 0;
    const onData = (c) => {
      chunks.push(c); got += c.length;
      if (got < need) return;
      const buf = Buffer.concat(chunks); chunks = []; got = 0;
      if (state === "len") {
        need = buf.readUInt32BE(0); state = "body";
        if (need === 0) { cleanup(); resolve(Buffer.alloc(0)); }
      } else { cleanup(); resolve(buf.subarray(0, need)); }
    };
    const cleanup = () => process.stdin.off("data", onData);
    process.stdin.on("data", onData);
    process.stdin.on("error", (e) => { cleanup(); reject(e); });
    process.stdin.on("end", () => { cleanup(); reject(new Error("stdin ended")); });
  });

const main = async () => {
  const zkey0 = await readFrame();
  const nonce = createHash("sha256").update(zkey0).digest("hex");
  process.stderr.write(`[serve] zkey_0000 ${zkey0.length} bytes, nonce=${nonce}\n`);

  fs.writeFileSync("/tmp/zkey_0000", zkey0);
  const entropy = randomBytes(32).toString("hex"); // enclave 内 CSPRNG
  execFileSync("node", [
    "/usr/local/lib/node_modules/snarkjs/build/cli.cjs",
    "zkey", "contribute", "/tmp/zkey_0000", "/tmp/zkey_final",
    "-n", "lemma-tee-setup", "-e", entropy,
  ], { stdio: ["ignore", "ignore", "inherit"] });

  // toxic waste の消去（enclave 破棄で物理的に消えるが、念のため上書き削除）
  fs.rmSync("/tmp/zkey_0000", { force: true });

  const zkeyFinal = fs.readFileSync("/tmp/zkey_final");
  const attestation = execFileSync("python3", ["/app/attest.py", nonce]);
  process.stderr.write(`[serve] zkey_final ${zkeyFinal.length} bytes, attestation ${attestation.length} bytes\n`);
  process.stdout.write(frame(zkeyFinal));
  process.stdout.write(frame(attestation));
  process.exit(0);
};

main().catch((e) => { process.stderr.write(String(e) + "\n"); process.exit(1); });
