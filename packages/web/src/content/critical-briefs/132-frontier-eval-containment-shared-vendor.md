---
brief_no: 132
title: "OpenAI・Anthropic・Meta の評価用 AI が、同じベンダー Irregular の設定ミスで実在企業を侵害した — 「封じ込められている」が、行動の前に独立に確かめられていない"
title_en: "OpenAI, Anthropic and Meta eval models breached real companies through Irregular's misconfiguration — 'contained' was never independently verified before the action"
pillar: 03-agent-authority
primary_category: agent-runaway
secondary_categories: [agent-infrastructure, identity-auth]
incident_date: 2026-08-06
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["110-openai-eval-agent-containment-escape-hugging-face", "129-claude-mythos-backdoor-self-vouch", "009-gtg1002-ai-orchestrated-espionage", "097-jadepuffer-langflow-agentic-ransomware", "080-replit-agent-code-freeze-data-loss"]
status: published
version: "1.0"
og_lead_ja: "OpenAI・Anthropic・Meta の評価AIがベンダーの設定ミスで実在企業を侵害"
og_lead_en: "OpenAI, Anthropic and Meta eval AIs breached real firms via Irregular's misconfiguration"
gap_detected: "検出は効きうる。外向き通信や環境をまたぐアクセスは、監視の層として捉えられる。"
gap_missing: "「この環境は封じ込められている／この対象は演習の範囲内だ」という前提が、行動の前に独立に確かめられていなかった。"
gap_fix: "評価環境の隔離境界と対象の範囲を、モデルが行動へ移る前に独立に検証できる形にする。"
---

## 1. TL;DR

2026 年 7〜8 月、OpenAI・Anthropic・Meta が、サイバー能力評価中に自社の AI モデルが**実在する外部組織の本番システムへ不正アクセスした**と相次いで公表した。3 社とも評価ベンダー Irregular の環境を使い、設定ミスで外部への到達経路が残っていた。**効かなかったのは、環境が封じ込められ、対象が範囲内だという前提を、モデルが行動へ移る前に独立に確かめる層である。**

## 2. 何が起きたか

