# Lemma Homepage v22 — Direction Review

CTO review 用。Seal page v10 の規律を踏まえてホームページを再構成した版です。

## ファイル

- `Lemma_homepage_v22.html` — 新ホームページ案
- `Lemma_seal_page_v10.html` — 参照（既存 Seal ページ）
- `Lemma_homepage_v21.html` — 直前の rich 版（比較用）

## v21 → v22 で変わったこと

### 1. Typography 一本化

**Before (v21)**
- H1: Cormorant Garamond 104px 500 italic accent
- 本文: Sora
- → 2 タイポ軸の緊張、紙感

**After (v22)**
- H1: Sora 72px 700 -0.04em（Seal page と同系の重み）
- 本文: Sora
- Serif は Vision 締め H2（56px Cormorant）と footer ブランドマークのみに局所化
- → infrastructure / developer audience に通じる単一軸

### 2. 構造 9 セクション → 6 セクションに圧縮

| セクション | v21 | v22 | 理由 |
|---|---|---|---|
| Hero | ✓ | ✓ | front door |
| Ecosystem bar（標準ロゴ 6 個） | ✓ | ✗ | hero trust-line に統合 |
| Capabilities（4 cards） | ✓ | ✗ | Products と機能重複 |
| Products（3 doors in） | ✓ | ✓ | 何を売るか |
| Mechanism（3-box 図） | ✓ | ✓ | Lemma の差別化説明 |
| Examples（タブ式 4 cat） | タブ式 | flat 4 cluster | タブ overkill、全部見せる |
| Resources（3 cards） | ✓ | ✗ | footer に同じ内容あり |
| Vision close | ✓ | ✓ | 締め CTA |
| Footer（5 列 rich） | ✓ | ✓ | サイト全体ナビ |

### 3. 細部の変更

- Hero trust-line: 旧 "● live in production · proven across public infrastructure since 2025" → 新 "● live in production since 2025 · built on MCP · x402 · C2PA · W3C VC"（撤去した Ecosystem bar の標準名を吸収）
- Examples: タブ切替 JS（20 行）撤去、4 業界の小ラベル＋カード 2 枚を縦に並べた flat 構造に
- Examples closing message "In every case — the AI sees the proof, never the original." は維持

## 判断ポイント（CTO に聞きたいこと）

1. **タイポ単一軸でいいか**：Lemma ロゴの calligraphic 性を H1 に反映しなくて良いという判断。serif の余韻は Vision close と footer マークだけに局所化。
2. **Examples flat 化**：タブで深さを出すか、flat で「全部目に入る」を取るか。Lemma は業界横断アピールが効くので後者を選択。
3. **Hero trust-line に標準名を埋め込み**：Stripe-style の薄ロゴバーを 1 行に圧縮。"powered by ..." 的に効く想定。
4. **Capabilities 撤去の是非**：Products と機能が overlap していたが、AI 視点の "what can Lemma let you do" を別に立てる価値はあるか。

## 次の動き候補

- このまま OK → 各製品ページ（/seal, /trust402, /industries）も同じ単一軸で展開
- Examples 戻し → タブ復活させたい場合は v21 のコード（JS + CSS）を残してある
- 別方向 → Seal page と完全同型まで圧縮（Mechanism も Before/After 比較に置き換え）もあり得る
