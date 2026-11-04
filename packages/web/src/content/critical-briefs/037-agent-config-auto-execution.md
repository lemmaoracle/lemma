---
brief_no: 37
title: "AI コーディングエージェント：リポジトリに同梱の設定ファイルを自動で実行し、マルウェア Miasma に使われた(Adversa AI・StepSecurity)"
title_en: "AI coding agents: config bundled in repositories ran automatically and was used by the Miasma malware (Adversa AI, StepSecurity)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-05
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["014-tanstack-oidc-trusted-publisher", "027-librechat-mcp-url-secrets", "006-google-api-key-revocation-lag", "003-starlette-badhost", "147-gitspawn-ai-coding-agent-git-config-rce"]
status: published
gate: "agent-operation"
version: "1.0"
og_lead_ja: "マルウェア Miasma がリポジトリに AI エージェントの設定ファイルを仕込み、プロジェクトを開いた開発者の環境で実行されたと報告。GitHub は Microsoft 系 4 組織の 73 リポジトリを無効化"
og_lead_en: "Miasma reportedly planted AI agent config files in repositories that ran when developers opened the project; GitHub disabled 73 repositories across four Microsoft organizations"
search_title: "AI エージェントの同梱設定の自動実行：経緯と対策"
search_description: "AI コーディングエージェントが同梱の設定を自動で実行する欠陥を Adversa AI が報告し、Miasma がこれを使ったとされる。GitHub は Microsoft 系 73 リポジトリを無効化。経緯と照合、対策を整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "AI エージェントの脆弱性 · 同梱設定の自動実行"
og_kicker_en: "AI AGENT FLAW · AUTO-RUN CONFIG"
og_headline_ja: "リポジトリ同梱の設定が、\n開くと実行されたと報告。\n<accent>73 件を無効化</accent>"
og_headline_en: "Config bundled in repos\nran on open, per reports.\n<accent>73 repos disabled</accent>"
key_figures:
  - value: "73"
    unit: "件"
    label: "GitHub が無効化した、Microsoft の 4 組織のリポジトリ（StepSecurity）"
    tone: "alert"
  - value: "06-03 → 06-05"
    label: "Miasma の第 3 波が、AI エージェントの設定ファイルを使った期間（safedep）"
  - value: "開いたとき"
    label: "仕込まれた設定が実行された時点：開発者が AI コーディングツールでプロジェクトを開いたとき（safedep）"
glossary:
  - term: "MCP サーバー"
    desc: "AI エージェントに外部の道具やデータをつなぐためのサーバー。プロジェクトの設定に定義を書いておくと、エージェントが起動する。"
  - term: "フォルダの信頼"
    desc: "開いたフォルダの設定やコードを動かしてよいかを、利用者に尋ねる確認。Adversa AI は、既定が「信頼する」で、承認した時点でプロジェクト定義の MCP サーバーが自動で起動したと報告している。"
insight:
  slug: "bundled-config-runs-on-open"
  label: "開いただけで動く同梱の設定"
  quote: "プロジェクトを開いた・フォルダを信頼したという操作は、同梱の設定の出どころを示さない。実行の前に作者と許す範囲を照合しなければ、仕込まれた設定も、ふつうの起動として通る。"
industries: ["developers", "ai"]
controls:
  - slug: "hold-unverified"
    item: "同梱の設定は、作者と中身を確認するまで実行しない"
attack_method: "ai-misuse"
impact: "Microsoft 系 4 組織の 73 リポジトリが無効化"
takeaway: "リポジトリに仕込まれた AI エージェントの設定ファイルが、開発者がプロジェクトを開いたときに、出どころを照合されないまま実行されたと報告されている。"
self_check: "AI コーディングエージェントが、リポジトリに同梱の設定を読み込む前に、その作者と許す範囲を照合しているか。"
countries: ["global"]
---

## 1. 要点

