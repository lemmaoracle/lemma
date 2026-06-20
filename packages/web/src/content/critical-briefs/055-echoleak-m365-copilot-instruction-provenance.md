---
brief_no: 55
title: "命令の出所を検証しないまま、AI が社内データを送り出した — 取り込んだ命令の出所と権限が、行動の前に独立検証されない構造（EchoLeak / Microsoft 365 Copilot）"
title_en: "Internal Data Exfiltrated Without Verifying the Instruction's Origin — EchoLeak in Microsoft 365 Copilot (CVE-2025-32711)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "data-provenance"]
incident_date: 2025-06-11
published: 2026-06-15
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["047-openclaw-agent-phishing", "024-invisible-unicode-instruction-injection", "005-noroboto-lying-fonts", "027-librechat-mcp-url-secrets"]
status: published
version: "1.0"
og_lead_ja: "命令の出所を検証せず AI が社内データを送出 — EchoLeak / M365 Copilot"
og_lead_en: "AI exfiltrated data without verifying the instruction's origin — EchoLeak"
gap_detected: "外部研究による発見と報告、XPIA 分類器などの抑止層が働き、脆弱性は悪用の前に可視化・修正された。"
gap_missing: "「AI が取り込んだこの命令は、正当な権限の下で与えられたものか」を行動の前に独立検証する層が無く、データに埋め込まれた指示が正規の命令として実行された。"
gap_fix: "高リスク行動の前に「この行動は、正当に与えられた命令と権限の範囲内である」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

Aim Labs が 2025 年 6 月に公表した EchoLeak（CVE-2025-32711）は、細工メール 1 通で利用者操作なし（ゼロクリック）に、Microsoft 365 Copilot のアクセス範囲の社内機微データを社外へ送出させた。メールに紛れた命令を、Copilot が処理対象データと区別できなかったためである。XPIA 分類器など事後の検出をいくら強化しても、AI が動く瞬間に、取り込んだ命令の出所と権限が正当かを独立検証する層の不在には届かない。事後の検出と、行動前に出所・認可を独立検証する事前証明は代替でなく補完である。

---

## 1. 事案概要

- **対象**: Microsoft 365 Copilot（Outlook・SharePoint・OneDrive・Teams 等を横断する RAG ベースのエンタープライズ AI アシスタント）
- **識別子**: CVE-2025-32711。CVSS 9.3（Critical）
- **発見・報告**: Aim Labs（Aim Security）が発見し、Microsoft Security Response Center（MSRC）へ非公開報告
- **攻撃の性質**: **ゼロクリック**。攻撃者が送った 1 通のメールを Copilot が通常の要約・参照処理で取り込むだけで成立し、被害者側の操作・クリックは不要
- **流出範囲**: Copilot のアクセススコープ全般（OneDrive ファイル、SharePoint コンテンツ、Teams メッセージ、チャット履歴、事前ロードされた組織データ）
- **核心**: 細工メール内に埋め込まれた命令を、Copilot が「処理対象のデータ」と「実行すべき指示」とに区別できず実行した。つまり**取り込んだ命令の出所と権限が、行動の前に独立検証されない**
- **実環境での悪用**: Microsoft は「顧客側の対応は不要」「実環境で悪用された証拠はない」と表明。本件は責任ある開示（PoC）段階で報告・修正された

> 注: 本 Brief は個別の悪用事例の有無を断定するものではなく、AI アシスタントが命令の出所を検証せずに行動する構造を分析対象とする。

---

## 2. タイムライン

- 2025-01: Aim Labs が実動する PoC を作成し、MSRC へ非公開で報告
- 2025 年春先: 初期の緩和措置
- 2025-05: Microsoft がサーバ側修正を展開
- 2025-06-11: アドバイザリと攻撃連鎖の研究が公開（CVE-2025-32711）。同月の Patch Tuesday に掲載
- 2026 以降: SharePoint／Copilot 連携などで類似系統が報告され、AI アシスタントの信頼境界問題が単発でないことが示される

