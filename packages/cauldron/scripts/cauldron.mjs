#!/usr/bin/env node
// @lemmaoracle/cauldron — Groth16 Phase 2 (zkey contribute) を AWS Nitro Enclaves 内で実行する TEE setup フロー
//
// ゼロ依存（Node 標準ライブラリのみ）。単一ファイルで完結し、cp して実行できる。
// 使い方: node cauldron.mjs phase2 --r1cs <r1cs> --zkey-in <zkey_0000> --zkey-out <zkey_final>
//        node cauldron.mjs verify --attestation <doc.cbor> --pcrs <pcrs.json> --zkey-in <in> --zkey-out <out>
//        node cauldron.mjs teardown --run-id <id>
//
// trust model の留保: AWS Nitro が信頼の中心点。検証はオフラインで完結し AWS API を呼ばない。
// nonce は sha256(zkey_0000)||sha256(zkey_final)。入力だけだと親が出力 zkey をすり替えられる。

import { execFile } from "node:child_process";
import { createHash, createVerify, randomBytes, X509Certificate } from "node:crypto";
import fs from "node:fs";
import https from "node:https";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT_CERT = path.join(HERE, "..", "certs", "aws-nitro-root.pem");
const TAG_KEY = "lemma-cauldron";
// AWS Nitro Enclaves Root-G1。certs/aws-nitro-root.pem と README の指紋と同じ。
export const PINNED_ROOT_FINGERPRINT =
  "64:1A:03:21:A3:E2:44:EF:E4:56:46:31:95:D6:06:31:7E:D7:CD:CC:3C:17:56:E0:98:93:F3:C6:8F:79:BB:5B";
const COSE_ALG_ES384 = -35;
const ES384_SIG_BYTES = 96;
const PHASE2_TIMEOUT_MS = 10 * 60 * 60 * 1000;
export const ATTESTATION_MAX_SKEW_MS = 15 * 60 * 1000;
export const ENCLAVE_MEMORY_LIMIT_BYTES = 8192 * 1024 * 1024;
const MEMORY_ZKEY_FACTOR = 16;
const MEMORY_HEADROOM_BYTES = 512 * 1024 * 1024;
export const BUILD_INPUT_FILES = ["Dockerfile", "package.json", "package-lock.json", "requirements.txt"];
const EKU_SERVER_AUTH = "1.3.6.1.5.5.7.3.1";
const EKU_CLIENT_AUTH = "1.3.6.1.5.5.7.3.2";
const TLS_EKU = new Set([EKU_SERVER_AUTH, EKU_CLIENT_AUTH]);
const OID_KEY_USAGE = "2.5.29.15";
const OID_EXT_KEY_USAGE = "2.5.29.37";
const OID_NAME_CONSTRAINTS = "2.5.29.30";
const OID_SUBJECT_ALT_NAME = "2.5.29.17";
const KU_NAMES = ["digitalSignature", "nonRepudiation", "keyEncipherment", "dataEncipherment", "keyAgreement", "keyCertSign", "cRLSign", "encipherOnly", "decipherOnly"];
const DN_ATTR = { "2.5.4.6": "C", "2.5.4.10": "O", "2.5.4.11": "OU", "2.5.4.3": "CN", "2.5.4.7": "L", "2.5.4.8": "ST" };
const SCP_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const RUN_ID_RE = /^lts-[0-9a-z]+-[0-9a-z]+$/;

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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function retry(label, fn, tries, delayMs) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      log(`${label} 失敗 (${i + 1}/${tries}): ${String(e.message ?? e).split("\n")[0]}`);
      if (i + 1 < tries) await delay(delayMs);
    }
  }
  throw last;
}

export const sha256Hex = (buf) => createHash("sha256").update(buf).digest("hex");

/** 大きい zkey をまとめて読まずに SHA-256 する。 */
export function sha256FileHex(filePath) {
  const hash = createHash("sha256");
  const fd = fs.openSync(filePath, "r");
  try {
    const buf = Buffer.alloc(1024 * 1024);
    let n = 0;
    while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) hash.update(buf.subarray(0, n));
  } finally {
    fs.closeSync(fd);
  }
  return hash.digest("hex");
}

/** nonce = sha256(zkey_in) || sha256(zkey_out)。enclave/frame.mjs の commitmentNonceHex と同じ。 */
export function commitmentNonceHex(zkeyIn, zkeyOut) {
  return sha256Hex(zkeyIn) + sha256Hex(zkeyOut);
}

export function commitmentNonceHexFromFiles(zkeyIn, zkeyOut) {
  return sha256FileHex(zkeyIn) + sha256FileHex(zkeyOut);
}

/** snarkjs は旧 zkey・新 zkey・作業コピーを同時に持つ。16 倍 + 512MiB は実測前の上限見積もり。 */
export function estimateContributeMemory(zkeyBytes) {
  const bytes = zkeyBytes * MEMORY_ZKEY_FACTOR + MEMORY_HEADROOM_BYTES;
  return { bytes, limitBytes: ENCLAVE_MEMORY_LIMIT_BYTES, exceeds: bytes > ENCLAVE_MEMORY_LIMIT_BYTES };
}

export function warnIfZkeyTooLarge(zkeyPath) {
  let size = 0;
  try { size = fs.statSync(zkeyPath).size; } catch { return; }
  const est = estimateContributeMemory(size);
  if (!est.exceeds) return;
  log(`警告: zkey ${size} bytes の見積もり使用メモリ ${est.bytes} bytes が enclave 上限 ${est.limitBytes} bytes を超えます。ENCLAVE_MEMORY_MB の引き上げを検討してください（650MB 級は実機未計測）。`);
}

