---
brief_no: 94
title: "Cursor（DuneSlide）：仕込まれた指示が、AI エージェントのサンドボックスを外しえた(Cato AI Labs の報告)"
title_en: "Cursor (DuneSlide): an injected instruction could escape the AI agent's sandbox (Cato AI Labs report)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-07-01
published: 2026-07-03
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["037-agent-config-auto-execution", "039-semantic-kernel-prompt-injection-rce", "027-librechat-mcp-url-secrets", "048-trapdoor-ai-instruction-provenance", "058-langgraph-checkpoint-rce"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Cato AI Labs が Cursor の 2 件の脆弱性（DuneSlide）を報告し、Cursor 3.0 で修正された。Web や連携先に仕込まれた指示が、エージェントのサンドボックスを外し、任意のコマンドの実行に至りえた"
og_lead_en: "Cato AI Labs reported two Cursor vulnerabilities (DuneSlide), fixed in Cursor 3.0, through which instructions planted on the web or in connected services could escape the agent's sandbox and run arbitrary commands"
search_title: "Cursor DuneSlide のサンドボックス脱出と対策"
search_description: "Cato AI Labs が報告した Cursor の 2 件の脆弱性（DuneSlide）で、仕込まれた指示がエージェントのサンドボックスを外しえた。何が通り、実行の前に何を照合するかを整理。"
og_kicker_ja: "脆弱性の報告 · AI コードエディタ"
og_kicker_en: "VULNERABILITY · AI CODE EDITOR"
og_headline_ja: "仕込まれた一つの指示が\nサンドボックスを外しうると\nCato AI Labs が報告。\n<accent>CVSS 9.8・2 件を修正</accent>"
og_headline_en: "One injected prompt could\nescape Cursor's sandbox,\nCato AI Labs reports.\n<accent>CVSS 9.8, two CVEs fixed</accent>"
key_figures:
  - value: "9.8"
    label: "CVE-2026-50548 と CVE-2026-50549 の、NVD の CVSS 3.1。どちらも Critical"
    tone: "alert"
  - value: "2"
    unit: "件"
    label: "Cato AI Labs が「DuneSlide」と名付けて報告した脆弱性の数。サンドボックスの外への書き込みに、別々の抜け道から至る"
  - value: "3.0"
    label: "修正の入った Cursor の版（2026-04-02 リリース）。3.0 未満のすべての版が影響を受ける"
glossary:
  - term: "Cursor"
    desc: "AI コードエディタ。エージェントが、利用者の依頼を受けて端末のコマンドの実行やファイルの操作を行う。"
  - term: "サンドボックス"
    desc: "コマンドの実行を囲い、触れられる範囲を制限する仕組み。Cursor は 2.x 系から、エージェントの発行する端末のコマンドを既定でこの中で動かす。"
  - term: "MCP"
    desc: "AI エージェントが外部のサービスやツールとつながるための仕組み。連携先から返るデータを、エージェントが読み込む。"
  - term: "プロンプトインジェクション"
    desc: "AI が読み込む文書・検索結果・外部のデータに命令を紛れ込ませ、AI に指示として扱わせる手法。"
insight:
  slug: "agent-chosen-path-grants-write"
  label: "エージェントの指定がそのまま決める書き込みの許可"
  quote: "エージェントが書き込む先を、エージェントの指定やリンクの解決の結果とは別に決めた範囲と、実行の前に照合しない限り、読み込んだ内容に紛れた一つの指示が、守りの仕組みそのものを書き換えうる。"
industries: ["developers", "ai"]
controls:
  - slug: "ownership-check"
    item: "エージェントが読んだ指示の出どころを、実行の前に確認する"
attack_method: "ai-misuse"
takeaway: "エージェントの書き込み先が、エージェントの指定やリンクの解決の結果とは別に照合されず、仕込まれた指示がサンドボックスを外しえたと、Cato AI Labs が報告した。"
self_check: "AI エージェントがファイルに書き込む前に、書き込む先が許された範囲の中かを、エージェントの指定とは別に照合しているか。"
countries: ["global"]
---

## 1. 要点

Cato AI Labs によれば、攻撃者は Cursor に直接入力しない。エージェントが利用者に代わって読むもの（MCP の連携先のデータや、Web 検索が返したページ）に指示を潜ませ、利用者がふだんどおり質問すると、その指示が一緒に読み込まれる。2 件はどちらも、本来は書けないファイルを 1 つ書かせ、その書き込みでサンドボックスを無効にするもので、クリックも承認も要らない。実環境での悪用の報告はなく、研究としての開示である。<strong>エージェントが書き込む先を、エージェントの指定やリンクの解決の結果とは別に決めた範囲と、実行の前に照合しない限り、読み込んだ内容に紛れた一つの指示が、守りの仕組みそのものを書き換えうる。</strong>

## 2. 通った操作

- **通った操作**: エージェントによる、プロジェクトの外のファイルへの書き込み。Cato AI Labs によれば、CVE-2026-50548 では、コマンドの作業フォルダをエージェントが既定以外のパスに指定すると、Cursor がそのパスを検証せずに書き込みの許可の一覧に加えていた。CVE-2026-50549 では、書き込みの前にリンクの実際の行き先がプロジェクトの中かを調べる処理が失敗したとき、Cursor がリンクの示す「プロジェクトの中」のパスを信用していた（Cursor のアドバイザリも、この件をリンクの検証のフォールバックの欠陥としている）。書き込みの対象は、サンドボックスの補助ファイルや、シェルの起動時に読まれるファイルだった。
- **受け付けた側に届くもの**: 一般に、サンドボックスの外で動くコマンドは、開発者本人の権限で実行される。Cato AI Labs によれば、サンドボックスが無効になると次のコマンドは開発者本人として動き、マシンの掌握に加え、エディタがサインインしているクラウドや SaaS のワークスペースにも届きうる。
- **公表されていないこと**: 影響を受けた利用者の数。Cato AI Labs が開示を進めているとする、他のコーディングエージェントの同種の欠陥の中身。

## 3. 実行前の照合

経路を問わず区別できる条件は、エージェントがファイルに書き込む前に、書き込む先が許された範囲の中かを、エージェントが指定したパスやリンクの解決の結果とは別に照合することである。

- **誰が承認を出すか**: エージェントを使う開発のチームと、エディタを管理する担当。エージェントが書き込んでよい範囲（プロジェクトの中など）を、エージェントの指定とは別に決める。範囲の外への書き込み、特にエディタ自身のファイルや起動時のファイルへの書き込みは、人が承認する。
- **どこで照合するか**: エディタが、エージェントの書き込みやコマンドを実行に移す直前。書き込む先が決めた範囲の中かを照合し、照合できない書き込みは実行に移さない。照合が失敗したときに、元の指定を信用する側へ倒さない。
- **何が残るか**: エージェントがどの指示を受けて、どの書き込みやコマンドを、どの許可の下で行ったか（または止められたか）の記録。エージェントとは別に、後から示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝エージェントが書き込む前に、書き込む先が許された範囲の中かを照合し、記録に残すこと。検知＝脆弱性を見つけて報告し、修正すること。日付は報告・修正・公開の日で、経路が使われた日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>書き込む前に、書き込む先が許された範囲の中かを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>仕込まれた指示で、サンドボックスの<br>外への書き込みが通りうる状態だった</span></div>
<div class="rx-zone det"><b>検知 · Cato AI Labs が報告し、Cursor が修正した</b>脆弱性の報告・修正版の提供・公開</div>
<div class="rx-g g1"><div class="t">02-19</div><b>Cato AI Labs が 2 件を報告</b></div>
<div class="rx-g g2"><div class="t">04-02</div><b>修正の入った Cursor 3.0</b></div>
<div class="rx-g g3"><div class="t">06-05</div><b>CVE の番号が付く</b></div>
<div class="rx-g g4"><div class="t">07-01</div><b>DuneSlide として公開</b></div>
</div>
</figure>

研究者の報告と修正版の提供は働き、知られた二つの経路は公開の前に塞がれていた。効かなかったのは、その手前で、エージェントの書き込み先を、エージェントの指定とは別に決めた範囲と実行の前に照合する層である。リポジトリに同梱された設定を自動で実行した [Brief 037](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)、プロンプトインジェクションがホストでのコード実行に至りえた [Semantic Kernel の Brief 039](https://lemma.frame00.com/ja/critical/briefs/039-semantic-kernel-prompt-injection-rce/)、AI の指示ファイルに見えない命令が仕込まれた [Brief 048](https://lemma.frame00.com/ja/critical/briefs/048-trapdoor-ai-instruction-provenance/) とは、AI が読む入力の出どころが照合されないまま実行に結び付く点で、[LibreChat の Brief 027](https://lemma.frame00.com/ja/critical/briefs/027-librechat-mcp-url-secrets/)、[LangGraph の Brief 058](https://lemma.frame00.com/ja/critical/briefs/058-langgraph-checkpoint-rce/) とは、エージェントの基盤で入力がそのまま実行になる点で連なる。

## 4. Lemma でできること

**Lemma は、03 の照合を、エディタがエージェントの書き込みやコマンドを実行に移す直前に組み込む。** プロンプトインジェクションを見つけるのではなく、エージェントの書き込み先を、実行の前に、エージェントの指定とは別に管理された許可の範囲と照合する。

### 注意したい業界・業務

- **業界 · 開発者**: Cursor のような AI コードエディタで、エージェントに端末のコマンドやファイルの書き込みを任せている開発のチーム。エージェントの動く権限は、開発者本人の権限とサインイン中のクラウドに及ぶ。
- **業界 · AI**: MCP の連携先や Web 検索の結果のように、出どころをエージェントが選べない入力を読ませるエージェントを作り、配っている組織。

### いまの対策と Lemma の違い

今回の CVE-2026-50548 の経路は 1 列目、CVE-2026-50549 の経路は 2 列目にあたる。3 列目は今回の経路ではない。

| 対策 | エージェントの指定（作業フォルダなど）を通じた、範囲の外への書き込み | 安全のための確認の失敗を通じた、範囲の外への書き込み | 範囲の中での、仕込まれた指示による書き込み・コマンド |
| --- | --- | --- | --- |
| 修正版（Cursor 3.0）への更新 | 一部 | 一部 | 関係しない |
| サンドボックス（既定のコマンドの囲い） | 一部 | 一部 | 効かない |
| **Lemma（実行の前の照合）** | 効く | 効く | 効かない |

修正版への更新は知られた二つの経路を塞ぐが、別の抜け道が見つかれば同じ形が残る。サンドボックスは範囲の外への書き込みを防ぐための仕組みだが、今回はその許可の判断が、エージェントの指定やリンクの解決の結果に頼っていたため、書き込み一つで外れうる状態だった。Lemma は、書き込み先を、エージェントの指定とは別に管理された範囲と実行の前に照合し、照合できないときは止めるので、1 列目と 2 列目の書き込みは実行に移る前に止まる。一方、許された範囲の中で、仕込まれた指示に従った書き込みやコマンドが行われた場合は、照合は一致する。

注：Lemma の照合が働くのは、エディタがエージェントの書き込みやコマンドを実行する処理に照合を組み込み、書き込んでよい範囲が、エージェントの指定やエージェントの読む入力とは別に管理されている場合に限る。範囲を広く決めていれば、その中の悪意ある書き込みは通る。照合は、入力の中の指示を見つけるものでも、エディタの欠陥を直すものでもない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI コードエディタのエージェントを使っている組織で確認する 3 項目

- 使っている Cursor が、修正の入った版（3.0 以降）になっているか。
- エージェントが読む外部の入力（MCP の連携先・Web 検索）を把握し、連携を必要なものだけにしているか。
- エージェントが実行したコマンドと書き込んだファイルの記録を、エージェントとは別に見られるか。

## 5. 事実と時系列

- **対象**: Cursor（AI コードエディタ）。2.x 系から、エージェントの発行する端末のコマンドを既定でサンドボックスの中で動かす。
- **識別子**: CVE-2026-50548・CVE-2026-50549。Cato AI Labs が「DuneSlide」と名付けた。
- **深刻度**: どちらも NVD の CVSS 3.1 で 9.8（Critical）。
- **入口（Cato AI Labs）**: エージェントが利用者に代わって読む、MCP の連携先のデータや Web 検索の結果に潜ませた指示。クリックも承認も要らない「ゼロクリック」。
- **CVE-2026-50548（Cato AI Labs）**: 端末のコマンドの作業フォルダをエージェントが既定以外のパスに指定すると、Cursor がそのパスを検証せずに書き込みの許可の一覧に加えていた。
- **CVE-2026-50549（Cato AI Labs・Cursor のアドバイザリ）**: 書き込みの前にリンクの行き先を調べる処理が失敗したときのフォールバックで、Cursor がリンクの示すプロジェクトの中のパスを信用していた。
- **影響（Cato AI Labs）**: サンドボックスが無効になると、次のコマンドは開発者本人として動き、マシンとサインイン中のクラウド・SaaS に届きうる。3.0 未満のすべての版が影響を受ける。
- **悪用の状況**: 実環境での悪用の報告は無い。Cato AI Labs は能動的なキャンペーンではなく研究として示し、公開の脆弱性の記録も「悪用の確認なし」としている。

### 時系列

- **2026-02-19**: Cato AI Labs が 2 件を Cursor に報告。
- **2026-02-23 頃**: Cato AI Labs によれば、Cursor は「脅威モデルが MCP サーバーの悪用（公式の Linear のワークスペースのような標準的なものを含む）を対象にしていない」として、当初は受理しなかった。
- **2026-02-26**: Cato AI Labs が再び上げ、Cursor が報告を開き直して対応を始めた。
- **2026-04-02**: 修正の入った Cursor 3.0 がリリースされた。
- **2026-06-05**: CVE の番号が付いた。
- **2026-07-01**: Cato AI Labs が「DuneSlide」として公開。Cursor がリンクの側の欠陥のアドバイザリ（GHSA-3v8f-48vw-3mjx）を公開し、NVD の記録も公開された。

> 本稿の事実は、Cato AI Labs の開示、Cursor の GitHub Security Advisory、NVD の登録に拠る。経緯のうち報告の受理をめぐるやり取りは、Cato AI Labs の説明である。本 Brief は、再現の手順を載せない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Cursor**: 2 件を 3.0（2026-04-02）で修正し、リンクの側についてアドバイザリ（GHSA-3v8f-48vw-3mjx）を公開した。
- **Cato AI Labs**: 他のコーディングエージェントでも同種の欠陥の開示を進めているとし、問題は構造的だと主張している。「Web を読むエージェントを出す以上、あらゆる入力を敵性として扱うのを既定にするか、パッチの後追いを続けるか」を業界への問いとして示した。

## 6. Sources

- **Cato Networks（研究・一次）**: “DuneSlide: Two Critical RCE Vulnerabilities in Cursor” — <https://www.catonetworks.com/blog/duneslide-two-critical-rce-vulnerabilities/>
- **The Hacker News**: “Critical Cursor Flaws Could Let Prompt Injection Escape Sandbox and Run Commands”（2026-07-01）— <https://thehackernews.com/2026/07/critical-cursor-flaws-could-let-prompt.html>
- **CSO Online**: “Sandbox bypass flaws in Cursor IDE highlight prompt injection as an RCE vector” — <https://www.csoonline.com/article/4191923/sandbox-bypass-flaws-in-cursor-ide-highlight-prompt-injection-as-an-rce-vector.html>
- **Cursor（ベンダーアドバイザリ）**: GHSA-3v8f-48vw-3mjx（CVE-2026-50549、symlink 検証のフォールバック）— <https://github.com/cursor/cursor/security/advisories/GHSA-3v8f-48vw-3mjx>
- **NVD**: CVE-2026-50549 — <https://nvd.nist.gov/vuln/detail/CVE-2026-50549>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
