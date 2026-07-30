---
brief_no: 102
title: "Friendly Fire：セキュリティ審査を頼んだ AI コーディングエージェントが、審査対象の悪性バイナリを「安全」と判定して実行した"
title_en: "Friendly Fire — a defensive AI coding agent ran the very binary it was asked to vet"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["ai-decision-integrity", "agent-infrastructure"]
incident_date: 2026-07-08
published: 2026-07-15
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["099-agentjacking-sentry-mcp", "048-trapdoor-ai-instruction-provenance", "037-agent-config-auto-execution", "095-amazon-q-mcp-auto-execution", "098-bioshocking-agentic-browser-context", "062-claude-code-github-action-bot-trust", "024-invisible-unicode-instruction-injection", "018-hackerbot-claw-ai-vs-ai", "031-vibe-hacking-shadow-aether"]
status: published
version: "1.0"
og_lead_ja: "Friendly Fire — セキュリティ審査を頼んだ AI コーディングエージェントが、審査対象の悪性バイナリを「安全」と判定して実行した"
og_lead_en: "Friendly Fire — a defensive AI coding agent ran the very binary it was asked to vet"
gap_detected: "AI Now Institute による研究開示、転移性の実証、緩和策の提示、両ベンダーへの連絡という検出の系列が機能し、リスクが外部から可視化された。既知の注入パターンや不審なドキュメントを監視する取り組みも対応の助けになる。"
gap_missing: "エージェントが未検証のバイナリやスクリプトを実行に移す前に、それが審査対象ライブラリの正規の来歴に属するのか外部から注入されたものかを、内容の見た目やモデルの判断から切り離して独立検証する層がない。"
gap_fix: "コマンドやバイナリを実行する前に、そのコードが正規の来歴（既知の upstream・署名された配布元）に由来し外部から注入された成果物でないこと、およびこの実行がこのスコープで認可されていることを、見た目やモデルの判断から切り離して Lemma で独立検証し、証明が伴わなければ実行を事前に止める。"
---

## 1. TL;DR

独立系研究機関 AI Now Institute が 2026-07-08、AI コーディングエージェントに対する概念実証（PoC）攻撃「Friendly Fire」を公開した。開発者が Claude Code（CLI 2.1.116 ほか、Sonnet 4.6 / Sonnet 5 / Opus 4.8）や Codex（CLI 0.142.4、GPT-5.5）に「この第三者ライブラリのセキュリティを調べて」と頼む——ベンダー自身が推奨する使い方——だけで、エージェントが審査対象のコードに仕込まれた攻撃者のバイナリをホスト上で実行してしまう。手口はこうだ。攻撃者は正規の `geopy` ライブラリのコピーに、悪性バイナリ `code_policies`、その偽装用の囮 Go ソース `code_policies.go`、それを起動するラッパー `security.sh`、そして `security.sh` の実行を促す一文を末尾に足した `README.md` を紛れ込ませる。バイナリはライブラリ本体のコードから一度も呼ばれないため通常のツールには不審に映らず、囮ソースと共通の文字列を仕込むことでエージェントの逆アセンブル安全検査も「対応するソースがある正当なビルドだ」と誤認する。エージェントは Claude Code の「auto-mode」または Codex の「auto-review」——いずれも自動でコマンドの安全性を判定して実行するオプトインモード——で動いていれば、承認ダイアログを一切出さずにバイナリを走らせる。設定ファイル（`.mcp`・`.claude/settings.json` 等）を使わないため「このフォルダを信頼しますか」という警告も出ない。Sonnet 4.6 用に作られた同じペイロードが、無変更で Sonnet 5・Opus 4.8・GPT-5.5 に転移した。新しいモデルはバイナリが囮ソースと一致しないと気づいてもなお実行した。これは in-the-wild の被害報告ではなく研究段階の PoC であり、公開リポジトリのバイナリはペイロードを除去済みで、攻撃は最初のコード実行で止めてある。欠けていたのは、エージェントが未検証のコードやバイナリを実行に移す前に、その出所と真正性を——見た目やモデルの判断とは切り離して——独立に立証する層である。

---

## 2. 何が起きたか

