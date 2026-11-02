---
brief_no: 55
title: "Microsoft 365 Copilot：メール 1 通に紛れた指示で、社内データが外へ送られうることが示された(Aim Labs)"
title_en: "Microsoft 365 Copilot: An instruction hidden in one email could make Copilot send internal data out (Aim Labs)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "data-provenance"]
incident_date: 2025-06-11
published: 2026-06-15
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["047-openclaw-agent-phishing", "024-invisible-unicode-instruction-injection", "005-noroboto-lying-fonts", "027-librechat-mcp-url-secrets"]
status: published
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "攻撃の実証 · AI アシスタント"
og_kicker_en: "ATTACK RESEARCH · AI ASSISTANT"
og_headline_ja: "メール 1 通で、\nAI が社内データを\n外へ送りえた。\n<accent>利用者の操作は不要</accent>"
og_headline_en: "One email could make\nCopilot send data out.\n<accent>Zero clicks.</accent>"
key_figures:
  - value: "9.3"
    unit: "CVSS"
    label: "CVE-2025-32711 の深刻度（Critical）。Microsoft のアドバイザリ"
    tone: "alert"
  - value: "0"
    unit: "クリック"
    label: "被害者の操作なしに成立した（ゼロクリック）。Aim Labs の実証"
  - value: "なし"
    label: "実環境で悪用された証拠。Microsoft の表明で、PoC の段階で報告・修正された"
glossary:
  - term: "XPIA 分類器"
    desc: "Cross-Prompt Injection の分類器。Copilot が取り込んだ内容の中の、注入された指示を見つけて抑える層。"
  - term: "ゼロクリック"
    desc: "被害者がリンクを押すなどの操作をしなくても、攻撃が成立すること。"
insight:
  slug: "data-as-instruction"
  label: "取り込んだデータの中の指示"
  quote: "AI が取り込んだデータの中の一文は、出どころと権限を照合しない限り、利用者の命令と同じように実行されうる。"
operations: ["data-access"]
version: "1.0"
og_lead_ja: "EchoLeak — メール 1 通に紛れた指示で、M365 Copilot が社内データを外へ送りうることが示された（Aim Labs）"
og_lead_en: "EchoLeak — an instruction hidden in one email could make M365 Copilot send internal data out (Aim Labs)"
industries: ["ai"]
controls:
  - slug: "ownership-check"
    item: "AI が従う命令が、利用者本人から来たものか確認する"
attack_method: "ai-misuse"
takeaway: "細工メール 1 通に紛れた指示で、Copilot が社内データを外へ送りうることが示された。送る前に、その指示が利用者本人の命令かを照合する。"
self_check: "AI アシスタントが社内データを読み出して外へ送る前に、その指示が利用者本人の命令から出たかを照合できるか。"
search_title: "EchoLeak（M365 Copilot）：手口と対策"
search_description: "細工メール 1 通に紛れた指示で、Microsoft 365 Copilot が社内データを外へ送りうることが示された（Aim Labs・CVE-2025-32711）。手口、なぜ止まらないか、対策。"
countries: ["global"]
---

## 1. 要点

Aim Labs は、攻撃者が送った細工メール 1 通を、Copilot が通常の要約・参照の処理で取り込むだけで、利用者の操作なしに、Copilot のアクセス範囲の社内データを外へ送らせうることを実証し、2025 年 6 月に公表した（EchoLeak）。メールに紛れた指示を、Copilot は、処理するデータと区別できなかった。Microsoft はサーバ側で修正し、実環境で悪用された証拠はないとしている。<strong>AI が取り込んだデータの中の一文は、出どころと権限を照合しない限り、利用者の命令と同じように実行されうる。</strong>

## 2. 通った操作

- **通った操作**: Copilot による社内データの読み出しと、外への送出。攻撃者のメール本文は「処理するデータ」として LLM のコンテキストに入り、その中の指示が実行の対象になった。Copilot は自身のアクセス範囲の社内データを読み出し、信頼されたドメインを経由して、攻撃者の管理下へ送った（Aim Labs の実証）。
- **止まらなかった統制**: XPIA 分類器、外部リンクの墨消し、Content-Security-Policy、Copilot の参照記法といった検知・抑止の層は、参照形式の Markdown、自動で取得される画像、Microsoft Teams のプロキシの悪用などで回避された（Aim Labs）。
- **受け付けた側に届くもの**: 一般に、AI アシスタントによるデータの読み出しと送出は、利用者の依頼に基づく操作として届く。その操作が、利用者の命令から出たのか、取り込んだメールの中の文から出たのかは、データを渡す側からは区別がつかない。
- **届く範囲**: Copilot のアクセス範囲の全体（OneDrive のファイル、SharePoint の内容、Teams のメッセージ、チャット履歴、事前に読み込まれた組織のデータ）。
- **公表されていないこと**: 実環境での悪用の有無。Microsoft は、実環境で悪用された証拠はないとしている。ゼロクリックで正規の経路を使うため、通常の利用ログでは異常として現れにくい（Aim Labs）。

