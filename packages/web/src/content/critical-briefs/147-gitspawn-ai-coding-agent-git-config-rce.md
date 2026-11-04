---
brief_no: 147
title: "GitSpawn：フォルダを開いただけで、主要な AI コーディングエージェントが攻撃者のコードを実行していた(Manifold Security の調査)"
title_en: "GitSpawn: Just opening a folder made major AI coding agents run an attacker's code (Manifold Security research)"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [code-provenance]
incident_date: 2026-09-01
published: 2026-09-15
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["139-agent-framework-trust-boundary-checkpoint"]
status: published
gate: "agent-operation"
version: "1.0"
og_lead_ja: "GitSpawn：AIコーディングエージェント7種、git設定でコード実行"
og_lead_en: "GitSpawn: seven AI coding agents run code via git config"
layout: "report"
sections: "proof"
og_kicker_ja: "AI エージェントの脆弱性 · フォルダを開くだけで実行"
og_kicker_en: "AI AGENT FLAW · CODE RUNS ON OPEN"
og_headline_ja: "フォルダを開いただけで、\nAI エージェントが攻撃者のコードを動かした。\n<accent>調べた 7 種すべてで</accent>"
og_headline_en: "Just opening a folder\nmade AI coding agents run an attacker's code.\n<accent>All seven tested.</accent>"
key_figures:
  - value: "7 / 7"
    label: "調べた AI コーディングエージェントのうち、リポジトリを開いただけでコードが実行されたもの（Manifold Security）"
    tone: "alert"
  - value: "4 / 8"
    label: "公開の時点で、修正されていなかった脆弱性（Manifold Security）"
  - value: "承認の前"
    label: "実行は、利用者がワークスペースの信頼を承認するより前に、サンドボックスの外で起きた（Manifold Security）"
glossary:
  - term: "core.fsmonitor"
    desc: "git の正規の設定。大きなリポジトリで差分の確認を速くするためのもので、git はこれをリポジトリ自身の .git/config から読み込み、書かれたコマンドを実行する。"
  - term: "ワークスペースの信頼"
    desc: "開いたフォルダのコードや設定を実行してよいかを、利用者に尋ねる確認。今回の実行は、これより前に終わっていた。"
insight:
  slug: "run-before-approval"
  label: "承認の前に実行された設定"
  quote: "外から持ち込まれた設定は、実行する側が、実行の前に出どころと許す範囲を照合しなければ、ふつうの操作の中で通る。"
industries: ["developers"]
controls:
  - slug: "check-origin"
    item: "リポジトリの設定やコードは、エージェントが読み込む前に、検証済みの発行元に由来するか確認する"
  - slug: "limit-and-revoke"
    item: "エージェントが起動時に行う処理は、信頼してよい設定値の範囲を区切って実行する"
  - slug: "hold-unverified"
    item: "出どころが確認できないリポジトリ内の設定は、実行前に既定で無効にする"
attack_method: "ai-misuse"
impact: "7 種の AI コーディングエージェントでコードが実行された"
takeaway: "エージェントが起動時に行う git 操作が、リポジトリ自身の設定を、利用者の承認より前に実行した。"
self_check: "AI コーディングエージェントが、開いたフォルダの設定を実行する前に、出どころと許す範囲を照合しているか。"
countries: ["global"]
---

## 1. 要点

AI コーディングエージェントは、起動時に、リポジトリ自身の設定に書かれたコマンドを、利用者が信頼を承認するより前に、サンドボックスの外で実行した。エージェントが現在のブランチや変更されたファイルを把握するために出す git の通常の操作（`git status` など）が、リポジトリの `.git/config` にある `core.fsmonitor` の値を読み込み、そこに書かれたコマンドを実行するためである。<strong>外から持ち込まれた設定は、実行する側が、実行の前に出どころと許す範囲を照合しなければ、ふつうの操作の中で通る。</strong>

## 2. 通った操作

