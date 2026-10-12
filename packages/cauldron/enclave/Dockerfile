# lemma-cauldron: zkey contribute を enclave 内で実行する最小イメージ。
# ベースイメージ、apk、npm、pip を固定する。PCR はこの入力集合に対して再現する。
FROM node:20.20.2-alpine3.22@sha256:8f47899606d000b0704e992f927fe7335adcd0d6c98851600072fb6e14a13e60

RUN apk add --no-cache \
      python3=3.12.15-r0 \
      py3-pip=25.1.1-r0 \
      socat=1.8.1.3-r0

COPY requirements.txt /tmp/requirements.txt
# --no-compile: pyc はビルド時刻依存のヘッダを持ち再現性を壊すため生成しない
RUN pip3 install --no-cache-dir --no-compile --break-system-packages --require-hashes --only-binary=:all: \
      -r /tmp/requirements.txt

WORKDIR /app
COPY package.json package-lock.json ./
# npm のキャッシュ/ログ(/root/.npm)は実行時刻を含むため同一 RUN で削除する（再現ビルド必須）
RUN npm ci --omit=dev --no-audit --no-fund && rm -rf /root/.npm
ENV PATH="/app/node_modules/.bin:${PATH}"

COPY serve.mjs attest.py entry.sh frame.mjs /app/
RUN chmod +x /app/entry.sh

# 再現ビルド: RUN レイヤーのファイル時刻は wall-clock で残るため、
# 全ファイルを SOURCE_DATE_EPOCH(1700000000) と同一の時刻へ正規化する。
RUN find / -xdev -exec touch -h -t 202311142213.20 {} + || true

ENTRYPOINT ["/app/entry.sh"]
