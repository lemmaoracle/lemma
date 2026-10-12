#!/usr/bin/env bash
# EC2（Nitro Enclaves 対応インスタンス）上で実行する側。
# docker で EIF をビルド → enclave 内で zkey contribute → vsock 経由で回収。
set -euo pipefail

cd "$(dirname "$0")/.."          # remoteDir (= /home/ec2-user/cauldron)
OUT="$PWD/out"
mkdir -p "$OUT"
# m6i.xlarge has 4 vCPU / 16 GiB. Leave CPUs for the parent OS (giving it all 4 makes the allocator fail).
ENCLAVE_MEMORY_MB="${ENCLAVE_MEMORY_MB:-8192}"
ENCLAVE_CPU="${ENCLAVE_CPU:-2}"
# contribute 中は vsock が無通信になる。650MB 級の zkey でも足りる総時間。
CLIENT_TIMEOUT_MS="${CLIENT_TIMEOUT_MS:-28800000}"

case "$ENCLAVE_MEMORY_MB" in ''|*[!0-9]*) echo "invalid ENCLAVE_MEMORY_MB" >&2; exit 1 ;; esac
case "$ENCLAVE_CPU" in ''|*[!0-9]*) echo "invalid ENCLAVE_CPU" >&2; exit 1 ;; esac
case "$CLIENT_TIMEOUT_MS" in ''|*[!0-9]*) echo "invalid CLIENT_TIMEOUT_MS" >&2; exit 1 ;; esac

echo "→ 依存の導入（docker / nitro-cli / devel blobs / socat / python / node）"
# nitro-cli はディストリのパッケージを使う。GitHub latest の生バイナリは取らない。
# aws-nitro-enclaves-cli-devel は build-enclave に要する boot blobs(bzImage/cmdline/init)。
dnf install -y docker aws-nitro-enclaves-cli aws-nitro-enclaves-cli-devel socat python3 nodejs20 \
  || dnf install -y docker aws-nitro-enclaves-cli aws-nitro-enclaves-cli-devel socat python3 nodejs
systemctl enable --now docker
if ! command -v node >/dev/null 2>&1 && command -v node-20 >/dev/null 2>&1; then
  ln -sfn "$(command -v node-20)" /usr/local/bin/node
fi
modprobe nitro_enclaves || true

echo "→ socat の VSOCK 対応を確認"
SOCAT_HELP=$(socat -hh 2>&1 || true)
printf '%s' "$SOCAT_HELP" | node enclave/socat-vsock.mjs

echo "→ enclave allocator (${ENCLAVE_CPU} CPU / ${ENCLAVE_MEMORY_MB} MiB)"
mkdir -p /etc/nitro_enclaves
cat > /etc/nitro_enclaves/allocator.yaml <<EOF
---
memory_mib: ${ENCLAVE_MEMORY_MB}
cpu_count: ${ENCLAVE_CPU}
EOF
systemctl enable --now nitro-enclaves-allocator.service
systemctl restart nitro-enclaves-allocator.service

echo "→ docker イメージ build（再現ビルド: buildx + SOURCE_DATE_EPOCH + no-cache）"
# PCR を golden と一致させるにはビルドの再現性が必須。
# SOURCE_DATE_EPOCH は buildx 経由でのみレイヤー時刻を正規化する（docker build では無効）。
# npm のキャッシュ/ログは Dockerfile 側で同一 RUN により削除される。
export SOURCE_DATE_EPOCH=1700000000
docker buildx build --no-cache -q -t lemma-tee-contribute enclave

echo "→ EIF build"
nitro-cli build-enclave --docker-uri lemma-tee-contribute --output-file "$OUT/lemma-tee.eif"

echo "→ PCR manifest（期待測定値とビルド入力ハッシュ）を保存"
nitro-cli describe-eif --eif-path "$OUT/lemma-tee.eif" | python3 enclave/parse_pcrs.py "$OUT/pcrs.json"
node enclave/hash-build-inputs.mjs enclave "$OUT/pcrs.json"

# BUILD_ONLY=1: golden 計測用。ビルド〜manifest までで止める（enclave 実行は行わない）。
if [ "${BUILD_ONLY:-0}" = "1" ]; then
  echo "✓ build-only done: $OUT/pcrs.json"
  exit 0
fi

EID=""
PROXY_PID=""
CONSOLE_PID=""
cleanup() {
  if [ -n "${CONSOLE_PID}" ]; then kill "$CONSOLE_PID" 2>/dev/null || true; fi
  if [ -n "${PROXY_PID}" ]; then kill "$PROXY_PID" 2>/dev/null || true; fi
  if [ -n "${EID}" ]; then nitro-cli terminate-enclave --enclave-id "$EID" >/dev/null 2>&1 || true; fi
  # ID 解析に失敗しても、起動済みの enclave を describe して止める。
  nitro-cli describe-enclaves 2>/dev/null | python3 enclave/parse_run.py stop || true
  # 失敗原因の切り分けに enclave 内部の stderr を必ず持ち帰る。
  if [ -s "$OUT/console.log" ]; then echo "--- enclave console ---" >&2; cat "$OUT/console.log" >&2 || true; fi
}
trap cleanup EXIT

echo "→ enclave 起動"
RUN=$(nitro-cli run-enclave --cpu-count "$ENCLAVE_CPU" --memory "$ENCLAVE_MEMORY_MB" \
  --eif-path "$OUT/lemma-tee.eif" --enclave-cid 16)
META=$(printf '%s' "$RUN" | python3 enclave/parse_run.py run)
EID=$(printf '%s\n' "$META" | sed -n '1p')
CID=$(printf '%s\n' "$META" | sed -n '2p')
case "$CID" in ''|*[!0-9]*) echo "invalid EnclaveCID" >&2; exit 1 ;; esac

echo "→ enclave console 記録開始"
nitro-cli console --enclave-id "$EID" > "$OUT/console.log" 2>&1 &
CONSOLE_PID=$!

echo "→ vsock プロキシ起動（127.0.0.1:5000 → enclave vsock:${CID}:5001）"
# nitro-cli に vsock-proxy は無い。親から enclave へは socat で繋ぎ、待受は loopback だけ。
socat TCP-LISTEN:5000,bind=127.0.0.1,reuseaddr,fork "VSOCK-CONNECT:${CID}:5001" &
PROXY_PID=$!
sleep 1
kill -0 "$PROXY_PID"

echo "→ contribute（enclave 内で実行・乱数は enclave 内 CSPRNG）"
HEAP_MB=$(node --input-type=module -e 'import { enclaveHeapMb } from "./enclave/frame.mjs"; process.stdout.write(String(enclaveHeapMb(Number(process.env.ENCLAVE_MEMORY_MB))))')
case "$HEAP_MB" in ''|*[!0-9]*) echo "invalid enclave heap" >&2; exit 1 ;; esac
node enclave/client.mjs --port 5000 --zkey zkey_0000 --out "$OUT" --timeout-ms "$CLIENT_TIMEOUT_MS" --max-old-space-size "$HEAP_MB"

echo "✓ done: $OUT/{zkey_final,attestation.cbor,pcrs.json}"
