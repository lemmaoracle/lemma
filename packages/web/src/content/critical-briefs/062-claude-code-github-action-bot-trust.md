---
brief_no: 62
title: "Claude Code GitHub Action：名前が `[bot]` で終わる起動者を信頼し、issue からエージェントが特権で動きうると示された(GMO Flatt Security の研究)"
title_en: "Claude Code GitHub Action: trusting actors whose names end in `[bot]` let an issue drive the agent's privileged run (GMO Flatt Security research)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "ai-decision-integrity"]
incident_date: 2026-06-04
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["037-agent-config-auto-execution", "029-github-dev-oauth-token", "048-trapdoor-ai-instruction-provenance", "003-starlette-badhost"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Claude Code GitHub Action で、`[bot]` を名乗る issue からエージェントが特権で動きうると研究者が報告"
og_lead_en: "A researcher reports an issue posing as a `[bot]` could drive the Claude Code GitHub Action's privileged run"
search_title: "claude-code-action：bot 偽装の経緯と対策"
search_description: "Claude Code GitHub Action が名前の [bot] を信頼し、issue からエージェントが特権で動きうると研究者が報告した（GMO Flatt Security）。何が起きたか、なぜ起動者を照合するか、対策を整理。"
og_kicker_ja: "脆弱性の開示 · AI エージェントの起動"
og_kicker_en: "VULNERABILITY DISCLOSURE · AI AGENT TRIGGER"
og_headline_ja: "bot を名乗る issue で、\nエージェントが特権で\n動きうると研究者が報告。\n<accent>CVSS 7.8・4 日で修正</accent>"
og_headline_en: "An issue posing as a bot\ncould steer the agent,\na researcher reports.\n<accent>CVSS 7.8, fixed in 4 days</accent>"
key_figures:
  - value: "7.8"
    label: "CVSS 4.0 での深刻度。修正は claude-code-action v1.0.94 に集約された"
    tone: "alert"
  - value: "4"
    unit: "日"
    label: "研究者が中核の回避を報告してから、Anthropic が修正するまで（2026-01）"
  - value: "約 50"
    unit: "件"
    label: "権限の仕組みを回避する手法として、RyotaK が報告したとする数"
glossary:
  - term: "GitHub App とインストールトークン"
    desc: "GitHub App は、リポジトリに導入して動く連携の仕組み。導入先ごとに発行されるインストールトークンで、issue や PR を作れる。名前の末尾は `[bot]` になる。"
  - term: "OIDC トークン"
    desc: "「自分はこのリポジトリで動くこのワークフローだ」を示す署名付きのトークン。Claude Code は、これを Anthropic のバックエンドと交換して、書き込み権限を持つ Claude GitHub App のインストールトークンを得る。"
  - term: "間接的なプロンプトインジェクション"
    desc: "AI が読み込む文書やデータ（ここでは issue の本文）に命令を仕込み、AI に指示として実行させる手法。"
insight:
  slug: "name-suffix-as-authority"
  label: "名前の末尾を起動の権限とみなす前提"
  quote: "エージェントを特権で動かす前に、起動した相手の権限と読み込む入力の出どころを、名前や文面の見た目ではなく別に管理された記録と照合しなければ、誰でも作れる起動と指示が、そのまま特権の操作になる。"
industries: ["ai", "developers"]
controls:
  - slug: "ownership-check"
    item: "起動した相手が、本当に権限を持つ bot か確認する"
attack_method: "ai-misuse"
takeaway: "名前が [bot] で終わる起動者を信頼すると、誰でも作れる GitHub App からの issue で、エージェントが特権で動きうると、研究者が示した。"
self_check: "AI エージェントを特権で動かす前に、起動した相手が正当な権限を持つかを、名前ではなく権限の記録と照合しているか。"
countries: ["global"]
---

## 1. 要点

GMO Flatt Security の研究者 RyotaK によれば、Claude Code GitHub Action の起動の判定は、名前が `[bot]` で終わるアクターを無条件に信頼していた。GitHub App は誰でも登録でき、そのトークンで任意の公開リポジトリに issue を作れるので、攻撃者の issue が「bot の起動」として通り、本文に仕込んだ指示を、書き込み権限を持つエージェントが実行しうる。研究者が実証したのは自身のテストリポジトリで、修正は公開の前に提供されている。<strong>エージェントを特権で動かす前に、起動した相手の権限と読み込む入力の出どころを、名前や文面の見た目ではなく別に管理された記録と照合しなければ、誰でも作れる起動と指示が、そのまま特権の操作になる。</strong>

## 2. 通った操作

- **通った操作**: 攻撃者が自作の GitHub App で作った issue による、エージェントの起動。起動の判定（`checkWritePermissions`）は名前の末尾 `[bot]` を権限の根拠とみなし、agent モードには tag モードにある人の確認も無かった（RyotaK）。続いて、エラーメッセージに見せかけた issue の本文の命令を、Claude が「復旧」として実行しうる（RyotaK）。
- **受け付けた側に届くもの**: 一般に、CI で動くエージェントは、ワークフローに渡された秘密情報と、リポジトリへの書き込み権限を持つ。研究者の報告では、環境変数の秘密情報を issue に書き戻させ、OIDC トークンの交換に使う認証情報を奪って交換を再現すると、対象のコード・issue・ワークフローへの書き込み権限に届く。claude-code-action のリポジトリ自体を狙えば、下流が取り込む Action を汚染しうる、とされる。
- **補助の経路**: Anthropic の例示のワークフローが、誰でも起動できる `allowed_non_write_users: "*"`（ドキュメント上もリスクと明記）を含み、Claude がタスクの要約を公開される実行サマリの欄に出していたため、それを写したリポジトリが同じ穴を引き継いだ。起動の権限の無い攻撃者も、信頼されたユーザーの issue が起動した後、Claude が読む前に編集を差し込めば、内容を「信頼された入力」として紛れ込ませられた（RyotaK）。
- **公表されていないこと**: この経路が、実環境の標的に使われた事例。研究者の記事は、自身のテストリポジトリでの実証にとどまるとしている。

## 3. 何を照合するか

経路を問わず区別できる条件は、エージェントが特権で動く前に、起動した相手がその操作の権限を持つかと、読み込む入力がどこから来て、起動のときから変わっていないかを、名前や文面の見た目とは別に照合することである。

- **誰が承認を出すか**: リポジトリの管理者。どの人と、どの導入済みの App に、エージェントの起動を許すかを決める。アクターの名前の末尾や、issue の本文の書きぶりは、承認に使わない。
- **どこで照合するか**: エージェントが、秘密情報と書き込み権限を持って実行に移る直前。起動した相手が、許された一覧の中にあるかを、名前ではなく権限の記録と照合する。読み込む入力は、起動のときの版と同じかを照合し、照合できない起動と入力は、照合が済むまで実行に移さない。
- **何が残るか**: 誰が、どの権限でエージェントを起動し、どの版の入力で何を実行したか（または止めたか）の記録。エージェントとは別に、後から示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝エージェントを特権で動かす前に、起動した相手の権限と入力の出どころを照合し、記録に残すこと。検知＝研究者が回避の経路を見つけて報告すること。日付は、報告・修正・公開の日で、経路が使われた日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>エージェントを特権で動かす前に、起動した相手の権限と入力の出どころを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>[bot] を名乗る起動と issue の指示で<br>エージェントが特権で動きうると示された</span></div>
<div class="rx-zone det"><b>検知 · 研究者が見つけた</b>RyotaK が報告し、Anthropic が修正した</div>
<div class="rx-g g1"><div class="t">2026-01</div><b>RyotaK が Anthropic へ報告</b></div>
<div class="rx-g g2"><div class="t">2026-01</div><b>報告から 4 日で中核を修正</b></div>
<div class="rx-g g3"><div class="t">2026 春</div><b>追加の堅牢化（v1.0.94 に集約）</b></div>
<div class="rx-g g4"><div class="t">06-04</div><b>研究記事と報道で公開</b></div>
</div>
</figure>

脆弱性の発見と、修正の後の公開は働き、Anthropic は報告から 4 日で修正した。CI のログは、何が実行されたかを後からたどれる。効かなかったのは、その手前で、起動した相手の権限と入力の出どころを照合する層である。リポジトリ同梱の設定をエージェントが自動で実行した [Brief 037](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)、人に見えない命令を AI が読んだ [Brief 048](https://lemma.frame00.com/ja/critical/briefs/048-trapdoor-ai-instruction-provenance/)、奪われたトークンが操作の範囲に絞られていなかった [Brief 029](https://lemma.frame00.com/ja/critical/briefs/029-github-dev-oauth-token/) と同じ形で、エージェントの特権の操作が、起動と入力の照合に結び付いていない。

## 4. Lemma でできること

**Lemma は、03 の照合を、エージェントが秘密情報と書き込み権限を持って実行に移る直前に組み込む。** 悪意ある issue やプロンプトインジェクションを見つけるのではなく、起動した相手の権限と、読み込む入力の版を、実行の前に、名前や文面の見た目とは別に照合する。

### 注意したい業界・業務

- **業界 · 開発者・エージェント運用**: CI/CD に AI エージェントを組み込み、issue の仕分け・ラベル付け・PR のレビューを任せている開発・運用のチーム。
- **業界 · AI**: 実際のトークンとツールを持つエージェントを、外部から届く入力で動かす基盤を運用する組織。
- **業務 · issue・PR を起点にしたエージェントの実行**: 公開リポジトリで、外部の人や App が作った issue や PR でエージェントが起動する業務。起動の判定と読み込む入力が、そのまま書き込み権限での操作につながる。

### いまの対策と Lemma の違い

今回の中核の経路は、1 列目の、権限の無い相手による起動である。2 列目は、研究者が補助の経路として報告した起動の後の編集、3 列目は、正当な起動者が渡した入力そのものに指示が含まれる場合を比べる。

| 対策 | 権限の無い相手による起動（`[bot]` の名乗り） | 正当な起動の後に差し込まれた入力（起動の後の issue の編集） | 正当な起動者が渡した入力に含まれた指示 |
| --- | --- | --- | --- |
| 名前の末尾 `[bot]` による起動の判定（修正の前） | 効かない | 関係しない | 関係しない |
| 誰や何が起動できるかのワークフローの監査（Anthropic の推奨） | 一部 | 関係しない | 関係しない |
| 未検証の入力を扱うとき、秘密情報と持ち出しに使えるツール・権限を絞る（Anthropic の推奨） | 一部 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く | 効かない |

名前の末尾による判定は、誰でも登録できる GitHub App の名前で満たせた（RyotaK）。ワークフローの監査は、誰でも起動できる設定を見つけて外すが、判定の処理そのものに穴があれば残る。秘密情報やツールを絞ることは、どの列でも届く範囲を狭めるが、起動と指示の実行は止めない。Lemma は、起動した相手を、管理者が許した一覧と権限の記録に照合し、読み込む入力を起動のときの版に照合するので、名前だけの起動や、起動の後に差し替わった入力は、実行の前に止まる。一方、正当な起動者が渡した入力そのものに指示が含まれていれば、照合は一致し、そのまま通る。この列は、秘密情報とツールを絞る対策と組み合わせて埋める。

注：Lemma の照合が働くのは、エージェントの起動の処理に照合を組み込み、起動を許す一覧と権限の記録、入力の版の記録が、エージェントが読む入力とは別に管理されている場合に限る。管理者が許した App や人の鍵が奪われた場合や、許された範囲の中で悪意ある指示が実行される場合は、通りうる。claude-code-action の実装は変えず、入力の内容の善悪も判定しない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

CI/CD で AI エージェントを issue や PR から起動している組織で確認する 3 項目

- 使っている claude-code-action が、修正の集約された版（v1.0.94）以降になっているか。
- 例示のワークフローから、誰でも起動できる設定（`allowed_non_write_users: "*"` など）や、公開される欄への出力を写したままにしていないか。
- 未検証の入力を扱うワークフローで、エージェントに渡す秘密情報を、必要な分（Anthropic API キーと `GITHUB_TOKEN`）だけにしているか。

## 5. 事実と時系列

- **対象**: Anthropic の Claude Code GitHub Action（claude-code-action）。CI/CD に Claude を組み込み、issue の仕分け、ラベル付け、PR のレビュー、スラッシュコマンドの実行を担わせる。既定で、リポジトリのコード・issue・PR・ディスカッション・ワークフローファイルに読み書きの権限を持つ。
- **深刻度と修正**: CVSS 4.0 で 7.8。修正は claude-code-action v1.0.94 に集約された。Anthropic はバグバウンティを支払った。
- **報告者**: GMO Flatt Security の研究者 RyotaK。中核の回避を 2026 年 1 月に Anthropic へ報告した。
- **研究者の報告（起動）**: 起動の判定（`checkWritePermissions`）が、名前が `[bot]` で終わるアクターを無条件に信頼していた（GitHub App は管理者が導入する信頼できるもの、という前提）。誰でも GitHub App を登録して自分のリポジトリに導入し、そのインストールトークンで任意の公開リポジトリに issue や PR を作れる。tag モードには人の確認の追加の判定があったが、agent モードには無かった。
- **研究者の報告（入力と到達）**: エラーメッセージに見せかけた issue の本文に命令を仕込み、Claude が「復旧」として実行するよう誘導する。環境変数の秘密情報を issue に書き戻させ、OIDC トークンの交換に使う認証情報を奪って交換を再現すると、書き込み権限を持つインストールトークンが得られる。
- **補助の経路（研究者の報告）**: 例示のワークフローの `allowed_non_write_users: "*"` と、公開される実行サマリの欄への出力を写したリポジトリが、同じ穴を引き継いだ。起動の後、Claude が読む前の issue の編集で、内容を信頼された入力として紛れ込ませられた。

### 時系列

- **2026-01**: RyotaK が中核の回避を Anthropic へ報告。Anthropic が 4 日で修正。
- **2026 春**: 追加の堅牢化が続き、修正は claude-code-action v1.0.94 に集約。
- **2026-06-04**: 詳細が公開される（GMO Flatt Security の研究記事、The Hacker News ほか）。

> 本件は、修正の提供の後に公開する、調整された開示として扱われた。手法の事実は GMO Flatt Security の研究記事と The Hacker News の報道に、修正は Anthropic の修正コミットに拠る。Anthropic の Action を汚染する「この経路そのもの」が実環境の標的に使われた公開の痕跡は無く、RyotaK は自身のテストリポジトリでのみ実証したとしている。同じ型の構成（AI による issue の仕分け・広い権限・プロンプトインジェクション）では、2026-02 に Cline の claude-code-action のワークフローで npm の公開トークンが盗まれ、不正な版が公開された事例が、別の経路として報じられている。RyotaK は、権限の仕組みを回避する手法を約 50 件報告したとしている。本 Brief は、再現の手順を載せない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Anthropic**: 報告から 4 日で中核を修正し、春にかけて堅牢化した。修正は claude-code-action v1.0.94 に集約。利用者には、書き込み権限の無いユーザーや bot が Claude を起動できるワークフローの監査、未検証の入力を扱う場合に Anthropic API キーと `GITHUB_TOKEN` 以外の秘密情報を渡さないこと、持ち出しに使えるツールと権限を外すことを勧めている。
- **例示の設定**: `allowed_non_write_users: "*"` や公開される欄への出力のように、例示の設定をそのまま写すことが、穴を広げうると指摘された。

## 6. Sources

- **GMO Flatt Security（一次・研究者）**: RyotaK, "Poisoning Claude Code: One GitHub Issue to Break the Supply Chain" — <https://flatt.tech/research/posts/poisoning-claude-code-one-github-issue-to-break-the-supply-chain/>
- **The Hacker News**: "Claude Code GitHub Action Flaw Let One Malicious Issue Hijack Repositories"（2026-06-04）— <https://thehackernews.com/2026/06/claude-code-github-action-flaw-let-one.html>
- **Anthropic（一次・修正コミット）**: claude-code-action 修正コミット（v1.0.94 に集約）— <https://github.com/anthropics/claude-code-action/commit/1bbc9e7ff7d48e1299f7fa9698273d248e0cafea>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
