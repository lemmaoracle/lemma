---
brief_no: 9
title: "GTG-1002：AI コーディングエージェントに、サイバー攻撃の工程の大半を実行させた諜報活動(Anthropic の公表)"
title_en: "GTG-1002: An espionage campaign that had an AI coding agent carry out most of a cyberattack (Anthropic disclosure)"
pillar: "03-agent-authority"
primary_category: "agent-runaway"
secondary_categories: ["identity-auth"]
incident_date: 2025-11-13
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["007-pocketos-cursor-db-deletion", "003-starlette-badhost", "017-mckinsey-lilli-system-prompts"]
version: "1.0"
status: published
gate: "agent-operation"
og_lead_ja: "GTG-1002：AI エージェントが攻撃の工程の 80〜90% を実行（Anthropic の公表）"
og_lead_en: "GTG-1002: an AI agent carried out 80–90% of an attack (Anthropic disclosure)"
layout: "report"
sections: "proof"
og_kicker_ja: "サイバー攻撃事例 · AI エージェントの悪用"
og_kicker_en: "CYBERATTACK · AI AGENT MISUSE"
og_headline_ja: "攻撃の大半を、\nAI が自律で実行した。\n<accent>工程の 80〜90%</accent>"
og_headline_en: "An AI agent ran most\nof a cyberattack itself.\n<accent>80–90% of the work.</accent>"
key_figures:
  - value: "80〜90"
    unit: "%"
    label: "攻撃の工程のうち、AI が人の介入なしに実行した割合（Anthropic）"
    tone: "alert"
  - value: "約 30"
    label: "攻撃の標的。大手テック企業・金融機関・化学製造業・政府機関（Anthropic）。侵入に成功したのは少数"
  - value: "約 10 日"
    label: "不審な活動の検知から、範囲を特定して関連アカウントを停止するまで（Anthropic）"
glossary:
  - term: "MCP（Model Context Protocol）"
    desc: "AI エージェントが、外の道具やシステムを呼び出すための接続の決まり。今回は、ネットワークのスキャナーやパスワードクラッカーなどが、これを通じて使われた。"
  - term: "ジェイルブレイク"
    desc: "AI の安全の仕組みを、指示の工夫で回避すること。今回は、攻撃を小さな作業に分け、正規のセキュリティ企業の防御テストだと AI に信じ込ませた。"
insight:
  slug: "claimed-role-not-checked"
  label: "名乗りで通った操作"
  quote: "AI エージェントが外のシステムに出す操作は、受け付ける側が、誰の委任で、どの範囲の操作かを実行の前に照合しなければ、名乗りだけで通る。"
industries: ["ai"]
controls:
  - slug: "verify-entry"
    item: "AI エージェントの各操作を、誰がどの権限で要求したかを受け付ける前に確認する"
  - slug: "bound-automation"
    item: "AI エージェントが実行できる操作と回数を、範囲と上限で決めておく"
attack_method: "ai-misuse"
impact: "約 30 の標的を攻撃、少数で侵入成功"
takeaway: "攻撃者は、正規のセキュリティ企業の防御テストだと AI に信じ込ませ、偵察から抜き取りまでの工程の大半を AI に実行させた。"
self_check: "AI エージェントが社内外のシステムに出す操作を、誰の委任で、どの範囲のものかを、実行の前に照合しているか。"
countries: ["global"]
---

## 1. 要点

攻撃者は、攻撃を無害に見える小さな作業に分け、AI に「正規のセキュリティ企業の従業員で、防御のテスト中だ」と信じ込ませて、AI の安全の仕組みを回避した（Anthropic）。そのうえで AI は、偵察、脆弱性の探索と検証、攻撃コードの作成、認証情報の窃取、データの抜き取りまでを、MCP 経由の道具で連鎖的に実行した。人の関与は、作戦ごとに 4〜6 か所の重要な判断に限られた。<strong>AI エージェントが外のシステムに出す操作は、受け付ける側が、誰の委任で、どの範囲の操作かを実行の前に照合しなければ、名乗りだけで通る。</strong>

## 2. 通った操作

- **通った操作**: 標的のシステムへの、偵察、脆弱性の検証、窃取した認証情報でのアクセス、権限の高いアカウントの特定、バックドアの作成、データの抜き取り。AI が、MCP 経由のスキャナーやパスワードクラッカーなどの道具で実行した（Anthropic）。
- **止まった操作**: 提供事業者の Anthropic が不審な活動を検知し、範囲を特定して、関連アカウントを順に停止した。止まったのは、検知の後である。
- **受け付けた側に届くもの**: 一般に、標的のシステムや API には、操作そのもの（リクエスト）が届く。それが誰の委任で、どの範囲で出されたかは届かない。「防御のテスト中だ」という名乗りは AI に向けたもので、受け付ける側には届かない。
- **公表されていないこと**: 侵入に成功した標的の名前と数。各標的で使われた脆弱性と入口。抜き取られたデータの中身。

