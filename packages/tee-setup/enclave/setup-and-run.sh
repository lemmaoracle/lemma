#!/usr/bin/env bash
# EC2（Nitro Enclaves 対応インスタンス）上で実行する側。
# docker で EIF をビルド → enclave 内で zkey contribute → vsock 経由で回収。
set -euo pipefail

cd "$(dirname "$0")/.."          # remoteDir (= /home/ec2-user/tee-setup)
OUT="$PWD/out"
mkdir -p "$OUT"
ENCLAVE_MEMORY_MB="${ENCLAVE_MEMORY_MB:-8192}"
ENCLAVE_CPU="${ENCLAVE_CPU:-4}"

echo "→ 依存の導入（docker / nitro-cli / socat / python / node）"
dnf install -y docker socat python3 python3-pip nodejs20 >/dev/null 2>&1 || dnf install -y docker socat python3 python3-pip nodejs >/dev/null
systemctl enable --now docker
python3 -m pip install --quiet --break-system-packages aws-nitro-enclaves-attestation || \
  python3 -m pip install --quiet aws-nitro-enclaves-attestation

if ! command -v nitro-cli >/dev/null; then
  curl -fsSL -o /usr/local/bin/nitro-cli \
    "https://github.com/aws/aws-nitro-enclaves-cli/releases/latest/download/nitro-cli-linux-amd64"
  chmod +x /usr/local/bin/nitro-cli
fi

echo "→ docker イメージ build"
docker build -q -t lemma-tee-contribute enclave

echo "→ EIF build"
nitro-cli build-enclave --docker-uri lemma-tee-contribute --output-file "$OUT/lemma-tee.eif" >/dev/null

echo "→ PCR manifest（期待測定値）を保存"
nitro-cli describe-eif --eif-path "$OUT/lemma-tee.eif" | python3 -c '
import json, sys
d = json.load(sys.stdin)
pcrs = {k.removeprefix("PCR"): str(v) for k, v in d.items() if k.startswith("PCR")}
json.dump({k: pcrs[k] for k in ("0", "1", "2") if k in pcrs}, open("'"$OUT"'/pcrs.json", "w"), indent=2)
print(json.dumps(pcrs))'

echo "→ enclave 起動"
RUN=$(nitro-cli run-enclave --cpu-count "$ENCLAVE_CPU" --memory "$ENCLAVE_MEMORY_MB" \
  --eif-path "$OUT/lemma-tee.eif" --enclave-cid 16)
EID=$(echo "$RUN" | python3 -c 'import json,sys; print(json.load(sys.stdin)["EnclaveID"])')
trap 'nitro-cli terminate-enclave --enclave-id "$EID" >/dev/null 2>&1 || true' EXIT

echo "→ vsock プロキシ起動（host:5000 → enclave vsock:5001）"
nitro-cli vsock-proxy 5000 5001 &
PROXY_PID=$!
sleep 2

echo "→ contribute（enclave 内で実行・乱数は enclave 内 CSPRNG）"
node enclave/client.mjs --port 5000 --zkey zkey_0000 --out "$OUT"

kill "$PROXY_PID" 2>/dev/null || true
echo "✓ done: $OUT/{zkey_final,attestation.cbor,pcrs.json}"