---

## 3. 攻撃が「未検証の実行」へ伝播する経路

本件は、AI アシスタントが取り込んだ命令の出所・権限を行動前に独立検証しない構造に起因する。失敗の伝播は以下の通り。

1. **untrusted データの取り込み**: Copilot は受信メールや SharePoint コンテンツを、信頼境界を分離せずに同じコンテキストへ結合して処理する。攻撃者のメール本文は「処理対象データ」として LLM のコンテキストへ入る
2. **命令とデータの混同（LLM Scope Violation）**: LLM は「信頼できる命令」と「untrusted データ」を同一のトークン列として受け取るため、データに埋め込まれた指示を正当な命令と区別できない。攻撃者の指示が実行対象になる
3. **防御層の多重バイパス**: Cross-Prompt Injection（XPIA）分類器、外部リンクの墨消し、Content-Security-Policy、Copilot の参照記法といった検知・抑止層を、参照スタイルの Markdown・自動取得される画像・Microsoft Teams プロキシの悪用などで回避
4. **データの越境（exfiltration）**: Copilot が自身のアクセス範囲の社内データを読み出し、信頼されたドメイン経由で攻撃者管理下へ送出。被害者の操作は不要
5. **可視性の欠如**: ゼロクリックかつ正規経路を使うため、通常の利用ログ上は異常として現れにくい。発見は外部研究と事後分析に依存する

---

## 4. 構造的論点

本件は Pillar 02（検証可能 AI）の `ai-decision-integrity` カテゴリに属する。中心的な failure primitive は、**AI エージェントが取り込んだ命令の出所と権限を、行動（社内データの読み出しと送出）の前に独立検証していない**ことである。「このメール本文に含まれる指示は、正当に与えられた命令か、それとも単なる untrusted データか」という区別が、システムの自己判断の内側に閉じており、行動前に独立検証されない。secondary に `agent-infrastructure`（エージェントが横断するデータ面の信頼境界）と `data-provenance`（取り込む入力の出所）を併記する。

ターゲットは Brief 024（不可視 Unicode による命令注入＝人間が読む入力とモデルが読む入力の乖離）や Brief 005（嘘フォントによる入力整合性の偽造）と異なるが、共有する primitive は同じだ。すなわち、**判断や行動が、それを検証する層から切り離されたまま、実行・データ越境へ直結する**。さらに Brief 047（メール読解エージェントが送信元を検証する前に資格情報を転送した）と同型で、「**エージェントが検証の前に動く**」点が核心である。EchoLeak が示すのは、この primitive が研究上の懸念ではなく、本番のエンタープライズ AI で、ゼロクリックの実データ流出として成立したという事実である。

---

## 5. 検出と証明の落差

ここでは検出チェーン — Aim Labs による研究、MSRC への報告、Microsoft のサーバ側修正、XPIA 分類器という既存の抑止層 — が一定の役割を果たした。脆弱性は外部研究によって可視化され、悪用前に修正された。これは検出の成功例であり、本 Brief は検出層の役割を否定しない。検出は、疑いを立て、修正を促し、被害範囲を絞り込むために不可欠である。

しかし本件で問題なのは、XPIA 分類器という検出層が**多重にバイパスされた**こと、そして検出層がどれほど強化されても「**AI が行動する瞬間に、取り込んだ命令の出所と権限が正当か**」を独立に証明する材料にはならないことである。分類器は確率的判定であり、「この命令は正当に与えられた」という証明ではない。攻撃が正規ドメインとゼロクリック経路を使う以上、事後の検出・分析は、データがすでに越境した後に作動する後追いの系列になる。これは検出の射程の外にある、構造的に独立した層の落差である。

