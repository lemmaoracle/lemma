# Lemma Critical Brief — Implementation Prompt (Astro)

Code チーム向け。Brief シリーズ全体を v24 デザインシステムに揃える実装プロンプト。

---

## ゴール

Brief シリーズ（index + 個別ページ + /en/ 版）を、Lemma 新デザインシステム（v24）に揃える。
構造は変えない（既存の MD コンテンツ、frontmatter、ルーティングはそのまま）。**装い（layout + design tokens + typography）のみ差し替え**。

## リファレンス mockup

CO-WORK 経由で 3 ファイルを受領：

| ファイル | 用途 |
|---|---|
| `Lemma_brief_index_v1.html` | `/ja/critical/briefs/` index ページの最終デザイン |
| `Lemma_brief_detail_v1.html` | 個別 Brief（No.001 を例）の最終デザイン |
| `Lemma_homepage_v24.html` | 全体のデザインシステム源（CSS variables、header、footer、design tokens） |

実装時は **デザインシステムは `v24` から、各 Brief 専用 layout は brief_index_v1 / brief_detail_v1 から** 取得。

---

## デザインシステム（v24 由来）

### Tokens

```css
:root {
  --lemma-black: #000000;
  --lemma-text-1: #1A1A1A;
  --lemma-text-2: #3A3A3A;
  --lemma-text-3: #5A5A5A;
  --lemma-text-4: #9A9A9A;
  --lemma-brown: #8B4513;          /* saddle brown — accent */
  --lemma-brown-light: #F5EBDC;
  --lemma-cream: #FCFAF5;          /* page bg */
  --lemma-cream-deep: #F2EEDF;     /* secondary bg, TL;DR, dist note */
  --lemma-line: #E5E5E5;
  --font-display: 'Sora', system-ui, sans-serif;
  --font-body: 'Noto Sans JP', system-ui, sans-serif;   /* /en/ は不要、Sora で代用可 */
  --font-mono: 'Space Mono', ui-monospace, monospace;
}
```

### Typography rules

- **見出し全部 Sora**（serif `Cormorant Garamond` は使わない。v22→v24 で全廃済み）
- H1 — Sora 700 / 52–72px / `-0.03〜-0.04em` letter-spacing
- H2 — Sora 700 / 30–48px
- Mono — eyebrow、メタ、ラベル、引用コード（`Space Mono`）
- 本文 — `--font-body`（/ja は Noto Sans JP、/en は Sora で OK）
- **行間** — 通常本文 1.65、Brief 本文 1.85（読みやすさ最優先）

### Header / Footer

- v24 と完全同一の SVG ロゴマーク（142×65 viewBox、fill `#000` for header、`#FCFAF5` for footer）
- header nav：Sora 13.5px 500、`--lemma-text-2`
- footer：5-col grid、dark `#0A0A0A` 背景、cream リンク
- これは **shared components として既存実装を流用 / 拡張**（layout 系コンポーネントを別途新規作成しない）

---

## 1. Index ページ実装

### 対象ルート

- `/ja/critical/briefs/` (既存)
- `/critical/briefs/` (/en/ 同型新設または既存差し替え)

### 構造

`Lemma_brief_index_v1.html` を以下の順序で踏襲：

1. **Header** — 既存共通コンポーネント
2. **Hero** — eyebrow + H1（72px Sora）+ sub paragraph + meta line（`● {count} briefs published since {first_date} · RSS · Methodology`）
3. **About bar** — 「このコレクションについて」ラベル（2 列カード）+ 説明文 + Methodology へのリンク
4. **Featured Brief card** — `200px サイド + 1fr 本文` の grid、最新 Brief を表示。Hover で saddle brown 上バー伸長
5. **Pillar セクション × 4** — 各 Pillar の `pillar-head` + sub + 2-col brief grid
6. **Categories archive** — pill 状の chip、primary∪secondary でカウント、出現件数降順
7. **Footer** — 既存共通

### 各 BriefCard の表示項目

- `No. XXX` （mono、saddle brown）
- 日付（`YYYY-MM-DD` mono）
- タイトル（Sora 17px 600、最大 2 行 + ellipsis）
- 1-3 行サブ（`pillar_lede` か MD 先頭の lead）
- タグ row：primary category（saddle brown pill）+ secondary categories（cream-deep pill）
- "Brief →"（mono、hover で transform: translateX）

### Pillar セクション内のカード数

- Pillar 01 来歴証明：6
- Pillar 02 検証可能 AI：2
- Pillar 03 エージェント権限証明：3
- Pillar 04 規制属性証明：1

→ `getStaticPaths` か Collection query で primary_pillar ごとに分類して render。

### Categories chip

- `primary_category ∪ secondary_categories` の union から count
- 件数降順
- 各 chip：白 bg / brown-light count badge / hover で brown background

