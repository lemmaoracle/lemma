---
brief_no: 62
title: "AI コーディングエージェントが、`[bot]` を名乗る 1 件の issue を信頼して特権実行した（Claude Code GitHub Action） — エージェントの起動者の権限と入力の出所が、実行の前に独立検証されない構造（GMO Flatt Security）"
title_en: "One Issue, Full Repo Takeover — When the Agent Trusted \"[bot]\" (Claude Code GitHub Action)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "ai-decision-integrity"]
incident_date: 2026-06-04
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["037-agent-config-auto-execution", "029-github-dev-oauth-token", "048-trapdoor-ai-instruction-provenance", "003-starlette-badhost"]
status: published
version: "1.0"
og_lead_ja: "issue 1 件で AI エージェントにリポジトリを乗っ取られる — Claude Code GitHub Action"
og_lead_en: "One GitHub issue hijacks the repo via the agent — Claude Code GitHub Action"
---

## TL;DR

開発チームが CI に AI を組み込み、寄せられた issue を AI に仕分けさせる——いまや普通の運用だ。だが、その AI が「issue を立てた相手は信頼してよいか」を確かめずに、書かれた内容を指示として実行したら、issue 1 件でリポジトリを乗っ取られる。2026 年 6 月、研究者 RyotaK（GMO Flatt Security）は、Anthropic の Claude Code GitHub Action に、たった 1 件の悪意ある GitHub issue で脆弱なリポジトリを乗っ取れる欠陥を公開した。トリガ判定が、名前が `[bot]` で終わるアクターを無条件に信頼していたため、誰でも自作の GitHub App を使って公開リポジトリに issue を立て、エージェントを起動できた。そこに間接的なプロンプトインジェクションを重ね、エラーメッセージを装った issue で Claude に環境変数（秘密情報）を吐き出させ、最終的に OIDC トークン交換用の認証情報を奪い、対象リポジトリへの書き込み権限を握れる。Anthropic 自身の Action リポジトリも同じワークフローを使っていたため、Action そのものを汚染し下流へ波及させる経路も成立しえた。Anthropic は報告から 4 日で修正し（v1.0.94）、CVSS 4.0 で 7.8、バグバウンティを支払った。本事案を Pillar 03（エージェント権限証明）の観点から、**エージェントの起動者の権限と入力の出所が、特権的な行動を起こす前に独立検証されない**構造として分析する。Brief 037（エージェントが同梱設定を無検証で自動実行）・048（AI 指示ファイルに見えない命令）・029（過剰スコープ OAuth トークン窃取）に連なる。

---

## 1. 事案概要

- **対象**: Anthropic の Claude Code GitHub Action（claude-code-action）。CI/CD に Claude を組み込み、issue の仕分け、ラベル付け、プルリクエストのレビュー、スラッシュコマンド実行を担わせる。既定でリポジトリのコード・issue・PR・ディスカッション・ワークフローファイルに読み書き権限を持つ
- **識別子と深刻度**: CVSS 4.0 で 7.8。修正版は claude-code-action v1.0.94。Anthropic はバグバウンティを支払い
- **報告者と経緯**: 研究者 RyotaK（GMO Flatt Security）が中核のバイパスを 2026 年 1 月に Anthropic へ報告。Anthropic は 4 日で修正し、春にかけて追加の堅牢化。公開は 2026-06-04（The Hacker News ほか）
- **中核の欠陥（起動者の権限）**: トリガ判定（`checkWritePermissions`）が、**名前が `[bot]` で終わるアクターを無条件に信頼**していた（GitHub App は管理者が導入する信頼できるものという前提）。だが誰でも GitHub App を登録し、自分のリポジトリに導入し、そのインストールトークンで任意の公開リポジトリに issue / PR を作成できる。Action は「bot だ」と見て攻撃者の内容を通した。tag モードには人間確認の追加チェックがあったが、agent モードには無く露出した
- **連鎖（入力の出所）**: 攻撃者は間接的なプロンプトインジェクションを用いる。エラーメッセージを装った issue 本文に命令を仕込み、Claude が「復旧」しようとしてその命令を実行するよう調整する。標的は `/proc/self/environ`（秘密情報を含む環境変数）。Claude は素朴な読み取りを遮断するが、それを迂回させ、値を issue に書き戻させて攻撃者が回収する
- **最終到達**: 環境変数中の本命は、GitHub Actions が OIDC トークン（「自分はこのリポジトリで動くこのワークフローだ」を証明する署名付きトークン）を要求する認証情報の組。Claude Code はそれを Anthropic バックエンドと交換し、書き込み権限を持つ Claude GitHub App のインストールトークンを得る。この認証情報を奪って交換を再現すれば、対象のコード・issue・ワークフローへの書き込み権限を握れる。claude-code-action リポジトリ自体を狙えば、下流が取り込む Action を汚染しうる