現状、エンタープライズ AI の運用モデル全体で、エージェントが取り込む命令の出所・権限の独立検証は、モデルの自己判断と分類器への信頼に依存しており、独立した層として扱われていない。事前証明（pre-execution attestation）は、エージェントの行動経路に「この命令はこの権限の下で正当に与えられた」という属性証明を 1 ステップ挿入することで落差を塞ぐ。検出の代替ではなく **補完** であり、両者が揃って初めて、AI の行動に対する信頼境界が確立される。

---

## 6. 対応経緯と業界動向

- **ベンダー対応**: Microsoft は CVE-2025-32711 を割り当て、サーバ側で修正。顧客側の対応は不要とし、実環境での悪用証拠はないと表明
- **業界の認識転換**: EchoLeak は「**本番 LLM システムにおける初の実世界ゼロクリック・プロンプトインジェクション**」として、エンタープライズ AI のリスク認識を更新した。LLM が信頼できる命令と untrusted データを同一トークン列として扱うという**アーキテクチャ上の弱点**が論点化
- **連続性**: 2026 年以降も SharePoint／Copilot 連携などで類似系統が報告され、単発のバグではなく、AI アシスタントの信頼境界に内在する課題として継続的に表面化している
- **重心の移動**: プロンプトインジェクション対策の重心が、分類器による検出から、エージェントの実行境界そのものの設計（命令の出所・権限の検証）へ移りつつある

命令の出所と権限を行動の瞬間に独立検証する層の不在は、一社の問題ではなく、エンタープライズ AI を導入する組織と AI プラットフォーム提供者の双方にまたがる運用課題として残る。

---

## 7. Lemma による分析

EchoLeak が露呈した落差 — AI エージェントが取り込んだ命令の出所と権限を、行動の前に独立検証しないまま、社内データの読み出しと越境へ直結させてしまう — に対し、Lemma はエージェントの行動の根拠を、その瞬間に独立検証可能な暗号学的証明として固定する設計を提示している。

- **行動時アテステーション**: エージェントがデータアクセスや送出を行う前に、「この行動が、正当に与えられた命令・権限の範囲内である」ことを署名付きで証明する。命令の正当性が、事後ラベリングではなく行動時点の証明として固定される
- **命令／データの出所束縛**: 取り込む入力（メール・ドキュメント等）を docHash で原本に束縛し、「処理対象データ」と「実行すべき命令」の区別と出所を検証可能にする。untrusted データに埋め込まれた指示が、検証を経ずに命令へ昇格しない
- **権限スコープの証明**: エージェントのアクセス権限（誰の・どのスコープのデータへ・どこまで）を、行動前に独立検証可能な属性として束縛する
- **選択的開示**: 「行動が権限範囲内であった」ことだけを最小限で証明し、社内データそのものは外部に出さない

行動時点で固定された証明は、後日「この送出はそもそも正当な命令に基づいていたか」を問われたときに、ソースデータを開示せずに独立検証できる証跡として機能する。検出（事後の研究・分類器）は被害範囲の縮小に、事前証明（行動時の検証）は AI の行動の根拠の独立検証に、それぞれ補完的に寄与する。

---

## 8. Sources

- **Aim Labs（Aim Security）**: "Breaking down 'EchoLeak', the first zero-click AI vulnerability enabling data exfiltration from Microsoft 365 Copilot"（発見・攻撃連鎖・LLM Scope Violation の解説、2025-06-11） — <https://www.aim.security/lp/aim-labs-echoleak-m365>
- **Microsoft MSRC**: "CVE-2025-32711 — M365 Copilot Information Disclosure Vulnerability"（公式アドバイザリ・CVSS 9.3・サーバ側修正） — <https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-32711>
- **arXiv 2509.10540**: "EchoLeak: The First Real-World Zero-Click Prompt Injection Exploit in a Production LLM System" — <https://arxiv.org/abs/2509.10540>
- **The Hacker News**: "Zero-Click AI Vulnerability Exposes Microsoft 365 Copilot Data Without User Interaction"（2025-06、手口・流出スコープ） — <https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
