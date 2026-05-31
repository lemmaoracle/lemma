# Lemma Homepage v23 — Direction Review

CTO review 用補足。Seal page と視覚言語を統一し、Examples を技術的 schema 例にした版です。

## ファイル

- `Lemma_homepage_v23.html` — 新ホームページ案（本レビューの主成果物）
- `Lemma_seal_page_v10.html` — 参照：Seal ページ。Without/With の視覚言語をここから移植
- `Lemma_homepage_v22.html` — 比較：直前版（3-box mechanism + flat cluster examples）

## v22 → v23 のサマリー

| 領域 | v22 | v23 |
|---|---|---|
| How it works · 図解 | dark `#2C2620` 背景の 3-box フロー | Seal page 同型の **Without / With Lemma** Before/After 並列パネル |
| How it works · 例 | flat 4 cluster の "Hide / Prove" カード | 6 枚の **JSON schema cards**（3×2 grid、code-style） |
| Examples タブ | （v22 で既に撤去） | 引き続きなし |
| Typography | Sora 単一軸 | 維持 |
| Hero / Products / Vision / Footer | — | 完全に維持 |

## Without/With Lemma の視覚詳細

### Without Lemma パネル
- 背景：legacy gray (`#ECEBE5`)
- border: dashed (`#B5AFA0`)
- filter: `saturate(0.65)`
- メイン色：muted gray (`#6E6957`)
- アニメーション：raw data record card が左 → 右に流れる（4s ループ）、AI server 内の record アイコンが flicker

### With Lemma パネル
- 背景：lemma cream (`#FCFAF5`)
- border: solid (`#8B4513`)
- box-shadow: `0 6px 28px rgba(139, 69, 19, 0.08)`
- メイン色：saddle brown
- アニメーション：proof badge（チェック付き丸）が左 → 右に流れる、AI server 内の verified check が pulse

### コピー差分

| 位置 | Without | With |
|---|---|---|
| 左ノード | "Private records" | "Data stays here"（ロック付き） |
| 矢印キャプション | "sends raw data" | "sends only a proof" |
| 右ノード上 | "AI holds private data" | "AI sees verified truth" |
| 右ノード下 | "breach = leak" | "breach = nothing" |

## Schema 例の設計意図

| カード | 目的 |
|---|---|
| Age & residency | 最も古典的な ZK ユースケース、入りやすい |
| Loan eligibility | Finance buyer 向け、`JsonWebSignature2020` という W3C 由緒で credibility |
| Clinical trial fit | Healthcare の "個人データを出さずに適合判定" の典型 |
| Agent authority | Lemma の差別化（Trust402 連動） |
| AML compliance | regulator 向け、existing infrastructure friendly |
| Vote validity | civic vertical の代表例、政府パートナーシップ示唆 |

### code styling
- `key` = saddle brown
- `string` = lemma-text-1 (near black) + font-weight 500
- `number` = saddle brown + font-weight 500
- `comment` = lemma-text-4 italic

スキーマは現実的だが架空（実 issuer の did 名は仮）。

## 判断ポイント（CTO に確認）

1. **Seal 視覚言語の統一**：ホームページの How it works を Seal の Before/After と同じトーンに揃えた。サイト全体で "Without / With Lemma" が共通の説明フレームになる
2. **Schema 6 枚という数**：3×2 grid は読みやすいが、技術的説得力としては少なめかも
3. **Schema 例の具体度**：`BBSplus`/`JsonWebSignature2020`/`ZkSnark` の specific な type 名を出している。dev には credibility になるが、exec が retreat する可能性も
4. **タブ機能の完全撤去**：業界選択 UI なし。schema を全部目に入れて自分の業界を見つける形

## 次の動き候補

- **OK** → v23 で固定、Astro 実装着手
- **Schema 数増やす** → 8〜12 枚にして infrastructure 感を強化
- **Schema を tab で分類** → 基礎 / 応用、または "for builders / for buyers" 2 タブ
- **Without/With をもっと簡略化** → SVG の record アイコン flicker / proof pulse をカット、静的にする
