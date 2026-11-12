---
brief_no: 205
title: "Claude Code：承認したコマンドを秘密情報ごと保存した設定ファイルが公開リポジトリに push され、パスワードや API キーが公開の GitHub に出ていた(Apiiro の調査)"
title_en: "Claude Code: settings files that saved approved commands, secrets included, were pushed to public repositories, leaving passwords and API keys on public GitHub (Apiiro research)"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth]
incident_date: 2026-11-05
published: 2026-11-12
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["037-agent-config-auto-execution", "027-librechat-mcp-url-secrets", "062-claude-code-github-action-bot-trust"]
fact_check:
  by: "muse-spark-1.3×7 + GLM-5.3"
  at: 2026-11-12
  rev: "62b7693467b82e0d"
  ref: "https://github.com/lemmaoracle/lemma/pull/1162"
status: draft
version: "1.0"
og_lead_ja: "Claude Code で「今後は聞かない」と承認したコマンドが秘密情報ごと設定ファイルに保存され、公開の GitHub で 1,122 ファイルに 1,379 件の秘密情報が見つかったと Apiiro が報告"
og_lead_en: "Commands approved with \"don't ask again\" in Claude Code were saved with their secrets; Apiiro reports 1,379 secrets in 1,122 settings files on public GitHub"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "情報の公開の事例 · AI ツールの設定ファイル"
og_kicker_en: "EXPOSURE · AI TOOL SETTINGS"
og_headline_ja: "承認したコマンドが\n秘密情報ごと保存され\n公開の GitHub へ。\n<accent>1,122 ファイルと報告</accent>"
og_headline_en: "Approved commands saved\nwith their secrets went\nto public GitHub.\n<accent>1,122 files, Apiiro reports.</accent>"
key_figures:
  - value: "1,122"
    unit: "ファイル"
    label: "公開の GitHub にあった .claude/settings.local.json 104,185 個のうち、本物の秘密情報を含んでいたもの（約 1.1%・Apiiro）"
    tone: "alert"
  - value: "1,379"
    unit: "件"
    label: "その 1,122 ファイルにあった異なる秘密情報の数（データベースのパスワード 379・SSH のログイン 43・AWS の鍵 23 など・Apiiro）"
  - value: "2,539"
    unit: "件"
    label: "git の履歴・共有の設定ファイル・会話の記録まで広げたときの秘密情報の数（1,994 リポジトリ・Apiiro）"
glossary:
  - term: "許可の規則"
    desc: "AI のコーディングツールが、次からは聞かずに実行してよい操作として保存する一行。Claude Code では、承認したコマンドの文がそのまま規則になる。"
  - term: "global の git excludes"
    desc: "その機械の git が、どのリポジトリでも追跡しないファイルの一覧。リポジトリの .gitignore と違い、リポジトリと一緒には動かない。"
insight:
  slug: "local-ignore-not-publish-check"
  stop: true
  label: "手元の除外は、公開の照合にならない"
  quote: "公開のリポジトリへ push する前に、含まれるファイルを、手元の除外の設定ではなく、リポジトリの持ち主が決めた公開してよいファイルの一覧で照合する。"
industries: ["developers", "ai"]
operations: ["disclosure", "account-admin"]
controls:
  - slug: "minimize-data"
    item: "コマンドに秘密情報を直接書かず、保管庫の参照や環境から渡し、許可の規則に秘密情報が残らない形にする"
  - slug: "hold-unverified"
    item: "公開のリポジトリへの push は、公開してよいファイルの一覧に無いファイルを含むとき、公開の前に保留する"
  - slug: "limit-and-revoke"
    item: "設定ファイルや履歴に一度でも出た秘密情報は、ファイルを消す前に失効させて発行し直す"
  - slug: "audit-trail"
    item: "どの push で、どのファイルが、一覧のどれに当たって公開されたかを、リポジトリとは別に残す"
attack_method: "human-error"
impact: "公開の GitHub にあった Claude Code の設定ファイル 104,185 個のうち 1,122 個に、1,379 件の秘密情報が含まれていた（Apiiro）。資格情報が使えるかは試されていない"
takeaway: "Claude Code で承認したコマンドが秘密情報ごと設定ファイルに保存され、そのファイルが公開リポジトリに push されていた。手元の除外の設定は、リポジトリと一緒に動かない。公開の前に、含まれるファイルを持ち主の公開の一覧と照合する。"
self_check: "AI のコーディングツールが手元に保存する許可の規則や設定に、秘密情報が書き込まれていないかを把握しているか。"
countries: ["global"]
---

## 1. 要点

