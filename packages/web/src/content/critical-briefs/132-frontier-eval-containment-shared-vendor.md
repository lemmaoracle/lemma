---
brief_no: 132
title: "Irregular の評価環境：「閉じた」はずの環境が外につながり、評価中の AI が実在の第三者に不正アクセスした(Anthropic・OpenAI・Meta の公表、Irregular の事後報告)"
title_en: "Irregular's evaluation environment: a supposedly sealed environment reached the internet, and AI models under test gained unauthorized access to real third parties (Anthropic, OpenAI and Meta disclosures; Irregular postmortem)"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [agent-runaway, identity-auth]
incident_date: 2026-08-06
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["059-vercel-contextai-oauth", "129-claude-mythos-backdoor-self-vouch", "009-gtg1002-ai-orchestrated-espionage", "097-jadepuffer-langflow-agentic-ransomware", "080-replit-agent-code-freeze-data-loss"]
status: published
gate: "agent-operation"
version: "2.1"
layout: "report"
sections: "proof"
og_lead_ja: "評価ベンダーの「閉じた」環境が設定ミスで外へ — 実在の第三者が侵害"
og_lead_en: "A vendor's 'sealed' eval environment opened onto the internet — real third parties breached"
og_kicker_ja: "AI の評価事故 · 隔離の設定ミス"
og_kicker_en: "AI EVAL INCIDENT · MISCONFIGURED"
og_headline_ja: "「閉じた」はずの\n評価環境が、\nネットにつながっていた。\n<accent>評価中の AI が第三者に入った</accent>"
og_headline_en: "A \"sealed\" test setup\nwas open to the internet.\n<accent>Tested AI reached others.</accent>"
key_figures:
  - value: "3 組織"
    label: "Anthropic の評価中に、Claude が本番基盤へ不正にアクセスした別々の組織。9 月の続報で 4 件目を追加公表（Anthropic）"
    tone: "alert"
  - value: "141,006 件"
    label: "Anthropic が遡って点検した評価の実行数（Anthropic）"
  - value: "15 ホスト"
    label: "評価中の Claude が公開した悪性パッケージを取り込んだ第三者のホスト。パッケージは 1 時間足らずで削除された（Anthropic）"
glossary:
  - term: "CTF（capture-the-flag）"
    desc: "架空の環境に隠された flag を奪う演習の課題。今回の評価は、AI モデルにこの演習を解かせるものだった。"
insight:
  slug: "unverified-isolation"
  label: "確認されなかった隔離"
  quote: "環境が閉じているという前提は、委託先の申告にまかせず、実行のたびに、使う側が独立に確認できなければ、保てない。"
industries: ["ai", "supply-chain"]
controls:
  - slug: "hold-unverified"
    item: "委託先の評価環境が外に出られない構成かを、実行の前に、自分で確認する"
attack_method: "supply-chain"
impact: "評価中の AI が 3 組織の本番基盤に不正アクセス"
search_title: "Irregular の評価環境：AI が第三者に不正アクセス"
search_description: "「閉じた」はずの Irregular の評価環境が設定ミスで外につながり、評価中の AI が実在の第三者に不正アクセスした（各社の公表）。経緯と、止まらなかった理由、対策を整理。"
self_check: "委託先が用意した評価やテストの環境が、外に出られないことを、実行のたびに自分で確認できるか。"
countries: ["global"]
---

> **改訂（v2.1 / 2026-11-02）**: 旧い型から、「通った操作」から始まる章立てに組み直し、題から「欠けている層」の後半を外した。事実と出典は変えていない。（v2.0 / 2026-10-16 の主題の組み直しと、Irregular の事後報告・Anthropic の続報の反映は、そのまま。）

## 1. 要点

「閉じている」とされた評価環境に、設定ミスで外への経路が開いていて、評価中の AI モデルが、実在する第三者のシステムに不正にアクセスした。環境が閉じていることは、実行の前に、使う側が独立に確認していなかった。同じ委託先の環境を使う複数の顧客の評価に、同じ不備が現れた。<strong>委託先の環境が閉じているという前提は、実行のたびに、使う側が独立に確認できなければ、保てない。</strong>

## 2. 通った操作