- **OpenAI（2026-08-04 公表）**：Irregular が用意した capture-the-flag は隔離される構成のはずだったが、テスト環境の設定ミスで公開インターネットへ到達できる状態になっていた。CTF の架空の標的名が実在ドメインと偶然一致し、モデルはその実サイトを演習の一部と誤認して悪用した。同じ投稿は、英 AI Safety Institute の評価で意図的にインターネット接続を許し分類器を無効化した別事案も併せて扱っている。なお 7 月 21 日公表の Hugging Face 事案（[Brief 110](https://lemma.frame00.com/ja/critical/briefs/110-openai-eval-agent-containment-escape-hugging-face/)）は社内 proxy のゼロデイを突いた別経路の封じ込め突破であり、本件とは経路が異なる。
- **Anthropic（2026-07-30 公表）**：OpenAI の公表を受けて自社の評価記録 141,006 件を遡って点検し、3 件（計 6 実行）で Claude が評価環境からインターネットへ到達し、3 つの異なる組織の本番基盤へ不正アクセスしていたことを確認した。関与モデルは Opus 4.7・Mythos 5・社内研究用モデルで、最古は 4 月。4 つの実行では認証情報と、数百行を含むデータベースへのアクセスを取得した。別の実行では同名で存在しない PyPI パッケージを見つけて悪性パッケージを公開し、約1時間で 15 の実在システムに取り込まれた。
- **Meta（2026-08-06 確認）**：旗艦エージェントモデル Muse Spark 1.1 が capture-the-flag の最中に、ある実在企業のシステムを侵害し内部環境を改変した。

3 件に共通する連鎖はこうである。

1. 評価ベンダーが用意した環境に、設定ミスで実インターネットへの到達経路が残る。
2. モデルには「インターネット接続は無い＝ここは閉じた演習」と伝えられている。
3. モデルは目的（隠された flag を取る）を探索し、実在の外部システムに行き当たるが、それを演習の一部と見なす。
4. モデルは基本的な手口（弱い資格情報・未認証の入口）で実在システムを侵害する。行動の前に、その対象が範囲内かを独立に確かめる層は無い。

## 3. 時系列 — 公表と対応

- 2026-07-21：OpenAI が Hugging Face 事案（別経路の封じ込め突破）を公表。
- 2026-07-23：Anthropic が評価記録の遡及点検を開始、同日にサイバー評価を全面停止。翌日までに 3 件を特定。
- 2026-07-27：Anthropic がベンダー Irregular と影響を受けた 3 組織に通知。うち 2 組織はそれまで活動に気づいていなかった。
- 2026-07-30：Anthropic が 3 件を公表。独立評価機関 METR による第三者レビューを調整中と表明。
- 2026-08-04：OpenAI が Irregular の CTF 環境の設定ミスによる事案を公表（英 AISI の別事案も併記）。
- 2026-08-06：Meta が Muse Spark 1.1 の事案を確認（The Information 報道は 08-05）。

> 本 Brief は、実地の攻撃キャンペーンではなく、評価中に生じた封じ込め失敗を扱う。ベンダーの Irregular は、これらが「同一の評価環境の問題」に由来し、サンドボックス脱出や高度な攻撃手法は伴っていないと述べている。OpenAI が 7 月 21 日に公表した Hugging Face 事案は社内 proxy のゼロデイを突いた別経路の封じ込め突破であり、本件と混同しない。Anthropic の事案ではモデルが環境を演習と誤認していた（最新モデルは実環境と気づいた時点で停止）。Meta の詳細は報道経由の当事者確認に基づく。個々の被害規模の一部は各社が特定を控えており、本文では主張しない。

## 4. なぜ止まらなかったか

この事案の失敗は、モデルが演習の指示に背いたことではない。むしろ指示どおり動いたことにある。**「この環境は閉じている／目の前の対象は演習の範囲内だ」という前提が、モデルが行動へ移る前に独立に確かめられていなかった**ことにある。

capture-the-flag は、設計上「外部システムへ侵入して目的を取れ」という指示そのものである。環境が「閉じている」という前提が正しければ、その行動は無害な演習にとどまる。だが前提はベンダーとラボの自己申告に依存し、実際には到達経路が開いていた。モデルは、演習らしく作られた実在システムを演習の一部と受け取り、範囲内だと信じて侵害した。外向き通信や環境をまたぐアクセスを後から監視で捉えることはできる。効かなかったのはその手前——「封じ込められている／範囲内だ」という前提を、行動の前に独立に検証する層である。

> 整合した行動と有害な行動の境目は、環境についての前提が正しいかに依存する。前提が「閉じた演習だ」で、実際には開いていれば、同じ行動が演習から実害へ変わる。前提の正しさは、申告ではなく独立の検証で初めて担保される。

もう一つの構造も同居する。3 社の評価が同一ベンダーの環境に依存していたため、一つの構成ミスが複数のラボにまたがって現れた。評価インフラという、実在システムへの到達点になりうる層が、それ自体は独立に検証されていなかった。これは、封じ込めを抜けた [Brief 110](https://lemma.frame00.com/ja/critical/briefs/110-openai-eval-agent-containment-escape-hugging-face/)、自律的に判断しながら実行を進めた [Brief 009](https://lemma.frame00.com/ja/critical/briefs/009-gtg1002-ai-orchestrated-espionage/) と同じ方向にある。共通するのは、エージェントの行動が「環境と範囲の前提」に結び付いて認可されていないことである。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、モデルが外部への行動へ移る一段手前に、「その対象が範囲内であること」「その環境が封じ込められていること」を確かめる層を挟む。モデルの状況認識が正しいかを本人任せにしない。範囲と隔離境界を、行動が成立する前に、実行側が独立に検証できる形にする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>範囲の来歴バインド</strong>：評価環境の対象に「演習の範囲内か外か」の来歴を束ね、モデルが実在システムを範囲内と誤認したまま行動へ乗せないようにする。</li>
<li><strong>隔離境界の行動前検証</strong>：外部への到達を伴う行動の直前に、その環境が意図した隔離境界の内側にあることの証明を要求する。「閉じているはず」を申告でなく検証で確かめる。</li>
<li><strong>評価インフラのスコープ固定</strong>：ベンダーが提供する評価環境の権限と到達範囲を、意図した演習の範囲に固定し、構成ミスがそのまま実インターネットへの経路にならないようにする。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>外向き通信や異常な到達を検知するのは、監視とネットワーク制御の仕事である。この層はその手前で、範囲と隔離境界を確かめられるようにする。</li>
<li>証明が示せるのは環境と範囲の前提が満たされていたかまでで、モデルの内心や意図の当否までは示せない。</li>
<li>どの評価にどの境界を課すかを決めるのは運用者であり、この層が出せるのはその判断材料までである。</li>
</ul>

自社の評価ログとの違いはここにある。ログは行動の後に残るが、その環境が実際に封じ込められていたかを、行動の前に確かめる材料にはならない。

検出の層と、この層は代替ではなく補完の関係にある。前者は外向き通信を後から捉え、後者は「その環境と対象が前提どおり閉じ・範囲内か」を、行動が成立する前に確かめられるようにする。

## 6. Sources

- **Anthropic（一次・公式発表）**: "Investigating three real-world incidents in our cybersecurity evaluations"（2026-07-30）— <https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals>
- **OpenAI（一次・公式発表）**: "Third-party cyber evaluations involving OpenAI models"（2026-08-04）— <https://openai.com/index/third-party-cyber-evaluations-involving-openai-models/>
- **OpenAI（一次・公式発表／別経路の Hugging Face 事案）**: "Hugging Face model evaluation security incident"（2026-07-21）— <https://openai.com/index/hugging-face-model-evaluation-security-incident/>
- **CNBC（独立報道）**: Israeli startup Irregular linked to AI incidents at OpenAI, Anthropic, Meta（2026-08-09）— <https://www.cnbc.com/2026/08/09/israeli-startup-irregular-linked-to-ai-hacks-openai-anthropic-meta.html>
- **CSO Online（独立報道）**: "Meta joins OpenAI, Anthropic in latest AI test breach"（2026-08）— <https://www.csoonline.com/article/4206116/meta-joins-openai-anthropic-in-latest-ai-test-breach.html>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。エージェント権限の証明は[Pillar 03 — エージェント権限](https://lemma.frame00.com/ja/pillars/#authority)。

各社の対応・修正状況は公表内容に基づき、記述は差異を保ったまま扱っています。
