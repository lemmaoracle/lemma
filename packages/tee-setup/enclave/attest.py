#!/usr/bin/env python3
"""NSM(/dev/nsm) から attestation doc を取得して stdout に書き出す。

nonce は sha256(zkey_0000)||sha256(zkey_final) の 64 byte。親側が両方の zkey と照合する。
NSM ioctl は aws-nsm-interface（PyPI、requirements.txt でハッシュ固定）を使う。
"""
import sys
import binascii

from aws_nsm_interface import close_nsm_device, get_attestation_doc, open_nsm_device


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: attest.py <nonce-hex>")
    nonce_hex = sys.argv[1]
    if len(nonce_hex) % 2 or any(c not in "0123456789abcdefABCDEF" for c in nonce_hex):
        raise SystemExit("nonce must be even-length hex")
    nonce = binascii.unhexlify(nonce_hex)
    # NSM の nonce 上限は 512 byte。空 nonce は zkey との結び付きが無い。
    if not nonce or len(nonce) > 512:
        raise SystemExit("nonce length must be 1..512 bytes")
    handle = open_nsm_device()
    try:
        result = get_attestation_doc(handle, nonce=nonce)
    finally:
        close_nsm_device(handle)
    document = result["document"] if isinstance(result, dict) else result
    if not isinstance(document, (bytes, bytearray)):
        raise SystemExit("NSM attestation document was not bytes")
    sys.stdout.buffer.write(document)


if __name__ == "__main__":
    main()