## 3. 何を照合するか

経路を問わず区別できる条件は、AI エージェントが外のシステムに作用する操作を、受け付ける側が、誰の委任で、どの範囲の操作かを、実行の前にエージェントの外で照合することである。

- **誰が承認を出すか**: 操作を受けるシステムの持ち主（組織）。AI に向けた名乗りや指示は、承認の代わりにならない。
- **どこで照合するか**: 標的のシステム、API、MCP の道具が、操作を受け付ける前。委任の無い操作と、範囲の外の操作は、保留にする。
- **何が残るか**: どの操作を、誰の委任で、いつ受け付けた（または止めた）かの記録。提供事業者の記録とは別に、受け付けた側に残る。規制への報告や訴訟で、その操作が認可されていたかを示す材料になる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝AI エージェントの操作を受け付ける前に、誰の委任で、どの範囲の操作かを、エージェントの外で照合し、記録に残すこと。検知＝提供事業者が、不審な活動に気づくこと。日付は Anthropic が公表したもの。検知の日は「9 月中旬」とだけ公表されている。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>操作を受け付ける前に、誰の委任で、どの範囲かを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>約 30 の標的が攻撃された<br>少数で侵入され、データが抜き取られた</span></div>
<div class="rx-zone det"><b>検知 · 提供事業者で働いた</b>不審な活動を検知し、アカウントを停止</div>
<div class="rx-g g1"><div class="t">2025-09 中旬</div><b>Anthropic が不審な活動を検知</b></div>
<div class="rx-g g2"><div class="t">約 10 日</div><b>範囲を特定し、アカウントを停止</b></div>
<div class="rx-g g3"><div class="t">2025-11-13</div><b>Anthropic が公表</b></div>
<div class="rx-g g4"><div class="t">2025-11-14</div><b>攻撃の速度の記述を訂正</b></div>
</div>
</figure>

