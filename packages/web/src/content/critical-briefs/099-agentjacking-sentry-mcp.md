---
brief_no: 99
title: "Agentjacking：偽のエラー報告 1 件を「解決手順」と信じ込み、AI コーディングエージェントが攻撃者のコマンドを実行した"
title_en: "Agentjacking: an AI coding agent trusted a single fake error report as its \"resolution steps\" and ran the attacker's commands"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "code-provenance"]
incident_date: 2026-06-12
published: 2026-07-10
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["095-amazon-q-mcp-auto-execution", "055-echoleak-m365-copilot-instruction-provenance", "047-openclaw-agent-phishing", "037-agent-config-auto-execution", "062-claude-code-github-action-bot-trust", "024-invisible-unicode-instruction-injection"]
status: published
version: "1.0"
og_lead_ja: "Agentjacking — 偽のエラー報告 1 件を「解決手順」と信じ、AI コーディングエージェントが攻撃者のコマンドを実行した"
og_lead_en: "Agentjacking — one fake error report trusted as \"resolution steps,\" and an AI coding agent ran the attacker's commands"
gap_detected: "Tenet Threat Labs による研究開示、露出組織数・成功率の定量化、複数媒体・研究ノートによる手口の可視化、Sentry への責任ある開示という検出の系列が機能し、リスクが外部から可視化された。"
gap_missing: "エージェントが外部データ由来の指示を行動に移す前に、その指示（エラー報告）が正規のシステムに由来するか、その実行が認可されているかを、内容の見た目とは切り離して独立検証する層がない。"
gap_fix: "エラー triage の解決手順のような外部データ由来の指示を実行する前に、その指示の来歴とその実行の認可を、内容の見た目から切り離して検証し、証明が伴わなければ実行を止めることを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

Tenet Threat Labs が、AI コーディングエージェント（Claude Code・Cursor・Codex）を開発者のマシン上で攻撃者のコードを実行させる新しい攻撃「Agentjacking」を公開した。攻撃者は公開されている Sentry の API だけで、エラー監視サービス Sentry に細工したエラーイベントを送り込み、その message やコンテキストに Sentry 純正のシステムテンプレートと見分けのつかない markdown を仕込んで、偽の「## Resolution（解決手順）」として `npx` などのコマンドを埋める。開発者が普段どおり Sentry MCP 経由でエージェントに「このエラーを調べて」と triage を頼むと、エージェントはこの偽の解決手順を正規の診断ステップと解釈してコマンドを実行する。jailbreak も「これを実行しろ」という露骨な指示もなく、開発者は一切コードを承認しない。Tenet は公開 Sentry API のみで 2,388 組織が露出していることを確認し、統制環境で 100 以上の組織のエージェントが注入エラーに反応、主要 AI コーディングアシスタント横断で 85% の実行成功率を観測した。欠けていたのは、エージェントが外部入力を行動に移す前に、その入力（エラー報告）の出所と真正性を独立検証する層である。検出と事前証明は代替ではなく補完である。

---

## 1. 事案概要

