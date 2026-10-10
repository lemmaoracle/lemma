# @lemmaoracle/tee-setup

Groth16 の trusted setup **Phase 2（`snarkjs zkey contribute`）を AWS Nitro Enclaves 内で実行**し、
attestation doc を証跡として残す TEE setup フロー。複数回路（seal / mizudako など）のビルドから共用する。

MPC セレモニーの代替として「toxic waste（貢献乱数）は enclave 内で生成・破棄された」ことを、
AWS Nitro Hypervisor 署名の attestation doc で示します。証明システムは **Groth16 のまま**です。

## 導入形（3つ）

1. **npm global install（推奨）** — 回路ビルドは sh（`build.sh` 等）なので、
   `npm i -g @lemmaoracle/tee-setup` で `tee-setup` コマンドを置き、シェルから呼ぶ。
   どのリポジトリ・どの回路からも同じコマンドが使える。

   ```bash
   # build.sh（回路ごと）から
   tee-setup phase2 --r1cs "$BUILD_DIR/$CIRCUIT_NAME.r1cs" \
     --zkey-in "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey" \
     --zkey-out "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
     --ptau "$PTAU"
   ```

2. **コピー実行（オフライン・手軽）** — `scripts/tee-setup.mjs` はゼロ依存の単一ファイル。
   回路リポジトリへ `cp` して `node tee-setup.mjs …` で動く。npm インストール不要。
3. **workspace 参照** — 同一 monorepo かつ pnpm-workspace のメンバーであれば
   `"@lemmaoracle/tee-setup": "workspace:*"` で依存できる。
   `packages/seal/circuits` のようなネスト階層や別リポジトリからは使えない。

## 使い方

```bash
# 一括: provision → enclave 内 contribute → オフライン検証 → teardown
# （global install 後は tee-setup、未導入なら node scripts/tee-setup.mjs）
tee-setup phase2 \
  --r1cs circuit.r1cs --zkey-in circuit_0000.zkey --zkey-out circuit_final.zkey \
  --ptau pot17_final.ptau          # 付けると snarkjs zkey verify も実行

# 手順の確認だけ（AWS に触れない）
node tee-setup.mjs phase2 --dry-run --r1cs X --zkey-in Y --zkey-out Z

# 後から誰でも再検証（AWS API 不要）
# nonce = sha256(zkey_0000) || sha256(zkey_final)。入力だけのハッシュでは通らない。
# 同じ入出力 zkey を再提示したとき nonce が一致するのは、結び付きとして正しい。
# attestation の timestamp は検証時刻の ±15 分。過去の証跡は --now <epoch-ms> でその時刻に合わせる。
node tee-setup.mjs verify \
  --attestation circuit_final.zkey.attestation.cbor \
  --pcrs circuit_final.zkey.pcrs.json \
  --zkey-in circuit_0000.zkey \
  --zkey-out circuit_final.zkey \
  --golden enclave/expected-pcrs.json   # 計測済みのときだけ。未計測プレースホルダは失敗する

# 孤児リソースの掃除
node tee-setup.mjs teardown --run-id <id>
```

成果物: `zkey_final` / `zkey_final.attestation.cbor` / `zkey_final.pcrs.json`。
attestation doc と PCR manifest は zkey と同じ台帳に置いてください（誰でも再検証できる証跡）。
zkey の転送は 4 byte の長さ前置で、1GiB を超えるフレームは拒否します（想定する zkey は約 650MB まで）。リモート実行の待ちは最大 10 時間です。

## 何が起きるか

1. keypair（名前 `lemma-tee-<run-id>`）・security group・EC2（enclave 対応）を**ゼロから作成**。instance と security group にはタグ `lemma-tee-setup=<run-id>` を付ける
2. enclave イメージをビルド → `nitro-cli build-enclave` → **PCR0/1/2 の期待測定値を manifest に保存**
3. enclave 起動 → vsock 経由で `zkey_0000` を送信
4. enclave 内: CSPRNG で `zkey contribute`（乱数は snarkjs の stdin。`-e` には載せない）→ `sha256(zkey_0000) || sha256(zkey_final)` を nonce に NSM attestation doc を取得
5. 帰ってきた `zkey_final` + attestation を**オフライン検証**（COSE_Sign1 / ES384 の raw 署名 → ピン留めしたルートへの証明書チェーン → PCR0/1/2 → ゴールデン PCR → ビルド入力ハッシュ → nonce → timestamp）。検証が通るまで `zkey_out` には書き出さない
6. **teardown（失敗時も、keypair や security group だけ作れた段階でも実行）**: instance 終了 → ENI が外れるまで待って keypair / security group 削除

## trust model の留保

