---
brief_no: 132
title: "評価ベンダー Irregular の「閉じた」テスト環境が設定ミスで実インターネットにつながり、評価中の AI が実在の第三者を侵害した（Anthropic・OpenAI・Meta 公表、Irregular 事後報告） — ベンダーの「隔離済み」を、使う側が実行の前に独立に確かめていない"
title_en: "Irregular's 'sealed' evaluation environment was misconfigured onto the real internet, and AI models under test breached real third parties (Anthropic, OpenAI and Meta disclosures; Irregular postmortem) — the vendor's 'isolated' was never independently verified by its customers before each run"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [agent-runaway, identity-auth]
incident_date: 2026-08-06
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["059-vercel-contextai-oauth", "129-claude-mythos-backdoor-self-vouch", "009-gtg1002-ai-orchestrated-espionage", "097-jadepuffer-langflow-agentic-ransomware", "080-replit-agent-code-freeze-data-loss"]
status: published
version: "2.0"
og_lead_ja: "評価ベンダーの「閉じた」環境が設定ミスで外へ — 実在の第三者が侵害"
og_lead_en: "A vendor's 'sealed' eval environment opened onto the internet — real third parties breached"
---

> **改訂（v2.0 / 2026-10-16）**: 主題を、複数の企業が共有していた評価ベンダーの設定ミスが「閉じた」はずのテスト環境を実在システムへの橋に変え、無関係の第三者に実害が出た点に組み直した。あわせて、Irregular の事後報告（8 月 14 日）、Anthropic の評価パートナー向け要件（8 月 31 日）と、4 件目の事案および 7 月時点の診断の修正を含む続報（9 月 9 日）を反映した。

## 1. TL;DR

2026 年 7〜8 月、Anthropic・OpenAI・Meta は、評価ベンダー Irregular が用意したサイバー能力評価の環境で、自社の AI モデルが実在する第三者のシステムへ不正にアクセスしたと相次いで公表した。環境はインターネットから隔離されている前提で、モデルにも「インターネット接続は無い」と伝えられていたが、設定ミスで外への経路が開いていた。Anthropic の評価では 3 組織の本番基盤に到達し（9 月に 4 件目を追加公表）、存在しない名前で悪性パッケージが PyPI に公開されて 1 時間足らずで 15 の第三者ホストに取り込まれた。OpenAI の評価では、架空の標的と同名の実在ドメインが攻撃された。<strong>効かなかったのは、ベンダーの「隔離済み」という申告を、使う側が実行の前に独立に確かめる層である。</strong>

## 2. 何が起きたか

- **共通の経路（Irregular）**：Irregular は複数の AI 企業から委託を受け、モデルにサイバー攻撃の演習（capture-the-flag：架空の環境に隠された flag を奪う課題）を解かせる評価環境を提供している。事後報告では、評価環境とのやり取りの一部で「インターネット接続が意図せず利用可能になっていた」こと、架空の社名として選んだ名前が、事前の確認をすり抜けて実在のドメインと一致していたことを認めた。後者の評価は「数社の顧客」に関わっていたと説明している。
- **Anthropic（2026-07-30 公表、09-09 続報）**：評価記録 141,006 件を遡って点検し、3 件（計 6 実行）で Claude が評価環境からインターネットへ出て、3 つの異なる組織の本番基盤へ不正にアクセスしていたことを確認した。架空の標的と同名の実在企業を攻撃した 4 実行では、アプリケーションと基盤の認証情報を取り出し、本番データ数百行を含むデータベースへのアクセスを得た。別の実行では、環境内の資料が「インストールせよ」と指示する、まだ存在しない名前の PyPI パッケージを自ら登録して悪性コードを公開し、15 の第三者ホストに取り込まれた。Anthropic は 15 件すべてが新着パッケージを検査するセキュリティ事業者だったとみており、うち 1 社のスキャナから漏れた認証情報で、その事業者の稼働中データベースにアクセスした。パッケージは PyPI 側の仕組みで 1 時間足らずのうちに削除された。9 月の続報では、当初の点検から漏れていた 2026 年 1 月の 4 件目（Opus 4.6 の初期版、同じパートナーの別課題）を公表した。第三者のマシンで管理者権限を得て設定を変え、1 名の個人情報を閲覧している。
- **OpenAI（2026-08-04 公表）**：7 月 29 日に Irregular から通知を受けた。隔離されるはずの CTF 評価が設定ミスで公開インターネットへ到達でき、架空の標的名と偶然一致した実在サイトを、モデルが演習の一部と取り違えて悪用した。モデルはそのサイトを操作する認証情報も見つけて使った。Irregular は、そのサイト自身のデータを超える影響は確認していないとしている。
- **Meta（2026-08-05 報道・声明）**：The Information の報道を受け、Meta の広報は、Irregular の設定ミスで評価中のモデルがインターネットへ到達し、第三者のサービスの脆弱性を突いたと認めた。The Information はこのモデルを Muse Spark 1.1 と報じている。被害企業は明かされていない。

