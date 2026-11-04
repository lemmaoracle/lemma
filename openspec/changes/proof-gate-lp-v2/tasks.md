## 1. 事前確認（実装前に完了）

- [x] 1.1 テックタッチ調査の W-check 値は仕様書確定値を使用: Q9「活用する上で課題を感じますか」n=257
  （生成AI活用の大企業会社員429名のうち活用者）、非常に感じる30.7%＋やや感じる59.1%＝約9割。
  一次ソース PRTimes / テックタッチ資料。
- [x] 1.2 fact 数値と `example-cyber-attack` main 実測の対応確認（`git show main:...`）:
  Opus 4.8 5/5→5/5（Primary end-to-end result 表）、6モデル副帯 5+4+4+3+2＝18/30（Fable 5 は拒否で集計外）、
  素通りプローブ `$67,800` → SECURE で 403（README L108-109）。
- [x] 1.3 PR #973 素材の突合: `CyberProblem.astro`（FBI IC3 約20倍・scope 注記付き SVG）は流用可。
  「13件中5件の内部試験記録・hero 画像・5行比較表」は `origin/feat/web-cyber-page` のファイル群に存在しない
  → proposal 判断メモ 1 の読み替えで実装、社内試験節は見送り。
- [x] 1.4 参照スキル原文の必読: impeccable `reference/new-work.md`＋`reference/craft-floor.md`（Mode=Persuade、
  既存 surface の拡張として identity 継承）、stripe.md・coinbase.md（語彙のみ。pill・グラデ持込禁止）、
  `docs/architecture/fp.md`・`design-principles.md`。

## 2. 実装

- [x] 2.1 `packages/web/src/templates/CyberTemplate.astro` を v2 節順に再構成（JA/EN 同一構造）。
  hero 見出し「流出しないシステム」＋sub 仕様書通り、主ボタン1つ（個別相談）＋文字リンク（#fact）。
  intro 見出し「最後の関門を、置く。」＋本文＋権威付け引用1行。features 場面別3カード（製品名なし）。
  issue は `CyberProblem` 流用＋テックタッチ帯。fact は Opus 主帯＋18→0 副帯＋5行比較表＋`$67,800` 折りたたみ。
  始め方・FAQ（6問）・相談帯（個別相談・資料請求、主ボタンは hero のみ）。
  `CyberApproach` / `CyberComparison` / `CyberWorkflowVisual` の描画停止、技術詳細折りたたみ削除、
  既存 verify 導線は維持。CTA に `data-cy-ev`＋gtag 送信。
- [x] 2.2 `packages/web/src/components/CyberProblem.astro` にテックタッチ約9割の帯を追加（JA/EN、出典・範囲注記付き）。
- [x] 2.3 `packages/web/src/components/CyberHeroCard.astro` の刻印を ProofGate 統合に合わせる（装飾のみ）。
- [x] 2.4 `DESIGN.md` の Proof Gate 節を v2 に更新（経営者向け・統合・持たない NG を反映、既存形式を維持）。

## 3. 検証（順に実行し全て通す）

- [x] 3.1 `pnpm --dir packages/web build` 成功（push しない）。
- [x] 3.2 禁止語 grep 0件（対象: 変更ファイル。`$28K` / `$1M` / 96% / 約7兆円 / 持たない /
  Interlock / ToolGuard / pre_tool_call / セルフチェック / 無料でチェック / Trusted Web（新規追加分）/
  技術7語: ゼロ知識証明・ブロックチェーン・マルチシグ・MPC・TEE・準同型・秘密分散）。
- [x] 3.3 数値と仕様書確定表の対応確認（Opus 5/5、18/30、Fable 除外注記、`$67,800`→403、n=257、約20倍）。
  `CyberProblem` の data 属性（`data-loss-year` / `data-loss-billions`）が維持されていること。
- [x] 3.4 言葉制約の最終目視（照合/確認分担、効果言い切りなし、製品名の分け売りなし、境界説明なし）。
- [x] 3.5 `git status --short` で想定外の変更がないこと（main・他 branch 不変、旧 `/ja/proof-gate/` 不変）。
