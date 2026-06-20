---
brief_no: 58
title: "AI エージェントが自分の記憶（チェックポイント）を検証せず読み込み、サーバーを乗っ取られた — エージェントの永続状態が、ロードの前に来歴も完全性も独立検証されない構造（LangGraph）"
title_en: "From State Store to RCE — When an AI Agent Trusts Its Own Checkpoint (LangGraph)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "ai-decision-integrity"]
incident_date: 2026-06-12
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["027-librechat-mcp-url-secrets", "025-mcp-stdio-config-to-command-rce", "003-starlette-badhost", "037-agent-config-auto-execution"]
status: published
version: "1.0"
og_lead_ja: "エージェントが自分のチェックポイントを検証せず読み込み RCE — LangGraph"
og_lead_en: "An agent loads its own checkpoint unverified → RCE — LangGraph"
gap_detected: "脆弱性スキャナ・依存関係監査・egress 監視が働き、3 件とも修正版が利用可能な状態での協調的開示として処理された。"
gap_missing: "「いま読み戻している状態は、誰の権限で・改ざんなく書かれた正規の自己状態か」を再構築の前に確かめる層が無く、注入された偽の行が正規の状態と同じ経路で読み戻された。"
gap_fix: "高リスク行動の前に「このチェックポイントは、認可された実行に由来し、改ざんがない」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

2026 年 6 月、Check Point Research の Yarden Porat は、LangChain のエージェント基盤 LangGraph で、SQL インジェクション（CVE-2025-67644）と安全でない msgpack デシリアライズ（CVE-2026-28277）を連鎖させ、攻撃者が状態保存層（チェックポイント＝エージェントの記憶）に偽の行を注入し、エージェントが検証せず読み戻した瞬間に遠隔コード実行に至る脆弱性を公開した。脆弱性スキャナやパッチなど事後の検出は、エージェントが自分の永続状態を来歴も完全性も検証せず特権文脈で再構築する構造には届かない。検出と事前証明は代替でなく補完である。

---

## 1. 事案概要

- **対象**: LangGraph（LangChain が開発するステートフル/マルチエージェント基盤）の自己ホスト構成。SQLite または Redis のチェックポインタを使い、ユーザー由来の filter 入力を受ける構成が影響を受ける
- **識別子と深刻度**:
  - CVE-2025-67644（CVSS 7.3）— SQLite チェックポイント実装の SQL インジェクション。metadata の filter キーを通じてクエリを操作できる（`_metadata_predicate()` が filter キーを検証せず f-string に直接展開）。`langgraph-checkpoint-sqlite` 3.0.1 未満が対象
  - CVE-2026-28277（CVSS 6.8）— 安全でない msgpack デシリアライズ。チェックポイントのロード時に、攻撃者がチェックポイントデータを改変できる場合にオブジェクト再構築が誘発される。`langgraph` 1.0.9 以前が対象
  - CVE-2026-27022（CVSS 6.5）— `@langchain/langgraph-checkpoint-redis` の RediSearch クエリインジェクション。アクセス制御を回避しうる。1.0.2 未満が対象
- **連鎖**: CVE-2025-67644 と CVE-2026-28277 を連鎖させると RCE に至る。成立条件は、アプリが `get_state_history()` エンドポイントを公開し、ユーザー制御の filter 入力を受けること
- **影響範囲の限定**: LangChain のマネージド基盤（LangSmith Deployment、PostgreSQL 構成）は影響を受けない。脆弱性は自己ホスト構成に限られる
- **流出・到達対象**: 成立時、エージェントが扱う LLM API 鍵、顧客データ、会話履歴、外部システム（CRM・内部 API）の認証情報。LangGraph 側は CVE-2026-28277 を「ポストエクスプロイト」と位置づけ、チェックポイント保存層への書き込み権限を前提とする脅威モデルだと説明している
- **悪用状況**: 3 件ともパッチ済み。修正版は `langgraph-checkpoint-sqlite` 3.0.1 以降、`langgraph` 1.0.10 以降、`@langchain/langgraph-checkpoint-redis` 1.0.2 以降

---

## 2. タイムライン