---

## 2. タイムライン

- 2026-01: RyotaK が中核のバイパスを Anthropic へ報告。Anthropic が 4 日で修正
- 2026 春: 追加の堅牢化が継続。修正は claude-code-action v1.0.94 に集約
- 2026-06-04: 脆弱性の詳細が公開（GMO Flatt Security の研究記事、The Hacker News ほか）

> 注: 本事案は coordinated disclosure（修正提供後の公開）として処理された。Anthropic 自身の Action を汚染する「この経路そのもの」が実環境の標的に使われた公開された痕跡はなく、RyotaK は自身のテストリポジトリでのみ実証している。一方、同型の構成（AI issue トリアージ＋広い権限＋プロンプトインジェクション）は、2026-02 の Cline の claude-code-action ワークフローで npm 公開トークンが盗まれ不正版が公開された事例など、別系統で現実の被害を生んでいる。RyotaK は権限システムを迂回する手法を約 50 件報告したとしている。

---

## 3. 攻撃ベクター

本事案は、エージェントの起動者の権限と入力の出所が、特権的な行動の前に独立検証されないことに起因する。経路は以下の通り。

1. **起動者のなりすまし**: 攻撃者が自作の GitHub App を登録・導入し、そのトークンで対象の公開リポジトリに issue を作成する。Action は名前が `[bot]` で終わるアクターを信頼して起動する（agent モードは人間確認を欠く）
2. **入力へのプロンプトインジェクション**: issue 本文をエラーメッセージに見せかけ、Claude が「復旧」として埋め込まれた命令を実行するよう誘導する。目視の文面と、AI が指示として読む内容が乖離する
3. **秘密情報の吐き出し**: `/proc/self/environ` を標的に、ガードを迂回させて環境変数（秘密情報を含む）を issue に書き戻させる
4. **認証情報の奪取と再現**: 環境変数中の OIDC トークン交換用認証情報を奪い、交換を再現して、書き込み権限を持つインストールトークンを得る
5. **下流への波及**: 対象のコード・issue・ワークフローへ書き込む。claude-code-action リポジトリ自体を狙えば、下流が取り込む Action を汚染しうる（サプライチェーンへの波及）

補助経路として、Anthropic の例示ワークフローが `allowed_non_write_users: "*"`（誰でも起動可、ドキュメント上もリスクと明記）を同梱し、Claude がタスク要約を**公開される**実行サマリ欄に投稿していたため、これを写したリポジトリが同じ穴を継承した。また、起動権限のない攻撃者も、信頼ユーザーの issue が起動した後・Claude が読む前に編集を差し込めば、ペイロードを「信頼された入力」として紛れ込ませられた。

---

## 4. 構造的論点

