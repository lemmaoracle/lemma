# [Design Review] Homepage v23 — Without/With Lemma + Schema 例

CTO レビュー用（v22 から更新）。実装着手前の方向性確認です。

---

## サマリー

`v22` の typography 単一軸・構造圧縮はそのままに、How it works セクションを 2 箇所さらに改修：

1. **Mechanism 図解を Seal page 視覚言語に統一** — dark 3-box フロー → **Without Lemma / With Lemma 並列 Before/After パネル**
2. **Examples を ZK proof schema 例に置換** — タブ式 → **6 枚の JSON スキーマカード**（業界横断、code-style）

## 添付ファイル

| ファイル | 用途 |
|---|---|
| `Lemma_homepage_v23.html` | 新ホームページ案（本 PR の主成果物） |
| `Lemma_seal_page_v10.html` | 参照：Seal ページ。Without/With の視覚言語をここから移植 |
| `Lemma_homepage_v22.html` | 比較用：直前のリッチ版（3-box mechanism + flat cluster examples） |
| `Lemma_homepage_v21.html` | 比較用：H1 serif 版 |
| `Lemma_v23_direction_review.md` | 判断材料・差分の詳細 |

## ローカルで見るには

```bash
open Lemma_homepage_v23.html
open Lemma_seal_page_v10.html
```

How it works セクションで Without/With パネルが Seal の Before/After と同じ視覚言語になっていることを確認。下にスクロールしてスキーマカード 6 枚を確認。

---

## v22 → v23 で変えたこと

### 1. How it works のメカニズム図解を全面置換

**Before (v22)**：dark `#2C2620` 背景に 3-box フロー（Private Data → Lemma Oracle → AI Model）。box の中に database stack / shield / neural network のアイコン。

**After (v23)**：Seal page と同じ視覚言語の **Without/With 並列パネル**。

| パネル | 視覚 | アニメーション | テキスト |
|---|---|---|---|
| **Without Lemma**（左） | desaturated グレー (`#6E6957`)、dashed border、 saturate(0.65) | データカードが矢印に沿って流れる、AI server 内の record アイコン flicker | "sends raw data" / "AI holds private data" / "breach = leak" |
| → migrate-bridge | saddle brown 矢印 | — | — |
| **With Lemma**（右） | saddle brown active、solid border、shadow | チェック付き proof badge が流れる、AI server 内の verified check が pulse | "Data stays here" (ロック付き) / "sends only a proof" / "AI sees verified truth" / "breach = nothing" |

→ Seal page と同じトーン。"Without/With" のコントラストが図解だけで読める。

### 2. Examples を ZK proof schema 例 6 枚に置換

**Before (v22)**：タブ式 4 業界 × 2 例の "Hide X → Prove Y" カード（マーケ調）

**After (v23)**：技術者が「何を作るのか」即座に分かる JSON schema 6 枚（3×2 グリッド、code-style）

| カード | 業界 | スキーマ要点 |
|---|---|---|
| Age & residency | Identity | `BBSplus` + `age_gte:21, residency:JP` |
| Loan eligibility | Finance | `JsonWebSignature2020` + `income_gte_usd, credit_score_gte` |
| Clinical trial fit | Healthcare | `ZkSnark` + `cohort, age_in:[18,65]` |
| Agent authority | AI · Agents | `BBSplus` + `scope:payments, limit_usd:1000` |
| AML compliance | Finance | `BBSplus` + `aml_clean, kyc_verified` |
| Vote validity | Civic | `ZkSnark` + `registered, district:12` |

各カード：Space Mono 11.5px の code block、シンタックスハイライト（key=brown / string=black / number=brown / comment=gray）、業界ラベル（mono uppercase）+ タイトル（Sora 600）。

### 3. 撤去したもの

- `mechanism` セクション CSS（dark bg、3-box）
- `mech-flow-dot` / `oracle-shield` / `mech-ai-node` アニメーション
- `examples-flat` / `examples-cluster` レイアウト（v22 で崩れていた）
- "examples by industry" ラベル → "what it looks like in practice" に変更

### 4. 維持したもの

- Typography 単一軸（Sora）
- Hero / Products / Vision / Footer の構造
- Examples closing：*"In every case — the AI sees the proof, never the original."*

---

## 最終構造（v23）

```
Hero
  ↓
Products（Seal / Trust402 / Industries）
  ↓
How it works
  ├─ "Private data becomes verified truth." H2 + sub
  ├─ Without Lemma | → | With Lemma  ← Before/After（Seal 視覚言語）
  ├─ what it looks like in practice  ← mini divider
  ├─ 6 schema cards（3×2）
  └─ "In every case — the AI sees the proof, never the original." closing
  ↓
Vision close
  ↓
Footer（5 列 rich）
```

## 判断ポイント（CTO に確認）

1. **Seal 視覚言語の統一 OK？** ホームページの How it works を Seal の Before/After と同じトーンに統一。サイト全体で「Without / With Lemma」が共通の説明フレームになる
2. **Schema 例の具体度** OK？ `BBSplus`/`JsonWebSignature2020`/`ZkSnark` の specific な type 名と issuer (`did:gov:dmv`, `did:web:bureau` 等) を出している。dev には credibility になるが、exec が retreat する可能性も
3. **6 枚という数** OK？ 増やしてカード数で説得力を増す手も。減らして 4 枚 grid の方が読みやすい可能性も
4. **タブ機能の完全撤去** OK？ 業界選択の UI なし。読者は schema を全部目に入れて自分の業界を見つける形

## 次の動き候補

- **OK**：v23 で固定、Astro 実装に着手（CSS dead rule 削除も実装時に）
- **Schema を tab で分類**：6 枚を 2 タブ（基礎 / 応用）or 3 タブに分ける
- **Schema 数を増やす**：8〜12 枚にしてカテゴリ豊富さを示す
- **Schema 数を減らす**：3〜4 枚に絞って 1 列で見せる

## 既知の残作業（本 PR 範囲外）

- CSS dead rules（`.mechanism`, `.mech-flow-dot`, `.examples-flat`, `.examples-cluster`, `.hp-card` 等）が残存。動作に影響なし、Astro 実装時に整理
- 各リンク先（/pillars / /civic / /critical / /compliance / /cookbook / /specs / /glossary 等）は仮 URL
- Footer の Lemma マークはテキスト合成（`L^e mma`）、本実装で SVG 差し替え
- Schema の issuer / type は架空例。本実装時は legal レビュー必要かも

---

## レビュー範囲外

実装コード（Astro コンポーネント、Tailwind トークン化）は本 PR では実施していません。**デザイン方向性のみの確認**です。OK が出たら別 PR で実装に入ります。

cc: @cto