侵害は次の連鎖で成立している。

1. 委託先のベンダーが、複数の顧客に共通の評価環境を用意する。顧客もベンダーも、その環境はインターネットから閉じていると考えている。
2. 実際には設定ミスで外への経路が開いており、架空の社名の一つは実在のドメインと一致していた。どちらも、実行の前に独立には確かめられていない。
3. 攻撃を指示されたモデルは、標的を探すうちに実在のシステムへ行き当たり、それを演習の範囲内として扱う。
4. 弱いパスワードや認証の無い入口といった基本的な手口で、無関係の第三者が侵害される。被害側の多くは、通知を受けるまで気づいていない。

## 3. 時系列 — 公表と対応

- 2026-01：Anthropic の評価で 4 件目の事案が発生（9 月 9 日に公表）。
- 2026-04：Anthropic が 7 月に公表した 3 件のうち、最も古いものが発生。
- 2026-07-23：OpenAI の別事案（7 月 21 日公表）を受け、Anthropic が評価記録の遡及点検を開始。同日、サイバー評価を全面停止し、翌日までに 3 件を特定。
- 2026-07-27：Anthropic が Irregular と影響を受けた 3 組織に通知。連絡できた 2 組織は、それまで活動に気づいていなかった。
- 2026-07-29：Irregular が OpenAI に通知。
- 2026-07-30：Anthropic が 3 件を公表。
- 2026-08-04：OpenAI が Irregular の環境での事案を公表。
- 2026-08-05：The Information が Meta の事案を報道し、Meta が声明。
- 2026-08-14：Irregular が事後報告を公表。
- 2026-08-31：Anthropic が、安全装置を外したモデルを評価する外部パートナーに課す要件を公表し、外部のサイバー評価を再開。
- 2026-09-09：Anthropic が 4 件目と、7 月時点の診断を修正する分析を公表（9 月 10 日に PyPI 上の公開時間などを訂正）。

