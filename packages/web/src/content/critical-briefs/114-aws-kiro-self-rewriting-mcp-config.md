---
brief_no: 114
title: "AWS の Kiro：無害な要約依頼が、エージェントに自らの MCP 設定を書き換えさせ RCE に至る — 承認境界は、認可設定の自己改変を実行前に確かめない"
title_en: "AWS Kiro: a harmless summarize request makes the agent rewrite its own MCP config and reach RCE — the approval boundary never verifies self-modification of authorization settings before execution"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-07-22
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["095-amazon-q-mcp-auto-execution", "094-cursor-duneslide-sandbox-escape", "037-agent-config-auto-execution", "099-agentjacking-sentry-mcp", "098-bioshocking-agentic-browser-context"]
status: published
version: "1.0"
og_lead_ja: "AWS Kiro に RCE：エージェントが自らの MCP 設定を書き換える"
og_lead_en: "RCE in AWS Kiro: the agent rewrites its own MCP config"
gap_detected: "プロンプトインジェクションの検知と承認ダイアログは設計上存在し、脆弱性は責任ある開示を経て修正された。"
gap_missing: "エージェントが自らの認可設定を書き換える行動を、実行の前に来歴と権限で独立に確かめる層。"
gap_fix: "設定＝認可の書き込みと、それに基づく実行を、実行前に来歴と権限で独立検証し、自己改変された設定に基づく実行を認可の欠如として排除する。"
---

## 1. TL;DR

AWS のエージェント型 IDE「Kiro」に、任意コード実行（RCE）に至る脆弱性 CVE-2026-10591 が見つかった。研究は Intezer が Kodem Security と共同で公開したものである。Web ページを要約させるといった無害な依頼のなかで、ページに仕込まれた隠しテキスト（間接プロンプトインジェクション）が Kiro を誘導し、Kiro 自身の MCP 設定ファイル（`~/.kiro/settings/mcp.json`）を書き換えさせる。設定は自動で再読み込みされ、そこに記述された任意のコマンドが開発者マシンで実行される。Kiro の安全モデルは「人間が allow をクリックする」承認境界に依存していたが、本脆弱性はその承認を開発者に提示することなく迂回した。プロンプトインジェクションの検知と承認ダイアログは設計上存在していた。**検出は効いていた。効かなかったのは、エージェントが自身の認可設定を書き換える行動を、実行の前に独立に確かめる層である。**

## 2. 何が起きたか

- 対象は AWS のエージェント型 IDE「Kiro」。脆弱性は CVE-2026-10591 として追跡され、AWS は 2026-07-22 に security bulletin 2026-037 を公開した。研究は Intezer が Kodem Security と共同で実施した。
- 根本原因は、Kiro の他の保護対象パスと異なり、MCP 設定ファイル `~/.kiro/settings/mcp.json` が保護されず、Kiro がユーザーの承認なしに自ら書き込め、変更時に自動で再読み込みされる点にある。このファイルの内容は、ユーザー権限でホスト上で起動されるコマンドそのものである。
- 攻撃者は、開発者マシンでの任意コード実行を得るために、Kiro 本体の脆弱性を突く必要すらない。Kiro が読み込む外部コンテンツに攻撃者のテキストが届けば足りる。

攻撃は次の連鎖で成立している。

1. 開発者が Kiro に、外部コンテンツを取り込む通常の依頼（「このドキュメントを要約して」など）を出す。
2. Kiro が Web を取得・検索し、その結果の一つに攻撃者の隠し指示が含まれている。
3. 隠し指示が Kiro に、ファイル書き込みツールで `~/.kiro/settings/mcp.json` を書き換えさせる。この書き込みはユーザーの承認なしに行われる。
4. Kiro が設定を自動で再読み込みし、記述された悪意ある MCP サーバー（＝任意のコマンド）を起動する。フォルダを開いた／設定が変わった時点で、開発者マシン上でコードが実行される。

## 3. 時系列 — 公表と対応

- 2026-02-11：Intezer が HackerOne 経由で AWS に報告（責任ある開示）。
- 2026-04-03：AWS が「修正コードを最新リリースに展開済み」と回答。研究側は v0.11.130 で修正を確認した。
- 2026-07-20：Intezer が Kodem Security との共同研究を公開。
- 2026-07-22：AWS が CVE-2026-10591 を付与し、security bulletin 2026-037 を公開。

> 注：本 Brief の事実は一次（Intezer 研究、AWS security bulletin 2026-037）に基づく。実運用での悪用は報告されておらず、実証は研究者による概念実証（PoC）である。金銭的被害や影響範囲は確定されておらず、本 Brief では規模を断定しない。本 Brief は個々の攻撃者や特定ベンダーの断罪ではなく、エージェントが自らの認可設定を無害なタスクの最中に外部コンテンツから書き換える、という構造に焦点を当てる。

公表後の対応と業界の動きは次のとおり。

- AWS は本脆弱性を修正し（0.11 系の v0.11.130 で修正を確認）、Kiro 利用者に最新版への更新を推奨している。
- Intezer と Kodem は、承認境界がモデルの判断やプロンプトの内側ではなく、プラットフォーム側で「重要な行動」に対して強制されるべきだと結論づけている。

## 4. なぜ止まらなかったか

この事案の失敗は、プロンプトインジェクションを完全に防げなかったことにあるのではない。データが命令になる LLM において、インジェクション自体は既知の未解決問題である。失敗は、その一段先——エージェントが自らの認可設定を書き換える書き込みと、それに基づく実行が、行動の前に独立検証されなかったこと——にある。

