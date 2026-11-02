---
brief_no: 139
title: "LangChain・LangGraph・CrewAI ほか：フレームワークの内部ロジックに、注入された内容が届く経路が示された(Check Point Research)"
title_en: "LangChain, LangGraph, CrewAI and more: Researchers showed how injected content can reach the trusted internal logic of agent frameworks (Check Point Research)"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [code-provenance]
incident_date: 2026-08-05
published: 2026-09-01
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["128-coding-agent-harness-authority-gap", "133-pyodide-sandbox-escape-seven-products", "039-semantic-kernel-prompt-injection-rce", "058-langgraph-checkpoint-rce"]
status: published
version: "1.0"
og_lead_ja: "LangChain・LangGraph ほか 6 フレームワークに 11 件の脆弱性"
og_lead_en: "11 flaws across six major agent frameworks (Check Point)"
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "脆弱性の開示 · エージェントフレームワーク"
og_kicker_en: "VULNERABILITY DISCLOSURE · AGENT FRAMEWORKS"
og_headline_ja: "6 つの主要\nフレームワークに、\n内部へ届く経路が 11 件。\n<accent>実地悪用の報告はない</accent>"
og_headline_en: "Six major agent frameworks,\n11 paths into their internals.\n<accent>No exploitation reported.</accent>"
key_figures:
  - value: "11"
    unit: "件"
    label: "Check Point Research が Black Hat USA 2026 で発表した、6 つのエージェントフレームワークの脆弱性。実地での悪用の報告はない"
    tone: "alert"
  - value: "6"
    unit: "フレームワーク"
    label: "LangChain・LangGraph・CrewAI・AutoGen・Microsoft Agent Framework・Google ADK"
  - value: "2025-11-19 → 2026-08-05"
    label: "LangGraph の 3 件を LangChain に責任開示してから、6 フレームワーク・11 件の一括発表まで"
glossary:
  - term: "チェックポイント"
    desc: "エージェントの途中の状態を保存し、あとで読み込んで続き（巻き戻し）から動かす機能。"
  - term: "デシリアライズ"
    desc: "保存されたデータを、プログラムが扱える形に戻すこと。読み込む値が安全でないと、データの中身が実行されうる。"
insight:
  slug: "internal-input-unchecked"
  label: "内部ロジックに届く値の来歴"
  quote: "フレームワークの内部状態や公開口に届く値は、来歴と認可が照合されなければ、そのまま信頼された処理に渡りうる。"
industries: ["ai", "developers"]
countries: ["global"]
controls:
  - slug: "check-origin"
    item: "チェックポイントなどの内部状態は、読み込む前に来歴と改ざんの有無を確認する"
  - slug: "verify-entry"
    item: "デプロイで公開される入口の認可状態を、既定値に頼らず確認する"
takeaway: "内部状態を読み込む前や入口を公開する前に、その値の来歴と認可を照合する手順が公表されていない。"
self_check: "エージェントフレームワークの内部状態や公開される入口を、読み込む前・公開する前に、来歴と認可で照合できるか。"
---

## 1. 要点

エージェントフレームワークの内部で、保存された状態の読み込みや、デプロイで公開される入口といった、信頼された処理に、注入された内容が届く経路が、研究者によって示された。いずれも、20 年前に修正のしかたが確立している脆弱性クラス（安全でないデシリアライズ・SSRF・パストラバーサル）である。実地での悪用の報告はない。<strong>フレームワークの内部状態や公開口に届く値は、来歴と認可が照合されなければ、そのまま信頼された処理に渡りうる。</strong>

## 2. 通った操作

- **通った操作**: 信頼された内部ロジックへ、注入された内容が渡る操作。LangGraph では、チェックポイントのフィルタ入力が SQL クエリに直接組み込まれる経路（CVE-2025-67644）と、チェックポイントの読み込みで msgpack が安全でなくデシリアライズされる経路（CVE-2026-28277）、Redis をチェックポイントストアに使う構成でクエリに値が組み込まれる経路（CVE-2026-27022）が示された。Microsoft Agent Framework では、ある利用者が仕込んだチェックポイントのペイロードが、別の利用者が自分のセッションを巻き戻した際に実行された。Google ADK では、アプリ一覧から隠された開発用の HTTP API が既定で認証を持たず、既定の Cloud Run デプロイでは、認証なしで到達できた。
- **受け付けた側に届くもの**: 一般に、フレームワークの内部ロジックは、届いた状態や入口への呼び出しを、信頼された操作として受け付ける。その値が、認可された実行に由来するのか、攻撃者が制御しうる入力なのかは、読み込む側・受け付ける側からは区別がつかない。
- **公表されていないこと**: 実地での悪用の有無（報告はない）。CVE-2026-28277 について、ベンダーの勧告は、保存済みのチェックポイントを書き換えられる権限が前提だと位置づけ、実運用で実行可能な経路は把握していないとしている。連鎖によるリモートコード実行は、Check Point Research の説明である。

