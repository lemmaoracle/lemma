#!/usr/bin/env python3
"""NSM(/dev/nsm) から attestation doc を取得して stdout に書き出す。
nonce は sha256(zkey_0000)||sha256(zkey_final) の 64 byte。親側が両方の zkey と照合する。
出典: aws-nitro-enclaves-attestation (AWS 公式 PyPI) を利用。
"""
import sys
import binascii

from aws_nitro_enclaves_attestation import AwsNitroEnclavesAttestation


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
    att = AwsNitroEnclavesAttestation()
    doc = att.get_attestation_document(nonce=nonce)
    sys.stdout.buffer.write(doc)


if __name__ == "__main__":
    main()
