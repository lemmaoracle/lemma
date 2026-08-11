---
brief_no: 128
title: "コーディングエージェント3種を既定構成で突破：harness が「安全」と印付けた値を、後段がより強い権限で実行した — issue 1 件で CI が乗っ取られる"
title_en: "Three coding agents broken in their default config: the harness marked a value safe, and a later stage acted on it with more authority"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "code-provenance"]
incident_date: 2026-08-05
published: 2026-08-11
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["062-claude-code-github-action-bot-trust", "095-amazon-q-mcp-auto-execution", "114-aws-kiro-self-rewriting-mcp-config", "037-agent-config-auto-execution", "099-agentjacking-sentry-mcp", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "1.0"
og_lead_ja: "コーディングエージェント3種を既定構成で突破 — issue 1 件で CI 乗っ取り"
og_lead_en: "Three coding agents broken in default config — one GitHub issue reaches CI"
gap_detected: "検出は効いた。各社のエージェントには許可リスト・コマンド検査・sandbox があり、値を安全と印付ける層は設計として在った。"
gap_missing: "安全と印付けたその値を、実際に行動へ移す一段手前で、来歴と認可を独立に確かめる層が無かった。"
gap_fix: "行動の直前に、その値がどこから来て何を許されているかを独立に検証する一段を挟む。"
analysis_lead_ja: "確かめられないのは、値が安全かどうかではない。安全と印付けたその値を、行動の一段手前で改めて確かめる層が在るか、である。"
analysis_lead_en: "The question isn't whether a value was marked safe. It's whether anything re-checks that value, independently, at the step where it becomes an action."
---

## 1. TL;DR

セキュリティ企業 Novee Security は、Anthropic の Claude Code・Google の Gemini CLI・OpenAI の Codex を、いずれも各社が出荷する既定構成のまま攻撃し、2026 年 8 月 5 日の Black Hat USA で公表した。権限を持たないアカウントが GitHub の issue を 1 件立てるだけで、Anthropic と Google の自社リポジトリの CI ランナー上でコードが実行され、OpenAI では次のエージェント実行が乗っ取られた。CVE は 2 本、いずれも修正済みである。共通していたのは、モデルを賢く騙したことではない。**効かなかったのは、ある層が「安全」と印付けた値を、後段がより強い権限で実行する——その手前で来歴と認可を独立に確かめる層である。**

## 2. 何が起きたか

- Novee は 3 社のコーディングエージェントを、ベンダーが提供するデフォルトの CI ワークフローで検証した。攻撃の入口は「モデルに何かを吹き込むこと」ではなく、エージェントを取り巻く harness（モデルと現実の間で「実際に何を実行するか」を決めるコード）にあった。3 例とも、権限を持たない任意の GitHub ユーザーが issue を立てるだけで起動する。
- **Gemini CLI**（CVE-2026-12537）：コンテナ起動処理の OS コマンドインジェクション。細工した `.gemini/.env` ファイル経由で、ヘッドレス CI 上で sandbox が立ち上がる前にホスト権限のコード実行に至る。Novee の実証では、実行されたコードが同一 PID 名前空間の親プロセスの環境変数（`/proc/$PPID/environ`）をそのまま読めた——`unshare` も `hidepid` も挟まっておらず、CI の秘密情報がそこに露出していた。
- **Gemini CLI の許可リスト（CVE 無し）**：設定に `run_shell_command(echo)` と登録しても、Novee によれば `(echo)` の注釈は解釈も保存も強制もされず、`shell.ts` はコマンドが空でないことだけを確かめて `coreTools` を照合せずに戻る。関連して Google は先行する advisory（GHSA-wpqr-6v78-jr5g、2026-04-24、CVE 未付与）で、`--yolo` 下では細粒度の許可リストが無視されていたことを認め、0.39.1 でポリシーエンジンが `--yolo` 下でも許可リストを評価するよう是正した。この advisory は Novee の Elad Meged と Pillar Security の Dan Lisichkin を報告者として謝辞に挙げている。
- **Claude Code**（CVE-2026-54316）：Novee は `anthropics/claude-code`——Anthropic 自身のリポジトリで Anthropic 自身のエージェントが走る場所——に対して 3 ラウンドにわたり別々の連鎖を通し、ワークフローの `ANTHROPIC_API_KEY` と `GITHUB_TOKEN` を持ち出した。①コマンド検証器は 23 の検査を走らせる前に単一引用符で囲まれた文字列を除去する（bash として正しい挙動）ため、`git push --receive-pack='sh -c "…"'` の引数値に置いたペイロードが無検査でランナーへ届く——検証器の側からは「値が空のフラグ」に見える。②`tac`・`rev`・`fold` は読み取り専用として直書きされていたがパス検査が無く、`/proc/self/environ` を読んで公開の Actions サマリへ出せた。③`huggingface.co` が WebFetch の事前承認先として「ホスト名だけ」で登録されていたため、同ドメイン配下の任意のパス——攻撃者が用意した 1 文字につき 1 個・計 64 個のリポジトリ——が許可プロンプトも `--allowedTools` の制限も経ずに自動承認され、Hugging Face がサーバー側で計上する公開ダウンロードカウンタが 1 文字ずつの外部送信チャネルになった。
- **Anthropic は 3 ラウンドとも修正している**——git push の明示的な許可リスト（と大半の Bash ツールの削除）、`display_report` の停止と出力のサニタイズ、`huggingface.co` の docs パスへの限定。CVE-2026-54316 はこの連鎖の最後の 1 つに付与されたもので、修正は 2.1.163 に入っている。悪用には信頼できない内容を Claude Code の文脈へ入れる必要があると Anthropic は説明する。Novee は経過を「3 ラウンド。修正のたびに的が絞られ、攻撃のたびに静かになった——リバースシェルから、ログに反転して現れる秘密へ、そしてダウンロードカウンタへ」とまとめている。
- **Codex**：CVE も製品版の修正も出ていない。`openai/codex` リポジトリが 1 つのジョブ内で 2 回の Codex 実行を単一のチェックアウトで走らせ、攻撃者の issue 本文はそこにファイルとして書き出される。Codex が起動のたびに読み込む既定の指示ファイル `AGENTS.md` を 1 回目のパスが書き換え、2 回目がそれを自らの指示として読み込む。1 回目の出力をスキーマとして不正な JSON にすること——検証はその失敗を正しく捕捉する——が、2 回目を起動する引き金だった。OpenAI は自社の sandbox は文書どおりに振る舞ったとの立場である。

攻撃は次の連鎖で成立している。

1. 権限のないアカウントが、エージェントが読む場所（issue・リポジトリ同梱ファイル・Web 要約対象）に攻撃者由来の入力を置く。
2. harness の一部が、その入力または派生した値を「検証済み・安全」と印付ける（許可リスト登録・引用符除去・チェックアウト共有など）。
3. 後段の別の部分が、その印を信頼したまま、より強い権限で値を実行する（コンテナ起動・コマンド実行・次パスの指示読み込み）。
4. 結果として、sandbox 起動前のホスト実行・CI 秘密情報や API 鍵の持ち出し・次エージェント実行の乗っ取りに至る。

## 3. 時系列 — 公表と対応

- 2026-04-24：Google が Gemini CLI のフォルダ信頼とツール許可リストに関する advisory（GHSA-wpqr-6v78-jr5g）を公開する。CVE は付与されていない。修正は `@google/gemini-cli` 0.39.1 と `run-gemini-cli` 0.1.22 で、影響は「すべての Gemini CLI GitHub Actions に及ぶ」とされた。
- 2026-06-17：Claude Code の欠陥（CVE-2026-54316 / GHSA-fg94-h982-f3mm）が GitHub Advisory Database に公開される。
- 2026-06-24：Gemini CLI のコンテナ起動処理の欠陥（CVE-2026-12537 / GHSA-jj69-4grx-fqj5）が公開される。CNA は Google Cloud である。
- 2026-08-05：Novee が Black Hat USA で 3 社横断の検証を公表。創業エンジニアの Elad Meged が翌 8 月 6 日に自社ブログで詳細を示した。
- 2026-08-07：The Hacker News が、CISA の記録上いずれの CVE も悪用「なし」であり、両者とも同日時点で CISA の Known Exploited Vulnerabilities カタログに載っていないことを確認。同誌によれば Claude Code の欠陥の再現用と称する公開 GitHub リポジトリが 6 月 18 日から存在するが、いずれの連鎖も標的に対して使われた形跡は確認されていない。

> 本 Brief は実地の被害事案ではなく、既定構成に対する研究実証を扱う。修正状況は、Gemini CLI が 0.39.1／`run-gemini-cli` が 0.1.22、Claude Code が 2.1.163（0.2.54 から 2.1.163 未満までが対象）である。Codex の連鎖には製品版の修正版が無く、OpenAI はリポジトリ側で 2 パスを別ジョブ・別チェックアウトに分離して読み取り専用環境へ移し、リポジトリ同梱の指示ファイルを「信頼できない入力面の一部」として扱うよう案内を更新した。**CVSS 値は評価主体で分かれるため、単一の数値で重大性を語れない。** CVE-2026-12537 は CNA である Google Cloud の v4 評価が 10.0（Critical）、NVD 自身の一次評価は v3.1 で 7.8（High）である。CVE-2026-54316 は GitHub Advisory 上の v4 評価が 6.0（Moderate）、NVD の一次評価は v3.1 で 9.1（Critical）で、両者は同じ尺度の比較ではない。

公表後の対応と業界の動きは次のとおり。

- 3 社とも該当箇所を修正または運用面で緩和している。共通の緩和は「外部ユーザーが起動しうるワークフローの棚卸し」であり、加えて別々のエージェントに書き込み可能なディレクトリを共有させないこと、トークンをタスクごとに必要な権限へ絞ることが挙げられている。
- Codex の変更は、リポジトリ側のワークフロー修正と案内更新であり、Codex 自体が書き込み可能な指示ファイルを別扱いするようになったことを示すものではない。

## 4. なぜ止まらなかったか

この事案の失敗は、モデルが騙されたことでも、各社に検査の層が無かったことでもない。**ある層が「安全」と印付けた値を、後段がより強い権限で実行する——その二つの層の間に、値の来歴と許される範囲を独立に確かめ直す一段が無かった**ことにある。

検出の層は在った。許可リストも、コマンド検査も、sandbox も設計として存在する。効かなかったのはその手前——印を付けた層と、印を信頼して実行する層のあいだである。Gemini CLI では許可リストに書いた細粒度の指定が実行時に照らされない。Claude Code の検証器は bash として正しく引用符を外すが、外した後の値がより強い権限へ渡る。Codex は 1 回目のパスの出力を 2 回目が自らの指示として信頼する。いずれも、印を付けた層が正しく振る舞っていても、その印を実行の瞬間に照らし直す層が無い。

> harness は、モデルと現実の間のコードである。そこで繰り返し起きていたのは、ある部分が値を安全と印付け、後の部分がその値をより強い権限で行動に移した、という一点だった。

これは、リポジトリ同梱の設定を無検証で実行した [Brief 037](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)、自らの MCP 設定を書き換えさせられた [Brief 114](https://lemma.frame00.com/ja/critical/briefs/114-aws-kiro-self-rewriting-mcp-config/)、リポジトリを開くだけで同梱 MCP 設定が実行された [Brief 095](https://lemma.frame00.com/ja/critical/briefs/095-amazon-q-mcp-auto-execution/) と同じ構造を共有する。共通するのは、エージェントの権限が「どこから来た指示か・何を許されているか」に結び付いていないことである。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、harness が値を「安全」と印付ける層と、その値を実行する層のあいだに、来歴と認可を独立に確かめる一段を挟む。値の中身が悪性かを機械が判定するのではない。「この値はどこから来て、この行動を許されているのか」を、行動が成立する前に、実行側が発行者に問い合わせずに確かめられる形にする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>行動前の認可証明</strong>：コンテナ起動・コマンド実行・指示読み込みといった強い権限の行動の直前に、その行動がスコープ内で認可されていることの証明を要求する。印を信頼するのではなく、行動の瞬間に照らし直す。</li>
<li><strong>入力の来歴バインド</strong>：エージェントが読む値（issue 本文・同梱ファイル・前パスの出力）に、どこから来たかの来歴を束ねる。権限のないアカウント由来の入力が、特権的な行動へそのまま昇格しない。</li>
<li><strong>スコープの固定</strong>：許可リストを登録時ではなく実行時に、行動ごとに検証する。登録と実行のあいだで許される範囲がずれない。</li>
<li><strong>秘密情報の選択的開示</strong>：API 鍵や CI 秘密情報を、エージェントの応答経路へ素通しさせず、必要な検証だけを提示する形にする。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>入力が悪性かどうかを判定するのは、この結び付きを前提にした検査とスキャナーである。</li>
<li>証明が示せるのは行動が認可されていたかまでで、モデルの推論が正しかったかまでは示せない。</li>
<li>ワークフローにゲートを置くのは運用者であり、この層が出せるのはその判断材料までである。</li>
</ul>

自社の操作ログとの違いはここにある。ログは自社が自社のために出すものであり、行動が認可されていたかを、行動の相手や監査側が独立に確かめられない。

Lemma はプロンプトインジェクションを検知する製品ではなく、モデルの誤りを正すものでもない。コマンド検査・sandbox・許可リストといった検出の層は、この層と代替ではなく補完の関係にある。前者は悪性の入力を弾き、後者は「安全と印付けた値がより強い権限で実行される」その一点を、行動の前に閉じる。

## 6. Sources

- **Novee Security（研究一次）**: Elad Meged「Black Hat 2026: If You Run These Automations, You're Exposed Too: Critical Flaws in Anthropic, Google, and OpenAI's Coding Agents」（2026-08-06 公開、Black Hat USA 2026-08-05 で発表）— <https://novee.security/blog/critical-flaws-in-anthropic-google-and-openais-coding-agents/>
- **GitHub Advisory Database（一次・公式発表）**: CVE-2026-12537 / GHSA-jj69-4grx-fqj5（CNA: Google Cloud、2026-06-24）— <https://github.com/advisories/GHSA-jj69-4grx-fqj5>
- **Google（一次・公式発表）**: Gemini CLI のフォルダ信頼とツール許可リストに関する advisory GHSA-wpqr-6v78-jr5g（2026-04-24、CVE 未付与）— <https://github.com/google-github-actions/run-gemini-cli/security/advisories/GHSA-wpqr-6v78-jr5g>
- **Anthropic（一次・公式発表）**: Claude Code security advisory GHSA-fg94-h982-f3mm（2026-06-17）— <https://github.com/anthropics/claude-code/security/advisories/GHSA-fg94-h982-f3mm>
- **NVD（一次・公式発表）**: CVE-2026-54316（NVD 一次評価 v3.1 9.1、GitHub Advisory の v4 評価 6.0 を併記）— <https://nvd.nist.gov/vuln/detail/CVE-2026-54316>
- **The Hacker News（独立報道）**: Swati Khandelwal「Claude Code and Gemini CLI Flaws Let a GitHub Issue Reach CI Workflow Secrets」（2026-08-07）— <https://thehackernews.com/2026/08/claude-code-and-gemini-cli-flaws-let.html>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。設計は[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、適用範囲は [Pillar 03 — エージェント権限](https://lemma.frame00.com/ja/pillars/#authority)