Kiro の安全モデルは「危険な操作は人間が allow をクリックしたときだけ起きる」という承認境界に置かれていた。だが本脆弱性では、認可を決める設定ファイルそのものを、エージェントが承認なしに書き換えられた。開発者が承認したのは「URL の取得」という無害で当然の行動だけであり、設定ファイルの書き込み、MCP サーバーの作成、コードの実行のいずれにも同意していない。承認ダイアログという検出は、確かめるべき対象——「この書き込みは、いまこの認可を本当に持っているか」——を実行の前に問わなかった。

> 設定変更の警告ポップアップが表示される場合もあった。だが Intezer によれば、ユーザーの応答にかかわらず設定は再読み込みされた。警告は検出の見た目を与えるが、実行を止めない。承認境界は、確かめる対象が実行の前に独立検証されて初めて境界になる。

同じ構造は、同一ベンダー系列の Amazon Q で MCP 設定に基づくコマンドが自動実行された [Brief 095](https://lemma.frame00.com/ja/critical/briefs/095-amazon-q-mcp-auto-execution/) の、いわば「設定を外部から自己改変させる」版にあたる。エージェントの設定改変が実行に直結する [Brief 037](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)、外部コンテキストがエージェントの行動を動かす [Brief 099](https://lemma.frame00.com/ja/critical/briefs/099-agentjacking-sentry-mcp/)・[Brief 098](https://lemma.frame00.com/ja/critical/briefs/098-bioshocking-agentic-browser-context/) と連なる。いずれも、設定や入力が「正規のファイル・正規の取得結果」に見えることと、その設定に基づく実行がいま認可されていることが、別の問いであることを示している。

## 5. 証明があれば、何が変わるか

承認境界（人間の allow）は、エージェントが自分の認可設定を無害なタスクの最中に外部コンテンツから自己改変すると無効化する。検出——プロンプトインジェクションの検知や承認ダイアログ——は騙され得るし、警告は迂回され得る。効くのは、設定の書き込みと、その設定に基づく実行を、行動ごとに実行の前に独立検証する層である。差し出された設定ファイルの見た目を信頼の代用にせず、「この書き込みは、いまこの範囲で認可されているか」「この実行は、認可された来歴を持つ設定に基づくか」を、行動が成立する前に確かめる。答えが「認可なし」「来歴不明」であれば、書き込みも実行も事前に保留される。

Lemma がこの primitive に対して提示する設計は次の通りである。

- **設定＝認可の書き込み検証**：MCP 設定や実行に直結するパスへの書き込み・変更を、静的なファイル所在の信頼ではなく、その書き込みをいま認可されていることの独立検証可能な証明に結び付ける。エージェントが自らの認可境界を承認なしに書き換える経路を、実行の前に断つ。
- **行動ごとの proof-as-auth**：設定に基づく実行を、その設定の来歴と認可の状態に束ねる。無害なタスクの最中に外部コンテンツから自己改変された設定に基づく実行を、認可の欠如として実行の前に排除する。
- **実行パスの分離・最小環境**：実行に直結する設定への書き込みを、通常のファイル編集から分離し、最小権限の環境に閉じる。書き込みが起きても、認可のない実行に直結させない。
- **改変の選択的記録**：どの設定が・どの来歴と認可の下で・いつ書き換えられ実行に至ったかを、後から改ざんできない証跡として残す。事後に、実行の起点と認可の状態を独立に立証できる。

Lemma はプロンプトインジェクションそのものを消す製品ではなく、モデルの判断を代替するものでもない。射程は、設定の書き込みとそれに基づく実行が起きる前に、来歴と認可を独立に検証し、自己改変された設定に基づく実行を実行前に排除することにある。検出（インジェクションの検知、承認ダイアログ、事後の修正）と、事前証明（設定の書き込みと実行の前に来歴と認可を独立検証する証跡）は、代替ではなく補完の関係にある。前者は起きた事象の把握と修正に、後者は被害が成立する前の認可確立に働く。設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、適用範囲は [Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/agent-authority-proof/) を参照。

## 6. Sources

- Intezer Research, “When the AI Edits Its Own Trust Boundary: Remote Code Execution Vulnerability in AWS's Agentic IDE”（2026-07-20、7-23 更新）— <https://research.intezer.com/blog/2026/07/remote-code-execution-kiro/>
- AWS Security Bulletin, “AWS-2026-037: Issue with Kiro”（2026-07-22）— <https://aws.amazon.com/security/security-bulletins/2026-037-aws/>
- Kodem Security, “AWS Kiro Agentic IDE RCE via Prompt Injection and MCP Config”（2026-07）— <https://www.kodemsecurity.com/resources/aws-kiro-agentic-ide-rce-prompt-injection-mcp-config-vulnerability>
- The Hacker News, “AWS Kiro Flaw Let Poisoned Web Page Trigger Remote Code Execution”（2026-07）— <https://thehackernews.com/2026/07/aws-kiro-flaw-let-poisoned-web-page.html>

参照: [Proof-as-Auth: 鍵を一度も送らずにサインインする](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/agent-authority-proof/) · [Brief 095（Amazon Q の MCP 自動実行）](https://lemma.frame00.com/ja/critical/briefs/095-amazon-q-mcp-auto-execution/) · [Brief 037（エージェント設定の自動実行）](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)