## 3. 何を照合するか

経路を問わず区別できる条件は、フレームワークが内部状態を読み込む側・入口を公開する側が、その値の来歴と認可を、実行の前に、記録と照合することである。

- **誰が承認を出すか**: 状態は、それを書いた認可された実行の持ち主。公開される入口は、デプロイする人。承認は、読み込む状態のバイト列や、デプロイコマンドの既定値とは別に出す。
- **どこで照合するか**: チェックポイントやセッションを読み込む手前。デプロイが公開する入口を開く手前。
- **何が残るか**: どの状態を、どの実行に由来するものとして読み込んだか、どの入口を、誰の認可で公開したかの記録。フレームワークとは別に残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝内部状態を読み込む前、入口を公開する前に、来歴と認可を照合し、記録に残すこと。検知＝脆弱性を見つけて報告すること。下の日付は、責任開示・修正版の公開・発表の月で、各社が確認・公表した時期による。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>読み込む前に、状態の来歴と認可を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>内部状態の読み込みと公開される入口に、<br>注入された内容が届く経路が示された</span></div>
<div class="rx-zone det"><b>検知 · 研究者が見つけ、開示した</b>体系的に探して、責任開示で報告した</div>
<div class="rx-g g1"><div class="t">2025-11</div><b>LangGraph の 3 件を責任開示</b></div>
<div class="rx-g g2"><div class="t">2026-02</div><b>最後の修正版（langgraph 1.0.10）を公開</b></div>
<div class="rx-g g3"><div class="t">2026-06</div><b>技術解説を公開</b></div>
<div class="rx-g g4"><div class="t">2026-08</div><b>Black Hat で 11 件を一括発表</b></div>
</div>
</figure>