---

## 2. 個別 Brief ページ実装

### 対象ルート

- `/ja/critical/briefs/[slug]/`
- `/critical/briefs/[slug]/` (/en/)

### 構造

`Lemma_brief_detail_v1.html` を踏襲：

1. **Header** — 共通
2. **Breadcrumb** — `ホーム / Critical Brief / No. XXX`（mono、薄い）
3. **Brief Hero** — `container-narrow`（max-width 760px、中央寄せ）：
   - `brief-id`：`Lemma Critical Brief · No. XXX`
   - H1：52px Sora 700（Brief タイトル）
   - subtitle：22px Sora 500（1 文サブタイトル）
   - tags：pillar pill（brown）+ category pills（brown-light / cream-deep）
   - meta strip：4 セル grid（事案日 / 公開日 / 発行 / 関連 Pack）
4. **TL;DR block** — cream-deep bg、saddle brown 上バー、15.5px line-height 1.85
5. **§1–§8 sections** — 各セクション：
   - `section-num`：`§ 1` mono ラベル
   - H2：30px Sora 700
   - body：`brief-body` クラス（強調 / リンク / list / numbered list の専用スタイル）
6. **§8 Sources** — `source-item` カードの繰り返し（publisher + title + URL）
7. **関連 Brief** — 1-2 列カード（`related_briefs` frontmatter から取得）
8. **Cite this Brief** — Plain / BibTeX / APA の 3 タブ切替（CSS-only radio + sibling selector で OK、JS なしで動く）
9. **Distribution note** — cream-deep bg、Discovery Call / ホワイトペーパーへの link
10. **Footer** — 共通

### `brief-body` 内部の Markdown レンダリング

実コンテンツは MD だが、以下の rendering 規約：

- `<ul>` — 標準 list-style 撤去、saddle brown 菱形マーカー（22px 左 padding、`::before` 4px rotate(45deg) brown）
- `<ol>` — counter-reset で番号を mono brown で表示
- `<strong>` — color `var(--lemma-black)`、weight 500
- `<a>` — saddle brown + 0.5px underline、hover で fully underlined
- `<p>` — margin-bottom 18px、line-height 1.85

### Cite block 実装

CSS-only タブ（v17 でハマったが）今回は `.examples-panels .examples-panel` 同様 descendant selector で specificity 競合を回避。ベストプラクティスとして：

```css
.cite-pane { display: none; }
#cite-plain:checked ~ .cite-panes .cite-pane[data-cite="plain"],
#cite-bibtex:checked ~ .cite-panes .cite-pane[data-cite="bibtex"],
#cite-apa:checked ~ .cite-panes .cite-pane[data-cite="apa"] { display: block; }
```

Copy ボタンは小 JS（`navigator.clipboard.writeText(activePane.textContent)`）。

### Citation 文字列の生成

- frontmatter から `cite_text` / `cite_bibtex` / `cite_apa` を直接受けるのが一番安全
- 自動生成する場合は author = "Lemma Critical Team"、year = 公開日の年、URL = canonical URL

---

## 3. /en/ 版

### 構造の parity

- /ja/ と完全に同型の routing と layout
- Content：i18n 経由で `lang: "en"` の MD を選択
- Header nav 文字列だけ翻訳（"信頼レイヤー" → "Trust Layer" 等）
- footer 文字列も同様
- `<html lang="en">` 切替必須（SEO 上重要）

### Cross-link

- 個別 Brief ページの header / footer の「English / 日本語」スイッチが、**同じ slug の対応言語版に飛ぶ**こと（言語選択ではなく page-level 切替）
- canonical URL は各言語版独立
- `<link rel="alternate" hreflang="..." />` で /ja/ ↔ /en/ を双方向に明示

### Sora を /en/ 本文にも使ってよい

- 日本語は `Noto Sans JP` 必須だが /en/ は `Sora` 一本で OK
- line-height は同じ（本文 1.65、Brief 本文 1.85）

---

## 4. 推奨コンポーネント分割（Astro）

```
src/components/
  ├── BriefCard.astro              (index と related で再利用)
  ├── BriefHero.astro              (個別ページの Hero ブロック)
  ├── BriefMetaStrip.astro         (4 セル meta grid)
  ├── BriefTldr.astro              (TL;DR ブロック)
  ├── BriefSection.astro           (§N + H2 + body slot)
  ├── BriefSources.astro           (§8 Sources list)
  ├── BriefCiteBlock.astro         (Cite tabs)
  ├── BriefDistNote.astro          (配布について)
  ├── PillarSection.astro          (Pillar 単位の grid wrapper)
  └── CategoryChip.astro           (Categories archive 用)

src/layouts/
  └── BriefDetailLayout.astro      (個別 Brief の page layout、Markdown slot)

src/pages/
  ├── ja/critical/briefs/
  │   ├── index.astro              (index ページ)
  │   └── [slug].astro             (個別 Brief、collection query)
  └── critical/briefs/
      ├── index.astro              (/en/ index)
      └── [slug].astro             (/en/ 個別)
```

