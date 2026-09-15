---
brief_no: 147
title: "GitSpawn：リポジトリの git 設定が、7 種の AI コーディングエージェントでユーザー承認前のコード実行を許した — リポジトリ由来の設定を実行してよいかを、サブプロセスを起こす前に確かめる層が無い"
title_en: "GitSpawn: A Repository's Own Git Config Ran Code in Seven AI Coding Agents Before the User Approved Anything — nothing checks whether a repo-supplied config may run before the subprocess starts"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [code-provenance]
incident_date: 2026-09-01
published: 2026-09-15
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["139-agent-framework-trust-boundary-checkpoint"]
status: published
version: "1.0"
og_lead_ja: "GitSpawn：AIコーディングエージェント7種、git設定でコード実行"
og_lead_en: "GitSpawn: seven AI coding agents run code via git config"
---

## 1. TL;DR

2026年9月1日、セキュリティ企業Manifold Securityが「GitSpawn」と名づけた脆弱性クラスを公開した。Claude Code、OpenAI Codex、Cursor、Goose、Qwen Code、Grok Build、Hermes Agentという主要なAIコーディングエージェント7種すべてで、リポジトリを開いただけでコードが実行される経路が見つかった。原因は、エージェントが起動時に自動で行う`git status`のようなありふれたコマンドが、リポジトリ自身が持つ`.git/config`の設定(`core.fsmonitor`など、gitが差分確認を高速化するために使う設定)を無検証のまま読み込み、そこに書かれた任意のコマンドを実行してしまう挙動にある。この実行は、ユーザーがワークスペースの信頼を承認する前、場合によっては認証やプロンプト送信より前に、サンドボックス(エージェントが安全に動作するよう隔離された実行環境)の外側で発生する。8件の脆弱性のうち4件は、公開時点でも未修正のままだった。本稿執筆時点(2026年9月15日)では、このうちHermes AgentとQwen Codeが修正済みとなり、Grok BuildとClaude Codeの`ultrareview`経路は修正を確認できていない。

検出は効いていた。研究者は8件すべてを動画付きの再現手順とともに示し、うち2件にはCVEが付与され、5件は独立した複数の研究者から重複して報告されていた。**効かなかったのは、そのコマンドを実行する前に、リポジトリ由来の設定を実行してよいかを確かめる層である。**

---

## 2. 何が起きたか

- **対象**: Claude Code、OpenAI Codex(CLI/Desktop)、Cursor、Goose、Qwen Code、Grok Build、Hermes Agentという主要なAIコーディングエージェント7種。5製品だけでGitHubスター数は合計およそ50万(Hermes Agent 237,000超、Claude Code 143,000超、Goose 54,000超、Qwen Code 27,000超、Grok Build 26,000)、Claude Codeは月7,700万件超のnpmダウンロードがある
- **発見者**: Manifold Security(攻撃的セキュリティ研究者Francisco Rosales)。2026年9月1日に技術ブログで研究結果を公開
- **見つかった脆弱性**: 8件。CVE(公開の脆弱性データベースに登録される共通識別番号)が付与されたのは2件(Goose: CVE-2026-72718、CVSS(脆弱性の深刻度を0〜10で表す指標)7.0/Hermes Agent: CVE-2026-71963、独立採番機関VulnCheckによる付番)。OpenAIは同日、Codexの同種脆弱性について独自に3件のCVE(CVE-2026-19592を含む)を公表した。3組の無関係な研究者からの報告だという
- **公開時点で未修正**: Hermes Agent、Qwen Code、Grok Build、Claude Codeの`ultrareview`経路(`core.fsmonitor`とは別の設定キーを使う。悪用防止のためManifoldは当該キー名を公開していない)の4件。このうちHermes Agentは2026年9月2日、Qwen Codeは9月12日に修正が取り込まれた(下記時系列)

攻撃は次の連鎖で成立している。

1. 攻撃者が、`.git/config`を含んだ状態のリポジトリを用意し、`core.fsmonitor`(またはそれに類する設定キー)に任意のコマンドを仕込む。`git clone`ではこの設定ファイルは運ばれないため、zipファイル、共有ドライブ、同期フォルダ、USBメモリなど「ディレクトリごと渡す」経路が使われる
2. 被害者がそのフォルダをAIコーディングエージェントで開く
3. エージェントが起動時、あるいは最初のやり取りより前に、いまのブランチや変更されたファイルを把握するため、`git status`や`git diff`といった通常のコマンドをバックグラウンドで実行する
4. gitがそのコマンドの実行前にインデックスを更新する際、リポジトリの`.git/config`にある`core.fsmonitor`の値を読み込み、そこに書かれたコマンドを実行する
5. コマンドはサンドボックスの外側で、ユーザーの権限のまま、承認プロンプトも画面表示もなく実行される。これはエージェント自身のプログラムがgitを裏側で呼び出す(サブプロセスとして起動する)処理であるため、エージェントの権限管理の仕組みそのものが働く前に終わってしまう。攻撃者はSSH鍵、環境変数のクラウド認証情報、シェル設定のトークン、ディスク上の全リポジトリ、そして端末への足がかりを得る

