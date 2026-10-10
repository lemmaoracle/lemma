#!/usr/bin/env python3
"""nitro-cli describe-eif の JSON から PCR0/1/2 を取り出す。

新しい CLI は {"Measurements": {"PCR0": "...", ...}}、古い出力はトップレベルに
PCR* を置く。どちらも読み、48 byte (96 hex) でなければ失敗する。
"""
import json
import sys


def extract(doc):
    if not isinstance(doc, dict):
        raise SystemExit("describe-eif JSON is not an object")
    src = doc.get("Measurements") or doc.get("measurements") or doc
    if not isinstance(src, dict):
        raise SystemExit("describe-eif measurements are not an object")
    pcrs = {}
    for key, value in src.items():
        if not isinstance(key, str):
            continue
        name = key.upper()
        if not name.startswith("PCR") or not name[3:].isdigit():
            continue
        hexdigits = str(value).strip().lower().removeprefix("0x")
        if len(hexdigits) != 96 or any(c not in "0123456789abcdef" for c in hexdigits):
            raise SystemExit(f"{key} is not 48-byte hex")
        pcrs[name[3:]] = hexdigits
    missing = [k for k in ("0", "1", "2") if k not in pcrs]
    if missing:
        raise SystemExit("describe-eif missing PCR " + ",".join(missing))
    return {k: pcrs[k] for k in ("0", "1", "2")}


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: parse_pcrs.py <out.json>")
    data = extract(json.load(sys.stdin))
    with open(sys.argv[1], "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2)
        fh.write("\n")
    print(json.dumps(data))


if __name__ == "__main__":
    main()
