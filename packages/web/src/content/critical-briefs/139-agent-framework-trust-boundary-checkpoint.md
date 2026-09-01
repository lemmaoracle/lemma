---
brief_no: 139
title: "LangChain・LangGraph・CrewAI など 6 つのエージェントフレームワークで 11 件の脆弱性が開示された — 注入された内容が、信頼された内部ロジックへ渡る前に確かめられていない"
title_en: "Eleven vulnerabilities were disclosed across six agent frameworks including LangChain, LangGraph, and CrewAI — injected content is never checked before it crosses into trusted framework logic"
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
---

## 1. TL;DR

Check Point Research は 2026 年 8 月 5 日、Black Hat USA 2026 で、LangChain・LangGraph・CrewAI を含む主要 6 エージェントフレームワークにまたがる脆弱性 11 件を発表した。安全でないデシリアライズ・SSRF・パストラバーサルという、20 年前に修正のしかたが確立している脆弱性クラスである。実地悪用の報告はない。検出は効いていた。**効かなかったのは、注入された内容がフレームワークの信頼された内部ロジックへ渡る前に、それを独立に検証する層である。**

## 2. 何が起きたか

- Check Point Research の Yarden Porat・Shahar Tal 両氏が、1 年をかけて主要フレームワークの突破を試み、Black Hat USA 2026（2026-08-05）で 6 フレームワーク・11 件の脆弱性を発表した。
- 対象は LangChain・LangGraph・CrewAI・AutoGen・Microsoft Agent Framework・Google ADK。いずれもエージェント構築に広く使われるオープンソースまたはベンダー提供のフレームワークである。
- 実地攻撃としての悪用報告はない。いずれも研究者による発見と責任開示であり、Microsoft と Google の 2 件についてはバウンティが支払われている。
- LangGraph の 3 件については、2025 年 11 月に LangChain へ責任開示され、修正版は 2025 年 12 月から 2026 年 2 月にかけて順次公開された（勧告の公開はそれぞれ数日〜1 週間後）。Black Hat での発表は、これらを含む 11 件を一つの構図としてまとめたものである。

攻撃は次のように成立しうる。

1. LangGraph の永続化層（チェックポイント機能）では、`get_state_history()` のフィルタ入力が SQL クエリへ直接組み込まれ、SQLite 側で SQL 注入が成立する（CVE-2025-67644。NVD 採点 7.8・GitHub 採点 7.3。langgraph-checkpoint-sqlite 3.0.1 で修正）。フィルタの「値」ではなく「キー」が検証されずに f-string へ補間されることが原因である。なおベンダー勧告は、任意のフィルタキーを利用者に指定させている時点で、その利用者は既にチェックポイント DB を照会する正当な権限を持っている可能性が高く、その場合は権限昇格に当たらないことがある、と付記している。
2. 同じチェックポイント読み込み経路には、msgpack の安全でないデシリアライズがある（CVE-2026-28277。NVD 採点 7.2・GitHub 採点 6.8。pip の `langgraph` 1.0.9 以前が対象、1.0.10 で修正）。Check Point は 1 と 2 が連鎖してリモートコード実行に至ると説明している。**ただしベンダー側の勧告はこれを「post-exploitation / defense-in-depth」の問題と位置づけ、成立には保存済みチェックポイントのバイト列を書き換えられる権限が前提だとしたうえで、実運用における実行可能な経路は把握していないと明記している。**
3. Redis をチェックポイントストアに使う構成では、同じ注入のクラスが Redis 側に持ち込まれる（CVE-2026-27022。GitHub 採点 6.5。npm の `@langchain/langgraph-checkpoint-redis` 1.0.2 で修正）。RediSearch のクエリにフィルタのキーと値がエスケープなしで補間され、意図したアクセス制御を迂回されうる。
4. Microsoft Agent Framework では、チェックポイント機能の安全でないデシリアライズにより、ある利用者が仕込んだペイロードが、別の利用者が自分のセッションを巻き戻した際に実行され、攻撃者にシェルが渡る経路が確認された（一般提供開始前の段階だったため CVE 番号は付与されていない）。
5. Google ADK では、アプリ一覧から隠された組み込み開発アシスタント用 HTTP API が既定で認証を持たない。攻撃者はセッションを開き、インポート時に実行される Python コードを持つエージェントを ADK に書かせ、そのエージェントの実行を要求する。サーバーがファイルをインポートした時点でコードが動く。`adk deploy cloud_run` はこの API をそのまま公開するため、既定の Cloud Run デプロイでは認証なしで到達でき、環境変数の API キーとコンテナの GCP サービスアカウントに届く（CVE 番号なし）。