export function hashBuildInputs(dir) {
  const inputs = {};
  for (const name of BUILD_INPUT_FILES) {
    inputs[name] = sha256Hex(fs.readFileSync(path.join(dir, name)));
  }
  return inputs;
}

export function verifyBuildInputs(inputs, dir) {
  const diffs = [];
  for (const [name, expected] of Object.entries(inputs ?? {})) {
    let actual = "(missing)";
    try { actual = sha256Hex(fs.readFileSync(path.join(dir, name))); } catch { /* missing file */ }
    if (actual !== String(expected).toLowerCase()) diffs.push({ file: name, expected, actual });
  }
  return diffs.length === 0 ? { ok: true } : { ok: false, reason: "build input hash mismatch", diffs };
}

export function goldenPcrsFrom(doc) {
  if (!doc || typeof doc !== "object") return { measured: false, reason: "golden PCR manifest is not an object" };
  if (doc.measured === false) return { measured: false, reason: "golden PCRs have not been measured" };
  const pcrs = doc.pcrs ?? doc;
  const sample = pcrs[0] ?? pcrs["0"];
  if (sample == null || sample === "") return { measured: false, reason: "golden PCRs have not been measured" };
  return { measured: true, pcrs };
}

const log = (msg) => process.stderr.write(`[cauldron] ${msg}\n`);

export function isIpv4(value) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(value ?? "");
  return Boolean(m) && m.slice(1).every((n) => Number(n) <= 255);
}

export function assertRunId(id) {
  if (!RUN_ID_RE.test(id ?? "")) throw new Error(`invalid run-id: ${id}`);
  return id;
}

function shred(filePath) {
  try {
    const fd = fs.openSync(filePath, fs.constants.O_RDWR | fs.constants.O_NOFOLLOW);
    try {
      const st = fs.fstatSync(fd);
      if (st.size > 0) {
        fs.writeSync(fd, Buffer.alloc(st.size), 0, st.size, 0);
        fs.fsyncSync(fd);
      }
    } finally {
      fs.closeSync(fd);
    }
  } catch { /* missing, or a symlink we refuse to follow */ }
  fs.rmSync(filePath, { force: true });
}

function moveFile(src, dest) {
  fs.mkdirSync(path.dirname(path.resolve(dest)), { recursive: true });
  try {
    fs.renameSync(src, dest);
  } catch (e) {
    if (e.code !== "EXDEV") throw e;
    fs.copyFileSync(src, dest);
    fs.rmSync(src, { force: true });
  }
}

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
    "remote: attestation doc (nonce = sha256(zkey_0000)||sha256(zkey_final)) 取得 → zkey_final と一括で返送",
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
  const ip = await new Promise((resolve, reject) => {
    let settled = false;
    const fail = (err) => { if (!settled) { settled = true; reject(err); } };
    const ok = (value) => { if (!settled) { settled = true; resolve(value); } };
    const req = https.get("https://checkip.amazonaws.com", (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        fail(new Error(`checkip status ${res.statusCode}`));
        return;
      }
      let data = "";
      res.on("data", (c) => {
        data += c;
        if (data.length > 64) {
          req.destroy();
          fail(new Error("checkip response too long"));
        }
      });
      res.on("end", () => ok(data.trim()));
    });
    req.setTimeout(10_000, () => req.destroy(new Error("checkip timeout")));
    req.on("error", fail);
  });
  if (!isIpv4(ip)) throw new Error("checkip did not return an IPv4 address");
  return ip;
}

export function runId() {
  return `lts-${Date.now().toString(36)}-${randomBytes(4).toString("hex")}`;
}

function idsFromText(out) {
  return String(out ?? "").trim().split(/\s+/).filter((x) => x && x !== "None");
}

export async function provision({ region, instanceType, ami, keepResources = false }) {
  const id = runId();
  const keyName = `lemma-tee-${id}`;
  const groupName = `lemma-tee-${id}`;
  const keyPath = path.join(os.tmpdir(), `${keyName}.pem`);
  const knownHosts = path.join(os.tmpdir(), `${keyName}.known_hosts`);
  const state = { id, instanceId: undefined, ip: undefined, keyPath: undefined, knownHosts, keyName, sgId: undefined, region };
  const instanceTags = `ResourceType=instance,Tags=[{Key=${TAG_KEY},Value=${id}},{Key=Name,Value=lemma-cauldron}]`;
  const sgTags = `ResourceType=security-group,Tags=[{Key=${TAG_KEY},Value=${id}},{Key=Name,Value=lemma-cauldron}]`;
  let createdKey = false;
  try {
    log(`run-id ${id}: keypair 作成`);
    const kp = JSON.parse(await aws([
      "ec2", "create-key-pair", "--key-name", keyName, "--region", region, "--output", "json",
    ]));
    if (!kp.KeyMaterial) throw new Error("create-key-pair returned no KeyMaterial");
    createdKey = true;
    const fd = fs.openSync(keyPath, "wx", 0o600);
    state.keyPath = keyPath;
    try { fs.writeFileSync(fd, kp.KeyMaterial); } finally { fs.closeSync(fd); }

    log(`run-id ${id}: security group 作成`);
    const sg = JSON.parse(await aws([
      "ec2", "create-security-group", "--group-name", groupName,
      "--description", `lemma cauldron ${id}`, "--tag-specifications", sgTags,
      "--region", region, "--output", "json",
    ]));
    state.sgId = sg.GroupId;
    const myIp = await fetchMyIp();
    await aws(["ec2", "authorize-security-group-ingress", "--group-id", sg.GroupId,
      "--protocol", "tcp", "--port", "22", "--cidr", `${myIp}/32`, "--region", region]);

    log(`run-id ${id}: EC2 起動 (${instanceType}, ${ami})`);
    const run = JSON.parse(await aws(["ec2", "run-instances",
      "--image-id", ami, "--instance-type", instanceType,
      "--key-name", keyName, "--security-group-ids", sg.GroupId,
      "--enclave-options", "Enabled=true",
      "--metadata-options", "HttpEndpoint=disabled",
      "--tag-specifications", instanceTags, "--region", region, "--output", "json"]));
    state.instanceId = run.Instances[0].InstanceId;

    await aws(["ec2", "wait", "instance-running", "--instance-ids", state.instanceId, "--region", region]);
    const desc = JSON.parse(await aws(["ec2", "describe-instances", "--instance-ids", state.instanceId,
      "--region", region, "--query", "Reservations[0].Instances[0].PublicIpAddress", "--output", "json"]));
    const ip = String(desc ?? "").trim();
    if (!isIpv4(ip)) throw new Error(`instance ${state.instanceId} has no public IPv4`);
    state.ip = ip;
    log(`run-id ${id}: ${state.instanceId} @ ${ip}`);
    return state;
  } catch (e) {
    if (!keepResources && (createdKey || state.sgId || state.instanceId)) {
      await teardownById(state).catch((te) => log(String(te.message ?? te)));
    } else if (keepResources) {
      log(`--keep-resources: partial run ${id} を残しました`);
    }
    throw e;
  }
}