## 3. 何を照合するか

経路を問わず区別できる条件は、AI アシスタントが社内データを読み出して外へ送る手前で、その操作が、利用者本人の命令から出たのか、取り込んだデータの中の文から出たのかを、内容の見た目とは別に照合することである。

- **誰が承認を出すか**: 利用者本人。データを外へ送る操作と、その根拠になった指示を、AI が読むメールや文書とは別の画面で見て承認する。取り込んだデータの中の文は、承認に使わない。
- **どこで照合するか**: AI アシスタントが社内データを読み出し、外へ送る手前。出どころと権限を照合できない指示による送出は、照合が済むまで止める。
- **何が残るか**: どのデータを、どの指示に基づき、誰の承認で、どこへ送ったかの記録。AI とは別に、後から第三者に示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝AI アシスタントが社内データを外へ送る前に、その指示の出どころと権限を照合し、記録に残すこと。検知＝分類器などで、注入された指示に気づくこと。下の日付は、報告・修正・公表の日で、実証の日とは限らない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>社内データを送る前に、その指示の出どころと権限を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>実証で、メール 1 通の指示により<br>社内データが外へ送られた</span></div>
<div class="rx-zone det"><b>検知 · 実証では回避された</b>XPIA 分類器・リンクの墨消し・CSP</div>
<div class="rx-g g1"><div class="t">2025-01</div><b>Aim Labs が MSRC に報告</b></div>
<div class="rx-g g2"><div class="t">2025-05</div><b>Microsoft がサーバ側を修正</b></div>
<div class="rx-g g3"><div class="t">2025-06-11</div><b>アドバイザリと研究を公開</b></div>
<div class="rx-g g4"><div class="t">2025-06</div><b>Patch Tuesday に掲載</b></div>
</div>
</figure>

