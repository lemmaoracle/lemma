#!/usr/bin/env node
// @lemmaoracle/tee-setup — Groth16 Phase 2 (zkey contribute) を AWS Nitro Enclaves 内で実行する TEE setup フロー
//
// ゼロ依存（Node 標準ライブラリのみ）。単一ファイルで完結し、cp して実行できる。
// 使い方: node tee-setup.mjs phase2 --r1cs <r1cs> --zkey-in <zkey_0000> --zkey-out <zkey_final>
//        node tee-setup.mjs verify --attestation <doc.cbor> --pcrs <pcrs.json> --nonce-hash <hex>
//        node tee-setup.mjs teardown --run-id <id>
//
// trust model の留保: AWS Nitro が信頼の中心点。検証はオフラインで完結し AWS API を呼ばない。

import { execFile } from "node:child_process";
import { createHash, createVerify, X509Certificate } from "node:crypto";
import fs from "node:fs";
import https from "node:https";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT_CERT = path.join(HERE, "..", "certs", "aws-nitro-root.pem");
const TAG_KEY = "lemma-tee-setup";

/* ============================================================
 * 小さな実行ユーティリティ
 * ============================================================ */

export const exec = (cmd, args, opts = {}) =>
  new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 1024 * 1024 * 64, ...opts }, (err, stdout, stderr) => {
      if (err) reject(new Error(`${cmd} ${args.join(" ")}\n${stderr || err.message}`));
      else resolve(stdout);
    });
  });

export const sha256Hex = (buf) => createHash("sha256").update(buf).digest("hex");

const log = (msg) => process.stderr.write(`[tee-setup] ${msg}\n`);

/* ============================================================
 * 引数
 * ============================================================ */

export function parseArgs(argv) {
  const [command, ...rest] = argv;
  const opts = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    if (i + 1 < rest.length && !rest[i + 1].startsWith("--")) opts[key] = rest[++i];
    else opts[key] = true;
  }
  return { command, opts };
}

/* ============================================================
 * ライフサイクル計画（dry-run と本実行で同じ手順を使う）
 * ============================================================ */

export function planLifecycle() {
  return [
    "provision: ami 解決 (SSM パラメータ)",
    "provision: keypair 作成",
    "provision: security group 作成 + ssh(22) を自 IP のみ許可",
    `provision: EC2 起動 (enclave 対応, タグ ${TAG_KEY}=<run-id>)`,
    "transfer: enclave バンドル + zkey_0000 を scp",
    "remote: docker ビルド → nitro-cli build-enclave → PCR manifest 保存",
    "remote: enclave 起動 → vsock 経由で zkey 送信 → contribute (enclave 内 CSPRNG)",
    "remote: attestation doc (nonce = sha256(zkey_0000)) 取得 → zkey_final と一括で返送",
    "collect: zkey_final + attestation doc + PCR manifest を回収",
    "verify: COSE_Sign1 署名 → 証明書チェーン → PCR0/1/2 → nonce をオフライン検証",
    "verify: snarkjs zkey verify（--skip-zkey-verify で省略可）",
    "teardown: instance 終了 → keypair / security group 削除（--keep-resources で残す）",
  ];
}

/* ============================================================
 * AWS 操作（aws CLI 経由・ローカルに AWS SDK を持たない）
 * ============================================================ */

export const aws = (args, opts = {}) => exec("aws", args, opts);

export async function resolveAmi(region) {
  const out = await aws([
    "ssm", "get-parameter",
    "--name", "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64",
    "--region", region, "--query", "Parameter.Value", "--output", "text",
  ]);
  return out.trim();
}

export async function fetchMyIp() {
  return new Promise((resolve, reject) => {
    https.get("https://checkip.amazonaws.com", (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data.trim()));
    }).on("error", reject);
  });
}

