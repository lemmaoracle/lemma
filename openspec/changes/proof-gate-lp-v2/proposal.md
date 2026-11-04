# ProofGate LP v2 — `/ja/cyber/` を情報設計案v2に沿って更新

## Why

情報設計案 v2（`hermes-notes/2026-11-04_ProofGate-LP情報設計案.md`、aggre修正反映）で読者が経営者に確定し、
旧 Cyber・ToolGuard・Interlock が ProofGate に統合された。draft PR #973（`origin/feat/web-cyber-page`）の
`/ja/cyber/` はレビュー済み・素材が揃っているため、これを母体に v2 構成へ寄せる。
旧 `feat/proof-gate-lp-rebuild`（`/ja/proof-gate/`）は触らない。

Hermes 解決済み（覆さない）: intro 見出しは「最後の関門を、置く。」、
数値は仕様書の確定表のみ（Opus 5/5、18/30、`$67,800`、テックタッチ n=257、FBI IC3 約20倍）、
`$28K` / `$1M` / 96% / 約7兆円は載せない、push・main 直変更禁止。

## What Changes

- `packages/web/src/templates/CyberTemplate.astro` を v2 節順に再構成（JA/EN 同一構造）:
  hero（流出しないシステム）/ intro（最後の関門を、置く。）/ features（場面別3カード・製品名なし）/
  issue（CyberProblem 流用＋テックタッチ帯）/ fact（Opus 主帯＋18→0 副帯＋5行比較表＋`$67,800` 折りたたみ）/
  始め方 / FAQ（6問）/ 相談帯（個別相談・資料請求）。
- `packages/web/src/components/CyberProblem.astro` にテックタッチ約9割の帯を追加（出典・範囲注記付き）。
- hero 主ボタンは経営者導線1つ（個別相談）のみ＋文字リンク「攻撃実験の結果を見る →」（#fact）。
  セルフチェック CTA は使わない。
- fact の 7モデル・35件系数値（26/35 等）を仕様書世代に固定（Opus 5/5、6モデル 18/30、Fable 5 除外注記）。
  Kimi K2.7 Code・GLM-5.2 行は載せない。
- `CyberApproach` / `CyberComparison` / `CyberWorkflowVisual` の描画を取りやめ（ファイルは残す）。
  境界説明（pre_tool_call 対 実行直前）・製品2軸併記・技術詳細折りたたみを落とす。
  既存 verify 導線（カード→`/cyber/verify/`、証明データ検証ツール）は残す。
- `DESIGN.md` の Proof Gate 節を v2 に更新（経営者向け・統合・持たない NG を反映）。
- 言葉制約: 照合＝仕組み（何と何を明記）/ 確認＝人。効果の言い切り・未実測数字なし。
  「持たない仕組み」は未提供のため謳わない。技術7語の本文混入なし。Lemma 汎用を持ち込まない
  （レジストリカウンタ・セルフチェック CTA・Trusted Web チップ追加なし）。

## Capabilities

### New Capabilities

- `proof-gate-lp-v2`: `/ja/cyber/` の v2 節構成（hero / intro / features / issue / fact /
  始め方 / FAQ / 相談）。既存 Cyber identity（dark / silver / lime）は維持。

### Modified Capabilities

None. 既存ページ・`contracts` / `circuits` / `workers` / ナビ順位は変えない。
EN コピーは新構造に合わせた最小限の並行更新のみ。

## Impact

- 言葉制約（情報設計案 v2）: 動詞の使い分け、効果言い切り NG、技術7語封印。
- 数値は `example-cyber-attack` main 実測との対応確認済み分のみ（Opus 主帯・18/30 副帯・`$67,800` 折りたたみ、
  テックタッチ約9割は W-check 確定値 Q9・n=257）。
- CTA 計測は `data-cy-ev`（節_目的の命名）＋ gtag 送信。ボタン角は Cyber identity を維持。
- tracking なしの追加、OSS 取込なし（`attribution.json` 不要）。
- 判断メモ（仕様書にない判断・ESCALATION 候補）:
  1. PR #973 ファイル群に「内部試験の実行履歴（13件中5件）・hero 画像・5行比較表（INSECURE/SECURE）」は
     存在しない（`git grep` で確認）。fact の5行比較表は Opus 4.8 の5シナリオ×照合なし/あり表と読み替えて実装。
     社内試験節・hero ログ画像は「以下適宜」のため見送り。
  2. `CyberTemplate` は JA/EN 共用のため構造変更は EN（`/cyber`）にも及ぶ。EN は最小限の並行更新。
  3. intro 末の権威付け引用は株主・岩田さん紹介文の核の言い回し1行を出所明記で引用。
     「持たない」系の1行は未提供のため不使用。
