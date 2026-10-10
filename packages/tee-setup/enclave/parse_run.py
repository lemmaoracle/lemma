#!/usr/bin/env python3
"""nitro-cli run-enclave / describe-enclaves の出力を読む。

run-enclave はログ行の後ろに JSON を出すことがある。先頭のゴミを飛ばして
最初の JSON 値だけを読む。解析できなくても describe-enclaves の列挙で止める。
"""
import json
import subprocess
import sys


def parse_json_value(text):
    start_obj = text.find("{")
    start_arr = text.find("[")
    candidates = [i for i in (start_obj, start_arr) if i >= 0]
    if not candidates:
        raise ValueError("no JSON value")
    doc, _end = json.JSONDecoder().raw_decode(text[min(candidates):])
    return doc


def parse_run_output(text):
    doc = parse_json_value(text)
    if not isinstance(doc, dict):
        raise ValueError("run-enclave JSON is not an object")
    eid = doc.get("EnclaveID")
    cid = doc.get("EnclaveCID")
    if eid is None or cid is None:
        raise ValueError("run-enclave JSON missing EnclaveID or EnclaveCID")
    if not str(cid).isdigit():
        raise ValueError("invalid EnclaveCID")
    return str(eid), str(cid)


def enclave_ids_from_describe(doc):
    if isinstance(doc, list):
        items = doc
    elif isinstance(doc, dict) and isinstance(doc.get("Enclaves"), list):
        items = doc["Enclaves"]
    elif isinstance(doc, dict) and doc.get("EnclaveID"):
        items = [doc]
    else:
        items = []
    ids = []
    for item in items:
        if isinstance(item, dict) and item.get("EnclaveID"):
            ids.append(str(item["EnclaveID"]))
    return ids


def main() -> None:
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    raw = sys.stdin.read()
    if mode == "run":
        eid, cid = parse_run_output(raw)
        print(eid)
        print(cid)
        return
    if mode == "stop":
        if not raw.strip():
            return
        try:
            doc = parse_json_value(raw)
        except ValueError:
            return
        for eid in enclave_ids_from_describe(doc):
            subprocess.run(
                ["nitro-cli", "terminate-enclave", "--enclave-id", eid],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
        return
    raise SystemExit("usage: parse_run.py run|stop")


if __name__ == "__main__":
    main()
