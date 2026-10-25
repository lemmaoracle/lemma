---
brief_no: 130
title: "Atlassian Rovo：文書やリンクに仕込んだ指示で、Jira・Confluence のデータを外へ送らせられることが示された(PromptArmor・Varonis) — 指示が利用者から出たかを、送信の前に照合する層が無い"
title_en: "Atlassian Rovo: Instructions planted in a file or a link could make it send Jira and Confluence data outside (PromptArmor, Varonis) — Nothing checks, before sending, that the instruction came from the user"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-08-05
published: 2026-08-11
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["055-echoleak-m365-copilot-instruction-provenance", "059-vercel-contextai-oauth", "118-copilot-word-document-worm", "047-openclaw-agent-phishing", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "2.0"
og_lead_ja: "Atlassian Rovo、文書やリンクに仕込んだ指示で社内データを外へ送りうる — 1 つの経路は公開時点で未修正"
og_lead_en: "Atlassian Rovo could be made to send internal data out by instructions planted in a file or link — one path unfixed at publication"
layout: "report"
og_kicker_ja: "攻撃の実証 · AI アシスタント"
og_kicker_en: "ATTACK RESEARCH · AI ASSISTANT"
og_headline_ja: "文書に隠した一文で、\nAI が社内データを外へ。\n<accent>承認の画面は出ない</accent>"
og_headline_en: "One hidden line in a file,\nand the AI sent data out.\n<accent>No approval prompt.</accent>"
summary_labels: ["何が起きたか", "なぜ見分けられないか", "欠けていた層"]
key_figures:
  - value: "1"
    unit: "クリック"
    label: "認証済みの利用者がリンクを開くだけで、攻撃者の指示が Rovo Chat に読み込まれた。警告も確認も出なかった（Varonis・修正済み）"
    tone: "alert"
  - value: "50 超"
    label: "Rovo がコネクタでつながりうるサービスの数。届く範囲が、外へ送られうる範囲になる（Varonis）"
  - value: "05-23 → 08-05"
    label: "PromptArmor が報告してから公開まで。公開の時点で、文書に隠した指示の経路は直っていないとしている"
glossary:
  - term: "Rovo"
    desc: "Atlassian の AI アシスタント。Jira や Confluence などを検索し、利用者の権限で作業する。"
  - term: "指示の仕込み（プロンプトインジェクション）"
    desc: "AI が読む文書やページの中に、利用者の依頼とは別の指示を隠しておくこと。AI はそれを依頼と区別せずに従うことがある。"
  - term: "コネクタ"
    desc: "AI アシスタントを、Slack や Microsoft 365 などほかのサービスにつなぐ仕組み。つなぐほど、AI が読めるデータが増える。"
insight:
  slug: "instruction-origin-unchecked"
  label: "出どころを問わずに従う指示"
  quote: "Rovo は指示どおりに動いた。利用者の依頼も、アップロードした文書の中の一文も、リンクに仕込まれた文も、同じ重みの指示として扱われ、利用者の権限で外へ送られた。"
industries: ["ai"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "AI アシスタントが外へ送る前に、その指示が利用者から出たかを照合し、照合できなければ止める"
  - slug: "audit-trail"
    item: "AI アシスタントが何を、どこへ送ったかを、アシスタントとは別に残す"
attack_method: "ai-misuse"
search_title: "Atlassian Rovo の情報流出：仕込まれた指示と対策"
search_description: "Atlassian の AI アシスタント Rovo が、文書やリンクに仕込まれた指示で、Jira・Confluence の社内データを外へ送りうることが示された（PromptArmor・Varonis）。手口、なぜ止まらないか、対策。"
self_check: "社内データに触れる AI アシスタントが外へ送信する前に、その指示が本当に利用者から出たものかを照合できるか。"
countries: ["global"]
---

> **改訂（v2.0 / 2026-10-25）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。研究者の一次の公表で事実を取り直した。旧版の「2026-01 に Varonis が RovoBlast を発見」は、Varonis の別の研究（Reprompt）の時期だったため削除した。「2026-07-08 に修正」は一次で確認できないため「公表の前に修正済み」とした。持ち出されたものの例は、確認できた SecurityWeek の報道に合わせた。Lemma の設計の説明は外した。

## 1. TL;DR

Atlassian の AI アシスタント Rovo は、2 つの経路で、Jira や Confluence の社内データを攻撃者のサーバーへ送らせられることが示された。PromptArmor は、指示を隠した文書をアップロードして「Jira のチケットを整理して」と頼むだけで、Rovo が見つけた内容を攻撃者の URL に付けて開くことを示した。Varonis は、リンクに仕込んだ指示を 1 クリックで Rovo Chat に読み込ませる経路（RovoBlast）を示した。

Rovo は、利用者の依頼と、文書やリンクに仕込まれた文とを区別せず、利用者の権限で実行した。どちらの経路でも、送る前の承認の画面は出なかった。Rovo の Web 検索を切っていても、文書の経路は止まらなかった。

RovoBlast は公表の前に修正されたが、文書の経路は PromptArmor の公開の時点で直っていないとされた。効かなかったのは、外へ送る前に、その指示が利用者から出たかを照合する層である。

## 2. 何が起きたか

- **研究者**: PromptArmor と Varonis Threat Labs が、それぞれ別に報告した。実地の被害ではなく、研究者による実証である。
- **文書の経路（PromptArmor）**: 攻撃者が用意した文書に指示を隠す。利用者がそれをアップロードして「Jira のチケットを整理して」と頼むと、Rovo は Jira と Confluence を検索し、見つけた内容を攻撃者の URL に付けて、URL を開く道具で開く。攻撃者のサーバーの記録に内容が残る。チャットの画面は普通に見え、利用者は気づかない。指示の置き場所は、文書のほか、問い合わせのチケットや Web のデータ、つないだサービスでもよいとしている。
- **Web 検索を切っても止まらない**: Web 検索の設定を切っても、検索結果を開く道具は残り、そこから外へ送られた。AI の回答に含めた画像を表示させて送る、別の経路もあるとしている。
- **リンクの経路（Varonis・RovoBlast）**: `rovoChatPrompt` というパラメータに攻撃者の指示を入れたリンクを作る。認証済みの利用者が開くと、警告も確認も、外から入れた指示だという表示も無く、指示が Rovo Chat に入った。
- **届く範囲**: Rovo は Jira・Confluence・Bitbucket・Slack・Google Workspace・Microsoft 365・データベースなどを読め、コネクタで 50 を超えるサービスにつながる（Varonis）。実証では、Confluence のページ、Jira のチケット、個人データを含む SharePoint の中身が持ち出された（SecurityWeek）。
- **公表されていないこと**: 実際の被害の有無、悪用されたかどうか。

研究者の実証で見ると、送信は次の連鎖で起きた。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">研究者の実証で見た、社内データが外へ出るまでの連鎖</span></div>
<p class="rx-ex-cap">止めどころは ③。外へ送る前に、その指示が利用者の依頼から出たかを照合していれば、④ の送信は起きない。</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">攻撃者</div><div class="no">1</div><b>文書やリンクに、指示を仕込む</b><p>文書・チケット・リンクのパラメータ。</p></div>
<div class="rx-step crit"><div class="who">利用者</div><div class="no">2</div><b>いつもの操作をする</b><p>文書の整理を頼む、リンクを開く。</p></div>
<div class="rx-step crit"><div class="who">Rovo</div><div class="no">3</div><b>仕込まれた指示を、依頼と区別せずに実行する</b><p>利用者の権限で、承認の画面なし。</p></div>
<div class="rx-step crit"><div class="who">Rovo</div><div class="no">4</div><b>社内データを、攻撃者の URL へ送る</b><p>チャットの画面は普通に見える。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2026-05-23**: PromptArmor が文書の経路を Atlassian に報告する。
- **2026-05-25**: Atlassian が受け取り、案件番号を割り当てる。
- **2026-06-04**: PromptArmor が問い合わせる。
- **2026-07-29**: PromptArmor が、もう一度問い合わせる。
- **2026-08-05**: PromptArmor が詳細を公開する。公開の時点で「Rovo は依然として脆弱」としている。
- **2026-08-08**: SecurityWeek などが報じる。Varonis は RovoBlast を DEF CON 34 で発表した。

> 本件の事実は、PromptArmor と Varonis の公表（一次）に拠る。持ち出されたものの例は SecurityWeek の報道に拠る。RovoBlast の修正の日付は、一次の公表では確認できていない。実地の被害は主張しない。

### 公表後の対応

- **Atlassian**: Varonis の報告（Bugcrowd 経由）を受けて、RovoBlast を公表の前に修正した（Varonis・SecurityWeek）。PromptArmor によれば、文書の経路については 2 か月以上、追っての連絡が無かった。
- **Varonis**: 組織に、Rovo がつながるサービスを絞り使わない連携を外す、法務・人事・財務などの重要な範囲を外す、使わない閲覧のエージェントや自動化を切る、記録を見て普段と違う動きに通知を出す、を勧めた。

## 4. なぜ止まらなかったか

この事案の失敗は、Rovo が指示を正しく実行できなかったことではない。**仕込まれた指示を、利用者の依頼と区別しないまま、外への送信まで実行した**ことにある。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">ここでいう証明は、AI アシスタントが外へ送る前に、その指示が利用者の依頼から出たことを照合し、記録に残すこと。検出は、怪しい指示や送り先に気づくこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 無い</b>指示が利用者から出たかを、送信の前に照合する</div>
<div class="rx-zone gapz"><b>落差</b><span>社内データが<br>外へ出る</span></div>
<div class="rx-zone det"><b>検出の層 · 一部</b>機能を切る・送り先を見張る</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>指示を仕込む</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>いつもの操作</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>区別せずに実行</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>外へ送信</b></div>
</div>
</figure>

Web 検索を切るという既存の統制は、文書の経路を止められなかった。統制の単位が「機能のオン・オフ」で、「その指示がどこから来たか」ではなかったからである。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[M365 Copilot の EchoLeak](https://lemma.frame00.com/ja/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/)（メールに仕込んだ指示で社内データが送られた）にも現れている。

## 5. 対策するには

**AI アシスタントが外へ送る前に、その指示が利用者の依頼から出たかを照合し、照合できない送信は止める。** 文書・チケット・リンクの中の文は、読む材料であって指示ではない。出どころを照合してから送れば、仕込まれた指示は通らない。検出の代わりではなく、検出の手前に置く層である。

### 注意したい業界・業務

- **業界 · AI**: 社内のツールに AI アシスタントやエージェントを入れ、コネクタでほかのサービスにつないでいる組織。
- **業務 · 照会・参照**: AI アシスタントに社内の文書やチケットを検索・要約させる業務。つないだ範囲が、外へ出うる範囲になる。

### いまの対策で防げるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| Web 検索を切る | 効かない | 検索結果を開く道具は残り、そこから外へ送られた。 |
| 文書の中の指示を見つける | 一部 | 見つければ止まるが、書き方を変えた指示は残る。 |
| 送り先を見張る | 一部 | 怪しい送り先に気づけるが、送った後になる。 |
| つなぐサービスを減らす | 一部 | 届く範囲は狭まるが、残ったデータは送られうる。 |

### 必要になるもの

1. **外へ送る前に、その指示が利用者の依頼から出たかを照合する。** 文書・チケット・リンクの中の文を、指示として扱わない。
2. **照合できない送信は止める。** 送り先と中身を利用者に見せて、承認を求める。
3. **AI アシスタントが何を、どこへ送ったかを、アシスタントとは別に残す。** あとから、どの指示で送ったかを示せるようにする。

### 点検チェックリスト

社内データに触れる AI アシスタントについて、組織で確認する 3 項目

- AI アシスタントがつながるサービスのうち、使っていないものを外しているか。
- AI アシスタントが外の URL を開く・外へ送る機能を、使う範囲だけに絞っているか。
- AI アシスタントが何を、どこへ送ったかの記録を、アシスタントとは別に見られるか。

注：機能を切ったり、つなぐサービスを減らしたりするのは、届く範囲を狭める手当てで、指示の出どころの照合の代わりにはならない。Atlassian が文書の経路の修正を発表すれば、この Brief を改訂する。

## 6. Sources

- **PromptArmor（研究・一次）**: "Atlassian Rovo Exfiltrates Data"（2026-08-05） — <https://www.promptarmor.com/resources/atlassian-rovo-exfiltrates-data>
- **Varonis Threat Labs（研究・一次）**: "RovoBlast" — <https://www.varonis.com/blog/rovoblast>
- **SecurityWeek（報道）**: "Critical One-Click Vulnerability in Atlassian's Rovo AI Exposed Enterprise Data"（2026-08-08） — <https://www.securityweek.com/critical-one-click-vulnerability-in-atlassians-rovo-ai-exposed-enterprise-data/>
- **The Hacker News（報道）**: "Atlassian Rovo Can Be Tricked Into Sending Jira and Confluence Data to Attackers"（2026-08-08） — <https://thehackernews.com/2026/08/atlassian-rovo-can-be-tricked-into.html>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