- **通った操作**: リポジトリ自身の `.git/config` の `core.fsmonitor` に書かれたコマンドの実行。エージェントが起動時、あるいは最初のやり取りより前に出す `git status` や `git diff` を通じて、git が設定を読み込んで実行した（Manifold Security）。
- **止まった操作**: 無い。承認の仕組みは存在したが、それが働く前に実行が終わっていた（Manifold Security）。
- **受け付けた側に届くもの**: 一般に、git は、リポジトリの `.git/config` にある設定を、出どころを確認せずに読み込む。エージェントが git を裏側で呼び出す処理（サブプロセス）は、エージェント自身の権限管理が働く前に終わる。
- **届け方**: `git clone` では設定ファイルは運ばれないため、zip ファイル、共有ドライブ、同期フォルダ、USB メモリなど、ディレクトリごと渡す経路が使われる（Manifold Security）。
- **実行の結果として届くもの**: コマンドは、ユーザーの権限のまま、承認プロンプトも画面表示もなく実行される。SSH 鍵、環境変数のクラウド認証情報、シェル設定のトークン、ディスク上の全リポジトリ、端末への足がかりに届く（Manifold Security）。
- **公表されていないこと**: Claude Code の `ultrareview` 経路が使う設定キーの名前（Manifold は悪用を避けるため非公開）。Grok Build と、Claude Code の `ultrareview` 経路の修正は、本稿執筆時点で確認できていない。

## 3. 実行前の照合

経路を問わず区別できる条件は、エージェントが、リポジトリなど外から持ち込まれた設定やコードを実行する前に、それが検証済みの発行元に由来するか、実行を許す範囲に収まるかを、エージェントの外で照合することである。

- **誰が承認を出すか**: 検証済みの発行元と、実行を許す範囲を決める利用者・組織。承認は、ワークスペースの信頼の承認とは別に、設定やコードの出どころに対して出す。
- **どこで照合するか**: エージェントがサブプロセスを起動する前。出どころが確認できないリポジトリ内の設定は、既定で無効にして、確認できるまで保留にする。
- **何が残るか**: どの設定を、どの発行元の確認で、いつ実行した（または止めた）かの記録。エージェントの外に残し、後から第三者に示せる形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝エージェントが設定やコードを実行する前に、出どころと許す範囲を、エージェントの外で照合し、記録に残すこと。検知＝実行の後に、研究者の再現と報告で見つかること。日付は、各社が確認・公表した日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>設定を実行する前に、出どころと許す範囲を、エージェントの外で照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>7 種すべてでコードが実行された<br>公開時点で 8 件のうち 4 件が未修正</span></div>
<div class="rx-zone det"><b>検知 · 研究者が見つけた</b>8 件を再現手順つきで示した</div>
<div class="rx-g g1"><div class="t">2026-06-26</div><b>最初の報告（Claude Code）</b></div>
<div class="rx-g g2"><div class="t">2026-07-20</div><b>最後の報告（Codex・Hermes Agent）</b></div>
<div class="rx-g g3"><div class="t">2026-09-01</div><b>研究結果を公開</b></div>
<div class="rx-g g4"><div class="t">2026-09-12</div><b>Qwen Code が修正を取り込む</b></div>
</div>
</figure>

