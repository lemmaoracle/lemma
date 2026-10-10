# lemma-tee-setup: zkey contribute を enclave 内で実行する最小イメージ。
# PCR0/1/2 はこのイメージのビルド結果に固定される（親側が manifest と照合する）。
FROM node:20-alpine

RUN apk add --no-cache python3 py3-pip socat
RUN npm install -g snarkjs@0.7.6
RUN pip3 install --quiet --break-system-packages aws-nitro-enclaves-attestation || \
    pip3 install --quiet aws-nitro-enclaves-attestation

WORKDIR /app
COPY serve.mjs attest.py entry.sh /app/
RUN chmod +x /app/entry.sh

ENTRYPOINT ["/app/entry.sh"]
