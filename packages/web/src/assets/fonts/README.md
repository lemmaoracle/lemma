# OG 画像用のフォント

satori / resvg はシステムフォントを見ないので、OG・カバー画像で使う書体は
ここに実ファイルとして置く（欧文は軽いので `@fontsource/*` から
`node_modules` 経由で読む — `src/og/ogBase.ts` を参照）。

| ファイル | 用途 | 出所 |
|---|---|---|
| `NotoSansJP-{Regular,Medium,Bold}.otf` | 本文・ラベル・数値 | Google Fonts「Noto Sans JP」日本語サブセット |
| `NotoSerifJP-SemiBold.woff` | **見出し（和文）** | `@fontsource/noto-serif-jp@5.3.0` の `noto-serif-jp-japanese-600-normal.woff` |

いずれも SIL Open Font License 1.1。

## 見出しの書体ルール

サイトの `--font-display`（`layouts/Layout.astro`）と揃える:

- **欧文 = Space Grotesk 600**（`@fontsource/space-grotesk`）
- **和文 = Noto Serif JP 600**（このディレクトリの `.woff`）

以前の OG は Sora Bold 700 ＋ Noto Sans JP Bold 700 だったが、Sora は v24 の
書体でサイトからは退役している。**OG だけが太いサンセリフ**という状態だったため
2026-08-05 に揃えた。

和文はフルサブセットを積む（サブセットを削らない）。OG のタイトルはユースケース名
など**データ由来で字種が読めない**ため、削ると豆腐が出る。

## 差し替えるとき

`src/og/ogBase.ts` の `SATORI_FONTS` を直す。号数の見積もり
（`src/og/marketingImages.ts` の `widthEm`）は書体の字幅に合わせた実測値なので、
書体を替えたら再校正が必要。
