#!/usr/bin/env node
// @lemmaoracle/cauldron — TEE setup that runs Groth16 phase 2 (zkey contribute) inside AWS Nitro Enclaves.
//
// Zero dependencies (Node standard library only). One file, so it can be copied and run.
// Usage: node cauldron.mjs phase2 --circuit <name|build/name>
//        node cauldron.mjs verify --circuit <name|build/name>
//        node cauldron.mjs teardown --run-id <id>
// SSH private keys are not arguments. Each run creates one and deletes it from AWS and from disk.
//
// Trust boundary: AWS Nitro is the root of trust. Verification is offline and does not call the AWS API.
// The nonce is sha256(zkey_0000)||sha256(zkey_final). A hash of the input alone lets the parent swap the output zkey.

import { execFile } from "node:child_process";
import { createHash, createVerify, randomBytes, X509Certificate } from "node:crypto";
import fs from "node:fs";
import https from "node:https";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT_CERT = path.join(HERE, "..", "certs", "aws-nitro-root.pem");
const DEFAULT_GOLDEN = path.join(HERE, "..", "enclave", "expected-pcrs.json");
const TAG_KEY = "lemma-cauldron";
// AWS Nitro Enclaves Root-G1。certs/aws-nitro-root.pem と README の指紋と同じ。
export const PINNED_ROOT_FINGERPRINT =
  "64:1A:03:21:A3:E2:44:EF:E4:56:46:31:95:D6:06:31:7E:D7:CD:CC:3C:17:56:E0:98:93:F3:C6:8F:79:BB:5B";
const COSE_ALG_ES384 = -35;
const ES384_SIG_BYTES = 96;
const PHASE2_TIMEOUT_MS = 10 * 60 * 60 * 1000;
export const ATTESTATION_MAX_SKEW_MS = 15 * 60 * 1000;
export const ENCLAVE_MEMORY_LIMIT_BYTES = 8192 * 1024 * 1024;
export const DEFAULT_INSTANCE_TYPE = "m6i.xlarge"; // 4 vCPU / 16 GiB. Burstable families such as t3 cannot run Nitro Enclaves.
export const DEFAULT_ENCLAVE_MEMORY_MB = 8192;
export const DEFAULT_ENCLAVE_CPU = 2;
export const DEFAULT_CLIENT_TIMEOUT_MS = 28_800_000;
export const REMOTE_DIR = "/home/ec2-user/cauldron";
const MAX_CLIENT_TIMEOUT_MS = 24 * 60 * 60 * 1000;
const DEDICATED_VPC_CIDR = "10.66.0.0/16";
const DEDICATED_SUBNET_CIDR = "10.66.1.0/24";
const VPC_ID_RE = /^vpc-[0-9a-f]+$/;
const SUBNET_ID_RE = /^subnet-[0-9a-f]+$/;
const IGW_ID_RE = /^igw-[0-9a-f]+$/;
const UNSUPPORTED_ENCLAVE_INSTANCE = /^(?:t3a|t4g|t3|t2|a1|g5g|im4gn|is4gen)\.|^u-|\.metal/i;
const MEMORY_ZKEY_FACTOR = 16;
const MEMORY_HEADROOM_BYTES = 512 * 1024 * 1024;
export const BUILD_INPUT_FILES = ["Dockerfile", "package.json", "package-lock.json", "requirements.txt", ".dockerignore", "serve.mjs", "attest.py", "frame.mjs", "entry.sh"];
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
export function estimateContributeMemory(zkeyBytes, limitBytes = ENCLAVE_MEMORY_LIMIT_BYTES) {
  const bytes = zkeyBytes * MEMORY_ZKEY_FACTOR + MEMORY_HEADROOM_BYTES;
  return { bytes, limitBytes, exceeds: bytes > limitBytes };
}

export function enclaveMemoryLimitBytes(memoryMb) {
  return memoryMb * 1024 * 1024;
}

export function warnIfZkeyTooLarge(zkeyPath, limitBytes = ENCLAVE_MEMORY_LIMIT_BYTES) {
  let size = 0;
  try { size = fs.statSync(zkeyPath).size; } catch { return; }
  const est = estimateContributeMemory(size, limitBytes);
  if (!est.exceeds) return;
  const memoryMb = Math.floor(est.limitBytes / (1024 * 1024));
  log(`warning: estimated memory for a ${size} byte zkey is ${est.bytes} bytes, above the enclave limit of ${est.limitBytes} bytes (--enclave-memory-mb ${memoryMb}). Raise --enclave-memory-mb and choose an --instance-type that can hold it (650MB-class zkeys are not yet measured on Nitro).`);
}

export function hashBuildInputs(dir) {
  const inputs = {};
  for (const name of BUILD_INPUT_FILES) {
    inputs[name] = sha256Hex(fs.readFileSync(path.join(dir, name)));
  }
  return inputs;
}