## 3. 時系列 — 公表と対応

- 2025-11-19：Check Point Research が LangGraph の 3 件（CVE-2025-67644・CVE-2026-28277・CVE-2026-27022）を LangChain へ責任開示。
- 2025-12-09：CVE-2025-67644 の修正版 langgraph-checkpoint-sqlite 3.0.1 が PyPI に公開（勧告 12-10、NVD 掲載 12-11）。
- 2026-02-05：CVE-2026-27022 の修正版 @langchain/langgraph-checkpoint-redis 1.0.2 が npm に公開（勧告 02-18、NVD 掲載 02-20）。
- 2026-02-27：CVE-2026-28277 の修正版 pip langgraph 1.0.10 が公開（勧告 GHSA-g48c-2wqr-h844 は 03-05）。
- 2026-06-11：Check Point Research が LangGraph の 3 件を技術解説するブログ記事を公開。
- 2026-08-05：Black Hat USA 2026 で、6 フレームワーク・11 件として一括発表。The Register が同日、Jessica Lyons 記者による報道で技術詳細を伝える。

> Microsoft Agent Framework と Google ADK の 2 件は CVE 番号が付与されておらず、本稿はこの 2 件について Check Point Research の発表内容および独立報道（The Register）の記述に基づく。CVE が付与された 3 件は、いずれも実地悪用の報告がない。なお Check Point Research 自身が、CVE-2025-67644 と CVE-2026-28277 については他の研究者も独立に発見していたと記している。Check Point のブログ記事の開示時系列は msgpack の脆弱性を CVE-2026-28227 と記しているが、この番号は別製品（Discourse）に割り当てられており、正しくは CVE-2026-28277 である。

公表後の対応と業界の動きは次のとおり。

- LangChain は LangGraph の 3 件をすべて修正した（langgraph-checkpoint-sqlite 3.0.1 以降・langgraph 1.0.10 以降・@langchain/langgraph-checkpoint-redis 1.0.2 以降）。
- Microsoft は指摘を認め、10,000 ドルのバウンティを支払って修正した。該当機能が一般提供開始前だったため CVE は発行していない。同社は「実証で示された具体的な悪用経路を防ぐための保護を出した」とし、あわせて当該チェックポイントファイルにセキュリティ境界を定義する記述を追加したと説明している。
- Google は当初この挙動を脆弱性と分類することを拒み、最終的に部分的な修正のみを行い、CVE も発行せず、3,133.70 ドルのバウンティを支払った。
- LangChain のマネージド型クラウドサービス（LangSmith Deployment、旧 LangGraph Platform）は PostgreSQL を使用しており、今回の SQLite / Redis 経路の対象外である。

## 4. なぜ止まらなかったか

この事案の失敗は、個々のバグが見つけにくかったことでも、修正が遅れたことでもない。**安全でないデシリアライズ・SSRF・パストラバーサルという、既に 20 年前に修正のしかたが確立している脆弱性クラスが、状態管理・チェックポイント読み込み・組み込み API というフレームワーク自身の内部ロジックへ再び持ち込まれ、そこへ渡る値の来歴と完全性を独立に確かめる層が無かった**ことにある。

検出は効いていた。Check Point Research が体系的に発見し（うち 2 件は他の研究者も独立に到達している）、責任開示の手続きで報告し、大半のベンダーは修正した。足りなかったのは、プロンプトインジェクションそのものを防ぐ手立てではない。注入された内容がフレームワークの信頼された内部ロジック——状態の永続化・セッションの巻き戻し・デプロイコマンド——へ渡る手前で、その内容を独立に検証する層である。

> 「我々の調査が示すのはより深い失敗である。多くのエージェントフレームワークで、プロンプトに制御された内容が、信頼されたフレームワークのロジックそのものへ境界を越えて入り込みうる」——Yarden Porat・Shahar Tal（Black Hat 発表の write-up）
>
> 「エージェントフレームワークのバグは、一つの製品のバグではない。AI アプリのカテゴリ全体が乗っている層のバグである。そしてエージェントを敵に回すのに危険なツールは要らない。間違った文書を読むだけで足りる」——Shahar Tal（The Register への発言）

Google ADK の経緯はこの落差をさらに際立たせる。同社は当初この挙動を脆弱性として分類することを拒み、最終的な修正も部分的なものにとどまった。検出されたのに、なお境界として扱われなかったという形である。