- **AWS Nitro が信頼の中心点**（中央集権的な信頼の置き場）。対外説明では必ず明記する。
- 検証は **PCR0 のみでなく PCR0/1/2 を見る**（PCR0 だけでは入れ子イメージの差を検知できない）。
  ホストが書いた `pcrs.json` は、そのインスタンスがビルドした EIF の自己申告です。独立した照合はリポジトリの `enclave/expected-pcrs.json`（`--golden`）です。
- nonce は入力と出力の両方に結ぶ。親インスタンスは vsock の中継なので、入力ハッシュだけでは `zkey_final` をすり替えられる。
  **同じ入出力 zkey への attestation の再提示は、この結び付きとして正しい**（timestamp 窓の外なら `--now` で当時の時刻を指定する）。
- 既定のルート証明書はソースに指紋をピン留めしてある。`--root-cert` はテスト用で、渡した PEM が新しい信頼の起点になる。
- 証明書は CA ビットと keyUsage に加え、EKU と name constraints を見る。attestation の leaf に TLS の serverAuth / clientAuth があってはならない。name constraints は CA が拡張を載せているときだけ適用する（AWS のルートには無い）。
- zkey サイズから必要メモリを `zkey × 16 + 512MiB` で見積もり、enclave の 8GiB を超えそうなら実行前に警告する。650MB 級の実 Nitro 計測はまだ無い。警告は見積もりであり、実行は止めない。
- EIF のメタデータは attestation されない。サイドチャネルは脅威モデル外（業界標準と同じ）。
- 二重化: contribute の後に `snarkjs zkey beacon`（公開ランダムネスでの finalize）を掛けると、
  「AWS か beacon のどちらか一方が誠実なら安全」という MPC と同型の保証になる（推奨）。

## 必要な AWS 権限

`ec2:CreateKeyPair` / `DeleteKeyPair` / `CreateSecurityGroup` / `DeleteSecurityGroup` /
`AuthorizeSecurityGroupIngress` / `RunInstances` / `TerminateInstances` / `DescribeInstances` /
`DescribeSecurityGroups` / `DescribeNetworkInterfaces` / `ssm:GetParameter`。インスタンスには IAM ロールを付けず、IMDS も止める。KMS は不要（鍵を持たない設計）。
検証（`verify`）には AWS 権限すら不要。

## 検証に使うルート証明書

`certs/aws-nitro-root.pem` は AWS 公式配布の **AWS_NitroEnclaves_Root-G1**（subject: `CN=aws.nitro-enclaves`）。
出典: <https://aws-nitro-enclaves.amazonaws.com/AWS_NitroEnclaves_Root-G1.zip>
（AWS ドキュメント「Verifying the root of trust」記載の公開 CA）。
SHA-256 指紋: `64:1A:03:21:A3:E2:44:EF:E4:56:46:31:95:D6:06:31:7E:D7:CD:CC:3C:17:56:E0:98:93:F3:C6:8F:79:BB:5B`

## 第三者が EIF を再ビルドして PCR を確認する

`enclave/expected-pcrs.json` は未計測のあいだ `measured: false` で、PCR0/1/2 は `null` です。このファイルを `--golden` に渡すと検証は失敗します（プレースホルダを期待値として通さない）。

1. `enclave/` の Dockerfile、`package-lock.json`、`requirements.txt` が手元のファイルと一致することを確認する。`verify` は manifest の `build.inputs`（各ファイルの SHA-256）をローカルの `enclave/` と照合する。意図的に外すときは `--skip-build-check`。
2. イメージの入力は固定してある。ベースは `node:20.20.2-alpine3.22@sha256:8f47899606d000b0704e992f927fe7335adcd0d6c98851600072fb6e14a13e60`。apk は `python3=3.12.15-r0`、`py3-pip=25.1.1-r0`、`socat=1.8.1.3-r0`。npm は同梱の `package-lock.json` で `npm ci`。pip は `requirements.txt` の `==` と `--require-hashes`。
3. Nitro Enclaves 対応のインスタンスで `enclave/setup-and-run.sh` と同じ順に `docker build` と `nitro-cli build-enclave` を実行し、`nitro-cli describe-eif` の PCR0/1/2 を読む。
4. 読んだ 96 hex を `enclave/expected-pcrs.json` の `pcrs` に書き、`measured` を `true` にする。`build.inputs` はそのビルドに使ったファイルのハッシュのまま残す。
5. `tee-setup verify --attestation … --pcrs … --zkey-in … --zkey-out … --golden enclave/expected-pcrs.json` で、ホスト manifest とゴールデンの両方を attestation の PCR と照合する。

ホストが返した manifest だけを見ると、同じ親インスタンスの自己比較になります。ゴールデンが未計測の本番実行は警告を出してホスト manifest だけで進みます。

## テスト

`pnpm --filter @lemmaoracle/tee-setup test`（vitest・実 AWS は呼ばない。
COSE_Sign1 検証は openssl 生成のテスト用チェーンで確認）。