使われたのは、プロジェクトを開く、フォルダを信頼するという、開発者がふだん行う操作だけだった。研究者の Adversa AI は、主要な AI コーディングエージェントが、リポジトリに同梱の設定（エージェントの設定・MCP サーバーの定義・起動時のフック）を、この操作を十分な許可とみなして自動で実行すると報告した。ベンダーリサーチの safedep と StepSecurity は、自己増殖型のマルウェア Miasma がこの形を使い、プロジェクトを開いた開発者の環境で認証情報を盗み、GitHub が Microsoft の 4 組織の 73 リポジトリを無効化したと報告している。無効化が働いたのは、設定が実行された後だった。<strong>プロジェクトを開いた・フォルダを信頼したという操作は、同梱の設定の出どころを示さない。実行の前に作者と許す範囲を照合しなければ、仕込まれた設定も、ふつうの起動として通る。</strong>

## 2. 通った操作

- **通った操作**: AI コーディングエージェントによる、リポジトリに同梱の設定の読み込みと実行。safedep によれば、Miasma の第 3 波は、リポジトリに Claude Code・Gemini CLI・Cursor の設定ファイルを仕込み、開発者が AI コーディングツールでプロジェクトを開いた時点で、認証情報を盗むプログラムを実行した。
- **研究者が報告した形**: Adversa AI は、無害なファイルのコピーに見える操作でエージェント自身の設定が書き換えられ、次の起動で攻撃者のコードが動く欠陥（SymJack）と、フォルダの信頼を承認した時点でプロジェクト定義の MCP サーバーが明示の承認なしに起動する欠陥（TrustFall）を報告した。承認の確認も、表示されるファイル操作も、実際に何が実行されるかを正確には伝えない、としている。
- **受け付けた側に届くもの**: 一般に、エージェントに届くのは、利用者がプロジェクトを開いた、フォルダを信頼したという操作と、リポジトリの中の設定ファイルである。その設定を誰が書いたか、どこまでの実行を許されているかは、ここからは分からない。
- **実行の結果として届いたもの**: 報告によれば、開発環境が使える GitHub・npm・AWS・Azure・GCP・Vault・Kubernetes などの認証情報。Miasma は、それを使って届く範囲の他のリポジトリやパッケージに同じ形の設定を置き、広がった（safedep・StepSecurity）。
- **公表されていないこと**: 個々のリポジトリがどの経路で感染したか、どれだけの認証情報が盗まれたか、復元がどこまで進んだか。各ツールがフォルダの信頼の既定値や同梱設定の自動実行をどう改めたかは、本稿の出典からは確認できていない。

## 3. 実行前の照合

経路を問わず区別できる条件は、エージェントがリポジトリに同梱の設定を読み込んで実行する前に、その設定が正規の作者に由来するか、実行を許す範囲に収まるかを照合することである。

- **誰が承認を出すか**: 設定を書いた正規の作者と、エージェントにどこまでの実行を許すかを決める利用者・組織。プロジェクトを開く、フォルダを信頼するという操作は、この承認の代わりにならない。
- **どこで照合するか**: エージェントが同梱の設定を読み込み、MCP サーバーや起動時のフックを動かす前。照合できない設定は、確認できるまで実行しない。
- **何が残るか**: どの設定を、どの作者の確認で、どの範囲を許して実行した（または止めた）かの記録。あとから、正規の操作と、仕込まれた設定による操作を区別して示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝エージェントが同梱の設定を実行する前に、作者と許す範囲を照合し、記録に残すこと。検知＝実行の後に、研究者の報告や不正なコミットの検出で見つかり、止めること。日付は 05 の時系列に拠る。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>同梱の設定を実行する前に、作者と許す範囲を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>仕込まれた設定が、プロジェクトを開いたときに実行された<br>認証情報が盗まれ、他のリポジトリへ広がった</span></div>
<div class="rx-zone det"><b>検知 · 実行の後に働いた</b>不正なコミットを検出し、73 リポジトリを無効化した</div>
<div class="rx-g g1"><div class="t">2026-05 上旬</div><b>TrustFall の報告</b></div>
<div class="rx-g g2"><div class="t">2026-05-26</div><b>SymJack の報告</b></div>
<div class="rx-g g3"><div class="t">2026-06-03</div><b>Miasma の第 3 波</b></div>
<div class="rx-g g4"><div class="t">2026-06-05</div><b>73 リポジトリを無効化</b></div>
</div>
</figure>