フレームワークや harness が安全と扱った値を後段がそのまま高い権限で実行する構図は、[Brief 128](https://lemma.frame00.com/ja/critical/briefs/128-coding-agent-harness-authority-gap/) や [Brief 133](https://lemma.frame00.com/ja/critical/briefs/133-pyodide-sandbox-escape-seven-products/) でも繰り返し確認されている。同じ LangGraph のチェックポイントについては [Brief 058](https://lemma.frame00.com/ja/critical/briefs/058-langgraph-checkpoint-rce/) が別の事案として扱っている。

## 5. 証明があれば、何が変わるか

事前証明は、内部ロジックを動かしてよいかの判断を「フレームワークがその値を安全と扱ったか」ではなく、「その値の来歴と完全性を独立に確かめられたか」に置き換える。脆弱性クラスを塞ぎ切るのではない。塞ぎ切れなくても、注入された内容が信頼された経路に乗らないようにする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>状態の来歴証明</strong>：フレームワーク内部の状態（チェックポイント・セッション）を読み込む前に、それが認可された実行に由来し、改ざんがないことを独立に検証・証明する。</li>
<li><strong>公開口の認可確認</strong>：デプロイ・公開コマンドが生成するエンドポイントの認可状態を、既定値に頼らず独立に確かめる。</li>
<li><strong>境界の外側として扱う</strong>：攻撃者が制御しうる入力がクエリ構築やデシリアライズへ渡る地点を、フレームワークの信頼済みロジックの外側として扱う。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>個々の CVE の脆弱性そのものを検出・修正することはしない。それは研究者とベンダーの仕事である。</li>
<li>プロンプトインジェクションの発生そのものを防ぐものではない。研究者自身が「起きるものとして設計せよ」という前提に立っている。</li>
<li>証明が示せるのは、読み込む状態の来歴と完全性までである。認可された実行が書いた状態の内容が業務上妥当だったかまでは示せない。</li>
</ul>

事後の監査ログとの違いはここにある。ログはチェックポイントが読み込まれた後に残るが、そのチェックポイントを読み込んでよかったかを、読み込みの時点で判断する材料にはならない。

検出の層と、この層は代替ではなく補完の関係にある。前者は脆弱性クラスを見つけて経路の数を減らし、後者は「来歴が確かめられるまで、内部ロジックはその値を受け取らない」ことを、次の脆弱性クラスが持ち込まれる前に確かめられるようにする。

## 6. Sources

- **The Register（独立報道・一次取材）**: Jessica Lyons, "Prompt injection isn't the bug, AI agent frameworks are"（2026-08-05）— <https://www.theregister.com/security/2026/08/05/prompt-injection-isnt-the-bug-ai-agent-frameworks-are/5283585>
- **Check Point Research（研究一次）**: Yarden Porat, "From SQLi to RCE — Exploiting LangGraph's Checkpointer"（2026-06-11）— <https://research.checkpoint.com/2026/from-sqli-to-rce-exploiting-langgraphs-checkpointer/>
- **GitHub Security Advisory（一次・ベンダー勧告）**: GHSA-g48c-2wqr-h844（CVE-2026-28277、pip langgraph <= 1.0.9、1.0.10 で修正）— <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-g48c-2wqr-h844> / GHSA-9rwj-6rc7-p77c（CVE-2025-67644）— <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-9rwj-6rc7-p77c> / GHSA-5mx2-w598-339m（CVE-2026-27022）— <https://github.com/langchain-ai/langgraphjs/security/advisories/GHSA-5mx2-w598-339m>
- **NVD（一次・CVE）**: CVE-2025-67644 — <https://nvd.nist.gov/vuln/detail/CVE-2025-67644> / CVE-2026-28277 — <https://nvd.nist.gov/vuln/detail/CVE-2026-28277> / CVE-2026-27022 — <https://nvd.nist.gov/vuln/detail/CVE-2026-27022>
- **Tenable（独立解析）**: CVE-2025-67644 — <https://www.tenable.com/cve/CVE-2025-67644>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。エージェント権限の証明は[Pillar 03 — エージェント権限](https://lemma.frame00.com/ja/pillars/#authority)。

CVE-2026-28277 について、ベンダー勧告は保存済みチェックポイントへの書き込み権限を前提とする防御多層化の問題と位置づけ、実運用で実行可能な経路は把握していないとしています。連鎖による実行は Check Point Research の説明です。