Anthropic の AI コーディングツール Claude Code では、シェルのコマンドの承認で「Yes, and don't ask again」を選ぶと、そのコマンドの文がそのまま許可の規則として、プロジェクトの .claude/settings.local.json に保存される。Apiiro の調査によれば、コマンドに含まれていたパスワードや API キーも一緒に保存され、そのファイルが公開リポジトリに push されていた。公開の GitHub にあったこのファイル 104,185 個（103,617 リポジトリ）のうち、1,122 個に本物の秘密情報が 1,379 件あった。

Claude Code は、git リポジトリの中でこのファイルを初めて書くとき、利用者の global の git excludes に足す。Apiiro によれば、後から git のリポジトリになったフォルダ、別の機械の clone、すでに追跡されているファイルは、この除外では守られない。秘密情報のあるファイルは、2026 年 11 月 2 日の時点ですべて既定のブランチにあり、最初の commit は中央値で 217 日前だった。Apiiro は資格情報を試しておらず、知らせた組織のうち 1 社が鍵は有効だったと認めた。

<strong>一度の手間を省くつもりで保存された記録も、ファイルとしては、ほかのファイルと同じ経路で外へ出る。</strong>

## 2. 通った操作

- **通った操作**: 公開のリポジトリへの push。Apiiro によれば、許可の規則を保存した .claude/settings.local.json が、ほかのファイルと一緒に commit され、公開の GitHub に push された。秘密情報のあるファイルを持つ 1,105 のリポジトリを追うと、539 では、Claude が共著者として記された commit がこのファイルを変えていた。Apiiro は、誰も鍵を公開するつもりは無かったとしている。
- **受け付けた側に届くもの**: 一般に、リポジトリのホストには、commit されたファイルとその中身だけが届く。そのファイルが、利用者が手元に置くつもりだったものか、チームで共有するためのものかは届かない。手元の global の git excludes は、その機械の git にしか効かず、リポジトリと一緒には動かない。
- **公表されていないこと**: 個々のリポジトリで、ファイルがどの経路で追跡されるようになったか（手で作ったのか、除外が効かない場面だったのか）。Claude が共著の commit で、ファイルを足したのが利用者の指示か、エージェントの判断か。見つかった秘密情報のうち、いまも使えるものの数と、使われたかどうか（Apiiro は試していない）。

## 3. 実行前の照合

経路を問わず区別できる条件は、公開のリポジトリへ push する前に、含まれるファイルが公開してよいものかを、手元の除外の設定とは別に、リポジトリの持ち主が決めた一覧で照合することである。

- **誰が承認を出すか**: リポジトリの持ち主（組織のリポジトリの管理者）。どのファイルを公開してよいかの一覧を決め、AI ツールの手元の設定（.claude/settings.local.json など）や会話の記録は、一覧に無いものとして扱う。
- **どこで照合するか**: 公開のリポジトリに push を受け入れる手順。一覧に無いファイルや、秘密情報の形式に当たる中身を含む push は、公開の前に保留する。その手前のもう一つの場所は、承認したコマンドを許可の規則として保存する手順で、規則の文に秘密情報が含まれるなら、そのまま保存しない。
- **何が残るか**: どの push で、どのファイルが、一覧のどれに当たって公開されたか、または保留されたかの記録。リポジトリとは別に残し、秘密情報が出たときに、いつから公開されていたかを確かめられる形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝公開のリポジトリへ push する前に、含まれるファイルを持ち主の公開の一覧で照合し、記録に残すこと。検知＝公開された秘密情報を見つけ、持ち主に知らせること。日付は Apiiro の報告と GitHub の issue に拠り、公表日は iTWire に拠る。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>push の前に、ファイルを持ち主の公開の一覧で照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>1,122 ファイルに 1,379 件の秘密情報<br>最初の commit は中央値で 217 日前</span></div>
<div class="rx-zone det"><b>検知 · 研究者の調査で働いた</b>Apiiro が公開の GitHub を調べ、各組織と Anthropic に知らせる</div>
<div class="rx-g g1"><div class="t">2025-08</div><b>同じ問題の issue が立つ</b></div>
<div class="rx-g g2"><div class="t">11-01〜03</div><b>Apiiro が公開の GitHub を調べる</b></div>
<div class="rx-g g3"><div class="t">11-02〜03</div><b>Apiiro が各組織に知らせる</b></div>
<div class="rx-g g4"><div class="t">11-05</div><b>Apiiro が報告を公表する（iTWire）</b></div>
</div>
</figure>