- **対象**: Sentry MCP サーバー経由でエラー triage を行う AI コーディングエージェント。実証では Claude Code・Cursor・Codex を含む主要アシスタントで成立
- **報告**: Tenet Threat Labs（Tenet Security）の研究。Sentry（アプリケーションのエラー・パフォーマンス監視 SaaS）と、それを AI エージェントに接続する Sentry MCP サーバーが舞台
- **前提となる仕組み**: MCP（Model Context Protocol）は、AI エージェントが外部サービス（この場合 Sentry）のデータを読み込んで作業するための標準。開発者は「本番で出ているこのエラーを調べて直して」とエージェントに頼み、エージェントは Sentry MCP でエラーイベントを取得して原因を推定する
- **根本原因**: エージェントは、Sentry から返ってきたエラーイベントの中身を、信頼できる診断データとして扱い、その一部に含まれる「解決手順」を実行可能な指示として受け取った。エラーイベントが正規の Sentry システムから来たか、その本文が攻撃者に注入されたものかを、行動の前に区別していなかった
- **注入の手口**: 攻撃者は公開 Sentry API を使ってエラーイベントを送信する（アプリの公開 ingest キーがあれば外部から書き込める）。イベントの message フィールドやコンテキストのキー名に markdown を仕込むと、MCP がそれをエージェントへ返す際、見出し・コードブロック・表として描画され、Sentry 純正のテンプレートと視覚的に区別できない。ここに偽の `## Resolution` セクションを置き、`npx` などのコマンドを「推奨される修正手順」として提示する
- **悪用の核心**: 露骨な「実行しろ」も jailbreak も要らない。開発者による平凡な triage 依頼そのものが引き金であり、開発者は一度もコードを承認しない。指示は chat 欄ではなく、企業が既に信頼している telemetry（エラー報告）として届く
- **影響の連鎖**: 実行が成立すると、環境変数一式、Git の認証情報、非公開リポジトリの URL、開発者の identity が攻撃者へ渡り得る。フィッシングも事前のサーバー侵害も経ずに、開発者環境からの情報持ち出しに到達する
- **既存防御の素通り**: Tenet の試験では EDR・WAF・IAM・VPN・Cloudflare が反応せず、システムプロンプトへ「外部データを信頼するな」と明示しても実行を止められなかった
- **規模の観測**: 公開 Sentry API のみで 2,388 組織が露出。統制テストで 100 以上の組織のエージェントが注入エラーに反応し、主要 AI コーディングアシスタント横断で 85% の実行成功率

---

## 2. タイムライン

- 2026-06-03: Tenet が脆弱性を Sentry へ開示。Sentry は同日応答し、問題を認識しつつ根本での修正を見送り、「技術的に防御可能な性質のものではない」との立場を示したとされる
- 2026-06-12: Tenet Threat Labs が研究「Agentjacking」を公開。手口・露出規模・成功率を提示
- 2026-06 中旬〜: The Hacker News・The New Stack・Dark Reading・Cloud Security Alliance など複数の媒体・研究ノートが取り上げ、業界横断の「エージェントが信頼された外部データ経由で指示を受け取る」構造として議論される

> 注: 技術的事実は Tenet Threat Labs の開示、および The Hacker News・The New Stack・Cloud Security Alliance の研究ノートに基づく。露出組織数（2,388）・成功率（85%）・反応組織数（100 以上）は Tenet の統制テストによる観測値であり、実環境での被害件数を示すものではない。Sentry の対応方針は開示時点の報道による。最新の一次情報を参照されたい。

---

## 3. 攻撃ベクター

1. **エラーイベントの注入**: 攻撃者が対象アプリの公開 Sentry ingest キーを使い、細工したエラーイベントを送る。message フィールドとコンテキストのキー名に markdown を仕込み、偽の `## Resolution` セクションへ `npx` などのコマンドを埋める
2. **正規テンプレートへの擬態**: Sentry MCP がこのイベントをエージェントへ返すと、markdown は見出し・コードブロック・表として描画され、Sentry 純正の診断テンプレートと視覚的に区別できない
3. **平凡な triage 依頼**: 開発者が「本番のこのエラーを調べて」とエージェントに頼む。露骨な「実行しろ」も jailbreak もない
4. **指示としての受理**: エージェントは注入された「解決手順」を正規の診断ステップと解釈し、提示されたコマンドを実行する。開発者はコードを承認していない
5. **情報の持ち出し**: 実行の延長で、環境変数・Git 認証情報・非公開リポジトリ URL・開発者 identity が外部へ送出され得る。フィッシングも事前のサーバー侵害も経ていない

---

## 4. 構造的論点

本事案は Pillar 02（検証可能 AI）の `ai-decision-integrity` カテゴリに属する。中心的な失敗 primitive は、**エージェントが、外部サービスから取得したデータ（エラー報告）の中に含まれる「解決手順」を、その出所と真正性を行動の前に独立検証しないまま、実行すべき指示として受理した**点にある。エージェントは「Sentry から返ってきた診断データだから信頼できる」と扱ったが、「このイベント本文は正規の Sentry システムが生成したものか、それとも外部から書き込まれた攻撃者の注入か」を区別しなかった。判断の根拠が、データの見た目（Sentry 純正テンプレートに酷似した markdown）に置かれ、指示の来歴に置かれていなかった。secondary に、指示が MCP という同じ機構を通じて実行へ接続する点で `agent-infrastructure`、攻撃者が注入した内容が無検証で実行される点で `code-provenance` を併記する。