---

## 3. 時系列 — 公表と対応

- 2026-06-26: Manifold、Claude Codeの`core.fsmonitor`経路を報告。同日に他の研究者から提出された報告と重複と判定される
- 2026-06-29: Claude Codeの`core.fsmonitor`経路がバージョン2.1.196で修正される(Anthropicは個別のアドバイザリを公開せず)
- 2026-07-07: Manifold、Qwen Codeの脆弱性をAlibaba security response centreへ報告。受理される
- 2026-07-13: Manifold、Gooseの脆弱性を報告
- 2026-07-14: Manifold、Grok Buildの脆弱性を報告。7月1日付の別研究者による報告(xAIは当時「情報提供」としてクローズ)と重複と判定される
- 2026-07-15: Manifold、Claude Codeの`ultrareview`経路を報告。社内チケットとの重複と判定される
- 2026-07-20: Manifold、Hermes Agentの脆弱性を報告。5つの連絡経路で6回接触を試みるも、一次審査(トリアージ)がされないまま
- 2026-09-01: Manifold、全8件を最新版で再検証したうえで研究結果「GitSpawn」を公開。Goose(1.44.0)とCursorは修正済み、OpenAI Codexは同日CVE-2026-19592を含む3件を公表・修正済み。Hermes Agent(0.21.0)、Qwen Code(0.22.3)、Grok Build(1.0.13)、Claude Codeの`ultrareview`経路(2.1.252)は未修正のまま再確認された
- 2026-09-02: The Hacker Newsが報道。同日、Hermes Agentが修正を取り込む(GHSA-7x36-8jrh-v4pw)
- 2026-09-03: CVE-2026-71963が公開される。GitHub Security Advisory(GHSA-cc88-9pxf-j2wv)は対象を0.18.2〜0.21.0とし、commit f6234d0で修正と記録している
- 2026-09-12: Qwen Codeが修正を取り込む(エージェント自身が出すgit呼び出しが、設定で指定されたプログラムを実行しないようにする変更)。9月14日のv0.23.4で出荷

> 公開情報の性格について: 8件のうち5件は、Manifold以外の研究者が独立に発見していた報告と重複していた(うち1件は同日提出)。複数の方向から同じ脆弱性クラスが見つかっていたことになる。公開時点で未修正の`ultrareview`経路については、Manifoldは悪用リスクを避けるため設定キー名を明かしていない。

公表後の対応と業界の動きは次のとおり。

- **Goose**: メンテナがCVE-2026-72718(CVSS 4.0で7.0)を採番し、1.44.0で修正した
- **Claude Code**: `core.fsmonitor`経路は2.1.196で修正されたが、個別のアドバイザリは公開されなかった。`ultrareview`経路は2.1.252時点で未修正と確認されている。Anthropicは過去にも起動前実行の問題を開示しており、2026年6月のCVE-2026-55607はワークツリー操作中のfsmonitor実行を扱う。セキュリティ企業Sonarも2025年4月に同種のシンクを報告し、当時は起動シーケンスの変更で緩和されたが、関連する挙動は残っていたとされる
- **OpenAI**: Codex CLI/Desktopについて3件のCVE(CVE-2026-19592含む)を同日公表し、修正済みとした。3組の無関係な研究者からの報告としている
- **Qwen Code**: Alibaba security response centreが2026年7月7日に受理したが、9月1日時点で未修正。その後9月12日に修正が取り込まれ、9月14日のv0.23.4で出荷された
- **Grok Build**: xAIは7月1日の別研究者による報告を「情報提供」としてクローズし、Manifoldの7月14日報告もその重複としてクローズした。9月1日時点で未修正であり、本稿執筆時点でも修正を確認できていない
- **Hermes Agent**: 開発元へ5つの連絡経路で6回の接触を試みたが応答がなく、CVE-2026-71963は独立採番機関VulnCheckが付番。修正は9月2日に取り込まれ、CVEは9月3日に公開された(GHSA-cc88-9pxf-j2wv)

米CISAの既知悪用脆弱性カタログ(2026.09.01版、1,687件収録)にはこれら8件のいずれも掲載されておらず、実際の悪用は報告されていない。

---

## 4. なぜ止まらなかったか

この事案の失敗は、特定ベンダーの実装ミスでも、AIモデル自体の欠陥でもない。**エージェントが起動時に自動で行う「ふつうのgit操作」が、リポジトリ自身の設定を無検証のまま実行していた**ことにある。検出は効いていた。研究者は8件すべてを動画付きの再現手順とともに示し、うち2件にはCVEが付き、5件は独立した複数の研究者から重複して報告されていた——複数の方向から同じ穴が見つかるほど、この挙動は見えやすいものだった。**効かなかったのは、そのコマンドを実行する前に、リポジトリ由来の設定を実行してよいかを確かめる層である。**