- 2026-06-12: Check Point Research の Yarden Porat が 3 件の脆弱性を公開。CVE-2025-67644 と CVE-2026-28277 を連鎖した RCE の概念実証を含む技術解説を同日公表
- 同日: The Hacker News ほかが報道。LangGraph メンテナは CVE-2026-28277 をポストエクスプロイト課題と位置づけ、マネージド（LangSmith）構成への影響はないと説明
- いずれもパッチ済みでの coordinated disclosure（修正版が利用可能な状態での公開）

> 注: 一部の集約データベースでは関連 CVE 番号（チェックポイント caching 層の pickle デシリアライズ等）に揺れがある。本文は一次の GitHub Security Advisory と Check Point Research の記述に従う。

---

## 3. 攻撃ベクター

連鎖 RCE は、アプリが `get_state_history()` を公開し、ユーザー制御の filter 入力を受ける自己ホスト構成で成立する。経路は以下の通り。

1. **ペイロードの準備**: 攻撃者は、任意コードを実行する命令を含む msgpack ペイロードを用意する
2. **SQL インジェクションで偽の行を注入**: 悪性の filter パラメータを送り、SQLite チェックポイント実装の SQL インジェクションを突く。クエリ結果に、`checkpoint` カラムが攻撃者制御のシリアライズ済みデータを持つ「偽のチェックポイント行」を返させる
3. **デシリアライズの誘発**: アプリがクエリ結果を処理する際、その悪性チェックポイントの BLOB をデシリアライズする
4. **コード実行**: 安全でない msgpack デシリアライズにより、攻撃者のペイロードがサーバー上で実行される（RCE）
5. **権限文脈への展開**: エージェントランタイムからアクセスできる秘密（LLM API 鍵・会話履歴）や、ランタイムが到達できる他システム（CRM・内部 API）の認証情報が露出する

Check Point は、SQL インジェクションという古典的な脆弱性クラスが、**高い権限と信頼を抱えた AI エージェント基盤の内側で発火すると威力が増す**点を本事案の要点として挙げている。

---

## 4. 構造的論点

本事象は Pillar 03（エージェント権限証明）の `agent-infrastructure` カテゴリに属する。中心的な失敗 primitive は、**エージェントが自分の永続状態（チェックポイント）を、その来歴と完全性を検証しないまま、特権的なランタイム文脈で解釈する**点にある。チェックポイントはエージェントの「記憶」に相当し、エージェントは処理再開時にそれを正規の自己状態として読み戻す。だが「その状態が、いつ・誰の権限で・改ざんなく書かれたか」を実行前に検証する層がないため、状態保存層に注入された偽の行が、そのままコード実行に転化する。secondary に `identity-auth`（状態書き込みの認可）と `ai-decision-integrity`（エージェント判断の前提となる状態の完全性）を併記する。

Brief 027（LibreChat）と同じく、エージェント基盤において「設定・状態を記述するデータが、特権文脈で未検証のまま解釈される」構造である。027 はユーザーが指定する**接続先設定**が特権文脈（`process.env`）で展開された事例、本事象はエージェント自身の**永続状態**が検証なくランタイムに再構築された事例で、いずれも「エージェント基盤に固有のデータ層（設定・状態）が、従来の Web アプリで確立していた入力検証の境界を、エージェントの皮をかぶせたまま素通りする」点で共通する。Brief 003（Starlette/BadHost）が接続の**入口**（認証回避）、Brief 025（MCP SDK 設計）がリファレンス実装の設計に内在する RCE 経路を扱ったのに対し、本事象はエージェントの**状態の出所**に信頼境界が引かれていないことを際立たせる。

エージェント基盤の文脈では、チェックポイントの書き込みと読み戻しは「エージェントに過去の判断と権限文脈を引き継がせる」行為に等しい。その引き継ぎが、状態の作者性・完全性の検証なしに行われるとき、状態保存層ひとつで権限境界が崩れる。

---

## 5. 検出と証明の落差

脆弱性スキャナ、依存関係監査、egress の監視、そして CVE への迅速なパッチ適用は、本事案でも機能した。本事象は 3 件ともパッチ済みでの coordinated disclosure として処理されており、本 Brief が検出層やパッチ運用の役割を否定するものではない。

