# `@lemmaoracle/mcp`

[![smithery badge](https://smithery.ai/badge/@lemmaoracle/lemma)](https://smithery.ai/servers/lemmaoracle/lemma)
[![npm version](https://img.shields.io/npm/v/@lemmaoracle/mcp.svg)](https://www.npmjs.com/package/@lemmaoracle/mcp)

`@lemmaoracle/mcp` は、AI エージェントが Lemma の検証可能なプロベナンス層に
アクセスするための **Model Context Protocol (MCP) サーバー**です。
機密ドキュメントから暗号学的に検証された属性（ゼロ知識証明・選択的開示・
改ざん検知可能なプロベナンス）を、平文を一切渡さずに問い合わせできます。

> **Models change. Proofs remain.**

## このパッケージについて

これは **MCP サーバー**です。MCP (Model Context Protocol) は、AI エージェントを
外部ツールやデータソースに接続するためのオープンプロトコルで、Anthropic が
公開し、現在はコミュニティ標準として維持されています。本パッケージは公式
**MCP SDK**（`@modelcontextprotocol/sdk`）を使って MCP サーバーを実装し、
Lemma の検証済み属性 API に対するリードオンリーの **tools** 群を公開します。

現行 MVP では **5 つの read tools** を提供しています。**resources** と **prompts**
は v0.0.x では公開しません。書き込み系 tools（`register_document` /
`submit_proof`）は Phase 2 で対応予定です。

## クイックスタート

エージェントのセットアップに合わせて、2 通りから選んでください。

### 方法 1 — Smithery（ホスト型ゲートウェイ、インストール不要）

```bash
npx -y smithery mcp add lemmaoracle/lemma
```

Smithery が `https://lemma--lemmaoracle.run.tools` へプロキシし、
Lemma API キーを尋ねます。手早く試したいとき、または既に Smithery を使っている
エージェントから接続するときに便利です。サーバーページ:
[smithery.ai/servers/lemmaoracle/lemma](https://smithery.ai/servers/lemmaoracle/lemma)。

### 方法 2 — Claude Desktop + npx（stdio）

Claude Desktop の MCP 設定に以下を追加してください：

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

API キーは https://lemma.frame00.com/ja/services から取得してください。
`LEMMA_API_BASE` は省略可能です（省略時は本番エンドポイント）。

## Glama Inspector で試す

Glama のブラウザ内 inspector（または任意の MCP inspector）で動作確認するときは、
以下のデモキーを利用できます。**read-only かつデモデータに限定**されており、
[example-x402](https://github.com/lemmaoracle/example-x402) でも同じキーが
使われています：

```
LEMMA_API_KEY=b6363aa6265322ed0d786a11d5b6d3264947052ca72deba4cbe1685d099af892
LEMMA_API_BASE=https://workers.lemma.workers.dev
```

本番アクセス用のキーは https://lemma.frame00.com/ja/services から発行依頼できます。

## ツール一覧 (MCP tool list)

このサーバーが公開する **MCP tools** は以下の通りです（現行 MVP では resources /
prompts はありません）：

| ツール | フェーズ | 説明 |
|---|---|---|
| `lemma_query_verified_attributes` | MVP | Lemma から暗号学的に検証された属性を問い合わせる。条件に合致するドキュメントを探す主たる入口として使う |
| `lemma_get_schema` | MVP | Lemma スキーマ（属性構造）を ID から取得する |
| `lemma_get_circuit` | MVP | ZK proof 回路（制約 + verifier）を ID から取得する |
| `lemma_get_generator` | MVP | ドキュメントジェネレータ（入出力仕様）を ID から取得する |
| `lemma_get_proof_status` | MVP | `verificationId` から proof の検証状態を取得する |
| `lemma_register_document` | Phase 2 | Lemma に新しいドキュメントを登録する |
| `lemma_submit_proof` | Phase 2 | 検証用の ZK proof を送信する |

## アーキテクチャ

- **MCP サーバー**: 本パッケージ。AI エージェントを Model Context Protocol 経由で Lemma API に接続する。
- **Lemma API**: Cloudflare Workers 上にデプロイされた REST API。スキーマは [OpenAPI v2](https://github.com/lemmaoracle/lemma/blob/main/packages/spec/openapi.lemma.v2.json) を参照。
- **MCP SDK**: 公式 [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk)（≥ 1.29）に基づく実装。
- **ライセンス**: Apache-2.0。

## プライバシーとデータ取り扱い

Lemma は平文ドキュメントを受信しない設計です。MCP サーバーが Lemma API に
送るのはコミットメント・ハッシュ・ZK proof のみです。詳細は
https://lemma.frame00.com/ja/privacy/ を参照してください。

## ローカル開発（コントリビュータ向け）

MCP サーバー自体に手を入れる場合は、このモノレポからローカルビルドで
動かしてください。利用するだけなら上記の `npx` 設定をお使いください。

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

## リソース

- ドキュメント: 本 README + [OpenAPI spec](https://github.com/lemmaoracle/lemma/blob/main/packages/spec/openapi.lemma.v2.json)
- ホームページ: https://lemma.frame00.com/ja
- Issue: https://github.com/lemmaoracle/lemma/issues

---

🇬🇧 [English README](./README.md)
