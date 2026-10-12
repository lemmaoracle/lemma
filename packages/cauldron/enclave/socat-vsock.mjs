// socat -hh に VSOCK アドレスが無ければ、このビルドでは enclave に繋げない。
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export function socatSupportsVsock(helpText) {
  // AL2023 の socat 1.7.4.2 は help を小文字(vsock-connect/vsock-listen)で出力するため大文字小文字を無視する
  const text = String(helpText ?? "").toUpperCase();
  return text.includes("VSOCK-CONNECT") && text.includes("VSOCK-LISTEN");
}

function main() {
  const text = fs.readFileSync(0, "utf8");
  if (!socatSupportsVsock(text)) {
    process.stderr.write("socat が VSOCK 非対応です。VSOCK-CONNECT と VSOCK-LISTEN を含むビルドが必要です。\n");
    process.exit(1);
  }
}

const isMain = (() => {
  if (!process.argv[1]) return false;
  try { return import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href; }
  catch { return false; }
})();
if (isMain) main();
