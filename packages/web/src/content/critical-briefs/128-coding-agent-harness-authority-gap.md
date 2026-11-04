---
brief_no: 128
title: "Claude Code・Gemini CLI・Codex：権限の無い issue が、既定の CI のワークフローを乗っ取りえた(Novee Security の報告)"
title_en: "Claude Code, Gemini CLI and Codex: an unprivileged GitHub issue could take over default CI workflows (Novee Security research)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "code-provenance"]
incident_date: 2026-08-05
published: 2026-08-11
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["062-claude-code-github-action-bot-trust", "095-amazon-q-mcp-auto-execution", "114-aws-kiro-self-rewriting-mcp-config", "037-agent-config-auto-execution", "099-agentjacking-sentry-mcp", "094-cursor-duneslide-sandbox-escape"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Novee Security が Claude Code・Gemini CLI・Codex を各社の既定の構成のまま検証し、権限の無いアカウントが立てた GitHub の issue 1 件で、CI でのコードの実行や次のエージェントの実行の乗っ取りに至ったと Black Hat USA で公表した。CVE 2 本は修正済み"
og_lead_en: "Novee Security tested Claude Code, Gemini CLI and Codex in each vendor's default configuration and reported at Black Hat USA that a single GitHub issue from an unprivileged account led to code running in CI or to the next agent run being hijacked. Both CVEs are fixed"
search_title: "Claude Code・Gemini CLI の CI 乗っ取り"
search_description: "Novee Security が、Claude Code・Gemini CLI・Codex を既定の構成のまま検証し、権限の無い issue 1 件で CI が乗っ取られうると報告。何が通り、実行の前に何を照合するかを整理。"
og_kicker_ja: "研究の報告 · コーディングエージェント"
og_kicker_en: "RESEARCH · CODING AGENTS"
og_headline_ja: "既定の AI 3 種が\nissue 1 件で破られたと\nNovee が報告。\n<accent>CVE 2 本は修正済み</accent>"
og_headline_en: "Three coding agents fell\nto one GitHub issue,\nNovee reports.\n<accent>Two CVEs, both fixed</accent>"
key_figures:
  - value: "1"
    unit: "件"
    label: "攻撃の起点になった GitHub の issue の数。Novee によれば、権限を持たない任意のアカウントが立てられる"
    tone: "alert"
  - value: "3"
    unit: "種"
    label: "既定の構成のまま検証されたコーディングエージェント（Claude Code・Gemini CLI・Codex）"
  - value: "2"
    unit: "本"
    label: "付与された CVE の数（Gemini CLI・Claude Code）。どちらも修正済みで、Codex には CVE も製品版の修正も無い"
glossary:
  - term: "コーディングエージェント"
    desc: "依頼を受けて、コードを読み書きし、コマンドを実行する AI。CI に組み込むと、issue や pull request に自動で対応する。"
  - term: "harness"
    desc: "モデルと実際の環境の間にあり、モデルの出力のうち何を実際に実行するかを決めるコード。許可リストやコマンドの検査もここにある。"
  - term: "CI"
    desc: "コードの変更や issue を合図に、決めた処理を自動で動かす仕組み。GitHub Actions など。秘密情報やトークンを持って動く。"
  - term: "許可リスト"
    desc: "エージェントが使ってよいコマンドや取得先を、あらかじめ登録しておく仕組み。"
insight:
  slug: "safe-mark-trusted-at-execution"
  label: "前の段の「安全」の印をそのまま信じる実行"
  quote: "ある段が「安全」とした値を、後の段がより強い権限で実行する前に、その値の出どころと許された範囲を照合しない限り、権限の無い入力 1 件が、CI の秘密情報や次の実行に届きうる。"
industries: ["developers", "ai"]
controls:
  - slug: "hold-unverified"
    item: "「安全」とされた値を強い権限で実行する前に、出どころと許された範囲を照合する"
attack_method: "ai-misuse"
takeaway: "コーディングエージェントの harness で、ある段が「安全」とした値を後の段がより強い権限で実行し、その手前で出どころと許された範囲が照合されていなかったと、Novee Security が報告した。"
self_check: "外部のユーザーが起動できる AI エージェントのワークフローで、強い権限の操作の前に、その入力の出どころと許された範囲を、エージェントとは別に照合しているか。"
countries: ["global"]
---

## 1. 要点

セキュリティ企業 Novee Security は、Anthropic の Claude Code・Google の Gemini CLI・OpenAI の Codex を、各社が出荷する既定の構成のまま検証し、2026 年 8 月 5 日の Black Hat USA で公表した。Novee によれば、権限を持たないアカウントが GitHub の issue を 1 件立てるだけで、Anthropic と Google の自社リポジトリの CI ランナー上でコードが動き、OpenAI のリポジトリでは次のエージェントの実行が乗っ取られた。CVE は 2 本で、いずれも修正済みである。CISA の記録では、どちらの CVE も悪用は確認されていない。Novee が共通点として示したのは、モデルを騙したことではなく、エージェントを取り巻く harness の中で、ある段が「安全」とした値を、後の段がより強い権限で実行していたことである。<strong>ある段が「安全」とした値を、後の段がより強い権限で実行する前に、その値の出どころと許された範囲を照合しない限り、権限の無い入力 1 件が、CI の秘密情報や次の実行に届きうる。</strong>

## 2. 通った操作

- **通った操作**: 権限の無いアカウントが立てた issue を起点にした、より強い権限での実行。Novee によれば、Gemini CLI（CVE-2026-12537）では、リポジトリに置いた設定ファイルを経由したコンテナ起動処理の OS コマンドインジェクションで、sandbox が立ち上がる前にホストの権限でコードが動いた。Gemini CLI の許可リストは、登録したコマンドの細かい指定を実行の時に照合していなかった（CVE 無し）。Claude Code（CVE-2026-54316）では、コマンドの検証器・読み取り専用とされたコマンド・ホスト名だけで事前承認された取得先という 3 つの段で、それぞれ「安全」とされた値が、検査を経ずに実行や外部への送信に使われた。Codex では、1 つのジョブの中の 2 回の実行が同じチェックアウトを共有し、1 回目が書き換えた既定の指示ファイル（`AGENTS.md`）を、2 回目が自分の指示として読み込んだ。
- **受け付けた側に届くもの**: Novee によれば、CI の秘密情報が置かれた環境変数、ワークフローの `ANTHROPIC_API_KEY` と `GITHUB_TOKEN`、次のエージェントの実行への指示。Anthropic は、悪用には信頼できない内容を Claude Code の文脈に入れる必要があると説明している。
- **公表されていないこと**: 3 社のリポジトリ以外で、同じ既定の構成を使っている組織のワークフローがどれだけ影響を受けたか。本 Brief は連鎖の細部（入力の形や送信の手口）を載せない。

## 3. 実行前の照合

経路を問わず区別できる条件は、エージェントがより強い権限の操作（コンテナの起動・コマンドの実行・指示の読み込み）に移る前に、その操作に使う値がどこから来たか、その操作が許された範囲の中かを、前の段が付けた「安全」の印とは別に照合することである。

- **誰が承認を出すか**: エージェントを CI で動かす開発のチームと、ワークフローを管理する担当。外部のユーザーが起動できるワークフローで、どの入力からどの操作までを許すかを、エージェントとは別に決める。権限の無いアカウント由来の入力から、秘密情報に触れる操作や次の実行の指示を変える操作に進むときは、人が承認する。
- **どこで照合するか**: harness が、値をコンテナの起動・コマンドの実行・次の実行の指示へ渡す直前。許可リストは登録の時だけでなく実行の時に、操作ごとに照合する。照合できない値は、より強い権限の段へ渡さない。
- **何が残るか**: どの入力（issue・同梱のファイル・前の実行の出力）から、どの操作を、どの許可の下で行ったか（または止められたか）の記録。エージェントとは別に、後から示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝より強い権限の操作に移る前に、値の出どころと許された範囲を照合し、記録に残すこと。検知＝脆弱性を見つけて報告し、修正すること。日付は公開・発表の日で、経路が使われた日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>強い権限で実行する前に、値の出どころと許された範囲を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>権限の無い issue 1 件から、CI の秘密情報や<br>次の実行に届きうる状態だった</span></div>
<div class="rx-zone det"><b>検知 · Novee が報告し、各社が修正・緩和した</b>脆弱性の報告・修正版の提供・公開</div>
<div class="rx-g g1"><div class="t">04-24</div><b>Google が許可リストの advisory</b></div>
<div class="rx-g g2"><div class="t">06-17</div><b>Claude Code の advisory</b></div>
<div class="rx-g g3"><div class="t">06-24</div><b>Gemini CLI の CVE を公開</b></div>
<div class="rx-g g4"><div class="t">08-05</div><b>Novee が Black Hat で公表</b></div>
</div>
</figure>

許可リスト・コマンドの検査・sandbox は各社にあり、研究者の報告と修正は働いた。効かなかったのは、その手前で、前の段が付けた「安全」の印とは別に、値の出どころと許された範囲を、より強い権限の操作の前に照合する層である。リポジトリに同梱された設定を自動で実行した [Brief 037](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)、エージェントが自らの MCP の設定を書き換えさせられた [Brief 114](https://lemma.frame00.com/ja/critical/briefs/114-aws-kiro-self-rewriting-mcp-config/)、リポジトリを開くだけで同梱の MCP の設定が実行された [Brief 095](https://lemma.frame00.com/ja/critical/briefs/095-amazon-q-mcp-auto-execution/) とは、エージェントの権限が、指示の出どころと許された範囲に結び付いていない点で連なる。

## 4. Lemma でできること

**Lemma は、03 の照合を、harness が値をより強い権限の操作に渡す直前に組み込む。** 入力が悪性かを見分けるのではなく、その値の出どころと、その操作が許された範囲の中かを、実行の前に、エージェントとは別に管理された許可と照合する。

### 注意したい業界・業務

- **業界 · 開発者**: GitHub Actions などの CI で、コーディングエージェントに issue や pull request への対応を任せている開発のチーム。外部のユーザーが起動できるワークフローでは、エージェントの権限が CI の秘密情報やトークンに及ぶ。
- **業界 · AI**: コーディングエージェントと、その CI 用のワークフローを作り、既定の構成として配っている組織。

### いまの対策と Lemma の違い

今回の Gemini CLI と Claude Code の経路は 1 列目、Codex の経路は 2 列目にあたる。3 列目は今回の経路ではない。

| 対策 | 許可リストや検査が「安全」とした値の、より強い権限での実行 | 前の実行が書いた指示ファイルの、次の実行での読み込み | 許された範囲の中での、仕込まれた指示に従う操作 |
| --- | --- | --- | --- |
| 修正版への更新（Gemini CLI 0.39.1・Claude Code 2.1.163） | 一部 | 関係しない | 関係しない |
| ワークフローの分離（別ジョブ・別チェックアウト・読み取り専用） | 関係しない | 一部 | 関係しない |
| sandbox | 効かない | 効かない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く | 効かない |

修正版への更新は知られた経路を塞ぐが、Novee が 3 ラウンドで別々の連鎖を通したように、別の段で同じ形が残りうる。OpenAI はリポジトリの側で 2 回の実行を別のジョブとチェックアウトに分けたが、Codex 自体が書き込める指示ファイルを別に扱うようになったことを示すものではない。sandbox は、Gemini CLI では立ち上がる前にコードが動き、Codex では OpenAI によれば文書どおりに振る舞ったまま次の実行が乗っ取られた。Lemma は、値の出どころと許された範囲を、より強い権限の操作の前に、前の段の印とは別に照合し、照合できないときは止めるので、1 列目と 2 列目の操作は実行に移る前に止まる。一方、許された範囲の中で、仕込まれた指示に従った操作が行われた場合は、照合は一致する。

注：Lemma の照合が働くのは、harness がより強い権限の操作に移る処理に照合を組み込み、許す範囲が、エージェントの読む入力とは別に管理されている場合に限る。範囲を広く決めていれば、その中の悪意ある操作は通る。照合は、入力が悪性かを見分けるものでも、harness の欠陥を直すものでも、モデルの推論の正しさを示すものでもない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

コーディングエージェントを CI で動かしている組織で確認する 3 項目

- 外部のユーザーが issue などで起動できるワークフローを洗い出し、使っているエージェントが修正の入った版になっているか。
- 別々のエージェントの実行に、書き込める同じディレクトリを共有させず、トークンをタスクごとに必要な権限へ絞っているか。
- エージェントがどの入力から、どのコマンドを実行し、どの秘密情報に触れたかの記録を、エージェントとは別に見られるか。

## 5. 事実と時系列

- **対象**: Anthropic の Claude Code、Google の Gemini CLI、OpenAI の Codex。いずれも各社が提供する既定の CI のワークフローで検証された。
- **識別子**: CVE-2026-12537（Gemini CLI・GHSA-jj69-4grx-fqj5）、CVE-2026-54316（Claude Code・GHSA-fg94-h982-f3mm）。Gemini CLI の許可リストは先行する advisory（GHSA-wpqr-6v78-jr5g・CVE 未付与）。Codex には CVE が無い。
- **深刻度**: 評価する主体で分かれる。CVE-2026-12537 は CNA の Google Cloud の v4 で 10.0（Critical）、NVD の一次評価は v3.1 で 7.8（High）。CVE-2026-54316 は GitHub Advisory の v4 で 6.0（Moderate）、NVD の一次評価は v3.1 で 9.1（Critical）。尺度が違うため、単一の数値では比べられない。
- **入口（Novee）**: 権限を持たない任意の GitHub ユーザーが立てる issue。エージェントが読む issue の本文・リポジトリに同梱されたファイル・取得先の内容。
- **Gemini CLI（Novee）**: コンテナ起動処理の OS コマンドインジェクションで、sandbox が立ち上がる前にホストの権限でコードが動き、同じ名前空間の親プロセスの環境変数から CI の秘密情報が読めた。許可リストの細かい指定は、解釈も強制もされていなかった。
- **Gemini CLI の許可リスト（Google の advisory）**: `--yolo` の下で細かい許可リストが無視されていたことを認め、0.39.1 でポリシーエンジンが `--yolo` の下でも許可リストを評価するよう直した。この advisory は、Novee の Elad Meged と Pillar Security の Dan Lisichkin を報告者として挙げている。
- **Claude Code（Novee）**: `anthropics/claude-code` に対して 3 ラウンドで別々の連鎖を通し、ワークフローの `ANTHROPIC_API_KEY` と `GITHUB_TOKEN` を持ち出した。コマンドの検証器、読み取り専用として登録されたコマンド、WebFetch でホスト名だけで事前承認された `huggingface.co` が、それぞれの段だった。
- **Codex（Novee）**: `openai/codex` のリポジトリで、1 つのジョブの中の 2 回の Codex の実行が同じチェックアウトを共有し、1 回目が書き換えた `AGENTS.md` を 2 回目が自分の指示として読み込んだ。
- **悪用の状況**: The Hacker News によれば、CISA の記録ではどちらの CVE も悪用「なし」で、2026-08-07 の時点で Known Exploited Vulnerabilities のカタログに載っていない。Claude Code の欠陥の再現用と称する公開リポジトリが 6 月 18 日から存在するが、標的に使われた形跡は確認されていない。

### 時系列

- **2026-04-24**: Google が Gemini CLI のフォルダの信頼とツールの許可リストに関する advisory（GHSA-wpqr-6v78-jr5g）を公開。修正は `@google/gemini-cli` 0.39.1 と `run-gemini-cli` 0.1.22 で、影響は「すべての Gemini CLI GitHub Actions に及ぶ」とされた。
- **2026-06-17**: Claude Code の欠陥（CVE-2026-54316 / GHSA-fg94-h982-f3mm）が GitHub Advisory Database に公開された。
- **2026-06-24**: Gemini CLI のコンテナ起動処理の欠陥（CVE-2026-12537 / GHSA-jj69-4grx-fqj5）が公開された。CNA は Google Cloud。
- **2026-08-05**: Novee が Black Hat USA で 3 社をまたぐ検証を公表。
- **2026-08-06**: Novee の創業エンジニアの Elad Meged が、自社のブログで詳細を公開。
- **2026-08-07**: The Hacker News が、CISA の記録上いずれの CVE も悪用「なし」であることを報じた。

> 本稿の事実は、Novee Security の公開、Google・Anthropic の advisory、GitHub Advisory Database と NVD の登録、The Hacker News の報道に拠る。連鎖の説明と経過のまとめは Novee の説明であり、実地の被害事案ではなく既定の構成に対する研究の実証である。本 Brief は、再現の手順を載せない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Google**: Gemini CLI の許可リストを 0.39.1 と `run-gemini-cli` 0.1.22 で直した。
- **Anthropic**: 3 ラウンドとも修正した。git push の明示的な許可リスト（と大半の Bash ツールの削除）、`display_report` の停止と出力のサニタイズ、`huggingface.co` の docs のパスへの限定。CVE-2026-54316 は最後の連鎖に付き、修正は 2.1.163（0.2.54 から 2.1.163 未満までが対象）に入っている。
- **OpenAI**: 製品版の修正は出ていない。リポジトリの側で 2 回の実行を別のジョブ・別のチェックアウトに分けて読み取り専用の環境へ移し、リポジトリに同梱された指示ファイルを「信頼できない入力面の一部」として扱うよう案内を更新した。自社の sandbox は文書どおりに振る舞ったとの立場である。
- **共通の緩和**: 外部のユーザーが起動できるワークフローの棚卸し、別々のエージェントに書き込めるディレクトリを共有させないこと、トークンをタスクごとに必要な権限へ絞ること。
- **Novee**: 経過を「3 ラウンド。修正のたびに的が絞られ、攻撃のたびに静かになった」とまとめている。

## 6. Sources

- **Novee Security（研究一次）**: Elad Meged「Black Hat 2026: If You Run These Automations, You're Exposed Too: Critical Flaws in Anthropic, Google, and OpenAI's Coding Agents」（2026-08-06 公開、Black Hat USA 2026-08-05 で発表）— <https://novee.security/blog/critical-flaws-in-anthropic-google-and-openais-coding-agents/>
- **GitHub Advisory Database（一次・公式発表）**: CVE-2026-12537 / GHSA-jj69-4grx-fqj5（CNA: Google Cloud、2026-06-24）— <https://github.com/advisories/GHSA-jj69-4grx-fqj5>
- **Google（一次・公式発表）**: Gemini CLI のフォルダ信頼とツール許可リストに関する advisory GHSA-wpqr-6v78-jr5g（2026-04-24、CVE 未付与）— <https://github.com/google-github-actions/run-gemini-cli/security/advisories/GHSA-wpqr-6v78-jr5g>
- **Anthropic（一次・公式発表）**: Claude Code security advisory GHSA-fg94-h982-f3mm（2026-06-17）— <https://github.com/anthropics/claude-code/security/advisories/GHSA-fg94-h982-f3mm>
- **NVD（一次・公式発表）**: CVE-2026-54316（NVD 一次評価 v3.1 9.1、GitHub Advisory の v4 評価 6.0 を併記）— <https://nvd.nist.gov/vuln/detail/CVE-2026-54316>
- **The Hacker News（独立報道）**: Swati Khandelwal「Claude Code and Gemini CLI Flaws Let a GitHub Issue Reach CI Workflow Secrets」（2026-08-07）— <https://thehackernews.com/2026/08/claude-code-and-gemini-cli-flaws-let.html>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
