---
brief_no: 130
title: "Atlassian Rovo は、アップロード文書や URL パラメータの指示に従って Jira・Confluence のデータを外部へ送りうる — 指示の出所が、行動の前に確かめられていない"
title_en: "Atlassian Rovo can be tricked into sending Jira and Confluence data outward by instructions in an uploaded file or a URL parameter — the origin of the instruction is never verified before the action"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-08-05
published: 2026-08-11
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["055-echoleak-m365-copilot-instruction-provenance", "059-vercel-contextai-oauth", "118-copilot-word-document-worm", "047-openclaw-agent-phishing", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "1.0"
og_lead_ja: "Atlassian Rovo、指示の出所を確かめず Jira/Confluence データを外部送信しうる"
og_lead_en: "Atlassian Rovo can be tricked into sending Jira/Confluence data out unverified"
gap_detected: "検出は効きうる。コンテンツ走査や送信先の監視は、悪性の指示や不審な宛先を捉える層として設計できる。"
gap_missing: "エージェントが従った指示が、認証済み利用者の意図由来か、攻撃者が仕込んだ内容由来かを、行動の前に確かめる層が無かった。"
gap_fix: "外部送信のような行動の前に、その指示の出所が利用者の意図であることを独立に検証する一段を挟む。"
analysis_lead_ja: "確かめられないのは、指示が正しく実行されたかではない。その指示が、利用者の意図から来たのか、攻撃者の仕込みから来たのか、である。"
analysis_lead_en: "The question isn't whether the instruction was executed correctly. It's whether it came from the user's intent, or from attacker-planted content."
---

## 1. TL;DR

Atlassian の AI アシスタント Rovo は、2 系統の手口で、Jira チケット・Confluence ページなど社内データを攻撃者のサーバーへ収集・転送させられることが示された。研究者 PromptArmor は、隠した指示を含む文書をアップロードして「Jira チケットを整理して」と頼むだけで、Rovo が見つけた内容を攻撃者の URL に付けて開くことを実証した。別の研究者 Varonis は、URL パラメータで指示を Rovo Chat にあらかじめ読み込ませ、認証済み利用者の 1 クリックでその指示を利用者の権限で実行させる手口（RovoBlast）を示した。Rovo は指示どおりに動いた。**効かなかったのは、その指示が認証済み利用者の意図から来たのか、攻撃者が仕込んだ内容から来たのかを、外部送信という行動の前に確かめる層である。**

## 2. 何が起きたか

- 2 つの独立した研究チームが、Rovo を「内部データを集めて攻撃者のサーバーへ転送する」よう仕向ける経路を報告した。PromptArmor によれば、対象は「Atlassian 内でエージェントがアクセスできるあらゆるデータ——コネクタ経由でアクセスできるデータを含む」に及ぶ。
- **PromptArmor（content-borne）**：攻撃者が用意した文書に指示を隠し、利用者がそれをアップロードして「Jira チケットを整理して」と依頼する。Rovo は依頼どおり Jira と Confluence を検索し、見つけた内部データを攻撃者の URL に付加して、その URL を開く。攻撃者側のサーバーログに内容が残る。別途の承認ステップは無い。
- **この経路では、Web 検索を切っていても防げない。** PromptArmor は「組織が Rovo の Web 検索を無効化していてもこの攻撃は成功する。Web 検索の設定は、検索結果を開くためのツールまでは取り除かないからだ」としている。外部送信は、検索機能とは別の URL 取得ツールを通って出ていく。
- **Varonis（RovoBlast）**：`https://home.atlassian.com/chat?rovoChatPathway=chat&rovoChatPrompt=<prompt>` という形の URL で、`rovoChatPrompt` パラメータに攻撃者の指示をプリロードしておく。認証済み利用者がリンクをクリックすると、警告も確認ダイアログも無く指示が Rovo Chat のセッションへ流れ込み、Rovo が自律エージェント（ResearchAgent）の Web 閲覧・投稿機能を使って多段の外部送信まで進む。Varonis は Rovo が Jira・Confluence・Bitbucket に加え、Slack・Microsoft 365・Google Workspace など 50 を超えるプラットフォームへコネクタ経由で到達しうることを示している。The Hacker News の報道によれば、実証では Confluence 上の非公開 API 鍵が持ち出された。

攻撃は次の連鎖で成立している。

1. 攻撃者が、Rovo が読む場所に指示を仕込む——アップロード文書の中（PromptArmor）、または Rovo Chat をプリロードする URL パラメータの中（Varonis）。
2. 利用者が正規の操作（文書の整理依頼・リンクのクリック）を行う。
3. Rovo は、仕込まれた指示を利用者本来の意図と区別せず、利用者の権限で実行する。
4. Rovo が Jira・Confluence の内容やコネクタ経由で届くデータを集め、攻撃者が指定した宛先へ送る。承認ステップは挟まれない。

## 3. 時系列 — 公表と対応

- 2026-01：Varonis Threat Labs が RovoBlast を発見する。
- 2026-05-23：PromptArmor が content-borne 経路を Atlassian に報告する。
- 2026-05-25：Atlassian が受領を確認し、案件番号を割り当てる。
- 2026-06-04 / 2026-07-29：PromptArmor が追って照会する。
- 2026-07-08：Atlassian が Varonis 報告分（RovoBlast）をサーバー側で修正する。
- 2026-08-05：PromptArmor が content-borne 経路の詳細を公開。公開時点で「Rovo は依然として脆弱なままである」としている。
- 2026-08-08：The Hacker News が両者を報じる。同日時点で、いずれの経路にも CVE は付与されていない。

> 本 Brief は研究者による実証を扱う。**2 経路は修正状況が異なる**——RovoBlast（URL パラメータ経路）はサーバー側で修正済み、content-borne 経路は PromptArmor 公開時点で未修正である。Varonis は Bugcrowd 経由で報告し、DEF CON 34 で発表した。実証で持ち出された具体的な資格情報の内訳は Varonis の公表では特定されておらず、Confluence 上の非公開 API 鍵という記述は The Hacker News の報道による。個々の窃取規模や実地被害は、独立の一次確認が取れないため主張しない。宛先・パラメータ名など技術細目は研究者の公表に基づく。

公表後の対応と業界の動きは次のとおり。

- 一方の経路（RovoBlast）はプロダクト側の修正で塞がれた。他方（content-borne）は、修正が確認されるまで、指示を含む文書を Rovo に処理させる利用フロー自体がリスク面を残す。
- 2 経路に共通するのは、指示の出所（アップロード内容・URL パラメータ）と、利用者本来の意図とを、行動の前に区別する層が無いことである。Web 検索の無効化という既存の統制が content-borne 経路を止められなかったことは、統制の単位が「機能のオン・オフ」であって「指示の出所」ではないことを示している。

## 4. なぜ止まらなかったか

この事案の失敗は、Rovo が指示を正しく実行できなかったことではない。むしろ正しく実行したことにある。**エージェントが従った指示が、認証済み利用者の意図から来たのか、攻撃者が処理対象に仕込んだ内容から来たのかを、外部送信という行動が成立する前に区別する層が無かった**ことにある。

検出の層は設計しうる。コンテンツ走査は悪性の指示を、送信先の監視は不審な宛先を捉えうる。効かなかったのはその手前——Rovo が「これは利用者の意図だ」と扱って行動に移す、その判断の根拠である。利用者がアップロードした文書の中身も、URL パラメータの値も、利用者本来の指示と同じ重みで指示として扱われた。出所が区別されないまま、エージェントの権限がそれに乗る。

> 指示は、それが誰の意図から来たかで重みが変わる。利用者がアップロードした文書の一文と、利用者自身の依頼とを同じ指示として扱えば、攻撃者は利用者の権限をそのまま借りられる。

これは、M365 Copilot が命令の出所を検証せず社内データを送り出した [Brief 055](https://lemma.frame00.com/ja/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/)、生成された文書が次の運び手になった [Brief 118](https://lemma.frame00.com/ja/critical/briefs/118-copilot-word-document-worm/) と同じ構造を共有する。RovoBlast の URL パラメータ経路は、1 クリックで指示をプリロードする点で、deeplink を悪用した [Brief 094](https://lemma.frame00.com/ja/critical/briefs/094-cursor-duneslide-sandbox-escape/) の面も併せ持つ。共通するのは、エージェントの行動が「指示の出所」に結び付いて認可されていないことである。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、エージェントが外部送信のような行動へ移る一段手前に、指示の出所を確かめる層を挟む。指示の中身が悪性かを機械が判定するのではない。「この指示は、認証済み利用者の意図から来ているか、それとも処理対象の内容や URL パラメータから来ているか」を、行動が成立する前に、実行側が確かめられる形にする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>指示の出所の来歴バインド</strong>：エージェントが受け取る指示に、それが利用者の直接の意図か、処理対象コンテンツ・URL パラメータ由来かの来歴を束ねる。両者が同じ重みの指示として扱われない。</li>
<li><strong>外部送信の行動前認可</strong>：Jira・Confluence の内容を外部宛先へ送るような行動の直前に、その行動が利用者の意図に結び付いて認可されていることの証明を要求する。承認ステップの欠落を、証明で埋める。</li>
<li><strong>秘密情報の選択的開示</strong>：保管された API 鍵を、エージェントの応答・送信経路へ素通しさせず、必要な検証だけを提示する形にする。</li>
<li><strong>スコープの固定</strong>：エージェントが利用者の権限で動くとき、その権限を「利用者が実際に意図した行動」の範囲に固定し、仕込まれた指示がそのまま権限に乗らないようにする。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>指示が悪性かどうかを判断するのは、この結び付きを前提にしたコンテンツ走査とスキャナーである。</li>
<li>証明が示せるのは行動が利用者の意図に認可されていたかまでで、利用者の判断そのものの当否までは示せない。</li>
<li>どの行動にゲートを置くかを決めるのは運用者であり、この層が出せるのはその判断材料までである。</li>
</ul>

自社の操作ログとの違いはここにある。ログは行動の後に残るが、その行動が利用者の意図に認可されていたかを、行動の前に区別する材料にはならない。

Lemma はプロンプトインジェクションを検知する製品ではない。コンテンツ走査や送信先監視といった検出の層は、この層と代替ではなく補完の関係にある。前者は悪性の指示や不審な宛先を捉え、後者は「エージェントが従った指示の出所」を、外部送信という行動の前に確かめられるようにする。

## 6. Sources

- **PromptArmor（研究一次）**: 「Atlassian Rovo Exfiltrates Data」（2026-08-05、開示 2026-05-23）— <https://www.promptarmor.com/resources/atlassian-rovo-exfiltrates-data>
- **Varonis（研究一次）**: 「RovoBlast」— Rovo Chat の `rovoChatPrompt` パラメータによる指示プリロード（2026-01 発見、Bugcrowd 経由で報告、DEF CON 34 で発表）— <https://www.varonis.com/blog/rovoblast>
- **The Hacker News（独立報道）**: 「Atlassian Rovo Can Be Tricked Into Sending Jira and Confluence Data to Attackers」（2026-08-08）— <https://thehackernews.com/2026/08/atlassian-rovo-can-be-tricked-into.html>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。設計は[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、適用範囲は [Pillar 03 — エージェント権限](https://lemma.frame00.com/ja/pillars/#agent) · [Brief 055（命令の出所を検証せず社内データを送り出した）](https://lemma.frame00.com/ja/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/) · [Brief 118（生成された文書が次の運び手になった）](https://lemma.frame00.com/ja/critical/briefs/118-copilot-word-document-worm/)
