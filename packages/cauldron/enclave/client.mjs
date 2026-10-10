#!/usr/bin/env node
// 親側クライアント（EC2 の通常環境で動く）。vsock プロキシ経由で enclave に zkey を送り、
// zkey_final と attestation doc を受け取る。フレームは 4byte BE 長さ + 本体。

import fs from "node:fs";
import net from "node:net";
import { pathToFileURL } from "node:url";
import { readFrame, writeFrame } from "./frame.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]);
    return acc;
  }, []),
);

const main = async () => {
  const port = Number(args.port ?? 5000);
  const zkeyIn = args.zkey;
  const outDir = args.out ?? "out";
  const timeoutMs = Number(args["timeout-ms"] ?? 8 * 60 * 60 * 1000);
  if (!zkeyIn) throw new Error("usage: client.mjs --zkey <zkey_0000> --out <dir> [--port 5000] [--timeout-ms N]");
  if (!Number.isInteger(port) || port <= 0) throw new Error("invalid --port");
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error("invalid --timeout-ms");

  const zkey = fs.readFileSync(zkeyIn);
  console.error(`[client] zkey_0000 ${zkey.length} bytes`);
  const socket = net.connect({ host: "127.0.0.1", port });
  socket.setNoDelay(true);
  const timer = setTimeout(() => {
    socket.destroy(new Error(`vsock proxy timed out after ${timeoutMs}ms`));
  }, timeoutMs);
  try {
    await new Promise((res, rej) => { socket.once("connect", res); socket.once("error", rej); });
    await writeFrame(socket, zkey);
    const zkeyFinal = await readFrame(socket);
    const attestation = await readFrame(socket);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(`${outDir}/zkey_final`, zkeyFinal);
    fs.writeFileSync(`${outDir}/attestation.cbor`, attestation);
    console.error(`[client] zkey_final ${zkeyFinal.length} bytes / attestation ${attestation.length} bytes → ${outDir}`);
  } finally {
    clearTimeout(timer);
    if (!socket.destroyed) socket.end();
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
  main().catch((e) => { console.error(e.message || e); process.exit(1); });
}
