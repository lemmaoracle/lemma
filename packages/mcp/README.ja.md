# `@lemmaoracle/mcp`

`@lemmaoracle/mcp` は Lemma の検証済み属性 (verified attributes) にアクセスするための MCP (Model Context Protocol) サーバーです。

## Claude Desktop 設定例

```json
{
  "mcpServers": {
    "lemma": {
      "command": "npx",
      "args": ["-y", "@lemmaoracle/mcp"],
      "env": {
        "LEMMA_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

補足: `LEMMA_API_BASE` は省略可能です（省略時は本番エンドポイント）。

## ツール一覧

| ツール | フェーズ | 説明 |
|---|---|---|
| `lemma_query_verified_attributes` | MVP | Lemma Oracle から暗号学的に検証された属性を問い合わせる |
| `lemma_get_schema` | MVP | ID からスキーマのメタデータを取得する |
| `lemma_get_circuit` | MVP | ID から ZK 回路のメタデータを取得する |
| `lemma_get_generator` | MVP | ID からドキュメントジェネレータのメタデータを取得する |
| `lemma_get_proof_status` | MVP | `verificationId` から proof の検証状態を取得する |
| `lemma_register_document` | Phase 2 | Lemma に新しいドキュメントを登録する |
| `lemma_submit_proof` | Phase 2 | 検証用の ZK proof を送信する |

書き込み系ツール（`register_document`, `submit_proof`）は Phase 2 です。

## ローカル開発

npm に公開されるまでは、このモノレポからローカルビルドで動かしてください。

```bash
git clone https://github.com/lemmaoracle/lemma.git
cd lemma
pnpm install
pnpm -F @lemmaoracle/mcp build
```

`bin` エントリは `packages/mcp/dist/index.js` を出力します。Claude Desktop からは絶対パスで指定してください:

```json
{
  "mcpServers": {
    "lemma": {
      "command": "node",
      "args": ["/absolute/path/to/lemma/packages/mcp/dist/index.js"],
      "env": {
        "LEMMA_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

変更したあとは `pnpm -F @lemmaoracle/mcp build` で再ビルドし、Claude Desktop を再起動して接続し直してください。本番以外のエンドポイントに向ける場合は `env` に `"LEMMA_API_BASE": "https://..."` を追加してください。
