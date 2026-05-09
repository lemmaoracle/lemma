# Lemma Oracle

> AI に「証明可能な事実」を。

Lemma は、検証可能なAIのための信頼インフラです。
ゼロ知識証明・選択的開示・改ざん検知可能なプロベナンスを活用し、機密
データそのものを渡さずに AI に推論させる仕組みを提供します。

Lemma を通して AI が読み取るすべての属性には、恒久的なプロベナンスが
付与されます。誰が発行したか、どのスキーマで定義されたか、どのように
証明されたか、その検証記録がどこにアンカーされているか — すべてを
追跡できます。

## 詳細

- 🌐 **ウェブサイト**: https://lemma.frame00.com/ja
- 📄 **サービス**: https://lemma.frame00.com/ja/services
- ✍️ **ブログ・エッセイ**: https://lemma.frame00.com/ja/blog
- ❓ **FAQ**: https://lemma.frame00.com/ja/blog/faq

## MCP サーバー

`@lemmaoracle/mcp` は Lemma の **Model Context Protocol (MCP) サーバー**で、
公式 **MCP SDK**（`@modelcontextprotocol/sdk`）を用いて実装され npm で公開
されています。Claude Desktop など MCP 対応エージェントから利用できます:

```json
{
  "mcpServers": {
    "lemma": {
      "command": "npx",
      "args": ["-y", "@lemmaoracle/mcp"],
      "env": { "LEMMA_API_KEY": "YOUR_API_KEY" }
    }
  }
}
```

ツール一覧・環境変数・コントリビュータ向けビルド: [packages/mcp/README.ja.md](./packages/mcp/README.ja.md) · [npm](https://www.npmjs.com/package/@lemmaoracle/mcp)

## パッケージ構成

このモノレポで公開している主要パッケージ：

- **[`packages/mcp/`](./packages/mcp)** — `@lemmaoracle/mcp`、AI エージェント向けの **Model Context Protocol (MCP) サーバー**（上記のパッケージ）
- **[`packages/sdk/`](./packages/sdk)** — `@lemmaoracle/sdk`、Lemma API の TypeScript SDK
- **[`packages/spec/`](./packages/spec)** — `@lemmaoracle/spec`、OpenAPI spec + 共有 TypeScript 型
- **[`packages/x402/`](./packages/x402)** — `@lemmaoracle/x402`、x402 決済ミドルウェアの drop-in 実装

## お問い合わせ

パートナーシップ・導入に関するお問い合わせは、以下のフォームからお願いします:
https://lemma.frame00.com/ja/services

## ライセンス

本リポジトリはパッケージごとに異なるライセンスを適用しています：

| パッケージ | ライセンス |
|---|---|
| `packages/contracts`, `packages/relay`, `packages/passthrough` | **BUSL-1.1**（2030-05-01 に Apache-2.0 に自動移行） |
| `packages/sdk`, `packages/spec`, `packages/mcp`, `packages/parser`, `packages/x402` | **Apache-2.0** |
| `packages/web` | Private（非配布） |

ルートの `LICENSE` ファイルがデフォルトとして適用されます。各パッケージに個別の `LICENSE` ファイルがある場合は、そちらが優先されます。

---

© 2026 FRAME00 Inc.
