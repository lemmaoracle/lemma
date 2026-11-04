---
brief_no: 130
title: "Atlassian Rovo：文書やリンクに仕込んだ指示で、Jira・Confluence のデータを外へ送らせられることが示された(PromptArmor・Varonis)"
title_en: "Atlassian Rovo: Instructions planted in a file or a link could make it send Jira and Confluence data outside (PromptArmor, Varonis)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-08-05
published: 2026-08-11
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["055-echoleak-m365-copilot-instruction-provenance", "059-vercel-contextai-oauth", "118-copilot-word-document-worm", "047-openclaw-agent-phishing", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "2.1"
og_lead_ja: "Atlassian Rovo、文書やリンクに仕込んだ指示で社内データを外へ送りうる — 1 つの経路は公開時点で未修正"
og_lead_en: "Atlassian Rovo could be made to send internal data out by instructions planted in a file or link — one path unfixed at publication"
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "攻撃の実証 · AI アシスタント"
og_kicker_en: "ATTACK RESEARCH · AI ASSISTANT"
og_headline_ja: "文書に隠した一文で、\nAI が社内データを外へ。\n<accent>承認の画面は出ない</accent>"
og_headline_en: "One hidden line in a file,\nand the AI sent data out.\n<accent>No approval prompt.</accent>"
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
  quote: "AI アシスタントに読ませた文書の中の一文は、利用者の依頼と同じ重みの指示として、外への送信まで実行されうる。"
industries: ["ai"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "AI アシスタントが外へ送る前に、その指示が利用者から出たかを照合し、照合できなければ止める"
  - slug: "audit-trail"
    item: "AI アシスタントが何を、どこへ送ったかを、アシスタントとは別に残す"
takeaway: "指示が利用者の依頼から出たかを、外へ送る前に照合する手順が無かった。"
attack_method: "ai-misuse"
search_title: "Atlassian Rovo の情報流出：仕込まれた指示と対策"
search_description: "Atlassian の AI アシスタント Rovo が、文書やリンクに仕込まれた指示で、Jira・Confluence の社内データを外へ送りうることが示された（PromptArmor・Varonis）。手口、なぜ止まらないか、対策。"
self_check: "社内データに触れる AI アシスタントが外へ送信する前に、その指示が本当に利用者から出たものかを照合できるか。"
countries: ["global"]
---

> **改訂（v2.1 / 2026-11-02）**: 章立てを「通った操作」から始まる並びに組み直し、題から「欠けている層」の後半を外した。事実と出典は変えていない。v2.0（2026-10-25）の事実の取り直し（旧版の Varonis の発見時期の訂正など）は、そのまま反映している。

## 1. 要点

Atlassian の AI アシスタント Rovo は、2 つの経路で、文書やリンクに仕込まれた指示を、利用者の依頼と区別せずに、利用者の権限で実行し、社内データを攻撃者の URL へ送ることが、研究者の実証で示された。どちらの経路でも、送る前の承認の画面は出なかった。<strong>AI アシスタントに読ませた文書の中の一文は、利用者の依頼と同じ重みの指示として、外への送信まで実行されうる。</strong>

## 2. 通った操作

- **通った操作**: 利用者の権限での、外の URL を開く道具の呼び出し。文書の経路（PromptArmor）では、指示を隠した文書をアップロードして「Jira のチケットを整理して」と頼むと、Rovo が Jira と Confluence で見つけた内容を、攻撃者の URL に付けて開いた。リンクの経路（Varonis・RovoBlast）では、`rovoChatPrompt` というパラメータに攻撃者の指示を入れたリンクを、認証済みの利用者が開くと、警告も確認も、外から入れた指示だという表示も無く、指示が Rovo Chat に入った。
- **止まらなかった統制**: Web 検索の設定を切っても、検索結果を開く道具は残り、そこから外へ送られた（PromptArmor）。AI の回答に含めた画像を表示させて送る、別の経路もあるとしている。
- **受け付けた側に届くもの**: 一般に、AI アシスタントが道具を呼ぶ操作は、利用者の依頼に基づく操作として届く。その指示が、利用者の依頼から出たのか、読んだ文書の中の文から出たのかは、道具の側からは区別がつかない。
- **届く範囲**: Rovo は Jira・Confluence・Bitbucket・Slack・Google Workspace・Microsoft 365・データベースなどを読め、コネクタで 50 を超えるサービスにつながる（Varonis）。実証では、Confluence のページ、Jira のチケット、個人データを含む SharePoint の中身が持ち出された（SecurityWeek）。
- **公表されていないこと**: 実際の被害の有無、悪用されたかどうか。

## 3. 実行前の照合

経路を問わず区別できる条件は、AI アシスタントが外の URL を開く・外へ送る道具を呼ぶ側が、その操作が利用者の依頼から出たかを、実行の前に、依頼の記録と照合することである。

- **誰が承認を出すか**: 利用者本人。送り先と中身を、アシスタントが読む文書とは別の画面で見て承認する。文書・チケット・リンクの中の文は、承認に使わない。
- **どこで照合するか**: アシスタントが、外の URL を開く・外へ送る道具を呼ぶ手前。依頼の記録と合わない送信は、照合が済むまで止める。
- **何が残るか**: 何を、どこへ、どの依頼に基づいて送ったかの記録。アシスタントとは別に、後から第三者に示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝外へ送る前に、その指示が利用者の依頼から出たかを照合し、記録に残すこと。検知＝怪しい指示や送り先に気づくこと。下の日付は、研究者・報道が報告・公表した日で、実証の日とは限らない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>送る前に、その指示が利用者の依頼から出たかを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>研究者の実証で、社内データが<br>攻撃者の URL へ送られた</span></div>
<div class="rx-zone det"><b>検知 · 一部</b>機能を切る・送り先を見張る</div>
<div class="rx-g g1"><div class="t">05-23</div><b>PromptArmor が Atlassian に報告</b></div>
<div class="rx-g g2"><div class="t">05-25</div><b>Atlassian が案件番号を割り当てる</b></div>
<div class="rx-g g3"><div class="t">08-05</div><b>PromptArmor が詳細を公開</b></div>
<div class="rx-g g4"><div class="t">08-08</div><b>SecurityWeek などが報じる</b></div>
</div>
</figure>

Web 検索を切るという既存の統制は、文書の経路を止められなかった。統制の単位が「機能のオン・オフ」で、「その指示がどこから来たか」ではなかったからである。同じように、メールに仕込んだ指示で社内データが送られた事案に、[M365 Copilot の EchoLeak](https://lemma.frame00.com/ja/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/) がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、AI アシスタントが外の URL を開く・外へ送る操作の手前に組み込む。** 侵入を見つけるのではなく、その操作が利用者の依頼から出たかを、実行の前に、依頼の記録と照合する。

### 注意したい業界・業務

- **業界 · AI**: 社内のツールに AI アシスタントやエージェントを入れ、コネクタでほかのサービスにつないでいる組織。
- **業務 · 照会・参照**: AI アシスタントに社内の文書やチケットを検索・要約させる業務。つないだ範囲が、外へ出うる範囲になる。

### いまの対策と Lemma の違い

今回の経路は、1 列目（文書やリンクの指示の取り込み）から 2 列目（外の URL を開く道具での送信）へ続く連鎖である。画像の表示で送る別の経路は、列に分けていない（注）。

| 対策 | 文書・リンクの指示の取り込み | 外の URL を開く道具での送信 |
| --- | --- | --- |
| Web 検索を切る | 関係しない | 効かない |
| 文書の中の指示を見つける | 一部 | 関係しない |
| 送り先を見張る | 関係しない | 一部 |
| つなぐサービスを減らす | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効かない | 効く |

Web 検索を切っても、検索結果を開く道具は残り、そこから外へ送られた。文書の中の指示を見つける対策は、見つければ止まるが、書き方を変えた指示は残る。送り先を見張る対策は、怪しい送り先に気づけるが、送った後になる。つなぐサービスを減らす対策は、届く範囲は狭まるが、残ったデータは送られうる。Lemma は、取り込みそのものは止めず、外へ送る操作を、依頼の記録と照合する。

注：Lemma の照合が働くのは、外の URL を開く・外へ送る道具の呼び出しに照合を組み込み、利用者の依頼の記録が、アシスタントが読む文書とは別に管理されている場合に限る。画像の表示で送る経路など、道具の呼び出しを通らない経路は、別に塞ぐ必要がある。利用者が、攻撃者の URL を含む操作をそのまま承認すれば通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

社内データに触れる AI アシスタントについて、組織で確認する 3 項目

- AI アシスタントがつながるサービスのうち、使っていないものを外しているか。
- AI アシスタントが外の URL を開く・外へ送る機能を、使う範囲だけに絞っているか。
- AI アシスタントが何を、どこへ送ったかの記録を、アシスタントとは別に見られるか。

## 5. 事実と時系列

- **研究者**: PromptArmor と Varonis Threat Labs が、それぞれ別に報告した。実地の被害ではなく、研究者による実証である。
- **文書の経路（PromptArmor）**: チャットの画面は普通に見え、利用者は気づかない。攻撃者のサーバーの記録に内容が残る。指示の置き場所は、文書のほか、問い合わせのチケットや Web のデータ、つないだサービスでもよいとしている。
- **研究者が示した流れ**: 指示を、文書・チケット・リンクのパラメータに仕込む。利用者が、文書の整理を頼む・リンクを開くという、いつもの操作をする。Rovo が、仕込まれた指示を依頼と区別せずに、利用者の権限で実行する。社内データが攻撃者の URL へ送られ、チャットの画面は普通に見える。

### 時系列

- **2026-05-23**: PromptArmor が文書の経路を Atlassian に報告する。
- **2026-05-25**: Atlassian が受け取り、案件番号を割り当てる。
- **2026-06-04**: PromptArmor が問い合わせる。
- **2026-07-29**: PromptArmor が、もう一度問い合わせる。
- **2026-08-05**: PromptArmor が詳細を公開する。公開の時点で「Rovo は依然として脆弱」としている。
- **2026-08-08**: SecurityWeek などが報じる。Varonis は RovoBlast を DEF CON 34 で発表した。

> 本件の事実は、PromptArmor と Varonis の公表（一次）に拠る。持ち出されたものの例は SecurityWeek の報道に拠る。RovoBlast の修正の日付は、一次の公表では確認できていない。実地の被害は主張しない。公表されていないことは、対策が無かったことを意味しない。Atlassian が文書の経路の修正を発表すれば、この Brief を改訂する。

### 公表後の対応

- **Atlassian**: Varonis の報告（Bugcrowd 経由）を受けて、RovoBlast を公表の前に修正した（Varonis・SecurityWeek）。PromptArmor によれば、文書の経路については 2 か月以上、追っての連絡が無かった。
- **Varonis**: 組織に、Rovo がつながるサービスを絞り使わない連携を外す、法務・人事・財務などの重要な範囲を外す、使わない閲覧のエージェントや自動化を切る、記録を見て普段と違う動きに通知を出す、を勧めた。

## 6. Sources

- **PromptArmor（研究・一次）**: "Atlassian Rovo Exfiltrates Data"（2026-08-05） — <https://www.promptarmor.com/resources/atlassian-rovo-exfiltrates-data>
- **Varonis Threat Labs（研究・一次）**: "RovoBlast" — <https://www.varonis.com/blog/rovoblast>
- **SecurityWeek（報道）**: "Critical One-Click Vulnerability in Atlassian's Rovo AI Exposed Enterprise Data"（2026-08-08） — <https://www.securityweek.com/critical-one-click-vulnerability-in-atlassians-rovo-ai-exposed-enterprise-data/>
- **The Hacker News（報道）**: "Atlassian Rovo Can Be Tricked Into Sending Jira and Confluence Data to Attackers"（2026-08-08） — <https://thehackernews.com/2026/08/atlassian-rovo-can-be-tricked-into.html>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
