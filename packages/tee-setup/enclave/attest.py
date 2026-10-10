#!/usr/bin/env python3
"""NSM(/dev/nsm) から attestation doc を取得して stdout に書き出す。
nonce は「入力 zkey_0000 の SHA-256（hex）」で、親側が zkey との結び付きを検証する。
出典: aws-nitro-enclaves-attestation (AWS 公式 PyPI) を利用。
"""
import sys
import binascii

from aws_nitro_enclaves_attestation import AwsNitroEnclavesAttestation


def main() -> None:
    nonce_hex = sys.argv[1]
    nonce = binascii.unhexlify(nonce_hex)
    att = AwsNitroEnclavesAttestation()
    doc = att.get_attestation_document(nonce=nonce)
    sys.stdout.buffer.write(doc)


if __name__ == "__main__":
    main()