export function runId() {
  return `lts-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function provision({ region, instanceType, ami }) {
  const id = runId();
  const keyName = `lemma-tee-${id}`;
  const groupName = `lemma-tee-${id}`;
  const keyPath = path.join(os.tmpdir(), `${keyName}.pem`);
  const tags = `ResourceType=instance,Tags=[{Key=${TAG_KEY},Value=${id}},{Key=Name,Value=lemma-tee-setup}]`;

  log(`run-id ${id}: keypair 作成`);
  const kp = JSON.parse(await aws(["ec2", "create-key-pair", "--key-name", keyName, "--region", region]));
  fs.writeFileSync(keyPath, kp.KeyMaterial, { mode: 0o600 });

  log(`run-id ${id}: security group 作成`);
  const sg = JSON.parse(await aws(["ec2", "create-security-group", "--group-name", groupName,
    "--description", `lemma tee-setup ${id}`, "--region", region]));
  const myIp = await fetchMyIp();
  await aws(["ec2", "authorize-security-group-ingress", "--group-id", sg.GroupId,
    "--protocol", "tcp", "--port", "22", "--cidr", `${myIp}/32`, "--region", region]);

  log(`run-id ${id}: EC2 起動 (${instanceType}, ${ami})`);
  const run = JSON.parse(await aws(["ec2", "run-instances",
    "--image-id", ami, "--instance-type", instanceType,
    "--key-name", keyName, "--security-group-ids", sg.GroupId,
    "--enclave-options", "Enabled=true",
    "--tag-specifications", tags, "--region", region, "--output", "json"]));
  const instanceId = run.Instances[0].InstanceId;

  await aws(["ec2", "wait", "instance-running", "--instance-ids", instanceId, "--region", region]);
  const desc = JSON.parse(await aws(["ec2", "describe-instances", "--instance-ids", instanceId,
    "--region", region, "--query", "Reservations[0].Instances[0].PublicIpAddress", "--output", "json"]));
  const ip = String(desc).trim();
  log(`run-id ${id}: ${instanceId} @ ${ip}`);

  return { id, instanceId, ip, keyPath, keyName, sgId: sg.GroupId, region };
}

export async function teardownById({ id, instanceId, keyName, sgId, region }) {
  log(`teardown: ${id}`);
  if (instanceId) {
    await aws(["ec2", "terminate-instances", "--instance-ids", instanceId, "--region", region]).catch((e) => log(String(e.message)));
    await aws(["ec2", "wait", "instance-terminated", "--instance-ids", instanceId, "--region", region]).catch((e) => log(String(e.message)));
  }
  if (keyName) await aws(["ec2", "delete-key-pair", "--key-name", keyName, "--region", region]).catch((e) => log(String(e.message)));
  if (sgId) await aws(["ec2", "delete-security-group", "--group-id", sgId, "--region", region]).catch((e) => log(String(e.message)));
  if (instanceId || keyName || sgId) fs.rmSync(path.join(os.tmpdir(), `${keyName}.pem`), { force: true });
}

/** run-id タグから孤児リソースを探して消す（teardown コマンド用） */
export async function teardownByRunId(id, region) {
  const out = await aws(["ec2", "describe-instances", "--filters", `Name=tag:${TAG_KEY},Values=${id}`,
    "--region", region, "--query", "Reservations[].Instances[].InstanceId", "--output", "text"]);
  const ids = out.trim().split(/\s+/).filter(Boolean);
  for (const instanceId of ids) {
    await aws(["ec2", "terminate-instances", "--instance-ids", instanceId, "--region", region]);
    await aws(["ec2", "wait", "instance-terminated", "--instance-ids", instanceId, "--region", region]);
  }
  await aws(["ec2", "delete-key-pair", "--key-name", `lemma-tee-${id}`, "--region", region]).catch(() => {});
  const sg = await aws(["ec2", "describe-security-groups", "--filters", `Name=tag:${TAG_KEY},Values=${id}`,
    "--region", region, "--query", "SecurityGroups[].GroupId", "--output", "text"]).catch(() => "");
  for (const sgId of sg.trim().split(/\s+/).filter(Boolean)) {
    await aws(["ec2", "delete-security-group", "--group-id", sgId, "--region", region]).catch(() => {});
  }
  return { terminated: ids };
}

/* ============================================================
 * attestation 検証（オフライン・CBOR/COSE_Sign1 の最小型）
 * ============================================================ */

// --- 最小 CBOR デコーダ（必要な型のみ） ---
export function cborDecode(buf, offset = 0) {
  const ib = buf[offset++];
  const major = ib >> 5;
  let len = ib & 0x1f;
  if (len === 24) len = buf.readUInt8(offset), offset += 1;
  else if (len === 25) len = buf.readUInt16BE(offset), offset += 2;
  else if (len === 26) len = buf.readUInt32BE(offset), offset += 4;
  else if (len === 27) { len = Number(buf.readBigUInt64BE(offset)); offset += 8; }
  if (major === 0) return [len, offset];
  if (major === 1) return [-1 - len, offset];
  if (major === 2) return [buf.subarray(offset, offset + len), offset + len];
  if (major === 3) return [buf.subarray(offset, offset + len).toString("utf8"), offset + len];
  if (major === 4) {
    const arr = [];
    for (let i = 0; i < len; i++) { const [v, o] = cborDecode(buf, offset); arr.push(v); offset = o; }
    return [arr, offset];
  }
  if (major === 5) {
    const map = new Map();
    for (let i = 0; i < len; i++) {
      const [k, o1] = cborDecode(buf, offset);
      const [v, o2] = cborDecode(buf, o1);
      map.set(k, v); offset = o2;
    }
    return [map, offset];
  }
  if (major === 7) {
    if (len === 20) return [false, offset];
    if (len === 21) return [true, offset];
    if (len === 22) return [null, offset];
    throw new Error(`unsupported simple ${len}`);
  }
  throw new Error(`unsupported major ${major}`);
}

// --- 最小 CBOR エンコーダ（Sig_structure の組み立てに使用） ---
export function cborEncode(value) {
  const parts = [];
  const pushHead = (major, len) => {
    if (len < 24) parts.push(Buffer.from([(major << 5) | len]));
    else if (len < 256) parts.push(Buffer.from([(major << 5) | 24, len]));
    else if (len < 65536) { const b = Buffer.alloc(3); b[0] = (major << 5) | 25; b.writeUInt16BE(len, 1); parts.push(b); }
    else if (len < 4294967296) { const b = Buffer.alloc(5); b[0] = (major << 5) | 26; b.writeUInt32BE(len, 1); parts.push(b); }
    else { const b = Buffer.alloc(9); b[0] = (major << 5) | 27; b.writeBigUInt64BE(BigInt(len), 1); parts.push(b); }
  };
  const enc = (v) => {
    if (typeof v === "number" || typeof v === "bigint") {
      const n = BigInt(v);
      if (n >= 0n) pushHead(0, Number(n)); else pushHead(1, Number(-n - 1n));
    } else if (typeof v === "string") {
      const b = Buffer.from(v, "utf8"); pushHead(3, b.length); parts.push(b);
    } else if (Buffer.isBuffer(v) || v instanceof Uint8Array) {
      pushHead(2, v.length); parts.push(Buffer.from(v));
    } else if (Array.isArray(v)) {
      pushHead(4, v.length); v.forEach(enc);
    } else if (v instanceof Map) {
      pushHead(5, v.size); for (const [k, val] of v) { enc(k); enc(val); }
    } else throw new Error(`cannot encode ${typeof v}`);
  };
  enc(value);
  return Buffer.concat(parts);
}

const derToPem = (der) =>
  `-----BEGIN CERTIFICATE-----\n${der.toString("base64").replace(/(.{64})/g, "$1\n")}\n-----END CERTIFICATE-----\n`;

/** 証明書チェーン（leaf → … → root）の署名・期限・発行関係を確認 */
export function verifyChain(leafDer, bundleDers, rootPem, now = Date.now()) {
  const leaf = new X509Certificate(leafDer);
  const chain = [leaf, ...bundleDers.map((d) => new X509Certificate(d))];
  const root = new X509Certificate(rootPem);
  const notBefore = (c) => Date.parse(c.validFrom);
  const notAfter = (c) => Date.parse(c.validTo);
  for (const c of [...chain, root]) {
    if (now < notBefore(c) || now > notAfter(c)) return { ok: false, reason: "cert expired or not yet valid" };
  }
  for (let i = 0; i < chain.length - 1; i++) {
    const child = chain[i]; const parent = chain[i + 1];
    if (!child.checkIssued(parent) || !child.verify(parent.publicKey))
      return { ok: false, reason: `chain broken at ${child.subject}` };
  }
  const last = chain[chain.length - 1];
  if (!last.checkIssued(root) || !last.verify(root.publicKey))
    return { ok: false, reason: `cabundle does not chain to pinned root (${last.subject})` };
  return { ok: true, leafSubject: leaf.subject, leafFingerprint: leaf.fingerprint256 };
}

/**
 * Nitro attestation doc (COSE_Sign1) をオフライン検証する。
 * 検証に AWS API は一切呼ばない（ルート証明書は同梱の PEM を使う）。
 */
export function verifyAttestation(coseBuf, { rootCertPem, now = Date.now() } = {}) {
  const rootPem = rootCertPem ?? fs.readFileSync(DEFAULT_ROOT_CERT, "utf8");
  const [head, off1] = cborDecode(coseBuf);
  if (!Array.isArray(head) || head.length !== 4) return { ok: false, reason: "not COSE_Sign1" };
  const [protectedBstr, unprotected, payloadBstr, signature] = head;
  if (off1 !== coseBuf.length) return { ok: false, reason: "trailing bytes" };

  // 保護ヘッダ: {1: alg, 4: kid}。alg = -7 (ES384) を想定
  const [protectedMap] = cborDecode(protectedBstr);
  const alg = protectedMap.get(1);
  if (alg !== -7) return { ok: false, reason: `unsupported alg ${alg}` };

  // 非保護ヘッダ: 34=leaf 証明書(DER), 33=cabundle(DER の配列)
  const leafDer = unprotected.get(34);
  const bundleDers = unprotected.get(33) ?? [];
  if (!Buffer.isBuffer(leafDer)) return { ok: false, reason: "leaf certificate missing" };

  // Sig_structure = ["Signature1", protected, external_aad, payload]
  const sigStructure = cborEncode(["Signature1", protectedBstr, Buffer.alloc(0), payloadBstr]);
  const verifier = createVerify("SHA384");
  verifier.update(sigStructure);
  const leaf = new X509Certificate(leafDer);
  const sigOk = verifier.verify({ key: leaf.publicKey, dsaEncoding: "der" }, signature);
  if (!sigOk) return { ok: false, reason: "COSE signature invalid" };

  const chain = verifyChain(leafDer, bundleDers, rootPem, now);
  if (!chain.ok) return chain;

  const [doc] = cborDecode(payloadBstr);
  return {
    ok: true,
    digest: doc.get("digest"),
    timestamp: doc.get("timestamp"),
    module_id: doc.get("module_id"),
    pcrs: Object.fromEntries([...(doc.get("pcrs") ?? new Map())].map(([k, v]) => [String(k), Buffer.from(v).toString("hex")])),
    nonce: Buffer.from(doc.get("nonce") ?? Buffer.alloc(0)).toString("hex"),
    leafSubject: chain.leafSubject,
    leafFingerprint: chain.leafFingerprint,
  };
}

/** PCR0/1/2 を期待 manifest と照合（PCR0 のみだと入れ子イメージの差を検知できない） */
export function pcrsMatch(expected, actual) {
  const diffs = [];
  for (const k of ["0", "1", "2"]) {
    const e = String(expected[k] ?? "").toLowerCase();
    const a = String(actual[k] ?? "").toLowerCase();
    if (!e || !a || e !== a) diffs.push({ pcr: k, expected: e || "(missing)", actual: a || "(missing)" });
  }
  return diffs.length === 0 ? { ok: true } : { ok: false, diffs };
}

/** ローカル検証の一括実行 */
export function verifyBundle({ attestationPath, pcrsPath, nonceHash, rootCertPem, zkeyIn }) {
  const coseBuf = fs.readFileSync(attestationPath);
  const expected = JSON.parse(fs.readFileSync(pcrsPath, "utf8"));
  const att = verifyAttestation(coseBuf, { rootCertPem });
  if (!att.ok) return att;
  const pcr = pcrsMatch(expected, att.pcrs);
  if (!pcr.ok) return { ok: false, reason: "PCR mismatch", ...pcr };
  const want = String(nonceHash ?? (zkeyIn ? sha256Hex(fs.readFileSync(zkeyIn)) : "")).toLowerCase();
  if (want && att.nonce !== want) return { ok: false, reason: `nonce mismatch: doc=${att.nonce} want=${want}` };
  return { ok: true, pcrs: att.pcrs, nonce: att.nonce, leafSubject: att.leafSubject };
}

/* ============================================================
 * phase2 — provision → run → verify → teardown
 * ============================================================ */

export async function phase2(opts) {
  const region = opts.region ?? "us-east-1";
  const instanceType = opts["instance-type"] ?? "t3.xlarge"; // seal(222k gate) の contribute に 8GB enclave + 親を収める
  const r1cs = opts.r1cs, zkeyIn = opts["zkey-in"], zkeyOut = opts["zkey-out"];
  if (!r1cs || !zkeyIn || !zkeyOut) throw new Error("--r1cs / --zkey-in / --zkey-out が必要");

  if (opts["dry-run"]) {
    const steps = planLifecycle();
    steps.forEach((s, i) => log(`${i + 1}. ${s}`));
    return { dryRun: true, steps };
  }

  const ami = opts.ami ?? (await resolveAmi(region));
  let res = null;
  try {
    res = await provision({ region, instanceType, ami });
    const sshBase = ["-i", res.keyPath, "-o", "StrictHostKeyChecking=accept-new", "-o", "ConnectTimeout=10"];
    const host = `ec2-user@${res.ip}`;
    const remoteDir = "/home/ec2-user/tee-setup";

    log("scp: enclave バンドル + zkey を転送");
    await exec("ssh", [...sshBase, host, "mkdir -p " + remoteDir]);
    await exec("scp", [...sshBase, "-r", path.join(HERE, "..", "enclave"), `${host}:${remoteDir}/`]);
    await exec("scp", [...sshBase, zkeyIn, `${host}:${remoteDir}/zkey_0000`]);

    log("remote: setup-and-run（EIF ビルド → enclave 内 contribute → 回収）");
    await exec("ssh", [...sshBase, host, `cd ${remoteDir} && sudo bash enclave/setup-and-run.sh`], { timeout: 3600_000 });

    log("collect: 結果を回収");
    await exec("scp", [...sshBase, `${host}:${remoteDir}/out/zkey_final`, zkeyOut]);
    await exec("scp", [...sshBase, `${host}:${remoteDir}/out/attestation.cbor`, `${zkeyOut}.attestation.cbor`]);
    await exec("scp", [...sshBase, `${host}:${remoteDir}/out/pcrs.json`, `${zkeyOut}.pcrs.json`]);

    log("verify: attestation（オフライン）");
    const nonceHash = sha256Hex(fs.readFileSync(zkeyIn));
    const v = verifyBundle({
      attestationPath: `${zkeyOut}.attestation.cbor`,
      pcrsPath: `${zkeyOut}.pcrs.json`,
      nonceHash,
      rootCertPem: opts["root-cert"] ? fs.readFileSync(opts["root-cert"], "utf8") : undefined,
    });
    if (!v.ok) throw new Error(`attestation 検証失敗: ${JSON.stringify(v)}`);
    log(`attestation OK: ${v.leafSubject}`);

    if (!opts["skip-zkey-verify"] && opts.ptau) {
      log("verify: snarkjs zkey verify");
      await exec("npx", ["snarkjs", "zkey", "verify", r1cs, opts.ptau, zkeyOut], { timeout: 3600_000 });
    }
    return { ok: true, zkeyOut, attestation: `${zkeyOut}.attestation.cbor`, pcrs: `${zkeyOut}.pcrs.json` };
  } finally {
    if (res && !opts["keep-resources"]) await teardownById(res);
    else if (res) log(`--keep-resources: ${res.instanceId} を残しました。teardown --run-id ${res.id} で消せます`);
  }
}

/* ============================================================
 * CLI
 * ============================================================ */

async function main() {
  const { command, opts } = parseArgs(process.argv.slice(2));
  if (command === "phase2") {
    await phase2(opts);
  } else if (command === "verify") {
    const v = verifyBundle({
      attestationPath: opts.attestation,
      pcrsPath: opts.pcrs,
      nonceHash: opts["nonce-hash"],
      zkeyIn: opts["zkey-in"],
      rootCertPem: opts["root-cert"] ? fs.readFileSync(opts["root-cert"], "utf8") : undefined,
    });
    if (!v.ok) { log(JSON.stringify(v, null, 2)); process.exit(1); }
    process.stdout.write(JSON.stringify(v, null, 2) + "\n");
  } else if (command === "teardown") {
    const out = await teardownByRunId(opts["run-id"], opts.region ?? "us-east-1");
    process.stdout.write(JSON.stringify(out) + "\n");
  } else {
    process.stderr.write("usage: tee-setup phase2|verify|teardown [options]\n");
    process.exit(1);
  }
}

// npm global install 経由だと argv[1] が bin のシンボリックリンクになるため realpath で照合する
const isMain = (() => {
  if (!process.argv[1]) return false;
  try {
    return import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href;
  } catch {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  }
})();
if (isMain) {
  main().catch((e) => { log(String(e.message ?? e)); process.exit(1); });
}
