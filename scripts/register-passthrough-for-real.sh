#!/bin/bash
# 実際のパススルースキーマ登録手順
# ユーザーが実行するための完全な手順

set -e

echo "=============================================="
echo "🚀 パススルースキーマの実際の登録手順"
echo "=============================================="
echo ""

# ステップ1: 環境確認
echo "1. 環境変数の確認..."
if [ -f .env ]; then
  source .env
  echo "   ✅ .envファイルを読み込み"
else
  echo "   ❌ .envファイルがありません"
  echo "     以下の内容で .env ファイルを作成してください:"
  echo "     LEMMA_API_KEY=your_lemma_api_key_here"
  echo "     PINATA_API_KEY=your_pinata_api_key_here"
  echo "     PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here"
  exit 1
fi

if [ -z "$LEMMA_API_KEY" ]; then
  echo "   ❌ LEMMA_API_KEYが設定されていません"
  exit 1
fi
echo "   ✅ LEMMA_API_KEY: ${LEMMA_API_KEY:0:10}..."

# ステップ2: WASMビルド
echo ""
echo "2. WASMファイルのビルド..."
echo "   以下のコマンドを実行してください:"
echo ""
echo "   cd packages/passthrough"
echo "   ./scripts/build-wasm.sh"
echo ""
read -p "   WASMビルドは完了しましたか？ (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "   ⚠️  まずWASMをビルドしてください"
  exit 1
fi

# ステップ3: WASMハッシュ計算
echo ""
echo "3. WASMファイルのハッシュ計算..."
WASM_FILE="packages/passthrough/dist/wasm/passthrough.wasm"
if [ ! -f "$WASM_FILE" ]; then
  echo "   ❌ WASMファイルが見つかりません: $WASM_FILE"
  echo "     ビルドが正しく実行されたか確認してください"
  exit 1
fi

WASM_HASH=$(sha256sum "$WASM_FILE" | awk '{print "0x" $1}')
echo "   ✅ WASMファイル: $WASM_FILE"
echo "   ✅ ファイルサイズ: $(stat -c%s "$WASM_FILE") バイト"
echo "   ✅ SHA256ハッシュ: $WASM_HASH"

# ステップ4: IPFSアップロード（手動）
echo ""
echo "4. IPFSへのアップロード..."
echo "   以下の方法でWASMファイルをIPFSにアップロードしてください:"
echo ""
echo "   A) Pinataを使う場合:"
echo "      1. https://app.pinata.cloud/ にログイン"
echo "      2. 'Upload' → 'File' を選択"
echo "      3. $WASM_FILE をアップロード"
echo "      4. 取得したIPFSハッシュをメモ (例: Qm...)"
echo ""
echo "   B) コマンドラインの場合:"
echo "      curl -X POST https://api.pinata.cloud/pinning/pinFileToIPFS \\"
echo "        -H \"Authorization: Bearer $PINATA_API_KEY\" \\"
echo "        -H \"Content-Type: multipart/form-data\" \\"
echo "        -F \"file=@$WASM_FILE\""
echo ""
read -p "   IPFSハッシュを入力してください: " IPFS_HASH

if [ -z "$IPFS_HASH" ]; then
  echo "   ⚠️  プレースホルダーを使用します"
  IPFS_HASH="QmPLACEHOLDERFORTESTONLY"
fi

IPFS_URL="ipfs://$IPFS_HASH"
echo "   ✅ IPFS URL: $IPFS_URL"

# ステップ5: Lemma APIへの登録
echo ""
echo "5. Lemmaへのスキーマ登録..."
echo "   以下のcURLコマンドを実行してください:"
echo ""
cat << EOF
curl -X POST "https://api.lemma.oracle.com/api/v1/schemas" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $LEMMA_API_KEY" \\
  -d '{
    "schemaId": "passthrough-v1",
    "description": "Passthrough schema that returns input unchanged",
    "wasmHash": "$WASM_HASH",
    "wasmIpfsUrl": "$IPFS_URL",
    "metadata": {
      "type": "passthrough",
      "version": "1.0.0",
      "purpose": "Circuit compatibility when no transformation is needed"
    }
  }'
EOF
echo ""
echo "   または、上記のJSONをコピーしてAPIツールで実行してください。"
echo ""
echo "=============================================="
echo "🎉 手順完了!"
echo ""
echo "登録が成功すると、以下の情報が得られます:"
echo "   - Schema ID: passthrough-v1"
echo "   - WASM Hash: $WASM_HASH"
echo "   - IPFS URL: $IPFS_URL"
echo ""
echo "このスキーマをcircuitで参照できます:"
echo '   { "schema": "passthrough-v1", ... }'
echo "=============================================="