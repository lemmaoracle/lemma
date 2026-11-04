---
brief_no: 58
title: "LangGraph：エージェントが保存した状態（チェックポイント）を読み込むときに、コードが実行される経路が示された(Check Point Research)"
title_en: "LangGraph: Researchers showed code running when an agent loads its saved state (Check Point Research)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "ai-decision-integrity"]
incident_date: 2026-06-12
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["139-agent-framework-trust-boundary-checkpoint", "027-librechat-mcp-url-secrets", "025-mcp-stdio-config-to-command-rce", "003-starlette-badhost", "037-agent-config-auto-execution"]
status: published
layout: "report"
sections: "proof"
gate: "intake"
version: "1.0"
og_lead_ja: "LangGraph のチェックポイントに 3 件の脆弱性、2 件の連鎖で遠隔コード実行"
og_lead_en: "Three LangGraph checkpoint flaws; two chain into RCE (Check Point)"
og_kicker_ja: "脆弱性の開示 · エージェント基盤"
og_kicker_en: "DISCLOSURE · AGENT CHECKPOINTS"
og_headline_ja: "チェックポイントの\n読み込みで、\nコードが実行される\n<accent>経路を研究者が報告</accent>"
og_headline_en: "Loading saved agent state\ncan run attacker code,\n<accent>researchers report.</accent>"
key_figures:
  - value: "3"
    unit: "件"
    label: "Check Point Research の Yarden Porat 氏が公開した LangGraph の脆弱性。うち 2 件の連鎖で遠隔コード実行に至る"
    tone: "alert"
  - value: "7.3"
    unit: "CVSS"
    label: "3 件のうち最も高い深刻度（CVE-2025-67644・SQLite チェックポイントの SQL インジェクション）"
  - value: "2026-06-12"
    label: "3 件の公開。修正版が利用可能な状態での協調的開示だった"
glossary:
  - term: "チェックポイント"
    desc: "エージェントの途中の状態を保存しておき、処理を再開するときに読み込む仕組み。エージェントの「記憶」にあたる。"
  - term: "デシリアライズ"
    desc: "保存されたデータを、プログラムが扱える形に戻すこと。読み込む値が安全でないと、データの中身が実行されうる。"
insight:
  slug: "self-state-unchecked"
  label: "読み込む状態の来歴"
  quote: "エージェントが自分の保存した状態として読み込む値は、来歴と改ざんの有無が照合されなければ、注入された値でもそのまま信頼された処理に渡りうる。"
industries: ["ai", "developers"]
controls:
  - slug: "ownership-check"
    item: "読み込む前に、チェックポイントが自分で保存したものか確認する"
takeaway: "チェックポイントを読み込む前に、その状態の来歴と改ざんの有無を照合する手順は、公表からは見えない。"
self_check: "エージェントが保存した状態を読み込む前に、その状態が認可された実行で書かれ、改ざんされていないかを照合できるか。"
search_title: "LangGraph のチェックポイント脆弱性：経路と対策"
search_description: "LangGraph のチェックポイントで、SQL インジェクションと安全でないデシリアライズが連鎖し、遠隔コード実行に至る経路が示された（Check Point Research）。何が起きたか、なぜ止まらないか、対策を整理。"
countries: ["global"]
---

## 1. 要点

LangChain のエージェント基盤 LangGraph で、エージェントが保存した状態（チェックポイント）を読み込むときに、攻撃者のコードが実行されうる経路が、Check Point Research の研究者によって示された。チェックポイントの照会に混ぜた偽の行が、正規に保存された状態と同じ経路で読み込まれる。対象は自己ホストの構成で、3 件とも修正版が出ている。<strong>エージェントが自分の保存した状態として読み込む値は、来歴と改ざんの有無が照合されなければ、注入された値でもそのまま信頼された処理に渡りうる。</strong>

## 2. 通った操作

- **通った操作**: チェックポイントの照会と読み込み。研究者は、SQLite のチェックポイント実装で filter のキーが検証されずにクエリへ組み込まれる SQL インジェクション（CVE-2025-67644）と、チェックポイントの読み込みでの msgpack の安全でないデシリアライズ（CVE-2026-28277）を連鎖させると、遠隔コード実行に至ると説明している。成立の条件は、アプリが `get_state_history()` を公開し、利用者が制御できる filter 入力を受けることである。Redis のチェックポイント実装には、アクセス制御を回避しうるクエリインジェクション（CVE-2026-27022）が示された。
- **受け付けた側に届くもの**: エージェントは、照会で返ってきたチェックポイントの行を、自分が正規に保存した状態として読み込む。その行が認可された実行で書かれたものか、照会に注入されたものかは、読み込む側からは区別がつかない。研究者によれば、成立したときに届くのは、エージェントが扱う LLM の API キー・顧客データ・会話履歴と、CRM や社内 API など外部システムの認証情報である。
- **公表されていないこと**: 実地での悪用の有無。LangGraph 側は CVE-2026-28277 を、チェックポイントの保存層に書き込める権限を前提とする「ポストエクスプロイト」の問題と位置づけている。連鎖による遠隔コード実行は、Check Point Research の説明である。

