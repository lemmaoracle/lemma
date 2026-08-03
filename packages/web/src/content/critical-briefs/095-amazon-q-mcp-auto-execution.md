---
brief_no: 95
title: "Amazon Q Developer：リポジトリを開いただけで、同梱の MCP 設定が無検証で実行され、AWS 認証情報が持ち出された（CVE-2026-12957）"
title_en: "Amazon Q Developer: opening a repo auto-executed a bundled MCP config and exfiltrated AWS credentials (CVE-2026-12957)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "code-provenance"]
incident_date: 2026-06-26
published: 2026-07-03
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["037-agent-config-auto-execution", "062-claude-code-github-action-bot-trust", "027-librechat-mcp-url-secrets", "059-vercel-contextai-oauth", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "1.0"
og_lead_ja: "Amazon Q — 同梱 .amazonq/mcp.json が無検証実行され AWS 認証情報が流出"
og_lead_en: "Amazon Q — a bundled .amazonq/mcp.json auto-ran and leaked AWS credentials"
gap_detected: "研究側の開示・CVE 採番と CVSS 評価・ベンダー修正（言語サーバー 1.65.0）と AWS 速報／GitHub Advisory 登録という検出の系列が機能し、手口と影響が外部から可視化された。"
gap_missing: "同梱設定（MCP サーバー定義）が正規の作者に由来し認可された範囲かを、拡張がそれをロード・起動する時点で独立検証する層がない。"
gap_fix: "MCP サーバーを起動する前に、設定の来歴と起動の認可スコープを「フォルダを開いた」操作から切り離して検証し、渡す環境を最小限に絞り、証明が伴わなければ起動を止めることを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

開発者が悪意あるリポジトリを Visual Studio Code で開き、AI コーディング支援の Amazon Q Developer 拡張を有効にしただけで、リポジトリ同梱の `.amazonq/mcp.json` に定義された MCP サーバーが確認なしに自動起動し、その延長で開発者の AWS 認証情報が外部へ持ち出せた脆弱性（CVE-2026-12957、CVSS 4.0 で 8.5・CVSS 3.1 では 7.8）が Wiz Research により公開された。MCP サーバーはローカルでコマンドを実行するプロセスであり、Amazon Q はこれをワークスペースのファイルから同意も承認ダイアログもワークスペース信頼チェックもなしに起動していた。起動したプロセスは開発者の環境変数一式（AWS のアクセスキー・セッショントークン、各種 API キー、SSH エージェントのソケット等）を継承したため、git clone からクラウド侵害までがクリック不要で成立した。修正は言語サーバー 1.65.0（AWS は最新版への更新を推奨）。欠けていたのは、「フォルダを開いた」こととは別に、同梱設定が正規の作者に由来し認可された範囲かを、実行の前に独立検証する層だった。

---

## 2. 何が起きたか

- **対象**: Amazon Q Developer 拡張（Visual Studio Code 版）。AWS の AI コーディング支援ツール。
- **識別子**: CVE-2026-12957（GitHub Security Advisory: GHSA-xhcr-j4j9-3gh7）。発見・報告は Wiz Research（Maor Dokhanian）。
- **深刻度**: High。CVSS 4.0 で 8.5（GHSA）、NVD の CVSS 3.1 では 7.8。
- **前提となる仕組み**: MCP（Model Context Protocol）は、AI 支援ツールが「MCP サーバー」と呼ぶローカルプロセスを起動し、データベース・API・ビルドツール等に接続するための標準。サーバーの起動はマシン上でコマンドを走らせることを意味するため、本来はユーザーの明示的な同意を前提とする設計である。
- **根本原因（2 つの挙動の合成）**:
  - **同意なしの自動実行**: 拡張は、フォルダを開いた直後にワークスペース直下の `.amazonq/mcp.json` を読み込み、定義された MCP サーバーを起動していた。承認ダイアログも、信頼できないフォルダでの実行を止めるワークスペース信頼チェックもなかった。
  - **環境変数の全継承**: 起動したプロセスは開発者の環境変数を丸ごと継承した。クラウドを扱う開発者では通常、これに AWS 認証情報（`AWS_ACCESS_KEY_ID`・`AWS_SECRET_ACCESS_KEY`・`AWS_SESSION_TOKEN`）、クラウド CLI のトークン、API キー、SSH エージェントのソケットが含まれる。
- **悪用の核心**: この 2 つが重なると、リポジトリに置かれた設定ファイル 1 つが、開発者の生きたクラウドセッションを attach したまま任意コマンドを実行できる。Wiz の概念実証では、`.amazonq/mcp.json` に仕込んだコマンドが `aws sts get-caller-identity` の結果を攻撃者サーバーへ送出し、フォルダを開いて Amazon Q を有効にする以外の操作なしに、AWS セッションの奪取を示した。
- **影響の連鎖**: ローカルの任意コード実行にとどまらず、クラウド認証情報の窃取、IAM ユーザー／アクセスキーの裏口設置によるクラウド永続化、継承した VPN・ネットワーク経由の内部サービス到達、本番アクセス権を持つ開発者を踏み台にした横展開に拡大し得る。
- **想定される配送**: 人気リポジトリへの悪意ある Pull Request、タイポスクワット、汚染された依存関係、偽の採用面接で「コーディング課題」として clone・実行させる手口（既知の DPRK 系の手口）。
- **悪用状況**: 実環境での悪用報告はなく、CISA ADP も「悪用の確認なし」。

事象は次の連鎖で成立している。

1. **同梱設定の配置**: 攻撃者が、一見正当なリポジトリのルートに `.amazonq/mcp.json` を仕込む。中身は MCP サーバー定義の体裁で、起動時に走るコマンドを含む。
2. **クローンして開く**: 被害者がリポジトリを clone し（悪意ある PR やタイポスクワット等が入口）、VS Code で開く。
3. **「開いた」ことを認可と見なす**: 被害者が Amazon Q を有効にすると、拡張は `.amazonq/mcp.json` を読み込み、定義された MCP サーバーを同意プロンプトなしで自動起動する。
4. **環境継承つきの実行**: 起動プロセスは開発者の環境変数一式（AWS 認証情報・CLI トークン・API キー・SSH エージェントソケット）を継承したまま、仕込まれたコマンドを実行する。
5. **認証情報の持ち出し**: 概念実証では `aws sts get-caller-identity` の結果を外部へ送出。git clone からクラウドセッション奪取までが、フォルダを開く以外の操作なしに成立する。

---

## 3. 時系列 — 公表と対応

- 2026-04-17: Wiz が脆弱性を発見。
- 2026-04-20: Amazon Security へ報告、Amazon が受領を確認。
- 2026-05-12: 言語サーバーの更新により修正を配信。
- 2026-06-23: CVE-2026-12957 を採番（GHSA-xhcr-j4j9-3gh7）。
- 2026-06-26: Wiz Research が公開。AWS はセキュリティ速報 2026-047-AWS を発行。

> 注: 技術的事実は Wiz Research の開示、AWS のセキュリティ速報、GitHub Security Advisory の登録に基づく。修正は開示に先行して 1.65.0 で提供済み。AWS によれば言語サーバーは通常自動更新され、多くの場合ユーザー側の追加操作は不要（ネットワーク構成で自動更新が妨げられる場合は最新版へ更新）。最新の一次情報を参照されたい。

公表後の対応と業界の動きは次のとおり。

- **ベンダー（AWS）**: 言語サーバー 1.65.0 で修正し、セキュリティ速報 2026-047-AWS を発行。修正版ではワークスペースの MCP サーバー起動前に同意プロンプトを表示するよう変更した。言語サーバーは通常自動更新され、多くの場合ユーザー側の追加操作は不要（自動更新が妨げられる場合は最新版へ更新）。AWS は Wiz の協力に謝意を表明した。
- **研究（Wiz Research）**: 開発者は「未知のリポジトリを警戒する」「MCP の同意プロンプトを慎重に確認する」「リポジトリ内の予期しない `.amazonq/` を点検する」「MCP 設定を監査する」ことを推奨。加えて「ワークスペース設定は攻撃者が制御し得る入力」「利便性機能は同意を飛ばしがち」「子プロセスへの環境全継承は過小評価されたリスク」という 3 点を横断的な教訓として挙げた。
- **業界横断の論点**: Wiz は本件を Amazon Q 固有ではなく、Claude Code・Cursor・Windsurf にも見られた「MCP 自動実行」という体系的リスクと位置づけた。ワークスペース設定の実行に VS Code のワークスペース信頼機能を統合すること、子プロセスへ渡す環境を最小化することが、AI コーディングツール共通の課題として共有された。

同梱設定の認可・来歴を、実行の時点で独立検証する層の不在は、特定ツールの問題ではなく、開発者のクラウドセッション下で動く AI コーディングツールを採用する組織横断の運用課題として残っている。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**AI 支援ツールが、リポジトリに同梱された設定（MCP サーバー定義）を実行する際に、その設定の認可スコープと来歴を行動の前に独立検証せず、「ユーザーがフォルダを開いた」ことを十分な認可と見なした**点にある。フォルダを開くという操作は、同梱設定が正規の作者に由来する・安全であるという保証にはならない。リポジトリに存在し得る任意のファイルは信頼できない入力として扱うべきだが、拡張は `.amazonq/mcp.json` を、同意も来歴検証もなしに実行へ接続した。

本事案は [Brief 037](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)（AI コーディングエージェントが同梱設定を無検証で自動実行）の、実名・実製品による具体例である。037 が SymJack / TrustFall（研究）と Miasma（実地）を横断して描いた「開いた／信頼したことを認可と見なして同梱設定を実行する」構造が、Amazon Q という単一製品の CVE として結実した。[Brief 062](https://lemma.frame00.com/ja/critical/briefs/062-claude-code-github-action-bot-trust/)（Claude Code GitHub Action、`[bot]` を名乗る 1 件の issue を信頼してエージェントが特権実行した）とは、エージェントが入力の発行元を検証せず特権実行へ進む点で一致する。[Brief 027](https://lemma.frame00.com/ja/critical/briefs/027-librechat-mcp-url-secrets/)（LibreChat、ユーザー指定の MCP URL からサーバーの秘密が漏れた）とは、MCP という同じ機構で「設定＝実行」が成立する点で連なる。[Brief 059](https://lemma.frame00.com/ja/critical/briefs/059-vercel-contextai-oauth/)（AI ツールに渡した「すべて許可」の OAuth が、ベンダー侵害でそのまま侵入経路になった）とは、開発者・エージェントが持つクラウド権限が、行動ごとの検証なしに継承・悪用される点で接続する。共通する primitive は同じである。すなわち、**設定の実行が、それを認可・検証する層と切り離されている**。

そして本事案は同時に開示された [Brief 094](https://lemma.frame00.com/ja/critical/briefs/094-cursor-duneslide-sandbox-escape/)（Cursor / DuneSlide）と対をなす。094 が「エージェントが読んだ外部コンテンツ内の指示を認可と見なす」入口だとすれば、095 は「リポジトリ同梱の設定ファイルを認可と見なす」入口であり、いずれも AI コーディングツールが「自分では出どころを選べない入力」を実行に接続する構造である。Wiz も、これを Amazon Q 固有ではなく、Claude Code（CVE-2025-59536 / CVE-2026-21852）・Cursor（CVE-2025-54136）・Windsurf（CVE-2026-30615）に共通する「MCP 自動実行」という業界横断のパターンだと位置づけている。環境変数の全継承（最小権限ではなく path of least resistance を選ぶ実装）が、ローカル実行をクラウド侵害へ引き上げる増幅器として働いた点も、AI コーディングツールが開発者のクラウドセッション下で動く以上、横断的な論点である。

本事案では、研究側の開示（Wiz Research）、CVE 採番と CVSS による深刻度評価、ベンダーの修正（言語サーバー 1.65.0）と AWS セキュリティ速報、GitHub Security Advisory 登録という検出の系列が機能し、手口と影響が外部から可視化された。これは検出の典型的成功であり、本 Brief が検出層の役割を否定するものではない。検出は、手口の公表、影響バージョンの特定、更新の判断に不可欠である。

一方で、検出は「拡張がこれから起動しようとしている同梱設定が、正規に認可され、正規の作者に由来するか」を、**拡張がその設定をロード・起動する時点で**独立に立証する材料にはならない。`.amazonq/mcp.json` は正規の設定ファイルと同じ形式であり、実行前にそれを「悪意ある設定」と形式的に判別する術は検出側にない。ワークスペース信頼チェックの不在は、フォルダを開いた操作を認可の終点にしてしまい、設定の来歴や実行主体の権限を見ていない。異常検知が実行の後に発火しても、環境変数を継承して走ったプロセスが認証情報を送出した後では遅い。監査で「この MCP サーバー起動は正規に認可された主体・設定によるものか」を立証する材料として、「ユーザーがフォルダを開いた」という事実だけでは、設定の認可・来歴の独立した証跡にならない。これは検出層の射程外にある、構造的に独立した層の落差である。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、拡張が同梱設定を実行する経路に権限・来歴の証明を 1 段挟むことでこの落差を埋める。MCP サーバーを起動する前に「この設定は認可された作者・配布元に由来し、この起動はこのスコープで認可されているか」を、フォルダを開いたという操作とは切り離して検証し、証明が伴わなければ起動を事前に block する。加えて、起動するプロセスへ渡す環境を認可された最小限に絞れば、仮に実行されても認証情報の全継承を避けられる。事前証明は検出に対する代替ではなく **補完** であり、両層の組み合わせで AI コーディングツールの trust boundary が確立される。

本事象で露呈した落差（AI 支援ツールが同梱設定を、その認可・来歴の独立検証から切り離したまま実行し、しかも環境を全継承する）に対して、Lemma は、ツールが設定を実行する前に、その実行が認可され正規の来歴を持つことを独立検証可能な暗号証明として要求する設計を提示している。

- **行動前の認可証明（proof-as-auth）**: MCP サーバーの起動や同梱設定の実行の前に、「この起動は、この設定・この主体に、このスコープで認可されている」ことを署名付きで証明する。「フォルダを開いた」ことを認可の終点にしない。
- **設定の来歴バインド**: 実行対象の設定を、その発行元（正規の作者・配布元）に紐付けて来歴を検証し、リポジトリに紛れて配置された `.amazonq/mcp.json` のような無認可の設定を、認可経路から区別する。
- **スコープ付き権限と最小環境**: 起動するプロセスへ渡す環境・権限を操作ごとに最小化し、AWS 認証情報や SSH エージェントソケットの全継承を、証明された必要範囲に絞る。認可の範囲を超える実行を証明なしには成立させない。
- **選択的開示**: 「この起動が認可スキーマを満たす」ことだけを最小開示し、内部の鍵・資格情報は環境外に出さない。

これにより、実行の時点で固定された証明が、「この設定は正規に認可され、正規の来歴を持つか」を、ツールが同梱設定を実行する前に独立検証可能なトレイルとして機能させる。検出（事後の開示・パッチ・ベンダーリサーチ）は発覚後の是正に、事前証明（実行前の認可・来歴検証）はツール操作の独立検証に、それぞれ相補的に働く。

---

## 6. Sources

- **Wiz（研究・一次）**: “MCP Auto-Execution: From Git Clone to Cloud Compromise in Amazon Q VS Code Extension”（2026-06-26）— <https://www.wiz.io/blog/amazon-q-vulnerability>
- **Amazon Web Services（ベンダー速報）**: Security Bulletin 2026-047-AWS — <https://aws.amazon.com/security/security-bulletins/2026-047-aws/>
- **GitHub Security Advisory**: GHSA-xhcr-j4j9-3gh7（CVE-2026-12957）— <https://github.com/aws/language-servers/security/advisories/GHSA-xhcr-j4j9-3gh7>
- **The Hacker News**: “Amazon Q Developer Flaw Could Let Malicious Repos Run Code via MCP Configs” — <https://thehackernews.com/2026/06/amazon-q-developer-flaw-could-let.html>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/#authority)、[Trust402](https://lemma.frame00.com/ja/trust402/)