メールを読むエージェントが、送信元を照合する前に資格情報を転送した [OpenClaw](https://lemma.frame00.com/ja/critical/briefs/047-openclaw-agent-phishing/) と同じく、エージェントが照合の前に動いた型である。人が読む入力とモデルが読む入力がずれる [不可視 Unicode の指示注入](https://lemma.frame00.com/ja/critical/briefs/024-invisible-unicode-instruction-injection/) や [嘘フォント](https://lemma.frame00.com/ja/critical/briefs/005-noroboto-lying-fonts/) とも、取り込んだ内容が照合なしに行動へ結びつく点で通じる。

## 4. Lemma でできること

**Lemma は、03 の照合を、AI アシスタントが社内データを読み出して外へ送る操作の手前に組み込む。** 侵入や注入を見つけるのではなく、その操作の根拠になった指示の出どころと権限を、実行の前に、内容の見た目とは別に照合する。

### 注意したい業界・業務

- **業界 · AI**: メール・文書・チャットを横断する AI アシスタントを社内に導入している組織と、そうした AI を提供する事業者。
- **業務 · 照会・参照**: AI に受信メールや共有文書を要約・参照させる業務。外から届いたメールの中の文が、AI によるデータの読み出しと送出につながりうる。

### いまの対策と Lemma の違い

今回の経路は、1 列目（外から届いたメールの取り込み）から 2 列目（社内データの読み出しと外への送出）へ続く連鎖である。

| 対策 | 外から届いたメールの取り込み | 社内データの読み出しと外への送出 |
| --- | --- | --- |
| モデルによる、命令とデータの区別 | 効かない | 関係しない |
| XPIA 分類器（注入された指示の検知） | 一部 | 関係しない |
| 外部リンクの墨消し・Content-Security-Policy | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効かない | 効く |

モデルは、信頼できる命令と、取り込んだデータを、同じトークン列として受け取るため、データに埋め込まれた指示を区別できなかった（Aim Labs）。XPIA 分類器は、注入された指示を見つけて抑える層だが、確率による判定で、実証では回避された。リンクの墨消しと CSP は、外への送り先を絞るが、自動で取得される画像や Teams のプロキシを経て回避された。Lemma は、取り込みそのものは止めず、社内データを外へ送る操作を、その指示の出どころと権限の照合に結ぶ。実行の記録も残るので、AI の説明に頼らずに、どのデータを、どの指示で、誰の承認で送ったかを確認できる。

注：Lemma の照合が働くのは、AI アシスタントがデータを読み出して外へ送る操作に照合を組み込み、利用者の命令と権限が、AI が読むデータとは別に管理されている場合に限る。利用者が、指示の出どころを見ないまま送出を承認すれば通る。正規のドメインを経由する送出は、送り先だけでは見分けにくい。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI アシスタントを社内に導入している組織で確認する 3 項目

- AI アシスタントが取り込む外からのメールや文書を、利用者の命令と同じ扱いにしていないか。
- AI アシスタントが読み出して送ったデータと、その根拠になった指示の記録を、AI とは別に見られるか。
- AI アシスタントがアクセスできる社内データの範囲を、業務に要る範囲に絞っているか。

## 5. 事実と時系列

- **対象**: Microsoft 365 Copilot（Outlook・SharePoint・OneDrive・Teams などを横断する、RAG ベースの企業向け AI アシスタント）。
- **識別子**: CVE-2025-32711。CVSS 9.3（Critical）。
- **発見と報告**: Aim Labs（Aim Security）が発見し、Microsoft Security Response Center（MSRC）へ非公開で報告した。
- **攻撃の性質**: ゼロクリック。攻撃者が送ったメール 1 通を、Copilot が通常の要約・参照の処理で取り込むだけで成立し、被害者の操作は要らない。
- **研究者が示した流れ**: Copilot は、受信メールや SharePoint の内容を、信頼の境界を分けずに同じコンテキストへ結合して処理する。LLM は、命令とデータを同じトークン列として受け取り、データに埋め込まれた指示を正当な命令と区別できない（Aim Labs は LLM Scope Violation と呼ぶ）。検知・抑止の層を回避したうえで、Copilot が自身のアクセス範囲の社内データを読み出し、信頼されたドメインを経由して外へ送る。
- **実環境での悪用**: Microsoft は「顧客側の対応は不要」「実環境で悪用された証拠はない」と表明した。本件は、責任ある開示（PoC）の段階で報告・修正された。

### 時系列

- **2025-01**: Aim Labs が、動く PoC を作り、MSRC へ非公開で報告する。
- **2025 年春先**: 初期の緩和策がとられる。
- **2025-05**: Microsoft が、サーバ側の修正を展開する。
- **2025-06-11**: アドバイザリと、攻撃の連鎖の研究が公開される（CVE-2025-32711）。同じ月の Patch Tuesday に載る。
- **2026 年以降**: SharePoint・Copilot の連携などで、類似の系統が報告される。

> 固有名と CVE は、一次（研究機関・Microsoft のアドバイザリ・論文）に拠る。各実装の対応の状況は時点で変わるため、最新の情報を参照されたい。本件は、研究機関による責任ある開示（PoC）の段階での実証で、実環境での被害を示すものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Microsoft**: CVE-2025-32711 を割り当て、サーバ側で修正した。顧客側の対応は不要とし、実環境で悪用された証拠はないとした。
- **研究**: 論文（arXiv 2509.10540）は、本件を「本番の LLM システムでの、初の実世界のゼロクリックのプロンプトインジェクション」と位置づけた。LLM が、信頼できる命令と、取り込んだデータを同じトークン列として扱う点が論点になった。
- **続く報告**: 2026 年以降も、SharePoint・Copilot の連携などで類似の系統が報告されている。プロンプトインジェクションへの対策の論点は、分類器による検知から、エージェントの実行の境界の設計（命令の出どころと権限の照合）へ広がっている。

## 6. Sources

- **Aim Labs（Aim Security）**: "Breaking down 'EchoLeak', the first zero-click AI vulnerability enabling data exfiltration from Microsoft 365 Copilot"（発見・攻撃連鎖・LLM Scope Violation の解説、2025-06-11） — <https://www.aim.security/lp/aim-labs-echoleak-m365>
- **Microsoft MSRC**: "CVE-2025-32711 — M365 Copilot Information Disclosure Vulnerability"（公式アドバイザリ・CVSS 9.3・サーバ側修正） — <https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-32711>
- **arXiv 2509.10540**: "EchoLeak: The First Real-World Zero-Click Prompt Injection Exploit in a Production LLM System" — <https://arxiv.org/abs/2509.10540>
- **The Hacker News**: "Zero-Click AI Vulnerability Exposes Microsoft 365 Copilot Data Without User Interaction"（2025-06、手口・流出スコープ） — <https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