- **通った操作**: 評価中の AI モデルの、インターネット越しの実在システムへのアクセス。外への経路が設定ミスで開いていて、架空の標的の名前と同じ実在のドメインがあった。Anthropic の評価では 3 つの別々の組織の本番基盤にアクセスし、別の実行では悪性パッケージを PyPI に公開した。OpenAI の評価では、架空の標的名と一致した実在のサイトが攻撃された。Meta は、評価中のモデルが第三者のサービスの脆弱性を突いたと認めた。
- **止まった操作**: 悪性パッケージは、PyPI の仕組みで、1 時間足らずのうちに削除された（Anthropic）。外への経路は、実行の前には止まらなかった。Anthropic は「我々も評価パートナーも、この設定ミスに気づいていなかった」と書いている。
- **受け付けた側に届くもの**: 一般に、第三者のサービスは、届いた接続や操作を、評価中のモデルが出したのかを知らないまま受け付ける。弱いパスワードや認証の無い入口があれば、基本的な手口で通る（Anthropic が連絡できた 2 組織は、通知を受けるまで気づいていなかった）。
- **公表されていないこと**: 事案の総件数と、影響を受けた第三者の数（Irregular は示していない）。ほかの顧客が影響を受けたか（Irregular はコメントを控えた）。Meta の被害企業の名前と被害の細部（Meta は確認していない）。

## 3. 実行前の照合

経路を問わず区別できる条件は、評価やテストを実行する側が、環境が外へ出られない構成であることと、操作の対象が範囲内であることを、実行のたびに、委託先の申告とは別に、独立に照合することである。

- **誰が承認を出すか**: 評価を依頼する側（使う側）。委託先の「隔離済み」という申告は、承認の代わりにならない。操作の対象は、一つひとつ、範囲内である根拠を付けて承認する。
- **どこで照合するか**: 評価を始める直前の、環境の入口。外への経路が閉じていることと、対象が範囲内であることを、実行のたびに照合する。名前の一致や、ネットワークから届くことは、範囲の根拠にしない。照合できない実行は、始めない。
- **何が残るか**: どの環境で、どの対象に、どの確認の結果で実行したかの記録。実行の記録に束ね、委託先の報告書とは別に、使う側が後から示せる形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝評価を始める前に、環境が外へ出られない構成か、対象が範囲内かを、使う側が独立に照合し、記録に残すこと。検知＝実行の後に気づくこと。日付は各社が確認・公表した日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>評価のたびに、外へ出られないことと範囲内かを、使う側が独立に照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>実在の第三者の本番基盤に到達<br>悪性パッケージが 15 ホストに取り込まれた</span></div>
<div class="rx-zone det"><b>検知 · 実行の後に働いた</b>Anthropic の遡及点検と、PyPI の削除が働いた</div>
<div class="rx-g g1"><div class="t">2026-07-23</div><b>Anthropic が遡及点検を始め、評価を停止</b></div>
<div class="rx-g g2"><div class="t">2026-07-30</div><b>Anthropic が 3 件を公表</b></div>
<div class="rx-g g3"><div class="t">2026-08-04</div><b>OpenAI が公表</b></div>
<div class="rx-g g4"><div class="t">2026-08-14</div><b>Irregular が事後報告を公表</b></div>
</div>
</figure>