/** terminate 後に ENI が残ると DependencyViolation になる。外れるまで待ってから SG を消す。 */
export async function deleteSecurityGroupWithRetry({
  sgId, instanceId, region, attempts = 12, delayMs = 10_000, awsImpl = aws, sleep = delay,
}) {
  let last = new Error(`failed to delete security group ${sgId}`);
  for (let i = 0; i < attempts; i++) {
    const out = await awsImpl([
      "ec2", "describe-network-interfaces",
      "--filters", `Name=group-id,Values=${sgId}`,
      "--region", region, "--query", "NetworkInterfaces[].NetworkInterfaceId", "--output", "text",
    ]).catch(() => "");
    if (idsFromText(out).length) {
      last = new Error(`ENI still attached to ${instanceId ?? sgId}`);
      if (i + 1 === attempts) throw last;
      await sleep(delayMs);
      continue;
    }
    try {
      await awsImpl(["ec2", "delete-security-group", "--group-id", sgId, "--region", region]);
      return { ok: true, attempts: i + 1 };
    } catch (e) {
      const msg = String(e.message ?? e);
      if (/InvalidGroup\.NotFound|does not exist/i.test(msg)) return { ok: true, attempts: i + 1 };
      last = e;
      if (!/DependencyViolation|dependent object/i.test(msg) || i + 1 === attempts) throw e;
      await sleep(delayMs);
    }
  }
  throw last;
}

export async function teardownById({ id, instanceId, keyName, sgId, region, keyPath, knownHosts }) {
  log(`teardown: ${id ?? "(unknown)"}`);
  if (instanceId) {
    await aws(["ec2", "terminate-instances", "--instance-ids", instanceId, "--region", region]).catch((e) => log(String(e.message)));
    await aws(["ec2", "wait", "instance-terminated", "--instance-ids", instanceId, "--region", region]).catch((e) => log(String(e.message)));
  }
  if (keyName) await aws(["ec2", "delete-key-pair", "--key-name", keyName, "--region", region]).catch((e) => log(String(e.message)));
  if (sgId) {
    await deleteSecurityGroupWithRetry({ sgId, instanceId, region }).catch((e) => log(String(e.message)));
  }
  const pem = keyPath ?? (keyName ? path.join(os.tmpdir(), `${keyName}.pem`) : null);
  if (pem) shred(pem);
  if (knownHosts) fs.rmSync(knownHosts, { force: true });
  else if (keyName) fs.rmSync(path.join(os.tmpdir(), `${keyName}.known_hosts`), { force: true });
}

/** run-id タグと名前から孤児リソースを探して消す（teardown コマンド用） */
export async function teardownByRunId(id, region) {
  assertRunId(id);
  const out = await aws(["ec2", "describe-instances",
    "--filters", `Name=tag:${TAG_KEY},Values=${id}`,
    "Name=instance-state-name,Values=pending,running,stopping,stopped",
    "--region", region, "--query", "Reservations[].Instances[].InstanceId", "--output", "text"]);
  const ids = idsFromText(out);
  for (const instanceId of ids) {
    await aws(["ec2", "terminate-instances", "--instance-ids", instanceId, "--region", region]).catch((e) => log(String(e.message)));
    await aws(["ec2", "wait", "instance-terminated", "--instance-ids", instanceId, "--region", region]).catch((e) => log(String(e.message)));
  }
  await aws(["ec2", "delete-key-pair", "--key-name", `lemma-tee-${id}`, "--region", region]).catch(() => {});
  const sgIds = new Set();
  for (const filter of [`Name=group-name,Values=lemma-tee-${id}`, `Name=tag:${TAG_KEY},Values=${id}`]) {
    const sg = await aws(["ec2", "describe-security-groups", "--filters", filter,
      "--region", region, "--query", "SecurityGroups[].GroupId", "--output", "text"]).catch(() => "");
    for (const sgId of idsFromText(sg)) sgIds.add(sgId);
  }
  for (const sgId of sgIds) {
    await deleteSecurityGroupWithRetry({ sgId, region }).catch((e) => log(String(e.message)));
  }
  shred(path.join(os.tmpdir(), `lemma-tee-${id}.pem`));
  fs.rmSync(path.join(os.tmpdir(), `lemma-tee-${id}.known_hosts`), { force: true });
  return { terminated: ids };
}

