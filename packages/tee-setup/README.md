# @lemmaoracle/tee-setup

Groth16 の trusted setup **Phase 2（`snarkjs zkey contribute`）を AWS Nitro Enclaves 内で実行**し、
attestation doc を証跡として残す TEE setup フロー。複数回路（seal / mizudako など）のビルドから共用する。

MPC セレモニーの代替として「toxic waste（貢献乱数）は enclave 内で生成・破棄された」ことを、
AWS Nitro Hypervisor 署名の attestation doc で示します。証明システムは **Groth16 のまま**です。

## 導入形（3つ）

1. **コピー実行（推奨・別リポジトリから）** — `scripts/tee-setup.mjs` はゼロ依存の単一ファイル。
   回路リポジトリへ `cp` して `node tee-setup.mjs …` で動く。npm インストール不要。
2. **workspace 参照** — 同一 monorepo かつ pnpm-workspace のメンバーであれば
   `"@lemmaoracle/tee-setup": "workspace:*"` で依存できる。
   `packages/seal/circuits` のようなネスト階層や別リポジトリからは使えない
   （このパッケージも単一ファイル設計にしてあるのはこのため）。
3. **npm 公開後** — `npx @lemmaoracle/tee-setup …`（将来）。

## 使い方

```bash
# 一括: provision → enclave 内 contribute → オフライン検証 → teardown
node tee-setup.mjs phase2 \
  --r1cs circuit.r1cs --zkey-in circuit_0000.zkey --zkey-out circuit_final.zkey \
  --ptau pot17_final.ptau          # 付けると snarkjs zkey verify も実行

# 手順の確認だけ（AWS に触れない）
node tee-setup.mjs phase2 --dry-run --r1cs X --zkey-in Y --zkey-out Z

# 後から誰でも再検証（AWS API 不要）
node tee-setup.mjs verify \
  --attestation circuit_final.zkey.attestation.cbor \
  --pcrs circuit_final.zkey.pcrs.json \
  --nonce-hash <sha256(zkey_0000) の hex>

# 孤児リソースの掃除
node tee-setup.mjs teardown --run-id <id>
```

成果物: `zkey_final` / `zkey_final.attestation.cbor` / `zkey_final.pcrs.json`。
attestation doc と PCR manifest は zkey と同じ台帳に置いてください（誰でも再検証できる証跡）。

## 何が起きるか

1. keypair・security group・EC2（enclave 対応、タグ `lemma-tee-setup=<run-id>`）を**ゼロから作成**
2. enclave イメージをビルド → `nitro-cli build-enclave` → **PCR0/1/2 の期待測定値を manifest に保存**
3. enclave 起動 → vsock 経由で `zkey_0000` を送信
4. enclave 内: CSPRNG で `zkey contribute` → 入力 zkey の SHA-256 を nonce に NSM attestation doc を取得
5. 帰ってきた `zkey_final` + attestation を**オフライン検証**（COSE_Sign1 署名 → 証明書チェーン → PCR0/1/2 → nonce）
6. **teardown（失敗時も必ず実行）**: instance 終了 → keypair / security group 削除

## trust model の留保

- **AWS Nitro が信頼の中心点**（中央集権的な信頼の置き場）。対外説明では必ず明記する。
- 検証は **PCR0 のみでなく PCR0/1/2 を見る**（PCR0 だけでは入れ子イメージの差を検知できない）。
- EIF のメタデータは attestation されない。サイドチャネルは脅威モデル外（業界標準と同じ）。
- 二重化: contribute の後に `snarkjs zkey beacon`（公開ランダムネスでの finalize）を掛けると、
  「AWS か beacon のどちらか一方が誠実なら安全」という MPC と同型の保証になる（推奨）。

## 必要な AWS 権限

`ec2:CreateKeyPair` / `DeleteKeyPair` / `CreateSecurityGroup` / `DeleteSecurityGroup` /
`AuthorizeSecurityGroupIngress` / `RunInstances` / `TerminateInstances` / `DescribeInstances` /
`DescribeSecurityGroups` / `ssm:GetParameter`。KMS は不要（鍵を持たない設計）。
検証（`verify`）には AWS 権限すら不要。

## 検証に使うルート証明書

`certs/aws-nitro-root.pem` は AWS 公式配布の **AWS_NitroEnclaves_Root-G1**（subject: `CN=aws.nitro-enclaves`）。
出典: <https://aws-nitro-enclaves.amazonaws.com/AWS_NitroEnclaves_Root-G1.zip>
（AWS ドキュメント「Verifying the root of trust」記載の公開 CA）。
SHA-256 指紋: `64:1A:03:21:A3:E2:44:EF:E4:56:46:31:95:D6:06:31:7E:D7:CD:CC:3C:17:56:E0:98:93:F3:C6:8F:79:BB:5B`

## テスト

`pnpm --filter @lemmaoracle/tee-setup test`（vitest・実 AWS は呼ばない。
COSE_Sign1 検証は openssl 生成のテスト用チェーンで確認）。