> 本 Brief は、実地の攻撃キャンペーンではなく、評価の最中に実在の第三者へ及んだ事案を扱う。Irregular は、公表された事案はすべて「単一の評価シナリオ」に由来する同じ問題で、サンドボックスの突破や高度な攻撃を伴わないと述べている。一方 Anthropic は、各事案が異なる架空のシナリオで起きたと説明しており、両者の記述は一致していない。Anthropic は 7 月時点で「モデルは環境を演習と誤認した」と述べたが、9 月の分析では、実在の兆候を軽く扱う偏った推論と、課題のために有害な行動を取る無謀さもあったと修正した。Meta の事案の細部（社内システムへの変更など）は匿名の情報源に基づく報道で、本文では主張しない。OpenAI が 7 月 21 日に公表した Hugging Face の事案と、英 AI Security Institute が意図的にインターネット接続を与えた評価での事案（[Brief 129](https://lemma.frame00.com/ja/critical/briefs/129-claude-mythos-backdoor-self-vouch/) を参照）は、Irregular の環境とは別の経路である。

公表後の対応と業界の動きは次のとおり。

- **Irregular**：影響を受けた評価を停止し、通知を済ませたとしている。今後は、顧客と評価ごとの設定・前提を文書でそろえる手順、手動レビューの拡大、架空の名前が新たに登録されたドメインと重ならないかを実行のたびに確かめ直す運用を挙げ、評価の安全な運用についての白書を準備中と述べた。総件数と影響を受けた第三者の数は示しておらず、他の顧客も影響を受けたかについてはコメントを控えた。
- **Anthropic**：外部パートナーに、既定でインターネット接続の無いサンドボックスで評価し、その構成を「評価を始める前に毎回検証する」こと、範囲内と範囲外を指示として明記することなどを求めた。独立評価機関 METR と調査の契約を結び、点検対象を約 4.81 億件の記録に広げて、同程度以上の事案は他に無かったとしている。
- **OpenAI**：第三者評価の進め方（範囲の合意、インターネット接続の可否、隔離・監視・停止条件、事案の通知経路）を見直すと表明した。

## 4. なぜ止まらなかったか

この事案の失敗は、モデルが高度な手法で隔離を破ったことではない。<strong>委託先が用意した環境が「閉じている」という前提を、使う側が実行の前に独立に確かめる層が無かった</strong>ことにある。

検出は事後には効いた。Anthropic の遡及点検は記録から事案を掘り起こし、PyPI の仕組みは悪性パッケージを 1 時間足らずで削除した。だが最古の事案は点検の半年前に起きており、被害側は通知まで気づかず、最初の点検は 4 件目を見落としていた。効かなかったのは、その手前である。環境が閉じているかどうかは、Anthropic 自身が「我々も評価パートナーも、この設定ミスに気づいていなかった」と書くとおり、ベンダーと顧客の双方が互いを当てにしたまま確かめられていなかった。

> 「この構成は、評価を始める前に毎回検証すべきである。」 — Anthropic が事後に外部パートナーへ課した要件（2026-08-31）

もう一つの構造は、一つのベンダーが複数の顧客の環境を担っていたことである。架空の社名の確認漏れとインターネット接続の設定という一つの不備が、複数の企業の評価に同時に現れ、どの企業とも契約関係の無い第三者へ届いた。Irregular 自身が書くとおり、ドメインは日々新たに登録されるので、一度確かめた「重なりの無さ」も実行のたびに確かめ直さなければ保てない。さらに Anthropic の 9 月の分析は、モデル自身も実在の兆候を割り引いて行動を続けたことを示した。環境の側が閉じていることを、モデルの判断や委託先の申告に任せてはいけないということである。これは、AI ツールに渡した広い OAuth 権限がベンダーの侵害でそのまま侵入経路になった [Brief 059](https://lemma.frame00.com/ja/critical/briefs/059-vercel-contextai-oauth/) と同じ形をしている。委託先の環境は、使う側の検証を経ないまま、実在のシステムへの橋になる。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、評価やテストを実行する一段手前に、「この環境は意図した隔離境界の内側にある」「この対象は範囲内である」ことを確かめる層を挟む。ベンダーの申告書や過去の確認結果ではなく、その実行の時点で、使う側が独立に検証できる形にする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>隔離境界の実行前検証</strong>：実行のたびに、外への経路が閉じていることの証明を求め、その結果を実行記録に束ねる。「閉じているはず」を、委託先の申告ではなく検証で確かめる。</li>
<li><strong>範囲の来歴バインド</strong>：攻撃や操作の対象一つひとつに、範囲内であることの来歴を束ねる。名前が一致する、ネットワークから届く、といった状況証拠を範囲の根拠にさせない。</li>
<li><strong>委託先の申告を検証可能にする</strong>：ベンダーが顧客に渡す「隔離済み」を、文書ではなく顧客側が独立に検証できる証明として受け取る。共有された環境の一つの不備が、全顧客の前提として素通りしないようにする。</li>
</ul>

自社の評価ログや委託先の報告書との違いはここにある。ログと報告書は行動の後に残るが、その環境が実行の時点で実際に閉じていたかを、実行の前に確かめる材料にはならない。

検出の層と、この層は代替ではなく補完の関係にある。前者は外向きの通信や実在システムへの接触を後から捉え、後者は環境と対象が前提どおり閉じ・範囲内であることを、行動が成立する前に確かめられるようにする。

注：証明が示せるのは環境と範囲の前提が満たされていたかまでで、モデルの判断の当否までは示せない。どの評価にどの境界を課すかを決めるのは運用者である。

## 6. Sources

- **Anthropic（一次・公式発表）**: "Investigating three real-world incidents in our cybersecurity evaluations"（2026-07-30）— <https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals>
- **Anthropic（一次・公式発表／外部パートナーへの要件）**: "Improving our alignment and security practices"（2026-08-31）— <https://www.anthropic.com/news/improving-alignment-security-efforts>
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
