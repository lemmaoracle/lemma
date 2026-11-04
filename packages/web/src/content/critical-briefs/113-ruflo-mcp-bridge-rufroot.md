---
brief_no: 113
title: "Ruflo の MCP Bridge：認証の無い要求が高権限のツールを開き、修正の後も記憶の汚染が残りうると報告された(Noma Security の研究、CVE-2026-59726)"
title_en: "Ruflo's MCP Bridge: an unauthenticated request could open high-privilege tools, and memory poisoning can outlast the patch, researchers report (Noma Security research, CVE-2026-59726)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-07-28
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["066-litellm-ai-gateway-privilege-escalation", "088-kestra-auth-filter-bypass-rce", "046-servicenow-unauthenticated-api", "095-amazon-q-mcp-auto-execution", "073-shadowmq-pickle-zmq-pattern"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Ruflo の MCP Bridge で、認証の無い要求が高権限のツールを実行できる脆弱性（CVE-2026-59726）を Noma Security が報告。記憶の汚染は修正の後も残りうる"
og_lead_en: "Noma Security reports a Ruflo MCP Bridge flaw (CVE-2026-59726) that let unauthenticated requests run high-privilege tools; memory poisoning can outlast the patch"
og_kicker_ja: "脆弱性の開示 · エージェント基盤"
og_kicker_en: "VULNERABILITY · AGENT PLATFORM"
og_headline_ja: "認証の無い 1 つの要求が\n233 の高権限ツールを\n開くと研究者が報告。\n<accent>深刻度は CVSS 10.0</accent>"
og_headline_en: "Unauthenticated calls\ncould open 233 tools,\nresearchers report.\n<accent>Rated CVSS 10.0</accent>"
search_title: "Ruflo の RufRoot：無認証 RCE と残る記憶の汚染"
search_description: "AI エージェント基盤 Ruflo の MCP Bridge で、認証の無い要求が高権限のツールを実行でき、修正の後も記憶の汚染が残りうると報告された（Noma Security）。何が通ったか、何を照合するか、対策を整理。"
key_figures:
  - value: "10.0"
    unit: "CVSS"
    label: "深刻度（CVE-2026-59726）。影響は 3.16.3 未満の版で、既定の docker-compose の構成が MCP Bridge を認証の無いまま公開した"
    tone: "alert"
  - value: "233"
    unit: "個"
    label: "認証の無い MCP Bridge から呼べた高権限のツール（シェルの実行・DB の操作・エージェントの管理・記憶の保存）"
  - value: "24"
    unit: "時間以内"
    label: "2026-06-30 の責任開示から、完全な修正のマージとセキュリティ勧告の発行まで"
glossary:
  - term: "MCP Bridge"
    desc: "Ruflo で、すべてのツールの呼び出しが通る一つの経路。Express.js のサーバーで、HTTP の `POST /mcp` などでツールの呼び出しを受け付ける。"
  - term: "学習ストア（AgentDB の pattern store）"
    desc: "エージェントが学んだパターンを保存し、のちの応答に使う記憶。ここに入ったパターンは、ソフトウェアを更新しても残る。"
  - term: "swarm"
    desc: "複数の AI エージェントをまとめて起動し、協調して動かす単位。Ruflo は Codex や Claude Code 向けにこれをホストする。"
insight:
  slug: "patch-does-not-clean-memory"
  label: "修正で戻らない記憶"
  quote: "ツールの呼び出しと記憶への書き込みを、届いたことではなく、そのたびの認可で照合しなければ、入口を塞いだ後も、通った書き込みは記憶に残り、のちの応答を動かし続ける。"
industries: ["ai", "developers"]
controls:
  - slug: "verify-entry"
    item: "ツール呼び出しは、無認証のまま実行せず、呼び出しごとに認可を確認する"
  - slug: "limit-and-revoke"
    item: "シェル実行・鍵・DB への権限を単一のブリッジに束ねず、行動ごとに分けて渡す"
  - slug: "check-origin"
    item: "エージェントの記憶に書き込むパターンは、来歴を確認したものだけにする"
attack_method: "privilege-abuse"
takeaway: "認証の無い要求が、シェルの実行や記憶の書き込みを含む高権限のツールに届くと、研究者が報告した。ツールの呼び出しと記憶への書き込みのたびに、誰に許された操作かを照合する。"
self_check: "AI エージェントの基盤で、ツールの呼び出しのたびに、呼び出した主体がその操作を許されているかを照合しているか。"
countries: ["global"]
---

## 1. 要点

Noma Security（Noma Labs）の報告によれば、AI エージェントの swarm をホストする Ruflo（旧 Claude Flow）の既定の構成では、MCP Bridge がすべてのネットワークに向けて公開され、届いたツールの呼び出しを、認証もトークンもヘッダの検査も無いまま実行に渡していた。呼べるツールには、シェルの実行、DB の操作、エージェントの起動、記憶への保存が含まれる。メンテナは開示から 24 時間以内に修正と勧告を出したが、その勧告は、学習ストアに入った汚染は、修正した版で再デプロイしても取り消されないとしている。実環境での悪用の有無は、公表の時点で確定していない。<strong>ツールの呼び出しと記憶への書き込みを、届いたことではなく、そのたびの認可で照合しなければ、入口を塞いだ後も、通った書き込みは記憶に残り、のちの応答を動かし続ける。</strong>

## 2. 通った操作

- **通った操作**: ネットワークから届いた、認証の無い `tools/call` の要求が、シェルを実行する `terminal_execute` を含む高権限のツールの実行として通った（Noma Security）。autopilot の流れには危険な操作のブロックリストがあるが、`/mcp` の入口はこれを通らない、とされる。
- **受け付けた側に届くもの**: 一般に、エージェントの基盤は、モデルの提供元の鍵と計算資源、会話のデータ、エージェントの記憶を一か所に持つ。Noma の報告では、コンテナの中でのシェル、環境変数として渡された各提供元の鍵、被害者の鍵と計算資源で起動する攻撃者の swarm、内部の認証の無い DB にある会話のデータに届きうる。さらに、学習ストアに汚染したパターンを入れ、のちの AI の応答を攻撃者の指示へ誘導できるとし、Noma はこれをこの事案の核とした。
- **公表されていないこと**: 実環境で悪用されたか、どれだけの被害があったか。公表の時点で確定していない。

## 3. 実行前の照合

経路を問わず区別できる条件は、ツールを実行する前と、記憶に書き込む前に、その要求を出した主体が、いまその操作を許されているかを、要求が届いたこととは別に照合することである。

- **誰が承認を出すか**: エージェントの基盤の運用者。どの主体に、どのツール（シェルの実行・鍵・DB・記憶への保存）を許すかは、ネットワークで届くかどうかではなく、運用者が決めた記録で決まる。
- **どこで照合するか**: MCP Bridge がツールの呼び出しを実行に渡す直前と、学習ストアにパターンを書き込む直前。照合できない呼び出しは実行せず、許された主体の記録に結び付かないパターンは記憶に入れない。
- **何が残るか**: どの主体が、どの認可で、どのツールを呼び、どのパターンを、誰の書き込みとして記憶に入れたかの記録。コンテナの中だけに置かない（Noma によれば、コンテナには再起動をまたぐバックドアを書き込まれうる）。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝ツールの実行と記憶への書き込みの前に、要求を出した主体がその操作を許されているかを照合し、記録に残すこと。検知＝研究者が脆弱性を見つけて報告すること。日付は、報告・修正・公表の日で、悪用された日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>ツールの実行と記憶への書き込みの前に、要求を出した主体の認可を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>認証の無い要求で、高権限のツールと<br>記憶への書き込みに届くと示された</span></div>
<div class="rx-zone det"><b>検知 · 研究者が見つけた</b>Noma Labs が報告し、メンテナが 24 時間以内に修正した</div>
<div class="rx-g g1"><div class="t">06-30</div><b>Noma Labs がメンテナへ報告</b></div>
<div class="rx-g g2"><div class="t">数時間内</div><b>最初の修正</b></div>
<div class="rx-g g3"><div class="t">24 時間以内</div><b>完全な修正と勧告</b></div>
<div class="rx-g g4"><div class="t">07-28〜29</div><b>一般公表と報道</b></div>
</div>
</figure>

責任開示と、24 時間以内の修正と勧告は働いた。修正は、露出していた入口を塞ぐ。効かなかったのは、その手前で、ツールの呼び出しと記憶への書き込みのたびに、要求を出した主体の認可を照合する層である。[LiteLLM の権限昇格](https://lemma.frame00.com/ja/critical/briefs/066-litellm-ai-gateway-privilege-escalation/)（前の層を通ったことが認可を兼ねた）、[Kestra の認証フィルタの迂回](https://lemma.frame00.com/ja/critical/briefs/088-kestra-auth-filter-bypass-rce/)、[ServiceNow の無認証 API](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/)、[Amazon Q の MCP の自動実行](https://lemma.frame00.com/ja/critical/briefs/095-amazon-q-mcp-auto-execution/)（エージェントがツールの呼び出しをそのまま実行した）、[ShadowMQ の pickle/ZMQ](https://lemma.frame00.com/ja/critical/briefs/073-shadowmq-pickle-zmq-pattern/)（実行時に持ち込まれたものが残った）と同じ形で、届いた要求が、その時点での認可の照合に結び付いていない。

## 4. Lemma でできること

**Lemma は、03 の照合を、MCP Bridge がツールの呼び出しを実行に渡す直前と、学習ストアに書き込む直前に組み込む。** 脆弱性や不審な要求を見つけるのではなく、要求を出した主体がその操作を許されているかを、届いたこととは別に、実行の前に照合する。

### 注意したい業界・業務

- **業界 · AI**: AI エージェントの swarm をホストし、モデルの提供元の鍵・計算資源・会話のデータ・エージェントの記憶を一か所で扱う組織。ツールの呼び出しが一つの経路に集まる。
- **業界 · 開発者・エージェント運用**: Ruflo のような OSS のオーケストレーション基盤を、Codex や Claude Code 向けに自分でホストしている開発・運用のチーム。既定の構成のまま動かすと、入口がネットワークに開きうる。

### いまの対策と Lemma の違い

今回の入口は 1 列目の、認証の無い要求による高権限のツールの実行で、2 列目はその経路での記憶への書き込みである。3 列目は、修正の前にすでに学習ストアに入ったパターンが、のちの応答を動かすことである。

| 対策 | 認証の無い要求による、高権限のツールの実行 | 記憶（学習ストア）への書き込み | 修正の前に記憶に入ったパターンによる、のちの応答 |
| --- | --- | --- | --- |
| autopilot の流れの危険な操作のブロックリスト（修正の前） | 効かない | 効かない | 関係しない |
| 修正を含む版（3.16.3 以降）への更新 | 一部 | 一部 | 効かない |
| 露出したポートの閉鎖と、提供元の鍵の入れ替え（推奨） | 一部 | 一部 | 効かない |
| 学習ストアの注入されたエントリの監査（事後・推奨） | 関係しない | 効かない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 | 効かない |

ブロックリストは autopilot の流れにあり、`/mcp` の入口はこれを通らなかった（Noma Security）。修正を含む版は、既定でループバックに待ち受け、トークンの無い公開を拒み、Bearer の認証を求めて、報告された入口を塞ぐが、メンテナの勧告のとおり、すでに入った汚染は取り消さない。ポートの閉鎖と鍵の入れ替えは、外からの経路と盗まれた鍵の使い道を断つが、記憶に残ったものには届かない。監査は、注入されたエントリを後から見つけて外すが、書き込みそのものは止めない。Lemma は、ツールの実行を、要求を出した主体が運用者の記録で許されているかに照合するので、認証の無い要求による実行は、実行の前に止まる。記憶への書き込みも、許された主体の記録に結び付かないものは入れないが、許された主体が書き込んだパターンの中身の善悪は、照合の対象ではない。

注：Lemma の照合が働くのは、MCP Bridge の実行と学習ストアへの書き込みの直前に照合を組み込み、誰にどのツールを許すかの記録が、要求する側が指定できる値とは別に管理されている場合に限る。許された主体の鍵や端末が奪われた場合や、コンテナの中でコードが動き照合を通らない経路ができた場合は、通りうる。Lemma は、すでに記憶に入ったパターンを消すことも、露出した鍵を入れ替えることもしない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI エージェントの基盤を自分でホストしている組織で確認する 3 項目

- Ruflo（旧 Claude Flow）を 3.16.3 以降に更新し、MCP Bridge をループバックだけで待ち受ける設定にしているか。
- エージェントの基盤に渡しているモデルの提供元の鍵を一覧で把握し、露出の疑いがあるときに入れ替える手順があるか。
- エージェントの記憶（学習ストア）に入ったパターンを、誰がいつ書き込んだかの記録と照合できるか。

## 5. 事実と時系列

- **対象**: Ruflo（旧 Claude Flow。Codex や Claude Code 向けに AI エージェントの swarm をホストするオーケストレーション基盤、メンテナ Reuven Cohen）の MCP Bridge。影響は 3.16.3 未満の版。
- **報告者**: Noma Security（Noma Labs）。コードネーム RufRoot、CVE-2026-59726、CVSS 10.0。
- **研究者の報告（露出）**: 既定の docker-compose が、ポート 3001 を `0.0.0.0` に結び付け、MCP Bridge（Express.js のサーバー）をすべてのネットワークに公開した。`POST /mcp` と `POST /mcp/:group` が、233 のツールを、認証・トークン・ヘッダの検査の無いまま露出した。autopilot の流れの危険な操作のブロックリストは、`/mcp` の入口では働かない。
- **研究者の報告（届く範囲）**: コンテナの中でのシェル、環境変数として渡された各提供元の鍵、被害者の鍵で起動する攻撃者の swarm、内部の認証の無い DB の会話のデータ、再起動をまたぐコンテナへの書き込み。
- **研究者の報告（記憶の汚染）**: 学習ストア（AgentDB の pattern store）に汚染したパターンを入れ、のちの応答を攻撃者の指示へ誘導できる。汚染は修正の後も学習ストアに残りうる。
- **悪用の有無**: 実環境での悪用の有無と被害の規模は、公表の時点で確定していない。

### 時系列

- **2026-06-30**: Noma Labs がメンテナへ責任開示。
- **2026-06-30**: 開示から数時間内に、メンテナが修正を公開。24 時間以内に完全な修正がマージされ、セキュリティ勧告が発行された。
- **2026-07-28〜29**: 一般公表と各メディアの報道（Noma Security の研究の公開は 07-29）。CVE-2026-59726（CVSS 10.0）として整理された。

> 本 Brief の事実は、発見者（Noma Security / Noma Labs）の一次の公表と、セキュリティメディアの報道に拠る。CVE の番号・CVSS・影響する版・ツールの数（233）は一次の公表に拠る。実環境での悪用の有無と被害の規模は、公表の時点で確定していない。本 Brief は、特定の運用者に落ち度を割り当てるものではなく、再現の手順を載せない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **メンテナ（修正）**: MCP Bridge を既定でループバックに結び付け、認証のトークンを設定しないまま公開しようとすると起動しない（fail-closed）ようにした。Bearer の認証、`terminal_execute` の既定のオフ、DB の起動時の認証、読み取り専用のコンテナなどを入れた。
- **メンテナ（運用者への勧告）**: 露出したインスタンスの運用者に、ポートの即時の閉鎖、すべての提供元の鍵の入れ替え、学習ストア（AgentDB の pattern store）の注入されたエントリの監査を勧告した。修正した版での再デプロイだけでは汚染は取り消されない、と明記している。

## 6. Sources

- Noma Security（Noma Labs）, “RufRoot: The MCP Bridge Vulnerability That Turns Agents Into Rogue Admins (CVE-2026-59726)”（2026-07-29、一次）— <https://noma.security/blog/rufroot-the-mcp-bridge-vulnerability-that-turns-agents-into-rogue-admins-cve-2026-59726/>
- The Hacker News, “Ruflo MCP Flaw Lets Unauthenticated Attackers Run Commands and Poison AI Memory”（2026-07）— <https://thehackernews.com/2026/07/ruflo-mcp-flaw-lets-unauthenticated.html>
- Dark Reading, “Patch-Resistant RufRoot Flaw Enables Malicious AI Agent Swarms”（2026-07）— <https://www.darkreading.com/cyber-risk/patch-resistant-rufroot-flaw-malicious-ai-agent-swarms>
- SecurityWeek, “Critical Ruflo Flaw Lets Attackers Spawn Rogue AI Swarms”（2026-07）— <https://www.securityweek.com/critical-ruflo-flaw-lets-attackers-spawn-rogue-ai-swarms/>
- NVD, “CVE-2026-59726”（2026-07）— <https://nvd.nist.gov/vuln/detail/CVE-2026-59726>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