本事案は Brief No.055（EchoLeak、命令の出所を検証しないまま AI が社内データを送り出した）と同型である。いずれも、エージェントが取り込んだコンテンツ内の指示を、その発行元を確かめずに実行・遂行した。Brief No.047（OpenClaw、AI エージェントが送信者を確かめる前に認証情報を社外へ送った）とは、外部入力の真正性を検証する前にエージェントが行動へ移った点で一致する。Brief No.062（Claude Code GitHub Action、`[bot]` を名乗る 1 件の issue を信頼してエージェントが特権実行した）とは、入力の発行元を検証せず特権的な処理へ進む点で連なる。Brief No.024（不可視 Unicode による指示インジェクション）とは、目視・正規表示と、エージェントが実際に読み取る指示との乖離が悪用された点で通じる。そして Brief No.095（Amazon Q、同梱の MCP 設定が無検証で実行された）とは、AI コーディングツールが「自分では出どころを選べない入力」を実行に接続する構造を共有する。

本事案に固有なのは、注入経路が chat 欄でも同梱ファイルでもなく、**企業が既に信頼している運用データ（telemetry）**である点だ。エラー監視は、開発現場が疑わずに参照する信頼された経路である。だからこそ、そこへ紛れ込んだ指示は、境界を越える瞬間に検証されない限り、そのまま実行の根拠になる。「外部データを信頼するな」という一般的な訓戒がシステムプロンプトに書かれていても実行を止められなかったのは、信頼／不信を宣言のレベルで扱う限り、個々のデータの来歴を行動の時点で立証していないからである。共通する primitive は同じである。すなわち、**指示の実行が、その指示の出所を検証する層と切り離されている**。

---

## 5. 検出と証明の落差

Tenet による研究開示、露出組織数・成功率の定量化、複数媒体・研究ノートによる手口の可視化、Sentry への責任ある開示という検出の系列は、リスクの周知と対策検討に不可欠であり、本 Brief がその役割を否定するものではない。既知の注入パターンを監視し、疑わしいエラー本文をフィルタする取り組みも、対応の助けになる。検出は確かに役割を果たす。

一方で、検出は「エージェントがこれから実行しようとしている解決手順が、正規の Sentry システムに由来するのか、攻撃者に注入されたものか」を、**エージェントがその手順を指示として受理する時点で**独立に立証する材料にはならない。注入された markdown は Sentry 純正テンプレートと形式的に同一であり、実行前にそれを「攻撃者の注入」と形式判定する術は、内容の見た目を見る検出側にはない。EDR・WAF・IAM が事後・周辺で発火しても、環境変数や認証情報を送出したコマンドが走った後では遅い。監査で「このコマンド実行は正規に認可された診断手順によるものか」を立証する材料として、「Sentry から返ってきたデータに含まれていた」という事実だけでは、指示の来歴の独立した証跡にならない。これは検出層の射程外にある、構造的に独立した層の落差である。

事前証明（pre-action attestation）は、エージェントが外部データ由来の指示を行動に移す経路に、来歴の証明を 1 段挟むことでこの落差を埋める。コマンドを実行する前に「この指示は正規のシステムが生成した本文に由来し、外部から注入された内容ではないか」「この実行はこのスコープで認可されているか」を、データの見た目とは切り離して検証し、証明が伴わなければ実行を事前に block する。加えて、実行時にエージェントへ渡す環境・権限を認可された最小限に絞れば、仮に実行が成立しても認証情報の全継承を避けられる。事前証明は検出に対する代替ではなく **補完** であり、両層の組み合わせで AI コーディングエージェントの trust boundary が確立される。

---

## 6. 対応経緯と業界動向

