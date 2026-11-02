---
brief_no: 99
title: "Sentry MCP：偽のエラー報告に仕込んだコマンドを、AI コーディングエージェントが実行しうることが示された(Tenet Threat Labs)"
title_en: "Sentry MCP: A fake error report could make an AI coding agent run planted commands (Tenet Threat Labs)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "code-provenance"]
incident_date: 2026-06-12
published: 2026-07-10
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["095-amazon-q-mcp-auto-execution", "055-echoleak-m365-copilot-instruction-provenance", "047-openclaw-agent-phishing", "037-agent-config-auto-execution", "062-claude-code-github-action-bot-trust", "024-invisible-unicode-instruction-injection"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "攻撃の実証 · AI コーディングエージェント"
og_kicker_en: "ATTACK RESEARCH · AI CODING AGENT"
og_headline_ja: "偽のエラー報告 1 件で、\nAI が攻撃者の\nコマンドを実行。\n<accent>開発者は何も承認しない</accent>"
og_headline_en: "One fake error report\nmade the AI run\nan attacker's commands.\n<accent>No code approved.</accent>"
key_figures:
  - value: "2,388"
    unit: "組織"
    label: "公開の Sentry API だけで、露出が確認された組織の数。実環境の被害件数ではなく、Tenet の観測値"
    tone: "alert"
  - value: "85"
    unit: "%"
    label: "統制環境で、主要な AI コーディングアシスタントを横断して観測された、実行の成功率（Tenet）"
  - value: "100 以上"
    unit: "組織"
    label: "統制環境で、注入されたエラーにエージェントが反応した組織の数（Tenet）"
glossary:
  - term: "Sentry"
    desc: "アプリケーションのエラーや性能を監視する SaaS。アプリが送ったエラーイベントを集めて見せる。"
  - term: "MCP"
    desc: "AI エージェントが、外部サービスのデータを読み込んで作業するための標準。Sentry MCP は、Sentry のエラーをエージェントに返す。"
  - term: "ingest キー"
    desc: "アプリが Sentry にエラーを送るための鍵。公開されていると、外部からもイベントを書き込める。"
insight:
  slug: "trusted-telemetry-as-instruction"
  label: "信頼した運用データの中の指示"
  quote: "AI エージェントが読む運用データの中の一文は、見た目が正規のものと同じなら、出どころを照合しない限り、実行する指示として扱われうる。"
operations: ["data-access"]
version: "1.0"
og_lead_ja: "Agentjacking — 偽のエラー報告 1 件を「解決手順」と信じ、AI コーディングエージェントが攻撃者のコマンドを実行した"
og_lead_en: "Agentjacking — one fake error report trusted as \"resolution steps,\" and an AI coding agent ran the attacker's commands"
industries: ["developers", "ai"]
controls:
  - slug: "ownership-check"
    item: "エラー報告に書かれた手順が、本当に Sentry のものかを確認する"
attack_method: "ai-misuse"
takeaway: "エラー報告の中の手順が、正規の Sentry から出たかを、実行の前に照合する手順が、働かなかった。"
search_title: "Agentjacking（Sentry MCP）：手口と対策"
search_description: "偽のエラー報告に仕込んだコマンドを、AI コーディングエージェントが実行しうることが示された（Tenet Threat Labs）。手口、なぜ止まらないか、対策。"
self_check: "AI コーディングエージェントが、エラー報告などの外部データにある手順を実行する前に、その手順が正規のシステムから出たかを照合できるか。"
countries: ["global"]
---

## 1. 要点

Tenet Threat Labs は、AI コーディングエージェントが、エラー監視サービス Sentry のデータを MCP で読むとき、攻撃者が外から送ったエラーイベントの中の偽の「解決手順」を、正規の診断ステップと解釈して実行しうることを、統制環境で実証した。jailbreak も、露骨な「実行しろ」も要らず、開発者は一度もコードを承認しない。<strong>AI エージェントが読む運用データの中の一文は、見た目が正規のものと同じなら、出どころを照合しない限り、実行する指示として扱われうる。</strong>

## 2. 通った操作

- **通った操作**: 開発者のマシン上での、エージェントによるコマンド（`npx` など）の実行。開発者が「本番のこのエラーを調べて」と Sentry MCP 経由で頼むと、エージェントは、細工されたエラーイベントの `## Resolution` に書かれたコマンドを、正規の診断ステップと解釈して実行した。攻撃者は、公開の Sentry API でイベントを送り、message やコンテキストのキー名に、Sentry 純正のテンプレートと見分けのつかない markdown を仕込んだ（Tenet）。
- **止まらなかった統制**: Tenet の試験では、EDR・WAF・IAM・VPN・Cloudflare が反応せず、システムプロンプトに「外部データを信頼するな」と明示しても、実行は止まらなかった。
- **受け付けた側に届くもの**: 一般に、エージェントが実行するコマンドは、開発者の依頼に基づく操作として届く。そのコマンドが、依頼の延長なのか、読んだエラー報告の中の文から出たのかは、実行する環境の側からは区別がつかない。
- **届く範囲**: 実行が成立すると、環境変数一式、Git の認証情報、非公開リポジトリの URL、開発者の identity が攻撃者へ渡りうる（Tenet）。
- **公表されていないこと**: 実環境での被害の有無と件数。2,388 組織・85%・100 以上の組織は、Tenet の統制テストの観測値である。

## 3. 何を照合するか

経路を問わず区別できる条件は、エージェントがコマンドを実行する手前で、その手順が、正規のシステムが生成した内容から出たのか、外から書き込まれた内容から出たのかを、内容の見た目とは別に照合することである。

- **誰が承認を出すか**: 開発者本人。実行するコマンドと、その手順の出どころを、エージェントが読むエラー報告とは別の画面で見て承認する。エラー報告の中の文は、承認に使わない。
- **どこで照合するか**: エージェントが、コマンドを実行する手前。出どころを照合できない手順は、照合が済むまで止める。
- **何が残るか**: どの手順を、誰の承認で、どの範囲の環境と権限で実行したかの記録。エージェントとは別に、後から第三者に示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝エージェントがコマンドを実行する前に、その手順が正規のシステムの内容から出たかを照合し、記録に残すこと。検知＝怪しい手順や、注入のパターンに気づくこと。下の日付は、開示と公表の日で、実証の日とは限らない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>実行する前に、その手順の出どころを、内容の見た目とは別に照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>統制環境で、エージェントが<br>注入された手順を実行した</span></div>
<div class="rx-zone det"><b>検知 · 開示と周知</b>研究の公開・報道・注入パターンの監視</div>
<div class="rx-g g1"><div class="t">06-03</div><b>Tenet が Sentry に開示</b></div>
<div class="rx-g g2"><div class="t">06-03</div><b>Sentry が同日に応答</b></div>
<div class="rx-g g3"><div class="t">06-12</div><b>Tenet が研究を公開</b></div>
<div class="rx-g g4"><div class="t">06 中旬〜</div><b>複数の媒体・研究ノートが取り上げる</b></div>
</div>
</figure>

出どころが正規に見える経路から届いた指示が、そのまま実行された点で、本件はメールの中の指示で社内データが送られた [M365 Copilot の EchoLeak](https://lemma.frame00.com/ja/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/) と同じ型である。同梱された設定が検証なしに実行された [Amazon Q](https://lemma.frame00.com/ja/critical/briefs/095-amazon-q-mcp-auto-execution/) とも、外から選べない入力が実行に結びつく点で通じる。

## 4. Lemma でできること

**Lemma は、03 の照合を、エージェントがコマンドを実行する操作の手前に組み込む。** 侵入を見つけるのではなく、その手順の出どころと、実行の認可を、実行の前に、内容の見た目とは別に照合する。

### 注意したい業界・業務

- **業界 · 開発・AI**: AI コーディングエージェントに、エラー監視や課題管理などの外部サービスを MCP でつないでいる組織。
- **業務 · 照会・参照**: エージェントに、本番のエラーやログを読ませて、原因を調べさせる業務。読んだデータの中の手順が、実行につながりうる。

### いまの対策と Lemma の違い

今回の経路は、1 列目（外から書き込まれたエラーイベントの取り込み）から 2 列目（エージェントによるコマンドの実行）へ続く連鎖である。

| 対策 | 外から書き込まれたエラーイベントの取り込み | エージェントによるコマンドの実行 |
| --- | --- | --- |
| システムプロンプトで「外部データを信頼するな」と伝える | 関係しない | 効かない |
| EDR・WAF・IAM・VPN | 関係しない | 効かない |
| 既知の注入パターンの監視・疑わしい本文のフィルタ | 一部 | 関係しない |
| エージェントに渡す環境・権限の最小化 | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効かない | 効く |

システムプロンプトの訓戒は、信頼と不信を宣言で扱うもので、個々のデータの出どころを、行動の時点で照合しない。EDR・WAF・IAM は、Tenet の試験で反応せず、反応しても、情報を送ったコマンドが走った後になる。注入パターンの監視は、見つけたものは止めるが、注入された markdown は Sentry 純正のテンプレートと形式が同じで、内容の見た目だけでは、実行の前に判定できない。環境・権限の最小化は、実行が成立しても、渡る範囲を狭める。Lemma は、取り込みそのものは止めず、コマンドの実行を、手順の出どころと認可の照合に結ぶ。実行の記録も残るので、「Sentry から返ってきたデータに含まれていた」という事実だけに頼らず、どの手順を、誰の承認で実行したかを確認できる。

注：Lemma の照合が働くのは、エージェントのコマンド実行に照合を組み込み、手順の出どころを示す情報と実行の認可が、エージェントが読むデータとは別に管理されている場合に限る。エラー監視は、外から書き込める設計のため、発行時に本文の真正性を保証しにくい。出どころを示す情報が付かない手順は止まるが、開発者が、出どころを照合しないままコマンドを承認すれば通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI コーディングエージェントに外部サービスをつないでいる組織で確認する 3 項目

- エージェントにつないだ外部のデータ（エラー監視・課題管理など）を、信頼済みとして扱っていないか。
- エージェントが実行したコマンドと、その手順の出どころの記録を、エージェントとは別に見られるか。
- エージェントに渡す環境変数・認証情報・権限を、操作ごとに必要な範囲に絞っているか。

## 5. 事実と時系列

- **研究**: Tenet Threat Labs（Tenet Security）の研究で、統制環境での実証である。実地の被害の件数ではない。
- **舞台**: Sentry（アプリケーションのエラー・パフォーマンス監視 SaaS）と、それを AI エージェントにつなぐ Sentry MCP サーバー。実証では、Claude Code・Cursor・Codex を含む主要なアシスタントで成立した。
- **注入の手口**: 攻撃者は、公開の Sentry API でエラーイベントを送る（アプリの公開 ingest キーがあれば、外部から書き込める）。message やコンテキストのキー名に markdown を仕込むと、MCP がエージェントへ返すとき、見出し・コードブロック・表として描画され、Sentry 純正のテンプレートと視覚的に区別できない。ここに偽の `## Resolution` を置き、`npx` などのコマンドを「推奨される修正手順」として示す。
- **研究者が示した流れ**: エラーイベントを注入する。Sentry 純正のテンプレートに擬態する。開発者が、いつもの調査を頼む。エージェントが、注入された手順を正規の診断ステップと解釈して実行する。環境変数・Git の認証情報・非公開リポジトリの URL・開発者の identity が、外へ送られうる。フィッシングも、事前のサーバー侵害も経ない。
- **規模の観測**: 公開 Sentry API のみで、2,388 組織が露出。統制テストで、100 以上の組織のエージェントが注入エラーに反応し、主要な AI コーディングアシスタントを横断して、85% の実行成功率だった。

### 時系列

- **2026-06-03**: Tenet が脆弱性を Sentry に開示する。Sentry は同日に応答し、問題を認識しつつ、根本の修正を見送り、「技術的に防御可能な性質のものではない」との立場を示したとされる。
- **2026-06-12**: Tenet Threat Labs が研究「Agentjacking」を公開する。手口・露出規模・成功率を示した。
- **2026-06 中旬〜**: The Hacker News・The New Stack・Dark Reading・Cloud Security Alliance など、複数の媒体・研究ノートが取り上げる。

> 技術的な事実は、Tenet Threat Labs の開示と、The Hacker News・The New Stack・Cloud Security Alliance の研究ノートに拠る。露出組織数（2,388）・成功率（85%）・反応組織数（100 以上）は、Tenet の統制テストによる観測値で、実環境での被害件数を示すものではない。Sentry の対応方針は、開示時点の報道に拠る。最新の一次情報を参照されたい。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **研究（Tenet Threat Labs）**: Agentjacking を、単一ベンダーのバグではなく、AI エージェントが信頼された外部データ経由で指示を受け取る構造的なリスクとして示した。開発者・運用者には、エージェントにつなぐ外部データソースを信頼済みと見なさないこと、MCP から返る内容を実行の前に確認すること、エージェントに渡す権限・環境を最小化することを勧めた。
- **Sentry**: 開示に同日応答したが、製品側の根本での修正ではなく、注入されうるデータの性質上「技術的に防御可能なものではない」との立場を示したと報じられている。エラー監視は、外部からの書き込みを受け付ける設計で、本文の真正性を発行時に保証しにくい事情がある。
- **業界横断**: The Hacker News・The New Stack・Dark Reading・Cloud Security Alliance が、本件を prompt injection の新しい配送面（chat 欄ではなく、信頼された telemetry・連携データ経由）として位置づけた。

## 6. Sources

- **Tenet Security（研究・一次）**: “Agentjacking: Hijacking Coding Agents with Fake Sentry Errors”（2026-06）— <https://tenetsecurity.ai/blog/agentjacking-coding-agents-with-fake-sentry-errors/>
- **The Hacker News**: “Agentjacking Attack Tricks AI Coding Agents Into Running Malicious Code”（2026-06）— <https://thehackernews.com/2026/06/agentjacking-attack-tricks-ai-coding.html>
- **The New Stack**: “A public Sentry key is all it takes to hijack Claude Code, Cursor, and Codex”（2026-06）— <https://thenewstack.io/agentjacking-sentry-mcp-attack/>
- **Cloud Security Alliance（研究ノート）**: “Agentjacking: Sentry MCP Injection Hijacks AI Coding Agents”（2026-06）— <https://labs.cloudsecurityalliance.org/research/csa-research-note-agentjacking-sentry-mcp-20260614-csa-style/>
- **Dark Reading**: “Fake Bug Report Hijacks AI Coding Agents at Scale”（2026-06）— <https://www.darkreading.com/cyber-risk/fake-bug-report-hijacks-ai-coding-agents>
