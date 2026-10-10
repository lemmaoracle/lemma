#!/usr/bin/env node
// 親側クライアント（EC2 の通常環境で動く）。vsock プロキシ経由で enclave に zkey を送り、
// zkey_final と attestation doc を受け取る。フレームは 4byte BE 長さ + 本体。

import fs from "node:fs";
import net from "node:net";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]);
    return acc;
  }, []),
);
const port = Number(args.port ?? 5000);
const zkeyIn = args.zkey;
const outDir = args.out ?? "out";

const frame = (buf) => {
  const h = Buffer.alloc(4);
  h.writeUInt32BE(buf.length);
  return Buffer.concat([h, buf]);
};

const readFrame = (socket) =>
  new Promise((resolve, reject) => {
    let state = "len"; let need = 4; let chunks = []; let got = 0;
    const onData = (c) => {
      chunks.push(c); got += c.length;
      if (got < need) return;
      const buf = Buffer.concat(chunks); chunks = []; got = 0;
      if (state === "len") {
        need = buf.readUInt32BE(0); state = "body";
        if (need === 0) { cleanup(); resolve(Buffer.alloc(0)); }
      } else {
        cleanup(); resolve(buf.subarray(0, need));
      }
    };
    const cleanup = () => socket.off("data", onData);
    socket.on("data", onData);
    socket.on("error", (e) => { cleanup(); reject(e); });
    socket.on("end", () => { cleanup(); reject(new Error("connection ended")); });
  });

const main = async () => {
  const zkey = fs.readFileSync(zkeyIn);
  console.error(`[client] zkey_0000 ${zkey.length} bytes`);
  const socket = net.connect({ host: "127.0.0.1", port });
  await new Promise((res, rej) => { socket.once("connect", res); socket.once("error", rej); });
  socket.write(frame(zkey));

  const zkeyFinal = await readFrame(socket);
  const attestation = await readFrame(socket);
  socket.end();

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(`${outDir}/zkey_final`, zkeyFinal);
  fs.writeFileSync(`${outDir}/attestation.cbor`, attestation);
  console.error(`[client] zkey_final ${zkeyFinal.length} bytes / attestation ${attestation.length} bytes → ${outDir}`);
};

main().catch((e) => { console.error(e); process.exit(1); });