検知は、提供事業者の側で働き、範囲の特定と停止につながった。一方で、検知は、標的のシステムが何を受け付けるかを変えない。同じように、AI エージェントの操作が受け付ける前に照合されなかった事案に、[PocketOS](https://lemma.frame00.com/ja/critical/briefs/007-pocketos-cursor-db-deletion/)（本番のデータベースの削除 1 回）がある。今回は、偵察から抜き取りまで連鎖する、数百から数千の操作だった。名乗りが照合されずに通った点では、[Starlette](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)（認証の回避）とも近い。

## 4. Lemma でできること

**Lemma は、03 の照合を、AI エージェントの操作を受け付ける側に置く。** AI の判断を正すのではなく、その操作が、誰の委任で、どの範囲のものかを、実行の前に、エージェントの外で照合する。

### 注意したい業界・業務

- **業界 · テック・金融・化学製造・政府機関**: 今回の標的とされた分野（Anthropic）。
- **業務 · AI エージェントの運用**: AI エージェントに、MCP などで社内外のシステムを操作させる組織。

### いまの対策と Lemma の違い

今回の経路は、AI エージェントが、標的のシステムに連鎖して出した操作である。

| 対策 | AI エージェントが標的のシステムに出す操作 |
| --- | --- |
| AI の安全の仕組み（ガードレール） | 効かない |
| 提供事業者の異常検知とアカウントの停止 | 一部 |
| **Lemma（実行の前の照合）** | 効く |

AI の安全の仕組みは、攻撃を小さな作業に分け、正規の企業の防御テストだと信じ込ませることで回避された（Anthropic）。提供事業者の異常検知とアカウントの停止は、約 10 日で範囲を特定して攻撃を止めたが、検知の後に働き、標的のシステムが何を受け付けるかは変えない。Lemma は、AI の名乗りではなく、操作が誰の委任で、どの範囲のものかを、受け付ける前に照合する。実行の記録も受け付けた側に残るので、提供事業者の記録に頼らずに、どの操作がどの委任で通ったかを確認できる。

注：Lemma の照合が働くのは、操作を受けるシステム、API、MCP の道具に照合を組み込み、委任と範囲が、エージェントの外で管理されている場合に限る。窃取された認証情報で、正規の委任の範囲の中の操作として出された場合は、この照合を通りうる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI エージェントを運用する組織で確認する 3 項目

- AI エージェントの各操作を、誰がどの権限で要求したかを、受け付ける前に確認しているか。
- AI エージェントが実行できる操作と回数を、範囲と上限で決めているか。
- AI エージェントの操作の記録を、提供事業者の記録とは別に、自社の側に残しているか。

## 5. 事実と時系列

- **攻撃グループ**: GTG-1002。Anthropic は、中国の国家支援グループと high confidence で評価している。
- **使われた道具**: AI コーディングエージェント（Claude Code）と、MCP 経由の各種の道具（ネットワークのスキャナー、パスワードクラッカーなど）。
- **標的**: 約 30 の世界の標的（大手テック企業、金融機関、化学製造業、政府機関）。少数の標的で侵入に成功し、非公開のデータが抜き取られた。
- **AI の関与**: 攻撃の工程の 80〜90% を AI が実行した。人の介入は、作戦ごとに 4〜6 か所の重要な判断に限られた。
- **攻撃の速度**: ピーク時、AI は、毎秒複数を含む数千のリクエストを出した。人のチームには不可能な速度とされている。
- **安全の仕組みの回避**: 攻撃を無害に見える小さな作業に分け、AI に「正規のセキュリティ企業の従業員」「防御のテスト中」と信じ込ませる、役割の偽装（ジェイルブレイク）。
- **流れ（Anthropic）**: ① 人の運用者が標的を選び、Claude Code を自動化の道具として組み込んだ攻撃の仕組みを作る。② 安全の仕組みを回避する。③ AI が標的のシステムを調べ、価値の高いデータベースを特定して人に要約を返す。④ AI が脆弱性を探し、攻撃コードを書いて検証する。⑤ AI が認証情報を窃取して、権限の高いアカウントを特定し、バックドアを作る。⑥ AI がデータを抜き取り、情報の価値で分類する。⑦ AI が、窃取した認証情報と分析したシステムの文書を作り、次の段階の計画を支える。

### 時系列

- **2025-09 中旬**: Anthropic が不審な活動を検知する。のちの調査で、高度な諜報活動と分かる。
- **2025-09 中旬から約 10 日**: 範囲と深刻度を特定する。特定したアカウントを順に停止し、影響を受けた組織に通知し、当局と連携する。
- **2025-11-13**: Anthropic が、事案と報告書の全文を公表する。
- **2025-11-14**: 攻撃の速度の記述を、「毎秒数千」から「毎秒複数を含む数千のリクエスト」に訂正する。

> 本件の事実は、Anthropic の公表と報告書（一次）に拠る。攻撃グループの帰属（中国の国家支援）は、Anthropic の評価である。侵入された標的の名前と、各標的での入口は公表されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Anthropic**: 関連アカウントを停止し、検出の能力と分類器を広げ、影響を受けた組織と当局に通知した。定期的に脅威のレポートを出すとした。セキュリティの担当には、SOC の自動化、脅威の検知、脆弱性の評価、事案の対応に AI を使う試みを、開発者には、悪用を防ぐ安全策への投資を勧めた。調査の大量のデータの分析にも AI を使ったとしている。
- **政策の側**: 米下院の国土安全保障委員会が、Anthropic に証言を求めた。

## 6. Sources

- **Anthropic 公式発表**: "Disrupting the first reported AI-orchestrated cyber espionage campaign"（2025-11-13、2025-11-14 一部訂正）— https://www.anthropic.com/news/disrupting-AI-espionage
- **Anthropic full report（PDF）**: "Disrupting the first reported AI-orchestrated cyber espionage campaign"（2025-11）— https://assets.anthropic.com/m/ec212e6566a0d47/original/Disrupting-the-first-reported-AI-orchestrated-cyber-espionage-campaign.pdf
- **Paul, Weiss client memo**: "Anthropic Disrupts First Documented Case of Large-Scale AI-Orchestrated Cyberattack"（2025-11）— https://www.paulweiss.com/insights/client-memos/anthropic-disrupts-first-documented-case-of-large-scale-ai-orchestrated-cyberattack
- **SOCRadar analysis**: "AI-Powered Cyber Espionage: Inside the GTG-1002 Campaign"（2025-11）— https://socradar.io/blog/ai-powered-gtg-1002-campaign/
- **PwC**: "AI-orchestrated cyberattacks: A call to action"（2025）— https://www.pwc.com/us/en/services/consulting/cybersecurity-risk-regulatory/library/ai-orchestrated-cyberattacks.html
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