/* ============================================================
 * attestation 検証（オフライン・CBOR/COSE_Sign1 の最小型）
 * ============================================================ */

// --- 最小 CBOR デコーダ（必要な型のみ。不定長と tag 18 以外は拒否） ---
export function cborDecode(buf, offset = 0, depth = 0) {
  if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
  if (depth > 32) throw new Error("cbor nesting too deep");
  if (offset < 0 || offset >= buf.length) throw new Error("cbor truncated");
  const ib = buf[offset++];
  const major = ib >> 5;
  const ai = ib & 0x1f;
  if (ai === 31) throw new Error("indefinite length unsupported");
  let len = ai;
  const take = (n) => {
    if (offset + n > buf.length) throw new Error("cbor truncated");
    const v = buf.subarray(offset, offset + n);
    offset += n;
    return v;
  };
  if (ai === 24) len = take(1).readUInt8(0);
  else if (ai === 25) len = take(2).readUInt16BE(0);
  else if (ai === 26) len = take(4).readUInt32BE(0);
  else if (ai === 27) {
    const big = take(8).readBigUInt64BE(0);
    if (big > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("cbor integer too large");
    len = Number(big);
  }
  if (major === 0) return [len, offset];
  if (major === 1) return [-1 - len, offset];
  if (major === 2 || major === 3) {
    if (len > buf.length - offset) throw new Error("cbor truncated");
    const s = buf.subarray(offset, offset + len);
    offset += len;
    return [major === 3 ? s.toString("utf8") : s, offset];
  }
  if (major === 4 || major === 5) {
    if (len > buf.length - offset) throw new Error("cbor truncated");
    if (major === 4) {
      const arr = [];
      for (let i = 0; i < len; i++) {
        const [v, o] = cborDecode(buf, offset, depth + 1);
        arr.push(v);
        offset = o;
      }
      return [arr, offset];
    }
    const map = new Map();
    for (let i = 0; i < len; i++) {
      const [k, o1] = cborDecode(buf, offset, depth + 1);
      const [v, o2] = cborDecode(buf, o1, depth + 1);
      map.set(k, v);
      offset = o2;
    }
    return [map, offset];
  }
  if (major === 6) {
    if (len !== 18) throw new Error(`unsupported cbor tag ${len}`);
    return cborDecode(buf, offset, depth + 1);
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

function readDer(buf, offset = 0) {
  if (offset >= buf.length) throw new Error("der truncated");
  const tag = buf[offset++];
  if (offset >= buf.length) throw new Error("der truncated");
  let len = buf[offset++];
  if (len === 0x80) throw new Error("indefinite der unsupported");
  if (len & 0x80) {
    const n = len & 0x7f;
    if (n === 0 || n > 4 || offset + n > buf.length) throw new Error("der truncated");
    len = 0;
    for (let i = 0; i < n; i++) len = (len * 256) + buf[offset++];
  }
  if (offset + len > buf.length) throw new Error("der truncated");
  return { tag, value: buf.subarray(offset, offset + len), end: offset + len };
}

function derChildren(value) {
  const out = [];
  let offset = 0;
  while (offset < value.length) {
    const tlv = readDer(value, offset);
    out.push(tlv);
    offset = tlv.end;
  }
  return out;
}

function oidToString(value) {
  if (!value.length) return "";
  const parts = [Math.floor(value[0] / 40), value[0] % 40];
  let acc = 0;
  for (let i = 1; i < value.length; i++) {
    acc = (acc * 128) + (value[i] & 0x7f);
    if ((value[i] & 0x80) === 0) { parts.push(acc); acc = 0; }
  }
  return parts.join(".");
}

function parseKeyUsageBits(extValue) {
  const bitString = readDer(extValue, 0);
  if (bitString.tag !== 0x03 || bitString.value.length < 1) return [];
  const data = bitString.value.subarray(1);
  const names = [];
  for (let i = 0; i < KU_NAMES.length; i++) {
    const byte = data[Math.floor(i / 8)];
    if (byte === undefined) break;
    if ((byte >> (7 - (i % 8))) & 1) names.push(KU_NAMES[i]);
  }
  return names;
}

function parseEku(extValue) {
  const seq = readDer(extValue, 0);
  return derChildren(seq.value).filter((t) => t.tag === 0x06).map((t) => oidToString(t.value));
}

function parseDn(nameValue) {
  const dn = {};
  for (const set of derChildren(nameValue)) {
    for (const atv of derChildren(set.value)) {
      const parts = derChildren(atv.value);
      if (parts.length < 2) continue;
      const key = DN_ATTR[oidToString(parts[0].value)] ?? oidToString(parts[0].value);
      dn[key] = parts[1].value.toString("utf8");
    }
  }
  return dn;
}

function parseGeneralName(tlv) {
  if (tlv.tag === 0xa4) {
    const name = readDer(tlv.value, 0);
    return { type: "directoryName", dn: parseDn(name.value) };
  }
  if (tlv.tag === 0x82) return { type: "dNSName", value: tlv.value.toString("ascii") };
  return { type: "unsupported", tag: tlv.tag };
}

function parseNameConstraints(extValue) {
  const seq = readDer(extValue, 0);
  const permitted = [];
  const excluded = [];
  for (const part of derChildren(seq.value)) {
    const bucket = part.tag === 0xa0 ? permitted : part.tag === 0xa1 ? excluded : null;
    if (!bucket) continue;
    for (const subtree of derChildren(part.value)) {
      bucket.push(parseGeneralName(readDer(subtree.value, 0)));
    }
  }
  return { permitted, excluded };
}

function parseSanDns(extValue) {
  const seq = readDer(extValue, 0);
  const names = [];
  for (const name of derChildren(seq.value)) {
    if (name.tag === 0x82) names.push(name.value.toString("ascii"));
  }
  return names;
}

export function extensionsOf(raw) {
  const cert = readDer(raw, 0);
  const tbs = readDer(cert.value, 0);
  let extensions = null;
  for (const field of derChildren(tbs.value)) {
    if (field.tag === 0xa3) extensions = field;
  }
  const found = {
    keyUsage: [], eku: [], nameConstraints: null, sanDns: [], critical: new Set(),
  };
  if (!extensions) return found;
  const wrapper = readDer(extensions.value, 0);
  for (const ext of derChildren(wrapper.value)) {
    const parts = derChildren(ext.value);
    const oid = oidToString(parts[0].value);
    const critical = parts.length === 3;
    const octet = parts[parts.length - 1];
    if (critical) found.critical.add(oid);
    if (oid === OID_KEY_USAGE) found.keyUsage = parseKeyUsageBits(octet.value);
    else if (oid === OID_EXT_KEY_USAGE) found.eku = parseEku(octet.value);
    else if (oid === OID_NAME_CONSTRAINTS) found.nameConstraints = parseNameConstraints(octet.value);
    else if (oid === OID_SUBJECT_ALT_NAME) found.sanDns = parseSanDns(octet.value);
  }
  return found;
}

function legacyDn(cert) {
  const subject = cert.toLegacyObject().subject ?? {};
  const dn = {};
  for (const [key, value] of Object.entries(subject)) {
    dn[key] = Array.isArray(value) ? String(value[value.length - 1]) : String(value);
  }
  return dn;
}

function dnWithin(constraint, subject) {
  return Object.entries(constraint).every(([key, value]) => String(subject[key] ?? "") === String(value));
}

function dnsWithin(constraint, name) {
  const base = constraint.toLowerCase().replace(/^\*\./, "").replace(/^\./, "");
  const host = name.toLowerCase().replace(/\.$/, "");
  return host === base || host.endsWith(`.${base}`);
}

export function nameConstraintsAllow(nameConstraints, cert) {
  if (!nameConstraints) return null;
  const names = [...nameConstraints.permitted, ...nameConstraints.excluded];
  if (names.some((name) => name.type === "unsupported")) return "unsupported name constraint";
  const subject = legacyDn(cert);
  const excludedDir = nameConstraints.excluded.filter((name) => name.type === "directoryName");
  const permittedDir = nameConstraints.permitted.filter((name) => name.type === "directoryName");
  if (excludedDir.some((name) => dnWithin(name.dn, subject))) return "subject is excluded by name constraints";
  if (permittedDir.length && !permittedDir.some((name) => dnWithin(name.dn, subject))) {
    return "subject is outside permitted directoryName constraints";
  }
  const excludedDns = nameConstraints.excluded.filter((name) => name.type === "dNSName");
  const permittedDns = nameConstraints.permitted.filter((name) => name.type === "dNSName");
  const profile = extensionsOf(cert.raw);
  for (const dns of profile.sanDns) {
    if (excludedDns.some((name) => dnsWithin(name.value, dns))) return "SAN dNSName is excluded by name constraints";
    if (permittedDns.length && !permittedDns.some((name) => dnsWithin(name.value, dns))) {
      return "SAN dNSName is outside permitted name constraints";
    }
  }
  return null;
}

function checkChainProfile(chain, root) {
  const certs = [...chain, root];
  const profiles = certs.map((cert) => extensionsOf(cert.raw));
  const leafReason = profiles[0].keyUsage.includes("digitalSignature") ? null : "leaf keyUsage lacks digitalSignature";
  if (leafReason) return { ok: false, reason: leafReason };
  if (certs[0].ca) return { ok: false, reason: "attestation leaf is a CA" };
  if (profiles[0].eku.some((oid) => TLS_EKU.has(oid))) {
    return { ok: false, reason: "leaf EKU includes TLS serverAuth or clientAuth" };
  }
  for (let i = 1; i < certs.length; i++) {
    if (!certs[i].ca) return { ok: false, reason: `issuer is not a CA (${certs[i].subject})` };
    if (!profiles[i].keyUsage.includes("keyCertSign")) {
      return { ok: false, reason: `CA keyUsage lacks keyCertSign (${certs[i].subject})` };
    }
    if (profiles[i].eku.some((oid) => TLS_EKU.has(oid))) {
      return { ok: false, reason: `CA EKU includes TLS serverAuth or clientAuth (${certs[i].subject})` };
    }
    const nc = profiles[i].nameConstraints;
    if (!nc) continue;
    for (let j = 0; j < i; j++) {
      const violation = nameConstraintsAllow(nc, certs[j]);
      if (violation) return { ok: false, reason: `${violation} (${certs[j].subject})` };
    }
  }
  return null;
}

function issuedBy(child, parent) {
  try {
    return Boolean(parent.ca) && child.checkIssued(parent) && child.verify(parent.publicKey);
  } catch {
    return false;
  }
}

/** 証明書チェーン（leaf → … → root）の署名・期限・CA ビット・発行関係を確認 */
export function verifyChain(leafDer, bundleDers, rootPem, now = Date.now()) {
  const leaf = new X509Certificate(leafDer);
  const chain = [leaf, ...bundleDers.map((d) => new X509Certificate(d))];
  const root = new X509Certificate(rootPem);
  if (!root.ca) return { ok: false, reason: "pinned root is not a CA" };
  const notBefore = (c) => Date.parse(c.validFrom);
  const notAfter = (c) => Date.parse(c.validTo);
  for (const c of [...chain, root]) {
    const from = notBefore(c);
    const to = notAfter(c);
    if (Number.isNaN(from) || Number.isNaN(to) || now < from || now > to) {
      return { ok: false, reason: "cert expired or not yet valid" };
    }
  }
  for (let i = 0; i < chain.length - 1; i++) {
    const child = chain[i];
    const parent = chain[i + 1];
    if (!issuedBy(child, parent)) return { ok: false, reason: `chain broken at ${child.subject}` };
  }
  const last = chain[chain.length - 1];
  if (!issuedBy(last, root)) return { ok: false, reason: `cabundle does not chain to pinned root (${last.subject})` };
  const profile = checkChainProfile(chain, root);
  if (profile) return profile;
  return { ok: true, leafSubject: leaf.subject, leafFingerprint: leaf.fingerprint256 };
}

function loadRootPem(rootCertPem) {
  if (rootCertPem != null) return rootCertPem;
  const pem = fs.readFileSync(DEFAULT_ROOT_CERT, "utf8");
  const fp = new X509Certificate(pem).fingerprint256;
  if (fp !== PINNED_ROOT_FINGERPRINT) throw new Error("bundled root cert fingerprint mismatch");
  return pem;
}

function checkAttestationTime(timestamp, now, maxSkewMs) {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
    return { ok: false, reason: "attestation timestamp missing" };
  }
  if (Math.abs(now - timestamp) > maxSkewMs) {
    return { ok: false, reason: `attestation timestamp outside ±${maxSkewMs}ms` };
  }
  return { ok: true };
}

function verifyAttestationInner(coseBuf, { rootCertPem, now = Date.now(), maxSkewMs = ATTESTATION_MAX_SKEW_MS } = {}) {
  if (!Number.isFinite(now) || !Number.isFinite(maxSkewMs)) {
    return { ok: false, reason: "invalid attestation time window" };
  }
  const rootPem = loadRootPem(rootCertPem);
  const [head, off1] = cborDecode(coseBuf);
  if (!Array.isArray(head) || head.length !== 4) return { ok: false, reason: "not COSE_Sign1" };
  if (off1 !== coseBuf.length) return { ok: false, reason: "trailing bytes" };
  const [protectedBstr, unprotected, payloadBstr, signature] = head;
  if (!Buffer.isBuffer(protectedBstr) || !Buffer.isBuffer(payloadBstr) || !(unprotected instanceof Map)) {
    return { ok: false, reason: "malformed COSE_Sign1" };
  }

  // 保護ヘッダは署名対象の生バイトのまま使う。Nitro は ES384 = alg -35（-7 は ES256）。
  const [protectedMap, protectedEnd] = cborDecode(protectedBstr);
  if (protectedEnd !== protectedBstr.length || !(protectedMap instanceof Map)) {
    return { ok: false, reason: "malformed protected header" };
  }
  const alg = protectedMap.get(1);
  if (alg !== COSE_ALG_ES384) return { ok: false, reason: `unsupported alg ${alg} (want ES384 / -35)` };

  const leafDer = unprotected.get(34);
  const bundleDers = unprotected.get(33) ?? [];
  if (!Buffer.isBuffer(leafDer)) return { ok: false, reason: "leaf certificate missing" };
  if (!Array.isArray(bundleDers)) return { ok: false, reason: "cabundle malformed" };
  if (!Buffer.isBuffer(signature) || signature.length !== ES384_SIG_BYTES) {
    return { ok: false, reason: "signature must be 96-byte raw R||S" };
  }

  // Sig_structure = ["Signature1", protected, external_aad, payload]
  const sigStructure = cborEncode(["Signature1", protectedBstr, Buffer.alloc(0), payloadBstr]);
  const verifier = createVerify("SHA384");
  verifier.update(sigStructure);
  const leaf = new X509Certificate(leafDer);
  if (leaf.publicKey.asymmetricKeyDetails?.namedCurve !== "secp384r1") {
    return { ok: false, reason: "signing key is not P-384" };
  }
  let sigOk = false;
  try {
    sigOk = verifier.verify({ key: leaf.publicKey, dsaEncoding: "ieee-p1363" }, signature);
  } catch {
    sigOk = false;
  }
  if (!sigOk) return { ok: false, reason: "COSE signature invalid" };

  const chain = verifyChain(leafDer, bundleDers, rootPem, now);
  if (!chain.ok) return chain;

  const [doc, docEnd] = cborDecode(payloadBstr);
  if (!(doc instanceof Map) || docEnd !== payloadBstr.length) return { ok: false, reason: "malformed payload" };
  if (doc.get("digest") !== "SHA384") return { ok: false, reason: "digest is not SHA384" };
  const payloadCert = doc.get("certificate");
  if (!Buffer.isBuffer(payloadCert) || !payloadCert.equals(leafDer)) {
    return { ok: false, reason: "payload certificate does not match signing certificate" };
  }
  const fresh = checkAttestationTime(doc.get("timestamp"), now, maxSkewMs);
  if (!fresh.ok) return fresh;

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

/**
 * Nitro attestation doc (COSE_Sign1, tag 18 可) をオフライン検証する。
 * 検証に AWS API は一切呼ばない。既定のルートは指紋でピン留めする。
 * --root-cert を渡したときだけピンを外す（テスト用。信頼できない PEM を渡さない）。
 */
export function verifyAttestation(coseBuf, opts = {}) {
  try {
    return verifyAttestationInner(coseBuf, opts);
  } catch (e) {
    return { ok: false, reason: `malformed attestation: ${e.message}` };
  }
}

/** PCR0/1/2 を期待 manifest と照合。値は SHA-384（96 hex）でなければならない。 */
export function pcrsMatch(expected, actual) {
  const norm = (v) => String(v ?? "").toLowerCase().replace(/^0x/, "").trim();
  const pick = (obj, k) => norm(obj?.[k] ?? obj?.[`PCR${k}`]);
  const diffs = [];
  for (const k of ["0", "1", "2"]) {
    const e = pick(expected, k);
    const a = pick(actual, k);
    if (!/^[0-9a-f]{96}$/.test(e) || e !== a) diffs.push({ pcr: k, expected: e || "(missing)", actual: a || "(missing)" });
  }
  return diffs.length === 0 ? { ok: true } : { ok: false, diffs };
}

/** ローカル検証の一括実行。nonce の結び付きが無い成功は返さない。 */
function matchGolden(source, actual, label) {
  const golden = goldenPcrsFrom(source);
  if (!golden.measured) return { ok: false, reason: golden.reason };
  const matched = pcrsMatch(golden.pcrs, actual);
  if (!matched.ok) return { ok: false, reason: label, ...matched };
  return { ok: true };
}

export function verifyBundle({
  attestationPath, pcrsPath, nonceHash, rootCertPem, zkeyIn, zkeyOut,
  goldenPath, buildDir, skipBuildCheck = false, now, maxSkewMs,
}) {
  if (!attestationPath || !pcrsPath) return { ok: false, reason: "attestation and pcrs paths are required" };
  let att;
  try {
    att = verifyAttestation(fs.readFileSync(attestationPath), { rootCertPem, now, maxSkewMs });
  } catch (e) {
    return { ok: false, reason: `cannot read attestation: ${e.message}` };
  }
  if (!att.ok) return att;
  let expected;
  try {
    expected = JSON.parse(fs.readFileSync(pcrsPath, "utf8"));
  } catch (e) {
    return { ok: false, reason: `cannot read pcrs: ${e.message}` };
  }
  const pcr = pcrsMatch(expected.pcrs ?? expected, att.pcrs);
  if (!pcr.ok) return { ok: false, reason: "PCR mismatch", ...pcr };
  if (expected.golden) {
    const embedded = matchGolden(expected.golden, att.pcrs, "golden PCR mismatch");
    if (!embedded.ok) return embedded;
  }
  if (goldenPath) {
    let goldenDoc;
    try { goldenDoc = JSON.parse(fs.readFileSync(goldenPath, "utf8")); }
    catch (e) { return { ok: false, reason: `cannot read golden PCRs: ${e.message}` }; }
    const golden = matchGolden(goldenDoc, att.pcrs, "golden PCR mismatch");
    if (!golden.ok) return golden;
  }
  if (!skipBuildCheck && expected.build?.inputs) {
    const dir = buildDir ?? path.join(HERE, "..", "enclave");
    const built = verifyBuildInputs(expected.build.inputs, dir);
    if (!built.ok) return built;
  }

  let fromFiles = "";
  if (zkeyIn || zkeyOut) {
    if (!zkeyIn || !zkeyOut) return { ok: false, reason: "both zkey-in and zkey-out are required to bind the nonce" };
    try {
      fromFiles = commitmentNonceHexFromFiles(zkeyIn, zkeyOut);
    } catch (e) {
      return { ok: false, reason: `cannot hash zkey: ${e.message}` };
    }
  }
  const fromHash = nonceHash ? String(nonceHash).toLowerCase().replace(/^0x/, "") : "";
  if (!fromFiles && !fromHash) return { ok: false, reason: "nonce binding required" };
  if (fromFiles && fromHash && fromFiles !== fromHash) {
    return { ok: false, reason: "nonce-hash does not match zkey files" };
  }
  const want = fromFiles || fromHash;
  if (att.nonce !== want) return { ok: false, reason: `nonce mismatch: doc=${att.nonce} want=${want}` };
  return { ok: true, pcrs: att.pcrs, nonce: att.nonce, leafSubject: att.leafSubject };
}

/* ============================================================
 * phase2 — provision → run → verify → teardown
 * ============================================================ */

export async function phase2(opts) {
  const region = opts.region ?? "us-east-1";
  const instanceType = opts["instance-type"] ?? "t3.xlarge"; // seal(222k gate) の contribute に 8GB enclave + 親を収める
  const r1cs = opts.r1cs;
  const zkeyIn = opts["zkey-in"];
  const zkeyOut = opts["zkey-out"];
  if (!r1cs || !zkeyIn || !zkeyOut) throw new Error("--r1cs / --zkey-in / --zkey-out が必要");
  warnIfZkeyTooLarge(zkeyIn);

  if (opts["dry-run"]) {
    const steps = planLifecycle();
    steps.forEach((s, i) => log(`${i + 1}. ${s}`));
    return { dryRun: true, steps };
  }

  const ami = opts.ami ?? (await resolveAmi(region));
  let res = null;
  try {
    res = await provision({
      region, instanceType, ami, keepResources: Boolean(opts["keep-resources"]),
    });
    const sshBase = [
      "-i", res.keyPath,
      "-o", "StrictHostKeyChecking=accept-new",
      "-o", `UserKnownHostsFile=${res.knownHosts}`,
      "-o", "IdentitiesOnly=yes",
      "-o", "BatchMode=yes",
      "-o", "PasswordAuthentication=no",
      "-o", "ServerAliveInterval=30",
      "-o", "ServerAliveCountMax=120",
      "-o", "ConnectTimeout=10",
    ];
    const host = `ec2-user@${res.ip}`;
    const remoteDir = "/home/ec2-user/cauldron";

    log("scp: enclave バンドル + zkey を転送");
    await retry("ssh", () => exec("ssh", [...sshBase, host, "mkdir -p " + remoteDir]), 12, 5000);
    await exec("scp", [...sshBase, "-r", path.join(HERE, "..", "enclave"), `${host}:${remoteDir}/`], { timeout: SCP_TIMEOUT_MS });
    await exec("scp", [...sshBase, zkeyIn, `${host}:${remoteDir}/zkey_0000`], { timeout: SCP_TIMEOUT_MS });

    log("remote: setup-and-run（EIF ビルド → enclave 内 contribute → 回収）");
    await exec("ssh", [...sshBase, host, `cd ${remoteDir} && sudo bash enclave/setup-and-run.sh`], { timeout: PHASE2_TIMEOUT_MS });

    log("collect: 結果をステージしてから検証する");
    const stage = fs.mkdtempSync(path.join(os.tmpdir(), `cauldron-${res.id}-`));
    try {
      const stagedZkey = path.join(stage, "zkey_final");
      const stagedAtt = path.join(stage, "attestation.cbor");
      const stagedPcrs = path.join(stage, "pcrs.json");
      await exec("scp", [...sshBase, `${host}:${remoteDir}/out/zkey_final`, stagedZkey], { timeout: SCP_TIMEOUT_MS });
      await exec("scp", [...sshBase, `${host}:${remoteDir}/out/attestation.cbor`, stagedAtt], { timeout: SCP_TIMEOUT_MS });
      await exec("scp", [...sshBase, `${host}:${remoteDir}/out/pcrs.json`, stagedPcrs], { timeout: SCP_TIMEOUT_MS });

      log("verify: attestation（オフライン）");
      const enclaveDir = path.join(HERE, "..", "enclave");
      const defaultGolden = opts.golden ?? path.join(enclaveDir, "expected-pcrs.json");
      let goldenPath;
      if (opts.golden) goldenPath = opts.golden;
      else if (fs.existsSync(defaultGolden)) {
        const preset = JSON.parse(fs.readFileSync(defaultGolden, "utf8"));
        if (preset.measured === true) goldenPath = defaultGolden;
        else log("警告: enclave/expected-pcrs.json は未計測です。ホスト manifest だけの PCR 比較は独立した照合になりません。EIF を再ビルドして --golden を計測値で更新してください。");
      }
      const v = verifyBundle({
        attestationPath: stagedAtt,
        pcrsPath: stagedPcrs,
        zkeyIn,
        zkeyOut: stagedZkey,
        goldenPath,
        buildDir: enclaveDir,
        skipBuildCheck: Boolean(opts["skip-build-check"]),
        rootCertPem: opts["root-cert"] ? fs.readFileSync(opts["root-cert"], "utf8") : undefined,
      });
      if (!v.ok) throw new Error(`attestation 検証失敗: ${JSON.stringify(v)}`);
      log(`attestation OK: ${v.leafSubject}`);

      if (!opts["skip-zkey-verify"] && opts.ptau) {
        log("verify: snarkjs zkey verify");
        await exec("npx", ["snarkjs", "zkey", "verify", r1cs, opts.ptau, stagedZkey], { timeout: PHASE2_TIMEOUT_MS });
      }

      moveFile(stagedAtt, `${zkeyOut}.attestation.cbor`);
      moveFile(stagedPcrs, `${zkeyOut}.pcrs.json`);
      moveFile(stagedZkey, zkeyOut);
    } finally {
      fs.rmSync(stage, { recursive: true, force: true });
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
    if (!opts.attestation || !opts.pcrs) throw new Error("--attestation と --pcrs が必要");
    const v = verifyBundle({
      attestationPath: opts.attestation,
      pcrsPath: opts.pcrs,
      nonceHash: opts["nonce-hash"],
      zkeyIn: opts["zkey-in"],
      zkeyOut: opts["zkey-out"],
      goldenPath: opts.golden,
      buildDir: opts["build-dir"],
      skipBuildCheck: Boolean(opts["skip-build-check"]),
      now: opts.now === undefined ? undefined : Number(opts.now),
      rootCertPem: opts["root-cert"] ? fs.readFileSync(opts["root-cert"], "utf8") : undefined,
    });
    if (!v.ok) { log(JSON.stringify(v, null, 2)); process.exit(1); }
    process.stdout.write(JSON.stringify(v, null, 2) + "\n");
  } else if (command === "teardown") {
    if (!opts["run-id"]) throw new Error("--run-id が必要");
    const out = await teardownByRunId(opts["run-id"], opts.region ?? "us-east-1");
    process.stdout.write(JSON.stringify(out) + "\n");
  } else {
    process.stderr.write("usage: cauldron phase2|verify|teardown [options]\n");
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