研究者の報告と、不正なコミットの検出、リポジトリの無効化は働き、手口と感染は外から見えるようになった。ただし、無効化が働いたのは、設定が実行され、認証情報が盗まれた後だった。同じように、外から持ち込まれた設定がそのまま実行に至った [フォルダを開いただけで AI コーディングエージェントがコードを実行した GitSpawn](https://lemma.frame00.com/ja/critical/briefs/147-gitspawn-ai-coding-agent-git-config-rce/)（Brief 147）、利用者が指定した MCP の URL がサーバーの秘密を運び出した [Brief 027](https://lemma.frame00.com/ja/critical/briefs/027-librechat-mcp-url-secrets/)、Host ヘッダーの操作で MCP サーバーの認証が回避された [Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)、有効な署名のまま成果物が悪性だった [Brief 014](https://lemma.frame00.com/ja/critical/briefs/014-tanstack-oidc-trusted-publisher/) がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、エージェントが同梱の設定を実行する手順に組み込む。** 感染の後に検出するのではなく、実行の前に、その設定が正規の作者に由来するか、許す範囲に収まるかを照合し、照合できない実行を通さない。

### 注意したい業界・業務

- **業界 · 開発者・エージェント運用**: AI コーディングエージェントで、外から受け取ったリポジトリを開く開発者と組織。
- **業界 · AI導入（業種横断）**: 開発環境に、クラウドやパッケージの公開に使う認証情報を置いたまま、AI コーディングエージェントを使う組織。

### いまの対策と Lemma の違い

今回の経路は、エージェントがプロジェクトを開いたときに同梱の設定を実行する操作と、盗まれた認証情報で他のリポジトリに同じ形の設定が置かれる操作である。

| 対策 | 同梱の設定の実行（プロジェクトを開いたとき） | 盗まれた認証情報による他のリポジトリへの広がり |
| --- | --- | --- |
| フォルダの信頼の確認（承認の確認） | 効かない | 関係しない |
| 署名の検査 | 効かない | 効かない |
| 不正なコミットの検出とリポジトリの無効化 | 効かない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 |

フォルダの信頼の確認は、Adversa AI の報告では、承認した時点で MCP サーバーが起動し、何が実行されるかを正確には伝えなかった。署名の検査は、リポジトリが有効であることしか示さず、設定が認証情報を盗むかどうかを実行の前に区別できない。広がりは信頼された公開・コミットの経路を通るため、署名の検査は通る。不正なコミットの検出と無効化は、今回の封じ込めの経路で、73 リポジトリを止めたが、設定が実行され認証情報が盗まれた後に働いた。Lemma は、エージェントが同梱の設定を実行する前に、作者と許す範囲を照合する。盗まれた認証情報そのものは失効させないので、広がりの列は一部にとどまる。

注：Lemma の照合が働くのは、エージェントが同梱の設定を読み込む処理に照合を組み込み、正規の作者の確認と許す範囲が、エージェントの外で管理されている場合に限る。正規の作者の鍵が盗まれて設定が書かれた場合は、この照合を通りうる。設定の中身が安全かは判定しない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI コーディングエージェントを使う組織で確認する 3 項目

- 外から受け取ったリポジトリに同梱の設定（エージェントの設定・MCP サーバーの定義・起動時のフック）を、エージェントが実行する前に、作者を確認しているか。
- フォルダの信頼の承認が、何を実行するかを示さないまま、同梱の設定の実行を許す既定になっていないか。
- どの設定を、どの作者の確認で実行したかを、エージェントの外に記録しているか。

## 5. 事実と時系列

- **対象**: リポジトリに同梱の設定を実行する AI コーディングエージェント。Adversa AI は、SymJack を Claude Code・Gemini CLI（Antigravity）・Cursor・GitHub Copilot・Grok Build などで、TrustFall を Claude・Cursor・Gemini CLI・GitHub Copilot で確認したと報告している。
- **研究者の報告**: Adversa AI は 2026 年 5 月上旬に TrustFall を、5 月 26 日に SymJack を公表した。どちらも、利用者に見える承認や操作と、実際に実行されるものが一致しない点を問題にしている。
- **実地の悪用**: Microsoft Security Blog は 6 月 2 日、Miasma の認証情報を盗む手口を公表した。safedep によれば、Miasma は npm の preinstall フック（第 1 波）と binding.gyp の実行（第 2 波、Phantom Gyp）で広がった後、第 3 波でリポジトリに AI エージェントの設定ファイルを仕込む形に移った。報告では、Bun のランタイムを取得して次の段のプログラムを起動し、認証情報を集めて自己増殖する。
- **規模**: StepSecurity によれば、2026 年 6 月 5 日、GitHub が Microsoft の 4 組織（Azure・Azure-Samples・Microsoft・MicrosoftDocs）のリポジトリ 73 件を無効化した。Microsoft は一部のリポジトリを一時的に削除し、審査の後に順に復元すると説明した。

### 時系列

- **2026-05 上旬**: Adversa AI が TrustFall（フォルダの信頼の承認で MCP サーバーが自動で起動する）を公表する。
- **2026-05-26**: Adversa AI が SymJack（エージェントの設定が書き換えられ、起動時に実行される）を公表する。
- **2026-06-01〜03**: Miasma が npm の preinstall フック（第 1 波）と binding.gyp の実行（第 2 波）で広がる。
- **2026-06-02**: Microsoft Security Blog が、Red Hat の npm を通じた Miasma の認証情報を盗む手口を公表する。
- **2026-06-03〜05**: Miasma の第 3 波。リポジトリに AI エージェントの設定ファイルを仕込み、プロジェクトを開いた時点で認証情報を盗む形に移る（safedep）。
- **2026-06-05**: GitHub が Microsoft の 4 組織のリポジトリ 73 件を無効化する（StepSecurity）。

> 個々のリポジトリの感染経路と復元の状況は調査の進み具合によるため、本稿では断定しない。手口の性格づけは Adversa AI・safedep・StepSecurity・Microsoft の報告に拠り、本稿はエージェントの各ベンダーの見解を扱っていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **GitHub・Microsoft**: GitHub が不正なコミットを検出してリポジトリを無効化し、Microsoft は一部を一時的に削除して、審査の後に復元すると説明した。
- **AI コーディングツール**: フォルダの信頼の既定値、同梱設定の自動実行、MCP サーバーの自動起動の扱いが論点になっている。

## 6. Sources

- **Adversa AI（研究・一次）**: “The approval prompt is lying: a critical coding agent security flaw”（SymJack、2026-05-26、symlink 偽装でエージェント設定を上書き）— <https://adversa.ai/blog/the-approval-prompt-is-lying-to-you-symlink-rce-in-five-ai-coding-agents-claude-code-cursor-antigravity-copilot-grok-build/>
- **Adversa AI（研究・一次）**: “TrustFall: coding agent security flaw enables one-click RCE in Claude, Cursor, Gemini CLI and GitHub Copilot”（2026-05、フォルダ信頼承認で MCP 自動起動）— <https://adversa.ai/blog/trustfall-coding-agent-security-flaw-rce-claude-cursor-gemini-cli-copilot/>
- **Microsoft Security Blog（一次）**: “Preinstall to persistence: Inside the Red Hat npm Miasma credential-stealing campaign”（2026-06-02、Miasma の手口と認証情報窃取）— <https://www.microsoft.com/en-us/security/blog/2026/06/02/preinstall-persistence-inside-red-hat-npm-miasma-credential-stealing-campaign/>
- **StepSecurity（ベンダーリサーチ）**: “Miasma Worm Hits Microsoft Again: Azure Functions Action and 72 Other Repositories Disabled”（2026-06、Microsoft 4 組織 73 リポジトリ無効化）— <https://www.stepsecurity.io/blog/miasma-worm-hits-microsoft-again-azure-functions-action-and-72-other-repositories-disabled-after-supply-chain-attack-targeting-ai-coding-agents>
- **safedep（ベンダーリサーチ）**: “Miasma Worm Targets AI Coding Agents via GitHub Repos”（第 3 波、`.claude/settings.json` 等の設定注入による自動実行）— <https://safedep.io/miasma-worm-ai-coding-agent-config-injection/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