export function verifyBuildInputs(inputs, dir) {
  if (!inputs || typeof inputs !== "object" || Array.isArray(inputs)) {
    return { ok: false, reason: "build input hashes missing" };
  }
  const diffs = [];
  for (const name of BUILD_INPUT_FILES) {
    const expected = inputs[name];
    let actual = "(missing)";
    try { actual = sha256Hex(fs.readFileSync(path.join(dir, name))); } catch { /* missing file */ }
    if (!/^[0-9a-f]{64}$/i.test(String(expected ?? "")) || actual !== String(expected).toLowerCase()) {
      diffs.push({ file: name, expected: expected ?? "(missing)", actual });
    }
  }
  return diffs.length === 0 ? { ok: true } : { ok: false, reason: "build input hash mismatch", diffs };
}

export function goldenPcrsFrom(doc) {
  if (!doc || typeof doc !== "object") return { measured: false, reason: "golden PCR manifest is not an object" };
  if (doc.measured !== true) return { measured: false, reason: "golden PCRs have not been measured" };
  const pcrs = doc.pcrs ?? doc;
  const sample = pcrs[0] ?? pcrs["0"];
  if (sample == null || sample === "") return { measured: false, reason: "golden PCRs have not been measured" };
  return { measured: true, pcrs };
}