本事象は Pillar 03（エージェント権限証明）の `agent-infrastructure` カテゴリに属する。中心的な失敗 primitive は、**エージェントが特権的な行動（広い権限での CI 実行）を起こす前に、「誰がエージェントを起動したか・その起動者は正当な権限を持つか」と「読み込んだ入力の出所は信頼できるか」を独立検証していない**点にある。`[bot]` という名前の接尾辞を権限の証明と取り違え、issue 本文という未検証入力を指示として特権文脈で実行した。secondary に `identity-auth`（起動者の認証）と `ai-decision-integrity`（AI が読む入力の完全性）を併記する。

本事案は Brief 037（AI コーディングエージェントがリポジトリ同梱の設定ファイルを無検証で自動実行した）と同型で、**エージェントが、起動・入力の出所を検証しないまま、広い権限で行動する**構造である。037 が同梱設定の自動実行、本事案が外部 issue による起動という入口の違いはあるが、いずれも「エージェントの行動を起こす権限が、起動者・入力の正当性の独立検証と切り離されている」点で一致する。Brief 048（AI 指示ファイルに見えない命令）・Brief 024（不可視 Unicode の指示インジェクション）とは、目視の文面と AI が指示として読む内容の乖離という primitive で連なる。Brief 029（過剰スコープ OAuth トークンの窃取）とは、奪われたトークンが行動の範囲にスコープされていない点で接続する。

要点は、AI を使うこと自体ではない。AI を CI に組み込む運用は生産性に資する。欠けていたのは、**エージェントが行動を起こす前に、起動者の権限と入力の出所を独立検証する層**である。実トークンと実ツールを持つエージェントは、権限が許す限りどこまでも押し込まれうる。プロンプトインジェクションが未解決である以上、入力の信頼を前提にした設計は、入口ひとつで権限境界が崩れる。

---

## 5. 検出と証明の落差

脆弱性の発見と coordinated disclosure、迅速なパッチ提供、CI ログの監査は、本事案でも機能し、再発抑止に不可欠である。本 Brief がその役割を否定するものではない。Anthropic は報告から 4 日で修正し、追加の堅牢化を続けた。

一方で、検出は「いまエージェントを起動したアクターが正当な権限を持つか」「いま読み込んだ入力が信頼できる出所か」を、**行動の前に**独立に立証する材料にはならない。`[bot]` を名乗るアクターの起動も、エラーメッセージを装った issue も、システムからは正規のトリガ・正規の入力と区別がつかない。事後のログ解析は「何が実行されたか」を再構成するが、「その実行は、起動者の権限と入力の出所を独立検証したうえで認可されていたか」には答えない。パッチは個別の穴を塞ぐが、プロンプトインジェクションという入力の信頼問題自体は未解決のまま残る。

事前証明（pre-execution attestation）は、エージェントの行動を権限行為として扱い、実行の前に「起動者は正当な権限を持つか」「入力はどの出所に由来し、改ざんがないか」を独立検証可能な証明として要求する設計を採る。`[bot]` という名前ではなく起動者の権限属性を、issue 本文の体裁ではなく入力の来歴を、行為の時点で検証可能にすれば、未検証の起動・入力に基づく特権実行は行動の前に block される。さらに、OIDC トークン交換のような認可は、奪われた認証情報の再現では満たせない、行動ごとにスコープされた証明に置き換えられる。脆弱性の検出（detection 的な「どこに穴があるか」）と権限・入力の証明（「その行動は起動者の権限と入力の出所を独立検証して認可されたか」）は代替ではなく **補完** の関係にある（行為の時点で来歴・認可を独立検証する考え方は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、検出と事前証明の thesis は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）を参照）。

---

## 6. 対応経緯と業界動向