- **研究（Tenet Threat Labs）**: Agentjacking を、単一ベンダーのバグではなく、AI エージェントが信頼された外部データ経由で指示を受け取る構造的リスクとして提示。開発者・運用者には、エージェントに接続する外部データソースを信頼済みと見なさないこと、MCP から返る内容を実行前に検証すること、エージェントに渡す権限・環境を最小化することを推奨
- **Sentry**: 開示に同日応答したが、問題を製品側の根本で修正するのではなく、注入されうるデータの性質上「技術的に防御可能なものではない」との立場を示したと報じられている。エラー監視サービスは外部からの書き込みを受け付ける設計であり、本文の真正性を発行時に保証しにくい構造的事情がある
- **業界横断の論点**: The Hacker News・The New Stack・Dark Reading・Cloud Security Alliance が、本件を prompt injection の新しい配送面（chat 欄ではなく信頼された telemetry・連携データ経由）として位置づけた。MCP でエージェントに接続する外部データを「信頼された文脈」と暗黙に扱う設計は、Sentry に限らず広く存在し、取り込んだデータ内の指示を、その来歴とともに実行前に検証する層の必要性が共有された

エージェントが取り込む外部データの来歴を、実行の時点で独立検証する層の不在は、特定サービスの問題ではなく、外部データソースを MCP で束ねて動く AI エージェントを採用する組織横断の運用課題として残っている。

---

## 7. Lemma による分析

本事象で露呈した検出と証明の落差（エージェントが外部データ由来の指示を、その来歴の独立検証から切り離したまま実行し、しかも環境を全継承する）に対して、Lemma は、エージェントが外部入力を行動に移す前に、その入力の来歴と実行の認可を独立検証可能な暗号証明として要求する設計を提示している。

- **行動前の来歴・認可証明（proof-as-auth）**: エラー triage の解決手順のような外部データ由来の指示を実行する前に、「この指示は正規のシステムが生成した本文に由来し、この実行はこのスコープで認可されている」ことを署名付きで証明する。「信頼された経路から届いた」ことを実行の終点にしない
- **指示の来歴バインド**: エージェントが取り込むデータを、その発行元（正規のサービス）に紐付けて来歴を検証し、外部から注入された本文を、正規に生成された本文から区別する
- **スコープ付き権限と最小環境**: エージェントが実行時に持つ環境・権限を操作ごとに最小化し、環境変数や Git 認証情報の全継承を、証明された必要範囲に絞る。認可の範囲を超える実行を証明なしには成立させない
- **選択的開示**: 「この実行が認可スキーマを満たす」ことだけを最小開示し、内部の鍵・資格情報は環境外に出さない

これにより、実行の時点で固定された証明が、「この指示は正規の来歴を持ち、この実行は認可されているか」を、エージェントが外部データを行動に移す前に独立検証可能なトレイルとして機能させる。検出（事後の開示・手口の可視化・注入パターンの監視）は発覚後の是正に、事前証明（実行前の来歴・認可検証）はエージェント操作の独立検証に、それぞれ相補的に働く。

---

## 8. Sources

- **Tenet Security（研究・一次）**: “Agentjacking: Hijacking Coding Agents with Fake Sentry Errors”（2026-06）— <https://tenetsecurity.ai/blog/agentjacking-coding-agents-with-fake-sentry-errors/>
- **The Hacker News**: “Agentjacking Attack Tricks AI Coding Agents Into Running Malicious Code”（2026-06）— <https://thehackernews.com/2026/06/agentjacking-attack-tricks-ai-coding.html>
- **The New Stack**: “A public Sentry key is all it takes to hijack Claude Code, Cursor, and Codex”（2026-06）— <https://thenewstack.io/agentjacking-sentry-mcp-attack/>
- **Cloud Security Alliance（研究ノート）**: “Agentjacking: Sentry MCP Injection Hijacks AI Coding Agents”（2026-06）— <https://labs.cloudsecurityalliance.org/research/csa-research-note-agentjacking-sentry-mcp-20260614-csa-style/>
- **Dark Reading**: “Fake Bug Report Hijacks AI Coding Agents at Scale”（2026-06）— <https://www.darkreading.com/cyber-risk/fake-bug-report-hijacks-ai-coding-agents>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