function readGolden(goldenPath = DEFAULT_GOLDEN) {
  let doc;
  try { doc = JSON.parse(fs.readFileSync(goldenPath, "utf8")); }
  catch (e) { return { ok: false, reason: `cannot read golden PCRs: ${e.message}` }; }
  const golden = goldenPcrsFrom(doc);
  if (!golden.measured) return { ok: false, reason: golden.reason };
  const valid = pcrsMatch(golden.pcrs, golden.pcrs);
  if (!valid.ok) return { ok: false, reason: "golden PCRs must contain valid PCR0/1/2", diffs: valid.diffs };
  return { ok: true, pcrs: golden.pcrs };
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

function pathsFromStem(stem) {
  return {
    r1cs: `${stem}.r1cs`,
    zkeyIn: `${stem}_0000.zkey`,
    zkeyOut: `${stem}_final.zkey`,
  };
}

function stemFromCircuitFile(file) {
  if (file.endsWith(".r1cs")) return file.slice(0, -".r1cs".length);
  if (file.endsWith("_0000.zkey")) return file.slice(0, -"_0000.zkey".length);
  if (file.endsWith("_final.zkey")) return file.slice(0, -"_final.zkey".length);
  return null;
}

/**
 * Derive the r1cs, the initial zkey, and the final zkey from --circuit.
 * A bare name prefers build/<name>. A filename is accepted too.
 */
export function resolveCircuit(spec, { cwd = process.cwd(), exists = fs.existsSync } = {}) {
  if (spec == null || spec === "" || spec === true) throw new Error("--circuit is required (example: --circuit build/seal-identity)");
  const text = String(spec);
  const abs = path.resolve(cwd, text);
  const fileStem = stemFromCircuitFile(abs);
  if (fileStem) return pathsFromStem(fileStem);
  const bare = !path.isAbsolute(text) && !text.includes("/") && !text.includes("\\");
  const stems = bare ? [path.join(cwd, "build", text), path.join(cwd, text)] : [abs];
  for (const stem of stems) {
    const paths = pathsFromStem(stem);
    if (exists(paths.r1cs) || exists(paths.zkeyIn)) return paths;
  }
  return pathsFromStem(stems[0]);
}

/** When exactly one *_final.ptau sits beside the circuit, use it for zkey verify. */
export function findSoleFinalPtau(circuitDir, { listDir = fs.readdirSync } = {}) {
  const places = [path.join(circuitDir, "ptau"), circuitDir];
  for (const dir of places) {
    let names;
    try { names = listDir(dir); } catch { continue; }
    const finals = names.filter((name) => name.endsWith("_final.ptau")).map((name) => path.join(dir, name));
    if (finals.length === 1) return finals[0];
    if (finals.length > 1) return null;
  }
  return null;
}

export function resolvePhase2Circuit(opts, deps = {}) {
  const cwd = deps.cwd ?? process.cwd();
  const derived = opts.circuit ? resolveCircuit(opts.circuit, { cwd, exists: deps.exists }) : null;
  const r1cs = opts.r1cs ?? derived?.r1cs;
  const zkeyIn = opts["zkey-in"] ?? derived?.zkeyIn;
  const zkeyOut = opts["zkey-out"] ?? derived?.zkeyOut;
  if (!r1cs || !zkeyIn || !zkeyOut) throw new Error("--circuit is required (example: --circuit build/seal-identity)");
  const r1csAbs = path.resolve(cwd, r1cs);
  const ptau = opts.ptau
    ? path.resolve(cwd, opts.ptau)
    : findSoleFinalPtau(path.dirname(r1csAbs), { listDir: deps.listDir });
  return {
    r1cs: r1csAbs,
    zkeyIn: path.resolve(cwd, zkeyIn),
    zkeyOut: path.resolve(cwd, zkeyOut),
    ptau: ptau ?? null,
  };
}

export function resolveVerifyInputs(opts, deps = {}) {
  const circuit = opts.circuit ? resolveCircuit(opts.circuit, deps) : null;
  const zkeyOut = opts["zkey-out"] ?? circuit?.zkeyOut;
  return {
    attestationPath: opts.attestation ?? (zkeyOut ? `${zkeyOut}.attestation.cbor` : undefined),
    pcrsPath: opts.pcrs ?? (zkeyOut ? `${zkeyOut}.pcrs.json` : undefined),
    zkeyIn: opts["zkey-in"] ?? circuit?.zkeyIn,
    zkeyOut,
  };
}

/* ============================================================
 * Lifecycle plan (dry-run and a real run share these steps)
 * ============================================================ */

export function planLifecycle() {
  return [
    "provision: resolve the AMI (SSM parameter)",
    "provision: create a keypair",
    "provision: resolve a public subnet (create a dedicated VPC and IGW when the default VPC has none)",
    "provision: create a security group in that VPC and allow ssh(22) from this IP only",
    `provision: launch EC2 (default ${DEFAULT_INSTANCE_TYPE}, explicit subnet, public IPv4, tag ${TAG_KEY}=<run-id>)`,
    "transfer: scp the enclave bundle and zkey_0000",
    "remote: pass ENCLAVE_MEMORY_MB / ENCLAVE_CPU / CLIENT_TIMEOUT_MS via sudo env, then docker build → nitro-cli build-enclave → save the PCR manifest",
    "remote: start the enclave → send the zkey over vsock → contribute (CSPRNG inside the enclave)",
    "remote: fetch the attestation doc (nonce = sha256(zkey_0000)||sha256(zkey_final)) → return it with zkey_final",
    "collect: retrieve zkey_final, the attestation doc, and the PCR manifest",
    "verify: offline check of the COSE_Sign1 signature → certificate chain → PCR0/1/2 → nonce",
    "verify: snarkjs zkey verify (omit with --skip-zkey-verify)",
    "teardown: terminate the instance → delete the keypair and security group (and the dedicated VPC when this run created one; --keep-resources leaves them)",
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

function requirePositiveInt(name, value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER, even = false } = {}) {
  const raw = value === undefined ? fallback : value;
  if (typeof raw === "boolean" || !/^[0-9]+$/.test(String(raw))) throw new Error(`invalid ${name}`);
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n < min || n > max || (even && n % 2 !== 0)) throw new Error(`invalid ${name}`);
  return n;
}

/** Nitro Enclaves do not start on burstable, bare-metal, or u-* instances. The default is m6i.xlarge. */
export function assertEnclaveInstanceType(instanceType) {
  const type = String(instanceType ?? "");
  if (!/^[a-z][a-z0-9-]*\.[a-z0-9-]+$/i.test(type)) throw new Error(`invalid instance type: ${type}`);
  if (UNSUPPORTED_ENCLAVE_INSTANCE.test(type)) {
    throw new Error(`${type} cannot start Nitro Enclaves. Use the default ${DEFAULT_INSTANCE_TYPE} (4 vCPU / 16 GiB) or another non-burstable, non-bare-metal type`);
  }
  return type;
}

export function parseEnclaveResources(opts = {}) {
  const memoryMb = requirePositiveInt("enclave-memory-mb", opts["enclave-memory-mb"], DEFAULT_ENCLAVE_MEMORY_MB, { min: 1024, even: true });
  const cpu = requirePositiveInt("enclave-cpu", opts["enclave-cpu"], DEFAULT_ENCLAVE_CPU, { min: 2, max: 128 });
  const timeoutMs = requirePositiveInt("client-timeout-ms", opts["client-timeout-ms"], DEFAULT_CLIENT_TIMEOUT_MS, { min: 1000, max: MAX_CLIENT_TIMEOUT_MS });
  return { memoryMb, cpu, timeoutMs };
}

/** sudo drops the environment. Pass only integers as command arguments. */
export function remoteSetupCommand(remoteDir, resources) {
  if (remoteDir !== REMOTE_DIR) throw new Error("invalid remote dir");
  const { memoryMb, cpu, timeoutMs } = resources ?? {};
  if (![memoryMb, cpu, timeoutMs].every((n) => Number.isSafeInteger(n) && n > 0)) {
    throw new Error("invalid enclave resources");
  }
  return `cd ${remoteDir} && sudo env ENCLAVE_MEMORY_MB=${memoryMb} ENCLAVE_CPU=${cpu} CLIENT_TIMEOUT_MS=${timeoutMs} bash enclave/setup-and-run.sh`;
}

export function sshTimeoutFor(resources) {
  return Math.max(PHASE2_TIMEOUT_MS, resources.timeoutMs + 60 * 60 * 1000);
}

function tagSpec(resourceType, id) {
  return `ResourceType=${resourceType},Tags=[{Key=${TAG_KEY},Value=${id}},{Key=Name,Value=lemma-cauldron}]`;
}

function requireId(value, re, label) {
  const id = String(value ?? "");
  if (!re.test(id)) throw new Error(`invalid ${label}: ${id}`);
  return id;
}

function parseAwsJson(text, label) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} returned invalid JSON`);
  }
}

function parseIdList(text) {
  if (text == null || String(text).trim() === "" || String(text).trim() === "None") return [];
  const parsed = parseAwsJson(text, "id list");
  if (parsed == null) return [];
  if (!Array.isArray(parsed)) throw new Error("expected a JSON list");
  return parsed.map(String);
}

export function routeTableForSubnet(subnetId, routeTables) {
  const tables = routeTables ?? [];
  const specific = tables.find((rt) => (rt.Associations ?? []).some((a) => a.SubnetId === subnetId));
  if (specific) return specific;
  return tables.find((rt) => (rt.Associations ?? []).some((a) => a.Main === true)) ?? null;
}

export function routeTableHasIgw(table) {
  return (table?.Routes ?? []).some((r) => r.DestinationCidrBlock === "0.0.0.0/0" && IGW_ID_RE.test(String(r.GatewayId ?? "")));
}

/** A subnet is public only when its route table sends 0.0.0.0/0 to an IGW. */
export function pickPublicSubnet(subnets, routeTables) {
  const hit = (subnets ?? []).find((s) => SUBNET_ID_RE.test(String(s?.SubnetId ?? ""))
    && s.State !== "pending"
    && routeTableHasIgw(routeTableForSubnet(s.SubnetId, routeTables)));
  return hit?.SubnetId ?? null;
}

export function runInstancesArgs({ ami, instanceType, keyName, sgId, subnetId, instanceTags, region }) {
  requireId(subnetId, SUBNET_ID_RE, "subnet");
  return [
    "ec2", "run-instances",
    "--image-id", ami,
    "--instance-type", instanceType,
    "--key-name", keyName,
    "--security-group-ids", sgId,
    "--subnet-id", subnetId,
    "--associate-public-ip-address",
    "--enclave-options", "Enabled=true",
    // IMDS は cloud-init の鍵注入に必須のため無効化できない。IMDSv2 のみ+ホップリミット1で最小化する。
    // （実測: HttpEndpoint=disabled では authorized_keys が空のまま SSH が不可能になる）
    "--metadata-options", "HttpEndpoint=enabled,HttpTokens=required,HttpPutResponseHopLimit=1",
    "--tag-specifications", instanceTags,
    "--region", region,
    "--output", "json",
  ];
}

/** AZ 指定なしの create-subnet は m6i 非対応の AZ を選ぶことがある。ランダムな再作成で回避する。 */
async function createDedicatedSubnet({ region, id, awsImpl, network }) {
  const subnet = parseAwsJson(await awsImpl([
    "ec2", "create-subnet", "--vpc-id", network.vpcId, "--cidr-block", DEDICATED_SUBNET_CIDR,
    "--tag-specifications", tagSpec("subnet", id),
    "--region", region, "--output", "json",
  ]), "create-subnet");
  network.subnetId = requireId(subnet?.Subnet?.SubnetId, SUBNET_ID_RE, "subnet");
  await awsImpl([
    "ec2", "modify-subnet-attribute", "--subnet-id", network.subnetId,
    "--map-public-ip-on-launch", "Value=true", "--region", region,
  ]);
}

async function createDedicatedNetwork({ region, id, awsImpl, network }) {
  network.created = true;
  log(`run-id ${id}: no public subnet in the default VPC; creating a dedicated VPC`);
  const vpc = parseAwsJson(await awsImpl([
    "ec2", "create-vpc", "--cidr-block", DEDICATED_VPC_CIDR,
    "--tag-specifications", tagSpec("vpc", id),
    "--region", region, "--output", "json",
  ]), "create-vpc");
  network.vpcId = requireId(vpc?.Vpc?.VpcId, VPC_ID_RE, "vpc");
  await createDedicatedSubnet({ region, id, awsImpl, network });
  const igw = parseAwsJson(await awsImpl([
    "ec2", "create-internet-gateway",
    "--tag-specifications", tagSpec("internet-gateway", id),
    "--region", region, "--output", "json",
  ]), "create-internet-gateway");
  network.igwId = requireId(igw?.InternetGateway?.InternetGatewayId, IGW_ID_RE, "igw");
  await awsImpl([
    "ec2", "attach-internet-gateway", "--internet-gateway-id", network.igwId,
    "--vpc-id", network.vpcId, "--region", region,
  ]);
  const tables = parseAwsJson(await awsImpl([
    "ec2", "describe-route-tables",
    "--filters", `Name=vpc-id,Values=${network.vpcId}`, "Name=association.main,Values=true",
    "--region", region, "--output", "json",
  ]), "describe-route-tables");
  const routeTableId = tables?.RouteTables?.[0]?.RouteTableId;
  if (!/^rtb-[0-9a-f]+$/.test(String(routeTableId ?? ""))) throw new Error("dedicated VPC has no main route table");
  await awsImpl([
    "ec2", "create-route", "--route-table-id", routeTableId,
    "--destination-cidr-block", "0.0.0.0/0", "--gateway-id", network.igwId, "--region", region,
  ]);
  return network;
}

export async function resolveLaunchNetwork({ region, id, awsImpl = aws, network = { created: false } }) {
  const vpcs = parseIdList(await awsImpl([
    "ec2", "describe-vpcs",
    "--filters", "Name=is-default,Values=true",
    "--region", region, "--query", "Vpcs[].VpcId", "--output", "json",
  ]));
  const vpcId = vpcs.find((v) => VPC_ID_RE.test(v));
  if (vpcId) {
    const subnetsDoc = parseAwsJson(await awsImpl([
      "ec2", "describe-subnets",
      "--filters", `Name=vpc-id,Values=${vpcId}`, "Name=state,Values=available",
      "--region", region, "--output", "json",
    ]), "describe-subnets");
    const rtDoc = parseAwsJson(await awsImpl([
      "ec2", "describe-route-tables",
      "--filters", `Name=vpc-id,Values=${vpcId}`,
      "--region", region, "--output", "json",
    ]), "describe-route-tables");
    const subnetId = pickPublicSubnet(subnetsDoc.Subnets, rtDoc.RouteTables);
    if (subnetId) {
      network.created = false;
      network.vpcId = vpcId;
      network.subnetId = subnetId;
      return network;
    }
  }
  return createDedicatedNetwork({ region, id, awsImpl, network });
}

const notFound = (e) => /NotFound|does not exist|InvalidVpcID|InvalidSubnetID|InvalidInternetGatewayID|InvalidRouteTableID/i.test(String(e?.message ?? e));

export async function deleteDedicatedNetwork({
  vpcId, subnetId, subnetIds, igwId, igwIds, region, awsImpl = aws, sleep = delay, attempts = 6,
}) {
  const subnets = subnetIds ?? (subnetId ? [subnetId] : []);
  const igws = igwIds ?? (igwId ? [igwId] : []);
  const retryDelete = async (args) => {
    let last = new Error(args.join(" "));
    for (let i = 0; i < attempts; i++) {
      try {
        await awsImpl(args);
        return;
      } catch (e) {
        if (notFound(e)) return;
        last = e;
        if (!/DependencyViolation|dependent object/i.test(String(e.message ?? e)) || i + 1 === attempts) throw e;
        await sleep(10_000);
      }
    }
    throw last;
  };
  for (const id of subnets) {
    if (SUBNET_ID_RE.test(id)) await retryDelete(["ec2", "delete-subnet", "--subnet-id", id, "--region", region]);
  }
  for (const id of igws) {
    if (!IGW_ID_RE.test(id)) continue;
    if (vpcId && VPC_ID_RE.test(vpcId)) {
      await awsImpl(["ec2", "detach-internet-gateway", "--internet-gateway-id", id, "--vpc-id", vpcId, "--region", region]).catch((e) => {
        if (!notFound(e) && !/not attached|Gateway.NotAttached/i.test(String(e.message ?? e))) log(String(e.message ?? e));
      });
    }
    await retryDelete(["ec2", "delete-internet-gateway", "--internet-gateway-id", id, "--region", region]);
  }
  if (vpcId && VPC_ID_RE.test(vpcId)) await retryDelete(["ec2", "delete-vpc", "--vpc-id", vpcId, "--region", region]);
}

async function deleteNetworksForRun({ id, region, awsImpl, sleep }) {
  const vpcs = parseIdList(await awsImpl([
    "ec2", "describe-vpcs",
    "--filters", `Name=tag:${TAG_KEY},Values=${id}`,
    "--region", region, "--query", "Vpcs[].VpcId", "--output", "json",
  ]).catch((e) => { log(String(e.message ?? e)); return "[]"; }));
  const taggedIgws = parseIdList(await awsImpl([
    "ec2", "describe-internet-gateways",
    "--filters", `Name=tag:${TAG_KEY},Values=${id}`,
    "--region", region, "--query", "InternetGateways[].InternetGatewayId", "--output", "json",
  ]).catch((e) => { log(String(e.message ?? e)); return "[]"; }));
  const seenIgw = new Set();
  for (const vpcId of vpcs) {
    if (!VPC_ID_RE.test(vpcId)) continue;
    const subnets = parseIdList(await awsImpl([
      "ec2", "describe-subnets",
      "--filters", `Name=vpc-id,Values=${vpcId}`,
      "--region", region, "--query", "Subnets[].SubnetId", "--output", "json",
    ]).catch(() => "[]"));
    const attached = parseIdList(await awsImpl([
      "ec2", "describe-internet-gateways",
      "--filters", `Name=attachment.vpc-id,Values=${vpcId}`,
      "--region", region, "--query", "InternetGateways[].InternetGatewayId", "--output", "json",
    ]).catch(() => "[]"));
    const igws = [...attached, ...taggedIgws].filter((igw) => {
      if (seenIgw.has(igw)) return false;
      seenIgw.add(igw);
      return true;
    });
    await deleteDedicatedNetwork({ vpcId, subnetIds: subnets, igwIds: igws, region, awsImpl, sleep }).catch((e) => log(String(e.message ?? e)));
  }
  for (const igwId of taggedIgws) {
    if (seenIgw.has(igwId) || !IGW_ID_RE.test(igwId)) continue;
    await deleteDedicatedNetwork({ igwIds: [igwId], region, awsImpl, sleep }).catch((e) => log(String(e.message ?? e)));
  }
}

export async function provision({
  region, instanceType, ami, keepResources = false, awsImpl = aws, fetchIp = fetchMyIp, sleep = delay,
}) {
  assertEnclaveInstanceType(instanceType);
  const id = runId();
  const keyName = `lemma-tee-${id}`;
  const groupName = `lemma-tee-${id}`;
  const keyPath = path.join(os.tmpdir(), `${keyName}.pem`);
  const knownHosts = path.join(os.tmpdir(), `${keyName}.known_hosts`);
  const network = { created: false };
  const state = {
    id, instanceId: undefined, ip: undefined, keyPath: undefined, knownHosts, keyName, sgId: undefined, region, network,
  };
  let createdKey = false;
  try {
    log(`run-id ${id}: creating a disposable keypair (deleted from AWS and from disk on exit)`);
    const kp = parseAwsJson(await awsImpl([
      "ec2", "create-key-pair", "--key-name", keyName, "--region", region, "--output", "json",
    ]), "create-key-pair");
    if (!kp.KeyMaterial) throw new Error("create-key-pair returned no KeyMaterial");
    createdKey = true;
    const fd = fs.openSync(keyPath, "wx", 0o600);
    state.keyPath = keyPath;
    try { fs.writeFileSync(fd, kp.KeyMaterial); } finally { fs.closeSync(fd); }

    log(`run-id ${id}: resolving a public subnet`);
    await resolveLaunchNetwork({ region, id, awsImpl, network });

    log(`run-id ${id}: creating a security group (${network.vpcId})`);
    const sg = parseAwsJson(await awsImpl([
      "ec2", "create-security-group", "--group-name", groupName,
      "--description", `lemma cauldron ${id}`, "--vpc-id", network.vpcId,
      "--tag-specifications", tagSpec("security-group", id),
      "--region", region, "--output", "json",
    ]), "create-security-group");
    state.sgId = requireId(sg.GroupId, /^sg-[0-9a-f]+$/, "security group");
    const myIp = await fetchIp();
    await awsImpl(["ec2", "authorize-security-group-ingress", "--group-id", state.sgId,
      "--protocol", "tcp", "--port", "22", "--cidr", `${myIp}/32`, "--region", region]);

    log(`run-id ${id}: launching EC2 (${instanceType}, ${ami}, ${network.subnetId})`);
    let run;
    for (let attempt = 1; ; attempt++) {
      try {
        run = parseAwsJson(await awsImpl(runInstancesArgs({
          ami, instanceType, keyName, sgId: state.sgId, subnetId: network.subnetId,
          instanceTags: tagSpec("instance", id), region,
        })), "run-instances");
        break;
      } catch (e) {
        const msg = String(e.message ?? e);
        const zonal = /not supported in your requested Availability Zone|InsufficientInstanceCapacity|InsufficientHostCapacity/i.test(msg);
        if (!zonal || !network.created || attempt >= 5) throw e;
        log(`run-id ${id}: launch rejected (zonal); re-rolling the dedicated subnet (attempt ${attempt})`);
        await awsImpl(["ec2", "delete-subnet", "--subnet-id", network.subnetId, "--region", region]);
        await createDedicatedSubnet({ region, id, awsImpl, network });
      }
    }
    state.instanceId = run.Instances[0].InstanceId;

    await awsImpl(["ec2", "wait", "instance-running", "--instance-ids", state.instanceId, "--region", region]);
    let ip = "";
    for (let attempt = 0; attempt < 6; attempt++) {
      const desc = parseAwsJson(await awsImpl(["ec2", "describe-instances", "--instance-ids", state.instanceId,
        "--region", region, "--query", "Reservations[0].Instances[0].PublicIpAddress", "--output", "json"]), "describe-instances");
      ip = String(desc ?? "").trim();
      if (isIpv4(ip)) break;
      await sleep(5000);
    }
    if (!isIpv4(ip)) throw new Error(`instance ${state.instanceId} has no public IPv4`);
    state.ip = ip;
    log(`run-id ${id}: ${state.instanceId} @ ${ip}`);
    return state;
  } catch (e) {
    const dirty = createdKey || state.sgId || state.instanceId || state.network?.created;
    if (!keepResources && dirty) {
      await teardownById(state, { awsImpl, sleep }).catch((te) => log(String(te.message ?? te)));
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

export async function teardownById(state, deps = {}) {
  const { id, instanceId, keyName, sgId, region, keyPath, knownHosts, network } = state;
  const awsImpl = deps.awsImpl ?? aws;
  const sleep = deps.sleep ?? delay;
  log(`teardown: ${id ?? "(unknown)"}`);
  if (instanceId) {
    await awsImpl(["ec2", "terminate-instances", "--instance-ids", instanceId, "--region", region]).catch((e) => log(String(e.message)));
    await awsImpl(["ec2", "wait", "instance-terminated", "--instance-ids", instanceId, "--region", region]).catch((e) => log(String(e.message)));
  }
  if (keyName) await awsImpl(["ec2", "delete-key-pair", "--key-name", keyName, "--region", region]).catch((e) => log(String(e.message)));
  if (sgId) {
    await deleteSecurityGroupWithRetry({ sgId, instanceId, region, awsImpl, sleep }).catch((e) => log(String(e.message)));
  }
  if (network?.created) {
    await deleteDedicatedNetwork({ ...network, region, awsImpl, sleep }).catch((e) => log(String(e.message)));
  }
  const pem = keyPath ?? (keyName ? path.join(os.tmpdir(), `${keyName}.pem`) : null);
  if (pem) shred(pem);
  if (knownHosts) fs.rmSync(knownHosts, { force: true });
  else if (keyName) fs.rmSync(path.join(os.tmpdir(), `${keyName}.known_hosts`), { force: true });
}

/** run-id タグと名前から孤児リソースを探して消す（teardown コマンド用） */
export async function teardownByRunId(id, region, deps = {}) {
  assertRunId(id);
  const awsImpl = deps.awsImpl ?? aws;
  const sleep = deps.sleep ?? delay;
  const out = await awsImpl(["ec2", "describe-instances",
    "--filters", `Name=tag:${TAG_KEY},Values=${id}`,
    "Name=instance-state-name,Values=pending,running,stopping,stopped",
    "--region", region, "--query", "Reservations[].Instances[].InstanceId", "--output", "text"]);
  const ids = idsFromText(out);
  for (const instanceId of ids) {
    await awsImpl(["ec2", "terminate-instances", "--instance-ids", instanceId, "--region", region]).catch((e) => log(String(e.message)));
    await awsImpl(["ec2", "wait", "instance-terminated", "--instance-ids", instanceId, "--region", region]).catch((e) => log(String(e.message)));
  }
  await awsImpl(["ec2", "delete-key-pair", "--key-name", `lemma-tee-${id}`, "--region", region]).catch(() => {});
  const sgIds = new Set();
  for (const filter of [`Name=group-name,Values=lemma-tee-${id}`, `Name=tag:${TAG_KEY},Values=${id}`]) {
    const sg = await awsImpl(["ec2", "describe-security-groups", "--filters", filter,
      "--region", region, "--query", "SecurityGroups[].GroupId", "--output", "text"]).catch(() => "");
    for (const sgId of idsFromText(sg)) sgIds.add(sgId);
  }
  for (const sgId of sgIds) {
    await deleteSecurityGroupWithRetry({ sgId, region, awsImpl, sleep }).catch((e) => log(String(e.message)));
  }
  await deleteNetworksForRun({ id, region, awsImpl, sleep });
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

/** AWS cabundle は root → … → leaf の発行 CA。leaf → … → root にして検証する。 */
export function verifyChain(leafDer, bundleDers, rootPem, now = Date.now()) {
  const leaf = new X509Certificate(leafDer);
  const root = new X509Certificate(rootPem);
  if (!root.ca) return { ok: false, reason: "pinned root is not a CA" };
  const bundle = bundleDers.map((d) => new X509Certificate(d));
  if (!bundle.length || !bundle[0].raw.equals(root.raw)) {
    return { ok: false, reason: "cabundle must start with the pinned root" };
  }
  const chain = [leaf, ...bundle.slice(1).reverse()];
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

  // Nitro keeps certificate and cabundle in the signed payload; unprotected is empty.
  const [doc, docEnd] = cborDecode(payloadBstr);
  if (!(doc instanceof Map) || docEnd !== payloadBstr.length) return { ok: false, reason: "malformed payload" };
  const leafDer = doc.get("certificate");
  const bundleDers = doc.get("cabundle");
  if (!Buffer.isBuffer(leafDer)) return { ok: false, reason: "leaf certificate missing" };
  if (!Array.isArray(bundleDers) || !bundleDers.length || !bundleDers.every(Buffer.isBuffer)) {
    return { ok: false, reason: "cabundle malformed" };
  }
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

  if (doc.get("digest") !== "SHA384") return { ok: false, reason: "digest is not SHA384" };
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

/** ローカル検証の一括実行。独立した golden PCR と nonce の束縛を必須にする。 */
export function verifyBundle({
  attestationPath, pcrsPath, nonceHash, rootCertPem, zkeyIn, zkeyOut,
  goldenPath, buildDir, skipBuildCheck = false, now, maxSkewMs,
}) {
  if (!attestationPath || !pcrsPath) return { ok: false, reason: "attestation and pcrs paths are required" };
  const golden = readGolden(goldenPath);
  if (!golden.ok) return golden;
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
  const approved = pcrsMatch(golden.pcrs, att.pcrs);
  if (!approved.ok) return { ok: false, reason: "golden PCR mismatch", ...approved };
  if (!skipBuildCheck) {
    const dir = buildDir ?? path.join(HERE, "..", "enclave");
    const built = verifyBuildInputs(expected.build?.inputs, dir);
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

export async function phase2(opts, deps = {}) {
  const region = opts.region ?? "us-east-1";
  const instanceType = assertEnclaveInstanceType(opts["instance-type"] ?? DEFAULT_INSTANCE_TYPE);
  const resources = parseEnclaveResources(opts);
  const circuit = resolvePhase2Circuit(opts, deps);
  const { r1cs, zkeyIn, zkeyOut } = circuit;
  warnIfZkeyTooLarge(zkeyIn, enclaveMemoryLimitBytes(resources.memoryMb));
  log(`circuit ${zkeyIn} → ${zkeyOut}${circuit.ptau ? ` (ptau ${path.basename(circuit.ptau)})` : ""}`);

  if (opts["dry-run"]) {
    const steps = planLifecycle();
    steps.forEach((s, i) => log(`${i + 1}. ${s}`));
    log(`instance-type ${instanceType}, enclave ${resources.memoryMb} MiB / ${resources.cpu} CPU, client timeout ${resources.timeoutMs} ms`);
    return { dryRun: true, steps, instanceType, resources, circuit };
  }
  if (!fs.existsSync(r1cs)) throw new Error(`r1cs not found: ${r1cs}`);
  if (!fs.existsSync(zkeyIn)) throw new Error(`initial zkey not found: ${zkeyIn}`);

  const goldenPath = opts.golden ?? DEFAULT_GOLDEN;
  const golden = readGolden(goldenPath);
  if (!golden.ok) throw new Error(`golden PCR verification failed: ${golden.reason}. Supply independently measured PCR0/1/2 with --golden.`);

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

    log("scp: enclave バンドル + zkey を転送");
    await retry("ssh", () => exec("ssh", [...sshBase, host, "mkdir -p " + REMOTE_DIR]), 12, 5000);
    await exec("scp", [...sshBase, "-r", path.join(HERE, "..", "enclave"), `${host}:${REMOTE_DIR}/`], { timeout: SCP_TIMEOUT_MS });
    await exec("scp", [...sshBase, zkeyIn, `${host}:${REMOTE_DIR}/zkey_0000`], { timeout: SCP_TIMEOUT_MS });

    log(`remote: setup-and-run（enclave ${resources.memoryMb} MiB / ${resources.cpu} CPU）`);
    await exec("ssh", [...sshBase, host, remoteSetupCommand(REMOTE_DIR, resources)], { timeout: sshTimeoutFor(resources) });

    log("collect: 結果をステージしてから検証する");
    const stage = fs.mkdtempSync(path.join(os.tmpdir(), `cauldron-${res.id}-`));
    try {
      const stagedZkey = path.join(stage, "zkey_final");
      const stagedAtt = path.join(stage, "attestation.cbor");
      const stagedPcrs = path.join(stage, "pcrs.json");
      await exec("scp", [...sshBase, `${host}:${REMOTE_DIR}/out/zkey_final`, stagedZkey], { timeout: SCP_TIMEOUT_MS });
      await exec("scp", [...sshBase, `${host}:${REMOTE_DIR}/out/attestation.cbor`, stagedAtt], { timeout: SCP_TIMEOUT_MS });
      await exec("scp", [...sshBase, `${host}:${REMOTE_DIR}/out/pcrs.json`, stagedPcrs], { timeout: SCP_TIMEOUT_MS });

      log("verify: attestation（オフライン）");
      const enclaveDir = path.join(HERE, "..", "enclave");
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

      if (!opts["skip-zkey-verify"] && circuit.ptau) {
        log("verify: snarkjs zkey verify");
        await exec("npx", ["snarkjs", "zkey", "verify", r1cs, circuit.ptau, stagedZkey], { timeout: PHASE2_TIMEOUT_MS });
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
    const inputs = resolveVerifyInputs(opts);
    if (!inputs.attestationPath || !inputs.pcrsPath) throw new Error("--circuit is required, or pass both --attestation and --pcrs");
    const v = verifyBundle({
      attestationPath: inputs.attestationPath,
      pcrsPath: inputs.pcrsPath,
      nonceHash: opts["nonce-hash"],
      zkeyIn: inputs.zkeyIn,
      zkeyOut: inputs.zkeyOut,
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