## 3. 実行前の照合

経路を問わず区別できる条件は、エージェントが状態を読み込む側で、その状態がどの実行に由来し、改ざんされていないかを、読み込む前に、保存の記録と照合することである。

- **誰が承認を出すか**: 状態を書いた、認可された実行の持ち主。承認は、読み込む状態のバイト列とは別に出す。
- **どこで照合するか**: チェックポイントを読み込み、ランタイムの状態に戻す手前。
- **何が残るか**: どの状態を、どの実行が書いたものとして、いつ読み込んだかの記録。チェックポイントの保存層とは別に残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝チェックポイントを読み込む前に、状態の来歴と改ざんの有無を照合し、記録に残すこと。検知＝脆弱性を見つけて報告し、修正すること。下の並びは、Check Point Research と LangGraph 側の公表による。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>読み込む前に、状態の来歴と改ざんの有無を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>照会に混ぜた偽の行が、<br>正規の状態と同じ経路で読み込まれる</span></div>
<div class="rx-zone det"><b>検知 · 研究者が見つけ、開示した</b>修正版が利用可能な状態で、協調的開示として公開した</div>
<div class="rx-g g1"><div class="t">公表前</div><b>3 件の修正版を提供</b></div>
<div class="rx-g g2"><div class="t">2026-06-12</div><b>Check Point Research が 3 件を公開</b></div>
<div class="rx-g g3"><div class="t">同日</div><b>LangGraph 側がマネージド構成は対象外と説明</b></div>
<div class="rx-g g4"><div class="t">その後</div><b>修正版の適用と認証・最小権限が推奨される</b></div>
</div>
</figure>