秘密情報は、研究者が調べるまで、中央値で 217 日、既定のブランチに置かれていた。リポジトリに同梱された AI エージェントの設定ファイルが、確かめられないまま実行された事案に [Miasma](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/) がある。利用者が指定した URL からサーバーの秘密情報が外へ出た事案に [LibreChat](https://lemma.frame00.com/ja/critical/briefs/027-librechat-mcp-url-secrets/)、Claude Code の GitHub の連携が起動者の名前を信頼した研究に [Claude Code GitHub Action](https://lemma.frame00.com/ja/critical/briefs/062-claude-code-github-action-bot-trust/) がある。今回は、攻撃ではなく、AI ツールが保存した手元の記録が、公開の手順でそのまま外へ出た。

## 4. Lemma でできること

**Lemma は、実行前の照合を、公開のリポジトリが push を受け入れる側に組み込む。** 公開された秘密情報を見つけるのではなく、含まれるファイルが公開してよいものかを、公開の前に照合する。

### 注意したい業界・業務

- **業界 · 開発者・エージェント運用**: AI のコーディングツールに、データベースの確認や API の呼び出しを任せる開発の現場。承認の手間を省く設定が、手元のファイルに残る。
- **業界 · AI導入（業種横断）**: 受託の開発会社やスタートアップなど、AI ツールで作ったリポジトリを公開したり、顧客に渡したりする組織。Apiiro は、影響のある組織を 63 とし、多くは個人の開発者だったとしている。
- **業務 · 情報の開示・提供**: リポジトリの公開・fork・パッケージの公開。
- **業務 · アカウント・権限の管理**: データベースのパスワード・クラウドの鍵・公開用のトークンの発行と失効。

### いまの対策と Lemma の違い

今回の経路は 1 列目（手元の設定ファイルの push）である。2 列目は、共有の .claude/settings.json や会話の記録に秘密情報が入って push される場合で、Apiiro の広げた数（2,539 件）に含まれる。3 列目は、公開された鍵が第三者に使われる場合で、今回そうだったという公表は無い。

| 対策 | 手元の設定ファイルの push | 共有の設定ファイル・会話の記録の push | 公開された鍵の利用 |
| --- | --- | --- | --- |
| global の git excludes（初めて書くときに足す） | 一部 | 効かない | 効かない |
| 秘密情報の検査ツール（push の前後） | 一部 | 一部 | 効かない |
| 鍵の期限と範囲の制限 | 効かない | 効かない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 | 効かない |

global の git excludes は、その機械で作ったファイルを守るが、すでに追跡されたファイルや別の機械の clone には効かない。秘密情報の検査ツールは、Apiiro の標本で 1,122 ファイルのうち gitleaks が 564、TruffleHog が 643 を拾い、215 はどちらも拾わなかった（コマンドの中のパスワードが拾われにくい）。鍵の期限と範囲の制限は、公開された後の被害を絞るが、公開そのものは止めない。Lemma は、中身の形式ではなく、ファイルが持ち主の公開の一覧にあるかを、公開の前に照合する。

注：Lemma の照合が働くのは、公開のリポジトリが push を受け入れる手順に照合を組み込み、公開してよいファイルの一覧を、開発者の手元の設定とは別に持ち主が管理する場合に限る。共有の設定ファイルのように、公開の一覧にあるファイルに秘密情報が書き込まれた場合は、中身の検査が無ければ通りうる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではなく、公開された鍵を失効させるものでもない。

### 点検チェックリスト

AI のコーディングツールを使うリポジトリについて、組織で確認する 3 項目

- 公開しているリポジトリの git の履歴と fork まで、AI ツールの設定ファイルと会話の記録が含まれていないかを確認しているか。
- 設定ファイルや履歴に出た秘密情報を、ファイルを消す前に失効させて発行し直す手順があるか。
- 秘密情報の検査で、コマンドの中に書かれたパスワードも拾えることを確かめているか。

## 5. 事実と時系列

- **当事者**: Claude Code の提供元の Anthropic（米国）と、Claude Code を使う開発者・組織。調べたのはアプリケーションのセキュリティの会社 Apiiro で、本 Brief は Apiiro の報告に拠る。
- **起きたこと**: Apiiro によれば、Claude Code にデータベースの確認や API の呼び出しを頼むと、提案するコマンドに秘密情報が入ることがある。「Yes, and don't ask again」を選ぶと、そのコマンドの文が秘密情報ごと許可の規則として .claude/settings.local.json に保存される。Anthropic の文書も、この承認が allow の規則として保存されると記している。Apiiro は、これをモデルではなく Claude Code の動きとし、16 のコーディングエージェントのうち、承認したコマンドの全文を既定でプロジェクトのファイルに書くと確認できたのは Claude Code だけだったとしている。
- **除外の仕組み**: Anthropic の文書によれば、Claude Code は git リポジトリの中でこのファイルを初めて書くとき、まだ無視されていなければ global の git excludes に足す。手でファイルを作った場合は、自分で .gitignore に足すよう求めている。Apiiro によれば、後から git のリポジトリになったフォルダ、別の機械の clone、すでに commit されたファイルは守られず、追跡されているファイルにはその後の承認も書き足される。
- **調べた範囲と数**: Apiiro は 2026 年 11 月 1〜3 日に、GitHub のコード検索と commit 検索で公開のリポジトリを読んだ。.claude/settings.local.json は 104,185 個（103,617 リポジトリ）あり、1,122 個（約 1.1%）に本物の秘密情報があった。異なる値は 1,379 件（提供元の形式の鍵 636・公開されたホストのパスワードやトークン 743）で、データベースのパスワード 379、SSH のログイン 43、GitHub・GitLab・npm のトークン 42、AWS の鍵 23 などを含む。211 の fork（74 リポジトリ）が同じ秘密情報を持ち、過去の版には今の写しに無い秘密情報が 734 件（509 リポジトリ）あった。git の履歴・共有の .claude/settings.json・会話の記録まで含めると、1,994 リポジトリで 2,539 件だった。
- **調べ方と限界**: Apiiro は資格情報を使っておらず、試してもいない。「本物の秘密情報」は、提供元の鍵の形式に合うか公開されたホストを指すもので、有効と確かめたものではない。2,774 の値を、規則と、それとは別の LLM のレビューで分け、両方が当たったものだけを数えた。影響のある組織は 63 で、1 社が鍵は有効だったと認めた。

### 時系列

- **2025-08-11**: 承認したコマンドの資格情報が settings.local.json に平文のまま保存されるとする issue（#5544）が、anthropics/claude-code に立つ。
- **2026-01-03**: #5544 が、60 日の無活動で bot によって閉じられる。
- **2026-11-01〜03**: Apiiro が公開の GitHub を調べる。
- **2026-11-02〜03**: Apiiro が影響のある各組織に知らせる。公表の前に Anthropic にも共有する。
- **2026-11-05**: Apiiro が報告を公表する（iTWire に拠る）。
- **2026-11-07**: Anthropic の Claude Code の責任者が Hacker News で応答する（Apiiro に拠る）。
- **2026-11-08**: Apiiro が報告に追記する。

> 本件の事実は、Apiiro の報告（研究の公表・一次）と、Anthropic の Claude Code の文書と GitHub の issue（一次）に拠る。Apiiro の報告のページには公表日が記されておらず、日付は iTWire の報道に拠る。数のうち 1,122 ファイル・1,379 件は現在の .claude/settings.local.json の写しの数で、2,539 件・1,994 リポジトリは履歴・共有の設定ファイル・会話の記録まで広げた数である。秘密情報がいまも使えるか、第三者に使われたかは公表されていない。Claude が共著の commit がファイルを変えていたこと（1,105 リポジトリのうち 539）は、Claude Code がすべての秘密情報を公開したことを示すものではない。公表されていないことは、対策が無かったことを意味しない。本 Brief は、提供元と利用者の対応を評価するものではない。11 月 12 日時点の記述。

### 公表後の対応

- **Anthropic**: Apiiro によれば、Claude Code の責任者は 11 月 7 日に Hacker News で、秘密情報の除去はこれまでしてこなかったが、防ぐために何ができるかを調べているとし、auto mode で拾うことや、基本的な秘密情報の検査を試すとした。ファイルは作るときに git の除外に入れるので、公開された写しは手で作って追跡されたものとみているとし、auto mode とホストの secret scanning を勧めた。
- **GitHub の issue**: Apiiro によれば、同じ問題の issue は 2025 年 8 月から 4 件あり、返答は無く、3 件は自動で閉じられた。
- **Apiiro**: 秘密情報を、ファイルを消す前に失効させて発行し直すこと、リポジトリと git の履歴で 2 つの設定ファイルを探すこと、手元の設定ファイルを追跡から外してリポジトリの .gitignore に足すこと、コマンドに秘密情報を直接書かないことを勧めている。

## 6. Sources

- **Apiiro（一次・研究の報告）**: "Coding Agents Are Leaking Your Secrets to GitHub"（2026-11・11-08 追記） — <https://apiiro.com/blog/coding-agents-leaking-secrets-github-dont-ask-again>
- **Anthropic（一次・製品の文書）**: "Settings files and precedence"（Claude Code Docs） — <https://code.claude.com/docs/en/settings>
- **anthropics/claude-code（一次・GitHub の issue）**: "[BUG] approved bash commands containing credentials are stored as is with plain text credentials in settings.local.json" #5544（2025-08-11） — <https://github.com/anthropics/claude-code/issues/5544>
- **iTWire（報道）**: "Claude Code approval files found exposing company secrets on GitHub, says Apirro researchers"（2026-11-07） — <https://itwire.com/business-it-news/security/claude-code-approval-files-found-exposing-company-secrets-on-github-says-apirro-researchers>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