8 件すべてが再現手順つきで示され、2 件に CVE が付き、5 件は重複して報告されていた。見つかったのは実行の後で、実行の前の照合ではない。同じ形は、エージェントのフレームワーク 6 種で 11 件の脆弱性が開示された [Brief 139](https://lemma.frame00.com/ja/critical/briefs/139-agent-framework-trust-boundary-checkpoint/) にもある。外から入ってきた内容が、信頼された内部の処理へ渡る前に照合されていない。今回は、内容が設定ファイルで、内部の処理がサブプロセスの起動である。

## 4. Lemma でできること

**Lemma は、03 の照合を、エージェントがリポジトリの設定やコードを実行する前に置く。** エージェントを止めるのではなく、その設定が検証済みの発行元に由来するか、実行を許す範囲に収まるかを、実行の前に、エージェントの外で照合する。

### 注意したい業界・業務

- **業界 · 開発者・ソフトウェア**: AI コーディングエージェントで、外から受け取ったフォルダ（zip、共有ドライブ、同期フォルダ、USB メモリ）を開く開発者と組織。

### いまの対策と Lemma の違い

今回の経路は、エージェントが起動時に行う git 操作を通じた、リポジトリ設定の実行である。

| 対策 | 起動時の git 操作を通じた設定の実行 |
| --- | --- |
| ワークスペースの信頼の承認 | 効かない |
| サンドボックス | 効かない |
| 端末の挙動の検知（EDR・スキャナー） | 一部 |
| ベンダーの修正（git 呼び出しが設定指定のプログラムを実行しない） | 一部 |
| **Lemma（実行の前の照合）** | 効く |

ワークスペースの信頼の承認は、実行がそれより前に終わっていた。サンドボックスは、実行がその外側で起きた。端末の挙動の検知は、見慣れた開発ツールが見慣れた動作をしているとしか見えず、既知のパターンとして検出するまでに時間がかかる実行の後の層である。ベンダーの修正は、Goose、Cursor、OpenAI Codex が公開時点で修正済み、Hermes Agent と Qwen Code は公開後に取り込まれた一方、Grok Build と Claude Code の `ultrareview` 経路は修正を確認できていない。Lemma は、実行の前に、設定の出どころと許す範囲を、エージェントの外で照合する。実行の記録も残るので、どの設定を、どの発行元の確認で実行したかを、あとから確認できる。

注：Lemma の照合が働くのは、エージェントが設定やコードを読み込む処理に照合を組み込み、発行元の確認と許す範囲が、エージェントの外で管理されている場合に限る。正規の機能（`core.fsmonitor`）として書かれた設定が、許す範囲に収まる場合は、通りうる。git 自体の実装は変えず、各ベンダーの修正の判断・公開は、それぞれの責任である。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI コーディングエージェントを使う組織で確認する 3 項目

- 外から受け取ったリポジトリの設定やコードを、エージェントが読み込む前に、検証済みの発行元に由来するか確認しているか。
- エージェントが起動時に行う処理を、信頼してよい設定値の範囲に区切っているか。
- 出どころが確認できないリポジトリ内の設定を、実行前に既定で無効にしているか。

## 5. 事実と時系列

- **対象**: Claude Code、OpenAI Codex(CLI/Desktop)、Cursor、Goose、Qwen Code、Grok Build、Hermes Agent という主要な AI コーディングエージェント 7 種。5 製品だけで GitHub スター数は合計およそ 50 万（Hermes Agent 237,000 超、Claude Code 143,000 超、Goose 54,000 超、Qwen Code 27,000 超、Grok Build 26,000）、Claude Code は月 7,700 万件超の npm ダウンロードがある。
- **発見者**: Manifold Security（攻撃的セキュリティ研究者 Francisco Rosales）。2026 年 9 月 1 日に技術ブログで研究結果を公開。
- **見つかった脆弱性**: 8 件。CVE（公開の脆弱性データベースに登録される共通識別番号）が付与されたのは 2 件（Goose: CVE-2026-72718、CVSS（脆弱性の深刻度を 0〜10 で表す指標）7.0／Hermes Agent: CVE-2026-71963、独立採番機関 VulnCheck による付番）。OpenAI は同日、Codex について 4 件の CVE（CVE-2026-19590/19591/19592/19593）を公表した。うちリポジトリ設定由来の実行シンクは 3 件（19590 は Git フック、19592 は `core.fsmonitor`、19593 は差分フィルタ）で、19591 は別クラス。The Hacker News によれば 3 組の無関係な研究者からの報告だという。
- **公開時点で未修正**: Hermes Agent、Qwen Code、Grok Build、Claude Code の `ultrareview` 経路（`core.fsmonitor` とは別の設定キーを使う。悪用防止のため Manifold は当該キー名を公開していない）の 4 件。このうち Hermes Agent は 2026 年 9 月 2 日、Qwen Code は 9 月 12 日に修正が取り込まれた（下記時系列）。
- **実行の流れ（Manifold Security）**: ① 攻撃者が、`.git/config` を含んだ状態のリポジトリを用意し、`core.fsmonitor`（またはそれに類する設定キー）に任意のコマンドを仕込む。② 被害者がそのフォルダを AI コーディングエージェントで開く。③ エージェントが起動時、あるいは最初のやり取りより前に、`git status` や `git diff` といった通常のコマンドをバックグラウンドで実行する。④ git がそのコマンドの実行前にインデックスを更新する際、リポジトリの `.git/config` にある `core.fsmonitor` の値を読み込み、そこに書かれたコマンドを実行する。⑤ コマンドはサンドボックスの外側で、ユーザーの権限のまま、承認プロンプトも画面表示もなく実行される。
- **原因についての Manifold の見方**: 脆弱性はモデルにも新しい攻撃技術にもなく、エージェントがセッション開始時に立ち上げるサブプロセスという、ありふれた仕組みの中にある、としている。`core.fsmonitor` は git の正規の機能であり、バグではない。

### 時系列

- 2026-06-26: Manifold、Claude Codeの`core.fsmonitor`経路を報告。同日に他の研究者から提出された報告と重複と判定される
- 2026-06-29: Claude Codeの`core.fsmonitor`経路がバージョン2.1.196で修正される(Anthropicは個別のアドバイザリを公開せず)
- 2026-07-07: Manifold、Qwen Codeの脆弱性をAlibaba security response centreへ報告。受理される
- 2026-07-08: Manifold、Cursorの脆弱性を報告。別研究者の先行報告との重複と判定される(のちに修正済み)
- 2026-07-13: Manifold、Gooseの脆弱性を報告
- 2026-07-14: Manifold、Grok Buildの脆弱性を報告。7月1日付の別研究者による報告(xAIは当時「情報提供」としてクローズ)と重複と判定される
- 2026-07-15: Manifold、Claude Codeの`ultrareview`経路を報告。社内チケットとの重複と判定される
- 2026-07-20: Manifold、OpenAI Codexの脆弱性を報告。重複と判定される(のちに修正済み)
- 2026-07-20: Manifold、Hermes Agentの脆弱性を報告。5つの連絡経路で6回接触を試みるも、一次審査(トリアージ)がされないまま
- 2026-09-01: Manifold、全8件を最新版で再検証したうえで研究結果「GitSpawn」を公開。Goose(1.44.0)とCursorは修正済み、OpenAI Codexは同日4件のCVE(CVE-2026-19590〜19593)を公表・修正済み。Hermes Agent(0.21.0)、Qwen Code(0.22.3)、Grok Build(1.0.13)、Claude Codeの`ultrareview`経路(2.1.252)は未修正のまま再確認された
- 2026-09-02: The Hacker Newsが報道。同日、Hermes Agentが修正を取り込む(commit f6234d0)
- 2026-09-03: CVE-2026-71963が公開される。GitHub Security Advisory(GHSA-cc88-9pxf-j2wv)は対象を0.18.2〜0.21.0とし、commit f6234d0で修正と記録している
- 2026-09-12: Qwen Codeが修正を取り込む(エージェント自身が出すgit呼び出しが、設定で指定されたプログラムを実行しないようにする変更)。9月14日のv0.23.4で出荷

> 本件の事実は、Manifold Security の公表と、それを伝えた報道・脆弱性記録に拠る。8件のうち5件は重複扱いとなった(4件は他の研究者が独立に提出していた報告、1件は社内チケット。うち1件は同日提出)。複数の方向から同じ脆弱性クラスが見つかっていたことになる。公開時点で未修正の`ultrareview`経路については、Manifoldは悪用リスクを避けるため設定キー名を明かしていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Goose**: メンテナがGitHub経由でアドバイザリを公開し、CVE-2026-72718(CVSS 4.0で7.0、採番はGitHub)が付与され、1.44.0で修正した
- **Claude Code**: `core.fsmonitor`経路は2.1.196で修正されたが、個別のアドバイザリは公開されなかった。`ultrareview`経路は2.1.252時点で未修正と確認されている。Anthropicは過去にも起動前実行の問題を開示しており、2026年6月のCVE-2026-55607はワークツリー操作中のfsmonitor実行を扱う。セキュリティ企業Sonarも2026年4月に同一のシンク(`core.fsmonitor`)を報告し、当時は起動シーケンスの変更で緩和されたが、関連する挙動は残っていたとされる
- **OpenAI**: Codex CLI/Desktopについて3件のCVE(CVE-2026-19592含む)を同日公表し、修正済みとした。3組の無関係な研究者からの報告としている
- **Qwen Code**: Alibaba security response centreが2026年7月7日に受理したが、9月1日時点で未修正。その後9月12日に修正が取り込まれ、9月14日のv0.23.4で出荷された
- **Grok Build**: Manifold Security の公表では、xAIは7月1日の別研究者による報告を「情報提供」としてクローズし、Manifoldの7月14日報告もその重複としてクローズした。9月1日時点で未修正であり、本稿執筆時点でも修正を確認できていない
- **Hermes Agent**: Manifold Security の公表では、開発元へ5つの連絡経路で6回の接触を試みたが応答がなく、CVE-2026-71963は独立採番機関VulnCheckが付番。修正は9月2日に取り込まれ、CVEは9月3日に公開された(GHSA-cc88-9pxf-j2wv)

米CISAの既知悪用脆弱性カタログ(2026.09.14版、1,710件収録)にはこれら8件のいずれも掲載されておらず、実際の悪用は報告されていない。

## 6. Sources

- **Manifold Security(一次・独自調査)**: "GitSpawn: A Single Flaw Lets Untrusted Repos Run Code in Claude Code, Codex, Cursor, and Grok"(2026-09-01) — <https://www.manifold.security/blog/ai-coding-agents-git-hijack>
- **The Hacker News(独立報道)**: "Malicious .git Configs Can Make Claude, Codex, Cursor, and Other AI Agents Run Attacker Code"(2026-09-02、Swati Khandelwal) — <https://thehackernews.com/2026/09/malicious-git-configs-can-make-claude.html>
- **GitHub Security Advisories(一次・脆弱性記録)**: "GHSA-r5pp-p5r8-466r"(Goose、CVE-2026-72718) — <https://github.com/aaif-goose/goose/security/advisories/GHSA-r5pp-p5r8-466r>
- **CVE.org(一次・脆弱性記録)**: "CVE-2026-71963"(Hermes Agent、VulnCheck採番) — <https://www.cve.org/CVERecord?id=CVE-2026-71963>
- **GitHub Security Advisories(一次・脆弱性記録)**: "GHSA-cc88-9pxf-j2wv"(Hermes Agent、CVE-2026-71963、2026-09-03公開) — <https://github.com/advisories/GHSA-cc88-9pxf-j2wv>
- **GitHub Security Advisories(一次・脆弱性記録)**: "GHSA-26wp-42v3-96xp"(OpenAI Codex、CVE-2026-19592、2026-09-01公開) — <https://github.com/advisories/GHSA-26wp-42v3-96xp>
- **Sonar(独立解析)**: "Arbitrary code execution and Claude Code CLI: How Claude executed code before you click 'trust'"(2026-04-30、Yaniv Nizry。同一シンクの先行報告) — <https://www.sonarsource.com/blog/claude-arbitrary-code-execution/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)

修正状況は、Manifold Securityによる2026年9月1日時点の再検証を基点に、本稿執筆時点(2026年9月15日)の公開記録で更新している。Hermes AgentはGitHub Security Advisory、Qwen Codeは公開リポジトリの変更履歴が根拠。Grok BuildとClaude Codeの`ultrareview`経路については、ベンダー自身の公式アドバイザリも修正の記録も確認できていない。