検知は効いた。ただ、内部ロジックが受け取る値の来歴を、読み込みの時点で照合する手順は、公表からは見えない。フレームワークや harness が安全と扱った値を後段が高い権限で実行する事案は、[Brief 128](https://lemma.frame00.com/ja/critical/briefs/128-coding-agent-harness-authority-gap/) や [Brief 133](https://lemma.frame00.com/ja/critical/briefs/133-pyodide-sandbox-escape-seven-products/) にもある。同じ LangGraph のチェックポイントは、[Brief 058](https://lemma.frame00.com/ja/critical/briefs/058-langgraph-checkpoint-rce/) が別の事案として扱っている。

## 4. Lemma でできること

**Lemma は、03 の照合を、フレームワークが内部状態を読み込む・入口を公開する操作の手前に組み込む。** 脆弱性そのものを見つけるのではなく、その値の来歴と認可を、実行の前に、記録と照合する。

### 注意したい業界・業務

- **業界 · AI・開発**: LangChain などのエージェントフレームワークで、エージェントを組み立てている組織。
- **業務 · エージェントの状態保存・デプロイ**: チェックポイントで途中の状態を保存して戻す業務。デプロイコマンドで、エージェントの入口を公開する業務。

### いまの対策と Lemma の違い

今回の経路は、1 列目（内部状態の読み込み）と 2 列目（デプロイで公開される入口の呼び出し）の 2 つである。

| 対策 | 内部状態の読み込み | 公開される入口の呼び出し |
| --- | --- | --- |
| 修正版の適用 | 効く | 一部 |
| 研究者による検査と責任開示 | 一部 | 一部 |
| 事後の監査ログ | 一部 | 関係しない |
| 既定の設定のまま公開する | 関係しない | 効かない |
| **Lemma（実行の前の照合）** | 効く | 効く |

修正版の適用は、示された脆弱性を塞ぐ。LangChain は LangGraph の 3 件をすべて修正し、Google は部分的な修正にとどまった。研究者による検査と責任開示は、経路の数を減らすが、次の脆弱性クラスが持ち込まれる前の読み込みは止めない。事後の監査ログは、チェックポイントが読み込まれた後に残るが、読み込んでよかったかを、読み込みの時点で判断する材料にならない。既定の設定のまま公開すると、Google ADK では認証なしで到達できた。Lemma は、読み込む前に、状態の来歴と改ざんの有無を照合し、入口の認可状態を、既定値に頼らず照合する。

注：Lemma の照合が働くのは、状態の読み込みと入口の公開に照合を組み込み、状態の由来や認可の記録が、フレームワークとは別に管理されている場合に限る。照合が示せるのは、読み込む状態の来歴と完全性までで、認可された実行が書いた状態の内容が業務上妥当だったかは示せない。個々の CVE の脆弱性を検出・修正するものでも、プロンプトインジェクションの発生そのものを防ぐものでもない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

エージェントフレームワークを使う組織で確認する 3 項目

- チェックポイントなどの内部状態を、読み込む前に、来歴と改ざんの有無を確認しているか。
- デプロイで公開される入口の認可状態を、既定値に頼らず確認しているか。
- 攻撃者が制御しうる入力が、クエリの組み立てや読み込みに渡る地点を、フレームワークの信頼された処理の外側として扱っているか。

## 5. 事実と時系列

- **研究者**: Check Point Research の Yarden Porat・Shahar Tal 両氏が、1 年をかけて主要フレームワークの突破を試み、Black Hat USA 2026（2026-08-05）で 6 フレームワーク・11 件の脆弱性を発表した。対象は LangChain・LangGraph・CrewAI・AutoGen・Microsoft Agent Framework・Google ADK で、エージェント構築に広く使われるオープンソースまたはベンダー提供のフレームワークである。
- **実地の被害**: 実地攻撃としての悪用報告はない。いずれも研究者による発見と責任開示で、Microsoft と Google の 2 件についてはバウンティが支払われている。
- **LangGraph の 3 件**: 2025 年 11 月に LangChain へ責任開示され、修正版は 2025 年 12 月から 2026 年 2 月にかけて順次公開された（勧告の公開はそれぞれ数日〜1 週間後）。Black Hat での発表は、これらを含む 11 件を一つの構図としてまとめたものである。
- **研究者が示した流れ（LangGraph）**: (1) 永続化層のチェックポイント機能で、`get_state_history()` のフィルタ入力が SQL クエリへ直接組み込まれ、SQLite 側で SQL 注入が成立する（CVE-2025-67644。NVD 採点 7.8・GitHub 採点 7.3。langgraph-checkpoint-sqlite 3.0.1 で修正）。フィルタの「値」ではなく「キー」が検証されずに f-string へ補間されることが原因で、ベンダー勧告は、任意のフィルタキーを利用者に指定させている時点で、その利用者は既にチェックポイント DB を照会する正当な権限を持っている可能性が高く、その場合は権限昇格に当たらないことがある、と付記している。(2) 同じ読み込み経路に、msgpack の安全でないデシリアライズがある（CVE-2026-28277。NVD 採点 7.2・GitHub 採点 6.8。pip の `langgraph` 1.0.9 以前が対象、1.0.10 で修正）。Check Point は (1) と (2) が連鎖してリモートコード実行に至ると説明している。ベンダー勧告はこれを「post-exploitation / defense-in-depth」の問題と位置づけ、成立には保存済みチェックポイントのバイト列を書き換えられる権限が前提だとしたうえで、実運用における実行可能な経路は把握していないと明記している。(3) Redis をチェックポイントストアに使う構成では、RediSearch のクエリにフィルタのキーと値がエスケープなしで補間され、意図したアクセス制御を迂回されうる（CVE-2026-27022。GitHub 採点 6.5。npm の `@langchain/langgraph-checkpoint-redis` 1.0.2 で修正）。
- **研究者が示した流れ（Microsoft Agent Framework）**: チェックポイント機能の安全でないデシリアライズにより、ある利用者が仕込んだペイロードが、別の利用者が自分のセッションを巻き戻した際に実行され、攻撃者にシェルが渡る経路が確認された（一般提供開始前の段階だったため CVE 番号は付与されていない）。
- **研究者が示した流れ（Google ADK）**: アプリ一覧から隠された組み込み開発アシスタント用 HTTP API が既定で認証を持たない。攻撃者はセッションを開き、インポート時に実行される Python コードを持つエージェントを ADK に書かせ、そのエージェントの実行を要求する。サーバーがファイルをインポートした時点でコードが動く。`adk deploy cloud_run` はこの API をそのまま公開するため、既定の Cloud Run デプロイでは認証なしで到達でき、環境変数の API キーとコンテナの GCP サービスアカウントに届く（CVE 番号なし）。
- **研究者の見方**: 「我々の調査が示すのはより深い失敗である。多くのエージェントフレームワークで、プロンプトに制御された内容が、信頼されたフレームワークのロジックそのものへ境界を越えて入り込みうる」（Yarden Porat・Shahar Tal、Black Hat 発表の write-up）。「エージェントフレームワークのバグは、一つの製品のバグではない。AI アプリのカテゴリ全体が乗っている層のバグである。そしてエージェントを敵に回すのに危険なツールは要らない。間違った文書を読むだけで足りる」（Shahar Tal、The Register への発言）。

### 時系列

- **2025-11-19**: Check Point Research が LangGraph の 3 件（CVE-2025-67644・CVE-2026-28277・CVE-2026-27022）を LangChain へ責任開示。
- **2025-12-09**: CVE-2025-67644 の修正版 langgraph-checkpoint-sqlite 3.0.1 が PyPI に公開（勧告 12-10、NVD 掲載 12-11）。
- **2026-02-05**: CVE-2026-27022 の修正版 @langchain/langgraph-checkpoint-redis 1.0.2 が npm に公開（勧告 02-18、NVD 掲載 02-20）。
- **2026-02-27**: CVE-2026-28277 の修正版 pip langgraph 1.0.10 が公開（勧告 GHSA-g48c-2wqr-h844 は 03-05）。
- **2026-06-11**: Check Point Research が LangGraph の 3 件を技術解説するブログ記事を公開。
- **2026-08-05**: Black Hat USA 2026 で、6 フレームワーク・11 件として一括発表。The Register が同日、Jessica Lyons 記者による報道で技術詳細を伝える。

> Microsoft Agent Framework と Google ADK の 2 件は CVE 番号が付与されておらず、本稿はこの 2 件について Check Point Research の発表内容および独立報道（The Register）の記述に基づく。CVE が付与された 3 件は、いずれも実地悪用の報告がない。なお Check Point Research 自身が、CVE-2025-67644 と CVE-2026-28277 については他の研究者も独立に発見していたと記している。Check Point のブログ記事の開示時系列は msgpack の脆弱性を CVE-2026-28227 と記しているが、この番号は別製品（Discourse）に割り当てられており、正しくは CVE-2026-28277 である。本 Brief は、特定の事業者を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **LangChain**: LangGraph の 3 件をすべて修正した（langgraph-checkpoint-sqlite 3.0.1 以降・langgraph 1.0.10 以降・@langchain/langgraph-checkpoint-redis 1.0.2 以降）。マネージド型クラウドサービス（LangSmith Deployment、旧 LangGraph Platform）は PostgreSQL を使用しており、今回の SQLite / Redis 経路の対象外である。
- **Microsoft**: 指摘を認め、10,000 ドルのバウンティを支払って修正した。該当機能が一般提供開始前だったため CVE は発行していない。同社は「実証で示された具体的な悪用経路を防ぐための保護を出した」とし、あわせて当該チェックポイントファイルにセキュリティ境界を定義する記述を追加したと説明している。
- **Google**: 当初この挙動を脆弱性と分類することを拒み、最終的に部分的な修正のみを行い、CVE も発行せず、3,133.70 ドルのバウンティを支払った。

## 6. Sources
- **The Register（独立報道・一次取材）**: Jessica Lyons, "Prompt injection isn't the bug, AI agent frameworks are"（2026-08-05）— <https://www.theregister.com/security/2026/08/05/prompt-injection-isnt-the-bug-ai-agent-frameworks-are/5283585>
- **Check Point Research（研究一次）**: Yarden Porat, "From SQLi to RCE — Exploiting LangGraph's Checkpointer"（2026-06-11）— <https://research.checkpoint.com/2026/from-sqli-to-rce-exploiting-langgraphs-checkpointer/>
- **GitHub Security Advisory（一次・ベンダー勧告）**: GHSA-g48c-2wqr-h844（CVE-2026-28277、pip langgraph <= 1.0.9、1.0.10 で修正）— <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-g48c-2wqr-h844> / GHSA-9rwj-6rc7-p77c（CVE-2025-67644）— <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-9rwj-6rc7-p77c> / GHSA-5mx2-w598-339m（CVE-2026-27022）— <https://github.com/langchain-ai/langgraphjs/security/advisories/GHSA-5mx2-w598-339m>
- **NVD（一次・CVE）**: CVE-2025-67644 — <https://nvd.nist.gov/vuln/detail/CVE-2025-67644> / CVE-2026-28277 — <https://nvd.nist.gov/vuln/detail/CVE-2026-28277> / CVE-2026-27022 — <https://nvd.nist.gov/vuln/detail/CVE-2026-27022>
- **Tenable（独立解析）**: CVE-2025-67644 — <https://www.tenable.com/cve/CVE-2025-67644>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