検知と修正は働いた。ただ、エージェントが読み込む状態の来歴を、読み込みの時点で照合する手順は、公表からは見えない。エージェント基盤で、設定や状態を記述するデータが高い権限の文脈でそのまま解釈される事案は、[Brief 027](https://lemma.frame00.com/ja/critical/briefs/027-librechat-mcp-url-secrets/)（接続先の設定）や [Brief 025](https://lemma.frame00.com/ja/critical/briefs/025-mcp-stdio-config-to-command-rce/) にもある。同じ LangGraph のチェックポイントを含む、のちの一括発表は [Brief 139](https://lemma.frame00.com/ja/critical/briefs/139-agent-framework-trust-boundary-checkpoint/) が扱っている。

## 4. Lemma でできること

**Lemma は、03 の照合を、エージェントがチェックポイントを読み込む操作の手前に組み込む。** 脆弱性そのものを見つけるのではなく、読み込む状態がどの実行に由来し、改ざんされていないかを、読み込む前に、記録と照合する。

### 注意したい業界・業務

- **業界 · AI・開発**: LangGraph などのエージェント基盤を自己ホストで動かし、エージェントを組み立てている組織。
- **業務 · エージェントの状態保存**: チェックポイントで途中の状態を保存し、処理の再開や履歴の参照のために読み込む業務。

### いまの対策と Lemma の違い

今回の経路は、1 列目（filter 入力を受けるチェックポイントの照会）と 2 列目（照会で返った状態の読み込み）の 2 つである。

| 対策 | チェックポイントの照会 | 状態の読み込み |
| --- | --- | --- |
| 修正版の適用 | 効く | 効く |
| 自己ホストのサーバーへの認証 | 一部 | 関係しない |
| ネットワーク分離 | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 関係しない | 効く |

修正版の適用は、示された 3 件を塞ぐ。自己ホストのサーバーへの認証とネットワーク分離は、filter 入力を送れる相手を絞るが、届いた照会の中身は変えない。Lemma は照会の組み立てには関わらず、読み込む前に、その状態が認可された実行で書かれ、改ざんされていないかを照合する。

注：Lemma の照合が働くのは、チェックポイントの読み込みに照合を組み込み、状態を書いた実行の記録が、保存層とは別に管理されている場合に限る。照合が示せるのは、読み込む状態の来歴と改ざんの有無までで、認可された実行が書いた状態の中身が業務上妥当だったかは示せない。SQL インジェクションやデシリアライズの脆弱性を検出・修正するものではない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

エージェント基盤を自己ホストで動かす組織で確認する 3 項目

- チェックポイントを読み込む前に、それが認可された実行で保存されたものか、改ざんされていないかを確認しているか。
- `get_state_history()` のように、利用者の入力でチェックポイントを照会する入口を、認証なしで公開していないか。
- エージェントのランタイムが持つ API キーや外部システムの認証情報を、最小権限に絞っているか。

## 5. 事実と時系列

- **研究者**: Check Point Research の Yarden Porat 氏が、2026-06-12 に LangGraph の 3 件の脆弱性を公開し、CVE-2025-67644 と CVE-2026-28277 を連鎖させた遠隔コード実行の概念実証を含む技術解説を、同日に公表した。
- **3 件の内容**: CVE-2025-67644（CVSS 7.3）は SQLite チェックポイント実装の SQL インジェクションで、metadata の filter キーを通じてクエリを操作できる。`langgraph-checkpoint-sqlite` 3.0.1 未満が対象。CVE-2026-28277（CVSS 6.8）は安全でない msgpack デシリアライズで、攻撃者がチェックポイントのデータを改変できる場合に、読み込み時のオブジェクトの再構築が誘発される。`langgraph` 1.0.9 以前が対象。CVE-2026-27022（CVSS 6.5）は `@langchain/langgraph-checkpoint-redis` の RediSearch クエリインジェクションで、アクセス制御を回避しうる。1.0.2 未満が対象。
- **影響の範囲**: 影響を受けるのは、SQLite または Redis のチェックポイント実装を使い、利用者由来の filter 入力を受ける自己ホストの構成である。LangChain のマネージド基盤（LangSmith Deployment、PostgreSQL の構成）は対象外とされている。
- **LangGraph 側の位置づけ**: CVE-2026-28277 を、チェックポイントの保存層への書き込み権限を前提とする「ポストエクスプロイト」の問題と説明している。
- **研究者の見方**: Check Point は、SQL インジェクションという古典的な脆弱性が、高い権限と信頼を持つ AI エージェント基盤の内側で起きると影響が大きくなる点を、本件の要点に挙げている。

### 時系列

- **公表前**: 3 件の修正版が用意され、修正版が利用可能な状態での協調的開示となった。
- **2026-06-12**: Check Point Research の Yarden Porat 氏が 3 件を公開し、技術解説を公表。
- **2026-06-12（同日）**: The Hacker News ほかが報道。LangGraph のメンテナは、CVE-2026-28277 をポストエクスプロイトの問題と位置づけ、マネージド（LangSmith）構成には影響しないと説明。

> 一部の集約データベースでは、関連する CVE 番号（チェックポイントのキャッシュ層の pickle デシリアライズなど）に揺れがある。本稿は、GitHub Security Advisory と Check Point Research の記述に従う。実地での悪用の有無は、上の公表からは分からない。本 Brief は、特定の事業者を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **LangChain / LangGraph**: 3 件を修正した（`langgraph-checkpoint-sqlite` 3.0.1 以降・`langgraph` 1.0.10 以降・`@langchain/langgraph-checkpoint-redis` 1.0.2 以降）。
- **公表で挙げられた緩和策**: 最新の修正版の適用、自己ホストの LangGraph サーバーへの認証の実装、長く有効な静的シークレットを避けること、ネットワーク分離、AI エージェントを特権を持つ ID として扱い最小権限を適用すること。

## 6. Sources

- **Check Point Research（一次・研究者解説）**: "From SQLi to RCE: Exploiting LangGraph's Checkpointer"（Yarden Porat、2026-06）— <https://research.checkpoint.com/2026/from-sqli-to-rce-exploiting-langgraphs-checkpointer/>
- **Check Point Blog（一次・ベンダー）**: "When Your AI Agent's Memory Becomes a Security Liability" — <https://blog.checkpoint.com/research/when-your-ai-agents-memory-becomes-a-security-liability/>
- **GitHub Security Advisory**: CVE-2025-67644（GHSA-9rwj-6rc7-p77c）— <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-9rwj-6rc7-p77c>
- **GitHub Security Advisory**: CVE-2026-28277（GHSA-g48c-2wqr-h844）— <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-g48c-2wqr-h844>
- **The Hacker News**: "LangGraph Flaw Chain Exposes Self-Hosted AI Agents to Remote Code Execution"（2026-06-12）— <https://thehackernews.com/2026/06/langgraph-flaw-chain-exposes-self.html>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