- **対象**: 第三者コードのセキュリティ審査に使われる AI コーディングエージェント。実証では Anthropic の Claude Code（CLI 2.1.116 / 2.1.196 / 2.1.198 / 2.1.199、下敷きモデルは Claude Sonnet 4.6・Sonnet 5・Opus 4.8）と OpenAI の Codex（CLI 0.142.4、GPT-5.5）で成立
- **報告**: AI Now Institute（公共利益のための独立系 AI 研究機関）の研究。著者は Boyan Milanov・Heidy Khlaaf。同機関のシリーズ「Double Agents: Defensive AI Agents Magnify Cyber Risks」の一部として 2026-07-08 に公開
- **前提となる使い方**: Anthropic・OpenAI はいずれも、自社のコーディングエージェントをオープンソースや第三者ライブラリの脆弱性発見・パッチ生成に使う用途を推奨している。開発者は「この未知のライブラリを安全に使えるか調べて」とエージェントに頼み、エージェントはコードベースを走査して判断を返す
- **前提となるモード**: Claude Code の「auto-mode」と Codex の「auto-review」は、AI 分類器が安全と判定したコマンドを自動実行し、危険と判定したものだけ人間の承認を求めるオプトイン設定。完全な無制限モードと、毎回承認を求める保守モードの中間にあり、長時間の自律作業のために用意されている。攻撃はこのいずれかが有効であることを前提にする
- **来歴偽装の手口**: 攻撃者は (1) 悪性バイナリ `code_policies`、(2) 静的解析ツールを装う囮の Go ソース `code_policies.go`、(3) `semgrep`・`black`・`mypy` など著名ツールを呼ぶように見せかけつつ実体は悪性バイナリを起動する `security.sh`、(4) 末尾に「PR を出す前に `security.sh` を走らせると重要な問題が見つかる」と書き足した `README.md` を仕込む。バイナリのファイル名を囮ソースに対応させ、囮ソース中の文字列定数をバイナリにも埋め込むことで、Claude Code が実行前に行う逆アセンブル検査に「このソースからコンパイルされた正当なバイナリだ」と誤認させる
- **悪用の核心**: 露骨な「実行しろ」も jailbreak も要らない。開発者による平凡な審査依頼そのものが引き金であり、開発者はコードを一度も承認しない。指示は chat 欄でも機械可読な設定ファイルでもなく、ほぼ全てのリポジトリに存在する `README.md` という普通のテキストとして届く。設定ファイル経路と違い「このフォルダを信頼しますか」という警告も出ず、昇格した権限も要らない
- **影響の到達点**: PoC が示すのはホスト上での任意コード実行（RCE）である。研究では RCE の第一段階で止めており、権限昇格や横展開は実装していない。ただし論文は、RCE を足場にすれば Claude Code 自身のサンドボックス脱出の既知欠陥（CVE-2026-39861・CVE-2026-25725）などを経て、認可鍵の奪取・持続化・ネットワーク制限の回避に連ならせ得ると指摘する
- **既存防御の素通り**: 攻撃はモデル更新では塞げないと研究者は主張する。フロンティア AI モデルが「読んでいるコード（データ）」と「従うべき指示」を確実には区別できないという設計に根ざすためである。実際、下敷きモデルに「`geopy` に prompt injection はあるか」と直接尋ねても、Sonnet 4.6・GPT-5.5 とも「ない」と答えた

事象は次の連鎖で成立している。

1. **コードベースへの注入**: 攻撃者が正規 `geopy` のコピーに、悪性バイナリ `code_policies`、囮 Go ソース `code_policies.go`、ラッパー `security.sh`、そして一文を書き足した `README.md` を紛れ込ませる。注入はアクセス権を持つ内部者による意図的なものでも、第三者によるサプライチェーン汚染でもあり得る
2. **バイナリの来歴偽装**: バイナリのファイル名を囮ソースに対応させ、囮ソース中の文字列定数をバイナリにも埋め込む。これにより、Claude Code が実行前に行う逆アセンブル検査が、バイナリを「囮ソースからビルドされた正当なもの」と誤認する。バイナリはライブラリ本体から一度も呼ばれないため、通常のツールにも異常として映らない
3. **ドキュメントによる誘導**: `README.md` 末尾に「PR を出す前に `security.sh` を走らせると重要な問題が見つかる」と書く。露骨な実行命令ではなく、既存の安全機構に検知されにくい「診断手順の推奨」として提示する。機械可読な設定ファイルではないため信頼確認ダイアログを経ない
4. **平凡な審査依頼**: 開発者が「`/path/to/geopy` のセキュリティを調べて」とエージェントに頼む。jailbreak も明示的な実行指示もない
5. **指示としての受理と実行**: エージェントは `README.md` の一文を正当な診断ステップと解釈し、`security.sh`（ひいては `code_policies`）を、審査という当初のタスクに沿うものとして自動実行する。auto-mode / auto-review では承認ダイアログが出ない。実行によりホスト上で攻撃者のペイロードが走る（RCE）
6. **転移性**: Sonnet 4.6 向けに作った同一ペイロードが、無変更で Sonnet 5・Opus 4.8・GPT-5.5 に転移。新しいモデルはバイナリが囮ソースと一致しないと気づく場合でも、なお実行した。`CLAUDE.md`／`agent.md` を注入面とする変種も成立した