---

## 5. Frontmatter expectations

既存の MD frontmatter を想定。新規追加が必要な field：

```yaml
# 必須
title: "KelpDAO / rsETH 不正アンロック"
subtitle: "DVN 観測層への RPC 改ざん攻撃"     # H1 直下の Sora 500 22px
brief_no: 1                                  # ゼロパディングなし
incident_date: "2026-04-18"
published_date: "2026-05-29"
publisher: "Lemma Critical Team"
primary_pillar: "01"                         # "01" | "02" | "03" | "04"
primary_pillar_label: "来歴証明"              # 表示用、/en/ では "Verifiable Origin"
primary_category: "bridge-config-trust"
primary_category_label: "Bridge Config Trust"
secondary_categories:
  - slug: "identity-auth"
    label: "Identity / Auth"
related_packs:
  - name: "Pack A"
    desc: "Incident Response"
related_briefs:
  - slug: "002-stakedao-vsdcrv"

# 推奨（自動生成可能だが frontmatter で明示する方が安全）
cite_text: |
  Lemma Critical Team. (2026).
  "KelpDAO / rsETH 不正アンロック — DVN 観測層への RPC 改ざん攻撃".
  Lemma Critical Brief No.001. Lemma / FRAME00, Inc.
  https://lemma.frame00.com/ja/critical/briefs/001-kelpdao-rseth/
cite_bibtex: ...
cite_apa: ...

# Optional
ogp_image: "/_astro/ogp-001.png"           # 個別 OGP（指定なければ default OGP）
```

---

## 6. 確認チェックリスト

### Index ページ
- [ ] H1 が Sora 72px 700 で、`-0.04em` letter-spacing、accent 部分が saddle brown
- [ ] About bar が 2 列 grid（label + text）、cream-deep ではなく white bg + line border
- [ ] Featured card が hover で上バー 64px → 100% に伸長
- [ ] Pillar セクション 4 個、それぞれ正しい count 表示
- [ ] Brief card 2-col grid、hover で上バー伸長と translateY(-2px)
- [ ] Category chips が件数降順、count badge が brown-light pill

### 個別 Brief ページ
- [ ] container-narrow（max-width 760px）で読みやすい行幅
- [ ] H1 52px Sora 700、subtitle 22px Sora 500
- [ ] tags row：pillar pill が saddle brown 単色、category が brown-light、secondary が cream-deep
- [ ] meta strip：4 セル grid、border-right 区切り、mobile では 2-col 折り返し
- [ ] TL;DR block：cream-deep bg、左上に saddle brown 3px 上バー、`.k` で文中強調
- [ ] §N + H2 が見出しとして識別可能、本文 list/ol が brown マーカー
- [ ] Sources：source-item カードに publisher / title / URL、URL は break-all で改行 OK
- [ ] Cite tabs：3 タブ切替（active = saddle brown bg + cream text）、Copy ボタン動作
- [ ] Distribution note：cream-deep bg、Discovery Call / Whitepaper への link

### /en/ parity
- [ ] /ja/ ↔ /en/ で同 slug の hreflang link が存在
- [ ] 個別 Brief の header / footer の言語スイッチが同 slug に飛ぶ
- [ ] `<html lang>` 属性が正しい
- [ ] /en/ では `Sora` 本文 OK（Noto Sans JP 不要）

### 共通
- [ ] serif（Cormorant）が **どこにも残っていない**（v22→v24 で全廃）
- [ ] Lemma SVG マーク（142×65 viewBox）が header（fill #000）と footer（fill #FCFAF5）で使われている
- [ ] `prefers-reduced-motion` 対応：hover transform 動作のみで OK（強い animation はないので最小限）

---

## 7. 補足

- mockup HTML 内に dead CSS（v22 以前の `.mechanism`, `.examples-flat`, `.hp-card` 等）が残存する可能性あり。実装時は使うルールのみ移植
- `Lemma_brief_index_v1.html` の `brand-bar`（240px の saddle brown 帯）は v24 と同じ。header 直下に配置
- footer の `English` リンクは個別 Brief ページでは同 slug の /en/ 版へ、index では `/critical/briefs/` へ

---

## 8. 質問あれば

- frontmatter の field 増減
- Cite 文字列を frontmatter で持つか、自動生成にするか
- /en/ の i18n プロバイダー（既存実装に合わせる）
- 関連 Brief（related_briefs）の参照解決方法（slug-only か obj）

→ Mayumi または Design 側に確認ください。
