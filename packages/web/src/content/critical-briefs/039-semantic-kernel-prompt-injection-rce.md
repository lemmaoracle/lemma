---
brief_no: 39
title: "Semantic Kernel：プロンプトインジェクションが、ホストでのコード実行に至りえた(Microsoft の開示)"
title_en: "Semantic Kernel: prompt injection could lead to code execution on the host (Microsoft disclosure)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "code-provenance"]
incident_date: 2026-05-07
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["025-mcp-stdio-config-to-command-rce", "027-librechat-mcp-url-secrets", "003-starlette-badhost", "037-agent-config-auto-execution", "047-openclaw-agent-phishing"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Microsoft が Semantic Kernel の 2 件の脆弱性を開示し、修正版を出した。プロンプトインジェクションが、ホストでのコード実行や任意のファイルの書き込みに至りえた"
og_lead_en: "Microsoft disclosed and fixed two Semantic Kernel vulnerabilities through which prompt injection could lead to code execution or arbitrary file writes on the host"
search_title: "Semantic Kernel の RCE 脆弱性：経緯と対策"
search_description: "Microsoft が開示した Semantic Kernel の 2 件の脆弱性で、プロンプトインジェクションがホストでのコード実行に至りえた。何が通り、実行の前に何を照合するかを整理。"
og_kicker_ja: "脆弱性の開示 · AI エージェントの基盤"
og_kicker_en: "VULNERABILITY · AI AGENT FRAMEWORK"
og_headline_ja: "注入された一つの指示が\nホストでのコード実行に\n至りうると Microsoft。\n<accent>CVSS 10.0・2 件を修正</accent>"
og_headline_en: "One injected prompt could\nrun code on the host,\nMicrosoft discloses.\n<accent>CVSS 10.0, two CVEs fixed</accent>"
key_figures:
  - value: "10.0"
    label: "CVE-2026-25592（.NET SDK）の CVSS。意図せず公開された関数を通じて、任意のファイルの書き込み・サンドボックスの外への脱出に至りえた"
    tone: "alert"
  - value: "2"
    unit: "件"
    label: "Microsoft が 2026-05-07 に開示した脆弱性の数。.NET SDK と Python SDK に 1 件ずつ"
  - value: "27,000 超"
    label: "Semantic Kernel の GitHub のスターの数。エンタープライズで広く使われている AI エージェントの基盤"
glossary:
  - term: "Semantic Kernel"
    desc: "Microsoft の AI エージェントの基盤。LLM が、開発者の用意した関数（プラグイン）を呼び出して処理を進める。.NET 版と Python 版の SDK がある。"
  - term: "KernelFunction 属性"
    desc: ".NET SDK で、関数を LLM から呼び出せるようにする属性。これが付いた関数は、モデルの出力によって呼ばれうる。"
  - term: "プロンプトインジェクション"
    desc: "AI が読み込む文書・検索結果・外部のデータに命令を紛れ込ませ、AI に指示として扱わせる手法。"
insight:
  slug: "model-output-drives-function-call"
  label: "モデルの出力がそのまま決める関数の呼び出し"
  quote: "エージェントが呼ぶ関数と引数を、モデルの出力とは別に管理された許可の範囲と、実行の前に照合しない限り、入力に紛れ込んだ指示が、そのままホストの操作になる。"
industries: ["ai", "developers"]
controls:
  - slug: "hold-unverified"
    item: "AI が呼ぶ関数と引数が許された範囲か、確認してから実行する"
attack_method: "ai-misuse"
takeaway: "LLM が呼べる関数と引数が実行の前に照合されず、注入された指示がホストでのコード実行に至りえたと、Microsoft が開示した。"
self_check: "AI エージェントが関数を実行する前に、その関数と引数が許された範囲の中かを、モデルの出力とは別に照合しているか。"
countries: ["global"]
---

## 1. 要点

Microsoft によれば、.NET SDK では、ファイルをダウンロードする関数が意図せず LLM から呼び出せる状態で公開され、保存先のパスもほぼモデルが決めていた。Python SDK では、検索のプラグインを既定の設定で使う構成で、細工した一つのプロンプトがホストでのコード実行に至りえた。どちらも、モデルの出力（入力に紛れ込んだ指示に左右されうる）が、ホストに触れる関数を直接動かせた点で共通する。修正版は開示と同じ日に提供されている。<strong>エージェントが呼ぶ関数と引数を、モデルの出力とは別に管理された許可の範囲と、実行の前に照合しない限り、入力に紛れ込んだ指示が、そのままホストの操作になる。</strong>

## 2. 通った操作

- **通った操作**: LLM の出力による、ホストに触れる関数の呼び出し。Microsoft によれば、.NET SDK（CVE-2026-25592）では `DownloadFileAsync` が意図せず `[KernelFunction]` として公開され、LLM が直接呼び出せた。保存先のパス（`localFilePath`）はほぼモデルの制御の下にあり、パスの検証はほとんど無かった。Python SDK（CVE-2026-26030）では、In-Memory Vector Store を検索のプラグイン（Search Plugin）のバックエンドとして既定のフィルタの挙動で使い、攻撃者がエージェントの入力にプロンプトインジェクションの経路を持つ場合に、細工した一つのプロンプトがホストでのコード実行に至りえた。
- **受け付けた側に届くもの**: 一般に、エージェントの基盤は、モデルが選んだ関数を、モデルが決めた引数でそのまま実行する。Microsoft によれば、.NET SDK の件では任意のファイルの書き込みとサンドボックスの外への脱出に、Python SDK の件ではホストでのコード実行に届きえた。
- **公表されていないこと**: 実環境で悪用された事例と、その被害。影響を受けた利用者の数。

## 3. 何を照合するか

経路を問わず区別できる条件は、エージェントが関数を実行する前に、その関数がこの文脈で呼んでよいものか、引数が許された範囲の中かを、モデルの出力とは別に照合することである。

- **誰が承認を出すか**: エージェントを組み込む開発者と運用の担当。LLM から呼べる関数の一覧と、それぞれの引数の範囲（書き込んでよいパスなど）を、モデルの出力とは別に決める。範囲の外の操作は、人が承認する。
- **どこで照合するか**: エージェントの基盤が、モデルの選んだ関数を実行に移す直前。関数が許された一覧の中にあるか、引数が決めた範囲の中かを照合し、照合できない呼び出しは実行に移さない。
- **何が残るか**: どの関数が、どの引数で、どの許可の下で呼ばれたか（または止められたか）の記録。エージェントとは別に、後から示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝エージェントが関数を実行する前に、その関数と引数が許された範囲の中かを照合し、記録に残すこと。検知＝脆弱性を見つけて開示し、修正すること。日付は開示と修正の日で、経路が使われた日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>関数を実行する前に、関数と引数が許された範囲の中かを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>注入された指示で、ホストに触れる関数が<br>呼ばれうる状態だった</span></div>
<div class="rx-zone det"><b>検知 · Microsoft が開示し、修正した</b>脆弱性の開示・修正版の提供</div>
<div class="rx-g g1"><div class="t">05-07</div><b>.NET SDK の CVE-2026-25592 を開示</b></div>
<div class="rx-g g2"><div class="t">05-07</div><b>Python SDK の CVE-2026-26030 を開示</b></div>
<div class="rx-g g3"><div class="t">05-07</div><b>.NET 1.71.0 で修正</b></div>
<div class="rx-g g4"><div class="t">05-07</div><b>Python 1.39.4 で修正</b></div>
</div>
</figure>

脆弱性の開示と修正版の提供は働き、知られた二つの経路は塞がれた。効かなかったのは、その手前で、LLM が選んだ関数と引数を、実行の前に許された範囲と照合する層である。エージェントの基盤の設計が外部からの入力を特権の実行に変える点で、[MCP の標準の設計が RCE の経路になった Brief 025](https://lemma.frame00.com/ja/critical/briefs/025-mcp-stdio-config-to-command-rce/)、[LibreChat の Brief 027](https://lemma.frame00.com/ja/critical/briefs/027-librechat-mcp-url-secrets/)、[Starlette / BadHost の Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/) と同じ形で、エージェントの行動が行動の前の照合に結び付いていない点で、[リポジトリ同梱の設定を自動で実行した Brief 037](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)、[OpenClaw の Brief 047](https://lemma.frame00.com/ja/critical/briefs/047-openclaw-agent-phishing/) と連なる。

## 4. Lemma でできること

**Lemma は、03 の照合を、エージェントの基盤が関数を実行に移す直前に組み込む。** プロンプトインジェクションを見つけるのではなく、モデルが選んだ関数と引数を、実行の前に、モデルの出力とは別に管理された許可の範囲と照合する。

### 注意したい業界・業務

- **業界 · AI**: Semantic Kernel のようなエージェントの基盤で、LLM にファイルの操作やコードの実行に触れる関数を呼ばせている組織。
- **業界 · 開発者**: 文書・検索結果・外部のデータのように、攻撃者が書き込みうる入力をエージェントに読ませる仕組みを作っている開発のチーム。基盤の既定の設定と、関数を呼び出せるようにする属性が、そのまま LLM から呼べる範囲になる。

### いまの対策と Lemma の違い

今回の .NET SDK の経路は 1 列目と 2 列目、Python SDK の経路は 3 列目にあたる。

| 対策 | 公開する予定の無かった関数の呼び出し | 呼べる関数への、範囲の外の引数（保存先のパスなど） | 呼べる関数の既定の処理を通じた実行（検索のフィルタ） |
| --- | --- | --- | --- |
| 修正版への更新 | 一部 | 一部 | 一部 |
| LLM から呼べる関数の公開範囲を最小にする | 効く | 関係しない | 関係しない |
| 引数（パスなど）を厳しく検証する | 関係しない | 効く | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く | 一部 |

修正版への更新は、知られた経路を塞ぐが、別の関数や別の構成で次の公開が起きれば、同じ形が残る。関数の公開範囲の最小化と引数の検証は、エージェントの基盤の要件として議論されている対策で、それぞれ 1 列目と 2 列目を狭める。Lemma は、モデルが選んだ関数を許された一覧と、引数を決めた範囲と、実行の前に照合するので、一覧に無い関数の呼び出しや、範囲の外のパスへの書き込みは、実行に移る前に止まる。一方、呼んでよい関数を範囲の中の引数で呼び、その関数の内部の処理に欠陥がある場合は、照合は一致する。引数の範囲を細かく決められるかで効き方が変わるため、3 列目は一部とした。

注：Lemma の照合が働くのは、エージェントの基盤が関数を実行する処理に照合を組み込み、呼べる関数の一覧と引数の範囲が、モデルの出力やエージェントの読む入力とは別に管理されている場合に限る。許された範囲を広く決めていれば、その範囲の中の悪意ある呼び出しは通る。照合は、関数の内部の欠陥を直すものでも、入力の中の指示を見つけるものでもない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI エージェントに関数を呼ばせている組織で確認する 3 項目

- 使っている semantic-kernel が、修正の入った版（Python 1.39.4 以降、.NET 1.71.0 以降）になっているか。
- LLM から呼び出せる関数の一覧を把握し、ファイルの操作やコードの実行に触れる関数を、必要なものだけにしているか。
- エージェントがどの関数を、どの引数で呼んだかの記録を、エージェントとは別に見られるか。

## 5. 事実と時系列

- **対象**: Microsoft の Semantic Kernel（AI エージェントの基盤。GitHub のスター 27,000 超、エンタープライズで広く利用）。.NET SDK と Python SDK。
- **CVE-2026-25592（.NET SDK・CVSS 10.0・サンドボックスの外への脱出）**: `DownloadFileAsync` が意図せず `[KernelFunction]` 属性付きで公開され、LLM が直接呼び出せる状態だった。保存先のパス（`localFilePath`）がほぼモデルの制御の下にあり、パスの検証がほとんど無かったため、任意のファイルの書き込みとサンドボックスの外への脱出に至りえた（Microsoft）。
- **CVE-2026-26030（Python SDK・ホストでのコード実行）**: エージェントが In-Memory Vector Store を Search Plugin のバックエンドとして既定のフィルタの挙動で使い、かつ攻撃者がエージェントの入力にプロンプトインジェクションの経路を持つ場合に、細工した一つのプロンプトがホストでのコード実行に至りえた（Microsoft）。
- **修正**: semantic-kernel 1.39.4（Python）、1.71.0（.NET）。
- **見方（Microsoft のブログ）**: プロンプトインジェクションを、出力の完全性の問題ではなく、実行の問題として扱う事例として示された。

### 時系列

- **2026-05-07**: Microsoft が Semantic Kernel の 2 件の脆弱性（CVE-2026-25592／CVE-2026-26030）を開示。プロンプトインジェクションが、ホストでのコード実行や任意のファイルの書き込みに至りえたと公表。
- **2026-05-07**: 修正版（Python 1.39.4／.NET 1.71.0）が提供される。

> 本稿の事実は、Microsoft Security Blog と NVD の CVE の記載に拠る。CVSS・条件・修正の版は開示の時点の値である。本 Brief は、再現の手順を載せない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Microsoft**: 2 件の脆弱性を開示し、修正版（Python 1.39.4／.NET 1.71.0）を提供した。
- **設計上の要件**: 関数の公開範囲の最小化、引数の厳しい検証、実行の前の認可が、エージェントの基盤の要件として議論されている。

## 6. Sources

- **Microsoft Security Blog**: “When prompts become shells: RCE vulnerabilities in AI agent frameworks”（2026-05-07）— <https://www.microsoft.com/en-us/security/blog/2026/05/07/prompts-become-shells-rce-vulnerabilities-ai-agent-frameworks/>
- **NVD**: CVE-2026-25592（.NET Semantic Kernel SDK、サンドボックス脱出）— <https://nvd.nist.gov/vuln/detail/CVE-2026-25592>
- **NVD**: CVE-2026-26030（Python Semantic Kernel、In-Memory Vector Store 経由の RCE）— <https://nvd.nist.gov/vuln/detail/CVE-2026-26030>
- **reference 実装（GitHub）**: agent-authority proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