`core.fsmonitor`はgitの正規の機能であり、バグではない。大きなリポジトリで差分確認を高速化するための設定で、gitはこれをリポジトリ自身が持つ`.git/config`というファイルから読み込む。エージェントが起動時に「いまどのブランチにいるか」「どのファイルが変更されたか」を把握するために`git status`や`git diff`を実行するのはごく普通の処理であり、それ自体は何も間違っていない。問題は、そのバックグラウンド処理が、ワークスペースの信頼を承認するダイアログよりも先に、時には認証すら済んでいない段階で、リポジトリの設定を漉さずに実行してしまう設計になっていたことだ。承認の仕組みは存在したが、それが働く前に実行が終わっていた。

この構造は7つのエージェントすべてに共通していた。脆弱性はモデルにも、目新しい攻撃技術にもない。エージェントがセッション開始時に「自分がどこにいるか」を把握するために立ち上げるサブプロセスという、ごくありふれた仕組みの中にある。だからこそ一社の実装ミスではなく、業界に共通する見落としだったといえる。

> 「脆弱性はモデルにあるのではない。目新しい何かがあるのでもない。エージェントがセッション開始時に、自分がどこにいるかを把握するために立ち上げるサブプロセス——ごくありふれた配管の中にある。」——Manifold Security

---

## 5. 証明があれば、何が変わるか

リポジトリを受け取った側が、その設定やコードの出所を実行前に確かめられれば、この経路は成立しない。事前証明は、エージェントがサブプロセスを起動する前に、「このリポジトリの設定は検証済みの発行元に由来する」ことを、ワークスペース信頼ダイアログや承認プロンプトとは独立に検証可能な証拠として要求する。証明が伴わなければ、未検証の設定を含むリポジトリでの自動実行を既定で拒否する。

Lemmaがこの落差に対して提示する設計は次の通りである。

- **コード来歴の実行前証明**: リポジトリ・コミット・設定ファイルが検証済みの発行元やビルドパイプラインに由来することを、エージェントがそれを読み込む前に暗号学的に確認できるようにする
- **サブプロセス実行のスコープ付き認可**: エージェントが起動時に行うgit操作のような背景処理を、「どの設定値まで信頼してよいか」を明示的に区切った権限の範囲内でのみ実行させる
- **未検証な設定は実行前に拒否**: 出所が証明されない`.git/config`のようなリポジトリ内設定は、実行前に既定で無効化する

担わないものも、あわせて書いておく。

- **git自体の脆弱性修正**: `core.fsmonitor`は正規機能であり、Lemmaがgitの実装を変えるものではない
- **各エージェントベンダーのパッチ適用**: 個々の製品の修正判断・リリースはベンダー自身の責任である

事後のスキャナーやEDR(端末の不審な挙動を監視し続けるセキュリティ製品)との違いはここにある。EDRは「見慣れた開発ツールが見慣れた動作をしている」としか見えず、既知のパターンとして検出するまでに時間がかかる。事前証明は、その動作が発生する前に出所を確かめる。検出の層と、この層は代替ではなく補完の関係にある。前者は実行後の異常な挙動を見つけ出し、後者は実行そのものが検証済みの出所に基づくことを、行動の前に確かめられるようにする。

---

## 6. Sources

- **Manifold Security（一次・独自調査）**: "GitSpawn: A Single Flaw Lets Untrusted Repos Run Code in Claude Code, Codex, Cursor, and Grok"（2026-09-01） — <https://www.manifold.security/blog/ai-coding-agents-git-hijack>
- **The Hacker News（独立報道）**: "Malicious .git Configs Can Make Claude, Codex, Cursor, and Other AI Agents Run Attacker Code"（2026-09-02、Swati Khandelwal） — <https://thehackernews.com/2026/09/malicious-git-configs-can-make-claude.html>
- **GitHub Security Advisories（一次・脆弱性記録）**: "GHSA-r5pp-p5r8-466r"（Goose、CVE-2026-72718） — <https://github.com/aaif-goose/goose/security/advisories/GHSA-r5pp-p5r8-466r>
- **CVE.org（一次・脆弱性記録）**: "CVE-2026-71963"（Hermes Agent、VulnCheck採番） — <https://www.cve.org/CVERecord?id=CVE-2026-71963>
- **GitHub Security Advisories（一次・脆弱性記録）**: "GHSA-cc88-9pxf-j2wv"（Hermes Agent、CVE-2026-71963、2026-09-03公開） — <https://github.com/advisories/GHSA-cc88-9pxf-j2wv>
- **Sonar（独立解析）**: "Arbitrary Code Execution in Claude Code"（2026年4月、同種シンクの先行報告） — <https://www.sonarsource.com/blog/claude-arbitrary-code-execution/>

参照: 検出と証明の関係については[「AI時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。設計の詳細は[エージェント権限証明](https://lemma.frame00.com/ja/pillars/#authority)。

修正状況は、Manifold Securityによる2026年9月1日時点の再検証を基点に、本稿執筆時点(2026年9月15日)の公開記録で更新している。Hermes AgentはGitHub Security Advisory、Qwen Codeは公開リポジトリの変更履歴が根拠。Grok BuildとClaude Codeの`ultrareview`経路については、ベンダー自身の公式アドバイザリも修正の記録も確認できていない。

