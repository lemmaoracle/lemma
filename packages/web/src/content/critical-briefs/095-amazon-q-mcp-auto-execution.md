---
brief_no: 95
title: "Amazon Q Developer：リポジトリを開いただけで、同梱の MCP 設定が起動し、AWS 認証情報が持ち出されえた(Wiz Research の報告)"
title_en: "Amazon Q Developer: opening a repo could auto-start its bundled MCP config and expose AWS credentials (Wiz Research report)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "code-provenance"]
incident_date: 2026-06-26
published: 2026-07-03
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["037-agent-config-auto-execution", "062-claude-code-github-action-bot-trust", "027-librechat-mcp-url-secrets", "059-vercel-contextai-oauth", "094-cursor-duneslide-sandbox-escape"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Wiz Research が Amazon Q Developer の VS Code 拡張の脆弱性（CVE-2026-12957）を報告し、言語サーバー 1.65.0 で修正された。リポジトリに同梱された MCP の設定が同意の確認なしに起動し、開発者の AWS の認証情報に届きえた"
og_lead_en: "Wiz Research reported a vulnerability in the Amazon Q Developer VS Code extension (CVE-2026-12957), fixed in language server 1.65.0, through which an MCP config bundled in a repository could start with no consent prompt and reach the developer's AWS credentials"
search_title: "Amazon Q の MCP 自動実行の脆弱性と対策"
search_description: "Wiz Research が報告した Amazon Q Developer の脆弱性（CVE-2026-12957）で、リポジトリ同梱の MCP 設定が同意なしに起動しえた。何が通り、実行の前に何を照合するかを整理。"
og_kicker_ja: "脆弱性の報告 · AI コーディング支援"
og_kicker_en: "VULNERABILITY · AI CODING TOOL"
og_headline_ja: "リポジトリを開くだけで\n同梱の MCP 設定が動くと\nWiz Research が報告。\n<accent>CVSS 8.5・1.65.0 で修正</accent>"
og_headline_en: "Opening a repo could run\nits bundled MCP config,\nWiz Research reports.\n<accent>CVSS 8.5, fixed in 1.65.0</accent>"
key_figures:
  - value: "8.5"
    label: "CVE-2026-12957 の、GitHub Security Advisory の CVSS 4.0。NVD の CVSS 3.1 では 7.8（High）"
    tone: "alert"
  - value: "2"
    unit: "つ"
    label: "Wiz Research が根本の原因として挙げた挙動の数。同意なしの自動の起動と、環境変数の丸ごとの受け渡し"
  - value: "1.65.0"
    label: "修正の入った言語サーバーの版。修正は 2026-05-12 に配信され、公開（2026-06-26）より先だった"
glossary:
  - term: "Amazon Q Developer"
    desc: "AWS の AI コーディング支援ツール。本件は Visual Studio Code の拡張の版が対象。"
  - term: "MCP"
    desc: "Model Context Protocol。AI 支援ツールが「MCP サーバー」と呼ぶローカルのプロセスを起動し、データベース・API・ビルドツールなどにつなぐための標準。サーバーの起動は、マシン上でコマンドを動かすことにあたる。"
  - term: "ワークスペースの信頼"
    desc: "VS Code の機能。信頼していないフォルダでは、そのフォルダの設定による実行を止める。"
  - term: "環境変数"
    desc: "プロセスに渡される設定の値。クラウドを扱う開発者では、AWS のアクセスキーやセッショントークン、API キーなどが入っていることが多い。"
insight:
  slug: "workspace-open-as-consent"
  label: "フォルダを開いたことが、起動の同意になる"
  quote: "リポジトリに同梱された設定でプロセスを起動する前に、その設定の出どころと起動の範囲を、「フォルダを開いた」こととは別に照合しない限り、設定ファイル一つが、開発者の認証情報を持ったままコマンドを動かしうる。"
industries: ["developers", "ai"]
controls:
  - slug: "hold-unverified"
    item: "リポジトリ同梱のMCP設定は、作者と範囲を確認するまで起動しない"
attack_method: "supply-chain"
takeaway: "Amazon Q Developer の拡張が、リポジトリに同梱された MCP の設定を、フォルダを開いたことだけで同意なしに起動し、開発者の環境変数を丸ごと渡していたと、Wiz Research が報告した。"
self_check: "AI コーディング支援がリポジトリの設定からプロセスを起動する前に、その設定の出どころと、渡す認証情報の範囲を照合できるか。"
countries: ["global"]
---

## 1. 要点

Wiz Research によれば、開発者が悪意あるリポジトリを Visual Studio Code で開き、Amazon Q Developer の拡張を有効にすると、リポジトリに同梱された `.amazonq/mcp.json` に書かれた MCP サーバーが、承認のダイアログもワークスペースの信頼の確認もなしに起動していた。起動したプロセスは開発者の環境変数を丸ごと受け継ぐため、AWS の認証情報に届きえた。AWS は言語サーバー 1.65.0 で修正し、起動の前に同意を求める形に変えた。実環境での悪用の報告は無く、研究としての開示である。<strong>リポジトリに同梱された設定でプロセスを起動する前に、その設定の出どころと起動の範囲を、「フォルダを開いた」こととは別に照合しない限り、設定ファイル一つが、開発者の認証情報を持ったままコマンドを動かしうる。</strong>

## 2. 通った操作

- **通った操作**: リポジトリに同梱された MCP の設定による、ローカルのプロセスの起動。Wiz Research によれば、拡張はフォルダを開いた直後にワークスペースの `.amazonq/mcp.json` を読み込み、書かれた MCP サーバーを起動していた。同意の確認も、信頼していないフォルダでの実行を止める確認も無かった。
- **受け付けた側に届くもの**: Wiz Research によれば、起動したプロセスは開発者の環境変数を丸ごと受け継いだ。クラウドを扱う開発者では、AWS の認証情報（アクセスキー・シークレット・セッショントークン）、クラウドの CLI のトークン、API キー、SSH エージェントのソケットが含まれることが多い。Wiz の概念実証では、仕込まれたコマンドが AWS のセッションの身元の情報を外部のサーバーへ送り、フォルダを開いて Amazon Q を有効にする以外の操作なしに、AWS のセッションが奪われうることを示した。Wiz は、クラウドへの居座りや、内部のサービスへの到達、本番の権限を持つ開発者を足がかりにした横の広がりにもつながりうるとしている。
- **公表されていないこと**: 影響を受けた利用者の数。修正の前に、実際にこの経路を使ったリポジトリがあったか（悪用の報告は無い）。

## 3. 実行前の照合

経路を問わず区別できる条件は、AI コーディング支援がリポジトリの設定からプロセスを起動する前に、その設定の出どころと起動の範囲、渡す認証情報の範囲を、「フォルダを開いた」こととは別に照合することである。

- **誰が承認を出すか**: AI コーディング支援を使う開発のチームと、開発の環境を管理する担当。起動してよい MCP の設定と、その配布元を、リポジトリの中身とは別に決める。決めた範囲の外の設定による起動は、人が承認する。
- **どこで照合するか**: 拡張が MCP サーバーを起動する直前。設定が決めた配布元のものか、起動と渡す環境が決めた範囲の中かを照合し、照合できない起動は行わない。フォルダを開いたことを、起動の承認として扱わない。
- **何が残るか**: どの設定から、どのプロセスを、どの環境（渡した認証情報）で起動したか（または止めたか）の記録。ツールとは別に、後から示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝MCP サーバーを起動する前に、設定の出どころと起動・渡す環境の範囲を照合し、記録に残すこと。検知＝脆弱性を見つけて報告し、修正すること。日付は報告・修正・公開の日で、経路が使われた日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>起動の前に、設定の出どころと渡す環境の範囲を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>同梱の設定が同意なしに起動し<br>認証情報に届きうる状態だった</span></div>
<div class="rx-zone det"><b>検知 · Wiz Research が報告し、AWS が修正した</b>脆弱性の報告・修正の配信・公開</div>
<div class="rx-g g1"><div class="t">04-20</div><b>Wiz が Amazon に報告</b></div>
<div class="rx-g g2"><div class="t">05-12</div><b>言語サーバーの修正を配信</b></div>
<div class="rx-g g3"><div class="t">06-23</div><b>CVE の番号が付く</b></div>
<div class="rx-g g4"><div class="t">06-26</div><b>Wiz が公開・AWS が速報</b></div>
</div>
</figure>

研究者の報告と修正の配信は働き、知られた経路は公開の前に塞がれていた。効かなかったのは、その手前で、同梱の設定による起動を、設定の出どころと起動の範囲と照合する層である。同梱の設定の自動の実行を横断して扱った [Brief 037](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)、`[bot]` を名乗る issue を信じてエージェントが特権で動いた [Claude Code GitHub Action の Brief 062](https://lemma.frame00.com/ja/critical/briefs/062-claude-code-github-action-bot-trust/) とは、入力の出どころが照合されないまま実行に結び付く点で、ユーザーが指定した MCP の URL からサーバーの秘密が漏れた [LibreChat の Brief 027](https://lemma.frame00.com/ja/critical/briefs/027-librechat-mcp-url-secrets/) とは、MCP の設定がそのまま実行になる点で、AI ツールに渡した広い OAuth の権限が侵入の経路になった [Brief 059](https://lemma.frame00.com/ja/critical/briefs/059-vercel-contextai-oauth/) とは、開発者の持つクラウドの権限が操作ごとの照合なしに受け継がれる点で連なる。同じ時期に開示された [Cursor（DuneSlide）の Brief 094](https://lemma.frame00.com/ja/critical/briefs/094-cursor-duneslide-sandbox-escape/) は、エージェントが読んだ外部の内容の指示が入口で、本件はリポジトリに同梱された設定が入口である。

## 4. Lemma でできること

**Lemma は、03 の照合を、拡張が MCP サーバーを起動する直前に組み込む。** 悪意ある設定を見つけるのではなく、起動しようとする設定の出どころと、起動・渡す環境の範囲を、実行の前に、リポジトリの中身とは別に管理された許可と照合する。

### 注意したい業界・業務

- **業界 · 開発者**: Amazon Q Developer のような AI コーディング支援を、クラウドの認証情報の入った環境で使っている開発のチーム。知らないリポジトリを開く機会（外からの Pull Request、依存関係、採用の課題として渡されるコードなど）があるところ。
- **業界 · AI**: リポジトリやワークスペースの設定から MCP サーバーなどのプロセスを起動する AI ツールを作り、配っている組織。

### いまの対策と Lemma の違い

今回の経路は 1 列目と 2 列目にあたる。3 列目は今回の経路ではない。

| 対策 | 同梱の設定による、同意なしのプロセスの起動 | 起動したプロセスへの、認証情報の丸ごとの受け渡し | 利用者が同意した設定の中での、悪意ある動作 |
| --- | --- | --- | --- |
| 修正版（言語サーバー 1.65.0・起動前の同意の確認）への更新 | 一部 | 一部 | 効かない |
| ワークスペースの信頼（信頼していないフォルダでの実行を止める） | 一部 | 関係しない | 効かない |
| **Lemma（実行の前の照合）** | 効く | 一部 | 効かない |

修正版は起動の前に同意を求めるので、同意しなければ起動もしない。ただ、同意の確認を見て判断するのは利用者で、同意すれば、起動したプロセスに何を渡すかは変わったと公表されていない。ワークスペースの信頼は、信頼していないフォルダでの実行を止めるが、信頼したフォルダの設定は止めず、渡す環境の範囲も見ない。Lemma は、設定の出どころと起動の範囲を、リポジトリの中身とは別に管理された許可と実行の前に照合し、照合できないときは止めるので、1 列目の起動は実行に移る前に止まる。渡す認証情報の範囲も照合の対象にできるが、環境を絞るのはツールの側の実装で、2 列目は「一部」とした。許可した設定の中で悪意ある動作が行われた場合は、照合は一致する。

注：Lemma の照合が働くのは、拡張が MCP サーバーを起動する処理に照合を組み込み、起動してよい設定と配布元、渡してよい環境の範囲が、リポジトリの中身とは別に管理されている場合に限る。範囲を広く決めていれば、その中の悪意ある起動は通る。照合は、悪意ある設定を見つけるものでも、拡張の欠陥を直すものでもない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI コーディング支援を使っている組織で確認する 3 項目

- 使っている Amazon Q Developer の言語サーバーが、修正の入った版（1.65.0 以降）になっているか。
- 開くリポジトリに、MCP の設定（`.amazonq/` など）が入っていないかを把握しているか。
- AI コーディング支援が起動したプロセスと、そこに渡った認証情報の記録を、ツールとは別に見られるか。

## 5. 事実と時系列

- **対象**: Amazon Q Developer の拡張（Visual Studio Code 版）。AWS の AI コーディング支援ツール。
- **識別子**: CVE-2026-12957（GitHub Security Advisory: GHSA-xhcr-j4j9-3gh7）。発見と報告は Wiz Research（Maor Dokhanian）。
- **深刻度**: High。CVSS 4.0 で 8.5（GHSA）、NVD の CVSS 3.1 では 7.8。
- **根本の原因（Wiz Research）**: 二つの挙動の重なり。一つは、フォルダを開いた直後にワークスペースの `.amazonq/mcp.json` を読み込み、書かれた MCP サーバーを同意の確認なしに起動していたこと。もう一つは、起動したプロセスが開発者の環境変数を丸ごと受け継いでいたこと。
- **影響（Wiz Research）**: ローカルでの任意のコードの実行にとどまらず、クラウドの認証情報の持ち出し、クラウドへの居座り、受け継いだ VPN やネットワークを通じた内部のサービスへの到達、本番の権限を持つ開発者を足がかりにした横の広がりにつながりうる。
- **想定される入口**: 人気のリポジトリへの悪意ある Pull Request、名前を似せたリポジトリ、汚染された依存関係、偽の採用面接で「コーディングの課題」として clone させる手口。
- **悪用の状況**: 実環境での悪用の報告は無い。CISA ADP も「悪用の確認なし」としている。

### 時系列

- **2026-04-17**: Wiz が脆弱性を見つけた。
- **2026-04-20**: Wiz が Amazon Security に報告し、Amazon が受け取りを確認した。
- **2026-05-12**: 言語サーバーの更新で修正が配信された。
- **2026-06-23**: CVE-2026-12957 の番号が付いた（GHSA-xhcr-j4j9-3gh7）。
- **2026-06-26**: Wiz Research が公開し、AWS がセキュリティ速報 2026-047-AWS を出した。

> 本稿の事実は、Wiz Research の開示、AWS のセキュリティ速報、GitHub Security Advisory の登録に拠る。修正は開示より先に 1.65.0 で提供されていた。AWS によれば、言語サーバーは通常は自動で更新され、多くの場合は利用者の追加の操作は要らない（ネットワークの構成で自動の更新が妨げられる場合は最新版に更新する）。本 Brief は、再現の手順を載せない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **AWS**: 言語サーバー 1.65.0 で修正し、セキュリティ速報 2026-047-AWS を出した。修正版では、ワークスペースの MCP サーバーを起動する前に同意を求める形に変えた。AWS は Wiz の協力に謝意を示した。
- **Wiz Research**: 開発者に、知らないリポジトリに気をつけること、MCP の同意の確認をよく見ること、リポジトリの中の思いがけない `.amazonq/` を点検すること、MCP の設定を見直すことを勧めた。あわせて、「ワークスペースの設定は攻撃者が操りうる入力」「便利な機能は同意を飛ばしがち」「子のプロセスへ環境を丸ごと渡すのは過小評価されたリスク」の 3 点を教訓に挙げた。Wiz は本件を Amazon Q だけの問題ではなく、Claude Code（CVE-2025-59536 / CVE-2026-21852）・Cursor（CVE-2025-54136）・Windsurf（CVE-2026-30615）にも見られた「MCP の自動の実行」という型だと位置づけている。

## 6. Sources

- **Wiz（研究・一次）**: “MCP Auto-Execution: From Git Clone to Cloud Compromise in Amazon Q VS Code Extension”（2026-06-26）— <https://www.wiz.io/blog/amazon-q-vulnerability>
- **Amazon Web Services（ベンダー速報）**: Security Bulletin 2026-047-AWS — <https://aws.amazon.com/security/security-bulletins/2026-047-aws/>
- **GitHub Security Advisory**: GHSA-xhcr-j4j9-3gh7（CVE-2026-12957）— <https://github.com/aws/language-servers/security/advisories/GHSA-xhcr-j4j9-3gh7>
- **The Hacker News**: “Amazon Q Developer Flaw Could Let Malicious Repos Run Code via MCP Configs” — <https://thehackernews.com/2026/06/amazon-q-developer-flaw-could-let.html>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