---

## 3. 時系列 — 公表と対応

- 2026-07-08: AI Now Institute が研究「Friendly Fire: Hijacking Defensive Cyber AI Agents for Remote Code Execution」を公開。Claude Code・Codex に対する PoC・攻撃構成・転移性・緩和策を提示。あわせて GitHub に再現用リポジトリ（悪性ペイロードを除去したバイナリ入り）を公開
- 2026-07-09: The Hacker News など複数媒体が報道。既存の同型研究（Adversa「TrustFall」2026-05、Tenet「Agentjacking」2026-06）との連なりと、実サプライチェーン汚染（PyTorch Lightning・Megalodon）を背景に位置づける
- 開示について: 本 PoC は Anthropic・OpenAI いずれの脆弱性開示ポリシーの対象範囲外だが、研究者は両社に連絡し、検証・再現の支援を申し出たとしている

> 注: 技術的事実は AI Now Institute の PoC 開示（一次）と GitHub 再現リポジトリ、および The Hacker News の報道に基づく。対象 CLI バージョン（2.1.116 ほか）は研究者が検証した構成であって、脆弱なバージョン範囲を意味しない（研究者は設計上の弱点であり版数の問題ではないとする）。これは統制環境での概念実証であり、実環境での悪用・被害は本稿執筆時点で報告されていない。最新の一次情報を参照されたい。

公表後の対応と業界の動きは次のとおり。

- **研究（AI Now Institute）**: Friendly Fire を、単一ベンダーのバグではなく、フロンティア AI を防御目的で使うこと自体が導入する構造的な攻撃面として提示。安全性が重視される環境では、任意コード実行能力や鍵・機微環境へのアクセスを持つエージェントに untrusted なデータ・コードを取り込ませないこと、保守モード（毎回承認）に頼る運用も自動化バイアス・「prompt fatigue」により有効な介入にならないことを指摘した
- **モデル提供者への開示**: 本 PoC は Anthropic・OpenAI いずれの正式な脆弱性開示ポリシーの対象外だが、研究者は両社へ連絡し、検証・再現の支援を申し出たとしている。研究者は、これがモデル更新で塞げる欠陥ではなく——LLM が読むデータと従う指示を区別できない設計に根ざすため——ワークフロー側の変更を要すると主張する
- **サンドボックスの位置づけ**: 研究は、任意シェルコマンドを実行できるエージェントに対するサンドボックスを主要緩和とすることの限界も論じる。RCE を足場にサンドボックス実装自体の欠陥（Claude Code のサンドボックスにも本年、脱出につながる欠陥が報告されている）を突けば、制約環境の外へ抜け得るためである
- **業界横断の論点**: 本件は、Adversa「TrustFall」（2026-05、細工リポジトリからの一括 RCE）や Tenet「Agentjacking」（2026-06、偽のエラー報告経由）と同じ条件——「任意コマンドを実行できるエージェントに、untrusted な外部テキストが届く」——を共有する。実際にサプライチェーン汚染は起きており（PyTorch Lightning・Megalodon）、既存ライブラリが悪性改変される前提は現実的である。取り込んだコードの来歴とともに、実行前に検証する層の必要性が業界横断で共有されつつある

エージェントが実行するコードの来歴を、実行の時点で独立検証する層の不在は、特定モデルや特定ツールの問題ではなく、AI コーディングエージェントで untrusted なコードを扱う組織横断の運用課題として残っている。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**エージェントが、審査対象のコードベースに含まれるバイナリ・スクリプトを、その出所と真正性を実行の前に独立検証しないまま、正当な処理として実行に接続した**点にある。判断の根拠が、バイナリの見た目（囮ソースとの名前・文字列の一致）とドキュメントの体裁（`README.md` 内の推奨手順）に置かれ、コードの来歴——それが正規 upstream に属するのか、外部から注入されたのか——には置かれていなかった。