- **Anthropic**: 報告から 4 日で中核を修正し、春にかけて堅牢化。修正は claude-code-action v1.0.94 に集約。利用者には、書き込み権限のないユーザーや bot が Claude を起動できるワークフローの監査、未検証入力を扱う場合に Anthropic API キーと `GITHUB_TOKEN` 以外の秘密を渡さないこと、持ち出しに使えるツール・権限の除去を推奨
- **AI コーディングエージェントの権限設計**: 実トークンと実ツールを持つエージェントが未検証入力で動く構成は、プロンプトインジェクションが未解決である限り、起動者・入力の独立検証を欠くと特権実行に直結する。例示設定の安易な踏襲（`allowed_non_write_users: "*"`、公開サマリ欄への出力）が穴を広げる
- **業界横断の論点**: 同型の構成（AI issue トリアージ＋広い権限＋プロンプトインジェクション）は、Cline のワークフローでの npm 公開トークン窃取など、別系統で現実の被害を生んでいる。エージェント基盤一般で、「起動者の権限」と「入力の出所」を行動前に独立検証する設計要件が浮上している

未検証の起動・入力に基づくエージェントの特権実行を、行動前に独立検証する層の不在は、特定製品の問題ではなく、AI を CI/業務に組み込む組織横断の課題として残っている。

---

## 7. Lemma による分析

本事象で露呈した検出と証明の落差（エージェントの起動者の権限と入力の出所が、行動の前に独立検証されない）に対して、Lemma は、エージェントの行動を権限行為として証跡化し、実行の前に「誰が・どの権限で起動し、どの出所の入力に基づくか」を独立検証可能な暗号証明として検証する設計を提示している。

- **起動者の権限証明**: エージェントを起動するアクターの権限属性を、名前の接尾辞ではなく独立検証可能な証明として検証し、未検証の起動を行動前に弾く
- **入力の来歴バインド**: エージェントが読み込む入力（issue・設定・データ）を docHash でその出所に来歴バインドし、目視の文面と AI が解釈する内容の同一性・改ざんの有無を行為の時点で検証可能にする
- **行動ごとのスコープ認可**: OIDC トークン交換等の認可を、奪われた認証情報の再現では満たせない、行動ごとにスコープされ独立検証可能な証明に置き換える（proof-as-auth）
- **選択的開示**: 内部実装・秘密を出さずに、「この実行は起動者の権限と入力の出所を独立検証して認可された」ことだけを最小開示する

これにより、行為の時点で固定された証明が、「このエージェントの行動は、正当な権限を持つ起動者と、信頼できる出所の入力に基づくか」を、事後のログ照合に依存せず独立検証可能なトレイルとして機能させる。検出（事後の脆弱性発見・パッチ）は穴の是正に、事前証明（行為時点の権限・入力の独立検証）はエージェント実行の信頼確立に、それぞれ相補的に働く。設計と適用範囲は、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/agent-authority-proof/) および [Trust402](https://lemma.frame00.com/ja/trust402/) を参照のこと。

---

## 8. Sources

- **GMO Flatt Security（一次・研究者）**: RyotaK, "Poisoning Claude Code: One GitHub Issue to Break the Supply Chain" — <https://flatt.tech/research/posts/poisoning-claude-code-one-github-issue-to-break-the-supply-chain/>
- **The Hacker News**: "Claude Code GitHub Action Flaw Let One Malicious Issue Hijack Repositories"（2026-06-04）— <https://thehackernews.com/2026/06/claude-code-github-action-flaw-let-one.html>
- **Anthropic（一次・修正コミット）**: claude-code-action 修正コミット（v1.0.94 に集約）— <https://github.com/anthropics/claude-code-action/commit/1bbc9e7ff7d48e1299f7fa9698273d248e0cafea>

---

## 9. Brief 配布について

Lemma Critical Brief は Lemma が発行する脅威インテリジェンス・ブリーフです。本資料は公開情報の構造化分析であり、特定の組織への監査・診断・推奨ではありません。意思決定の参考として用いる場合は、貴組織の Lemma Critical 担当に直接ご相談ください。

[Discovery Call →](https://tally.so/r/EkBqDX)
[ホワイトペーパー →](https://tally.so/r/xX0VYv)
[✉️ ニュースレター →](https://tally.so/r/EkMj82?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
