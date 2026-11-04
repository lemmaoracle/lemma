# Proof Gate 営業用 LP（新規 `/ja/proof-gate/`）

## Why

営業用の Proof Gate LP がない。旧2面（`ai-gyomu-anshin.html` / `lemma-oracle-lp.html`）は
旧世代スタイル（ブラウン・pill ボタン）で、Proof Gate / Interlock / ToolGuard の dedicated
ページは存在しない。Phase1（`/tmp/proof-gate-lp-phase1.md`）で対象・数値・コピーを確定済み。
本 change は Phase1 §7 の実装手順をそのまま実行する。

Hermes 解決済み（覆さない）: 新規 `/ja/proof-gate/` に Astro で作成、旧2面は触らない、
EN は作らない（後続）、fact 集計は Opus 4.8 主軸＋6モデル副帯（18→0、Fable 5 除外注記）、
GLM-5.2 / Kimi K2.7 は入れない、`$28K` / `$1M` / 96% / 約7兆円は載せない、
issue はテックタッチ約9割1本、push・main 直変更禁止。

## What Changes

- 新規 `packages/web/src/pages/ja/proof-gate/index.astro`（JA のみ、旧2面は不変）。
- 新規 SVG モック 3点（`packages/web/public/assets/proof-gate/`）。実截图・顧客名なし。
- `DESIGN.md` に Phase1 §6 の追記案をそのまま追記（既存形式を維持）。
- CTA 計測は `data-pg-ev`（節_目的の命名）＋ gtag 送信。ボタン段・角4px・点線区切り・
  keep-all・44px・761px 境は DESIGN.md 通り。

## Capabilities

### New Capabilities

- `proof-gate-lp`: `/ja/proof-gate/` の節構成
  hero（流出しないシステム）/ intro / features（AIを止める・送金を止める・口座変更を止める）/
  issue（一次ソース付き約9割）/ fact（Opus 4.8 主帯＋6モデル副帯＋素通りプローブ折りたたみ）/
  FAQ（6問）/ 相談（次の一歩＋小さな操作）。

### Modified Capabilities

None. 既存ページ・`contracts` / `circuits` / `workers` / `top-v47.*`・ナビ順位は変えない。

## Impact

- 言葉制約（Phase1 §5）: 照合＝Lemma 機能（何と何を必ず書く）/ 確認＝人の作業。
  効果の言い切り・「変更」（詐欺文脈）・チェック項目以外の「問い」・億単位・下記・
  技術用語の本文混入は NG。本文の技術言及は intro の1行のみ。
- 数値は `example-cyber-attack` の main 実測との突合表（Phase1 §4）のみ使用。
  テックタッチ約9割は W-check 確定値（Q9・n=257・非常に30.7%＋やや59.1%）を注記する。
- tracking なしの追加、OSS 取込なし（`attribution.json` 不要）。