一方で、検出は「エージェントが、いま読み戻している状態を正規の自己状態として信頼してよいか」の判断自体を変えない。本事象の悪用は、エージェントが自分のチェックポイント保存層に対して行う正規のクエリ・デシリアライズの内側で起きる。通信としてはエージェントの通常動作と区別がつかず、注入された偽の行は「正しく保存された状態」と同じ経路で読み戻される。SQL インジェクションのパターン検査は個別の入口を塞ぐが、「この状態は誰の権限で・改ざんなく書かれたか」という状態の来歴・完全性そのものを立証する材料にはならない。監査の観点でも、事後に「どの状態が・いつ・誰の書き込みでランタイムに再構築されたか」を独立に示す証跡は、アプリログの突合以上には残りにくい。

事前証明（pre-execution attestation）は、エージェントの状態の読み戻しを権限行為として扱い、状態が再構築される前に「その状態の作者性（どのエージェント・実行が書いたか）」と「完全性（改ざんがないか）」を独立検証可能な証明として要求する設計を採る。proof が「このチェックポイントは認可された実行に由来し、改ざんがない」ことを満たさなければ、状態のロードは実行前に block される。

脆弱性スキャナ・依存関係監査による事後の検知・修正（detection）と、チェックポイントの読み戻しの前にその状態の作者性・完全性を独立検証する事前証明（pre-execution attestation）は代替ではなく **補完** の関係にある。前者は既知の脆弱性の発見とパッチ適用に、後者は注入された偽の状態が正規の自己状態として読み戻されコード実行へ転化する連鎖の遮断に、それぞれ働く。

---

## 6. 対応経緯と業界動向

- **LangChain / LangGraph**: 3 件をパッチ済みで公開し、修正版を提供。CVE-2026-28277 をポストエクスプロイト課題（チェックポイント保存層への書き込み権限を前提）と位置づけ、マネージド構成（LangSmith Deployment）には影響しないと説明
- **推奨される緩和**: 最新パッチの適用、自己ホスト LangGraph サーバーへの認証の実装、長期間有効な静的シークレットの回避、ネットワーク分離、そして **AI エージェントを特権 ID として扱い最小権限（PoLP）を適用する**こと
- **業界横断の論点**: MCP・エージェント基盤は 2026 年に入り CVE の集中領域になっており（Brief 003 の Starlette/BadHost、Brief 025 の MCP リファレンス SDK、Brief 027 の LibreChat 等）、「エージェント基盤に固有のデータ層（接続設定・永続状態・メモリ）を、どの信頼レベルで扱うか」が共通の設計課題として浮上している

自己ホスト型エージェント基盤の普及により、「状態・メモリ保存層の来歴と完全性の検証」は LangGraph 固有ではなく、ステートフルなエージェント実装一般の検証項目になりつつある。

---

## 7. Lemma による分析

本事象で露呈した検出と証明の落差（エージェントが自分の永続状態を、来歴と完全性の検証なしに特権文脈で再構築する）に対して、Lemma は、エージェントの状態の書き込み・読み戻しを権限行為として証跡化し、状態がランタイムに再構築される前に「どの実行が・どの権限で書いたか」「改ざんがないか」を独立検証可能な証明として検証する設計を提示している。

---

## 8. Sources

- **Check Point Research（一次・研究者解説）**: "From SQLi to RCE: Exploiting LangGraph's Checkpointer"（Yarden Porat、2026-06）— <https://research.checkpoint.com/2026/from-sqli-to-rce-exploiting-langgraphs-checkpointer/>
- **Check Point Blog（一次・ベンダー）**: "When Your AI Agent's Memory Becomes a Security Liability" — <https://blog.checkpoint.com/research/when-your-ai-agents-memory-becomes-a-security-liability/>
- **GitHub Security Advisory**: CVE-2025-67644（GHSA-9rwj-6rc7-p77c）— <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-9rwj-6rc7-p77c>
- **GitHub Security Advisory**: CVE-2026-28277（GHSA-g48c-2wqr-h844）— <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-g48c-2wqr-h844>
- **The Hacker News**: "LangGraph Flaw Chain Exposes Self-Hosted AI Agents to Remote Code Execution"（2026-06-12）— <https://thehackernews.com/2026/06/langgraph-flaw-chain-exposes-self.html>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