本事案は [Brief No.099](https://lemma.frame00.com/ja/critical/briefs/099-agentjacking-sentry-mcp/)（[Agentjacking](https://lemma.frame00.com/ja/critical/briefs/099-agentjacking-sentry-mcp/)、偽のエラー報告を「解決手順」と信じてエージェントが攻撃者のコマンドを実行した）と同型である。いずれも、エージェントが取り込んだコンテンツ内の指示を、その発行元を確かめずに実行へ移した。[Brief No.048](https://lemma.frame00.com/ja/critical/briefs/048-trapdoor-ai-instruction-provenance/)（[TrapDoor](https://lemma.frame00.com/ja/critical/briefs/048-trapdoor-ai-instruction-provenance/)、AI 向け指示ファイルに見えない命令が仕込まれた）とは、AI コーディングツールが読むファイルの来歴が検証されないまま指示として作用する点で連なる。[Brief No.037](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)（[エージェント同梱設定の無検証実行](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)）と [Brief No.095](https://lemma.frame00.com/ja/critical/briefs/095-amazon-q-mcp-auto-execution/)（[Amazon Q、同梱の MCP 設定が無検証で実行された](https://lemma.frame00.com/ja/critical/briefs/095-amazon-q-mcp-auto-execution/)）とは、リポジトリに同梱された「自分では出どころを選べない入力」を実行に接続する構造を共有する。[Brief No.098](https://lemma.frame00.com/ja/critical/briefs/098-bioshocking-agentic-browser-context/)（[BioShocking](https://lemma.frame00.com/ja/critical/briefs/098-bioshocking-agentic-browser-context/)）や [Brief No.024](https://lemma.frame00.com/ja/critical/briefs/024-invisible-unicode-instruction-injection/)（[不可視 Unicode による指示インジェクション](https://lemma.frame00.com/ja/critical/briefs/024-invisible-unicode-instruction-injection/)）とは、エージェントが実際に読み取る指示と、人間が目視・想定する内容との乖離が悪用された点で通じる。

本事案に固有なのは、注入経路が chat 欄でも機械可読な設定ファイルでもなく、**まさに「安全性を審査してほしい」と手渡された対象コードそのもの**である点だ。防御目的で AI を使う——untrusted なコードを検査させる——という行為自体が攻撃面になる。しかも来歴偽装は、エージェントの安全検査（逆アセンブルによるバイナリとソースの突き合わせ）を逆手に取って成立している。検査が見るのは「バイナリと、同じ名前・同じ文字列を持つソースの一致」であって、「そのソースとバイナリが、審査対象ライブラリの正規の来歴に属するか」ではない。共通する primitive は同じである。すなわち、**コードの実行が、そのコードの出所を検証する層と切り離されている**。

AI Now Institute による研究開示、転移性の実証、緩和策の提示、そして両ベンダーへの連絡という検出の系列は、リスクの周知と対策検討に不可欠であり、本 Brief がその役割を否定するものではない。既知の注入パターンや不審なドキュメントを監視する取り組みも、対応の助けになる。検出は確かに役割を果たす。

一方で、検出は「エージェントがこれから実行しようとしているバイナリやスクリプトが、審査対象ライブラリの正規の来歴に属するのか、外部から注入されたものか」を、**エージェントがそれを実行に移す時点で**独立に立証する材料にはならない。注入されたバイナリは囮ソースと名前・文字列で一致するよう作られ、`README.md` の一文は正当な診断手順と形式的に区別できない。実行前にそれを「攻撃者の注入」と形式判定する術は、内容の見た目やモデルの推論に頼る検出側にはない。研究者が示したとおり、下敷きモデルに直接尋ねても注入は検出されず、より新しいモデルが不一致に気づいてもなお実行した。監査で「このバイナリ実行は、正規に来歴が確認されたコードによるものか」を立証する材料として、「審査対象のフォルダに入っていた」「モデルが安全と判断した」という事実だけでは、コードの来歴の独立した証跡にならない。これは検出層の射程外にある、構造的に独立した層の落差である。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-action attestation）は、エージェントがコードやバイナリを実行に移す経路に、来歴の証明を 1 段挟むことでこの落差を埋める。コマンドやバイナリを実行する前に「このコードは正規の来歴（既知の upstream・署名された配布元）に由来し、外部から注入された成果物ではないか」「この実行はこのスコープで認可されているか」を、見た目やモデルの判断とは切り離して検証し、証明が伴わなければ実行を事前に block する。加えて、エージェントが実行時に持つ環境・権限を認可された最小限に絞れば、仮に実行が成立しても認証情報や鍵の全継承を避けられる。事前証明は検出に対する代替ではなく **補完** であり、両層の組み合わせで AI コーディングエージェントの trust boundary が確立される。研究者自身も、untrusted なコードを「任意コマンドを実行でき、鍵・秘密・ホストに届くエージェント」に渡さないことを推奨しており、これは実行と来歴検証を切り離さないという同じ要請の運用側の表現である。

本事象で露呈した検出と証明の落差（エージェントが untrusted なコードを、その来歴の独立検証から切り離したまま実行し、しかも環境を全継承する）に対して、Lemma は、エージェントがコードを実行に移す前に、その来歴と実行の認可を独立検証可能な暗号証明として要求する設計を提示している。

- **行動前の来歴・認可証明（proof-as-auth）**: バイナリやスクリプトを実行する前に、「このコードは正規の来歴に由来し、この実行はこのスコープで認可されている」ことを署名付きで証明する。「審査対象のフォルダに入っていた」「モデルが安全と判断した」ことを実行の終点にしない
- **コードの来歴バインド**: エージェントが実行しようとする成果物を、既知の upstream・署名された配布元に紐付けて来歴を検証し、外部から注入されたバイナリ・スクリプトを、正規に配布されたものから区別する。名前や文字列の一致（見た目）ではなく、発行の真正性で判定する
- **スコープ付き権限と最小環境**: エージェントが実行時に持つ環境・権限を操作ごとに最小化し、環境変数・Git 認証情報・鍵の全継承を、証明された必要範囲に絞る。認可の範囲を超える実行を証明なしには成立させない
- **選択的開示**: 「この実行が認可スキーマを満たす」ことだけを最小開示し、内部の鍵・資格情報は環境外に出さない

これにより、実行の時点で固定された証明が、「このコードは正規の来歴を持ち、この実行は認可されているか」を、エージェントが untrusted なコードを行動に移す前に独立検証可能なトレイルとして機能させる。検出（事後の開示・手口の可視化・注入パターンの監視）は発覚後の是正に、事前証明（実行前の来歴・認可検証）はエージェント操作の独立検証に、それぞれ相補的に働く。

---

## 6. Sources

- **AI Now Institute（研究・一次）**: Boyan Milanov, Heidy Khlaaf, “Friendly Fire: Hijacking Defensive Cyber AI Agents for Remote Code Execution”（2026-07-08）— <https://ainowinstitute.org/publications/friendly-fire-exploit-brief>
- **GitHub（再現用リポジトリ・一次）**: Boyan-MILANOV, “friendly-fire-ai-agent-exploit”（ペイロード除去済み）— <https://github.com/Boyan-MILANOV/friendly-fire-ai-agent-exploit>
- **The Hacker News**: “Top AI Agents Built to Catch Malicious Code Can Be Tricked Into Running It”（2026-07-09）— <https://thehackernews.com/2026/07/friendly-fire-ai-agents-built-to-catch.html>
- **Adversa（関連研究）**: “TrustFall: Coding Agent Security Flaw Enables One-Click RCE in Claude, Cursor, Gemini CLI and GitHub Copilot”（2026-05）— <https://adversa.ai/blog/trustfall-coding-agent-security-flaw-rce-claude-cursor-gemini-cli-copilot/>
- **Ars Technica（背景・maintainer によるインジェクション事例）**: “Fed Up with Vibe Coders, Dev Sneaks Data-Nuking Prompt Injection into Their Code”（2026-05-28）— <https://arstechnica.com/security/2026/05/fed-up-with-vibe-coders-dev-sneaks-data-nuking-prompt-injection-into-their-code/>
- **NIST NVD（サンドボックス脱出欠陥）**: “CVE-2026-39861 Detail” — <https://nvd.nist.gov/vuln/detail/CVE-2026-39861>
