// 長さ前置のフレーム (4 byte big-endian + 本体)。
// 32bit 長の上限は 4GiB だが、zkey は最大 ~650MB なので 1GiB で打ち切る。
// 1 回の data イベントに長さと本体が混ざっても、次のフレームのバイトを捨てない。

import { createHash } from "node:crypto";

export const MAX_FRAME = 1024 * 1024 * 1024;

const readers = new WeakMap();

export function frame(buf) {
  const body = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  if (body.length > MAX_FRAME) throw new Error(`frame exceeds ${MAX_FRAME} bytes`);
  const head = Buffer.alloc(4);
  head.writeUInt32BE(body.length, 0);
  return Buffer.concat([head, body]);
}

export function writeAll(stream, buf) {
  return new Promise((resolve, reject) => {
    stream.write(buf, (err) => (err ? reject(err) : resolve()));
  });
}

/** 650MB 級を余分にコピーしないよう、長さと本体を別々に書く。 */
export async function writeFrame(stream, buf) {
  const body = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  if (body.length > MAX_FRAME) throw new Error(`frame exceeds ${MAX_FRAME} bytes`);
  const head = Buffer.alloc(4);
  head.writeUInt32BE(body.length, 0);
  await writeAll(stream, head);
  if (body.length) await writeAll(stream, body);
}

function createReader(stream) {
  const chunks = [];
  let buffered = 0;
  let waiter = null;
  let ended = false;
  let failed = null;

  const take = (n) => {
    const out = Buffer.alloc(n);
    let filled = 0;
    while (filled < n) {
      const c = chunks[0];
      const ntake = Math.min(c.length, n - filled);
      c.copy(out, filled, 0, ntake);
      filled += ntake;
      if (ntake === c.length) chunks.shift();
      else chunks[0] = c.subarray(ntake);
    }
    buffered -= n;
    return out;
  };

  const pump = () => {
    if (!waiter || buffered < waiter.n) return;
    const w = waiter;
    waiter = null;
    w.resolve(take(w.n));
  };

  stream.on("data", (c) => {
    if (c.length) {
      chunks.push(c);
      buffered += c.length;
    }
    pump();
  });
  stream.on("error", (e) => {
    failed = e;
    if (!waiter) return;
    const w = waiter;
    waiter = null;
    w.reject(e);
  });
  stream.on("end", () => {
    ended = true;
    if (!waiter || buffered >= waiter.n) return;
    const w = waiter;
    waiter = null;
    w.reject(new Error("connection ended"));
  });

  const readExact = (n) => new Promise((resolve, reject) => {
    if (failed) { reject(failed); return; }
    if (buffered >= n) { resolve(take(n)); return; }
    if (ended) { reject(new Error("connection ended")); return; }
    if (waiter) { reject(new Error("concurrent read")); return; }
    waiter = { n, resolve, reject };
  });

  return { readExact };
}

function readerFor(stream) {
  let reader = readers.get(stream);
  if (!reader) {
    reader = createReader(stream);
    readers.set(stream, reader);
  }
  return reader;
}

export async function readFrame(stream, maxBytes = MAX_FRAME) {
  const reader = readerFor(stream);
  const lenBuf = await reader.readExact(4);
  const len = lenBuf.readUInt32BE(0);
  if (len > maxBytes) throw new Error(`frame too large: ${len} > ${maxBytes}`);
  if (len === 0) return Buffer.alloc(0);
  return reader.readExact(len);
}

/** nonce = sha256(zkey_in) || sha256(zkey_out)。serve.mjs と tee-setup.mjs が同じ形にする。 */
export function commitmentNonceHex(zkeyIn, zkeyOut) {
  const a = createHash("sha256").update(zkeyIn).digest();
  const b = createHash("sha256").update(zkeyOut).digest();
  return Buffer.concat([a, b]).toString("hex");
}
