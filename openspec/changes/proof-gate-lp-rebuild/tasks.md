## 1. 事前確認（Phase1 §7-2・実装前に完了）

- [x] 1.1 テックタッチ調査の W-check: Q9「活用する上で課題を感じますか」n=257
  （生成AI活用の大企業会社員429名のうち活用者）、非常に感じる30.7%＋やや感じる59.1%
  ＝89.8%→約9割。一次ソース PRTimes / テックタッチ資料。
- [x] 1.2 `run-llm-attacker-matrix.mjs`（main）の確認: maxTurns 25/25/12/12/12、
  verdict legend（`attack_succeeded` / `not_exploited` / `refused_or_no_tools`）。
  LP 本文にはターン数を載せない。
- [x] 1.3 fact 数値と main 実測の対応確認（Phase1 §4.1）:
  Opus 4.8 5/5→5/5、GPT-5.5 4/5、DeepSeek v4 Pro 4/5、Qwen3.7 Max 3/5、
  Kimi-K2.6 2/5、合計18/30（Fable 5は拒否で集計外）、
  素通りプローブ `$67,800` → SECUREで403。

## 2. 実装

- [x] 2.1 新規 `packages/web/src/pages/ja/proof-gate/index.astro`
  （Layout＋Navigation＋FooterRenewal、`top-v47.css` の `.topx` 変数が基準、
  ページ固有 CSS は `.pg` スコープ、旧2面は不変）。
- [x] 2.2 SVG モック3点（`packages/web/public/assets/proof-gate/pg-features-{1,2,3}.svg`、
  架空アドレスは `.example`、被害の印 `--err`・照合の通過 `--ok`）。
- [x] 2.3 全 CTA に `data-pg-ev`（`pg_hero_check` / `pg_hero_fact` / `pg_issue_source` /
  `pg_issue_doc` / `pg_issue_briefs` / `pg_fact_compare` / `pg_consult_talk` /
  `pg_consult_whitepaper`）＋ gtag 送信。
- [x] 2.4 `DESIGN.md` に Phase1 §6 を追記（既存形式を維持、Google spec 形式に変換しない）。

## 3. 検証（順に実行し全て通す）

- [x] 3.1 `astro check` は未導入（`@astrojs/check` なし。導入すると lockfile に触れるため見送り）→ `tsc --noEmit` で代用。新規ファイルにエラーなし（既存 `src/og/*` の事前エラーのみ）。
- [x] 3.2 `pnpm build` 成功。
- [x] 3.3 `data-pg-ev` 命名が本 change 通りであること。
- [x] 3.4 数値と Phase1 §4 突合表の対応確認（Opus 5/5、18/30、Fable 除外注記、`$67,800`）。
- [x] 3.5 言葉制約の最終目視（照合/確認分担、効果言い切りなし、技術用語の本文混入なし、
  億単位・下記・チェック項目以外の問いなし）。
- [x] 3.6 `git status --short` で想定外の変更がないこと（push しない）。