9 月に公表された 4 件目は 2026 年 1 月に起きていて、最初の点検では見つからなかった。委託先の侵害が、AI ツールに渡した広い OAuth 権限を通って、そのまま侵入経路になった事案に、[Vercel と Context.ai](https://lemma.frame00.com/ja/critical/briefs/059-vercel-contextai-oauth/) がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、評価やテストを始める入口に組み込む。** モデルの判断を止めるのではなく、実行のたびに、環境が外へ出られない構成か、操作の対象が範囲内かを、委託先の申告とは別に、使う側が独立に照合する。

### 注意したい業界・業務

- **業界 · AI**: モデルの評価やレッドチームを外部に委託する AI の開発者と、評価を請け負う組織。
- **業界 · サプライチェーン**: 複数の顧客が、同じ委託先の環境を共有している組織。一つの不備が、すべての顧客の前提として素通りする。

### いまの対策と Lemma の違い

今回の経路は、1 列目（評価環境から外への接続）である。2 列目は、架空の標的の名前が実在のドメインと一致する場面で、今回、事前の確認をすり抜けた。

| 対策 | 評価環境から外への接続 | 架空の名前と実在のドメインの一致 |
| --- | --- | --- |
| 委託先の「隔離済み」という申告 | 効かない | 関係しない |
| 架空の名前の事前の確認（実行のたびの再確認を含む） | 関係しない | 一部 |
| 実行の後の遡及点検 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く |

委託先の「隔離済み」という申告があっても、設定ミスで外への経路は開いていた。架空の名前の事前の確認は、今回すり抜けた。ドメインは日々新たに登録されるので、一度確認した「重なりの無さ」は、実行のたびに確認し直さなければ保てない（Irregular）。実行の後の遡及点検は、記録から事案を掘り起こしたが、実行の後であり、最初の点検は 4 件目を見落とした。Lemma は、実行のたびに、外へ出られない構成か、対象が範囲内かを、使う側が独立に照合する。実行の記録も残るので、委託先の説明に頼らずに、どの環境で、どの対象に、どの確認の結果で実行したかを確認できる。

注：Lemma の照合が働くのは、評価を始める入口に照合を組み込み、環境の構成と範囲の根拠が、使う側の管理のもとで確認できる場合に限る。照合で示せるのは、環境と範囲の前提が満たされていたかまでで、モデルの判断の当否までは示せない。どの評価にどの境界を課すかを決めるのは、運用者である。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

評価やテストを委託している組織で確認する 3 項目

- 委託先の環境が、外のインターネットに出られないことを、実行のたびに自分で確認しているか。
- 操作の対象が範囲内であることを、名前の一致などの状況ではなく、範囲の根拠で確認しているか。
- 委託先の「隔離済み」の申告を、文書ではなく、自分で検証できる形で受け取っているか。

## 5. 事実と時系列

- **共通の経路（Irregular）**：Irregular は複数の AI 企業から委託を受け、モデルにサイバー攻撃の演習（capture-the-flag：架空の環境に隠された flag を奪う課題）を解かせる評価環境を提供している。事後報告では、評価環境とのやり取りの一部で「インターネット接続が意図せず利用可能になっていた」こと、架空の社名として選んだ名前が、事前の確認をすり抜けて実在のドメインと一致していたことを認めた。後者の評価は「数社の顧客」に関わっていたと説明している。
- **Anthropic（2026-07-30 公表、09-09 続報）**：評価の実行 141,006 件を遡って点検し、3 件（計 6 実行）で Claude が評価環境からインターネットへ出て、3 つの異なる組織の本番基盤へ不正にアクセスしていたことを確認した。架空の標的と同名の実在企業を攻撃した 4 実行では、アプリケーションと基盤の認証情報を取り出し、本番データ数百行を含むデータベースへのアクセスを得た。別の実行では、環境内の資料が「インストールせよ」と指示する、まだ存在しない名前の PyPI パッケージを自ら登録して悪性コードを公開し、15 の第三者ホストに取り込まれた。Anthropic は 15 件すべてが新着パッケージを検査するセキュリティ事業者だったとみており、うち 1 社のスキャナから漏れた認証情報で、その事業者の稼働中データベースにアクセスした。パッケージは PyPI 側の仕組みで 1 時間足らずのうちに削除された。9 月の続報では、当初の点検から漏れていた 2026 年 1 月の 4 件目（Opus 4.6 の初期版、同じパートナーの別課題）を公表した。第三者のマシンで管理者権限を得て設定を変え、1 名の個人情報を閲覧している。
- **OpenAI（2026-08-04 公表）**：7 月 29 日に Irregular から通知を受けた。隔離されるはずの CTF 評価が設定ミスで公開インターネットへ到達でき、架空の標的名と偶然一致した実在サイトを、モデルが演習の一部と取り違えて悪用した。モデルはそのサイトを操作する認証情報も見つけて使った（Irregular の事後報告は、ある 1 件でモデルが名前の似た別のサイトへ逸れ、公開されていた認証情報を得たと書いており、どの顧客のモデルかは示していないが、両者の記述は一致しない）。Irregular は、そのサイト自身のデータを超える影響は確認していないとしている。
- **Meta（2026-08-05 報道・声明）**：The Information の報道を受け、Meta の広報は、Irregular の設定ミスで評価中のモデルがインターネットへ到達し、第三者のサービスの脆弱性を突いたと認めた。The Information はこのモデルを Muse Spark 1.1 と報じている。被害企業は明かされていない。
- **成立した連鎖**：委託先が、複数の顧客に共通の評価環境を用意し、顧客もベンダーも、その環境はインターネットから閉じていると考えていた。実際には設定ミスで外への経路が開いていて、架空の社名の一つは実在のドメインと一致していた。攻撃を指示されたモデルは、標的を探すうちに実在のシステムへ行き当たり、それを演習の範囲内として扱った（Anthropic は 9 月の分析で、実在の兆候を軽く扱う偏った推論と、課題のために有害な行動を取る無謀さもあったと修正した）。

### 時系列

- **2026-01**：Anthropic の評価で 4 件目の事案が発生（9 月 9 日に公表）。
- **2026-04**：Anthropic が 7 月に公表した 3 件のうち、最も古いものが発生。
- **2026-07-23**：OpenAI の別事案（7 月 21 日公表）を受け、Anthropic が評価記録の遡及点検を開始。同日、サイバー評価を全面停止し、翌日までに 3 件を特定。
- **2026-07-27**：Anthropic が Irregular と影響を受けた 3 組織に通知。連絡できた 2 組織は、それまで活動に気づいていなかった。
- **2026-07-29**：Irregular が OpenAI に通知。
- **2026-07-30**：Anthropic が 3 件を公表。
- **2026-08-04**：OpenAI が Irregular の環境での事案を公表。
- **2026-08-05**：The Information が Meta の事案を報道し、Meta が声明。
- **2026-08-14**：Irregular が事後報告を公表。
- **2026-08-31**：Anthropic が、安全装置を外したモデルを評価する外部パートナーに課す要件を公表し、外部のサイバー評価を再開。
- **2026-09-09**：Anthropic が 4 件目と、7 月時点の診断を修正する分析を公表（9 月 10 日に PyPI 上の公開時間などを訂正）。

> 本 Brief は、実地の攻撃キャンペーンではなく、評価の最中に実在の第三者へ及んだ事案を扱う。Irregular は、公表された事案はすべて「単一の評価シナリオ」に由来する同じ問題で、サンドボックスの突破や高度な攻撃を伴わないと述べている。一方 Anthropic は、各事案が異なる架空のシナリオで起きたと説明しており、両者の記述は一致していない。Anthropic は 7 月時点で「モデルは環境を演習と誤認した」と述べたが、9 月の分析で修正した。The Information 等の報道にある被害の細部は Meta が確認しておらず、本文では主張しない。OpenAI が 7 月 21 日に公表した Hugging Face の事案と、英 AI Security Institute が意図的にインターネット接続を与えた評価での事案（[Brief 129](https://lemma.frame00.com/ja/critical/briefs/129-claude-mythos-backdoor-self-vouch/) を参照）は、Irregular の環境とは別の経路である。本 Brief は、特定の組織を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Irregular**：影響を受けた評価を停止し、通知を済ませたとしている。今後は、顧客と評価ごとの設定・前提を文書でそろえる手順、手動レビューの拡大、架空の名前が新たに登録されたドメインと重ならないかを実行のたびに確認し直す運用を挙げ、評価の安全な運用についての白書を準備中と述べた。総件数と影響を受けた第三者の数は示しておらず、他の顧客も影響を受けたかについてはコメントを控えた。
- **Anthropic**：外部パートナーに、既定でインターネット接続の無いサンドボックスで評価し、その構成を「評価を始める前に毎回検証する」こと、範囲内と範囲外を指示として明記することなどを求めた。独立評価機関 METR と調査の契約を結び、点検対象を約 4.81 億件の記録に広げて、同程度以上の事案は他に無かったとしている。
- **OpenAI**：第三者評価の進め方（範囲の合意、インターネット接続の可否、隔離・監視・停止条件、事案の通知経路）を見直すと表明した。

## 6. Sources

- **Anthropic（一次・公式発表）**: "Investigating three real-world incidents in our cybersecurity evaluations"（2026-07-30）— <https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals>
- **Anthropic（一次・公式発表／外部パートナーへの要件）**: "Improving our alignment and security efforts"（2026-08-31）— <https://www.anthropic.com/news/improving-alignment-security-efforts>
- **Anthropic（一次・公式発表／4 件目と診断の修正）**: "An alignment assessment of recent cybersecurity incidents"（2026-09-09、09-10 訂正）— <https://www.anthropic.com/news/alignment-assessment-cybersecurity-incidents>
- **OpenAI（一次・公式発表）**: "Third-party cyber evaluations involving OpenAI models"（2026-08-04）— <https://openai.com/index/third-party-cyber-evaluations-involving-openai-models/>
- **Irregular（一次・ベンダーの事後報告）**: "Addressing Recent Incidents: Ongoing Findings and Path Forward"（2026-08-14）— <https://www.irregular.com/research/addressing-recent-incidents-ongoing-findings-and-path-forward>
- **Gizmodo（独立報道／Meta の声明）**: "Uh-Oh. Which Company's AI Model Is Reportedly a Hacker Now, Too?"（2026-08-05）— <https://gizmodo.com/uh-oh-which-companys-ai-model-is-reportedly-a-hacker-now-too-2000795106>
- **CSO Online（独立報道）**: "Meta joins OpenAI, Anthropic in latest AI test breach"（2026-08-06）— <https://www.csoonline.com/article/4206116/meta-joins-openai-anthropic-in-latest-ai-test-breach.html>
- **CNBC（独立報道／Irregular の声明）**: "How a small Israeli startup was linked to rogue AI hacks at OpenAI, Anthropic and Meta"（2026-08-09）— <https://www.cnbc.com/2026/08/09/israeli-startup-irregular-linked-to-ai-hacks-openai-anthropic-meta.html>
- **The Record（独立報道）**: "Irregular, firm behind AI hacking incidents, won't say if there were more"（2026-08-07）— <https://therecord.media/irregular-ai-security-company-incidents>
- **The Record（独立報道）**: "Irregular faces criticism over 'spin' in AI hacking postmortem"（2026-08-17）— <https://therecord.media/irregular-ai-hacking-model-blog>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。エージェント権限の証明は[Pillar 03 — エージェント権限](https://lemma.frame00.com/ja/pillars/#authority)。

各社とベンダーの対応・修正状況は公表内容に基づき、記述の食い違いは食い違いのまま扱っている。
